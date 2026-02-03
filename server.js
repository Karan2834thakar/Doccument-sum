/* global process */
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize users.json if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Utility to read users
const readUsers = () => {
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data);
};

// Utility to write users
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Register Route
app.post('/api/register', (req, res) => {
    const { email, password, name } = req.body;
    const users = readUsers();

    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'Email already registered.' });
    }

    const newUser = { id: Date.now(), email, password, name };
    users.push(newUser);
    writeUsers(users);

    res.json(newUser);
});

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json(user);
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Axon Local Server running at http://localhost:${PORT}`);
        console.log(`User data stored in: ${USERS_FILE}`);
    });
}

export default app;
