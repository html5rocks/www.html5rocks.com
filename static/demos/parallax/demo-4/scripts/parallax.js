(function(win, d) {

  var $ = d.querySelector.bind(d);

  var bg = $('#bg');
  var blob1 = $('#blob-1');
  var blob2 = $('#blob-2');
  var blob3 = $('#blob-3');
  var blob4 = $('#blob-4');
  var blob5 = $('#blob-5');
  var blob6 = $('#blob-6');
  var blob7 = $('#blob-7');
  var blob8 = $('#blob-8');
  var blob9 = $('#blob-9');

  var bgObj = null;
  var blob1Obj = null;
  var blob2Obj = null;
  var blob3Obj = null;
  var blob4Obj = null;
  var blob5Obj = null;
  var blob6Obj = null;
  var blob7Obj = null;
  var blob8Obj = null;
  var blob9Obj = null;

  var canvas = $('#blob-container canvas');
  var renderer = null;
  var camera = null;
  var scene = new THREE.Scene();

  if (Modernizr.webgl) {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: false,
      clearColor: 0x1e2124
    });
  } else if (Modernizr.canvas) {
    renderer = new THREE.CanvasRenderer({
      canvas: canvas
    });
    renderer.setClearColorHex(0x1e2124);
  }

  var mainBG = $('section#content');

  var ticking = false;
  var lastScrollY = 0;

  function onResize () {

    if(camera === null) {
      createElements();
      camera = new THREE.OrthographicCamera(0, 960, 0, window.innerHeight, -2000, 2000);
      scene.add(camera);
    } else {
      camera.bottom = window.innerHeight;
    }
    renderer.setSize(960, window.innerHeight);

    updateElements(win.pageYOffset);
  }

  function onScroll (evt) {
    if(!ticking) {
      ticking = true;
      lastScrollY = win.pageYOffset;
      requestAnimationFrame(updateElements);
    }
  }

  function createElements () {

    // create the sphere's material
    var bgTexture = new THREE.Texture(bg);
    var blob1Texture = new THREE.Texture(blob1);
    var blob2Texture = new THREE.Texture(blob2);
    var blob3Texture = new THREE.Texture(blob3);
    var blob4Texture = new THREE.Texture(blob4);
    var blob5Texture = new THREE.Texture(blob5);
    var blob6Texture = new THREE.Texture(blob6);
    var blob7Texture = new THREE.Texture(blob7);
    var blob8Texture = new THREE.Texture(blob8);
    var blob9Texture = new THREE.Texture(blob9);

    var bgMaterial = new THREE.MeshBasicMaterial({map: bgTexture});
    var blob1Material = new THREE.MeshBasicMaterial({map: blob1Texture});
    var blob2Material = new THREE.MeshBasicMaterial({map: blob2Texture});
    var blob3Material = new THREE.MeshBasicMaterial({map: blob3Texture});
    var blob4Material = new THREE.MeshBasicMaterial({map: blob4Texture});
    var blob5Material = new THREE.MeshBasicMaterial({map: blob5Texture});
    var blob6Material = new THREE.MeshBasicMaterial({map: blob6Texture});
    var blob7Material = new THREE.MeshBasicMaterial({map: blob7Texture});
    var blob8Material = new THREE.MeshBasicMaterial({map: blob8Texture});
    var blob9Material = new THREE.MeshBasicMaterial({map: blob9Texture});

    bgTexture.needsUpdate = true;
    blob1Texture.needsUpdate = true;
    blob2Texture.needsUpdate = true;
    blob3Texture.needsUpdate = true;
    blob4Texture.needsUpdate = true;
    blob5Texture.needsUpdate = true;
    blob6Texture.needsUpdate = true;
    blob7Texture.needsUpdate = true;
    blob8Texture.needsUpdate = true;
    blob9Texture.needsUpdate = true;

    bgObj = new THREE.Mesh(new THREE.PlaneGeometry(960, 3000, 1, 1), bgMaterial);
    blob1Obj = new THREE.Mesh(new THREE.PlaneGeometry(454, 454, 1, 1), blob1Material);
    blob2Obj = new THREE.Mesh(new THREE.PlaneGeometry(284, 284, 1, 1), blob2Material);
    blob3Obj = new THREE.Mesh(new THREE.PlaneGeometry(202, 202, 1, 1), blob3Material);
    blob4Obj = new THREE.Mesh(new THREE.PlaneGeometry(101, 101, 1, 1), blob4Material);
    blob5Obj = new THREE.Mesh(new THREE.PlaneGeometry(504, 504, 1, 1), blob5Material);
    blob6Obj = new THREE.Mesh(new THREE.PlaneGeometry(202, 202, 1, 1), blob6Material);
    blob7Obj = new THREE.Mesh(new THREE.PlaneGeometry(50, 50, 1, 1), blob7Material);
    blob8Obj = new THREE.Mesh(new THREE.PlaneGeometry(226, 226, 1, 1), blob8Material);
    blob9Obj = new THREE.Mesh(new THREE.PlaneGeometry(606, 606, 1, 1), blob9Material);

    bgObj.rotation.x =
    blob1Obj.rotation.x =
    blob2Obj.rotation.x =
    blob3Obj.rotation.x =
    blob4Obj.rotation.x =
    blob5Obj.rotation.x =
    blob6Obj.rotation.x =
    blob7Obj.rotation.x =
    blob8Obj.rotation.x =
    blob9Obj.rotation.x = Math.PI;

    bgObj.position.x = 480;
    blob1Obj.position.x = 711;
    blob2Obj.position.x = 226;
    blob3Obj.position.x = 685;
    blob4Obj.position.x = 95;
    blob5Obj.position.x = 212;

    blob6Obj.position.x = 426;
    blob7Obj.position.x = 750;
    blob8Obj.position.x = 683;
    blob9Obj.position.x = 943;

    bgObj.position.z =
    blob1Obj.position.z =
    blob2Obj.position.z =
    blob3Obj.position.z =
    blob4Obj.position.z =
    blob5Obj.position.z =
    blob6Obj.position.z =
    blob7Obj.position.z =
    blob8Obj.position.z =
    blob9Obj.position.z = -1;

    // add the sphere to the scene
    scene.add(bgObj);
    scene.add(blob1Obj);
    scene.add(blob2Obj);
    scene.add(blob3Obj);
    scene.add(blob4Obj);
    scene.add(blob5Obj);
    scene.add(blob6Obj);
    scene.add(blob7Obj);
    scene.add(blob8Obj);
    scene.add(blob9Obj);
  }

  function updateElements () {

    var relativeY = lastScrollY / 3000;

    bgObj.position.y = 1500 + pos(0, -3600, relativeY, 0);
    blob1Obj.position.y = 227 + pos(254, -4400, relativeY, 0);
    blob2Obj.position.y = 142 + pos(954, -5400, relativeY, 0);
    blob3Obj.position.y = 101 + pos(1054, -3900, relativeY, 0);
    blob4Obj.position.y = 50 + pos(1400, -6900, relativeY, 0);
    blob5Obj.position.y = 252 + pos(1730, -5900, relativeY, 0);
    blob6Obj.position.y = 101 + pos(2860, -7900, relativeY, 0);
    blob7Obj.position.y = 25 + pos(2550, -4900, relativeY, 0);
    blob8Obj.position.y = 113 + pos(2300, -3700, relativeY, 0);
    blob9Obj.position.y = 303 + pos(3700, -9000, relativeY, 0);

    renderer.render(scene, camera);
    ticking = false;
  }

  function pos(base, range, relY, offset) {
    return base + limit(0, 1, relY - offset) * range;
  }

  function prefix(obj, prop, value) {
    var prefs = ['webkit', 'moz', 'o', 'ms'];
    for (var pref in prefs) {
      obj[prefs[pref] + prop] = value;
    }
  }

  function limit(min, max, value) {
    return Math.max(min, Math.min(max, value));
  }

  win.addEventListener('load', onResize, false);
  win.addEventListener('resize', onResize, false);
  win.addEventListener('scroll', onScroll, false);

})(window, document);
