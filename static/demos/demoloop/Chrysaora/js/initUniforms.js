var mWorld = new M4x4.$();
var mView = new M4x4.$();
var mViewInv = new M4x4.$();
var mProjection = new M4x4.$();
var mWorldView = new M4x4.$();
var mWorldViewProj = new M4x4.$();
var mWorldInvTranspose = new M4x4.$();
var mTemp = new M4x4.$();

var mEye = new V3.$();;

var joint0 = new M4x4.$();
var joint1 = new M4x4.$();
var joint2 = new M4x4.$();
var joint3 = new M4x4.$();
var joint0InvTranspose = new M4x4.$();
var joint1InvTranspose = new M4x4.$();
var joint2InvTranspose = new M4x4.$();
var joint3InvTranspose = new M4x4.$();


var pPosition = [];
var pScale = [];
var pID;
var pMatrix = new M4x4.$();

function setTimeUniform(time){
  gl.uniform1f(currentProgram.currentTime, time);
}
function setjTimeUniform(time){
  gl.uniform1f(currentProgram.currentJellyfishTime, time);
}


function setJointUniforms(){
  gl.uniformMatrix4fv(currentProgram.joint0, gl.FALSE, new Float32Array(joint0));
  gl.uniformMatrix4fv(currentProgram.joint1, gl.FALSE, new Float32Array(joint1));
  gl.uniformMatrix4fv(currentProgram.joint2, gl.FALSE, new Float32Array(joint2));
  gl.uniformMatrix4fv(currentProgram.joint3, gl.FALSE, new Float32Array(joint3));
  
  M4x4.inverseOrthonormal(joint0,joint0InvTranspose);
  M4x4.transpose(joint0InvTranspose,joint0InvTranspose);
  gl.uniformMatrix4fv(currentProgram.joint0InvTranspose, gl.FALSE, new Float32Array(joint0InvTranspose));
  
  M4x4.inverseOrthonormal(joint1,joint1InvTranspose);
  M4x4.transpose(joint1InvTranspose,joint1InvTranspose);
  gl.uniformMatrix4fv(currentProgram.joint1InvTranspose, gl.FALSE, new Float32Array(joint1InvTranspose));
  
  M4x4.inverseOrthonormal(joint2,joint2InvTranspose);
  M4x4.transpose(joint2InvTranspose,joint2InvTranspose);
  gl.uniformMatrix4fv(currentProgram.joint2InvTranspose, gl.FALSE, new Float32Array(joint2InvTranspose));
  
  M4x4.inverseOrthonormal(joint3,joint3InvTranspose);
  M4x4.transpose(joint3InvTranspose,joint3InvTranspose);
  gl.uniformMatrix4fv(currentProgram.joint3InvTranspose, gl.FALSE, new Float32Array(joint3InvTranspose));
}

function setParticleUniforms(){
  gl.uniform3f(currentProgram.pPosition, pPosition[0],pPosition[1],pPosition[2]);
  gl.uniform3f(currentProgram.pScale, pScale[0], pScale[1], pScale[2]);
  gl.uniform1f(currentProgram.pID, pID);
  gl.uniform1f(currentProgram.pAlpha, zoaParam.pAlpha);
  gl.uniform1f(currentProgram.rAlpha, zoaParam.rAlpha);
  gl.uniform3f(currentProgram.pBbox, zoaParam.pBbox[0], zoaParam.pBbox[1], zoaParam.pBbox[2]);
  gl.uniformMatrix4fv(currentProgram.pMatrix, gl.FALSE, new Float32Array(pMatrix));
}

function setDebugUniforms(){
    gl.uniform3f(currentProgram.lightPos, zoaParam.lightPos[0],zoaParam.lightPos[1],zoaParam.lightPos[2]);
    gl.uniform4f(currentProgram.lightCol, zoaParam.lightCol[0],zoaParam.lightCol[1],zoaParam.lightCol[2],zoaParam.lightCol[3]);
    gl.uniform4f(currentProgram.ambientCol, zoaParam.ambientCol[0],zoaParam.ambientCol[1],zoaParam.ambientCol[2],zoaParam.ambientCol[3]);
    gl.uniform4f(currentProgram.specCol, zoaParam.specCol[0],zoaParam.specCol[1],zoaParam.specCol[2],zoaParam.specCol[3]);
    gl.uniform4f(currentProgram.fogTopCol, zoaParam.fogTopCol[0],zoaParam.fogTopCol[1],zoaParam.fogTopCol[2],zoaParam.fogTopCol[3]);
    gl.uniform4f(currentProgram.fogBottomCol, zoaParam.fogBottomCol[0],zoaParam.fogBottomCol[1],zoaParam.fogBottomCol[2],zoaParam.fogBottomCol[3]);
    gl.uniform1f(currentProgram.fogDist, zoaParam.fogDist);
	gl.uniform4f(currentProgram.fresnelCol, zoaParam.fresnelCol[0],zoaParam.fresnelCol[1],zoaParam.fresnelCol[2],zoaParam.fresnelCol[3]);
    gl.uniform1f(currentProgram.lightRadius, zoaParam.lightRadius);
    gl.uniform1f(currentProgram.lightSpecPower, zoaParam.lightSpecPower);
    gl.uniform1f(currentProgram.fresnelPow, zoaParam.fresnelPower);
    gl.uniform1f(currentProgram.shaderDebug, zoaParam.shaderDebug);
    gl.uniform1f(currentProgram.near, localParam.camera.near);
    gl.uniform1f(currentProgram.far, localParam.camera.far);
}

function setMatrixUniforms(){
  // Set necessary matrices
  M4x4.mul(mView,mWorld,mWorldView);
  M4x4.mul(mProjection,mWorldView,mWorldViewProj);
  M4x4.inverseOrthonormal(mView,mViewInv);
  M4x4.transpose(mViewInv,mWorldInvTranspose);
  
  // Set Uniforms
  gl.uniformMatrix4fv(currentProgram.world, gl.FALSE, new Float32Array(mWorld));
  gl.uniformMatrix4fv(currentProgram.worldView, gl.FALSE, new Float32Array(mWorldView));
  gl.uniformMatrix4fv(currentProgram.worldInvTranspose, gl.FALSE, new Float32Array(mWorldInvTranspose));
  gl.uniformMatrix4fv(currentProgram.worldViewProj, gl.FALSE, new Float32Array(mWorldViewProj));
  gl.uniformMatrix4fv(currentProgram.viewInv, gl.FALSE, new Float32Array(mViewInv));
}