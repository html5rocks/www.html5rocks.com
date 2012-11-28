function Stage(el) {
        //-- Grab the element from the dom
        this.el = document.getElementById(el);
        //-- Fnd the position of the stage element
        this.position();
        //-- Listen for events
        this.listeners();

        return this;
    }

    Stage.prototype = {
        position: function(){
            //-- Get the position of the element in the window
            var offset = this.offset(this.el);

            //-- Subtract any scrolling movment
              this.positionTop = offset.left - window.scrollX;
              this.positionLeft = offset.top - window.scrollY;
        },
        offset: function(el){
              var _x = 0, _y = 0;
              //-- Go up the chain of parents of the element 
              //	 and add their offsets to the offset of our Stage element
            while(el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                _x += el.offsetLeft;
                _y += el.offsetTop;
                el = el.offsetParent;
            }
            return { top: _y, left: _x };
        },
        listeners: function(){
            var _self = this,
                output = document.getElementById("output-1");

            //-- Listen for Resize's or Scrolling 
            //   which could change the position of our element and adjust.

            window.addEventListener('resize', function(){
                _self.position();
            }, false);

            window.addEventListener('scroll', function(){
                //-- In a real application you might not want 
                //	 to listen directly to do this on every scroll event.
                _self.position();
            }, false);

            this.el.addEventListener('mousemove', function(e){
                //-- Subtract the elements position from the mouse event's x and y
                var x = e.clientX - _self.positionTop,
                    y = e.clientY - _self.positionLeft;

                //-- Print out the coordinates
                output.innerHTML = (x + "," + y);

            }, false);
        }
    }

    //-- Create a new Stage object, for a div with id of "stage"
    var stage = new Stage("stage-1");