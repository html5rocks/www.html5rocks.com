var rays = {};
rays.count = -1;

function drawRays(pass){
  if(rays.count<zoaParam.rCount){
    rays.count += 1;
    rays[rays.count] = new rayParticle(
      Math.random(i)*6*zoaParam.pBbox[0]-3*zoaParam.pBbox[0],
      zoaParam.pBbox[1],
      Math.random(i)*6*zoaParam.pBbox[2]-3*zoaParam.pBbox[2],
      5,
      rays.count);
  }
  if(rays.count>zoaParam.rCount){
    rays.count -= 1;
  }

  mTemp = M4x4.clone(mWorld);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.depthMask(false);
  gl.disable(gl.DEPTH_TEST);
  if (pass == 0) gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
  setShader("ray");
  bindTexture0('blob');
  
  var lookAt = new M4x4.$();  
  M4x4.makeLookAt(V3.$(zoaParam.lightPos[0],zoaParam.lightPos[1],zoaParam.lightPos[2]),V3.$(0,0,0),localParam.camera.eye,lookAt);

  setMatrixUniforms();
  pMatrix = M4x4.makeTranslate3(0,0,0);
  M4x4.mul(M4x4.makeLookAt(V3.$(zoaParam.lightPos[0],zoaParam.lightPos[1],zoaParam.lightPos[2]),V3.$(0,0,0),localParam.camera.eye),pMatrix,pMatrix);
  M4x4.scale3(3,120,0,pMatrix,pMatrix);
  
  if (zoaParam.showRays == 1){
      for (var j=+pass; j <= rays.count; j += 2) {    
        rays[j].update(); 
        rays[j].draw();
        rays[j].bound();
      }
  }

  if (pass == 0) gl.blendEquation(gl.FUNC_ADD);  
  gl.depthMask(true);
  gl.enable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  mWorld = M4x4.clone(mTemp);	
}

function rayParticle(tx,ty,tz,scl,id){
  this.pos = V3.$(tx,ty,tz);
  this.scl = V3.$(scl,scl,scl);
  this.id = id;
}
rayParticle.prototype.update = function(){ 
  V3.add(this.pos,zoaParam.pFlow,this.pos); 
  this.pos[0] += Math.sin(0.1*this.pos[2]*zoaParam.pTurbFreq)*zoaParam.rSpeed;
  this.pos[2] += Math.sin(0.1*this.pos[0]*zoaParam.pTurbFreq+500)*zoaParam.rSpeed;
}
rayParticle.prototype.bound = function(){ 
  if (this.pos[0]>3*zoaParam.pBbox[0]) this.pos[0] -= 6*zoaParam.pBbox[0];
  if (this.pos[2]>3*zoaParam.pBbox[2]) this.pos[2] -= 6*zoaParam.pBbox[2];
  if (this.pos[0]<-3*zoaParam.pBbox[0]) this.pos[0] += 6*zoaParam.pBbox[0];
  if (this.pos[2]<-3*zoaParam.pBbox[2]) this.pos[2] += 6*zoaParam.pBbox[2];
  this.pos[1] = 0;
}
rayParticle.prototype.draw = function(){ 
  pPosition = this.pos;
  pScale = this.scl;
  pID = this.id;
  setParticleUniforms();
  drawBuffer('quad');
}