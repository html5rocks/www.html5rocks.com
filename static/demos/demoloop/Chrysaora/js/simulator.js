var jellyfishTargets = {};
jellyfishTargets.objName = "targets";
jellyfishTargets.count = 0;
jellyfishTargets.order = [];
jellyfishTargets.order3D = [];

jellyfishTarget = function(tx,ty,tz,scl,id,time){
  this.pos = V3.$(tx,ty,tz);
  this.scl = scl;
  this.id = id;
  this.time = 0;
  this.alive = 1;
}

var delta;
var dist;
var dir;
var force;
var s1,s2;

function simulate(){
  var serverTime = new Date();
  var serverMilis = serverTime.getTime()%100000000/1000;
  serverTime.hours = (serverTime.getHours()+6)%24;
  serverTime.minutes = serverTime.getMinutes();
  serverTime.seconds = serverTime.getSeconds();
  serverTime.total = serverTime.hours*3600 + serverTime.minutes*60 + serverTime.seconds;

  var i = 0;
  if(jellyfishTargets.count<zoaParam.jCount){
    jellyfishTargets[jellyfishTargets.count] = new jellyfishTarget(
      Math.random(i)*2*zoaParam.pBbox[0]-zoaParam.pBbox[0],
      Math.random(i)*2*zoaParam.pBbox[1]-zoaParam.pBbox[1],
      Math.random(i)*2*zoaParam.pBbox[2]-zoaParam.pBbox[2],
      Math.random(i)*zoaParam.jScaleRandom+zoaParam.jScale,
      jellyfishTargets.count,
	  serverMilis
    );
    jellyfishTargets.order.push([jellyfishTargets.count,0]);
	jellyfishTargets.order3D.push([jellyfishTargets.count,0]);
    jellyfishTargets.count += 1;
    i++;
  }
  else if(jellyfishTargets.count>zoaParam.jCount){
    jellyfishTargets.order3D.pop();
	jellyfishTargets.order.pop();
    jellyfishTargets.count -= 1;
    delete jellyfishTargets[jellyfishTargets.count];
  }

  for(var i=0; i < jellyfishTargets.count; i++){
	
	//SET TIME
	if (jellyfishTargets[i].alive == 1) jellyfishTargets[i].time += zoaParam.jSpeed*5/(jellyfishTargets[i].scl+1)+0.07;
    
	//MOVE
    if (jellyfishTargets[i].alive == 1){
	  var millis = new Date().getTime();
	  var moveSpeed = jellyfishTargets[i].scl*zoaParam.jSpeed;
	  jellyfishTargets[i].pos[0] -= moveSpeed*Math.sin((jellyfishTargets[i].pos[2]+jellyfishTargets[i].id+millis/10000)*zoaParam.jTurb);
      jellyfishTargets[i].pos[1] -= moveSpeed*Math.sin((jellyfishTargets[i].pos[0]+jellyfishTargets[i].id+millis/10000)*zoaParam.jTurb);
      jellyfishTargets[i].pos[2] -= moveSpeed*Math.sin((jellyfishTargets[i].pos[1]+jellyfishTargets[i].id+millis/10000)*zoaParam.jTurb);
	  
    }
    
	//LIMIT
  if (jellyfishTargets[i].alive == 1){
    if(jellyfishTargets[i].pos[0]>zoaParam.pBbox[0]) jellyfishTargets[i].pos[0] = zoaParam.pBbox[0];
	  if(jellyfishTargets[i].pos[1]>zoaParam.pBbox[1]) jellyfishTargets[i].pos[1] = zoaParam.pBbox[1];
	  if(jellyfishTargets[i].pos[2]>zoaParam.pBbox[2]) jellyfishTargets[i].pos[2] = zoaParam.pBbox[2];
    if(jellyfishTargets[i].pos[0]<-zoaParam.pBbox[0]) jellyfishTargets[i].pos[0] = -zoaParam.pBbox[0];
	  if(jellyfishTargets[i].pos[1]<-zoaParam.pBbox[1]) jellyfishTargets[i].pos[1] = -zoaParam.pBbox[1];
	  if(jellyfishTargets[i].pos[2]<-zoaParam.pBbox[2]) jellyfishTargets[i].pos[2] = -zoaParam.pBbox[2];
	}
	       
	//REPEL
	if (jellyfishTargets[i].alive == 1){
    for(var j=0; j < jellyfishTargets.count; j++){
		  if (i != j){
			  s1 = jellyfishTargets[i].scl*3;
		    s2 = jellyfishTargets[j].scl*3;
        delta = V3.sub(jellyfishTargets[i].pos, jellyfishTargets[j].pos);
		    dist = V3.length(delta);// - (jellyfishTargets[i].scl+jellyfishTargets[j].scl)*6;
		    dir = V3.normalize(delta);
        if (dist < 4+s1+s2){
	  	    force = V3.scale(dir,Math.pow(Math.max(0,(4-dist+s1+s2)),3)*0.25);
          V3.add(jellyfishTargets[i].pos, force, jellyfishTargets[i].pos);
        };
      }
    }
	}

    //CENTER
	if (jellyfishTargets[i].alive == 1) {
	  jellyfishTargets[i].pos[0] *= 0.9999;
	  jellyfishTargets[i].pos[1] *= 0.999;
	  jellyfishTargets[i].pos[2] *= 0.9999;
	}
	  
  }
}