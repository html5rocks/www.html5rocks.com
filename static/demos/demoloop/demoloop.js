//
//  +   +   +   +
//   \*/*\*/*\*/
//   |____O____| *-= THE GREAT KING OF DEMOS CHIMES IN =-*
//   /|(o) (o)|\
//  //|   U   |\\ [ WHAT IS THIS! ]
//   ||\ ___ /|| _/
//     |\___/|
//


DemoLoop = function(demos, container) {
  if (!demos) {
    throw(new Error('DemoLoop(demos, container) constructor called with no demos'));
  }
  if (!container) {
    throw(new Error('DemoLoop(demos, container) constructor called with no container'));
  }
  this.demos = demos;
  this.container = container;
  var self = this;
  this.animFrameFunc = function(){ self.processSnazzyFrame(); };
  this.preloadDemos();
  this.container.onmousemove = function(ev) {
     if (ev.clientY-this.offsetTop < self.demoMenuElement.offsetHeight + 20) {
       self.showMenu();
     } else {
       self.hideMenu();
     }
  };
  this.openWindows = [];
};

DemoLoop.prototype = {
  index : 0,
  preloadedIframes : [],
  fadeDelay : 3000,
  width: 1920,
  height: 1080,

  setInteractiveDemos : function(demos) {
    this.demoMenu = demos;
    this.demoMenuElement = DIV({id: 'demoMenu'});
    var self = this;
    var onclick = function(ev) {
      if (ev.target != this) return;
      self.stopDemoLoop();
      var cont = DIV({id: 'demoFrameContainer'});
      var iframe = IFRAME({src: this.href, className: 'demoFrame'});
      iframe.style.width = self.width-80 + 'px';
      iframe.style.height = self.height-60 + 'px';
      var closeButton = DIV('\u2297', {id: 'demoClose'});
      cont.append(iframe, closeButton);
      self.container.appendChild(cont);
      iframe.focus();
      closeButton.onclick = function(ev) {
        cont.style.opacity = 0;
        cont.removeChild(iframe);
        cont.removeChild(closeButton);
        setTimeout(function(){
          self.container.removeChild(cont);
        }, 800);
        self.restartDemoLoop();
        ev.preventDefault();
      };
      ev.preventDefault();
    };
    this.demoLinks = [];
    this.demoMenuElement.appendChild(H1("Pick a demo"));
    this.demoMenuElement.appendChild(BR());
    for (var i=0; i<this.demoMenu.length; i++) {
      var d = this.demoMenu[i];
      var e = DIV(
        P(
          DIV(
            IMG({
              src: d.image, width: 180,
              href: d.url,
              onclick: onclick
            }),
            { className: 'image' }
          ),
          A(
            d.name,
            {
              href: d.url,
              target: 'currentDemo',
              onclick: onclick
            }
          ),
          SPAN(T(d.author), {className:'author'}),
          SPAN(T(d.info), {className: 'info'})
        )
      );
      this.demoMenuElement.appendChild(e);
      this.demoLinks.push(e);
    }
    //this.demoMenuElement.style.display = 'none';
    this.hideMenu();
    this.container.appendChild(this.demoMenuElement);
  },

  showMenu : function() {
    if (this.paused) return;
    var self = this;
    if (this.fadeTimeout) clearTimeout(this.fadeTimeout);
    this.fadeTimeout = setTimeout(function(){ self.fadeoutMenu(); }, this.fadeDelay);
    //this.demoMenuElement.style.display = 'block';
    //this.demoMenuElement.style.top = '0px';
    //this.demoMenuElement.style.webkitTransform = 'rotateX(0deg)';
    this.demoMenuElement.style.backgroundColor = 'rgba(255,255,255,0.8)';
    this.demoMenuElement.style.opacity = 1;
    var h = this.demoMenuElement.firstChild;
    h.style.webkitTransform = 'rotateX(0deg)';
    h.style.opacity = 1;
    var iw = window.innerWidth;
    for (var i=0; i<this.demoLinks.length; i++) {
      var l = this.demoLinks[i];
      var d = Math.abs(iw/2 - l.offsetLeft);
      l.style.webkitTransitionDuration = 0.5 + d/1000 + 's';
      l.style.webkitTransform = 'rotateX(0deg)';
      l.style.opacity = 1;
    }
  },

  hideMenu: function() {
    this.fadeoutMenu();
  },

  fadeoutMenu : function() {
    //this.demoMenuElement.style.display = 'none';
    //this.demoMenuElement.style.top = '60px';
    //this.demoMenuElement.style.webkitTransform = 'rotateX(90deg)';
    //this.demoMenuElement.style.opacity = 0;
    this.demoMenuElement.style.backgroundColor = 'rgba(0,0,0,0)';
    var h = this.demoMenuElement.firstChild;
    h.style.webkitTransform = 'rotateX(-90deg)';
    h.style.opacity = 0;
    var iw = window.innerWidth;
    for (var i=0; i<this.demoLinks.length; i++) {
      var l = this.demoLinks[i];
      var d = Math.abs(iw/2 - l.offsetLeft);
      l.style.webkitTransitionDuration = 0.5 + d/1000 + 's';
      l.style.webkitTransform = 'rotateX(90deg)';
      l.style.opacity = 0;
    }
  },

  createIframe : function(src) {
    var iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.origSrc = src;
    var self = this;
    return iframe;
  },

  getDemoIframe : function(src, opt_w, opt_h) {
    var iframe = this.preloadedIframes[src];
    if (!iframe) {
      iframe = this.preloadedIframes[src] = this.createIframe(src);
    }
    iframe.style.opacity = 0;
    iframe.style.width = (opt_w || this.width) + 'px';
    iframe.style.height = (opt_h || this.height) + 'px';
    return iframe;
  },

  createRibbon : function(path, rot, rot2, color, offset, time_offset) {
    var pl = createPolyLineFromCubicBezierPath(
      path,
      500
    );
    var g = createSweepGeo(
      pl,
      [vec3(-0.1,0,0), vec3(0.1,0,0), vec3(0.1,0.01,0), vec3(-0.1,0.01,0)]
    );
    var vbo = new Magi.VBO(this.display.gl,
      {size:3, data:g.flatVertices},
      {size:3, data:g.flatNormals}
    );
    vbo.init();
    var m = new Magi.Node(vbo);
    m.rtime = 0;
    m.addFrameListener(function(t,dt) {
      this.rtime += Math.min(dt, 60);
      if (this.rtime-time_offset >= 4500) {
        var offset = Math.floor(Math.max((this.rtime-time_offset)-4500, 0)*24);
        this.model.length = Math.max(0, g.flatVertices.length/3 - offset);
        this.model.offset = offset;
      } else {
        this.model.offset = 0;
        this.model.length = Math.min(
          g.flatVertices.length/3,
          Math.floor(Math.max(this.rtime-time_offset, 0)*12)
        );
      }
    });
    m.setAngle(0.5 + rot2);
    m.setAxis(0,0,1);
    m.setScale(4);
    m.material = Magi.DefaultMaterial.get();
    m.material.floats.LightPos[0] = -1.5;
    m.material.floats.LightPos[1] = 2.8;
    m.material.floats.MaterialDiffuse =
      m.material.floats.MaterialSpecular = color;
    m.material.floats.LightAmbient = vec4(0.15,0.1,0.05,0.1);
    var pivot = new Magi.Node();
    pivot.setAngle(rot);
    pivot.position = offset;
    pivot.appendChild(m);
    return pivot;
  },

  ribbonIn : function() {
    if (this.ribbons != null) {
      this.ribbons.childNodes.forEach(function(c){
        c.childNodes[0].rtime = 0;
      });
      return;
    }
    var pivot = new Magi.Node();
    this.ribbons = pivot;
    pivot.setPosition(-4,-3.2,-5);
    pivot.appendChild(this.createRibbon(
      [vec3(0,0,0), vec3(0,0,0.5), vec3(0,1,1), vec3(0,1,2.5)],
      1.0, 0.0, vec4(1,1,0.1,1),
      vec3(0,-0.25,0), 100
    ));
    pivot.appendChild(this.createRibbon(
      [vec3(0,0,0), vec3(0,0,0.5), vec3(0,0.8,1), vec3(0,0.8,2.5)],
      1.0, -0.1, vec4(0.1,1,0.1,1),
      vec3(0,-0.0,0.5), 400
    ));
    pivot.appendChild(this.createRibbon(
      [vec3(0,0,0), vec3(0,0,0.5), vec3(0,1.05,1), vec3(0,1.05,2.5)],
      1.1, 0.1, vec4(0.1,0.1,1,1),
      vec3(0.2,0.65,0), 0
    ));
    pivot.appendChild(this.createRibbon(
      [vec3(0,0,0), vec3(0,0,0.5), vec3(0,1,1), vec3(0,1,2.5)],
      1.1, 0.0, vec4(1,0.1,0.1,1),
      vec3(0,0.4,0.3), 200
    ));

    this.display.scene.appendChild(pivot);
    this.ribbons.childNodes.forEach(function(c){
      c.childNodes[0].rtime = 0;
    });
  },

  ribbonOut : function() {
  },

  processSnazzyFrame : function() {
    if (this.paused) {
      this.transitionCanvas.style.display = 'none';
      this.display.paused = true;
      return;
    }
    var t = new Date().getTime();
    var n = this.currentDemo.node;
    if (this.animStartTime == null) {
      this.animStartTime = this.previousTime = t;
      n.nameText.firstRunDone = n.authorText.firstRunDone = n.authorImage.firstRunDone = false;
      n.nameText.startTime =
      n.authorText.startTime =
      n.authorImage.startTime = this.previousTime;
    }
    var dt = t-this.previousTime;
    this.previousTime = t;

    var ctx = this.transitionCtx;
    var animTime = t - this.animStartTime;

    var w = this.transitionCanvas.width;
    var h = this.transitionCanvas.height;

    this.animating = animTime <= 6000;
    var n = this.currentDemo.node;
    if (animTime > 5000) {
      n.authorInfo.targetAngle = -Math.PI/2;
      this.display.camera.position[2] = 4 + (6000 - animTime)/1000;
      n.nameText.childNodes[0].alignedNode.material.floats.opacity =
      n.authorText.childNodes[0].alignedNode.material.floats.opacity =
      n.authorText.childNodes[1].childNodes[0].alignedNode.material.floats.opacity =
      n.authorImage.alignedNode.material.floats.opacity =
        Math.max(((5800-animTime)/800), 0);
      this.ribbonOut();
      this.transitionCanvas.style.opacity =
        n.authorImage.alignedNode.material.floats.opacity;
    } else {
      this.display.camera.position[2] = 5;
      this.transitionCanvas.style.opacity = 1;
      n.nameText.childNodes[0].alignedNode.material.floats.opacity =
      n.authorText.childNodes[0].alignedNode.material.floats.opacity =
      n.authorText.childNodes[1].childNodes[0].alignedNode.material.floats.opacity =
      n.authorImage.alignedNode.material.floats.opacity = Math.min(animTime/500, 1);
    }
    if (animTime > 1200 && animTime <= 4200 && this.cxpHidden) {
      var cxp = byId('chromeexperiments');
      this.cxpHidden = false;
      cxp.style.webkitTransitionTimingFunction = 'ease-out';
      cxp.style.bottom = '6px';
      cxp.style.right = '10px';
      cxp.style.opacity = '1';
    } else if (animTime > 4200 && !this.cxpHidden) {
      this.cxpHidden = true;
      var cxp = byId('chromeexperiments');
      cxp.style.webkitTransitionTimingFunction = 'ease-in';
      cxp.style.bottom = '6px';
      cxp.style.right = '40px';
      cxp.style.opacity = '0';
    }
    if (this.animating) {
      this.transitionCanvas.style.display = 'block';
    } else {
      var cxp = byId('chromeexperiments');
      cxp.style.bottom = '6px';
      cxp.style.right = '40px';
      this.transitionCanvas.style.display = 'none';
      this.display.paused = true;
      if (!this.currentIframe.parentNode)
        this.container.appendChild(this.currentIframe);
      if (this.currentIframe.contentWindow)
        this.currentIframe.contentWindow.postMessage('play','*');
      var self = this;
      setTimeout(function(){
        self.currentIframe.style.opacity = 1;
      }, 0);
    }
    this.display.gl.finish();
  },

  createChromeExperimentsTitle : function() {
    var cexp = DIV('Chrome Experiments');
    this.cxpHidden = true;
    cexp.id = "chromeexperiments";
    cexp.style.bottom = '6px';
    cexp.style.right = '40px';
    cexp.style.opacity = '0';
    cexp.style.position = 'absolute';
    cexp.style.zIndex = '100';
    cexp.style.color = 'black';
    cexp.style.fontFamily = 'sans-serif';
    cexp.style.fontSize = '30px';
    cexp.style.margin = '4px';
    cexp.style.webkitTransitionDuration = '0.5s';
    return cexp;
  },

  resize : function(w,h) {
    this.width = w;
    this.height = h;
    var dc = this.transitionCanvas;
    if (dc) {
      dc.width = this.width;
      dc.height = this.height;
    }
    if (this.currentIframe) {
      this.currentIframe.style.width = this.width + 'px';
      this.currentIframe.style.height = this.height + 'px';
    }
  },

  doSnazzyShowInfo : function() {
    var di = this.demoInfoElement;
    di.style.display = 'block';
    if (!this.transitionCanvas) {
      this.transitionCanvas = document.createElement('canvas');
      this.display = new Magi.Scene(this.transitionCanvas);
      var self = this;
      this.display.scene.addFrameListener(function(t,dt) {
        self.processSnazzyFrame();
      }, false);
      this.display.bg = [1,1,1,1];
      vec3.setLeft(this.display.camera.position, [0,0,5]);
      var s = this.display.scene;
      this.demoInfoElement.appendChild(this.transitionCanvas);
      this.demoInfoElement.appendChild(this.createChromeExperimentsTitle());
    }

    this.resize(this.width, this.height);

    if (this.previousDemo)
      this.display.scene.removeChild(this.previousDemo.node);
    this.display.scene.appendChild(this.currentDemo.node);

    this.animating = true;
    this.previousTime = new Date().getTime();
    this.animStartTime = null;
    this.display.paused = false;
    this.transitionCanvas.style.display = 'block';

    var t = this.currentDemo.node;
    t.authorInfo.targetAngle = Math.PI/8;
    t.authorInfo.setScale(1);
    t.authorInfo.setX(-1400);
    t.authorInfo.setY(620);
    t.nameText.setPosition(0,0,1000);
    t.authorText.setPosition(0,0,1000);
    t.authorImage.setPosition(0,0,1000);
    vec3.setLeft(t.nameText.targetPosition, vec3(0,0,0));
    vec3.setLeft(t.authorText.targetPosition, vec3(0,0,0));
    vec3.setLeft(t.authorImage.targetPosition, vec3(0,0,0));

    this.ribbonIn();
  },

  gotoDemo : function(demo) {
    this.previousDemo = this.currentDemo;
    this.currentDemo = demo;
    var iframe = this.getDemoIframe(demo.url);
    var transition = false;
    if (this.currentIframe) {
      this.previousIframe = this.currentIframe;
    }
    this.currentIframe = iframe;
    this.currentIframe.style.display = 'block';
    if (this.demoInfoElement)
      this.doSnazzyShowInfo();
    var self = this;
    setTimeout(function() {
      if (self.previousIframe && self.previousIframe != self.currentIframe) {
        self.previousIframe.style.display = 'none';
        if (self.previousIframe.contentWindow)
          self.previousIframe.contentWindow.postMessage('pause','*');
        self.demos.forEach(function(d) {
          var iframe = self.getDemoIframe(d.url);
          if (iframe != self.currentIframe) {
            if (iframe.contentWindow)
              iframe.contentWindow.postMessage('pause','*');
            iframe.style.display = 'none';
          }
        });
      }
    }, 0);
  },

  roundRect : function(img) {
    var c = E.canvas(1008, 1008);
    var ctx = c.getContext('2d');
    var r2d = Math.PI/180;
    var sx = 4, sy = 4, ex = 1000+4-1, ey = 1000+4-1, r = 1000/10;
    ctx.beginPath();
    ctx.moveTo(sx+r,sy);
    ctx.lineTo(ex-r,sy);
    ctx.arc(ex-r,sy+r,r,r2d*270,r2d*360,false);
    ctx.lineTo(ex,ey-r);
    ctx.arc(ex-r,ey-r,r,r2d*0,r2d*90,false);
    ctx.lineTo(sx+r,ey);
    ctx.arc(sx+r,ey-r,r,r2d*90,r2d*180,false);
    ctx.lineTo(sx,sy+r);
    ctx.arc(sx+r,sy+r,r,r2d*180,r2d*270,false);
    ctx.closePath();
    ctx.clip();
    var f = Math.max(1000/img.width, 1000/img.height);
    ctx.drawImage(
      img,
      0,0, img.width, img.height,
      4,4, Math.ceil(img.width*f), Math.ceil(img.height*f)
    );
    return c;
  },

  preloadDemo : function(demo) {
    var iframe = this.getDemoIframe(demo.url);
    demo.img = new Image();
    var self = this;
    demo.img.onload = function() {
      var r = self.roundRect(this);
      t.authorImage.setImage(r);
      t.authorImage.setScale(1000/r.height);
    };
    demo.img.src = demo.image || 'HTML5Logo/author.jpg';
    var t = new Magi.Node();

    var txt = new Magi.Text(demo.name, 100, '#000', 'Sans-serif').setY(440).setScale(1.5);
    txt.setAlign(txt.leftAlign, txt.topAlign);
    var n = new Magi.Node();
    n.appendChild(txt);
    t.nameText = n;

    txt = new Magi.Text(demo.author, 80, '#000', 'Sans-serif');
    txt.setAlign(txt.leftAlign, txt.topAlign).setY(260).setScale(1.5);
    n = new Magi.Node();
    n.appendChild(txt);
    t.authorText = n;

    txt = new Magi.Text(demo.info, 40, '#222', 'Sans-serif');
    txt.setAlign(txt.leftAlign, txt.topAlign);
    txt.setY(120).setScale(1.5);
    n = new Magi.Node();
    n.appendChild(txt);
    t.infoText = n;
    t.authorText.appendChild(n);


    t.authorImage = new Magi.Image(demo.img).setAlign(txt.leftAlign, txt.topAlign);
    var img = t.authorImage;

    var d = vec3();
    t.authorImage.startTime = t.authorText.startTime = t.nameText.startTime = 0;
    t.authorImage.tweenDuration =
      t.authorText.tweenDuration =
      t.nameText.tweenDuration = 500;
    t.authorImage.tweenTimeOffset = 0;
    t.authorText.tweenTimeOffset = 0;
    t.nameText.tweenTimeOffset = 0;
    t.authorImage.targetPosition = vec3(0,0,0);
    t.authorText.targetPosition = vec3(0,0,0);
    t.nameText.targetPosition = vec3(0,0,0);
    var tweener = function(t,dt){
      var elapsed = (new Date().getTime())-this.startTime;
      elapsed -= this.tweenTimeOffset;
      var f = Math.min(1, elapsed / this.tweenDuration);
      if (f < 0) return;
      if (f == 1) {
        if (this.tweening || !this.firstRunDone) {
          this.startPosition = null;
          vec3.set(this.targetPosition, this.position);
          this.firstRunDone = true;
        }
        this.tweening = false;
      } else {
        if (!this.tweening) {
          this.startPosition = vec3(this.position);
        }
        this.tweening = true;
        f = f*f;
        vec3.sub(this.targetPosition, this.startPosition, d);
        vec3.scale(d, f, d);
        vec3.add(this.startPosition, d, this.position);
      }
    };
    t.authorText.addFrameListener(tweener);
    t.nameText.addFrameListener(tweener);
    t.authorImage.addFrameListener(tweener);

    var tt = new Magi.Node();
    tt.rotation.angle = Math.PI/8;
    tt.appendChild(t.nameText);
    tt.appendChild(t.authorText);
    t.appendChild(tt);
    tt.appendChild(t.authorImage);
    t.authorInfo = tt;
    t.setScale(1/600);
    t.setX(0.25);
    t.setY(-0.5);
    demo.node = t;
    var c = this.container;
  },

  preloadDemos : function() {
    for (var i=0; i<this.demos.length; i++) {
      this.preloadDemo(this.demos[i]);
    }
  },

  gotoCurrentDemo : function(){
    this.gotoDemo(this.demos[this.index]);
  },

  previous : function() {
    this.index = (this.index-1) % this.demos.length;
    if (this.index < 0) {
      this.index = this.demos.length + this.index;
    }
    this.gotoCurrentDemo();
  },

  next : function() {
    this.index = (this.index+1) % this.demos.length;
    this.gotoCurrentDemo();
  },

  stopDemoLoop : function() {
    if (this.currentIframe && this.currentIframe.contentWindow)
      this.currentIframe.contentWindow.postMessage('pause','*');
    if (this.currentIframe)
      this.currentIframe.style.display = 'none';
    if (this.previousIframe)
      this.previousIframe.style.display = 'none';
    this.paused = true;
  },

  restartDemoLoop : function() {
    if (this.restartTimeout)
      clearTimeout(this.restartTimeout);
    var self = this;
    this.restartTimeout = setTimeout(function() {
      self.paused = false;
      if (self.demoFadeoutTimeout)
        clearTimeout(self.demoFadeoutTimeout);
      if (self.advanceTimeout)
        clearTimeout(self.advanceTimeout);
      self.demoFadeoutTimeout = setTimeout(function(){
        self.currentIframe.style.opacity = 0;
      }, (self.currentDemo.duration+6-1) * 1000);
      self.advanceTimeout = setTimeout(function(){
        self.advanceDemoLoop();
      }, (self.currentDemo.duration+6) * 1000);
      self.gotoCurrentDemo();
    }, 1000);
  },

  startDemoLoop : function() {
    this.index = -1;
    if (this.preloadWaitDone || true) {
      this.advanceDemoLoop();
    } else {
      this.preloadWaitDone = true;
      var loading = H1('Loading...');
      this.container.appendChild(loading);
      var self = this;
      this.demos.forEach(function(d) {
        self.container.appendChild(self.getDemoIframe(d.url));
      });
      setTimeout(function() {
        self.demos.forEach(function(d) {
          var iframe = self.getDemoIframe(d.url);
          iframe.contentWindow.postMessage('pause','*');
          iframe.style.display = 'none';
        });
        setTimeout(function() {
          self.container.removeChild(loading);
          self.advanceDemoLoop();
        }, 0);
      }, 10000);
    }
  },

  advanceDemoLoop : function() {
    if (this.paused) return;
    this.next();
    if (this.demoFadeoutTimeout)
      clearTimeout(this.demoFadeoutTimeout);
    if (this.advanceTimeout)
      clearTimeout(this.advanceTimeout);
    var self = this;
    this.demoFadeoutTimeout = setTimeout(function(){
      self.currentIframe.style.opacity = 0;
    }, (this.currentDemo.duration+6-1) * 1000);
    this.advanceTimeout = setTimeout(function(){
      self.advanceDemoLoop();
    }, (this.currentDemo.duration+6) * 1000);
  }
};

