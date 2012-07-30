/*
 * Copyright 2010, Google Inc.
 * Modified by Alex Garneau - Feb 2, 2012 - gskinner.com Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @fileoverview This file contains functions every webgl program will need
 * a version of one way or another.
 *
 * Instead of setting up a context manually it is recommended to
 * use. This will check for success or failure. On failure it
 * will attempt to present an approriate message to the user.
 *
 *       gl = WebGLUtils.setupWebGL(canvas);
 *
 * For animated WebGL apps use of setTimeout or setInterval are
 * discouraged. It is recommended you structure your rendering
 * loop like this.
 *
 *       function render() {
 *         window.requestAnimFrame(render, canvas);
 *
 *         // do rendering
 *         ...
 *       }
 *       render();
 *
 * This will call your rendering function up to the refresh rate
 * of your display but will stop rendering if your app is not
 * visible.
 */
	
    function loadIdentity() {  
      mvMatrix = Matrix.I(4);  
    }  
      
    var mvMatrix = mat4.create();
    var mvMatrixStack = [];
    var pMatrix = mat4.create();
    var nMatrix = mat3.create();

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    function setMatrixUniforms() {
        gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 0, pMatrix);
        gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, 0, mvMatrix);
    }

    function getPositionFromMatrix(matrix) {
    	return {x:matrix[12], y:matrix[13], z:matrix[14]};
    }
    function getRotationFromMatrix(matrix) {
    	return {x:Math.asin(matrix[6]), y:Math.asin(matrix[8]), z:Math.asin(matrix[1])};
    }


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    function getMousePosition(event) {
    	return {x:event.offsetX, y:event.offsetY};
    }
	
	function getNodeFromMouse(canvas, mouse, gridSize, GRID_WIDTH, GRID_HEIGHT) {
		// We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
		// First, let's see what the grid looks like compared to the canvas. Its borders will always be touching
		// whichever part's thinner: the width or the height.
		
		var middleCanvas = {x:canvas.width / 2, y:canvas.height / 2};

		var pos = {	x: gridSize * (mouse.x - (middleCanvas.x - (GRID_WIDTH * 0.5))) / GRID_WIDTH,
					y: gridSize * (mouse.y - (middleCanvas.y - (GRID_HEIGHT * 0.5))) / GRID_HEIGHT };
		
		if (pos.x >= 0 && pos.x <= gridSize && pos.y >= 0 && pos.y <= gridSize) {		
			var item = {x:(pos.x)|0, y:(pos.y)|0};	
			return item;
		} else {
			return null;
		}
	};
	function getCoordinateFromMouse(canvas, mouse, gridSize, GRID_WIDTH, GRID_HEIGHT) {
		// We're getting it in this format: left=0, right=gridSize. Same with top and bottom.
		// First, let's see what the grid looks like compared to the canvas. Its borders will always be touching
		// whichever part's thinner: the width or the height.
		
		//var middleCanvas = {x:canvas.width / 2, y:canvas.height / 2};
		var middleCanvas = {x:canvas.width, y:canvas.height};

		var pos = {	x: gridSize * (mouse.x - (middleCanvas.x - (GRID_WIDTH * 0.5))) / GRID_WIDTH,
					y: gridSize * (mouse.y - (middleCanvas.y - (GRID_HEIGHT * 0.5))) / GRID_HEIGHT };

		return pos;
	};
	
	/*
	 * When an image is loaded, this will store it in the shader to be used by the sampler references.
	 * For example, to use the texture stored at TEXTURE0, you set the sampler to 0.
	 */
	function addTexture(gl, imageURL, glTexture) {
		var texture = gl.createTexture();
		texture.image = new Image();
		texture.image.onload = function() {
			gl.activeTexture(glTexture);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			
			// This clamps images whose dimensions are not a power of 2, letting you use images of any size.
			gl.texParameteri(gl.TEXTURE_2D, gl.WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.WRAP_T, gl.CLAMP_TO_EDGE);
	  	};
	
	  	texture.image.src = imageURL;
	  	return texture;
	};
		
    var tweenCount = 0;
    var tweenEase = 0.1;
    var tweenRound = 0.01;
    var references = [];
    var fromPositions = [];
    var halfPositions = [];
    var toPositions = [];
    
    function ease(from, to, ease) {
    	if (ease > 1) {
    		ease = 1 / ease;
    	}
    	return (to - from) * ease;
    }
    
    function displayAlertMatrix(matrix) {
	    var testString = "";
	    for (var i = 0, l = matrix.length; i<l;i++) {
	    	if (i % 4 == 0 && i > 0) {
	    		testString += "\n";
	    	}
	    	testString += matrix[i] + ", ";
	    }
	    testString += "";
	    alert(testString);
    }
    
    function addVectors(vec1, vec2) {
    	for(var i = 0, l = vec1.length; i<l; i++) {
    		if (vec2[i]) {
    			vec1[i] += vec2[i];
    		}
    	}
    	return vec1;
    }
    function subtractVectors(vec1, vec2) {
    	for(var i = 0, l = vec1.length; i<l; i++) {
    		if (vec2[i]) {
    			vec1[i] -= vec2[i];
    		}
    	}
    	return vec1;
    }
    
    function inverseVector(vec) {
    	for (var i = 0, l = vec.length; i < l; i++) {
    		vec[i] = 1 - Math.abs(vec[i]);
    	}
    	return vec;
    }
    
    function alertMat4(mat) {
    	var string = "[";
    	
    	for (var i = 0; i < 4; i++) {
    		for (var j = 0; j < 4; j++) {
        		string += Math.round(mat[(i * 4) + j]).toString() + ", \t";
        	}
    		string += "\n";
    	}
    	string += "]";
    	alert(string);
    }
    
    function Float32Concat(original, addition) {
    	if (!original) {
    		return addition;
    	}
    	
    	var length = original.length;
    	var totalLength = length + addition.length;
        
        var result = new Float32Array(totalLength);

        result.set(original);
        result.set(addition, length);

        return result;
    }
    
    var totalTimePassed = 0;
    var lastTimePassed = 0;
    function ConsoleTimePassed(message) {
    	totalTimePassed = new Date().getTime();
    	console.log(message + ": " + (totalTimePassed - lastTimePassed));
    	lastTimePassed = totalTimePassed;
    }
    
    function easeNormalVec(vec) {
    	vec[0] += (1 - vec[0]) / 2;
    	vec[1] += (1 - vec[1]) / 2;
    	vec[2] += (1 - vec[2]) / 2;
    	
    	return vec;
    }
    function getBetweenVec(min, range) {
    	var vec = [0,0,0];
    	vec[0] = Math.random() * range[0] + min[0];
    	vec[1] = Math.random() * range[1] + min[1];
    	vec[2] = Math.random() * range[2] + min[2];
    	
    	return vec;
    }

    mat3.multiplyVec3 = function(matrix, vec, dest) {
    	if (!dest) dest = vec;
	  
    	dest[0] = vec[0] * matrix[0] + vec[1] * matrix[3] + vec[2] * matrix[6];
    	dest[1] = vec[0] * matrix[1] + vec[1] * matrix[4] + vec[2] * matrix[7];
    	dest[2] = vec[0] * matrix[2] + vec[1] * matrix[5] + vec[2] * matrix[8];
	  
    	return dest;
	};
	mat3.dotVec3 = function(matrix, vec, dest) {
		if (!dest) dest = vec;
		
		dest[0] = vec[0] * matrix[0] + vec[1] * matrix[1] + vec[2] * matrix[2];
		dest[1] = vec[0] * matrix[3] + vec[1] * matrix[4] + vec[2] * matrix[5];
		dest[2] = vec[0] * matrix[6] + vec[1] * matrix[7] + vec[2] * matrix[8];
		  
		return dest;
  	};
    mat4.rotationVec3 = function(matrix, dest) {
    	if (!dest) desc = [0,0,0];
    	
    	dest[0] = Math.asin(matrix[6]);
    	dest[1] = Math.asin(matrix[8]);
    	dest[2] = Math.asin(matrix[1]);
    	
    	return dest;
    };
    	
    function normalize(vec) {  
    	var i = 0, l = vec.length, total = 0;
    	for (i = 0; i < l; i++) {
    		total += vec[i];
    	}
    	for (i = 0; i < l; i++) {
    		vec[i] /= total;
    	}
      	  return vec;
    };

WebGLUtils = function() {

/**
 * Creates the HTLM for a failure message
 * @param {string} canvasContainerId id of container of th
 *        canvas.
 * @return {string} The html.
 */
var makeFailHTML = function(msg) {
  return '' +
    '<table style="background-color: #8CE; width: 100%; height: 100%;"><tr>' +
    '<td align="center">' +
    '<div style="display: table-cell; vertical-align: middle;">' +
    '<div style="">' + msg + '</div>' +
    '</div>' +
    '</td></tr></table>';
};

/**
 * Mesasge for getting a webgl browser
 * @type {string}
 */
var GET_A_WEBGL_BROWSER = '' +
  'This page requires a browser that supports WebGL.<br/>' +
  '<a href="http://get.webgl.org">Click here to upgrade your browser.</a>';

/**
 * Mesasge for need better hardware
 * @type {string}
 */
var OTHER_PROBLEM = '' +
  "It doesn't appear your computer can support WebGL.<br/>" +
  '<a href="http://get.webgl.org/troubleshooting/">Click here for more information.</a>';

/**
 * Creates a webgl context. If creation fails it will
 * change the contents of the container of the <canvas>
 * tag to an error message with the correct links for WebGL.
 * @param {Element} canvas. The canvas element to create a
 *     context from.
 * @param {WebGLContextCreationAttirbutes} opt_attribs Any
 *     creation attributes you want to pass in.
 * @param {function:(msg)} opt_onError An function to call
 *     if there is an error during creation.
 * @return {WebGLRenderingContext} The created context.
 */
var setupWebGL = function(canvas, opt_attribs, opt_onError) {
  function handleCreationError(msg) {
    var container = canvas.parentNode;
    if (container) {
      var str = window.WebGLRenderingContext ?
           OTHER_PROBLEM :
           GET_A_WEBGL_BROWSER;
      if (msg) {
        str += "<br/><br/>Status: " + msg;
      }
      container.innerHTML = makeFailHTML(str);
    }
  };

  opt_onError = opt_onError || handleCreationError;

  if (canvas.addEventListener) {
    canvas.addEventListener("webglcontextcreationerror", function(event) {
          opt_onError(event.statusMessage);
        }, 0);
  }
  var context = create3DContext(canvas, opt_attribs);
  if (!context) {
    if (!window.WebGLRenderingContext) {
      opt_onError("");
    }
  }
  return context;
};

/**
 * Creates a webgl context.
 * @param {!Canvas} canvas The canvas tag to get context
 *     from. If one is not passed in one will be created.
 * @return {!WebGLContext} The created context.
 */
var create3DContext = function(canvas, opt_attribs) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var ii = 0; ii < names.length; ++ii) {
    try {
      context = canvas.getContext(names[ii], opt_attribs);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  return context;
};

return {
  create3DContext: create3DContext,
  setupWebGL: setupWebGL
};
}();

/**
 * Provides requestAnimationFrame in a cross browser way.
 */
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           window.setTimeout(callback, 1000/30);
         };
})();


