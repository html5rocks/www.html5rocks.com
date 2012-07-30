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
	
	var ShaderTexture = function(gl, useTexture) {
		this.initialize(gl, useTexture);
	};

	var p = ShaderTexture.prototype = {};
	
	p.initialize = function(gl, useTexture) {
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

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))  { trace("Could not initialise shaders"); }
	
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
		
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s00"), 0);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s01"), 1);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s02"), 2);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s03"), 3);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s04"), 4);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s05"), 5);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s06"), 6);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s07"), 7);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s08"), 8);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s09"), 9);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s10"), 10);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s11"), 11);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s12"), 12);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s13"), 13);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s14"), 14);
	    this.gl.uniform1i(this.gl.getUniformLocation(this.program, "s15"), 15);
	    
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
		return "\n"+
		  "#ifdef GL_ES									\n"+
		  "precision highp float;						\n"+
		  "#endif										\n"+

		  "varying vec3 vTransformedNormal;				\n"+
		  "varying vec4 vPosition;						\n"+
		  "varying vec4 vColor;							\n"+
		  "varying vec3 vTexture;						\n"+

		  "uniform bool uUseTexture;					\n"+
		  "uniform bool uUseGlobalLighting;				\n"+
		  "uniform bool uUsePointLighting;				\n"+

		  "uniform float uAlpha;						\n"+
		  
		  "uniform vec3 uPointDC;						\n"+
		  "uniform vec3 uPointAC;						\n"+
		  "uniform vec3 uPointLocation;					\n"+
		  "uniform vec3 uGlobalDC;						\n"+
		  "uniform vec3 uGlobalAC;						\n"+
		  "uniform vec3 uGlobalLocation;				\n"+

		  "uniform sampler2D s00,s01,s02,s03,s04,s05,s06,s07,s08,s09,s10,s11,s12,s13,s14,s15;			\n"+

		  "void main(void) {								\n"+	
			"float sampler = vTexture.z; 				\n"+
		  	"if(sampler < 16.0 && sampler > -0.5) {								\n"+
			"	vec4 texture; 								\n"+
			"	vec2 coords = vec2(vTexture.x, vTexture.y);	\n"+
			"		 if (sampler <= 0.5) { texture = texture2D(s00, coords); } \n" +
			"	else if (sampler <= 1.5) { texture = texture2D(s01, coords); } \n" +
			"	else if (sampler <= 2.5) { texture = texture2D(s02, coords); } \n" +
			"	else if (sampler <= 3.5) { texture = texture2D(s03, coords); } \n" +
			"	else if (sampler <= 4.5) { texture = texture2D(s04, coords); } \n" +
			"	else if (sampler <= 5.5) { texture = texture2D(s05, coords); } \n" +
			"	else if (sampler <= 6.5) { texture = texture2D(s06, coords); } \n" +
			"	else if (sampler <= 7.5) { texture = texture2D(s07, coords); } \n" +
			"	else if (sampler <= 8.5) { texture = texture2D(s08, coords); } \n" +
			"	else if (sampler <= 9.5) { texture = texture2D(s09, coords); } \n" +
			"	else if (sampler <= 10.5) { texture = texture2D(s10, coords); } \n" +
			"	else if (sampler <= 11.5) { texture = texture2D(s11, coords); } \n" +
			"	else if (sampler <= 12.5) { texture = texture2D(s12, coords); } \n" +
			"	else if (sampler <= 13.5) { texture = texture2D(s13, coords); } \n" +
			"	else if (sampler <= 14.5) { texture = texture2D(s14, coords); } \n" +
			"	else if (sampler <= 15.5) { texture = texture2D(s15, coords); } \n" +
			
			"	vec3 lightWeighting = vec3(1,1,1);		\n"+
			"	vec3 globalWeighting = vec3(1,1,1);		\n"+	
			"	if (uUsePointLighting) { 				\n"+
			"		vec3 lightDirection = normalize(uPointLocation - vPosition.xyz);			\n"+
			"		float directionalLightWeighting = max(dot(normalize(vTransformedNormal), lightDirection), 0.0); 	\n"+
			"		lightWeighting = uPointAC + uPointDC * directionalLightWeighting;			\n"+
			"	} 										\n"+
			"	if (uUseGlobalLighting) { 				\n"+
			"		vec3 globalDirection = normalize(uGlobalLocation - vPosition.xyz);			\n"+
			"		float directionalGlobalWeighting = max(dot(normalize(vTransformedNormal), globalDirection), 0.0);	\n"+
			"		globalWeighting = uGlobalAC + uGlobalDC * directionalGlobalWeighting;		\n"+
			"	}										\n"+
			"	gl_FragColor = vec4(vColor.rgb * (lightWeighting * globalWeighting) * texture.rgb, vColor.a * uAlpha * texture.a);	\n"+
			"} else {										\n"+
			"	gl_FragColor = vec4(vColor.rgb, vColor.a * uAlpha);		\n"+
			"}												\n"+
		  "}												\n";
	};

	p.getVertexSrc = function() {
		return "" +
		  "attribute vec3 aVertexPosition;		\n"+
		  "attribute vec4 aVertexColor;			\n"+
		  "attribute vec3 aVertexNormal;		\n"+
		  "attribute vec3 aTextureCoord;		\n"+

		  "uniform mat4 uPMatrix;				\n"+
		  "uniform mat4 uMVMatrix;				\n"+
		  "uniform mat3 uNMatrix;				\n"+

		  "varying vec4 vColor;					\n"+
		  "varying vec3 vTransformedNormal;		\n"+
		  "varying vec4 vPosition;				\n"+
		  "varying vec3 vTexture;				\n"+

		  "void main(void) {					\n"+
			  "vPosition = vec4(aVertexPosition, 1.0);			\n"+
			  "vColor = aVertexColor;			\n"+
			  "vTexture = aTextureCoord;		\n"+
			  "vTransformedNormal = aVertexNormal;	\n"+
			  "gl_Position = uPMatrix * uMVMatrix * vPosition;				\n"+
		  "}									\n";
		
	};

	window.ShaderTexture = ShaderTexture;
    
}(window));