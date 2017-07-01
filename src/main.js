// imgpsh_fullsize.png
var testApp = (function() {
  var constant = (function() {
    var self = this;
    this.FRAME_TICK = 2;
    
    return function(constantName) {
        return self[constantName] || null;
    };
  }());

  var canvasWidth,
      canvasHeight,
      canvasElm,
      context,
      imgElm,
      currentFrame,
      currentTick,
      spritesheetMap,
      runAnimation;

  function setupRenderer() {
    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
          window.setTimeout(callback, 1000 / 60); // 24 fps
        };
    })();
    
    canvasElm = document.getElementById('renderer');
    context = canvasElm.getContext('2d');

    canvasElm.setAttribute("width", canvasWidth);
    canvasElm.setAttribute("height", canvasHeight);

    return context !== undefined;
  }

  function readMap(callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            spritesheetMap = JSON.parse(this.responseText);
            callback();
        }
    };
    xmlhttp.open("GET", "./assets/images/spritesheet.map.json", true);
    xmlhttp.send();
  }

  function createAnimations() {
    // create run animation
    runAnimation = spritesheetMap.filter(function(frame, index) {
      return frame.name.indexOf('run') > -1;
    });
    runAnimation.sort(function(a, b) {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    renderFrame();
  }

  function renderFrame() {
    requestAnimFrame(renderFrame);

    currentTick++;
    if (currentTick > constant('FRAME_TICK')) {
      currentTick = 0;
      currentFrame++;
      
      if (currentFrame > runAnimation.length - 1) {
        currentFrame = 0;
      }
    }

    renderScene();
  }

  function renderScene() {
    // var frameData = runAnimation[currentFrame].split(',');

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(
      imgElm,
      runAnimation[currentFrame].x,
      runAnimation[currentFrame].y,
      runAnimation[currentFrame].width,
      runAnimation[currentFrame].height,
      0,
      0,
      runAnimation[currentFrame].width,
      runAnimation[currentFrame].height
    );
  }

  function initialize() {
    currentFrame = currentTick = 0;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    imgElm = document.getElementById("tim_sprite");

    if (setupRenderer()) {
      readMap(createAnimations);
      // renderFrame();
    }
  }

  return {
    initTest: initialize
  }
}());

window.onload = function () {
  testApp.initTest();
};