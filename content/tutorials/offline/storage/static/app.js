var store, map;

window.onload = function() {
  var storeType = document.location.search.substr(1);
  if (!document.location.search.length) storeType = "local";
  if (typeof(window[storeType])!="object") console.log("no such store " + storeType);
  $_("#storeType").innerHTML = $_("#"+storeType).innerHTML;
  store = window[storeType+"Store"];
  if (!store.supported()) return $_(".error").style.display = "block";
  store.setup(function() {
    populateCurrentLocation();
    $_("#save").onclick = function() {
      var checkin = {
        time:  +new Date,
        latitude:  $_("#latitude").value,
        longitude: $_("#longitude").value,
        mood: $_("#mood").value,
      };
      store.save(checkin, function() { update(checkin); });
    };
    $_("#moodQuery").onchange = update;
    $_("#clear").onclick = function() { store.reset(update); };
    setInterval(update, 60000); // keep times up to date

    if (!!window["google"]) {
      var moptions = { zoom: 1, center: new google.maps.LatLng(-34,150), mapTypeId: google.maps.MapTypeId.ROADMAP };
      map = new google.maps.Map($_("#mapZone"), moptions);
    };
    update();
  });

}

function populateCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      $_("#latitude").value  = pos.coords.latitude.toFixed(2);
      $_("#longitude").value = pos.coords.longitude.toFixed(2);
    });
  }
}

var allMarkers = [];
function update(newCheckin) {
  store.count(function(count) { $_("#checkinCount").innerHTML = count; });
  allMarkers.forEach(function(marker) { marker.setMap(null); marker = null; });
  $_("#searchResults").innerHTML = "";
  var moodQuery = $_("#all").selected ? null : $_("#moodQuery").value;
  store.search(moodQuery, function(checkin) {

    $_("#searchResults").innerHTML +=
      "I was " + checkin.mood +
      " " + timeAgo(parseInt(checkin.time)) +
      "  (" + checkin.latitude + "," + checkin.longitude + ")<br/>";

    if (map) {
      var markerOpts = {
        map: map,
        position: new google.maps.LatLng(checkin.latitude,checkin. longitude),
        title: checkin.mood
      };
      if (newCheckin && checkin.time==newCheckin.time)
        markerOpts.animation = google.maps.Animation.DROP;
      allMarkers.push(new google.maps.Marker(markerOpts));
    }

  });
}
