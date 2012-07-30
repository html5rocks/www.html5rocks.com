function draw2DGrid(){ 
  if(zoaParam.showGrid == 1){
    mTemp = M4x4.clone(mWorld); 
    setShader("wire");
    setMatrixUniforms();
    drawWire('2Dgrid');
    mWorld = M4x4.clone(mTemp);
  }
}

function draw3DGrid(){ 
  if(zoaParam.showGrid == 1){
    mTemp = M4x4.clone(mWorld);  
    setShader("wire");
		M4x4.scale1(25,mWorld,mWorld);
    setMatrixUniforms();
    drawWire('3Dgrid');
    mWorld = M4x4.clone(mTemp);
  }
}