/* =============================================== */
/* ANGLE MANIPULATIONS */
/* =============================================== */

/* Calculate n mod m */
function mod(n, m) {
  return ((n % m) + m) % m;
  // I don't know why this isn't just n % m but it needs to be like this
}

/* Converts hexidecimal to decimal (useful for converting ProlificID) */
function hexToDecimal(hex) {
  return parseInt(hex, 16);
}

/* Wrap function in degrees from -180->180, OR 0->360 if pos == true */
function wrapDeg(degIn, pos = true) {
  return mod(degIn + (pos ? 0 : 180), 360) - (pos ? 0 : 180);
}

/* wrap function in radians from -pi/2 to pi/2 */
function wrapRad(radIn) {
  var result = mod((radIn + Math.PI), (Math.PI * 2)) - Math.PI;
  return result;
}

/* convert degrees to radians */
function degToRad(x) {
  var out = (x / 180) * Math.PI;
  return out;
}

/* convert wrapped radians (shapeangles) into degrees (0-360) */
function radToDeg(inx) {
  var shapeDegrees = inx * (180 / Math.PI);
  if (shapeDegrees < 0) {
    var shape = Math.ceil(360 + shapeDegrees);
  } else {
    var shape = Math.ceil(shapeDegrees);
  }
  if (shape == 360) {
    var shape = 0;
  }

  return shape;
}


/* =============================================== */
/* RAND NUMBERS AND BASIC GENERATION */
/* =============================================== */

/* Find the maximum number in an array by comparing all consecutive pairs of numbers */
function calcMax(arr) { // reduce takes the previous and current values in an array, performs a function on them, and returns a new 'previousValue' to the next iteration until there are no more elements.
  return arr.reduce((prevValue, currentValue) => Math.max(prevValue, currentValue), -Infinity);
}

function sortAscending(arr) {
  return arr.sort((a, b) => a - b);
}

/* draw random integer with given max and optional min */
function randInt(max, min = 0, step = 1) {
  return (Math.floor((Math.random() * (max - min) / step)) * step) + min;
}

function chooseFrom(arr) {
  return arr[randInt(arr.length)];
}

/* Returns n random locations from 0:nSpots, either in a random order or sorted ascending */
function randomPositions(max, nRnd, step = 1, sort = false) {
  var idxs = range(max, step);
  var rndPos = [];

  for (var i = 0; i < nRnd; i++) {
    rndPos[i] = idxs.splice(randInt(Math.ceil(max / step) - i), 1)[0]; // return a random element and remove it from idxs.
  }

  // sort array if sort == true
  if (sort) { rndPos = sortAscending(rndPos); }

  return rndPos;
}

/* return true or false randomly */
function coinFlip() {
  var rNum = Math.random();
  if (rNum < 0.5) {
    return true;
  } else {
    return false;
  }
}

/* similiar to 'range' Python function, returns array with 0:max */
function range(max, step = 1) {
  var result = [];
  for (var i = 0; i < Math.ceil(max / step); i++) {
    result[i] = step * i;
  }
  return result
}

/* flips true or false input and returns */
function flip(boolIn) {
  if (boolIn) {
    return false;
  } else if (!boolIn) {
    return true;
  } else {
    return NaN;
  }
}


/* =============================================== */
/* SEEDING FUNCTIONS */
/* =============================================== */

/* Basic function using a seed to generate a random number */
function rndSeed(update = true) {
  var x = Math.sin(seed++) * 10000;

  /* Update the seed every time it is used */
  if (update == true) {
    seed = rndSeed(update = false);
    seedArray.push(seed);
    globalcount++;
  }

  var result = x - Math.floor(x);
  return result;
}

/* draw random seeded integer with given max */
function randSeededInt(max) {
  var result = Math.floor(rndSeed() * max);
  return result;
}

/* Function to choose an item from an array using the random seed */
function seededChoice(arr) {
  return arr[randSeededInt(arr.length)];
}

/* Returns n random locations from 0:nSpots, either in a random order or sorted ascending */
function seededRandomPositions(nSpots, nRnd, sort = false) {
  var idxs = range(nSpots);
  var rndPos = [];

  for (var i = 0; i < nRnd; i++) {
    rndPos[i] = idxs.splice(randSeededInt(nSpots - i), 1)[0]; // return a random element and remove it from idxs.
  }

  // sort array if sort == true
  if (sort) { rndPos.sort(); }
  return rndPos;
}

/* Shuffles array in place using Fisher-Yates with a seed (affects original input to the function) */
function shuffleSeeded(array) {
  var m = array.length;
  var t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = randSeededInt(m--); // <-- MODIFIED LINE

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
}



/* =============================================== */
/* ARRAY MANIPULATION */
/* =============================================== */

/* Generate a shallow copy of an array */
function shallowCopy(arr) {
  /* shallow copy bc it uses references, not variables: only works for 1d arrays */
  var result = [];
  for (var i = 0; i < arr.length; i++) {
    result[i] = arr[i];
  }
  return result;
}

/* Generate a deep copy of an array using JSON */
function deepCopy(arr) {
  result = JSON.parse(JSON.stringify(arr));
  return result;
}

/* Repeats the first dimension of an array nTimes */
function repeatArray(arr, nTimes) {
  result = [].concat(...Array(nTimes).fill(arr)); /* '...' is a spread operator that compresses arrays to 1d */
  return result;
}

/* 'Slices' a 2d array in the 2nd dimension (use .slice() to slice in 1st dimension) */
function slice2d(arr, col) {
  return arr.map(x => x.slice(col, col + 1)[0]);
}

/* 'Replaces' a given column with a given value */
function replace2d(arr, col, val) {
  result = arr.map(x => { x[col] = val; return x; });
  return result;
}

/* Return a deep copy of an array filtered to only have given values in given columns */
function subIndex(arr, col, val) {
  // convert values to arrays if they are not
  if (!Array.isArray(col)) {
    col = [col];
    val = [val];
  }

  result = arr;
  for (var i = 0; i < col.length; i++) {
    result = result.filter(x => x[col[i]] == val[i]);
  }
  return deepCopy(result);
}

/* Randomly shuffle elements of an array using Fisher-Yates */
function shuffleArray(a) {
  if (!Array.isArray(a)) {
    throw new TypeError('Argument is not an array.');
  }
  var i, j, tmp
  var n = a.length;

  for (i = n - 1; i > 0; i--) {
    j = randInt(i);
    tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
}

/* Shuffle multiple arrays using the same idx */
function shuffleMulti() {
  var i, j, iArg, tmp;
  var nArgs = arguments.length;
  var n = 0;

  for (iArg = 0; iArg < nArgs; iArg++) {
    if (!Array.isArray(arguments[iArg])) {
      throw new TypeError('Argument is not an array.');
    }
    if (iArg === 0) {
      n = arguments[0].length;
    }
    if (arguments[iArg].length !== n) {
      throw new RangeError('Array lengths do not match.');
    }
  }
  for (i = n - 1; i > 0; i--) {
    j = randInt(i);
    for (iArg = 0; iArg < nArgs; iArg++) {
      tmp = arguments[iArg][i];
      arguments[iArg][i] = arguments[iArg][j];
      arguments[iArg][j] = tmp;
    }
  }
}