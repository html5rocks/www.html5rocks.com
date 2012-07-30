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
 * DEMO 02 - DRAWING
 * 
 *****************************************
 *
 * In this WebGL demo, we will transform the color uniform into a second attribute to show a gradient effect. We will also
 * draw a full plane out of two aligned triangles using the drawElements method and an element array buffer.
 * 
 *********************************************************************************/

(function (window) {
	
var Demo02 = function (canvas) {
	this.init(canvas);
};
	
var p = Demo02.prototype;

/*****************************************
 * Looks rather different without all the comments, eh?
 *****************************************/

p.init = function (canvas) {
	this.canvas = canvas;

	this.initGL(this.canvas);

	this.setupGL(canvas);

	this.initShaders();
	this.initBuffers();
	this.initWorldObjects();

	//this.tickProxy = $.proxy(this.tick, this);
	
    this.tick();
};

p.initGL = function(canvas) {
    try {
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
	this.gl.clearColor(0.1, 0.1, 0.1, 1);

	this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LESS);
    
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.SRC_ALPHA, this.gl.ONE);

    this.gl.viewport(0, 0, canvas.width, canvas.height);

	mat4.identity(mvMatrix);
};

p.initShaders = function() {
	/*****************************************
	 * Differences to the shader will be highlighted in the shader js file.
	 *****************************************/
	this.shader = new Shader02(this.gl);
	this.shader.use();
};

p.initBuffers = function() {
	/*****************************************
	 * First, we call bindBuffer to assign the GL context's main buffer to our specified buffer. To write data to it, the buffer must go through
	 * the context (security reasons), and binding the buffer will tell GL which buffer to use.
	 *****************************************/
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.createBuffer());
	
	/*****************************************
	 * An ELEMENT_ARRAY_BUFFER is a buffer that draws lines and triangles to different elements in a specified order.
	 * 
	 * For the drawElements method, we need to assign the index values of the array to be drawn in order.
	 * in this case, we will be using triangles, so every three index points equals one triangle.
	 * Remember, the numbers in the array represent the index points in the buffer array.
	 *****************************************/
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.gl.createBuffer());
	this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2, 0,2,3]), this.gl.STATIC_DRAW);
};
	
p.initWorldObjects = function() {
	var shader = this.shader;
	var context = this.gl;
// Creates a square with a gradient going from top to bottom.
// The first 3 values are the XYZ position; the last 4 are RGBA.
this.vertices = new Float32Array(28);
this.vertices.set([-2,-2, 0, 	0.0, 0.0, 0.7, 1.0,
                   -2, 2, 0, 	0.0, 0.4, 0.9, 1.0,
                    2, 2, 0, 	0.0, 0.4, 0.9, 1.0,
                    2,-2, 0, 	0.0, 0.0, 0.7, 1.0
                  ]);

// Set the order of which the vertices are drawn. Repeating values allows you
// to draw to the same vertex again, saving buffer space and connecting shapes.
this.indices = new Uint16Array(6);
this.indices.set([0,1,2, 0,2,3]);
			
// Create a new storage space for the buffer and assign the data in.
context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer());
context.bufferData(context.ARRAY_BUFFER, this.vertices, context.STATIC_DRAW);

// Separate the buffer data into its respective attributes per vertex.
context.vertexAttribPointer(shader.vertexPositionAttribute,3,context.FLOAT,0,28,0);
context.vertexAttribPointer(shader.vertexColorAttribute,4,context.FLOAT,0,28,12);

// Create element array buffer for the index order.
context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, context.createBuffer());
context.bufferData(context.ELEMENT_ARRAY_BUFFER, this.indices, context.STATIC_DRAW);
};

/*****************************************
 * To update the buffers in real-time, use these methods:
 * 
 * BufferData: Rather than assign data to the buffer, we will instead set aside some memory for the data. We are going to use numberOfSpaces 
 * slots because of the larger array, but despite the size, we may not actually use every last value within the buffer. This extends or
 * contracts the buffer instead of creates it.
 * 
 * this.gl.bufferData(this.gl.ARRAY_BUFFER (or other buffer type), numberOfSpaces, this.gl.STATIC_DRAW [type of draw]);
 * 
 * 
 * BufferSubData: instead of create a new buffer data store, uses the old one. This is much quicker and easier on the processor than
 * calling bufferData for each draw method. This also lets you only change specific parts of the buffer rather than overwrite the
 * whole thing all at once; again, possibly saving processor.
 * It will crash if too much data is passed in, however. Be careful.
 * 
 * this.gl.bufferSubData(this.gl.ARRAY_BUFFER (or other buffer type), startingIndex, arrayOfData);
 * 
 * 
 * NOTE: You must first have used the original bufferData to create the buffer space.
 *****************************************/

p.draw = function() {
	var context = this.gl;
	var canvas = context.canvas;
	var shader = this.shader;
	
    context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

    var aspectRatio = canvas.width / canvas.height;
    mat4.perspective(45, aspectRatio, 0.1, 1000.0, pMatrix);
	context.uniformMatrix4fv(shader.pMatrixUniform, 0, pMatrix);

	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0,0,-10]);
	context.uniformMatrix4fv(shader.mvMatrixUniform, 0, mvMatrix);

	/*****************************************
	 * Draw the lines based off the element buffer. This method uses the ELEMENT_ARRAY_BUFFER to specify which vertices are drawn
	 * to triangles (or whatever method is used). This is handy because you can use this to reuse vertices.
	 * The drawback is that you assign the vertex indices into a whole second buffer. 
	 * Therefore, it's not as processor-friendly as drawArrays.
	 * Fortunately, the indices are usually Uint, meaning they're only 2 bytes each, and depending on how general
	 * objects are drawn, you may only have to set an index buffer once.
	 *****************************************/
	
// Draw the triangles based off the order: [0,1,2, 0,2,3]. 
// Draws two triangles with two shared points (a square).
context.drawElements(context.TRIANGLES, 6, context.UNSIGNED_SHORT, 0);
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

window.Demo02 = Demo02;
	
}(window));