var kinectCamera = new kinectCameraObj();
var rArmPrevPos = V3.$(0,0,0);
var lArmPrevPos = V3.$(0,0,0);
var headPrevPos = V3.$(0,0,0);
var torsoPrevPos = V3.$(0,0,0);


function kinectCameraObj(){
  this.translate = M4x4.makeTranslate1(0);
  this.rotate = M4x4.makeTranslate1(0);
  this.transform = M4x4.makeTranslate1(0);

  this.velocity = new V3.$(0,0,0);
  this.torque = new V3.$(0,0,0);
  this.dumping = 0.01;
}

kinectCameraObj.prototype.dump = function(){
  this.velocity = V3.scale(this.velocity, 1-this.dumping);
  this.torque = V3.scale(this.torque, 1-this.dumping);
}


function drawPlayer(){ 
	kinectCamera.translate = M4x4.makeTranslate1(0);
	kinectCamera.rotate = M4x4.makeTranslate1(0);
	
	torsoPos = V3.$(kinect_player._parts["TORSO"].positions[0],kinect_player._parts["TORSO"].positions[1],kinect_player._parts["TORSO"].positions[2]); 
	drawLimb(torsoPos);

	headPos = V3.$(kinect_player._parts["HEAD"].positions[0],kinect_player._parts["HEAD"].positions[1],kinect_player._parts["HEAD"].positions[2]); 
	drawLimb(headPos);	
	
	rArmPos = V3.$(kinect_player._parts["RIGHT_HAND"].positions[0],kinect_player._parts["RIGHT_HAND"].positions[1],kinect_player._parts["RIGHT_HAND"].positions[2]); 
	drawLimb(rArmPos);	

	lArmPos = V3.$(kinect_player._parts["LEFT_HAND"].positions[0],kinect_player._parts["LEFT_HAND"].positions[1],kinect_player._parts["LEFT_HAND"].positions[2]); 
	drawLimb(lArmPos);		
	
	
	reachRight = Math.max(V3.length(V3.sub(V3.$(torsoPos[0],0,0), V3.$(rArmPos[0],0,0)))-350,0)/1000;
	reachLeft = Math.max(V3.length(V3.sub(V3.$(torsoPos[0],0,0), V3.$(lArmPos[0],0,0)))-350,0)/1000;
	
	reachX =  reachRight + reachLeft;
	
	reachFront = Math.max(V3.length(V3.$(0,0,Math.max((torsoPos[2]-(lArmPos[2]+rArmPos[2])*0.5),0)))+300,0)/1000;
	
	lPush = (lArmPos[2]-lArmPrevPos[2])/10000;
	rPush = (rArmPos[2]-rArmPrevPos[2])/10000;
	lLift = (lArmPos[1]-lArmPrevPos[1])/10000;
	rLift = (rArmPos[1]-rArmPrevPos[1])/10000;
	
	kinectCamera.velocity[2] += 1.5*(rPush+lPush)*Math.pow(reachX*2,3);
	kinectCamera.velocity[1] += 0.5*(rLift+lLift)*Math.pow(reachX*2,3);	
	
	M4x4.translate(kinectCamera.velocity,kinectCamera.translate,kinectCamera.translate);
	
	kinectCamera.torque[0] += 0.005*(lLift+rLift)*Math.pow(reachFront*2,3);
	kinectCamera.torque[1] += 0.5*(lPush)*Math.pow(reachLeft*2,3);
	kinectCamera.torque[1] -= 0.5*(rPush)*Math.pow(reachRight*2,3);
	//kinectCamera.torque[2] += 2*(lLift)*Math.pow(lArmWide,2);
	//kinectCamera.torque[2] -= 2*(rLift)*Math.pow(rArmWide,2);
		
	//M4x4.rotate(kinectCamera.torque[0],V3.$(1,0,0),kinectCamera.rotate,kinectCamera.rotate);
	M4x4.rotate(kinectCamera.torque[1],V3.$(0,1,0),kinectCamera.rotate,kinectCamera.rotate);

	kinectCamera.dumping = 0.01 + Math.min(reachX/35,1);
	kinectCamera.dump();
	
	lArmPrevPos = lArmPos;
	rArmPrevPos = rArmPos;
	headPrevPos = headPos;
	torsoPrevPos = torsoPos;
    
	//kinectCamera.transform = M4x4.makeTranslate1(0);
    kinectCamera.transform = M4x4.mul(kinectCamera.translate,kinectCamera.transform);
    kinectCamera.transform = M4x4.mul(kinectCamera.rotate,kinectCamera.transform);
	//kinectCamera.transform = M4x4.transpose(kinectCamera.transform)
	//kinectCamera.transform = M4x4.transpose(kinectCamera.transform);

}

function drawLimb(Pos){
  if(zoaParam.showTargets == 1){
	mTemp = M4x4.clone(mWorld);
	setShader("vcolor");
	
	M4x4.translate3(0,0,-20,mWorld,mWorld);
    M4x4.mul(M4x4.inverseOrthonormal(kinectCamera.transform),mWorld,mWorld);
    
    
	
	M4x4.rotate(Math.PI,V3.$(0,1,0),mWorld,mWorld);
	M4x4.scale1(0.01,mWorld,mWorld);
	M4x4.translate3(Pos[0],Pos[1],-Pos[2],mWorld,mWorld);
	M4x4.scale1(10,mWorld,mWorld);
	
	setMatrixUniforms();
    drawBuffer('sphere');
	mWorld = M4x4.clone(mTemp);
  }
}