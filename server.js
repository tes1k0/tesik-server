const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

const users = {}; // In-memory user storage

// Registration route
app.post('/register', async (req, res) => {
    const { username, password, nickname } = req.body; // Добавлено поле nickname
    if (users[username]) {
        return res.status(400).send('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = { username, password: hashedPassword, nickname }; // Сохраняем nickname
    req.session.username = username;
    res.redirect('/chat.html');
});


// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).send('Invalid username or password');
    }
    req.session.username = username;
    res.redirect('/chat.html');
});

// Route to serve chat.html
app.get('/chat.html', (req, res) => {
    if (req.session.username) {
        res.sendFile(path.join(__dirname, 'public', 'chat.html'));
    } else {
        res.redirect('/');
    }
});

// Route to get current user info
app.get('/current-user', (req, res) => {
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
