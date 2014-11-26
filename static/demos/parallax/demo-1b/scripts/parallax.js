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

  var mainBG = $('section#content');

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

    mainBG.style.backgroundPosition = 'center ' + pos(0, -600, relativeY, 0) + 'px';

    blob1.style.top = pos(254, -1400, relativeY, 0) + 'px';
    blob1.style.left = 484 + 'px';

    blob2.style.top = pos(954, -2400, relativeY, 0) + 'px';
    blob2.style.left = 84 + 'px';

    blob3.style.top = pos(1054, -900, relativeY, 0) + 'px';
    blob3.style.left = 584 + 'px';

    blob4.style.top = pos(1400, -3900, relativeY, 0) + 'px';
    blob4.style.left = 44 + 'px';

    blob5.style.top = pos(1730, -2900, relativeY, 0) + 'px';
    blob5.style.left = -40 + 'px';

    blob6.style.top = pos(2860, -4900, relativeY, 0) + 'px';
    blob6.style.left = 325 + 'px';

    blob7.style.top = pos(2550, -1900, relativeY, 0) + 'px';
    blob7.style.left = 725 + 'px';

    blob8.style.top = pos(2300, -700, relativeY, 0) + 'px';
    blob8.style.left = 570 + 'px';

    blob9.style.top = pos(3700, -6000, relativeY, 0) + 'px';
    blob9.style.left = 640 + 'px';

    ticking = false;
  }

  function pos(base, range, relY, offset) {
    return base + limit(0, 1, relY - offset) * range;
  }

  function prefix(obj, prop, value) {
    var prefs = ['webkit', 'moz', 'o', 'ms'];
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
