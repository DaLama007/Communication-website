const express = require('express');
const app = express();
const port = 3000;
const Database = require('better-sqlite3');
const db = new Database('database.db');
const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (user) {
    if (user && user.password === password) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
  }}
  else{
    console.log('User doesn\'t exist')
  }
});
app.post('/signup', (req, res) => {
  const { username, password } = req.body;

  const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (existingUser) {
    res.json({ success: false, message: 'Username already taken' });
  } else {
    // Insert the new user
    const insert = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    insert.run(username, password);
    res.json({ success: true });
  }
});