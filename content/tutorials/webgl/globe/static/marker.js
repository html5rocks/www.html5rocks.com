createMarker = function(title, list) {
  var marker = document.createElement('div');
  marker.className = 'marker-container';
  var markerIn = document.createElement('div');
  markerIn.className = 'marker';
  marker.appendChild(markerIn);
  var info = document.createElement('div');
  info.className = 'INFORMATIONAL-BOX';
  markerIn.appendChild(info);

  if (list) {
    var siteList = document.createElement('span');
    siteList.className = 'site-list';
    info.appendChild(siteList);
    for (var i=0; i<list.length; i++) {
      var d = document.createElement('div');
      d.textContent = list[i].name;
      siteList.appendChild(d);
    }
  }

  var d = document.createElement('div');
  d.textContent = title;
  info.appendChild(d);

  var tri = document.createElement('div');
  tri.className = 'REDTRIANGLE';
  markerIn.appendChild(tri);
  return marker;
};
