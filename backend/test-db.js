const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');
dotenv.config();

const client = createClient({
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN,
});

async function test() {
    try {
        console.log('Testing connection to:', process.env.DB_URL);
        const result = await client.execute('SELECT 1');
        console.log('Success:', result);
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
