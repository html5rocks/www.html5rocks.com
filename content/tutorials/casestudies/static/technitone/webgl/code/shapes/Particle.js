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
	var Particle = function(position, rotation, scale, textureSampler, life, velocity, acceleration, rVelocity, rAcceleration) {
		this.init(position, rotation, scale, textureSampler, life, velocity, acceleration, rVelocity, rAcceleration);
	};
	
	var p = Particle.prototype;
	
	/*
	 * Position is a vec3 representing xyz. 
	 * Rotation is a vec3 representing rotY, rotX, rotZ.
	 * Scale is a vec2 representing xScale and yScale.
	 * Color is a vec4 representing rgba.
	 * textureSampler is the int ID of the image it uses, if any (-1 if not).
	 * 
	 * velocity is the position change per update.
	 * acceleration is the velocity change per update (gravity effect, for example).
	 * rVelocity is the rotation change per update.
	 * rAcceleration is the rVelocity change per update.
	 */
	
	p.init = function(position, rotation, scale, textureSampler, life, velocity, acceleration, rVelocity, rAcceleration){		
		this.position(position);
		this.rotation(rotation);
		this.scale(scale);
		this.sampler(textureSampler);
		
		this._life = life;
		this._velocity = velocity ? velocity : [0,0,0]; 
		this._acceleration = acceleration ? acceleration : [0,0,0];
		this._rVelocity = rVelocity ? rVelocity : [0,0,0];
		this._rAcceleration = rAcceleration ? rAcceleration : [0,0,0];
	};
	p.reset = function() {
		this.position([0,0,0]);
		this.rotation([0,0,0]);
		this.scale([1,1]);
		this.color([0,0,0,1]);
		this._normal = [0,0,1];
		this.sampler(-1);
		
		this._velocity = [0,0,0]; 
		this._acceleration = [0,0,0];
		this._rVelocity = [0,0,0];
		this._rAcceleration = [0,0,0];
	};
	p.update = function() {
		// Apply velocity and acceleration.
		this._position = addVectors(this._position, this._velocity);
		this._velocity = addVectors(this._velocity, this._acceleration);
		this._rotation = addVectors(this._rotation, this._rVelocity);
		this._rVelocity = addVectors(this._rVelocity, this._rAcceleration);
		
		this._life--;
		if (this._life > 0) {
			return false;
		} else {
			return true;
		}
	};
	
	p.getPosition = function() { return this._position; };
	p.getRotation = function() { return this._rotation; };
	p.getScale = function() { return this._scale; };
	p.getSampler = function() { return this._sampler; };
	p.getPointCount = function() { return 3; };
	
	p.rotateX = function(rotation) { this._rotation[0] += rotation; };
	p.rotateY = function(rotation) { this._rotation[1] += rotation; };
	p.rotateZ = function(rotation) { this._rotation[2] += rotation; };
	p.resize = function(scale) { this._scale = addVectors(this._scale, scale); };
	p.position = function(pos) { this._position = pos ? pos : [0,0,0]; };
	p.rotation = function(rot) { this._rotation = rot ? rot : [0,0,0]; };
	p.scale = function(scale) { this._scale = scale ? scale : [1,1]; };
	p.color = function(color) { this._color = color ? color : [0,0,0,1]; };
	p.sampler = function(sampler) {	this._sampler = sampler; };
	
	window.Particle = Particle;
	
} (window));