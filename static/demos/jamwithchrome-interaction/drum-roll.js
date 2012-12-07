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
  var _self = this,
      output = this.elOutput;

  window.addEventListener('resize', function() {
    _self.position();
  }, false);

  window.addEventListener('scroll', function() {
    _self.position(true);
  }, false);

  this.el.addEventListener('mousedown', function(e) {
    var x = e.clientX - _self.positionTop,
        y = e.clientY - _self.positionLeft;

    _self.hitZones.forEach(function(zone){
      _self.check(x, y, zone);
    });

  }, false);

  document.addEventListener('mouseup', function(e) {
    _self.hitZones.forEach(function(zone){
      zone.el.classList.remove('hit');
    });
  }, false);

  this.el.addEventListener('mousemove', function(e) {
    var x = e.clientX - _self.positionLeft,
        y = e.clientY - _self.positionTop;

    _self.hitZones.forEach(function(zone){
      _self.checkHover(x, y, zone);
    });        
  }, false);
};


Stage.prototype.addCircle = function(id) {
  var el = document.getElementById(id),
      rad = el.offsetWidth / 2,
      circ = new Circle(el.offsetLeft + rad, 
                        el.offsetTop + rad, 
                        rad
                      );
  circ.el = el;

  this.hitZones.push(circ);
  return circ;
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

Stage.prototype.checkHover = function(x, y, zone) {
  if (!zone.el) return;

  if (zone.inside(x, y)){
    this.el.classList.add('active');
  } else {
    this.el.classList.remove('active');
  }
};


function Circle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  return this;
}

Circle.prototype.inside = function(x,y) { 
  var dx = x - this.x,
      dy = y - this.y,
      r = this.radius;
  return dx*dx+dy*dy <= r*r;
}

var stage = new Stage("stage-3");
stage.addCircle("snare");