function Stage(el) {
  // Grab the elements from the dom
  this.el = document.getElementById(el);
  this.elOutput = document.getElementById("output-1");
  
  // Find the position of the stage element
  this.position();
  // Listen for events
  this.listeners();

  return this;
}

Stage.prototype.position = function() {
  var offset = this.offset();
  // Round down as we sometimes get a float value
  this.positionTop = Math.floor(offset.top);
  this.positionLeft = Math.floor(offset.left); 
};

Stage.prototype.offset = function() { 
  var _x, _y,
      el = this.el;
      
  // Check to see if bouding is available 
  if (typeof el.getBoundingClientRect !== "undefined") {
    return el.getBoundingClientRect();
  }else{
    _x = 0;
    _y = 0;
    
    // Go up the chain of parents of the element 
    // and add their offsets to the offset of our Stage element
    
    while(el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
      _x += el.offsetLeft;
      _y += el.offsetTop;
      el = el.offsetParent;
    }
    // Subtract any scrolling movment
    return { top: _y - window.scrollY, left: _x - window.scrollX };
  }
};

Stage.prototype.listeners = function() {
  var _self = this,
      output = this.elOutput;
  
  //  Listen for Resize's or Scrolling 
  //  which could change the position of our element and adjust.
  
  window.addEventListener('resize', function() {
    _self.position();
  }, false);

  window.addEventListener('scroll', function() {
    
    // In a real application you might not want to listen 
    // directly to do this on every scroll event.
    
    _self.position(true);
  }, false);

  this.el.addEventListener('mousemove', function(e) {
    // Subtract the elements position from the mouse event's x and y
    var x = e.clientX - _self.positionLeft,
        y = e.clientY - _self.positionTop;
    
    // Print out the coordinates
    output.innerHTML = (x + "," + y);

  }, false);
};

// Create a new Stage object, for a div with id of "stage"
var stage = new Stage("stage-1");