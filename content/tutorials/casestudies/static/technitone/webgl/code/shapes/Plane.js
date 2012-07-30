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
	var Plane = function(position, rotation, scale, color, normal, textureSampler) {
		this.init(position, rotation, scale, color, normal, textureSampler);
	};
	
	var p = Plane.prototype;
	
	/*
	 * Position is a vec3 representing xyz. 
	 * Rotation is a vec3 representing rotY, rotX, rotZ.
	 * Scale is a vec2 representing xScale and yScale.
	 * Color is a vec4 representing rgba.
	 * textureSampler is the int ID of the image it uses, if any.
	 */
	
	p.init = function(position, rotation, scale, color, normal, textureSampler){
		this._normalMatrix = mat3.identity(mat3.create());
		this._matrix = mat4.identity(mat4.create());
		
		this.position(position);
		this.rotation(rotation);
		this.scale(scale);
		this.color(color);
		this._normal = normal;
		
		this.loadPoint = new Float32Array(10);
		this.loadTexture = new Float32Array(52);
		this.loadNoTexture = new Float32Array(40);

		this._textureSampler = null;
		if (textureSampler || textureSampler == 0) {
			this._textureSampler = textureSampler;			
			this.loadTexture.set([0, 0, textureSampler], 10);
			this.loadTexture.set([0, 1, textureSampler], 23);
			this.loadTexture.set([1, 1, textureSampler], 36);
			this.loadTexture.set([1, 0, textureSampler], 49);
			this.useTexture = true;
			this.vertexCount = 13;
		} else {
			this.useTexture = false;
			this.vertexCount = 10;
		}
	};
	
	p.getVertices = function(matrix, staticNormals) {
		this.staticNormals = staticNormals;
		mat4.translate(matrix, this._position, this._matrix);
		mat4.rotate(this._matrix, this._rotation[0], [1,0,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[1], [0,1,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[2], [0,0,1], this._matrix);
		mat4.scale(this._matrix, [this._scale[0], this._scale[1], 1], this._matrix);
		
		var load;

		if (this.useTexture) {
			load = this.loadTexture;
		} else {
			load = this.loadNoTexture;
		}
		
		load.set(this.getVertexAtPoint(this._matrix, [-1,-1, 0], matrix, staticNormals), 0);
		load.set(this.getVertexAtPoint(this._matrix, [-1, 1, 0], matrix, staticNormals), this.vertexCount);
		load.set(this.getVertexAtPoint(this._matrix, [ 1, 1, 0], matrix, staticNormals), this.vertexCount*2);
		load.set(this.getVertexAtPoint(this._matrix, [ 1,-1, 0], matrix, staticNormals), this.vertexCount*3);

		return load;
	};
	
	p.getVertexAtPoint = function(matrix, point, nMatrix, staticNormals) {
		point = mat4.multiplyVec3(matrix, point);  
				
		var color = this._color;
		var normal;
		if (staticNormals) {
			normal = this._normal;
		} else {
			normal = this.getNormal(nMatrix, this._normal);
		}
		var load = this.loadPoint;
		
		load.set(point, 0);
		load.set(color, 3);
		load.set(normal, 7);
		
		return load;
	};
	
	p.getNormal = function(matrix, normal) {
		mat4.toInverseMat3(this._matrix, this._normalMatrix);
		mat3.transpose(this._normalMatrix, this._normalMatrix);
		return mat3.multiplyVec3(this._normalMatrix, [0,0,1]);
	};

	p.getSampler = function() {
		return this._textureSampler;
	};
	
	p.getMatrix = function() {
		return this._matrix;
	};
	p.getPointCount = function() {
		return 4;
	};
	
	p.translate = function(translation) {
		this._position = addVectors(this._position, translation);
		this.updated = true;
	};
	p.rotateX = function(rotation) {
		this._rotation[0] += rotation;
		//this._normal[1] = Math.sin(this._rotation[0]);
		//this._normal[2] = Math.cos(this._rotation[0]);
		this.updated = true;
	};
	p.rotateY = function(rotation) {
		this._rotation[1] += rotation;
		//this._normal[0] = Math.sin(this._rotation[1]);
		//this._normal[2] = Math.cos(this._rotation[1]);
		this.updated = true;
	};
	p.rotateZ = function(rotation) {
		this._rotation[2] += rotation;
		//this._normal[0] += Math.sin(this._rotation[2]);
		//this._normal[1] += Math.sin(this._rotation[2]);
		this.updated = true;
	};
	p.resize = function(scale) {
		this._scale = addVectors(this._scale, scale);
		this.updated = true;
	};
	p.position = function(pos) {
		this._position = pos;
		this.updated = true;
	};
	p.rotation = function(rot) {
		this._rotation = rot;
		this.updated = true;
	};
	p.scale = function(scale) {
		this._scale = scale;
		this.updated = true;
	};
	p.color = function(color) {
		if (color == null) {
			this._color = [1,1,1,1];
		} else {
			this._color = color;
		}
		this.updated = true;
	};
	p.sampler = function(sampler) {
		if (sampler) {
			this.useTexture = true;
			this.vertexCount = 13;
		} else {
			this.useTexture = false;
			this.vertexCount = 10;
		}
		
		this._textureSampler = sampler;
		this.loadTexture.set([0, 0, sampler], 10);
		this.loadTexture.set([0, 1, sampler], 23);
		this.loadTexture.set([1, 1, sampler], 36);
		this.loadTexture.set([1, 0, sampler], 49);
		this.updated = true;
	};
	
	window.Plane = Plane;
	
} (window));