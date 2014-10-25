window.onload = function() {
  var renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setClearColor( 0xffffff );
  document.body.appendChild(renderer.domElement);

  var camera = new THREE.PerspectiveCamera(45,1,4,40000);
  camera.setLens(35);

  window.onresize = function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  window.onresize();

  var radius = 60;

  var scene = new THREE.Scene();
  camera.position.z = radius;
  scene.add(camera);

  var fontSize = 16;
  var lettersPerSide = 16;
  var c = document.createElement('canvas');
  c.width = c.height = fontSize*lettersPerSide;
  var ctx = c.getContext('2d');
  ctx.font = fontSize+'px Monospace';
  var i=0;

  for (var y=0; y<lettersPerSide; y++) {
    for (var x=0; x<lettersPerSide; x++,i++) {
      var ch = String.fromCharCode(i);
      ctx.fillText(ch, x*fontSize, -(8/32)*fontSize+(y+1)*fontSize);
    }
  }

  var tex = new THREE.Texture(c);
  tex.flipY = false;
  tex.needsUpdate = true;

  var mat = new THREE.MeshBasicMaterial({map: tex});
  mat.transparent = true;

  var geo = new THREE.Geometry();
  var str = BOOK;

  var j=0, ln=0;

  for (i=0; i<str.length; i++) {
    var code = str.charCodeAt(i);
    var cx = code % lettersPerSide;
    var cy = Math.floor(code / lettersPerSide);
    var v,t;
    geo.vertices.push(
      new THREE.Vector3( j*1.1+0.05, ln*1.1+0.05, 0 ),
      new THREE.Vector3( j*1.1+1.05, ln*1.1+0.05, 0 ),
      new THREE.Vector3( j*1.1+1.05, ln*1.1+1.05, 0 ),
      new THREE.Vector3( j*1.1+0.05, ln*1.1+1.05, 0 )
    );
    var face = new THREE.Face3(i*4+0, i*4+1, i*4+2);
    geo.faces.push(face);
    face = new THREE.Face3(i*4+0, i*4+2, i*4+3);
    geo.faces.push(face);
    var ox=(cx+0.05)/lettersPerSide, oy=(cy+0.05)/lettersPerSide, off=0.9/lettersPerSide;
    var sz = lettersPerSide*fontSize;
    geo.faceVertexUvs[0].push([
      new THREE.Vector2( ox, oy+off ),
      new THREE.Vector2( ox+off, oy+off ),
      new THREE.Vector2( ox+off, oy )
    ]);
    geo.faceVertexUvs[0].push([
      new THREE.Vector2( ox, oy+off ),
      new THREE.Vector2( ox+off, oy ),
      new THREE.Vector2( ox, oy )
    ]);
    if (code == 10) {
      ln--;
      j=0;
    } else {
      j++;
    }
  }

  var top = new THREE.Object3D();

  var width = window.innerWidth,
      height = window.innerHeight;

  var uniforms = {
    time : { type: "f", value: 1.0 },
    size : { type: "v2", value: new THREE.Vector2(width,height) },
    map : { type: "t", value: tex },
    effectAmount : { type: "f", value: 0.0 }
  };

  var shaderMaterial = new THREE.ShaderMaterial({
    uniforms : uniforms,
    vertexShader : document.querySelector('#vertex').textContent,
    fragmentShader : document.querySelector('#fragment').textContent
  });
  shaderMaterial.transparent = true;
  shaderMaterial.depthTest = false;

  var books = [];
  var w = 80 * 1.1;
  var n = 8;
  var r = w * 1/2 * 1/Math.PI * n;
  for (var i=0; i<n; i++) {
    var book = new THREE.Mesh(
      geo,
      shaderMaterial
    );
    book.doubleSided = true;
    var a = i/n * Math.PI*2 + Math.PI/2;
    book.position.x = Math.cos(Math.PI+a) * r;
    book.position.z = Math.sin(Math.PI+a) * r;
    book.rotation.y = Math.PI/2 - a;
    books.push(book);
    top.add(book);
  }

  scene.add(top);

  camera.position.y = 40;
  camera.lookAt(scene.position);

  var down = false;
  var sx = 0, sy = 0;
  window.onmousedown = function (ev){
    if (ev.target == renderer.domElement) {
      down = true;
      sx = ev.clientX;
      sy = ev.clientY;
    }
  };
  var wheelHandler = function(ev) {
    var ds = (ev.detail < 0 || ev.wheelDelta > 0) ? (1/1.25) : 1.25;
    var fov = camera.fov * ds;
    fov = Math.min(120, Math.max(1, fov));
    camera.fov = fov;
    camera.updateProjectionMatrix();
    ev.preventDefault();
  };
  window.addEventListener('DOMMouseScroll', wheelHandler, false);
  window.addEventListener('mousewheel', wheelHandler, false);
  window.onmouseup = function(){ down = false; };
  window.onmousemove = function(ev) {
    if (down) {
      var dx = ev.clientX - sx;
      var dy = ev.clientY - sy;
      camera.rotation.y += dx/500 * (camera.fov/45);;
      camera.rotation.x += dy/500 * (camera.fov/45);
      sx += dx;
      sy += dy;
    }
  };

  var gui = new dat.GUI();
  var control = {
    'Animation': 5,
    'Books': 1
  };
  gui.add(control, 'Animation', 0, 100).step(1);
  gui.add(control, 'Books', 1, books.length).step(1);

  var letterCountTitle = document.createElement('p');
  letterCountTitle.innerHTML = 'Look around by dragging, zoom with the mouse wheel<br><br>Letter count: ';
  var s = letterCountTitle.style;
  s.position = 'fixed';
  s.left = s.top = '10px';
  document.body.appendChild(letterCountTitle);

  var letterCountElement = document.createElement('span');
  letterCountTitle.appendChild(letterCountElement);

  var animate = function(t) {
    uniforms.time.value += 0.05;
    uniforms.effectAmount.value = control.Animation/100;
    var i;
    var letterCount = control.Books * BOOK.length;
    letterCountElement.textContent = letterCount;
    for (i=1; i<control.Books; i++) {
      books[i].visible = true;
    }
    for (i=control.Books; i<books.length; i++) {
      books[i].visible = false;
    }
    top.position.y += 0.03;
    renderer.render(scene, camera);
    requestAnimationFrame(animate, renderer.domElement);
  };
  animate(Date.now());
};
