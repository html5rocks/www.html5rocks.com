// JavaScript Document

var localParam = new localParam();
var zoaParam = new zoaParam();

function localParam(){
  this.camera = new Object;
  this.camera.near = 1;
  this.camera.far = 120;
  this.camera.fov = 35;
  this.camera.rotate = [0,0,0];
  this.camera.translate = [0,0,-50];
  this.camera.eye = [0,0,-64];
  
  this.LODBias = 8.0;
  this.millis = 0.0;
  this.elapsed = 1.0;
  this.timeNow = 0.0;
  this.currentTime = 0.0;
  this.lastTime = 0.0;
  this.fps = 60.0;
  this.fpsAverage = 60.0;
  this.cycle32 = 0.0;
}

function zoaParam(){
  this.objName = "zoaParam";

  //model
  this.showJellyfish = 1;
  this.showSkeleton = 0;
  this.showTargets = 0;
  this.showParticles = 1;
  this.showRays = 1;
  this.showGrid = 0;
  this.showSkybox = 1;

  //jellyfish
  this.jCount = 10;
  this.jScale = .2;
  this.jScaleRandom = 3;
  this.jTurb = 0.2;
  this.jSpeed = 0.03;

  //particle
  this.pCount = 600;
  this.pBbox = [25,15,25];
  this.pFlow = [0,-0.01,0];
  this.pTurbAmp = 0.03;
  this.pTurbFreq = 1;
  this.pScale = 0.3;
  this.pScaleRandom = 0.4;
  this.pAlpha =0.6;

  //rays
  this.rCount = 40;
  this.rSpeed = 0.05;
  this.rAlpha = 0.3;

  //lighting
  this.lightPos = [-1,2,-1];
  this.lightCol = [0.8,0.8,0.4,1];
  this.specCol = [0.3,0.4,0.6,0.5];
  this.lightRadius = 800;
  this.lightSpecPower = 3;
  this.ambientCol = [0.7,0.4,0.4,1];
  this.fogTopCol = [0.7,0.8,1.1,0.7];
  this.fogBottomCol = [0.15,0.15,0.2,0.3];
  this.fogDist = 200;
  this.lightTime = 0;
  this.lightBlend = [1,-1,0];
    
  this.shaderDebug = 0;

  this.fresnelCol = [0.3,0.8,1,0.6];
  this.fresnelPower = 2;
}

function setDebugParam(){
  $("#near").val(localParam.camera.near);
  $("#far").val(localParam.camera.far);
  $("#fov").val(localParam.camera.fov);
      
  $("#lightX").val(zoaParam.lightPos[0]);$("#lightY").val(zoaParam.lightPos[1]);$("#lightZ").val(zoaParam.lightPos[2]);
  $("#lightR").val(zoaParam.lightCol[0]);$("#lightG").val(zoaParam.lightCol[1]);$("#lightB").val(zoaParam.lightCol[2]);$("#lightA").val(zoaParam.lightCol[3]);
  $("#ambientR").val(zoaParam.ambientCol[0]);$("#ambientG").val(zoaParam.ambientCol[1]);$("#ambientB").val(zoaParam.ambientCol[2]);$("#ambientA").val(zoaParam.ambientCol[3]);
  $("#lightSpecR").val(zoaParam.specCol[0]);$("#lightSpecG").val(zoaParam.specCol[1]);$("#lightSpecB").val(zoaParam.specCol[2]);$("#lightSpecA").val(zoaParam.specCol[3]);
  $("#fogDist").val(zoaParam.fogDist);
  $("#fogTopR").val(zoaParam.fogTopCol[0]);$("#fogTopG").val(zoaParam.fogTopCol[1]);$("#fogTopB").val(zoaParam.fogTopCol[2]);$("#fogTopA").val(zoaParam.fogTopCol[3]);
  $("#fogBottomR").val(zoaParam.fogBottomCol[0]);$("#fogBottomG").val(zoaParam.fogBottomCol[1]);$("#fogBottomB").val(zoaParam.fogBottomCol[2]);$("#fogBottomA").val(zoaParam.fogBottomCol[3]);
  $("#fresnelR").val(zoaParam.fresnelCol[0]);$("#fresnelG").val(zoaParam.fresnelCol[1]);$("#fresnelB").val(zoaParam.fresnelCol[2]);$("#fresnelA").val(zoaParam.fresnelCol[3]);
  $("#lightRadius").val(zoaParam.lightRadius);
  $("#lightSpecPower").val(zoaParam.lightSpecPower);
  $("#fresnelPower").val(zoaParam.fresnelPower);
  $("#lightTime").val(zoaParam.lightTime);
  $("#lightBlendX").val(zoaParam.lightBlend[0]);$("#lightBlendY").val(zoaParam.lightBlend[1]);

  $("#pCount").val(zoaParam.pCount);
  $("#pScale").val(zoaParam.pScale);
  $("#pScaleRandom").val(zoaParam.pScaleRandom);
  $("#pBboxX").val(zoaParam.pBbox[0]);$("#pBboxY").val(zoaParam.pBbox[1]);$("#pBboxZ").val(zoaParam.pBbox[2]);
  $("#pFlowX").val(zoaParam.pFlow[0]);$("#pFlowY").val(zoaParam.pFlow[1]);$("#pFlowZ").val(zoaParam.pFlow[2]);
  $("#pTurbAmp").val(zoaParam.pTurbAmp);
  $("#pTurbFreq").val(zoaParam.pTurbFreq);
  $("#pAlpha").val(zoaParam.pAlpha);
  
  $("#rCount").val(zoaParam.rCount);
  $("#rSpeed").val(zoaParam.rSpeed); 
  $("#rAlpha").val(zoaParam.rAlpha);  

  $("#jCount").val(zoaParam.jCount);
  $("#jScale").val(zoaParam.jScale); 
  $("#jScaleRandom").val(zoaParam.jScaleRandom);
  $("#jTurb").val(zoaParam.jTurb); 
  $("#jSpeed").val(zoaParam.jSpeed);

  if (zoaParam.showJellyfish == 1){$('input[name=showJellyfish]').attr('checked', true);} else $('input[name=showJellyfish]').attr('checked', false);
  if (zoaParam.showSkeleton == 1){$('input[name=showSkeleton]').attr('checked', true);} else $('input[name=showSkeleton]').attr('checked', false);
  if (zoaParam.showTargets == 1){$('input[name=showTargets]').attr('checked', true);} else $('input[name=showTargets]').attr('checked', false);
  if (zoaParam.showParticles == 1){$('input[name=showParticles]').attr('checked', true);} else $('input[name=showParticles]').attr('checked', false);
  if (zoaParam.showRays == 1){$('input[name=showRays]').attr('checked', true);} else $('input[name=showRays]').attr('checked', false);
  if (zoaParam.showGrid == 1){$('input[name=showGrid]').attr('checked', true);} else $('input[name=showGrid]').attr('checked', false);
  if (zoaParam.showSkybox == 1){$('input[name=showSkybox]').attr('checked', true);} else $('input[name=showSkybox]').attr('checked', false);
}

function readDebugParam(){
    zoaParam.shaderDebug = parseFloat($('input:radio[name=shaderDebug]:checked').val());
	
	localParam.camera.near = parseFloat($("#near").val());
    localParam.camera.far = parseFloat($("#far").val());
    localParam.camera.fov = parseFloat($("#fov").val());
    
    zoaParam.lightPos = [parseFloat($("#lightX").val()),parseFloat($("#lightY").val()),parseFloat($("#lightZ").val())];
    zoaParam.lightCol = [parseFloat($("#lightR").val()),parseFloat($("#lightG").val()),parseFloat($("#lightB").val()),parseFloat($("#lightA").val())];
    zoaParam.ambientCol = [parseFloat($("#ambientR").val()),parseFloat($("#ambientG").val()),parseFloat($("#ambientB").val()),parseFloat($("#ambientA").val())];
    zoaParam.specCol = [  parseFloat($("#lightSpecR").val()),parseFloat($("#lightSpecG").val()),parseFloat($("#lightSpecB").val()),parseFloat($("#lightSpecA").val())];
    zoaParam.fogDist = parseFloat($("#fogDist").val());
    zoaParam.fogTopCol = [parseFloat($("#fogTopR").val()),parseFloat($("#fogTopG").val()),parseFloat($("#fogTopB").val()),parseFloat($("#fogTopA").val())];
    zoaParam.fogBottomCol = [parseFloat($("#fogBottomR").val()),parseFloat($("#fogBottomG").val()),parseFloat($("#fogBottomB").val()),parseFloat($("#fogBottomA").val())];
    zoaParam.fresnelCol = [parseFloat($("#fresnelR").val()),parseFloat($("#fresnelG").val()),parseFloat($("#fresnelB").val()),parseFloat($("#fresnelA").val())];
    zoaParam.shaderDebug = parseInt($('input[name=shaderDebug]:checked').val());
    zoaParam.lightRadius = parseFloat($("#lightRadius").val());
    zoaParam.lightSpecPower = parseFloat($("#lightSpecPower").val());
    zoaParam.fresnelPower = parseFloat($("#fresnelPower").val());
	zoaParam.lightTime = parseFloat($("#lightTime").val());
	zoaParam.lightBlend = [parseFloat($("#lightBlendX").val()), parseFloat($("#lightBlendY").val()), 0];
    
    zoaParam.pCount = parseFloat($("#pCount").val());
    zoaParam.pScale = parseFloat($("#pScale").val());
    zoaParam.pScaleRandom = parseFloat($("#pScaleRandom").val());
    zoaParam.pBbox = [parseFloat($("#pBboxX").val()),parseFloat($("#pBboxY").val()),parseFloat($("#pBboxZ").val())];
    zoaParam.pFlow = [parseFloat($("#pFlowX").val()),parseFloat($("#pFlowY").val()),parseFloat($("#pFlowZ").val())];
    zoaParam.pTurbAmp = parseFloat($("#pTurbAmp").val());
    zoaParam.pTurbFreq = parseFloat($("#pTurbFreq").val());
    zoaParam.pAlpha = parseFloat($("#pAlpha").val()); 
    
    zoaParam.rCount = parseFloat($("#rCount").val());
    zoaParam.rSpeed = parseFloat($("#rSpeed").val());
    zoaParam.rAlpha = parseFloat($("#rAlpha").val());
    
    zoaParam.jCount = parseFloat($("#jCount").val());
    zoaParam.jScale = parseFloat($("#jScale").val());
    zoaParam.jScaleRandom = parseFloat($("#jScaleRandom").val());
    zoaParam.jTurb = parseFloat($("#jTurb").val());
    zoaParam.jSpeed = parseFloat($("#jSpeed").val());
    
    if ($('[name=showJellyfish]').is(':checked')){zoaParam.showJellyfish = 1;} else zoaParam.showJellyfish = 0;
    if ($('[name=showSkeleton]').is(':checked')){zoaParam.showSkeleton = 1;} else zoaParam.showSkeleton = 0;
    if ($('[name=showTargets]').is(':checked')){zoaParam.showTargets = 1;} else zoaParam.showTargets = 0;
    if ($('[name=showParticles]').is(':checked')){zoaParam.showParticles = 1;} else zoaParam.showParticles = 0;
    if ($('[name=showRays]').is(':checked')){zoaParam.showRays = 1;} else zoaParam.showRays = 0;
    if ($('[name=showGrid]').is(':checked')){zoaParam.showGrid = 1;} else zoaParam.showGrid = 0;
    if ($('[name=showSkybox]').is(':checked')){zoaParam.showSkybox = 1;} else zoaParam.showSkybox = 0;
}