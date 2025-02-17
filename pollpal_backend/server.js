require('dotenv').config();
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const argon2 = require('argon2');
const express = require('express');
const path = require('path'); // Import path module
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend files from the "dist" folder
app.use(express.static(path.join(__dirname, 'dist')));

// A simple test route to ensure the server is working
app.get('/', (req, res) => {
    res.send('Hello from PollPal backend');
});

// In server.js (add below the existing routes)
const db = require('./db');

app.get('/testdb', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// signup user route
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists in the database
        const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (existingUser.rows.length > 0) {
            // If the username exists, send a response with a message
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Hash the password with argon2
        const hashedPassword = await argon2.hash(password);

        // Insert the new user with the hashed password
        const newUser = await db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username', [username, hashedPassword]);

        // Respond with success
        res.status(200).json({ message: 'User created successfully', user: { id: newUser.rows[0].id, username: newUser.rows[0].username } });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// login user route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // check for username in the database
        const user = await db.query('SELECT * FROM users WHERE username = $1', [username]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid username' });
        }
        // check if the password is correct
        const passwordValid = await argon2.verify(user.rows[0].password_hash, password);

        if (!passwordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        return res.status(200).json({ message: 'Login successful', user: { id: user.rows[0].id, username: user.rows[0].username } });
    }
    catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Error logging in user' });
    }
});

// change username route
app.post('/changeusername', async (req, res) => {
    const { id, username } = req.body;

    // Check if the username already exists in the database
    const existingUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existingUser.rows.length > 0) {
        // If the username exists, send a response with a message
        return res.status(400).json({ message: 'Username is already taken' });
    } else {
        const result = await db.query('UPDATE users SET username = $1 WHERE id = $2', [username, id]);
        if (result) {
            return res.status(200).json({ message: 'Username changed successfully' });

        }
    }
});
// create poll route
app.post('/createpoll', async (req, res) => {
    const { question, user_id } = req.body;
    const time_stamp = new Date();

    try {
        const answer = await db.query('INSERT INTO polls (question, created_by) VALUES ($1, $2) RETURNING id', [question, user_id]);
        if (answer) {
            return res.status(201).json({ message: 'Poll created successfully', poll_id: answer.rows[0].id });
        }
    } catch (error) {
        console.error('Error creating poll:', error);
        res.status(500).json({ message: 'Error creating poll' });
    }
});

// get all polls
app.get('/getpolls', async (req, res) => {
    try {
        const polls = await db.query('SELECT * FROM polls');
        res.status(200).json(polls.rows);
    } catch (error) {
        console.error('Error getting polls:', error);
        res.status(500).json({ message: 'Error getting polls' });

    }
});

app.delete('/deletepoll', async (req, res) => {
    const { poll_id } = req.body;
    try {
        const result = await db.query('DELETE FROM polls WHERE id = $1', [poll_id]);
        if (result) {
            return res.status(200).json({ message: 'Poll deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting poll:', error);
        res.status(500).json({ message: 'Error deleting poll' });
    }
});

// get votes for a poll
app.post('/getvotes', async (req, res) => {
    const { poll_id } = req.body;
    try {
        //get yes and no votes for a poll
        const result = await db.query(
            `SELECT COUNT(CASE WHEN vote = $2 THEN 1 END) AS yes,
                    COUNT(CASE WHEN vote = $3 THEN 1 END) AS no
            FROM votes
            WHERE poll_id = $1`, [poll_id, true, false]
        );

        res.status(200).json({ yes: result.rows[0].yes, no: result.rows[0].no });
    } catch (error) {
        console.error('Error getting votes:', error);
        res.status(500).json({ message: 'Error getting votes' });
    }
});

// vote on a poll
app.post('/vote', async (req, res) => {
    const { poll_id, user_id, vote } = req.body;

    try {
        const result = await db.query('INSERT INTO votes (user_id, poll_id, vote) VALUES ($1, $2, $3)', [user_id, poll_id, vote]);
        if (result) {
            return res.status(201).json({ message: 'Vote submitted successfully' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error submitting vote' });

    }
});

// get username by id
app.post('/getusername', async (req, res) => {
    const { id } = req.body;
    try {
        const result = await db.query('SELECT username FROM users WHERE id = $1', [id]);
        if (result) {
            res.status(200).json({ message: 'Got username successfully', username: result.rows[0].username });
        }
    } catch (error) {
        console.error('Error getting username:', error);
        res.status(500).json({ message: 'Error getting username' });
    }
});

app.post('/getuservotes', async (req, res) => {
    const { user_id } = req.body;
    try {
        const result = await db.query('SELECT poll_id FROM votes WHERE user_id = $1', [user_id]);
        res.status(200).json(result.rows);
    }
    catch (error) {
        console.error('Error getting user votes:', error);
        res.status(500).json({ message: 'Error getting user votes' });
    }
});


// Catch-all route to serve index.html for React frontend (important for React Router)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

