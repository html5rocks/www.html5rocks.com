var delta = new V3.$(0,0,0);
var deltaNorm = new V3.$(0,0,0);
var force = new V3.$(0,0,0);
var accel = new V3.$(0,0,0);
var eyeDist = new V3.$(0,0,0);

var jellyfish = {};
jellyfish.count = 0;
jellyfish.order = [];

function interpolateTargets(){
	while(jellyfish.count != jellyfishTargets.count){
      if(jellyfish.count<jellyfishTargets.count){
        jellyfish[jellyfish.count] = new jellyfishInstance(
        jellyfishTargets[jellyfish.count].pos,
        jellyfishTargets[jellyfish.count].scl,
        jellyfishTargets[jellyfish.count].id,
	    jellyfishTargets[jellyfish.count].time,
	    jellyfishTargets[jellyfish.count].alive);
		jellyfish.count += 1;
		
      }
      else if(jellyfish.count>jellyfishTargets.count){
        jellyfish.count -= 1;
        delete jellyfish[jellyfish.count];
      }	
	  jellyfish.order = jellyfishTargets.order;
	}
	  
    for(var i=0; i < jellyfish.count; i++){
      jellyfish[i].pos[0] = jellyfishTargets[i].pos[0];
      jellyfish[i].pos[1] = jellyfishTargets[i].pos[1];
      jellyfish[i].pos[2] = jellyfishTargets[i].pos[2];
	  if (jellyfishTargets[i].scl<jellyfish[i].scl) {
		jellyfish[i].scl = jellyfishTargets[i].scl;
	  }
	  jellyfish[i].scl = jellyfishTargets[i].scl;
	  jellyfish[i].id = jellyfishTargets[i].id;
	  jellyfish[i].time = jellyfishTargets[i].time;
	  jellyfish[i].alive = jellyfishTargets[i].alive;

    jellyfish.order[i][0] = i;
    jellyfish.order[i][1] = jellyfish[i].pos;  
    }
}

function drawJellyfish(){
	interpolateTargets();
    setShader("jellyfish");
    bindTexture1('caustics'+localParam.cycle32);
	setMatrixUniforms();
    bindTexture0('jellyfishColor');
	bindTexture2('jellyfishAlpha');
    bindTexture1('caustics'+localParam.cycle32);
	jellyfish.order.sort(sort3D);
    for (var i=0; i < jellyfish.count; i++) {
      var k = jellyfish.order[i][0];
      if (jellyfish[k]){
        jellyfish[k].drawTarget();
        jellyfish[k].simulate();
        jellyfish[k].setLOD();
        jellyfish[k].drawShadow();
		jellyfish[k].draw();
      }
    }
}

function sort3D(a,b){
  var eye = V3.$(-localParam.camera.eye[0],-localParam.camera.eye[1]+20,-localParam.camera.eye[2]);
  var x = a;
  var y = b;
  return (V3.length(V3.sub(eye,x[1])) > V3.length(V3.sub(eye,y[1])) ? -1 : ((V3.length(V3.sub(eye,x[1])) < V3.length(V3.sub(eye,y[1]))) ? 1 : 0));
}

function jellyfishInstance(pos,scl,id,time,alive){
  this.pos = pos;
  this.scl = scl;
  this.id = id;
  this.time = time;
  this.alive = alive;
  this.lod = 0;
  this.propel = 1;
    
  this.s = {};
  this.s[0] = new Spring2D(pos[0],pos[1]-6,pos[2]);
  for (j=1;j<=3;j++){
    this.s[j] = new Spring2D(pos[0],pos[1]-6-3*j*this.scl,pos[2]);  
  }
}

jellyfishInstance.prototype.draw = function(){ 
  if (zoaParam.showJellyfish == 1){    

    setShader("jellyfish");
	
	this.propel = (Math.sin(this.time+Math.PI)+0.6)*0.2;
    setjTimeUniform(this.time);
	
    setJointUniforms();
	bindTexture0('jellyfishColor');
    drawBuffer('jellyfish'+this.lod);
  }
}
jellyfishInstance.prototype.drawShadow = function(){ 
  if (zoaParam.showRays == 1){    
    mTemp = M4x4.clone(mWorld);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    gl.blendEquation(gl.FUNC_REVERSE_SUBTRACT);
	
    setShader("ray");
    bindTexture0('halfBlob');
    var lookAt = new M4x4.$();  
    M4x4.makeLookAt(V3.$(zoaParam.lightPos[0],zoaParam.lightPos[1],zoaParam.lightPos[2]),V3.$(0,0,0),localParam.camera.eye,lookAt);

    setMatrixUniforms();
    pMatrix = M4x4.makeTranslate3(0,0,0);
    M4x4.mul(M4x4.makeLookAt(V3.$(zoaParam.lightPos[0],zoaParam.lightPos[1],zoaParam.lightPos[2]),V3.$(0,0,0),localParam.camera.eye),pMatrix,pMatrix);
    M4x4.scale3(6,180,0,pMatrix,pMatrix);
	  M4x4.scale1(this.scl,pMatrix,pMatrix);

    pPosition = this.s[0].pos;
    setParticleUniforms();
	  gl.uniform1f(currentProgram.rAlpha, zoaParam.rAlpha*5);
    drawBuffer('quad');
    gl.uniform1f(currentProgram.rAlpha, zoaParam.rAlpha);
	
    gl.blendEquation(gl.FUNC_ADD);  
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    mWorld = M4x4.clone(mTemp);
  }
}
jellyfishInstance.prototype.drawTarget = function(){ 
  if (zoaParam.showTargets == 1){
    mTemp = M4x4.clone(mWorld);
    setShader("vcolor");
    M4x4.makeTranslate(this.pos,mWorld);
    M4x4.scale1(0.1,mWorld,mWorld);
    setMatrixUniforms();
    drawBuffer('sphere');
    mWorld = M4x4.clone(mTemp);
  }
}
jellyfishInstance.prototype.setLOD = function(){ 
   V3.sub(this.pos,V3.neg(localParam.camera.eye),eyeDist);
   this.lod = Math.max(3-Math.floor(4/this.scl/2),0);
   //this.lod = Math.max(3-Math.floor((V3.length(eyeDist)-45)/localParam.LODBias/this.scl),0);
}

jellyfishInstance.prototype.simulate = function(){ 
  gl.disable(gl.DEPTH_TEST);

  this.s[0].spring = 1.295 * this.scl * (2-this.propel);
  this.s[0].update(this.pos);
  if (this.alive == 1) this.s[0].gravity = -0.02;
  else this.s[0].gravity = -0.04;
  
  M4x4.makeTranslate(this.s[0].pos,joint0);
  M4x4.mul(joint0,this.s[0].lookat,joint0);
  M4x4.scale1(this.scl,joint0,joint0);
  
  if (zoaParam.showSkeleton == 1){
    mTemp = M4x4.clone(mWorld);
    setShader("vcolor");
    M4x4.makeTranslate(this.s[0].pos,mWorld);
    M4x4.mul(mWorld,this.s[0].lookat,mWorld);  
    setMatrixUniforms(); 
    drawBuffer("axis");
    mWorld = M4x4.clone(mTemp);
  }
  
  for (j=1;j<=3;j++){
    this.s[j].spring = 2.95 * this.scl;
    this.s[j].update(this.s[j-1].pos);
	
    if (this.alive == 1) this.s[j].gravity = -0.01;
    else this.s[j].gravity = -0.045;
  
    if (zoaParam.showSkeleton == 1){
      mTemp = M4x4.clone(mWorld);
      M4x4.makeTranslate(this.s[j].pos,mWorld);
      M4x4.mul(mWorld,this.s[j].lookat,mWorld);
      setMatrixUniforms(); 
      drawBuffer("axis");
      mWorld = M4x4.clone(mTemp);
    }    
    if (j==1){
      M4x4.makeTranslate(this.s[j].pos,joint1);
      M4x4.mul(joint1,this.s[j].lookat, joint1);  
      M4x4.scale1(this.scl,joint1,joint1);
      M4x4.translate3(0,3*j,0,joint1,joint1);
    }
    if (j==2){
      M4x4.makeTranslate(this.s[j].pos,joint2);
      M4x4.mul(joint2,this.s[j].lookat, joint2);
      M4x4.scale1(this.scl,joint2,joint2);
      M4x4.translate3(0,3*j,0,joint2,joint2);
    }
    if (j==3){
      M4x4.makeTranslate(this.s[j].pos,joint3);
      M4x4.mul(joint3,this.s[j].lookat, joint3);
      M4x4.scale1(this.scl,joint3,joint3);
      M4x4.translate3(0,3*j,0,joint3,joint3);
    }
  }
  gl.enable(gl.DEPTH_TEST);
}

function Spring2D(xpos, ypos, zpos){
  this.veloc = new V3.$(0,0,0);
  this.pos = new V3.$(xpos, ypos, zpos);
  this.gravity = -0.01;
  this.spring = 2;
  this.mass = 0.1;
  this.stiffness = 0.2;  
  this.damping = 0.1;
  this.lookat = new M4x4.$();
}
Spring2D.prototype.update = function(target){ 
  V3.sub(target,this.pos,delta);
  V3.normalize(delta, deltaNorm);
  V3.scale(deltaNorm, this.spring, deltaNorm);
  V3.sub(delta, deltaNorm, delta);
  
  V3.scale(delta,this.stiffness,force);
  force[1] += this.gravity;
  V3.scale(force,1/this.mass,accel);
  V3.add(force,accel,this.veloc);
  V3.scale(this.veloc,this.damping,this.veloc);
  V3.add(this.pos,this.veloc,this.pos);
  
  this.pos[0] += Math.sin(this.pos[0]/zoaParam.pTurbFreq+1)*zoaParam.pTurbAmp*0.2;
  this.pos[1] += Math.sin(this.pos[1]/zoaParam.pTurbFreq+2)*zoaParam.pTurbAmp*0.2;
  this.pos[2] += Math.sin(this.pos[2]/zoaParam.pTurbFreq+5)*zoaParam.pTurbAmp*0.2;

  M4x4.makeLookAt(this.pos,target,localParam.camera.eye,this.lookat);
}

Spring2D.prototype.repel = function(){
  for(var i=0; i < jellyfish.count; i++){
	var dist = V3.sub(this.pos, jellyfish[i].pos);
    if (V3.length(dist) < 32*1){
	  var force = V3.scale(dist, 128*1/Math.pow(V3.length(dist),3));
      V3.add(this.pos, force, this.pos);
    };
  }
}