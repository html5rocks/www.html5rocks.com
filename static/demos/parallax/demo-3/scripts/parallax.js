// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function(win, d) {

  var $ = d.querySelector.bind(d);

  var bg = $('#bg');
  var blob1 = $('#blob-1');
  var blob2 = $('#blob-2');
  var blob3 = $('#blob-3');
  var blob4 = $('#blob-4');
  var blob5 = $('#blob-5');
  var blob6 = $('#blob-6');
  var blob7 = $('#blob-7');
  var blob8 = $('#blob-8');
  var blob9 = $('#blob-9');
  var canvas = $('#blob-container canvas');
  var context = canvas.getContext('2d');

  var mainBG = $('section#content');

  var stripe = $('aside');
  var ticking = false;
  var lastScrollY = 0;

  function onResize () {

    canvas.width = 960;
    canvas.height = window.innerHeight;

    updateElements(win.pageYOffset);
  }

  function onScroll (evt) {
    if(!ticking) {
      ticking = true;
      requestAnimFrame(updateElements);
      lastScrollY = win.pageYOffset;
    }
  }

  function updateElements () {

    var relativeY = lastScrollY / 3000;

    context.fillStyle = "#1e2124";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bg, 0, pos(0, -3600, relativeY, 0));
    context.drawImage(blob1, 484, pos(254, -4400, relativeY, 0));
    context.drawImage(blob2, 84, pos(954, -5400, relativeY, 0));
    context.drawImage(blob3, 584, pos(1054, -3900, relativeY, 0));
    context.drawImage(blob4, 44, pos(1400, -6900, relativeY, 0));
    context.drawImage(blob5, -40, pos(1730, -5900, relativeY, 0));
    context.drawImage(blob6, 325, pos(2860, -7900, relativeY, 0));
    context.drawImage(blob7, 725, pos(2550, -4900, relativeY, 0));
    context.drawImage(blob8, 570, pos(2300, -3700, relativeY, 0));
    context.drawImage(blob9, 640, pos(3700, -9000, relativeY, 0));

    ticking = false;
  }

  function pos(base, range, relY, offset) {
    return base + limit(0, 1, relY - offset) * range;
  }

  function prefix(obj, prop, value) {
    var prefs = ['webkit', 'Moz', 'o', 'ms'];
    for (var pref in prefs) {
      obj[prefs[pref] + prop] = value;
    }
  }

  function limit(min, max, value) {
    return Math.max(min, Math.min(max, value));
  }

  win.addEventListener('load', onResize, false);
  win.addEventListener('resize', onResize, false);
  win.addEventListener('scroll', onScroll, false);

})(window, document);
