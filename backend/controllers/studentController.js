const client = require('../config/db');

// Helper to get local time in YYYY-MM-DD HH:MM:SS format
const getLocalTimestamp = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace('T', ' ');
};

const getAvailableExams = async (req, res) => {
    try {
        const result = await client.execute({
            sql: `
                SELECT * FROM exams 
                WHERE is_published = 1 
                ORDER BY created_at DESC
            `,
            args: []
        });
        res.json(result.rows);
    } catch (error) {
        console.error('Available Exams Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const startAttempt = async (req, res) => {
    const { examId } = req.body;
    const userId = req.user.id;

    try {
        const examDetail = await client.execute({
            sql: 'SELECT id, title, duration, start_time, end_time FROM exams WHERE id = ?',
            args: [examId]
        });

        if (examDetail.rows.length === 0) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const exam = examDetail.rows[0];
        const nowLocal = getLocalTimestamp();
        const nowISO = nowLocal.slice(0, 16).replace(' ', 'T');

        // Schedule enforcement
        if (exam.start_time && exam.start_time > nowISO) {
            return res.status(403).json({ message: `This exam is scheduled to start at ${exam.start_time.replace('T', ' ')}.` });
        }
        if (exam.end_time && exam.end_time < nowISO) {
            return res.status(403).json({ message: 'This exam session has already ended.' });
        }

        const existing = await client.execute({
            sql: 'SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = ?',
            args: [userId, examId, 'STARTED']
        });

        if (existing.rows.length > 0) {
            const attemptData = existing.rows[0];
            const startTime = new Date(attemptData.start_time).getTime();
            const currentTime = new Date().getTime();
            const durationMs = exam.duration * 60 * 1000;

            if (currentTime > (startTime + durationMs)) {
                await submitAttempt({ body: { attemptId: attemptData.id, autoSubmitted: true }, user: req.user }, { json: () => {}, status: (code) => ({ json: () => {} }) });
            } else {
                const questions = await client.execute({
                    sql: 'SELECT id, type, question_text, options, marks FROM questions WHERE exam_id = ?',
                    args: [examId]
                });
                return res.json({ 
                    attempt: { ...attemptData, title: exam.title, duration: exam.duration }, 
                    questions: questions.rows.map(q => ({
                        ...q,
                        options: q.options ? JSON.parse(q.options) : null
                    }))
                });
            }
        }

        const questionsCount = await client.execute({
            sql: 'SELECT COUNT(*) as count FROM questions WHERE exam_id = ?',
            args: [examId]
        });

        if (questionsCount.rows[0].count === 0) {
            return res.status(400).json({ message: 'This exam has no questions yet and cannot be attempted.' });
        }

        const submitted = await client.execute({
            sql: 'SELECT * FROM attempts WHERE user_id = ? AND exam_id = ? AND status = ?',
            args: [userId, examId, 'COMPLETED']
        });

        if (submitted.rows.length > 0) {
            return res.status(403).json({ message: 'You have already completed this exam.' });
        }

        // Use local IST timestamp instead of CURRENT_TIMESTAMP
        const result = await client.execute({
            sql: 'INSERT INTO attempts (user_id, exam_id, start_time, status) VALUES (?, ?, ?, ?)',
            args: [userId, examId, nowLocal, 'STARTED']
        });

        const attemptId = Number(result.lastInsertRowid);
        const attempt = await client.execute({ 
            sql: `
                SELECT a.*, e.title, e.duration 
                FROM attempts a 
                JOIN exams e ON a.exam_id = e.id 
                WHERE a.id = ?
            `, 
            args: [attemptId] 
        });

        const questions = await client.execute({
            sql: 'SELECT id, type, question_text, options, marks FROM questions WHERE exam_id = ?',
            args: [examId]
        });

        res.status(201).json({ 
            attempt: attempt.rows[0], 
            questions: questions.rows.map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : null
            }))
        });
    } catch (error) {
        console.error('Start Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const saveAnswer = async (req, res) => {
    const { attemptId, questionId, answer } = req.body;

    try {
        const attemptResult = await client.execute({
            sql: `
                SELECT a.*, e.duration 
                FROM attempts a 
                JOIN exams e ON a.exam_id = e.id 
                WHERE a.id = ? AND a.status = ?
            `,
            args: [attemptId, 'STARTED']
        });

        if (attemptResult.rows.length === 0) {
            return res.status(403).json({ message: 'Attempt is no longer active.' });
        }

        const attempt = attemptResult.rows[0];
        const startTime = new Date(attempt.start_time).getTime();
        const now = new Date().getTime();
        const durationMs = attempt.duration * 60 * 1000;
        const gracePeriod = 60 * 1000; 

        if (now > (startTime + durationMs + gracePeriod)) {
            return res.status(403).json({ message: 'Time limit exceeded. Submitting exam...' });
        }

        const existingAnswer = await client.execute({
            sql: 'SELECT id FROM answers WHERE attempt_id = ? AND question_id = ?',
            args: [attemptId, questionId]
        });

        if (existingAnswer.rows.length > 0) {
            await client.execute({
                sql: 'UPDATE answers SET answer = ?, updated_at = ? WHERE id = ?',
                args: [answer, getLocalTimestamp(), existingAnswer.rows[0].id]
            });
        } else {
            await client.execute({
                sql: 'INSERT INTO answers (attempt_id, question_id, answer, updated_at) VALUES (?, ?, ?, ?)',
                args: [attemptId, questionId, answer, getLocalTimestamp()]
            });
        }

        res.json({ message: 'Answer saved' });
    } catch (error) {
        console.error('Save Answer Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const submitAttempt = async (req, res) => {
    const { attemptId, autoSubmitted = false } = req.body;

    try {
        const attemptResult = await client.execute({
            sql: 'SELECT a.*, e.duration FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ?',
            args: [attemptId]
        });

        if (attemptResult.rows.length === 0 || attemptResult.rows[0].status === 'COMPLETED') {
            return res.status(400).json({ message: 'Attempt not found or already submitted.' });
        }

        const attempt = attemptResult.rows[0];
        const questions = await client.execute({
            sql: 'SELECT * FROM questions WHERE exam_id = ?',
            args: [attempt.exam_id]
        });

        const studentAnswers = await client.execute({
            sql: 'SELECT * FROM answers WHERE attempt_id = ?',
            args: [attemptId]
        });

        const answersMap = {};
        studentAnswers.rows.forEach(a => {
            answersMap[a.question_id] = a;
        });

        let totalScore = 0;

        for (const q of questions.rows) {
            const studentAns = answersMap[q.id];
            let isCorrect = 0;
            let marksAwarded = 0;

            if (studentAns) {
                if (q.type === 'MCQ' || q.type === 'SHORT') {
                    if (studentAns.answer?.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) {
                        isCorrect = 1;
                        marksAwarded = q.marks;
                    }
                } else if (q.type === 'CODING') {
                    if (studentAns.answer?.length > 10) {
                        isCorrect = 1;
                        marksAwarded = q.marks;
                    }
                }

                await client.execute({
                    sql: 'UPDATE answers SET is_correct = ?, marks_awarded = ? WHERE id = ?',
                    args: [isCorrect, marksAwarded, studentAns.id]
                });

                totalScore += marksAwarded;
            }
        }

        const nowLocal = getLocalTimestamp();

        await client.execute({
            sql: 'UPDATE attempts SET submit_time = ?, status = ?, auto_submitted = ? WHERE id = ?',
            args: [nowLocal, 'COMPLETED', autoSubmitted ? 1 : 0, attemptId]
        });

        // Time taken calculation stays simple since both are stored in same format
        const finalAttempt = await client.execute({
            sql: "SELECT (strftime('%s', submit_time) - strftime('%s', start_time)) as duration_sec FROM attempts WHERE id = ?",
            args: [attemptId]
        });

        const timeTaken = finalAttempt.rows[0].duration_sec || 0;

        await client.execute({
            sql: 'INSERT INTO leaderboard (exam_id, user_id, score, time_taken) VALUES (?, ?, ?, ?)',
            args: [attempt.exam_id, attempt.user_id, totalScore, timeTaken]
        });

        res.json({ message: 'Exam submitted successfully', score: totalScore });
    } catch (error) {
        console.error('Submit Attempt Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const getResult = async (req, res) => {
    const { attemptId } = req.params;

    try {
        const attempt = await client.execute({
            sql: 'SELECT a.*, e.title, e.passing_score FROM attempts a JOIN exams e ON a.exam_id = e.id WHERE a.id = ?',
            args: [attemptId]
        });

        if (attempt.rows.length === 0) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        const questions = await client.execute({
            sql: 'SELECT q.*, a.answer as student_answer, a.is_correct, a.marks_awarded FROM questions q LEFT JOIN answers a ON q.id = a.question_id AND a.attempt_id = ? WHERE q.exam_id = ?',
            args: [attemptId, attempt.rows[0].exam_id]
        });

        res.json({
            attempt: attempt.rows[0],
            questions: questions.rows.map(q => ({
                ...q,
                options: q.options ? JSON.parse(q.options) : null
            }))
        });
    } catch (error) {
        console.error('Get Result Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const getLeaderboard = async (req, res) => {
    const { examId } = req.params;

    try {
        // Only show BEST attempt per user in the main leaderboard
        const result = await client.execute({
            sql: `
                SELECT l.*, u.name, u.profile_photo,
                (SELECT SUM(marks) FROM questions WHERE exam_id = l.exam_id) as total_marks 
                FROM leaderboard l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.exam_id = ? 
                AND l.id IN (
                    SELECT id FROM leaderboard 
                    WHERE exam_id = ? 
                    GROUP BY user_id 
                    HAVING MAX(score)  -- This gets the ID of the record with max score
                )
                ORDER BY score DESC, time_taken ASC, l.id ASC
            `,
            args: [examId, examId]
        });

        const ranked = result.rows.map((row, index) => ({
            ...row,
            rank: index + 1,
            percentage: row.total_marks > 0 ? ((row.score / row.total_marks) * 100).toFixed(1) : 0
        }));

        res.json(ranked);
    } catch (error) {
        console.error('Leaderboard Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPersonalRankHistory = async (req, res) => {
    const { examId } = req.params;
    const userId = req.user.id;

    try {
        // Get all attempts for this user and their rank in each
        const result = await client.execute({
            sql: `
                SELECT l.*, 
                (SELECT COUNT(*) + 1 FROM leaderboard l2 WHERE l2.exam_id = l.exam_id AND (l2.score > l.score OR (l2.score = l.score AND l2.time_taken < l.time_taken))) as rank_in_attempt
                FROM leaderboard l
                WHERE l.exam_id = ? AND l.user_id = ?
                ORDER BY l.id DESC
            `,
            args: [examId, userId]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await client.execute({
            sql: `
                SELECT a.*, e.title, (SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id) as score, 
                (SELECT SUM(marks) FROM questions WHERE exam_id = a.exam_id) as total_marks
                FROM attempts a 
                JOIN exams e ON a.exam_id = e.id 
                WHERE a.user_id = ? AND a.status = ?
                ORDER BY a.submit_time DESC
            `,
            args: [userId, 'COMPLETED']
        });
        res.json(result.rows);
    } catch (error) {
        console.error('History Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDashboardSummaries = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Calculate Passed Exams (Robustly)
        const passedCountRes = await client.execute({
            sql: `
                SELECT count(*) as count FROM attempts a
                JOIN exams e ON a.exam_id = e.id
                WHERE a.user_id = ? AND a.status = 'COMPLETED' AND 
                (SELECT CAST(IFNULL(SUM(marks_awarded), 0) AS FLOAT) FROM answers WHERE attempt_id = a.id) >= 
                ((SELECT CAST(IFNULL(SUM(marks), 100) AS FLOAT) FROM questions WHERE exam_id = e.id) * CAST(e.passing_score AS FLOAT) / 100.0)
            `,
            args: [userId]
        });

        // Calculate Average Score (Floating Point)
        const statsRes = await client.execute({
            sql: `
                SELECT AVG(score_pct) as avg_score FROM (
                    SELECT (CAST(IFNULL(SUM(marks_awarded), 0) AS FLOAT) / CAST(MAX(1, (SELECT IFNULL(SUM(marks), 100) FROM questions WHERE exam_id = a.exam_id)) AS FLOAT) * 100.0) as score_pct
                    FROM attempts a
                    LEFT JOIN answers ans ON a.id = ans.attempt_id
                    WHERE a.user_id = ? AND a.status = 'COMPLETED'
                    GROUP BY a.id
                )
            `,
            args: [userId]
        });

        // Real Ranking Logic: Sum of all marks awarded across all users
        const rankingRes = await client.execute(`
            SELECT user_id, SUM(marks_awarded) as total_score 
            FROM answers ans
            JOIN attempts att ON ans.attempt_id = att.id
            GROUP BY att.user_id
            ORDER BY total_score DESC
        `);

        let userRank = 0;
        const rows = rankingRes.rows;
        for (let i = 0; i < rows.length; i++) {
            if (Number(rows[i].user_id) === Number(userId)) {
                userRank = i + 1;
                break;
            }
        }

        res.json({
            passedCount: Number(passedCountRes.rows[0].count) || 0,
            avgScore: Math.round(statsRes.rows[0].avg_score) || 0,
            rank: userRank || rows.length + 1
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getPlanner = async (req, res) => {
    try {
        const result = await client.execute({
            sql: `
                SELECT s.*, e.title as exam_title 
                FROM study_planner s 
                LEFT JOIN exams e ON s.exam_id = e.id 
                WHERE s.user_id = ? 
                ORDER BY s.status DESC, s.created_at DESC
            `,
            args: [req.user.id]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addPlannerTask = async (req, res) => {
    const { task_text, exam_id, due_date } = req.body;
    try {
        await client.execute({
            sql: 'INSERT INTO study_planner (user_id, task_text, exam_id, due_date) VALUES (?, ?, ?, ?)',
            args: [req.user.id, task_text, exam_id || null, due_date || null]
        });
        res.status(201).json({ message: 'Task added to planner' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await client.execute({
            sql: 'UPDATE study_planner SET status = ? WHERE id = ? AND user_id = ?',
            args: [status, id, req.user.id]
        });
        res.json({ message: 'Task status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deletePlannerTask = async (req, res) => {
    const { id } = req.params;
    try {
        await client.execute({
            sql: 'DELETE FROM study_planner WHERE id = ? AND user_id = ?',
            args: [id, req.user.id]
        });
        res.json({ message: 'Task removed from planner' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAvailableExams,
    startAttempt,
    saveAnswer,
    submitAttempt,
    getResult,
    getLeaderboard,
    getPersonalRankHistory,
    getHistory,
    getDashboardSummaries,
    getPlanner,
    addPlannerTask,
    updateTaskStatus,
    deletePlannerTask
};
