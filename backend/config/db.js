const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config();

const url = process.env.DB_URL;
const authToken = process.env.DB_TOKEN;

if (!url || !authToken) {
    console.error('❌ ERROR: DB_URL or DB_TOKEN is missing in .env file');
}

const client = createClient({
    url: url ? url.trim() : '',
    authToken: authToken ? authToken.trim() : '',
});

// Add a simple health check helper
client.checkConnection = async () => {
    try {
        await client.execute('SELECT 1');
        return true;
    } catch (error) {
        console.error('Database connection check failed:', error.message);
        return false;
    }
};

module.exports = client;
