function Stage(id) {
  this.el = document.getElementById(id);
  this.elOutput = document.getElementById("output-2");
  
  this.position();
  this.listeners();
  this.hitZones = [];
  return this;
}

Stage.prototype.position = function() {
  var offset = this.offset();
  this.positionTop = Math.floor(offset.left);
  this.positionLeft = Math.floor(offset.top);
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
  var _self = this,
      output = this.elOutput;

  window.addEventListener('resize', function(){
    _self.position();
  }, false);

  window.addEventListener('scroll', function(){
    _self.position(true);
  }, false);

  this.el.addEventListener('mousemove', function(e){
    var x = e.clientX - _self.positionTop,
       y = e.clientY - _self.positionLeft;

    output.innerHTML = (x + "," + y);

    _self.hitZones.forEach(function(zone){
      _self.check(x, y, zone);
    });

  }, false);
};

Stage.prototype.check = function(x, y, zone) {
  if (!zone.el) return;

  if (zone.inside(x, y)){
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

Rect.prototype.check = function(x,y) {
  if (!this.el) return;

  if (this.inside(x, y)) {
    this.el.classList.add('hit');
  } else {
    this.el.classList.remove('hit');
  }
};

var stage = new Stage("stage-2");
stage.addRect("box");