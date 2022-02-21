var vertexPositionBuffer = {};
var vertexNormalBuffer = {};
var vertexColorBuffer = {};
var vertexTextureCoordBuffer = {};
var vertexIndexBuffer = {};
var bufferOK = {};

function initBuffers(){
  loadObject('axis','meshes/axis.json.html');
  loadObject('sphere','meshes/sphere.json.html');
  loadObject('box','meshes/box.json.html');
  loadObject('quad','meshes/quad.json.html');
  loadObject('jellyfish0','meshes/jellyfish0.json.html');
  loadObject('jellyfish1','meshes/jellyfish1.json.html');
  loadObject('jellyfish2','meshes/jellyfish2.json.html');
  loadObject('jellyfish3','meshes/jellyfish3.json.html');
  generate2DGrid('2Dgrid');
  generate3DGrid('3Dgrid')
}

function loadObject(name, file){
  var request = new XMLHttpRequest();
  request.open("GET", file);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      initBuffer(name, JSON.parse(request.responseText));
      bufferOK[name] = 1;
    }
  }
  request.send();
}

function generate2DGrid(name) {
   gPositions = [];
   gNormals = [];
   gColor = [];
   gUVs = [];
   for (i=-10;i<=10;i++){
     for (j=-10;j<=10;j=j+20){
       gPositions.push(i); gPositions.push(0); gPositions.push(j);
    gNormals.push(0); gNormals.push(0); gNormals.push(0);
    if(i==-10||i==0||i==10){
      gColor.push(1); gColor.push(1); gColor.push(1);
    }else{
      gColor.push(0.6); gColor.push(0.6); gColor.push(0.6);
    }
    gUVs.push(0); gUVs.push(0); gUVs.push(0);
     }  
   }
   for (i=-10;i<=10;i++){
     for (j=-10;j<=10;j=j+20){
       gPositions.push(j); gPositions.push(0); gPositions.push(i);
    gNormals.push(0); gNormals.push(0); gNormals.push(0);
    if(i==-10||i==0||i==10){
      gColor.push(1); gColor.push(1); gColor.push(1);
    }else{
      gColor.push(0.6); gColor.push(0.6); gColor.push(0.6);
    }
    gUVs.push(0); gUVs.push(0); gUVs.push(0);
     }  
   }

  vertexPositionBuffer[name] = gl.createBuffer();
  vertexNormalBuffer[name] = gl.createBuffer();
  vertexColorBuffer[name] = gl.createBuffer();
  vertexTextureCoordBuffer[name] = gl.createBuffer();
  vertexIndexBuffer[name] = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gPositions), gl.STATIC_DRAW);
  vertexPositionBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gNormals), gl.STATIC_DRAW);
  vertexNormalBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gColor), gl.STATIC_DRAW);
  vertexColorBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gUVs), gl.STATIC_DRAW);
  vertexTextureCoordBuffer[name].itemSize = 3;

  vertexIndexBuffer[name].numItems = gPositions.length;
}

function generate3DGrid(name) {
   gPositions = [];
   gNormals = [];
   gColor = [];
   gUVs = [];
   for (i=-10;i<=10;i++){
     for (j=-10;j<=10;j++){
	   for (k=-10;k<=10;k = k + 20){
         gPositions.push(i); gPositions.push(j); gPositions.push(k);
         gNormals.push(0); gNormals.push(0); gNormals.push(0);
         gColor.push(0.6); gColor.push(0.6); gColor.push(0.6);
         gUVs.push(0); gUVs.push(0); gUVs.push(0);
	   }
     }  
   }
   for (i=-10;i<=10;i++){
     for (j=-10;j<=10;j++){
	   for (k=-10;k<=10;k = k + 20){
         gPositions.push(i); gPositions.push(k); gPositions.push(j);
         gNormals.push(0); gNormals.push(0); gNormals.push(0);
         gColor.push(0.6); gColor.push(0.6); gColor.push(0.6);
         gUVs.push(0); gUVs.push(0); gUVs.push(0);
	   }
     }  
   }
   for (i=-10;i<=10;i++){
     for (j=-10;j<=10;j++){
	   for (k=-10;k<=10;k = k + 20){
         gPositions.push(k); gPositions.push(j); gPositions.push(i);
         gNormals.push(0); gNormals.push(0); gNormals.push(0);
         gColor.push(0.6); gColor.push(0.6); gColor.push(0.6);
         gUVs.push(0); gUVs.push(0); gUVs.push(0);
	   }
     }  
   }
	
  vertexPositionBuffer[name] = gl.createBuffer();
  vertexNormalBuffer[name] = gl.createBuffer();
  vertexColorBuffer[name] = gl.createBuffer();
  vertexTextureCoordBuffer[name] = gl.createBuffer();
  vertexIndexBuffer[name] = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gPositions), gl.STATIC_DRAW);
  vertexPositionBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gNormals), gl.STATIC_DRAW);
  vertexNormalBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gColor), gl.STATIC_DRAW);
  vertexColorBuffer[name].itemSize = 3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gUVs), gl.STATIC_DRAW);
  vertexTextureCoordBuffer[name].itemSize = 3;

  vertexIndexBuffer[name].numItems = gPositions.length;
}

function initBuffer(name, data) {
  vertexPositionBuffer[name] = gl.createBuffer();
  vertexNormalBuffer[name] = gl.createBuffer();
  vertexColorBuffer[name] = gl.createBuffer();
  vertexTextureCoordBuffer[name] = gl.createBuffer();
  vertexIndexBuffer[name] = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexPositions), gl.STATIC_DRAW);
  vertexPositionBuffer[name].itemSize = 3;
  vertexPositionBuffer[name].numItems = data.vertexPositions.length/3;  

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexNormals), gl.STATIC_DRAW);
  vertexNormalBuffer[name].itemSize = 3;
  vertexNormalBuffer[name].numItems = data.vertexNormals.length/3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexColors), gl.STATIC_DRAW);
  vertexColorBuffer[name].itemSize = 3;
  vertexColorBuffer[name].numItems = data.vertexColors.length/3;

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[name]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data.vertexTextureCoords), gl.STATIC_DRAW);
  vertexTextureCoordBuffer[name].itemSize = 3;
  vertexTextureCoordBuffer[name].numItems = data.vertexTextureCoords.length/3;

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer[name]);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data.indices), gl.STREAM_DRAW);
  vertexIndexBuffer[name].itemSize = 1;
  vertexIndexBuffer[name].numItems = data.indices.length;
}

function drawBuffer(name){
  if(vertexPositionBuffer[name]){
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, vertexPositionBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, vertexNormalBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexColorAttribute, vertexColorBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[name]);
    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, vertexTextureCoordBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer[name]);
    gl.drawElements(gl.TRIANGLES, vertexIndexBuffer[name].numItems, gl.UNSIGNED_SHORT, 0);
  }
}

function drawWire(name){
  if(vertexPositionBuffer[name]){
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, vertexPositionBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, vertexNormalBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer[name]);
    gl.vertexAttribPointer(currentProgram.vertexColorAttribute, vertexColorBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTextureCoordBuffer[name]);
    gl.vertexAttribPointer(currentProgram.textureCoordAttribute, vertexTextureCoordBuffer[name].itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer[name]);
    gl.drawArrays(gl.LINES, 0, vertexIndexBuffer[name].numItems/3);
  }
}
