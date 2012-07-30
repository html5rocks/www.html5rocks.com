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
	var ParticleEmitter = function(position, rotation, scale, color, textures, frequency, life, velocity, acceleration, rVelocity, rAcceleration) {
		this.init(position, rotation, scale, color, textures, frequency, life, velocity, acceleration, rVelocity, rAcceleration);
	};
	
	var p = ParticleEmitter.prototype;
	
	/*
	 * Position is a vec3 representing xyz. 
	 * Direction is a vec3 representing rotY, rotX, rotZ.
	 * Scale is a vec2 representing xScale and yScale.
	 * Color is a vec4 representing rgba. You can send an array to use multiple colors at random.
	 * textureSampler is the int ID of the image it uses, if any. You can send an array to use multiple textures at random.
	 * frequency is the number of particles that spawn per update.
	 * life is the life each particle has (send a vec2 to randomize between 2 values).
	 */
	
	p.init = function(position, rotation, scale, color, textures, frequency, life, velocity, acceleration, rVelocity, rAcceleration){
		this._MAX_PARTICLES = 10000;
		
		this._matrix = mat4.identity(mat4.create());
		// This is a temp matrix for particles. Instead of storing a matrix in each particle, we'll store one here.
		this._particleMatrix = mat4.identity(mat4.create());
		
		this._position = position;
		this._rotation = rotation;
		this._scale = scale;
		
		this._particles = [];
		this._particlePool = [];
		
		this._color = color;
		this._textures = [];
		
		if (textures.length) {
			for (var i = 0, l = textures.length; i < l; i++) {
				this._textures.push(textures[i]);
			}
		} else {
			this._textures.push(textures);
		}
		
		this._frequency = frequency;
		
		this.life(life ? life : 10);
		this.velocity(velocity ? velocity : [0,0,0]);
		this.acceleration(acceleration ? acceleration : [0,0,0]);
		this.rVelocity(rVelocity ? rVelocity : [0,0,0]);
		this.rAcceleration(rAcceleration ? rAcceleration : [0,0,0]);
		
		this._vertexCount = 24;
		
		this._vertices = new Float32Array(this._vertexCount);
		this._particleVertices = new Float32Array(this._vertexCount);
	};
	
	p.update = function() {
		// Update and sometimes remove existing particles.
		var i = 0, l = 0;
		for (i = 0, l = this._particles.length; i < l; i++) {
			if (this._particles[i].update()) {
				this.removeParticle(i);
				i--; l--;
			}
		}
		
		// Create new particles, but only if maxLife is greater than 0 (no point otherwise).
		if (this._minLife + this._rangeLife > 0 && this._particles.length < this._MAX_PARTICLES) {
			for (var i = 0; i < this._frequency; i++) {
				var tIndex = Math.floor(Math.random() * this._textures.length);
				this._particles.push( this.newParticle(
					[0,0,0],[0,0,0],[1,1],this._textures[tIndex],
					Math.random() * this._rangeLife + this._minLife,
					getBetweenVec(this._minVel,this._rangeVel),
					getBetweenVec(this._minAcc,this._rangeAcc),
					getBetweenVec(this._minRVel,this._rangeRVel),
					getBetweenVec(this._minRAcc,this._rangeRAcc)
				));
			}
		}
	};
	
	/*
	 * Instead of just creating a new particle each time the emitter wants to, we instead have a store for older particles.
	 * This lets us reuse objects instead of repeatedly create/destroy particle objects.
	 */
	
	p.newParticle = function(pos,rot,scale,sampler,life, velocity, acceleration, rVelocity, rAcceleration) {
		if (this._particlePool.length > 0) {
			var particle = this._particlePool.pop();
			particle.init(pos,rot,scale,sampler,life, velocity, acceleration, rVelocity, rAcceleration);
			return particle;
		} else {
			return new Particle(pos,rot,scale,sampler,life, velocity, acceleration, rVelocity, rAcceleration);
		}
	};
	
	p.getVertices = function(matrix) {
		mat4.translate(matrix, this._position, this._matrix);
		mat4.rotate(this._matrix, this._rotation[0], [1,0,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[1], [0,1,0], this._matrix);
		mat4.rotate(this._matrix, this._rotation[2], [0,0,1], this._matrix);
		mat4.scale(this._matrix, [this._scale[0], this._scale[1], 1], this._matrix);
		
		this.update();
		
		var par,pos,rot,sca,j;
		
		var vertices = this._vertices;
		
		for (var i = 0, l = this._particles.length; i < l; i++) {
			par = this._particles[i];
			
			pos = par.getPosition();
			rot = par.getRotation();
			sca = par.getScale();
			
			j = i * this._vertexCount;
			
			mat4.translate(this._matrix, pos, this._particleMatrix);
			mat4.rotate(this._particleMatrix, rot[0], [1,0,0], this._particleMatrix);
			mat4.rotate(this._particleMatrix, rot[1], [0,1,0], this._particleMatrix);
			mat4.rotate(this._particleMatrix, rot[2], [0,0,1], this._particleMatrix);
			mat4.scale(this._particleMatrix, [sca[0], sca[1], 1], this._particleMatrix);
			
			if (j + this._vertexCount > vertices.length) {
				var newVertices = new Float32Array(j + this._vertexCount);
				newVertices.set(vertices, 0);
				this._vertices = newVertices;
				vertices = this._vertices;
			}
			
			var sam = par.getSampler();
						
			vertices.set(mat4.multiplyVec3(this._particleMatrix, [-1,-1, 0]), j);
			vertices.set(mat4.multiplyVec3(this._particleMatrix, [-1, 1, 0]), j+6);
			vertices.set(mat4.multiplyVec3(this._particleMatrix, [ 1, 1, 0]), j+12);
			vertices.set(mat4.multiplyVec3(this._particleMatrix, [ 1,-1, 0]), j+18);
			
			vertices.set([0,0,sam], j+3);
			vertices.set([0,1,sam], j+9);
			vertices.set([1,1,sam], j+15);
			vertices.set([1,0,sam], j+21);
		}
		
		return vertices;
	};
	
	p.getColor = function() {
		return this._color;
	};
	
	p.getMatrix = function() {
		return this._matrix;
	};
	
	p.getPointCount = function() {
		return this._particles.length * 4;
	};
	
	p.frequency = function(value) {
		this._frequency = parseInt(value);
	};
	
	p.count = function(value) {
		this._MAX_PARTICLES = parseInt(value);
	};
		
	p.life = function(value) {
		if (value.length) {
			this._minLife = value[0];
			this._rangeLife = value[1] - value[0];
		} else {
			this._minLife = value;
			this._rangeLife = 0;
		}
	};
	p.velocity = function(value) {
		if (value[0].length) {
			this._minVel = value[0];
			this._rangeVel = subtractVectors(value[1],value[0]);
		} else {
			this._minVel = value;
			this._rangeVel = [0,0,0];
		}
	};
	p.acceleration = function(value) {
		if (value[0].length) {
			this._minAcc = value[0];
			this._rangeAcc = subtractVectors(value[1],value[0]);
		} else {
			this._minAcc = value;
			this._rangeAcc = [0,0,0];
		}
	};
	p.rVelocity = function(value) {
		if (value[0].length) {
			this._minRVel = value[0];
			this._rangeRVel = subtractVectors(value[1],value[0]);
		} else {
			this._minRVel = value;
			this._rangeRVel = [0,0,0];
		}
	};
	p.rAcceleration = function(value) {
		if (value[0].length) {
			this._minRAcc = value[0];
			this._rangeRAcc = subtractVectors(value[1],value[0]);
		} else {
			this._minRAcc = value;
			this._rangeRAcc = [0,0,0];
		}
	};
	
	
	/*
	 * Because we may deal with thousands of particles, it would be beneficial to reuse particles instead
	 * of constantly create/delete them. This is why we've created a pool array to store unused particles.
	 */
	
	p.removeParticle = function(index) {
		var particle = this._particles[index];
		this._particles.splice(index,1);
		this._particlePool.push(particle);
	};
	
	p.destroy = function() {
		for (var i = 0, l = this._particles.length; i < l; i++) {
			this._particles[i] = null;
		}
		this._particles = null;
		for (var i = 0, l = this._particlePool.length; i < l; i++) {
			this._particlePool[i] = null;
		}
		this._particlePool = null;
	};
	
	window.ParticleEmitter = ParticleEmitter;
	
} (window));