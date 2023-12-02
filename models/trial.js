const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TrialSchema = new Schema({
  subjectID: String,

  /* ONCE PER TRIAL */
  iTrial: Number,
  responseCorrect: Boolean,
  responseLatency: Number,

  isStatic: Boolean,
  isPractice: Boolean,
  isChange: Boolean,
  setsize: Number,
  shapeReversals: Number,
  directionChanges: Number,

  shapeAngles: [Number],
  testAngles: [Number],

  /* Less important vars */
  resize: Number,
  screenSize: [Number],
  windowSize: [Number],

  tPhaseStart: [Number],
  tResponseStart: Number,
  tResponseDone: Number,
  response: Number,

  /* variables needed for easier referencing */
  duringTrial: Boolean,
  staticFirst: Boolean,
  whichStudyNum: Number,

  /* ONCE PER PP */
  tStart: Number,
  tExpStart: Number,
  expDuration: Number,
  tExpEnd: Number,

  age: String,
  gender: String,
  ishiharaResponses: [String],
  finalFeedback: String,
  setup: String,
  setups: String
});

// Now we create the model
const Trial = mongoose.model('ds03', TrialSchema); // set trial as mongoose model
module.exports = Trial; // export trial to API file