SimpleFullscreenControl = function() {
  var that = this;
  this.element = undefined;
  this.changeCallback = function() {
    that.fullscreenChange();
  }
}

SimpleFullscreenControl.prototype.enterFullscreenHook = function(element) {
  console.log('overload enterFullscreenHook');
}

SimpleFullscreenControl.prototype.leaveFullscreenHook = function(element) {
  console.log('overload leaveFullscreenHook');
}

SimpleFullscreenControl.prototype.attach = function(divId) {
  if (this.element != undefined) {
    detach();
  }
  this.element = document.getElementById(divId);
  if (this.element == null) {
    this.element = undefined;
    console.log('could not find ' + divId + 'did not attach full screen control.');
    return;
  }
  document.addEventListener('fullscreenchange', this.changeCallback, false);
  document.addEventListener('mozfullscreenchange', this.changeCallback, false);
  document.addEventListener('webkitfullscreenchange', this.changeCallback, false);
}

SimpleFullscreenControl.prototype.detach = function() {
  this.leaveFullscreen();
  this.element = undefined;
  document.removeEventListener('fullscreenchange', this.changeCallback, false);
  document.removeEventListener('mozfullscreenchange', this.changeCallback, false);
  document.removeEventListener('webkitfullscreenchange', this.changeCallback, false);
}

SimpleFullscreenControl.prototype.fullscreenChange = function() {
  if (document.webkitFullscreenElement === this.element ||
    document.mozFullscreenElement === this.element ||
    document.mozFullScreenElement === this.element) {
    this.enterFullscreenHook(this.element);
  } else {
    this.leaveFullscreenHook(this.element);
  }
}

SimpleFullscreenControl.prototype.enterFullscreen = function() {
  this.element.requestFullscreen = this.element.requestFullscreen    ||
                   this.element.mozRequestFullscreen ||
                   this.element.webkitRequestFullscreen;
  this.element.requestFullscreen();
}

SimpleFullscreenControl.prototype.leaveFullscreen = function() {
  document.webkitCancelFullScreen();
}

SimplePointerLockControl = function() {
  var that = this;
  this.element = undefined;
  this.changeCallback = function() {
    that.pointerLockChange();
  }
  this.moveCallback = function(e) {
    var movementX = e.movementX       ||
                    e.mozMovementX    ||
                      e.webkitMovementX ||
                      0,
          movementY = e.movementY       ||
                      e.mozMovementY    ||
                      e.webkitMovementY ||
                      0;
    that.pointerMoveHook(movementX, movementY);
  }
}

SimplePointerLockControl.prototype.lockHook = function(element) {
  console.log('overload lockHook');
}

SimplePointerLockControl.prototype.unlockHook = function(element) {
  console.log('overload unlockHook');
}

SimplePointerLockControl.prototype.pointerMoveHook = function(x, y) {
  console.log('overload pointerMoveHook -- (' + x + ',' + y + ')');
}

SimplePointerLockControl.prototype.attach = function(divId) {
  if (this.element != undefined) {
    this.detach();
  }
  this.element = document.getElementById(divId);
  if (this.element == null) {
    this.element = undefined;
    console.log('could not find ' + divId + 'did not attach pointer lock control.');
    return;
  }
  document.addEventListener('pointerlockchange', this.changeCallback, false);
  document.addEventListener('mozpointerlockchange', this.changeCallback, false);
  document.addEventListener('webkitpointerlockchange', this.changeCallback, false);
}

SimplePointerLockControl.prototype.detach = function() {
  this.unlock();
  this.element = undefined;
  document.removeEventListener('pointerlockchange', this.changeCallback, false);
  document.removeEventListener('mozpointerlockchange', this.changeCallback, false);
  document.removeEventListener('webkitpointerlockchange', this.changeCallback, false);

}

SimplePointerLockControl.prototype.pointerLockChange = function() {
  if (document.mozPointerLockElement === this.element ||
    document.webkitPointerLockElement === this.element) {
    this.lockHook(this.element);
    document.addEventListener("mousemove", this.moveCallback, false);
  } else {
    document.removeEventListener("mousemove", this.moveCallback, false);
    this.unlockHook(this.element);
  }
}

SimplePointerLockControl.prototype.lock = function() {
  this.element.requestPointerLock = this.element.requestPointerLock    ||
                    this.element.mozRequestPointerLock ||
                    this.element.webkitRequestPointerLock;
  this.element.requestPointerLock();
}

SimplePointerLockControl.prototype.unlock = function() {
  document.webkitExitPointerLock();
}

SimplePointerLockControl.prototype.islocked = function() {
  return document.webkitPointerLockElement == this.element;
}

installHooks = function() {
  window.simpleFullscreenControl.enterFullscreenHook = function(element) {
    console.log('booting out of fullscreen');
    window.simpleFullscreenControl.leaveFullscreen();
  }

  window.simpleFullscreenControl.leaveFullscreenHook = function(element) {
    console.log('out of fullscreen');
  }
  window.simplePointerLockControl.lockHook = function(element) {
    //window.simplePointerLockControl.unlock();
    this.element.innerHTML = '<p class="notice">(0, 0)</p>';
  }
  window.simplePointerLockControl.unlockHook = function(element) {
    var html = '<p class="notice">Click me!</p>'
    this.element.innerHTML = html;
  }
  window.simplePointerLockControl.pointerMoveHook = function(x, y) {
    var html = '<p class="notice">(' + x + ',' + y + ')</p>';
    this.element.innerHTML = html;
  }
}

installEvents = function(divId) {
  var element = document.getElementById(divId);
  if (element == null) {
    console.log('could not find ' + divId + 'could not install click handler');
    return;
  }
  element.addEventListener('click', function() {
    window.simplePointerLockControl.lock();
  }, false);
  console.log('installed click handler in ' + divId);
}


dumpShaderProgram = function(webGL, sp) {
  var attributes = webGL.getProgramParameter(sp, webGL.ACTIVE_ATTRIBUTES);
  var uniforms = webGL.getProgramParameter(sp, webGL.ACTIVE_UNIFORMS);
  for (var i = 0; i < attributes; i++) {
    var attribute = webGL.getActiveAttrib(sp, i);
    console.log('Active Attribute ' + i);
    console.log(attribute);
  }
  for (var i = 0; i < uniforms; i++) {
    var uniform = webGL.getActiveUniform(sp, i);
    console.log('Active Uniform ' + i);
    console.log(uniform);
  }
}

FPSController = function() {
  this.forwardKey = false;
  this.backwardKey = false;
  this.leftKey = false;
  this.rightKey = false;
  this.webGL = null;
  this.captureKeys = false;
}

FPSController.prototype.animateCallback = function(t) {
  var that = this;
  if (this.lastAnimationTime == undefined) {
    this.lastAnimationTime = t;
    return;
  }
  var dt = t - this.lastAnimationTime;
  this.lastAnimationTime = t;
  var color = t % 256;
  this.webGL.viewport(0, 0, 640, 480);
  this.webGL.clearColor(0.0, 0.0, 0.0, 1.0);
  this.webGL.clearDepth(1.0);
  this.webGL.clear(this.webGL.COLOR_BUFFER_BIT|this.webGL.DEPTH_BUFFER_BIT);
  this.webGL.disable(this.webGL.DEPTH_TEST);
  this.webGL.lineWidth(2.0);
  if (this.moveEnabled) {
    this.moveView(this.forwardKey, this.backwardKey, this.leftKey, this.rightKey, dt / 1000.0); 
  }
  this.viewMatrix = mat4.lookAt(this.eyePoint, this.lookAtPoint, this.upVector);
  this.projectionViewMatrix = mat4.create();
  mat4.multiply(this.projectionMatrix, this.viewMatrix, this.projectionViewMatrix);
  this.drawGrid();
}

FPSController.prototype.lockHook = function(element) {
  var that = this;
  document.onkeydown = function(e) { that.keydownHook(e); };
  document.onkeyup = function(e) { that.keyupHook(e); };
}

FPSController.prototype.unlockHook = function(element) {
}

FPSController.prototype.moveHook = function(x, y) {
  this.rotateView(x, y);
}

FPSController.prototype.clickHook = function() {
  this.pointerLockControl.lock();
}

FPSController.prototype.rotateViewAround = function(deltaAngle, axis) {
  var frontDirection = vec3.create();
  vec3.subtract(this.lookAtPoint, this.eyePoint, frontDirection);
  vec3.normalize(frontDirection);
  var q = quat4.create();
  quat4.fromAngleAxis(deltaAngle, axis, q);
  quat4.multiplyVec3(q, frontDirection);
  this.lookAtPoint = vec3.create(this.eyePoint);
  vec3.add(this.lookAtPoint, frontDirection);
}

FPSController.prototype.rotateView = function(x, y) {
  var frontDirection = vec3.create();
  var strafeDirection = vec3.create();
  vec3.subtract(this.lookAtPoint, this.eyePoint, frontDirection);
  vec3.normalize(frontDirection);
  vec3.cross(frontDirection, this.upVector, strafeDirection);
  vec3.normalize(strafeDirection);
  if (this.yawEnabled) {
    this.rotateViewAround(-x/360.0, this.upVector); 
  }
  if (this.pitchEnabled) {
    this.rotateViewAround(-y/360.0, strafeDirection); 
  }
  
}

FPSController.prototype.moveView = function(w,s,a,d, dt) {
  var frontDirection = vec3.create();
  var strafeDirection = vec3.create();
  vec3.subtract(this.lookAtPoint, this.eyePoint, frontDirection);
  vec3.normalize(frontDirection);
  vec3.cross(frontDirection, this.upVector, strafeDirection);
  vec3.normalize(strafeDirection);

  var forwardScale = 0.0;
  var strafeScale = 0.0;

  if (w) {
    forwardScale += 1.0;
  }
  if (s) {
    forwardScale -= 1.0;
  }
  if (a) {
    strafeScale -= 1.0;
  }
  if (d) {
    strafeScale += 1.0;
  }


  var velocity = 2.0 * dt;

  forwardScale *= velocity;
  strafeScale *= velocity;

  vec3.scale(frontDirection, forwardScale);
  vec3.scale(strafeDirection, strafeScale);

  vec3.add(this.eyePoint, frontDirection);
  vec3.add(this.eyePoint, strafeDirection);
  vec3.add(this.lookAtPoint, frontDirection);
  vec3.add(this.lookAtPoint, strafeDirection);
}

FPSController.prototype.drawGrid = function() {
  var webGL = this.webGL;

  webGL.enableVertexAttribArray(0);
  webGL.enableVertexAttribArray(1);
  webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.gridVertexBuffer);
  webGL.vertexAttribPointer(0, 4, webGL.FLOAT, false, 28, 12);
  webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.gridVertexBuffer);
  webGL.vertexAttribPointer(1, 3, webGL.FLOAT, false, 28, 0);
  var cameraTransformUniformIndex = webGL.getUniformLocation(this.gridShaderProgram, 'cameraTransform');
  webGL.useProgram(this.gridShaderProgram);
  webGL.uniformMatrix4fv(cameraTransformUniformIndex, false, this.projectionViewMatrix);
  webGL.drawArrays(webGL.LINES, 0, this.numPoints);
  webGL.disableVertexAttribArray(0);
  webGL.disableVertexAttribArray(1);
  webGL.flush();
}

FPSController.prototype.prepare = function() {
  this.upVector = vec3.create([0.0, 1.0, 0.0]);
  this.eyePoint = vec3.create([1.0, 1.0, -1.0]);
  this.lookAtPoint = vec3.create([2.0, 1.0, -2.0]);
  // Projection matrix
  this.projectionMatrix = mat4.perspective(45.0, 640.0/480.0, 1.0, 50.0);
  // View matrix
  this.viewMatrix = mat4.lookAt(this.eyePoint, this.lookAtPoint, this.upVector);
  this.projectionViewMatrix = mat4.create();
  mat4.multiply(this.projectionMatrix, this.viewMatrix, this.projectionViewMatrix);
  console.log(this.projectionViewMatrix);

  // Skybox data
  this.skyboxTexture = this.webGL.createTexture();
  this.gridVertexBuffer = this.webGL.createBuffer();

  // Grid data
  this.webGL.bindBuffer(this.webGL.ARRAY_BUFFER, this.gridVertexBuffer);
  var gridData = [];
  this.numPoints = 0;
  for (var i = 0; i <= 20; i++) {
    var x = i * 1.0;
    var y = 0.0;
    var z0 = 0.0;
    var z1 = -20.0;
    var r = 0.0;
    var g = 1.0;
    var b = 0.0;
    var a = 1.0;
    gridData.push(x);
    gridData.push(y);
    gridData.push(z0);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);

    this.numPoints++;
    gridData.push(x);
    gridData.push(y);
    gridData.push(z1);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

  for (var i = 0; i <= 20; i++) {
    var x0 = 0.0;
    var x1 = 20.0;
    var y = 0.0;
    var z = i * -1.0;
    var r = 0.0;
    var g = 1.0;
    var b = 0.0;
    var a = 1.0;
    gridData.push(x0);
    gridData.push(y);
    gridData.push(z);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
    gridData.push(x1);
    gridData.push(y);
    gridData.push(z);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

  for (var i = 0; i <= 20; i++) {
    var x = 20.0;
    var y0 = 0.0;
    var y1 = 20.0;
    var z = i * -1.0;
    var r = 0.65;
    var g = 0.17;
    var b = 0.17;
    var a = 1.0;
    gridData.push(x);
    gridData.push(y0);
    gridData.push(z);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);

    this.numPoints++;
    gridData.push(x);
    gridData.push(y1);
    gridData.push(z);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

  for (var i = 0; i <= 20; i++) {
    var x = 20.0;
    var y = i * 1.0;
    var z0 = 0.0;
    var z1 = -20.0;
    var r = 0.65;
    var g = 0.17;
    var b = 0.17;
    var a = 1.0;
    gridData.push(x);
    gridData.push(y);
    gridData.push(z0);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
    gridData.push(x);
    gridData.push(y);
    gridData.push(z1);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

    for (var i = 0; i <= 20; i++) {
    var x = i * 1.0;
    var y0 = 0.0;
    var y1 = 20.0;
    var z = -20.0;
    var r = 0.65;
    var g = 0.6;
    var b = 0.3;
    var a = 1.0;
    gridData.push(x);
    gridData.push(y0);
    gridData.push(z);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);

    this.numPoints++;
    gridData.push(x);
    gridData.push(y1);
    gridData.push(z);

    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

  for (var i = 0; i <= 20; i++) {
    var x0 = 0.0;
    var x1 = 20.0;
    var y = i * 1.0;
    var z = -20.0;
    var r = 0.65;
    var g = 0.6;
    var b = 0.3;
    var a = 1.0;
    gridData.push(x0);
    gridData.push(y);
    gridData.push(z);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
    gridData.push(x1);
    gridData.push(y);
    gridData.push(z);
    gridData.push(r);
    gridData.push(g);
    gridData.push(b);
    gridData.push(a);
    this.numPoints++;
  }

  this.webGL.bufferData(this.webGL.ARRAY_BUFFER, new Float32Array(gridData), this.webGL.STATIC_DRAW);

  // Grid program
  this.gridVertexShader = this.webGL.createShader(this.webGL.VERTEX_SHADER);
  this.gridFragmentShader = this.webGL.createShader(this.webGL.FRAGMENT_SHADER);
  this.webGL.shaderSource(this.gridVertexShader, '' +
    'precision highp float;'+
    'attribute vec3 vPosition;'+
    'attribute vec4 vColor;'+
    'uniform mat4 cameraTransform;'+
    'varying vec4 fColor;'+
    'void main() {'+
        'fColor = vColor;'+
        'vec4 vPosition4 = vec4(vPosition.x, vPosition.y, vPosition.z, 1.0);'+
        'gl_Position = cameraTransform*vPosition4;'+
    '}');
  this.webGL.compileShader(this.gridVertexShader);
  console.log('Log from vertexShader: ' + this.webGL.getShaderInfoLog(this.gridVertexShader));
  this.webGL.shaderSource(this.gridFragmentShader, '' +
    'precision mediump float;'+
    'varying vec4 fColor;'+
    'void main() {'+
        'gl_FragColor = fColor;'+
    '}');
  this.webGL.compileShader(this.gridFragmentShader);
  console.log('Log from fragmentShader: ' + this.webGL.getShaderInfoLog(this.gridFragmentShader));

  console.log('Vertex Shader Type: ' + this.webGL.getShaderParameter(this.gridVertexShader, this.webGL.SHADER_TYPE));
  console.log('Fragment Shader Type: ' + this.webGL.getShaderParameter(this.gridFragmentShader, this.webGL.SHADER_TYPE));

  console.log('Vertex Shader Compiled: ' + this.webGL.getShaderParameter(this.gridVertexShader, this.webGL.COMPILE_STATUS));
  console.log('Fragment Shader Compiled: ' + this.webGL.getShaderParameter(this.gridFragmentShader, this.webGL.COMPILE_STATUS));

  this.gridShaderProgram = this.webGL.createProgram();
  this.webGL.attachShader(this.gridShaderProgram, this.gridVertexShader);
  this.webGL.attachShader(this.gridShaderProgram, this.gridFragmentShader);
  this.webGL.linkProgram(this.gridShaderProgram);
  this.webGL.validateProgram(this.gridShaderProgram);
  console.log('Log from shaderProgram: ' + this.webGL.getProgramInfoLog(this.gridShaderProgram));
  dumpShaderProgram(this.webGL, this.gridShaderProgram);
}

FPSController.prototype.keydownHook = function(event) {
  if (this.pointerLockControl.islocked()) {
    var keyCode = event.keyCode;
    if (keyCode == 87) {
      this.forwardKey = true;
    }
    if (keyCode == 83) {
      this.backwardKey = true;
    }
    if (keyCode == 65) {
      this.leftKey = true;
    }
    if (keyCode == 68) {
      this.rightKey = true;
    }
  }
  
}

FPSController.prototype.keyupHook = function(event) {
  if (this.pointerLockControl.islocked()) {
    var keyCode = event.keyCode;
    if (keyCode == 87) {
      this.forwardKey = false;
    }
    if (keyCode == 83) {
      this.backwardKey = false;
    }
    if (keyCode == 65) {
      this.leftKey = false;
    }
    if (keyCode == 68) {
      this.rightKey = false;
    }
  }
}

var globalState = {
  'views': []
}

animateCallback = function(t) {
  for (var i = 0; i < globalState.views.length; i++) {
    globalState.views[i].animateCallback(t);
  }
  window.requestAnimationFrame(animateCallback);  
}

addView = function(canvasId, moveEnabled, yawEnabled, pitchEnabled) {
  var canvasElement = document.getElementById(canvasId);
  canvasElement.width = 640;
  canvasElement.height = 480;
  canvasElement.controller = new FPSController();
  canvasElement.controller.moveEnabled = moveEnabled;
  canvasElement.controller.yawEnabled = yawEnabled;
  canvasElement.controller.pitchEnabled = pitchEnabled;
  canvasElement.controller.webGL = canvasElement.getContext("experimental-webgl");
  window.requestAnimationFrame(function(t) { canvasElement.controller.animateCallback(t); });
  canvasElement.controller.pointerLockControl = new SimplePointerLockControl();
  canvasElement.controller.pointerLockControl.attach(canvasId);
  canvasElement.controller.pointerLockControl.lockHook = function(e) { canvasElement.controller.lockHook(e); };
  canvasElement.controller.pointerLockControl.unlockHook = function(e) { canvasElement.controller.unlockHook(e); };
  canvasElement.controller.pointerLockControl.pointerMoveHook = function(x, y) { canvasElement.controller.moveHook(x, y); };
  canvasElement.addEventListener('click', function(e) { canvasElement.controller.clickHook(e); }, false);
  canvasElement.controller.prepare();

  globalState.views.push(canvasElement.controller); 
}

pointerLockMain = function() {
  window.simpleFullscreenControl = new SimpleFullscreenControl();
  window.simpleFullscreenControl.attach('simple-pointer-lock');
  window.simplePointerLockControl = new SimplePointerLockControl();
  window.simplePointerLockControl.attach('simple-pointer-lock');
  installHooks();
  installEvents('simple-pointer-lock');
  window.requestAnimationFrame = window.requestAnimationFrame       || 
                        window.webkitRequestAnimationFrame || 
                        window.mozRequestAnimationFrame    || 
                        window.oRequestAnimationFrame      || 
                        window.msRequestAnimationFrame;

    addView('webGLFrontBufferMovement', true, false, false);
    addView('webGLFrontBufferYaw', false, true, false);
    addView('webGLFrontBufferPitch', false, false, true);
    addView('webGLFrontBuffer', true, true, true);
  window.requestAnimationFrame(animateCallback);
}

//window.onload = pointerLockMain;
