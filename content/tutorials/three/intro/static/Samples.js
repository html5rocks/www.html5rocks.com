/**
 * Three.js Tutorial Samples
 * 
 * @author Paul Lewis
 */
var THREETUT = THREETUT || {};
THREETUT.Samples = new function()
{
	// set the scene size for
	// all of the samples
	var WIDTH = 750,
	    HEIGHT = 245;
	
	// set some camera attributes
	// for all samples
	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;
	
	this.createSample = function(elID) {
	
		var setup 		= setupScene(),
		$container 		= $(elID);
	
		// attach the render-supplied DOM element
		$container.append(setup.renderer.domElement);
		
		var shaderMaterial = new THREE.MeshLambertMaterial({
			color: 0xCC0000
		});
		
		// now create a sphere
		var sphere = new THREE.Mesh(new THREE.Sphere(100,16,16), shaderMaterial);
		
		// create a point light
		var pointLight = new THREE.PointLight( 0xFFFFFF );
		
		// set its position
		pointLight.position.x = 10;
		pointLight.position.y = 50;
		pointLight.position.z = 130;
		
		// add to the scene
		setup.scene.addLight(pointLight);
		
		setup.scene.addChild(sphere);
		setup.renderer.render(setup.scene, setup.camera);
		
		return setup;
	};
	
	function setupScene() {
	
		// set up the rendere and camera
		var renderer = new THREE.WebGLRenderer();
		var camera = new THREE.Camera(  VIEW_ANGLE,
		                                ASPECT,
		                                NEAR,
		                                FAR  );
	
		var scene = new THREE.Scene();
		
		// the camera starts at 0,0,0 so pull it back
		camera.position.z = 300;
		
		// start the renderer - set the clear colour
		// to a full black
		renderer.setClearColor(new THREE.Color(0x111111, 1));
		renderer.setSize(WIDTH, HEIGHT);
		
		return {
			camera: camera,
			scene: scene,
			renderer: renderer
		};
	}
};

// Samples
$(document).ready(function(){
	
	THREETUT.Samples.createSample("#sample-1");
});