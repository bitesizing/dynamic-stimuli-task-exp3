/* ================================================================================= */
/* MAIN FUNCTION TO GENERATE THE ARRAYS USED FOR ANGLE GENERATION IN THE EXPERIMENT  */
/* ================================================================================= */

function genArrays() {
  /* MANUAL LIST OF POSSIBILITIES (experimented with working out algorithmically but there are so many options this is easier) */
  var possibilities = [
    /* NO CHANGE */
    [
      [false, 2, 0, 0]
    ], // no-change, SS2

    [
      [false, 3, 1, 0], // no-change, SS3, 0 reversals
      [false, 3, 2, 0]
    ], // no-change, SS3, 1 reversal

    [
      [false, 4, 1, 0], // no-change, SS4, 0 reversals
      [false, 4, 2, 0], // no-change, SS4, 1 reversal
      [false, 4, 3, 0]
    ], // no-change, SS4, 2 reversals

    /* CHANGE */
    [
      [true, 2, 0, 1], // change, SS2, 0 dir. changes
      [true, 2, 0, 2]
    ], // change, SS2, 1 dir. change

    [
      [true, 3, 1, 1], // change, SS3, 0 reversals, 0 dir. changes
      [true, 3, 1, 2], // change, SS3, 0 reversals, 1 dir. change
      [true, 3, 1, 3], // change, SS3, 0 reversals, 2 dir. changes
      [true, 3, 2, 1], // change, SS3, 1 reversal, 0 dir. changes
      [true, 3, 2, 2], // change, SS3, 1 reversal, 1 dir. change
      [true, 3, 2, 3]
    ], // change, SS3, 1 reversal, 2 dir. changes

    [
      [true, 4, 1, 1], // change, SS4, 0 reversals, 0 dir. changes
      [true, 4, 1, 2], // change, SS4, 0 reversals, 1 dir. change
      [true, 4, 1, 3], // change, SS4, 0 reversals, 2 dir. changes
      [true, 4, 2, 1], // change, SS4, 1 reversal, 0 dir. changes
      [true, 4, 2, 2], // change, SS4, 1 reversal, 1 dir. change
      [true, 4, 2, 3], // change, SS4, 1 reversal, 2 dir. changes
      [true, 4, 3, 1], // change, SS4, 2 reversals, 0 dir. changes
      [true, 4, 3, 2], // change, SS4, 2 reversals, 1 dir. change
      [true, 4, 3, 3]
    ], // change, SS4, 2 reversals, 2 dir. changes
  ]

  /* Work out number of divisions and numbers of each of CHANGE/NON-CHANGE, SETSIZES, SHAPE-ANGLE REVERSALS and CHANGE REVERSAL DIRECTIONS */
  /* Equalise so that each sub-array (the 6 change/non-change & setsize conds) has the same representation, and that all other factors are split equally */
  var expIdxs = equalise(possibilities, 18); // currently this gives 108 discrete trials. Multiply by 2 for 216 trials.

  function equalise(arr, lcm) {
    // wld be interesting to calculate LCM w/i function at some point (wld require calculating prime factors... probably not too hard?)
    var lengths = [];
    var result = [];
    for (var i = 0; i < arr.length; i++) {
      lengths[i] = arr[i].length;
      result = result.concat(repeatArray(arr[i], lcm / lengths[i]));
    }
    return result;
  }
  expIdxs = repeatArray(expIdxs, 2);

  /* Shuffle using random seed */
  shuffleSeeded(expIdxs, seed);

  /* Add on the practice trials with key values randomly sampled from the exp trials (NOTE THAT ANGLES ARE TRULY RANDOMLY GENERATED) */
  var practiceIdxs = seededRandomPositions(nExpTrials, nPracticeTrials * 2);
  practiceIdxs = practiceIdxs.map(x => expIdxs[x]);

  // var idxs = practiceIdxs.splice(0, nPracticeTrials).concat(expIdxs.splice(0, nExpTrials), practiceIdxs.splice(0, nPracticeTrials), expIdxs.splice(0, nExpTrials));
  var idxs = practiceIdxs.splice(0, nPracticeTrials).concat(expIdxs.splice(0, nExpTrials), practiceIdxs.slice(0, nPracticeTrials), expIdxs.slice(0, nExpTrials));

  /* Assign to initial output arrays */
  var practiceArray = (Array(nPracticeTrials).fill(true)).concat(Array(nExpTrials).fill(false));
  var changeArray = slice2d(idxs, 0);
  var setsizeArray = slice2d(idxs, 1);
  var shapeAngleReversalsArray = slice2d(idxs, 2); // INPROGRESS
  var changeDirectionsArray = slice2d(idxs, 3);

  /* GENERATE SHAPE ANGLES */
  var shapeAngles = [];
  var testAngles = [];
  var tmp_angles = [];

  /* Loop through all trials to generate shapeAngles */
  for (var i = 0; i < idxs.length; i++) {
    [shapeAngles[i], testAngles[i]] = calcShapeTestAngles(setsizeArray[i], shapeAngleReversalsArray[i], changeArray[i], changeDirectionsArray[i]);
  }

  function calcShapeTestAngles(setsize, reversals, change, directionChanges) {
    /* Initialise possible angles */
    var baseAngles = [];
    for (var j = 0; j < 36; j++) {
      baseAngles[j] = wrapDeg(10 * j);
    }
    var allPosAngles = shallowCopy(baseAngles);

    /* Initialise shapeAngles and set first angle to 0 */
    var shapeAngles = [];
    shapeAngles[0] = 0;

    /* Generate the second angle randomly */
    tmp_angles = angleRange(allPosAngles, 0, minDistance, 170); /* Don't allow movements of 180 degrees */
    shapeAngles[1] = seededChoice(tmp_angles);

    /* Remove angles close to first two angles from the list of possible angles */
    allPosAngles = angleRange(allPosAngles, 0, minDistance, 180);
    allPosAngles = angleRange(allPosAngles, shapeAngles[1], minDistance, 180);

    /* If setsize > 2, randomly generate positions for reversals */
    var revPositions = seededRandomPositions(setsize - 2, reversals - 1);

    /* Loop through the remaining angles */
    for (var j = 0; j < setsize - 2; j++) {
      /* Calc whether previous direction was anticlockwise or clockwise */
      var prevDirection = antiOrClock(shapeAngles[j], shapeAngles[j + 1]);

      /* Compute list of possible angles for reversals and continuations */
      if (revPositions.includes(j)) {
        tmp_angles = angleRange(allPosAngles, shapeAngles[j + 1], minDistance, 170, 0 - prevDirection);
      } else {
        tmp_angles = angleRange(allPosAngles, shapeAngles[j + 1], minDistance, 170, prevDirection);
      }

      /* Add angle to shapeangles and remove close angles from the possibilities */
      shapeAngles[j + 2] = seededChoice(tmp_angles);
      allPosAngles = angleRange(allPosAngles, shapeAngles[j + 2], minDistance, 180);
    }

    /* Currently angles always start at 0, so shift all angles by random degree (*10) */
    var rndShift = seededChoice(baseAngles);
    var shapeAngles = shapeAngles.map(x => wrapDeg(x + rndShift));
    var allPosAngles = allPosAngles.map(x => wrapDeg(x + rndShift));

    /* GENERATE TEST ANGLES */
    var testAngles = shallowCopy(shapeAngles);

    if (change) {
      var possibleChanges = angleChanges(allPosAngles, shapeAngles, directionChanges);
      var [replaceIdx, replaceVal] = chooseRandom(possibleChanges, i);

      if (replaceVal == "ERROR") {
        return calcShapeTestAngles(setsize, reversals, change, directionChanges);
      }
      testAngles[replaceIdx] = replaceVal;
    }

    return [shapeAngles, testAngles];
  }

  /* Slice arrays depending on the times completed */
  if (timesCompleted > 0) {
    var sliceIdx = nTrials;
  } else {
    var sliceIdx = 0;
  }
  staticArray = repeatArray(staticFirst, nTrials);
  changeArray = changeArray.slice(sliceIdx, nTrials + sliceIdx);
  setsizeArray = setsizeArray.slice(sliceIdx, nTrials + sliceIdx);
  shapeAngleReversalsArray = shapeAngleReversalsArray.slice(sliceIdx, nTrials + sliceIdx);
  changeDirectionsArray = changeDirectionsArray.slice(sliceIdx, nTrials + sliceIdx);
  shapeAll = deepCopy(shapeAngles);
  shapeAngles = shapeAngles.slice(sliceIdx, nTrials + sliceIdx);
  testAngles = testAngles.slice(sliceIdx, nTrials + sliceIdx);

  /* Return all the arrays calculated */
  return [staticArray, practiceArray, changeArray, setsizeArray, shapeAngleReversalsArray, changeDirectionsArray, shapeAngles, testAngles, shapeAll]
}


/* ===================================== */
/*        SUPPORTING FUNCTIONS           */
/* ===================================== */

function chooseRandom(arrIn, globIdx) {

  /* Check for empty arrays */
  var nonEmpty = 0;
  for (var i = 0; i < arrIn.length; i++) {
    if (arrIn[i].length != 0) {
      nonEmpty += 1;
    }
  }
  if (nonEmpty == 0) {
    console.warn("No possible test angles for trial " + String(globIdx) + ". Recalculating shape angles...");
    return [0, "ERROR"];
  }

  /* Calculate full length of the array */
  var totalLength = 0;
  for (var i = 0; i < arrIn.length; i++) {
    totalLength += arrIn[i].length;
  }
  var rndChoice = randSeededInt(totalLength);

  /* Loop through subarrays until you reach the nth total element */
  for (var i = 0; i < arrIn.length; i++) {
    if (rndChoice >= arrIn[i].length) {
      rndChoice -= arrIn[i].length;
    } else {
      return [i, arrIn[i][rndChoice]];
    }
  }
}

function angleChanges(arrIn, anglesIn, nDirectionChanges) {
  var baseClockwiseArray = genClockwiseArray(anglesIn);
  var possibleChanges = [];

  /* Main loop for each input angle */
  for (var i = 0; i < anglesIn.length; i++) {
    possibleChanges[i] = [];

    /* Subloop for each of the possible angles in the shapespace */
    for (var j = 0; j < arrIn.length; j++) {
      var tmp_angles = shallowCopy(anglesIn);
      tmp_angles[i] = arrIn[j];

      tmp_clockwiseArray = genClockwiseArray(tmp_angles);
      tmp_compare = compareDirections(baseClockwiseArray, tmp_clockwiseArray);

      if (tmp_compare == nDirectionChanges) {
        possibleChanges[i].push(arrIn[j]);
      }
    }
  }

  return possibleChanges;

  function genClockwiseArray(anglesIn) {
    /* Generate array of clockwise directions from input angles */
    var clockwiseArray = [];
    for (var i = 0; i < anglesIn.length - 1; i++) {
      clockwiseArray[i] = antiOrClock(anglesIn[i], anglesIn[i + 1]);
    }
    return clockwiseArray;
  }

  function compareDirections(arr1, arr2) {
    if (arr1.length != arr2.length) {
      console.error("The two input arrays are not the same length.");
    }
    result = 1;

    for (var i = 0; i < arr1.length; i++) {
      if (arr1[i] != arr2[i]) {
        result += 1;
      }
    }
    return result;
  }
}

function antiOrClock(start, end) {
  var angleDiff = wrapDeg(end - start, false);

  /* Anticlockwise */
  if (angleDiff < 0) {
    return -1;
  }

  /* Clockwise */
  else if (angleDiff > 0) {
    return 1;
  }

}

function angleRange(arrIn, start, minDistance, maxDistance, direction = 0) {
  var result = [];

  /* Wrap start and array */
  start = wrapDeg(start);
  var arrWrap = arrIn.map(x => wrapDeg(x));

  /* Loop through each item in the original array */
  for (var i = 0; i < arrIn.length; i++) {
    var angleDiff = wrapDeg(arrWrap[i] - start, false);

    /* If anticlockwise angles wanted & if the angle is anticlockwise from the starting angle */
    if (((direction <= 0) & (angleDiff < 0)) &
      Math.abs(angleDiff) <= maxDistance & // angle is within maxRange
      Math.abs(angleDiff) >= minDistance) // angle is greater than minRange
    {
      result.push(arrIn[i]);
    }

    /* If clockwise angles wanted & if the angle is clockwise from the starting angle */
    if (((direction >= 0) & (angleDiff > 0)) &
      Math.abs(angleDiff) <= maxDistance & // angle is within maxRange
      Math.abs(angleDiff) >= minDistance) // angle is greater than minRange
    {
      result.push(arrIn[i]);
    }
  }
  return result;
}


/* =============================================== */
/* OTHER ARRAY GENERATION FUNCTIONS */
/* =============================================== */

/* Function to generate the array with all the possible images in the shapespace */
function genImgArray(which) {
  var img;
  var arrOut = new Array();
  for (var i = 1; i < 361; i++) {
    img = new Image();
    if (which == "blue") {
      img.src = 'colourised_VCS/Blue/VCS_' + i + '.png';
    } else if (which == "red") {
      img.src = 'colourised_VCS/Red/VCS_' + i + '.png';
    }

    arrOut.push(img);
  }

  return arrOut;
}

/* Function to generate random intro angles */
function genIntroAngles() {
  /* Initialise */
  var introAngles = [];
  var introSS = setsizes[Math.floor(Math.random() * 2) + 1];

  /* Assign to introAngles */
  introAngles[0] = randAngles(introSS + 1, minDistance);
  introAngles[1] = introAngles[0].slice(0, -1);

  /* Replace random val in testAngles with final shapeAngles val */
  var randPos = Math.floor(Math.random() * introSS);
  introAngles[1][randPos] = introAngles[0].splice(-1)[0];
  if (introAngles[0].length != introAngles[1].length) {
    console.error('introAngle sequences are not the same length.');
  }

  return [introAngles, introSS];

  function randAngles(n, minDistance) {
    /*- randAngles removes (n * minDistance) space from the total space
      - gens points randomly in remaining space in ascending order
      - then adds removed space back in 'inbetween' the values
      - then shuffles values again
    */

    var maxAngle = 350; // in 10s
    maxAngle = maxAngle - (minDistance * n);
    var positions = randomPositions(maxAngle, n, step = 10, sort = true); // random positions sorted low to high
    var rndAdd = randInt(max = 360, min = 0, step = 10);
    positions = positions.map((x, idx) => wrapDeg(x + (minDistance * idx) + rndAdd)); // add removed space back + a random integer to shift all values
    shuffleArray(positions);

    return positions;
  }
}