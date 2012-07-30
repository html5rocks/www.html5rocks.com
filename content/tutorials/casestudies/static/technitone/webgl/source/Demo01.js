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
 *****************************************
 *
 * DEMO 01 - THE NECESSITIES
 * 
 *****************************************
 *
 * In this WebGL demo, we will go over the basics and the process. We will get the WebGL context, create the shaders, buffers, vertices, etc, 
 * initialize the camera, and then draw a simple line in the 3D space.
 * 
 * NOTE: there will be much fewer comments in each subsequent demos. This one being the first, I'm going to explain as much as I can.
 * Each preceding demo will be derived off changes I made to this one, and as such, only these changes will be highlighted.
 * 
 *********************************************************************************/

(function (window) {
	
var Demo01 = function (canvas) {
	this.init(canvas);
};
	
var p = Demo01.prototype;

/*****************************************
 * To create a more object-oriented layout, I created a prototype to hold all the functions and data values of the
 * demo. This lets me isolate it to its own file so I can load it seperately in an HTML file.
 *****************************************/

p.init = function (canvas) {
	this.canvas = canvas;
	
	/*****************************************
	 * First off, we need to initialize the webgl, which is the canvas context. This will let us get the 
	 * webGL context as well as test is the browser is compatible with WebGL.
	 *****************************************/
	this.initGL(this.canvas);
	
	/*****************************************
	 * Next, we'll set up the initial values, like the camera.
	 *****************************************/
	this.setupGL(canvas);

	/*****************************************
	 * Now we initialize the shaders. These are what do the actual drawing.
	 *****************************************/
	this.initShaders();
	
	/*****************************************
	 * Now we initialize the buffers. This lets us pass data to the shader.
	 *****************************************/
	this.initBuffers();
	
	/*****************************************
	 * With all this stuff in place, all we're missing is something to draw.
	 *****************************************/
	this.initWorldObjects();
    
	/*****************************************
	 * This creates a timer-based update function.
	 *****************************************/
	//this.tickProxy = $.proxy(this.tick, this);
	
    this.tick();
};

p.initGL = function(canvas) {
	/* 
	 * Create the WebGL context. It will stop the program if it cannot do so; usually because of a browser or setting.
	 */
    try {
		//this.gl = WebGLUtils.create3DContext(canvas, {preserveDrawingBuffer: 1, antialias:1, alpha:1, stencil:1});
    	this.gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: 1, antialias:1, alpha:1, stencil:1});
    	if (!this.gl) {
    		alert('WebGL instance could not be created\nPlease restart your browser.');
    		return;
    	}
    } catch (e) { }
    if (this.gl) {
        this.gl.viewportWidth = canvas.width;
        this.gl.viewportHeight = canvas.height;
        this.gl.fov = canvas.fov;
    }
};

p.setupGL = function(canvas) {
	/*****************************************
	 * Sets the clear color of the canvas. Setting the alpha to 0 will make the stage transparent to the background of the HTML. 
	 *****************************************/
	this.gl.clearColor(0.1, 0.1, 0.1, 1);
			
	/*****************************************
	 * Enable depth test. This will make objects draw in order of how close they are to the camera. Otherwise they will draw in order they are added to the buffer.
	 * Adjust depthFunc to specify the order of which they are drawn. LESS will draw objects closer first. GREATER will draw objects farther away first.
	 *****************************************/
	this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
    
    /*****************************************
     * Enable blend. This will enable the alpha channel and make objects transparent.
     * However, beware that an invisible object still exists and will technically be drawn overtop a non-invisible object, blanking it out.
     * The best way to remedy this is to use multiple draw methods or keep depth test off, but for efficiency, it's best to try to work around
     * having to use multiple draw methods (they are expensive on performance to run).
     * 
     * The ideal would be to use blend for texture-based particle effects and depth test for more solid plane-based objects.
     *****************************************/
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.SRC_ALPHA, this.gl.ONE);
    
    /*****************************************
	 * Create the viewport. This is the "screen" on the canvas that shows you what the camera sees. Reason you can do this is you can also
	 * create a splitscreen or a screen-in-screen view if you want; all in one canvas.
	 *****************************************/ 
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    	
    /*****************************************
	 * This mvMatrix can be used to move all the objects around like a container. Ideal for moving the camera (or rather, the world) around.
	 * pMatrix and mvMatrix are created in the webgl-utils.js file. You can create them here if you want.
	 *****************************************/ 
	mat4.identity(mvMatrix);
};

p.initShaders = function() {
	/***************************************** 
	 * Creates the shader. This is the program that runs in the GPU after receiving data from the buffer.
	 * Because it runs in the GPU, it frees a lot of processor power for the CPU, making it very efficient.
	 * Because Shader01.js is referenced in the HTML file
	 *****************************************/
	this.shader = new Shader01(this.gl);
	this.shader.use();
};

p.initBuffers = function() {
	/***************************************** 
	 * Create the vertexBuffer and array. This will store 6 "spaces" in the buffer, which will be used by the shader to access
	 * the vertex data of the points we want it to draw.
	 *****************************************/
	this.vertexBuffer = this.gl.createBuffer();
	
	/*****************************************
	 * Before we pass the data to the buffer, we need to first bind it. This tells the context that this buffer is the "active" ARRAY_BUFFER, and
	 * anything we tell gl to do regarding an ARRAY_BUFFER will be done to this specific buffer.
	 * That being said, you can have store multiple array buffers with different data.
	 *****************************************/
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
};
	
p.initWorldObjects = function() {
	var shader = this.shader;
	
	/*****************************************
	 * Creates the objects in the world. For this example, I'm going to create a bright blue line. I can do this with 2 vertex points and a line drawn in between.
	 * This line will run along the x-axis from -5 units to 5 units in world space, creating a 10 unit-long line.
	 * Also, ARRAY_BUFFERS only take Float32Arrays, so make sure you array of variables is converted to Float32Array (or one to begin with).
	 *****************************************/
	this.vertices = new Float32Array(6);
	this.vertices.set([-5, 0, 0 , 
	                   5, 0, 0 ]);
	
	/*****************************************
	 * This will set the line color. You may also have each point set to a different color value to create a gradient effect by setting each color values based on
	 * an attribute like the vertices. For now, though, we will use a uniform to define the color.
	 *****************************************/
	this.gl.uniform4f(shader.colorUniform, 0.2, 0.4, 1.0, 1.0);
	
	/*****************************************
	 * This will set the parts of the ARRAY_BUFFER that is read by each specific attribute element. This lets you add color, normal, texture UV values in the same buffer
	 * if they differ between vertices and objects, as the shaders can only read from one buffer object per draw. Now the shader knows what to draw.
	 * The 12 signifies each attribute contains 3 float values (4 bytes each) out of the array. Because the array contains 2 sets of 3, there will be 2 attributes.
	 *****************************************/
	this.gl.vertexAttribPointer(shader.vertexPositionAttribute, 3, this.gl.FLOAT, 0, 12, 0);		
	
	/*****************************************
	 * Now we allocate space for the ARRAY_BUFFER and add the line values. We call this in each draw method to pass in position updates, if they occur. 
	 * Otherwise, you can simply set it once and forget about it.
	 * STATIC_DRAW means the shader holds onto the values and reuses them many times, eliminating the need to re-send the data.
	 *****************************************/ 
	this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertices, this.gl.STATIC_DRAW);
};

p.draw = function() {
	// Get a few quick references.
	var canvas = this.gl.canvas;
	var shader = this.shader;
	var context = this.gl;
// Clears the screen for the next draw.
context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

// Aspect ratio (usually based off the viewport,
// as it can differ from the canvas dimensions).
var aspectRatio = canvas.width / canvas.height;

// Set up the camera view with this matrix.
mat4.perspective(45, aspectRatio, 0.1, 1000.0, pMatrix);

// Adds the camera to the shader. [context = canvas.context]
// This will give it a point to start rendering from.
context.uniformMatrix4fv(shader.pMatrixUniform, 0, pMatrix);

// This resets the mvMatrix. This will create the origin in world space.
mat4.identity(mvMatrix);

// The mvMatrix will be moved 20 units away from the camera (z-axis).
mat4.translate(mvMatrix, [0,0,-20]);

// Sets the mvMatrix in the shader like we did with the camera matrix.
context.uniformMatrix4fv(shader.mvMatrixUniform, 0, mvMatrix);
					
// Draw the lines based off the order of elements in the array buffer.
context.drawArrays(context.LINES, 0, 2);
};

p.tick = function() {
	// Draw.
	this.draw();
	
	// Repeat the update.
	if (!this.paused) {
    	requestAnimFrame(this.tickProxy);
	}
};

p.destroy = function() {
	// Destroy the method by removing the stored data.
	this.paused = true;
	this.tick = null;
	pMatrix = null;
	mvMatrix = null;
	this.shader = null;
	this.gl = null;
};

window.Demo01 = Demo01;

}(window));