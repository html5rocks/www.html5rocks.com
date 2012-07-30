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
	var Demo03 = function (canvas) {
		this.init(canvas);
	};
	
    var pMatrix = mat4.create();
    var mvMatrix = mat4.create();
    var nMatrix = mat4.create();
	
	var p = Demo03.prototype;
	
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
		this.gl.clearColor(0.1, 0.1, 0.1, 0);
				
		/*
		 * Enable depth test. This will make objects draw in order of how close they are to the camera. Otherwise they will draw in order they are added to the buffer.
		 * Adjust depthFunc to specify the order of which they are drawn. LESS will draw objects closer first. GREATER will draw objects farther away first.
		 */
		this.gl.enable(this.gl.DEPTH_TEST);
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
		 * Creates the shader. This is the program that runs in the GPU after receiving data from the buffer.
		 * Because it runs in the GPU, it frees a lot of processor power for the CPU, making it very efficient.
		 */
		this.shader = new ShaderTexture(this.gl);
		this.shader.use();
		
		/* 
		 * For this example, we have two lights; a global and a local light.
		 * They both use the same kind of code; however, their ambient and directional values are different.
		 * Ambient is the "glow" of the light in 3D space, which lights up everything around it.
		 * Directional is literally the direction the light will go, but rather than a point, it is applied everywhere. Like the sun.
		 */
		
		this.gl.uniform1i( this.shader.useGlobal, 1 );
		this.gl.uniform1i( this.shader.usePoint, 1 );
		
		// Set the point light position.
	    this.gl.uniform3f( this.shader.pointLocationUniform, 5, -10, -5 );
		this.gl.uniform3f( this.shader.pointACUniform, 0.1, 0.1, 0.1 );
        this.gl.uniform3f( this.shader.pointDCUniform, 0.8, 0.8, 0.8 );

        this.gl.uniform3f( this.shader.globalLocationUniform, -10, 0, -50 );
        this.gl.uniform3f( this.shader.globalACUniform, 0.8, 0.8, 0.8 );
        this.gl.uniform3f( this.shader.globalDCUniform, 0.0, 0.0, 0.0 );
	};
	
	p.initBuffers = function() {
		/* 
		 * Create the vertexBuffer and array. This will store 10000 "spaces" in the buffer, which will be used by the shader to access
		 * the vertex data of the points we want it to draw.
		 */
		this.vertexBuffer = this.gl.createBuffer();
		this.vertices = new Float32Array(10000);
		
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STREAM_DRAW);
		
		/* 
		 * Create the element array. This is only used when you draw with the drawElements command. What this does is it labels the points
		 * of the triangles with which to draw and fill between in sets of three.
		 * For example, 0,1,2 will draw a triangle between the first, second, and third point defined in the vertex buffer.
		 * In this case, we draw a second triangle while reusing two of the points: 0,2,3. This will allow us to draw a 4-sided shape with only 4 points
		 * with two joined triangles (4 points) instead of two separate triangles (6 points).
		 */
		this.indexBuffer = this.gl.createBuffer();
		this.indices = new Uint16Array(3000);
		var j = 0;
		for (var i = 0, l = 500; i < l; i++) {
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
	var CRATE_WOOD = "images/crate_wood.jpg";
	var CRATE_METAL = "images/crate_metal.jpg";
	var CRATE_HOLO = "images/crate_holo.png";
	var PLANE_GRASS = "images/plane_grass.jpg";
	var PLANE_SKY = "images/plane_sky.jpg";

	var textures = [];
	
	p.initTextures = function() {
		textures.push(addTexture(this.gl, CRATE_WOOD, this.gl.TEXTURE0));
		textures.push(addTexture(this.gl, CRATE_METAL, this.gl.TEXTURE1));
		textures.push(addTexture(this.gl, CRATE_HOLO, this.gl.TEXTURE2));
		
		textures.push(addTexture(this.gl, PLANE_GRASS, this.gl.TEXTURE3));
		textures.push(addTexture(this.gl, PLANE_SKY, this.gl.TEXTURE4));
	};
		
	p.initWorldObjects = function() {
		/*
		 * Creates the objects in the world. For this example, I'm going to create a blue cube on a bluer plane.
		 */
		this.planes = [];
		this.cubes = [];
		this.objects = [this.planes, this.cubes];
		
		var surface = new Plane([0,0,0], [0,0,0], [1,1], null, [ 0, 0, 1], 3);
		surface.translate([0, -3, -20]);
		surface.rotateX(Math.PI / 2);
		surface.resize([150,150]);

		this.planes[0] = surface;
		
		surface = new Plane([0,0,0], [0,0,0], [1,1], null, [ 0, 0, 1], 4);
		surface.translate([0, 120, -150]);
		surface.resize([150,150]);

		this.planes[1] = surface;
		
		var viewTarget = new TextureCube(0);
		viewTarget.translate([0, -2, -10]);
		viewTarget.rotateY(Math.random() * Math.PI);
		viewTarget.vRotate([0, Math.PI / 180, 0]);
		this.cubes.push(viewTarget);		
	};
	
	p.setCrateTexture = function(val) {
		for (var i = 0, l = this.cubes.length; i < l; i++) {
			this.cubes[i].sampler(val);
		}
	};
	
	p.draw = function() {
		// Get a reference of the canvas (draw is technically the "update" of WebGL, so we need to adjust for any external changes as well.)
		if (this.gl == null) {
			return;
		}
		var canvas = this.gl.canvas;
		var shader = this.shader;
		if (shader == null) {
			return;
		}

		// Clears the screen for the next draw.
	    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	    
	    // Aspect ratio (usually based off the viewport, as it can differ from the canvas dimensions).
	    var aspectRatio = this.gl.canvas.width / this.gl.canvas.height;
	    
		// Set up the camera view with this matrix.
	    // Create the camera (field of view in degrees, aspect ratio (based on gridView), nearPlane, farPlane, and output matrix (to store the camera)).
	    mat4.perspective(45, aspectRatio, 0.1, 1000.0, pMatrix);
	    
	    // Translate our camera by setting the pMatrix.
	    mat4.rotate(pMatrix, pitch, [1,0,0], pMatrix);
	    mat4.rotate(pMatrix, yaw, [0,1,0], pMatrix);
	    mat4.translate(pMatrix, [xPos,0,zPos], pMatrix);
	    
	    // Ads the camera to the shader.
		this.gl.uniformMatrix4fv(shader.pMatrixUniform, 0, pMatrix);
		
		// This resets the mvMatrix.
		mat4.identity(mvMatrix);
		
	    // Next, get the vertices of all the planes, including position, color, and if enabled, textures.
		var vertices, vIndex = 0, v;
		vertices = this.vertices;
		for (var i = 0, l = this.objects.length; i < l; i++) {
			var drawable = this.objects[i];
			for (var j = 0, k = drawable.length; j < k; j++) {
				var drawObject = drawable[j];
				v = drawObject.getVertices(mvMatrix);
				if (v.length > vertices.length) {
					var newVertices = new Float32Array(v.length);
					this.gl.bufferData(this.gl.ARRAY_BUFFER, v, this.gl.STREAM_DRAW);
					newVertices.set(vertices,0);
					this.vertices = newVertices;
					vertices = this.vertices;
				}

				vertices.set(v, 0);
				
				var pointCount = drawObject.getPointCount();
				
				// Set the normal for lighting.
				mat4.toInverseMat3(drawObject.getMatrix(), nMatrix);
			    mat3.transpose(nMatrix);
				this.gl.uniformMatrix3fv(shader.nMatrixUniform, 0, nMatrix);

				// Bind the newly obtained vertices to the array buffer quickly and easily.
				this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, v);
				//this.gl.bufferData(this.gl.ARRAY_BUFFER, v, this.gl.STREAM_DRAW);
				
				this.gl.vertexAttribPointer(shader.vertexPositionAttribute, 3, this.gl.FLOAT, 0, 52, 0);		
				this.gl.vertexAttribPointer(shader.vertexColorAttribute, 4, this.gl.FLOAT, 0, 52, 12);		
				this.gl.vertexAttribPointer(shader.vertexNormalAttribute, 3, this.gl.FLOAT, 0, 52, 28);
				this.gl.vertexAttribPointer(shader.vertexTextureAttribute, 3, this.gl.FLOAT, 0, 52, 40);
				
				// Translate our camera by setting the pMatrix. You can modify this matrix as well.
				this.gl.uniformMatrix4fv(shader.mvMatrixUniform, 0, mvMatrix);
				
				/* 
				 * Draw the triangles based off the index buffer. This is the least efficient, but safest method.
				 * Other methods exist, like continuous triangles based off the first point. These are good for drawing circles.
				 * You can also draw directly off an array, which lets you import 3D objects into WebGL.
				 */
				this.gl.drawElements(this.gl.TRIANGLES, pointCount * (6 / 4), this.gl.UNSIGNED_SHORT, 0);
			}
		}
	};
	
	var pitch = 0;
	var yaw = 0;
	
	var xPos = 0;
	var zPos = 0;
	
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
 		this.paused = true;
 		this.objects = null;
 		this.tick = null;
 		this.shader = null;
 		this.gl = null;
 	};
	
	window.Demo03 = Demo03;
}(window));