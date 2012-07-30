var computeNormal = function(a,b,c) {
  var ba = vec3.sub(b,a,vec3());
  var ca = vec3.sub(c,a,vec3());
  return vec3.cross(ba,ca);
};

var addNormal = function(normals, u,v,w) {
  var normal = computeNormal(u,v,w);
  normals.push(normal, normal, normal);
};

var computeTangentMatrix = function(v, p) {
  var xa = Math.atan2(v[1], v[2]);
  var ya = Math.atan2(v[2], v[0]);
  var za = Math.atan2(v[1], v[0]);
  var rot = mat4.translate(mat4.identity(), p);
  var m = Math.PI*0.5;
  //mat4.rotateX(rot, m+xa);
  //mat4.rotateY(rot, m+ya);
  //mat4.rotateZ(rot, m+za);
  return rot;
};


var createSweepGeo = function(railPolyLine, sweepPoly){ 
  var verts = [];
  var normals = [];
  for (var i=1; i<railPolyLine.length-1; i++) {
    var v2 = railPolyLine[i+1];
    var v1 = railPolyLine[i];
    var v0 = railPolyLine[i-1];
    var rt1 = vec3.sub(v1,v0,vec3());
    var rt2 = vec3.sub(v2,v1,vec3());
    var tangentMatrix1 = computeTangentMatrix(rt1, v1);
    var tangentMatrix2 = computeTangentMatrix(rt2, v2);
    for (var j=0; j<sweepPoly.length; j++) {
      var u = sweepPoly[j];
      var w = sweepPoly[j+1];
      if (w == null)
        w = sweepPoly[0];
      var ut1 = mat4.multiplyVec3(tangentMatrix1, u, vec3());
      var ut2 = mat4.multiplyVec3(tangentMatrix2, u, vec3());
      var wt1 = mat4.multiplyVec3(tangentMatrix1, w, vec3());
      var wt2 = mat4.multiplyVec3(tangentMatrix2, w, vec3());
      verts.push(ut1, wt1, wt2, ut1, wt2, ut2);
      addNormal(normals, ut1, wt1, wt2);
      addNormal(normals, ut1, wt2, ut2);
    }
  }
  var flatVerts = new Float32Array(verts.length*3);
  var flatNormals = new Float32Array(normals.length*3);
  for (var i=0; i<verts.length; i++) {
    var v = verts[i];
    var w = normals[i];
    flatVerts[i*3] = v[0];
    flatVerts[i*3+1] = v[1];
    flatVerts[i*3+2] = v[2];
    flatNormals[i*3] = w[0];
    flatNormals[i*3+1] = w[1];
    flatNormals[i*3+2] = w[2];
  }
  return {vertices: verts, normals: normals, flatVertices : flatVerts, flatNormals: flatNormals};
};

var createPolyLineFromCubicBezierPath = function(path, segmentCount) {
  var points = [];
  for (var i=0; i<segmentCount; i++) {
    var t = i/(segmentCount-1);
    var p = Magi.Curves.cubicPoint(path[0], path[1], path[2], path[3], t);
    points.push(p);
  }
  return points;
};
