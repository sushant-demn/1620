require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Define a Schema and Model for Queue
const queueSchema = new mongoose.Schema({
    name: String,
    token: String,
    timestamp: { type: Date, default: Date.now }
});

const Queue = mongoose.model('Queue', queueSchema);

// API to generate a token and add a person to the queue
app.post('/generate-token', async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    try {
        // Generate a token with name and timestamp
        const token = jwt.sign({ name, timestamp: Date.now() }, SECRET_KEY);

        // Save the token and name to the database
        const queueEntry = new Queue({ name, token });
        await queueEntry.save();

        res.json({ token, message: `${name} added to the queue` });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// API to get the current queue
app.get('/queue', async (req, res) => {
    try {
        const queue = await Queue.find().sort('timestamp');
        res.json({ queue });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// API to serve the next person in the queue
app.post('/serve-next', async (req, res) => {
    try {
        const nextPerson = await Queue.findOne().sort('timestamp');
        if (!nextPerson) {
            return res.status(400).json({ message: "No one is in the queue" });
        }

        // Remove the served person from the queue
        await Queue.findByIdAndDelete(nextPerson._id);

        res.json({ nextPerson });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// API to get the position of a token in the queue
app.post('/queue-position', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const allQueue = await Queue.find().sort('timestamp');
        const position = allQueue.findIndex(person => person.token === token);

        if (position === -1) {
            return res.status(400).json({ message: "Token not found in queue" });
        }

        res.json({ position: position + 1 });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
