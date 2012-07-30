  function $_(selector) { return document.querySelector(selector); }
  function clone(o) { // shallow clone
    var clone = {};
    for (var key in o) {
      clone[key] = o[key];
    }
    return clone;
  }

  function timeAgo(millis) {
    var secs = Math.round((+new Date - millis)/1000);
    return secs < 5 ? "just now" :
           secs < 30 ? "a few secs ago" :
           secs < 90 ? "about a minute ago" :
           secs < 2*60*60 ? Math.round(secs/60) + " mins ago" :
           secs < 2*24*60*60 ? Math.round(secs/60/60) + " hours ago" :
           Math.round(secs/24/60/60) + " days ago";
  }

  function placeName(lat,lon, callback) {
    var callbackID = "callback"+Math.floor(1e6*Math.random())
    window[callbackID] = callback;
    var script = document.createElement("script");
    script.src = "http://maps.google.com/maps/geo?ll="+lat+","+lon+"&callback="+callbackID;
    document.head.appendChild(script);
  }


