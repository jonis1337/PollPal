require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL from your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // This allows self-signed certificates
    },
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
