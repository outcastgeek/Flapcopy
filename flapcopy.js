// Generated by CoffeeScript 1.6.3
(function() {
  var Bird, Game, Scene, changeState, game,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bird = (function() {
    function Bird(scene, highest, fill) {
      this.highest = highest != null ? highest : 0;
      this.fill = fill != null ? fill : 'red';
      this.acceleration = 3 * scene.height;
      this.thrust = -(1.1 * scene.height);
      this.x = scene.width * .1;
      this.y = scene.height * .4;
      this.height = this.width = Math.min(scene.width, scene.height) / 20;
      this.ySpeed = this.thrust;
      this.lastTime = 0;
      this.score = 0;
    }

    Bird.prototype.draw = function(ctx) {
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = this.fill;
      ctx.fill();
      return ctx.fillText("" + this.score + "/" + this.highest, this.x, this.y - 2);
    };

    Bird.prototype.advanceFrame = function(thisTime) {
      var time;
      time = (thisTime - this.lastTime) / 1000;
      this.ySpeed += this.acceleration * time;
      this.y += this.ySpeed * time;
      return this.lastTime = thisTime;
    };

    Bird.prototype.flap = function() {
      return this.ySpeed = this.thrust;
    };

    return Bird;

  })();

  Scene = (function() {
    function Scene(canvas) {
      this.width = canvas.width;
      this.horizon = canvas.height * .95;
      this.xSpeed = canvas.width * 0.1584;
      this.pipeThickness = canvas.width * .0651;
      this.pipeGap = canvas.height * .3;
      this.pipes = [
        {
          x: this.width,
          y: 200,
          cleared: false
        }
      ];
      this.lastTime = 0;
    }

    Scene.prototype.draw = function(ctx) {
      var topLeft, _, _ref, _results;
      _ref = this.pipes;
      _results = [];
      for (_ in _ref) {
        topLeft = _ref[_];
        ctx.fillStyle = 'grey';
        ctx.beginPath();
        ctx.rect(topLeft.x, 0, this.pipeThickness, topLeft.y);
        ctx.fill();
        ctx.rect(topLeft.x, topLeft.y + this.pipeGap, this.pipeThickness, this.horizon);
        _results.push(ctx.fill());
      }
      return _results;
    };

    Scene.prototype.advanceFrame = function(thisTime) {
      var i;
      for (i in this.pipes) {
        this.pipes[i].x -= (thisTime - this.lastTime) / 1000 * this.xSpeed;
      }
      if ((this.width - this.pipes[this.pipes.length - 1].x) > this.pipeThickness * 5.5) {
        this.pipes.push({
          x: this.width,
          y: (this.horizon - this.pipeGap) * Math.random(),
          cleared: false
        });
      }
      if (this.pipes[0].x + this.pipeThickness < 0) {
        this.pipes.splice(0, 1);
      }
      return this.lastTime = thisTime;
    };

    Scene.prototype.pipeCollision = function(box) {
      var boxMaxX, boxMaxY, clearsLeft, i, pipe, pipeMaxX, _ref;
      _ref = this.pipes;
      for (i in _ref) {
        pipe = _ref[i];
        boxMaxX = box.x + box.width;
        boxMaxY = box.y + box.height;
        pipeMaxX = pipe.x + this.pipeThickness;
        clearsLeft = boxMaxX > pipe.x && box.x < pipe.x;
        if (clearsLeft && !pipe.cleared) {
          this.pipes[i].cleared = true;
          box.score += 1;
        }
        if ((box.y < pipe.y || boxMaxY > pipe.y + this.pipeGap) && (clearsLeft || box.x < pipeMaxX && boxMaxX > pipeMaxX || box.x > pipe.x && boxMaxX < pipeMaxX)) {
          return true;
        }
        if (pipe.x > boxMaxX) {
          return false;
        }
      }
    };

    return Scene;

  })();

  Game = (function() {
    function Game(canvasId) {
      this.animateFrame = __bind(this.animateFrame, this);
      this.render = __bind(this.render, this);
      this.highest = 0;
      this.canvas = document.getElementById(canvasId);
      if (window.innerWidth < 768) {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
      }
      this.context = canvas.getContext('2d');
      this.reset();
    }

    Game.prototype.reset = function() {
      this.started = false;
      this.over = false;
      this.scene = new Scene(this.canvas);
      this.bird = new Bird(this.canvas, this.highest);
      return this.render();
    };

    Game.prototype.render = function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.scene.draw(this.context);
      this.bird.draw(this.context);
      this.context.fillStyle = 'white';
      if (!this.started) {
        this.say('Press any key/tap to start.');
      }
      if (this.over) {
        this.say('Press any key/tap to restart.');
      }
      return window.requestAnimationFrame(this.render);
    };

    Game.prototype.animateFrame = function() {
      var thisTime;
      thisTime = new Date().getTime();
      this.scene.advanceFrame(thisTime);
      this.bird.advanceFrame(thisTime);
      if (this.bird.y < this.scene.horizon && !this.scene.pipeCollision(this.bird)) {
        return requestAnimationFrame(this.animateFrame);
      } else {
        if (this.bird.score > this.highest) {
          this.highest = this.bird.score;
        }
        return this.over = true;
      }
    };

    Game.prototype.start = function() {
      var startTime;
      this.started = true;
      startTime = new Date().getTime();
      this.bird.lastTime = startTime;
      this.scene.lastTime = startTime;
      return this.animateFrame();
    };

    Game.prototype.say = function(message, color) {
      this.context.fillStyle = color;
      return this.context.fillText(message, 2, 10);
    };

    return Game;

  })();

  changeState = function(e) {
    e.preventDefault();
    if (game.started && !game.over) {
      return game.bird.flap();
    } else if (game.over) {
      return game.reset();
    } else {
      return game.start();
    }
  };

  game = new Game('canvas');

  document.body.addEventListener('keydown', changeState);

  document.body.addEventListener('touchstart', changeState);

}).call(this);
