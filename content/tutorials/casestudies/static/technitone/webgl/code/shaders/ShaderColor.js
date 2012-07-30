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
	
	var ShaderColor = function(gl, useTexture) {
		this.initialize(gl, useTexture);
	};

	var p = ShaderColor.prototype = {};
	
	p.initialize = function(gl) {
		this.gl = gl;
		
		// Attributes - usually set once, and are arrays with specified sizes to define "items".
		this.vertexPositionAttribute = undefined;
		this.vertexColorAttribute = undefined;
		this.vertexNormalAttribute = undefined;
		this.vertexTextureAttribute = undefined;
		
		// Uniforms - Directly set variables for each "item". Again, set only once, but they are used for each
		// item in relevance. For example, it can be the origin point for a spiral of particles.
	    this.useTexture = undefined;
	    this.sampler = undefined;

	    // Uniforms for viewing the object.
	    this.pMatrixUniform = undefined;
	    this.mvMatrixUniform = undefined;
	    this.alphaUniform = undefined;
	    
	    // Lighting.
	    this.pointACUniform = undefined;
	    this.pointDCUniform = undefined;
	    this.pointLocationUniform = undefined;
	    this.globalACUniform = undefined;
	    this.globalDCUniform = undefined;
	    this.globalLocationUniform = undefined;

		var fragmentShader = this.getShader(this.getFragmentSrc(), gl.FRAGMENT_SHADER);
		var vertexShader = this.getShader(this.getVertexSrc(), gl.VERTEX_SHADER);	
		
		this.program = gl.createProgram();
		gl.attachShader(this.program, vertexShader);
		gl.attachShader(this.program, fragmentShader);
		gl.linkProgram(this.program);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))  { 
			this.program = null;
			return; 
		}
	
		this.setAttributesAndUniforms();
	};
	
	p.setAttributesAndUniforms = function() {
	    this.use();

	    this.vertexPositionAttribute = this.gl.getAttribLocation(this.program, "aVertexPosition");
	    this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
	    
	    this.vertexColorAttribute = this.gl.getAttribLocation(this.program, "aVertexColor");
	    this.gl.enableVertexAttribArray(this.vertexColorAttribute);
	    
	    this.vertexNormalAttribute = this.gl.getAttribLocation(this.program, "aVertexNormal");
	    this.gl.enableVertexAttribArray(this.vertexNormalAttribute);

	    this.vertexTextureAttribute = this.gl.getAttribLocation(this.program, "aTextureCoord");
	    this.gl.enableVertexAttribArray(this.vertexTextureAttribute);
	    
	    this.useGlobal = this.gl.getUniformLocation(this.program, "uUseGlobalLighting");
	    this.usePoint = this.gl.getUniformLocation(this.program, "uUsePointLighting");
	
	    this.pMatrixUniform = this.gl.getUniformLocation(this.program, "uPMatrix");
	    this.mvMatrixUniform = this.gl.getUniformLocation(this.program, "uMVMatrix");
	    this.nMatrixUniform = this.gl.getUniformLocation(this.program, "uNMatrix");
	    this.alphaUniform = this.gl.getUniformLocation(this.program, "uAlpha");
	    
	    this.pointACUniform = this.gl.getUniformLocation(this.program, "uPointAC");
	    this.pointDCUniform = this.gl.getUniformLocation(this.program, "uPointDC");
	    this.pointLocationUniform = this.gl.getUniformLocation(this.program, "uPointLocation");
	    
	    this.globalACUniform = this.gl.getUniformLocation(this.program, "uGlobalAC");
	    this.globalDCUniform = this.gl.getUniformLocation(this.program, "uGlobalDC");
	    this.globalLocationUniform = this.gl.getUniformLocation(this.program, "uGlobalLocation");
			    
	    this.gl.uniform1f( this.useGlobal, 0 );
	    this.gl.uniform1f( this.usePoint, 1 );
	    this.gl.uniform1f( this.useNormal, 0 );
	    this.gl.uniform1f( this.alphaUniform, 1 );
	};
	
	p.getUniformLocation = function(name) {
		return this.gl.getUniformLocation(this.program, name);
	};

	p.use = function() {
		this.gl.useProgram(this.program);	
	};

	p.getShader = function(shaderSrc, shaderType) {		
		var shader = this.gl.createShader(shaderType);
		this.gl.shaderSource(shader, shaderSrc);
		this.gl.compileShader(shader);	

		if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) { alert("An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(shader)); return null;	}		

		return shader;
	};
	
	p.getFragmentSrc = function() {
		return ""+
		  "#ifdef GL_ES									\n"+
		  "precision highp float;						\n"+
		  "#endif										\n"+

		  "varying vec3 vTransformedNormal;				\n"+
		  "varying vec4 vPosition;						\n"+
		  "varying vec4 vColor;							\n"+

		  "uniform bool uUseGlobalLighting;				\n"+
		  "uniform bool uUsePointLighting;				\n"+

		  "uniform float uAlpha;						\n"+
		  
		  "uniform vec3 uPointDC;						\n"+
		  "uniform vec3 uPointAC;						\n"+
		  "uniform vec3 uPointLocation;					\n"+
		  "uniform vec3 uGlobalDC;						\n"+
		  "uniform vec3 uGlobalAC;						\n"+
		  "uniform vec3 uGlobalLocation;				\n"+

		  "void main(void) {							\n"+						
		"		vec3 lightWeighting = vec3(1,1,1);		\n"+
		"		vec3 globalWeighting = vec3(1,1,1);		\n"+	
		"		if (uUsePointLighting) { 				\n"+
		"			vec3 lightDirection = normalize(uPointLocation - vPosition.xyz);			\n"+
		"			float directionalLightWeighting = max(dot(normalize(vTransformedNormal), lightDirection), 0.0); 	\n"+
		"			lightWeighting = uPointAC + uPointDC * directionalLightWeighting;			\n"+
		"		} 										\n"+
		"		if (uUseGlobalLighting) { 				\n"+
		"			vec3 globalDirection = normalize(uGlobalLocation - vPosition.xyz);			\n"+
		"			float directionalGlobalWeighting = max(dot(normalize(vTransformedNormal), globalDirection), 0.0);	\n"+
		"			globalWeighting = uGlobalAC + uGlobalDC * directionalGlobalWeighting;		\n"+
		"		}										\n"+
		
		"		gl_FragColor = vec4(vColor.rgb * (lightWeighting * globalWeighting), vColor.a * uAlpha);	\n"+
		  "}												\n";
	};

	p.getVertexSrc = function() {
		return "" +
		  "attribute vec3 aVertexPosition;		\n"+
		  "attribute vec4 aVertexColor;			\n"+
		  "attribute vec3 aVertexNormal;		\n"+

		  "uniform mat4 uPMatrix;				\n"+
		  "uniform mat4 uMVMatrix;				\n"+
		  "uniform mat3 uNMatrix;				\n"+

		  "varying vec4 vColor;					\n"+
		  "varying vec3 vTransformedNormal;		\n"+
		  "varying vec4 vPosition;				\n"+

		  "void main(void) {					\n"+
			  "vPosition = vec4(aVertexPosition, 1.0);			\n"+
			  "vColor = aVertexColor;			\n"+
			  "vTransformedNormal = aVertexNormal;	\n"+
			  "gl_Position = uPMatrix * uMVMatrix * vPosition;				\n"+
		  "}									\n";
	};
		
	window.ShaderColor = ShaderColor;
    
}(window));