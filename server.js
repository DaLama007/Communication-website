const express = require('express');
const app = express();
const port = 3000;
const Database = require('better-sqlite3');
const db = new Database('database.db');
const cors = require('cors');
const socketio = require('socket.io')

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const expressServer = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
/*const io = socketio(expressServer, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"]
  }
})
io.on('connect', socket => {
  console.log(socket.id, 'has joined our server!')
  //1st arg or emit is the event name
  socket.emit('welcome', [1, 2, 3])//push event to client/browser
  //listen to incomming messages
  socket.on('thankYou', data => {
    console.log('message from client', data)
  })
})*/

db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  room_id INTEGER,
  content TEXT NOT NULL,
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (room_id) REFERENCES chatrooms(room_id)
)
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS participants (
    participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (room_id) REFERENCES chatrooms(room_id),
    UNIQUE (user_id, room_id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS chatrooms (
  room_id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT 0
)
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run();

function getMessagesFromRoom(username, otherUsername) {
  const getUserId = db.prepare('SELECT user_id FROM users WHERE username = ?');
  const user1 = getUserId.get(username);
  const user2 = getUserId.get(otherUsername);

  if (!user1 || !user2) return null;

  let userId1 = user1.user_id
  let userId2 = user2.user_id
  const checkRoom = db.prepare(`
    SELECT r.room_id
    FROM chatrooms r
    JOIN participants p1 ON r.room_id = p1.room_id
    JOIN participants p2 ON r.room_id = p2.room_id
    WHERE p1.user_id = ?
      AND p2.user_id = ?
  `);
  const room = checkRoom.get(userId1, userId2);
  if (!room) return null;
  const getMessages = db.prepare(`
    SELECT m.content, m.timestamp, u.username
    FROM messages m
    JOIN users u ON m.user_id = u.user_id
    WHERE m.room_id = ?
    ORDER BY m.timestamp ASC
  `);

  const messages = getMessages.all(room.room_id);
  return messages;
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (user) {
    if (user && user.password === password) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  }
  else {

    res.json({ success: false, message: 'User does not exist' });

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


app.post('/send-privateMessage', (req, res) => {
  const { room_id, username, content } = req.body;
  const user = db.prepare('SELECT user_id FROM users WHERE username = ?').get(username);
  if (!user) return res.json({ success: false, message: 'User not found' });

  const insert = db.prepare('INSERT INTO messages (user_id, room_id, content) VALUES (?, ?, ?)');
  insert.run(user.user_id, room_id, content);
});
app.post('/create-newRoom', (req, res) => {
  const { username, otherUsername, isPrivate } = req.body;

  console.log('➡️ /create-newRoom called with:', { username, otherUsername, isPrivate });

  if (!username || !otherUsername) {
    console.log('❌ Missing usernames');
    return res.json({ success: false, message: 'Missing usernames' });
  }

  const getUserId = db.prepare('SELECT user_id FROM users WHERE username = ?');
  const user1 = getUserId.get(username);
  const user2 = getUserId.get(otherUsername);

  console.log('🧑‍🤝‍🧑 Fetched user IDs:', user1, user2);

  if (!user1 || !user2) {
    console.log('❌ One or both users not found');
    return res.json({ success: false, message: 'User does not exist' });
  }

  const checkRoom = db.prepare(`
    SELECT r.room_id
    FROM chatrooms r
    JOIN participants p1 ON r.room_id = p1.room_id
    JOIN participants p2 ON r.room_id = p2.room_id
    WHERE r.is_private = 1
      AND p1.user_id = ?
      AND p2.user_id = ?
  `);
  const existingRoom = checkRoom.get(user1.user_id, user2.user_id);

  if (existingRoom) {
    console.log('✅ Existing room found:', existingRoom.room_id);
    return res.json({ success: true, room_id: existingRoom.room_id });
  }

  console.log('🛠 Creating new room...');
  const insert = db.prepare('INSERT INTO chatrooms (room_name, is_private) VALUES (?, ?)');
  const result = insert.run(`${username}&${otherUsername}`, isPrivate ? 1 : 0);
  const roomId = result.lastInsertRowid;

  const addParticipant = db.prepare('INSERT INTO participants (user_id, room_id) VALUES (?, ?)');
  addParticipant.run(user1.user_id, roomId);
  addParticipant.run(user2.user_id, roomId);

  console.log('✅ Room created with ID:', roomId);

  return res.json({ success: true, room_id: roomId });
});

app.post('/set-Room', (req, res) => {
  const { username, otherUsername } = req.body;

  if (!username || !otherUsername) {
    return res.json({ success: false, message: 'Missing users' });
  }

  const messages = getMessagesFromRoom(username, otherUsername);

  if (messages) {
    res.json({ success: true, messages });
  } else {
    res.json({ success: false, message: 'Room not found or no messages' });
  }
});

