/*********************************************************************************
 *
 * Copyright (c) 2012 gskinner.com inc.
 * Authored by: Alex Garneau
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * 
 *********************************************************************************/

(function (window) {
		
	var Demo05 = function (canvas) {
		this.init(canvas);
	};
	
    var pMatrix = mat4.create();
    var mvMatrix = mat4.create();
    var nMatrix = mat4.create();
	
	var p = Demo05.prototype;
	
	p.init = function (canvas) {
		this.canvas = canvas;
		
		this.initGL(this.canvas);
		if (!this.gl) {
			alert('WebGL instance could not be created\nPlease restart your browser.');
			return;
		}
		
		this.setupGL(canvas);

		this.initShaders();
		this.initBuffers();
		this.initTextures();
		this.initWorldObjects();
	    
		this.tickProxy = $.proxy(this.tick, this);
		this.tick();
	};
	
	p.initGL = function(canvas) {
		/* 
		 * Create the WebGL context. It will stop the program if it cannot do so; usually because of a browser or setting.
		 */
	    try {
			//this.gl = WebGLUtils.create3DContext(canvas, {preserveDrawingBuffer: 1, antialias:1, alpha:1, stencil:1});
	    	this.gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: 1, antialias:1, alpha:1, stencil:1});
	    } catch (e) { }
	    if (this.gl) {
	        this.gl.viewportWidth = canvas.width;
	        this.gl.viewportHeight = canvas.height;
	        this.gl.fov = canvas.fov;
	    }
	};
	
	p.setupGL = function(canvas) {
		/*
		 * Sets the clear color of the canvas. Setting the alpha to 0 will make the stage transparent to the background of the HTML. 
		 */
		this.gl.clearColor(0.1, 0.1, 0.1, 1);
				
		/*
		 * Enable depth test. This will make objects draw in order of how close they are to the camera. Otherwise they will draw in order they are added to the buffer.
		 * Adjust depthFunc to specify the order of which they are drawn. LESS will draw objects closer first. GREATER will draw objects farther away first.
		 */
		this.gl.disable(this.gl.DEPTH_TEST);
	    this.gl.depthFunc(this.gl.LESS);
	    
	    /*
	     * Enable blend. This will enable the alpha channel and make objects transparent.
	     * However, beware that an invisible object still exists and will technically be drawn overtop a non-invisible object, blanking it out.
	     * The best way to remedy this is to use multiple draw methods or keep depth test off, but for efficiency, it's best to try to work around
	     * having to use multiple draw methods (they are expensive on performance to run).
	     * 
	     * The ideal would be to use blend for texture-based particle effects and depth test for more solid plane-based objects.
	     */
	    this.gl.enable(this.gl.BLEND);
	    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.SRC_ALPHA, this.gl.ONE);
	    
	    // Create the viewport (the "screen" that shows you what the camera sees).
	    this.gl.viewport(0, 0, canvas.width, canvas.height);
	    
	    pMatrix = mat4.create();
	    mvMatrix = mat4.create();
	    nMatrix = mat3.create();
	    
	    // This mvMatrix can be used to move all the objects around like a container. Ideal for moving the camera (or rather, the world) around.
		mat4.identity(mvMatrix);
		this.cameraPosition = [0,0,0];
	};

	p.initShaders = function() {
        /*
         * Create the particle shader. You can have multiple shaders based on the kind of data you want.
         * For example, in this case, particles are not affected by normals and lighting, so I can avoid having
         * to use those values at all. This can save processor and GPU time.
         * Make sure you minimalize switching the shaders, though. Get everything done with one first before switching
         * to the next.
         */
        
        this.shaderParticle = new ShaderParticle(this.gl);
		this.shaderParticle.use();
	};
	
	p.initBuffers = function() {
		/* 
		 * Create the vertexBuffer and array. This will store 10000 "spaces" in the buffer, which will be used by the shader to access
		 * the vertex data of the points we want it to draw.
		 */
		this.vertexBuffer = this.gl.createBuffer();
		this._vertices = new Float32Array(24);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this._vertices, this.gl.STREAM_DRAW);
		
		/* 
		 * Create the element array. This is only used when you draw with the drawElements command. What this does is it labels the points
		 * of the triangles with which to draw and fill between in sets of three.
		 * For example, 0,1,2 will draw a triangle between the first, second, and third point defined in the vertex buffer.
		 * In this case, we draw a second triangle while reusing two of the points: 0,2,3. This will allow us to draw a 4-sided shape with only 4 points
		 * with two joined triangles (4 points) instead of two separate triangles (6 points).
		 */
		this.indexBuffer = this.gl.createBuffer();
		var indexCount = 500000;
		this.indices = new Uint16Array(indexCount * 6);
		var j = 0;
		for (var i = 0, l = indexCount; i < l; i++) {
			this.indices.set([j,j+1,j+2,j,j+2,j+3], i*6);
			j += 4;
		}
		
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);
	};
	
	/*
	 * Initialize the textures we will be using. You can use jpgs and pngs (for alpha). You can find addImage
	 * in webgl-utils.
	 */
	var PARTICLE1 = "webgl/code/images/particle1.png";
	var PARTICLE2 = "webgl/code/images/particle2.png";
	
	var textures = [];
	
	p.initTextures = function() {		
		textures.push(addTexture(this.gl, PARTICLE1, this.gl.TEXTURE0));
		textures.push(addTexture(this.gl, PARTICLE2, this.gl.TEXTURE1));
	};
		
	p.initWorldObjects = function() {
		/*
		 * Creates the objects in the world. For this example, I'm going to create a blue cube on a bluer plane.
		 */
		this.emitters = [];
		this.emitters.push(new ParticleEmitter([0,0,-5], [0,0,0], [.1,.1], [0.9,0.9,0.9,1], [0,1], 2, [400,600], [[-1,1,0],[1,1,0]], [[0,-.005,0],[0,-.02,0]], [0,0,0], [0,0,0]));
	};
		
	p.draw = function() {
		// Get a reference of the canvas (draw is technically the "update" of WebGL, so we need to adjust for any external changes as well.)
		if (this.gl == null) {
			return;
		}
		var canvas = this.gl.canvas;
		
		shader = this.shaderParticle;
		if (shader == null) {
			return;
		}
		
		shader.use();
		
		// Clears the screen for the next draw.
	    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	    
	    // Aspect ratio (usually based off the viewport, as it can differ from the canvas dimensions).
	    var aspectRatio = canvas.width / canvas.height;
	    
		// Set up the camera view with this matrix.
	    // Create the camera (field of view in degrees, aspect ratio (based on gridView), nearPlane, farPlane, and output matrix (to store the camera)).
	    mat4.perspective(45, aspectRatio, 0.1, 1000.0, pMatrix);
	    
	    // Translate our camera by setting the pMatrix.
	    mat4.rotate(pMatrix, pitch, [1,0,0], pMatrix);
	    mat4.rotate(pMatrix, yaw, [0,1,0], pMatrix);
	    mat4.translate(pMatrix, [xPos,10,zPos], pMatrix);
	    
	    // Ads the camera to the shader.
		this.gl.uniformMatrix4fv(shader.pMatrixUniform, 0, pMatrix);
		
		// This resets the mvMatrix.
		mat4.identity(mvMatrix);
		
	    // Next, get the vertices of all the planes, including position, color, and if enabled, textures.
		var vertices, v, pointCount = 0;
		vertices = this._vertices;
		var setBuffer = false;
		
		var minV = [parseFloat(document.getElementById("minX").value),parseFloat(document.getElementById("minY").value),parseFloat(document.getElementById("minZ").value)];
		var maxV = [parseFloat(document.getElementById("maxX").value),parseFloat(document.getElementById("maxY").value),parseFloat(document.getElementById("maxZ").value)];
		
		var freq = document.getElementById("freq").value;
		var count = document.getElementById("count").value;
		
		// --------------------------------------------
		// Now let's draw the particles!
		// --------------------------------------------
		
		for (var j = 0, k = this.emitters.length; j < k; j++) {
			var particleEmitter = this.emitters[j];
			
			// Update the emitters based on input from the user.
			particleEmitter.velocity([minV, maxV]);
			particleEmitter.frequency(freq);
			particleEmitter.count(count);
			
			// Get the vertices of the particles. All the particles have their vertices gotten all at once.
			v = particleEmitter.getVertices(mvMatrix);
			
			if (v.length > vertices.length) {
				var newVertices = new Float32Array(v.length);
				newVertices.set(vertices, 0);
				this._vertices = newVertices;
				vertices = this._vertices;
				setBuffer = true;
			}
			
			vertices.set(v, 0);
			pointCount = particleEmitter.getPointCount();
			
			// Bind the newly obtained vertices to the array buffer quickly and easily.
			if (setBuffer) {
				this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STREAM_DRAW);
			} else {
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, vertices);
			}
				
			/* 
			 * To save on processor passing in values to the buffer, we're only going to set color once, as it's
			 * a value that all the particles share. To do this, we will set a uniform; a variable that remains the same
			 * for every vertex that the shader draws. This saves having to set color thousands of times.
			 */
			var col = particleEmitter.getColor();
			this.gl.uniform4f(shader.colorUniform, col[0], col[1], col[2], col[3]);
			
			/*
			 * This sets the attributes in the shader by pointing to specific elements within the array buffer.
			 * In this case, since each value is a float, each value is 4 bytes. The first 12 bytes are the 3 vertex
			 * position coordinates xyz, and the second set are the texture UV and sampler id.
			 */
			
			this.gl.vertexAttribPointer(shader.vertexPositionAttribute, 3, this.gl.FLOAT, 0, 24, 0);		
			this.gl.vertexAttribPointer(shader.vertexTextureAttribute, 3, this.gl.FLOAT, 0, 24, 12);
			
			/*
			 * And draw!
			 */
			
			this.gl.drawElements(this.gl.TRIANGLES, pointCount * (6 / 4), this.gl.UNSIGNED_SHORT, 0);
		}
	};
	
	var pitch = 0;
	var yaw = 0;
	
	var xPos = 0;
	var zPos = -40;
	
	p.tick = function() {
		this.draw();
		if (!this.paused) {
	    	requestAnimFrame(this.tickProxy);
		}
		
		var elapsed = 0.5;
		
		if (this.moveLeft) {
			xPos += Math.cos(yaw) * elapsed;
	        zPos += Math.sin(yaw) * elapsed;
		} else if (this.moveRight) {
			xPos -= Math.cos(yaw) * elapsed;
	        zPos -= Math.sin(yaw) * elapsed;
		}
			
		if (this.moveUp) {
			var ninety = Math.PI / 2;
			xPos += Math.cos(yaw + ninety) * elapsed;
	        zPos += Math.sin(yaw + ninety) * elapsed; 
		} else if (this.moveDown) {
			var ninety = Math.PI / 2;
			xPos -= Math.cos(yaw + ninety) * elapsed;
	        zPos -= Math.sin(yaw + ninety) * elapsed;
		}
		
		if (this.rotateLeft) {
			yaw -= Math.PI / 45;
		} else if (this.rotateRight) {
			yaw += Math.PI / 45;
		}
			
		if (this.rotateUp) {
			pitch -= Math.PI / 45;
		} else if (this.rotateDown) {
			pitch += Math.PI / 45;
		}
	};
	
	p.keyDown = function(code) {
		switch (code) {
			case 37: // LEFT
				this.moveLeft = true;
				break;
			case 38: // UP
				this.moveUp = true;
				break;
			case 39: // RIGHT
				this.moveRight = true;
				break;
			case 40: // DOWN
				this.moveDown = true;
				break;
				
			case 65: // LEFT
				this.rotateLeft = true;
				break;
			case 87: // UP
				this.rotateUp = true;
				break;
			case 68: // RIGHT
				this.rotateRight = true;
				break;
			case 83: // DOWN
				this.rotateDown = true;
				break;	
			
		}
 	};
 	p.keyUp = function(code) {
		switch (code) {
			case 37: // LEFT
				this.moveLeft = false;
				break;
			case 38: // UP
				this.moveUp = false;
				break;
			case 39: // RIGHT
				this.moveRight = false;
				break;
			case 40: // DOWN
				this.moveDown = false;
				break;	
				
			case 65: // LEFT
				this.rotateLeft = false;
				break;
			case 87: // UP
				this.rotateUp = false;
				break;
			case 68: // RIGHT
				this.rotateRight = false;
				break;
			case 83: // DOWN
				this.rotateDown = false;
				break;	
			
		}
 	};
 	
 	p.destroy = function() {
 		for (var i = 0, l = this.emitters.length; i < l; i++) {
 			this.emitters[i].destroy();
 		}
 		this.emitters = null;
 		this.paused = true;
 		this.objects = null;
 		this.tick = null;
 		this.shader = null;
 		this.gl = null;
 	};
	
	window.Demo05 = Demo05;
}(window));