/* =============================================== */
/* ANIMATE STATIC AND DYNAMIC STIMULI  */
/* =============================================== */

/* ANIMATIONS ARE CALLED THREE TIMES DURING THE EXPERIMENT: During the intro, during each trial and during practice feedback.
The functions below are joint functions for processing all static and all dynamic animations collectively.
This increasees the ease with which these functions can be modified when altering the experimental design. */

async function displayAnimations(condition, mode, setsize, shapeAngles, testAngles) {
  /* Assign int based on condition */
  var timePassed;
  time.tTotal = (setsize * time.tTarget) + ((setsize - 1) * time.tBlank);
  if (condition == "dynamic") { cond = 0; } else if (condition == "static") { cond = 1; }

  /* PARENT FUNCTIONS: Potential to separate these out as functions and remove 'mode' */
  if (mode == "intro") {
    await drawAnimation(function() { return showFix(["intro", 0]); }, time.tFix);
    await displaySet(["intro", 1]);
    await drawAnimation(function() { return showFix(["intro", 0]); }, time.tFix);
    await displaySet(["intro", 2]);
    await drawAnimation(function() { return showBlank(["intro", 0]); }, time.tFix * 2);

    if (animate[cond] == true) { displayAnimations(condition, mode, setsize, shapeAngles, testAngles); }

  }

  if (mode == "trial") {
    if (testingMode == true) { getResponse(); }

    // usually
    else {
      await drawAnimation(function() { return showFix(["trial", 0]); }, time.tFix);
      await displaySet(["trial", 1]);
      await drawAnimation(function() { return showFix(["trial", 0]); }, time.tFix);
      await displaySet(["trial", 2]);
      await drawAnimation(function() { return showFix(["trial", 0]); }, time.tFix);
      getResponse();
    }
  }

  if (mode == "feedback") {
    await displaySet(["feedback", 0]);
    await drawAnimation(function() { return showBlank(["feedback", 0]); }, time.tFix);

    if (animate[cond] == true) {
      displayAnimations(condition, mode, setsize, shapeAngles, testAngles);
    }
  }


  /* DISPLAY SINGLE SET OF STIMULI: */
  async function displaySet(setmode) {
    // DYNAMIC SET
    if (condition == "dynamic") {
      for (var i = 0; i < setsize - 1; i++) {
        if (freezeDynamic) {
          if (i == 0) { await drawAnimation(function() { return showShapes(setmode, shapeAngles[i], testAngles[i], time.tTarget, freeze = true); }, time.tTarget); }
          await drawAnimation(function() { return showShapes(setmode, [shapeAngles[i], shapeAngles[i + 1]], [testAngles[i], testAngles[i + 1]], time.tBlank); }, time.tBlank);
          await drawAnimation(function() { return showShapes(setmode, shapeAngles[i + 1], testAngles[i + 1], time.tTarget, freeze = true); }, time.tTarget);
        } else {
          await drawAnimation(function() { return showShapes(setmode, [shapeAngles[i], shapeAngles[i + 1]], [testAngles[i], testAngles[i + 1]], time.tTotal / (setsize - 1)); }, time.tTotal / (setsize - 1));
        }
      }
    }
    // STATIC SET
    else if (condition == "static") {
      for (var i = 0; i < setsize; i++) {
        await drawAnimation(function() { return showShapes(setmode, shapeAngles[i], testAngles[i], time.tTarget); }, time.tTarget);

        // Draw blank screen
        if (i < setsize - 1) { // Don't show blank at end
          if (injectStatic) { // Inject static stimuli inbetween blank period if injectStatic == true
            await drawAnimation(function() { return showBlank(setmode); }, (time.tBlank - time.tTarget) / 2);
            await drawAnimation(function() { return showMidpoint(setmode, shapeAngles[0], shapeAngles[1], testAngles[0], testAngles[1], time.tTarget); }, time.tTarget);
            await drawAnimation(function() { return showBlank(setmode); }, (time.tBlank - time.tTarget) / 2);
          } else {
            await drawAnimation(function() { return showBlank(setmode); }, time.tBlank);
          }
        }
      }
    }

    return new Promise(resolve => {
      resolve(0);
    })
  }

  /* GENERAL ANIMATION FUNCTION */
  function drawAnimation(executeFunction, timeIn) {
    var tStart = Date.now();
    timePassed = 0;

    const drawFrames = function(index) {
      return new Promise((resolve) => {
        timePassed = Date.now() - tStart;

        if (mode == "trial" || animate[cond] == true) {
          if (timePassed <= timeIn) {
            window.requestAnimationFrame(() => {
              executeFunction();
              return resolve(drawFrames());
            })
          } else {
            return resolve();
          }
        } else {
          if (!hasEnded) {
            blankCanvas();
            hasEnded = true;
            return resolve();
          }
        }
      });
    }
    return drawFrames();
  }

  /* INPUT FUNCTIONS */
  function showShapes(setmode, shapeAngles, testAngles, timeIn, freeze = false) {
    if (timePassed < timeIn) {
      blankCanvas();

      /* Initialise shape angles depending on condition */
      if ((condition == "dynamic") && (!freeze)) {
        var shape = calcAngle(shapeAngles[0], shapeAngles[1]);
        var test = calcAngle(testAngles[0], testAngles[1]);
      } else {
        var [shape, test] = [shapeAngles, testAngles];
      }

      /* Do extra stuff if it's feedback or intro pages */
      if (setmode[0] == "feedback") {
        drawShape(
          img1 = imgArray1[shape],
          img2 = imgArray2[test],
        );
        displayPracticeFeedbackText();
      } else if (setmode[0] == "intro") {
        displayIntroText();
      }

      /* Draw shapes based on func. call for set 1 or 2 (does not apply to feedback) */
      if (setmode[1] == 1) {
        drawShape(imgArray1[shape]);
      } else if (setmode[1] == 2) {
        drawShape(imgArray2[test]);
      }
    }

    function calcAngle(angle1, angle2) {
      var angleDistance = wrapDeg(angle2 - angle1); // distance between the two angles
      var fraction = timePassed / timeIn;
      var shapeDegrees = wrapDeg(angle1 + Math.round((fraction * angleDistance)));
      return shapeDegrees;
    }
  }

  function showBlank(setmode) {
    blankCanvas();

    if (setmode[0] == "intro") {
      displayIntroText();
    } else if (setmode[0] == "feedback") {
      displayPracticeFeedbackText();
    }
  }

  function showFix(setmode, start = false) {
    blankCanvas();
    drawFix(fixPointRadius, [0, 0]);

    if (setmode[0] == "intro") {
      displayIntroText();
      if (start != false) {
        fontSettings.font = Math.round(13 * scale) + 'px Arial';
        displayText(start, [0, offset(+1)]);
        fontSettings.font = Math.round(20 * scale) + 'px Arial';
      }
    }
  }

  function showMidpoint(setmode, angle1, angle2, angle3, angle4, timeIn) {
    blankCanvas();
    var angle1Out = calcMid(angle1, angle2);
    var angle2Out = calcMid(angle3, angle4);
    showShapes(setmode, angle1Out, angle2Out, timeIn);

    function calcMid(angleAIn, angleBIn) {
      var angleA = wrapDeg(angleAIn);
      var distBetween = wrapDeg(angleBIn - angleAIn);
      var midPointDeg = angleA + (0.5 * distBetween);
      return midPointDeg;
    }
  }
}