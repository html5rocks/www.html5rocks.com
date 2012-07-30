/**
 * Copyright 2011 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @fileoverview Doodle game engine: Main entry point.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

/**
 * Creates our game engine.
 */
engine.init = function() {
  if (!document.getElementById(engine.BODY_GENERAL_EL_ID) ||
      engine.initialized) {
    return;
  }

  /**
   * Whether the doodle has been initialized.
   */
  engine.initialized = true;

  /**
   * Whether general debugging/development options are enabled via
   * &debug CGI parameter. Please note that engine.debugAllowed needs
   * to be enabled for this to work.
   */
  engine.debugEnabled = false;

  /**
   * Whether to use sprites (true for production) or temporary raw standalone
   * images (for development/debugging).
   */
  engine.useSprites = true;

  /**
   * The number of the current scene (first scene = 0).
   */
  engine.curSceneNo = null;

  /**
   * Current scene id as a string, e.g. 'level-2'.
   */
  engine.curSceneId = null;

  /**
   * Current scene as an object.
   */
  engine.curScene = null;

  /**
   * Whether the doodle is in the “attract mode” (on page load, prior to
   * any interaction), or actual game play.
   */
  engine.attractMode = true;

  /**
   * Whether the doodle is currently in the interactive state (awaiting
   * input from the user) as opposed to non-interactive state (playing
   * animations).
   */
  engine.interactive = false;

  /**
   * Whether the doodle is currently asleep due to inactivity. We do it
   * to conserve resources.
   */
  engine.asleep = false;

  /**
   * If set to true, the next frame of the doodle will exit with no effect,
   * stopping the animation. Use when we go to search results.
   */
  engine.stopTicking = false;

  /**
   * Whether the tab with the doodle is currently focused.
   */
  engine.tabFocused = true;

  /**
   * Whether the tab is currently visible (uses Visibility API).
   */
  engine.tabVisible = true;

  /**
   * Are we currently fast forwarding?
   */
  engine.fastForwarding = false;

  /**
   * The current count of logical ticks per physical ticks. Equals one
   * for normal gameplay, can ramp up to engine.FAST_FORWARD_TICK_COUNT
   * as necessary.
   */
  engine.logicalTickCount = 1;

  /**
   * Whether the timer is currently ticking.
   */
  engine.ticking = false;

  /**
   * As the doodle falls asleep or wakes up, we do not simply stop it, but
   * slow it down or speed it up for a nicer effect. We use this multiplier
   * to achieve that.
   */
  engine.tickMultiplier = 1;

  /**
   * As the game slows down in preparation for falling asleep, we need to
   * miss some of the ticks. This counts them.
   */
  engine.missedTickCount = 0;

  /**
   * Whether the tooltip is currently shown. We need to know this, since
   * showing the tooltip implicitly pauses the game.
   */
  engine.tooltipShown = false;

  /**
   * Whether the tooltip is showing, but not yet shown (e.g. when the doodle
   * is slowing down in preparation for it).
   */
  engine.tooltipShowing = false;

  /**
   * Whether the doodle is paused/frozen, waiting for images. We try to
   * preload images far in advance, but in case we fail, we have to pause
   * the doodle, show a loading message, and wait for images to load.
   */
  engine.waitingForImages = false;

  /**
   * Current game time (in milliseconds). In normal circumstances, game time
   * progresses 1:1 with physical time, but this can change sometimes.
   */
  engine.curGameTime = null;

  /**
   * Game time at the previous clock tick.
   */
  engine.lastGameTime = null;

  /**
   * Last real (physical) clock time. Game time can diverge from physical
   * clock time for example if the frame rate is too slow.
   */
  engine.lastPhysicalTime = null;

  /**
   * Last time a user interacted with the doodle. (Used to put the doodle
   * to sleep if nothing is happening).
   */
  engine.lastInteractionTime = null;

  /**
   * Last time a user interacted with the doodle meaningfully – e.g.
   * clicking on a button rather than just clicking somewhere random.
   * This is used when we decide whether to show a hint or not.
   */
  engine.lastMeaningfulInteractionTime = null;

  /**
   * Current frame rate.
   */
  engine.curFps = 0;

  /**
   * Rolling/average frame rate (we measure it every 100 ticks).
   */
  engine.rollingFps = 0;

  /**
   * Counting the ticks to measure the rolling frame rate.
   */
  engine.rollingFpsTicks = 0;

  /**
   * Counting the frame rate sum that we later average over 100 ticks.
   */
  engine.rollingFpsSum = 0;

  /**
   * If the doodle height is lower than the ultimate height (which is true
   * when we start), we put an offset here so everything’s bottom-aligned.
   */
  engine.bodyOffsetY = 0;

  /**
   * Current mouse position with respect to the viewport.
   */
  engine.mouseX = 0;
  engine.mouseY = 0;

  /**
   * Last time the mouse was moved (in game time).
   */
  engine.lastMouseMoveTime = engine.curGameTime;

  /**
   * Last time the mouse was moved (in physical time).
   */
  engine.lastMouseMovePhysicalTime = 0;

  /**
   * Whether we are currently using our custom (in-game) mouse pointer.
   */
  engine.customMousePointer = false;

  /**
   * How much padding around click/touch elements (bigger for touch).
   */
  engine.clickableElPadding = engine.PADDING_CLICK;

  /**
   * Global play count (=0 if the game is played for the first time). This
   * is stored using HTML5 Web Storage and used to allow for fast forwarding,
   * change the difficulty level, etc.
   */
  engine.globalPlayCount = null;

  /**
   * Also stored using HTML5 Web Storage, this is the number of the last
   * played scene. We’re not allowing to fast forward a scene you haven’t
   * seen yet if you aborted the first game play.
   */
  engine.lastReachedSceneNo = null;

  /**
   * A two-letter country code (defaults to English).
   */
  engine.country = 'en';

  /**
   * Whether the rect ordering (by z-index) has become invalid and needs to
   * be recalculated.
   */
  engine.rectOrderInvalidated = true;

  /**
   * Whether the Shift key is pressed. Shift enables us to fast-forward
   * (debugging/development only).
   */
  engine.debugShiftPressed = false;

  /** A list of all browser event listeners that have been added. */
  engine.listeners = [];

  engine.actors = {};
  engine.actions = [];
  engine.scenes = [];
  engine.rects = [];

  engine.detectFeatures();
  engine.initCountry();
  engine.readDebugParams();
  engine.initLanguage();

  // This is Lem-specific in lem-images.js
  // TODO(mwichary): Separate it better.
  if (engine.prepareImageSets) {
    engine.prepareImageSets();
  }
  engine.initImages();
};

/**
 * Unregisters the doodle, stopping its effect on the page, and clears
 * after it.
 */
engine.destroy = function() {
  engine.removeAllEventListeners();

  $a('outside-explosions').undo();

  for (var i in engine.actors) {
    if (engine.actors[i].rect.attachedToDocumentBody) {
      engine.actors[i].rect.removeDomElement();
    }
  }

  engine.stopTicking = true;
};

/**
 * Detect various browser features such as <canvas> or touch support.
 */
engine.detectFeatures = function() {
  this.features = {};

  // Whether the browser supports touch. We do not query for it, but change
  // it later if we encounter touch events.

  this.features.touch = false;

  // Whether the browser supports hiding the mouse pointer.
  // Unfortunately, Opera fails at this and I don’t know of a way to
  // feature-detect it.
  this.features.hidingMousePointer = false;
  if (navigator.userAgent.indexOf('Opera/') == -1) {
    var el = document.createElement('div');
    el.style.cursor = 'none';
    if (el.style.cursor == 'none') {
      this.features.hidingMousePointer = true;
    }
  }

  // Whether the browser supports <canvas>.

  el = document.createElement('canvas');
  this.features.canvas = !!(el.getContext && el.getContext('2d'));

  if (this.features.canvas) {
    // Even though <canvas> is available in earlier Operas, we enable it
    // only for versions >= 10.5 since before it has terrible performance
    // and bugs.
    if (navigator.userAgent.indexOf('Opera/') != -1) {
      this.features.canvas = false;

      var match = navigator.userAgent.match(/Version\/([0-9]+).([0-9]+)/);

      if (match && match[1] && match[2]) {
        var versionMaj = parseInt(match[1], 10);
        var versionMin = parseInt(match[2], 10);

        if (versionMaj && versionMin) {
          if ((versionMaj >= 11) ||
              ((versionMaj == 10) && (versionMin >= 50))) {
            this.features.canvas = true;
          }
        }
      }
    }

    // We disable <canvas> on Firefox for Linux because it typically is
    // slower than DOM.
    if ((navigator.userAgent.indexOf('Firefox/') != -1) &&
        (navigator.userAgent.indexOf('Linux') != -1)) {
      this.features.canvas = false;
    }
  }

  // Whether the browser supports opacity natively.

  if (navigator.userAgent.indexOf('MSIE 5.') != -1 ||
      navigator.userAgent.indexOf('MSIE 6.') != -1 ||
      navigator.userAgent.indexOf('MSIE 7.') != -1 ||
      navigator.userAgent.indexOf('MSIE 8.') != -1) {
    this.features.filterOpacity = true;
  } else {
    this.features.filterOpacity = false;
  }

  // Whether the browser is IE <= 8.

  this.features.ie8OrLower = navigator.userAgent.indexOf('MSIE 5.') != -1 ||
                             navigator.userAgent.indexOf('MSIE 6.') != -1 ||
                             navigator.userAgent.indexOf('MSIE 7.') != -1 ||
                             navigator.userAgent.indexOf('MSIE 8.') != -1;

  // Whether we’re running on a Mac.

  if (navigator.userAgent.indexOf('Macintosh') != -1) {
    this.features.imAMac = true;
  } else {
    this.features.imAMac = false;
  }

  // HTML5 Web Storage.

  try {
    this.features.webStorage = !!window.localStorage.getItem;
  } catch (e) {
    this.features.webStorage = false;
  }

  // Fixing old IE background caching bug that causes IE to reload images
  // when used as backgrounds in CSS, even if they are already cached.
  try {
    document.execCommand('BackgroundImageCache', false, true);
  } catch (e) {
  }
};

/**
 * Read debug parameters.
 */
engine.readDebugParams = function() {
  engine.debug = {};

  var url = window.location.href;

  if (engine.debugAllowed) {
    if ((url.indexOf('?doodle-debug') != -1) ||
        (url.indexOf('&doodle-debug') != -1)) {
      engine.debugEnabled = true;
    }

    if (engine.debugEnabled) {
      if (url.indexOf('&doodle-force-canvas') != -1) {
        engine.features.canvas = true;
      }
      if (url.indexOf('&doodle-force-dom') != -1) {
        engine.features.canvas = false;
      }
      if (url.indexOf('&doodle-force-raw') != -1) {
        engine.useSprites = false;
      }
      if (url.indexOf('&doodle-show-clickable') != -1) {
        engine.debug.showClickable = true;
      }
      if (url.indexOf('&doodle-show-debug') != -1) {
        engine.debug.showDebugPanel = true;
      }
      if (url.indexOf('&doodle-first-run') != -1) {
        engine.globalPlayCount = 0;
        engine.lastReachedSceneNo = 0;
      }
      if (url.indexOf('&doodle-half-run') != -1) {
        engine.globalPlayCount = 0;
        engine.lastReachedSceneNo = 3;
      }
      if (url.indexOf('&doodle-second-run') != -1) {
        engine.globalPlayCount = 1;
        engine.lastReachedSceneNo = 0;
      }
      if (url.indexOf('&doodle-old-run') != -1) {
        engine.globalPlayCount = 999;
        engine.lastReachedSceneNo = 999;
      }

      if (url.indexOf('&doodle-country=') != -1) {
        var match = url.match(/\&doodle-country=([a-z]+)/);

        if (match && match[1]) {
          engine.country = match[1];
        }
      }
    }
  }
};

/**
 * Prepare the image structures and preload the initial set of images
 * necessary to play the non-interactive/attract-mode part of the doodle.
 */
engine.initImages = function() {
  // How many images (either sprite sets or individual images if running
  // in dev/debug mode) remain to be loaded.
  this.imagesToBeLoaded = 0;

  // Which images have been loaded.
  this.loadedImageFiles = [];

  // Which images are generally available (keyed off id).
  this.imageSpriteIds = [];

  for (var id in engine.IMAGE_SETS) {
    var imageSet = engine.IMAGE_SETS[id];

    for (var j in imageSet) {
      this.imageSpriteIds[imageSet[j]] = id;
    }
  }

  var introImageSetId = 'intro-' + this.country;
  if (!engine.IMAGE_SETS[introImageSetId]) {
    introImageSetId = 'intro';
  }
  this.preloadImageSet({ id: introImageSetId,
                         onLoad: this.initialResourcesLoaded });
};

/**
 * Start the doodle once we have all the necessary resources (images) loaded.
 */
engine.initialResourcesLoaded = function() {
  engine.initBody();
  engine.initScenes();
  engine.readProgress();

  if (engine.debug.showDebugPanel) {
    engine.initDebugPanel();
  }

  engine.addEventListeners();

  engine.initTimer();
  engine.startFirstScene();
};

/**
 * Initialize language based on country we’re running in.
 */
engine.initCountry = function() {
  if (this.standalone) {
    // Prefer reading from #hl= over from domain. The hl can typically be
    // more complicated (e.g. zh-TW), but Lem doesn’t support any of those
    // anyway.
    var match = window.location.hash.match(/[\&\?\#]hl=([a-z]+)/);

    if (match && match[1]) {
      this.country = match[1];
    } else {
      this.country = engine.DOMAIN_TO_LANGUAGE[window.location.hostname];
    }

    if (!this.country) {
      this.country = 'en';
    }
  } else {
    this.country = google.kHL;
  }
};

/**
 * Initialize language based on country we’re running in.
 */
engine.initLanguage = function() {
  if (this.LANGUAGE_MAPPINGS[this.country]) {
    this.country = this.LANGUAGE_MAPPINGS[this.country];
  }

  // Default to English in case we don’t know the country.
  if (!this.LANGUAGES[this.country]) {
    this.country = 'en';
  }
  this.language = this.LANGUAGES[this.country];
};

/**
 * Init the timer and perform the first timer tick.
 */
engine.initTimer = function() {
  this.minFramerateTime = 1000 / this.MIN_FPS;
  this.maxFramerateTime = 1000 / this.MAX_FPS;

  this.curGameTime = 0;
  this.lastGameTime = this.curGameTime;
  this.lastPhysicalTime = new Date().getTime();

  this.interaction({ meaningful: true });
  this.updateInactiveSleepTime();
  this.nextTick();
};

/**
 * Set the inactive sleep time (the time of inactivity after which the doodle
 * will go to sleep to conserve CPU) depending on whether the doodle started
 * playing, and whether the tab is focused. */
engine.updateInactiveSleepTime = function() {
  if (engine.attractMode) {
    engine.inactiveSleepTime = engine.INACTIVE_SLEEP_TIME_ATTRACT_MODE;
  } else {
    if (engine.tabFocused) {
      engine.inactiveSleepTime = engine.INACTIVE_SLEEP_TIME_FOCUSED;
    } else {
      engine.inactiveSleepTime = engine.INACTIVE_SLEEP_TIME_UNFOCUSED;
    }
  }
};

/**
 * Wake the doodle up if it’s been previously asleep.
 */
engine.wakeUp = function() {
  engine.lastPhysicalTime = new Date().getTime();
  engine.tickMultiplier = engine.SLOW_DOWN_TICK_MULTIPLIER;
  engine.missedTickCount = 0;
  engine.asleep = false;
  engine.nextTick();
};

/**
 * Run when the doodle is interacted with (mouse click, move, etc.)
 * This prevents doodle from falling asleep.
 * @param {Object} params
 * - {boolean} .meaningful Whether an interaction is meaningful (e.g. makes
 *                         sense rather than a mindless wasted click)
 */
engine.interaction = function(params) {
  engine.lastInteractionTime = engine.curGameTime;

  if (params && params.meaningful) {
    engine.lastMeaningfulInteractionTime = engine.curGameTime;
  }

  if (engine.asleep) {
    engine.wakeUp();
  }
};

/**
 * Schedule the next clock tick.
 */
engine.nextTick = function() {
  if (!engine.ticking) {
    engine.ticking = true;

    engine.requestAnimFrame.call(window, engine.physicalTick);
  }
};

/**
 * Init the scenes; just copy the structure to the variable.
 */
engine.initScenes = function() {
  for (var id in engine.SCENES) {
    this.scenes[id] = engine.SCENES[id];
  }
};

/**
 * Get an actor given an id. If the actor was not present before, initialize
 * it.
 * @param {Object} params
 * - {string} .id Actor id.
 */
engine.getActor = function(params) {
  if (!engine.actors[params.id]) {
    engine.actors[params.id] = new EngineActor(params.id);
    if (engine.actors[params.id].init) {
      engine.actors[params.id].init();
    }
  }

  return engine.actors[params.id];
};

/**
 * A short-hand function allowing to call $a('test') instead of
 * engine.getActor({ id: 'test' }).
 * @param {Object} params
 * - {string} .id Actor id.
 */
function $a(id) {
  return engine.getActor({ id: id });
}

/**
 * Clears anything that’s originally in the doodle wrapper div. This includes
 * the standalone image placeholder. We do it after we output the first
 * frame to avoid blinking.
 */
engine.clearOldDoodleElements = function() {
  var bodyChildren = engine.bodyGeneralEl.children;
  for (var i = 0, el; el = bodyChildren[i]; i++) {
    if (el.toBeRemoved) {
      el.style.display = 'none';
    }
  }
};

/**
 * Init the doodle body element, creating <canvas> if necessary.
 */
engine.initBody = function() {
  this.bodyGeneralEl = document.getElementById(this.BODY_GENERAL_EL_ID);

  // Prepare any elements inside the body tag to be removed later.
  var bodyChildren = this.bodyGeneralEl.children;
  for (var i = 0, el; el = bodyChildren[i]; i++) {
    el.toBeRemoved = true;
  }
  this.needToClearOldDoodleElements = true;

  if (this.standalone) {
    engine.startDoodleBodyTop = 200;
    engine.endDoodleBodyTop = 0;
  } else {
    engine.startDoodleBodyTop = 95;
    engine.endDoodleBodyTop = 15;
  }

  this.bodyEl = document.createElement('div');
  this.bodyEl.style.left = engine.LEFT_MARGIN + 'px';
  this.bodyEl.style.top = engine.startDoodleBodyTop + 'px';
  this.bodyEl.style.position = 'absolute';
  this.bodyEl.style.overflow = 'hidden';

  this.bodyEl.style.width = (this.INITIAL_WIDTH + this.TOOLBAR_WIDTH) + 'px';
  this.bodyEl.style.height = this.INITIAL_HEIGHT + 'px';

  // We want our element focusable so it could steal page focus… but we
  // don’t want to indicate it in any way.
  this.bodyEl.tabIndex = 1;
  this.bodyEl.style.outline = 'none';
  this.bodyEl.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
  this.bodyEl.hideFocus = true;

  this.bodyOffsetY = this.EXPANDED_HEIGHT - this.INITIAL_HEIGHT;

  this.bodyGeneralEl.appendChild(this.bodyEl);

  /* Create the <canvas> element we’ll be drawing on if that’s available. */

  if (this.features.canvas) {
    this.canvasEl = document.createElement('canvas');

    this.canvasEl.width = (this.INITIAL_WIDTH + this.TOOLBAR_WIDTH);
    this.canvasEl.height = this.EXPANDED_HEIGHT;

    this.canvasEl.style.position = 'absolute';
    this.canvasEl.style.left = 0;
    this.canvasEl.style.bottom = 0;

    this.bodyEl.appendChild(this.canvasEl);

    this.canvasCtx = this.canvasEl.getContext('2d');
  }

  this.readBodyPos();
};

/**
 * Handle the visibility change event. If the page becomes invisible (e.g.
 * the user selected another tab in the same window), make the doodle asleep
 * immediately.
 */
engine.onVisibilityChange = function() {
  var hidden = document.hidden || document.webkitHidden;

  engine.tabVisible = !hidden;

  if (!engine.tabVisible) {
    engine.asleep = true;
  } else {
    if (engine.asleep) {
      engine.wakeUp();
    }
  }
};

/**
 * Recalculate some things (body position) when the viewport resizes.
 */
engine.onResize = function() {
  engine.readBodyPos();
};

/**
 * Handle the body scrolling: Update the mouse pointer to stay in place.
 */
engine.onScroll = function() {
  engine.syncMousePointer();
};

/**
 * Handle the body getting focused.
 */
engine.onBodyFocus = function() {
  engine.tabFocused = true;
  engine.updateInactiveSleepTime();
};

/**
 * Handle the body losing focus.
 */
engine.onBodyBlur = function() {
  engine.tabFocused = false;
  engine.updateInactiveSleepTime();
};

/**
 * Handle any touch start event on the doodle. If happening for the first
 * time, make sure we know we’re on a touch device.
 */
engine.onTouchStart = function() {
  if (!engine.features.touch) {
    engine.features.touch = true;
    engine.clickableElPadding = engine.PADDING_TOUCH;

    $a('mouse-pointer').setVisible({ visible: false });
  }
}

/**
 * Add all the necessary event listeners.
 */
engine.addEventListeners = function() {
  // Keyboard event listeners.
  if (engine.debugEnabled) {
    engine.addEventListener({
        el: document.body, type: 'keydown', handler: engine.onKeyDown });
    engine.addEventListener({
        el: document.body, type: 'keyup', handler: engine.onKeyUp });
  }

  // Resize event listener. We need to recalculate the position of the
  // doodle vis-a-vis viewport whenever the window is resized.
  engine.addEventListener({
      el: window, type: 'resize',
      handler: engine.onResize });

  // Scroll event listener, to know where the mouse pointer is.
  engine.addEventListener({
      el: window, type: 'scroll',
      handler: engine.onScroll });

  // Mouse move event listener
  engine.addEventListener({
      el: document.body, type: 'mousemove',
      handler: engine.onMouseMove });

  // Mouse down listener for the doodle element.
  engine.addEventListener({
      el: engine.bodyEl, type: 'mousedown',
      handler: engine.onBodyMouseDown });
  // Click listener for the entire website, used to dismiss a tooltip
  // if one is present.
  engine.addEventListener({
      el: document.body, type: 'click',
      handler: engine.onPageClick });

  // Mouse up listener for the entire website (not just doodle element,
  // because the mouse button can be down on the doodle, but then be dragged
  // and released outside).
  engine.addEventListener({
      el: document.body, type: 'mouseup',
      handler: engine.onPageMouseUp });

  // Touch start/end events mirrored to mouse clicks.
  engine.addEventListener({
      el: engine.bodyEl, type: 'touchend',
      handler: engine.onBodyMouseDown });

  // A separate touch start event for the entire body for us to recognize
  // we’re dealing with a touch device.
  engine.addEventListener({
      el: engine.bodyEl, type: 'touchstart',
      handler: engine.onTouchStart });

  // Visibility change listener (when the tab becomes visible or invisible –
  // e.g. the user switches to another tab). We’re adding 'visibilitychange'
  // aspirationally, since it doesn’t exist on anything else than WebKit
  // today.
  engine.addEventListener({
      el: document, type: 'webkitvisibilitychange',
      handler: engine.onVisibilityChange });
  engine.addEventListener({
      el: document, type: 'visibilitychange',
      handler: engine.onVisibilityChange });

  // Listeners to whether the page gets or loses focus.
  engine.addEventListener({
      el: window, type: 'focus',
      handler: engine.onBodyFocus });
  engine.addEventListener({
      el: window, type: 'blur',
      handler: engine.onBodyBlur });
};


/**
 * Handle a key down event.
 * @param {Event} e Window event.
 */
engine.onKeyDown = function(e) {
  var event = engine.getDomEvent({ event: e });

  switch (event.keyCode) {
    case engine.KEY_SHIFT:
      // Quick fast forward when you hold Shift (debug only).
      engine.debugShiftPressed = true;
      engine.preventDefaultEvent({ event: event });
      break;
    case engine.KEY_T:
      // Simulate target hit in the third scene if you press T (debug only).
      $a('babybot-cannon').targetHit();
      engine.preventDefaultEvent({ event: event });
      break;
    case engine.KEY_N:
      // Go to the next scene if you press N (debug only).
      engine.goToNextScene();
      engine.preventDefaultEvent({ event: event });
      break;
  }

  engine.interaction();
};

/**
 * Handle a key up event.
 * @param {Event} e Window event.
 */
engine.onKeyUp = function(e) {
  var event = engine.getDomEvent({ event: e });

  engine.interaction();

  switch (event.keyCode) {
    case engine.KEY_SHIFT:
      // Quick fast forward when you hold Shift (debug only).
      engine.debugShiftPressed = false;
      break;
  }
};

/**
 * Handle a mouse down event on the entire page.
 * @param {Event} e Window event.
 */
engine.onPageClick = function(e) {
  var event = engine.getDomEvent({ event: e });

  if ($a('tooltip').rect.visible && !$a('tooltip').curPressed) {
    $a('tooltip').hide();
    engine.preventDefaultEvent({ event: event });
  }
};

/**
 * Handle a mouse down event on the doodle.
 * @param {Event} e Window event.
 */
engine.onBodyMouseDown = function(e) {
  var event = engine.getDomEvent({ event: e });

  engine.interaction();

  // Hide the hint, if visible.
  $a('hints').hide();

  // Cancel the event, so the user cannot drag/select items in the
  // DOM rendering mode.
  engine.preventDefaultEvent({ event: event });

  // Change the mouse pointer to a click state.
  $a('mouse-pointer').reactToMouseDown();
};

/**
 * Handle a mouse up event on the entire page.
 * @param {Event} e Window event.
 */
engine.onPageMouseUp = function(e) {
  engine.interaction();

  /* Change the mouse pointer to its previous state. */
  $a('mouse-pointer').reactToMouseUp();
};

/**
 * Update our custom mouse pointer to move it according to where the
 * real mouse pointer is.
 */
engine.syncMousePointer = function() {
  $a('mouse-pointer').sync();
};

/**
 * Handle a mouse move event.
 * @param {Event} e Window event.
 */
engine.onMouseMove = function(e) {
  var event = engine.getDomEvent({ event: e });

  engine.interaction();

  engine.mouseX = event.clientX;
  engine.mouseY = event.clientY;

  // Only update the mouse visually when the game processed at least one
  // physical tick; this prevents moving mouse pointer from firing too
  // many transforms and slowing the entire game
  if (engine.lastMouseMovePhysicalTime != engine.lastPhysicalTime) {
    engine.syncMousePointer();
    engine.lastMouseMovePhysicalTime = engine.lastPhysicalTime;
  }

  engine.lastMouseMoveTime = engine.curGameTime;

  // If a bird was sitting on the mouse pointer, we should let it know,
  // so it can fly away. :·)
  // TODO(mwichary): Nasty that this is right here. We probably need to
  // add on mouse move handler to actors.
  if ($a('bird').landingOnMousePointer) {
    $a('bird').abortLandingOnMousePointer();
  }
};

/**
 * Set the doodle in the interactive state (waiting for the user to do
 * things) or non-interactive (animations are playing on their own).
 * @param {Object} params
 * - {boolean} .interactive Whether interactive or not.
 */
engine.setInteractive = function(params) {
  engine.interactive = params.interactive;

  // Change the mouse pointer to wait or non-wait respectively.
  if (engine.customMousePointer) {
    $a('mouse-pointer').setInteractive(params);
  } else {
    engine.bodyEl.style.cursor = params.interactive ? '' : 'wait';
  }

  var fastForwardAvailable =
      engine.curScene.cutscene &&
      (engine.curSceneNo < engine.lastReachedSceneNo);

  if (params.interactive) {
    $a('toolbar-wait').hide();

    engine.lastMeaningfulInteractionTime = engine.curGameTime;
  } else {
    $a('toolbar-wait').show({ fastForwardAvailable: fastForwardAvailable });
  }
};


/**
 * Set whether we use a custom (in-doodle) mouse pointer or a native one.
 * @param {Object} params
 * - {boolean} .customMousePointeractive Whether custom mouse pointer or not.
 */
engine.setCustomMousePointer = function(params) {
  if (!engine.features.hidingMousePointer) {
    return;
  }

  if (params.customMousePointer == this.customMousePointer) {
    return;
  }

  if (params.customMousePointer) {
    this.customMousePointer = true;

    this.setEmptyCssCursor({ el: engine.bodyEl });

    $a('mouse-pointer').setVisible({ visible: true });
    $a('mouse-pointer').updateState();
  } else {
    this.customMousePointer = false;

    engine.bodyEl.style.cursor = '';

    $a('mouse-pointer').setVisible({ visible: false });
  }

  // Refreshes the mouse pointer after the change.
  this.setInteractive({ interactive: this.interactive });
};

/**
 * Go to a given scene.
 * @param {Object} params
 * - {string} .no Scene number (from 0).
 */
engine.goToScene = function(params) {
  this.curSceneNo = params.no;
  this.curScene = this.scenes[params.no];
  this.curSceneId = this.curScene.id;

  this.curScene.onEnter();

  if (this.curSceneNo > this.lastReachedSceneNo) {
    this.lastReachedSceneNo = this.curSceneNo;
    this.saveProgress();
  }

  this.dispatchGameAction({ name: 'SceneEnter' });
};

/**
 * Start the first scene.
 */
engine.startFirstScene = function() {
  this.goToScene({ no: 0 });
};

/**
 * Continue to the subsequent scene.
 */
engine.goToNextScene = function() {
  this.ensureAllImagesLoaded();

  if (this.attractMode) {
    this.attractMode = false;
    this.updateInactiveSleepTime();
  }

  this.goToScene({ no: this.curSceneNo + 1 });
};

/**
 * Read progress from Web Storage variables. Default to sensible values
 * if not present.
 */
engine.readProgress = function() {
  // If already set up for debugging, don’t read.
  if ((engine.debug) && (this.globalPlayCount !== null)) {
    return;
  }

  if (this.features.webStorage) {
    this.globalPlayCount =
        parseInt(window.localStorage.getItem(
            this.WEB_STORAGE_PREFIX + 'play-count'), 10);
    if (!this.globalPlayCount || (this.globalPlayCount < 0)) {
      this.globalPlayCount = 0;
    }

    this.lastReachedSceneNo =
        parseInt(window.localStorage.getItem(
            this.WEB_STORAGE_PREFIX + 'last-reached-scene'), 10);

    if (isNaN(this.lastReachedSceneNo) || (this.lastReachedSceneNo < 0) ||
        (this.lastReachedSceneNo > this.scenes.length - 1)) {
      this.lastReachedSceneNo = 0;
    }
  }
};

/**
 * Save progress via Web Storage if it’s available.
 */
engine.saveProgress = function() {
  if (this.features.webStorage) {
    window.localStorage.setItem(
        this.WEB_STORAGE_PREFIX + 'play-count', this.globalPlayCount);
    window.localStorage.setItem(
        this.WEB_STORAGE_PREFIX + 'last-reached-scene', this.lastReachedSceneNo);
  }
};

/**
 * Function called if the doodle is finished (“solved”). Increases the
 * play count and saves progress.
 */
engine.doodleFinished = function() {
  engine.globalPlayCount++;
  this.saveProgress();
};

/**
 * Update all the (visible) actors.
 */
engine.updateAllActors = function() {
  for (var id in this.actors) {
    this.actors[id].update({ allInnerRects: true });
  }
};

/**
 * Perform a physical timer tick.
 * This is a physical tick from setTimeout or requestAnimationFrame.
 * In normal game play, this corresponds to one logical tick, but when
 * we’re fast forwarding, for example, the ratio is more than 1:1 (it’s
 * held in engine.logicalTickCount).
 */
engine.physicalTick = function() {
  if (engine.stopTicking) {
    engine.stopTicking = false;
    return;
  }

  engine.ticking = false;

  var time = new Date().getTime();

  // Effectively stop the entire game if we are waiting for the images to
  // load or showing the tooltip… but don’t fall asleep so that the mouse
  // pointer still works.
  if (engine.waitingForImages || engine.tooltipShown) {
    engine.timeDelta = 0;
  } else {
    engine.timeDelta = time - engine.lastPhysicalTime;
  }

  // We don’t drop below minimal frame rate (10 fps). We just slow the whole
  // thing down so we can show 10 frames per however much time necessary.
  if (engine.timeDelta > engine.minFramerateTime) {
    engine.timeDelta = engine.minFramerateTime;
  }

  // Start dropping frames if we’re trying to do more than 60fps
  if (engine.timeDelta &&
      (engine.timeDelta < engine.maxFramerateTime)) {
    engine.nextTick();
    return;
  }

  // If we’re slowing down before sleeping or speeding up after waking up,
  // this is where we count it down.
  if (engine.tickMultiplier > 1) {
    engine.missedTickCount++;
    if (engine.missedTickCount < engine.tickMultiplier) {
      engine.lastPhysicalTime = new Date().getTime();
      engine.nextTick();
      return;
    } else {
      engine.missedTickCount = 0;
    }
  }

  if (engine.debugShiftPressed) {
    var logicalTickCount = engine.DEBUG_FAST_TICK_COUNT;
  } else {
    var logicalTickCount = engine.logicalTickCount;
  }

  // If we fast forward when the user presses fast forward, or via Shift
  // for debugging, we will have many logical ticks per one physical tick.
  // We need to do all logical ticks for calculations, etc., but we can
  // only update the visuals per last logical trick. This variable tells
  // us whether it’s this tick.
  for (var i = 0; i < Math.floor(logicalTickCount) - 1; i++) {
    engine.logicalTick({ visibleTick: false });
  }
  engine.logicalTick({ visibleTick: true });

  if (engine.needToClearOldDoodleElements) {
    engine.clearOldDoodleElements();
  }

  if (engine.debugShiftPressed) {
    engine.interaction();
  }

  // When we’re entering or leaving fast forward, we don’t just go fast or
  // slow – we ramp up or down the number of logical ticks per physical
  // ticks.
  if (engine.fastForwarding &&
      (engine.logicalTickCount < engine.FAST_FORWARD_TICK_COUNT)) {
    engine.logicalTickCount += engine.FAST_FORWARD_TICK_COUNT_INC;
  } else if (!engine.fastForwarding &&
             (engine.logicalTickCount > 1)) {
    engine.logicalTickCount -= engine.FAST_FORWARD_TICK_COUNT_DEC;

    if (engine.logicalTickCount < 1) {
      engine.logicalTickCount = 1;
    }
  }

  // If the doodle is falling asleep, waking up, we increase or decrease
  // the tick multiplier so that the doodle can ease into pause or ease from
  // pause instead of stopping rapidly.
  if (engine.asleep ||
      (engine.tooltipShowing && !engine.interactive)) {
    engine.tickMultiplier++;

    if (engine.tickMultiplier <= engine.SLOW_DOWN_TICK_MULTIPLIER) {
      engine.nextTick();
    } else {
      // We slowed down, now pause completely.
      if (engine.tooltipShowing) {
        engine.tooltipShowing = false;
        engine.tooltipShown = true;
        engine.nextTick();
      }
    }
  } else {
    if (engine.tickMultiplier > 1) {
      engine.tickMultiplier--;
    }

    engine.nextTick();
  }

  engine.lastPhysicalTime = time;
};

/**
 * Perform a logical tick.
 * @param {Object} params
 * - {boolean} .visibleTick Whether a tick needs to update visuals (true), or
 *                          is just for calculations only (false).
 */
engine.logicalTick = function(params) {
  engine.updateTimers();

  if (!engine.waitingForImages && !engine.tooltipShown) {
    engine.tickActions();
    engine.tickActors();
  }

  if (params.visibleTick) {
    engine.updateCanvas();
    if (engine.debug.showDebugPanel) {
      engine.updateDebugPanel();
    }
  }
};

/**
 * If the frame rate goes below X, for example, we drop the custom mouse
 * pointer and use a native one… but we don’t want to do it on and off
 * if the frame rate hovers around the threshold. Hence the rolling/average
 * frame rate that is updated here – we measure it every 100 ticks.
 */
engine.updateRollingFps = function() {
  this.rollingFpsTicks++;
  this.rollingFpsSum += this.curFps;
  if (this.rollingFpsTicks == engine.ROLLING_FPS_TICK_COUNT) {
    this.rollingFps = this.rollingFpsSum / this.rollingFpsTicks;
    this.rollingFpsTicks = 0;
    this.rollingFpsSum = 0;

    // Custom mouse pointer doesn’t exist in the attract mode.
    if (!this.attractMode) {
      if (this.rollingFps &&
          (this.rollingFps < this.MIN_CUSTOM_MOUSE_POINTER_FPS)) {
        this.setCustomMousePointer({ customMousePointer: false });
      } else {
        this.setCustomMousePointer({ customMousePointer: true });
      }
    }
  }
};

/**
 * Update all the timers and timer-related things (e.g. frame-rate counter)
 * the game engine uses.
 */
engine.updateTimers = function() {
  this.curGameTime += this.timeDelta;
  this.gameTimeDelta = this.curGameTime - this.lastGameTime;
  this.lastGameTime = this.curGameTime;

  this.curFps = 1000 / this.gameTimeDelta;

  this.updateRollingFps();

  if (!this.interactive) {
    // This makes sure we don’t fall asleep while in a cutscene.
    this.interaction();
  } else {
    if (!this.asleep && (this.curGameTime - this.lastInteractionTime >
        this.inactiveSleepTime)) {
      this.asleep = true;
    }
  }
};

/**
 * Each actor can register their own tick handler. We call them all here.
 */
engine.tickActors = function() {
  for (var i in engine.actors) {
    var actor = engine.actors[i];
    if (actor.tick && (actor.rect.visible || actor.ticksWhenInvisible)) {
      actor.tick();
    }
  }
};

/**
 * Go through actions/transitions and fire necessary ticks.
 */
engine.tickActions = function() {
  for (var i in engine.actions) {
    var action = engine.actions[i];

    if (action.startTime <= engine.curGameTime) {
      if (!action.endTime) {
        // One-time action.
        action.onAction();

        engine.removeAction({ action: action });
      } else if (action.endTime <= engine.curGameTime) {
        if (action.type == engine.ACTION_TYPE_TRANSITION) {
          action.tick({ lastTick: true });
        }
      } else {
        action.onAction();
      }
    }
  }
};

/**
 * Take a note to recalculate rect ordering the next time before they are
 * drawn. This function is called whenever new rect is added or hidden, and
 * whenever the plane (z-index) of any is changed.
 */
engine.invalidateRectOrder = function() {
  if (!this.features.canvas) {
    return;
  }

  this.rectOrderInvalidated = true;
};

/**
 * Recalculate rect ordering, which means figuring out in which order
 * they’re drawn based on their planes (z-indexes).
 */
engine.updateRectOrder = function() {
  if (!this.features.canvas) {
    return;
  }

  this.rects = [];

  for (var i in engine.actors) {
    if (engine.actors[i].rect.visible) {
      if (engine.actors[i].rect.render & engine.RENDER_CANVAS) {
        this.rects.push(engine.actors[i].rect);
      }

      for (var j in engine.actors[i].innerRects) {
        if (engine.actors[i].innerRects[j].render &
            engine.RENDER_CANVAS) {
          this.rects.push(engine.actors[i].innerRects[j]);
        }
      }
    }
  }

  this.rects.sort(function(a, b) { return a.getZOrder() - b.getZOrder() });

  this.rectOrderInvalidated = false;
};

/**
 * Draw all the rects on <canvas>.
 */
engine.updateCanvas = function() {
  if (!this.features.canvas) {
    return;
  }

  // Clear the canvas.
  this.canvasCtx.clearRect(0, 0,
      this.INITIAL_WIDTH + this.TOOLBAR_WIDTH, this.EXPANDED_HEIGHT);

  // Recalculate rect ordering if necessary.
  if (this.rectOrderInvalidated) {
    this.updateRectOrder();
  }

  // Draw all the rects.
  for (var i in this.rects) {
    this.rects[i].renderOnCanvas({ canvasCtx: engine.canvasCtx });
  }
};

/**
 * Add a new action to the list of actions.
 * @param {Object} params
 * - {number} .startTime Start time in ms (relative to current time).
 * - {number} .endTime End time in ms (relative to current time).
 * - {func} .onAction Function to be called at every tick when the
 *                    action is active.
 */
engine.addAction = function(params) {
  var action = new EngineAction({
      startTime: engine.curGameTime + params.startTime,
      endTime: engine.curGameTime + params.endTime,
      onAction: params.onAction });

  engine.actions.push(action);

  return action;
};

/**
 * A shorthand function that allows to add many actions in a simplified
 * form: we are passing an object where times are identifiers, and onAction
 * functions are values, e.g.
 *   engine.addActions({
 *     0: function() { CONTENTS },
 *     50: function() { CONTENTS }
 *   });
 */
engine.addActions = function(actions) {
  for (var i in actions) {
    engine.addAction({ startTime: parseInt(i, 10), onAction: actions[i] });
  }
};

/**
 * Add a new transition to the list of active transitions.
 * @param {Object} params Parameters as per EngineTransition constructor.
 */
engine.addTransition = function(params) {
  var transition = new EngineTransition(params);

  engine.actions.push(transition);
};

/**
 * Removes a given action from the list of active actions.
 * @param {Object} params
 * - {object} .action Action object.
 */
engine.removeAction = function(params) {
  for (var i in engine.actions) {
    if (engine.actions[i] == params.action) {
      engine.actions.splice(i, 1);
      break;
    }
  }
};

/**
 * Stops/removes a given transition.
 * @param {Object} params
 * - {string} .id Transition id.
 */
engine.removeTransition = function(params) {
  for (var i in engine.actions) {
    var action = engine.actions[i];

    if (action.type == engine.ACTION_TYPE_TRANSITION &&
        action.id == params.id) {
      engine.removeAction({ action: action });
      break;
    }
  }
};

/**
 * Stops/removes a given image animation or all animations on a given actor.
 * @param {Object} params
 * - {string} .id Actor id.
 * - {string} .innerId Inner element id (optional).
 * - {boolean} .allInnerRects True if we want to remove all
 *                            transitions on a given actor.
 */
engine.removeAnimation = function(params) {
  for (var i = engine.actions.length - 1; i >= 0; i--) {
    var action = engine.actions[i];
    if (action.type == engine.ACTION_TYPE_TRANSITION &&
        action.actorId == params.id &&
        action.properties.animation &&
      (((action.innerId == engine.MAIN_RECT_ID) && (!params.innerId)) ||
        (action.innerId == params.innerId) || (params.allInnerRects))) {
      engine.removeAction({ action: action });

      if (!params.allInnerRects) {
        break;
      }
    }
  }

  return;
};

/**
 * Put together an id of an image with rotation. The given angle is normalized
 * so it fits between -180 and 180 degrees.
 * @param {Object} params
 * - {string} .id Image id without rotation.
 * - {number} .rotate Rotation in degrees.
 * @return {string} Image id with rotaton.
 */
engine.getImageRotateId = function(params) {
  var id = params.id;

  if (params.rotate) {
    var rotate = engine.modulo({ val: params.rotate, mod: 360 });
    if (rotate <= -180) {
      rotate += 360;
    } else if (rotate > 180) {
      rotate -= 360;
    }
    if (rotate) {
      id += '-rotate' + rotate;
    }
  }

  return id;
};

/**
 * Whether an image with a given id is available. This is used for rotation
 * to see if we have the image rotated a given way.
 * @param {Object} params
 * - {string} .id Image id with rotation.
 * @return {boolean} Whether we have that image.
 */
engine.isImageAvailable = function(params) {
  return !!this.imageSpriteIds[params.id];
};

/**
 * Handle image loaded. If all images are loaded, call the previously
 * designated function.
 */
engine.onImageLoad = function() {
  this.imagesToBeLoaded--;

  if (this.imagesToBeLoaded == 0) {
    if (engine.imagesLoadedFunc) {
      engine.imagesLoadedFunc();
    }

    // If we were holding the game waiting for images to be loaded, resume
    // the game now.
    if (this.waitingForImages) {
      engine.imagesFinallyLoaded();
    }
  }
};

/**
 * Checks whether all the images have finished loading. At this point, if
 * not, we need to pause the game with a loading message and wait for the
 * images to load – we cannot proceed with missing graphics.
 */
engine.ensureAllImagesLoaded = function() {
  if (this.imagesToBeLoaded) {
    this.waitingForImages = true;
    $a('loading').show();
  }
};

/**
 * This is called after images finished loading when we paused the doodle
 * to wait for them to load.
 */
engine.imagesFinallyLoaded = function() {
  this.waitingForImages = false;
  this.lastPhysicalTime = new Date().getTime();
  $a('loading').hide();
};

/**
  * Returns the image URL for a given image (either the sprite image, or
  * individual image for debugging).
  * @param {Object} params
  * - {string} .id Image or sprite id.
  * @return {string} Image file url.
  */
engine.getImageFileUrl = function(params) {
  if (!engine.useSprites) {
    return engine.RAW_IMAGE_PATH + params.id + '.png';
  } else {
    return engine.SPRITE_PATH + params.id + '.' +
           engine.IMAGE_VERSION + '.png';
  }
};

/**
 * Get image sprite id or image id depending on whether we use sprites or
 * not.
 * @param {Object} params
 * - {string} .id Image id.
 * @return {string} Image or sprite id.
 */
engine.getImageSpriteId = function(params) {
  if (!engine.useSprites) {
    return params.id;
  } else {
    return engine.imageSpriteIds[params.id];
  }
};

/**
 * Preload a single image.
 * @param {Object} params
 * - {string} .id The image's ID.
 */
engine.preloadImage = function(params) {
  var img = new Image();
  engine.loadedImageFiles[params.id] = img;
  img.src = engine.getImageFileUrl({ id: params.id });
  if (img.complete) {
    engine.onImageLoad();
  } else {
    img.onload = engine.bind(engine.onImageLoad, engine);
  }
};

/**
 * Start preloading an image set.
 * @param {Object} params
 * - {string} .id Image set id.
 * - {func} .onLoad Function to call once loaded.
 */
engine.preloadImageSet = function(params) {
  var imageSet = engine.IMAGE_SETS[params.id];

  engine.imagesLoadedFunc = params.onLoad;

  if (!engine.useSprites) {
    this.imagesToBeLoaded += imageSet.length;

    for (var i in imageSet) {
      engine.preloadImage({ id: imageSet[i] });
    }
  } else {
    this.imagesToBeLoaded++;
    engine.preloadImage({ id: params.id });
  }
};

/**
 * Check whether a given image is preloaded. If not, show a console warning.
 * @param {Object} params
 * - {string} .id Id of an image.
 */
engine.debugCheckIfImageLoaded = function(params) {
  if (!this.loadedImageFiles[params.id]) {
    if (this.debugEnabled) {
      window.console.log('ERROR: image not loaded! ' + params.id);
    }

    return false;
  } else {
    return true;
  }
};

/**
 * A simple dispatcher for a given in-game action to actors. If a given actor
 * has a method called onXXX, it will be called.
 *
 * Currently used actions:
 * – onSceneEnter when the new scene begins
 *
 * @param {Object} params
 * - {string} .name Name of the action.
 */
engine.dispatchGameAction = function(params) {
  for (var id in this.actors) {
    if (this.actors[id]['on' + params.name]) {
      this.actors[id]['on' + params.name]();
    }
  }
};

/**
 * Go to the search results page. This will vary depending whether we’re
 * on Google homepage or standalone page.
 */
engine.goToSearchResults = function() {
  if (engine.standalone) {
    var url = 'http://www.google.com/search?q=Stanis%C5%82aw+Lem';
  } else {
    var url = google.doodle.logoUrl;
  }

  // This is true for non-standalone version
  if ((typeof google != 'undefined') && google.nav && google.nav.go) {
    google.nav.go(url);
  } else {
    window.location.href = url;
  }
};

/**
 * Reads the position of the doodle vis-a-vis the entire page.
 */
engine.readBodyPos = function() {
  engine.bodyPos = engine.getElPagePos({ el: engine.bodyEl });
};

/**
 * Create a debug element to show things as the doodle is running.
 */
engine.initDebugPanel = function() {
  engine.debugEl = document.createElement('div');
  engine.debugEl.style.position = 'absolute';
  engine.debugEl.style.font = '13px Arial';
  engine.debugEl.style.left = '5px';
  engine.debugEl.style.top = '5px';
  engine.debugEl.style.opacity = .75;
  engine.debugEl.style.padding = '5px 10px';
  engine.debugEl.style.zIndex = 9999999;
  engine.debugEl.style.backgroundColor = 'rgb(240, 240, 240)';

  document.body.appendChild(engine.debugEl);
};

/**
 * Update the debug display element with new info.
 */
engine.updateDebugPanel = function() {
  var html = '';

  html += 'curFps: <b>' + engine.curFps.toFixed(2);
  html += '</b> · rollingFps: <b>' + engine.rollingFps.toFixed(2);
  html += '</b> · tick multip: <b>' + engine.tickMultiplier;
  html += '</b> · logical tick count: <b>' + engine.logicalTickCount;
  html += '</b> · asleep: <b>' + engine.asleep;
  html += '</b> · last interaction delta: <b>' +
          (engine.lastInteractionTime - engine.curGameTime);
  html += '</b> · canvas: <b>' + engine.features.canvas;
  html += '</b> · touch device: <b>' + engine.features.touch;
  html += '</b> · hiding mouse pointer: <b>' +
          engine.features.hidingMousePointer;

  engine.debugEl.innerHTML = html;
};
