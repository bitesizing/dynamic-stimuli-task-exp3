/* KEY:
  CHANGEONRELEASE = code to change to specified value before releasing
  INPROGRESS = code that is currently being worked on
  ??? = bit of code I don't understand
*/

/* TO DO:
  -
*/

/* =============================================== */
/* INITIAL CHECKS ON READY
/* =============================================== */

$(document).ready(function() {
  $('#submitButton').hide();
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    $('#deviceWarning').show();
    $('#firstPage').hide();
    $('#resolutionWarning').hide();
    $('#touchWarning').hide();
  }
});

window.addEventListener('touchstart', event => {
  if (iTrial == 0) {
    $('#deviceWarning').hide();
    $('#resolutionWarning').hide();
    $('#firstPage').hide();
    $('#touchWarning').show();
  };
});

$(window).resize(function() {
  if ((window.fullScreen) || (window.innerWidth == screen.width && window.innerHeight == screen.height)) {
    $('html').css('overflow', 'hidden');
  } else {
    $('html').css('overflow', 'auto');
  }
});

/* =============================================== */
/* INITIALISE EXPERIMENT PARAMETERS */
/* =============================================== */

/* basic variables */
/* CHANGEONRELEASE */
var expName = 'ds03';
var appName = '/app3/';
var useProlific = true;
var prolificLink1 = "";
var prolificLink2 = "";

var prolificID;
var seed;
var timesAttempted = 0;
var timesCompleted = 0;
var endFlag = false;
var tExpStart = Date.now();
var bgColor = '#d3d3d3'; // light gray
var txtColor = '#870f66'
var animate = [false, false];
var hasEnded = false;
var formValid = false;
var testVar;

var seedArray = [];
var globalcount = 0;

/* scaling variables */
var screenSize = Math.round(Math.min(screen.height, screen.width));
var scale = screenSize / 1000;
var imgSize = Math.round(200 * scale);
var fixPointRadius = 6.25 * scale;

/* experiment variables */
/* CHANGEONRELEASE */
var minDistance = 30; // min angle distance in degrees
var setsizes = [2, 3, 4];
var staticFirst = coinFlip(); // coinFlip() for random; true for static first; false for dynamic first;
var injectStatic = false; // inject midpoints of static stimuli inbetween. Intended to work with staticFirst == true
var freezeDynamic = false; // freeze dynamic stimuli for length of tTarget.
var testingMode = false;

/* trial num variables (Must be less than 216 practice trials) */
var nPracticeTrials = 10; // 10
var nExpTrials = 108; // half of 216 val set in generate_angles
var nTrials = nPracticeTrials + nExpTrials;
var iBreak = nPracticeTrials + (nExpTrials / 2); // determines which trial the break follow

/* basic arrays */
var colours = ["red", "blue"];
var whichFirst = (coinFlip() ? 1 : 0);
var imgArray1 = genImgArray(colours[whichFirst]);
var imgArray2 = genImgArray(colours[(whichFirst ? 0 : 1)]);
var [introAngles, introSS] = genIntroAngles();

/* Arrays generated in the genArrays function */
var [staticArray, practiceArray, changeArray, setsizeArray, shapeAngleReversalsArray, changeDirectionsArray, shapeAngles, testAngles] = [];

/* canvas variables */
var cvs = document.getElementById('myCanvas');
var ctx = cvs.getContext('2d');

/* intitialize trial variables */
var iTrial = 0;
var iExp = 0;
var trial = {}; // this will contain all settings for the current trial
var resize = 0;
var timestampStart;
var isFeedback;

/* pp variables (filled in at end) */
var tStart;
var age = '';
var years = '';
var gender = '';
var ishihara = [];
var finalFeedback;

var dtls = 'ip here';
$.get('https://www.cloudflare.com/cdn-cgi/trace', function(dt) {
  dtls = JSON.stringify(dt, null, 2);
})

// CHANGEONRELEASE
var time = {
  tBlank: 700, // 700
  tFix: 1000, // 1000
  tTarget: 200, // 200
  tTotal: NaN,
  breakDuration: 5000 // 60000
}

/* styling */
var strokeSettings = {
  lineWidth: Math.max(Math.round(1 * scale, 1)),
  strokeStyle: '#000000'
}

var fontSettings = {
  font: Math.round(20 * scale) + 'px Arial',
  fillStyle: '#000000',
  textAlign: 'center',
  textBaseline: 'middle'
}


/* =============================================== */
/* BEGIN EXPERIMENT */
/* =============================================== */

/* initial check for valid ID */
function checkID(strng) {
  /* temp code for runtime version */
  var tmpDate = Date.now();
  prolificID = "TEST_" + String(tmpDate);
  seed = tmpDate;
  seedArray.push(seed);
  beginExperiment();
  return

  let remText = strng.replace(/\s/g, '');

  if (remText.length == 24) { // || remText === "") { // CHANGEONRELEASE (== 24)
    if (remText === "") {
      var tmpDate = Date.now();
      prolificID = "TEST_" + String(tmpDate);
      seed = tmpDate;
    } else {
      prolificID = remText;
      seed = hexToDecimal(prolificID);
    }

    seedArray.push(seed);
    beginExperiment();
  }

  // controls css for red 'ID wrong length' text
  else {
    let failedSubmitText = document.getElementById("incorrect-submit");
    failedSubmitText.classList.add("fade-in");
    setTimeout(function() {
      failedSubmitText.classList.remove("fade-in");
    }, 2000);
  }
}

/* run once at start of experiment */
async function beginExperiment() {
  $('#firstPage').hide();
  openFullscreen();
  await sleep(500);
  blankCanvas();

  /* display the intro page telling people about fullscreen */
  displayFullscreenIntroText();

  /* process old data and save relevant fields to 'previousData' */
  await processData()
    .catch(() => {
      console.warn('Cannot access server to process previous data.');
    });

  /* Generate angles using ProlificID as seed and taking first and second half based on timesCompleted */
  [staticArray, practiceArray, changeArray, setsizeArray, shapeAngleReversalsArray, changeDirectionsArray, shapeAngles, testAngles, shapeAll] = genArrays();

  /* begin trial on spacebar press */
  $(document).on('keyup', async function(e) {
    if (e.which == 32) { // space bar = 32, a = 65, l = 76
      $(document).off('keyup');

      if (endFlag == false) { beginTrial(); } else { endTrial(); }
    }
  });
}


/* =============================================== */
/* BEGIN TRIAL SEQUENCE*/
/* =============================================== */

async function beginTrial() {
  // initialise variables
  tStart = Date.now();
  resize = 0;

  // counting the resize events in every trial individually
  $(window).resize(function() {
    clearTimeout(this.id);
    this.id = setTimeout(() => {
      resize += 1;
    }, 500);
  });

  /* trial data */
  trial = {
    subjectID: prolificID,

    /* ONCE PER TRIAL */
    iTrial: iTrial,
    responseCorrect: NaN,
    responseLatency: NaN, // reaction time

    isStatic: staticArray[iTrial],
    isPractice: practiceArray[iTrial],
    isChange: changeArray[iTrial],
    setsize: setsizeArray[iTrial],
    shapeReversals: shapeAngleReversalsArray[iTrial],
    directionChanges: changeDirectionsArray[iTrial],

    shapeAngles: shapeAngles[iTrial],
    testAngles: testAngles[iTrial],

    /* Less important vars */
    resize: 0,
    screenSize: [screen.width, screen.height],
    windowSize: [window.innerWidth, window.innerHeight],

    tPhaseStart: [],
    tResponseStart: NaN,
    tResponseDone: NaN,
    response: NaN,

    /* variables needed for easier referencing */
    duringTrial: true,
    staticFirst: staticFirst,
    whichStudyNum: timesCompleted,

    /* ONCE PER PP */
    tStart: NaN,
    tExpStart: NaN,
    expDuration: NaN,
    tExpEnd: NaN,

    age: '',
    gender: '',
    ishiharaResponses: [],
    finalFeedback: '',
    setup: '',
    setups: ''
  };

  /* display intro screens if beginning practice trials */
  if ((iTrial == 0) && (nPracticeTrials != 0)) {
    flipAnimate(true);
    await intro(); // DISPLAY INTRO FOR STATIC / DYNAMIC PRACTICE TRIALS
  }

  if ((iTrial == 0) && (nPracticeTrials != 0) && (timesCompleted == 0)) {
    $(document).on('keyup', async function(e) {
      if (e.which == 32) { // space bar = 32, a = 65, l = 76
        $(document).off('keyup');
        $(document).off('mousemove');

        flipAnimate(false);
        await sleep(500);

        /* continue trial as usual on spacebar press */
        blankCanvas();
        disappearCursor();

        // display stimuli
        displayAnimations(setCond(staticArray[iTrial]), "trial", setsizeArray[iTrial], trial.shapeAngles, trial.testAngles);
      }
    });
  } else {
    // fixation point
    blankCanvas();
    disappearCursor();

    // display stimuli
    displayAnimations(setCond(staticArray[iTrial]), "trial", setsizeArray[iTrial], trial.shapeAngles, trial.testAngles);
  }

  // SUBFUNCTIONS
  /* intro page for static condition */
  function intro() {
    return new Promise(resolve => {
      blankCanvas();

      if (iTrial == 0) {
        displayFirstIntroText();
        $(document).on('keyup', async function(e) {
          if (e.which == 32) { // space bar = 32, a = 65, l = 76
            $(document).off('keyup');
            $(document).off('mousemove');

            blankCanvas();
            if (timesCompleted == 0) { displayAnimations(setCond(staticArray[iTrial]), "intro", introSS, introAngles[0], introAngles[1]); }
            resolve(0);
          }
        });
      } else {
        resolve(0);
      }
    })
  }
}

/* =============================================== */
/* GET PP RESPONSE */
/* =============================================== */

function getResponse() {
  $(document).off('mousedown');
  $(document).off('mouseup');
  trial.tResponseStart = Date.now(); // save time response display started

  showCursor();
  blankCanvas();
  displayText('Same', [offset(-5), offset(0)]);
  displayText('[Press F]', [offset(-5), offset(1)]);
  displayText('Different', [offset(+5), offset(0)]);
  displayText('[Press J]', [offset(+5), offset(1)]);

  /* If testing mode, just pick a response randomly */
  if (testingMode) {
    trial.tResponseDone = Date.now();
    trial.responseLatency = trial.tResponseDone - trial.tResponseStart;
    trial.response = (coinFlip() ? 70 : 74);
    trial.resize = resize;

    if ((trial.response == 70 && trial.isChange == false) || (trial.response == 74 && trial.isChange == true)) {
      trial.responseCorrect = true;
    } else {
      trial.responseCorrect = false;
    }

    postData(trial); // save data
    giveFeedback(); // disp feedback
  }

  /* Usually */
  else {
    $(document).on('keyup', function(e) {
      if (e.which == 70 || e.which == 74) { // SPACE = 32, F = 70, L = 74
        $(document).off('keyup');
        $(document).off('mousemove');

        trial.tResponseDone = Date.now(); // save time response was done
        trial.responseLatency = trial.tResponseDone - trial.tResponseStart; // compute and save response latency
        trial.response = e.which; // save response
        trial.resize = resize;

        if ((e.which == 70 && trial.isChange == false) || (e.which == 74 && trial.isChange == true)) {
          trial.responseCorrect = true;
        } else {
          trial.responseCorrect = false;
        }

        postData(trial); // save data
        giveFeedback(); // disp feedback
      }
    });
  }
}


/* =============================================== */
/* PROCESS TRIAL FEEDBACK  */
/* =============================================== */

async function giveFeedback() {
  $(document).off('mousedown');
  $(document).off('mouseup');
  flipAnimate(true);
  hasEnded = false;

  blankCanvas();
  await displayBlank(300);
  if (iTrial < nPracticeTrials) {
    /* simultaneous feedback display */
    displayAnimations(setCond(staticArray[iTrial]), "feedback", setsizeArray[iTrial], trial.shapeAngles, trial.testAngles);
  } else {
    displayExpFeedbackText();
  }

  /* If testing just skip to endTrial without user input */
  if (testingMode) {
    flipAnimate(false);
    blankCanvas();
    await sleep(100);
    openFullscreen();
    endTrial();
  }

  /* Usually */
  else {
    $(document).on('keyup', async function(e) {
      if (e.which == 32) { // space bar = 32, a = 65, l = 76
        $(document).off('keyup');
        $(document).off('mousemove');

        flipAnimate(false);
        blankCanvas();
        await sleep(100);
        openFullscreen();
        endTrial();
      }
    });
  }
}


/* =============================================== */
/* END TRIAL  */
/* =============================================== */

function endTrial() {
  iTrial++;

  if (iTrial < nTrials) {
    /* if break: */
    // TO DO
    if (iTrial == iBreak) {
      blankCanvas();
      displayBreakText(Date.now());

      setTimeout(function() {

        $(document).off('mousedown');
        $(document).off('mouseup');
        $(document).on('keyup', function(e) {
          if (e.which == 32) { // space bar = 32, a = 65, l = 76
            $(document).off('keyup');
            $(document).off('mousemove');
            beginTrial();
          }
        });
      }, time.breakDuration);
    }

    /* if practice over: */
    else if (iTrial == nPracticeTrials) {
      blankCanvas();
      displayPracticeOverText();

      $(document).off('mousedown');
      $(document).off('mouseup');
      $(document).on('keyup', function(e) {
        if (e.which == 32) { // space bar = 32, a = 65, l = 76
          $(document).off('keyup');
          $(document).off('mousemove');
          beginTrial();
        }
      });
    } else {
      beginTrial();
    }
  }

  /* if all trials complete */
  else {
    blankCanvas();
    displayFinalText();

    $(document).off('mousedown');
    $(document).off('mouseup');
    $(document).on('keyup', function(e) {
      if (e.which == 32) { // space bar = 32, a = 65, l = 76
        $(document).off('keyup');
        $(document).off('mousemove');
        $('#myCanvas').remove();
        closeFullscreen();
      }
    });
  }
}

/* =============================================== */
/* SAVE FINAL DATA ON FORM SUBMISSION */
/* =============================================== */
$(document).ready(function() {
  validateBootstrap(1);
  validateBootstrap(2);
});

function validateBootstrap(formNum) {
  $('#contact_form' + formNum).bootstrapValidator({
      // To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
      feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
      },
      fields: {
        age: {
          validators: {
            stringLength: {
              max: 2,
              message: 'Please enter a 1- or 2-digit number'
            },
            notEmpty: {
              message: 'Please supply your age'
            }
          }
        },
        gender: {
          validators: {
            notEmpty: {
              message: 'Please select an option for gender'
            }
          }
        },
        feedback: {
          validators: {
            stringLength: {
              max: 500,
              message: 'Please keep your feedback to 500 characters or fewer'
            },
          }
        },
        ishihara: {
          validators: {
            stringLength: {
              max: 2,
              message: 'Please enter a 1- or 2-digit number'
            },
            notEmpty: {
              message: 'Please provide a response to this image'
            }
          }
        }
      }
    })

    /* IF ALL IS VALID: */
    .on('success.form.bv', function(e) {
      // show success message
      $('#success_message' + formNum).slideDown({
        opacity: "show"
      }, "slow")

      // reset form
      $('#contact_form' + formNum).data('bootstrapValidator').resetForm();

      postFinal();
    });
}

function saveFinal(finalFeedbackIn, yearsIn, genderIn, ishiharaIn) {
  finalFeedback = finalFeedbackIn;
  console.debug('final feedback is: ' + finalFeedback)

  if (yearsIn !== undefined) {
    years = yearsIn;
    gender = genderIn;
    ishihara = ishiharaIn;
  }
}

/*  save demographics */
async function postFinal() {

  var tExpEnd = Date.now();
  var vrs = navigator.userAgent;
  const data = {
    subjectID: prolificID,

    /* ONCE PER TRIAL */
    iTrial: NaN,
    responseCorrect: NaN,
    responseLatency: NaN,

    isStatic: NaN,
    isPractice: NaN,
    isChange: NaN,
    setsize: NaN,
    shapeReversals: NaN,
    directionChanges: NaN,

    shapeAngles: [],
    testAngles: [],

    /* Less important vars */
    resize: NaN,
    screenSize: NaN,
    windowSize: NaN,

    tPhaseStart: [],
    tResponseStart: NaN,
    tResponseDone: NaN,
    response: NaN,

    /* variables needed for easier referencing */
    duringTrial: false,
    staticFirst: staticFirst,
    whichStudyNum: timesCompleted,

    /* ONCE PER PP */
    tStart: tStart,
    tExpStart: tExpStart,
    expDuration: tExpEnd - tExpStart,
    tExpEnd: tExpEnd,

    age: years,
    gender: gender,
    ishiharaResponses: ishihara,
    finalFeedback: finalFeedback,
    setup: vrs,
    setups: dtls
  };

  fetch(appName, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then((response) => response.json())
    .then((data) => {
      console.log('Success!');
      if (timesCompleted > 0) {
        window.open(prolificLink2, '_self');
      } else {
        window.open(prolificLink1, '_self');
      }

    })

  await sleep(1500);
  $('#lastPage').hide();
  $('#lastPage2').hide();
  $('#firstPage').show();
}


/* =============================================== */
/* GENERAL FUNCTIONS */
/* =============================================== */

/* sets blank canvas and sets correct canvas parameters to eliminate blur */
function blankCanvas() {
  // set correct parameters for non-blurry canvas (call everytime you resize canvas)
  setCanvasParams();

  // blank canvas
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cvs.width, cvs.height);


  // subfunctions
  function setCanvasParams() {
    //get DPI
    var dpi = window.devicePixelRatio;
    // var dpi = 1;

    //get canvas & context
    cvs = document.getElementById('myCanvas');
    styleHeight = window.innerHeight;
    styleWidth = window.innerWidth;

    cvs.style.width = styleWidth + "px";
    cvs.style.height = styleHeight + "px";

    // scale canvas
    cvs.height = styleHeight * dpi;
    cvs.width = styleWidth * dpi;

    // describe context
    ctx = cvs.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.oImageSmoothingEnabled = false;
  }
}


/* blanks area and redraws with bgColor */
function blankArea(size, startPos) {
  var location = [
    ((window.innerWidth - size) / 2) + scale * startPos[0],
    ((window.innerHeight - size) / 2) + scale * startPos[1]
  ];

  ctx.clearRect(location[0], location[1], size, size);
  ctx.fillStyle = bgColor;
  ctx.fillRect(location[0] - 2, location[1] - 2, size + 4, size + 4);
}


/* draw circle */
function drawFix(radius, pos) {
  for (const key in strokeSettings) {
    ctx[key] = strokeSettings[key];
  }
  ctx.beginPath();
  ctx.arc(cvs.width / 2 + scale * pos[0], cvs.height / 2 + scale * pos[1], radius, 0, Math.PI * 2, true);
  ctx.stroke();
}


function drawShape(img1, img2) {
  var location = [
    ((cvs.width - imgSize) / 2),
    ((cvs.height - imgSize) / 2)
  ];

  if (img2 !== undefined) {
    ctx.drawImage(img1, 0, 0, img1.width, img1.height, location[0] + offset(-4), location[1], imgSize, imgSize); // left feedback
    ctx.drawImage(img2, 0, 0, img2.width, img2.height, location[0] + offset(4), location[1], imgSize, imgSize); // right feedback
  } else if (img1 !== undefined) {
    ctx.drawImage(img1, 0, 0, img1.width, img1.height, location[0], location[1], imgSize, imgSize); // non-feedback
  } else {
    console.warn('Image to be drawn is not defined!'); // Warn and not error bc errors don't stack in the console
  }
}

function flipAnimate(boolIn) {
  if (staticArray[iTrial]) {
    animate[1] = boolIn;
  } else if (!staticArray[iTrial]) {
    animate[0] = boolIn;
  }
}

function offset(amt) {
  return 35 * amt * scale;
}


/* =============================================== */
/* TEXTSCREEN FUNCTIONS */
/* =============================================== */

/* print text on canvas */
function displayText(text, pos, italics = false, size = 0) {
  var ctxSettings = fontSettings;
  for (const key in ctxSettings) {
    ctx[key] = ctxSettings[key];
  }

  if (size != 0) { ctx.font = Math.round(size * scale) + 'px Arial'; }
  if (italics != false) { ctx.font = "italic " + fontSettings.font; }
  ctx.fillText(text, cvs.width / 2 + pos[0], cvs.height / 2 + pos[1]);
  ctx.font = fontSettings.font;
}

function displayFullscreenIntroText(trialID = 0) {
  displayText("Your browser is now in fullscreen mode.", [0, offset(-5)]);
  displayText("You can return to normal viewing mode by pressing ESC, but please do not do so until the end of the experiment.", [0, offset(-4)]);
  displayText("Fullscreen mode will end automatically once the task is finished.", [0, offset(-3)]);

  if (trialID != 0) {
    displayText("Unfinished session detected. Press SPACEBAR to continue from trial " + trialID + ".", [0, offset(0)]);
  } else {
    displayText("Press SPACEBAR to continue.", [0, offset(0)]);
  }
}

function displayFirstIntroText() {
  shapeText = ["CHANGING SHAPES", "SEQUENCES OF SHAPES"];

  if (timesCompleted == 0) {
    displayText("During this experiment, you will be asked", [0, offset(-5)]);
    displayText("to identify differences between two " + shapeText[staticFirst ? 1 : 0] + ".", [0, offset(-4)]);
    displayText("This session will begin with a practice round to get familiar with the full design.", [0, offset(-3)]);
  } else {
    displayText("This session will be a continuation of your first session,", [0, offset(-6)]);
    displayText("where you were asked to identify differences between " + shapeText[staticFirst ? 1 : 0] + ".", [0, offset(-5)]);

    displayText("There will now be another short practice round to refamiliarise yourself with the design.", [0, offset(-3)]);
    displayText("The first trial will have " + calcTrialLengthText(), [0, offset(-2)], true);
  }

  displayText("Press SPACEBAR to continue.", [0, offset(0)]);
}

function calcTrialLengthText(first = false) {
  var dDict = {
    2: "SHORT",
    3: "MEDIUM",
    4: "LONG"
  };

  var sDict = {
    2: "TWO",
    3: "THREE",
    4: "FOUR"
  }

  var modifier = (first ? 0 : 1);

  if (staticFirst) {
    return (sDict[setsizeArray[iTrial + modifier]] + " shapes per sequence.");
  } else {
    return ("stimuli shown for a " + dDict[setsizeArray[iTrial + modifier]] + " amount of time.");
  }

}


/* Introtext called by displayAnimations only for first session */
function displayIntroText() {
  var shapeText = ["changing shapes", "sequences of shapes"];
  displayText("During each trial you will be presented with two stimuli (" + shapeText[staticFirst ? 1 : 0] + ") as shown below.", [0, offset(-6)]);
  displayText("After both stimuli have been presented, you will be asked whether they are the same or different.", [0, offset(-5)]);

  if (staticFirst) {
    displayText("Each sequence will be made up of between 2 and 4 shapes.", [0, offset(-4)]);
  } else {
    displayText("Stimuli will keep changing for different lengths of time in different trials.", [0, offset(-4)]);
  }

  var colourText = ["shape", "sequence"];
  ctx.font = Math.round(10 * scale) + 'px Arial';
  var tmp_size = 15;
  displayText("The first " + colourText[staticFirst ? 1 : 0] + " will", [offset(-8), offset(0)], false, tmp_size);
  displayText("always be " + colours[whichFirst] + ".", [offset(-8), offset(0.75)], false, tmp_size);
  displayText("The second " + colourText[staticFirst ? 1 : 0] + " will", [offset(+8), offset(0)], false, tmp_size);
  displayText("always be " + colours[whichFirst ? 0 : 1] + ".", [offset(+8), offset(0.75)], false, tmp_size);
  ctx.font = fontSettings.font;

  displayText("There will now be a short practice round to familarise yourself with the design.", [0, offset(+4)]);
  displayText("The first trial will have " + calcTrialLengthText(true), [0, offset(+5)], true);
  displayText("When you are ready, press SPACEBAR to begin.", [0, offset(+6)]);
}


function displayPracticeFeedbackText() {

  // print if pp is correct
  if (trial.responseCorrect == true) {
    displayText('CORRECT', [0, offset(-4)]);
  } else {
    displayText('INCORRECT', [0, offset(-4)]);
  }

  // print if changeTrial
  if (trial.isChange == false) {
    displayText('The stimuli were THE SAME.', [0, offset(-3)]);
  } else {
    displayText('The stimuli were DIFFERENT.', [0, offset(-3)]);
  }

  if (iTrial < nPracticeTrials - 1) { displayText("The next trial will have " + calcTrialLengthText(), [0, offset(+4)], true); }
  displayText('Press the SPACEBAR to continue.', [0, offset(+5)]);
}

function displayPracticeOverText() {
  displayText('This is the end of the practice round.', [0, offset(-1)]);
  displayText('To begin the full session, press SPACEBAR.', [0, offset(0)]);
}

function displayExpFeedbackText() {
  // print if pp is correct
  if (trial.responseCorrect == true) {
    displayText('CORRECT', [0, offset(-4)]);
  } else {
    displayText('INCORRECT', [0, offset(-4)]);
  }

  // print if changeTrial
  if (trial.isChange == false) {
    displayText('The stimuli were THE SAME.', [0, offset(-3)]);
  } else {
    displayText('The stimuli were DIFFERENT.', [0, offset(-3)]);
  }

  if (iTrial != nTrials - 1) { displayText("The next trial will have " + calcTrialLengthText(), [0, offset(-2)], true); }
  displayText('Press SPACEBAR to continue.', [0, offset(1)]);
}

function displayBreakText(tStart) {
  var secondsAfter = Math.floor((Date.now() - tStart) / 1000);
  var secondsUntil = Math.floor((time.breakDuration / 1000) - secondsAfter);

  if (secondsUntil > 0) {
    window.requestAnimationFrame(() => {
      blankCanvas();
      displayText('You are now half way through the session. Feel free to take a short break before beginning the second half.', [0, offset(-2)]);

      displayText('You will be able to resume the session in ' + secondsUntil + ' seconds.', [0, offset(1)]);
      displayText('Please leave the full screen on during this time.', [0, offset(2)]);
      displayBreakText(tStart);
    })
  } else {
    blankCanvas();
    displayText('You are now able to resume with the second half of the session.', [0, offset(1)]);
    displayText('Press SPACEBAR to continue with the task.', [0, offset(2)]);
  }
}

function displayFinalText() {
  displayText('You have now completed the experiment.', [0, offset(-4)]);
  displayText('Press SPACEBAR to close this window.', [0, offset(0)]);
}


/* =============================================== */
/* SERVERSIDE FUNCTIONS */
/* =============================================== */

async function postData(trial) {
  // trial must be object with all properties specified in TrialSchema
  const config = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trial)
  };

  try {
    const rspns = await fetch(appName, config);
    const dt = await rspns.json();
    return dt;
  } catch (e) {
    return e;
  }
}

async function getData(subID) {
  var destString = appName + subID

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const rspns = await fetch(destString, config);
    const dt = await rspns.json();
    return dt;
  } catch (e) {
    return e;
  }
}

/* Process previous participant data */
async function processData() {
  let prev = await getData(prolificID);

  // INPROGRESS - ERROR WITH THE FETCH REQUEST SOMEHOW:////
  return new Promise(resolve => {
    if ((prev.length != 0) && (prev.length !== undefined)) {
      console.info("Previous data for this participant found.");
      var studyNumArray = []

      /* Initial loop to determine the first time a participant finished the study */
      for (var i = 0; i < prev.length; i++) {

        /* Keep an array of all the study numbers from study-completion forms */
        if (prev[i].duringTrial == false) {
          studyNumArray.push(prev[i].whichStudyNum);
        }

        /* Increment current timesAttempted for each study that has been done before */
        if (prev[i].whichStudyNum >= timesAttempted) {
          timesAttempted = prev[i].whichStudyNum + 1;
        }
      }

      /* Use studyNumArray to determine timesCompleted */
      if (studyNumArray.length == 0) {
        console.info('No previous study completions with this prolificID detected.');
      } else {
        timesCompleted = Math.max(studyNumArray) + 1;
        console.info("Previous times completed = " + timesCompleted);

        /* Find first non-practice trial in first session and assign staticFirst based on that trial */
        for (var i = 0; i < prev.length; i++) {
          if ((prev[i].whichStudyNum == 0) && (!prev[i].isPractice) && (prev[i].duringTrial)) {
            staticFirst = prev[i].staticFirst;
            console.info("staticFirst set to " + staticFirst);
            break;
          }
        }

      }

      /* If there is previous data for the same studyNum, reset back to most recent trial [POSSIBLE BC OF S33DED ANGLES] */
      var iTrialArray = [];
      var tmpbool = true;
      for (var i = 0; i < prev.length; i++) {
        /* If there is previous data from the same studyNum (i.e. if participants reload the page) */
        if (prev[i].whichStudyNum == timesCompleted) {
          iTrialArray.push(prev[i].iTrial);
          if (tmpbool) {
            staticFirst = prev[i].staticFirst;
            tmpbool = false;
          }
        }
      }


      /* If array isn't empty, replace iTrial with max trial number recorded + 1 */
      if (iTrialArray.length != 0) {
        var maxITrial = calcMax(iTrialArray);

        if (maxITrial < nTrials - 1) {
          iTrial = maxITrial + 1;
          console.info("iTrial updated successfully on reload. Continuing from trial " + iTrial + ".");
          blankCanvas();
          displayFullscreenIntroText(iTrial + 1);
        } else {
          iTrial = nTrials; // INPROGRESS
          blankCanvas();
          displayText("Form submission incomplete. Please try again.", [0, offset(-1)]);
          endFlag = true;
        }

      }


      /* Resolve */
      console.info('Previous data collection resolved successfully.');
      resolve(0);

    } else {
      console.info('No previous data with this ProlificID detected.');
      resolve(0);
    }
  })

}


/* =============================================== */
/* FULLSCREEN FUNCTIONS */
/* =============================================== */

/* opens fullscreen */
function openFullscreen() {
  if (cvs.requestFullscreen) {
    cvs.requestFullscreen();
  } else if (cvs.mozRequestFullScreen) { // Firefox
    cvs.mozRequestFullScreen();
  } else if (cvs.webkitRequestFullscreen) { // Chrome, Safari & Opera
    cvs.webkitRequestFullscreen();
  } else if (cvs.msRequestFullscreen) { // IE/Edge
    cvs.msRequestFullscreen();
  }
}

/* closes fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozExitFullScreen) { // Firefox
    cvs.mozExitFullScreen();
  } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { // IE11 / Edge
    document.msExitFullscreen();
  }
}

function disappearCursor() {
  document.body.style.cursor = 'none';
}

function showCursor() {
  document.body.style.cursor = 'auto';
}


/* =============================================== */
/* ASYNC FUNCTIONS */
/* =============================================== */

/* does nothing for a given time */
function sleep(t) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, t);
  })
}

/* displays blank screen inbetween stimuli */
function displayBlank(t = time.tBlank) {
  blankCanvas();

  return new Promise(resolve => {
    setTimeout(function() {
      resolve(0);
    }, t);
  })
}

/* displays circular fixation point */
function displayFixation(t = time.tFix) {
  blankCanvas();
  drawFix(fixPointRadius, [0, 0]);

  trial.tPhaseStart.push(Date.now()); // save time of stim offset

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(0);
    }, t);
  })
}

function setCond(bool_in) {
  if (bool_in == true) {
    return "static";
  } else if (bool_in == false) {
    return "dynamic";
  }
}


/* =============================================== */
/* SLIDESHOW CONTROL ON FINAL PAGE*/
/* =============================================== */

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {
    slideIndex = 1
  }
  if (n < 1) {
    slideIndex = slides.length
  }
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex - 1].style.display = "block";
}