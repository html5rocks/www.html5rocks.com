function drawSkybox(){
  if (zoaParam.showSkybox == 1){
    gl.depthMask(false);
    mTemp = M4x4.clone(mWorld);
    setShader("skybox");
		M4x4.scale1(100,mViewInv,mWorld);
    setMatrixUniforms(); 
    drawBuffer("sphere");
    mWorld = M4x4.clone(mTemp);
    gl.depthMask(true);
  }
}