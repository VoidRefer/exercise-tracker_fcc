const express = require('express');
const bodyParser = require('body-parser');
const {v4: uuidv4 } = require('uuid');

const app = express()
const cors = require('cors')
const { type } = require('express/lib/response');
const req = require('express/lib/request');

require('dotenv').config()

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
});

// In-memory data storage
const users = [];
const exercises = [];
let userIdCounter = 1; 


// API endpoints
// POSTS
// Create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = { username, _id: uuidv4() };
  users.push(newUser);
  res.json(newUser);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  let { _id } = req.params;
  let { description, duration, date } = req.body;
  const user = users.find( u => u._id === _id );

  if( !user ) return res.json({ error: "User not found" });

  // Validate input date
  let isValidDate = Date.parse(date);
  if (isNaN(isValidDate)) {
      date = new Date().toDateString();
  } else {
      date = new Date(date).toDateString();
  }
  const exercise = {
      userId: _id,
      description,
      duration: Number(duration),
      date
  };

  exercises.push(exercise);

  res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date,
      _id: user._id,
  });
});


// Get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(u => u._id = _id);
  if ( !user ) return res.json({ error: "User not found" });

  let userExercises = exercises.filter(ex => ex.userId === _id);

  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate)) {
      userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate)
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate)) {
      userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate)
    }
  }

  if (limit) {
    userExercises = userExercises.slice(0, Number(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(ex => ({
      description: ex.description,
      duration: ex.duration,
      date: ex.date,
    })),
  });
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
