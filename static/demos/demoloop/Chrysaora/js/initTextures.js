// JavaScript Document
var crateTextures = Array();
var texture = {};
var textureOK = {};

function initTextures() {
  loadTexture('jellyfishColor', 'images/jellyfishColor.jpg');
  loadTexture('jellyfishAlpha', 'images/jellyfishAlpha.jpg');
  loadTexture('plankton', 'images/plankton.jpg');
  loadTexture('blob', 'images/blob.jpg');
  loadTexture('halfBlob', 'images/halfBlob.jpg');
  
  for (var i=1; i <= 32; i++) {
    loadTexture('caustics'+i, 'images/caustics/caustics7.'+pad2(i-1)+'.jpg');
  }
}

function loadTexture(label, path) {
  textureOK[label] = 0;
  var imageFile = new Image();
  imageFile.src = path;
  texture[label] = gl.createTexture();
  texture[label].image = imageFile;
  imageFile.onload = function() {
    handleLoadedTexture(texture[label], label);
  }
}

function handleLoadedTexture(textures, label) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  
  gl.bindTexture(gl.TEXTURE_2D, textures);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  textureOK[label] = 1;
}

function bindTexture0(name) {
  if(textureOK[name] == 1){
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture[name]);
    gl.uniform1i(currentProgram.sampler0, 0);
  }
}
function bindTexture1(name) {
  if(textureOK[name] == 1){
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture[name]);
    gl.uniform1i(currentProgram.sampler1, 1);
  }
}
function bindTexture2(name) {
  if(textureOK[name] == 1){
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, texture[name]);
    gl.uniform1i(currentProgram.sampler2, 2);
  }
}
function bindTexture3(name) {
  if(textureOK[name] == 1){
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, texture[name]);
    gl.uniform1i(currentProgram.sampler3, 3);
  }
}

function pad2(number) {
  return (parseInt(number) < 10 ? '0' : '') + parseInt(number)
}