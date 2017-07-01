// imgpsh_fullsize.png
var testApp = (function() {
  var constant = (function() {
    var self = this;
    this.FRAME_TICK = 3;
    this.LEFT_ARROW = 37;
    this.RIGHT_ARROW = 39;
    this.SPACEBAR = 32;
    
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
      animations = {
        idle: [],
        run: [],
        jump: []
      },
      currentAnimation,
      jumping,
      flipAnimation;

  function setupRenderer() {
    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
          window.setTimeout(callback, 1000 / 24);
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
    // fill the frames for each animation
    for (animation in animations) {
      if (animations.hasOwnProperty(animation)) {
        animations[animation] = spritesheetMap.filter(function(frame, index) {
          return frame.name.indexOf(animation) > -1;
        });

        animations[animation].sort(function(a, b) {
          if (a.name < b.name) return -1;
          if (a.name > b.name) return 1;
          return 0;
        });
      }
    }

    currentAnimation = animations.idle;
    renderFrame();
  }

  function assignKeyListeners() {
    window.addEventListener('keydown', function(event) {
      if (!jumping &&
          event.keyCode === constant('RIGHT_ARROW') ||
          event.keyCode === constant('LEFT_ARROW')) {
        currentAnimation = animations.run;

        if (event.keyCode === constant('LEFT_ARROW')) {
          flipAnimation = true;
        }
        else {
          flipAnimation = false;
        }
      }
    });

    window.addEventListener('keyup', function(event) {
      currentFrame = 0;

      if (event.keyCode === constant('SPACEBAR')) {
        jumping = true;
        currentAnimation = animations.jump;
        currentFrame = 0;
      }

      if (!jumping) {
        currentAnimation = animations.idle;
      }
    });
  }

  function renderFrame() {
    if (currentAnimation) {
      currentTick++;
      if (currentTick > constant('FRAME_TICK')) {
        currentTick = 0;
        currentFrame++;
        
        if (currentFrame > currentAnimation.length - 1) {
          if (jumping) {
            jumping = false;
            currentAnimation = animations.idle;
          }
          
          currentFrame = 0;
        }
      }
    }

    requestAnimFrame(renderFrame);
    renderScene();
  }

  function renderScene() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    context.save();

    if (flipAnimation) {
      context.translate(
        canvasWidth + currentAnimation[currentFrame].width,
        0
      );
      context.scale(-1, 1);
    }

    if (currentAnimation) {
      context.drawImage(
        imgElm,
        currentAnimation[currentFrame].x,
        currentAnimation[currentFrame].y,
        currentAnimation[currentFrame].width,
        currentAnimation[currentFrame].height,
        canvasWidth / 2,
        canvasHeight / 2,
        currentAnimation[currentFrame].width,
        currentAnimation[currentFrame].height
      );
    }

    context.restore();
  }

  function initialize() {
    currentFrame = currentTick = 0;
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    flipAnimation = false;

    imgElm = document.getElementById("tim_sprite");

    if (setupRenderer()) {
      readMap(createAnimations);
      assignKeyListeners();
      renderFrame();
    }
  }

  return {
    initTest: initialize
  }
}());

window.onload = function () {
  testApp.initTest();
};