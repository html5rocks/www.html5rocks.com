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

  var blob1 = $('#blob-1');
  var blob2 = $('#blob-2');
  var blob3 = $('#blob-3');
  var blob4 = $('#blob-4');
  var blob5 = $('#blob-5');
  var blob6 = $('#blob-6');
  var blob7 = $('#blob-7');
  var blob8 = $('#blob-8');
  var blob9 = $('#blob-9');

  var mainBG = $('section#background');

  var ticking = false;
  var lastScrollY = 0;

  function onResize () {
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

    prefix(mainBG.style, "Transform", "translate3d(0," +
      pos(0, -600, relativeY, 0) + 'px, 0)');

    prefix(blob1.style, "Transform", "translate3d(484px," +
      pos(254, -1400, relativeY, 0) + 'px, 0)');

    prefix(blob2.style, "Transform", "translate3d(84px," +
      pos(954, -2400, relativeY, 0) + 'px, 0)');

    prefix(blob3.style, "Transform", "translate3d(584px," +
      pos(1054, -900, relativeY, 0) + 'px, 0)');

    prefix(blob4.style, "Transform", "translate3d(44px," +
      pos(1400, -3900, relativeY, 0) + 'px, 0)');

    prefix(blob5.style, "Transform", "translate3d(-40px," +
      pos(1730, -2900, relativeY, 0) + 'px, 0)');

    prefix(blob6.style, "Transform", "translate3d(325px," +
      pos(2860, -4900, relativeY, 0) + 'px, 0)');

    prefix(blob7.style, "Transform", "translate3d(725px," +
      pos(2550, -1900, relativeY, 0) + 'px, 0)');

    prefix(blob8.style, "Transform", "translate3d(570px," +
      pos(2300, -700, relativeY, 0) + 'px, 0)');

    prefix(blob9.style, "Transform", "translate3d(640px," +
      pos(3700, -6000, relativeY, 0) + 'px, 0)');

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

  (function() {

    updateElements(win.pageYOffset);

    blob1.classList.add('force-show');
    blob2.classList.add('force-show');
    blob3.classList.add('force-show');
    blob4.classList.add('force-show');
    blob5.classList.add('force-show');
    blob6.classList.add('force-show');
    blob7.classList.add('force-show');
    blob8.classList.add('force-show');
    blob9.classList.add('force-show');
  })();

  win.addEventListener('resize', onResize, false);
  win.addEventListener('scroll', onScroll, false);

})(window, document);
