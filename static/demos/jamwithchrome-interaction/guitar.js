// Shim by Paul Irish
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function() {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

function Stage(id) {
  this.el = document.getElementById(id);
  
  this.position();
  this.listeners();
  this.hitZones = [];
  return this;
}

Stage.prototype.position = function() {
  var offset = this.offset();
  this.positionTop = Math.floor(offset.top);
  this.positionLeft = Math.floor(offset.left);
};

Stage.prototype.offset = function() { 
  var _x, _y,
      el = this.el;
  
  if (typeof el.getBoundingClientRect !== "undefined") {
    return el.getBoundingClientRect();
  } else {
    _x = 0;
    _y = 0;
    while(el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent;
    }
    return { top: _y - window.scrollY, left: _x - window.scrollX };
  }
};

Stage.prototype.listeners = function() {
  var _self = this;
  
  _self.dragging = false;
  _self.limit = false;
  
  window.addEventListener('resize', function() {
    _self.position();
  }, false);
  
  window.addEventListener('scroll', function() {
    _self.position(true);
  }, false);
  
  this.el.addEventListener('mousedown', function(e) {
    var x = e.clientX - _self.positionLeft,
        y = e.clientY - _self.positionTop;

    _self.hitZones.forEach(function(zone) {
        _self.checkPoint(x, y, zone);
    });

    _self.dragging = true;
    _self.prev = [x, y];
  }, false);
  
  
  document.addEventListener('mousemove', function(e) {
    var x, y;

    if (!_self.dragging || _self.limit) return;
    _self.limit = true;

    x = e.clientX - _self.positionLeft,
    y = e.clientY - _self.positionTop;


    _self.hitZones.forEach(function(zone) {
      _self.checkIntercept(_self.prev[0], 
                           _self.prev[1],
                           x, 
                           y,
                           zone);
    });

    _self.prev = [x, y];

    setInterval(function() {
      _self.limit = false;
    }, 50);      
  }, false);
  
  document.addEventListener('mouseup', function(e) {
    var x, y;
    
    if (!_self.dragging) return;
    _self.dragging = false;
    
    x = e.clientX - _self.positionLeft,
    y = e.clientY - _self.positionTop;
  
    _self.hitZones.forEach(function(zone) {
      _self.checkIntercept(_self.prev[0], 
                           _self.prev[1],
                           x, 
                           y,
                           zone);
    });
  }, false);
};

Stage.prototype.check = function(x, y, zone) {
  if (!zone.el) return;

  if (zone.inside(x, y)) {
    zone.el.classList.add('hit');
    this.el.classList.add('active');
  } else {
    zone.el.classList.remove('hit');
    this.el.classList.remove('active');
  }
};

Stage.prototype.addRect = function(id) {
  var el = document.getElementById(id),
      rect = new Rect(el.offsetLeft, 
                      el.offsetTop, 
                      el.offsetWidth, 
                      el.offsetHeight  
                      );
  rect.el = el;

  this.hitZones.push(rect);
  return rect;
};

Stage.prototype.addString = function(rect, string) {
  rect.string = string;
  
  this.hitZones.push(rect);
  return rect;
}; 

Stage.prototype.checkPoint = function(x, y, zone) {
  if (zone.inside(x, y)) {
    zone.string.strum();
  }
};  

Stage.prototype.checkIntercept = function(x1, y1, x2, y2, zone) {
   if (zone.intercept(x1, y1, x2, y2)) {
    zone.string.strum();
   }
 }; 


function Rect(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
    
  return this;
}

Rect.prototype.inside = function(x,y) {
  return x >= this.x && y >= this.y
      && x <= this.x + this.width
      && y <= this.y + this.height;
};

Rect.prototype.midLine = function() {
  if (this.middle) return this.middle;

  this.middle = [
      {x: this.x, y: this.y + this.height / 2},
      {x: this.x + this.width, y: this.y + this.height / 2}
  ]
  return this.middle;
};

Rect.prototype.intercept = function(x1, y1, x2, y2) {
  var result = false,
          segment = this.midLine(),
          start = {x: x1, y: y1},
          end = {x: x2, y: y2};
  
  return this.intersectLine(segment[0], segment[1], start, end);
};

Rect.prototype.intersectLine = function(a1, a2, b1, b2) {
  //-- http://www.kevlindev.com/gui/math/intersection/Intersection.js
  var result,
      ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x),
      ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x),
      u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

  if (u_b != 0) {
    var ua = ua_t / u_b;
    var ub = ub_t / u_b;

    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
        result = true;
    } else {
        result = false; //--"No Intersection"
    }
  } else {
    if (ua_t == 0 || ub_t == 0) {
        result = false; //-- Coincident"
    } else {
        result = false; //-- Parallel
    }
  }

  return result;
};


function GuitarString(rect) {
    this.x = rect.x;
    this.y = rect.y + rect.height / 2;
    this.width = rect.width;
    this._strumForce = 0;
    this.a = 0;
}

GuitarString.prototype.strum = function() {
  this._strumForce = 5;
};

GuitarString.prototype.render = function(ctx, canvas) {
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(this.x, this.y);
  ctx.bezierCurveTo(
          this.x, this.y + Math.sin(this.a) * this._strumForce,
          this.x + this.width, this.y + Math.sin(this.a) * this._strumForce,
          this.x + this.width, this.y);
  ctx.stroke();
  
  this._strumForce *= 0.99;
  this.a += 0.5;
};


function StringInstrument(stageID, canvasID, stringNum){
    this.strings = [];
    this.canvas = document.getElementById(canvasID);
    this.stage = new Stage(stageID);
    this.ctx = this.canvas.getContext('2d');
    this.stringNum = stringNum;

    this.create();
    this.render();

    return this;
}

StringInstrument.prototype.create = function() {
  for (var i = 0; i < this.stringNum; i++) {
    var srect = new Rect(10, 90 + i * 15, 380, 5);
    var s = new GuitarString(srect);
    this.stage.addString(srect, s);
    this.strings.push(s);
  }
};

StringInstrument.prototype.render = function() {
  var _self = this;
  
  requestAnimFrame(function(){
    _self.render();
  });
  
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
  for (var i = 0; i < this.stringNum; i++) {
    this.strings[i].render(this.ctx);
  }
};


var guitar = new StringInstrument("stage-4", "strings", 6);