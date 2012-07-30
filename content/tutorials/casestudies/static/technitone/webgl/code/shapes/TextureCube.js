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
	var TextureCube = function(textureSampler, position, rotation, scale) {
		this.init(textureSampler, position, rotation, scale);
	};
	
	var p = TextureCube.prototype;
	
	/*
	 * The textureSampler variable is an integer. When we created the textures, we stored them in an array that the shader provides.
	 * For each draw call, the shader can store 16 textures (and 16 cube textures for effect imaging). TextureShader, in this case,
	 * represents the array index where we will find our desired picture. It's good to predefine these textures and, rather than use
	 * multiple draw calls to use hundreds of textures, try to compress all the textures into one large texture and refer to the
	 * specific UV coordinates of each.
	 * 
	 * The beauty of the UV is that it doesn't have to be square. It can be any sort of shape (any number of sides, too). So if you have a parallelogram , for example,
	 * with coordinates (-1,0), (0,1), (2,1), (1,0), you can create the shapes and refer to the texture accordingly for the desired effect 
	 * without having to resort to saving open 0-alpha space to keep it rectangular.
	 */
	
	p.init = function(textureSampler, position, rotation, scale){
		this._matrix = mat4.identity(mat4.create());
		this.normalMatrix = mat3.identity(mat3.create());
		
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

		this._textureSampler = textureSampler;
		this.vertexCount = 52;
		
		this._vertices = new Float32Array(312);
		
		var rot = Math.PI / 2;
		this._planes = [
		               	new Plane([ 0, 0, 1], [0,0,0], [1,1], null, [ 0, 0, 1], textureSampler),
		               	new Plane([ 1, 0, 0], [0,rot,0], [1,1], null, [ 1, 0, 0], textureSampler),
		               	new Plane([ 0, 0,-1], [0,rot*2,0], [1,1], null, [ 0, 0,-1], textureSampler),
		               	new Plane([-1, 0, 0], [0,rot*3,0], [1,1], null, [-1, 0,  0], textureSampler),
		               	new Plane([ 0, 1, 0], [rot,0,0], [1,1], null, [ 0, 1, 0], textureSampler),
		               	new Plane([ 0,-1, 0], [rot*3,0,0], [1,1], null, [ 0,-1, 0], textureSampler)
		              ];
	};
		
	p.getVertices = function(matrix, staticNormal) {
		// Update position and rotation based on the velocities.
		this.translate(this._velocity);
		this.rotate(this._vRotation);
		
		mat4.translate(matrix, this._position, this._matrix);
		mat4.rotate(this._matrix, this._rotation[0], [1,0,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[1], [0,1,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[2], [0,0,1], this._matrix);
		mat4.scale(this._matrix, [this._scale[0], this._scale[1], 1], this._matrix);
				
		for (var i = 0; i < 6; i++) {
			this._vertices.set(this._planes[i].getVertices(this._matrix, staticNormal), i * this.vertexCount);
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
	
	p.position = function(position) {
		this._position = position;
	};
	
	p.velocity = function(velocity) {
		this._velocity = velocity;
	};
	p.vRotate = function(rotation) {
		this._vRotation = rotation;
	};
	
	p.sampler = function(sample) {
		this._textureSampler = sample;
		for (var i = 0; i < 6; i++) {
			this._planes[i].sampler(sample);
		}
		this.updated = true;
	};

	window.TextureCube = TextureCube;
	
} (window));