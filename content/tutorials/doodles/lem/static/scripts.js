var CODE_PATH_PREFIX = 'code/';
var DESTINATION_CODE_PATH_PREFIX = 
    'https://code.google.com/p/stanislaw-lem-google-doodle/source/browse/';

var codeFiles = {};
var codeFilesToBeLoaded = 0;

var MIN_POPUP_WIDTH = 300;
var MAX_POPUP_HEIGHT = 600;

var MIN_CODE_POPUP_HEIGHT = {
  'below': 150,
  'above': 150,
  'aside': 250
};

// Get an absolute position of an element on the page.
function getElBodyPos(el) {
  var pos = { left: 0, top: 0 };

  while (el) {
    pos.left += el.offsetLeft;
    pos.top += el.offsetTop;

    el = el.offsetParent;
  }

  return pos;
};

// Escape angle brackets so that they can be safely output on the screen.
function escapeEntities(text) {
  return text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;')
}

// Count how many spaces are there at the beginning of the line.
function getLeadingSpaceCount(line) {
  if (!line) {
    line = '';
  }
  var match = line.match(/^(\ *)/);
  if (match && match[0]) {
    return match[0].length;
  } else {
    return 0;
  }
}

// Adds a new <div> with line numbers to a <pre> element.
function addLineNumbers(el, lineStart) {
  var lineNumbersEl = document.createElement('div');
  lineNumbersEl.classList.add('line-numbers');

  // Count the number of lines
  var match = el.innerHTML.match(/\n/g);
  if (match) {
    var lineCount = match.length;

    var html = '';

    for (var i = 1; i <= lineCount + 1; i++) {
      html += (lineStart + i - 1);
      html += '<br>';
    }
    lineNumbersEl.innerHTML = html;
  }
  el.appendChild(lineNumbersEl);
}

function onCodePopupAnchorClick(event) {
  if (event.ctrlKey || event.metaKey || event.shiftKey ||
      (event.button != 0)) {
    return;
  }

  event.preventDefault();

  var linkEl = event.target;
  while (linkEl.tagName != 'A') {
    linkEl = linkEl.parentNode;
  }

  window.setTimeout(function() { showCodePopupPart1(linkEl); }, 0);
}

function showCodePopupPart1(linkEl) {
  linkEl.classList.add('showing');

  var pos = getElBodyPos(linkEl);

  var el = document.createElement('div');
  el.classList.add('code-popup');
  el.classList.add('showing');
  el.classList.add('prettyprint');
  el.classList.add('pretty-print');

  el.originLeft = pos.left;
  el.originTop = pos.top;

  el.tabIndex = 1;

  el.style.left = 0;
  el.style.top = 0;

  el.addEventListener('mousedown', onCodePopupMouseDown, false);
  el.addEventListener('touchstart', onCodePopupTouchStart, false);

  var data = processExcerptSrc(linkEl.origHref);
  code = getCodeFileExcerpt(data.url, data.lineStart, data.lineEnd, true);
  el.lineStart = data.lineStart;

  var html = '';

  html += '<div class="triangle"></div>';
  html += '<div class="content">';
  html += '<h1>';
  html += data.url;
  html += '@' + data.lineStart + '–' + data.lineEnd;
  html += ' <a target="_new" href="' + linkEl.getAttribute('href') + '">';
  html += 'The entire file »';
  html += '</a>';
  html += '<button onclick="hideAllPopups()">×</button>';
  html += '</h1>';
  html += '</div>';

  el.innerHTML = html;

  document.querySelector('article.tutorial').appendChild(el);

  el.preEl = document.createElement('pre');
  el.preEl.innerHTML = escapeEntities(code);
  el.querySelector('.content').appendChild(el.preEl);

  el.preEl.addEventListener('scroll', onCodeScroll, false);
  el.preEl.scrollTop = 1;

  el.properWidth = el.preEl.scrollWidth + 40;
  el.properHeight = el.preEl.scrollHeight + 46;

  if (el.properWidth < MIN_POPUP_WIDTH) {
    el.properWidth = MIN_POPUP_WIDTH;
  }
  if (el.properHeight > MAX_POPUP_HEIGHT) {
    el.properHeight = MAX_POPUP_HEIGHT;
  }

  window.setTimeout(function() { showCodePopupPart2(el); }, 0);
}

function showCodePopupPart2(el) {
  repositionCodePopup(el);

  el.focus();

  window.setTimeout(function() { showCodePopupPart3(el) }, 0);
}

function showCodePopupPart3(el) {
  el.classList.remove('showing');

  var preEl = el.querySelector('pre');
  preEl.classList.add('pretty-print');
  preEl.classList.add('prettyprint');
  prettyPrintOneEl(preEl);

  addLineNumbers(preEl, el.lineStart);

  window.setTimeout(function() { showCodePopupPart4(el) }, 350);
}

function showCodePopupPart4(el) {
  el.classList.add('ready');
}

function hideCodePopup(el) {
  el.classList.add('hiding');

  window.setTimeout(function() { hideCodePopupPart2(el); }, 250);
}

function hideCodePopupPart2(el) {
  el.parentNode.removeChild(el);
}

function repositionCodePopup(el) {
  if (textRightEdge + el.properWidth + 20 <
      viewportScrollLeft + viewportWidth) {
    // If there is enough room on the right, put the pop-up there.
    var position = 'aside';

    var left = textRightEdge + 10;
    var top = el.originTop - 25;
  } else {
    var left = el.originLeft + 50;

    // We remember the original position so that the pop-up can expand to
    // the right if the user resizes the window – but can never jump from
    // above to below or vice versa.
    if (el.origPosition == 'above') {
      var position = 'above';
      var top = el.originTop - 20 - height;
    } else {
      var position = 'below';
      var top = el.originTop + 50;
    }
  }
  var width = el.properWidth;
  var height = el.properHeight;

  // Limit the height if there is not enough room vertically.
  if (top + height > viewportScrollTop + viewportHeight - 10) {
    height = viewportScrollTop + viewportHeight - 10 - top;

    if (height < MIN_CODE_POPUP_HEIGHT[position]) {
      if (position == 'aside') {
        height = Math.min(MIN_CODE_POPUP_HEIGHT[position], el.properHeight);
        top = viewportScrollTop + viewportHeight - 20 - height;
      } else {
        // Don't allow to jump from above to below as you scroll or move,
        // you are only allowed this decision at the first time.
        if (!el.origPosition) {
          var position = 'above';

          var height = el.properHeight;
          var top = el.originTop - 20 - height;
        } else {
          height = Math.min(MIN_CODE_POPUP_HEIGHT[position], el.properHeight);
        }
      }
    }
  }

  // Move to the left if it would hang off the right.
  if (left + width > viewportScrollLeft + viewportWidth - 20) {
    left = viewportScrollLeft + viewportWidth - 20 - width;

    // If it would stick out on the left, just make it smaller and span
    // the entire viewport width.
    if (left < 20) {
      left = viewportScrollLeft - 12;
      width = viewportWidth + 12;
    }
  }

  if (!el.originalPosition) {
    el.origPosition = position;
  }

  el.classList.remove('below');
  el.classList.remove('above');
  el.classList.remove('aside');
  el.classList.add(position);

  el.style.left = left + 'px';
  el.style.top = top + 'px';
  el.style.width = width + 'px';
  el.style.height = height + 'px';
}


/* UNSORTED BELOW ******************************************************* */


function processExcerptSrc(src) {
  var match = src.match(/(.*?)\#([0-9]*?)\-([0-9]*)/);

  var data = {};

  data.url = match[1];
  data.lineStart = parseInt(match[2]);
  data.lineEnd = parseInt(match[3]);

  return data;
}

function preloadInlineCodeEls() {
  var els = document.querySelectorAll('pre[src]');

  for (var i = 0, el; el = els[i]; i++) {
    var data = processExcerptSrc(el.getAttribute('src'));
    loadCodeFile(data.url);
  }
}

function prepareInlineCodeEl(el) {
  var data = processExcerptSrc(el.getAttribute('src'));
  code = getCodeFileExcerpt(data.url, data.lineStart, data.lineEnd, true);
  el.innerHTML = escapeEntities(code);

  el.classList.add('pretty-print');
  el.classList.add('prettyprint');
  prettyPrintOneEl(el);

  addLineNumbers(el, data.lineStart);
}

function prepareInlineCodeEls() {
  var els = document.querySelectorAll('pre[src]');

  for (var i = 0, el; el = els[i]; i++) {
    prepareInlineCodeEl(el);
  }
}

// So that a click on a code pop-up won't be intercepted by onBodyMouseDown
// and… hide the pop-up.
function onCodePopupMouseDown(event) {
  event.stopPropagation();
}

// So that a tap on a code pop-up won't be intercepted by onBodyTouchStart
// and… hide the pop-up.
function onCodePopupTouchStart(event) {
  event.stopPropagation();
}

// Hide any active pop-up if clicked outside on text.
function onBodyMouseDown(event) {
  hideAllPopups();
}

// Hide any active pop-up if tapped outside on text.
function onBodyTouchStart(event) {
  hideAllPopups();
}

// Do all the necessary things when the code is scrolled.
function onCodeScroll(event) {
  var el = event.target;

  // This is a nasty scrolling trick so that the mouse wheel scrolling is
  // not intercepted by document.body
  if (el.scrollTop + el.clientHeight - el.scrollHeight == 0) {
    el.scrollTop = - el.clientHeight + el.scrollHeight - 1;
  } else if (el.scrollTop == 0) {
    el.scrollTop = 1;
  }

  // I am honestly not sure why the background is not scrolling with content
  // by default, so we need to force it to.
  el.style.backgroundPositionY = -el.scrollTop + 'px';
}


function prepareCodePopupAnchorEl(el) {
  el.addEventListener('click', onCodePopupAnchorClick, false);
}

// Go through all the anchors and if anything matches the code,
function preloadCodePopupAnchorEls() {
  var els = mainTextEl.querySelectorAll('a');

  // TODO(mwichary): This assumes all the links starting with code/
  // are well-formed (code/filename#x-y). It probably shouldn't.
  for (var i = 0, el; el = els[i]; i++) {
    if (el.getAttribute('href').substr(0, CODE_PATH_PREFIX.length) ==
        CODE_PATH_PREFIX) {
      el.classList.add('add-code-popup');

      el.title = el.getAttribute('href').substr(CODE_PATH_PREFIX.length).
                 replace(/\#/, ' @ ');

      var data = processExcerptSrc(el.getAttribute('href'));
      loadCodeFile(data.url);
      
      el.origHref = el.getAttribute('href');
      
      // Link to the proper repository, and since it doesn’t support linking
      // to #X-Y, rewrite to do just #X
      el.href = DESTINATION_CODE_PATH_PREFIX + 
                el.getAttribute('href').substr(CODE_PATH_PREFIX.length).replace(/(-[0-9]*$)/, '');
    }
  }
}

function prepareCodePopupAnchorEls() {
  var els = mainTextEl.querySelectorAll('a.add-code-popup');

  for (var i = 0, el; el = els[i]; i++) {
    prepareCodePopupAnchorEl(el);
  }
}

function hideAllPopups() {
  var els = document.querySelectorAll('.add-code-popup.showing');

  for (var i = 0, el; el = els[i]; i++) {
    el.classList.remove('showing');
  }

  var els = document.querySelectorAll('.code-popup');

  for (var i = 0, el; el = els[i]; i++) {
    hideCodePopup(el);
  }
}

function repositionAllPopups() {
  var els = document.querySelectorAll('.code-popup');

  for (var i = 0, el; el = els[i]; i++) {
    repositionCodePopup(el);
  }
}

function updateViewportMetrics() {
  var pos = getElBodyPos(mainTextEl);
  textRightEdge = pos.left + mainTextEl.offsetWidth;

  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  viewportScrollLeft = document.documentElement.scrollLeft + document.body.scrollLeft;
  viewportScrollTop = document.documentElement.scrollTop + document.body.scrollTop;
}

function onBodyResize(event) {
  repositionAllPopups();
  updateViewportMetrics();
}

function onBodyScroll(event) {
  repositionAllPopups();
  updateViewportMetrics();
}

function onBodyKeyDown(event) {
  switch (event.keyCode) {
    case 27: // Esc
      hideAllPopups();
      break;
  }
}

function addEventListeners() {
  window.addEventListener('scroll', onBodyScroll, false);
  window.addEventListener('resize', onBodyResize, false);
  document.body.addEventListener('mousedown', onBodyMouseDown, false);
  document.body.addEventListener('touchstart', onBodyTouchStart, false);

  window.addEventListener('keydown', onBodyKeyDown, false);
}

function getCodeFileExcerpt(url, startLine, endLine, removeLeadingSpaces) {
  var code = '';

  if (removeLeadingSpaces) {
    var minLeadingSpace = 9999;
    for (var i = startLine - 1; i < endLine; i++) {
      if (codeFiles[url][i].length) {
        var space = getLeadingSpaceCount(codeFiles[url][i]);

        if (space < minLeadingSpace) {
          minLeadingSpace = space;
        }

        if (minLeadingSpace == 0) {
          break;
        }
      }
    }
  }

  for (var i = startLine - 1; i < endLine; i++) {
    var line = codeFiles[url][i];

    if (removeLeadingSpaces) {
      line = line.substr(minLeadingSpace);
    }

    code += line + '\n';
  }

  return code;
}

function processCodeFile(url, code) {
  codeFiles[url] = code.split(/\n/);
}

// Load a file with a given URL.
function loadCodeFile(url) {
  // Already loaded.
  if (codeFiles[url]) {
    return;
  }

  codeFilesToBeLoaded++;

  codeFiles[url] = '';

  var client = new XMLHttpRequest();
  client.url = url;

  client.onreadystatechange = function() {
    if (this.readyState == 4) {
      if (this.responseText != "") {
        processCodeFile(this.url, this.responseText);

        codeFilesToBeLoaded--;
        if (codeFilesToBeLoaded == 0) {
          allCodeFilesLoaded();
        }
      }
    }
  }

  client.open('GET', url, true);
  client.send();
}

// Whether we're on the touch platform or not.
function isTouchDevice() {
  return "ontouchstart" in window;
}

// Loads an additional stylesheet depending on whether we're on a mouse-based
// machine or on a touch machine.
function addPlatformStylesheet() {
  if (isTouchDevice()) {
    var el = document.createElement('link');
    el.rel = 'stylesheet';
    el.type = 'text/css';
    el.href = 'styles-touch.css';
  } else {
    var el = document.createElement('link');
    el.rel = 'stylesheet';
    el.type = 'text/css';
    el.href = 'styles-mouse.css';
  }

  document.querySelector('head').appendChild(el);
}

// Do everything else once everything's loaded.
// TODO(mwichary): This is most likely a bad solution – waiting for all the
// code files to be loaded before we do everything else. Ideally, we'd not
// be gated on that and handle interaction with yet-unloaded elements (e.g.
// tapping to see code pop-up with code that hasn't been loaded yet) more
// gracefully.
function allCodeFilesLoaded() {
  updateViewportMetrics();

  prepareCodePopupAnchorEls();
  prepareInlineCodeEls();

  addEventListeners();
}

function initialize() {
  mainTextEl = document.querySelectorAll('#main-text')[0];

  addPlatformStylesheet();

  preloadCodePopupAnchorEls();
  preloadInlineCodeEls();
}
