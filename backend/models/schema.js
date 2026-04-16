const client = require('../config/db');

const initDB = async () => {
    try {
        console.log('Initializing database tables...');

        await client.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('ADMIN', 'STUDENT')) NOT NULL,
                profile_photo TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS exams (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                duration INTEGER NOT NULL, -- in minutes
                passing_score INTEGER NOT NULL,
                start_time DATETIME,
                end_time DATETIME,
                is_published BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_id INTEGER NOT NULL,
                type TEXT CHECK(type IN ('MCQ', 'SHORT', 'CODING')) NOT NULL,
                question_text TEXT NOT NULL,
                options TEXT, -- JSON string for MCQ
                correct_answer TEXT,
                explanation TEXT,
                marks INTEGER DEFAULT 1,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                exam_id INTEGER NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                submit_time DATETIME,
                auto_submitted BOOLEAN DEFAULT 0,
                status TEXT CHECK(status IN ('STARTED', 'COMPLETED')) DEFAULT 'STARTED',
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                attempt_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                answer TEXT,
                is_correct BOOLEAN,
                marks_awarded INTEGER DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (attempt_id) REFERENCES attempts(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exam_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                score INTEGER NOT NULL,
                time_taken INTEGER NOT NULL, -- in seconds
                rank INTEGER,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS study_planner (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                exam_id INTEGER,
                task_text TEXT NOT NULL,
                status TEXT CHECK(status IN ('PENDING', 'COMPLETED')) DEFAULT 'PENDING',
                due_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
            )
        `);

        console.log('Database tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};

module.exports = { initDB };
