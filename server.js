const express = require('express');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection string (replace <username>, <password>, and <database-name> with your actual MongoDB Atlas details)
const url = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database-name>?retryWrites=true&w=majority';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('<database-name>');  // Replace with your database name
        const usersCollection = db.collection('users'); // Create a 'users' collection for registration and login

        // Sample registration route
        app.post('/register', async (req, res) => {
            const { username, password } = req.body;

            // Hash password before storing it in MongoDB
            const hashedPassword = await bcrypt.hash(password, 10);

            // Store the new user in the MongoDB collection
            const newUser = { username, password: hashedPassword };
            await usersCollection.insertOne(newUser);
            res.status(201).send('User registered');
        });

        // Sample login route
        app.post('/login', async (req, res) => {
            const { username, password } = req.body;

            // Find user from the collection
            const user = await usersCollection.findOne({ username });

            if (!user) {
                return res.status(404).send('User not found');
            }

            // Compare the entered password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                res.status(200).send('Login successful');
            } else {
                res.status(400).send('Invalid password');
            }
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// Start the connection to MongoDB
connectToDatabase();

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
