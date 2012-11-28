function Stage(id) {
    this.el = document.getElementById(id);
    this.position();
    this.listeners();
    this.hitZones = [];
    return this;
}

Stage.prototype = {
    position: function(){
        var offset = this.offset(this.el);
          this.positionTop = offset.left - window.scrollX;
          this.positionLeft = offset.top - window.scrollY;
    },
    offset: function(el){
          var _x = 0, _y = 0;
        while(el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft;
            _y += el.offsetTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    },
    listeners: function(){
        var _self = this,
            output = document.getElementById("output");

        window.addEventListener('resize', function(){
            _self.position();
        }, false);

        window.addEventListener('scroll', function(){
            _self.position();
        }, false);

        this.el.addEventListener('mousemove', function(e){
            var x = e.clientX - _self.positionTop,
                y = e.clientY - _self.positionLeft;

            output.innerHTML = (x + "," + y);

            _self.hitZones.forEach(function(zone){
                _self.check(x, y, zone);
            });

        }, false);
    },
    check: function(x, y, zone){
        if(!zone.el) return;

        if(zone.inside(x, y)){
            zone.el.classList.add('hit');
            this.el.classList.add('active');
        }else{
            zone.el.classList.remove('hit');
            this.el.classList.remove('active');
        }
    },
    addRect: function(id){
        var el = document.getElementById(id),
            rect = new Rect(el.offsetLeft, 
                            el.offsetTop, 
                            el.offsetWidth, 
                            el.offsetHeight  
                            );
        rect.el = el;

        this.hitZones.push(rect);
        return rect;
    }

}

function Rect(x, y, width, height, el) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.el = el || false;

    return this;
}

Rect.prototype = { 
    inside: function(x, y) {
      return x >= this.x && y >= this.y
          && x <= this.x + this.width
          && y <= this.y + this.height;
    },
    check: function(x, y){
        if(!this.el) return;

        if(this.inside(x, y)){
            this.el.classList.add('hit');
        }else{
            this.el.classList.remove('hit');
        }
    }
}

var stage = new Stage("stage-2");
stage.addRect("box");