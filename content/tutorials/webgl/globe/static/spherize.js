function splitTri(u, v, w, maxLength) {
  var d, parts, plen, nd, tris, i;
  var tmpV0 = new THREE.Vector3();
  var tmpV1 = new THREE.Vector3();
  var tmpV2 = new THREE.Vector3();
  d = tmpV0.sub(v, u);
  var len = d.length();
  if (len > maxLength*1.1) {
    parts = Math.max(2, Math.ceil(len / maxLength));
    plen = len / parts;
    nd = d.normalize();
    tris = [];
    for (i=0; i<parts; i++) {
      tmpV1.copy(nd);
      tmpV1.multiplyScalar(plen*i);
      tmpV1.addSelf(u);
      tmpV2.copy(nd);
      tmpV2.multiplyScalar(plen*(i+1));
      tmpV2.addSelf(u)
      tris = tris.concat(splitTri(tmpV1.clone(), tmpV2.clone(), w, maxLength));
    }
    return tris;
  } else if (d.sub(w,v).length() > maxLength*1.1) {
    return splitTri(v, w, u, maxLength);
  } else if (d.sub(w,u).length() > maxLength*1.1) {
    return splitTri(w, u, v, maxLength);
  }

  return [u,v,w];
}

function splitLine(u, v, maxLength) {
  var d, parts, plen, nd, lines, i;
  var tmpV0 = new THREE.Vector3();
  var tmpV1 = new THREE.Vector3();
  var tmpV2 = new THREE.Vector3();
  d = tmpV0.sub(v, u);
  var len = d.length();
  if (len > maxLength*1.1) {
    parts = Math.max(2, Math.ceil(len / maxLength));
    plen = len / parts;
    nd = d.normalize();
    lines = [];
    for (i=0; i<parts; i++) {
      tmpV1.copy(nd);
      tmpV1.multiplyScalar(plen*i);
      tmpV1.addSelf(u);
      tmpV2.copy(nd);
      tmpV2.multiplyScalar(plen*(i+1));
      tmpV2.addSelf(u)
      lines.push(tmpV1.clone(), tmpV2.clone());
    }
    return lines;
  }
  return [u,v];
}

function spherizeVertsInPlace(verts, radius) {
  var t = verts;
  for (var i=0; i<t.length; i++) {
    t[i].multiplyScalar(radius/t[i].length());
  }
  return t;
}

function spherizeTris(triVerts, maxLength) {
  var newVerts = [];
  var t = triVerts;
  var radius = t[0].length();
  maxLength *= 2*Math.PI*radius;
  for (var i=0; i<t.length; i+=3) {
    var arr = splitTri(t[i], t[i+1], t[i+2], maxLength);
    spherizeVertsInPlace(arr, radius);
    for (var j=0; j<arr.length; j++) {
      newVerts.push(arr[j]);
    }
  }
  return newVerts;
}

function spherizeLines(lineVerts, maxLength) {
  var newVerts = [];
  var t = lineVerts;
  var radius = t[0].length();
  maxLength *= 2*Math.PI*radius;
  for (var i=0; i<t.length; i+=2) {
    var arr = splitLine(t[i], t[i+1], maxLength);
    spherizeVertsInPlace(arr, radius);
    for (var j=0; j<arr.length; j++) {
      newVerts.push(arr[j]);
    }
  }
  return newVerts;
}
