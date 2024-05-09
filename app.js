const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const controllers = require('./controllers/controllers');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// Connect to MongoDB
mongoose.connect(`${process.env.DB_CONNECT}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use(controllers);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});