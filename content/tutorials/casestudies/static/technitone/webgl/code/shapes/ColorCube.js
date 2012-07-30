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
(function(window) {
	var ColorCube = function(color, position, rotation, scale) {
		this.init(color, position, rotation, scale);
	};
	
	var p = ColorCube.prototype;
	
	p.init = function(color, position, rotation, scale){
		// Declare the mv and normal matrixes. Because they are so costly to create, we will keep reusing the same one within each element.
		this._matrix = mat4.identity(mat4.create());
		this._normalMatrix = mat3.identity(mat3.create());
		
		if (!position) {
			position = [0,0,0];
		}
		if (!rotation) {
			rotation = [0,0,0];
		}
		if (!scale) {
			scale = [1,1,1];
		}
		
		this._position = position;
		this._rotation = rotation;
		this._scale = scale;
		
		this._velocity = [0,0,0];
		this._vRotation = [0,0,0];
		
		this._vertices = new Float32Array(240);
		this.vertexCount = 40;
		
		var rot = Math.PI / 2;
		
		// The cube consists of 6 planes facing different directions, as shown. Their normals are also set appropriately.
		this._planes = [
		               	new Plane([ 0, 0, 1], [0,0,0], [1,1], color, [ 0, 0, 1]),
		               	new Plane([ 1, 0, 0], [0,rot,0], [1,1], color, [ 1, 0, 0]),
		               	new Plane([ 0, 0,-1], [0,rot*2,0], [1,1], color, [ 0, 0,-1]),
		               	new Plane([-1, 0, 0], [0,rot*3,0], [1,1], color, [-1, 0,  0]),
		               	new Plane([ 0, 1, 0], [rot,0,0], [1,1], color, [ 0, -1, 0]),
		               	new Plane([ 0,-1, 0], [rot*3,0,0], [1,1], color, [ 0, 1, 0])
		              ];
		
		this.color(color);
	};
		
	p.getVertices = function(matrix, staticNormals) {
		// Update position and rotation based on the velocities.
		this.translate(this._velocity);
		this.rotate(this._vRotation);
		
		mat4.translate(matrix, this._position, this._matrix);
		mat4.rotate(this._matrix, this._rotation[0], [1,0,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[1], [0,1,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[2], [0,0,1], this._matrix);
		mat4.scale(this._matrix, [this._scale[0], this._scale[1], 1], this._matrix);
		
		for (var i = 0; i < 6; i++) {
			this._vertices.set(this._planes[i].getVertices(this._matrix, staticNormals), i * this.vertexCount);
		}

		return this._vertices;
	};
	
	p.getMatrix = function() {
		return this._matrix;
	};
	p.getPointCount = function() {
		return 24;
	};
	
	p.translate = function(translation) {
		this._position = addVectors(this._position, translation);
		this.updated = true;
	};
	p.rotate = function(rotation) {
		this._rotation[0] += rotation[0];
		this._rotation[1] += rotation[1];
		this._rotation[2] += rotation[2];
		this.updated = true;
	};
	p.rotateX = function(rotation) {
		this._rotation[0] += rotation;
		this.updated = true;
	};
	p.rotateY = function(rotation) {
		this._rotation[1] += rotation;
		this.updated = true;
	};
	p.rotateZ = function(rotation) {
		this._rotation[2] += rotation;
		this.updated = true;
	};
	p.scale = function(scale) {
		this._scale += scale;
		this.updated = true;
	};
	
	p.setPosition = function(position) {
		this._position = position;
	};
	
	p.velocity = function(velocity) {
		this._velocity = velocity;
	};
	p.vRotate = function(rotation) {
		this._vRotation = rotation;
	};
	
	p.color = function(color) {
		if (color == null) {
			for (var i = 0; i < 6; i++) {
				this._planes[i].color([Math.random(), Math.random(), Math.random(), 1]);
			}
		} else {
			this._color = color;
			for (var i = 0; i < 6; i++) {
				this._planes[i].color(color);
			}
		}
		this.updated = true;
	};

	window.ColorCube = ColorCube;
	
} (window));