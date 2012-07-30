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
          'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 16.0 );',
          'gl_FragColor = vec4(1.0);',
          'gl_FragColor.a = intensity;',
        '}'
      ].join('\n')
    },
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: 0, texture: null }
      },
      vertexShader: [
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
          'vNormal = normalize( normalMatrix * normal );',
          'vUv = uv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform sampler2D texture;',
        'varying vec3 vNormal;',
        'varying vec2 vUv;',
        'void main() {',
          'vec3 diffuse = texture2D( texture, vUv ).xyz;',
          'float intensity = pow(1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 4.0);',
          'float i = 0.8-pow(clamp(dot( vNormal, vec3( 0, 0, 1.0 )), 0.0, 1.0), 1.5);',
          'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * intensity;',
          'float d = clamp(pow(max(0.0,(diffuse.r-0.062)*10.0), 2.0)*5.0, 0.0, 1.0);',
          'gl_FragColor = vec4( (d*vec3(i)) + ((1.0-d)*diffuse) + atmosphere, 1.0 );',
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
          'float i = 0.8-pow(clamp(dot( vNormal, vec3( 0, 0, 1.0 )), 0.0, 1.0), 0.7);',
          'gl_FragColor = vec4(i);',
          'gl_FragColor.a = 1.0;',
        '}'
      ].join('\n')
    }
  };

  var camera, scene, sceneAtmosphere, renderer, w, h;
  var vector, mesh, atmosphere, point;

  var overRenderer;

  var imgDir = '';

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 },
      target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
      targetOnDown = { x: 0, y: 0 };

  var distance = 100000, distanceTarget = 1200;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  function init() {

    container.style.color = '#fff';
    container.style.font = '13px/20px Arial, sans-serif';

    var shader, uniforms, material;
    w = window.innerWidth;
    h = window.innerHeight;

    camera = new THREE.Camera(
        30, w / h, 1, 10000);
    camera.position.z = distance;

    vector = new THREE.Vector3();

    scene = new THREE.Scene();
    sceneAtmosphere = new THREE.Scene();

    projector = new THREE.Projector();
    var PI2 = Math.PI * 2;
    particleMaterial = new THREE.ParticleBasicMaterial( {
      color: 0x000000
    } );

    var geometry = new THREE.Sphere(200, 40, 30);

    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].texture = THREE.ImageUtils.loadTexture(imgDir+'world' +
        '.jpg');

    material = new THREE.MeshShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    scene.addObject(mesh);

    function loadLineMesh(loader, material, offset) {
      var lines = loader().children[0].children[0].attributes.Vertex.elements;
      var lineGeo = new THREE.Geometry();
      for (var i=0; i<lines.length; i+=3) {
        lineGeo.vertices.push(new THREE.Vertex(new THREE.Vector3(lines[i], lines[i+1], lines[i+2])));
      }
      var lineMesh = new THREE.Line(lineGeo, material);
      lineMesh.type = THREE.Lines;
      lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000319 + offset * 0.0000001;
      lineMesh.rotation.x = -Math.PI/2;
      lineMesh.rotation.z = Math.PI;
      lineMesh.matrixAutoUpdate = false;
      lineMesh.updateMatrix();
      return lineMesh;
    }

    function loadTriMesh(loader, material) {
      var lines = loader().children[0].children[0].attributes.Vertex.elements;
      var lineGeo = new THREE.Geometry();
      var i = 0;
      for (i=0; i<lines.length; i+=3) {
        lineGeo.vertices.push(
          new THREE.Vertex(
            new THREE.Vector3(lines[i], lines[i+1], lines[i+2])
          )
        );
      }
      for (i=0; i<lines.length/3; i+=3) {
        lineGeo.faces.push(new THREE.Face3(i, i+1, i+2, null, null));
      }
      lineGeo.computeCentroids();
      lineGeo.computeFaceNormals();
      lineGeo.computeVertexNormals();
      lineGeo.computeBoundingSphere();
      var lineMesh = new THREE.Mesh(lineGeo, material);
      lineMesh.type = THREE.Triangles;
      lineMesh.scale.x = lineMesh.scale.y = lineMesh.scale.z = 0.0000319;
      lineMesh.rotation.x = -Math.PI/2;
      lineMesh.rotation.z = Math.PI;
      lineMesh.matrixAutoUpdate = false;
      lineMesh.doubleSided = true;
      lineMesh.updateMatrix();
      return lineMesh;
    }


    shader = Shaders['continents'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.MeshShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    scene.addObject(loadTriMesh(getWorld, material));

    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    material = new THREE.MeshShaderMaterial({

          uniforms: uniforms,
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader

        });

    mesh = new THREE.Mesh(geometry, material);
    mesh.scale.x = mesh.scale.y = mesh.scale.z = 1.1;
    mesh.flipSided = true;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    sceneAtmosphere.addObject(mesh);

    sceneAtmosphere.addObject(loadLineMesh(getCoast, new THREE.LineBasicMaterial({
      linewidth:2,
      color:0x000000, opacity: 0.8
    }), -0.4));
    sceneAtmosphere.addObject(loadLineMesh(getCoast, new THREE.LineBasicMaterial({
      linewidth:2,
      color:0x444444, opacity: 0.4
    }), 0.5));

    geometry = new THREE.Cube(0.75, 0.75, 1, 1, 1, 1, null, false, { px: true,
          nx: true, py: true, ny: true, pz: false, nz: true});

    for (var i = 0; i < geometry.vertices.length; i++) {

      var vertex = geometry.vertices[i];
      vertex.position.z += 0.5;

    }

    point = new THREE.Mesh(geometry);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.autoClear = false;
    renderer.setClearColorHex(0x000000, 0.0);
    renderer.setSize(w, h);

    renderer.domElement.style.position = 'absolute';

    var coastLine = getCoast();

    this.is_animated = false;
    this._baseGeometry = new THREE.Geometry();
    createPoints();

    container.appendChild(renderer.domElement);

    container.addEventListener('mousedown', onMouseDown, false);

    container.addEventListener('mousewheel', onMouseWheel, false);

    document.addEventListener('keydown', onDocumentKeyDown, false);

    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('mouseover', function() {
      overRenderer = true;
    }, false);

    container.addEventListener('mouseout', function() {
      overRenderer = false;
    }, false);
  }

  addData = function(data, opts) {
    var lat, lng, size, color, i, step, colorFnWrapper;

    opts.animated = opts.animated || false;
    this.is_animated = opts.animated;
    opts.format = opts.format || 'magnitude'; // other option is 'legend'
    console.log(opts.format);
    if (opts.format === 'magnitude') {
      step = 3;
      colorFnWrapper = function(data, i) { return colorFn(data[i+2]); }
    } else if (opts.format === 'legend') {
      step = 4;
      colorFnWrapper = function(data, i) { return colorFn(data[i+3]); }
    } else {
      throw('error: format not supported: '+opts.format);
    }

    if (opts.animated) {
      if (this._baseGeometry === undefined) {
        this._baseGeometry = new THREE.Geometry();
        for (i = 0; i < data.length; i += step) {
          lat = data[i];
          lng = data[i + 1];
//        size = data[i + 2];
          color = colorFnWrapper(data,i);
          size = 0;
          addPoint(lat, lng, size, color, this._baseGeometry);
        }
      }
      if(this._morphTargetId === undefined) {
        this._morphTargetId = 0;
      } else {
        this._morphTargetId += 1;
      }
      opts.name = opts.name || 'morphTarget'+this._morphTargetId;
    }
    var subgeo = new THREE.Geometry();
    for (i = 0; i < data.length; i += step) {
      lat = data[i];
      lng = data[i + 1];
      color = colorFnWrapper(data,i);
      size = data[i + 2];
      size = size*200;
      addPoint(lat, lng, size, color, subgeo);
    }
    if (opts.animated) {
      this._baseGeometry.morphTargets.push({'name': opts.name, vertices: subgeo.vertices});
    } else {
      this._baseGeometry = subgeo;
    }

  };

  function createPoints() {
    if (this._baseGeometry !== undefined) {
      if (this.is_animated === false) {
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: false
            }));
      } else {
        if (this._baseGeometry.morphTargets.length < 8) {
          console.log('t l',this._baseGeometry.morphTargets.length);
          var padding = 8-this._baseGeometry.morphTargets.length;
          console.log('padding', padding);
          for(var i=0; i<=padding; i++) {
            console.log('padding',i);
            this._baseGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._baseGeometry.vertices});
          }
        }
        this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
              color: 0xffffff,
              vertexColors: THREE.FaceColors,
              morphTargets: true
            }));
      }
      scene.addObject(this.points);
    }
  }

  function addPointXYZ(x, y, z, size, color, subgeo) {
    point.position.x = x;
    point.position.y = y;
    point.position.z = z;

    point.lookAt(mesh.position);

    point.scale.z = -size;
    point.updateMatrix();

    var i;
    for (i = 0; i < point.geometry.faces.length; i++) {

      point.geometry.faces[i].color = color;

    }

    GeometryUtils.merge(subgeo, point);
  }

  function addPoint(lat, lng, size, color, subgeo) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;

    var x = 200 * Math.sin(phi) * Math.cos(theta);
    var y = 200 * Math.cos(phi);
    var z = 200 * Math.sin(phi) * Math.sin(theta);

    return addPointXYZ(x,y,z,size,color,subgeo);
  }

  function addPointAt(p, size, color, subgeo) {
    return addPointXYZ(p.x, p.y, p.z, size, color, subgeo);
  }


  function onMouseDown(event) {
    event.preventDefault();

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseup', onMouseUp, false);
    container.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    clickEnabled = true;

    container.style.cursor = 'move';

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

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.01 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.01 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  lastClick = 0;

  function onMouseUp(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
    container.style.cursor = 'auto';

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
          if (dblClick) {
            scene.removeObject(intersects[0].object);
          } else {
            intersects[0].object.materials[0].color.setHex( Math.random() * 0xffffff );
          }
        } else if (dblClick) {
          var p = intersects[ 0 ].point;
          var geometry = new THREE.Cube(4,4,4,4,4,4);
          var point = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
            color: 0xff00ff
          }));
          point.position = p;
          point.is_a_point = true;
          scene.addObject(point);
        }

      }
    }

  }

  function onMouseOut(event) {
    container.removeEventListener('mousemove', onMouseMove, false);
    container.removeEventListener('mouseup', onMouseUp, false);
    container.removeEventListener('mouseout', onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }

  function onDocumentKeyDown(event) {
    switch (event.keyCode) {
      case 38:
        zoom(100);
        event.preventDefault();
        break;
      case 40:
        zoom(-100);
        event.preventDefault();
        break;
    }
  }

  function onWindowResize( event ) {
    console.log('resize');
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }
  var time = Date.now();
  function animate(t) {
    requestAnimationFrame(animate);
    t = t || Date.now();
    render(t-time);
    time = t;
  }

  function render(dt) {
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;
    target.x -= 0.003 * Math.min(33,dt)/16;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    vector.copy(camera.position);

    renderer.clear();
    renderer.render(scene, camera);
    renderer.render(sceneAtmosphere, camera);
  }

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

  this.addData = addData;
  this.createPoints = createPoints;
  this.renderer = renderer;
  this.scene = scene;

  return this;

};

