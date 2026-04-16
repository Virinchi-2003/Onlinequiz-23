const client = require('../config/db');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

// Helper to get local IST time string for DB
const getLocalTimestamp = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().slice(0, 19).replace('T', ' ');
};

const getDashboardStats = async (req, res) => {
    try {
        const examsCount = await client.execute('SELECT count(*) as count FROM exams');
        const usersCount = await client.execute({
            sql: 'SELECT count(*) as count FROM users WHERE role = ?',
            args: ['STUDENT']
        });
        const attemptsCount = await client.execute('SELECT count(*) as count FROM attempts');

        // Success Rate calculation (Pass Rate)
        const completedCount = await client.execute("SELECT count(*) as count FROM attempts WHERE status = 'COMPLETED'");
        const completed = Number(completedCount.rows[0].count) || 0;
        
        let passRate = 0;
        if (completed > 0) {
            const passedCount = await client.execute(`
                SELECT count(*) as count FROM (
                    SELECT a.id FROM attempts a
                    JOIN exams e ON a.exam_id = e.id
                    WHERE a.status = 'COMPLETED' AND 
                    (SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id) >= 
                    ((SELECT SUM(marks) FROM questions WHERE exam_id = e.id) * e.passing_score / 100)
                )
            `);
            passRate = Math.round((Number(passedCount.rows[0].count) / completed) * 100);
        }

        const stats = {
            exams: Number(examsCount.rows[0].count),
            students: Number(usersCount.rows[0].count),
            totalAttempts: Number(attemptsCount.rows[0].count),
            successRate: passRate
        };
        res.json(stats);
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createExam = async (req, res) => {
    const { title, description, duration, passing_score, start_time, end_time } = req.body;
    try {
        const result = await client.execute({
            sql: 'INSERT INTO exams (title, description, duration, passing_score, start_time, end_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [title, description, duration, passing_score, start_time, end_time, getLocalTimestamp()]
        });
        res.status(201).json({ message: 'Exam created successfully', examId: Number(result.lastInsertRowid) });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getExams = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM exams ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateExam = async (req, res) => {
    const { id } = req.params;
    const { title, description, duration, passing_score, start_time, end_time } = req.body;
    try {
        await client.execute({
            sql: 'UPDATE exams SET title = ?, description = ?, duration = ?, passing_score = ?, start_time = ?, end_time = ? WHERE id = ?',
            args: [title, description, duration, passing_score, start_time, end_time, id]
        });
        res.json({ message: 'Exam updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteExam = async (req, res) => {
    const { id } = req.params;
    try {
        await client.execute({ sql: 'DELETE FROM exams WHERE id = ?', args: [id] });
        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const publishExam = async (req, res) => {
    const { id } = req.params;
    const { is_published } = req.body;
    try {
        await client.execute({ sql: 'UPDATE exams SET is_published = ? WHERE id = ?', args: [is_published ? 1 : 0, id] });
        res.json({ message: `Exam ${is_published ? 'published' : 'unpublished'} successfully` });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addQuestions = async (req, res) => {
    const { examId, questions } = req.body;
    try {
        for (const q of questions) {
            await client.execute({
                sql: 'INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [examId, q.type, q.question_text, q.type === 'MCQ' ? JSON.stringify(q.options) : null, q.correct_answer, q.explanation, q.marks || 1]
            });
        }
        res.status(201).json({ message: 'Questions added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const uploadQuestions = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { examId } = req.body;
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
        for (const row of rows) {
            const options = row.options ? row.options.split(',').map(o => o.trim()) : null;
            await client.execute({
                sql: 'INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [examId, row.type, row.question_text, options ? JSON.stringify(options) : null, row.correct_answer, row.explanation, row.marks || 1]
            });
        }
        res.json({ message: 'Questions uploaded successfully', count: rows.length });
    } catch (error) {
        res.status(500).json({ message: 'Error processing excel file', error: error.message });
    }
};

const getExamResults = async (req, res) => {
    const { examId } = req.params;
    try {
        const result = await client.execute({
            sql: `
                SELECT a.*, u.name as user_name, u.email as user_email,
                (SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id) as score
                FROM attempts a
                JOIN users u ON a.user_id = u.id
                WHERE a.exam_id = ? AND a.status = 'COMPLETED'
                ORDER BY score DESC, a.submit_time ASC
            `,
            args: [examId]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const createStudent = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.execute({
            sql: 'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)',
            args: [name, email, hashedPassword, 'STUDENT', getLocalTimestamp()]
        });
        res.status(201).json({ message: 'Student created successfully' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) return res.status(400).json({ message: 'Email already exists' });
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudents = async (req, res) => {
    try {
        const result = await client.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'STUDENT' ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await client.execute({ sql: "DELETE FROM users WHERE id = ? AND role = 'STUDENT'", args: [id] });
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getStudentHistory = async (req, res) => {
    const { studentId } = req.params;
    try {
        const result = await client.execute({
            sql: `
                SELECT a.*, e.title, 
                (SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id) as score,
                (SELECT SUM(marks) FROM questions WHERE exam_id = a.exam_id) as total_marks
                FROM attempts a 
                JOIN exams e ON a.exam_id = e.id 
                WHERE a.user_id = ?
                ORDER BY a.start_time DESC
            `,
            args: [studentId]
        });
        res.json(result.rows);
    } catch (error) {
        console.error('Student History Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getExamQuestions = async (req, res) => {
    const { examId } = req.params;
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM questions WHERE exam_id = ?',
            args: [examId]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

const getAnalytics = async (req, res) => {
    try {
        // Core Stats
        const totalAttemptsCount = await client.execute('SELECT count(*) as count FROM attempts');
        const completedAttemptsCount = await client.execute("SELECT count(*) as count FROM attempts WHERE status = 'COMPLETED'");
        const activeUsersCount = await client.execute('SELECT count(DISTINCT user_id) as count FROM attempts');
        const examsPassedCount = await client.execute(`
            SELECT count(*) as count FROM (
                SELECT a.id FROM attempts a
                JOIN exams e ON a.exam_id = e.id
                WHERE a.status = 'COMPLETED' AND 
                (SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id) >= 
                ((SELECT SUM(marks) FROM questions WHERE exam_id = e.id) * e.passing_score / 100)
            )
        `);

        const totalAttempts = Number(totalAttemptsCount.rows[0].count) || 0;
        const completedAttempts = Number(completedAttemptsCount.rows[0].count) || 0;
        
        // Avg Score
        const scoresResult = await client.execute('SELECT SUM(marks_awarded) as total, count(*) as count FROM (SELECT attempt_id, SUM(marks_awarded) as marks_awarded FROM answers GROUP BY attempt_id)');
        const avgScore = scoresResult.rows[0].total ? (Number(scoresResult.rows[0].total) / Number(scoresResult.rows[0].count)).toFixed(1) : 0;

        // Exam Distribution (for charts)
        const examDistribution = await client.execute(`
            SELECT e.title, count(a.id) as count, AVG((SELECT SUM(marks_awarded) FROM answers WHERE attempt_id = a.id)) as avg_score
            FROM exams e
            LEFT JOIN attempts a ON e.id = a.exam_id AND a.status = 'COMPLETED'
            GROUP BY e.id
        `);

        // Recent Engagement (last 7 days simulated by daily counts)
        const engagement = await client.execute(`
            SELECT date(submit_time) as day, count(*) as count 
            FROM attempts 
            WHERE status = 'COMPLETED' 
            GROUP BY day 
            ORDER BY day DESC 
            LIMIT 7
        `);

        res.json({
            summary: {
                completionRate: totalAttempts > 0 ? Math.round((completedAttempts / totalAttempts) * 100) : 0,
                avgScore: avgScore,
                activeUsers: Number(activeUsersCount.rows[0].count),
                examsTaken: completedAttempts,
                passRate: completedAttempts > 0 ? Math.round((Number(examsPassedCount.rows[0].count) / completedAttempts) * 100) : 0
            },
            examDistribution: examDistribution.rows,
            engagement: engagement.rows
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    const { id } = req.params;
    try {
        await client.execute({ sql: 'DELETE FROM questions WHERE id = ?', args: [id] });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    createExam,
    getExams,
    updateExam,
    deleteExam,
    publishExam,
    addQuestions,
    uploadQuestions,
    getExamResults,
    getExamQuestions,
    deleteQuestion,
    createStudent,
    getStudents,
    deleteStudent,
    getStudentHistory,
    getAnalytics
};
