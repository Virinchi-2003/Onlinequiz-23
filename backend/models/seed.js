const client = require('../config/db');
const bcrypt = require('bcryptjs');

const seedData = async () => {
    try {
        console.log('Seeding initial data...');

        // Check if users already exist
        const userCheck = await client.execute('SELECT count(*) as count FROM users');
        if (userCheck.rows[0].count > 0) {
            console.log('Database already seeded. Skipping...');
            return;
        }

        // Create Admin and Student
        const adminPass = await bcrypt.hash('Admin123!', 10);
        const studentPass = await bcrypt.hash('Student123!', 10);

        await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['System Admin', 'admin@exam.com', adminPass, 'ADMIN']
        });

        await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: ['John Student', 'student@exam.com', studentPass, 'STUDENT']
        });

        // Create a Sample Exam
        const examResult = await client.execute({
            sql: 'INSERT INTO exams (title, description, duration, passing_score, is_published) VALUES (?, ?, ?, ?, ?)',
            args: ['JavaScript Fundamentals', 'Test your knowledge of JS core concepts.', 10, 40, 1]
        });
        const examId = Number(examResult.lastInsertRowid);

        // Add Questions to Exam
        // MCQ
        await client.execute({
            sql: 'INSERT INTO questions (exam_id, type, question_text, options, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [
                examId, 
                'MCQ', 
                'What is the result of typeof null in JavaScript?', 
                JSON.stringify(['undefined', 'object', 'null', 'boolean']), 
                'object', 
                'In JavaScript, typeof null is an object, which is a long-standing bug in the language.',
                1
            ]
        });

        // SHORT
        await client.execute({
            sql: 'INSERT INTO questions (exam_id, type, question_text, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?)',
            args: [
                examId, 
                'SHORT', 
                'What keyword is used to declare a block-scoped variable in modern JS?', 
                'let', 
                'let and const are used for block-scoped declarations.',
                1
            ]
        });

        // CODING
        await client.execute({
            sql: 'INSERT INTO questions (exam_id, type, question_text, correct_answer, explanation, marks) VALUES (?, ?, ?, ?, ?, ?)',
            args: [
                examId, 
                'CODING', 
                'Write a function sum(a, b) that returns the sum of two numbers.', 
                'function sum(a,b) { return a+b; }', 
                'The sum function should take two arguments and return their sum.',
                3
            ]
        });

        console.log('Sample data seeded successfully.');
    } catch (error) {
        console.error('Error seeding data:', error);
    }
};

module.exports = { seedData };
