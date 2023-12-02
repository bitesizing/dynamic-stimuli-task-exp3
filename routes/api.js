const express = require('express');
const router = express.Router(); // Router is a set of functions (package?) including post and get.
const Trial = require('../models/trial') // call Trial structure from models

// post request
router.post('/', function(req, res, next) { // '/' means home page? So not routed into anything.... then post trial from the homepage?
  Trial.create(req.body).then(function(trial) {
    res.send(trial);
  }).catch(next);
});

// define a 'fetch' function with a request, response and next
router.get('/:subjectID', function(req, res) {
  fetchid = req.params.subjectID;
  Trial.find({ subjectID: fetchid }).then(function(trial) {
    res.send(trial);
  });
});

module.exports = router; // export router to index file