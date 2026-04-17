const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./models/schema');
const { seedData } = require('./models/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Validate Environment Variables
const requiredEnv = ['DB_URL', 'DB_TOKEN', 'JWT_SECRET'];
requiredEnv.forEach(env => {
    if (!process.env[env]) {
        console.warn(`⚠️ WARNING: ${env} is missing in environment variables!`);
    }
});

if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'temporary_development_secret_only';
    console.log('⚠️ Using fallback JWT_SECRET. NOT RECOMMENDED FOR PRODUCTION.');
}

// Middleware
app.use(cors({
    origin: [
        'https://onlinequiz-23.vercel.app', 
        'https://onlinequiz-23.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// Basic error handler
app.use((err, req, res, next) => {
    console.error('CRITICAL SERVER ERROR:', err);
    res.status(500).json({ 
        message: 'Internal Server Error', 
        error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack 
    });
});

// Initialize database and start server
let dbInitialized = false;
const initializeApp = async () => {
    if (dbInitialized) return;
    
    console.log('⏳ Initializing Application...');
    try {
        const connected = await require('./config/db').checkConnection();
        if (connected) {
            await initDB();
            await seedData();
            dbInitialized = true;
            console.log('✅ Database synchronized and ready.');
        } else {
            console.error('❌ Database connection failed during initialization.');
        }
    } catch (error) {
        console.error('❌ Application initialization error:', error);
    }
};

// Middleware to ensure DB is initialized on first request (Serverless support)
app.use(async (req, res, next) => {
    if (!dbInitialized && req.path.startsWith('/api')) {
        await initializeApp();
    }
    next();
});

if (require.main === module) {
    initializeApp().then(() => {
        app.listen(PORT, () => {
            const url = process.env.NODE_ENV === 'production' ? 'https://onlinequiz-23.onrender.com' : `http://localhost:${PORT}`;
            console.log(`🚀 Server fully operational on ${url}`);
        });
    });
}

module.exports = app;
