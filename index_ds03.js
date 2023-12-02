/* Main middleware file that receives inputs from html and gives them to the database */

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/api'); // REQUIRES API FILE
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();

// Connect to DB
mongoose.connect(
  process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }, () =>
  console.log('Connected to DB')
);
mongoose.Promise = global.Promise;

// Middleware
app.use(express.static('public')); // parse incoming json
app.use(bodyParser.json());

// app.use(path, callback)
app.use('/', routes); // use all the routes written in api.js (post requests and now get requests)

app.use(function(err, req, res, next) {
  res.status(422).send({
    error: err.message
  })
});

// Listen to the port, log if listening
app.listen(process.env.port || 3002, function() {
  console.log('now listening for requests');
});