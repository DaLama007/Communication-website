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
  FOREIGN KEY (user_id) REFERENCES users(username),
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

  if (user1 != null && user2 != null) {

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
    if (checkRoom.get() != null) {
      const messages = db.prepare(`SELECT m.room_id
        FROM messages m
        JOIN participants p1 ON r.room_id = p1.room_id
        JOIN participants p2 ON r.room_id = p2.room_id
        WHERE p1.user_id = ?
          AND p2.user_id = ? `)
      messages = messages.all()
      return messages;
    }
    else {

      return null;

    }

  }
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
app.post('/global', (req, res) => {
  const { username, content } = req.body;

  const insert = db.prepare('INSERT INTO messages (username, content) VALUES (?, ?)');
  insert.run(username, content);
  res.json({ success: true });
}
);
app.post('/get-global', (req, res) => {

  const messages = db.prepare('SELECT * FROM messages').all();
  res.json({ success: true, messages });
}
);
app.post('/send-privateMessage', (req, res) => {
  const { room_id, username, content } = req.body;
  const insert = db.prepare(`INSERT INTO messages (room_id,username, content) VALUES (?, ?,?)`);
  insert.run(room_id, username, content);
});
app.post('/create-newRoom', (req, res) => {
  const { username, otherUsername } = req.body;
  const checkRoom = db.prepare(`
    SELECT r.room_id
    FROM chatrooms r
    JOIN participants p1 ON r.room_id = p1.room_id
    JOIN participants p2 ON r.room_id = p2.room_id
    WHERE r.is_private = 1
      AND p1.user_id = ?
      AND p2.user_id = ?
  `);
  //fetch users
  const getUserId = db.prepare('SELECT user_id FROM users WHERE username = ?');
  const user1 = getUserId.get(username);
  const user2 = getUserId.get(otherUsername);
  //Check if users exist 
  if (user1 != null && user2 != null) {
    //create new room
    const { username, otherUsername, isPrivate } = req.body;
    const insert = db.prepare('INSERT INTO chatrooms (room_name,is_private) VALUES (?,?)');
    const result = insert.run(username + '&' + otherUsername, isPrivate);

    const roomId = result.lastInsertRowid;

    let userId1 = user1.id
    let userId2 = user2.id
    const addParticipant = db.prepare('INSERT INTO participants (user_id, room_id) VALUES (?, ?)');
    addParticipant.run(userId1, roomId);
    addParticipant.run(userId2, roomId);
    res.json({ success: true })
  }
  else {
    res.json({ success: false, message: 'User doers not exist' });
  }

});
app.post('/set-Room', (req, res) => {
  const { username, otherUsername } = req.body;
  //function that checks if users exitss and get room messages if it exists
  messages = getMessagesFromRoom(username, otherUsername);
  if (messages != null) {
    res.json({ success: true, messages })
  }
  else {
    res.json({ success: false, message: 'No messages found' })
  }
});