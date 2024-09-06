const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key"; // Use a strong, unique secret in production

// Queue to hold tokens
const queue = [];

// API to generate a token for queueing
app.post('/generate-token', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    // Generate a token with name and timestamp
    const token = jwt.sign({ name, timestamp: Date.now() }, SECRET_KEY);

    // Add token to the queue
    queue.push(token);

    res.json({ token });
});

// API to get the current queue
app.get('/queue', (req, res) => {
    res.json({ queue });
});

// API to serve the next person in the queue
app.post('/serve-next', (req, res) => {
    if (queue.length === 0) {
        return res.status(400).json({ message: "No one is in the queue" });
    }

    // Remove and return the next token
    const nextToken = queue.shift();
    res.json({ nextToken });
});

// API to get the position of a token in the queue
app.post('/queue-position', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    const position = queue.indexOf(token);
    if (position === -1) {
        return res.status(400).json({ message: "Token not found in queue" });
    }

    res.json({ position: position + 1 });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
