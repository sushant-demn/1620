require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
app.use(express.json());
const cors = require('cors');    
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Could not connect to MongoDB', err));

// Define a Schema and Model for Queue
const queueSchema = new mongoose.Schema({
    department: String,
    token: String,
    timestamp: { type: Date, default: Date.now }
});
const departmentQueueSchema = new mongoose.Schema({
    department: String,
    count: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Store hashed password
    // Add any additional fields if necessary (e.g., email, roles, etc.)
});

const User = mongoose.model('User', userSchema);

const DepartmentQueue = mongoose.model('DepartmentQueue', departmentQueueSchema);


const Queue = mongoose.model('Queue', queueSchema);

// API to generate a token and add a person to the queue
app.post('/generate-token', async (req, res) => {
    const { department } = req.body;

    if (!department) {
        return res.status(400).json({ message: "Department is required" });
    }

    try {
        // Generate a token with department and timestamp
        const token = jwt.sign({ department, timestamp: Date.now() }, SECRET_KEY);

        // Save the token and department to the database
        const queueEntry = new Queue({ department, token });
        await queueEntry.save();
        //remove this after testing
        res.json({ token, message: `Token for ${department} department added to the queue` });
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

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred during registration", error });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, SECRET_KEY, {
            expiresIn: '1h'
        });

        res.json({ token, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: "An error occurred during login", error });
    }
});



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
