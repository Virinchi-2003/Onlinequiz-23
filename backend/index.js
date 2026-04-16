const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDB } = require('./models/schema');
const { seedData } = require('./models/seed');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// Basic error handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const start = async () => {
    let retries = 5;
    let connected = false;

    console.log('⏳ Connecting to database...');
    
    while (retries > 0 && !connected) {
        connected = await require('./config/db').checkConnection();
        if (!connected) {
            retries--;
            console.log(`Retrying database connection... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    if (!connected) {
        console.error('❌ CRITICAL: Could not connect to database after multiple attempts.');
        process.exit(1);
    }

    try {
        await initDB();
        await seedData();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server fully operational on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ CRITICAL STARTUP ERROR:', error);
        process.exit(1);
    }
};

start();
