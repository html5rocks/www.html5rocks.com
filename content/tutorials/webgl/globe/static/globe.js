/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

var DAT = DAT || {};

DAT.Globe = function(container, colorFn) {

  var AUTOROTATE_DELAY = 5000;
  var AUTOROTATE_RESUME_DELAY = 5000;
  var animDuration = 3000; // carousel anim duration

  var fov = 30;

  colorFn = colorFn || function(x) {
    var c = new THREE.Color();
    c.setHSV( ( 0.6 - ( x * 0.5 ) ), 1.0, 1.0 );
    return c;
  };

  var Shaders = {
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vNormal = normalize( normalMatrix * normal );',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float intensity = pow( 0.5 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 8.0 );',
          'gl_FragColor = vec4(1.0);',
          'gl_FragColor.a = pow(intensity*0.8, 2.0);',
        '}'
      ].join('\n')
    },

    'continents' : {
      uniforms: {},
      vertexShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'vec4 pos = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normalize( position ));',
          'gl_Position = pos;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'varying vec3 vNormal;',
        'void main() {',
          'float i = pow(clamp(dot( vNormal, normalize(vec3( 0.0, 2.0, 1.0 ))), 0.0, 1.0), 1.5);',
          'float i2 = 0.8-pow(clamp(dot( vNormal, normalize(vec3( 0.0, -0.0, 1.0 ))), 0.0, 1.0), 1.7);',
          'gl_FragColor = vec4(0.8, 0.85, 0.9, 1.0) * vec4(i*i*i+0.0*clamp(i2,0.0,1.0));',
          'gl_FragColor.a = 1.0;',
        '}'
      ].join('\n')
    }
  };

  var camera, scene, sceneAtmosphere, renderer, w, h;
  var vector, mesh, atmosphere, point;

  var locations,currentLocation,locIndex;

  var overRenderer;
  var startTime = 0;

  var imgDir = '';

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 }, startPoint = { x:0, y:0 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };

  var distance = 10000, distanceTarget = 250;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  var autoRotate = true;
  var infoDiv, startAutoRotate;



  function init() {

    /* Set up three.js basics */

    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    w = document.body.clientWidth;
    h = document.body.clientHeight;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    renderer.setClearColorHex(0x0, 0.0);
    renderer.setSize(w, h);

    renderer.domElement.style.position = 'absolute';

    this.is_animated = false;
    this._baseGeometry = new THREE.Geometry();

    container.appendChild(renderer.domElement);

    camera = new THREE.Camera(
        fov, w / h, 1, 10000);
    camera.position.z = distance;

    vector = new THREE.Vector3();

    scene = new THREE.Scene();
    sceneAtmosphere = new THREE.Scene();

    projector = new THREE.Projector();
    var PI2 = Math.PI * 2;
    particleMaterial = new THREE.ParticleBasicMaterial( {
      color: 0x000000
    } );

    var shader, uniforms, material;
    var sphereGeometry = new THREE.Sphere(200, 80, 30);




    /* Create atmosphere glow sphere */

    var atmosphereShader = Shaders['atmosphere'];
    atmosphereUniforms = THREE.UniformsUtils.clone(atmosphereShader.uniforms);

    var atmosphereMaterial = new THREE.MeshShaderMaterial({
      uniforms: atmosphereUniforms,
      vertexShader: atmosphereShader.vertexShader,
      fragmentShader: atmosphereShader.fragmentShader
    });

    var atmosphereMesh = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
    atmosphereMesh.scale.x = atmosphereMesh.scale.y = atmosphereMesh.scale.z = 1.08;
    atmosphereMesh.flipSided = true;
    atmosphereMesh.matrixAutoUpdate = false;
    atmosphereMesh.updateMatrix();
    // render atmosphere glow first to have the earth sphere block it
    sceneAtmosphere.addObject(atmosphereMesh);



    /* Create Earth sphere */

    /* Make the Earth sphere matte black */
    var earthMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

    var earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthMesh.matrixAutoUpdate = false;
    // add black earth on top of atmosphere glow
    scene.addObject(earthMesh);



    /* Create the continents */

    var continentsShader = Shaders['continents'];
    continentsUniforms = THREE.UniformsUtils.clone(continentsShader.uniforms);

    var continentsMaterial = new THREE.MeshShaderMaterial({
          uniforms: continentsUniforms,
          vertexShader: continentsShader.vertexShader,
          fragmentShader: continentsShader.fragmentShader
        });
    // add continents on top of black earth sphere
    scene.addObject(loadTriMesh(getWorld, continentsMaterial));




    /* Add country outlines on top of the continent mesh */

    // country outlines
    scene.addObject(loadLineMesh(getCountry,
    new THREE.LineBasicMaterial({
      linewidth: 1,
      color: 0x444444, opacity: 1
    }), 0.1));




    /* Add thin continent outlines on top the continent mesh */

    // thin continent outlines
    scene.addObject(loadLineMesh(getCoast,
    new THREE.LineBasicMaterial({
      linewidth: 1,
      color: 0x000000, opacity: 1
    }), 0.1));


    // continent shadow outlines
    var useContinentShadowOutlines = false;
    if (useContinentShadowOutlines) {
      scene.addObject(loadLineMesh(getCoast, new THREE.LineBasicMaterial({
        linewidth: 2,
        color: 0x00ccff, opacity: 1
      }), -1.8));
    }



    /* Add markers to the globe */

    locations = clusterLocations(Coords);

    if (window.location.search != '?full') {
      locations = locations.slice(0,30);
    }

    var transform = THREE.Matrix4.makeInvert(scene.matrix);
    for (var i=0; i<locations.length; i++) {
      var loc = locations[i];
      if (loc.coords[1] == null || isNaN(loc.coords[1]) 
          || loc.coords[0] == null || isNaN(loc.coords[0])) {
        locations.splice(i,1);
        i--;
        continue;
      }
      loc.x = -Math.PI/2+loc.coords[1] * Math.PI/180;
      loc.y = loc.coords[0] * Math.PI/180;
      loc.point = createPoint(transform, loc.coords[0], loc.coords[1]);
      loc.marker = createMarker(loc.name, loc.locations);
      loc.marker.location = loc;
      loc.marker.onclick = function(ev) {
        gotoLocation(this.location);
        ev.preventDefault();
      };
      loc.point.location = loc;
      loc.point.updateMatrix();
      //scene.addChild(loc.point);
    }
    locIndex = 0;
    currentLocation = locations[locIndex];
    /* Start the location carousel */
    startAutoRotate = function() {
      locIndex = (locIndex+1) % locations.length;
      currentLocation = locations[locIndex];
      gotoLocation(currentLocation);
      autoRotate = true;
      autoRotateTimeout = setTimeout(startAutoRotate, AUTOROTATE_DELAY);
    };
    startAutoRotate();



    /* Add event listeners */

    container.addEventListener('mousedown', onMouseDown, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);

  } // end init()




  /* Carousel to the given location */  
  function gotoLocation(location) {
    currentLocation = location;
    startTime = new Date().getTime();
    startPoint.x = rotation.x;
    startPoint.y = rotation.y;
    target.y = location.y;
    target.x = location.x;
  }

  /* Stop carousel advance */
  function stopAutoRotate() {
    autoRotate = false;
  }



  /* Event listeners */

  var down = false;
  function onMouseDown(event) {
    event.preventDefault();

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mouseup', onMouseUp, false);
    window.addEventListener('blur', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    clickEnabled = true;
    down = true;

    container.style.cursor = 'move';

    if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    autoRotateTimeout = setTimeout(function() { startAutoRotate(); }, AUTOROTATE_RESUME_DELAY);
    autoRotate = false;
  }

  function onMouseMove(event) {
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var dx = mouseOnDown.x - (-event.clientX);
    var dy = mouseOnDown.y - event.clientY;
    var d = Math.sqrt(dx*dx + dy*dy);
    if (d > 5) {
      clickEnabled = false;
    }

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp * 3;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp * 3;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;

    if (down) {
      if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
      autoRotateTimeout = setTimeout(function() { startAutoRotate(); }, AUTOROTATE_RESUME_DELAY);
    }
  }

  var lastClick = 0;
  var autoRotateTimeout = 0;

  function onMouseUp(event) {
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('mouseup', onMouseUp, false);
    window.removeEventListener('blur', onMouseOut, false);
    container.style.cursor = 'auto';

    if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    autoRotateTimeout = setTimeout(function() { startAutoRotate(); }, AUTOROTATE_RESUME_DELAY);
    autoRotate = false;

    down = false;

    if (clickEnabled) {
      var t = new Date().getTime();
      var dblClick = (t-lastClick < 300);
      lastClick = t;

      var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
      projector.unprojectVector( vector, camera );

      var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

      var intersects = ray.intersectScene( scene );
      if ( intersects.length > 0 ) {
        if (intersects[0].object.is_a_point) {
          gotoLocation(intersects[0].object.location);
        }

      }
    }

  }

  function onMouseOut(event) {
    window.removeEventListener('mousemove', onMouseMove, false);
    window.removeEventListener('mouseup', onMouseUp, false);
    window.removeEventListener('blur', onMouseOut, false);
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        event.preventDefault();
        break;
      case 40:
        event.preventDefault();
        break;
    }
  }

  function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function resetMarkers() {
    for (var i=0; i<locations.length; i++) {
      locations[i].marker.setAttribute('current', 'false');
    }
  }

  function updateMarkers() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var aspect = w/h;
    var w2 = w/2;
    var h2 = h/2;
    var current = null;

    renderer.domElement.style.zIndex = 1000000;

    var mat = new THREE.Matrix4();
    var v = new THREE.Vector3();
    var zeroZ = null;
    var visible = 0;
    for (var i=0; i<locations.length; i++) {
      mat.copy(scene.matrix);
      if (zeroZ == null) {
        v.set(0,0,0);
        mat.multiplyVector3(v);
        projector.projectVector(v, camera);
        zeroZ = v.z;
      }
      mat.multiplySelf(locations[i].point.matrix);
      v.set(0,0,0);
      mat.multiplyVector3(v);
      projector.projectVector(v, camera);
      var x = w*(v.x+1)/2;
      var y = h-h*(v.y+1)/2;
      var z = v.z - zeroZ;
      var m = locations[i].marker;
      if (y > h+50) {
        if (m.visible) {
          m.style.display = 'none';
          m.visible = false;
        }
      } else  {
        if (!m.visible) {
          m.style.display = 'block';
          m.visible = true;
        }
        m.style.left = x+'px';
        m.style.top = y+'px';
        if (currentLocation == locations[i] && currentLocation.marker.getAttribute('current') == 'true') {
          m.style.zIndex = 10000000;
        } else {
          m.style.zIndex = Math.round(1000000 - 1000000*z);
        }
        if (distance < 270 && m.style.opacity != 1) {
          m.style.opacity = 1;
          m.style.webkitTransform = 'translateZ(0) rotateY(0deg)';
        }
        m.firstChild.style.opacity = (1 - (Math.abs(x-(w/2)) / (w/2)));
        if (m.parentNode == null) {
          container.appendChild(m);
        }
        if (m.style.zIndex < renderer.domElement.style.zIndex) {
          m.firstChild.style.pointerEvents = 'none';
        } else {
          m.firstChild.style.pointerEvents = 'auto';
        }
      }
    }
  }



  function render() {
    // Move globe towards target position

    zoom(curZoomSpeed);

    var dist = distance;
    resetMarkers();

    var totald = 0;
    var isnf = 0;
    distance += (distanceTarget - distance) * 0.06;

    if (autoRotate) {
      // Move between current location and the carousel target location
      var currentTime = new Date().getTime();
      var tf = Math.min(1, (currentTime - startTime) / animDuration);
      var ttf = -Math.cos(tf*Math.PI)*0.5 + 0.5;

      rotation.x = startPoint.x * (1-ttf) + target.x * ttf;
      rotation.y = startPoint.y * (1-ttf) + target.y * ttf;

      var dy = target.y-rotation.y;
      var dx = target.x-rotation.x;
      var d = Math.sqrt(dx*dx + dy*dy);

      var totaldx = target.x-startPoint.x;
      var totaldy = target.y-startPoint.y;
      totald = Math.sqrt(totaldx*totaldx + totaldy*totaldy);
      var f = d/totald;

      var nf = 2*(f-0.5);
      isnf = Math.pow(-Math.cos(f*Math.PI*2)*0.5+0.5, 0.33);
      dist = distance;

      if (d <= 0.04) {
        currentLocation.marker.setAttribute('current', 'true');
      }


    } else {
      // move toward target location (mouse drag listener moves target)
      rotation.x += (target.x - rotation.x) * 0.2;
      rotation.y += (target.y - rotation.y) * 0.2;

      var closestLocation = locations[0];
      var dy = closestLocation.y-rotation.y;
      var dx = closestLocation.x-rotation.x;
      var d = Math.sqrt(dx*dx + dy*dy);

      for (var i=1; i<locations.length; i++) {
        var location = locations[i];
        var ldy = location.y-rotation.y;
        var ldx = location.x-rotation.x;
        var ld = Math.sqrt(ldx*ldx + ldy*ldy);
        if (ld < d) {
          dx = ldx; dy = ldy; d = ld;
          closestLocation = location;
        }
      }

      if (closestLocation == currentLocation && d <= 0.1) {
        currentLocation.marker.setAttribute('current', 'true');
      }
    }


    // move camera to correct height and orientation
    // rotate scene and atmosphere to wanted orientation

    var nearY = -(1200-250)/7;
    var nearTY = (1200-250)/0.7;
    var nearPosZ = 250 - (1200-250)/200;
    var f = (dist - 250) / (1200-250);

    camera.position.z = f * dist + (1-f) * nearPosZ;
    camera.position.y = Math.pow((1-f), 4) * nearY;
    camera.fov = 30 + isnf * totald * 5;
    camera.updateProjectionMatrix();
    camera.target.position.y = Math.pow((1-f), 10) * nearTY;
    scene.rotation.y = -rotation.x;
    scene.rotation.x = rotation.y;
    scene.updateMatrix();
    sceneAtmosphere.rotation.y = -rotation.x;
    sceneAtmosphere.rotation.x = rotation.y;
    sceneAtmosphere.updateMatrix();

    vector.copy(camera.position);

    // update marker positions
    updateMarkers();

    // render scene

    renderer.clear();
    renderer.render(sceneAtmosphere, camera);
    var gl = renderer.getContext();
    gl.clear(gl.DEPTH_BUFFER_BIT);
    renderer.render(scene, camera);
  }




  /* Load an outline mesh (country borders, continent outlines), spherize 
   * and scale it to globe size */
  function loadLineMesh(loader, material, offset) {
    var coords = loader().children[0].children[0].attributes.Vertex.elements;
    var lines = [];
    for (i=0; i<coords.length; i+=3) {
      lines.push(new THREE.Vector3(coords[i], coords[i+1], coords[i+2]));
    }
    lines = spherizeLines(lines, 1/64);
    var lineGeo = new THREE.Geometry();
    for (var i=0; i<lines.length; i++) {
      lineGeo.vertices.push(new THREE.Vertex(lines[i]));
    }
    var lineMesh = new THREE.Line(lineGeo, material);
    lineMesh.type = THREE.Lines;
    lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000315 + offset*0.0000001;
    lineMesh.rotation.x = -Math.PI/2;
    lineMesh.rotation.z = Math.PI;
    lineMesh.matrixAutoUpdate = false;
    lineMesh.updateMatrix();
    return lineMesh;
  }

  /* Load a triangle mesh (continents), spherize and scale it to globe size */
  function loadTriMesh(loader, material) {
    var coords = loader().children[0].children[0].attributes.Vertex.elements;
    var lineGeo = new THREE.Geometry();
    var i = 0;
    var lines = [];
    for (i=0; i<coords.length; i+=3) {
      lines.push(new THREE.Vector3(coords[i], coords[i+1], coords[i+2]));
    }
    lines = spherizeTris(lines, 1/64);
    for (i=0; i<lines.length; i++) {
      lineGeo.vertices.push(new THREE.Vertex(lines[i]));
    }
    for (i=0; i<lines.length; i+=3) {
      lineGeo.faces.push(new THREE.Face3(i, i+1, i+2, null, null));
    }
    lineGeo.computeCentroids();
    lineGeo.computeFaceNormals();
    lineGeo.computeVertexNormals();
    lineGeo.computeBoundingSphere();
    var lineMesh = new THREE.Mesh(lineGeo, material);
    lineMesh.type = THREE.Triangles;
    lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000315;
    lineMesh.rotation.x = -Math.PI/2;
    lineMesh.rotation.z = Math.PI;
    lineMesh.matrixAutoUpdate = false;
    lineMesh.doubleSided = true;
    lineMesh.updateMatrix();
    return lineMesh;
  }

  /* Create point at given lat-lon coords */
  function createPoint(transform, latDeg, lonDeg) {
    var lat = latDeg * Math.PI/180;
    var lon = lonDeg * Math.PI/180;
    var r = 200;
    var p = new THREE.Vector3(
      -r * Math.cos(lat) * Math.cos(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.sin(lon)
    );
    var m = transform;
    p = m.multiplyVector3(p);
    var geometry = new THREE.Cube(0.1,0.1,0.01,4,4,4);
    var point = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
      color: 0xff0000
    }));
    point.lookAt(p);
    point.position = p;
    point.is_a_point = true;
    return point;
  }

  /* Cluster locations by binning them */
  function clusterLocations(locations) {
    var coords = {};
    for (var i=0; i<locations.length; i++) {
      var loc = locations[i];
      var lat = Math.round(loc.coords[0]/15);
      var lon = Math.round(loc.coords[1]/15);
      var k = lat + ':' + lon;
      if (coords[k] == null) {
        coords[k] = [];
      }
      coords[k].push(loc);
    }
    var locs = [];
    for (var k in coords) {
      var c = coords[k];
      var lat = 0;
      var lon = 0;
      for (var i=0; i<c.length; i++) {
        lat += c[i].coords[0];
        lon += c[i].coords[1];
      }
      lat /= c.length;
      lon /= c.length;
      var cluster = {
        coords: [lat, lon],
        name: c.length,
        locations: c
      };
      locs.push(cluster);
    }
    return locs;
  } // end clusterLocations





  /* Initialize Globe */


  init();
  this.animate = animate;



  this.__defineGetter__('time', function() {
    return this._time || 0;
  });

  this.__defineSetter__('time', function(t) {
    var validMorphs = [];
    var morphDict = this.points.morphTargetDictionary;
    for(var k in morphDict) {
      if(k.indexOf('morphPadding') < 0) {
        validMorphs.push(morphDict[k]);
      }
    }
    validMorphs.sort();
    var l = validMorphs.length-1;
    var scaledt = t*l+1;
    var index = Math.floor(scaledt);
    for (i=0;i<validMorphs.length;i++) {
      this.points.morphTargetInfluences[validMorphs[i]] = 0;
    }
    var lastIndex = index - 1;
    var leftover = scaledt - index;
    if (lastIndex >= 0) {
      this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
    }
    this.points.morphTargetInfluences[index] = leftover;
    this._time = t;
  });



  this.renderer = renderer;
  this.scene = scene;



  return this;

};

