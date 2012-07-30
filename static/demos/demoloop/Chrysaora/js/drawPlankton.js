var plankton = {};
plankton.count = 0;

function drawPlankton(){
  if(plankton.count<zoaParam.pCount){
    plankton[plankton.count] = 
    new planktonParticle(
      Math.random(i)*2*zoaParam.pBbox[0]-zoaParam.pBbox[0],
      Math.random(i)*2*zoaParam.pBbox[1]-zoaParam.pBbox[1],
      Math.random(i)*2*zoaParam.pBbox[2]-zoaParam.pBbox[2],
      Math.random()*zoaParam.pScaleRandom+zoaParam.pScale,
      plankton.count);
    plankton.count += 1;
  }
  if(plankton.count>zoaParam.pCount){
    plankton.count -= 1;
    delete plankton[plankton.count];
  }
    
  mTemp = M4x4.clone(mWorld);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.depthMask(false);
  setShader("plankton");
  bindTexture0('plankton');
  bindTexture1('caustics'+localParam.cycle32);
  setMatrixUniforms();
  setTimeUniform(localParam.currentTime);
  pMatrix = M4x4.makeTranslate3(0,0,0);
  M4x4.rotate(-localParam.camera.rotate[1],V3.$(0,1,0),pMatrix,pMatrix);
  M4x4.rotate(-localParam.camera.rotate[0],V3.$(1,0,0),pMatrix,pMatrix);
  
  if (zoaParam.showParticles == 1){
      for (var i=0; i < plankton.count; i++) {    
        plankton[i].update(); 
        plankton[i].draw();
        plankton[i].bound();
      }
  }
  gl.depthMask(true);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  mWorld = M4x4.clone(mTemp);
}

function planktonParticle(tx,ty,tz,scl,id){
  this.pos = V3.$(tx,ty,tz);
  this.scl = V3.$(scl,scl,scl);
  this.id = id;
}
planktonParticle.prototype.update = function(){ 
  V3.add(this.pos,zoaParam.pFlow,this.pos);  
  this.pos[0] += Math.sin(this.pos[1]*zoaParam.pTurbFreq)*zoaParam.pTurbAmp;
  this.pos[1] += Math.sin(this.pos[2]/zoaParam.pTurbFreq+100)*zoaParam.pTurbAmp;
  this.pos[2] += Math.sin(this.pos[0]/zoaParam.pTurbFreq+500)*zoaParam.pTurbAmp;
}
planktonParticle.prototype.bound = function(){ 
  if (this.pos[0]>zoaParam.pBbox[0]) this.pos[0] -= 2*zoaParam.pBbox[0];
  if (this.pos[1]>zoaParam.pBbox[1]) this.pos[1] -= 2*zoaParam.pBbox[1];
  if (this.pos[2]>zoaParam.pBbox[2]) this.pos[2] -= 2*zoaParam.pBbox[2];
  if (this.pos[0]<-zoaParam.pBbox[0]) this.pos[0] += 2*zoaParam.pBbox[0];
  if (this.pos[1]<-zoaParam.pBbox[1]) this.pos[1] += 2*zoaParam.pBbox[1];
  if (this.pos[2]<-zoaParam.pBbox[2]) this.pos[2] += 2*zoaParam.pBbox[2];
}
planktonParticle.prototype.draw = function(){ 
  pPosition = this.pos;
  pScale = this.scl;
  pID = this.id;
  setParticleUniforms();
  drawBuffer('quad');
}