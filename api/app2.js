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
const departmentQueueSchema = new mongoose.Schema({
    name1   : String,
    department: String,
    contact: String,
    token: String,
    timestamp: { type: Date, default: Date.now }
});
// const departmentQueueSchema = new mongoose.Schema({
//     department: String,
//     count: { type: Number, default: 0 }
// });

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // Store hashed password
    // Add any additional fields if necessary (e.g., email, roles, etc.)
});

const User = mongoose.model('User', userSchema);

const DepartmentQueue = mongoose.model('DepartmentQueue', departmentQueueSchema);


// const Queue = mongoose.model('Queue', queueSchema);

// API to generate a token and add a person to the queue
app.post('/generate-token', async (req, res) => {
    const {name1,contact, department} = req.body;

    if (!department) {
        return res.status(400).json({ message: "Department is required" });
    }

    try {
        // Generate a token with department and timestamp
        const token = jwt.sign({ department, timestamp: Date.now() }, SECRET_KEY);

        // Save the token and department to the database
        const queueEntry = new DepartmentQueue({ name1, contact, department, token });
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
        const queue = await DepartmentQueue.find().sort('timestamp');
        res.json({ queue });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

// API to serve the next person in the queue
app.post('/serve-next', async (req, res) => {
    try {
        const nextPerson = await DepartmentQueue.findOne().sort('timestamp');
        if (!nextPerson) {
            return res.status(400).json({ message: "No one is in the queue" });
        }

        // Remove the served person from the queue
        await DepartmentQueue.findByIdAndDelete(nextPerson._id);

        res.json({ nextPerson });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});

app.delete('/queue/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const result = await DepartmentQueue.findOneAndDelete({ token });

        if (result) {
            res.status(200).json({ message: 'Entry deleted successfully' });
        } else {
            res.status(404).json({ message: 'Entry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});


// API to get the position of a token in the queue
app.post('/queue-position', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const allQueue = await DepartmentQueue.find().sort('timestamp');
        const position = allQueue.findIndex(person => person.token === token);

        if (position === -1) {
            return res.status(400).json({ message: "Token not found in queue" });
        }

        res.json({ position: position + 1 });
    } catch (error) {
        res.status(500).json({ message: "An error occurred", error });
    }
});
app.get('/queue-counts', async (req, res) => {
    try {
        // Fetch all departments from the DepartmentQueue collection
        const departments = await DepartmentQueue.find({}).lean();

        // Iterate through each department and calculate the queue count
        const departmentQueueCounts = await Promise.all(departments.map(async department => {
            // Assuming you want to count all documents associated with this department
            const queueCount = await DepartmentQueue.countDocuments({ department: department.department });
            return { department: department.department, queueCount };
        }));

        // Respond with the calculated queue counts
        res.json(departmentQueueCounts);
    } catch (error) {
        console.error('Error fetching queue counts:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error fetching queue counts' });
    }
});

app.get('/api/department-queue', async (req, res) => {
    try {
        // Fetch all documents from the DepartmentQueue collection
        const departmentQueueData = await DepartmentQueue.find({}, 'department token'); 
        // `find` with the second argument specifies the fields to include (`department` and `token`), 
        // while excluding the `_id` field.

        // Send the data as a response
        res.json(departmentQueueData);
    } catch (error) {
        res.status(500).json({ message: "An error occurred while fetching data", error });
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
