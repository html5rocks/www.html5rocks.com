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
 * @fileoverview Lem doodle: Actors.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

var engine = {};

/**
 * Allows debug features to be enabled by adding &doodle-debug to the URL.
 * (Doesn’t do anything on its own). Toggle this to disable debugging
 * altogether.
 */
engine.debugAllowed = true;

/**
 * Whether the doodle is integrated with the homepage, or to live on a
 * standalone page.
 */
engine.standalone = true;

/**
 * The id of the element that’s the main canvas for the doodle.
 * @const
 */
engine.BODY_GENERAL_EL_ID = 'doodle';

/**
 * How faster the doodle runs when fast-forwarded
 * @const
 */
engine.FAST_FORWARD_TICK_COUNT = 5;

/**
 * When activating fast forward, we don’t want the doodle to immediately
 * get faster, but ramp up to be faster. This constant decides how fast
 * the speed will ramp up from 1 to FAST_FORWARD_TICK_COUNT above…
 * @const
 */
engine.FAST_FORWARD_TICK_COUNT_INC = .05;

/**
 * …and then back when going back to regular speed.
 * @const
 */
engine.FAST_FORWARD_TICK_COUNT_DEC = .5;

/**
 * How much faster the doodle becomes when speeded up by holding Shift (only
 * for debugging/development).
 * @const
 */
engine.DEBUG_FAST_TICK_COUNT = 40;

/**
 * The id for the default main rect.
 * @const
 */
engine.MAIN_RECT_ID = 'main';

/**
 * Minimum frames per second. Below that, the game will not drop frames, but
 * simply slow down.
 * @const
 */
engine.MIN_FPS = 10;

/**
 * Maximum frames per second. Above that, start dropping frames on purpose
 * (e.g. Firefox right now doesn’t cap the framerate at 60fps).
 * Note: this should be 60, but doing more for rounding errors
 * @const
 */
engine.MAX_FPS = 65;

/**
 * A frame rate below which we don’t show the custom mouse pointer, but revert
 * to a native mouse pointer for a better experience.
 * @const
 */
engine.MIN_CUSTOM_MOUSE_POINTER_FPS = 20;

/**
 * Fallback fps for when we use setTimeout instead of requestAnimFrame.
 * 16.67 = 1000 (ms) / 60 (frames per second)
 * @const
 */
engine.REQUEST_ANIM_FRAME_FALLBACK_DELAY = 16.67;

/**
 * Time of inactivity before we put the doodle to sleep to conserve CPU
 * when in attract mode (before the user clicks on it for the first time),
 * in ms.
 * @const
 */
engine.INACTIVE_SLEEP_TIME_ATTRACT_MODE = 18000;

/**
 * Time of inactivity before we put the doodle to sleep when the tab is
 * not focused, in ms.
 * @const
 */
engine.INACTIVE_SLEEP_TIME_UNFOCUSED = 30000;

/**
 * Time of inactivity before we put the doodle to sleep when the tab is
 * focused, in ms.
 * @const
 */
engine.INACTIVE_SLEEP_TIME_FOCUSED = 120000;

/**
 * When the doodle falls asleep or wakes up due to inactivity, we don’t
 * want to abruptly stop it… just slow it down. This is the ratio of the
 * slowdown.
 * @const
 */
engine.SLOW_DOWN_TICK_MULTIPLIER = 5;

/**
 * How many ticks are necessary to calculate a rolling frame rate.
 * @const
 */
engine.ROLLING_FPS_TICK_COUNT = 50;

/**
 * A URL to an empty mouse pointer file that’s necessary for some of the
 * browsers (IE, Firefox) to hide the mouse pointer.
 * @const
 */
engine.EMPTY_MOUSE_POINTER_URL =
    'http://www.google.com/mapfiles/ms/cleardot.cur';

/**
 * A default speed (in ms) for animating any button press animation.
 * @const
 */
engine.BUTTON_PRESS_ANIMATION_SPEED = 40;

/**
 * A default speed (in ms) for animating any button unpress animation.
 * @const
 */
engine.BUTTON_UNPRESS_ANIMATION_SPEED = 60;

/**
 * An extra padding for click targets on non-touch platforms.
 * @const
 */
engine.PADDING_CLICK = 5;

/**
 * An extra padding for touch targets on touch platforms.
 * @const
 */
engine.PADDING_TOUCH = 15;

/**
 * The mapping of language/locale codes and languages used by doodles.
 * @const
 */
engine.LANGUAGES = {
  'en': 'english',
  'pl': 'polish',
  'de': 'german',
  'fr': 'french',
  'it': 'italian',
  'ru': 'russian',
  'lv': 'russian', // Latvia
  'lt': 'russian', // Lithuania
  'et': 'russian', // Estonia
  'be': 'russian', // Belarus
  'uk': 'ukrainian',
  'es': 'spanish',
  'cs': 'czech',
  'hu': 'hungarian',
  'bg': 'bulgarian'
};

/**
 * A list of mappings from domain names to languages. This is only necessary
 * for the standalone doodle.
 */
engine.DOMAIN_TO_LANGUAGE = {
  'www.google.com': 'en',
  'www.google.pl': 'pl',
  'www.google.at': 'de',
  'www.google.de': 'de',
  'www.google.ch': 'de',
  'www.google.ru': 'ru',
  'www.google.by': 'be',
  'www.google.com.ua': 'uk',
  'www.google.lv': 'lv',
  'www.google.lt': 'lt',
  'www.google.ee': 'et',
  'www.google.es': 'es',
  'www.google.it': 'it',
  'www.google.ft': 'fr',
  'www.google.co.uk': 'en',
  'www.google.ie': 'en',
  'www.google.cz': 'cs',
  'www.google.sk': 'sk',
  'www.google.hu': 'hu',
  'www.google.bg': 'bg'
};

/**
 * A list of some (usually secondary) languages that can be used for our
 * doodle. In this case, we need to switch to another language.
 */
engine.LANGUAGE_MAPPINGS = {
  'rm': 'de', // default to German for the optional language in Switzerland
  'sk': 'cs', // default to Czech for the language in Slovakia
  'ga': 'en', // default to English for the optional language in Ireland
  'ca': 'es', // default to Spain for the optional language in Spain
  'gl': 'es', // default to Spain for the optional language in Spain
  'eu': 'es' // default to Spain for the optional language in Spain
};

/**
 * Constant to be used instead of width to indicate that an element
 * should be as wide as the entire viewport.
 * @const
 */
engine.SCREEN_WIDTH = -1;

/**
 * Constant to be used instead of height to indicate that an element
 * should be as tall as the entire viewport.
 * @const
 */
engine.SCREEN_HEIGHT = -1;

/**
 * How to render an object. We support rendering via DOM and/or canvas.
 * An object can be rendered with both or none -- the arguments should be
 * powers of two.
 * @const
 */
engine.RENDER_NONE = 0;

/**
 * Render via DOM.
 * @const
 */
engine.RENDER_DOM = 1;

/**
 * Render via <canvas>.
 * @const
 */
engine.RENDER_CANVAS = 2;

/**
 * Regular event type (at time X or between time X and Y).
 * @const
 */
engine.EVENT_TYPE_EVENT = 1;

/**
 * Transition event type (special case of the event between time X and Y).
 * @const
 */
engine.EVENT_TYPE_TRANSITION = 2;

/**
 * No content within a rect (invisible/transparent).
 * @const
 */
engine.CONTENTS_CLEAR = 1;

/**
 * Rect is all white.
 * @const
 */
engine.CONTENTS_WHITE = 2;

/**
 * Rect is all black.
 * @const
 */
engine.CONTENTS_BLACK = 3;

/**
 * Rect is an image (or animation, since animations consist of images).
 * @const
 */
engine.CONTENTS_IMAGE = 4;

/**
 * Alignment constant used when aligning images horizontally or vertically.
 * The terminology here mirrors that of modern CSS: Start means left/top.
 * @const
 */
engine.ALIGN_START = 1;

/**
 * Alignment constant used when aligning images horizontally or vertically.
 * Center is pretty self-explanatory.
 * @const
 */
engine.ALIGN_CENTER = 2;

/**
 * Alignment constant used when aligning images horizontally or vertically.
 * End means right/bottom depending on the orientation.
 * @const
 */
engine.ALIGN_END = 3;

/**
 * Key constant for keyboard operations: Shift.
 * @const
 */
engine.KEY_SHIFT = 16;

/**
 * Key constant for keyboard operations: N.
 * @const
 */
engine.KEY_N = 78;

/**
 * Key constant for keyboard operations: P.
 * @const
 */
engine.KEY_P = 80;

/**
 * Key constant for keyboard operations: T.
 * @const
 */
engine.KEY_T = 84;

/**
 * Whether a given item is an array or not.
 * @param {*} item A JavaScript item.
 * @return {boolean} Whether it’s an array (true) or not (false).
 */
engine.isArray = function(item) {
  return item.constructor == Array;
};

/**
 * Whether a given item is an object or not.
 * @param {*} item A JavaScript item.
 * @return {boolean} Whether it’s an object (true) or not (false).
 */
engine.isObject = function(item) {
  var type = typeof item;

  return type == 'object' || type == 'array' || type == 'function';
};

/**
 * Whether a given item is defined or not.
 * @param {*} item A JavaScript item.
 * @return {boolean} Whether it’s defined (true) or not (false).
 */
engine.isDef = function(item) {
  return typeof item != 'undefined';
};

/**
 * Make a copy of an array.
 * @param {Array} array An array to be copied.
 * @return {Array} A shiny new, free copy. (Free as in beer).
 */
engine.duplicateArray = function(array) {
  var newArray = [];
  for (var i in array) {
    newArray.push(array[i]);
  }

  return newArray;
};

/**
 * Partially applies this function to a particular 'this object' and zero or
 * more arguments. The result is a new function with some arguments of the
 * first function pre-filled and the value of |this| 'pre-specified'.
 *
 * Remaining arguments specified at call-time are appended to the pre-
 * specified ones.
 *
 * @param {Function} fn A function to partially apply.
 * @param {Object|undefined} selfObj Specifies the object which |this| should
 *     point to when the function is run.
 * @param {...*} var_args Additional arguments that are partially
 *     applied to the function.
 * @return {!Function} A partially-applied form of the function bind() was
 *     invoked as a method of.
 * @suppress {deprecated} See above.
 */
engine.bind = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }

  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      // Prepend the bound arguments to the current arguments.
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };

  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};

/**
 * Generates a random value from 0 and 1 and reports whether it’s below
 * a given threshold of probability. In other worlds, running this
 * function with a probability of .5 simulates a coin toss.
 * @param {Object} params
 * - {number} .probability A value from 0 to 1.
 * @return {boolean} Whether the random number generated was below the value.
 */
engine.probability = function(params) {
  return Math.random() < params.probability;
};

/**
 * Picks a random value between a given minimum and maximum.
 * @param {Object} params
 * - {number} .min A minimum.
 * - {number} .max A maximum.
 * @return {number} The random value.
 */
engine.rangeRand = function(params) {
  return Math.random() * (params.max - params.min) + params.min;
};

/**
 * Picks a random integer number between a given minimum and maximum.
 * @param {Object} params
 * - {number} .min A minimum.
 * - {number} .max A maximum.
 * @return {number} The random integer value.
 */
engine.intRangeRand = function(params) {
  return Math.floor(Math.random() *
                    (params.max - params.min + 1) + params.min);
};

/**
 * Picks a random item from a given set (array) of items.
 * @param {Object} params
 * - {Array} .set An array of items to choose.
 * @return {*} One item from that set.
 */
engine.setRand = function(params) {
  return params.set[Math.floor(Math.random() * params.set.length)];
};

/**
 * A modulo function, necessary because there are differences in how
 * browsers support negative modulus. This is otherwise equivalent
 * to the native (val $PERC$ mod).
 * @param {Object} params
 * - {number} .val Value.
 * - {number} .mod Modulus.
 * @return {number} val modulo mod.
 */
engine.modulo = function(params) {
  return params.val - Math.floor(params.val / params.mod) * params.mod;
};

/**
 * Linear easing mapping function.
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Linear easing of that position.
 */
engine.linear = function(t) {
  return t;
};

/**
 * Easing out mapping function.
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Easing out of that position.
 */
engine.easeOut = function(t) {
  return 1 - Math.pow(1 - t, 3);
};

/**
 * Easing in mapping function.
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Easing in of that position.
 */
engine.easeIn = function(t) {
  return t * t * t;
};

/**
 * Easing in/out mapping function.
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Easing in/out of that position.
 */
engine.easeInOut = function(t) {
  return 3 * t * t - 2 * t * t * t;
};

/**
 * A helper mapping function used by back mapping functions.
 * @param {number} x Coefficient.
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Easing of that position.
 */
engine.backHelper = function(x, t) {
  return Math.pow(t, 2) * ((x + 1) * t - x);
};

/**
 * Back easing in/out mapping function (back = a little overshoot at the end).
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Back easing in/out of that position.
 */
engine.backEaseInOut = function(t) {
  if (t <= .5) {
    return engine.backHelper(1.618, 2 * t) / 2;
  } else {
    return (2 - engine.backHelper(1.618, 2 * (1 - t))) / 2;
  }
};

/**
 * Strong back easing in/out mapping function (even more overshoot).
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Strong back easing in/out of that position.
 */
engine.strongBackEaseOut = function(t) {
  if (t <= .5) {
    return engine.easeOut(t) / 2;
  } else {
    return (2 - engine.backHelper(10, 2 * (1 - t))) / 2;
  }
};

/**
 * Fall mapping function (rudely implements bounce as something falls to
 * the ground).
 * @param {number} t Position in sequence (0 to 1).
 * @return {number} t Fall mapping of that position.
 */
engine.fall = function(t) {
  if (t < .82) {
    return engine.easeIn(t / .82);
  } else if (t < .88) {
    return 1 - engine.easeInOut((t - .82) / .06) * .05;
  } else if (t < .93) {
    return .95 + engine.easeInOut((t - .88) / .05) * .05;
  } else if (t < .97) {
    return 1 - engine.easeInOut((t - .93) / .04) * .02;
  } else {
    return .98 + engine.easeInOut((t - .97) / .03) * .02;
  }
};

/**
 * Get a position of an element vis-a-vis the viewport.
 * @param {Object} params
 * - {el} .el DOM Element.
 * @return {!Object} Object with coordinates as .left and .top.
 */
engine.getElPagePos = function(params) {
  var el = params.el;
  var pos = { left: 0, top: 0 };

  while (el) {
    pos.left += el.offsetLeft;
    pos.top += el.offsetTop;

    el = el.offsetParent;
  }

  return pos;
};

/**
 * Add an event listener.
 * @param {Object} params
 * - {element} .el Element to add an event listener to.
 * - {string} .type Type of an event (e.g. "click").
 * - {function()} .handler Event handler.
 */
engine.addEventListener = function(params) {
  engine.listeners.push(params);
  if (window.addEventListener) {
    params.el.addEventListener(params.type, params.handler, false);
  } else {
    params.el.attachEvent('on' + params.type, params.handler);
  }
};

/**
 * Remove an event listener.
 * @param {Object} params
 * - {element} .el Element to remove an event listener from.
 * - {string} .type Type of an event (e.g. "click").
 * - {function()} .handler Event handler.
 */
engine.removeEventListener = function(params) {
  if (window.removeEventListener) {
    params.el.removeEventListener(params.type, params.handler, false);
  } else {
    params.el.detachEvent('on' + params.type, params.handler);
  }
};

/**
 * Removes all listeners added since the last time removeAllEventListeners was
 * called.
 */
engine.removeAllEventListeners = function() {
  var params;
  while (params = engine.listeners.pop()) {
    engine.removeEventListener.call(null, params);
  }
};

/**
 * Get an event in a cross-browser way (as passed in modern browsers, from
 * window.event on IE), and save the element target as event.targetEl.
 * @param {Object} params
 * - {Event} .event Event if passed from a handler.
 * @return {Event} An event.
 */
engine.getDomEvent = function(params) {
  var event = window.event || params.event;
  event.targetEl = event.target ? event.target : event.srcElement;

  return event;
};

/**
 * Prevent the default handler for an event, in a cross-browser way.
 * @param {Object} params
 * - {Event} .event Event if passed from a handler.
 */
engine.preventDefaultEvent = function(params) {
  if (params.event.preventDefault) {
    params.event.preventDefault();
  } else {
    params.event.returnValue = false;
  }
};

/**
 * Stop the propagation of an event, in a cross-browser way.
 * @param {Object} params
 * - {Event} .event Event if passed from a handler.
 */
engine.stopPropagationEvent = function(params) {
  if (params.event.stopPropagation) {
    params.event.stopPropagation();
  } else {
    params.event.cancelBubble = true;
  }
};

/**
 * Find elements by tag or class name.
 * @param {Object} params
 * - {element} .el Root element (optional, defaults to document.body).
 * - {string} .className Class name.
 * - {string} .tagName Tag name.
 * @return {Array} Element array.
 */
engine.getDomElements = function(params) {
  if (params.el) {
    var el = params.el;
  } else {
    var el = document.body;
  }

  if (document.querySelectorAll) {
    var query = '';
    if (params.tagName) {
      query += params.tagName;
    }
    if (params.className) {
      query += '.' + params.className;
    }

    return el.querySelectorAll(query);
  } else if (document.getElementsByClassName) {
    if (params.tagName && params.className) {
      var els = el.getElementsByClassName(params.className);

      var newEls = [];
      for (var i = 0, el; el = els[i]; i++) {
        if (el.tagName.toLowerCase() == params.tagName) {
          newEls.push(el);
        }
      }

      return newEls;
    } else if (params.tagName) {
      return el.getElementsByTagName(params.tagName);
    } else if (params.className) {
      return el.getElementsByClassName(params.className);
    }
  } else {
    if (params.className) {
      if (params.tagName) {
        var els = el.getElementsByTagName(params.tagName);
      } else {
        var els = el.getElementsByTagName('*');
      }

      var regExp = new RegExp('(^|\ )' + params.className + '(\ |$)');

      var newEls = [];
      for (var i = 0, el; el = els[i]; i++) {
        if (el.className.match(regExp)) {
          newEls.push(el);
        }
      }

      return newEls;
    } else if (params.tagName) {
      return el.getElementsByTagName(params.tagName);
    }
  }
};

/**
 * Set a CSS for a given element to result in an empty/no mouse pointer.
 * Doing it cross-browser is a bit tricky.
 * @param {Object} params
 * - {element} .el Element to change the mouse pointer style on.
 */
engine.setEmptyCssCursor = function(params) {
  params.el.style.cursor = 'url(' + engine.EMPTY_MOUSE_POINTER_URL + '), auto';
  if (!engine.features.ie8OrLower) {
    params.el.style.cursor = 'none';
  }
};

/**
 * Wrapper/polyfill around request animation frame that uses the native
 * support, or falls back to setTimeout if a native function is not
 * available.
 * @param {function()} callback Callback function.
 */
engine.requestAnimFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, engine.REQUEST_ANIM_FRAME_FALLBACK_DELAY);
    };

/**
 * Creates an event. Event is something that happens one time, or every tick
 * during a specific time span. We need our separate event system instead
 * of relying on setTimeouts, because at any given point our doodle time
 * can get divorced from physical time as it gets faster (fast forward),
 * slower (low frame rate or falling asleep to save CPU), stops altogether
 * (waiting for images to finish loading), or just lags behind physical time.
 * @param {Object} params Constructor parameters (explained below).
 * @constructor
 */
function EngineEvent(params) {
  this.type = engine.EVENT_TYPE_EVENT;

  /**
   * Start time (in absolute ms).
   */
  this.startTime = params.startTime;

  /**
   * End time (in absolute ms).
   */
  this.endTime = params.endTime;

  /**
   * A function to be called while the event is active and within
   * startTime/endTime.
   */
  this.onEvent = params.onEvent;
}

/**
 * Creates a transition. A transition is a specialized type of event running
 * in a specific time span that interpolates one property from one value to
 * another.
 * @param {Object} params Constructor parameters (explained below).
 * @constructor
 */
function EngineTransition(params) {
  this.type = engine.EVENT_TYPE_TRANSITION;

  /**
   * Whether necessary first-run preparations have been made.
   */
  this.prepared = false;

  /**
   * Transitions can have their separate ids so that they can be removed
   * by ids.
   */
  this.id = params.id;

  /**
   * An id of the actor.
   */
  this.actorId = params.actorId;

  /**
   * Reference to the actor.
   */
  if (this.actorId) {
    this.actor = $a(this.actorId);
  }

  /**
   * (Optionally) an id of an inner element that the transition
   * affects.
   */
  this.innerId = params.innerId;

  /**
   * Transition start time (relative!). If not specified, starts right now.
   */
  this.startTime = engine.curGameTime + (params.startTime || 0);

  /**
   * Transition end time (relative!). Either specified as .duration or
   * .endTime relative to the current time.
   */
  if (!params.endTime) {
    this.endTime = this.startTime + params.duration;
  } else {
    this.endTime = engine.curGameTime + params.endTime;
  }

  /**
   * Transition properties.
   */
  this.properties = params.properties;

  this.onEvent = engine.bind(this.tick, this);

  /**
   * Optional handler when we’re done.
   */
  this.onFinish = params.onFinish;

  /**
   * Image alignment.
   */
  this.align = params.align;

  /**
   * How many times have a transition played already.
   */
  this.playCount = 0;

  /**
   * How many times a transition can play (defaults to 1 if not specified).
   */
  this.maxPlayCount = params.count || 1;

  /**
   * Easing function for the transition (defaults to ease in/out if not
   * specified).
   */
  this.easing = params.easing || engine.easeInOut;

  /**
   * Whether the transition alternates back and forth. Note: play count
   * has to equal at least 2 to go both ways.
   */
  this.alternate = params.alternate;

  /**
   * Whether to clear the contents after playing the transition (defaults
   * to no).
   */
  this.clearOnFinish = !!params.clearOnFinish;
};

/**
 * Prepare a transition: Make sure we know how long we’re running, what are
 * the start/end values, etc.
 */
EngineTransition.prototype.prepare = function() {
  this.startValues = {};
  this.endValues = {};
  this.altValues = {};
  this.valueRange = {};

  this.prepared = true;

  if (this.actorId) {
    // When we’re animating, we have to use the inner 'main' rect since it
    // can move against the outer rect.
    if (this.properties.animation) {
      var includeMain = true;
    } else {
      var includeMain = false;
    }
    this.rect = this.actor.getRect({
        innerId: this.innerId, includeMain: includeMain });

    this.transformObject = this.innerId ? this.rect : this.actor;
  }

  for (var id in this.properties) {
    switch (id) {
      // Transitioning the horizontal position of a rect, absolutely.
      case 'x':
        this.startValues.x = this.rect.x;
        this.valueRange.x = this.properties.x - this.startValues.x;
        break;

      // Transitioning the horizontal position of a rect, relatively.
      case 'relX':
        this.startValues.relX = this.rect.x;
        this.endValues.relX = this.rect.x + this.properties.relX;
        this.valueRange.relX = this.properties.relX;
        break;

      // Transitioning the vertical position of a rect, absolutely.
      case 'y':
        this.startValues.y = this.rect.y;
        this.endValues.y = this.properties.y;
        this.valueRange.y = this.properties.y - this.startValues.y;
        break;

      // Transitioning the vertical position of a rect, relatively.
      case 'relY':
        this.startValues.relY = this.rect.y;
        this.endValues.relY = this.rect.y + this.properties.relY;
        this.valueRange.relY = this.properties.relY;
        break;

      // Rotating the rect, absolutely.
      case 'rotate':
        this.startValues.rotate = this.rect.rotate;

        if (engine.isObject(this.properties.rotate)) {
          this.endValues.rotate = this.properties.rotate.val;

          if (engine.isDef(this.properties.rotate.alt)) {
            this.altValues.rotate = this.properties.rotate.alt;
          }

        } else {
          this.endValues.rotate = this.properties.rotate;
        }

        this.valueRange.rotate =
            this.endValues.rotate - this.startValues.rotate;
        break;

      // Rotating the rect, relatively.
      case 'relRotate':
        this.startValues.relRotate = this.rect.rotate;
        this.valueRange.relRotate = this.properties.relRotate;
        break;

      // Scrolling horizontally the inside contents the rect.
      case 'scrollX':
        this.startValues.scrollX = this.rect.scrollX;
        this.valueRange.scrollX =
            this.properties.scrollX - this.startValues.scrollX;
        break;

      // Height transition. Currently only used to change the height of
      // the entire doodle body as it expands.
      case 'height':
        if (!this.actorId) {
          this.startValues.height = engine.INITIAL_HEIGHT;
          this.valueRange.height =
              this.properties.height - this.startValues.height;

          if (!engine.standalone) {
            this.startMasterHeight =
                document.getElementById('lga').offsetHeight;
            if (document.getElementById('searchform')) {
              this.startBoxHeight =
                  document.getElementById('searchform').offsetTop;
            }
          }
        }
        break;

      // Using transition to play out an animation, which means transitioning
      // between integer values from 0 to X - 1, where X is the number of
      // frames.
      case 'animation':
        this.startValues.animation = 0;
        this.endValues.animation =
            this.properties.animation.imageIds.length;
        this.valueRange.animation =
            this.endValues.animation - this.startValues.animation;

        if (this.properties.animation.repeatFrom) {
          this.altValues.animation = this.properties.animation.repeatFrom;
        }
        break;

      // Make the object shiver/bounce around in place.
      case 'shiver':
        this.startValues.shiverX = this.rect.x;
        this.startValues.shiverY = this.rect.y;
        break;
    }
  }
};

/**
 * Transition tick.
 * @param {Object} params
 * - {boolean} .lastTick Whether this is a last tick.
 */
EngineTransition.prototype.tick = function(params) {
  if (!this.prepared) {
    this.prepare();
  }

  if (params && params.lastTick) {
    var pos = 1;
  } else {
    var transitionTime = engine.curGameTime - this.startTime;
    var pos = this.easing(transitionTime / (this.endTime - this.startTime));
  }

  for (var id in this.properties) {
    var val = this.startValues[id] + pos * this.valueRange[id];

    switch (id) {
      case 'shiver':
        if (params && params.lastTick) {
          var shiver = this.properties.shiver;

          this.transformObject.transform({
            x: this.startValues.shiverX +
               engine.rangeRand({ min: -shiver, max: shiver }),
            y: this.startValues.shiverY +
               engine.rangeRand({ min: -shiver, max: shiver })
          });
        }
        break;

      case 'animation':
        val = Math.floor(val);

        // We are running the animation from 0 to X just to ensure equal
        // timing for all the frames, but we can’t show X, but X - 1.
        if (val == this.properties.animation.imageIds.length) {
          val--;
        }

        this.rect.showImage({
          imageId: this.properties.animation.imageIds[val],
          align: this.align });

        break;

      case 'x':
      case 'relX':
        var oldX = this.rect.x;
        this.transformObject.transform({ x: val });

        // If a bird is attached to an object that’s moving, it will move
        // with that object.
        // TODO(mwichary): Generalize so that this is plugged in from
        // the Lem side, not here.
        if (((this.actor.id == $a('bird').targetId) && $a('bird').landed) ||
            ((this.actor.id == $a('bird').targetIdPrev) &&
             $a('bird').takeOffDelay)) {
          $a('bird').transform({ x: $a('bird').rect.x - oldX + this.rect.x });
        }
        break;

      case 'y':
      case 'relY':
        this.transformObject.transform({ y: val });
        break;

      case 'scrollX':
        this.transformObject.transform({ scrollX: val });
        break;

      case 'rotate':
      case 'relRotate':
        this.transformObject.transform({ rotate: val });
        break;

      case 'height':
        if (!this.actorId) {
          var marginTop =
              (1 - pos) *
              (engine.startDoodleBodyTop - engine.endDoodleBodyTop) +
              engine.endDoodleBodyTop;
          var oldMarginTop = engine.bodyEl.oldMarginTop;

          var oldBodyOffsetY = engine.bodyOffsetY;
          engine.bodyOffsetY = engine.EXPANDED_HEIGHT - val;

          if (oldMarginTop) {
            var delta = marginTop - oldMarginTop;
            var delta2 = oldBodyOffsetY - engine.bodyOffsetY;

            $a('mouse-pointer').transform({
                y: $a('mouse-pointer').rect.y - delta - delta2 });
          }
          
          document.getElementById('doodle').style.height = val + 'px';

          engine.bodyEl.style.top = marginTop + 'px';
          engine.bodyEl.style.height = val + 'px';
          engine.bodyEl.oldMarginTop = marginTop;

          // If during expansion the bottom edge falls below the visible
          // area in the viewport, we scroll the page down so that the
          // bottom edge of the doodle aligns with the bottom edge of the
          // viewport.

          var viewHeight = document.documentElement.clientHeight;
          if (!viewHeight) {
            viewHeight = document.body.clientHeight;
            if (!viewHeight) {
              viewHeight = window.innerHeight;
            }
          }

          var bodyScrollTop =
              (document.body.scrollTop || 0) +
              (document.documentElement.scrollTop || 0);
          var doodleBodyBottom = engine.bodyPos.top + val + 5;
          if (doodleBodyBottom > viewHeight + bodyScrollTop) {
            var scrollTop = Math.floor(doodleBodyBottom - viewHeight);
            document.body.scrollTop = scrollTop;
            document.documentElement.scrollTop = scrollTop;
          }

          // TODO(mwichary): I hate this being hardcoded here.
          // Perhaps a change height event – this would also fix the
          // other guy (tooltip).
          $a('toolbar-tooltip').transform({ y: engine.bodyOffsetY + 2 });

          var marginDiff = engine.startDoodleBodyTop - marginTop;
          var valDiff = val - this.startValues[id];

          if (!engine.standalone) {
            document.getElementById('lga').style.height =
                (this.startMasterHeight + valDiff - marginDiff) + 'px';

            if (document.getElementById('searchform')) {
              document.getElementById('searchform').style.top =
                  (this.startBoxHeight + valDiff - marginDiff) + 'px';
            }
          }

          // Our footer is positioned not using CSS, but manually on resize.
          // Therefore we need to fire an on resize event for it to catch
          // up.
          if (document.createEvent) {
            // Non-IE way.
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent('resize', true, true);
            window.dispatchEvent(evt);
          } else {
            // IE way.
            var evt = document.createEventObject();
            try {
              window.fireEvent('onresize', evt);
            } catch (e) {
            }
          }

          engine.readBodyPos();
          engine.updateAllActors();
        }
        break;
    }
  }

  if (params && params.lastTick) {
    this.lastTick();
  }
};

/**
 * Last transition tick. We call it to make sure we are always leaving at
 * the precise desired transition end value, and we also prepare for another
 * transition run.
 */
EngineTransition.prototype.lastTick = function() {
  this.playCount++;

  if (this.playCount < this.maxPlayCount) {
    if (this.alternate) {
      for (var id in this.properties) {
        if (engine.isDef(this.altValues[id])) {
          this.startValues[id] = this.altValues[id];
          this.altValues[id] = undefined;
        }

        var start = this.startValues[id];
        this.startValues[id] = this.endValues[id];
        this.endValues[id] = start;

        this.valueRange[id] = this.endValues[id] - this.startValues[id];
      }
    } else {
      for (var id in this.properties) {
        if (engine.isDef(this.altValues[id])) {
          this.startValues[id] = this.altValues[id];
          this.altValues[id] = undefined;

          this.valueRange[id] = this.endValues[id] - this.startValues[id];
        }
      }
    }

    var length = this.endTime - this.startTime;

    // Adjust for speed of animation – we might be skipping some initial
    // frames after the first run.
    if ((this.playCount == 1) && this.properties.animation) {
      length =
          (length / this.properties.animation.imageIds.length) *
          Math.abs(this.valueRange.animation);
    }

    this.startTime = engine.curGameTime;
    this.endTime = engine.curGameTime + length;
  } else {
    if (this.clearOnFinish) {
      this.rect.clear({ innerId: this.innerId });
    }

    if (this.onFinish) {
      this.onFinish();
    }

    engine.removeEvent({ event: this });
  }
};

/**
 * Creates a rect. Rect is a basic drawing primitive for our game engine.
 * @param {!Object} params Constructor parameters (explained below)
 * @constructor
 */
function EngineRect(params) {
  /**
   * Actor the element is attached to.
   */
  this.actor = params.actor;

  /**
   * Optional identifier of an inner element if the rectangle corresponds
   * to an inner element.
   */
  this.innerId = params.innerId;

  /**
   * If inner element, this is the ordinal number of the inner element.
   */
  this.innerCount = params.innerCount;

  /**
   * The parent rectangle if rect is an inner rect.
   */
  this.parentRect = this.innerId ? this.actor.rect : null;

  /**
   * Figuring whether to render via DOM or canvas. Note: We can have elements
   * rendered in DOM while the whole doodle is canvas, e.g. explosions
   * appearing outside the doodle, or the bird if it flies outside of
   * the doodle.
   */
  if (params.forceRenderDom || !engine.features.canvas) {
    this.render = engine.RENDER_DOM;
  } else {
    this.render = engine.RENDER_CANVAS;
  }

  /**
   * Placeholder for the DOM element corresponding to the rect
   * if it exists.
   */
  this.el = null;

  /**
   * The contents of the rect (starts with nothing, could be a colour or
   * an image).
   */
  this.contents = engine.CONTENTS_CLEAR;

  /**
   * Whether the contents are invalidated and need to be repainted.
   */
  this.contentsInvalidated = false;

  /**
   * The id of the image if the contents is an image.
   */
  this.imageId = null;

  /**
   * The plane (z-index) of a given object. The first is one of the
   * planes specified as engine.PLANE_ constants, the second is a +/-
   * correction against that plane, the third is both of these combined.
   */
  this.plane = 0;
  this.planeCorrection = 0;
  this.planeCombined = 0;
  this.planeCombinedPrev = 0;

  /**
   * Whether the rect is actually visible, and whether it was visible the
   * last time it was drawn.
   */
  this.visible = false;
  this.visiblePrev = false;

  /**
   * The current and previous opacity of the rect.
   */
  this.opacity = 1;
  this.opacityPrev = 1;

  /**
   * The position of the rect.
   */
  this.x = 0;
  this.y = 0;

  /**
   * The dimensions (in px) of the rect.
   */
  this.width = 0;
  this.height = 0;

  /**
   * The rotation (in degrees) of the rect.
   */
  this.rotate = 0;

  /**
   * Clamped rotate, e.g. rotate modulo a given resolution. We are
   * doing all the rotation by spriting, so we need this to limit
   * ourselves.
   */
  this.clampRotate = 0;

  /**
   * An offset of the image modulo the actual position of the rect, if the
   * graphic occupies less space. Example: moving eyes of the monster.
   */
  this.offsetX = 0;
  this.offsetY = 0;

  /**
   * Same as above, but for the sprite. All the sprites are trimmed to save
   * space in the sprite.
   */
  this.spriteOffsetX = 0;
  this.spriteOffsetY = 0;

  /**
   * Position of the graphic element within a big sprite.
   */
  this.spriteX = 0;
  this.spriteY = 0;

  /**
   * For rotation, what’s the pivot (think: -webkit-transform-origin) of
   * rotation, expressed in px vis-a-vis the exact center of the object.
   */
  this.pivotX = 0;
  this.pivotY = 0;

  /**
   * The calculated distance of the pivot from the center of the rect.
   */
  this.pivotOffsetX = 0;
  this.pivotOffsetY = 0;

  /**
   * The calculated angle and distance of the pivot against the center of
   * the rect.
   */
  this.pivotAngle = 0;
  this.pivotDistance = 0;

  /**
   * The same if our rect is connected to any rect. An example is if
   * our rect is a hand attached to a rotating arm.
   */
  this.connectedPivotOffsetX = 0;
  this.connectedPivotOffsetY = 0;
  this.connectedRotate = 0;


  /**
   * A list of elements connected to this rect.
   */
  this.connected = null;

  /**
   * Whether the rect is clickable and a placeholder for a DOM element
   * for click/hover effects.
   */
  this.clickable = false;
  this.clickableEl = null;

  /**
   * Whether the rect is scrollable (we provide limited support for
   * scrolling), and the current position.
   */
  this.scrollable = params.scrollable;
  this.scrollX = 0;

  /**
   * Whether our rect is horizontally repeating, and at what size. Examples
   * are the sky or the wave drawings on level 2.
   */
  if (params.horLoopSize) {
    this.horLoop = true;
    this.horLoopSize = params.horLoopSize;
  } else {
    this.horLoop = false;
  }

  /**
   * If true, the engine should never attempt to automatically hide an
   * object if off-screen.
   */
  this.neverAutoHide = !!params.neverAutoHide;

  /**
   * Whether the object is attached directly to the <body> of the document
   * rather than the doodle element. False for most objects, true for things
   * like explosions at the end, or bird if it flies outside the doodle.
   */
  this.attachedToDocumentBody = !!params.attachedToDocumentBody;

  /**
   * Whether the position of the object is calculated against the doodle
   * body, or the <body>.
   */
  this.positionRelativeToDoodleBody = !!params.positionRelativeToDoodleBody;

  /**
   * Whether we are forcing the width or height to effectively crop a rect.
   */
  this.forceWidth = false;
  this.forceHeight = false;

  /**
   * The values of forced width and height.
   */
  this.forcedWidth = null;
  this.forcedHeight = null;

  if (this.render & engine.RENDER_DOM) {
    this.createDomElement();
  }

  engine.invalidateRectOrder();
}

/**
 * Invalidate the rect, causing its contents to be redrawn during the next
 * possible opportunity.
 */
EngineRect.prototype.invalidate = function() {
  this.visiblePrev = null;
  this.opacityPrev = -1;
  this.contentsInvalidated = true;
};

/**
 * Set a new rendering method, e.g. via a DOM element, or via a canvas.
 * @param {Object} params
 * - {number} .render New rendering mode.
 */
EngineRect.prototype.setRender = function(params) {
  if (params.render != this.render) {
    if ((params.render & engine.RENDER_DOM) &&
        !(this.render & engine.RENDER_DOM)) {
      this.createDomElement();
      this.invalidate();
      this.update();
    }

    if (!(params.render & engine.RENDER_DOM) &&
        (this.render & engine.RENDER_DOM)) {
      this.removeDomElement();
    }

    // Invalidates z-index, forcing to redo it.
    this.planeCombinedPrev = 0;

    this.render = params.render;
  }
};

/**
 * Create a new DOM element for a rect if we’re using DOM as a rendering
 * method.
 */
EngineRect.prototype.createDomElement = function() {
  if (this.el) {
    this.removeDomElement();
  }

  this.el = document.createElement('div');
  this.el.style.position = 'absolute';
  this.el.style.overflow = 'hidden';

  if (!this.innerId) {
    this.hideInDom();
  }

  if (this.horLoopSize) {
    this.horLoopEl1 = document.createElement('div');
    this.horLoopEl1.style.position = 'absolute';
    this.horLoopEl1.style.overflow = 'hidden';
    this.horLoopEl1.style.left = 0;
    this.horLoopEl1.style.top = 0;
    this.horLoopEl1.style.width = this.horLoopSize + 'px';

    this.horLoopEl2 = document.createElement('div');
    this.horLoopEl2.style.position = 'absolute';
    this.horLoopEl2.style.overflow = 'hidden';
    this.horLoopEl2.style.left = this.horLoopSize + 'px';
    this.horLoopEl2.style.top = 0;
    this.horLoopEl2.style.width = this.horLoopSize + 'px';

    this.el.appendChild(this.horLoopEl1);
    this.el.appendChild(this.horLoopEl2);
  }

  if (this.scrollable) {
    this.scrollableEl = document.createElement('div');
    this.scrollableEl.style.position = 'absolute';
    this.scrollableEl.style.left = 0;
    this.scrollableEl.style.top = 0;

    this.el.appendChild(this.scrollableEl);
  }

  if (this.attachedToDocumentBody) {
    document.body.appendChild(this.el);
  } else if (this.innerId) {
    if (this.actor.rect.scrollableEl) {
      this.actor.rect.scrollableEl.appendChild(this.el);
    } else {

      // Main rect always takes precedence, even if created later.
      if (this.innerId == engine.MAIN_RECT_ID) {
        this.actor.rect.el.insertBefore(this.el,
                                        this.actor.rect.el.firstChild);
      } else {
        this.actor.rect.el.appendChild(this.el);
      }
    }
  } else {
    engine.bodyEl.appendChild(this.el);
  }

  this.render |= engine.RENDER_DOM;
};

/**
 * Remove a DOM element attached to a rect.
 */
EngineRect.prototype.removeDomElement = function() {
  if (this.el) {
    this.el.parentNode.removeChild(this.el);
    this.el = null;

    this.render &= ~engine.RENDER_DOM;
  }
};

/**
 * Whether a rect can be clickable or not.
 * @param {Object} params
 * - {boolean} .clickable Whether a rect is clickable or not.
 */
EngineRect.prototype.setClickable = function(params) {
  if (params.clickable == this.clickable) {
    return;
  }

  this.clickable = params.clickable;
  this.clickablePadding = !params.noPadding;

  if (this.clickable) {
    // We are achieving clickability/hoverability by adding a new empty
    // transparent DOM element in front of everything.
    this.clickableEl = document.createElement('div');
    this.clickableEl.style.zIndex = engine.PLANE_CLICKABLE;
    this.clickableEl.style.position = 'absolute';

    this.clickableEl.rect = this;
    this.clickableEl.innerId = this.innerId;

    // Remove WebKit touch/tap-specific artifacts.
    this.clickableEl.style.webkitTapHighlightColor = 'rgba(0, 0, 0, 0)';
    this.clickableEl.style.webkitTouchCallout = 'none';

    // This is a cross-browser way to hide an element visually, but still
    // make it clickable.
    this.clickableEl.style.background = 'white';
    this.clickableEl.style.opacity = 0;
    this.clickableEl.style.filter = 'alpha(opacity=0)';

    // Show debugging highlights if requested.
    if (engine.debug.showClickable) {
      this.clickableEl.style.opacity = .2;
      this.clickableEl.style.background = 'red';
    }

    engine.bodyEl.appendChild(this.clickableEl);

    this.update();

    // Remembering the custom on mouse up and down handlers. Those are used
    // e.g. for buttons.
    if (params.onMouseDown) {
      this.clickableEl.onMouseDownHandler =
          engine.bind(params.onMouseDown, this);
    }
    if (params.onMouseUp) {
      this.clickableEl.onMouseUpHandler =
          engine.bind(params.onMouseUp, this);
    }

    // Remembering hover in and out handlers. We animate the mouse pointer
    // on hover in and out.

    this.clickableEl.onMouseOverHandler =
        engine.bind(this.actor.onClickableMouseOver, this.actor);
    this.clickableEl.onMouseOutHandler =
        engine.bind(this.actor.onClickableMouseOut, this.actor);

    // Adding mouse down/up event listeners and corresponding touch
    // event listeners.

    engine.addEventListener({
        el: this.clickableEl, type: 'mousedown',
        handler: engine.bind(this.actor.onMouseDown, this.actor) });
    engine.addEventListener({
        el: this.clickableEl, type: 'touchstart',
        handler: engine.bind(this.actor.onMouseDown, this.actor) });
    engine.addEventListener({
        el: this.clickableEl, type: 'mouseup',
        handler: engine.bind(this.actor.onMouseUp, this.actor) });
    engine.addEventListener({
        el: this.clickableEl, type: 'touchend',
        handler: engine.bind(this.actor.onMouseUp, this.actor) });

    // Adding hover in and out event listeners.

    engine.addEventListener({
        el: this.clickableEl, type: 'mouseover',
        handler: this.clickableEl.onMouseOverHandler });
    engine.addEventListener({
        el: this.clickableEl, type: 'mouseout',
        handler: this.clickableEl.onMouseOutHandler });

    // Adding click handler/event listener if an actor has it. (An actor
    // handles clicks to all its inner elements too in the same function.)
    if (this.actor.onClick) {
      this.clickableEl.onClickHandler =
          engine.bind(this.actor.onMouseClick, this.actor);
      if (engine.features.touch) {
        engine.addEventListener({
            el: this.clickableEl, type: 'touchend',
            handler: this.clickableEl.onClickHandler });
      } else {
        engine.addEventListener({
            el: this.clickableEl, type: 'click',
            handler: this.clickableEl.onClickHandler });
      }
    }
  } else {
    // Removing all the previously set event listeners.

    if (this.clickableEl.onClickHandler) {
      if (engine.features.touch) {
        engine.removeEventListener({
            el: this.clickableEl, type: 'touchend',
            handler: this.clickableEl.onClickHandler });
      } else {
        engine.removeEventListener({
            el: this.clickableEl, type: 'click',
            handler: this.clickableEl.onClickHandler });
      }
    }

    if (this.clickableEl.onMouseDownHandler) {
      engine.removeEventListener({
          el: this.clickableEl, type: 'mousedown',
          handler: this.clickableEl.onMouseDownHandler });
      engine.removeEventListener({
          el: this.clickableEl, type: 'touchstart',
          handler: this.clickableEl.onMouseDownHandler });
    }

    if (this.clickableEl.onMouseUpHandler) {
      engine.removeEventListener({
          el: this.clickableEl, type: 'mouseup',
          handler: this.clickableEl.onMouseUpHandler });
      engine.removeEventListener({
          el: this.clickableEl, type: 'touchend',
          handler: this.clickableEl.onMouseUpHandler });
    }

    engine.removeEventListener({
        el: this.clickableEl, type: 'mouseover',
        handler: this.clickableEl.onMouseOverHandler });
    engine.removeEventListener({
        el: this.clickableEl, type: 'mouseout',
        handler: this.clickableEl.onMouseOutHandler });

    engine.bodyEl.removeChild(this.clickableEl);
  }
};

/**
 * Clear a given rect (make it transparent).
 * @param {Object} params
 * - {boolean} .noUpdate Don’t update visually right now.
 */
EngineRect.prototype.clear = function(params) {
  this.contents = engine.CONTENTS_CLEAR;
  this.imageId = null;
  this.nonRotatedImageId = null;

  this.contentsInvalidated = true;
  if (!params || !params.noUpdate) {
    this.update();
  }
};

/**
 * Fill a rect with white.
 * @param {Object} params
 * - {boolean} .noUpdate Don’t update visually right now.
 */
EngineRect.prototype.showWhite = function(params) {
  this.contents = engine.CONTENTS_WHITE;
  this.imageId = null;
  this.nonRotatedImageId = null;

  this.contentsInvalidated = true;
  if (!params || !params.noUpdate) {
    this.update();
  }
};

/**
 * Fill a rect with black.
 * @param {Object} params
 * - {boolean} .noUpdate Don’t update visually right now.
 */
EngineRect.prototype.showBlack = function(params) {
  this.contents = engine.CONTENTS_BLACK;
  this.imageId = null;
  this.nonRotatedImageId = null;

  this.contentsInvalidated = true;
  if (!params || !params.noUpdate) {
    this.update();
  }
};

/**
 * Fill a rect with image.
 * @param {Object} params
 * - {string} .imageId Image id with rotation.
 * - {string} .nonRotatedImageId Image id without rotation.
 * - {string} .align Image alignment.
 * - {boolean} .noUpdate Don’t update visually right now.
 */
EngineRect.prototype.showImage = function(params) {
  this.contents = engine.CONTENTS_IMAGE;
  this.imageId = params.imageId;
  this.nonRotatedImageId = params.nonRotatedImageId || this.imageId;

  this.align = params.align;
  if (!this.align) {
    this.align = [engine.ALIGN_START, engine.ALIGN_START];
  }

  this.contentsInvalidated = true;
  if (!params || !params.noUpdate) {
    this.update();
  }
};

/**
 * Fill a rect with animation.
 * @param {Object} params
 * - {array} .imageIds Array with image ids (frames).
 * - {boolean} .align Image alignment vis-a-vis the rect.
 * - {number} .speed Speed in milliseconds per frame.
 * - {number} .count Play count (defaults to infinity).
 * - {func} .onFinish A function to call if finished.
 * - {boolean} .clearOnFinish Whether to clear the rect when done.
 */
EngineRect.prototype.showAnimation = function(params) {
  this.showImage({
    innerId: this.innerId,
    align: params.align,
    imageId: params.imageIds[0] });

  this.actor.addTransition({
    id: params.id,
    innerId: this.innerId,
    duration: params.speed * params.imageIds.length,
    easing: engine.linear,
    count: params.count || Infinity,
    onFinish: params.onFinish,
    clearOnFinish: params.clearOnFinish,
    align: params.align,
    alternate: params.alternate,
    properties: {
      animation: {
        imageIds: params.imageIds,
        repeatFrom: params.repeatFrom
      }
    }
  });
};

/**
 * Update the parameters (rotation, position of image) of a rect if
 * we changed its contents or some of its properties.
 */
EngineRect.prototype.update = function() {
  if (this.clickableEl) {
    this.updateClickable();
  }

  this.updateRotate();

  // Auto-hide if moved to the left of the screen.
  if (!this.innerId && !this.neverAutoHide && this.actor && this.visible &&
      ((this.x + this.width) < 0)) {
    this.actor.setVisible({ visible: false });
  }

  if (this.contentsInvalidated) {
    if (!engine.useSprites &&
        (this.contents == engine.CONTENTS_IMAGE)) {
      engine.debugCheckIfImageLoaded({ id: this.imageId });
    }

    if ((this.render & engine.RENDER_DOM) && !engine.useSprites) {
      this.offsetX = 0;
      this.offsetY = 0;
    } else {
      if (this.contents == engine.CONTENTS_IMAGE) {
        if (engine.useSprites) {
          var pos = engine.IMAGE_SPRITE_INFO[this.imageId];

          if (engine.debugEnabled && !pos) {
            window.console.log('ERROR: no image in sprite!', this.imageId);
            return;
          }

          this.spriteX = pos.x;
          this.spriteY = pos.y;
          this.spriteOffsetX = pos.left || 0;
          this.spriteOffsetY = pos.top || 0;

          var imgWidth = pos.width;
          var imgHeight = pos.height;
        } else {
          var img = engine.loadedImageFiles[this.imageId];

          var imgWidth = img.width;
          var imgHeight = img.height;
        }

        var width = imgWidth;
        var height = imgHeight;

        // Add back padding removed by spriter trimming.
        if (engine.useSprites) {
          width += (pos.left || 0) + (pos.right || 0);
          height += (pos.top || 0) + (pos.bottom || 0);
        }

        switch (this.align[0]) {
          case engine.ALIGN_START:
            this.offsetX = 0;
            break;
          case engine.ALIGN_CENTER:
            this.offsetX = Math.floor((this.origWidth - width) / 2);
            break;
          case engine.ALIGN_END:
            this.offsetX = this.origWidth - width;
            break;
        }

        switch (this.align[1]) {
          case engine.ALIGN_START:
            this.offsetY = 0;
            break;
          case engine.ALIGN_CENTER:
            this.offsetY = Math.floor((this.origHeight - height) / 2);
            break;
          case engine.ALIGN_END:
            this.offsetY = this.origHeight - height;
            break;
        }

        if (this.forceWidth) {
          width = this.forcedWidth - this.offsetX;
          if (width < 0) {
            width = 0;
          }
        } else {
          width = imgWidth;
        }

        if (this.forceHeight) {
          height = this.forcedHeight - this.offsetY;

          if (engine.useSprites) {
            height -= this.spriteOffsetY;
          }

          if (height < 0) {
            height = 0;
          }
        } else {
          height = imgHeight;
        }

        this.width = width;
        this.height = height;
      }
    }

    this.origOffsetX = this.offsetX;
    this.origOffsetY = this.offsetY;
  }

  if (this.render & engine.RENDER_DOM) {
    this.updateDom();
  }
  if (this.render & engine.RENDER_CANVAS) {
    this.updateCanvas();
  }

  if (this.contentsInvalidated) {
    this.contentsInvalidated = false;
  }
};

/**
 * Update the parameters (rotation, position of image) of a rect that have
 * to do with rotation.
 */
EngineRect.prototype.updateRotate = function() {
  var combinedRotate = this.rotate;

  // Rotation that comes from above, e.g. if our rect is connected to
  // another rect that is itself rotated.
  if (this.connectedRotate) {
    combinedRotate += this.connectedRotate;
  }

  var combinedAngle = combinedRotate * Math.PI / 180;

  if (this.clampRotate) {
    var clampedRotate =
        Math.round(combinedRotate / this.clampRotate) * this.clampRotate;

    var angle = this.pivotAngle - combinedAngle;

    var pivotOffsetX = -Math.sin(angle) * this.pivotDistance + this.pivotX;
    var pivotOffsetY = -Math.cos(angle) * this.pivotDistance + this.pivotY;

    this.transform({ noUpdate: true,
                     pivotOffsetX: pivotOffsetX,
                     pivotOffsetY: pivotOffsetY });

    // If an image for a given angle is available, use it.
    var id = engine.getImageRotateId({ id: this.nonRotatedImageId,
                                           rotate: clampedRotate });
    if (engine.isImageAvailable({ id: id })) {
      this.showImage({
          imageId: id,
          nonRotatedImageId: this.nonRotatedImageId,
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER],
          noUpdate: true });
    }
  }

  // Calculate rotations for all the rects that are connected to ours.
  if (this.connected) {
    // .connected is guaranteed to be an array.
    for (var i in this.connected) {
      var connected = this.connected[i];

      var angle = connected.pivotAngle - combinedAngle;

      var connectedPivotOffsetX =
          this.connectedPivotOffsetX +
          Math.sin(angle) * connected.pivotDistance - connected.pivotX;
      var connectedPivotOffsetY =
          this.connectedPivotOffsetY +
          Math.cos(angle) * connected.pivotDistance - connected.pivotY;

      var rect = this.actor.innerRects[connected.innerId];
      if (rect) {
        rect.transform({ connectedRotate: combinedRotate,
                         connectedPivotOffsetX: connectedPivotOffsetX,
                         connectedPivotOffsetY: connectedPivotOffsetY });
      }
    }
  }
};

/**
 * Update the size and the position of a clickable element to match
 * our rect.
 */
EngineRect.prototype.updateClickable = function() {
  var x = this.x;
  var y = this.y - engine.bodyOffsetY;

  if (this.innerId) {
    x += this.actor.rect.x;
    y += this.actor.rect.y;
    if (this.actor.rect.offsetY) {
      y += this.actor.rect.offsetY;
    }
  }

  var width = this.origWidth;
  var height = this.origHeight;

  // Add extra padding to make clicking/touching easier.
  if (this.clickablePadding) {
    x -= engine.clickableElPadding;
    y -= engine.clickableElPadding;

    width += engine.clickableElPadding * 2;
    height += engine.clickableElPadding * 2;
  }

  this.clickableEl.style.left = Math.floor(x) + 'px';
  this.clickableEl.style.top = Math.floor(y) + 'px';
  this.clickableEl.style.width = width + 'px';
  this.clickableEl.style.height = height + 'px';
};

/**
 * Hide the rect if uses DOM to render.
 */
EngineRect.prototype.hideInDom = function() {
  this.el.style.display = 'none';

  this.el.style.left = '-9999px';
  this.el.style.top = '-9999px';
};

/**
 * Show the rect if uses DOM to render.
 */
EngineRect.prototype.showInDom = function() {
  this.el.style.display = 'block';
};

/**
 * Update necessary <canvas> values so the object renders properly on canvas.
 * Namely, we need to recalculate z-order if some things change.
 */
EngineRect.prototype.updateCanvas = function() {
  if (this.visible != this.visiblePrev) {
    engine.invalidateRectOrder();
    this.visiblePrev = this.visible;
  }

  if (this.planeCombined != this.planeCombinedPrev) {
    engine.invalidateRectOrder();
    this.planeCombinedPrev = this.planeCombined;
  }
};

/**
 * Update the corresponding DOM element if that is what is used to render a
 * rect.
 */
EngineRect.prototype.updateDom = function() {
  if (this.visible != this.visiblePrev) {
    if (!this.visible) {
      engine.removeAnimation({ id: this.id, innerId: this.innerId });
      this.hideInDom();
    } else {
      this.showInDom();
    }
    this.visiblePrev = this.visible;
  }

  if (!this.visible) {
    return;
  }

  if (this.opacity != this.opacityPrev) {
    if (engine.features.filterOpacity) {
      if (this.opacity < 1) {
        this.el.style.filter =
            'alpha(opacity = ' + Math.floor(this.opacity * 100) + ')';
      } else {
        this.el.style.filter = '';
      }
    } else {
      this.el.style.opacity = this.opacity;
    }

    this.opacityPrev = this.opacity;
  }

  if (this.attachedToDocumentBody) {
    if (this.positionRelativeToDoodleBody) {
      var x = this.x + engine.bodyPos.left;
      var y = this.y + engine.bodyPos.top - engine.bodyOffsetY;

      // For DOM, we have to crop if the element extends the width or the
      // height of the entire page, otherwise it’d cause scrollbars to appear.
      // (This only happens to the right and to the bottom.)
      if (x + this.width > document.body.offsetWidth) {
        var newWidth = document.body.offsetWidth - x;
        if (newWidth < 0) {
          newWidth = 0;
        }

        this.el.style.width = newWidth + 'px';
      }

      if (y + this.height > document.body.offsetHeight) {
        var newHeight = document.body.offsetHeight - y;
        if (newHeight < 0) {
          newHeight = 0;
        }

        this.el.style.height = newHeight + 'px';
      }

      this.el.style.left = Math.floor(x) + 'px';
      this.el.style.top = Math.floor(y) + 'px';

    } else {
      this.el.style.left = Math.floor(this.x) + 'px';
      this.el.style.top = Math.floor(this.y) + 'px';
    }
  } else {
    // not attached directly to body

    var x = this.x + this.offsetX + this.spriteOffsetX +
            this.pivotOffsetX + this.connectedPivotOffsetX;
    var y = this.y + this.offsetY + this.spriteOffsetY +
            this.pivotOffsetY + this.connectedPivotOffsetY;

    this.el.style.left = Math.floor(x) + 'px';
    if (this.innerId) {
      this.el.style.top = Math.floor(y) + 'px';
    } else {
      this.el.style.top = Math.floor(y - engine.bodyOffsetY) + 'px';
    }
  }

  if (this.scrollX) {
    if (this.scrollableEl) {
      this.scrollableEl.style.left = this.scrollX + 'px';
    } else {
      this.el.scrollLeft = -this.scrollX;
    }
  }

  if (this.width == engine.SCREEN_WIDTH) {
    this.el.style.width = document.body.scrollWidth + 'px';
  } else {
    this.el.style.width = this.width + 'px';
  }

  if (this.height == engine.SCREEN_HEIGHT) {
    this.el.style.height = document.body.scrollHeight + 'px';
  } else {
    this.el.style.height = this.height + 'px';
  }

  if (this.planeCombined != this.planeCombinedPrev) {
    this.el.style.zIndex = this.planeCombined;
    this.planeCombinedPrev = this.planeCombined;
  }

  if (this.contentsInvalidated) {
    switch (this.contents) {
      case engine.CONTENTS_CLEAR:
        this.el.style.background = 'transparent';

        if (this.horLoop) {
          this.horLoopEl1.style.background = 'transparent';
          this.horLoopEl2.style.background = 'transparent';
        }
        break;
      case engine.CONTENTS_BLACK:
        this.el.style.background = 'black';
        break;
      case engine.CONTENTS_WHITE:
        this.el.style.background = 'white';
        break;
      case engine.CONTENTS_IMAGE:
        var url = engine.getImageFileUrl({
            id: engine.getImageSpriteId({ id: this.imageId }) });

        var alignment = '';
        if (!engine.useSprites) {
          switch (this.align[0]) {
            case engine.ALIGN_CENTER:
              alignment = 'center';
              break;
            case engine.ALIGN_START:
              alignment = 'left';
              break;
            case engine.ALIGN_END:
              alignment = 'right';
              break;
          }
          switch (this.align[1]) {
            case engine.ALIGN_CENTER:
              alignment += ' center';
              break;
            case engine.ALIGN_START:
              alignment += ' top';
              break;
            case engine.ALIGN_END:
              alignment += ' bottom';
              break;
          }

          if (this.horLoop) {
            this.horLoopEl1.style.background =
                'url(' + url + ') ' + alignment +
                ' no-repeat';
            this.horLoopEl2.style.background =
                'url(' + url + ') ' + alignment +
                ' no-repeat';

            this.horLoopEl1.style.height = this.height + 'px';
            this.horLoopEl2.style.height = this.height + 'px';
          } else {
            this.el.style.background =
                'url(' + url + ') ' + alignment +
                ' no-repeat';
          }
        } else {
          if (this.horLoop) {
            this.horLoopEl1.style.background =
                'url(' + url + ') -' + this.spriteX +
                'px -' + this.spriteY + 'px no-repeat';
            this.horLoopEl2.style.background = 'url(' + url + ') -' +
                this.spriteX + 'px -' + this.spriteY + 'px no-repeat';

            this.horLoopEl1.style.height = this.height + 'px';
            this.horLoopEl2.style.height = this.height + 'px';
          } else {
            this.el.style.background = 'url(' + url + ') -' +
              (this.spriteX) + 'px -' +
              (this.spriteY) + 'px no-repeat';
          }
        }
        break;
    }
  }
};

/**
 * Transform a given rect (move it, resize, etc.).
 * @param {Object} params
 * - {number} .x Left position in px (absolute).
 * - {number} .y Top position in px (absolute).
 * - {number} .relX Left position in px (relative).
 * - {number} .relY Top position in px (relative).
 * - {number} .opacity Opacity (0 to 1).
 * - {boolean}.visible Visibility.
 * - {number} .offsetX Horizontal offset in px.
 * - {number} .offsetY Vertical offset in px.
 * - {number} .spriteOffsetX Horizontal sprite offset in px.
 * - {number} .spriteOffsetY Vertical sprite offset in px.
 * - {number} .pivotX Horizontal pivot position in px.
 * - {number} .pivotY Vertical pivot position in px.
 * - {number} .pivotOffsetX Horizontal pivot offset in px.
 * - {number} .pivotOffsetY Vertical pivot offset in px.
 * - {number} .connectedPivotOffsetX Horizontal connected pivot offset in px.
 * - {number} .connectedPivotOffsetY Vertical connected pivot offset in px.
 * …and more
 */
EngineRect.prototype.transform = function(params) {
  if (engine.isDef(params.x)) {
    this.x = params.x;
  }
  if (engine.isDef(params.y)) {
    this.y = params.y;
  }
  if (engine.isDef(params.relX)) {
    this.x += params.relX;
  }
  if (engine.isDef(params.relY)) {
    this.y += params.relY;
  }
  if (engine.isDef(params.opacity)) {
    this.opacity = params.opacity;
  }
  if (engine.isDef(params.visible)) {
    this.visible = params.visible;
  }
  if (engine.isDef(params.offsetX)) {
    this.offsetX = Math.floor(params.offsetX);
  }
  if (engine.isDef(params.offsetY)) {
    this.offsetY = Math.floor(params.offsetY);
  }
  if (engine.isDef(params.spriteOffsetX)) {
    this.spriteOffsetX = Math.floor(params.spriteOffsetX);
  }
  if (engine.isDef(params.spriteOffsetY)) {
    this.spriteOffsetY = Math.floor(params.spriteOffsetY);
  }
  if (engine.isDef(params.pivotOffsetX)) {
    this.pivotOffsetX = Math.floor(params.pivotOffsetX);
  }
  if (engine.isDef(params.pivotOffsetY)) {
    this.pivotOffsetY = Math.floor(params.pivotOffsetY);
  }
  if (engine.isDef(params.connectedPivotOffsetX)) {
    this.connectedPivotOffsetX = params.connectedPivotOffsetX;
  }
  if (engine.isDef(params.connectedPivotOffsetY)) {
    this.connectedPivotOffsetY = params.connectedPivotOffsetY;
  }
  if (engine.isDef(params.pivotX) ||
      engine.isDef(params.pivotY)) {
    if (engine.isDef(params.pivotX)) {
      this.pivotX = Math.floor(params.pivotX);
    }
    if (engine.isDef(params.pivotY)) {
      this.pivotY = Math.floor(params.pivotY);
    }

    this.pivotDistance =
        Math.sqrt(this.pivotX * this.pivotX + this.pivotY * this.pivotY);
    this.pivotAngle = Math.atan2(this.pivotX, this.pivotY);
  }

  if (engine.isDef(params.connected)) {
    this.connected = params.connected;
    for (var i in this.connected) {
      this.connected[i].pivotDistance =
          Math.sqrt(this.connected[i].pivotX * this.connected[i].pivotX +
                    this.connected[i].pivotY * this.connected[i].pivotY);

      this.connected[i].pivotAngle =
          Math.atan2(this.connected[i].pivotX, this.connected[i].pivotY);
    }
  }

  if (engine.isDef(params.clampRotate)) {
    this.clampRotate = params.clampRotate;
  }

  if (engine.isDef(params.connectedRotate)) {
    this.connectedRotate = params.connectedRotate;
  }

  if (engine.isDef(params.width)) {
    this.width = Math.floor(params.width);

    if (!engine.isDef(this.origWidth)) {
      this.origWidth = this.width;
    }
  }
  if (engine.isDef(params.height)) {
    this.height = Math.floor(params.height);

    if (!engine.isDef(this.origHeight)) {
      this.origHeight = this.height;
    }
  }

  if (engine.isDef(params.rotate)) {
    this.rotate = params.rotate;
  }

  if (engine.isDef(params.plane)) {
    this.plane = Math.floor(params.plane);
  }
  if (engine.isDef(params.planeCorrection)) {
    this.planeCorrection = Math.floor(params.planeCorrection);
  }

  this.planeCombined = this.plane + this.planeCorrection;

  if (engine.isDef(params.forceWidth)) {
    this.forceWidth = params.forceWidth;

    if (this.forceWidth) {
      this.forcedWidth = this.width;
    }
  }
  if (engine.isDef(params.forceHeight)) {
    this.forceHeight = params.forceHeight;

    if (this.forceHeight) {
      this.forcedHeight = this.height;
    }
  }
  if (engine.isDef(params.scrollX)) {
    this.scrollX = Math.floor(params.scrollX);
  }
  if (engine.isDef(params.positionRelativeToDoodleBody)) {
    this.positionRelativeToDoodleBody = params.positionRelativeToDoodleBody;
  }

  if (!params.noUpdate) {
    this.update();
  }
};

/**
 * Render a given image on canvas.
 * @param {Object} params
 * - {number} .canvasCtx Canvas context.
 */
EngineRect.prototype.renderOnCanvas = function(params) {
  if (this.contents == engine.CONTENTS_CLEAR) {
    return;
  }

  var x = this.x + this.offsetX + this.pivotOffsetX +
          this.connectedPivotOffsetX + this.spriteOffsetX;
  var y = this.y + this.offsetY + this.pivotOffsetY +
          this.connectedPivotOffsetY + this.spriteOffsetY;


  if (this.parentRect) {
    x += this.parentRect.x + this.parentRect.offsetX +
         this.parentRect.pivotOffsetX + this.parentRect.connectedPivotOffsetX;
    y += this.parentRect.y + this.parentRect.offsetY +
         this.parentRect.pivotOffsetY + this.parentRect.connectedPivotOffsetY;
  }


  // We are using Math.floor to avoid different things moving differently
  // between pixels.
  x = Math.floor(x);
  y = Math.floor(y);

  switch (this.contents) {
    case engine.CONTENTS_WHITE:
      params.canvasCtx.fillStyle =
          'rgba(255, 255, 255, ' + this.parentRect.opacity + ')';
      params.canvasCtx.fillRect(x, y, this.width, this.height);
      break;
    case engine.CONTENTS_BLACK:
      params.canvasCtx.fillStyle = 'black';
      params.canvasCtx.fillRect(x, y, this.width, this.height);
      break;
    case engine.CONTENTS_IMAGE:
      var image = engine.loadedImageFiles[
          engine.getImageSpriteId({ id: this.imageId })];

      if (this.horLoopSize ||
          (this.parentRect && this.parentRect.horLoopSize)) {
        var scrollX = this.scrollX;
        if (this.parentRect) {
          scrollX += this.parentRect.scrollX;
        }

        var horLoopSize = this.horLoopSize || this.parentRect.horLoopSize;

        var width = horLoopSize + scrollX;
        if (width < 0) {
          width = 0;
        }

        if (this.forcedWidth && (width > this.forcedWidth)) {
          width = this.forcedWidth;
        }

        if (width > 0) {
          params.canvasCtx.drawImage(image,
              this.spriteX - scrollX, this.spriteY,
              width, this.height, x, y, width, this.height);
        }

        if (width < this.width) {
          params.canvasCtx.drawImage(image, this.spriteX, this.spriteY,
                                     this.width - width, this.height,
                                     x + horLoopSize + scrollX, y,
                                     this.width - width, this.height);
        }

      } else {
        if ((this.width > 0) && (this.height > 0)) {
          params.canvasCtx.drawImage(image, this.spriteX, this.spriteY,
              this.width, this.height, x, y, this.width, this.height);
        }
      }
      break;
  }
};

/**
 * Calculates the z-order of a rect for drawing on <canvas> (we can’t rely)
 * on the CSS z-index to do this for us.
 * @return {number} Value representing the z-order based on planes.
 */
EngineRect.prototype.getZOrder = function() {
  if (this.parentRect) {
    return this.parentRect.planeCombined * 100 + this.innerCount;
  } else {
    return this.planeCombined * 100;
  }
};

/**
 * Creates an actor. Actor is a character, or background element with its
 * logic and behaviour.
 *
 * Each actor has some predefined functions that it can provide, e.g.
 * .init() – will be called after it’s instantiated the first time.
 * .setState() – a default way to change the state of an actor.
 * .tick() – will be called every transition tick
 *
 * @param {string} id Actor’s identifier.
 * @constructor
 */
function EngineActor(id) {
  // All the actor data is in engine.ACTORS.
  var origActorData = engine.ACTORS[id];

  this.id = id;

  // Cheap way to override some of the default methods, we only use it now for
  // setState and setState__.
  for (var i in origActorData) {
    if (!this[i]) {
      this[i] = origActorData[i];
    } else {
      this[i + '__'] = origActorData[i];
    }
  }

  var planeCorrection = origActorData.PLANE_CORRECTION || 0;

  // We create a main rect. An actor always has a main rect and could also
  // have as many inner rects as possible. We support only one level of
  // depth.
  this.rect = new EngineRect({
    actor: this,
    id: id,
    scrollable: origActorData.SCROLLABLE || false,
    forceRenderDom: origActorData.FORCE_RENDER_DOM,
    attachedToDocumentBody: origActorData.ATTACHED_TO_DOCUMENT_BODY,
    neverAutoHide: origActorData.NEVER_AUTO_HIDE });
  this.rect.update();
  this.rect.transform({
      width: origActorData.WIDTH, height: origActorData.HEIGHT,
      plane: origActorData.PLANE, planeCorrection: planeCorrection,
      offsetX: origActorData.OFFSET_X, offsetY: origActorData.OFFSET_Y });

  // We create inner rects for inner elements. We also always create
  // one inner rect created 'main' that covers the entire rect. This
  // is used so we can do DOM background image cropping.
  this.innerRects = {};
  this.innerRectCount = 0;

  // An actor can request getting CPU time even when invisible (one example
  // could be a hint that can “show itself”).
  this.ticksWhenInvisible = origActorData.TICKS_WHEN_INVISIBLE;

  this.addInnerRects({ innerRectsData: this.INNER_RECTS });

  // Whether the actor (if a button) is currently pressed.
  this.curPressed = false;
}

/**
 * Since we are using spriting, we cannot easily crop an image and pad it
 * arbitrarily. Therefore, each rect that uses an image gets an automatic
 * inner “main” rect that serves as a holder for that image. This function
 * creates it, but it’s only called on demand whenever it’s needed first.
 */
EngineActor.prototype.addMainInnerRect = function() {
  var origActorData = engine.ACTORS[this.id];

  var innerRectsData = {};

  innerRectsData[engine.MAIN_RECT_ID] = {
      x: 0, y: 0,
      width: origActorData.WIDTH, height: origActorData.HEIGHT,
      clampRotate: origActorData.CLAMP_ROTATE
  };

  this.addInnerRects({ innerRectsData: innerRectsData });
};

/**
 * Create inner elements (rects) for a given rect.
 * @param {Object} params
 * - {Array} .innerRectsData The data to create inner elements.
 */
EngineActor.prototype.addInnerRects = function(params) {
  for (var id in params.innerRectsData) {
    var innerRectData = params.innerRectsData[id];

    // The main rect always gets at the bottom, even if created later.
    if (id == engine.MAIN_RECT_ID) {
      var innerCount = -1;
    } else {
      this.innerRectCount++;
      var innerCount = this.innerRectCount;
    }

    this.innerRects[id] = new EngineRect({
      actor: this, id: this.id,
      innerId: id,
      innerCount: innerCount,
      forceRenderDom: innerRectData.forceRenderDom,
      horLoopSize: innerRectData.horLoopSize });

    innerRectData.visible = true;
    this.innerRects[id].transform(innerRectData);
  }
};

/**
 * Get a rect.
 * @param {Object} params
 * - {string} .innerId Id of an inner rect (optional).
 * - {number} .includeMain Whether to include 'main' rectangle
 *                         if not specifying innerId, or not.
 * @return {Object} A requested rect.
 */
EngineActor.prototype.getRect = function(params) {
  if (!params.innerId) {
    if (params.includeMain) {
      // Main rect asked for implicitly – create if necessary.
      if (!this.innerRects[engine.MAIN_RECT_ID]) {
        this.addMainInnerRect();
      }

      return this.innerRects[engine.MAIN_RECT_ID];
    } else {
      return this.rect;
    }
  } else {
    // Main rect asked for explicitly – create if necessary.
    if ((params.innerId == engine.MAIN_RECT_ID) &&
        (!this.innerRects[engine.MAIN_RECT_ID])) {
      this.addMainInnerRect();
    }

    return this.innerRects[params.innerId];
  }
};

/**
 * Set a rendering method for an actor.
 * @param {Object} params
 * - {number} .render A way to render (engine.RENDER_*).
 */
EngineActor.prototype.setRender = function(params) {
  this.rect.setRender(params);

  for (var i in this.innerRects) {
    this.innerRects[i].setRender(params);
  }

  engine.invalidateRectOrder();
};

/**
 * Set a state for a rect. A state might be e.g. a character walking,
 * running, etc.
 * @param {Object} params
 * - {string} .state A new state.
 */
EngineActor.prototype.setState = function(params) {
  if (this.state != params.state) {
    if (this.setState__) {
      this.setState__(params);
    }

    this.state = params.state;
  }
};

/**
 * Set whether an actor is visible.
 * @param {Object} params
 * - {boolean} .visible Whether an actor is visible.
 */
EngineActor.prototype.setVisible = function(params) {
  this.transform({ visible: params.visible });

  /* Take care of all the clickable elements too. */
  for (var i in this.innerRects) {
    if (this.innerRects[i].clickable) {
      if (params.visible) {
        this.innerRects[i].clickableEl.style.display = 'block';
      } else {
        this.innerRects[i].clickableEl.style.display = 'none';
      }
    }
  }

  /* Remove all the transitions and animations associated with the actor
     if it disappears. */
  if (!params.visible) {
    for (var i = engine.events.length - 1; i >= 0; i--) {
      var ev = engine.events[i];
      if (ev.actorId == this.id) {
        engine.removeEvent({ event: ev });
      }
    }

    engine.removeAnimation({ id: this.id, allInnerRects: true });
  }
};

/**
 * Set whether an actor is clickable.
 * @param {Object} params
 * - {string} .innerId Id of an inner rect (optional).
 * - {boolean} .clickable Whether an actor is clickable.
 */
EngineActor.prototype.setClickable = function(params) {
  var rect = this.getRect({ innerId: params.innerId, includeMain: true });

  rect.setClickable(params);
};

/**
 * Set whether an actor is attached directly to <body>, or regular
 * doodle body (default).
 * @param {Object} params
 * - {boolean} .attachedToDocumentBody Whether attached to <body>.
 */
EngineActor.prototype.setAttachedToDocumentBody = function(params) {
  this.setRender({ render: engine.RENDER_NONE });

  this.rect.attachedToDocumentBody = params.attachedToDocumentBody;

  if (params.attachedToDocumentBody) {
    this.setRender({ render: engine.RENDER_DOM });
  } else {
    if (engine.features.canvas) {
      this.setRender({ render: engine.RENDER_CANVAS });
    } else {
      this.setRender({ render: engine.RENDER_DOM });
    }
  }
};

/**
 * Show an animation within a rect or an inner rect. This essentially is
 * a small wrapper around a EngineRect function.
 * @param {Object} params Parameters as per EngineRect.showAnimation().
 */
EngineActor.prototype.showAnimation = function(params) {
  // Remove any animations that might be playing over the same rect.
  engine.removeAnimation({ id: this.id, innerId: params.innerId });

  var rect = this.getRect({ innerId: params.innerId, includeMain: true });
  rect.showAnimation(params);
};

/**
 * Show an image within a rect or an inner rect. This essentially is
 * a small wrapper around a EngineRect function.
 * @param {Object} params Parameters as per EngineRect.showImage().
 */
EngineActor.prototype.showImage = function(params) {
  // Remove any animations that might be playing over the same rect.
  engine.removeAnimation({ id: this.id, innerId: params.innerId });

  var rect = this.getRect({ innerId: params.innerId, includeMain: true });

  rect.showImage(params);
};

/**
 * Fill a rect or an inner rect with black. This essentially is a small
 * wrapper around a EngineRect function.
 * @param {Object} params Parameters as per EngineRect.showBlack().
 */
EngineActor.prototype.showBlack = function(params) {
  if (params) {
    var innerId = params.innerId;
  } else {
    var innerId = null;
  }

  engine.removeAnimation({ id: this.id, innerId: innerId });

  var rect = this.getRect({ innerId: innerId, includeMain: true });
  rect.showBlack(params);
};

/**
 * Fill a rect or an inner rect with white. This essentially is a small
 * wrapper around a EngineRect function.
 * @param {Object} params Parameters as per EngineRect.showWhite().
 */
EngineActor.prototype.showWhite = function(params) {
  if (params) {
    var innerId = params.innerId;
  } else {
    var innerId = null;
  }

  engine.removeAnimation({ id: this.id, innerId: innerId });

  var rect = this.getRect({ innerId: innerId, includeMain: true });
  rect.showWhite(params);
};

/**
 * Clear a given rect or an inner rect. This essentially is a small wrapper
 * around a EngineRect function.
 * @param {Object} params Parameters as per EngineRect.showBlack().
 */
EngineActor.prototype.clear = function(params) {
  if (params) {
    var innerId = params.innerId;
  } else {
    var innerId = null;
  }
  engine.removeAnimation({ id: this.id, innerId: innerId });

  var rect = this.getRect({ innerId: innerId, includeMain: true });
  rect.clear(params);
};

/**
 * Add a transition to an actor. This essentially is a small wrapper around
 * a EngineTransition constructor.
 * @param {Object} params Parameters as per EngineTransition constructor.
 */
EngineActor.prototype.addTransition = function(params) {
  params.actorId = this.id;

  engine.addTransition(params);
};

/**
 * Transform a given rect from an actor.
 * @param {Object} params Parameters as per EngineRect.transform()
 */
EngineActor.prototype.transform = function(params) {
  var rect = this.getRect({ innerId: params.innerId, includeMain: false });
  rect.transform(params);

  if (!params.innerId) {
    for (var i in this.innerRects) {
      if (this.innerRects[i].clickable) {
        this.innerRects[i].update();
      }
    }
  }
};

/**
 * Update a main rect or all rects of an actor.
 * @param {Object} params
 * - {boolean} .allInnerRects True if update all inner els too.
 */
EngineActor.prototype.update = function(params) {
  this.rect.update();

  if (params && params.allInnerRects) {
    for (var i in this.innerRects) {
      this.innerRects[i].update();
    }
  }
};

/**
 * Handle a mouse over event on a clickable element.
 * @param {Event} e Window event.
 */
EngineActor.prototype.onClickableMouseOver = function(e) {
  var event = engine.getDomEvent({ event: e });

  engine.interaction();

  if (engine.customMousePointer) {
    engine.setEmptyCssCursor({ el: event.targetEl });

    $a('mouse-pointer').setState({ state: 'hover' });
  } else {
    event.targetEl.style.cursor = 'pointer';
  }
};

/**
 * Handle a mouse out event on a clickable element.
 * @param {Event} e Window event.
 */
EngineActor.prototype.onClickableMouseOut = function(e) {
  var event = engine.getDomEvent({ event: e });

  engine.interaction();

  if (this.curPressed && event.targetEl.rect.clickableEl.onMouseUpHandler) {
    event.targetEl.rect.clickableEl.onMouseUpHandler();
  }
  this.curPressed = false;

  if (engine.customMousePointer) {
    $a('mouse-pointer').setState({ state: 'normal' });
  }
};

/**
 * Handle a mouse down event on an actor. Fire a handler if it was previously
 * assigned (e.g. if the actor is a button).
 * @param {Event} e Window event.
 */
EngineActor.prototype.onMouseDown = function(e) {
  var event = engine.getDomEvent({ event: e });

  if (event.targetEl.onMouseDownHandler) {
    engine.interaction({ meaningful: true });

    event.targetEl.onMouseDownHandler(event);
  }

  this.curPressed = true;
};

/**
 * Handle a mouse up event on an actor. Fire a handler if it was previously
 * assigned (e.g. if the actor is a button).
 * @param {Event} e Window event.
 */
EngineActor.prototype.onMouseUp = function(e) {
  var event = engine.getDomEvent({ event: e });

  if (event.targetEl.onMouseUpHandler) {
    event.targetEl.onMouseUpHandler(event);
  }

  // We don’t need to set up .curPressed here since .curPressed only makes
  // sense while the button is held down, and is used to determine whether
  // someone moved away from the button as they were holding the mouse down.
};

/**
 * Handle a mouse click event on an actor. If an actor specifies onClick,
 * run it.
 * @param {Event} e Window event.
 */
EngineActor.prototype.onMouseClick = function(e) {
  var event = engine.getDomEvent({ event: e });

  if (this.curPressed) {
    engine.interaction({ meaningful: true });
    this.onClick({ innerId: event.targetEl.innerId });

    this.curPressed = false;

    engine.preventDefaultEvent({ event: event });
    engine.stopPropagationEvent({ event: event });
  }
};

/**
 * Turns an actor into a button. A button is a regular clickable element,
 * which additionally responds with animations whenever pressed or unpressed.
 * @param {Object} params
 * - {string} .innerId Optional id of an inner element.
 * - {boolean} .clickable Whether to turn into a button or not.
 * - {Array} .pressAnimImageIds Image ids for animation when the button
 *                              is pressed.
 * - {Array} .unpressAnimImageIds Image ids for animation when
 *                                the button is unpressed.
 */
EngineActor.prototype.turnIntoButton = function(params) {
  this.setClickable({
      innerId: params.innerId,
      clickable: params.clickable,
      noPadding: params.noPadding,
      onMouseDown: engine.bind(
          function() {
            this.pressButton({ innerId: params.innerId,
                               imageIds: params.pressAnimImageIds }) },
            this),
      onMouseUp: engine.bind(
          function() {
            this.unpressButton({ innerId: params.innerId,
                                 imageIds: params.unpressAnimImageIds }) },
          this)
  });
};

/**
 * Play a button press animation.
 * @param {Object} params
 * - {string} .innerId Optional id of an inner element.
 * - {boolean} .imageIds Image ids for animation.
 */
EngineActor.prototype.pressButton = function(params) {
  this.showAnimation({
    innerId: params.innerId,
    speed: engine.BUTTON_PRESS_ANIMATION_SPEED, count: 1,
    imageIds: params.imageIds });
};

/**
 * Play a button unpress animation.
 * @param {Object} params
 * - {string} .innerId Optional id of an inner element.
 * - {boolean} .imageIds Image ids for animation.
 */
EngineActor.prototype.unpressButton = function(params) {
  if (this.curPressed) {
    var speed = engine.BUTTON_UNPRESS_ANIMATION_SPEED;

    // A slow delay for touch devices so that you can see it as you are
    // removing your finger.
    if (engine.features.touch) {
      speed *= 3;
    }

    this.showAnimation({
      innerId: params.innerId, speed: speed, count: 1,
      imageIds: params.imageIds });
  }
};

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
  engine.events = [];
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
    engine.startDoodleBodyTop = 0;
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

  if (this.curScene.onEnter) {
    this.curScene.onEnter();
  }

  if (this.curSceneNo > this.lastReachedSceneNo) {
    this.lastReachedSceneNo = this.curSceneNo;
    this.saveProgress();
  }

  this.dispatchGameEvent({ name: 'SceneEnter' });
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
    engine.tickEvents();
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
 * Go through events/transitions and fire necessary ticks.
 */
engine.tickEvents = function() {
  for (var i in engine.events) {
    var event = engine.events[i];

    if (event.startTime <= engine.curGameTime) {
      if (!event.endTime) {
        // One-time event.
        event.onEvent();

        engine.removeEvent({ event: event });
      } else if (event.endTime <= engine.curGameTime) {
        if (event.type == engine.EVENT_TYPE_TRANSITION) {
          event.tick({ lastTick: true });
        }
      } else {
        event.onEvent();
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
 * Add a new transition to the list of active transitions.
 * @param {Object} params
 * - {number} .startTime Start time in ms (relative to current time).
 * - {number} .endTime End time in ms (relative to current time).
 * - {func} .onEvent Function to be called at every tick when the
 *                   event is active.
 */
engine.addEvent = function(params) {
  var event = new EngineEvent({
      startTime: engine.curGameTime + params.startTime,
      endTime: engine.curGameTime + params.endTime,
      onEvent: params.onEvent });

  engine.events.push(event);

  return event;
};

/**
 * A shorthand function that allows to add many events in a simplified
 * form: we are passing an object where times are identifiers, and onEvent
 * functions are values, e.g.
 *   engine.addEvents({
 *     0: function() { CONTENTS },
 *     50: function() { CONTENTS }
 *   });
 */
engine.addEvents = function(events) {
  for (var i in events) {
    engine.addEvent({ startTime: parseInt(i, 10), onEvent: events[i] });
  }
};

/**
 * Add a new transition to the list of active transitions.
 * @param {Object} params Parameters as per EngineTransition constructor.
 */
engine.addTransition = function(params) {
  var transition = new EngineTransition(params);

  engine.events.push(transition);
};

/**
 * Removes a passed event from the list of active events.
 * @param {Object} params
 * - {object} .event Event object.
 */
engine.removeEvent = function(params) {
  for (var i in engine.events) {
    if (engine.events[i] == params.event) {
      engine.events.splice(i, 1);

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
  for (var i in engine.events) {
    var ev = engine.events[i];

    if (ev.type == engine.EVENT_TYPE_TRANSITION &&
        ev.id == params.id) {
      engine.removeEvent({ event: ev });
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
  for (var i = engine.events.length - 1; i >= 0; i--) {
    var ev = engine.events[i];
    if (ev.type == engine.EVENT_TYPE_TRANSITION &&
        ev.actorId == params.id &&
        ev.properties.animation &&
      (((ev.innerId == engine.MAIN_RECT_ID) && (!params.innerId)) ||
        (ev.innerId == params.innerId) || (params.allInnerRects))) {
      engine.removeEvent({ event: ev });

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
 * A simple dispatcher for a given in-game event to actors. If a given actor
 * has a method called onXXX, it will be called.
 *
 * Currently used events:
 * – onSceneEnter when the new scene begins
 *
 * @param {Object} params
 * - {string} .name Name of the event.
 */
engine.dispatchGameEvent = function(params) {
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

/**
 * Version number for image versioning. Instead of re-uploading an image when
 * it changes, we upload it under a new name (.2.png, .3.png, etc.) This
 * allows us to control deployment so that people see exactly what we want
 * instead of a cached version.
 * @const
 */
engine.IMAGE_VERSION = 3;

/**
 * Relative path to the raw (non-sprited) images – for development.
 * @const
 */
engine.RAW_IMAGE_PATH = 'images-raw/';

/**
 * Relative path (and prefix) to the sprited images – for production.
 * @const
 */
engine.SPRITE_PATH = 'http://www.google.com/logos/2011/lem-sprite-';

/**
 * A prefix used to store HTML5 Web Storage items (doodle progress).
 * @const
 */
engine.WEB_STORAGE_PREFIX = 'doodle-lem-';

/**
 * Default (starting) width of the doodle.
 * @const
 */
engine.INITIAL_WIDTH = 420;

/**
 * Default (starting) height of the doodle.
 * @const
 */
engine.INITIAL_HEIGHT = 163;

/**
 * Expanded height of the doodle.
 * @const
 */
engine.EXPANDED_HEIGHT = 575;

/**
 * Left margin for the general element.
 * @const
 */
engine.LEFT_MARGIN = 50;

/**
 * The width of the rightmost toolbar that hosts a tooltip icon,
 * and the fast-forward/cutscene indicator.
 * @const
 */
engine.TOOLBAR_WIDTH = 50;

/**
 * Height of the ground at the bottom.
 * @const
 */
engine.GROUND_HEIGHT = 65;

/**
 * A default value to keep an object off the screen to the right.
 * @const
 */
engine.OFFSCREEN_RIGHT = 450;

/**
 * Planes for various items in the doodle. (These correspond to z-indexes.)
 * @const
 */
engine.PLANE_BK_SKY = 100; // Clouds and haze.
engine.PLANE_SKY = 200; // Things flying in the sky.
engine.PLANE_BK_MOUNTAINS = 300; // Background mountains.
engine.PLANE_BACKGROUND = 400; // Things behind the horizon.
engine.PLANE_FW_MOUNTAINS = 500; // Foreground mountains.
engine.PLANE_GROUND = 600; // Horizon (ground).
engine.PLANE_FOREGROUND = 700; // Things in the foreground.
engine.PLANE_CLOSE_FOREGROUND = 800; // Things even closer, e.g. Trurl.
engine.PLANE_THOUGHT_CLOUD = 900; // Trurl’s thought cloud.
engine.PLANE_COVER = 1000; // All-clickable cover for the attract mode.
engine.PLANE_TOOLBAR = 1100; // Toolbar.
engine.PLANE_MOUSE_POINTER = 1200; // Mouse pointer.
engine.PLANE_CLICKABLE = 10000; // Transparent clickable helper elements.
engine.PLANE_FRONT = 9999999999; // In front of everything.

/**
 * Parallax ratios for mountains.
 * @const
 */
engine.BK_MOUNTAINS_MULTIPLIER = .0075;
engine.MOUNTAINS_MULTIPLIER = .01;

/**
 * The letter N equivalents for the finale story, for different languages.
 * @const
 */
engine.COUNTRY_LETTER_N = {
  'english': 'n',
  'polish': 'n',
  'german': 'n',
  'spanish': 'n',
  'italian': 'n',
  'french': 'n',
  'bulgarian': 'h',
  'czech': 'n',
  'hungarian': 's',
  'russian': 'h',
  'ukrainian': 'h'
};

/**
 * The inventory of finale items, keyed off ids. The first parameter in an
 * array is the appearance of an item in a thought bubble, the second
 * parameter is the appearance of an item as it appears on the ground.
 * If any of those two parameter is an array itself, it means it’s an
 * animation, not just an image.
 * @const
 */
engine.N_ITEMS = {
  'basket': ['intro-finale/items-basket', 'intro-finale/items-basket'],
  'broom': ['intro-finale/items-broom', 'intro-finale/items-broom'],
  'castanet': ['intro-finale/items-castanet', 'intro-finale/items-castanet'],
  'clove': ['intro-finale/items-clove', 'intro-finale/items-clove'],
  'control-room': ['intro-finale/items-control-room',
                   'intro-finale/items-control-room'],
  'crab': [
      'intro-finale/items-crab-1',
      ['intro-finale/items-crab-1', 'intro-finale/items-crab-2',
      'intro-finale/items-crab-3', 'intro-finale/items-crab-4',
      'intro-finale/items-crab-5', 'intro-finale/items-crab-6',
      'intro-finale/items-crab-7', 'intro-finale/items-crab-8']
  ],
  'earmuffs': ['intro-finale/items-earmuffs',
               'intro-finale/items-earmuffs'],
  'forget-me-not': ['intro-finale/items-forget-me-not',
                    'intro-finale/items-forget-me-not'],
  'frying-pan': ['intro-finale/items-frying-pan',
                 'intro-finale/items-frying-pan'],
  'gnocchi': ['intro-finale/items-gnocchi', 'intro-finale/items-gnocchi'],
  'halo': [['intro-finale/items-halo-1', 'intro-finale/items-halo-2',
            'intro-finale/items-halo-3'],
           ['intro-finale/items-halo-1', 'intro-finale/items-halo-2',
            'intro-finale/items-halo-3']],
  'hazelnut': ['intro-finale/items-hazelnut', 'intro-finale/items-hazelnut'],
  'hole': ['intro-finale/items-hole-4',
           ['intro-finale/items-hole-1', 'intro-finale/items-hole-2',
            'intro-finale/items-hole-3', 'intro-finale/items-hole-4']],
  'knife': ['intro-finale/items-knife', 'intro-finale/items-knife'],
  'knot': ['intro-finale/items-knot', 'intro-finale/items-knot'],
  'lilypads': ['intro-finale/items-lilypads', 'intro-finale/items-lilypads'],
  'nacre': [['intro-finale/items-nacre-1', 'intro-finale/items-nacre-2',
             'intro-finale/items-nacre-3'],
            ['intro-finale/items-nacre-1', 'intro-finale/items-nacre-2',
             'intro-finale/items-nacre-3']],
  'narcissus': ['intro-finale/items-narcissus',
                'intro-finale/items-narcissus'],
  'necesere': ['intro-finale/items-necesere', 'intro-finale/items-necesere'],
  'needle': ['intro-finale/items-needle-thread', 'intro-finale/items-needle'],
  'neutron': [
      ['intro-finale/items-neutron-1', 'intro-finale/items-neutron-2',
       'intro-finale/items-neutron-3', 'intro-finale/items-neutron-4',
       'intro-finale/items-neutron-5', 'intro-finale/items-neutron-6',
       'intro-finale/items-neutron-7', 'intro-finale/items-neutron-8',
       'intro-finale/items-neutron-9', 'intro-finale/items-neutron-10',
       'intro-finale/items-neutron-11', 'intro-finale/items-neutron-12'],
      'intro-finale/items-neutron-dropped'
  ],
  'noodles': ['intro-finale/items-noodles', 'intro-finale/items-noodles'],
  'nose': ['intro-finale/items-nose', 'intro-finale/items-nose'],
  'pebbles': ['intro-finale/items-pebbles', 'intro-finale/items-pebbles'],
  'pinstripe': ['intro-finale/items-pinstripe',
                'intro-finale/items-pinstripe'],
  'potion': ['intro-finale/items-potion', 'intro-finale/items-potion'],
  'rivet': ['intro-finale/items-rivet', 'intro-finale/items-rivet'],
  'rolling-pin': ['intro-finale/items-rolling-pin',
                  'intro-finale/items-rolling-pin'],
  'scissors': ['intro-finale/items-scissors', 'intro-finale/items-scissors'],
  'shower': [['intro-finale/items-shower-1', 'intro-finale/items-shower-2',
              'intro-finale/items-shower-3', 'intro-finale/items-shower-4',
              'intro-finale/items-shower-5', 'intro-finale/items-shower-6',
              'intro-finale/items-shower-7', 'intro-finale/items-shower-8',
              'intro-finale/items-shower-9', 'intro-finale/items-shower-10',
              'intro-finale/items-shower-11', 'intro-finale/items-shower-12',
              'intro-finale/items-shower-13', 'intro-finale/items-shower-14',
              'intro-finale/items-shower-15', 'intro-finale/items-shower-16',
              'intro-finale/items-shower-17', 'intro-finale/items-shower-18',
              'intro-finale/items-shower-19', 'intro-finale/items-shower-20'],
             'intro-finale/items-shower'],
  'spinach': ['intro-finale/items-spinach', 'intro-finale/items-spinach'],
  'thimble': ['intro-finale/items-thimble', 'intro-finale/items-thimble'],
  'thread-thimble': ['intro-finale/items-thread-thimble',
                     'intro-finale/items-thread-thimble'],
  'thread': ['intro-finale/items-thread', 'intro-finale/items-thread'],
  'trim': ['intro-finale/items-trim', 'intro-finale/items-trim']
};

/**
 * The N items for each language that appear randomly after you play the
 * game a couple of times. (The items during the first and sometimes second
 * gameplay are hand-picked.)
 * @const
 */
engine.COUNTRY_N_ITEMS = {
  'polish': [
    'hole', 'shower', 'control-room', 'potion', 'halo', 'earmuffs',
    'neutron', 'nose'
  ],
  'english': [
    'needle', 'halo', 'noodles', 'neutron', 'nose'
  ],
  'german': [
    'thread', 'pinstripe', 'neutron', 'noodles', 'clove'
  ],
  'russian': [
    'hole', 'forget-me-not', 'trim', 'potion', 'earmuffs', 'neutron',
    'nose', 'halo'
  ],
  'ukrainian': [
    'hole', 'scissors', 'potion', 'halo', 'earmuffs', 'neutron', 'nose',
    'narcissus'
  ],
  'italian': [
    'narcissus', 'neutron', 'castanet', 'hazelnut', 'knot'
  ],
  'french': [
    'neutron', 'nose', 'halo', 'nacre'
  ],
  'spanish': [
    'neutron', 'nose', 'knife', 'nacre', 'necesere', 'lilypads', 'crab'
  ],
  'bulgarian': [
    'thread', 'thimble', 'earmuffs', 'neutron', 'nose'
  ],
  'hungarian': [
    'broom', 'spinach', 'rolling-pin', 'frying-pan'
  ],
  'czech': [
    'thread', 'thimble', 'noodles', 'neutron', 'nose', 'gnocchi', 'rivet',
    'basket'
  ]
};

/**
 * A list of actors for Lem doodle.
 * @const
 */
engine.ACTORS = {
  /* ------------------------------------------------------------------------
   * Trurl: The protagonist.
   * ------------------------------------------------------------------------
   */
  'trurl': {
    WIDTH: 69,
    HEIGHT: 117,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +20,

    // How much time (in seconds) before Trurl starts tapping his foot.
    FOOT_TAPPING_DELAY: 12000,

    interactive: false,

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'sitting':
          this.showAnimation({
              speed: 150,
              count: 1,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['trurl/sitting-down-1', 'trurl/sitting-down-2',
                         'trurl/sitting-down-3', 'trurl/sitting-down-4',
                         'trurl/sitting']});
          break;
        case 'happy':
          this.showAnimation({
              speed: 80,
              count: 3,
              repeatFrom: 3,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              onFinish: function() {
                $a('trurl').setState({ state: 'looking-away' });
              },
              imageIds: ['trurl/happy-1', 'trurl/happy-1',
                         'trurl/happy-1', 'trurl/happy-2',
                         'trurl/happy-2', 'trurl/happy-3',
                         'trurl/happy-3', 'trurl/happy-2',
                         'trurl/happy-2', 'trurl/happy-1',
                         'trurl/happy-1']});
          break;
        case 'standing':
          this.showImage({ imageId: 'trurl/no-1',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'hi':
          this.showAnimation({
              speed: 80,
              count: 1,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              onFinish: function() {
                $a('trurl').setState({ state: 'looking-right' });
              },
              imageIds: ['trurl/hi-1', 'trurl/hi-2', 'trurl/hi-3',
                         'trurl/hi-4', 'trurl/hi-5', 'trurl/hi-6',
                         'trurl/hi-7', 'trurl/hi-8', 'trurl/hi-9',
                         'trurl/hi-10', 'trurl/hi-11', 'trurl/hi-12',
                         'trurl/hi-13', 'trurl/hi-14', 'trurl/hi-7',
                         'trurl/hi-8', 'trurl/hi-9', 'trurl/hi-10',
                         'trurl/hi-11', 'trurl/hi-12', 'trurl/hi-13',
                         'trurl/hi-14', 'trurl/hi-7', 'trurl/hi-8',
                         'trurl/hi-9', 'trurl/hi-10', 'trurl/hi-11',
                         'trurl/hi-12', 'trurl/hi-13', 'trurl/hi-14',
                         'trurl/hi-7', 'trurl/hi-6', 'trurl/hi-5',
                         'trurl/hi-4', 'trurl/hi-3', 'trurl/hi-2',
                         'trurl/hi-1']});
          break;
        case 'looking-right':
          this.showImage({ imageId: 'trurl/looking-right',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'looking-away':
          if ((engine.curSceneId == 'level-2') ||
              (engine.curSceneId == 'level-2-ending') ||
              (engine.curSceneId == 'intermission-level-1-level-2')) {
            this.subState = 'looking-away-left';
            this.showImage({ imageId: 'trurl/looking-away-left',
                align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          } else {
            // Look in different direction depending on where the cannon is.
            if ((engine.curSceneId == 'level-3') &&
                ($a('babybot-cannon').rect.x < 80)) {
              this.subState = 'looking-up';
              this.showImage({ imageId: 'trurl/looking-up',
                  align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
            } else {
              this.subState = 'looking-away-right';
              this.showImage({ imageId: 'trurl/looking-away-right',
                  align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
              this.scheduleFootTapping();
            }
          }
          this.scheduleFootTapping();
          break;
        case 'looking-up':
          this.showImage({ imageId: 'trurl/looking-up',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'user':
          this.showImage({ imageId: 'trurl/no-1',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'waiting-user':
          this.showImage({ imageId: 'trurl/waiting-user',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'negatory':
          this.showAnimation({
              speed: 80,
              count: 1,
              onFinish: params.onFinish,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: [
                  'trurl/no-1', 'trurl/no-1', 'trurl/no-1', 'trurl/no-2',
                  'trurl/no-2', 'trurl/no-3', 'trurl/no-3', 'trurl/no-4',
                  'trurl/no-4', 'trurl/no-5', 'trurl/no-5', 'trurl/no-5',
                  'trurl/no-5', 'trurl/no-6', 'trurl/no-6', 'trurl/no-7',
                  'trurl/no-7', 'trurl/no-7', 'trurl/no-8', 'trurl/no-8',
                  'trurl/no-9', 'trurl/no-10', 'trurl/no-10', 'trurl/no-11',
                  'trurl/no-11', 'trurl/no-11', 'trurl/no-12', 'trurl/no-12',
                  'trurl/no-13', 'trurl/no-6', 'trurl/no-6', 'trurl/no-7',
                  'trurl/no-7', 'trurl/no-7', 'trurl/no-8', 'trurl/no-8',
                  'trurl/no-9', 'trurl/no-10', 'trurl/no-10', 'trurl/no-11',
                  'trurl/no-11', 'trurl/no-11', 'trurl/no-12', 'trurl/no-12',
                  'trurl/no-13', 'trurl/no-2', 'trurl/no-2']});
          break;
        case 'walking':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['trurl/walk-1', 'trurl/walk-2', 'trurl/walk-3',
                         'trurl/walk-4', 'trurl/walk-5', 'trurl/walk-6',
                         'trurl/walk-7', 'trurl/walk-8']});
          break;
        case 'running':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['trurl/run-1', 'trurl/run-2', 'trurl/run-3',
                         'trurl/run-4', 'trurl/run-5']});
          break;
        case 'standing-up-to-walking':
          this.showAnimation({
              speed: 150,
              count: 1,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              onFinish: function() {
                $a('trurl').setState({ state: 'walking' });
              },
              imageIds: ['trurl/sitting-down-4', 'trurl/sitting-down-3',
                         'trurl/sitting-down-2', 'trurl/sitting-down-1',
                         'trurl/looking-right', 'trurl/looking-right']});
          break;
        case 'looking-up-to-walking':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              count: 1,
              onFinish: function() {
                $a('trurl').setState({ state: 'walking' });
              },
              imageIds: ['trurl/looking-away-right', 'trurl/looking-away-right',
                         'trurl/looking-right', 'trurl/looking-right']});
          break;
      }
    },

    /**
     * Change Trurl’s posture depending on whether we’re expecting the user
     * to do something at this point (Trurl is looking at the user when
     * interaction is needed).
     * @param {Object} params
     * - {boolean} .interactive Whether the stage can be interacted with or not.
     */
    setInteractive: function(params) {
      if (params.interactive != this.interactive) {

        this.interactive = params.interactive;

        if (this.interactive) {
          this.setState({ state: 'user' });

          this.setClickable({ clickable: true });
        } else {
          this.setState({ state: 'looking-away' });

          this.setClickable({ clickable: false });
        }
      }
    },

    /**
     * Clicking on Trurl shows a hint (if possible).
     */
    onClick: function() {
      $a('hints').show({ source: 'trurl' });
    },

    /**
     * In twelve seconds, Trurl will start tapping the foot – unless he
     * changes state before then.
     */
    scheduleFootTapping: function() {
      if (this.footTappingEvent) {
        engine.removeEvent({ event: this.footTappingEvent });
      }

      this.footTappingEvent = engine.addEvent({
        startTime: this.FOOT_TAPPING_DELAY,
        onEvent: function() { $a('trurl').tapFoot(); }
      });
    },

    /**
     * Start tapping the foot if waiting for something to happen (typically,
     * the bird).
     */
    tapFoot: function() {
      // No tapping in the finale – too much drama!
      if ((this.state != 'looking-away') ||
          (engine.curSceneId == 'finale')) {
        return;
      }

      switch (this.subState) {
        case 'looking-away-left':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['trurl/looking-away-left-tap-1',
                         'trurl/looking-away-left-tap-1',
                         'trurl/looking-away-left-tap-1',
                         'trurl/looking-away-left-tap-1',
                         'trurl/looking-away-left-tap-1',
                         'trurl/looking-away-left-tap-2',
                         'trurl/looking-away-left-tap-3',
                         'trurl/looking-away-left-tap-4',
                         'trurl/looking-away-left-tap-4',
                         'trurl/looking-away-left-tap-4']});
          break;
        case 'looking-away-right':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['trurl/looking-away-right-tap-1',
                         'trurl/looking-away-right-tap-1',
                         'trurl/looking-away-right-tap-1',
                         'trurl/looking-away-right-tap-1',
                         'trurl/looking-away-right-tap-1',
                         'trurl/looking-away-right-tap-2',
                         'trurl/looking-away-right-tap-3',
                         'trurl/looking-away-right-tap-4',
                         'trurl/looking-away-right-tap-4',
                         'trurl/looking-away-right-tap-4']});
          break;
      }
    },

    /**
     * Shows an animation when the user messes up.
     * @param {Object} params
     * - {function()} onFinish The function to call after Trurl stops shaking
     *                         his head.
     */
    negatory: function(params) {
      var preNegatoryState = this.state;

      $a('trurl').setState({
          state: 'negatory',
          onFinish: function() {
            $a('trurl').setState({ state: preNegatoryState });
            if (params && params.onFinish) {
              params.onFinish();
            }
          }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Klapaucjusz: Trurl’s frenemy that joins him during the finale.
   * ------------------------------------------------------------------------
   */
  'klapaucjusz': {
    WIDTH: 88,
    HEIGHT: 136,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +3,

    interactive: false,

    init: function() {
      this.setState({ state: 'standing-left' });
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'standing':
          this.showImage({ imageId: 'klapaucjusz/standing',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'standing-left':
          this.showImage({ imageId: 'klapaucjusz/standing-left',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'standing-back':
          this.showImage({ imageId: 'klapaucjusz/standing-back',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'surprise':
          this.showImage({ imageId: 'klapaucjusz/surprise',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'looking-trurl':
          this.showImage({ imageId: 'klapaucjusz/looking-trurl',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'looking-away':
          this.showImage({ imageId: 'klapaucjusz/looking-away-left',
              align: [engine.ALIGN_CENTER, engine.ALIGN_END] });
          break;
        case 'hi':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              count: 2,
              onFinish: function() {
                $a('klapaucjusz').setState({ state: 'looking-trurl' });
              },
              imageIds: ['klapaucjusz/hi-1', 'klapaucjusz/hi-2',
                         'klapaucjusz/hi-3', 'klapaucjusz/hi-4',
                         'klapaucjusz/hi-5', 'klapaucjusz/hi-6',
                         'klapaucjusz/hi-7', 'klapaucjusz/hi-8',
                         'klapaucjusz/hi-9', 'klapaucjusz/hi-10']});
          break;
        case 'running':
          this.showAnimation({
              speed: 150,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['klapaucjusz/run-1', 'klapaucjusz/run-2',
                         'klapaucjusz/run-3', 'klapaucjusz/run-4',
                         'klapaucjusz/run-5', 'klapaucjusz/run-6',
                         'klapaucjusz/run-7', 'klapaucjusz/run-8']});
          break;
      }
    },

    /**
     * Change Klapaucjusz’s posture depending on whether we’re expecting the
     * user to do something at this point (he is looking at the user when
     * interaction is needed).
     * @param {Object} params
     * - {boolean} .interactive Whether the stage can be interacted with or not.
     */
    setInteractive: function(params) {
      if (params.interactive != this.interactive) {

        this.interactive = params.interactive;

        if (this.interactive) {
          this.setState({ state: 'standing' });
          this.setClickable({ clickable: true });
        } else {
          this.setState({ state: 'looking-away' });
          this.setClickable({ clickable: false });
        }
      }
    },

    /**
     * Klapaucjusz shows a hint when clicked.
     */
    onClick: function() {
      $a('hints').show({ source: 'klapaucjusz' });
    }
  },

  /* ------------------------------------------------------------------------
   * Cat: Klapaucjusz’s companion.
   * ------------------------------------------------------------------------
   */
  'cat': {
    WIDTH: 69,
    HEIGHT: 51,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +2,

    INNER_RECTS: {
      'sit-tail': { x: 10, y: 0, width: 48, height: 51 },
      'sit-body': { x: 10, y: 0, width: 48, height: 51 },
      'sit-head': { x: 10, y: 0, width: 48, height: 51 }
    },

    MIN_MOVEMENT_DELAY: 200,
    MAX_MOVEMENT_DELAY: 2500,

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'standing':
          this.clear({ innerId: 'sit-body' });
          this.clear({ innerId: 'sit-head' });
          this.clear({ innerId: 'sit-tail' });

          this.showImage({ imageId: 'cat/stand' });
          break;
        case 'walking':
          this.clear({ innerId: 'sit-body' });
          this.clear({ innerId: 'sit-head' });
          this.clear({ innerId: 'sit-tail' });

          this.showAnimation({
              speed: 120,
              align: [engine.ALIGN_CENTER, engine.ALIGN_END],
              imageIds: ['cat/walk-1', 'cat/walk-2', 'cat/walk-3',
                         'cat/walk-4', 'cat/walk-5', 'cat/walk-6',
                         'cat/walk-7', 'cat/walk-8']});
          break;
        case 'sitting':
          this.clear();

          this.showImage({ innerId: 'sit-body', imageId: 'cat/sit-body' });
          this.showImage({ innerId: 'sit-head', imageId: 'cat/sit-head-1' });
          this.showImage({ innerId: 'sit-tail', imageId: 'cat/sit-tail-1' });

          this.scheduleHeadMovement();
          this.scheduleTailMovement();
          break;
      }
    },

    /**
     * Makes the cat so that it can be interacted with or not. (The cat can
     * be clicked to make it go away.)
     * @param {Object} params
     * - {boolean} .interactive Whether the cat can be interacted with or not.
     */
    setInteractive: function(params) {
      if (params.interactive != this.interactive) {
        this.interactive = params.interactive;

        if (this.interactive) {
          this.setClickable({ clickable: true });
        } else {
          this.setClickable({ clickable: false });
        }
      }
    },

    /**
     * If you click on a cat, it walks away earlier.
     */
    onClick: function() {
      $a('cat').walkAway();
    },

    /**
     * The cat will move its head in a (randomized) while.
     */
    scheduleHeadMovement: function() {
      engine.addEvent({
        startTime: engine.rangeRand({
            min: this.MIN_MOVEMENT_DELAY,
            max: this.MAX_MOVEMENT_DELAY
        }),
        onEvent: function() { $a('cat').moveHead(); }
      });
    },

    /**
     * The cat will move its tail in a (randomized) while.
     */
    scheduleTailMovement: function() {
      engine.addEvent({
        startTime: engine.rangeRand({
            min: this.MIN_MOVEMENT_DELAY,
            max: this.MAX_MOVEMENT_DELAY
        }),
        onEvent: function() { $a('cat').moveTail(); }
      });
    },

    /**
     * Move the cat’s tail if the cat is sitting.
     */
    moveTail: function() {
      if (this.state != 'sitting') {
        return;
      }

      this.showAnimation({
          innerId: 'sit-tail',
          speed: engine.rangeRand({ min: 250, max: 450 }),
          count: 2,
          alternate: true,
          onFinish: function() {
            $a('cat').scheduleTailMovement();
          },
          imageIds: ['cat/sit-tail-1', 'cat/sit-tail-2',
                     'cat/sit-tail-3', 'cat/sit-tail-4',
                     'cat/sit-tail-5', 'cat/sit-tail-6']
      });
    },

    /**
     * Move the cat’s head (ears + whiskers) if the cat is sitting.
     * This above is the kind of function description I never thought I’d
     * write.
     */
    moveHead: function() {
      if (this.state != 'sitting') {
        return;
      }

      this.showAnimation({
          innerId: 'sit-head',
          speed: engine.rangeRand({ min: 150, max: 250 }),
          count: 1,
          onFinish: function() {
            $a('cat').scheduleHeadMovement();
          },
          imageIds: ['cat/sit-head-1', 'cat/sit-head-2',
                     'cat/sit-head-3', 'cat/sit-head-4',
                     'cat/sit-head-5', 'cat/sit-head-6',
                     'cat/sit-head-7', 'cat/sit-head-8',
                     'cat/sit-head-9']
      });
    },

    /**
     * The cat walks away in a boring way cats typically walk away.
     */
    walkAway: function() {
      $a('cat').setState({ state: 'standing' });
      $a('cat').setInteractive({ interactive: false });

      engine.addEvents({
        450: function() {
          $a('cat').setState({ state: 'walking' });
          $a('cat').addTransition({
              duration: engine.rangeRand({ min: 5000, max: 8000 }),
              easing: engine.linear,
              properties: { relX: 100 } });
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * A smaller thought bubble with hints that explain what to do if you’re
   * stack – it’s attached to Trurl and, at the end, Klapaucjusz.
   * ------------------------------------------------------------------------
   */
  'hints': {
    WIDTH: 132,
    HEIGHT: 201,
    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECTION: -1,

    // Hints need to be “conscious” even when invisible so they can show
    // themselves after inactivity.
    TICKS_WHEN_INVISIBLE: true,

    INNER_RECTS: {
      'bubble': { x: 0, y: 0, width: 132, height: 201 },

      'finale': { x: 20, y: -16, width: 91, height: 147 },
      'finale-bk': { x: 20, y: -16, width: 91, height: 147 },

      'babybot': { x: 40, y: 22, width: 55, height: 103 },

      'demonbot-wave': { x: 0, y: 0, width: 73, height: 55 },
      'demonbot-target-wave': { x: 0, y: 0, width: 75, height: 54 },

      'numbot-button': { x: 65, y: 60, width: 42, height: 39 },
      'numbot-mouse-pointer': { x: 0, y: 0, width: 50, height: 31 },
      'numbot-formula': { x: 24, y: 31, width: 76, height: 21 }
    },

    // How much time needs to pass before any meaningful interaction to
    // show a hint automatically.
    INACTIVITY_AUTO_SHOW_DELAY: 9000,

    // Whether the hint is currently available (= interactive level).
    available: false,
    // Whether the hint is currently showing or hiding.
    transitioning: false,
    // If you click to hide the hint, wait for it to show before you can
    // hide it again.
    hideAsSoonAsPossible: false,
    // For auto-showing, don’t repeat the same hint twice. Here we remember
    // what we showed already.
    variantsAlreadyShown: {},
    // Keeping track of failed attempts at solving various levels, so we
    // know when to show the hint.
    failedAttempts: 0,

    /*
     * Clear the interior of the hint bubble so it’s ready for showing
     * something else.
     */
    clearContents: function() {
      this.clear({ innerId: 'babybot' });

      this.clear({ innerId: 'finale' });
      this.clear({ innerId: 'finale-bk' });

      this.clear({ innerId: 'demonbot-wave' });
      this.clear({ innerId: 'demonbot-target-wave' });

      this.clear({ innerId: 'numbot-mouse-pointer' });
      this.clear({ innerId: 'numbot-button' });
      this.clear({ innerId: 'numbot-formula' });
    },

    /**
     * Hide the hint if the user clicks on it.
     */
    onClick: function() {
      $a('hints').hide();
    },

    /**
     * With every new scene, we figure out whether hints are applicable for
     * it.
     */
    onSceneEnter: function() {
      this.available = engine.curScene.interactive;

      this.resetFailedAttempts();
    },

    /**
     * Reset the number of failed attempts. This happens on every scene,
     * and also sub-scenes in some scenes.
     */
    resetFailedAttempts: function() {
      this.failedAttempts = 0;
    },

    /**
     * This is invoked whenever the user presses the big button at a wrong
     * time (for example, 2 + 2 = 5, or the baby misses the planet). We
     * show the hint after some, but not all failed attempts.
     */
    failedAttempt: function() {
      this.failedAttempts++;

      // Show a hint every first, fourth, 7th attempt… except on level 3,
      // where we don’t want to give too much away, so we show second,
      // fifth, 8th, etc.
      if (engine.curSceneId == 'level-3') {
        var correction = 1;
      } else {
        var correction = 2;
      }

      if (!engine.modulo({ val: this.failedAttempts + correction, mod: 3 })) {
        this.show();
      }
    },

    /**
     * Show the hint automatically after enough time has passed (and some
     * other conditions are met).
     */
    tick: function() {
      if (!this.transitioning &&
          !this.rect.visible &&
          this.available &&
          engine.interactive &&
          !this.variantsAlreadyShown[engine.curSceneId] &&
          (engine.curGameTime -
           engine.lastMeaningfulInteractionTime >
           this.INACTIVITY_AUTO_SHOW_DELAY)) {
        this.show();
      }
    },

    /**
     * Hide the hint bubble in an animated way.
     */
    hide: function() {
      if (!this.rect.visible) {
        return;
      }

      if (this.transitioning) {
        this.hideAsSoonAsPossible = true;
        return;
      }

      this.hideAsSoonAsPossible = false;
      this.transitioning = true;

      $a('hints').showAnimation({
          innerId: 'bubble',
          speed: 50,
          count: 1,
          onFinish: function() {
            $a('hints').transitioning = false;

            $a('hints').setVisible({ visible: false });
          },
          imageIds: ['hints/bubble-7', 'hints/bubble-6', 'hints/bubble-5',
                     'hints/bubble-4', 'hints/bubble-3', 'hints/bubble-2',
                     'hints/bubble-1']});

      // Hide the contents a touch later, so it will seem like the bubble
      // crops it as it disappears.
      engine.addEvents({
        150: function() {
          $a('hints').clearContents();
        }
      })
    },

    /**
     * Show the hint bubble.
     * @param {Object} params
     * - {string} .source Whether it comes from 'trurl', 'klapaucjusz'
     *                    or leave empty (= automatic)
     */
    show: function(params) {
      if (this.transitioning || this.rect.visible || !this.available) {
        return;
      }

      this.transitioning = true;
      this.hideAsSoonAsPossible = false;

      if (params && params.source) {
        var source = params.source;
      } else {
        // In the finale, it’s Klapaucjusz that delivers the hint if it’s
        // an automatic hint.
        if (engine.curSceneId == 'intermission-before-finale') {
          var source = 'klapaucjusz';
        } else {
          var source = 'trurl';
        }
      }

      engine.addEvents({
        // Start showing the bubble.
        0: function() {
          if (source == 'klapaucjusz') {
            // Klapaucjusz showing attitude.
            $a('klapaucjusz').setState({ state: 'standing-left' });

            var x = $a('klapaucjusz').rect.x - 25;
            var y = $a('klapaucjusz').rect.y - 200;
          } else {
            // Trurl showing attitude.
            if ($a('trurl').state == 'user') {
              $a('trurl').setState({ state: 'waiting-user' });
            }

            var x = $a('trurl').rect.x - 25;
            var y = $a('trurl').rect.y - 200;
          }

          // Right align the bubble if it sticks out.
          if (x + $a('hints').rect.width - 20 > engine.INITIAL_WIDTH) {
            x = engine.INITIAL_WIDTH - $a('hints').rect.width + 20;
          }

          $a('hints').transform({ x: x, y: y });
          $a('hints').clearContents();
          $a('hints').setVisible({ visible: true });
          $a('hints').showAnimation({
              innerId: 'bubble',
              speed: 120,
              repeatFrom: 5,
              imageIds: ['hints/bubble-1', 'hints/bubble-2', 'hints/bubble-3',
                         'hints/bubble-4', 'hints/bubble-5', 'hints/bubble-6',
                         'hints/bubble-6', 'hints/bubble-7', 'hints/bubble-7',
                         'hints/bubble-8', 'hints/bubble-8']});
        },
        // Show the contents of the bubble.
        650: function() {
          $a('hints').setClickable({ clickable: true });
          $a('hints').transitioning = false;

          if ($a('hints').hideAsSoonAsPossible) {
            $a('hints').hide();
          }

          switch (engine.curSceneId) {
            case 'level-1':
              var formula = $a('numbot').formula;

              $a('hints').showAnimation({
                innerId: 'numbot-formula',
                speed: 150,
                count: Infinity,
                imageIds: ['hints/numbot-formula-' + formula + '-1',
                           'hints/numbot-formula-' + formula + '-2',
                           'hints/numbot-formula-' + formula + '-3']
              });

              $a('hints').showAnimation({
                innerId: 'numbot-button',
                speed: 150,
                count: 3,
                imageIds: ['hints/numbot-button-1', 'hints/numbot-button-1',
                           'hints/numbot-button-1', 'hints/numbot-button-1',
                           'hints/numbot-button-2', 'hints/numbot-button-2',
                           'hints/numbot-button-3', 'hints/numbot-button-3',
                           'hints/numbot-button-2', 'hints/numbot-button-1',
                           'hints/numbot-button-1', 'hints/numbot-button-1',
                           'hints/numbot-button-1']});

              $a('hints').transform({ innerId: 'numbot-mouse-pointer',
                                     x: 30, y: 79 });
              $a('hints').showAnimation({
               innerId: 'numbot-mouse-pointer',
               speed: 150,
               count: Infinity,
               imageIds: ['hints/numbot-mouse-pointer-1',
                          'hints/numbot-mouse-pointer-2',
                          'hints/numbot-mouse-pointer-3']
              });
              $a('hints').addTransition({
                 innerId: 'numbot-mouse-pointer', count: Infinity,
                 duration: 1000,
                 count: 6,
                 onFinish: function() {
                   $a('hints').hide();
                 },
                 alternate: true,
                 properties: { relX: 10, relY: -3 }
              });
              break;
            case 'level-2':
              $a('hints').transform({ innerId: 'demonbot-wave',
                                      x: 50, y: 60 });
              $a('hints').showAnimation({
                innerId: 'demonbot-wave',
                speed: 150,
                count: Infinity,
                imageIds: ['hints/demonbot-wave-1',
                           'hints/demonbot-wave-2',
                           'hints/demonbot-wave-3']
              });

              $a('hints').transform({ innerId: 'demonbot-target-wave',
                                      x: 20, y: 20 });
              $a('hints').showAnimation({
                innerId: 'demonbot-target-wave',
                speed: 150,
                count: Infinity,
                imageIds: ['hints/demonbot-target-wave-1',
                           'hints/demonbot-target-wave-2',
                           'hints/demonbot-target-wave-3']
              });

              $a('hints').addTransition({
                  innerId: 'demonbot-wave', count: Infinity,
                  duration: 150, properties: { shiver: 1 }
              });

              $a('hints').addTransition({
                innerId: 'demonbot-wave',
                duration: 1200,
                alternate: true,
                count: 6,
                properties: { relX: -15, relY: -20 }
              });

              $a('hints').addTransition({
                innerId: 'demonbot-target-wave',
                duration: 1200,
                alternate: true,
                count: 6,
                onFinish: function() {
                  $a('hints').hide();
                },
                properties: { relX: 15, relY: 20 }
              });
              break;
            case 'level-3':
              $a('hints').addTransition({
                  innerId: 'babybot', count: Infinity,
                  duration: 150, properties: { shiver: 1 }
              });

              $a('hints').showAnimation({
                  innerId: 'babybot',
                  speed: 150,
                  count: 3,
                  onFinish: function() {
                    $a('hints').hide();
                  },
                  imageIds: ['hints/babybot-1', 'hints/babybot-1',
                             'hints/babybot-2', 'hints/babybot-3',
                             'hints/babybot-4', 'hints/babybot-5',
                             'hints/babybot-6', 'hints/babybot-7',
                             'hints/babybot-8', 'hints/babybot-9',
                             'hints/babybot-10', 'hints/babybot-11',
                             'hints/babybot-12', 'hints/babybot-13']});
              break;
            case 'intermission-before-finale':
              $a('hints').showImage({ innerId: 'finale-bk',
                                      imageId: 'hints/finale-bk' });

              $a('hints').showAnimation({
                  innerId: 'finale',
                  speed: 150,
                  count: 3,
                  onFinish: function() {
                    $a('hints').hide();
                  },
                  imageIds: ['hints/finale-1', 'hints/finale-2',
                             'hints/finale-3', 'hints/finale-4',
                             'hints/finale-5', 'hints/finale-6',
                             'hints/finale-7', 'hints/finale-8',
                             'hints/finale-9', 'hints/finale-10']});
              break;
          }

          $a('hints').variantsAlreadyShown[engine.curSceneId] = true;
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * A bigger thought cloud that belongs to Trurl during intermissions.
   * It explains his mission and the items he needs to find.
   * ------------------------------------------------------------------------
   */
  'thought-cloud': {
    WIDTH: 330,
    HEIGHT: 393,
    PLANE: engine.PLANE_THOUGHT_CLOUD,

    INNER_RECTS: {
      'body': { x: 0, y: 0, width: 330, height: 393 },
      'disassemble': { x: 50, y: 40, width: 237, height: 287 },
      'connectors': { x: 107, y: 197, width: 112, height: 61 },
      'eyes': { x: 88, y: 48, width: 55, height: 73 },
      'head': { x: 205, y: 118, width: 66, height: 49 }
    },

    // Blinking time (in milliseconds) for the item we’re about to capture.
    ITEM_BLINKING_SPEED: 300,
    // Stage from 1 (initial disassemble animation + first item), through 2
    // and 3 (subsequent items) to 4 (all the items are here + assemble
    // animation).
    stage: 0,

    /**
     * Start showing the thought cloud, and show the assemble or disassemble
     * animation if necessary.
     */
    show: function() {
      $a('thought-cloud').stage++;

      engine.addEvents({
        0: function() {
          $a('thought-cloud').clear({ innerId: 'connectors' });
          $a('thought-cloud').clear({ innerId: 'head' });
          $a('thought-cloud').clear({ innerId: 'eyes' });
          $a('thought-cloud').clear();

          $a('thought-cloud').setVisible({ visible: true });
          $a('thought-cloud').showAnimation({
              innerId: 'body',
              speed: 200,
              repeatFrom: 6,
              imageIds: ['trurl-thought-cloud/opening-1',
                         'trurl-thought-cloud/opening-2',
                         'trurl-thought-cloud/opening-3',
                         'trurl-thought-cloud/opening-4',
                         'trurl-thought-cloud/opening-5',
                         'trurl-thought-cloud/opening-6',
                         'trurl-thought-cloud/opening-7',
                         'trurl-thought-cloud/opening-8',
                         'trurl-thought-cloud/opening-9']});
        },
        1500: function() {
          switch ($a('thought-cloud').stage) {
            case 1:
              $a('thought-cloud').addTransition({
                  innerId: 'disassemble', count: Infinity,
                  duration: 200, properties: { shiver: 1 }
              });

              $a('thought-cloud').showAnimation({
                  innerId: 'disassemble',
                  speed: 250,
                  count: 1,
                  onFinish: function() {
                    $a('thought-cloud').finishOpening();
                  },
                  imageIds: ['trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-1',
                             'trurl-thought-cloud/disassemble-2',
                             'trurl-thought-cloud/disassemble-3',
                             'trurl-thought-cloud/disassemble-4',
                             'trurl-thought-cloud/disassemble-5',
                             'trurl-thought-cloud/disassemble-6',
                             'trurl-thought-cloud/disassemble-7',
                             'trurl-thought-cloud/disassemble-8',
                             'trurl-thought-cloud/disassemble-9',
                             'trurl-thought-cloud/disassemble-10']});

              break;
            case 4:
              $a('thought-cloud').showAnimation({
                  innerId: 'disassemble',
                  speed: 100,
                  count: 1,
                  onFinish: function() {
                    engine.addEvents({
                      2000: function() {
                        $a('thought-cloud').setVisible({ visible: false });
                      }
                    });
                  },
                  imageIds: ['trurl-thought-cloud/disassemble-10',
                             'trurl-thought-cloud/disassemble-9',
                             'trurl-thought-cloud/disassemble-8',
                             'trurl-thought-cloud/disassemble-7',
                             'trurl-thought-cloud/disassemble-6',
                             'trurl-thought-cloud/disassemble-5',
                             'trurl-thought-cloud/disassemble-4',
                             'trurl-thought-cloud/disassemble-3',
                             'trurl-thought-cloud/disassemble-2',
                             'trurl-thought-cloud/disassemble-1']});
              break;
            default:
              $a('thought-cloud').finishOpening();
              break;
            }
        }
      });
    },

    /**
     * Finish showing the thought cloud with the blinking item animation
     * if applicable.
     */
    finishOpening: function() {
      engine.addEvents({
        750: function() {
          $a('thought-cloud').clear({ innerId: 'disassemble' });

          if ($a('thought-cloud').stage >= 2) {
            $a('thought-cloud').showImage({
              innerId: 'connectors',
              imageId: 'trurl-thought-cloud/connectors'
            });
          } else {
            $a('thought-cloud').showImage({
              innerId: 'connectors',
              imageId: 'trurl-thought-cloud/connectors-hollow'
            });
          }

          if ($a('thought-cloud').stage >= 3) {
            $a('thought-cloud').showImage({
              innerId: 'eyes', imageId: 'trurl-thought-cloud/eyes'
            });
          } else {
            $a('thought-cloud').showImage({
              innerId: 'eyes', imageId: 'trurl-thought-cloud/eyes-hollow'
            });
          }

          if ($a('thought-cloud').stage == 4) {
            $a('thought-cloud').showImage({
              innerId: 'head', imageId: 'trurl-thought-cloud/head'
            });
          } else {
            $a('thought-cloud').showImage({
              innerId: 'head', imageId: 'trurl-thought-cloud/head-hollow'
            });
          }

          $a('thought-cloud').addTransition({
              innerId: 'connectors', count: Infinity,
              duration: 200, properties: { shiver: 1 }
          });
          $a('thought-cloud').addTransition({
              innerId: 'eyes', count: Infinity,
              duration: 200, properties: { shiver: 1 }
          });
          $a('thought-cloud').addTransition({
              innerId: 'head', count: Infinity,
              duration: 200, properties: { shiver: 1 }
          });
        },
        1250: function() {
          switch ($a('thought-cloud').stage) {
            case 1:
              $a('thought-cloud').showAnimation({
                  innerId: 'connectors',
                  speed: $a('thought-cloud').ITEM_BLINKING_SPEED,
                  imageIds: ['trurl-thought-cloud/connectors',
                             'trurl-thought-cloud/connectors-hollow']
              });
              break;
            case 2:
              $a('thought-cloud').showAnimation({
                innerId: 'eyes',
                speed: $a('thought-cloud').ITEM_BLINKING_SPEED,
                imageIds: ['trurl-thought-cloud/eyes',
                           'trurl-thought-cloud/eyes-hollow']
              });
              break;
            case 3:
              $a('thought-cloud').showAnimation({
                innerId: 'head',
                speed: $a('thought-cloud').ITEM_BLINKING_SPEED,
                imageIds: ['trurl-thought-cloud/head',
                           'trurl-thought-cloud/head-hollow']
              });
              break;
          }
        },
        3250: function() {
          $a('thought-cloud').setVisible({ visible: false });
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Bird: Trurl’s companion/carrier.
   * ------------------------------------------------------------------------
   */
  'bird': {
    WIDTH: 25,
    HEIGHT: 40,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +2,
    NEVER_AUTO_HIDE: true,

    INNER_RECTS: {
      'left-wing': { x: 0, y: 10, width: 8, height: 19 },
      'right-wing': { x: 17, y: 10, width: 8, height: 19 },
      'body': { x: 7, y: 10, width: 11, height: 27 },
      'eyes': { x: 8, y: 13, width: 8, height: 4 },
      'antennae': { x: 4, y: 3, width: 15, height: 8 }
    },

    // Gravity in normal circumstances.
    GRAVITY: 450,
    // Gravity when the bird is carrying items.
    CARRYING_GRAVITY: 810,

    // Acceleration and maximum speed when the bird is flying around.
    ACCEL_FLYING_X: 6,
    ACCEL_FLYING_Y: 6,
    MAX_SPEED_FLYING_Y: 75,
    MAX_SPEED_FLYING_X: 45,

    // Acceleration and maximum speed when the bird is close to the landing
    // point.
    ACCEL_LANDING_X: 3,
    ACCEL_LANDING_Y: 6,
    MAX_SPEED_LANDING_Y: 37.5,
    MAX_SPEED_LANDING_X: 22.5,

    // The minimum horizontal distance necessary for the bird to consider
    // changing horizontal direction. (So the bird doesn’t just zero in
    // horizontally and then fly upwards or downwards.)
    HOR_DIST: 30,

    // Distance from the target point within which the bird slows down from
    // regular acceleration and max speed to landing versions of those.
    TARGET_ZONE_DIST: 50,
    // The minimum distance from the landing point necessary for the bird to
    // actually stop (in other words, the landing precision of the bird).
    LANDED_DIST: 5,
    // The minimum speed necessary for the bird to land.
    LANDED_SPEED_X: 45,
    LANDED_SPEED_Y: 90,

    // Default drop-off point for items unless specified otherwise.
    DEFAULT_DROPOFF_POINT: { x: 25, y: 525 },

    // Picking point coordinates when carrying objects.
    OLD_PARTS_X: 5,
    OLD_PARTS_Y: -16,
    NEW_PARTS_X: 5,
    NEW_PARTS_Y: -16,
    START_BUTTON_X: 5,
    START_BUTTON_Y: -30,

    // If the bird goes up, the distance between its legs and the item
    // increases a bit, and vice versa. Like anyone’s ever going to notice
    // that!
    GRAVITY_CORRECTION: .02,

    // The delay between take off command and actual take off (in
    // milliseconds). This looks nicer and gives time for the bird to
    // wiggle its antennae.
    TAKE_OFF_DELAY: 1000,

    // The safety margin around the canvas – if the bird tries to fly
    // outside of that, we stop it in its tracks.
    SAFETY_MARGIN: 150,

    // If the target is not a landing place, but a random point in the sky,
    // once in a while we will move it around so the bird’s movements are a
    // little bit more realistic. This is how many pixels we can move it
    // around by.
    TARGET_RANDOMIZATION: 25,
    // How much time (in ms) passes between the bird trying to randomize
    // its position – either slightly change the target, or find a new
    // place to land.
    RANDOMIZE_DELAY: 2000,
    // What’s the chance of it happening any given time.
    RANDOMIZE_PROBABILITY: .2,

    // How much time needs to pass as the mouse pointer stays in place
    // for the bird to consider sitting on it.
    MOUSE_POINTER_INACTIVITY_TIME: 1000,
    // And what’s the probability of this happening.
    MOUSE_POINTER_PROBABILITY: .1,

    // Current speed, current acceleration, and maximum speed.
    speedX: 0,
    speedY: 0,
    maxSpeedX: 0,
    maxSpeedY: 0,
    accelX: 0,
    accelY: 0,

    // Original target coordinates requested by whoever makes the doodle.
    targetX: 0,
    targetY: 0,
    // Randomized target coordinates if they are in the air.
    randomizedTargetX: 0,
    randomizedTargetY: 0,
    // Current target coordinates (original for land, randomized for air).
    curTargetX: 0,
    curTargetY: 0,

    // Whether a horizontal/vertical engine is powered and in which direction
    // (values –1, 0, 1).
    enginePoweredX: 0,
    enginePowererY: 0,

    // If the bird is taking off, this delay counts down to 0 before it does.
    takeOffDelay: 0,

    // Whether the bird has the (somewhat) free will to move around on its own
    // between a set of of pre-defined targets. This is allowed on the first
    // two levels.
    freeWill: false,

    // Whether the bird is trying to land, pick something up, or drop something
    // off – boolean for everything, for PickUp it’s an id of an actor
    // to pick up.
    triesToLand: false,
    triesToPickUp: null,
    triesToDrop: false,

    // Whether the bird is carrying anything right now.
    carrying: null,

    // Whether the bird is stationary (landed)
    landed: false,
    // Whether the bird is close to the target now
    targetZone: false,
    // Whether the bird was in the target zone before
    targetZonePrev: false,
    // Whether the bird is landing on the mouse pointer (this means it has
    // to change the plane to be closer to the viewer).
    landingOnMousePointer: false,

    init: function() {
      this.updateCarryingPhysics();
      this.updateTargetZonePhysics();

      this.showImage({ innerId: 'body', imageId: 'bird/body' });
      this.showImage({ innerId: 'antennae', imageId: 'bird/antennae-1' });
      this.showImage({ innerId: 'eyes', imageId: 'bird/eyes' });

      this.setState({ state: 'landed' });

      this.scheduleNextRandomizeEvent();

      this.setClickable({ clickable: true });
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'landed':
        case 'flying-unpowered':
          this.showImage({ innerId: 'left-wing',
                           imageId: 'bird/wing-l-1' });
          this.showImage({ innerId: 'right-wing',
                           imageId: 'bird/wing-r-1' });
          break;
        case 'flying-powered':
          this.showAnimation({
            innerId: 'left-wing',
            speed: this.wingAnimSpeed,
            alternate: true,
            imageIds: ['bird/wing-l-1', 'bird/wing-l-2', 'bird/wing-l-3',
                       'bird/wing-l-4', 'bird/wing-l-5', 'bird/wing-l-6']});

          this.showAnimation({
            innerId: 'right-wing',
            speed: this.wingAnimSpeed,
            alternate: true,
            imageIds: ['bird/wing-r-1', 'bird/wing-r-2', 'bird/wing-r-3',
                       'bird/wing-r-4', 'bird/wing-r-5', 'bird/wing-r-6']});


          break;
      }
    },

    /**
     * The bird always moves its antennae when clicked/tapped – on the levels
     * it’s allowed, it will also try to find a new place for itself.
     */
    onClick: function() {
      this.animateAntennae();
      if (this.freeWill) {
        this.pickRandomFreeWillTarget();
      }
    },

    /**
     * The bird leaves the doodle body and becomes a DOM element attached
     * to document.body – this means it’s free to move around the entire
     * viewport.
     */
    leaveDoodleBody: function() {
      this.transform({ plane: engine.PLANE_FRONT,
                       positionRelativeToDoodleBody: true });
      this.setAttachedToDocumentBody({ attachedToDocumentBody: true });
    },

    /**
     * The opposite of above – the bird rejoins the doodle canvas.
     */
    rejoinDoodleBody: function() {
      this.transform({ plane: engine.PLANE_CLOSE_FOREGROUND,
                       positionRelativeToDoodleBody: false });
      this.setAttachedToDocumentBody({ attachedToDocumentBody: false });
    },

    /**
     * The bird lands on the I’m Feeling Lucky button or something similar.
     */
    landOnButton: function() {
      if (engine.standalone) {
        // For a standalone version of the doodle, sit on the link
        // underneath that points back to Google Logos page.
        var el = document.getElementById('bird-perch');
      } else {
        // Variants of IFL button on various versions of Google homepage.
        var el = document.getElementById('gbqfbb');

        if (!el) {
          var els = engine.getDomElements({ tagName: 'div',
                                            className: 'jsb' });
          if (els && els[0]) {
            el = els[0].getElementsByTagName('input') &&
                 els[0].getElementsByTagName('input')[1];
          }
        }

        if (!el) {
          // iPad search button (no IFL there).
          el = document.getElementById('sblsbb');
        }

        if (!el) {
          // Old-style Opera 9.64 IFL button.
          els = engine.getDomElements({ tagName: 'span',
                                            className: 'lsbb' });

          if (els && els[1] && els[1].children) {
            el = els[1].children[0];
          }
        }
      }

      // Figure out where to sit exactly.
      if (el) {
        var pos = engine.getElPagePos({ el: el });

        this.setTarget({
            x: pos.left - engine.bodyPos.left + el.offsetWidth * 2 / 3,
            y: pos.top - engine.bodyPos.top - 27,
            land: true });
      }
    },

    /**
     * Changes whether the bird is allowed to roam around more freely or not.
     * @param {Object} params
     * - {boolean} freeWill Whether the bird has free will or not
     */
    setFreeWill: function(params) {
      if (params.freeWill != this.freeWill) {
        this.freeWill = params.freeWill;
      }
    },

    /**
     * Schedule a next time the bird will try to randomize its position
     * or find a new target to hover around or sit on.
     */
    scheduleNextRandomizeEvent: function() {
      engine.addEvent({
        startTime: this.RANDOMIZE_DELAY,
        onEvent: function() {
          $a('bird').randomize();
        }
      });
    },

    /**
     * Pick one of the pre-defined in-universe targets depending on the
     * scene.
     */
    pickRandomFreeWillTarget: function() {
      switch (engine.curSceneId) {
        case 'level-1':
          switch (engine.intRangeRand({ min: 0, max: 4 })) {
            case 0:
              // Right arm of the Numbot.
              this.setTarget({ x: 290, y: 15, land: true });
              break;
            case 1:
              // Left arm of the Numbot.
              this.setTarget({ x: 130, y: 50, land: true });
              break;
            case 2:
              // Just flying around in the upper-left corner.
              this.setTarget({ x: 40, y: 40, land: false });
              break;
            case 3:
              // Just flying around on the left side.
              this.setTarget({ x: 60, y: 240, land: false });
              break;
            case 4:
              // Sitting down next to Trurl.
              this.setTarget({ x: 85, y: 535, land: true });
              break;
          }
          break;
        case 'level-2':
          switch ($a('demonbot-ui').stage) {
            // During stage 1, the bird sits on the hair or the big eye ball.
            case 1:
              switch (engine.intRangeRand({ min: 0, max: 1 })) {
                case 0: // Hair.
                  this.setTarget({ x: 210, y: 120, land: true });
                  break;
                case 1: // Eye ball.
                  this.setTarget({ x: 140, y: 290, land: true });
                  break;
              }
              break;
            // During stage 2, the bird flies to or hovers over random places.
            case 2:
              switch (engine.intRangeRand({ min: 0, max: 3 })) {
                case 0: // In front of the Demonbot face.
                  this.setTarget({ x: 60, y: 240, land: false });
                  break;
                case 1: // Upper-left corner.
                  this.setTarget({ x: 60, y: 240, land: false });
                  break;
                case 2: // Upper-right corner.
                  this.setTarget({ x: 360, y: 20, land: false });
                  break;
                case 3:
                  // Sitting on the machine console.
                  this.setTarget({ x: 230, y: 345, land: true });
                  break;
              }
              break;
            // During stage 3, the bird hovers and is ready to pick up a
            // part. This happens elsewhere, and we don’t override it here.
          }
          break;
      }
    },

    /**
     * If the bird hovers around a target mid-air, randomize it a bit so
     * the bird’s movements are not so predictable. Also, figure out whether
     * we want to sit on a mouse pointer.
     */
    randomize: function() {
      this.randomizeTarget();

      if (this.freeWill) {
        if ((engine.curGameTime - engine.lastMouseMoveTime >
             this.MOUSE_POINTER_INACTIVITY_TIME) &&
            !engine.features.touch &&
            engine.probability({
                probability: this.MOUSE_POINTER_PROBABILITY }) &&
            ((engine.curSceneId != 'level-2') ||
             ($a('demonbot-ui').stage < 3)) &&
            (engine.curSceneId != 'level-3')) {

          var x = engine.mouseX - engine.bodyPos.left;
          var y = engine.mouseY - engine.bodyPos.top +
                  engine.bodyOffsetY;

          if ((x > 0) && (x < engine.INITIAL_WIDTH) &&
              (y > 0) && (y < engine.EXPANDED_HEIGHT)) {
            this.setTarget({ x: x - 5, y: y - 20,
                             land: true, landingOnMousePointer: true });
          }
        } else if (engine.probability({
                   probability: this.RANDOMIZE_PROBABILITY })) {
          this.pickRandomFreeWillTarget();
        }
      }

      this.scheduleNextRandomizeEvent();
    },

    /**
     * Update physics values depending on whether the bird carries
     * something or not.
     */
    updateCarryingPhysics: function() {
      if (this.carrying) {
        this.wingAnimSpeed = engine.rangeRand({ min: 8, max: 15 });
        this.gravity = this.CARRYING_GRAVITY;
      } else {
        this.wingAnimSpeed = engine.rangeRand({ min: 20, max: 30 });
        this.gravity = this.GRAVITY;
      }
    },

    /**
     * Update physics values depending on whether the bird is in the target
     * zone (close to the target) or not.
     */
    updateTargetZonePhysics: function() {
      if (this.targetZone) {
        this.maxSpeedX = this.MAX_SPEED_LANDING_X;
        this.maxSpeedY = this.MAX_SPEED_LANDING_Y;
        this.accelX = this.ACCEL_LANDING_X;
        this.accelY = this.ACCEL_LANDING_Y;

        this.distX = 0;
      } else {
        this.maxSpeedX = this.MAX_SPEED_FLYING_X;
        this.maxSpeedY = this.MAX_SPEED_FLYING_Y;
        this.accelX = this.ACCEL_FLYING_X;
        this.accelY = this.ACCEL_FLYING_Y;

        this.distX = this.HOR_DIST;
      }
    },

    /**
     * Drop the start button that’s being carried. This happens during the
     * attract mode when the user clicks on the doodle before the bird sits
     * down with the start button.
     */
    dropStartButton: function() {
      if (this.carrying == 'start-button') {
        this.carrying = null;

        $a('start-button').addTransition({
          duration: 750, easing: engine.fall,
          properties: { y: 540 } });
      } else {
        $a('start-button').setVisible({ visible: false });
      }
    },

    /**
     * Move the bird eyes left or right.
     * @param {Object} params
     * - {number} eyePosition Position of the eyes (-1, 0, or +1)
     */
    updateEyePosition: function(params) {
      this.transform({ innerId: 'eyes', x: 8 + params.eyePosition });
    },

    /**
     * Update bird’s eyes to look left, right or center depending on whether
     * the target is far away and in which direction.
     */
    updateEyes: function() {
      if (this.landed) {
        if (this.state != 'landed') {
          this.updateEyePosition({ eyePosition: 0 });
        }
      } else {
        if (this.targetZone) {
          this.updateEyePosition({ eyePosition: 0 });
        } else if (this.rect.x > this.targetX) {
          this.updateEyePosition({ eyePosition: -1 });
        } else {
          this.updateEyePosition({ eyePosition: +1 });
        }
      }
    },

    /**
     * Power the bird’s engines depending on whether that’s needed or not,
     * and recalculate speed as necessary.
     */
    powerEngines: function() {
      this.enginePoweredX = 0;
      this.enginePoweredY = 0;

      if (this.landed) {
        return;
      }

      // Go up if the target is above.
      if (this.curTargetY < this.rect.y) {
        this.enginePoweredY = -1;
      }

      // If the bird is going down and the target is getting near, start
      // deceleration.
      if (this.rect.y < this.curTargetY) {
        var speed = this.speedY / engine.curFps;

        var necessaryAcceleration =
            (speed * speed) / (1 * (this.curTargetY - this.rect.y));

        if (necessaryAcceleration > (this.accelY / engine.curFps)) {
          this.enginePoweredY = -1;
        }
      }

      // Calculate vertical speed.
      if ((this.enginePoweredY == -1) && (this.speedY > -this.maxSpeedY)) {
        this.speedY -= this.accelY * 60 / engine.curFps;
      }

      // Power engines and calculate horizontal speed depending on where
      // the bird/target are.
      if (this.curTargetX < this.rect.x - this.distX) {
        this.enginePoweredX = -1;
      }
      if (this.curTargetX > this.rect.x + this.distX) {
        this.enginePoweredX = 1;
      }
      if ((this.enginePoweredX == -1) && (this.speedX > -this.maxSpeedX)) {
        this.speedX -= this.accelX * 60 / engine.curFps;
      }
      if ((this.enginePoweredX == 1) && (this.speedX < this.maxSpeedX)) {
        this.speedX += this.accelX * 60 / engine.curFps;
      }
    },

    /**
     * Figure out whether it’s safe to land etc.
     */
    landIfPossible: function() {
      this.targetZone = true;
      if ((this.targetX < this.rect.x - this.TARGET_ZONE_DIST) ||
          (this.targetX > this.rect.x + this.TARGET_ZONE_DIST) ||
          (this.targetY < this.rect.y - this.TARGET_ZONE_DIST) ||
          (this.targetY > this.rect.y + this.TARGET_ZONE_DIST)) {
        this.targetZone = false;
      }

      if (this.targetZone != this.targetZonePrev) {
        this.targetZonePrev = this.targetZone;

        this.updateTargetZonePhysics();
      }

      // onReach can be set to be called whenever the bird reaches the
      // target.
      if (this.targetZone && this.onReach) {
        this.onReach();
        // We clear the function so that we only call it once.
        this.onReach = null;
      }

      if (this.triesToLand) {
        this.curTargetX = this.targetX;
        this.curTargetY = this.targetY;
      } else {
        this.curTargetX = this.randomizedTargetX;
        this.curTargetY = this.randomizedTargetY;
      }

      if (!this.landed && this.triesToLand) {
        this.landed = true;

        if ((this.targetX < this.rect.x - this.LANDED_DIST) ||
            (this.targetX > this.rect.x + this.LANDED_DIST) ||
            (this.targetY < this.rect.y - this.LANDED_DIST) ||
            (this.targetY > this.rect.y + this.LANDED_DIST)) {
          this.landed = false;
        } else if ((this.speedX < -this.LANDED_SPEED_X) ||
                   (this.speedX > this.LANDED_SPEED_X) ||
                   (this.speedY < -this.LANDED_SPEED_Y) ||
                   (this.speedY > this.LANDED_SPEED_Y)) {
          this.landed = false;
        }

        if (this.landed && this.triesToDrop) {
          this.triesToDrop = false;
          this.carrying = null;

          this.updateCarryingPhysics();

          // onDrop can be set to be called whenever the bird drops whatever
          // it’s carrying.
          if (this.onDrop) {
            this.onDrop();
            // We clear the function so that we only call it once.
            this.onDrop = null;
          }
        }

        if (this.landed && this.triesToPickUp) {
          if ((this.triesToPickUp == 'old-parts') &&
              (this.carrying == 'new-parts')) {
            $a('new-parts').setVisible({ visible: false });
          }

          this.carryingDeltaX = this.rect.x - $a(this.triesToPickUp).rect.x;
          this.carryingDeltaY = this.rect.y - $a(this.triesToPickUp).rect.y;

          this.carrying = this.triesToPickUp;
          this.triesToPickUp = null;
          this.updateCarryingPhysics();

          // onPickUp can be set to be called whenever the bird picks up
          // the target.
          if (this.onPickUp) {
            this.onPickUp();
          }
        }
      }
    },

    tick: function() {
      // In case the bird goes severely outside, stop it in its tracks.
      // This shouldn’t ever happen. Ha! I finally wrote that in my code.
      // (Who am I kidding?)
      if ((this.rect.x < -this.SAFETY_MARGIN) ||
          (this.rect.x > engine.INITIAL_WIDTH + this.SAFETY_MARGIN) ||
          (this.rect.y < -this.SAFETY_MARGIN) ||
          (this.rect.y > engine.EXPANDED_HEIGHT + this.SAFETY_MARGIN)) {
        this.speedX = 0;
        this.speedY = 0;
      }

      this.landIfPossible();
      this.powerEngines();
      this.updateEyes();

      if (this.landed) {
        if (this.state != 'landed') {
          // Move antennae as soon as we land.
          this.animateAntennae();
          this.setState({ state: 'landed' });
        }
      } else {
        if (this.enginePoweredY) {
          // This shows wings flapping.
          this.setState({ state: 'flying-powered' });
        } else {
          // This has the wings stationary.
          this.setState({ state: 'flying-unpowered' });
        }
      }

      if (this.takeOffDelay) {
        this.takeOffDelay--;
      }

      if (!this.landed && (this.takeOffDelay <= 0)) {
        // Adjust the bird speed depending on the sky speed (e.g. the bird
        // is struggling with the wind a bit).
        this.speedX += -($a('sky').curSpeed / 20) / engine.curFps;
        this.speedY += this.gravity / 10 / engine.curFps;

        this.transform({ relX: this.speedX / engine.curFps,
                         relY: this.speedY / engine.curFps });

        this.updateCarryingParts();
      }

      this.update();
    },

    /**
     * Move the parts that the bird is carrying alongside the bird.
     */
    updateCarryingParts: function() {
      if (this.carrying) {
        var gravityCorrection = -this.speedY * this.GRAVITY_CORRECTION;

        $a(this.carrying).transform({
            x: this.rect.x - this.carryingDeltaX,
            y: this.rect.y - this.carryingDeltaY + gravityCorrection });
      }
    },

    /**
     * Go and pick up old parts.
     * @param {Object} params
     * - {function()} onPickUp The function to call once we’re done.
     * - {boolean} noPlaneChange Whether to try to automatically change the
     *                           plane.
     */
    pickUpOldParts: function(params) {
      this.onPickUp = params.onPickUp;

      var actor = $a('old-parts');
      this.setTarget({ x: actor.rect.x + this.OLD_PARTS_X,
                       y: actor.rect.y + this.OLD_PARTS_Y,
                       noPlaneChange: params.noPlaneChange,
                       land: true, pickUp: 'old-parts' });
    },

    /**
     * Go and pick up new parts.
     * @param {Object} params
     * - {function()} onPickUp The function to call once we’re done.
     * - {boolean} noPlaneChange Whether to try to automatically change the
     *                           plane.
     */
    pickUpNewParts: function(params) {
      this.onPickUp = params.onPickUp;

      var actor = $a('new-parts');
      this.setTarget({ x: actor.rect.x + this.NEW_PARTS_X,
                       y: actor.rect.y + this.NEW_PARTS_Y,
                       noPlaneChange: params.noPlaneChange,
                       land: true, pickUp: 'new-parts' });
    },

    /**
     * Go and pick up the start button.
     * @param {Object} params
     * - {function()} onPickUp The function to call once we’re done.
     * - {boolean} noPlaneChange Whether to try to automatically change the
     *                           plane.
     */
    pickUpStartButton: function(params) {
      this.onPickUp = params.onPickUp;

      var actor = $a('start-button');
      this.setTarget({ x: actor.rect.x + this.START_BUTTON_X,
                       y: actor.rect.y + this.START_BUTTON_Y,
                       noPlaneChange: params.noPlaneChange,
                       land: true, pickUp: 'start-button' });
    },

    /**
     * Go and drop old parts.
     * @param {Object} params
     * - {function()} onDrop The function to call once we’re done.
     */
    dropOldParts: function(params) {
      if (params.onDrop) {
        this.onDrop = params.onDrop;
      }

      if (!params.x) {
        var x = this.DEFAULT_DROPOFF_POINT.x;
        var y = this.DEFAULT_DROPOFF_POINT.y;
      } else {
        var x = params.x;
        var y = params.y;
      }

      this.setTarget({ x: x, y: y, land: true, drop: true });
    },

    /**
     * Wiggle the antennae (this happens whenever the bird changes the
     * target, lands, takes off, etc.). It’s meant to be cute. Don’t read
     * too much into it.
     */
    animateAntennae: function() {
      this.showAnimation({
        innerId: 'antennae',
        speed: 80,
        count: 1,
        imageIds: ['bird/antennae-1', 'bird/antennae-2', 'bird/antennae-3',
                   'bird/antennae-4', 'bird/antennae-5', 'bird/antennae-6']});
    },

    /**
     * If the bird is approaching the mouse pointer and it’s moved, we abort
     * and pick a new target.
     */
    abortLandingOnMousePointer: function() {
      this.pickRandomFreeWillTarget();
    },

    /**
     * Set a new target for the bird (either mid-air, or stationary).
     * @param {Object} params
     * - {number} x Horizontal position
     * - {number} y Vertical position
     * - {boolean} land Whether this is a mid-air target (false) or whether
     *                  the bird should land (true)
     * - {boolean} drop Whether to drop whatever the bird is carrying now.
     * - {string} pickUp What actor (id) to pick up (optional).
     * - {boolean} landingOnMousePointer Whether to try landing on mouse
     *                                   pointer.
     * - {boolean} noPlaneChange Whether to try to automatically change the
     *                           plane.
     * - {string} targetId The id of an actor the bird is landing on
     *                     (optional). If that actor is moving, the bird will
     *                     move with it.
     * - {function()} onReach The function to call once we reach the target.
     */
    setTarget: function(params) {
      if ((this.targetX == params.x) && (this.targetY == params.y)) {
        return;
      }

      // If the bird is stationary now, take a bit of time before taking
      // off.
      if (this.landed) {
        this.animateAntennae();
        this.takeOffDelay = this.TAKE_OFF_DELAY * engine.curFps / 1000;
      }

      this.landed = false;

      this.triesToLand = !!params.land;
      this.triesToDrop = !!params.drop;
      this.landingOnMousePointer = !!params.landingOnMousePointer;

      if (!params.noPlaneChange) {
        if (this.landingOnMousePointer) {
          this.transform({ plane: engine.PLANE_MOUSE_POINTER });
        } else {
          this.transform({ plane: engine.PLANE_CLOSE_FOREGROUND });
        }
      }

      if (!params.pickUp) {
        this.triesToPickUp = null;
      } else {
        this.triesToPickUp = params.pickUp;
      }

      this.targetX = params.x;
      this.targetY = params.y;
      this.targetIdPrev = this.targetId;
      this.targetId = params.targetId;

      if (params.onReach) {
        this.onReach = params.onReach;
      }

      this.randomizeTarget();
    },

    /**
     * If the current target is mid-air, randomize it a bit.
     */
    randomizeTarget: function() {
      this.randomizedTargetX =
          this.targetX +
          engine.rangeRand({ min: -this.TARGET_RANDOMIZATION,
                             max: this.TARGET_RANDOMIZATION });
      this.randomizedTargetY =
          this.targetY +
          engine.rangeRand({ min: -this.TARGET_RANDOMIZATION,
                             max: this.TARGET_RANDOMIZATION });
    }
  },

  /* ------------------------------------------------------------------------
   * Parts carried by the bird.
   * ------------------------------------------------------------------------
   */
  'new-parts': {
    WIDTH: 65,
    HEIGHT: 41,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +1,
    OFFSET_X: -16,
    NEVER_AUTO_HIDE: true,

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'connectors':
          this.showImage({ imageId: 'bird/parts-connectors' });
          break;
        case 'eyes':
          this.showImage({ imageId: 'bird/parts-eyes' });
          break;
        case 'head':
          this.showImage({ imageId: 'bird/parts-head' });
          break;
      }
    }
  },

  /* ------------------------------------------------------------------------
   * Parts carried by the bird. We need two sets since the bird might be
   * carrying something already as the new parts appear and await to be
   * picked up.
   * ------------------------------------------------------------------------
   */
  'old-parts': {
    WIDTH: 65,
    HEIGHT: 41,
    OFFSET_X: -16,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +1,
    NEVER_AUTO_HIDE: true,

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'connectors':
          this.showImage({ imageId: 'bird/parts-connectors' });
          break;
        case 'connectors-eyes':
          this.showImage({ imageId: 'bird/parts-connectors-eyes' });
          break;
        case 'connectors-eyes-head':
          this.showImage({ imageId: 'bird/parts-complete' });
          break;
      }
    }
  },

  /* ------------------------------------------------------------------------
   * Sky.
   * ------------------------------------------------------------------------
   */
  'sky': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_BK_SKY,
    SCROLLABLE: true,
    NEVER_AUTO_HIDE: true,

    // How many strands in each particular pack. The sky consists of many
    // individual strands (lines, or clouds). The start 3px apart at the top,
    // and end 6px apart at the bottom. However, we don’t want to create
    // one element per each individual line, as it has performance
    // implications. So, we have graphic assets that are packs of strands –
    // 4 strands in each pack.
    STRAND_PACK_COUNT: 4,
    // Number of variants of a particular strand pack. So, for each pack
    // version depending on distance between strands (3px, 4px, 5px, 6px),
    // there are three different variants, so that the sky is randomized.
    // (It would be more random with individual lines, but again –
    // performance.)
    STRAND_VARIANTS: 3,
    // The height in pixels of each individual image with a pack of strands.
    IMAGE_HEIGHT: 23,
    // The starting distance between the strands (at the top).
    STRAND_DISTANCE_MIN: 3,
    // The ending distance between the strands (at the bottom).
    STRAND_DISTANCE_MAX: 6,

    // Where does the sky end (we don’t waste time showing it if it’s covered
    // by the ground).
    MARGIN_BOTTOM: engine.GROUND_HEIGHT,

    // Initial speed and opacity.
    START_SPEED: 30,
    START_OPACITY: .3,
    // The speed with which speed/opacity can change. (Ugh.)
    SPEED_DELTA: 50,
    OPACITY_DELTA: .1,

    // Initial position.
    x: 0,

    /**
     * Create all the inner rects representing packs of strands
     * programmatically.
     */
    init: function() {
      this.curSpeed = this.START_SPEED;
      this.curOpacity = this.START_OPACITY;

      this.targetSpeed = this.curSpeed;
      this.targetOpacity = this.curOpacity;

      var innerRectsData = {};
      var skyCount = 1;
      var pos = 0;
      var height = this.HEIGHT - this.MARGIN_BOTTOM;

      var strandTypes = [];

      while (pos < height) {
        var innerRectData = {};

        innerRectData.x = 0;
        innerRectData.y = pos;

        if (engine.features.canvas) {
          innerRectData.width = engine.INITIAL_WIDTH;
        } else {
          innerRectData.width = engine.INITIAL_WIDTH * 4;
        }
        innerRectData.height = this.IMAGE_HEIGHT;

        innerRectData.forceWidth = true;
        innerRectData.horLoopSize = engine.INITIAL_WIDTH * 2;

        innerRectsData['sky-' + skyCount] = innerRectData;

        skyCount++;

        var normPos = (pos / height);
        var addHeight =
            Math.round(this.STRAND_DISTANCE_MIN + normPos *
                (this.STRAND_DISTANCE_MAX - this.STRAND_DISTANCE_MIN));
        pos += addHeight * this.STRAND_PACK_COUNT;

        strandTypes.push(addHeight);
      }

      skyCount--;

      this.addInnerRects({ innerRectsData: innerRectsData });

      // Assign images to inner rects.

      var lastStrandNo = 0;
      for (var i = 1; i <= skyCount; i++) {
        // Find a random strand pack, but don’t repeat the previous one.
        do {
          var strandNo =
              engine.intRangeRand({ min: 1, max: this.STRAND_VARIANTS });
        } while (strandNo == lastStrandNo);

        lastStrandNo = strandNo;

        var filename = 'background/sky-' + strandTypes[i - 1] +
                       '-' + strandNo;

        this.showImage({ innerId: 'sky-' + i, imageId: filename });
      }
    },

    /**
     * Move the sky and slowly shift towards the desired speed and opacity
     * if it’s different than the current one.
     */
    tick: function() {
      this.x -= this.curSpeed / engine.curFps;

      // Can’t use the percent sign for modulo for legacy reasons.
      while (this.x < -engine.INITIAL_WIDTH * 2) {
        this.x += engine.INITIAL_WIDTH * 2;
      }

      if (this.targetSpeed > this.curSpeed) {
        this.curSpeed += this.SPEED_DELTA / engine.curFps;

        // Set it to precisely the value so it doesn’t forever “oscillate”
        // around the target value.
        if (this.targetSpeed < this.curSpeed) {
          this.curSpeed = this.targetSpeed;
        }
      } else if (this.targetSpeed < this.curSpeed) {
        this.curSpeed -= this.SPEED_DELTA / engine.curFps;

        if (this.targetSpeed > this.curSpeed) {
          this.curSpeed = this.targetSpeed;
        }
      }

      if (this.targetOpacity > this.curOpacity) {
        this.curOpacity += this.OPACITY_DELTA / engine.curFps;

        if (this.targetOpacity < this.curOpacity) {
          this.curOpacity = this.targetOpacity;
        }

      } else if (this.targetOpacity < this.curOpacity) {
        this.curOpacity -= this.OPACITY_DELTA / engine.curFps;

        if (this.targetOpacity > this.curOpacity) {
          this.curOpacity = this.targetOpacity;
        }
      }

      // If we go to 1, <canvas> blinks on some browsers.
      if (this.curOpacity > .98) {
        this.curOpacity = .98;
      }

      $a('sky').transform({ scrollX: this.x });
      $a('sky-haze').transform({ opacity: 1 - this.curOpacity });

    },

    /**
     * @param {Object} params
     * - {number} speed (in pixels per second)
     * - {number} opacity (from 0 to 1)
     */
    setStyle: function(params) {
      if (engine.isDef(params.speed)) {
        this.targetSpeed = params.speed;
      }
      if (engine.isDef(params.opacity)) {
        this.targetOpacity = params.opacity;
      }
    }
  },

  /* ------------------------------------------------------------------------
   * A cover above the sky that controls its opacity. It’s faster to do it
   * this way than control the opacity independently on all the little
   * sky rects.
   * ------------------------------------------------------------------------
   */
  'sky-haze': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_BK_SKY,
    PLANE_CORRECTION: 2,
    NEVER_AUTO_HIDE: true,

    init: function() {
      this.showWhite();
    }
  },

  /* ------------------------------------------------------------------------
   * A Lem satellite that makes a quick appearance during level 2 as an
   * easter egg.
   * ------------------------------------------------------------------------
   */
  'satellite': {
    WIDTH: 90,
    HEIGHT: 87,

    PLANE: engine.PLANE_SKY,
    PLANE_CORRECTION: +1,

    init: function() {
      this.showImage({ imageId: 'background/satellite' });
    },

    /**
     * Fly from right to left, somewhat randomly.
     */
    startPassage: function() {
      this.transform({ x: 450,
                       y: engine.rangeRand({ min: 0, max: 100 }) });
      this.setVisible({ visible: true });

      this.addTransition({
          duration: engine.rangeRand({ min: 6000, max: 9000 }),
          onFinish: function() {
            $a('satellite').setVisible({ visible: false });
          },
          properties: { x: -100,
                        relY: engine.rangeRand({ min: 100, max: 150 }) }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scenery items for the intro and the finale.
   * ------------------------------------------------------------------------
   */
  'start-button': {
    WIDTH: 32,
    HEIGHT: 28,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +1
  },

  'construction-site': {
    WIDTH: 420,
    HEIGHT: 160,
    PLANE: engine.PLANE_FOREGROUND,

    INNER_RECTS: {
      'logo': { x: 60, y: 0, width: 304, height: 135 },
      'easel': { x: 15, y: 35, width: 56, height: 102 }
    },

    // We want the items on the ground in the intro and finale to be randomly
    // strewn around. This is the list of 11 items we get to choose from.
    STUFF_COUNT: 11,
    STUFF_INNER_RECTS: {
      'stuff-1': { y: 134, width: 25, height: 15 },
      'stuff-2': { y: 140, width: 39, height: 18 },
      'stuff-3': { y: 132, width: 10, height: 8 },
      'stuff-4': { y: 135, width: 18, height: 12 },
      'stuff-5': { y: 145, width: 18, height: 6 },
      'stuff-6': { y: 120, width: 40, height: 34 },
      'stuff-7': { y: 130, width: 32, height: 19 },
      'stuff-8': { y: 133, width: 68, height: 24 },
      'stuff-9': { y: 124, width: 17, height: 11 },
      'stuff-10': { y: 110, width: 47, height: 39 },
      'stuff-11': { y: 115, width: 43, height: 37 }
    },

    init: function() {
      this.showImage({ innerId: 'logo', imageId: 'logo' });
      this.showImage({ innerId: 'easel', imageId: 'intro-finale/easel' });

      this.stuffUsed = [];
      for (var i = 1; i <= this.STUFF_COUNT; i++) {
        this.stuffUsed[i] = false;
      }

      this.distributeStuff({ x: 45, width: 120 });
      this.distributeStuff({ x: 270, width: 40 });
    },

    /**
     * Throw things randomly on the floor.
     * @param {Object} params
     * - {number} x Where to start (in pixels).
     * - {number} width How much room we have (in pixels).
     */
    distributeStuff: function(params) {
      var x = 0;
      var innerRectsData = {};

      // Come up with a random list of items that fit in the space.
      do {
        do {
          var no = engine.intRangeRand({ min: 1, max: this.STUFF_COUNT });
        } while (this.stuffUsed[no]);

        this.stuffUsed[no] = true;

        innerRectsData['stuff-' + no] = this.STUFF_INNER_RECTS['stuff-' + no];
        innerRectsData['stuff-' + no].x = x;

        // Randomize distance between the items.
        x += innerRectsData['stuff-' + no].width +
             engine.rangeRand({ min: 0, max: 20 });

      } while (x < params.width);

      // If we have all the items, center the whole set horizontally.
      var left = (params.width - x) / 2;
      for (var id in innerRectsData) {
        innerRectsData[id].x += params.x + left;
      }

      this.addInnerRects({ innerRectsData: innerRectsData });
      for (var id in innerRectsData) {
        this.showImage({ innerId: id, imageId: 'intro-finale/' + id });
      }
    }
  },

  'scaffolding-left-1': {
    WIDTH: 122,
    HEIGHT: 521,
    PLANE: engine.PLANE_BACKGROUND,

    init: function() {
      this.showImage({ imageId: 'intro-finale/scaffolding-left-1' });
    }
  },

  'scaffolding-left-2': {
    WIDTH: 89,
    HEIGHT: 329,
    PLANE: engine.PLANE_BACKGROUND,
    PLANE_CORRECTION: +1,

    init: function() {
      this.showImage({ imageId: 'intro-finale/scaffolding-left-2' });
    }
  },

  'scaffolding-right-1': {
    WIDTH: 71,
    HEIGHT: 221,
    PLANE: engine.PLANE_BACKGROUND,

    init: function() {
      this.showImage({ imageId: 'intro-finale/scaffolding-right-1' });
    }
  },

  'scaffolding-right-2': {
    WIDTH: 100,
    HEIGHT: 379,
    PLANE: engine.PLANE_BACKGROUND,

    init: function() {
      this.showImage({ imageId: 'intro-finale/scaffolding-right-2' });
    }
  },

  'charging-station': {
    WIDTH: 25,
    HEIGHT: 34,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +1,

    init: function() {
      this.showImage({ imageId: 'intro-finale/charging-station' });
    }
  },

  /* ------------------------------------------------------------------------
   * N-Bot: The final robot that destroys everything.
   * ------------------------------------------------------------------------
   */
  'nbot': {
    WIDTH: 356,
    HEIGHT: 512,
    PLANE: engine.PLANE_BACKGROUND,
    PLANE_CORRECTION: +1,

    INNER_RECTS: {
      'head': { x: 173, y: 32, width: 38, height: 61 },
      'underwear-bottom': { x: 115, y: 389, width: 171, height: 123 },
      'underwear-top': { x: 115, y: 85, width: 148, height: 322 },
      'body': { x: 80, y: 107, width: 215, height: 301 },
      'left-arm': { x: 10, y: 125, width: 221, height: 274 },
      'right-arm': { x: 117, y: 35, width: 239, height: 349 }
    },

    // The position of the eyes (N-Bot’s eyes can rotate).
    // From 10 (corresponding to head-1.png, looking up-right) to 100
    // (corresponding to head-10.png, looking down-left)
    eyesPos: 10,
    // The desired position of the eyes.
    targetEyesPos: 10,

    init: function() {
      this.setState({ state: 'deactivated' });
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'deactivated':
          // Limp N-Bot without a head (which is how we encounter it the first
          // time).
          this.showImage({ innerId: 'body',
                           imageId: 'nbot/body-activate-1' });
          this.showImage({ innerId: 'left-arm',
                           imageId: 'nbot/left-arm-activate-1' });
          this.showImage({ innerId: 'right-arm',
                           imageId: 'nbot/right-arm-activate-1' });
          this.showImage({ innerId: 'underwear-bottom',
                           imageId: 'nbot/underwear-bottom' });
          this.showImage({ innerId: 'underwear-top',
                           imageId: 'nbot/underwear-top' });
          break;

        case 'deactivated-with-head':
          // Limp N-Bot with the head (the moment the bird drops the head, we
          // hide it as a separate actor and show it as an inner rect here).
          this.showImage({ innerId: 'head', imageId: 'nbot/head-1' });
          break;

        case 'first-activation':
          // N-Bot wakes up.
          $a('nbot').moveEyes({ pos: 60 });

          engine.addEvents({
            0: function() {
              $a('nbot').showAnimation({
                  innerId: 'body', speed: 200, count: 1,
                  imageIds: ['nbot/body-activate-1', 'nbot/body-activate-2',
                             'nbot/body-activate-3', 'nbot/body-activate-4',
                             'nbot/body-activate-5', 'nbot/body-activate-6',
                             'nbot/body-activate-7']});
            },
            100: function() {
              $a('nbot').showAnimation({
                  innerId: 'left-arm', speed: 200, count: 1,
                  imageIds: ['nbot/left-arm-activate-1',
                             'nbot/left-arm-activate-2',
                             'nbot/left-arm-activate-3',
                             'nbot/left-arm-activate-4',
                             'nbot/left-arm-activate-5',
                             'nbot/left-arm-activate-6',
                             'nbot/left-arm-activate-7']});
            },
            200: function() {
              $a('nbot').showAnimation({
                  innerId: 'right-arm', speed: 200, count: 1,
                  imageIds: ['nbot/right-arm-activate-1',
                             'nbot/right-arm-activate-2',
                             'nbot/right-arm-activate-3',
                             'nbot/right-arm-activate-4',
                             'nbot/right-arm-activate-5',
                             'nbot/right-arm-activate-6',
                             'nbot/right-arm-activate-7']});
            },
            1000: function() {
              $a('nbot').setState({ state: 'activated' });
            }
          });
          break;

        case 'activated':
          // N-Bot is now active and breathing.
          engine.addEvents({
            0: function() {
              engine.removeTransition({ id: 'nbot-breathe' });
              engine.removeTransition({ id: 'nbot-breathe-body' });

              $a('nbot').addTransition({
                  id: 'nbot-breathe', innerId: 'underwear-top',
                  easing: engine.easeInOut, alternate: true,
                  count: Infinity, duration: 2000, properties: { y: 80 }
              });

              $a('nbot').addTransition({
                  id: 'nbot-breathe-body', innerId: 'body',
                  easing: engine.easeInOut, alternate: true,
                  count: Infinity, duration: 2000, properties: { y: 103 }
              });

              $a('nbot').showAnimation({
                  innerId: 'body',
                  speed: 500, alternate: true, count: Infinity,
                  imageIds: ['nbot/body-activate-7',
                             'nbot/body-idle-1',
                             'nbot/body-idle-2',
                             'nbot/body-idle-3']});
            },
            200: function() {
              $a('nbot').showAnimation({
                  innerId: 'left-arm',
                  speed: 250, alternate: true, count: Infinity,
                  imageIds: ['nbot/left-arm-activate-7',
                             'nbot/left-arm-idle-1', 'nbot/left-arm-idle-2',
                             'nbot/left-arm-idle-3', 'nbot/left-arm-idle-4',
                             'nbot/left-arm-idle-5', 'nbot/left-arm-idle-6']});
            },
            400: function() {
              $a('nbot').showAnimation({
                innerId: 'right-arm',
                speed: 250, alternate: true, count: Infinity,
                imageIds: ['nbot/right-arm-activate-7',
                           'nbot/right-arm-idle-1', 'nbot/right-arm-idle-2',
                           'nbot/right-arm-idle-3', 'nbot/right-arm-idle-4',
                           'nbot/right-arm-idle-5', 'nbot/right-arm-idle-6']});
            }
          });
          break;

        case 'working-final':
          // N-Bot does its last job, creating Nothing.
          engine.removeTransition({ id: 'nbot-breathe' });
          engine.removeTransition({ id: 'nbot-breathe-body' });

          $a('nbot').moveEyes({ pos: 10 });

          $a('nbot').addTransition({
              id: 'nbot-breathe', innerId: 'underwear-top',
              easing: engine.easeInOut, alternate: true, count: Infinity,
              duration: 1000, properties: { y: 76 }
          });

          $a('nbot').addTransition({
              id: 'nbot-breathe-body', innerId: 'body',
              easing: engine.easeInOut, alternate: true, count: Infinity,
              duration: 1000, properties: { y: 101 }
          });

          $a('nbot').showAnimation({
             innerId: 'body',
             speed: 75, count: Infinity, repeatFrom: 8,
             imageIds: ['nbot/body-action-1', 'nbot/body-action-2',
                        'nbot/body-action-3', 'nbot/body-action-4',
                        'nbot/body-action-5', 'nbot/body-action-6',
                        'nbot/body-action-7', 'nbot/body-action-8',
                        'nbot/body-action-9', 'nbot/body-action-10',
                        'nbot/body-action-11']});

          $a('nbot').showAnimation({
           innerId: 'left-arm',
           speed: 75,
           count: Infinity,
           repeatFrom: 8,
           imageIds: ['nbot/left-arm-action-1', 'nbot/left-arm-action-2',
                      'nbot/left-arm-action-3', 'nbot/left-arm-action-4',
                      'nbot/left-arm-action-5', 'nbot/left-arm-action-6',
                      'nbot/left-arm-action-7', 'nbot/left-arm-action-8',
                      'nbot/left-arm-action-9', 'nbot/left-arm-action-10',
                      'nbot/left-arm-action-11']});

          $a('nbot').showAnimation({
          innerId: 'right-arm',
          speed: 75,
          count: Infinity,
          repeatFrom: 8,
          imageIds: ['nbot/right-arm-action-1', 'nbot/right-arm-action-2',
                     'nbot/right-arm-action-3', 'nbot/right-arm-action-4',
                     'nbot/right-arm-action-5', 'nbot/right-arm-action-6',
                     'nbot/right-arm-action-7', 'nbot/right-arm-action-8',
                     'nbot/right-arm-action-9', 'nbot/right-arm-action-10',
                     'nbot/right-arm-action-11']});

          break;

        case 'working':
          // N-Bot creates an item.
          $a('nbot').moveEyes({ pos: 10 });

          $a('nbot').showAnimation({
            innerId: 'body',
            speed: 75,
            count: 2,
            alternate: true,
            imageIds: ['nbot/body-action-1', 'nbot/body-action-2',
                       'nbot/body-action-3', 'nbot/body-action-4',
                       'nbot/body-action-5', 'nbot/body-action-6',
                       'nbot/body-action-7', 'nbot/body-action-8',
                       'nbot/body-action-9', 'nbot/body-action-10',
                       'nbot/body-action-11']});

          $a('nbot').showAnimation({
            innerId: 'left-arm',
            speed: 75,
            count: 2,
            alternate: true,
            imageIds: ['nbot/left-arm-action-1', 'nbot/left-arm-action-2',
                       'nbot/left-arm-action-3', 'nbot/left-arm-action-4',
                       'nbot/left-arm-action-5', 'nbot/left-arm-action-6',
                       'nbot/left-arm-action-7', 'nbot/left-arm-action-8',
                       'nbot/left-arm-action-9', 'nbot/left-arm-action-10',
                       'nbot/left-arm-action-11']});

         $a('nbot').showAnimation({
           innerId: 'right-arm',
           speed: 75,
           count: 2,
           alternate: true,
           imageIds: ['nbot/right-arm-action-1', 'nbot/right-arm-action-2',
                      'nbot/right-arm-action-3', 'nbot/right-arm-action-4',
                      'nbot/right-arm-action-5', 'nbot/right-arm-action-6',
                      'nbot/right-arm-action-7', 'nbot/right-arm-action-8',
                      'nbot/right-arm-action-9', 'nbot/right-arm-action-10',
                      'nbot/right-arm-action-11']});
      }
    },

    /**
     * Adjust the eyes if necessary with every new frame.
     */
    tick: function() {
      if (this.eyesPos != this.targetEyesPos) {
        if (this.eyesPos < this.targetEyesPos) {
          this.eyesPos += 2;
        } else {
          this.eyesPos -= 2;
        }

        this.showImage({ innerId: 'head',
                         imageId: 'nbot/head-' +
                             Math.floor(this.eyesPos / 10) });
      }
    },

    /**
     * Set the target eye position.
     * @param {Object} params
     * - {number} pos (from 10 to 100 as described above).
     */
    moveEyes: function(params) {
      this.targetEyesPos = params.pos;
    }
  },

  /* ------------------------------------------------------------------------
   * Books that lay on the ground that the bird sits on (based on the drawing
   * by Daniel Mroz).
   * ------------------------------------------------------------------------
   */
  'books': {
    WIDTH: 28,
    HEIGHT: 25,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +2,

    init: function() {
      this.showImage({ imageId: 'intro-finale/books' });
    }
  },

  /* ------------------------------------------------------------------------
   * The little probability dragon that appears during the finale as an
   * easter egg.
   * ------------------------------------------------------------------------
   */
  'dragon': {
    WIDTH: 94,
    HEIGHT: 66,
    PLANE: engine.PLANE_BACKGROUND,
    PLANE_CORRECTION: +1,

    init: function() {
      this.showImage({ imageId: 'intro-finale/dragon-1' });
    }
  },

  /* ------------------------------------------------------------------------
   * The first N item dropped by the N-Bot.
   * ------------------------------------------------------------------------
   */
  'first-n-item': {
    WIDTH: 68,
    HEIGHT: 65,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +1,

    /**
     * Drop the item to the ground.
     * @param {Object} params
     * - {string} id Id of an N item.
     */
    drop: function(params) {
      this.transform({ x: 215, y: -80 });
      this.setVisible({ visible: true });

      var nItem = engine.N_ITEMS[params.id][1];

      // Hole doesn’t drop, just appears in the ground.
      if (params.id == 'hole') {
        this.transform({ y: 522 });

        this.showAnimation({
          speed: 400,
          count: 1,
          imageIds: nItem,
          align: [engine.ALIGN_CENTER, engine.ALIGN_END]
        });
      } else {
        if (engine.isArray(nItem)) {
          this.showAnimation({
            speed: 150,
            count: Infinity,
            imageIds: nItem,
            align: [engine.ALIGN_CENTER, engine.ALIGN_END]
          });
        } else {
          this.showImage({
            imageId: nItem,
            align: [engine.ALIGN_CENTER, engine.ALIGN_END]
          });
        }

        this.addTransition({
          easing: engine.fall,
          duration: 1000, properties: { y: 505 }
        });
      }
    }
  },

  /* ------------------------------------------------------------------------
   * The second N item dropped by the N-Bot. This is where the approach
   * I took seems inefficient – code cannot easily be shared between those
   * two.
   * ------------------------------------------------------------------------
   */
  'second-n-item': {
    WIDTH: 68,
    HEIGHT: 65,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,
    PLANE_CORRECTION: +1,

    /**
     * Drop the item to the ground.
     * @param {Object} params
     * - {string} id Id of an N item.
     */
    drop: function(params) {
      this.transform({ x: 145, y: -80 });
      this.setVisible({ visible: true });

      var nItem = engine.N_ITEMS[params.id][1];

      // Hole doesn’t drop, just appears.
      if (params.id == 'hole') {
        this.transform({ y: 522 });

        this.showAnimation({
          speed: 400,
          count: 1,
          imageIds: nItem,
          align: [engine.ALIGN_CENTER, engine.ALIGN_END]
        });
      } else {
        if (engine.isArray(nItem)) {
          this.showAnimation({
            speed: 150,
            count: Infinity,
            imageIds: nItem,
            align: [engine.ALIGN_CENTER, engine.ALIGN_END]
          });
        } else {
          this.showImage({
            imageId: nItem,
            align: [engine.ALIGN_CENTER, engine.ALIGN_END]
          });
        }
      }

      this.addTransition({
        easing: engine.fall,
        duration: 1000, properties: { y: 505 }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * The big button that raises from the ground and initiates the last level.
   * ------------------------------------------------------------------------
   */
  'nbot-button': {
    WIDTH: 53,
    HEIGHT: 78,
    PLANE: engine.PLANE_CLOSE_FOREGROUND,

    INNER_RECTS: {
      'hole': { x: 2, y: 48, width: 49, height: 29 },
      'button': { x: 0, y: 0, width: 53, height: 78 }
    },

    /**
     * Retract the button into the ground.
     */
    hide: function() {
      $a('nbot-button').setClickable({ innerId: 'button',
                                       clickable: false });

      $a('nbot-button').showAnimation({
        speed: 75,
        count: 1,
        innerId: 'button',
        clearOnFinish: true,
        imageIds: ['intro-finale/button-appear-13',
                   'intro-finale/button-appear-12',
                   'intro-finale/button-appear-11',
                   'intro-finale/button-appear-10',
                   'intro-finale/button-appear-9',
                   'intro-finale/button-appear-8',
                   'intro-finale/button-appear-7',
                   'intro-finale/button-appear-6',
                   'intro-finale/button-appear-5',
                   'intro-finale/button-appear-4',
                   'intro-finale/button-appear-3',
                   'intro-finale/button-appear-2',
                   'intro-finale/button-appear-1']});

      engine.addEvents({
        900: function() {
          $a('nbot-button').showAnimation({
            speed: 50,
            count: 1,
            innerId: 'hole',
            clearOnFinish: true,
            imageIds: ['intro-finale/button-hole-7',
                       'intro-finale/button-hole-6',
                       'intro-finale/button-hole-5',
                       'intro-finale/button-hole-4',
                       'intro-finale/button-hole-3',
                       'intro-finale/button-hole-2',
                       'intro-finale/button-hole-1']});
        }
      });
    },

    /**
     * The ground opens up and the button slides up.
     */
    show: function() {
      this.setVisible({ visible: true });

      this.showAnimation({
        speed: 100,
        count: 1,
        innerId: 'hole',
        imageIds: ['intro-finale/button-hole-1',
                   'intro-finale/button-hole-2',
                   'intro-finale/button-hole-3',
                   'intro-finale/button-hole-4',
                   'intro-finale/button-hole-5',
                   'intro-finale/button-hole-6',
                   'intro-finale/button-hole-7']});

      engine.addEvents({
       750: function() {
         $a('nbot-button').showAnimation({
           speed: 100,
           count: 1,
           innerId: 'button',
           onFinish: function() {
             $a('nbot-button').turnIntoButton({
               innerId: 'button', clickable: true,
               pressAnimImageIds: ['intro-finale/button-press-1',
                                   'intro-finale/button-press-2',
                                   'intro-finale/button-press-3'],
               unpressAnimImageIds: ['intro-finale/button-press-2',
                                     'intro-finale/button-press-1',
                                     'intro-finale/button-appear-13']
             });
           },
           imageIds: ['intro-finale/button-appear-1',
                      'intro-finale/button-appear-2',
                      'intro-finale/button-appear-3',
                      'intro-finale/button-appear-4',
                      'intro-finale/button-appear-5',
                      'intro-finale/button-appear-6',
                      'intro-finale/button-appear-7',
                      'intro-finale/button-appear-8',
                      'intro-finale/button-appear-9',
                      'intro-finale/button-appear-10',
                      'intro-finale/button-appear-11',
                      'intro-finale/button-appear-12',
                      'intro-finale/button-appear-13']});
        }
      });
    },

    /**
     * Clicking on the buttons moves to the last scene.
     */
    onClick: function() {
      engine.goToNextScene();
    }
  },

  /* ------------------------------------------------------------------------
   * N-Bot’s speech bubble in which it announces what it can do.
   * ------------------------------------------------------------------------
   */
  'nbot-speech-bubble': {
    WIDTH: 140,
    HEIGHT: 111,
    PLANE: engine.PLANE_THOUGHT_CLOUD,

    INNER_RECTS: {
      'letter': { x: 15, y: 14, width: 91, height: 89 }
    },

    show: function() {
      this.setVisible({ visible: true });
      this.showAnimation({
          speed: 150, count: Infinity, repeatFrom: 9,
          imageIds: ['nbot/speech-bubble-1', 'nbot/speech-bubble-2',
                     'nbot/speech-bubble-3', 'nbot/speech-bubble-4',
                     'nbot/speech-bubble-5', 'nbot/speech-bubble-6',
                     'nbot/speech-bubble-7', 'nbot/speech-bubble-8',
                     'nbot/speech-bubble-9', 'nbot/speech-bubble-10',
                     'nbot/speech-bubble-11']});
    }
  },

  /* ------------------------------------------------------------------------
   * Speech bubble shared by Trurl and Klapaucjusz in which they request
   * N items.
   * ------------------------------------------------------------------------
   */
  'speech-bubble': {
    WIDTH: 115,
    HEIGHT: 144,

    PLANE: engine.PLANE_THOUGHT_CLOUD,

    INNER_RECTS: {
      'item': { x: 0, y: 0, width: 115, height: 122 },
      'rays': { x: 6, y: 5, width: 103, height: 103 }
    },

    /**
     * Show the speech bubble with a given item request in it (or without it,
     * if we’re requesting Nothing).
     * @param {Object} params
     * - {number} x Horizontal position of the bubble.
     * - {number} y Vertical position of the bubble.
     * - {string|array} item Either an image, or a set of images if the item
     *                       is to be animated.
     */
    show: function(params) {
      this.transform({ x: params.x, y: params.y });
      this.setVisible({ visible: true });

      this.clear({ innerId: 'item' });
      this.clear({ innerId: 'rays' });

      this.showAnimation({
        speed: 100,
        repeatFrom: 6,
        imageIds: ['intro-finale/speech-bubble-1',
                   'intro-finale/speech-bubble-2',
                   'intro-finale/speech-bubble-3',
                   'intro-finale/speech-bubble-4',
                   'intro-finale/speech-bubble-5',
                   'intro-finale/speech-bubble-6',
                   'intro-finale/speech-bubble-7',
                   'intro-finale/speech-bubble-8',
                   'intro-finale/speech-bubble-9']});

      engine.addEvents({
        500: function() {
          if (params.item) {
            $a('speech-bubble').showAnimation({
              speed: 100,
              innerId: 'rays',
              repeatFrom: 3,
              imageIds: ['intro-finale/speech-bubble-rays-1',
                         'intro-finale/speech-bubble-rays-2',
                         'intro-finale/speech-bubble-rays-no-3',
                         'intro-finale/speech-bubble-rays-no-4',
                         'intro-finale/speech-bubble-rays-no-5',
                         'intro-finale/speech-bubble-rays-no-6']});
          } else {
            // A slightly different animation for Nothing (with an
            // exclamation mark).
            $a('speech-bubble').showAnimation({
              speed: 100,
              innerId: 'rays',
              repeatFrom: 3,
              imageIds: ['intro-finale/speech-bubble-rays-1',
                         'intro-finale/speech-bubble-rays-2',
                         'intro-finale/speech-bubble-rays-3',
                         'intro-finale/speech-bubble-rays-4',
                         'intro-finale/speech-bubble-rays-5',
                         'intro-finale/speech-bubble-rays-6']});
          }
        },
        800: function() {
          if (params.item) {
            var nItem = engine.N_ITEMS[params.item][0];

            if (engine.isArray(nItem)) {
              $a('speech-bubble').showAnimation({
                innerId: 'item',
                speed: 150,
                count: Infinity,
                imageIds: nItem,
                align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER]
              });
            } else {
              $a('speech-bubble').showImage({
                innerId: 'item',
                imageId: nItem,
                align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER]
              });
            }

            $a('speech-bubble').addTransition({
                innerId: 'item', count: Infinity,
                duration: 100, properties: { shiver: 1 }
            });
          }
        },

        4000: function() {
          $a('speech-bubble').setVisible({ visible: false });
        }
      });

    }
  },

  /* ------------------------------------------------------------------------
   * Level 1 actors and scenery.
   * ------------------------------------------------------------------------
   */
  'numbot': {
    WIDTH: 420,
    HEIGHT: 575,
    PLANE: engine.PLANE_FOREGROUND,

    INNER_RECTS: {
      'head': { x: 137, y: -2, width: 109, height: 74 },

      'steam': { x: 132, y: -2, width: 117, height: 63 },

      'l-upper-arm':
          { x: 52, y: 61, width: 115, height: 193,
            pivotX: 22, pivotY: -47, clampRotate: .4,
            connected: [
              { pivotX: -27, pivotY: 100, innerId: 'l-lower-arm' }
            ] },
      'l-lower-arm':
          { x: 38, y: 211, width: 76, height: 166,
            pivotX: 7, pivotY: -53, clampRotate: .6,
            connected: [
              { pivotX: -27, pivotY: 80, innerId: 'l-hand' }
            ] },
      'l-hand': { x: 11, y: 336, width: 114, height: 157,
                  pivotX: -18, pivotY: -50, clampRotate: 2 },
      'body': { x: 63, y: -78, width: 261, height: 429 },
      'r-upper-arm': { x: 248, y: 20, width: 107, height: 193,
                       pivotX: -33, pivotY: -43, clampRotate: .4,
                       connected: [
                         { pivotX: 27, pivotY: 74, innerId: 'r-lower-arm' }
                       ] },
      'r-lower-arm': { x: 285, y: 175, width: 96, height: 185,
                       pivotX: -10, pivotY: -54, clampRotate: .6,
                       connected: [
                         { pivotX: 66, pivotY: 49, innerId: 'r-hand' }
                       ] },
      'r-hand': { x: 289, y: 330, width: 120, height: 163,
                  pivotX: 5, pivotY: -60, clampRotate: 2 },
      'l-leg': { x: 76, y: 318, width: 100, height: 231 },
      'r-leg': { x: 227, y: 303, width: 121, height: 248 },

      'formula': { x: 136, y: 58, width: 107, height: 60 },

      'formula-1-digit-window': { x: 128, y: 143, width: 87, height: 112 },
      'formula-1-button-activate': { x: 225, y: 228, width: 44, height: 42 },
      'formula-1-button-top': { x: 220, y: 146, width: 28, height: 19 },
      'formula-1-button-bottom': { x: 222, y: 176, width: 30, height: 23 },
      'formula-1-segment-1': { x: 156, y: 160, width: 34, height: 8 },
      'formula-1-segment-2': { x: 151, y: 168, width: 7, height: 30 },
      'formula-1-segment-3': { x: 188, y: 163, width: 7, height: 30 },
      'formula-1-segment-4': { x: 149, y: 191, width: 40, height: 9 },
      'formula-1-segment-5': { x: 147, y: 199, width: 8, height: 35 },
      'formula-1-segment-6': { x: 186, y: 195, width: 8, height: 34 },
      'formula-1-segment-7': { x: 151, y: 228, width: 39, height: 9 },

      'formula-2-digit-window': { x: 148, y: 131, width: 87, height: 112 },
      'formula-2-button-activate': { x: 225, y: 228, width: 44, height: 42 },
      'formula-2-button-left-top': { x: 129, y: 154, width: 21, height: 29 },
      'formula-2-button-right-top': { x: 232, y: 142, width: 25, height: 27 },
      'formula-2-button-left-bottom':
          { x: 122, y: 196, width: 22, height: 28 },
      'formula-2-button-right-bottom':
          { x: 236, y: 183, width: 27, height: 30 },
      'formula-2-segment-1': { x: 174, y: 147, width: 33, height: 8 },
      'formula-2-segment-2': { x: 170, y: 155, width: 6, height: 30 },
      'formula-2-segment-3': { x: 206, y: 150, width: 6, height: 30 },
      'formula-2-segment-4': { x: 168, y: 178, width: 40, height: 10 },
      'formula-2-segment-5': { x: 167, y: 186, width: 7, height: 35 },
      'formula-2-segment-6': { x: 207, y: 182, width: 6, height: 34 },
      'formula-2-segment-7': { x: 171, y: 215, width: 38, height: 10 },

      'formula-3-digit-window': { x: 116, y: 144, width: 87, height: 112 },
      'formula-3-button-activate': { x: 225, y: 228, width: 44, height: 42 },
      'formula-3-button-top': { x: 153, y: 128, width: 28, height: 19 },
      'formula-3-button-left-top': { x: 202, y: 155, width: 25, height: 27 },
      'formula-3-button-right-top': { x: 232, y: 155, width: 25, height: 27 },
      'formula-3-button-left-bottom':
          { x: 205, y: 197, width: 26, height: 29 },
      'formula-3-button-right-bottom':
          { x: 236, y: 196, width: 27, height: 30 },
      'formula-3-button-bottom': { x: 145, y: 254, width: 30, height: 23 },
      'formula-3-segment-1': { x: 147, y: 160, width: 34, height: 8 },
      'formula-3-segment-2': { x: 141, y: 167, width: 8, height: 30 },
      'formula-3-segment-3': { x: 178, y: 162, width: 7, height: 30 },
      'formula-3-segment-4': { x: 139, y: 190, width: 42, height: 9 },
      'formula-3-segment-5': { x: 136, y: 198, width: 9, height: 35 },
      'formula-3-segment-6': { x: 176, y: 194, width: 8, height: 34 },
      'formula-3-segment-7': { x: 140, y: 227, width: 40, height: 9 },

      'cover': { x: 63, y: -78, width: 261, height: 429 },

      'inside-brick': { x: 150, y: 150, width: 150, height: 96 },
      'inside-chassis-1': { x: 180, y: 200, width: 60, height: 67 },
      'inside-chassis-2': { x: 150, y: 200, width: 107, height: 54 },

      'explosion': { x: -120, y: -70, width: 706, height: 634 }
    },

    // How many segments per digit.
    SEGMENT_COUNT: 7,
    // What segments need to be active/inactive to create a certain digit
    // (from 0 to 9).
    DIGIT_SEGMENTS: [
      [true, true, true, false, true, true, true],
      [false, false, true, false, false, true, false],
      [true, false, true, true, true, false, true],
      [true, false, true, true, false, true, true],
      [false, true, true, true, false, true, false],
      [true, true, false, true, false, true, true],
      [true, true, false, true, true, true, true],
      [true, false, true, false, false, true, false],
      [true, true, true, true, true, true, true],
      [true, true, true, true, false, true, false]
    ],
    // Ordering for puzzle two and three.
    FORMULA_2_TOP_ORDER: [1, 2, 0, 3, null, null, null],
    FORMULA_2_BOTTOM_ORDER: [null, null, null, 0, 3, 1, 2],
    FORMULA_3_TWO_ORDER: [0, 1, 3, 2],
    FORMULA_3_THREE_ORDER: [0, 1, 3, 2, 6, 7, 5, 4],

    segments: [],
    formula: 1,
    stage: 1,

    init: function() {
      this.showImage({ innerId: 'head', imageId: 'numbot/head-1' });
      this.showImage({ innerId: 'body', imageId: 'numbot/body' });
      this.showImage({ innerId: 'l-upper-arm',
          imageId: 'numbot/l-upper-arm',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'l-lower-arm',
          imageId: 'numbot/l-lower-arm',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'l-hand',
          imageId: 'numbot/l-hand',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'l-leg', imageId: 'numbot/l-leg' });
      this.showImage({ innerId: 'r-upper-arm',
          imageId: 'numbot/r-upper-arm',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'r-lower-arm',
          imageId: 'numbot/r-lower-arm',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'r-hand',
          imageId: 'numbot/r-hand',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
      this.showImage({ innerId: 'r-leg', imageId: 'numbot/r-leg' });

      this.showImage({ innerId: 'cover', imageId: 'numbot/body-cover-10' });
    },

    /**
     * Checks whether a given value exists in an array. (Modern browsers
     * would support it natively…)
     * @param {Object} params
     * - {array} order Array to go through.
     * - {number} val Value to search for.
     */
    orderIndexOf: function(params) {
      for (var i in params.order) {
        if (params.order[i] == params.val) {
          return i;
        }
      }
      return null;
    },

    /**
     * Hide the UI (buttons and the number), typically done underneath the
     * cover.
     */
    hideUI: function() {
      switch (this.formula) {
        case 1:
          this.clear({ innerId: 'formula-1-digit-window' });

          this.clear({ innerId: 'formula-1-button-activate' });
          this.clear({ innerId: 'formula-1-button-top' });
          this.clear({ innerId: 'formula-1-button-bottom' });

          this.clear({ innerId: 'formula-1-segment-1' });
          this.clear({ innerId: 'formula-1-segment-2' });
          this.clear({ innerId: 'formula-1-segment-3' });
          this.clear({ innerId: 'formula-1-segment-4' });
          this.clear({ innerId: 'formula-1-segment-5' });
          this.clear({ innerId: 'formula-1-segment-6' });
          this.clear({ innerId: 'formula-1-segment-7' });
          break;

        case 2:
          this.clear({ innerId: 'formula-2-digit-window' });

          this.clear({ innerId: 'formula-2-button-activate' });
          this.clear({ innerId: 'formula-2-button-left-top' });
          this.clear({ innerId: 'formula-2-button-right-top' });
          this.clear({ innerId: 'formula-2-button-left-bottom' });
          this.clear({ innerId: 'formula-2-button-right-bottom' });

          this.clear({ innerId: 'formula-2-segment-1' });
          this.clear({ innerId: 'formula-2-segment-2' });
          this.clear({ innerId: 'formula-2-segment-3' });
          this.clear({ innerId: 'formula-2-segment-4' });
          this.clear({ innerId: 'formula-2-segment-5' });
          this.clear({ innerId: 'formula-2-segment-6' });
          this.clear({ innerId: 'formula-2-segment-7' });
          break;

        case 3:
          this.clear({ innerId: 'formula-3-digit-window' });

          this.clear({ innerId: 'formula-3-button-activate' });
          this.clear({ innerId: 'formula-3-button-top' });
          this.clear({ innerId: 'formula-3-button-left-top' });
          this.clear({ innerId: 'formula-3-button-right-top' });
          this.clear({ innerId: 'formula-3-button-bottom' });
          this.clear({ innerId: 'formula-3-button-left-bottom' });
          this.clear({ innerId: 'formula-3-button-right-bottom' });

          this.clear({ innerId: 'formula-3-segment-1' });
          this.clear({ innerId: 'formula-3-segment-2' });
          this.clear({ innerId: 'formula-3-segment-3' });
          this.clear({ innerId: 'formula-3-segment-4' });
          this.clear({ innerId: 'formula-3-segment-5' });
          this.clear({ innerId: 'formula-3-segment-6' });
          this.clear({ innerId: 'formula-3-segment-7' });
          break;
      }
    },

    /**
     * Shows the respective UI under the cover, depending which sub-level
     * we’re on right now.
     */
    showUI: function() {
      switch (this.formula) {
        case 1:
          this.showImage({ innerId: 'formula-1-digit-window',
                           imageId: 'numbot/digit-window-1' });

          this.showImage({ innerId: 'formula-1-button-activate',
                           imageId: 'numbot/button-activate' });
          this.showImage({ innerId: 'formula-1-button-top',
                           imageId: 'numbot/button-top' });
          this.showImage({ innerId: 'formula-1-button-bottom',
                           imageId: 'numbot/button-bottom' });
          break;

        case 2:
          this.topSetting = 0;
          this.bottomSetting = 0;

          this.showImage({ innerId: 'formula-2-digit-window',
                           imageId: 'numbot/digit-window-2' });

          this.showImage({ innerId: 'formula-2-button-activate',
                           imageId: 'numbot/button-activate' });
          this.showImage({ innerId: 'formula-2-button-left-top',
                           imageId: 'numbot/button-left-top' });
          this.showImage({ innerId: 'formula-2-button-right-top',
                           imageId: 'numbot/button-right-top' });
          this.showImage({ innerId: 'formula-2-button-left-bottom',
                           imageId: 'numbot/button-left-bottom' });
          this.showImage({ innerId: 'formula-2-button-right-bottom',
                           imageId: 'numbot/button-right-bottom' });
          break;

        case 3:
          this.showImage({ innerId: 'formula-3-digit-window',
                           imageId: 'numbot/digit-window-3' });

          this.showImage({ innerId: 'formula-3-button-activate',
                           imageId: 'numbot/button-activate' });
          this.showImage({ innerId: 'formula-3-button-top',
                           imageId: 'numbot/button-top' });
          this.showImage({ innerId: 'formula-3-button-left-top',
                           imageId: 'numbot/button-alt-left-top' });
          this.showImage({ innerId: 'formula-3-button-right-top',
                           imageId: 'numbot/button-right-top' });
          this.showImage({ innerId: 'formula-3-button-bottom',
                           imageId: 'numbot/button-bottom' });
          this.showImage({ innerId: 'formula-3-button-left-bottom',
                           imageId: 'numbot/button-alt-left-bottom' });
          this.showImage({ innerId: 'formula-3-button-right-bottom',
                           imageId: 'numbot/button-right-bottom' });
          break;
      }
    },

    /**
     * The Numbot explodes. The horror!
     * @param {Object} params
     */
    explode: function() {
      engine.addEvents({
        0: function() {
          $a('numbot').addTransition({
            id: 'numbot-shaking-1',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 80, properties: { relY: -1 }
          });
        },
        750: function() {
          engine.removeTransition({ id: 'numbot-shaking-1' });

          $a('numbot').addTransition({
            id: 'numbot-shaking-2',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relX: 0, relY: -2 }
          });
        },
        1500: function() {
          engine.removeTransition({ id: 'numbot-shaking-2' });

          $a('numbot').addTransition({
            id: 'numbot-shaking-3-x',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 40, properties: { relX: -1 }
          });
          $a('numbot').addTransition({
            id: 'numbot-shaking-3-y',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 30, properties: { relY: -5 }
          });
        },
        2500: function() {
          engine.removeTransition({ id: 'numbot-shaking-3-x' });
          engine.removeTransition({ id: 'numbot-shaking-3-y' });

          $a('numbot').addTransition({
            id: 'numbot-shaking-4-x',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 32, properties: { relX: -2 }
          });
          $a('numbot').addTransition({
            id: 'numbot-shaking-4-y',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 20, properties: { relY: -8 }
          });
        },
        3800: function() {
          $a('numbot').showAnimation({
            innerId: 'explosion',
            speed: 100,
            count: 1,
            clearOnFinish: true,
            imageIds: ['numbot/explosion-1', 'numbot/explosion-2',
                       'numbot/explosion-3', 'numbot/explosion-4',
                       'numbot/explosion-5', 'numbot/explosion-5',
                       'numbot/explosion-6', 'numbot/explosion-6',
                       'numbot/explosion-7', 'numbot/explosion-7',
                       'numbot/explosion-8', 'numbot/explosion-8',
                       'numbot/explosion-9', 'numbot/explosion-9',
                       'numbot/explosion-10', 'numbot/explosion-10',
                       'numbot/explosion-11', 'numbot/explosion-11',
                       'numbot/explosion-12', 'numbot/explosion-12',
                       'numbot/explosion-13', 'numbot/explosion-13',
                       'numbot/explosion-14', 'numbot/explosion-14',
                       'numbot/explosion-15', 'numbot/explosion-15']});
        },
        4000: function() {
          engine.removeTransition({ id: 'numbot-shaking-4-x' });
          engine.removeTransition({ id: 'numbot-shaking-4-y' });
        },
        4200: function() {
          $a('numbot').showImage({
              innerId: 'inside-chassis-1',
              imageId: 'numbot/inside-chassis-1' });
          $a('numbot').showImage({
              innerId: 'inside-chassis-2',
              imageId: 'numbot/inside-chassis-2' });
          $a('numbot').showImage({
              innerId: 'inside-brick',
              imageId: 'numbot/inside-brick' });

          $a('numbot').addTransition({
            innerId: 'inside-chassis-1', easing: engine.linear, count: 1,
            duration: 600, properties: { relX: -260, relY: -50 }
          });
          $a('numbot').addTransition({
            innerId: 'inside-chassis-2', easing: engine.linear, count: 1,
            duration: 400, properties: { relX: 280, relY: 160 }
          });
          $a('numbot').addTransition({
            innerId: 'inside-brick', easing: engine.linear, count: 1,
            duration: 300, properties: { relX: 280, relY: -150 }
          });
        },
        4100: function() {
          $a('numbot').hideUI();

          $a('numbot').clear({ innerId: 'body' });
          $a('numbot').clear({ innerId: 'cover' });

          $a('numbot').clear({ innerId: 'r-leg' });
          $a('numbot').clear({ innerId: 'l-leg' });
          $a('numbot').clear({ innerId: 'head' });
          $a('numbot').clear({ innerId: 'r-hand' });
          $a('numbot').clear({ innerId: 'l-hand' });
          $a('numbot').clear({ innerId: 'r-lower-arm' });
          $a('numbot').clear({ innerId: 'l-lower-arm' });
          $a('numbot').clear({ innerId: 'r-upper-arm' });
          $a('numbot').clear({ innerId: 'l-upper-arm' });
        },
        8000: function() {
          $a('numbot').setVisible({ visible: false });
        }
      });
    },

    /**
     * Remove all the arm movements.
     */
    stopMovingArms: function() {
      engine.removeTransition({ id: 'numbot-l-upper-arm-move' });
      engine.removeTransition({ id: 'numbot-r-upper-arm-move' });
      engine.removeTransition({ id: 'numbot-l-lower-arm-move' });
      engine.removeTransition({ id: 'numbot-r-lower-arm-move' });
      engine.removeTransition({ id: 'numbot-l-hand-move' });
      engine.removeTransition({ id: 'numbot-r-hand-move' });
    },

    /**
     * Move arms up and down, once. (In order to do that, we have to rotate
     * upper arms, lower arms, and hands independently.)
     * @param {Object} params
     * - {boolean} Violence Whether the arms are thrown violently (used
     *                      at one point to expand the canvas)
     */
    moveArms: function(params) {
      if (!this.rect.visible) {
        return;
      }

      if (params && params.violence) {
        var time = 100;

        var upperArmsRotate = 12;
        var lowerArmsRotate = 8;
        var handsRotate = 8;

        var altUpperArmsRotate = 4;
        var altLowerArmsRotate = 1.2;
        var altHandsRotate = 2;

        var delayBetween = 1000;

        var easing = engine.easeOut;

        engine.addEvents({
          100: function() {
            $a('numbot').addTransition({
              easing: engine.linear,
              count: 6,
              alternate: true,
              duration: 25, properties: { relY: 5 }
            });

            $a('trurl').addTransition({
              easing: engine.linear,
              count: 6,
              alternate: true,
              duration: 25, properties: { relY: 5 }
            });

            $a('mask-small').transform({ innerId: 'left', relX: -20 });
            $a('mask-small').transform({ innerId: 'right', relX: 20 });
          }
        });

      } else {
        // A lot of the parameters are randomized so that they fele more
        // natural. Since, you know, it’s a robot, etc.
        switch (this.stage) {
          case 1:
            var time = engine.rangeRand({ min: 2300, max: 2800 });

            var upperArmsRotate = engine.rangeRand({ min: .6, max: 1 });
            var lowerArmsRotate = engine.rangeRand({ min: 1, max: 1.4 });
            var handsRotate = engine.rangeRand({ min: 1.5, max: 2.5 });
            var delayBetween = engine.rangeRand({ min: 150, max: 250 });

            break;
          case 2:
            var time = engine.rangeRand({ min: 1800, max: 2100 });

            var upperArmsRotate = engine.rangeRand({ min: 1, max: 1.6 });
            var lowerArmsRotate = engine.rangeRand({ min: 1.3, max: 2.1 });
            var handsRotate = engine.rangeRand({ min: 2.5, max: 3.5 });

            var delayBetween = engine.rangeRand({ min: 100, max: 150 });
            break;
          case 3:
            var time = engine.rangeRand({ min: 1000, max: 1500 });

            var upperArmsRotate = engine.rangeRand({ min: 1.4, max: 2.2 });
            var lowerArmsRotate = engine.rangeRand({ min: 1.7, max: 2.7 });
            var handsRotate = engine.rangeRand({ min: 3.4, max: 4.6 });
            var delayBetween = engine.rangeRand({ min: 50, max: 120 });
            break;
        }

        var altUpperArmsRotate = upperArmsRotate;
        var altLowerArmsRotate = lowerArmsRotate;
        var altHandsRotate = handsRotate;

        var easing = engine.easeInOut;
      }

      $a('numbot').stopMovingArms();

      $a('numbot').addTransition({
        id: 'numbot-l-upper-arm-move',
        easing: easing, innerId: 'l-upper-arm',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: upperArmsRotate,
                                alt: -altUpperArmsRotate } }
      });

      $a('numbot').addTransition({
        id: 'numbot-r-upper-arm-move',
        easing: easing, innerId: 'r-upper-arm',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: -upperArmsRotate,
                                alt: altUpperArmsRotate } }
      });

      $a('numbot').addTransition({
        id: 'numbot-l-lower-arm-move',
        easing: easing, innerId: 'l-lower-arm',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: lowerArmsRotate,
                                alt: -altLowerArmsRotate } }
      });

      $a('numbot').addTransition({
        id: 'numbot-r-lower-arm-move',
        easing: easing, innerId: 'r-lower-arm',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: -lowerArmsRotate,
                                alt: altLowerArmsRotate } }
      });

      $a('numbot').addTransition({
        id: 'numbot-r-hand-move',
        easing: easing, innerId: 'r-hand',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: -handsRotate, alt: altHandsRotate } }
      });

      $a('numbot').addTransition({
        id: 'numbot-l-hand-move',
        easing: easing, innerId: 'l-hand',
        count: 2, alternate: true, duration: time,
        properties: { rotate: { val: handsRotate, alt: -altHandsRotate } },
        onFinish: function() {
          // Schedule the next arm movement, unless we’re on another level
          // already.
          if ((engine.curSceneId == 'before-level-1') ||
              (engine.curSceneId == 'level-1')) {
            engine.addEvent({
              startTime: delayBetween,
              onEvent: function() {
                $a('numbot').moveArms();
              }
            });
          }
        }
      });
    },

    /**
     * Sets up Numbot so the it can be interacted with or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      engine.setInteractive(params);
      $a('trurl').setInteractive(params);

      if ((this.formula == 1) || (this.formula == 3)) {
        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-top',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-top-press'],
          unpressAnimImageIds: ['numbot/button-top']
        });

        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-bottom',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-bottom-press'],
          unpressAnimImageIds: ['numbot/button-bottom']
        });
      }

      if ((this.formula == 2) || (this.formula == 3)) {
        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-right-top',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-right-top-press'],
          unpressAnimImageIds: ['numbot/button-right-top']
        });

        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-right-bottom',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-right-bottom-press'],
          unpressAnimImageIds: ['numbot/button-right-bottom']
        });
      }

      if (this.formula == 2) {
        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-left-top',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-left-top-press'],
          unpressAnimImageIds: ['numbot/button-left-top']
        });

        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-left-bottom',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-left-bottom-press'],
          unpressAnimImageIds: ['numbot/button-left-bottom']
        });
      }

      if (this.formula == 3) {
        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-left-top',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-alt-left-top-press'],
          unpressAnimImageIds: ['numbot/button-alt-left-top']
        });

        $a('numbot').turnIntoButton({
          innerId: 'formula-' + this.formula + '-button-left-bottom',
          clickable: params.interactive,
          pressAnimImageIds: ['numbot/button-alt-left-bottom-press'],
          unpressAnimImageIds: ['numbot/button-alt-left-bottom']
        });
      }

      $a('numbot').turnIntoButton({
        innerId: 'formula-' + this.formula + '-button-activate',
        clickable: params.interactive,
        pressAnimImageIds: ['numbot/button-activate-press-1',
                            'numbot/button-activate-press-2'],
        unpressAnimImageIds: ['numbot/button-activate-press-1',
                              'numbot/button-activate']
      });
    },

    /**
     * Show the cover that hides the UI – we use it as we change the UI
     * in between sub-levels.
     */
    showCover: function() {
      $a('numbot').showAnimation({
        innerId: 'cover',
        speed: 50,
        count: 1,
        imageIds: ['numbot/body-cover-1', 'numbot/body-cover-2',
                   'numbot/body-cover-3', 'numbot/body-cover-4',
                   'numbot/body-cover-5', 'numbot/body-cover-6',
                   'numbot/body-cover-7', 'numbot/body-cover-8',
                   'numbot/body-cover-9', 'numbot/body-cover-10']});
    },

    /**
     * Hide the cover.
     */
    hideCover: function() {
      $a('numbot').showAnimation({
        innerId: 'cover',
        speed: 50,
        count: 1,
        clearOnFinish: true,
        imageIds: ['numbot/body-cover-10', 'numbot/body-cover-9',
                   'numbot/body-cover-8', 'numbot/body-cover-7',
                   'numbot/body-cover-6', 'numbot/body-cover-5',
                   'numbot/body-cover-4', 'numbot/body-cover-3',
                   'numbot/body-cover-2', 'numbot/body-cover-1']});
    },

    /**
     * Start a given stage (sub-scene) from 1 to 3, corresponding to the
     * increasingly more difficult puzzles.
     * @param {Object} params
     * - {Number} stage Stage from 1 to 3.
     */
    goToStage: function(params) {
      this.setInteractive({ interactive: false });

      this.stage = params.stage;

      this.clearNumber();

      $a('hints').resetFailedAttempts();

      switch (this.stage) {
        case 1:
          engine.addEvents({
            0: function() {
              $a('numbot').showAnimation({
                innerId: 'formula',
                speed: 100,
                count: 1,
                imageIds: ['numbot/formula-1-1', 'numbot/formula-1-2',
                           'numbot/formula-1-3', 'numbot/formula-1-4',
                           'numbot/formula-1-5', 'numbot/formula-1-6',
                           'numbot/formula-1-7', 'numbot/formula-1-8',
                           'numbot/formula-1-9', 'numbot/formula-1-10',
                           'numbot/formula-1-11', 'numbot/formula-1-12',
                           'numbot/formula-1-13', 'numbot/formula-1-14',
                           'numbot/formula-1-15', 'numbot/formula-1-16',
                           'numbot/formula-1-17', 'numbot/formula-1-18',
                           'numbot/formula-1-19', 'numbot/formula-1-20',
                           'numbot/formula-1-21', 'numbot/formula-1-22',
                           'numbot/formula-1-23', 'numbot/formula-1-24']});

              $a('numbot').showUI();
            },
            3800: function() {
              $a('numbot').hideCover();
            },
            4800: function() {
              $a('numbot').showNumber({ number: 0 });
            },
            5000: function() {
              $a('numbot').showNumber({ number: 1 });
            },
            5200: function() {
              $a('numbot').showNumber({ number: 2 });
            },
            5400: function() {
              $a('numbot').showNumber({ number: 3 });
            },
            5650: function() {
              $a('numbot').showNumber({ number: 4 });
            },
            5900: function() {
              $a('numbot').showNumber({ number: 5 });
            },
            6200: function() {
              $a('numbot').showNumber({ number: 6 });
            },
            6650: function() {
              $a('numbot').showNumber({ number: 7 });
              $a('numbot').setInteractive({ interactive: true });
            }
          });
          break;

        case 2:
          engine.addEvents({
            0: function() {
              $a('trurl').setState({ state: 'happy' });

              $a('numbot').showAnimation({
                innerId: 'head',
                speed: 150,
                count: 1,
                imageIds: ['numbot/head-1', 'numbot/head-2', 'numbot/head-3',
                           'numbot/head-4', 'numbot/head-5', 'numbot/head-6',
                           'numbot/head-6', 'numbot/head-6', 'numbot/head-6',
                           'numbot/head-6', 'numbot/head-6', 'numbot/head-6',
                           'numbot/head-6', 'numbot/head-6', 'numbot/head-6',
                           'numbot/head-6', 'numbot/head-5', 'numbot/head-4',
                           'numbot/head-3']});

              $a('numbot').showAnimation({
                innerId: 'formula',
                speed: 50,
                count: 1,
                clearOnFinish: true,
                imageIds: ['numbot/formula-2-1', 'numbot/formula-2-2',
                           'numbot/formula-2-3', 'numbot/formula-2-4',
                           'numbot/formula-2-5', 'numbot/formula-2-6',
                           'numbot/formula-2-7', 'numbot/formula-2-8',
                           'numbot/formula-2-8', 'numbot/formula-2-8',
                           'numbot/formula-2-9', 'numbot/formula-2-10',
                           'numbot/formula-2-11', 'numbot/formula-2-12',
                           'numbot/formula-2-13', 'numbot/formula-2-14',
                           'numbot/formula-2-15', 'numbot/formula-2-16',
                           'numbot/formula-2-16', 'numbot/formula-2-16',
                           'numbot/formula-2-17', 'numbot/formula-2-18',
                           'numbot/formula-2-19', 'numbot/formula-2-20',
                           'numbot/formula-2-21', 'numbot/formula-2-22',
                           'numbot/formula-2-23', 'numbot/formula-2-24',
                           'numbot/formula-2-24', 'numbot/formula-2-24',
                           'numbot/formula-2-25', 'numbot/formula-2-26',
                           'numbot/formula-2-27', 'numbot/formula-2-28',
                           'numbot/formula-2-29', 'numbot/formula-2-30',
                           'numbot/formula-2-31']});

              $a('numbot').showCover();

              // The sky gets darker.
              $a('sky').setStyle({ speed: 25, opacity: .6 });
            },
            500: function() {
              $a('numbot').showAnimation({
                innerId: 'steam',
                speed: 150,
                count: 2,
                clearOnFinish: true,
                alternate: true,
                imageIds: ['numbot/steam-2-1',
                           'numbot/steam-2-2',
                           'numbot/steam-2-3']});
            },
            2200: function() {
              $a('numbot').hideUI();
            },
            3000: function() {
              $a('numbot').showAnimation({
                innerId: 'formula',
                speed: 100,
                count: 1,
                imageIds: ['numbot/formula-2-32', 'numbot/formula-2-33',
                           'numbot/formula-2-34', 'numbot/formula-2-35',
                           'numbot/formula-2-36', 'numbot/formula-2-37',
                           'numbot/formula-2-38', 'numbot/formula-2-39',
                           'numbot/formula-2-40', 'numbot/formula-2-41',
                           'numbot/formula-2-42', 'numbot/formula-2-43',
                           'numbot/formula-2-44', 'numbot/formula-2-45',
                           'numbot/formula-2-46', 'numbot/formula-2-47',
                           'numbot/formula-2-48', 'numbot/formula-2-49',
                           'numbot/formula-2-50', 'numbot/formula-2-51',
                           'numbot/formula-2-52', 'numbot/formula-2-53',
                           'numbot/formula-2-54', 'numbot/formula-2-55']});

              $a('numbot').formula = 2;
              $a('numbot').showUI();
            },
            5500: function() {
              $a('numbot').showNumber({ number: 6 });
              $a('numbot').hideCover();

              $a('numbot').setInteractive({ interactive: true });
            }
          });
          break;

        case 3:
          $a('trurl').setState({ state: 'happy' });

          engine.addEvents({
            0: function() {
              $a('numbot').showAnimation({
                innerId: 'head',
                speed: 150,
                count: 1,
                imageIds: ['numbot/head-4', 'numbot/head-5', 'numbot/head-6',
                           'numbot/head-7', 'numbot/head-8', 'numbot/head-9',
                           'numbot/head-9', 'numbot/head-9', 'numbot/head-9',
                           'numbot/head-9', 'numbot/head-9', 'numbot/head-9',
                           'numbot/head-9', 'numbot/head-9', 'numbot/head-9',
                           'numbot/head-9', 'numbot/head-8', 'numbot/head-7',
                           'numbot/head-6']});

              // The sky gets as dark as possible.
              $a('sky').setStyle({ speed: 1, opacity: 1 });

              $a('numbot').showCover();
            },
            500: function() {
              $a('numbot').showAnimation({
                innerId: 'steam',
                speed: 150,
                count: 4,
                clearOnFinish: true,
                alternate: true,
                imageIds: ['numbot/steam-3-1', 'numbot/steam-3-2',
                           'numbot/steam-3-3']});
            },
            1000: function() {
              $a('numbot').moveArms({ violence: true });

              $a('numbot').showAnimation({
                innerId: 'formula',
                speed: 50,
                count: 1,
                clearOnFinish: true,
                imageIds: ['numbot/formula-3-1', 'numbot/formula-3-2',
                           'numbot/formula-3-3', 'numbot/formula-3-4',
                           'numbot/formula-3-5', 'numbot/formula-3-6',
                           'numbot/formula-3-7', 'numbot/formula-3-8',
                           'numbot/formula-3-8', 'numbot/formula-3-8',
                           'numbot/formula-3-9', 'numbot/formula-3-11',
                           'numbot/formula-3-12', 'numbot/formula-3-13',
                           'numbot/formula-3-14', 'numbot/formula-3-15',
                           'numbot/formula-3-16', 'numbot/formula-3-16',
                           'numbot/formula-3-16', 'numbot/formula-3-17',
                           'numbot/formula-3-18', 'numbot/formula-3-19',
                           'numbot/formula-3-20', 'numbot/formula-3-21',
                           'numbot/formula-3-22', 'numbot/formula-3-23',
                           'numbot/formula-3-24', 'numbot/formula-3-24',
                           'numbot/formula-3-24', 'numbot/formula-3-25',
                           'numbot/formula-3-26', 'numbot/formula-3-27',
                           'numbot/formula-3-28', 'numbot/formula-3-29',
                           'numbot/formula-3-30', 'numbot/formula-3-31']});
            },
            3200: function() {
              $a('numbot').hideUI();
            },
            4000: function() {
              $a('numbot').showAnimation({
                innerId: 'formula',
                speed: 50,
                count: 1,
                imageIds: ['numbot/formula-3-32', 'numbot/formula-3-33',
                           'numbot/formula-3-34', 'numbot/formula-3-35',
                           'numbot/formula-3-36', 'numbot/formula-3-37',
                           'numbot/formula-3-38', 'numbot/formula-3-39',
                           'numbot/formula-3-40', 'numbot/formula-3-41',
                           'numbot/formula-3-42', 'numbot/formula-3-43',
                           'numbot/formula-3-44', 'numbot/formula-3-45',
                           'numbot/formula-3-46', 'numbot/formula-3-47',
                           'numbot/formula-3-48', 'numbot/formula-3-49',
                           'numbot/formula-3-50', 'numbot/formula-3-51',
                           'numbot/formula-3-52', 'numbot/formula-3-53',
                           'numbot/formula-3-54']});

              $a('numbot').formula = 3;
              $a('numbot').showUI();
            },
            6500: function() {
              $a('numbot').showNumber({ number: 0 });
              $a('numbot').hideCover();
              $a('numbot').setInteractive({ interactive: true });
            }
          });

          break;
      }
    },

    /**
     * Update the number based on the configuration of buttons in stage 2.
     */
    updateFormula2: function() {
      for (var i = 0; i < this.SEGMENT_COUNT; i++) {
        this.setSegment({
            segment: i + 1,
            active: ((this.topSetting != this.FORMULA_2_TOP_ORDER[i]) &&
                     (this.FORMULA_2_TOP_ORDER[i] !== null)) ||
                    ((this.bottomSetting != this.FORMULA_2_BOTTOM_ORDER[i]) &&
                     (this.FORMULA_2_BOTTOM_ORDER[i] !== null))
            });
      }
    },

    /**
     * Set the big display on the Numbot to show a given digit.
     * @param {Object} params
     * - {Number} .number A number to show (well, a digit – from 0 to 9).
     */
    showNumber: function(params) {
      if (this.stage == 1) {
        // In the first stage, Numbot gets happy whenever 2 + 2 = 7.
        if (params.number == 7) {
          this.showImage({ innerId: 'head', imageId: 'numbot/head-happy' });
        } else {
          this.showImage({ innerId: 'head', imageId: 'numbot/head-1' });
        }
      }

      for (var i = 1; i <= this.SEGMENT_COUNT; i++) {
        this.setSegment({
            segment: i, active: this.DIGIT_SEGMENTS[params.number][i - 1]});
      }

      this.lastNumberSet = params.number;
    },

    /**
     * Remove the number from the display (clear all the segments).
     */
    clearNumber: function() {
      for (var i = 1; i <= this.SEGMENT_COUNT; i++) {
        this.setSegment({ segment: i, active: false });
      }
    },

    /**
     * Check whether a set combination of segments corresponds to a given
     * number.
     * @param {Object} params
     * - {number} .number A number to check for.
     * @return {boolean} Whether the given number is set.
     */
    isNumberSet: function(params) {
      var set = true;

      for (var i = 1; i <= this.SEGMENT_COUNT; i++) {
        if (this.segments[i] != this.DIGIT_SEGMENTS[params.number][i - 1]) {
          set = false;
          break;
        }
      }

      return set;
    },

    /**
     * Set a specific one out of seven segments to be active or inactive.
     * @param {Object} params
     * - {number} .segment Segment number (from 1 to 7)
     * - {boolean} .active Whether it’s active (selected) or not (invisible)
     */
    setSegment: function(params) {
      this.segments[parseInt(params.segment, 10)] = params.active;

      var innerId = 'formula-' + this.formula + '-segment-' + params.segment;

      if (params.active) {
        // The segment images are all different to account for different
        // perspective of the number on different stages.
        this.showImage({
            innerId: innerId,
            imageId: 'numbot/formula-' + this.formula +
                     '-segment-' + params.segment });
      } else {
        this.clear({ innerId: innerId });
      }
    },

    /**
     * If you fail, in addition to Trurl giving you the additude,
     * the Numbot will also rotate its head in anger.
     */
    failedAttempt: function() {
      $a('hints').failedAttempt();

      this.setInteractive({ interactive: false });

      // Numbot’s head can rotate. Every subsequent stage’s head is
      // rotated a bit – we need to account for that.
      switch ($a('numbot').stage) {
        case 1:
          var no = 1;
          break;
        case 2:
          var no = 4;
          break;
        case 3:
          var no = 6;
          break;
      }

      $a('numbot').showAnimation({
        innerId: 'head',
        speed: 100,
        count: 1,
        imageIds: ['numbot/head-' + no, 'numbot/head-' + (no + 1),
                   'numbot/head-' + (no + 2), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 3), 'numbot/head-' + (no + 3),
                   'numbot/head-' + (no + 2), 'numbot/head-' + (no + 1),
                   'numbot/head-' + no]});

      $a('trurl').negatory({
        onFinish: function() {
          $a('numbot').setInteractive({ interactive: true });
        }
      });
    },

    /**
     * React to clicks depending on which buttons is clicked.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      switch (params.innerId) {
        case 'formula-1-button-activate':
          if (this.isNumberSet({ number: 4 })) {
            this.goToStage({ stage: 2 });
          } else {
            this.failedAttempt();
          }
          break;
        case 'formula-2-button-activate':
          if (this.isNumberSet({ number: 3 })) {
            this.goToStage({ stage: 3 });
          } else {
            this.failedAttempt();
          }
          break;
        case 'formula-3-button-activate':
          if (this.isNumberSet({ number: 2 })) {
            engine.goToNextScene();
          } else {
            this.failedAttempt();
          }
          break;

        case 'formula-1-button-bottom':
          var number = this.lastNumberSet;

          number--;
          if (number == -1) {
            number = 9;
          }

          this.showNumber({ number: number });
          break;

        case 'formula-1-button-top':
          var number = this.lastNumberSet;

          number++;
          if (number == 10) {
            number = 0;
          }

          this.showNumber({ number: number });
          break;

        case 'formula-2-button-left-top':
        case 'formula-2-button-right-top':
          if (params.innerId == 'formula-2-button-left-top') {
            this.topSetting--;
            if (this.topSetting == -1) {
              this.topSetting = 3;
            }
          } else {
            this.topSetting++;
            if (this.topSetting == 4) {
              this.topSetting = 0;
            }
          }

          this.updateFormula2();
          break;

        case 'formula-2-button-left-bottom':
        case 'formula-2-button-right-bottom':
          if (params.innerId == 'formula-2-button-left-bottom') {
            this.bottomSetting--;
            if (this.bottomSetting == -1) {
              this.bottomSetting = 3;
            }
          } else {
            this.bottomSetting++;
            if (this.bottomSetting == 4) {
              this.bottomSetting = 0;
            }
          }

          this.updateFormula2();
          break;

        case 'formula-3-button-top':
        case 'formula-3-button-bottom':
          var val = 1 * this.segments[1] + 2 * this.segments[4] +
                    4 * this.segments[7];

          var pos = this.orderIndexOf({ order: this.FORMULA_3_THREE_ORDER,
                                        val: val });

          if (params.innerId == 'formula-3-button-top') {
            pos++;
            if (pos == 8) {
              pos = 0;
            }
          } else {
            pos--;
            if (pos == -1) {
              pos = 7;
            }
          }

          this.setSegment({
              segment: 1,
              active: !!(this.FORMULA_3_THREE_ORDER[pos] & 1) });
          this.setSegment({
              segment: 4,
              active: !!(this.FORMULA_3_THREE_ORDER[pos] & 2) });
          this.setSegment({
              segment: 7,
              active: !!(this.FORMULA_3_THREE_ORDER[pos] & 4) });
          break;

        case 'formula-3-button-left-top':
        case 'formula-3-button-right-top':
          var val = 1 * this.segments[2] + 2 * this.segments[3];

          var pos = this.orderIndexOf({ order: this.FORMULA_3_TWO_ORDER,
                                        val: val });

          if (params.innerId == 'formula-3-button-right-top') {
            pos++;
            if (pos == 4) {
              pos = 0;
            }
          } else {
            pos--;
            if (pos == -1) {
              pos = 3;
            }
          }

          this.setSegment({
              segment: 2,
              active: !!(this.FORMULA_3_TWO_ORDER[pos] & 1) });
          this.setSegment({
              segment: 3,
              active: !!(this.FORMULA_3_TWO_ORDER[pos] & 2) });
          break;

        case 'formula-3-button-left-bottom':
        case 'formula-3-button-right-bottom':
          var val = 1 * this.segments[5] + 2 * this.segments[6];

          var pos = this.orderIndexOf({ order: this.FORMULA_3_THREE_ORDER,
                                        val: val });

          if (params.innerId == 'formula-3-button-right-bottom') {
            pos++;
            if (pos == 4) {
              pos = 0;
            }
          } else {
            pos--;
            if (pos == -1) {
              pos = 3;
            }
          }

          this.setSegment({
              segment: 5,
              active: !!(this.FORMULA_3_TWO_ORDER[pos] & 1) });
          this.setSegment({
              segment: 6,
              active: !!(this.FORMULA_3_TWO_ORDER[pos] & 2) });
          break;
      }
    }
  },

  /* ------------------------------------------------------------------------
   * Level 2 actors and scenery.
   * ------------------------------------------------------------------------
   */
  'demonbot': {
    WIDTH: 591,
    HEIGHT: 551,
    PLANE: engine.PLANE_BACKGROUND,

    INNER_RECTS: {
      'hair': { x: 278, y: 5, width: 245, height: 206,
                pivotX: 105, pivotY: 75, clampRotate: .25 },

      'body': { x: 0, y: 0, width: 565, height: 551 },

      'right-hand': { x: 505, y: 260, width: 103, height: 85 },
      'left-hand': { x: 33, y: 273, width: 58, height: 56 },

      'big-eye-left': { x: 115, y: 280, width: 109, height: 73 },
      'big-eye-right': { x: 330, y: 280, width: 109, height: 73 },

      'eye-1': { x: 193, y: 66, width: 30, height: 30,
                 target: engine.setRand({ set: ['random', 'mouse'] }),
                 type: 'big', radius: 4 },
      'eye-2': { x: 133, y: 96, width: 30, height: 30,
                 target: 'bird', type: 'big', radius: 3 },
      'eye-3': { x: 173, y: 82, width: 30, height: 30,
                 target: 'bird', type: 'big', radius: 4 },
      'eye-4': { x: 205, y: 105, width: 30, height: 30,
                 target: 'mouse', type: 'big', radius: 3 },
      'eye-5': { x: 240, y: 118, width: 30, height: 30,
                 target: 'bird', type: 'big', radius: 3 },
      'eye-6': { x: 211, y: 150, width: 30, height: 30,
                 target: 'trurl', type: 'big', radius: 4 },
      'eye-7': { x: 165, y: 151, width: 30, height: 30,
                 target: engine.setRand({ set: ['random', 'mouse'] }),
                 type: 'medium', radius: 4 },
      'eye-8': { x: 131, y: 158, width: 30, height: 30,
                 target: 'bird', type: 'big', radius: 4 },
      'eye-9': { x: 198, y: 217, width: 30, height: 30,
                 target: engine.setRand({ set: ['bird', 'mouse'] }),
                 type: 'big', radius: 3 },
      'eye-10': { x: 150, y: 226, width: 30, height: 30,
                  target: engine.setRand({ set: ['bird', 'mouse'] }),
                  type: 'big', radius: 3 },
      'eye-11': { x: 309, y: 90, width: 30, height: 30,
                  target: 'bird', type: 'small', radius: 3 },
      'eye-12': { x: 330, y: 96, width: 30, height: 30,
                  target: engine.setRand({ set: ['bird', 'mouse'] }),
                  type: 'big', radius: 3 },
      'eye-13': { x: 253, y: 146, width: 30, height: 30,
                  target: engine.setRand({ set: ['bird', 'mouse'] }),
                  type: 'big', radius: 3 },
      'eye-14': { x: 340, y: 165, width: 30, height: 30,
                  target: engine.setRand({ set: ['bird', 'random'] }),
                  type: 'big', radius: 2 },
      'eye-15': { x: 291, y: 165, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 4 },
      'eye-16': { x: 313, y: 236, width: 30, height: 30,
                  target: 'mouse', type: 'medium', radius: 4 },
      'eye-17': { x: 348, y: 233, width: 30, height: 30,
                  target: 'bird', type: 'big', radius: 3 },
      'eye-18': { x: 191, y: 295, width: 30, height: 30,
                  target: engine.setRand({ set: ['random', 'mouse'] }),
                  type: 'small', radius: 3 },
      'eye-19': { x: 129, y: 375, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 3 },
      'eye-20': { x: 174, y: 370, width: 30, height: 30,
                  target: 'mouse', type: 'medium', radius: 3 },
      'eye-21': { x: 197, y: 373, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 3 },
      'eye-22': { x: 206, y: 321, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 4 },
      'eye-23': { x: 253, y: 335, width: 30, height: 30,
                  target: 'mouse', type: 'big', radius: 3 },
      'eye-24': { x: 268, y: 372, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 4 },
      'eye-25': { x: 309, y: 325, width: 30, height: 30,
                  target: 'trurl', type: 'medium', radius: 3 },
      'eye-26': { x: 331, y: 326, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 2 },
      'eye-27': { x: 344, y: 343, width: 30, height: 30,
                  target: 'mouse', type: 'big', radius: 2 },
      'eye-28': { x: 365, y: 375, width: 30, height: 30,
                  target: 'trurl', type: 'big', radius: 3 },
      'eye-29': { x: 303, y: 370, width: 30, height: 30,
                  target: 'trurl', type: 'medium', radius: 2 }
    },

    // How many eyes are there.
    EYE_COUNT: 29,
    // The coefficient we use to rotate the eye based on a target.
    EYE_ROTATION: .1,

    // The width and the height of the eye rect.
    EYE_WIDTH: 30,
    EYE_HEIGHT: 30,

    eyeInfo: [],

    init: function() {
      this.showImage({ innerId: 'body', imageId: 'demonbot/body' });
      this.showImage({ innerId: 'hair', imageId: 'demonbot/hair' });
      this.showImage({ innerId: 'right-hand',
                       imageId: 'demonbot/right-hand-1' });

      this.showImage({ innerId: 'big-eye-left',
                       imageId: 'demonbot/big-eye-left' });
      this.showImage({ innerId: 'big-eye-right',
                       imageId: 'demonbot/big-eye-right-1' });

      for (var i = 1; i <= this.EYE_COUNT; i++) {
        this.showImage({
            innerId: 'eye-' + i,
            imageId: 'demonbot/eye-' + this.INNER_RECTS['eye-' + i].type,
            align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER]
        });
      }

      for (var i = 1; i <= this.EYE_COUNT; i++) {
        this.eyeInfo[i] = {
          target: this.INNER_RECTS['eye-' + i].target,
          radius: this.INNER_RECTS['eye-' + i].radius
        };

        if (this.eyeInfo[i].target == 'random') {
          this.eyeInfo[i].speed =
              (engine.setRand({ set: [-1, 1] })) *
               engine.rangeRand({ min: 500, max: 700 });
        }
      }
    },

    /**
     * Start waving the little left hand that appears first as the Demonbot
     * scrolls into view.
     */
    startWavingLeftHand: function() {
      this.showAnimation({
          innerId: 'left-hand',
          speed: 100,
          count: Infinity,
          imageIds: ['demonbot/left-hand-1', 'demonbot/left-hand-2',
                     'demonbot/left-hand-3', 'demonbot/left-hand-4',
                     'demonbot/left-hand-5', 'demonbot/left-hand-6',
                     'demonbot/left-hand-7', 'demonbot/left-hand-8',
                     'demonbot/left-hand-9', 'demonbot/left-hand-10',
                     'demonbot/left-hand-11', 'demonbot/left-hand-12',
                     'demonbot/left-hand-13', 'demonbot/left-hand-14',
                     'demonbot/left-hand-15', 'demonbot/left-hand-15',
                     'demonbot/left-hand-15', 'demonbot/left-hand-15',
                     'demonbot/left-hand-15', 'demonbot/left-hand-15',
                     'demonbot/left-hand-15', 'demonbot/left-hand-15']});
    },

    /**
     * Stop waving the left hand.
     */
    stopWavingLeftHand: function() {
      this.showImage({ innerId: 'left-hand', imageId: 'demonbot/left-hand-1' });
    },

    /**
     * Instead of looking at the mouse, or Trurl, or the bird, make all the
     * eyes look at the paper that’s covering the Demonbot in the finale of
     * this level.
     */
    lookAtPaper: function() {
      for (var i = 1; i <= this.EYE_COUNT; i++) {
        this.eyeInfo[i].target = 'paper';
      }
    },

    /**
     * Update all the eyes depending on what they’re looking at.
     */
    tick: function() {
      for (var i = 1; i <= this.EYE_COUNT; i++) {
        var eyeRect = this.innerRects['eye-' + i];

        var eyePosLeft = eyeRect.x + eyeRect.parentRect.x +
                         engine.bodyPos.left;
        var eyePosTop = eyeRect.y + eyeRect.parentRect.y +
                        engine.bodyPos.top;

        var distance = 0;
        var angle = 0;

        switch (this.eyeInfo[i].target) {
          case 'random':
            // The eye just lazily rotates around.
            distance = 1000;
            angle = engine.curGameTime / this.eyeInfo[i].speed;
            break;
          case 'mouse':
            // Only follow mouse when we actually have a mouse pointer
            // (e.g. not for touch devices), otherwise follow a bird.
            if (!engine.features.touch) {
              var x = engine.mouseX;
              var y = engine.mouseY;
            } else {
              var x = $a('bird').rect.x + engine.bodyPos.left;
              var y = $a('bird').rect.y + engine.bodyPos.top;
            }
            break;
          case 'trurl':
            var x = $a('trurl').rect.x + engine.bodyPos.left;
            var y = $a('trurl').rect.y + engine.bodyPos.top;
            break;
          case 'bird':
            var x = $a('bird').rect.x + engine.bodyPos.left;
            var y = $a('bird').rect.y + engine.bodyPos.top;
            break;
          case 'paper':
            var x = 80 + engine.bodyPos.left;
            var y = 10 + engine.bodyPos.top;
            break;
        }

        if (!distance) {
          distance =
              Math.sqrt((x - eyePosLeft) * (x - eyePosLeft) +
                        (y - eyePosTop) * (y - eyePosTop)) * this.EYE_ROTATION;

          angle = Math.atan2(x - eyePosLeft, y - eyePosTop);
        }

        if (distance > this.eyeInfo[i].radius) {
          distance = this.eyeInfo[i].radius;
        }

        var eyeRelX = this.EYE_WIDTH / 2 + Math.sin(angle) * distance;
        var eyeRelY = this.EYE_HEIGHT / 2 + Math.cos(angle) * distance;

        eyeRect.transform({ offsetX: eyeRect.origOffsetX + eyeRelX,
                            offsetY: eyeRect.origOffsetY + eyeRelY });
        eyeRect.update();
      }
    }
  },

  'demonbot-paper-cover': {
    WIDTH: 710,
    HEIGHT: 572,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: -10,

    /**
     * Have the paper dramatically cover the Demonbot.
     */
    show: function() {
      this.showAnimation({
        speed: 200,
        count: 1,
        imageIds: [
            'demonbot/paper-finale-1', 'demonbot/paper-finale-3',
            'demonbot/paper-finale-5', 'demonbot/paper-finale-7',
            'demonbot/paper-finale-9', 'demonbot/paper-finale-11',
            'demonbot/paper-finale-13', 'demonbot/paper-finale-15',
            'demonbot/paper-finale-17', 'demonbot/paper-finale-19',
            'demonbot/paper-finale-21', 'demonbot/paper-finale-23',
            'demonbot/paper-finale-25', 'demonbot/paper-finale-27',
            'demonbot/paper-finale-29', 'demonbot/paper-finale-30',
            'demonbot/paper-finale-31', 'demonbot/paper-finale-32',
            'demonbot/paper-finale-33', 'demonbot/paper-finale-34',
            'demonbot/paper-finale-35', 'demonbot/paper-finale-36',
            'demonbot/paper-finale-37', 'demonbot/paper-finale-37',
            'demonbot/paper-finale-38', 'demonbot/paper-finale-39',
            'demonbot/paper-finale-39', 'demonbot/paper-finale-40'
        ]});
    }
  },

  'demonbot-pen': {
    WIDTH: 379,
    HEIGHT: 485,

    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +6
  },

  'demonbot-ui-extension-1': {
    WIDTH: 97,
    HEIGHT: 72,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +9,

    INNER_RECTS: {
      'dial': { x: 26, y: 8, width: 26, height: 26 },
      'button-wave-left': { x: 11, y: 11, width: 14, height: 19 },
      'button-wave-right': { x: 54, y: 11, width: 13, height: 19 }
    },

    init: function() {
      this.showImage({ imageId: 'demonbot/ui-extension-1' });

      this.clearDial();

      this.showImage({ innerId: 'button-wave-left',
                       imageId: 'demonbot/ui-button-left' });
      this.showImage({ innerId: 'button-wave-right',
                       imageId: 'demonbot/ui-button-right' });
    },

    /**
     * Sets up the extension so that it can be interacted with or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      this.turnIntoButton({
        innerId: 'button-wave-left', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-left-press'],
        unpressAnimImageIds: ['demonbot/ui-button-left']
      });
      this.turnIntoButton({
        innerId: 'button-wave-right', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-right-press'],
        unpressAnimImageIds: ['demonbot/ui-button-right']
      });
    },

    /**
     * Pass the click to the 'demonbot-ui' actor that otherwise controls the
     * entire stage.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      $a('demonbot-ui').onClick(params);
    },

    /**
     * Clear the dial in this part of the UI.
     */
    clearDial: function() {
      this.showImage({ innerId: 'dial',
                       imageId: 'demonbot/ui-dial-wave-empty' });
    }
  },

  'demonbot-ui-extension-2': {
    WIDTH: 88,
    HEIGHT: 68,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +8,

    INNER_RECTS: {
      'dial': { x: 22, y: 7, width: 26, height: 26 },
      'button-amplitude-left': { x: 7, y: 10, width: 14, height: 19 },
      'button-amplitude-right': { x: 50, y: 10, width: 13, height: 19 }
    },

    init: function() {
      this.showImage({ imageId: 'demonbot/ui-extension-2' });

      this.clearDial();

      this.showImage({ innerId: 'button-amplitude-left',
                       imageId: 'demonbot/ui-button-left' });
      this.showImage({ innerId: 'button-amplitude-right',
                       imageId: 'demonbot/ui-button-right' });
    },

    /**
     * Sets up the extension so that it can be interacted with or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      this.turnIntoButton({
        innerId: 'button-amplitude-left', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-left-press'],
        unpressAnimImageIds: ['demonbot/ui-button-left']
      });
      this.turnIntoButton({
        innerId: 'button-amplitude-right', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-right-press'],
        unpressAnimImageIds: ['demonbot/ui-button-right']
      });
    },

    /**
     * Clear the dial in this part of the UI.
     */
    clearDial: function() {
      this.showImage({ innerId: 'dial',
                       imageId: 'demonbot/ui-dial-amplitude-empty' });
    },

    /**
     * Pass the click to the 'demonbot-ui' actor that otherwise controls the
     * entire stage.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      $a('demonbot-ui').onClick(params);
    }
  },

  'demonbot-ui-extension-3': {
    WIDTH: 80,
    HEIGHT: 173,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +7,

    INNER_RECTS: {
      'base-top': { x: 20, y: 90, width: 48, height: 32 },
      'base-bottom': { x: 10, y: 128, width: 66, height: 60 },
      'body': { x: 0, y: 100, width: 80, height: 73 },
      'dial': { x: 18, y: 106, width: 26, height: 26 },
      'button-frequency-left': { x: 3, y: 109, width: 14, height: 19 },
      'button-frequency-right': { x: 46, y: 109, width: 13, height: 19 }
    },

    init: function() {
      this.showImage({ innerId: 'body',
                       imageId: 'demonbot/ui-extension-3' });

      this.clearDial();

      this.showImage({ innerId: 'button-frequency-left',
                       imageId: 'demonbot/ui-button-left' });
      this.showImage({ innerId: 'button-frequency-right',
                       imageId: 'demonbot/ui-button-right' });
    },

    /**
     * Sets up the extension so that it can be interacted with or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      this.turnIntoButton({
        innerId: 'button-frequency-left', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-left-press'],
        unpressAnimImageIds: ['demonbot/ui-button-left']
      });
      this.turnIntoButton({
        innerId: 'button-frequency-right', clickable: params.interactive,
        pressAnimImageIds: ['demonbot/ui-button-right-press'],
        unpressAnimImageIds: ['demonbot/ui-button-right']
      });
    },

    /**
     * Clear the dial in this part of the UI.
     */
    clearDial: function() {
      this.showImage({ innerId: 'dial',
                       imageId: 'demonbot/ui-dial-frequency-empty' });
    },

    /**
     * Pass the click to the 'demonbot-ui' actor that otherwise controls the
     * entire stage.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      $a('demonbot-ui').onClick(params);
    },

    /**
     * Extend the last extension even further, in preparation from the
     * pen to extend from it.
     */
    extendFurther: function() {
      this.showImage({ innerId: 'base-bottom',
                       imageId: 'demonbot/pen-base-bottom' });

      this.addTransition({
        innerId: 'base-bottom',
        duration: 500,
        easing: engine.backEaseInOut,
        properties: { relY: -60 } });

      engine.addEvents({
        1000: function() {
          $a('demonbot-ui-extension-3').showImage({
              innerId: 'base-top', imageId: 'demonbot/pen-base-top' });

          $a('demonbot-ui-extension-3').addTransition({
            innerId: 'base-top',
            duration: 500,
            easing: engine.backEaseInOut,
            properties: { relY: -40 } });

        }
      });
    }
  },

  // We need to split this from the demonbot-ui because the planes in the
  // Demonbot UI don’t actually make physical sense (the UI is both behind
  // and in front of everything else).
  'demonbot-ui-top': {
    WIDTH: 104,
    HEIGHT: 70,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +10,

    INNER_RECTS: {
      'button-activate': { x: 0, y: 0, width: 76, height: 72 }
    },

    init: function() {
      this.showImage({ imageId: 'demonbot/ui-top' });

      this.showImage({ innerId: 'button-activate',
                       imageId: 'demonbot/ui-button-activate' });
    },

    /**
     * Pass the click to the 'demonbot-ui' actor that otherwise controls the
     * entire stage.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      $a('demonbot-ui').onClick(params);
    },

    /**
     * Sets up the UI so that it can be interacted with or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      this.turnIntoButton({
        innerId: 'button-activate', clickable: params.interactive,
        noPadding: true,
        pressAnimImageIds: ['demonbot/ui-button-activate-press-1',
           'demonbot/ui-button-activate-press-2',
           'demonbot/ui-button-activate-press-3'],
        unpressAnimImageIds: ['demonbot/ui-button-activate-press-2',
            'demonbot/ui-button-activate-press-1',
            'demonbot/ui-button-activate']
      });
    }
  },

  'demonbot-ui': {
    WIDTH: 363,
    HEIGHT: 235,
    PLANE: engine.PLANE_FOREGROUND,

    INNER_RECTS: {
      'body': { x: 0, y: 50, width: 339, height: 185 },

      'output': { x: 30, y: 76, width: 212, height: 69,
                  forceWidth: true, horLoopSize: 772 },
      'output-target': { x: 30, y: 76, width: 212, height: 69,
                         forceWidth: true, horLoopSize: 772 },

      'cogs': { x: -8, y: 123, width: 228, height: 116 },
      'paper': { x: 12, y: 126, width: 351, height: 113 }
    },

    // Types of waves, amplitudes, and frequencies used for the puzzle.
    WAVE_ID: ['square', 'sine', 'saw'],
    AMPLITUDE_ID: ['mid', 'short', 'tall'],
    FREQUENCY_ID: ['mid', 'squish', 'stretch'],

    // With every game play and every stage, each dial starts on a random
    // setting (out of two not correct ones), and each pair of buttons can
    // go one way or the other. These two structures hold those
    // randomizations – see RandomizeSettings() below.
    settings: { wave: 1, amplitude: 1, frequency: 1 },
    directions: { wave: +1, amplitude: +1, frequency: +1 },

    // Stage from 1 (matching just one parameter) to 3 (matching three
    // parameters)
    stage: 1,

    init: function() {
      this.showImage({ innerId: 'body', imageId: 'demonbot/ui' });

      this.showImage({ innerId: 'paper',
                       imageId: 'demonbot/paper-1' });
    },

    /**
     * Matches the selected wave with the output wave, which itself is
     * just a continuous transition. We can’t do this in a transition since
     * the wave changes a lot and it starts at random times.
     */
    tick: function() {
      if ($a('demonbot-ui').innerRects['output-target'].visible) {
        $a('demonbot-ui').transform({
            innerId: 'output',
            scrollX: $a('demonbot-ui').innerRects['output-target'].scrollX
        });
      }
    },

    /**
     * Animate the cogs below the UI.
     */
    animateCogs: function() {
      // The cogs get faster as we go through the level.
      if (engine.curSceneId == 'level-2-ending') {
        var speed = 100;
      } else {
        var speed = 300 - this.stage * 50;
      }

      this.showAnimation({
        speed: speed,
        innerId: 'cogs',
        imageIds: ['demonbot/ui-cogs-1', 'demonbot/ui-cogs-2',
                   'demonbot/ui-cogs-3', 'demonbot/ui-cogs-4',
                   'demonbot/ui-cogs-5', 'demonbot/ui-cogs-6',
                   'demonbot/ui-cogs-7', 'demonbot/ui-cogs-8',
                   'demonbot/ui-cogs-9', 'demonbot/ui-cogs-10',
                   'demonbot/ui-cogs-11', 'demonbot/ui-cogs-12',
                   'demonbot/ui-cogs-13', 'demonbot/ui-cogs-14',
                   'demonbot/ui-cogs-15', 'demonbot/ui-cogs-16',
                   'demonbot/ui-cogs-17', 'demonbot/ui-cogs-18',
                   'demonbot/ui-cogs-19', 'demonbot/ui-cogs-20']});
    },

    /**
     * The Demonbot UI starts blank, this prepares it to show the two
     * waves (the target one, and the one the user is trying to match).
     */
    showOutput: function() {
      this.showImage({ innerId: 'output-target',
                       imageId: 'demonbot/wave-target' });

      this.updateDials();

      $a('demonbot-ui').transform({ innerId: 'output', scrollX: 0 });
      $a('demonbot-ui').transform({ innerId: 'output-target', scrollX: 0 });
    },

    /**
     * Randomizes the initial values and the “direction” of buttons for each
     * property.
     */
    randomizeSettings: function() {

      // Randomize the direction of buttons.

      this.directions.wave = engine.setRand({ set: [-1, 1] });
      this.directions.amplitude = engine.setRand({ set: [-1, 1] });
      this.directions.frequency = engine.setRand({ set: [-1, 1] });

      // Randomize the initial settings (cannot be 1, which is the target,
      // so we choose between 2 and 3).

      this.settings.wave = engine.setRand({ set: [2, 3] });

      if (this.stage >= 2) {
        this.settings.amplitude = engine.setRand({ set: [2, 3] });
      } else {
        this.settings.amplitude = 1;
      }

      if (this.stage >= 3) {
        this.settings.frequency = engine.setRand({ set: [2, 3] });
      } else {
        this.settings.frequency = 1;
      }
    },

    /**
     * Finish a given stage (the user gave correct answers). Move to the
     * next stage, or the next scene if the last stage has been “solved.”
     */
    finishStage: function() {
      this.setInteractive({ interactive: false });

      $a('trurl').setState({ state: 'happy' });

      if ($a('demonbot-ui').stage == 3) {
        engine.goToNextScene();
      } else {
        engine.addEvents({
          1000: function() {
            if ($a('demonbot-ui').stage < 3) {
              $a('demonbot-ui-extension-1').clearDial();
              $a('demonbot-ui-extension-2').clearDial();
              $a('demonbot-ui-extension-3').clearDial();

              engine.removeTransition({ id: 'demonbot-ui-output-scroll' });

              $a('demonbot-ui').clear({ innerId: 'output' });
            }
          },
          2000: function() {
            if ($a('demonbot-ui').stage < 3) {
              $a('demonbot-ui').goToStage({
                  stage: $a('demonbot-ui').stage + 1 });
            }
          }
        });
      }
    },

    /**
     * Start a given stage.
     * @param {Object} params
     * - {number} stage Stage from 1 to 3.
     */
    goToStage: function(params) {
      this.setInteractive({ interactive: false });

      this.stage = params.stage;
      this.randomizeSettings();

      this.animateCogs();

      $a('hints').resetFailedAttempts();

      switch (this.stage) {
        case 1:
          // The first dial and set of buttons appear.
          var actor = $a('demonbot-ui');
          $a('demonbot-ui-extension-1').transform({
              x: actor.rect.x + 240, y: actor.rect.y - 3 });
          $a('demonbot-ui-extension-1').setVisible({ visible: true });

          $a('demonbot-ui-extension-1').addTransition({
              duration: 500,
              easing: engine.backEaseInOut,
              properties: { relY: -37 } });
          break;

        case 2:
          // The second dial and set of buttons appear.
          var actor = $a('demonbot-ui');
          $a('demonbot-ui-extension-2').transform({
              x: actor.rect.x + 244, y: actor.rect.y - 43 });
          $a('demonbot-ui-extension-2').setVisible({ visible: true });

          $a('demonbot-ui-extension-2').addTransition({
            duration: 400,
            easing: engine.backEaseInOut,
            properties: { relY: -35 } });

          // The Demonbot wakes up a little bit - its “hair” starts rotating,
          // and it starts breathing.
          $a('demonbot').addTransition({
              id: 'demonbot-hair-rotate',
              innerId: 'hair',
              easing: engine.easeInOut,
              alternate: true,
              count: Infinity,
              duration: 4000, properties: { rotate: -5 }
          });
          $a('demonbot').addTransition({
            id: 'demonbot-breathe',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 6000, properties: { relY: -10 }
          });

          // Also, the big eye opens up a bit.
          $a('demonbot').showAnimation({
              innerId: 'big-eye-right',
              speed: 300,
              count: 1,
              imageIds: ['demonbot/big-eye-right-1',
                         'demonbot/big-eye-right-2',
                         'demonbot/big-eye-right-3',
                         'demonbot/big-eye-right-4',
                         'demonbot/big-eye-right-5']});

          // Hair starts moving, eye ball opens up… the bird is likely to
          // sit on either, so it flies away
          $a('bird').pickRandomFreeWillTarget();
          break;

        case 3:
          // Move the bird in place to pick up the part so that the user
          // doesn’t have to wait later. (Precognition!)
          $a('bird').setTarget({ x: 50, y: 50, land: false });

          // The third dial and set of buttons appear.
          var actor = $a('demonbot-ui');
          $a('demonbot-ui-extension-3').transform({
              x: actor.rect.x + 249, y: actor.rect.y - 183 });
          $a('demonbot-ui-extension-3').setVisible({ visible: true });

          $a('demonbot-ui-extension-3').addTransition({
            duration: 300,
            easing: engine.backEaseInOut,
            properties: { relY: -33 } });

          // The big eye opens all the way.
          $a('demonbot').showAnimation({
              innerId: 'big-eye-right',
              speed: 200,
              count: 1,
              imageIds: ['demonbot/big-eye-right-6',
                         'demonbot/big-eye-right-7',
                         'demonbot/big-eye-right-8',
                         'demonbot/big-eye-right-9',
                         'demonbot/big-eye-right-10',
                         'demonbot/big-eye-right-11',
                         'demonbot/big-eye-right-12']});

          // The right hand starts twiddling. I’m not sure if that’s even
          // a word.
          $a('demonbot').showAnimation({
              innerId: 'right-hand',
              speed: 100,
              count: Infinity,
              imageIds: ['demonbot/right-hand-1', 'demonbot/right-hand-2',
                         'demonbot/right-hand-3', 'demonbot/right-hand-4',
                         'demonbot/right-hand-5', 'demonbot/right-hand-6',
                         'demonbot/right-hand-7', 'demonbot/right-hand-8',
                         'demonbot/right-hand-9', 'demonbot/right-hand-10',
                         'demonbot/right-hand-11', 'demonbot/right-hand-12',
                         'demonbot/right-hand-13', 'demonbot/right-hand-14',
                         'demonbot/right-hand-15', 'demonbot/right-hand-16',
                         'demonbot/right-hand-17', 'demonbot/right-hand-18',
                         'demonbot/right-hand-19', 'demonbot/right-hand-20',
                         'demonbot/right-hand-21', 'demonbot/right-hand-22',
                         'demonbot/right-hand-23', 'demonbot/right-hand-24',
                         'demonbot/right-hand-25', 'demonbot/right-hand-26',
                         'demonbot/right-hand-27', 'demonbot/right-hand-28',
                         'demonbot/right-hand-29', 'demonbot/right-hand-30',
                         'demonbot/right-hand-31', 'demonbot/right-hand-32',
                         'demonbot/right-hand-33', 'demonbot/right-hand-34',
                         'demonbot/right-hand-35', 'demonbot/right-hand-36',
                         'demonbot/right-hand-37', 'demonbot/right-hand-38',
                         'demonbot/right-hand-39', 'demonbot/right-hand-40']
              });
          break;
      }

      engine.addEvents({
        1200: function() {
          $a('demonbot-ui').showOutput();

          $a('demonbot-ui').setInteractive({ interactive: true });
        }
      });
    },

    /**
     * Update the dials based on settings chosen.
     */
    updateDials: function() {
      var waveId = this.WAVE_ID[this.settings.wave - 1];
      var amplitudeId = this.AMPLITUDE_ID[this.settings.amplitude - 1];
      var frequencyId = this.FREQUENCY_ID[this.settings.frequency - 1];

      this.showImage({
          innerId: 'output',
          imageId: 'demonbot/wave-' + waveId + '-' + amplitudeId + '-' +
                   frequencyId });

      $a('demonbot-ui-extension-1').showImage({
          innerId: 'dial',
          imageId: 'demonbot/ui-dial-wave-' + waveId });
      if (this.stage >= 2) {
        $a('demonbot-ui-extension-2').showImage({
            innerId: 'dial',
            imageId: 'demonbot/ui-dial-amplitude-' + amplitudeId });
      }
      if (this.stage >= 3) {
        $a('demonbot-ui-extension-3').showImage({
            innerId: 'dial',
            imageId: 'demonbot/ui-dial-frequency-' + frequencyId });
      }
    },

    /**
     * Sets up the level as interactive or not by setting the interactivity
     * flag for all the actor parts.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      engine.setInteractive(params);
      $a('trurl').setInteractive(params);

      $a('demonbot-ui-extension-1').setInteractive(params);
      if (this.stage >= 2) {
        $a('demonbot-ui-extension-2').setInteractive(params);
      }
      if (this.stage >= 3) {
        $a('demonbot-ui-extension-3').setInteractive(params);
      }
      $a('demonbot-ui-top').setInteractive(params);
    },

    /**
     * Adjust a given setting to go in a given direction.
     * @param {Object} params
     * - {string} id Setting id (e.g. 'amplitude' or 'type').
     * - {number} dir Direction of change (-1 or +1).
     */
    adjustSetting: function(params) {
      this.settings[params.id] += params.dir;

      if (this.settings[params.id] == 4) {
        this.settings[params.id] = 1;
      } else if (this.settings[params.id] == 0) {
        this.settings[params.id] = 3;
      }
    },

    /**
     * Handle various button clicks.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      switch (params.innerId) {
        case 'button-amplitude-right':
          this.adjustSetting({ id: 'amplitude',
              dir: this.directions['amplitude'] });
          this.updateDials();
          break;
        case 'button-amplitude-left':
          this.adjustSetting({ id: 'amplitude',
              dir: -this.directions['amplitude'] });
          this.updateDials();
          break;
        case 'button-frequency-right':
          this.adjustSetting({ id: 'frequency',
              dir: this.directions['frequency'] });
          this.updateDials();
          break;
        case 'button-frequency-left':
          this.adjustSetting({ id: 'frequency',
              dir: -this.directions['amplitude'] });
          this.updateDials();
          break;
        case 'button-wave-right':
          this.adjustSetting({ id: 'wave',
              dir: this.directions['wave'] });
          this.updateDials();
          break;
        case 'button-wave-left':
          this.adjustSetting({ id: 'wave',
              dir: -this.directions['wave'] });
          this.updateDials();
          break;
        case 'button-activate':
          switch (this.stage) {
            case 1:
              if (this.settings.wave == 1) {
                this.finishStage();
                return;
              }
              break;
            case 2:
              if ((this.settings.wave == 1) &&
                  (this.settings.amplitude == 1)) {
                this.finishStage();
                return;
              }
              break;
            case 3:
              if ((this.settings.wave == 1) &&
                  (this.settings.frequency == 1) &&
                  (this.settings.amplitude == 1)) {
                this.finishStage();
                return;
              }
              break;
          }

          // Getting here means that the settings were incorrect.

          this.setInteractive({ interactive: false });
          $a('hints').failedAttempt();
          $a('trurl').negatory({
            onFinish: function() {
              $a('demonbot-ui').setInteractive({ interactive: true });
            }
          });
          break;
      }
    }
  },

  /* ------------------------------------------------------------------------
   * Level 3 actors and scenery.
   * ------------------------------------------------------------------------
   */
  'babybot-explosion': {
    WIDTH: 210,
    HEIGHT: 188,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +3,

    explode: function() {
      // We have four different types of explosions; we choose one at random.
      var type = engine.intRangeRand({ min: 1, max: 4 });

      this.showAnimation({
          speed: 75,
          count: 1,
          clearOnFinish: true,
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER],
          imageIds: ['explosions/explosion-' + type + '-1',
                     'explosions/explosion-' + type + '-2',
                     'explosions/explosion-' + type + '-3',
                     'explosions/explosion-' + type + '-4',
                     'explosions/explosion-' + type + '-5',
                     'explosions/explosion-' + type + '-6',
                     'explosions/explosion-' + type + '-7',
                     'explosions/explosion-' + type + '-8',
                     'explosions/explosion-' + type + '-9',
                     'explosions/explosion-' + type + '-10']});
    }
  },

  'babybot-projectile': {
    WIDTH: 120,
    HEIGHT: 121,
    PLANE: engine.PLANE_FOREGROUND,
    PLANE_CORRECTION: +2,
    CLAMP_ROTATE: 24,
    NEVER_AUTO_HIDE: true,

    PLANET_HIT_DIAMETER: .9,
    MOMENTUM_ADJUSTMENT: 15,

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 'flying-up':
          $a('babybot-projectile').showAnimation({
            speed: 10,
            count: 1,
            imageIds: ['babybot/cannon-baby-flying-up-half',
                       'babybot/cannon-baby-flying-up-half',
                       'babybot/cannon-baby-flying-up-full']
          });

          $a('babybot-projectile').transform({
              plane: engine.PLANE_FOREGROUND });

          break;
        case 'falling-down':
          $a('babybot-projectile').transform({
              plane: engine.PLANE_BACKGROUND });

          $a('babybot-projectile').showImage({
            imageId: 'babybot/cannon-baby-falling-down',
            align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER]
          });
          break;
      }
    },

    /**
     * Monitor the baby falling down and see if it hits the planet.
     */
    tick: function() {
      if (this.state == 'falling-down') {
        var actor = $a('babybot-planet');

        var planetX = actor.rect.x + actor.CENTER_X;
        var planetY = actor.rect.y + actor.CENTER_Y;

        var projectileX = this.rect.x + (this.WIDTH / 2);
        var projectileY = this.rect.y + (this.HEIGHT / 2) +
                          this.MOMENTUM_ADJUSTMENT;

        var distance =
            Math.sqrt((projectileX - planetX) * (projectileX - planetX) +
                      (projectileY - planetY) * (projectileY - planetY));

        // (planetY > 0) means the planet needs to visible for the hit to
        // count.
        if ((planetY > 0) &&
            (distance <= (actor.moonDiameter * this.PLANET_HIT_DIAMETER))) {
          $a('babybot-planet').increaseDifficulty();
          $a('babybot-cannon').targetHit();
        }
      }
    }
  },

  'babybot-cannon': {
    WIDTH: 152,
    HEIGHT: 316,
    PLANE: engine.PLANE_FOREGROUND,

    INNER_RECTS: {
      'body': { x: 10 - 10, y: 44 - 10, width: 132 + 20, height: 250 + 20,
                pivotX: 0, pivotY: 100, clampRotate: 1,
                connected: [
                  { pivotX: -30, pivotY: -100, innerId: 'button-left' },
                  { pivotX: 30, pivotY: -100, innerId: 'button-right' },
                  { pivotX: 0, pivotY: -100, innerId: 'button-activate' },
                  { pivotX: 0, pivotY: -150, innerId: 'baby' }
                ]
                },
      'wheel': { x: 22 - 10, y: 206 - 10, width: 110 + 20, height: 110 + 20,
                 pivotX: 0, pivotY: 0, clampRotate: 24 },
      'button-left': { x: 43, y: 145, width: 17, height: 26,
                       pivotX: 0, pivotY: 0, clampRotate: 2.5 },
      'button-right': { x: 96, y: 145, width: 17, height: 27,
                        pivotX: 0, pivotY: 0, clampRotate: 2.5 },
      'button-activate': { x: 61, y: 134, width: 34, height: 38,
                           pivotX: 0, pivotY: 0, clampRotate: 2.5 },
      // Lower height = poor man’s crop.
      'baby': { x: 15, y: 10, width: 120, height: 48, forceHeight: true }
    },

    // How much does it take to get the cannon of the screen.
    OFF_SCREEN_DISTANCE: 310,
    // The minimum or maximum position on the screen during the game play.
    // The cannon is not allowed further left or right than those.
    MIN_POS_X: -30,
    MAX_POS_X: 301,

    // Whether the baby is currently loaded into the cannon.
    babyLoaded: false,

    init: function() {
      this.showImage({ innerId: 'body',
                       imageId: 'babybot/cannon-body' });
      this.showImage({ innerId: 'wheel',
                       imageId: 'babybot/cannon-wheel' });
      this.showImage({ innerId: 'button-left',
                       imageId: 'babybot/cannon-button-left' });
      this.showImage({ innerId: 'button-right',
                       imageId: 'babybot/cannon-button-right' });
      this.showImage({ innerId: 'button-activate',
                       imageId: 'babybot/cannon-button-activate' });

      this.clear({ innerId: 'baby' });
    },

    /**
     * Makes the user able to move the cannon… or not.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      engine.setInteractive(params);
      $a('trurl').setInteractive(params);

      this.turnIntoButton({
        innerId: 'button-left', clickable: params.interactive,
        noPadding: true,
        pressAnimImageIds: ['babybot/cannon-button-left-press'],
        unpressAnimImageIds: ['babybot/cannon-button-left']
      });
      this.turnIntoButton({
        innerId: 'button-right', clickable: params.interactive,
        noPadding: true,
        pressAnimImageIds: ['babybot/cannon-button-right-press'],
        unpressAnimImageIds: ['babybot/cannon-button-right']
      });
      this.turnIntoButton({
        innerId: 'button-activate', clickable: params.interactive,
        noPadding: true,
        pressAnimImageIds: ['babybot/cannon-button-activate-press'],
        unpressAnimImageIds: ['babybot/cannon-button-activate']
      });
    },

    /**
     * Move the cannon in a certain direction by a certain amount.
     * @param {Object} params
     * - {number} .dir Direction (-1 = left, +1 = right).
     * - {boolean} .onScreen Whether the cannon arrives on screen.
     * - {boolean} .offScreen Whether the cannon disappears off screen.
     */
    moveCannon: function(params) {
      this.setInteractive({ interactive: false });

      if (params.dir == 1) {
        var dirText = 'right';
      } else {
        var dirText = 'left';
      }

      if (params.offScreen) {
        var moveDistance = this.rect.x + this.OFF_SCREEN_DISTANCE;
      } else if (params.onScreen) {
        var moveDistance = this.OFF_SCREEN_DISTANCE;
      } else {
        // The regular distance is actually random.
        var moveDistance = engine.rangeRand({ min: 20, max: 75 });

        // Don’t move the cannon if it tries to get off the screen.
        if ((params.dir == 1) &&
            ((this.rect.x + moveDistance) > this.MAX_POS_X)) {
          moveDistance = 0;
        } else if ((params.dir == -1) &&
                   ((this.rect.x - moveDistance) < this.MIN_POS_X)) {
          moveDistance = 0;
        }
      }

      var moveRotation = moveDistance * 3.333;

      // Animate the baby rocking inside the cannon.
      if (this.babyLoaded) {
        $a('babybot-cannon').showAnimation({
            innerId: 'baby',
            speed: 40,
            count: 1,
            imageIds: ['babybot/cannon-baby-' + dirText + '-1',
                       'babybot/cannon-baby-' + dirText + '-1',
                       'babybot/cannon-baby-' + dirText + '-2',
                       'babybot/cannon-baby-' + dirText + '-3',
                       'babybot/cannon-baby-' + dirText + '-3',
                       'babybot/cannon-baby-' + dirText + '-3',
                       'babybot/cannon-baby-' + dirText + '-4',
                       'babybot/cannon-baby-' + dirText + '-4',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-5',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-6',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-7',
                       'babybot/cannon-baby-' + dirText + '-8',
                       'babybot/cannon-baby-' + dirText + '-8',
                       'babybot/cannon-baby-inside'
                        ]});
      }

      engine.addEvents({
        0: function() {
          $a('babybot-cannon').addTransition({
            easing: engine.backEaseInOut,
            duration: 2000, properties: { relX: params.dir * moveDistance }
          });

          $a('babybot-cannon').addTransition({
            innerId: 'wheel',
            easing: engine.backEaseInOut,
            duration: 2000, properties: { relRotate: params.dir * moveRotation }
          });

          $a('babybot-cannon').addTransition({
            innerId: 'body',
            easing: engine.easeOut,
            duration: 250, properties: { rotate: params.dir * 5 }
          });

          $a('babybot-cannon').addTransition({
            innerId: 'baby',
            easing: engine.easeInOut,
            alternate: true,
            count: 2,
            duration: 250, properties: { relX: params.dir * 2 }
          });
        },
        250: function() {
          $a('babybot-cannon').addTransition({
            innerId: 'body',
            easing: engine.easeOut,
            duration: 1250, properties: { rotate: -params.dir * 5 }
          });
        },
        500: function() {
          $a('babybot-cannon').addTransition({
            innerId: 'baby',
            easing: engine.easeInOut,
            alternate: true,
            count: 2,
            duration: 750, properties: { relX: -params.dir * 7 }
          });
        },
        1500: function() {
          $a('babybot-cannon').addTransition({
            innerId: 'body',
            easing: engine.easeOut,
            duration: 1000, properties: { rotate: 0 }
          });
        },
        2000: function() {
          if (engine.curSceneId == 'level-3') {
            $a('babybot-cannon').setInteractive({ interactive: true });
          }
        }
      });
    },

    /**
     * The baby hits the planet! Hilarity ensues.
     */
    targetHit: function() {
      engine.addEvents({
        0: function() {
          $a('trurl').setState({ state: 'happy' });

          engine.removeTransition({ id: 'fall-projectile' });
          engine.removeTransition({ id: 'babybot-planet-passage' });

          $a('babybot-projectile').setVisible({ visible: false });

          // The planet bounces down a little bit, because Newton’s second
          // law is optional in this universe.
          $a('babybot-planet').addTransition({
              easing: engine.strongBackEaseOut,
              duration: 250,
              properties: { relY: $a('babybot-planet').moonDiameter / 4 }
          });

          // We use the explosion on the surface on the planet partly to
          // cover up the fact that the planet changes and gets bigger.
          var no = $a('babybot-planet').state;
          $a('babybot-planet').showAnimation({
            innerId: 'explosion',
            speed: 80,
            count: 1,
            clearOnFinish: true,
            imageIds: ['babybot/planet-' + no + '-explosion-1',
                       'babybot/planet-' + no + '-explosion-2',
                       'babybot/planet-' + no + '-explosion-3',
                       'babybot/planet-' + no + '-explosion-4']});
        },
        200: function() {
          // What he said above. “The planet changes and gets bigger.”
          var state = $a('babybot-planet').state;
          $a('babybot-planet').setState({ state: state + 1 });
        },
        3500: function() {
          var state = $a('babybot-planet').state;

          if (state < 4) {
            engine.addEvents({
              2500: function() {
                $a('babybot-cannon').loadNewBaby();
              }
            });
          } else {
            engine.goToNextScene();
          }
        },
        3800: function() {
          // The planet continues on its voyage.
          $a('babybot-planet').startPassage({ continuePassage: true });
        }
      });
    },

    /**
     * Load the new baby into the cannon. Seriously. Read the story.
     */
    loadNewBaby: function() {
      engine.addEvents({
        0: function() {
          $a('babybot-cannon').babyLoaded = true;

          $a('babybot-cannon').showAnimation({
              innerId: 'baby',
              speed: 40,
              count: 1,
              imageIds: ['babybot/cannon-baby-new-1',
                         'babybot/cannon-baby-new-2',
                         'babybot/cannon-baby-new-3',
                         'babybot/cannon-baby-new-4',
                         'babybot/cannon-baby-new-5',
                         'babybot/cannon-baby-new-6',
                         'babybot/cannon-baby-new-7',
                         'babybot/cannon-baby-new-8',
                         'babybot/cannon-baby-new-9',
                         'babybot/cannon-baby-new-10',
                         'babybot/cannon-baby-new-11',
                         'babybot/cannon-baby-new-12',
                         'babybot/cannon-baby-new-13',
                         'babybot/cannon-baby-new-14',
                         'babybot/cannon-baby-new-15',
                         'babybot/cannon-baby-new-15',
                         'babybot/cannon-baby-new-16',
                         'babybot/cannon-baby-new-16',
                         'babybot/cannon-baby-new-16',
                         'babybot/cannon-baby-inside']});
        },
        800: function() {
          $a('babybot-cannon').setInteractive({ interactive: true });
        }
      });
    },

    /**
     * Shoot the baby from the cannon.
     */
    fire: function() {
      this.setInteractive({ interactive: false });

      this.babyLoaded = false;

      engine.addEvents({
        0: function() {
          // First the baby gets loaded into the cannon…
          $a('babybot-cannon').showAnimation({
            innerId: 'baby',
            speed: 40,
            count: 1,
            imageIds: ['babybot/cannon-baby-load-1',
                       'babybot/cannon-baby-load-1',
                       'babybot/cannon-baby-load-2',
                       'babybot/cannon-baby-load-2',
                       'babybot/cannon-baby-load-2',
                       'babybot/cannon-baby-load-3',
                       'babybot/cannon-baby-load-4',
                       'babybot/cannon-baby-load-5',
                       'babybot/cannon-baby-load-6',
                       'babybot/cannon-baby-load-7',
                       'babybot/cannon-baby-load-8',
                       'babybot/cannon-baby-load-9',
                       'babybot/cannon-baby-load-10',
                       'babybot/cannon-baby-load-11',
                       'babybot/cannon-baby-load-12',
                       'babybot/cannon-baby-load-13',
                       'babybot/cannon-baby-load-14',
                       'babybot/cannon-baby-load-15'
                        ]});
        },
        1200: function() {
          // Then we quietly replace it with the projectile that goes
          // all the way up (and a little explosion).
          var actor = $a('babybot-cannon');

          $a('babybot-projectile').transform({
              x: actor.rect.x + 15, y: actor.rect.y - 63 });
          $a('babybot-projectile').setVisible({ visible: true });
          $a('babybot-projectile').transform({ innerId: engine.MAIN_RECT_ID,
              rotate: 0 });
          $a('babybot-projectile').setState({ state: 'flying-up' });

          $a('babybot-explosion').setVisible({ visible: true });
          $a('babybot-explosion').transform({
              x: actor.rect.x - 30, y: actor.rect.y - 54 });
          $a('babybot-explosion').explode();

          $a('babybot-projectile').addTransition({
            easing: engine.linear,
            duration: 400, properties: { y: -150 } });
        },
        2500: function() {
          // Then the projectile falls down and this is when it’s supposed
          // to hit the planet.
          $a('babybot-projectile').setState({ state: 'falling-down' });

          // Rotate the projectile randomly either left or right.
          $a('babybot-projectile').addTransition({
            innerId: engine.MAIN_RECT_ID,
            easing: engine.linear,
            duration: 2500,
            properties: { rotate: engine.setRand({ set: [-360, 360] }) } });

          $a('babybot-projectile').addTransition({
            id: 'fall-projectile',
            easing: engine.linear,
            onFinish: function() {
              $a('hints').failedAttempt();
              $a('babybot-planet').decreaseDifficulty();
              $a('trurl').negatory();

              engine.addEvents({
                750: function() {
                  $a('babybot-cannon').loadNewBaby();
                }
              });
            },
            duration: 2500, properties: { y: 470 } });
        }
      });
    },

    /**
     * React to clicks on buttons in some pretty obvious ways.
     * @param {Object} params
     * - {string} .innerId An optional id of an inner rect that’s clicked (if
     *                     not, the entire actor has been clicked).
     */
    onClick: function(params) {
      switch (params.innerId) {
        case 'button-left':
          this.moveCannon({ dir: -1 });
          break;
        case 'button-right':
          this.moveCannon({ dir: +1 });
          break;
        case 'button-activate':
          this.fire();
          break;
      }
    }
  },

  'babybot-planet-moon': {
    WIDTH: 46,
    HEIGHT: 57,
    PLANE: engine.PLANE_SKY,
    PLANE_CORRECTION: +3,
    NEVER_AUTO_HIDE: true,

    init: function() {
      // Put off-screen so it doesn’t blink when it first appears.
      // TODO(mwichary): Actually, the engine should do that with all the
      // actors to begin with.
      this.transform({ x: -999 });
      this.setState({ state: 1 });
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      this.showImage({
          imageId: 'babybot/planet-' + params.state + '-moon',
          align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER] });
    }
  },

  'babybot-gift': {
    WIDTH: 107,
    HEIGHT: 76,
    PLANE: engine.PLANE_SKY,
    PLANE_CORRECTION: +3,

    init: function() {
      this.showImage({ imageId: 'babybot/gift-1' });
    }
  },

  'babybot-planet': {
    WIDTH: 210,
    HEIGHT: 253,
    PLANE: engine.PLANE_SKY,
    PLANE_CORRECTION: +2,
    NEVER_AUTO_HIDE: true,

    INNER_RECTS: {
      'planet': { x: 0, y: 0, width: 210, height: 253 },
      'opening': { x: 110, y: 134, width: 40, height: 32 },
      'ambiance': { x: 0, y: 0, width: 210, height: 253 },
      'explosion': { x: 0, y: 0, width: 210, height: 253 }
    },

    // The center of the square planet.
    CENTER_X: 120,
    CENTER_Y: 140,

    // Difficulty changes from 0 to 10 (0 = hardest).
    difficulty: 3,

    init: function() {
      // The more times you launch the doodle, the harder it gets (to
      // a point).
      this.difficulty -= engine.globalPlayCount;
      if (this.difficulty < 0) {
        this.difficulty = 0;
      }
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      switch (params.state) {
        case 1:
          this.showImage({ innerId: 'planet', imageId: 'babybot/planet-1' });
          this.moonDiameter = 55;

          this.showAnimation({
            innerId: 'ambiance',
            speed: 150,
            imageIds: ['babybot/planet-1-ambiance-1',
                       'babybot/planet-1-ambiance-2',
                       'babybot/planet-1-ambiance-3',
                       'babybot/planet-1-ambiance-4',
                       'babybot/planet-1-ambiance-5',
                       'babybot/planet-1-ambiance-6',
                       'babybot/planet-1-ambiance-7',
                       'babybot/planet-1-ambiance-8',
                       'babybot/planet-1-ambiance-9',
                       'babybot/planet-1-ambiance-10',
                       'babybot/planet-1-ambiance-11',
                       'babybot/planet-1-ambiance-12',
                       'babybot/planet-1-ambiance-13',
                       'babybot/planet-1-ambiance-14',
                       'babybot/planet-1-ambiance-15',
                       'babybot/planet-1-ambiance-16',
                       'babybot/planet-1-ambiance-17',
                       'babybot/planet-1-ambiance-18',
                       'babybot/planet-1-ambiance-19',
                       'babybot/planet-1-ambiance-20']});
          break;
        case 2:
          $a('sky').setStyle({ speed: 150, opacity: .3 });

          this.showImage({ innerId: 'planet', imageId: 'babybot/planet-2' });
          this.moonDiameter = 70;

          this.showAnimation({
            innerId: 'ambiance',
            speed: 150,
            imageIds: ['babybot/planet-2-ambiance-1',
                       'babybot/planet-2-ambiance-2',
                       'babybot/planet-2-ambiance-3',
                       'babybot/planet-2-ambiance-4',
                       'babybot/planet-2-ambiance-5']});
          break;
        case 3:
          $a('sky').setStyle({ speed: 250, opacity: .3 });

          this.showImage({ innerId: 'planet', imageId: 'babybot/planet-3' });
          this.moonDiameter = 100;

          this.showAnimation({
            innerId: 'ambiance',
            speed: 150,
            imageIds: ['babybot/planet-3-ambiance-1',
                       'babybot/planet-3-ambiance-2',
                       'babybot/planet-3-ambiance-3',
                       'babybot/planet-3-ambiance-4',
                       'babybot/planet-3-ambiance-5']});
          break;
        case 4:
          $a('sky').setStyle({ speed: 350, opacity: .3 });

          this.showImage({ innerId: 'planet', imageId: 'babybot/planet-4' });
          this.moonDiameter = 140;

          this.showAnimation({
            innerId: 'ambiance',
            speed: 150,
            imageIds: ['babybot/planet-4-ambiance-1',
                       'babybot/planet-4-ambiance-2',
                       'babybot/planet-4-ambiance-3',
                       'babybot/planet-4-ambiance-4',
                       'babybot/planet-4-ambiance-5']});
          break;
      }

      $a('babybot-planet-moon').setState(params);
    },

    /**
     * Calculate the position of the moon around the planet. The moon both
     * circles around the planet, but so is the plane on which it circles
     * the planet. Woo.
     */
    tick: function() {
      if (this.rect.visible) {
        var x = this.rect.x + this.CENTER_X -
                $a('babybot-planet-moon').rect.width / 2;
        var y = this.rect.y + this.CENTER_Y -
                $a('babybot-planet-moon').rect.height / 2;

        var angle1 = engine.curGameTime / 1000;
        var sin1 = Math.sin(angle1);

        // Depending on the angle, the moon can be in front or behind the
        // planet.
        if ((engine.modulo({ val: angle1 + Math.PI * 1 / 2,
                             mod: Math.PI * 2 })) > Math.PI) {
          $a('babybot-planet-moon').transform({ planeCorrection: +4 });
        } else {
          $a('babybot-planet-moon').transform({ planeCorrection: +1 });
        }

        var angle2 = engine.curGameTime / 12000;
        var sin2 = Math.sin(angle2);
        var cos2 = Math.cos(angle2);

        var dist = this.moonDiameter * sin1;

        x += sin2 * dist;
        y += cos2 * dist;

        $a('babybot-planet-moon').transform({ x: x, y: y });
      }
    },

    /**
     * Decrease the difficulty of the doodle (= the planet gets slower).
     * We do this when the user is having trouble.
     */
    decreaseDifficulty: function() {
      this.difficulty++;

      if (this.difficulty > 10) {
        this.difficulty = 10;
      }
    },

    /**
     * Increase the difficulty. We do this after a successful hit.
     */
    increaseDifficulty: function() {
      this.difficulty--;

      if (this.difficulty < 0) {
        this.difficulty = 0;
      }
    },

    /**
     * Start (or continue) the passage of the planet from one end of the
     * screen to another.
     * @param {Object} params
     * - {boolean} .continuePassage Whether the planet is already in the
     *                              middle of the screen and the passage
     *                              continues instead of starting from scratch.
     */
    startPassage: function(params) {
      // This means that we’re done with this level – the planet should move
      // to the center in preparation to drop the gift.
      if (this.state == 4) {
        $a('babybot-planet').addTransition({
          id: 'babybot-planet-passage',
          easing: engine.backEaseInOut,
          duration: 1200, properties: { x: 100, y: 20 } });
        return;
      }

      if ((engine.curSceneId == 'level-3') ||
          (engine.curSceneId == 'level-3-ending') ||
          (engine.curSceneId == 'intermission-level-2-level-3')) {

        switch (this.state) {
          case 1:
            // Go from right to left.
            var speed = engine.rangeRand({ min: 12000, max: 14000 });

            var startX = 380;
            var startY = engine.rangeRand({ min: -30, max: 50 });

            var endX = -140;
            var endY = engine.rangeRand({ min: -50, max: 110 });
            break;
          case 2:
            // Go from left to right – a bit faster.
            var speed = engine.rangeRand({ min: 8000, max: 10000 });

            var startX = -200;
            var startY = engine.rangeRand({ min: 20, max: 120 });

            var endX = 460;
            var endY = engine.rangeRand({ min: -80, max: 90 });
            break;
          case 3:
            // Go from middle top to bottom left. This forces the user to
            // actually move the cannon to hit the planet.
            var speed = engine.rangeRand({ min: 4000, max: 6000 });

            var startX = 200;
            var startY = -200;

            var endX = -200;
            var endY = engine.rangeRand({ min: 300, max: 400 });
            break;
        }

        speed += this.difficulty * 1000;

        // We continue the passage instead of starting it after the planet
        // is hit.
        if (params && params.continuePassage) {
          var origDistance = startX - endX;
          var currentDistance = this.rect.x - endX;
          var speed = speed / origDistance * currentDistance;
          var easing = engine.easeIn;
        } else {
          this.transform({ x: startX, y: startY });
          var easing = engine.linear;
        }

        $a('babybot-planet').addTransition({
          id: 'babybot-planet-passage',
          easing: easing,
          onFinish: function() {
            // Scheduling the next passage to start after this one ends.
            $a('babybot-planet').startPassage();
          },
          duration: speed,
          properties: { x: endX, y: endY } });
      }
    }
  },

  'babybot-star-1': {
    WIDTH: 11,
    HEIGHT: 11,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-star' });
    }
  },

  'babybot-star-2': {
    WIDTH: 11,
    HEIGHT: 11,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-star' });
    }
  },

  'babybot-star-3': {
    WIDTH: 11,
    HEIGHT: 11,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-star' });
    }
  },

  'babybot-star-4': {
    WIDTH: 11,
    HEIGHT: 11,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-star' });
    }
  },

  'babybot-star-5': {
    WIDTH: 11,
    HEIGHT: 11,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-star' });
    }
  },

  'babybot-constellation-1': {
    WIDTH: 83,
    HEIGHT: 85,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-constellation-1' });
    }
  },

  'babybot-constellation-2': {
    WIDTH: 43,
    HEIGHT: 68,
    PLANE: engine.PLANE_SKY,

    init: function() {
      this.showImage({ imageId: 'babybot/bk-constellation-2' });
    }
  },

  /* ------------------------------------------------------------------------
   * Micellany.
   * ------------------------------------------------------------------------
   */
  'mask-canvas': {
    WIDTH: engine.INITIAL_WIDTH + engine.TOOLBAR_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECTION: +1,

    INNER_RECTS: {
      'left': { x: 0, y: 0, width: 7, height: engine.EXPANDED_HEIGHT },
      'right': { x: engine.INITIAL_WIDTH + engine.TOOLBAR_WIDTH - 6,
                 y: 0, width: 6, height: engine.EXPANDED_HEIGHT }
    },

    init: function() {
      this.showImage({
          innerId: 'left', imageId: 'background/mask-big-left' });
      this.showImage({
          innerId: 'right', imageId: 'background/mask-big-right' });
    }
  },

  'mask-big': {
    WIDTH: engine.INITIAL_WIDTH + engine.TOOLBAR_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_TOOLBAR,
    PLANE_CORRECTION: -1,

    INNER_RECTS: {
      'right': { x: engine.INITIAL_WIDTH - 6, y: 0,
                 width: 6, height: engine.EXPANDED_HEIGHT },
      'toolbar': { x: engine.INITIAL_WIDTH, y: 0,
                   width: engine.TOOLBAR_WIDTH,
                   height: engine.EXPANDED_HEIGHT }
    },

    init: function() {
      this.showImage({
          innerId: 'right', imageId: 'background/mask-big-right' });
      this.showWhite({ innerId: 'toolbar' });
    }
  },

  'mask-small': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_GROUND,

    INNER_RECTS: {
      'left': { x: 0, y: 0, width: 37, height: engine.EXPANDED_HEIGHT },
      'right': { x: engine.INITIAL_WIDTH - 36, y: 0,
                 width: 36, height: engine.EXPANDED_HEIGHT }
    },

    init: function() {
      this.showImage({
          innerId: 'left', imageId: 'background/mask-small-left' });
      this.showImage({
          innerId: 'right', imageId: 'background/mask-small-right' });
    }
  },

  'ground': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: 65,
    PLANE: engine.PLANE_GROUND,

    init: function() {
      this.showWhite();
    }
  },

  'mountains': {
    WIDTH: 4500,
    HEIGHT: 300,
    PLANE: engine.PLANE_FW_MOUNTAINS,

    INNER_RECTS: {
      'mountain': { x: 388, y: 30, width: 548, height: 130 }
    },

    init: function() {
      this.showImage({
          innerId: 'mountain', imageId: 'background/mountain-1' });
    }
  },

  'bk-mountains': {
    WIDTH: 4500,
    HEIGHT: 300,
    PLANE: engine.PLANE_BK_MOUNTAINS,

    INNER_RECTS: {
      'mountain': { x: 650, y: 80, width: 773, height: 81 }
    },

    init: function() {
      this.showImage({
          innerId: 'mountain', imageId: 'background/mountain-2' });
    }
  },

  // The fake loading progress bar if we’re stalled waiting for images to
  // arrive (we try to preload images early, but we have to be ready for
  // the opportunity of them loading really slowly). We’re essentially
  // halting the game, and arbitrarily advance the progress bar over the
  // course of 2.5 seconds. (We can’t really know what’s the progress,
  // so we have to fake it.)
  'loading': {
    WIDTH: 353,
    HEIGHT: 197,
    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECTION: +1,
    NEVER_AUTO_HIDE: true,

    // A couple of fake progress bar segments.
    INNER_RECTS: {
      'progress-bar-1': { x: 6, y: 169, width: 68, height: 24 },
      'progress-bar-2': { x: 75, y: 169, width: 68, height: 24 },
      'progress-bar-3': { x: 143, y: 169, width: 68, height: 24 },
      'progress-bar-4': { x: 212, y: 169, width: 68, height: 24 },
      'progress-bar-5': { x: 280, y: 169, width: 68, height: 24 }
    },

    // The delay (in ms) between incrementing segments.
    FAKE_LOADING_DELAY: 500,
    // The number of segments (= 100% progress).
    MAX_PROGRESS: 5,

    // Current progress (from 0 to MAX_PROGRESS).
    progress: 0,

    /**
     * Schedule the next progress bar segment to arrive. Since at this
     * moment our engine timeline is halted, we need to use regular
     * setTimeout.
     */
    scheduleAdvance: function() {
      window.setTimeout(function() { $a('loading').advance(); },
                        this.FAKE_LOADING_DELAY);
    },

    /**
     * Advance the progress bar by showing the next segment.
     */
    advance: function() {
      if (this.rect.visible) {
        this.progress++;

        this.showImage({ innerId: 'progress-bar-' + this.progress,
                         imageId: 'ui/loading-progress-bar' });

        if (this.progress < this.MAX_PROGRESS) {
          this.scheduleAdvance();
        }
      }
    },

    /**
     * Show the initial state of the loading (an icon + empty progress bar).
     */
    show: function() {
      for (var i = 1; i <= this.MAX_PROGRESS; i++) {
        this.clear({ innerId: 'progress-bar-' + i });
      }

      this.transform({
          x: 35,
          // Center vertically.
          y: (engine.bodyOffsetY + engine.EXPANDED_HEIGHT -
              this.rect.height) / 2 - 18 });
      this.setVisible({ visible: true });
      this.showImage({ imageId: 'ui/loading' });

      this.scheduleAdvance();

      // Temporarily hide the toolbar icons.
      $a('toolbar-tooltip').transform({ relX: 999 });
      $a('toolbar-wait').transform({ relX: 999 });
    },

    /**
     * Hide the loading message (when the images finally arrived).
     */
    hide: function() {
      // Show back the toolbar icons.
      $a('toolbar-tooltip').transform({ relX: -999 });
      $a('toolbar-wait').transform({ relX: -999 });

      this.setVisible({ visible: false });
    }
  },

  'toolbar-tooltip': {
    WIDTH: 19,
    HEIGHT: 33,
    PLANE: engine.PLANE_TOOLBAR,
    NEVER_AUTO_HIDE: true,

    init: function() {
      this.transform({ x: 432, y: engine.bodyOffsetY });
      this.showImage({ imageId: 'ui/button-tooltip' });

      this.turnIntoButton({
        clickable: true,
        pressAnimImageIds: ['ui/button-tooltip-press-1',
                            'ui/button-tooltip-press-2'],
        unpressAnimImageIds: ['ui/button-tooltip-press-1',
                              'ui/button-tooltip']
      });
    },

    /**
     * Toggle the tooltip if clicked.
     */
    onClick: function() {
      $a('tooltip').toggle();
    }
  },

  'toolbar-wait': {
    WIDTH: 31,
    HEIGHT: 62,
    PLANE: engine.PLANE_TOOLBAR,
    NEVER_AUTO_HIDE: true,

    INNER_RECTS: {
      'wait': { x: 1, y: 30, width: 19, height: 20 },
      'ffwd': { x: 2, y: 4, width: 24, height: 20 }
    },

    // What’s the threshold (in ms) between something been a click and a
    // sustained hold.
    CLICK_THRESHOLD: 500,

    // Whether the ffwd button is currently held pressed.
    held: false,
    // The time when the ffwd button started being pressed.
    heldStartTime: null,
    // Original status of fast forwarding at the moment it’s pressed again.
    // If we just click it, it toggles on and off. But if we click and hold
    // it longer, it’s always deactivated if we let go.
    origFastForwardingStatus: false,

    init: function() {
      this.transform({ x: 430, y: 510 });
    },

    /**
     * Show the wait animation and also fast forwarding button if it’s
     * available.
     * @param {Object} params
     * - {boolean} .fastForwardAvailable Whether fast forward is available.
     */
    show: function(params) {
      this.held = false;
      this.curPressed = false;

      if (params.fastForwardAvailable) {
        this.showImage({ innerId: 'ffwd', imageId: 'ui/button-ffwd' });

        this.turnIntoButton({
          innerId: 'ffwd',
          clickable: true,
          pressAnimImageIds: ['ui/button-ffwd-press-1',
                              'ui/button-ffwd-press-2'],
          unpressAnimImageIds: ['ui/button-ffwd-press-1',
                                'ui/button-ffwd']
        });
      }

      this.showAnimation({
        innerId: 'wait',
        speed: engine.rangeRand({ min: 100, max: 200 }),
        imageIds: ['ui/toolbar-wait-1',
                   'ui/toolbar-wait-2',
                   'ui/toolbar-wait-3',
                   'ui/toolbar-wait-4',
                   'ui/toolbar-wait-5',
                   'ui/toolbar-wait-6',
                   'ui/toolbar-wait-7',
                   'ui/toolbar-wait-8']});
    },

    /**
     * Hide the fast forwarding button.
     */
    hide: function() {
      engine.fastForwarding = false;

      this.clear({ innerId: 'wait' });
      this.clear({ innerId: 'ffwd' });

      this.turnIntoButton({
        innerId: 'ffwd',
        clickable: false,
        pressAnimImageIds: ['ui/button-ffwd-press-1',
                            'ui/button-ffwd-press-2'],
        unpressAnimImageIds: ['ui/button-ffwd-press-1', 'ui/button-ffwd']
      });
    },
    /**
     * Figure out whether it’s being pressed or held.
     */
    tick: function() {
      if (this.curPressed) {
        // This means that the user started holding the ffwd button.
        // We remember the time when it happened. We support two modes
        // of operation: 1) fast forwarding when holding the button, returns
        // to normal speed when the button is released… and 2) clicking to
        // toggle between fast forward and normal speed. The threshold to
        // distinguish between click and hold is 500ms. Mouse down/up within
        // 500ms = click, mouse down/up longer than 500ms = holding.

        if (!this.held) {
          this.held = true;
          this.heldStartTime = engine.lastPhysicalTime;
          this.origFastForwardingStatus = engine.fastForwarding;
          engine.fastForwarding = true;
        }
      } else {
        // Mouse pointer left the button with mouse down, e.g. no click.
        if (this.held) {
          this.held = false;
          engine.fastForwarding = false;
        }
      }
    },

    /**
     * React to the click (or, mouse up).
     */
    onClick: function() {
      if (engine.lastPhysicalTime - this.heldStartTime <
          this.CLICK_THRESHOLD) {
        engine.fastForwarding = !this.origFastForwardingStatus;
      } else {
        engine.fastForwarding = false;
      }

      this.held = false;

      if (engine.fastForwarding) {
        this.showImage({ innerId: 'ffwd',
                         imageId: 'ui/button-ffwd-press-1' });
      } else {
        this.showImage({ innerId: 'ffwd', imageId: 'ui/button-ffwd' });
      }
    }
  },

  'mouse-pointer': {
    WIDTH: 32,
    HEIGHT: 43,
    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECTION: +1,
    NEVER_AUTO_HIDE: true,

    // Tip of the pointer (from top-left corner) for each cursor type.
    POINTER_CORRECTIONS: {
      'normal': { x: 11, y: 8 },
      'hover': { x: 5, y: 7 },
      'click': { x: 5, y: 7 }
    },

    interactive: false,

    init: function() {
      this.setState({ state: 'normal' });
    },

    /**
     * Change the current state.
     * @param {Object} params
     * - {string} .state New state identifier.
     */
    setState: function(params) {
      this.state = params.state;
      this.updateState();
    },

    /**
     * Sync our mouse pointer to the system mouse pointer.
     */
    sync: function() {
      // Don’t show mouse pointer on touch devices.
      if (engine.features.touch || !this.rect.visible) {
        return;
      }

      var scrollLeft = (document.documentElement.scrollLeft || 0) +
          (document.body.scrollLeft || 0);
      var scrollTop = (document.documentElement.scrollTop || 0) +
          (document.body.scrollTop || 0);

      this.transform({
        x: engine.mouseX - engine.bodyPos.left +
           scrollLeft - this.POINTER_CORRECTIONS[this.state].x,
        y: engine.mouseY - engine.bodyPos.top +
           scrollTop + engine.bodyOffsetY -
           this.POINTER_CORRECTIONS[this.state].y
      });
    },

    /**
     * Remembers whether the level is interactive.
     * @param {Object} params
     * - {boolean} .interactive Interactive or not.
     */
    setInteractive: function(params) {
      if (params.interactive != this.interactive) {
        this.interactive = params.interactive;

        if (!this.interactive) {
          this.previousState = 'normal';
          this.state = 'normal';
        }

        this.updateState();
      }
    },

    /**
     * Show a different mouse pointer if it’s being pressed over something
     * that can actually be pressed.
     */
    reactToMouseDown: function() {
      if ($a('mouse-pointer').state == 'hover') {
        $a('mouse-pointer').setState({ state: 'click' });
      }
    },

    /**
     * Restore the regular mouse pointer after mouse up.
     */
    reactToMouseUp: function() {
      this.setState({ state: this.previousState });
    },

    /**
     * Update the state of the mouse pointer.
     */
    updateState: function() {
      // Don’t show mouse pointer on touch devices.
      if (engine.features.touch) {
        return;
      }

      this.sync();

      switch (this.state) {
        case 'normal':
          this.previousState = 'normal';
          if (!engine.interactive) {
            this.showAnimation({
              speed: engine.rangeRand({ min: 100, max: 200 }),
              imageIds: ['mouse-pointer/wait-1',
                         'mouse-pointer/wait-2',
                         'mouse-pointer/wait-3']});
          } else {
            // Different mouse pointer on a Mac (black) and PC/Linux (white).
            if (engine.features.imAMac) {
              var colour = 'black';
            } else {
              var colour = 'white';
            }

            this.showAnimation({
              speed: engine.rangeRand({ min: 100, max: 200 }),
              imageIds: ['mouse-pointer/normal-' + colour + '-1',
                         'mouse-pointer/normal-' + colour + '-2',
                       'mouse-pointer/normal-' + colour + '-3']});
          }
          break;
        case 'hover':
          this.previousState = 'hover';
          this.showAnimation({
            speed: engine.rangeRand({ min: 100, max: 200 }),
            imageIds: ['mouse-pointer/hover-1',
                       'mouse-pointer/hover-2',
                       'mouse-pointer/hover-3']});
          break;
        case 'click':
          this.showImage({ imageId: 'mouse-pointer/click' });
          break;
      }
    }
  },

  'inside-explosions': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,

    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECT: +2,
    NEVER_AUTO_HIDE: true,

    // A size of the explosion rect.
    EXPLOSION_WIDTH: 210,
    EXPLOSION_HEIGHT: 188,

    // How many explosions will we need.
    explosionCount: 0,

    // Whether everything finished exploding.
    finished: false,

    /**
     * This is being called if all inside elements have exploded. If the
     * outside elements are done already, move on to the next scene.
     */
    everythingExploded: function() {
      this.finished = true;

      if ($a('outside-explosions').finished) {
        engine.goToNextScene();
      }
    },

    /**
     * Destroy a given actor (or an inner rect of an actor) in a spectacular
     * explosion. Your mileage may vary.
     * @param {Object} params
     * - {string} .actorId An actor id to destroy.
     * - {string} .innerId The id of the inner rect (optional).
     * - {boolean} .randomHorizontalPos Whether to show the destruction.
     */
    explodeActor: function(params) {
      var actor = $a(params.actorId);

      var rect = actor.getRect(params);
      if (!rect) {
        return;
      }

      if (params.randomHorizontalPos) {
        var x = rect.x + engine.rangeRand({ min: 0, max: rect.width });
      } else {
        var x = rect.x + rect.width / 2;
      }
      var y = rect.y + rect.height / 2;

      if (rect.parentRect) {
        x += rect.parentRect.x;
        y += rect.parentRect.y;
      }

      var innerRectData = {};
      innerRectData.x = x - this.EXPLOSION_WIDTH / 2;
      innerRectData.y = y - this.EXPLOSION_HEIGHT / 2;
      innerRectData.width = this.EXPLOSION_WIDTH;
      innerRectData.height = this.EXPLOSION_HEIGHT;

      this.explosionCount++;
      var id = 'explosion-' + this.explosionCount;

      var innerRectsData = {};
      innerRectsData[id] = innerRectData;

      this.addInnerRects({ innerRectsData: innerRectsData });

      // Choose one from four random explosion types we support.
      var type = engine.intRangeRand({ min: 1, max: 4 });

      this.showAnimation({
        innerId: id,
        speed: engine.rangeRand({ min: 50, max: 100 }),
        count: 1,
        clearOnFinish: true,
        align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER],
        imageIds: ['explosions/explosion-' + type + '-1',
                   'explosions/explosion-' + type + '-2',
                   'explosions/explosion-' + type + '-3',
                   'explosions/explosion-' + type + '-4',
                   'explosions/explosion-' + type + '-5',
                   'explosions/explosion-' + type + '-6',
                   'explosions/explosion-' + type + '-7',
                   'explosions/explosion-' + type + '-8',
                   'explosions/explosion-' + type + '-9',
                   'explosions/explosion-' + type + '-10']});

      // Remove the actor or the rect 250 milliseconds in, in the middle
      // of the explosion.
      engine.addEvent({
        startTime: 250,
        onEvent: function() {
          if (params.innerId) {
            $a(params.actorId).clear({ innerId: params.innerId });
          } else {
            $a(params.actorId).setVisible({ visible: false });
          }
        }
      });
    }
  },

  'outside-explosions': {
    WIDTH: engine.SCREEN_WIDTH,
    HEIGHT: engine.SCREEN_HEIGHT,
    PLANE: engine.PLANE_COVER,
    PLANE_CORRECTION: +2,
    NEVER_AUTO_HIDE: true,
    FORCE_RENDER_DOM: true,
    ATTACHED_TO_DOCUMENT_BODY: true,

    // A size of the explosion rect.
    EXPLOSION_WIDTH: 210,
    EXPLOSION_HEIGHT: 188,

    // The delay before the first explosion (in ms).
    FIRST_EXPLOSION_DELAY: 800,

    // The explosions start slower, and then get faster and faster. The number
    // of elements to explode may vary depending on the page the doodle is on,
    // so we’re starting with 1 second difference, and then each explosion
    // decrement it by 40ms, but don’t allow the distance to drop below 80ms.
    DELAY_BETWEEN_EXPLOSIONS_START: 1000,
    DELAY_BETWEEN_EXPLOSIONS_DECREMENT: 40,
    DELAY_BETWEEN_EXPLOSIONS_MIN: 80,

    // Counting all the elements to be exploded.
    explosionCount: 0,
    // A list of those elements.
    elements: [],

    // Whether we’re done with exploding.
    finished: false,

    /**
     * This is being called if all outside elements have exploded. If the
     * inside elements are done already, move on to the next scene.
     */
    everythingExploded: function() {
      this.finished = true;

      if ($a('inside-explosions').finished) {
        engine.goToNextScene();
      }
    },

    /**
     * Add one DOM element to be destroyed to the list. We’re checking if
     * it exists because we need to fail gracefully.
     */
    addElement: function(el) {
      if (el) {
        this.elements.push(el);
      }
    },

    /**
     * Push DOM elements on a given list – more precisely: specific tags
     * belonging to an element with a given id… sometimes with an exception of
     * tags that have a specific class name.
     * @param {Object} params
     * - {Array} .elements Array to add the elements to.
     * - {string} .parentId Id of an element we survey for children elements.
     * - {string} .tagName Tag name of the elements we’re looking for.
     * - {string} .excluseClassName Class name we’re avoiding (optional).
     */
    pushElements: function(params) {
      var parentEl = document.getElementById(params.parentId);
      if (!parentEl) {
        return;
      }

      var els = parentEl.getElementsByTagName(params.tagName);
      for (var i = 0, el; el = els[i]; i++) {
        if (!params.excludeClassName ||
            el.className.indexOf(params.excludeClassName) == -1) {
          params.elements.push(el);
        }
      }
    },

    /**
     * Fireworks!
     */
    startExplosions: function() {
      this.setVisible({ visible: true });

      // 1. We are adding initial elements that should be destroyed in
      // a particular order – search box, search button, etc. Note that
      // all of this list will be arbitary and specific to the way Google’s
      // homepage DOM is constructed.

      // Search button (iPad).
      this.addElement(document.getElementById('sbds'));

      // Search box (incl. button on an iPad).
      this.addElement(document.getElementById('sftab'));

      // Old-school search box (Opera 9.64).
      if (!document.getElementById('sftab')) {
        var el = document.getElementsByName('q') &&
                 document.getElementsByName('q')[0];

        if (el && el.parentNode &&
            (el.parentNode.className.indexOf('ds') != -1)) {
          this.addElement(el.parentNode);
        }
      }

      // Search button.
      this.addElement(document.getElementsByName('btnK') &&
                      document.getElementsByName('btnK')[0]);

      // Both buttons for Opera 9.64.
      var oldButtonsAdded = 0;
      var els = engine.getDomElements({ tagName: 'span',
                                            className: 'lsbb' });
      for (var i = 0, el; el = els[i]; i++) {
        if (el.parentNode) {
          this.addElement(el.parentNode);
          oldButtonsAdded++;
        }
      }

      if (!oldButtonsAdded) {
        // IFL button.
        this.addElement(document.getElementsByName('btnI') &&
                        document.getElementsByName('btnI')[0]);
      }

      // 2. We added all the initial elements that should be destroyed in
      // a particular order. Now we’re creating a list of secondary elements.
      // After we have that list, we’re randomize it, so the second wave of
      // destructions will happen over the place.
      var secondaryEls = [];

      // Links in the footer on the left (iGoogle, Change Background…).
      this.pushElements({ elements: secondaryEls, parentId: 'flci', tagName: 'a' });

      // Links in the footer (Advertising Programs, Business Solutions…).
      this.pushElements({ elements: secondaryEls, parentId: 'fll', tagName: 'a' });

      // Links (properties).
      this.pushElements({ elements: secondaryEls, parentId: 'gbz', tagName: 'li' });

      // Menu.
      secondaryEls.push(document.getElementById('gbq1'));

      // Old-school Advanced Search/Language Tools links next to the
      // search box (Opera 9.64).
      els = engine.getDomElements({ tagName: 'td', className: 'sblc' });
      if (els && els[0]) {
        secondaryEls.push(els[0]);
      }

      // Upper-right top bar stuff (login, etc.).
      this.pushElements({ elements: secondaryEls, parentId: 'gbg',
                          tagName: 'li', excludeClassName: 'gbtb' });
      this.pushElements({ elements: secondaryEls, parentId: 'gbv',
                          tagName: 'li' });

      // Additional languages (links within the "Google offered in those
      // languages" line).
      this.pushElements({ elements: secondaryEls, parentId: 'als',
                          tagName: 'a' });

      // On-screen keyboard.
      secondaryEls.push(document.getElementById('kbd'));

      // “Yes” in the “Make Google My Homepage” top blue bar promo.
      secondaryEls.push(document.getElementById('mgmhppdyes'));

      // “No” in the “Make Google My Homepage” top blue bar promo.
      secondaryEls.push(document.getElementById('mgmhppdno'));

      // Random promo, e.g. “Make Google my homepage” below search bar.
      secondaryEls.push(document.getElementById('prm'));

      // Images (Chrome icon, close box) in the upper-right corner pop-up
      // “Install Google Chrome” promo.
      this.pushElements({ elements: secondaryEls, parentId: 'pmocntr2',
                          tagName: 'img' });

      // Button in the upper-right corner pop-up
      // “Install Google Chrome” promo.
      secondaryEls.push(document.getElementById('pmolnk'));

      // Randomize all the secondary elements at this point, and then add them
      // to the main list.
      var len = secondaryEls.length;
      for (var i = 0; i < len; i++) {
        var no = engine.intRangeRand(
            { min: 0, max: secondaryEls.length - 1 });
        this.addElement(secondaryEls[no]);
        secondaryEls.splice(no, 1);
      }

      // 3. Now we add the elements we want to finish with, again in a
      // specific order.

      // “View Google in Tablet | Classic” switcher.
      this.addElement(document.getElementById('fttl'));

      // The totality of the "Google offered in those languages" line.
      this.addElement(document.getElementById('als'));

      // The totality of the “Make Google My Homepage” top blue bar promo.
      this.addElement(document.getElementById('mgmhppd'));

      // The totality of top bar (background).
      this.addElement(document.getElementById('mngb'));

      // The totality of the footer.
      this.addElement(document.getElementById('footer'));

      // The totality of the upper-right corner pop-up
      // “Install Google Chrome” promo.
      this.addElement(document.getElementById('pmocntr2'));

      // The remainder of links in the footer (pipes).
      if (!document.getElementById('ftby')) {
        var parentEl = document.getElementById('footer');
        var el = parentEl && parentEl.getElementsByTagName('div') &&
                 parentEl.getElementsByTagName('div')[0];
        this.addElement(el);
      }

      // The totality of top bar (background).
      el = document.getElementById('mngb');
      this.addElement(el);

      // We have the list now. Let’s create all the inner rects necessary.

      var innerRectsData = {};
      for (var i in this.elements) {
        var el = this.elements[i];
        var pos = engine.getElPagePos({ el: el });

        pos.left += el.offsetWidth / 2;
        pos.top += el.offsetHeight / 2;

        var innerRect = {
          forceRenderDom: true,
          x: pos.left - this.EXPLOSION_WIDTH / 2,
          y: pos.top - this.EXPLOSION_HEIGHT / 2,
          width: this.EXPLOSION_WIDTH,
          height: this.EXPLOSION_HEIGHT
        };

        innerRectsData['explosion-' + (parseInt(i, 10) + 1)] = innerRect;
      }
      this.addInnerRects({ innerRectsData: innerRectsData });

      // We conclude with adding all the timed events for all the explosions.

      var timeDistance = this.DELAY_BETWEEN_EXPLOSIONS_START;

      for (var i in this.elements) {
        engine.addEvent({
          startTime: this.FIRST_EXPLOSION_DELAY + i * timeDistance,
          onEvent: function() {
            $a('outside-explosions').explodeNextElement();
          }
        });

        // Every subsequent explosion happens a tiny bit faster.
        timeDistance -= this.DELAY_BETWEEN_EXPLOSIONS_DECREMENT;
        if (timeDistance < this.DELAY_BETWEEN_EXPLOSIONS_MIN) {
          timeDistance = this.DELAY_BETWEEN_EXPLOSIONS_MIN;
        }
      }
    },

    /**
     * Take the next element on the list and HELLS YEAH DESTROY IT.
     */
    explodeNextElement: function() {
      var el = this.elements[this.explosionCount];

      var type = engine.intRangeRand({ min: 1, max: 4 });
      var speed = engine.rangeRand({ min: 50, max: 100 });

      $a('outside-explosions').showAnimation({
        innerId: 'explosion-' + (this.explosionCount + 1),
        speed: speed,
        count: 1,
        clearOnFinish: true,
        align: [engine.ALIGN_CENTER, engine.ALIGN_CENTER],
        imageIds: ['explosions/explosion-' + type + '-1',
                   'explosions/explosion-' + type + '-2',
                   'explosions/explosion-' + type + '-3',
                   'explosions/explosion-' + type + '-4',
                   'explosions/explosion-' + type + '-5',
                   'explosions/explosion-' + type + '-6',
                   'explosions/explosion-' + type + '-7',
                   'explosions/explosion-' + type + '-8',
                   'explosions/explosion-' + type + '-9',
                   'explosions/explosion-' + type + '-10']});

      engine.addEvent({
       startTime: speed * 5,
       onEvent: function() {
         el.style.opacity = 0;
         if (engine.features.ie8OrLower) {
           el.style.visibility = 'hidden';
         }
       }
      });

      if (!this.elements[this.explosionCount + 1]) {
        this.everythingExploded();
      } else {
        this.explosionCount++;
      }
    },

    /**
     * Undoes all the damage done by explosions.
     */
    undo: function() {
      for (var i in this.elements) {
        var el = this.elements[i];

        el.style.opacity = 1;
        if (engine.features.ie8OrLower) {
          el.style.visibility = '';
        }
      }
    }
  },

  /* ------------------------------------------------------------------------
   * An invisible cover during the attract mode that you can click on to
   * start the gameplay.
   * ------------------------------------------------------------------------
   */
  'cover': {
    WIDTH: engine.INITIAL_WIDTH,
    HEIGHT: engine.EXPANDED_HEIGHT,
    PLANE: engine.PLANE_COVER,
    PLANE_CORRECTION: +1,

    /**
     * Go to the next scene (start the doodle).
     */
    onClick: function() {
      engine.goToNextScene();
      $a('tooltip').hide();
    }
  },

  /* ------------------------------------------------------------------------
   * The tooltip that appears if you click on the ? in the upper-right corner.
   * ------------------------------------------------------------------------
   */
  'tooltip': {
    WIDTH: 360,
    HEIGHT: 587,
    PLANE: engine.PLANE_MOUSE_POINTER,
    PLANE_CORRECTION: -2,

    INNER_RECTS: {
      'cloud': { x: 0, y: 0, width: 360, height: 355 },
      'flag': { x: 30, y: 115, width: 300, height: 480 },
      'text': { x: 33, y: 191, width: 265, height: 90 },
      'hand': { x: 223, y: 225, width: 40, height: 69 },
      'arm': { x: 207, y: 293, width: 67, height: 270 },

      'link': { x: 50, y: 120, width: 280, height: 60 }
    },

    // How much time (in ms) does it take the tooltip to go up and down.
    TRANSITION_UP_TIME: 600,
    TRANSITION_DOWN_TIME: 400,

    // Whether the tooltip is currently in movement.
    transitioning: false,
    // If you click to hide the tooltip, wait for it to show before you can
    // hide it again.
    hideAsSoonAsPossible: false,

    /**
     * Clicking on the only clickable part (flag) goes to the search results.
     */
    onClick: function() {
      engine.goToSearchResults();
    },

    tick: function() {
      if (this.rect.visible) {
        this.reposition();
      }
    },

    /**
     * Animate the tooltip showing. It’s a bit more complex since we want
     * it to look like the hand is pushing the tooltip.
     */
    show: function() {
      if (this.transitioning) {
        return;
      }

      this.hideAsSoonAsPossible = false;

      this.transform({ innerId: 'hand', y: 275 });
      this.transform({ innerId: 'arm', y: 343 });

      this.transform({ x: 45, y: engine.EXPANDED_HEIGHT,
                       offsetY: engine.bodyOffsetY / 2 });

      this.showImage({ innerId: 'text',
                       align: [engine.ALIGN_END, engine.ALIGN_CENTER],
                       imageId: 'ui/tooltip-text-' + engine.country });
      this.showImage({ innerId: 'cloud', imageId: 'ui/tooltip-cloud' });
      this.showImage({ innerId: 'flag', imageId: 'ui/tooltip-flag' });
      this.showImage({ innerId: 'arm', imageId: 'ui/tooltip-arm' });

      if (!engine.attractMode) {
        this.showImage({ innerId: 'hand',
                         align: [engine.ALIGN_CENTER, engine.ALIGN_END],
                         imageId: 'ui/tooltip-hand-push' });
      }

      this.addTransition({
        easing: engine.easeOut, alternate: true, count: 1,
        duration: this.TRANSITION_UP_TIME, properties: { y: 110 }
      });

      this.reposition();
      this.setVisible({ visible: true });
      this.setClickable({ clickable: true, innerId: 'link' });

      this.transitioning = true;

      engine.addEvent({
        startTime: this.TRANSITION_UP_TIME - 100,
        onEvent: function() {
          $a('tooltip').addTransition({
            easing: engine.easeInOut,
            innerId: 'arm',
            duration: $a('tooltip').TRANSITION_DOWN_TIME,
            properties: { relY: +50 }
          });

          // Don’t push the hand in the intro, because you can’t see it
          // all that well anyway
          if (!engine.attractMode) {
            $a('tooltip').addTransition({
              easing: engine.easeInOut,
              innerId: 'hand',
              duration: $a('tooltip').TRANSITION_DOWN_TIME,
              properties: { relY: +50 }
            });
          }
        }
      });

      if (!engine.attractMode) {
        engine.addEvent({
          startTime: this.TRANSITION_UP_TIME,
          onEvent: function() {
            $a('tooltip').showImage({
                innerId: 'hand',
                align: [engine.ALIGN_CENTER, engine.ALIGN_END],
                imageId: 'ui/tooltip-hand' });
          }
        });
      }

      engine.addEvent({
        startTime: this.TRANSITION_UP_TIME + this.TRANSITION_DOWN_TIME,
        onEvent: function() {
          $a('tooltip').transitioning = false;

          if ($a('tooltip').hideAsSoonAsPossible) {
            $a('tooltip').hide();
          } else {
            engine.tooltipShowing = true;
          }
        }
      });
    },

    /**
     * Hide the tooltip by animating it down.
     */
    hide: function() {
      if (!this.rect.visible) {
        return;
      }

      if (this.transitioning) {
        this.hideAsSoonAsPossible = true;
        return;
      }

      this.hideAsSoonAsPossible = false;
      this.transitioning = true;

      engine.tooltipShown = false;
      engine.tooltipShowing = false;

      this.addTransition({
        easing: engine.easeIn,
        alternate: true,
        count: 1,
        onFinish: function() {
          $a('tooltip').transitioning = false;
          $a('tooltip').setVisible({ visible: false });
        },
        duration: this.TRANSITION_DOWN_TIME,
        properties: { y: engine.EXPANDED_HEIGHT }
      });
    },

    /**
     * Show the tooltip if it’s hidden, and vice versa. This is called by
     * the question mark button. */
    toggle: function() {
      if (this.rect.visible) {
        this.hide();
      } else {
        this.show();

        // During the interactive levels, we show the global tooltip in
        // addition to the gameplay hint. This is done for those users who
        // click on the question mark expecting gameplay help.
        $a('hints').show({ source: 'trurl' });
      }
    },

    /**
     * The engine is not clever enough to reposition things properly if the
     * doodle is expanding. We need to do it manually.
     */
    reposition: function() {
      // Leave room for Trurl’s hints if it’s an interactive part.
      if (engine.interactive && $a('hints').available) {
        var correction = 120;
      } else {
        var correction = 25;
      }

      this.transform({ offsetY: engine.bodyOffsetY / 2 - correction });
    }
  }
};

/**
 * A list of scenes for Lem doodle.
 *
 * Each scene can have the following fields:
 * .id – the text description of the scene (mandatory)
 * .onEnter() – the function launched when the scene starts (mandatory)
 * .cutscene – whether the scene is a cutscene that can be fast-forwarded through
 * .interactive – whether the scene is interactive (implies a hint is available)
 * @const
 */
engine.SCENES = [
  /* ------------------------------------------------------------------------
   * Scene 1:
   * The introductory state of the doodle as Google homepage is loaded,
   * before any clicks.
   * ------------------------------------------------------------------------
   */
  {
    id: 'intro',
    onEnter: function() {
      // Move initial things into place and show all the things for the
      // intro.

      $a('ground').transform({
          x: 0, y: engine.EXPANDED_HEIGHT - engine.GROUND_HEIGHT });
      $a('sky').setStyle({ speed: 30, opacity: .4 });
      $a('mountains').transform({ x: 0, y: 362 });
      $a('bk-mountains').transform({ x: 0, y: 362 });
      $a('bird').transform({ x: 180, y: 350 });
      $a('construction-site').transform({ x: 0, y: 417 });
      $a('charging-station').transform({ x: 330, y: 532 });
      $a('start-button').transform({ x: 180, y: 380 });
      $a('trurl').transform({ x: 165, y: 457 });
      $a('trurl').setState({ state: 'looking-up' });

      $a('trurl').setVisible({ visible: true });
      $a('sky').setVisible({ visible: true });
      $a('sky-haze').setVisible({ visible: true });
      $a('mask-big').setVisible({ visible: true });
      $a('mask-small').setVisible({ visible: true });
      $a('mask-canvas').setVisible({ visible: true });
      $a('toolbar-wait').setVisible({ visible: true });
      $a('toolbar-tooltip').setVisible({ visible: true });
      $a('ground').setVisible({ visible: true });
      $a('mountains').setVisible({ visible: true });
      $a('bk-mountains').setVisible({ visible: true });
      $a('bird').setVisible({ visible: true });
      $a('construction-site').setVisible({ visible: true });
      $a('charging-station').setVisible({ visible: true });
      $a('start-button').setVisible({ visible: true });

      // The start button is animated to attract attention of visitors who
      // might otherwise miss the fact that this doodle is interactive. Note
      // that you don’t have to click the button, but…
      $a('start-button').showAnimation({
        speed: 200,
        imageIds: ['intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button',
                   'intro-finale/start-button-press-1',
                   'intro-finale/start-button-press-2',
                   'intro-finale/start-button-press-1']
      });

      // …there’s an element that covers the entire doodle and allows
      // clicking anywhere to start.
      $a('cover').setVisible({ visible: true });
      $a('cover').setClickable({ clickable: true });
      engine.setInteractive({ interactive: true });

      // The bird picks up the start button (which is in the sky, so it
      // appears as if the bird carried the button from the beginning),
      // then lands. This below is how we usually add events to the timeline,
      // 300 is in milliseconds.
      engine.addEvents({
        300: function() {
          if (engine.curSceneId == 'intro') {
            $a('bird').pickUpStartButton({
              onPickUp: function() {
                $a('bird').setTarget({ x: 180, y: 440, land: false });
                engine.addEvents({
                  5000: function() {
                    // This and the subsequent event can be fired after
                    // the user advanced to the next stage already. In this
                    // case the bird doesn’t even bother to land.
                    if (engine.curSceneId == 'intro') {
                      $a('bird').setTarget({ x: 375, y: 450, land: false });
                    }
                  },
                  12000: function() {
                    if (engine.curSceneId == 'intro') {
                      $a('bird').setTarget({ x: 375, y: 510, land: true,
                                             targetId: 'start-button' });
                    }
                  }
                });
              }
            });
          }
        },
        1500: function() {
          // This and the subsequent event can be fired after
          // the user advanced to the next stage already. In this
          // case Trurl doesn’t bother to sit down, but just continues
          // walking into the first intermission.
          if (engine.curSceneId == 'intro') {
            $a('trurl').setState({ state: 'looking-up-to-walking' });
          }
        },
        2000: function() {
          if (engine.curSceneId == 'intro') {
            $a('trurl').addTransition({
              easing: engine.linear,
              duration: 3000, properties: { relX: 140 } });
          }
        },
        5000: function() {
          if (engine.curSceneId == 'intro') {
            $a('trurl').setState({ state: 'sitting' });
          }
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 2:
   * The scene after first click: Trurl starts walking and the first
   * through bubble appears.
   * ------------------------------------------------------------------------
   */
  {
    id: 'intermission-after-intro',
    cutscene: true,
    onEnter: function() {
      // We already have all the images for this scene, but we are always
      // preloading a scene or two ahead.

      engine.preloadImageSet({ id: 'all-levels' });
      engine.preloadImageSet({ id: 'level-1-1' });
      engine.preloadImageSet({ id: 'level-1-2' });

      // Shouldn’t be necessary, but just in case.
      engine.bodyEl.focus();

      // Replace the default mouse pointer with our custom one if we can.
      engine.setCustomMousePointer({ customMousePointer: true });

      engine.addEvents({
        0: function() {
          // Remove the cover. We won’t need it ever again.
          engine.setInteractive({ interactive: false });
          $a('cover').setVisible({ visible: false });
          $a('cover').setClickable({ clickable: false });

          // Stop animating the button.
          $a('start-button').showImage({
            imageId: 'intro-finale/start-button' });

          // If the bird was interrupted on its way, it starts flying up
          // immediately.
          if (!$a('bird').landed) {
            var birdLanded = false;
            $a('bird').setTarget({ x: 50, y: 140, land: false });
            $a('bird').dropStartButton();
          } else {
            var birdLanded = true;
            $a('bird').carrying = null;
          }

          // Trurl gets up and eventually starts moving.
          if ($a('trurl').state == 'looking-up') {
            $a('trurl').setState({ state: 'looking-up-to-walking' });
          } else if ($a('trurl').state == 'sitting') {
            $a('trurl').setState({ state: 'standing-up-to-walking' });
          }

          // Start moving the scenery. Mountains in the background move
          // a bit slower for parallax.

          var SCENERY_DURATION = 10000;

          $a('start-button').addTransition({
              duration: SCENERY_DURATION, properties: { relX: -550 } });
          $a('construction-site').addTransition({
              duration: SCENERY_DURATION, properties: { relX: -550 } });
          $a('books').addTransition({
              duration: SCENERY_DURATION, properties: { relX: -550 } });
          $a('charging-station').addTransition({
              duration: SCENERY_DURATION, properties: { relX: -550 } });
          $a('bk-mountains').addTransition({
              duration: 20000,
              properties: {
                  relX: -20000 * engine.BK_MOUNTAINS_MULTIPLIER } });
          $a('mountains').addTransition({
              duration: 20000,
              properties: {
                  relX: -20000 * engine.MOUNTAINS_MULTIPLIER } });

        },
        1000: function() {
          $a('trurl').setState({ state: 'walking' });
          $a('trurl').addTransition({
              duration: 8000, properties: { x: 60 } });
        },
        4000: function() {
          // If the bird landed already, it gets up with a delay.

          if ($a('bird').landed) {
            $a('bird').setTarget({ x: 50, y: 140, land: false });
          }
        },
        5000: function() {
          // The doodle canvas starts expanding vertically.

          engine.addTransition({
            duration: 5000, properties: {
                height: engine.EXPANDED_HEIGHT } });
        },
        7000: function() {
            engine.goToNextScene();
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 3:
   * Just before the first playable level. Split from the first level so that
   * we can wait for the images to load (if necessary) at a more opportune
   * time.
   * ------------------------------------------------------------------------
   */
  {
    id: 'before-level-1',
    onEnter: function() {
      engine.addEvents({
        0: function() {
          // Showing the thought cloud.

          $a('thought-cloud').transform({ x: 50, y: 55 });
          $a('thought-cloud').show();
        },
        5000: function() {
          $a('sky').setStyle({ speed: 50, opacity: .3 });

          // Numbot gets initialized off-screen and moves into view.

          $a('numbot').transform({ x: engine.OFFSCREEN_RIGHT, y: 0 });
          $a('numbot').setVisible({ visible: true });
          $a('numbot').moveArms();
          $a('numbot').addTransition({
            duration: 8000, properties: { x: 0 } });
        },
        7000: function() {
          // Trurl moves a bit more to the left of the screen, and
          // eventually stops.

          $a('trurl').addTransition({
            duration: 5900, properties: { x: 30 } });
        },
        12900: function() {
          $a('trurl').setState({ state: 'looking-away' });

          engine.goToNextScene();
        }

      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 4:
   * The first playable level: Figuring out the equations for the Numbot.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-1',
    interactive: true,
    onEnter: function() {
      // The bird is free to roam around and choose places to hover around
      // and sit randomly.
      $a('bird').setFreeWill({ freeWill: true });

      // Initializing the game. All the logic for this level is contained
      // within the Numbot actor.
      $a('numbot').goToStage({ stage: 1 });

      // Preloading images for the next level.
      engine.preloadImageSet({ id: 'level-2-1' });
      engine.preloadImageSet({ id: 'level-2-2' });
      engine.preloadImageSet({ id: 'level-2-3' });
      engine.preloadImageSet({ id: 'level-2-4' });
      engine.preloadImageSet({ id: 'level-2-5' });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 5:
   * Numbot explodes, the bird picks up the first piece.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-1-ending',
    cutscene: true,
    onEnter: function() {
      engine.addEvents({
        0: function() {
          if (engine.debugEnabled) {
            // Even if we skip the earlier level to see Numbot do it,
            // the canvas still expands to its proper width. (If you debug
            // skip the first level, this won’t happen and the rest of the
            // game will be constrained.)
              $a('mask-small').transform({ innerId: 'left', x: -20 });
              $a('mask-small').transform({
                  innerId: 'right', x: engine.INITIAL_WIDTH - 36 + 20 });
          }

          // Trurl congratulates you briefly.
          $a('trurl').setState({ state: 'happy' });

          // We’re cheating here and in subsequent levels – the bird has
          // precognition and positions itself close to where the pick up
          // will be a bit before. We’re doing it so that the user won’t
          // have to wait a long time for the bird to do boring things.
          $a('bird').setFreeWill({ freeWill: false });
          $a('bird').setTarget({ x: 205, y: 500, land: false });

          engine.setInteractive({ interactive: false });
          $a('trurl').setInteractive({ interactive: false });
          $a('numbot').setInteractive({ interactive: false });

          $a('sky').setStyle({ speed: 50, opacity: .3 });

          // Numbot explodes.

          $a('numbot').showAnimation({
            innerId: 'head',
            speed: 150,
            count: 1,
            imageIds: ['numbot/head-6',
                       'numbot/head-7',
                       'numbot/head-8',
                       'numbot/head-9']});

          $a('numbot').showAnimation({
            innerId: 'formula',
            speed: 50,
            count: 1,
            clearOnFinish: true,
            imageIds: ['numbot/formula-3-end-1',
                       'numbot/formula-3-end-2',
                       'numbot/formula-3-end-3',
                       'numbot/formula-3-end-4',
                       'numbot/formula-3-end-5',
                       'numbot/formula-3-end-6',
                       'numbot/formula-3-end-7',
                       'numbot/formula-3-end-7',
                       'numbot/formula-3-end-7',
                       'numbot/formula-3-end-8',
                       'numbot/formula-3-end-9',
                       'numbot/formula-3-end-10',
                       'numbot/formula-3-end-11',
                       'numbot/formula-3-end-12',
                       'numbot/formula-3-end-13',
                       'numbot/formula-3-end-14',
                       'numbot/formula-3-end-15',
                       'numbot/formula-3-end-15',
                       'numbot/formula-3-end-15',
                       'numbot/formula-3-end-16',
                       'numbot/formula-3-end-17',
                       'numbot/formula-3-end-18',
                       'numbot/formula-3-end-19',
                       'numbot/formula-3-end-20',
                       'numbot/formula-3-end-21',
                       'numbot/formula-3-end-22',
                       'numbot/formula-3-end-23',
                       'numbot/formula-3-end-23',
                       'numbot/formula-3-end-23',
                       'numbot/formula-3-end-24',
                       'numbot/formula-3-end-25',
                       'numbot/formula-3-end-26',
                       'numbot/formula-3-end-27',
                       'numbot/formula-3-end-28']});

          $a('numbot').showCover();

          $a('numbot').explode();
        },
        500: function() {
          $a('numbot').showAnimation({
            innerId: 'steam',
            speed: 120,
            count: 10,
            clearOnFinish: true,
            alternate: true,
            imageIds: ['numbot/steam-3-1',
                       'numbot/steam-3-2',
                       'numbot/steam-3-3']});
        },
        4200: function() {
          // A part falls out of Numbot and the bird picks it up. At the
          // moment the bird picks it up (it’s event-based, not time-based),
          // we move to the next scene.
          $a('old-parts').transform({ x: 215, y: 185 });
          $a('old-parts').setState({ state: 'connectors' });
          $a('old-parts').setVisible({ visible: true });

          $a('old-parts').addTransition({
            easing: engine.fall,
            onFinish: function() {
              $a('bird').pickUpOldParts({
                onPickUp: function() {
                  $a('bird').setTarget({ x: 50, y: 140, land: false });

                  engine.addEvents({
                    750: function() {
                      engine.goToNextScene();
                    }
                  });
                }
              });
            },
            duration: 1000, properties: { y: 520 }
          });
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 6:
   * Intermission between level 1 and level 2, Trurl walks further,
   * second thought bubble.
   * ------------------------------------------------------------------------
   */
  {
    id: 'intermission-level-1-level-2',
    onEnter: function() {
      engine.addEvents({
        0: function() {
          $a('trurl').setState({ state: 'walking' });
          $a('trurl').addTransition({
            easing: engine.easeIn,
            duration: 6500, properties: { x: 60 } });

          $a('bk-mountains').addTransition({
            duration: 27500,
            properties: {
                relX: -31000 * engine.BK_MOUNTAINS_MULTIPLIER } });
          $a('mountains').addTransition({
            duration: 27500,
            properties: {
                relX: -31000 * engine.MOUNTAINS_MULTIPLIER } });
        },
        1500: function() {
          $a('thought-cloud').show();
        },
        6500: function() {
          $a('trurl').addTransition({
            easing: engine.linear,
            duration: 18000, properties: { x: 350 } });

          // The sky darkens and speed up, Demonbot slowly appears.

          $a('sky').setStyle({ speed: 1000, opacity: .95 });

          $a('demonbot').transform({ x: engine.OFFSCREEN_RIGHT, y: 10 });
          $a('demonbot').setVisible({ visible: true });
          $a('demonbot').startWavingLeftHand();
          $a('demonbot').addTransition({
            duration: 19000, properties: { x: -260 } });
        },
        18500: function() {
          // …and so does the UI (paper machine) in front of Demonbot.
          $a('demonbot-ui-top').transform({
              x: engine.OFFSCREEN_RIGHT + 235, y: 310 });
          $a('demonbot-ui-top').setVisible({ visible: true });
          $a('demonbot-ui').transform({
              x: engine.OFFSCREEN_RIGHT, y: 310 });
          $a('demonbot-ui').setVisible({ visible: true });

          $a('demonbot-ui').animateCogs();
          $a('demonbot-ui').addTransition({
           id: 'demonbot-ui-output-target-scroll',
           innerId: 'output-target',
           easing: engine.linear,
           count: Infinity,
           duration: 10000, properties: { scrollX: -770 } });

          $a('demonbot-ui').addTransition({
            duration: 6000, properties: { x: 78 } });
          $a('demonbot-ui-top').addTransition({
            duration: 6000, properties: { x: 78 + 235 } });
        },
        24500: function() {
          // The bird drops parts it was carrying so it can roam freely
          // as you play.
          $a('bird').dropOldParts({
            onDrop: function() {
              $a('bird').setFreeWill({ freeWill: true });
              $a('bird').pickRandomFreeWillTarget();
            }
          });
          $a('trurl').setState({ state: 'looking-away' });
        },
        26500: function() {
          engine.goToNextScene();
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 7:
   * Second playable level: Figuring out demon information encoding.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-2',
    interactive: true,
    onEnter: function() {
      $a('sky').setStyle({ speed: 300, opacity: .95 });

      // The level 2 logic is hidden inside 'demonbot-ui' actor.
      $a('demonbot-ui').goToStage({ stage: 1 });

      // The hand is invisible, so we no longer have to animate it.
      // TODO(mwichary): This should be handled automatically by the
      // engine. Maybe it already is?
      $a('demonbot').stopWavingLeftHand();

      // Schedule an easter egg passage of the Lem satellite in the
      // background, between 10 and 30 seconds from entering this stage.
      engine.addEvent({
        startTime: engine.rangeRand({ min: 10000, max: 30000 }),
        onEvent: function() { $a('satellite').startPassage(); }
      });

      engine.preloadImageSet({ id: 'level-3' });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 8:
   * Second level ends: Paper covers the monster, the bird picks up
   * another piece.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-2-ending',
    cutscene: true,
    onEnter: function() {
      engine.addEvents({
        0: function() {
          engine.setInteractive({ interactive: false });
          $a('trurl').setInteractive({ interactive: false });

          $a('sky').setStyle({ speed: 10, opacity: .4 });

          // Again, the bird positions itself in the upper-left corner so
          // it’s closer where it needs to be in the near future.
          $a('bird').setFreeWill({ freeWill: false });
          $a('bird').setTarget({ x: 50, y: 50, land: false });

          // Demonbot stops breathing.
          engine.removeTransition({ id: 'demonbot-breathe' });
          engine.removeTransition({ id: 'demonbot-hair-rotate' });

          $a('demonbot-ui').animateCogs();

          // The paper machine starts shaking.
          $a('demonbot-ui').addTransition({
            id: 'demonbot-ui-working-1',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -2 }
          });
          $a('demonbot-ui-top').addTransition({
            id: 'demonbot-ui-working-2',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -2 }
          });
          $a('demonbot-ui-extension-1').addTransition({
            id: 'demonbot-ui-working-3',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -3 }
          });
          $a('demonbot-ui-extension-2').addTransition({
            id: 'demonbot-ui-working-4',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -4 }
          });
          $a('demonbot-ui-extension-3').addTransition({
            id: 'demonbot-ui-working-5',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -5 }
          });

          $a('demonbot-ui').showAnimation({
            speed: 100,
            innerId: 'paper',
            imageIds: ['demonbot/paper-1', 'demonbot/paper-2',
                       'demonbot/paper-3', 'demonbot/paper-4',
                       'demonbot/paper-5', 'demonbot/paper-6',
                       'demonbot/paper-7', 'demonbot/paper-8']});
        },
        2000: function() {
          // The pen base extends.
          $a('demonbot-ui-extension-3').extendFurther();
        },
        4000: function() {
          // The pen starts shaking and extends and starts writing on
          // the paper.
          $a('demonbot-pen').setVisible({ visible: true });
          $a('demonbot-pen').addTransition({
            id: 'demonbot-pen-working',
            easing: engine.easeInOut,
            alternate: true,
            count: Infinity,
            duration: 50, properties: { relY: -2 }
          });
          $a('demonbot-pen').transform({ x: $a('demonbot-ui').rect.x - 50,
                                         y: $a('demonbot-ui').rect.y - 315 });

          $a('demonbot-pen').showAnimation({
            speed: 100,
            count: Infinity,
            repeatFrom: 34,
            imageIds: ['demonbot/pen-extend-1',
                       'demonbot/pen-extend-2',
                       'demonbot/pen-extend-3',
                       'demonbot/pen-extend-4',
                       'demonbot/pen-extend-5',
                       'demonbot/pen-extend-6',
                       'demonbot/pen-extend-7',
                       'demonbot/pen-extend-8',
                       'demonbot/pen-extend-9',
                       'demonbot/pen-extend-10',
                       'demonbot/pen-extend-11',
                       'demonbot/pen-extend-12',
                       'demonbot/pen-extend-13',
                       'demonbot/pen-extend-13',
                       'demonbot/pen-extend-14',
                       'demonbot/pen-extend-15',
                       'demonbot/pen-extend-16',
                       'demonbot/pen-extend-17',
                       'demonbot/pen-extend-18',
                       'demonbot/pen-extend-19',
                       'demonbot/pen-extend-20',
                       'demonbot/pen-extend-21',
                       'demonbot/pen-extend-22',
                       'demonbot/pen-extend-23',
                       'demonbot/pen-extend-24',
                       'demonbot/pen-extend-25',
                       'demonbot/pen-extend-26',
                       'demonbot/pen-extend-27',
                       'demonbot/pen-extend-28',
                       'demonbot/pen-extend-29',
                       'demonbot/pen-extend-30',
                       'demonbot/pen-extend-31',
                       'demonbot/pen-extend-32',
                       'demonbot/pen-extend-33',
                       'demonbot/pen-extend-34',
                       'demonbot/pen-extend-35',
                       'demonbot/pen-extend-36',
                       'demonbot/pen-extend-37',
                       'demonbot/pen-extend-37',
                       'demonbot/pen-extend-38',
                       'demonbot/pen-extend-39',
                       'demonbot/pen-extend-40']});
        },
        8600: function() {
          // The paper starts covering the Demonbot.
          $a('demonbot-paper-cover').setVisible({ visible: true });
          $a('demonbot-paper-cover').transform({ x: -125, y: -26 });

          $a('demonbot-paper-cover').show();
        },
        8800: function() {
          // Demonbot looks at the paper instead of whatever it was
          // previously looking at. This could’ve been handled with a nicer
          // transition, not just eyes abruptly looking up.
          $a('demonbot').lookAtPaper();
        },
        9000: function() {
          // Demonbot goes down under the weight of paper, and so does
          // the paper itself.
          $a('demonbot').addTransition({
              easing: engine.easeIn, count: 1,
              duration: 5000, properties: { relY: 280 }
          });
          $a('demonbot-paper-cover').addTransition({
              easing: engine.easeIn, count: 1,
              duration: 5000, properties: { relY: 70 }
          });
        },
        12000: function() {
          // Stop the paper flowing animation et al.
          $a('demonbot-ui').showImage({ innerId: 'paper',
                                        imageId: 'demonbot/paper-1' });
          $a('demonbot-pen').showImage({ imageId: 'demonbot/pen-extend-40' });

          // Stop the shaking.
          engine.removeTransition({ id: 'demonbot-ui-working-1' });
          engine.removeTransition({ id: 'demonbot-ui-working-2' });
          engine.removeTransition({ id: 'demonbot-ui-working-3' });
          engine.removeTransition({ id: 'demonbot-ui-working-4' });
          engine.removeTransition({ id: 'demonbot-ui-working-5' });
        },
        13500: function() {
            // The bird needs to retrieve something hidden underneath the
            // paper etc. We move the bird to a plane that’s behind it,
            // and the parts it’s picking up as well.
            $a('bird').transform({
                plane: engine.PLANE_BACKGROUND, planeCorrection: +1 });
            $a('new-parts').transform({
                x: 40, y: 450,
                plane: engine.PLANE_BACKGROUND, planeCorrection: +1 });
            $a('new-parts').setState({ state: 'eyes' });
            $a('new-parts').setVisible({ visible: true });

            // The bird moves to the top-leftish corner, then picks up
            // the parts in the lower-left corner, then goes up, quietly
            // moves to a closer plane, and goes to pick up the old parts
            // laying on the floor – at this moment, the parts merge.
            $a('bird').setTarget({
                x: 50, y: 100, land: false, noPlaneChange: true,
                onReach: function() {
                  $a('bird').pickUpNewParts({
                    noPlaneChange: true,
                    onPickUp: function() {
                      $a('bird').setTarget({
                          x: 90, y: 100, land: false, noPlaneChange: true,
                          onReach: function() {
                              $a('bird').transform({
                                  plane: engine.PLANE_CLOSE_FOREGROUND,
                                  planeCorrection: +2 });
                              $a('new-parts').transform({
                                  plane: engine.PLANE_CLOSE_FOREGROUND,
                                  planeCorrection: +1 });

                              $a('bird').pickUpOldParts({
                                noPlaneChange: true,
                                onPickUp: function() {
                                  $a('old-parts').setState({
                                      state: 'connectors-eyes' });
                                  $a('bird').setTarget({
                                      x: 50, y: 140, land: false });

                                  engine.addEvents({
                                    750: function() {
                                      engine.goToNextScene();
                                    }
                                  });
                                }
                              });
                          }
                      });
                    }
                  });
                }
            });

          }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 9:
   * Intermission before the last playable level.
   * ------------------------------------------------------------------------
   */
  {
    id: 'intermission-level-2-level-3',
    onEnter: function() {
      engine.addEvents({
        0: function() {
          $a('trurl').setState({ state: 'walking' });

          $a('demonbot').addTransition({
            duration: 9000, easing: engine.easeIn,
            properties: { relX: -750 } });
          $a('demonbot-ui').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-ui-extension-1').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-ui-extension-2').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-ui-extension-3').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-pen').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-ui-top').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('demonbot-paper-cover').addTransition({
            duration: 6000, easing: engine.easeIn,
            properties: { relX: -600 } });
          $a('trurl').addTransition({
            duration: 8000, properties: { x: 60 } });

          $a('bk-mountains').addTransition({
            duration: 17000, properties: {
                relX: -17000 * engine.BK_MOUNTAINS_MULTIPLIER } });
          $a('mountains').addTransition({
            duration: 17000, properties: {
                relX: -17000 * engine.MOUNTAINS_MULTIPLIER } });
        },
        6000: function() {
          $a('thought-cloud').show();
        },
        7000: function() {
          // Little background sky items move into the view.
          $a('babybot-star-1').setVisible({ visible: true });
          $a('babybot-star-2').setVisible({ visible: true });
          $a('babybot-star-3').setVisible({ visible: true });
          $a('babybot-star-4').setVisible({ visible: true });
          $a('babybot-star-5').setVisible({ visible: true });
          $a('babybot-constellation-1').setVisible({ visible: true });
          $a('babybot-constellation-2').setVisible({ visible: true });

          $a('babybot-star-1').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 90, max: 190 }),
              y: 130 });
          $a('babybot-star-2').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 150, max: 250 }),
              y: 50 });
          $a('babybot-star-3').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 250, max: 350 }),
              y: 220 });
          $a('babybot-star-4').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 20, max: 80 }),
              y: 240 });
          $a('babybot-star-5').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 50, max: 110 }),
              y: 330 });
          $a('babybot-constellation-1').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 20, max: 80 }),
              y: 20 });
          $a('babybot-constellation-2').transform({
              x: engine.OFFSCREEN_RIGHT +
                 engine.rangeRand({ min: 250, max: 320 }),
              y: 340 });

          $a('babybot-star-1').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-2').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-3').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-4').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-5').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-constellation-1').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-constellation-2').addTransition({
            duration: 8000, properties: {
                relX: -engine.OFFSCREEN_RIGHT } });
        },
        11000: function() {
          $a('trurl').addTransition({
            duration: 5000, properties: { x: 40 } });

          $a('sky').setStyle({ speed: 50, opacity: .3 });
        },
        16000: function() {
          // For this level, we don’t want the bird to roam around and
          // be in the way, etc. So we actually have it leave the canvas
          // and sit on the I’m Feeling Lucky button.
          $a('bird').dropOldParts({
            onDrop: function() {
              $a('bird').setFreeWill({ freeWill: false });
              $a('bird').leaveDoodleBody();
              $a('bird').landOnButton();
            }
          });

          $a('trurl').setState({ state: 'looking-away' });

          // The planet and its moons appear.
          $a('babybot-planet').setVisible({ visible: true });
          $a('babybot-planet-moon').setVisible({ visible: true });
          $a('babybot-planet').setState({ state: 1 });
          $a('babybot-planet').startPassage();
        },
        19000: function() {
          // Then, the cannon appears.
          $a('babybot-cannon').transform({ x: 440, y: 245 });
          $a('babybot-cannon').setVisible({ visible: true });
          $a('babybot-cannon').moveCannon({ dir: -1, onScreen: true });
        },
        21000: function() {
          engine.goToNextScene();
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 10:
   * Last playable level: Shooting babies from the cannon.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-3',
    interactive: true,
    onEnter: function() {
      // The logic of this level is in 'babybot-cannon'.
      $a('babybot-cannon').loadNewBaby();

      engine.preloadImageSet({ id: 'finale-1' });
      engine.preloadImageSet({ id: 'finale-2' });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 11:
   * After level 3: The planet is happy, drops the last item.
   * ------------------------------------------------------------------------
   */
  {
    id: 'level-3-ending',
    cutscene: true,
    onEnter: function() {
      // The bird again positions itself expecting a gift to drop.
      $a('bird').setFreeWill({ freeWill: false });
      $a('bird').setTarget({ x: 200, y: 440, land: false });

      engine.setInteractive({ interactive: false });
      $a('babybot-cannon').setInteractive({ interactive: false });
      $a('trurl').setInteractive({ interactive: false });
      $a('babybot-cannon').moveCannon({ dir: -1, offScreen: true });

      $a('babybot-projectile').setVisible({ visible: false });

      engine.addEvents({
        2000: function() {
          // The planet opens a little hatch inside.
          $a('babybot-planet').showAnimation({
            speed: 300,
            count: 1,
            innerId: 'opening',
            imageIds: ['babybot/planet-opening-1',
                       'babybot/planet-opening-2',
                       'babybot/planet-opening-3',
                       'babybot/planet-opening-4']
          });
        },
        4000: function() {
          // The gift appears in the hatch and drops. The timing here
          // is careful so that the gift opens as soon as it hits the
          // ground.
          var actor = $a('babybot-planet');

          $a('babybot-gift').setVisible({ visible: true });
          $a('babybot-gift').transform({
            x: actor.rect.x + 85,
            y: actor.rect.y + 115 });

          $a('babybot-gift').showAnimation({
            speed: 180,
            count: 1,
            imageIds: ['babybot/gift-1',
                       'babybot/gift-1',
                       'babybot/gift-1',
                       'babybot/gift-2',
                       'babybot/gift-3',
                       'babybot/gift-3',
                       'babybot/gift-3',
                       'babybot/gift-3',
                       'babybot/gift-4',
                       'babybot/gift-4',
                       'babybot/gift-5',
                       'babybot/gift-5',
                       'babybot/gift-6']});

          // We want the bird to pick the head, but leave the gift packaging
          // alone. To that effect, the last frame of the gift
          // (babybot/gift-7), doesn’t have the head, which is substituted
          // by a real object (new-parts).
          $a('babybot-gift').addTransition({
            easing: engine.fall,
            onFinish: function() {
              $a('babybot-gift').showImage({ imageId: 'babybot/gift-7' });
              $a('new-parts').setVisible({ visible: true });
              $a('new-parts').transform({
                  x: $a('babybot-gift').rect.x + 35,
                  y: $a('babybot-gift').rect.y + 25 });
              $a('new-parts').setState({ state: 'head' });

              // The bird picks up new parts, then old parts, then they
              // merge and we move on.
              $a('bird').pickUpNewParts({
                onPickUp: function() {
                  $a('bird').rejoinDoodleBody();
                  $a('bird').pickUpOldParts({
                    onPickUp: function() {
                      $a('old-parts').setState({
                          state: 'connectors-eyes-head' });
                      $a('bird').setTarget({ x: 50, y: 140, land: false });

                      engine.addEvents({
                        750: function() {
                          engine.goToNextScene();
                        }
                      });
                    }
                  });
                }
              });
            },
            duration: 1500, properties: { x: 200, y: 480 }
          });
        },
        5100: function() {
          // As the gift is falling, we move it from the further plane to
          // a closer plane. This is so that it doesn’t appear on top of
          // the moon if it happens to be passing in front of it.
          $a('babybot-gift').transform({ plane: engine.PLANE_FOREGROUND });
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 12:
   * Trurl is walking (back) towards the construction site, the bird drops the
   * head on the machine Trurl was building.
   * ------------------------------------------------------------------------
   */
  {
    id: 'intermission-before-finale',
    interactive: true,
    onEnter: function() {
      engine.addEvents({
        0: function() {
          $a('trurl').setState({ state: 'walking' });

          $a('babybot-star-1').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-2').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-3').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-4').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-star-5').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-constellation-1').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-constellation-2').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-planet').addTransition({
              duration: 13000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });
          $a('babybot-gift').addTransition({
              duration: 10000, properties: {
                  relX: -engine.OFFSCREEN_RIGHT } });

          $a('trurl').addTransition({
              duration: 11000, properties: { x: 50 } });

          $a('bk-mountains').addTransition({
              duration: 22000,
              properties: {
                  relX: -22000 * engine.BK_MOUNTAINS_MULTIPLIER } });
          $a('mountains').addTransition({
              duration: 22000,
              properties: {
                  relX: -22000 * engine.MOUNTAINS_MULTIPLIER } });
        },
        5000: function() {
          // Cat shows up and accompanies Trurl and the bird on their final
          // walk.
          $a('cat').transform({ x: -60, y: 515 });
          $a('cat').setVisible({ visible: true });
          $a('cat').setState({ state: 'walking' });
          $a('cat').addTransition({
              duration: 8000,
              properties: { relX: 170 } });
        },
        7000: function() {
          $a('thought-cloud').show();
        },
        11000: function() {
          // We don’t want the planet nor the moon to auto-hide since they
          // routinely go off-screen, so we need to hide them manually.
          $a('babybot-planet').setVisible({ visible: false });
          $a('babybot-planet-moon').setVisible({ visible: false });

          // Prepare all the items for the finale off-screen.
          $a('construction-site').transform({ x: 430, y: 397 });
          $a('books').transform({ x: 460, y: 537 });
          $a('klapaucjusz').transform({ x: 660, y: 437 });
          $a('scaffolding-left-1').transform({ x: 426, y: 15 });
          $a('scaffolding-left-2').transform({ x: 486, y: 205 });
          $a('scaffolding-right-1').transform({ x: 661, y: 316 });
          $a('scaffolding-right-2').transform({ x: 721, y: 156 });
          $a('nbot').transform({ x: 470, y: -1 });

          $a('construction-site').setVisible({ visible: true });
          $a('books').setVisible({ visible: true });
          $a('klapaucjusz').setVisible({ visible: true });
          $a('nbot').setVisible({ visible: true });
          $a('scaffolding-left-1').setVisible({ visible: true });
          $a('scaffolding-left-2').setVisible({ visible: true });
          $a('scaffolding-right-1').setVisible({ visible: true });
          $a('scaffolding-right-2').setVisible({ visible: true });

          // The probability dragon appears on the scaffolding only
          // the third time you play, and all subsequent times (easter egg).
          if (engine.globalPlayCount >= 2) {
            $a('dragon').transform({ x: 693, y: 106 });
            $a('dragon').setVisible({ visible: true });
          }

          // Move things into view.

          $a('construction-site').addTransition({
            duration: 11000, properties: { relX: -430 } });
          $a('books').addTransition({
            duration: 11000, properties: { relX: -430 } });
          $a('scaffolding-left-1').addTransition({
            duration: 11000, properties: { relX: -420 } });
          $a('scaffolding-left-2').addTransition({
            duration: 11000, properties: { relX: -420 } });
          $a('scaffolding-right-1').addTransition({
            duration: 11000, properties: { relX: -420 } });
          $a('scaffolding-right-2').addTransition({
            duration: 11000, properties: { relX: -420 } });
          if ($a('dragon').rect.visible) {
            $a('dragon').addTransition({
              duration: 11000, properties: { relX: -420 } });
          }
          $a('nbot').addTransition({
            id: 'move-nbot',
            duration: 11000, properties: { relX: -470 } });
          $a('klapaucjusz').addTransition({
            duration: 11000, properties: { relX: -380 } });
        },
        18000: function() {
          // The cat moves toward Klapaucjusz.
          $a('cat').addTransition({
              duration: 6000,
              properties: { relX: 235, relY: 5 } });
        },
        21000: function() {
          // Klapaucjusz and Trurl exchange uneasy hellos.
          $a('klapaucjusz').setState({ state: 'hi' });
        },
        22000: function() {
          $a('trurl').setState({ state: 'hi' });
        },
        24000: function() {
          // The cat sits down.
          $a('cat').setState({ state: 'standing' });
        },
        24500: function() {
          $a('cat').setState({ state: 'sitting' });
        },
        24700: function() {
          if ($a('dragon').rect.visible) {
            // The dragon moves its head as it’s visible…
            $a('dragon').showAnimation({
              speed: 200,
              count: 1,
              imageIds: ['intro-finale/dragon-1',
                         'intro-finale/dragon-2',
                         'intro-finale/dragon-3',
                         'intro-finale/dragon-4',
                         'intro-finale/dragon-5',
                         'intro-finale/dragon-6']
            });

            // …and soon after disappears.
            engine.addEvent({
              startTime: engine.rangeRand({ min: 2000, max: 3000 }),
              onEvent: function() {
                $a('dragon').showAnimation({
                  speed: 200,
                  count: 1,
                  clearOnFinish: true,
                  imageIds: ['intro-finale/dragon-7',
                             'intro-finale/dragon-8',
                             'intro-finale/dragon-9',
                             'intro-finale/dragon-10',
                             'intro-finale/dragon-11',
                             'intro-finale/dragon-12',
                             'intro-finale/dragon-13',
                             'intro-finale/dragon-14',
                             'intro-finale/dragon-15',
                             'intro-finale/dragon-16',
                             'intro-finale/dragon-17']
                });
              }
            });
          }
        },
        25500: function() {
          // The bird drops the completed N-bot head on top and the head
          // becomes part of the N-bot and the standalone actor is
          // discarded.
          $a('bird').dropOldParts({
            x: 185, y: 45,
            onDrop: function() {
              $a('old-parts').setVisible({ visible: false });
              $a('nbot').setState({ state: 'deactivated-with-head' });

              $a('bird').setTarget({ x: 32, y: 508,
                                     land: true, targetId: 'books' });

              engine.addEvents({
                500: function() {
                  // The big button appears at the bottom of the page,
                  // waiting to be pressed to initiate the finale.
                  $a('nbot-button').transform({ x: 180, y: 495 });
                  $a('nbot-button').show();

                  engine.setInteractive({ interactive: true });
                  $a('trurl').setInteractive({ interactive: true });
                  $a('klapaucjusz').setInteractive({ interactive: true });

                  // (You can click on the cat at any time to make it go
                  // away earlier. But why are you such a cat hater?
                  // Seriously.)
                  $a('cat').setInteractive({ interactive: true });
                }
              });
            }
          });
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 13:
   * The N machine gets activated, Trurl and Klapaucjusz start asking
   * it for things.
   * ------------------------------------------------------------------------
   */
  {
    id: 'finale',
    onEnter: function() {
      var nItems = [];

      // Here, we are picking the two n-items that are requested by Trurl,
      // and subsequently created and dropped by N-Bot. This will vary both
      // on the domain we’re on (= the language we’re using), and sometimes
      // on whether you’re playing for the first time, the second time,
      // or the nth time.
      //
      // In general, we want the game on the first run to show the same
      // two n-items that start the original The Cyberiad story (How The
      // World Was Saved) as translated into the given language. On the
      // second run sometimes, we also curate the list, but every subsequent
      // run is just random two items from the list for a given language.
      // For some languages, like French and Hungarian, we don’t have the
      // initial items illustrated, so we skip them here on purpose and
      // always show random things.
      switch (engine.language) {
        case 'polish':
          switch (engine.globalPlayCount) {
            case 0:
              // First run: Thread + thimble
              nItems = ['thread', 'thimble'];
              break;
            case 1:
              // Second run: Thread/thimble + random item that’s neither
              nItems[0] = 'thread-thimble';
              do {
                nItems[1] = engine.setRand({
                    set: engine.COUNTRY_N_ITEMS[engine.language]});
              } while ((nItems[1] == 'thread-thimble') ||
                       (nItems[1] == 'thread') || (nItems[1] == 'thimble'));
              break;
          }
          break;
        case 'english':
          if (engine.globalPlayCount == 0) {
            nItems = ['needle', 'noodles'];
          }
          break;
        case 'russian':
          switch (engine.globalPlayCount) {
            case 0:
              nItems = ['thread', 'thimble'];
              break;
            case 1:
              nItems = ['thread-thimble', 'forget-me-not'];
              break;
          }
          break;
        case 'ukrainian':
          switch (engine.globalPlayCount) {
            case 0:
              nItems = ['thread', 'thimble'];
              break;
            case 1:
              nItems = ['thread-thimble', 'scissors'];
              break;
          }
          break;
        case 'german':
          if (engine.globalPlayCount == 0) {
            nItems = ['thread', 'pinstripe'];
          }
          break;
        case 'italian':
          if (engine.globalPlayCount == 0) {
            nItems = ['castanet', 'hazelnut'];
          }
          break;
        case 'spanish':
          if (engine.globalPlayCount == 0) {
            nItems = ['knife', 'necesere'];
          }
          break;
        case 'bulgarian':
          switch (engine.globalPlayCount) {
            case 0:
              nItems = ['thread', 'thimble'];
              break;
            case 1:
              nItems = ['thread-thimble', 'neutron'];
              break;
          }
          break;
        case 'czech':
          switch (engine.globalPlayCount) {
            case 0:
              nItems = ['thread', 'thimble'];
              break;
            case 1:
              nItems = ['thread-thimble', 'basket'];
              break;
          }
          break;
      }

      // If we didn’t generate anything above, try two random items
      if (nItems.length == 0) {
        do {
          nItems[0] = engine.setRand({
              set: engine.COUNTRY_N_ITEMS[engine.language]});
          nItems[1] = engine.setRand({
              set: engine.COUNTRY_N_ITEMS[engine.language]});
        } while (nItems[0] == nItems[1]);
      }

      // N-Bot powrs up.
      $a('nbot').setState({ state: 'first-activation' });

      // The big button goes away.
      $a('nbot-button').hide();
      engine.setInteractive({ interactive: false });

      engine.addEvents({
        1000: function() {
          $a('trurl').setInteractive({ interactive: false });
          $a('klapaucjusz').setInteractive({ interactive: false });
        },
        2000: function() {
          // The N-Bot announces it can do things for a letter N.
          $a('nbot-speech-bubble').transform({ x: 30, y: 15 });
          $a('nbot-speech-bubble').show();
        },
        3300: function() {
          $a('nbot-speech-bubble').showImage({
            innerId: 'letter',
            imageId: 'intro-finale/items-letter-' +
                     engine.COUNTRY_LETTER_N[engine.language]
          });
          $a('nbot-speech-bubble').addTransition({
              innerId: 'letter', count: Infinity,
              duration: 100, properties: { shiver: 1 }
          });
        },
        7000: function() {
          $a('nbot-speech-bubble').setVisible({ visible: false });
        },
        9000: function() {
          // The N-Bot eyes move towards the person who’s speaking or towards
          // the sky if creating things.
          $a('nbot').moveEyes({ pos: 100 });
          $a('speech-bubble').show({ x: 30, y: 320, item: nItems[0] });
        },
        13500: function() {
          // The N-Bot starts creating.
          $a('nbot').setState({ state: 'working' });
        },
        15000: function() {
          // The first item appears and drops to the ground.
          $a('nbot').setState({ state: 'activated' });

          $a('first-n-item').drop({ id: nItems[0] });
        },
        16000: function() {
          // Klapaucjusz is all like WTF?
          $a('klapaucjusz').setState({ state: 'standing-back' });
        },
        19500: function() {
          // The same sequence repeats for the second item.
          $a('klapaucjusz').setState({ state: 'looking-trurl' });
          $a('nbot').moveEyes({ pos: 100 });
          $a('speech-bubble').show({ x: 30, y: 320, item: nItems[1] });
        },
        24000: function() {
          $a('nbot').setState({ state: 'working' });
          $a('klapaucjusz').setState({ state: 'looking-away' });
        },
        25500: function() {
          $a('nbot').setState({ state: 'activated' });

          $a('second-n-item').drop({ id: nItems[1] });
        },
        26500: function() {
          $a('klapaucjusz').setState({ state: 'standing-back' });
        },
        29500: function() {
          // The sky gets darker, and Klapaucjusz requests Nothing.
          $a('sky').setStyle({ speed: 10, opacity: 1 });

          $a('klapaucjusz').setState({ state: 'looking-away' });
          $a('nbot').moveEyes({ pos: 40 });
          $a('speech-bubble').show({ x: 270, y: 280 });
        },
        32000: function() {
          // The cat is pretty smart and already walks away. (If you asked
          // it to walk away before, it’ll just walk away further
          // off-screen.)
          $a('cat').walkAway();
        },
        34000: function() {
          $a('nbot').setState({ state: 'working-final' });
        },
        34700: function() {
          // Various things on the screen start shaking as the Nbot
          // is working on Nothing.

          $a('nbot').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 50, properties: { relY: -2 }
          });
          $a('construction-site').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 60, properties: { relY: -2 }
          });
          $a('books').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 60, properties: { relY: -2 }
          });
          $a('first-n-item').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 60, properties: { relY: -2 }
          });
          $a('second-n-item').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 60, properties: { relY: -2 }
          });
          $a('scaffolding-left-1').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 45, properties: { relY: -1 }
          });
          $a('scaffolding-left-2').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 45, properties: { relY: -1 }
          });
          $a('scaffolding-right-1').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 30, properties: { relY: -2 }
          });
          $a('scaffolding-right-2').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 45, properties: { relY: -1 }
          });
          $a('trurl').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 40, properties: { relY: -2 }
          });
          $a('klapaucjusz').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 40, properties: { relY: -2 }
          });
          $a('mountains').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 50, properties: { relY: -1 }
          });
          $a('bk-mountains').addTransition({
            easing: engine.easeInOut, alternate: true, count: Infinity,
            duration: 50, properties: { relY: -1 }
          });

          engine.goToNextScene();
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 14:
   * The end: All hell breaks loose and the world starts disappearing.
   * ------------------------------------------------------------------------
   */
  {
    id: 'ending',
    onEnter: function() {
      engine.doodleFinished();

      engine.addEvents({
        0: function() {
          // The sky gets more violent.
          $a('sky').setStyle({ speed: 1000, opacity: .95 });

          // The inside explosions start here. These are the explosions
          // that remove elements within the doodle.
          $a('inside-explosions').setVisible({ visible: true });

          $a('bird').setTarget({ x: 20, y: -80, land: false });
        },
        1000: function() {
          // The outside explosions start here. These are the explosions
          // that get rid of the DOM elements on the page. The logic for
          // this is contained within that actor.
          $a('outside-explosions').startExplosions();
        },
        3400: function() {
          // We are starting to remove items on the screen.
          $a('inside-explosions').explodeActor({
              actorId: 'scaffolding-left-1' });
        },
        3800: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'scaffolding-left-2' });
        },
        4000: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'easel' });
        },
        4200: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-1' });
        },
        4400: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-2' });
        },
        4500: function() {
          // The bird moves behind the Nbot as it flies away.
          $a('bird').transform({ plane: engine.PLANE_BACKGROUND,
                                 planeCorrection: -50 });
        },
        4600: function() {
          $a('inside-explosions').explodeActor({ actorId: 'books' });
        },
        4800: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-3' });
        },
        5000: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'scaffolding-right-1' });
        },
        5200: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'charging-station' });
        },
        5300: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'scaffolding-right-2' });
        },
        5400: function() {
          // Klapaucjusz realizes something’s seriously wrong.
          $a('klapaucjusz').setState({ state: 'surprise' });
        },
        5500: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'first-n-item' });
        },
        5600: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'toolbar-wait' });
        },
        5800: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-4' });
        },
        6000: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'second-n-item' });
        },
        6200: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-5' });
        },
        6300: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'toolbar-tooltip' });
        },
        6500: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'logo' });
        },
        6700: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-6' });
        },
        6900: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-7' });
        },
        7200: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-8' });
        },
        7500: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'bk-mountains',
              insideId: 'mountain' });
        },
        7800: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-9' });
        },
        8000: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-10' });
        },
        8200: function() {
          $a('inside-explosions').explodeActor({
              actorId: 'construction-site', innerId: 'stuff-11' });
        },
        8500: function() {
          // Trurl runs off-screen.
          $a('trurl').setState({ state: 'running' });
          $a('trurl').addTransition({
            easing: engine.linear,
            duration: 2000, properties: { x: -100 } });
        },
        9000: function() {
          // Klapaucjusz runs off-screen.
          $a('klapaucjusz').setState({ state: 'running' });
          $a('klapaucjusz').addTransition({
            easing: engine.linear,
            duration: 2000, properties: { x: 550 } });
        },
        11000: function() {
          if ($a('mouse-pointer').rect.visible) {
            // Only destroy the mouse pointer if it’s visible.
            var x = $a('mouse-pointer').rect.x;
            var y = $a('mouse-pointer').rect.y;

            if ((x >= -20) && (x <= engine.INITIAL_WIDTH + 40) &&
               (y >= -20) && (y <= engine.EXPANDED_HEIGHT)) {
              $a('inside-explosions').explodeActor({
                  actorId: 'mouse-pointer' });
            }
          } else {
            // Otherwise still hide is so that it won’t come back
            // if the user moves it after this
            $a('mouse-pointer').setVisible({ visible: false });
          }
        },
        12000: function() {
          // Destroy the sky bit by bit.
          for (var i in $a('sky').innerRects) {
            engine.addEvent({
              startTime: engine.rangeRand({ min: 0, max: 1000 }),
              onEvent: (function(i) {
                return function() {
                  // (Only every fourth element gets an explosion.)
                  if (engine.modulo(
                          { val: $a('sky').innerRects[i].innerCount,
                            mod: 4 }) == 0) {
                    $a('inside-explosions').explodeActor({
                        actorId: 'sky', innerId: i,
                        randomHorizontalPos: true });
                  } else {
                    $a('sky').clear({ innerId: i });
                  }
                }
              })(i)
            });
          }
        },
        14500: function() {
          // At this point, everything inside the doodle should have
          // disappeared. The outside explosions might have finished by now,
          // or not yet – it’s hard to say, given we don’t know how many
          // elements are on the page. Essentially, both everythingExploded()
          // functions check on another and if they’re both done, we proceed
          // to the next scene.
          $a('inside-explosions').everythingExploded();
        }
      });
    }
  },

  /* ------------------------------------------------------------------------
   * Scene 15:
   * Not really a scene: We remove N-Bot and go to search results.
   * ------------------------------------------------------------------------
   */
  {
    id: 'going-to-search-results',
    onEnter: function() {
      engine.addEvents({
        1000: function() {
          $a('inside-explosions').explodeActor({ actorId: 'nbot' });
        },
        4000: function() {
          engine.goToSearchResults();
        }
      });
    }
  }
];

/**
 * A list of all the image ids, in groups that we use to preload them later.
 * Each group corresponds to a different sprite.
 * @const
 */
engine.IMAGE_SETS = {
  // Things we need for the doodle to even show up.
  'intro': [
    'background/sky-3-1',
    'background/sky-3-2',
    'background/sky-3-3',
    'background/sky-4-1',
    'background/sky-4-2',
    'background/sky-4-3',
    'background/sky-5-1',
    'background/sky-5-2',
    'background/sky-5-3',
    'background/sky-6-1',
    'background/sky-6-2',
    'background/sky-6-3',

    'ui/loading',

    'background/mask-big-left',
    'background/mask-big-right',
    'background/mask-small-left',
    'background/mask-small-right',

    'ui/loading-progress-bar',

    'bird/body',
    'bird/wing-l-1',
    'bird/wing-l-2',
    'bird/wing-l-3',
    'bird/wing-l-4',
    'bird/wing-l-5',
    'bird/wing-l-6',
    'bird/wing-r-1',
    'bird/wing-r-2',
    'bird/wing-r-3',
    'bird/wing-r-4',
    'bird/wing-r-5',
    'bird/wing-r-6',
    'bird/antennae-1',
    'bird/antennae-2',
    'bird/antennae-3',
    'bird/antennae-4',
    'bird/antennae-5',
    'bird/antennae-6',
    'bird/eyes',

    'mouse-pointer/normal-black-1',
    'mouse-pointer/normal-black-2',
    'mouse-pointer/normal-black-3',
    'mouse-pointer/normal-white-1',
    'mouse-pointer/normal-white-2',
    'mouse-pointer/normal-white-3',
    'mouse-pointer/hover-1',
    'mouse-pointer/hover-2',
    'mouse-pointer/hover-3',
    'mouse-pointer/click',
    'mouse-pointer/wait-1',
    'mouse-pointer/wait-2',
    'mouse-pointer/wait-3',

    'ui/toolbar-wait-1',
    'ui/toolbar-wait-2',
    'ui/toolbar-wait-3',
    'ui/toolbar-wait-4',
    'ui/toolbar-wait-5',
    'ui/toolbar-wait-6',
    'ui/toolbar-wait-7',
    'ui/toolbar-wait-8',

    'ui/button-ffwd',
    'ui/button-ffwd-press-1',
    'ui/button-ffwd-press-2',
    'ui/button-tooltip',
    'ui/button-tooltip-press-1',
    'ui/button-tooltip-press-2',

    'ui/tooltip-arm',
    'ui/tooltip-hand',
    'ui/tooltip-hand-push',
    'ui/tooltip-flag',
    'ui/tooltip-cloud',

    'logo',
    'intro-finale/books',
    'intro-finale/easel',
    'intro-finale/charging-station',
    'intro-finale/stuff-1',
    'intro-finale/stuff-2',
    'intro-finale/stuff-3',
    'intro-finale/stuff-4',
    'intro-finale/stuff-5',
    'intro-finale/stuff-6',
    'intro-finale/stuff-7',
    'intro-finale/stuff-8',
    'intro-finale/stuff-9',
    'intro-finale/stuff-10',
    'intro-finale/stuff-11',

    'intro-finale/start-button',
    'intro-finale/start-button-press-1',
    'intro-finale/start-button-press-2',

    'trurl/sitting',
    'trurl/sitting-down-1',
    'trurl/sitting-down-2',
    'trurl/sitting-down-3',
    'trurl/sitting-down-4',
    'trurl/looking-away-right',
    'trurl/looking-away-right-tap-1',
    'trurl/looking-away-right-tap-2',
    'trurl/looking-away-right-tap-3',
    'trurl/looking-away-right-tap-4',
    'trurl/looking-away-left',
    'trurl/looking-away-left-tap-1',
    'trurl/looking-away-left-tap-2',
    'trurl/looking-away-left-tap-3',
    'trurl/looking-away-left-tap-4',
    'trurl/looking-right',
    'trurl/looking-left',
    'trurl/looking-up',
    'trurl/walk-1',
    'trurl/walk-2',
    'trurl/walk-3',
    'trurl/walk-4',
    'trurl/walk-5',
    'trurl/walk-6',
    'trurl/walk-7',
    'trurl/walk-8',

    'background/mountain-1',
    'background/mountain-2'
  ],

  // Things we need as soon as we start playing.
  'all-levels': [
    'trurl-thought-cloud/disassemble-1',
    'trurl-thought-cloud/disassemble-2',
    'trurl-thought-cloud/disassemble-3',
    'trurl-thought-cloud/disassemble-4',
    'trurl-thought-cloud/disassemble-5',
    'trurl-thought-cloud/disassemble-6',
    'trurl-thought-cloud/disassemble-7',
    'trurl-thought-cloud/disassemble-8',
    'trurl-thought-cloud/disassemble-9',
    'trurl-thought-cloud/disassemble-10',

    'bird/parts-connectors',
    'bird/parts-eyes',
    'bird/parts-connectors-eyes',
    'bird/parts-head',
    'bird/parts-complete',
    'nbot/head-1',

    'trurl/waiting-user',
    'trurl/no-1',
    'trurl/no-2',
    'trurl/no-3',
    'trurl/no-4',
    'trurl/no-5',
    'trurl/no-6',
    'trurl/no-7',
    'trurl/no-8',
    'trurl/no-9',
    'trurl/no-10',
    'trurl/no-11',
    'trurl/no-12',
    'trurl/no-13',
    'trurl/happy-1',
    'trurl/happy-2',
    'trurl/happy-3',

    'trurl-thought-cloud/opening-1',
    'trurl-thought-cloud/opening-2',
    'trurl-thought-cloud/opening-3',
    'trurl-thought-cloud/opening-4',
    'trurl-thought-cloud/opening-5',
    'trurl-thought-cloud/opening-6',
    'trurl-thought-cloud/opening-7',
    'trurl-thought-cloud/opening-8',
    'trurl-thought-cloud/opening-9',
    'trurl-thought-cloud/connectors-hollow',
    'trurl-thought-cloud/connectors',
    'trurl-thought-cloud/head-hollow',
    'trurl-thought-cloud/head',
    'trurl-thought-cloud/eyes-hollow',
    'trurl-thought-cloud/eyes'
  ],

  // Images needed for level 1, split into various files so they load faster
  // in parallel, and also not to the 3-megapixel limit in iOS.
  'level-1-1': [
    'numbot/explosion-1',
    'numbot/explosion-2',
    'numbot/explosion-3',
    'numbot/explosion-4',
    'numbot/explosion-5',
    'numbot/explosion-6',
    'numbot/explosion-7',
    'numbot/explosion-8',
    'numbot/explosion-9',
    'numbot/explosion-10',
    'numbot/explosion-11',
    'numbot/explosion-12',
    'numbot/explosion-13',
    'numbot/explosion-14',
    'numbot/explosion-15',

    'numbot/inside-brick',
    'numbot/inside-chassis-1',
    'numbot/inside-chassis-2',

    'numbot/button-top',
    'numbot/button-left-top',
    'numbot/button-right-top',
    'numbot/button-left-bottom',
    'numbot/button-right-bottom',
    'numbot/button-bottom',
    'numbot/button-activate',
    'numbot/button-top-press',
    'numbot/button-left-top-press',
    'numbot/button-right-top-press',
    'numbot/button-left-bottom-press',
    'numbot/button-right-bottom-press',
    'numbot/button-bottom-press',
    'numbot/button-activate-press-1',
    'numbot/button-activate-press-2',
    'numbot/button-alt-left-top',
    'numbot/button-alt-left-bottom',
    'numbot/button-alt-left-top-press',
    'numbot/button-alt-left-bottom-press'
  ],

  'level-1-2': [
    'hints/bubble-1',
    'hints/bubble-2',
    'hints/bubble-3',
    'hints/bubble-4',
    'hints/bubble-5',
    'hints/bubble-6',
    'hints/bubble-7',
    'hints/bubble-8',
    'hints/numbot-button-1',
    'hints/numbot-button-2',
    'hints/numbot-button-3',
    'hints/numbot-formula-1-1',
    'hints/numbot-formula-1-2',
    'hints/numbot-formula-1-3',
    'hints/numbot-formula-2-1',
    'hints/numbot-formula-2-2',
    'hints/numbot-formula-2-3',
    'hints/numbot-formula-3-1',
    'hints/numbot-formula-3-2',
    'hints/numbot-formula-3-3',
    'hints/numbot-mouse-pointer-1',
    'hints/numbot-mouse-pointer-2',
    'hints/numbot-mouse-pointer-3',

    'numbot/head-1',
    'numbot/head-2',
    'numbot/head-3',
    'numbot/head-4',
    'numbot/head-5',
    'numbot/head-6',
    'numbot/head-7',
    'numbot/head-8',
    'numbot/head-9',
    'numbot/head-happy',

    'numbot/steam-2-1',
    'numbot/steam-2-2',
    'numbot/steam-2-3',
    'numbot/steam-3-1',
    'numbot/steam-3-2',
    'numbot/steam-3-3',

    'numbot/body',
    'numbot/body-cover-1',
    'numbot/body-cover-2',
    'numbot/body-cover-3',
    'numbot/body-cover-4',
    'numbot/body-cover-5',
    'numbot/body-cover-6',
    'numbot/body-cover-7',
    'numbot/body-cover-8',
    'numbot/body-cover-9',
    'numbot/body-cover-10',
    'numbot/l-upper-arm',
    'numbot/l-upper-arm-rotate-0.8',
    'numbot/l-upper-arm-rotate-0.4',
    'numbot/l-upper-arm-rotate0.4',
    'numbot/l-upper-arm-rotate0.8',
    'numbot/l-lower-arm',
    'numbot/l-lower-arm-rotate-1.2',
    'numbot/l-lower-arm-rotate-0.6',
    'numbot/l-lower-arm-rotate0.6',
    'numbot/l-lower-arm-rotate1.2',
    'numbot/l-leg',
    'numbot/r-upper-arm',
    'numbot/r-upper-arm-rotate-0.8',
    'numbot/r-upper-arm-rotate-0.4',
    'numbot/r-upper-arm-rotate0.4',
    'numbot/r-upper-arm-rotate0.8',
    'numbot/r-lower-arm',
    'numbot/r-lower-arm-rotate-1.2',
    'numbot/r-lower-arm-rotate-0.6',
    'numbot/r-lower-arm-rotate0.6',
    'numbot/r-lower-arm-rotate1.2',
    'numbot/l-hand',
    'numbot/l-hand-rotate-4',
    'numbot/l-hand-rotate-2',
    'numbot/l-hand-rotate2',
    'numbot/l-hand-rotate4',
    'numbot/r-hand',
    'numbot/r-hand-rotate-4',
    'numbot/r-hand-rotate-2',
    'numbot/r-hand-rotate2',
    'numbot/r-hand-rotate4',
    'numbot/r-leg',

    'numbot/digit-window-1',
    'numbot/digit-window-2',
    'numbot/digit-window-3',

    'numbot/formula-1-1',
    'numbot/formula-1-2',
    'numbot/formula-1-3',
    'numbot/formula-1-4',
    'numbot/formula-1-5',
    'numbot/formula-1-6',
    'numbot/formula-1-7',
    'numbot/formula-1-8',
    'numbot/formula-1-9',
    'numbot/formula-1-10',
    'numbot/formula-1-11',
    'numbot/formula-1-12',
    'numbot/formula-1-13',
    'numbot/formula-1-14',
    'numbot/formula-1-15',
    'numbot/formula-1-16',
    'numbot/formula-1-17',
    'numbot/formula-1-18',
    'numbot/formula-1-19',
    'numbot/formula-1-20',
    'numbot/formula-1-21',
    'numbot/formula-1-22',
    'numbot/formula-1-23',
    'numbot/formula-1-24',
    'numbot/formula-2-1',
    'numbot/formula-2-2',
    'numbot/formula-2-3',
    'numbot/formula-2-4',
    'numbot/formula-2-5',
    'numbot/formula-2-6',
    'numbot/formula-2-7',
    'numbot/formula-2-8',
    'numbot/formula-2-9',
    'numbot/formula-2-10',
    'numbot/formula-2-11',
    'numbot/formula-2-12',
    'numbot/formula-2-13',
    'numbot/formula-2-14',
    'numbot/formula-2-15',
    'numbot/formula-2-16',
    'numbot/formula-2-17',
    'numbot/formula-2-18',
    'numbot/formula-2-19',
    'numbot/formula-2-20',
    'numbot/formula-2-21',
    'numbot/formula-2-22',
    'numbot/formula-2-23',
    'numbot/formula-2-24',
    'numbot/formula-2-25',
    'numbot/formula-2-26',
    'numbot/formula-2-27',
    'numbot/formula-2-28',
    'numbot/formula-2-29',
    'numbot/formula-2-30',
    'numbot/formula-2-31',
    'numbot/formula-2-32',
    'numbot/formula-2-33',
    'numbot/formula-2-34',
    'numbot/formula-2-35',
    'numbot/formula-2-36',
    'numbot/formula-2-37',
    'numbot/formula-2-38',
    'numbot/formula-2-39',
    'numbot/formula-2-40',
    'numbot/formula-2-41',
    'numbot/formula-2-42',
    'numbot/formula-2-43',
    'numbot/formula-2-44',
    'numbot/formula-2-45',
    'numbot/formula-2-46',
    'numbot/formula-2-47',
    'numbot/formula-2-48',
    'numbot/formula-2-49',
    'numbot/formula-2-50',
    'numbot/formula-2-51',
    'numbot/formula-2-52',
    'numbot/formula-2-53',
    'numbot/formula-2-54',
    'numbot/formula-2-55',
    'numbot/formula-3-1',
    'numbot/formula-3-2',
    'numbot/formula-3-3',
    'numbot/formula-3-4',
    'numbot/formula-3-5',
    'numbot/formula-3-6',
    'numbot/formula-3-7',
    'numbot/formula-3-8',
    'numbot/formula-3-9',
    'numbot/formula-3-10',
    'numbot/formula-3-11',
    'numbot/formula-3-12',
    'numbot/formula-3-13',
    'numbot/formula-3-14',
    'numbot/formula-3-15',
    'numbot/formula-3-16',
    'numbot/formula-3-17',
    'numbot/formula-3-18',
    'numbot/formula-3-19',
    'numbot/formula-3-20',
    'numbot/formula-3-21',
    'numbot/formula-3-22',
    'numbot/formula-3-23',
    'numbot/formula-3-24',
    'numbot/formula-3-25',
    'numbot/formula-3-26',
    'numbot/formula-3-27',
    'numbot/formula-3-28',
    'numbot/formula-3-29',
    'numbot/formula-3-30',
    'numbot/formula-3-31',
    'numbot/formula-3-32',
    'numbot/formula-3-33',
    'numbot/formula-3-34',
    'numbot/formula-3-35',
    'numbot/formula-3-36',
    'numbot/formula-3-37',
    'numbot/formula-3-38',
    'numbot/formula-3-39',
    'numbot/formula-3-40',
    'numbot/formula-3-41',
    'numbot/formula-3-42',
    'numbot/formula-3-43',
    'numbot/formula-3-44',
    'numbot/formula-3-45',
    'numbot/formula-3-46',
    'numbot/formula-3-47',
    'numbot/formula-3-48',
    'numbot/formula-3-49',
    'numbot/formula-3-50',
    'numbot/formula-3-51',
    'numbot/formula-3-52',
    'numbot/formula-3-53',
    'numbot/formula-3-54',
    'numbot/formula-3-end-1',
    'numbot/formula-3-end-2',
    'numbot/formula-3-end-3',
    'numbot/formula-3-end-4',
    'numbot/formula-3-end-5',
    'numbot/formula-3-end-6',
    'numbot/formula-3-end-7',
    'numbot/formula-3-end-8',
    'numbot/formula-3-end-9',
    'numbot/formula-3-end-10',
    'numbot/formula-3-end-11',
    'numbot/formula-3-end-12',
    'numbot/formula-3-end-13',
    'numbot/formula-3-end-14',
    'numbot/formula-3-end-15',
    'numbot/formula-3-end-16',
    'numbot/formula-3-end-17',
    'numbot/formula-3-end-18',
    'numbot/formula-3-end-19',
    'numbot/formula-3-end-20',
    'numbot/formula-3-end-21',
    'numbot/formula-3-end-22',
    'numbot/formula-3-end-23',
    'numbot/formula-3-end-24',
    'numbot/formula-3-end-25',
    'numbot/formula-3-end-26',
    'numbot/formula-3-end-27',
    'numbot/formula-3-end-28',

    'numbot/formula-1-segment-1',
    'numbot/formula-1-segment-2',
    'numbot/formula-1-segment-3',
    'numbot/formula-1-segment-4',
    'numbot/formula-1-segment-5',
    'numbot/formula-1-segment-6',
    'numbot/formula-1-segment-7',
    'numbot/formula-2-segment-1',
    'numbot/formula-2-segment-2',
    'numbot/formula-2-segment-3',
    'numbot/formula-2-segment-4',
    'numbot/formula-2-segment-5',
    'numbot/formula-2-segment-6',
    'numbot/formula-2-segment-7',
    'numbot/formula-3-segment-1',
    'numbot/formula-3-segment-2',
    'numbot/formula-3-segment-3',
    'numbot/formula-3-segment-4',
    'numbot/formula-3-segment-5',
    'numbot/formula-3-segment-6',
    'numbot/formula-3-segment-7'
  ],

  // Images for level 2.
  'level-2-1': [
    'demonbot/paper-finale-11',
    'demonbot/paper-finale-13',
    'demonbot/paper-finale-15',
    'demonbot/paper-finale-17',
    'demonbot/paper-finale-19',
    'demonbot/paper-finale-21',
    'demonbot/paper-finale-23',
    'demonbot/paper-finale-25',
    'demonbot/paper-finale-27',
    'demonbot/paper-finale-29'
  ],

  'level-2-2': [
    'demonbot/hair',
    'demonbot/hair-rotate-0.5',
    'demonbot/hair-rotate-1',
    'demonbot/hair-rotate-1.5',
    'demonbot/hair-rotate-2',
    'demonbot/hair-rotate-2.5',
    'demonbot/hair-rotate-3',
    'demonbot/hair-rotate-3.5',
    'demonbot/hair-rotate-4',
    'demonbot/hair-rotate-4.5',
    'demonbot/hair-rotate-4.75',
    'demonbot/hair-rotate-5',

    'hints/demonbot-target-wave-1',
    'hints/demonbot-target-wave-2',
    'hints/demonbot-target-wave-3',
    'hints/demonbot-wave-1',
    'hints/demonbot-wave-2',
    'hints/demonbot-wave-3',

    'demonbot/paper-finale-1',
    'demonbot/paper-finale-3',
    'demonbot/paper-finale-5',
    'demonbot/paper-finale-7',
    'demonbot/paper-finale-9',

    'background/satellite',

    'demonbot/eye-big',
    'demonbot/eye-medium',
    'demonbot/eye-small',

    'demonbot/big-eye-left',
    'demonbot/big-eye-right-1',
    'demonbot/big-eye-right-2',
    'demonbot/big-eye-right-3',
    'demonbot/big-eye-right-4',
    'demonbot/big-eye-right-5',
    'demonbot/big-eye-right-6',
    'demonbot/big-eye-right-7',
    'demonbot/big-eye-right-8',
    'demonbot/big-eye-right-9',
    'demonbot/big-eye-right-10',
    'demonbot/big-eye-right-11',
    'demonbot/big-eye-right-12',

    'demonbot/ui-cogs-1',
    'demonbot/ui-cogs-2',
    'demonbot/ui-cogs-3',
    'demonbot/ui-cogs-4',
    'demonbot/ui-cogs-5',
    'demonbot/ui-cogs-6',
    'demonbot/ui-cogs-7',
    'demonbot/ui-cogs-8',
    'demonbot/ui-cogs-9',
    'demonbot/ui-cogs-10',
    'demonbot/ui-cogs-11',
    'demonbot/ui-cogs-12',
    'demonbot/ui-cogs-13',
    'demonbot/ui-cogs-14',
    'demonbot/ui-cogs-15',
    'demonbot/ui-cogs-16',
    'demonbot/ui-cogs-17',
    'demonbot/ui-cogs-18',
    'demonbot/ui-cogs-19',
    'demonbot/ui-cogs-20',

    'demonbot/ui',
    'demonbot/ui-top',
    'demonbot/ui-dial-amplitude-empty',
    'demonbot/ui-dial-amplitude-mid',
    'demonbot/ui-dial-amplitude-short',
    'demonbot/ui-dial-amplitude-tall',
    'demonbot/ui-dial-frequency-empty',
    'demonbot/ui-dial-frequency-mid',
    'demonbot/ui-dial-frequency-squish',
    'demonbot/ui-dial-frequency-stretch',
    'demonbot/ui-dial-wave-empty',
    'demonbot/ui-dial-wave-saw',
    'demonbot/ui-dial-wave-sine',
    'demonbot/ui-dial-wave-square',
    'demonbot/ui-button-activate',
    'demonbot/ui-button-activate-press-1',
    'demonbot/ui-button-activate-press-2',
    'demonbot/ui-button-activate-press-3',
    'demonbot/ui-button-left',
    'demonbot/ui-button-right',
    'demonbot/ui-button-left-press',
    'demonbot/ui-button-right-press',

    'demonbot/ui-extension-1',
    'demonbot/ui-extension-2',
    'demonbot/ui-extension-3',

    'demonbot/paper-1',
    'demonbot/paper-2',
    'demonbot/paper-3',
    'demonbot/paper-4',
    'demonbot/paper-5',
    'demonbot/paper-6',
    'demonbot/paper-7',
    'demonbot/paper-8',

    'demonbot/left-hand-1',
    'demonbot/left-hand-2',
    'demonbot/left-hand-3',
    'demonbot/left-hand-4',
    'demonbot/left-hand-5',
    'demonbot/left-hand-6',
    'demonbot/left-hand-7',
    'demonbot/left-hand-8',
    'demonbot/left-hand-9',
    'demonbot/left-hand-10',
    'demonbot/left-hand-11',
    'demonbot/left-hand-12',
    'demonbot/left-hand-13',
    'demonbot/left-hand-14',
    'demonbot/left-hand-15',

    'demonbot/right-hand-1',
    'demonbot/right-hand-2',
    'demonbot/right-hand-3',
    'demonbot/right-hand-4',
    'demonbot/right-hand-5',
    'demonbot/right-hand-6',
    'demonbot/right-hand-7',
    'demonbot/right-hand-8',
    'demonbot/right-hand-9',
    'demonbot/right-hand-10',
    'demonbot/right-hand-11',
    'demonbot/right-hand-12',
    'demonbot/right-hand-13',
    'demonbot/right-hand-14',
    'demonbot/right-hand-15',
    'demonbot/right-hand-16',
    'demonbot/right-hand-17',
    'demonbot/right-hand-18',
    'demonbot/right-hand-19',
    'demonbot/right-hand-20',
    'demonbot/right-hand-21',
    'demonbot/right-hand-22',
    'demonbot/right-hand-23',
    'demonbot/right-hand-24',
    'demonbot/right-hand-25',
    'demonbot/right-hand-26',
    'demonbot/right-hand-27',
    'demonbot/right-hand-28',
    'demonbot/right-hand-29',
    'demonbot/right-hand-30',
    'demonbot/right-hand-31',
    'demonbot/right-hand-32',
    'demonbot/right-hand-33',
    'demonbot/right-hand-34',
    'demonbot/right-hand-35',
    'demonbot/right-hand-36',
    'demonbot/right-hand-37',
    'demonbot/right-hand-38',
    'demonbot/right-hand-39',
    'demonbot/right-hand-40',

    'demonbot/pen-base-top',
    'demonbot/pen-base-bottom',
    'demonbot/pen-extend-1',
    'demonbot/pen-extend-2',
    'demonbot/pen-extend-3',
    'demonbot/pen-extend-4'
  ],
  'level-2-3': [
    'demonbot/paper-finale-30',
    'demonbot/paper-finale-31',
    'demonbot/paper-finale-32',
    'demonbot/paper-finale-33',
    'demonbot/paper-finale-34',
    'demonbot/paper-finale-35'
  ],
  'level-2-4': [
    'demonbot/paper-finale-36',
    'demonbot/paper-finale-37',
    'demonbot/paper-finale-38',
    'demonbot/paper-finale-39',
    'demonbot/paper-finale-40',
    'demonbot/body',

    'demonbot/wave-saw-mid-mid',
    'demonbot/wave-saw-mid-squish',
    'demonbot/wave-saw-mid-stretch',
    'demonbot/wave-saw-short-mid',
    'demonbot/wave-saw-short-squish',
    'demonbot/wave-saw-short-stretch',
    'demonbot/wave-saw-tall-mid',
    'demonbot/wave-saw-tall-squish',
    'demonbot/wave-saw-tall-stretch',

    'demonbot/wave-sine-mid-mid',
    'demonbot/wave-sine-mid-squish',
    'demonbot/wave-sine-mid-stretch',
    'demonbot/wave-sine-short-mid',
    'demonbot/wave-sine-short-squish',
    'demonbot/wave-sine-short-stretch',
    'demonbot/wave-sine-tall-mid',
    'demonbot/wave-sine-tall-squish',
    'demonbot/wave-sine-tall-stretch',

    'demonbot/wave-square-mid-mid',
    'demonbot/wave-square-mid-squish',
    'demonbot/wave-square-mid-stretch',
    'demonbot/wave-square-short-mid',
    'demonbot/wave-square-short-squish',
    'demonbot/wave-square-short-stretch',
    'demonbot/wave-square-tall-mid',
    'demonbot/wave-square-tall-squish',
    'demonbot/wave-square-tall-stretch',

    'demonbot/wave-target'
  ],

  'level-2-5': [
    'demonbot/pen-extend-5',
    'demonbot/pen-extend-6',
    'demonbot/pen-extend-7',
    'demonbot/pen-extend-8',
    'demonbot/pen-extend-9',
    'demonbot/pen-extend-10',
    'demonbot/pen-extend-11',
    'demonbot/pen-extend-12',
    'demonbot/pen-extend-13',
    'demonbot/pen-extend-14',
    'demonbot/pen-extend-15',
    'demonbot/pen-extend-16',
    'demonbot/pen-extend-17',
    'demonbot/pen-extend-18',
    'demonbot/pen-extend-19',
    'demonbot/pen-extend-20',
    'demonbot/pen-extend-21',
    'demonbot/pen-extend-22',
    'demonbot/pen-extend-23',
    'demonbot/pen-extend-24',
    'demonbot/pen-extend-25',
    'demonbot/pen-extend-26',
    'demonbot/pen-extend-27',
    'demonbot/pen-extend-28',
    'demonbot/pen-extend-29',
    'demonbot/pen-extend-30',
    'demonbot/pen-extend-31',
    'demonbot/pen-extend-32',
    'demonbot/pen-extend-33',
    'demonbot/pen-extend-34',
    'demonbot/pen-extend-35',
    'demonbot/pen-extend-36',
    'demonbot/pen-extend-37',
    'demonbot/pen-extend-38',
    'demonbot/pen-extend-39',
    'demonbot/pen-extend-40'
  ],

  // Images needed for level 3.
  'level-3': [
    'babybot/planet-opening-1',
    'babybot/planet-opening-2',
    'babybot/planet-opening-3',
    'babybot/planet-opening-4',

    'babybot/gift-1',
    'babybot/gift-2',
    'babybot/gift-3',
    'babybot/gift-4',
    'babybot/gift-5',
    'babybot/gift-6',
    'babybot/gift-7',

    'babybot/planet-1-explosion-1',
    'babybot/planet-1-explosion-2',
    'babybot/planet-1-explosion-3',
    'babybot/planet-1-explosion-4',
    'babybot/planet-2-explosion-1',
    'babybot/planet-2-explosion-2',
    'babybot/planet-2-explosion-3',
    'babybot/planet-2-explosion-4',
    'babybot/planet-3-explosion-1',
    'babybot/planet-3-explosion-2',
    'babybot/planet-3-explosion-3',
    'babybot/planet-3-explosion-4',

    'babybot/planet-1-ambiance-1',
    'babybot/planet-1-ambiance-2',
    'babybot/planet-1-ambiance-3',
    'babybot/planet-1-ambiance-4',
    'babybot/planet-1-ambiance-5',
    'babybot/planet-1-ambiance-6',
    'babybot/planet-1-ambiance-7',
    'babybot/planet-1-ambiance-8',
    'babybot/planet-1-ambiance-9',
    'babybot/planet-1-ambiance-10',
    'babybot/planet-1-ambiance-11',
    'babybot/planet-1-ambiance-12',
    'babybot/planet-1-ambiance-13',
    'babybot/planet-1-ambiance-14',
    'babybot/planet-1-ambiance-15',
    'babybot/planet-1-ambiance-16',
    'babybot/planet-1-ambiance-17',
    'babybot/planet-1-ambiance-18',
    'babybot/planet-1-ambiance-19',
    'babybot/planet-1-ambiance-20',

    'babybot/planet-2-ambiance-1',
    'babybot/planet-2-ambiance-2',
    'babybot/planet-2-ambiance-3',
    'babybot/planet-2-ambiance-4',
    'babybot/planet-2-ambiance-5',

    'babybot/planet-3-ambiance-1',
    'babybot/planet-3-ambiance-2',
    'babybot/planet-3-ambiance-3',
    'babybot/planet-3-ambiance-4',
    'babybot/planet-3-ambiance-5',

    'babybot/planet-4-ambiance-1',
    'babybot/planet-4-ambiance-2',
    'babybot/planet-4-ambiance-3',
    'babybot/planet-4-ambiance-4',
    'babybot/planet-4-ambiance-5',

    'babybot/cannon-wheel',
    'babybot/cannon-wheel-rotate24',
    'babybot/cannon-wheel-rotate48',
    'babybot/cannon-wheel-rotate72',
    'babybot/cannon-wheel-rotate96',
    'babybot/cannon-wheel-rotate120',
    'babybot/cannon-wheel-rotate144',
    'babybot/cannon-wheel-rotate168',
    'babybot/cannon-wheel-rotate-168',
    'babybot/cannon-wheel-rotate-144',
    'babybot/cannon-wheel-rotate-120',
    'babybot/cannon-wheel-rotate-96',
    'babybot/cannon-wheel-rotate-72',
    'babybot/cannon-wheel-rotate-48',
    'babybot/cannon-wheel-rotate-24',

    'babybot/planet-3',
    'babybot/planet-4',

    'babybot/cannon-body',
    'babybot/cannon-body-rotate1',
    'babybot/cannon-body-rotate2',
    'babybot/cannon-body-rotate3',
    'babybot/cannon-body-rotate4',
    'babybot/cannon-body-rotate5',
    'babybot/cannon-body-rotate-1',
    'babybot/cannon-body-rotate-2',
    'babybot/cannon-body-rotate-3',
    'babybot/cannon-body-rotate-4',
    'babybot/cannon-body-rotate-5',

    'babybot/cannon-button-left',
    'babybot/cannon-button-left-press',
    'babybot/cannon-button-left-rotate-2.5',
    'babybot/cannon-button-left-rotate-5',
    'babybot/cannon-button-left-rotate2.5',
    'babybot/cannon-button-left-rotate5',
    'babybot/cannon-button-right',
    'babybot/cannon-button-right-press',
    'babybot/cannon-button-right-rotate-2.5',
    'babybot/cannon-button-right-rotate-5',
    'babybot/cannon-button-right-rotate2.5',
    'babybot/cannon-button-right-rotate5',

    'babybot/cannon-button-activate',
    'babybot/cannon-button-activate-press',
    'babybot/cannon-button-activate-rotate-2.5',
    'babybot/cannon-button-activate-rotate-5',
    'babybot/cannon-button-activate-rotate2.5',
    'babybot/cannon-button-activate-rotate5',

    'babybot/cannon-baby-inside',
    'babybot/cannon-baby-right-1',
    'babybot/cannon-baby-right-2',
    'babybot/cannon-baby-right-3',
    'babybot/cannon-baby-right-4',
    'babybot/cannon-baby-right-5',
    'babybot/cannon-baby-right-6',
    'babybot/cannon-baby-right-7',
    'babybot/cannon-baby-right-8',
    'babybot/cannon-baby-left-1',
    'babybot/cannon-baby-left-2',
    'babybot/cannon-baby-left-3',
    'babybot/cannon-baby-left-4',
    'babybot/cannon-baby-left-5',
    'babybot/cannon-baby-left-6',
    'babybot/cannon-baby-left-7',
    'babybot/cannon-baby-left-8',
    'babybot/cannon-baby-load-1',
    'babybot/cannon-baby-load-2',
    'babybot/cannon-baby-load-3',
    'babybot/cannon-baby-load-4',
    'babybot/cannon-baby-load-5',
    'babybot/cannon-baby-load-6',
    'babybot/cannon-baby-load-7',
    'babybot/cannon-baby-load-8',
    'babybot/cannon-baby-load-9',
    'babybot/cannon-baby-load-10',
    'babybot/cannon-baby-load-11',
    'babybot/cannon-baby-load-12',
    'babybot/cannon-baby-load-13',
    'babybot/cannon-baby-load-14',
    'babybot/cannon-baby-load-15',
    'babybot/cannon-baby-new-1',
    'babybot/cannon-baby-new-2',
    'babybot/cannon-baby-new-3',
    'babybot/cannon-baby-new-4',
    'babybot/cannon-baby-new-5',
    'babybot/cannon-baby-new-6',
    'babybot/cannon-baby-new-7',
    'babybot/cannon-baby-new-8',
    'babybot/cannon-baby-new-9',
    'babybot/cannon-baby-new-10',
    'babybot/cannon-baby-new-11',
    'babybot/cannon-baby-new-12',
    'babybot/cannon-baby-new-13',
    'babybot/cannon-baby-new-14',
    'babybot/cannon-baby-new-15',
    'babybot/cannon-baby-new-16',
    'babybot/cannon-baby-flying-up-half',
    'babybot/cannon-baby-flying-up-full',

    'babybot/cannon-baby-falling-down',
    'babybot/cannon-baby-falling-down-rotate24',
    'babybot/cannon-baby-falling-down-rotate48',
    'babybot/cannon-baby-falling-down-rotate72',
    'babybot/cannon-baby-falling-down-rotate96',
    'babybot/cannon-baby-falling-down-rotate120',
    'babybot/cannon-baby-falling-down-rotate144',
    'babybot/cannon-baby-falling-down-rotate168',
    'babybot/cannon-baby-falling-down-rotate-168',
    'babybot/cannon-baby-falling-down-rotate-144',
    'babybot/cannon-baby-falling-down-rotate-120',
    'babybot/cannon-baby-falling-down-rotate-96',
    'babybot/cannon-baby-falling-down-rotate-72',
    'babybot/cannon-baby-falling-down-rotate-48',
    'babybot/cannon-baby-falling-down-rotate-24',

    'babybot/bk-star',
    'babybot/planet-1',
    'babybot/planet-2',
    'babybot/planet-1-moon',
    'babybot/planet-2-moon',
    'babybot/planet-3-moon',
    'babybot/planet-4-moon',
    'babybot/bk-constellation-1',
    'babybot/bk-constellation-2',

    'explosions/explosion-1-1',
    'explosions/explosion-1-2',
    'explosions/explosion-1-3',
    'explosions/explosion-1-4',
    'explosions/explosion-1-5',
    'explosions/explosion-1-6',
    'explosions/explosion-1-7',
    'explosions/explosion-1-8',
    'explosions/explosion-1-9',
    'explosions/explosion-1-10',

    'explosions/explosion-2-1',
    'explosions/explosion-2-2',
    'explosions/explosion-2-3',
    'explosions/explosion-2-4',
    'explosions/explosion-2-5',
    'explosions/explosion-2-6',
    'explosions/explosion-2-7',
    'explosions/explosion-2-8',
    'explosions/explosion-2-9',
    'explosions/explosion-2-10',

    'explosions/explosion-3-1',
    'explosions/explosion-3-2',
    'explosions/explosion-3-3',
    'explosions/explosion-3-4',
    'explosions/explosion-3-5',
    'explosions/explosion-3-6',
    'explosions/explosion-3-7',
    'explosions/explosion-3-8',
    'explosions/explosion-3-9',
    'explosions/explosion-3-10',

    'explosions/explosion-4-1',
    'explosions/explosion-4-2',
    'explosions/explosion-4-3',
    'explosions/explosion-4-4',
    'explosions/explosion-4-5',
    'explosions/explosion-4-6',
    'explosions/explosion-4-7',
    'explosions/explosion-4-8',
    'explosions/explosion-4-9',
    'explosions/explosion-4-10',

    'cat/sit-body',
    'cat/sit-head-1',
    'cat/sit-head-2',
    'cat/sit-head-3',
    'cat/sit-head-4',
    'cat/sit-head-5',
    'cat/sit-head-6',
    'cat/sit-head-7',
    'cat/sit-head-8',
    'cat/sit-head-9',
    'cat/sit-tail-1',
    'cat/sit-tail-2',
    'cat/sit-tail-3',
    'cat/sit-tail-4',
    'cat/sit-tail-5',
    'cat/sit-tail-6',
    'cat/stand',
    'cat/walk-1',
    'cat/walk-2',
    'cat/walk-3',
    'cat/walk-4',
    'cat/walk-5',
    'cat/walk-6',
    'cat/walk-7',
    'cat/walk-8',

    'hints/babybot-1',
    'hints/babybot-2',
    'hints/babybot-3',
    'hints/babybot-4',
    'hints/babybot-5',
    'hints/babybot-6',
    'hints/babybot-7',
    'hints/babybot-8',
    'hints/babybot-9',
    'hints/babybot-10',
    'hints/babybot-11',
    'hints/babybot-12',
    'hints/babybot-13'
  ],

  // Images needed for the finale.
  'finale-1': [
    'intro-finale/items-letter-n',
    'intro-finale/items-letter-s',
    'intro-finale/items-letter-h',

    'intro-finale/items-clove',
    'intro-finale/items-control-room',
    'intro-finale/items-earmuffs',
    'intro-finale/items-forget-me-not',
    'intro-finale/items-halo-1',
    'intro-finale/items-halo-2',
    'intro-finale/items-halo-3',
    'intro-finale/items-hole-1',
    'intro-finale/items-hole-2',
    'intro-finale/items-hole-3',
    'intro-finale/items-hole-4',
    'intro-finale/items-narcissus',
    'intro-finale/items-needle-thread',
    'intro-finale/items-needle',
    'intro-finale/items-neutron-1',
    'intro-finale/items-neutron-2',
    'intro-finale/items-neutron-3',
    'intro-finale/items-neutron-4',
    'intro-finale/items-neutron-5',
    'intro-finale/items-neutron-6',
    'intro-finale/items-neutron-7',
    'intro-finale/items-neutron-8',
    'intro-finale/items-neutron-9',
    'intro-finale/items-neutron-10',
    'intro-finale/items-neutron-11',
    'intro-finale/items-neutron-12',
    'intro-finale/items-neutron-dropped',
    'intro-finale/items-noodles',
    'intro-finale/items-nose',
    'intro-finale/items-pinstripe',
    'intro-finale/items-potion',
    'intro-finale/items-scissors',
    'intro-finale/items-shower-1',
    'intro-finale/items-shower-2',
    'intro-finale/items-shower-3',
    'intro-finale/items-shower-4',
    'intro-finale/items-shower-5',
    'intro-finale/items-shower-6',
    'intro-finale/items-shower-7',
    'intro-finale/items-shower-8',
    'intro-finale/items-shower-9',
    'intro-finale/items-shower-10',
    'intro-finale/items-shower-11',
    'intro-finale/items-shower-12',
    'intro-finale/items-shower-13',
    'intro-finale/items-shower-14',
    'intro-finale/items-shower-15',
    'intro-finale/items-shower-16',
    'intro-finale/items-shower-17',
    'intro-finale/items-shower-18',
    'intro-finale/items-shower-19',
    'intro-finale/items-shower-20',
    'intro-finale/items-shower',
    'intro-finale/items-thimble',
    'intro-finale/items-thread-thimble',
    'intro-finale/items-thread',
    'intro-finale/items-trim',

    'intro-finale/items-basket',
    'intro-finale/items-broom',
    'intro-finale/items-castanet',
    'intro-finale/items-crab-1',
    'intro-finale/items-crab-2',
    'intro-finale/items-crab-3',
    'intro-finale/items-crab-4',
    'intro-finale/items-crab-5',
    'intro-finale/items-crab-6',
    'intro-finale/items-crab-7',
    'intro-finale/items-crab-8',
    'intro-finale/items-frying-pan',
    'intro-finale/items-gnocchi',
    'intro-finale/items-hazelnut',
    'intro-finale/items-knife',
    'intro-finale/items-knot',
    'intro-finale/items-lilypads',
    'intro-finale/items-nacre-1',
    'intro-finale/items-nacre-2',
    'intro-finale/items-nacre-3',
    'intro-finale/items-necesere',
    'intro-finale/items-pebbles',
    'intro-finale/items-rivet',
    'intro-finale/items-rolling-pin',
    'intro-finale/items-spinach',

    'intro-finale/dragon-1',
    'intro-finale/dragon-2',
    'intro-finale/dragon-3',
    'intro-finale/dragon-4',
    'intro-finale/dragon-5',
    'intro-finale/dragon-6',
    'intro-finale/dragon-7',
    'intro-finale/dragon-8',
    'intro-finale/dragon-9',
    'intro-finale/dragon-10',
    'intro-finale/dragon-11',
    'intro-finale/dragon-12',
    'intro-finale/dragon-13',
    'intro-finale/dragon-14',
    'intro-finale/dragon-15',
    'intro-finale/dragon-16',
    'intro-finale/dragon-17',

    'trurl/hi-1',
    'trurl/hi-2',
    'trurl/hi-3',
    'trurl/hi-4',
    'trurl/hi-5',
    'trurl/hi-6',
    'trurl/hi-7',
    'trurl/hi-8',
    'trurl/hi-9',
    'trurl/hi-10',
    'trurl/hi-11',
    'trurl/hi-12',
    'trurl/hi-13',
    'trurl/hi-14',

    'klapaucjusz/standing',
    'klapaucjusz/hi-1',
    'klapaucjusz/hi-2',
    'klapaucjusz/hi-3',
    'klapaucjusz/hi-4',
    'klapaucjusz/hi-5',
    'klapaucjusz/hi-6',
    'klapaucjusz/hi-7',
    'klapaucjusz/hi-8',
    'klapaucjusz/hi-9',
    'klapaucjusz/hi-10',
    'klapaucjusz/looking-away-left',
    'klapaucjusz/looking-trurl',
    'klapaucjusz/standing-back',
    'klapaucjusz/standing-left',
    'klapaucjusz/standing',
    'klapaucjusz/surprise',
    'klapaucjusz/run-1',
    'klapaucjusz/run-2',
    'klapaucjusz/run-3',
    'klapaucjusz/run-4',
    'klapaucjusz/run-5',
    'klapaucjusz/run-6',
    'klapaucjusz/run-7',
    'klapaucjusz/run-8',

    'trurl/run-1',
    'trurl/run-2',
    'trurl/run-3',
    'trurl/run-4',
    'trurl/run-5',

    'intro-finale/speech-bubble-1',
    'intro-finale/speech-bubble-2',
    'intro-finale/speech-bubble-3',
    'intro-finale/speech-bubble-4',
    'intro-finale/speech-bubble-5',
    'intro-finale/speech-bubble-6',
    'intro-finale/speech-bubble-7',
    'intro-finale/speech-bubble-8',
    'intro-finale/speech-bubble-9',

    'intro-finale/speech-bubble-rays-1',
    'intro-finale/speech-bubble-rays-2',
    'intro-finale/speech-bubble-rays-3',
    'intro-finale/speech-bubble-rays-4',
    'intro-finale/speech-bubble-rays-5',
    'intro-finale/speech-bubble-rays-6',
    'intro-finale/speech-bubble-rays-no-3',
    'intro-finale/speech-bubble-rays-no-4',
    'intro-finale/speech-bubble-rays-no-5',
    'intro-finale/speech-bubble-rays-no-6',

    'nbot/speech-bubble-1',
    'nbot/speech-bubble-2',
    'nbot/speech-bubble-3',
    'nbot/speech-bubble-4',
    'nbot/speech-bubble-5',
    'nbot/speech-bubble-6',
    'nbot/speech-bubble-7',
    'nbot/speech-bubble-8',
    'nbot/speech-bubble-9',
    'nbot/speech-bubble-10',
    'nbot/speech-bubble-11',

    'intro-finale/button-hole-1',
    'intro-finale/button-hole-2',
    'intro-finale/button-hole-3',
    'intro-finale/button-hole-4',
    'intro-finale/button-hole-5',
    'intro-finale/button-hole-6',
    'intro-finale/button-hole-7',
    'intro-finale/button-appear-1',
    'intro-finale/button-appear-2',
    'intro-finale/button-appear-3',
    'intro-finale/button-appear-4',
    'intro-finale/button-appear-5',
    'intro-finale/button-appear-6',
    'intro-finale/button-appear-7',
    'intro-finale/button-appear-8',
    'intro-finale/button-appear-9',
    'intro-finale/button-appear-10',
    'intro-finale/button-appear-11',
    'intro-finale/button-appear-12',
    'intro-finale/button-appear-13',
    'intro-finale/button-press-1',
    'intro-finale/button-press-2',
    'intro-finale/button-press-3',

    'hints/finale-1',
    'hints/finale-2',
    'hints/finale-3',
    'hints/finale-4',
    'hints/finale-5',
    'hints/finale-6',
    'hints/finale-7',
    'hints/finale-8',
    'hints/finale-9',
    'hints/finale-10',
    'hints/finale-bk',

    'nbot/head-2',
    'nbot/head-3',
    'nbot/head-4',
    'nbot/head-5',
    'nbot/head-6',
    'nbot/head-7',
    'nbot/head-8',
    'nbot/head-9',
    'nbot/head-10',

    'intro-finale/scaffolding-left-1',
    'intro-finale/scaffolding-left-2',
    'intro-finale/scaffolding-right-1',
    'intro-finale/scaffolding-right-2',

    'nbot/underwear-top',
    'nbot/underwear-bottom',

    'nbot/right-arm-action-8',
    'nbot/right-arm-action-9',
    'nbot/right-arm-action-10',
    'nbot/right-arm-action-11'
  ],

  'finale-2': [
    'nbot/body-activate-1',
    'nbot/body-activate-2',
    'nbot/body-activate-3',
    'nbot/body-activate-4',
    'nbot/body-activate-5',
    'nbot/body-activate-6',
    'nbot/body-activate-7',

    'nbot/left-arm-activate-1',
    'nbot/left-arm-activate-2',
    'nbot/left-arm-activate-3',
    'nbot/left-arm-activate-4',
    'nbot/left-arm-activate-5',
    'nbot/left-arm-activate-6',
    'nbot/left-arm-activate-7',

    'nbot/right-arm-activate-1',
    'nbot/right-arm-activate-2',
    'nbot/right-arm-activate-3',
    'nbot/right-arm-activate-4',
    'nbot/right-arm-activate-5',
    'nbot/right-arm-activate-6',
    'nbot/right-arm-activate-7',

    'nbot/body-idle-1',
    'nbot/body-idle-2',
    'nbot/body-idle-3',

    'nbot/left-arm-idle-1',
    'nbot/left-arm-idle-2',
    'nbot/left-arm-idle-3',
    'nbot/left-arm-idle-4',
    'nbot/left-arm-idle-5',
    'nbot/left-arm-idle-6',

    'nbot/right-arm-idle-1',
    'nbot/right-arm-idle-2',
    'nbot/right-arm-idle-3',
    'nbot/right-arm-idle-4',
    'nbot/right-arm-idle-5',
    'nbot/right-arm-idle-6',

    'nbot/body-action-1',
    'nbot/body-action-2',
    'nbot/body-action-3',
    'nbot/body-action-4',
    'nbot/body-action-5',
    'nbot/body-action-6',
    'nbot/body-action-7',
    'nbot/body-action-8',
    'nbot/body-action-9',
    'nbot/body-action-10',
    'nbot/body-action-11',

    'nbot/left-arm-action-1',
    'nbot/left-arm-action-2',
    'nbot/left-arm-action-3',
    'nbot/left-arm-action-4',
    'nbot/left-arm-action-5',
    'nbot/left-arm-action-6',
    'nbot/left-arm-action-7',
    'nbot/left-arm-action-8',
    'nbot/left-arm-action-9',
    'nbot/left-arm-action-10',
    'nbot/left-arm-action-11',

    'nbot/right-arm-action-1',
    'nbot/right-arm-action-2',
    'nbot/right-arm-action-3',
    'nbot/right-arm-action-4',
    'nbot/right-arm-action-5',
    'nbot/right-arm-action-6',
    'nbot/right-arm-action-7'
  ]
};

/**
 * Make necessary changes/additions to above image sets based on locale.
 */
engine.prepareImageSets = function() {
  // Add appropriate tooltip image, depending on locale.
  this.IMAGE_SETS['intro-' + this.country] =
      engine.duplicateArray(this.IMAGE_SETS['intro']);
  this.IMAGE_SETS['intro-' + this.country].push('ui/tooltip-text-' +
                                               this.country);
};

/**
 * A list of all the image ids and their places in individual sprites.
 * This is AUTO-GENERATED by the spriter.
 * @const
 */
engine.IMAGE_SPRITE_INFO = {
  'background/sky-3-1': { width: 840, height: 16, x: 0, y: 0 },
  'background/sky-3-2': { width: 840, height: 13, x: 842, y: 0 },
  'background/sky-3-3': { width: 840, height: 14, x: 0, y: 18 },
  'background/sky-4-1': { width: 840, height: 17, x: 842, y: 18 },
  'background/sky-4-2': { width: 840, height: 17, x: 0, y: 37 },
  'background/sky-4-3': { width: 840, height: 16, x: 842, y: 37 },
  'background/sky-5-1': { width: 840, height: 19, x: 0, y: 56 },
  'background/sky-5-2': { width: 840, height: 22, x: 842, y: 56 },
  'background/sky-5-3': { width: 840, height: 22, x: 0, y: 80 },
  'background/sky-6-1': { width: 840, height: 23, x: 842, y: 80 },
  'background/sky-6-2': { width: 840, height: 22, x: 0, y: 105 },
  'background/sky-6-3': { width: 840, height: 22, x: 842, y: 105 },
  'ui/loading': { top: 4, width: 353, height: 193, x: 0, y: 129 },
  'background/mask-big-left': { width: 7, height: 575, x: 355, y: 129 },
  'background/mask-big-right': { width: 6, height: 575, x: 364, y: 129 },
  'background/mask-small-left': { width: 37, height: 575, x: 372, y: 129 },
  'background/mask-small-right': { width: 36, height: 575, x: 411, y: 129 },
  'ui/loading-progress-bar': { right: 2, width: 66, height: 24, x: 449, y: 129 },
  'bird/body': { width: 11, height: 27, x: 517, y: 129 },
  'bird/wing-l-1': { top: 1, bottom: 1, width: 8, height: 17, x: 530, y: 129 },
  'bird/wing-l-2': { bottom: 2, width: 8, height: 17, x: 540, y: 129 },
  'bird/wing-l-3': { bottom: 2, width: 8, height: 17, x: 550, y: 129 },
  'bird/wing-l-4': { top: 1, bottom: 1, width: 8, height: 17, x: 560, y: 129 },
  'bird/wing-l-5': { top: 2, width: 8, height: 17, x: 570, y: 129 },
  'bird/wing-l-6': { top: 3, width: 8, height: 16, x: 580, y: 129 },
  'bird/wing-r-1': { top: 1, bottom: 1, width: 8, height: 17, x: 590, y: 129 },
  'bird/wing-r-2': { bottom: 2, width: 8, height: 17, x: 600, y: 129 },
  'bird/wing-r-3': { bottom: 2, width: 8, height: 17, x: 610, y: 129 },
  'bird/wing-r-4': { top: 1, bottom: 1, width: 8, height: 17, x: 620, y: 129 },
  'bird/wing-r-5': { top: 2, width: 8, height: 17, x: 630, y: 129 },
  'bird/wing-r-6': { top: 3, width: 8, height: 16, x: 640, y: 129 },
  'bird/antennae-1': { right: 1, width: 14, height: 8, x: 650, y: 129 },
  'bird/antennae-2': { width: 15, height: 8, x: 666, y: 129 },
  'bird/antennae-3': { top: 1, width: 15, height: 7, x: 683, y: 129 },
  'bird/antennae-4': { top: 2, width: 15, height: 6, x: 700, y: 129 },
  'bird/antennae-5': { top: 1, width: 15, height: 7, x: 717, y: 129 },
  'bird/antennae-6': { width: 15, height: 8, x: 734, y: 129 },
  'bird/eyes': { width: 8, height: 4, x: 751, y: 129 },
  'mouse-pointer/normal-black-1': { left: 3, top: 5, bottom: 1, right: 1, width: 28, height: 30, x: 761, y: 129 },
  'mouse-pointer/normal-black-2': { left: 4, top: 5, bottom: 1, right: 2, width: 26, height: 30, x: 791, y: 129 },
  'mouse-pointer/normal-black-3': { left: 4, top: 4, bottom: 1, right: 3, width: 25, height: 31, x: 819, y: 129 },
  'mouse-pointer/normal-white-1': { left: 4, top: 4, bottom: 1, right: 3, width: 25, height: 31, x: 846, y: 129 },
  'mouse-pointer/normal-white-2': { left: 4, top: 5, bottom: 1, right: 2, width: 26, height: 30, x: 873, y: 129 },
  'mouse-pointer/normal-white-3': { left: 4, top: 4, bottom: 1, right: 3, width: 25, height: 31, x: 901, y: 129 },
  'mouse-pointer/hover-1': { left: 2, top: 3, bottom: 3, right: 2, width: 28, height: 37, x: 928, y: 129 },
  'mouse-pointer/hover-2': { left: 3, top: 3, bottom: 4, right: 1, width: 28, height: 36, x: 958, y: 129 },
  'mouse-pointer/hover-3': { left: 2, top: 2, bottom: 4, right: 1, width: 29, height: 37, x: 988, y: 129 },
  'mouse-pointer/click': { top: 6, bottom: 4, width: 32, height: 33, x: 1019, y: 129 },
  'mouse-pointer/wait-1': { left: 4, top: 3, width: 28, height: 34, x: 1053, y: 129 },
  'mouse-pointer/wait-2': { left: 4, top: 3, bottom: 1, width: 28, height: 33, x: 1083, y: 129 },
  'mouse-pointer/wait-3': { left: 4, top: 3, bottom: 1, right: 2, width: 26, height: 33, x: 1113, y: 129 },
  'ui/toolbar-wait-1': { width: 19, height: 20, x: 1141, y: 129 },
  'ui/toolbar-wait-2': { width: 19, height: 20, x: 1162, y: 129 },
  'ui/toolbar-wait-3': { width: 19, height: 20, x: 1183, y: 129 },
  'ui/toolbar-wait-4': { width: 19, height: 20, x: 1204, y: 129 },
  'ui/toolbar-wait-5': { width: 19, height: 20, x: 1225, y: 129 },
  'ui/toolbar-wait-6': { width: 19, height: 20, x: 1246, y: 129 },
  'ui/toolbar-wait-7': { width: 19, height: 20, x: 1267, y: 129 },
  'ui/toolbar-wait-8': { width: 19, height: 20, x: 1288, y: 129 },
  'ui/button-ffwd': { width: 18, height: 16, x: 1309, y: 129 },
  'ui/button-ffwd-press-1': { top: 1, bottom: 1, right: 1, width: 17, height: 14, x: 1329, y: 129 },
  'ui/button-ffwd-press-2': { top: 1, bottom: 1, right: 2, width: 16, height: 14, x: 1348, y: 129 },
  'ui/button-tooltip': { width: 14, height: 25, x: 1366, y: 129 },
  'ui/button-tooltip-press-1': { top: 1, width: 14, height: 24, x: 1382, y: 129 },
  'ui/button-tooltip-press-2': { top: 1, width: 14, height: 24, x: 1398, y: 129 },
  'ui/tooltip-arm': { width: 67, height: 270, x: 1414, y: 129 },
  'ui/tooltip-hand': { width: 40, height: 69, x: 1483, y: 129 },
  'ui/tooltip-hand-push': { width: 40, height: 66, x: 1525, y: 129 },
  'ui/tooltip-flag': { width: 300, height: 480, x: 1567, y: 129 },
  'ui/tooltip-cloud': { width: 360, height: 355, x: 0, y: 706 },
  'logo': { bottom: 5, width: 304, height: 130, x: 362, y: 706 },
  'intro-finale/books': { width: 28, height: 25, x: 668, y: 706 },
  'intro-finale/easel': { width: 56, height: 102, x: 698, y: 706 },
  'intro-finale/charging-station': { width: 25, height: 34, x: 756, y: 706 },
  'intro-finale/stuff-1': { width: 25, height: 15, x: 783, y: 706 },
  'intro-finale/stuff-2': { width: 39, height: 18, x: 810, y: 706 },
  'intro-finale/stuff-3': { width: 10, height: 8, x: 851, y: 706 },
  'intro-finale/stuff-4': { width: 18, height: 12, x: 863, y: 706 },
  'intro-finale/stuff-5': { width: 18, height: 6, x: 883, y: 706 },
  'intro-finale/stuff-6': { width: 40, height: 34, x: 903, y: 706 },
  'intro-finale/stuff-7': { width: 32, height: 19, x: 945, y: 706 },
  'intro-finale/stuff-8': { width: 68, height: 24, x: 979, y: 706 },
  'intro-finale/stuff-9': { width: 17, height: 11, x: 1049, y: 706 },
  'intro-finale/stuff-10': { width: 47, height: 39, x: 1068, y: 706 },
  'intro-finale/stuff-11': { width: 43, height: 37, x: 1117, y: 706 },
  'intro-finale/start-button': { width: 32, height: 28, x: 1162, y: 706 },
  'intro-finale/start-button-press-1': { width: 32, height: 28, x: 1196, y: 706 },
  'intro-finale/start-button-press-2': { width: 32, height: 28, x: 1230, y: 706 },
  'trurl/sitting': { left: 7, top: 22, right: 4, width: 49, height: 91, x: 1264, y: 706 },
  'trurl/sitting-down-1': { width: 48, height: 105, x: 1315, y: 706 },
  'trurl/sitting-down-2': { width: 53, height: 93, x: 1365, y: 706 },
  'trurl/sitting-down-3': { width: 45, height: 93, x: 1420, y: 706 },
  'trurl/sitting-down-4': { width: 45, height: 94, x: 1467, y: 706 },
  'trurl/looking-away-right': { width: 52, height: 104, x: 1514, y: 706 },
  'trurl/looking-away-right-tap-1': { left: 6, right: 10, width: 48, height: 105, x: 1568, y: 706 },
  'trurl/looking-away-right-tap-2': { left: 6, right: 1, width: 57, height: 105, x: 1618, y: 706 },
  'trurl/looking-away-right-tap-3': { left: 6, width: 58, height: 105, x: 1677, y: 706 },
  'trurl/looking-away-right-tap-4': { left: 6, right: 8, width: 50, height: 105, x: 1737, y: 706 },
  'trurl/looking-away-left': { width: 52, height: 104, x: 1789, y: 706 },
  'trurl/looking-away-left-tap-1': { left: 10, right: 6, width: 48, height: 105, x: 1843, y: 706 },
  'trurl/looking-away-left-tap-2': { left: 1, right: 6, width: 57, height: 105, x: 1893, y: 706 },
  'trurl/looking-away-left-tap-3': { right: 6, width: 58, height: 105, x: 0, y: 1063 },
  'trurl/looking-away-left-tap-4': { left: 8, right: 6, width: 50, height: 105, x: 60, y: 1063 },
  'trurl/looking-right': { width: 40, height: 107, x: 112, y: 1063 },
  'trurl/looking-left': { width: 40, height: 107, x: 154, y: 1063 },
  'trurl/looking-up': { width: 51, height: 105, x: 196, y: 1063 },
  'trurl/walk-1': { top: 5, bottom: 3, width: 52, height: 109, x: 249, y: 1063 },
  'trurl/walk-2': { left: 5, top: 12, bottom: 1, right: 9, width: 38, height: 104, x: 303, y: 1063 },
  'trurl/walk-3': { left: 7, top: 5, right: 8, width: 37, height: 112, x: 343, y: 1063 },
  'trurl/walk-4': { left: 6, right: 5, width: 41, height: 117, x: 382, y: 1063 },
  'trurl/walk-5': { top: 5, bottom: 2, width: 52, height: 110, x: 425, y: 1063 },
  'trurl/walk-6': { left: 5, top: 12, bottom: 1, right: 8, width: 39, height: 104, x: 479, y: 1063 },
  'trurl/walk-7': { left: 7, top: 5, right: 7, width: 38, height: 112, x: 520, y: 1063 },
  'trurl/walk-8': { left: 6, right: 3, width: 43, height: 117, x: 560, y: 1063 },
  'background/mountain-1': { width: 548, height: 130, x: 605, y: 1063 },
  'background/mountain-2': { width: 773, height: 81, x: 1155, y: 1063 },
  'trurl-thought-cloud/disassemble-1': { top: 66, bottom: 14, right: 11, width: 227, height: 207, x: 0, y: 0 },
  'trurl-thought-cloud/disassemble-2': { top: 59, bottom: 14, right: 11, width: 227, height: 214, x: 229, y: 0 },
  'trurl-thought-cloud/disassemble-3': { top: 46, bottom: 14, right: 11, width: 227, height: 227, x: 458, y: 0 },
  'trurl-thought-cloud/disassemble-4': { top: 35, bottom: 14, right: 11, width: 227, height: 238, x: 687, y: 0 },
  'trurl-thought-cloud/disassemble-5': { top: 27, bottom: 14, right: 11, width: 227, height: 246, x: 916, y: 0 },
  'trurl-thought-cloud/disassemble-6': { left: 8, top: 20, bottom: 24, right: 27, width: 203, height: 243, x: 1145, y: 0 },
  'trurl-thought-cloud/disassemble-7': { left: 42, top: 15, bottom: 35, right: 28, width: 168, height: 237, x: 1350, y: 0 },
  'trurl-thought-cloud/disassemble-8': { left: 40, top: 12, bottom: 70, right: 22, width: 176, height: 205, x: 1520, y: 0 },
  'trurl-thought-cloud/disassemble-9': { left: 38, top: 9, bottom: 69, right: 18, width: 182, height: 209, x: 1698, y: 0 },
  'trurl-thought-cloud/disassemble-10': { left: 37, top: 8, bottom: 68, right: 16, width: 185, height: 211, x: 0, y: 248 },
  'bird/parts-connectors': { left: 13, top: 9, bottom: 15, right: 16, width: 36, height: 17, x: 187, y: 248 },
  'bird/parts-eyes': { left: 17, top: 9, bottom: 14, right: 22, width: 26, height: 18, x: 225, y: 248 },
  'bird/parts-connectors-eyes': { left: 9, top: 8, bottom: 10, right: 16, width: 40, height: 23, x: 253, y: 248 },
  'bird/parts-head': { left: 14, top: 9, bottom: 3, right: 22, width: 29, height: 29, x: 295, y: 248 },
  'bird/parts-complete': { bottom: 2, right: 1, width: 64, height: 39, x: 326, y: 248 },
  'nbot/head-1': { right: 2, width: 38, height: 62, x: 392, y: 248 },
  'trurl/waiting-user': { width: 57, height: 111, x: 432, y: 248 },
  'trurl/no-1': { left: 6, top: 2, right: 13, width: 48, height: 108, x: 491, y: 248 },
  'trurl/no-2': { left: 5, right: 9, width: 53, height: 110, x: 541, y: 248 },
  'trurl/no-3': { top: 2, width: 67, height: 108, x: 596, y: 248 },
  'trurl/no-4': { left: 1, top: 2, right: 6, width: 60, height: 108, x: 665, y: 248 },
  'trurl/no-5': { top: 2, right: 8, width: 59, height: 108, x: 727, y: 248 },
  'trurl/no-6': { top: 2, right: 8, width: 59, height: 108, x: 788, y: 248 },
  'trurl/no-7': { top: 1, right: 8, width: 59, height: 109, x: 849, y: 248 },
  'trurl/no-8': { top: 2, right: 8, width: 59, height: 108, x: 910, y: 248 },
  'trurl/no-9': { top: 2, right: 8, width: 59, height: 108, x: 971, y: 248 },
  'trurl/no-10': { top: 2, right: 7, width: 60, height: 108, x: 1032, y: 248 },
  'trurl/no-11': { top: 1, right: 7, width: 60, height: 109, x: 1094, y: 248 },
  'trurl/no-12': { top: 2, right: 7, width: 60, height: 108, x: 1156, y: 248 },
  'trurl/no-13': { top: 2, right: 7, width: 60, height: 108, x: 1218, y: 248 },
  'trurl/happy-1': { width: 53, height: 108, x: 1280, y: 248 },
  'trurl/happy-2': { top: 2, width: 53, height: 106, x: 1335, y: 248 },
  'trurl/happy-3': { top: 2, width: 53, height: 106, x: 1390, y: 248 },
  'trurl-thought-cloud/opening-1': { left: 46, top: 380, right: 271, width: 13, height: 13, x: 1445, y: 248 },
  'trurl-thought-cloud/opening-2': { left: 46, top: 345, bottom: 2, right: 239, width: 45, height: 46, x: 1460, y: 248 },
  'trurl-thought-cloud/opening-3': { left: 48, top: 334, bottom: 4, right: 229, width: 53, height: 55, x: 1507, y: 248 },
  'trurl-thought-cloud/opening-4': { left: 48, top: 208, bottom: 9, right: 123, width: 159, height: 176, x: 1562, y: 248 },
  'trurl-thought-cloud/opening-5': { left: 44, top: 149, bottom: 11, right: 95, width: 191, height: 233, x: 1723, y: 248 },
  'trurl-thought-cloud/opening-6': { left: 38, top: 72, bottom: 7, right: 45, width: 247, height: 314, x: 0, y: 483 },
  'trurl-thought-cloud/opening-7': { top: 4, bottom: 12, right: 7, width: 323, height: 377, x: 249, y: 483 },
  'trurl-thought-cloud/opening-8': { left: 3, bottom: 8, right: 3, width: 324, height: 385, x: 574, y: 483 },
  'trurl-thought-cloud/opening-9': { left: 7, top: 2, bottom: 7, width: 323, height: 384, x: 900, y: 483 },
  'trurl-thought-cloud/connectors-hollow': { width: 111, height: 61, x: 1225, y: 483 },
  'trurl-thought-cloud/connectors': { width: 112, height: 61, x: 1338, y: 483 },
  'trurl-thought-cloud/head-hollow': { width: 66, height: 47, x: 1452, y: 483 },
  'trurl-thought-cloud/head': { width: 65, height: 49, x: 1520, y: 483 },
  'trurl-thought-cloud/eyes-hollow': { width: 54, height: 72, x: 1587, y: 483 },
  'trurl-thought-cloud/eyes': { width: 55, height: 73, x: 1643, y: 483 },
  'numbot/explosion-1': { left: 177, top: 103, bottom: 159, right: 210, width: 319, height: 372, x: 0, y: 0 },
  'numbot/explosion-2': { left: 166, top: 97, bottom: 154, right: 201, width: 339, height: 383, x: 321, y: 0 },
  'numbot/explosion-3': { left: 148, top: 93, bottom: 101, right: 184, width: 374, height: 440, x: 662, y: 0 },
  'numbot/explosion-4': { left: 147, top: 82, bottom: 70, right: 166, width: 393, height: 482, x: 1038, y: 0 },
  'numbot/explosion-5': { left: 157, top: 86, bottom: 49, right: 163, width: 386, height: 499, x: 1433, y: 0 },
  'numbot/explosion-6': { left: 153, top: 57, bottom: 54, right: 154, width: 399, height: 523, x: 0, y: 501 },
  'numbot/explosion-7': { left: 160, top: 85, bottom: 42, right: 158, width: 388, height: 507, x: 401, y: 501 },
  'numbot/explosion-8': { left: 160, top: 86, bottom: 25, right: 156, width: 390, height: 523, x: 791, y: 501 },
  'numbot/explosion-9': { left: 179, top: 104, bottom: 32, right: 158, width: 369, height: 498, x: 1183, y: 501 },
  'numbot/explosion-10': { left: 228, top: 221, bottom: 37, right: 160, width: 318, height: 376, x: 1554, y: 501 },
  'numbot/explosion-11': { left: 299, top: 250, bottom: 25, right: 168, width: 239, height: 359, x: 0, y: 1026 },
  'numbot/explosion-12': { left: 368, top: 314, bottom: 22, right: 149, width: 189, height: 298, x: 241, y: 1026 },
  'numbot/explosion-13': { left: 429, top: 337, bottom: 59, right: 164, width: 113, height: 238, x: 432, y: 1026 },
  'numbot/explosion-14': { left: 476, top: 394, bottom: 218, right: 213, width: 17, height: 22, x: 547, y: 1026 },
  'numbot/explosion-15': { left: 519, top: 448, bottom: 168, right: 162, width: 25, height: 18, x: 566, y: 1026 },
  'numbot/inside-brick': { width: 150, height: 96, x: 593, y: 1026 },
  'numbot/inside-chassis-1': { width: 60, height: 67, x: 745, y: 1026 },
  'numbot/inside-chassis-2': { width: 107, height: 54, x: 807, y: 1026 },
  'numbot/button-top': { width: 28, height: 19, x: 916, y: 1026 },
  'numbot/button-left-top': { width: 21, height: 29, x: 946, y: 1026 },
  'numbot/button-right-top': { width: 25, height: 27, x: 969, y: 1026 },
  'numbot/button-left-bottom': { width: 22, height: 28, x: 996, y: 1026 },
  'numbot/button-right-bottom': { width: 27, height: 30, x: 1020, y: 1026 },
  'numbot/button-bottom': { width: 30, height: 23, x: 1049, y: 1026 },
  'numbot/button-activate': { width: 44, height: 42, x: 1081, y: 1026 },
  'numbot/button-top-press': { width: 28, height: 19, x: 1127, y: 1026 },
  'numbot/button-left-top-press': { width: 21, height: 29, x: 1157, y: 1026 },
  'numbot/button-right-top-press': { width: 25, height: 27, x: 1180, y: 1026 },
  'numbot/button-left-bottom-press': { width: 22, height: 28, x: 1207, y: 1026 },
  'numbot/button-right-bottom-press': { width: 27, height: 30, x: 1231, y: 1026 },
  'numbot/button-bottom-press': { width: 30, height: 23, x: 1260, y: 1026 },
  'numbot/button-activate-press-1': { width: 44, height: 42, x: 1292, y: 1026 },
  'numbot/button-activate-press-2': { width: 44, height: 42, x: 1338, y: 1026 },
  'numbot/button-alt-left-top': { width: 25, height: 27, x: 1384, y: 1026 },
  'numbot/button-alt-left-bottom': { width: 26, height: 29, x: 1411, y: 1026 },
  'numbot/button-alt-left-top-press': { width: 25, height: 27, x: 1439, y: 1026 },
  'numbot/button-alt-left-bottom-press': { width: 26, height: 29, x: 1466, y: 1026 },
  'hints/bubble-1': { left: 74, top: 145, right: 24, width: 34, height: 56, x: 0, y: 0 },
  'hints/bubble-2': { left: 76, top: 121, bottom: 1, right: 18, width: 38, height: 79, x: 36, y: 0 },
  'hints/bubble-3': { left: 55, top: 95, bottom: 5, right: 20, width: 57, height: 101, x: 76, y: 0 },
  'hints/bubble-4': { left: 30, top: 55, bottom: 4, right: 15, width: 87, height: 142, x: 135, y: 0 },
  'hints/bubble-5': { left: 20, top: 28, bottom: 7, right: 9, width: 103, height: 166, x: 224, y: 0 },
  'hints/bubble-6': { top: 1, bottom: 8, width: 132, height: 192, x: 329, y: 0 },
  'hints/bubble-7': { top: 1, bottom: 10, right: 1, width: 131, height: 190, x: 463, y: 0 },
  'hints/bubble-8': { bottom: 10, right: 1, width: 131, height: 191, x: 596, y: 0 },
  'hints/numbot-button-1': { width: 42, height: 39, x: 729, y: 0 },
  'hints/numbot-button-2': { width: 42, height: 39, x: 773, y: 0 },
  'hints/numbot-button-3': { width: 42, height: 39, x: 817, y: 0 },
  'hints/numbot-formula-1-1': { width: 76, height: 21, x: 861, y: 0 },
  'hints/numbot-formula-1-2': { width: 76, height: 21, x: 939, y: 0 },
  'hints/numbot-formula-1-3': { width: 76, height: 21, x: 1017, y: 0 },
  'hints/numbot-formula-2-1': { width: 76, height: 20, x: 1095, y: 0 },
  'hints/numbot-formula-2-2': { width: 76, height: 20, x: 1173, y: 0 },
  'hints/numbot-formula-2-3': { width: 76, height: 20, x: 1251, y: 0 },
  'hints/numbot-formula-3-1': { width: 76, height: 19, x: 1329, y: 0 },
  'hints/numbot-formula-3-2': { width: 76, height: 19, x: 1407, y: 0 },
  'hints/numbot-formula-3-3': { width: 76, height: 19, x: 1485, y: 0 },
  'hints/numbot-mouse-pointer-1': { width: 50, height: 31, x: 1563, y: 0 },
  'hints/numbot-mouse-pointer-2': { width: 50, height: 31, x: 1615, y: 0 },
  'hints/numbot-mouse-pointer-3': { right: 1, width: 49, height: 31, x: 1667, y: 0 },
  'numbot/head-1': { left: 19, top: 16, right: 22, width: 68, height: 58, x: 1718, y: 0 },
  'numbot/head-2': { left: 20, top: 16, right: 24, width: 65, height: 58, x: 1788, y: 0 },
  'numbot/head-3': { left: 21, top: 18, bottom: 1, right: 23, width: 65, height: 55, x: 1855, y: 0 },
  'numbot/head-4': { left: 21, top: 18, bottom: 1, right: 24, width: 64, height: 55, x: 1922, y: 0 },
  'numbot/head-5': { left: 22, top: 19, bottom: 2, right: 27, width: 60, height: 53, x: 0, y: 194 },
  'numbot/head-6': { left: 23, top: 20, bottom: 2, right: 27, width: 59, height: 52, x: 62, y: 194 },
  'numbot/head-7': { left: 23, top: 21, bottom: 2, right: 26, width: 60, height: 51, x: 123, y: 194 },
  'numbot/head-8': { left: 25, top: 21, bottom: 3, right: 24, width: 60, height: 50, x: 185, y: 194 },
  'numbot/head-9': { left: 26, top: 20, bottom: 2, right: 24, width: 59, height: 52, x: 247, y: 194 },
  'numbot/head-happy': { left: 21, top: 17, right: 22, width: 66, height: 57, x: 308, y: 194 },
  'numbot/steam-2-1': { left: 4, top: 3, bottom: 1, right: 5, width: 106, height: 31, x: 376, y: 194 },
  'numbot/steam-2-2': { left: 1, top: 1, right: 1, width: 113, height: 34, x: 484, y: 194 },
  'numbot/steam-2-3': { width: 115, height: 35, x: 599, y: 194 },
  'numbot/steam-3-1': { left: 4, top: 4, bottom: 1, right: 4, width: 109, height: 58, x: 716, y: 194 },
  'numbot/steam-3-2': { left: 2, top: 2, right: 2, width: 113, height: 61, x: 827, y: 194 },
  'numbot/steam-3-3': { width: 117, height: 63, x: 942, y: 194 },
  'numbot/body': { left: 29, top: 125, right: 1, width: 231, height: 304, x: 1061, y: 194 },
  'numbot/body-cover-1': { left: 54, top: 181, bottom: 190, right: 60, width: 147, height: 58, x: 1294, y: 194 },
  'numbot/body-cover-2': { left: 50, top: 181, bottom: 162, right: 57, width: 154, height: 86, x: 1443, y: 194 },
  'numbot/body-cover-3': { left: 46, top: 181, bottom: 136, right: 54, width: 161, height: 112, x: 1599, y: 194 },
  'numbot/body-cover-4': { left: 41, top: 181, bottom: 114, right: 52, width: 168, height: 134, x: 1762, y: 194 },
  'numbot/body-cover-5': { left: 38, top: 181, bottom: 95, right: 50, width: 173, height: 153, x: 0, y: 500 },
  'numbot/body-cover-6': { left: 35, top: 181, bottom: 81, right: 47, width: 179, height: 167, x: 175, y: 500 },
  'numbot/body-cover-7': { left: 34, top: 181, bottom: 70, right: 47, width: 180, height: 178, x: 356, y: 500 },
  'numbot/body-cover-8': { left: 32, top: 181, bottom: 63, right: 45, width: 184, height: 185, x: 538, y: 500 },
  'numbot/body-cover-9': { left: 32, top: 181, bottom: 60, right: 48, width: 181, height: 188, x: 724, y: 500 },
  'numbot/body-cover-10': { left: 31, top: 181, bottom: 59, right: 48, width: 182, height: 189, x: 907, y: 500 },
  'numbot/l-upper-arm': { width: 95, height: 173, x: 1091, y: 500 },
  'numbot/l-upper-arm-rotate-0.8': { width: 95, height: 173, x: 1188, y: 500 },
  'numbot/l-upper-arm-rotate-0.4': { width: 95, height: 173, x: 1285, y: 500 },
  'numbot/l-upper-arm-rotate0.4': { width: 95, height: 173, x: 1382, y: 500 },
  'numbot/l-upper-arm-rotate0.8': { width: 96, height: 172, x: 1479, y: 500 },
  'numbot/l-lower-arm': { width: 56, height: 146, x: 1577, y: 500 },
  'numbot/l-lower-arm-rotate-1.2': { width: 53, height: 146, x: 1635, y: 500 },
  'numbot/l-lower-arm-rotate-0.6': { width: 54, height: 146, x: 1690, y: 500 },
  'numbot/l-lower-arm-rotate0.6': { width: 57, height: 146, x: 1746, y: 500 },
  'numbot/l-lower-arm-rotate1.2': { width: 58, height: 146, x: 1805, y: 500 },
  'numbot/l-leg': { width: 100, height: 231, x: 1865, y: 500 },
  'numbot/r-upper-arm': { width: 87, height: 173, x: 0, y: 733 },
  'numbot/r-upper-arm-rotate-0.8': { width: 87, height: 173, x: 89, y: 733 },
  'numbot/r-upper-arm-rotate-0.4': { width: 87, height: 173, x: 178, y: 733 },
  'numbot/r-upper-arm-rotate0.4': { width: 86, height: 173, x: 267, y: 733 },
  'numbot/r-upper-arm-rotate0.8': { width: 86, height: 173, x: 355, y: 733 },
  'numbot/r-lower-arm': { width: 58, height: 169, x: 443, y: 733 },
  'numbot/r-lower-arm-rotate-1.2': { width: 61, height: 168, x: 503, y: 733 },
  'numbot/r-lower-arm-rotate-0.6': { width: 60, height: 168, x: 566, y: 733 },
  'numbot/r-lower-arm-rotate0.6': { width: 57, height: 169, x: 628, y: 733 },
  'numbot/r-lower-arm-rotate1.2': { width: 56, height: 169, x: 687, y: 733 },
  'numbot/l-hand': { right: 1, width: 95, height: 137, x: 745, y: 733 },
  'numbot/l-hand-rotate-4': { width: 97, height: 139, x: 842, y: 733 },
  'numbot/l-hand-rotate-2': { width: 95, height: 138, x: 941, y: 733 },
  'numbot/l-hand-rotate2': { width: 93, height: 136, x: 1038, y: 733 },
  'numbot/l-hand-rotate4': { width: 91, height: 136, x: 1133, y: 733 },
  'numbot/r-hand': { width: 100, height: 143, x: 1226, y: 733 },
  'numbot/r-hand-rotate-4': { width: 101, height: 142, x: 1328, y: 733 },
  'numbot/r-hand-rotate-2': { width: 100, height: 142, x: 1431, y: 733 },
  'numbot/r-hand-rotate2': { width: 100, height: 143, x: 1533, y: 733 },
  'numbot/r-hand-rotate4': { width: 99, height: 143, x: 1635, y: 733 },
  'numbot/r-leg': { width: 121, height: 248, x: 1736, y: 733 },
  'numbot/digit-window-1': { width: 80, height: 112, x: 1859, y: 733 },
  'numbot/digit-window-2': { width: 79, height: 112, x: 0, y: 983 },
  'numbot/digit-window-3': { width: 85, height: 110, x: 81, y: 983 },
  'numbot/formula-1-1': { left: 24, top: 40, bottom: 16, right: 75, width: 8, height: 4, x: 168, y: 983 },
  'numbot/formula-1-2': { left: 24, top: 32, bottom: 16, right: 71, width: 12, height: 12, x: 178, y: 983 },
  'numbot/formula-1-3': { left: 25, top: 26, bottom: 22, right: 71, width: 11, height: 12, x: 192, y: 983 },
  'numbot/formula-1-4': { left: 25, top: 27, bottom: 21, right: 71, width: 11, height: 12, x: 205, y: 983 },
  'numbot/formula-1-5': { left: 25, top: 28, bottom: 19, right: 60, width: 22, height: 13, x: 218, y: 983 },
  'numbot/formula-1-6': { left: 25, top: 29, bottom: 18, right: 55, width: 27, height: 13, x: 242, y: 983 },
  'numbot/formula-1-7': { left: 25, top: 28, bottom: 18, right: 55, width: 27, height: 14, x: 271, y: 983 },
  'numbot/formula-1-8': { left: 25, top: 24, bottom: 18, right: 54, width: 28, height: 18, x: 300, y: 983 },
  'numbot/formula-1-9': { left: 25, top: 25, bottom: 18, right: 55, width: 27, height: 17, x: 330, y: 983 },
  'numbot/formula-1-10': { left: 25, top: 26, bottom: 18, right: 41, width: 41, height: 16, x: 359, y: 983 },
  'numbot/formula-1-11': { left: 25, top: 27, bottom: 18, right: 40, width: 42, height: 15, x: 402, y: 983 },
  'numbot/formula-1-12': { left: 25, top: 23, bottom: 18, right: 37, width: 45, height: 19, x: 446, y: 983 },
  'numbot/formula-1-13': { left: 25, top: 20, bottom: 18, right: 37, width: 45, height: 22, x: 493, y: 983 },
  'numbot/formula-1-14': { left: 25, top: 22, bottom: 18, right: 37, width: 45, height: 20, x: 540, y: 983 },
  'numbot/formula-1-15': { left: 25, top: 22, bottom: 18, right: 37, width: 45, height: 20, x: 587, y: 983 },
  'numbot/formula-1-16': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 634, y: 983 },
  'numbot/formula-1-17': { left: 25, top: 24, bottom: 18, right: 21, width: 61, height: 18, x: 697, y: 983 },
  'numbot/formula-1-18': { left: 25, top: 19, bottom: 18, right: 21, width: 61, height: 23, x: 760, y: 983 },
  'numbot/formula-1-19': { left: 25, top: 18, bottom: 18, right: 21, width: 61, height: 24, x: 823, y: 983 },
  'numbot/formula-1-20': { left: 25, top: 20, bottom: 18, right: 21, width: 61, height: 22, x: 886, y: 983 },
  'numbot/formula-1-21': { left: 25, top: 21, bottom: 18, right: 21, width: 61, height: 21, x: 949, y: 983 },
  'numbot/formula-1-22': { left: 25, top: 22, bottom: 18, right: 21, width: 61, height: 20, x: 1012, y: 983 },
  'numbot/formula-1-23': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 1075, y: 983 },
  'numbot/formula-1-24': { left: 25, top: 24, bottom: 18, right: 21, width: 61, height: 18, x: 1138, y: 983 },
  'numbot/formula-2-1': { left: 25, top: 24, bottom: 18, right: 20, width: 62, height: 18, x: 1201, y: 983 },
  'numbot/formula-2-2': { left: 25, top: 24, bottom: 19, right: 20, width: 62, height: 17, x: 1265, y: 983 },
  'numbot/formula-2-3': { left: 25, top: 24, bottom: 20, right: 20, width: 62, height: 16, x: 1329, y: 983 },
  'numbot/formula-2-4': { left: 25, top: 24, bottom: 22, right: 20, width: 62, height: 14, x: 1393, y: 983 },
  'numbot/formula-2-5': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1457, y: 983 },
  'numbot/formula-2-6': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1521, y: 983 },
  'numbot/formula-2-7': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1585, y: 983 },
  'numbot/formula-2-8': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1649, y: 983 },
  'numbot/formula-2-9': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1695, y: 983 },
  'numbot/formula-2-10': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 1741, y: 983 },
  'numbot/formula-2-11': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 1787, y: 983 },
  'numbot/formula-2-12': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 1833, y: 983 },
  'numbot/formula-2-13': { left: 43, top: 23, bottom: 24, right: 20, width: 44, height: 13, x: 1879, y: 983 },
  'numbot/formula-2-14': { left: 43, top: 22, bottom: 24, right: 20, width: 44, height: 14, x: 1925, y: 983 },
  'numbot/formula-2-15': { left: 47, top: 23, bottom: 24, right: 20, width: 40, height: 13, x: 0, y: 1097 },
  'numbot/formula-2-16': { left: 59, top: 24, bottom: 24, right: 20, width: 28, height: 12, x: 42, y: 1097 },
  'numbot/formula-2-17': { left: 59, top: 24, bottom: 25, right: 20, width: 28, height: 11, x: 72, y: 1097 },
  'numbot/formula-2-18': { left: 59, top: 23, bottom: 25, right: 20, width: 28, height: 12, x: 102, y: 1097 },
  'numbot/formula-2-19': { left: 59, top: 22, bottom: 27, right: 20, width: 28, height: 11, x: 132, y: 1097 },
  'numbot/formula-2-20': { left: 59, top: 20, bottom: 28, right: 20, width: 28, height: 12, x: 162, y: 1097 },
  'numbot/formula-2-21': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 192, y: 1097 },
  'numbot/formula-2-22': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 222, y: 1097 },
  'numbot/formula-2-23': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 252, y: 1097 },
  'numbot/formula-2-24': { left: 77, top: 24, bottom: 30, right: 20, width: 10, height: 6, x: 282, y: 1097 },
  'numbot/formula-2-25': { left: 77, top: 24, bottom: 30, right: 20, width: 10, height: 6, x: 294, y: 1097 },
  'numbot/formula-2-26': { left: 77, top: 23, bottom: 31, right: 20, width: 10, height: 6, x: 306, y: 1097 },
  'numbot/formula-2-27': { left: 77, top: 22, bottom: 32, right: 20, width: 10, height: 6, x: 318, y: 1097 },
  'numbot/formula-2-28': { left: 77, top: 20, bottom: 34, right: 20, width: 10, height: 6, x: 330, y: 1097 },
  'numbot/formula-2-29': { left: 77, top: 18, bottom: 36, right: 21, width: 9, height: 6, x: 342, y: 1097 },
  'numbot/formula-2-30': { left: 77, top: 18, bottom: 39, right: 21, width: 9, height: 3, x: 353, y: 1097 },
  'numbot/formula-2-31': { bottom: 60, right: 107, width: 0, height: 0, x: 364, y: 1097 },
  'numbot/formula-2-32': { left: 26, top: 40, bottom: 17, right: 76, width: 5, height: 3, x: 366, y: 1097 },
  'numbot/formula-2-33': { left: 25, top: 32, bottom: 16, right: 72, width: 10, height: 12, x: 373, y: 1097 },
  'numbot/formula-2-34': { left: 25, top: 26, bottom: 22, right: 71, width: 11, height: 12, x: 385, y: 1097 },
  'numbot/formula-2-35': { left: 25, top: 27, bottom: 21, right: 71, width: 11, height: 12, x: 398, y: 1097 },
  'numbot/formula-2-36': { left: 25, top: 28, bottom: 19, right: 60, width: 22, height: 13, x: 411, y: 1097 },
  'numbot/formula-2-37': { left: 25, top: 29, bottom: 19, right: 55, width: 27, height: 12, x: 435, y: 1097 },
  'numbot/formula-2-38': { left: 25, top: 28, bottom: 18, right: 55, width: 27, height: 14, x: 464, y: 1097 },
  'numbot/formula-2-39': { left: 25, top: 24, bottom: 18, right: 54, width: 28, height: 18, x: 493, y: 1097 },
  'numbot/formula-2-40': { left: 25, top: 25, bottom: 18, right: 55, width: 27, height: 17, x: 523, y: 1097 },
  'numbot/formula-2-41': { left: 25, top: 26, bottom: 18, right: 41, width: 41, height: 16, x: 552, y: 1097 },
  'numbot/formula-2-42': { left: 25, top: 27, bottom: 18, right: 40, width: 42, height: 15, x: 595, y: 1097 },
  'numbot/formula-2-43': { left: 25, top: 23, bottom: 18, right: 37, width: 45, height: 19, x: 639, y: 1097 },
  'numbot/formula-2-44': { left: 25, top: 20, bottom: 18, right: 37, width: 45, height: 22, x: 686, y: 1097 },
  'numbot/formula-2-45': { left: 25, top: 22, bottom: 18, right: 37, width: 45, height: 20, x: 733, y: 1097 },
  'numbot/formula-2-46': { left: 25, top: 22, bottom: 18, right: 37, width: 45, height: 20, x: 780, y: 1097 },
  'numbot/formula-2-47': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 827, y: 1097 },
  'numbot/formula-2-48': { left: 25, top: 24, bottom: 18, right: 21, width: 61, height: 18, x: 890, y: 1097 },
  'numbot/formula-2-49': { left: 25, top: 19, bottom: 18, right: 21, width: 61, height: 23, x: 953, y: 1097 },
  'numbot/formula-2-50': { left: 25, top: 18, bottom: 18, right: 21, width: 61, height: 24, x: 1016, y: 1097 },
  'numbot/formula-2-51': { left: 25, top: 20, bottom: 18, right: 21, width: 61, height: 22, x: 1079, y: 1097 },
  'numbot/formula-2-52': { left: 25, top: 21, bottom: 18, right: 21, width: 61, height: 21, x: 1142, y: 1097 },
  'numbot/formula-2-53': { left: 25, top: 22, bottom: 18, right: 21, width: 61, height: 20, x: 1205, y: 1097 },
  'numbot/formula-2-54': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 1268, y: 1097 },
  'numbot/formula-2-55': { left: 25, top: 24, bottom: 18, right: 21, width: 61, height: 18, x: 1331, y: 1097 },
  'numbot/formula-3-1': { left: 25, top: 24, bottom: 18, right: 20, width: 62, height: 18, x: 1394, y: 1097 },
  'numbot/formula-3-2': { left: 25, top: 24, bottom: 19, right: 20, width: 62, height: 17, x: 1458, y: 1097 },
  'numbot/formula-3-3': { left: 25, top: 24, bottom: 20, right: 20, width: 62, height: 16, x: 1522, y: 1097 },
  'numbot/formula-3-4': { left: 25, top: 24, bottom: 22, right: 20, width: 62, height: 14, x: 1586, y: 1097 },
  'numbot/formula-3-5': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1650, y: 1097 },
  'numbot/formula-3-6': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1714, y: 1097 },
  'numbot/formula-3-7': { left: 26, top: 24, bottom: 23, right: 20, width: 61, height: 13, x: 1778, y: 1097 },
  'numbot/formula-3-8': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1841, y: 1097 },
  'numbot/formula-3-9': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1887, y: 1097 },
  'numbot/formula-3-10': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 1933, y: 1097 },
  'numbot/formula-3-11': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 0, y: 1123 },
  'numbot/formula-3-12': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 46, y: 1123 },
  'numbot/formula-3-13': { left: 43, top: 23, bottom: 24, right: 20, width: 44, height: 13, x: 92, y: 1123 },
  'numbot/formula-3-14': { left: 43, top: 22, bottom: 24, right: 20, width: 44, height: 14, x: 138, y: 1123 },
  'numbot/formula-3-15': { left: 47, top: 23, bottom: 24, right: 20, width: 40, height: 13, x: 184, y: 1123 },
  'numbot/formula-3-16': { left: 59, top: 24, bottom: 24, right: 20, width: 28, height: 12, x: 226, y: 1123 },
  'numbot/formula-3-17': { left: 59, top: 24, bottom: 25, right: 20, width: 28, height: 11, x: 256, y: 1123 },
  'numbot/formula-3-18': { left: 59, top: 23, bottom: 25, right: 20, width: 28, height: 12, x: 286, y: 1123 },
  'numbot/formula-3-19': { left: 59, top: 22, bottom: 27, right: 20, width: 28, height: 11, x: 316, y: 1123 },
  'numbot/formula-3-20': { left: 59, top: 20, bottom: 28, right: 20, width: 28, height: 12, x: 346, y: 1123 },
  'numbot/formula-3-21': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 376, y: 1123 },
  'numbot/formula-3-22': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 406, y: 1123 },
  'numbot/formula-3-23': { left: 59, top: 20, bottom: 30, right: 20, width: 28, height: 10, x: 436, y: 1123 },
  'numbot/formula-3-24': { left: 77, top: 24, bottom: 30, right: 20, width: 10, height: 6, x: 466, y: 1123 },
  'numbot/formula-3-25': { left: 77, top: 24, bottom: 30, right: 20, width: 10, height: 6, x: 478, y: 1123 },
  'numbot/formula-3-26': { left: 77, top: 23, bottom: 31, right: 20, width: 10, height: 6, x: 490, y: 1123 },
  'numbot/formula-3-27': { left: 77, top: 22, bottom: 32, right: 20, width: 10, height: 6, x: 502, y: 1123 },
  'numbot/formula-3-28': { left: 77, top: 20, bottom: 34, right: 20, width: 10, height: 6, x: 514, y: 1123 },
  'numbot/formula-3-29': { left: 77, top: 18, bottom: 36, right: 21, width: 9, height: 6, x: 526, y: 1123 },
  'numbot/formula-3-30': { left: 77, top: 18, bottom: 39, right: 21, width: 9, height: 3, x: 537, y: 1123 },
  'numbot/formula-3-31': { bottom: 60, right: 107, width: 0, height: 0, x: 548, y: 1123 },
  'numbot/formula-3-32': { left: 26, top: 40, bottom: 17, right: 76, width: 5, height: 3, x: 550, y: 1123 },
  'numbot/formula-3-33': { left: 25, top: 32, bottom: 16, right: 72, width: 10, height: 12, x: 557, y: 1123 },
  'numbot/formula-3-34': { left: 25, top: 26, bottom: 22, right: 71, width: 11, height: 12, x: 569, y: 1123 },
  'numbot/formula-3-35': { left: 25, top: 27, bottom: 21, right: 71, width: 11, height: 12, x: 582, y: 1123 },
  'numbot/formula-3-36': { left: 25, top: 28, bottom: 19, right: 60, width: 22, height: 13, x: 595, y: 1123 },
  'numbot/formula-3-37': { left: 25, top: 29, bottom: 19, right: 55, width: 27, height: 12, x: 619, y: 1123 },
  'numbot/formula-3-38': { left: 25, top: 28, bottom: 18, right: 55, width: 27, height: 14, x: 648, y: 1123 },
  'numbot/formula-3-39': { left: 25, top: 24, bottom: 18, right: 54, width: 28, height: 18, x: 677, y: 1123 },
  'numbot/formula-3-40': { left: 25, top: 25, bottom: 18, right: 55, width: 27, height: 17, x: 707, y: 1123 },
  'numbot/formula-3-41': { left: 25, top: 26, bottom: 18, right: 42, width: 40, height: 16, x: 736, y: 1123 },
  'numbot/formula-3-42': { left: 25, top: 27, bottom: 18, right: 42, width: 40, height: 15, x: 778, y: 1123 },
  'numbot/formula-3-43': { left: 25, top: 23, bottom: 18, right: 38, width: 44, height: 19, x: 820, y: 1123 },
  'numbot/formula-3-44': { left: 25, top: 20, bottom: 18, right: 38, width: 44, height: 22, x: 866, y: 1123 },
  'numbot/formula-3-45': { left: 25, top: 22, bottom: 18, right: 38, width: 44, height: 20, x: 912, y: 1123 },
  'numbot/formula-3-46': { left: 25, top: 22, bottom: 18, right: 38, width: 44, height: 20, x: 958, y: 1123 },
  'numbot/formula-3-47': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 1004, y: 1123 },
  'numbot/formula-3-48': { left: 25, top: 24, bottom: 18, right: 21, width: 61, height: 18, x: 1067, y: 1123 },
  'numbot/formula-3-49': { left: 25, top: 19, bottom: 18, right: 21, width: 61, height: 23, x: 1130, y: 1123 },
  'numbot/formula-3-50': { left: 25, top: 18, bottom: 18, right: 21, width: 61, height: 24, x: 1193, y: 1123 },
  'numbot/formula-3-51': { left: 25, top: 20, bottom: 18, right: 21, width: 61, height: 22, x: 1256, y: 1123 },
  'numbot/formula-3-52': { left: 25, top: 21, bottom: 18, right: 21, width: 61, height: 21, x: 1319, y: 1123 },
  'numbot/formula-3-53': { left: 25, top: 22, bottom: 18, right: 21, width: 61, height: 20, x: 1382, y: 1123 },
  'numbot/formula-3-54': { left: 25, top: 23, bottom: 18, right: 21, width: 61, height: 19, x: 1445, y: 1123 },
  'numbot/formula-3-end-1': { left: 25, top: 24, bottom: 19, right: 20, width: 62, height: 17, x: 1508, y: 1123 },
  'numbot/formula-3-end-2': { left: 25, top: 24, bottom: 20, right: 20, width: 62, height: 16, x: 1572, y: 1123 },
  'numbot/formula-3-end-3': { left: 25, top: 24, bottom: 22, right: 20, width: 62, height: 14, x: 1636, y: 1123 },
  'numbot/formula-3-end-4': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1700, y: 1123 },
  'numbot/formula-3-end-5': { left: 25, top: 24, bottom: 23, right: 20, width: 62, height: 13, x: 1764, y: 1123 },
  'numbot/formula-3-end-6': { left: 26, top: 24, bottom: 23, right: 20, width: 61, height: 13, x: 1828, y: 1123 },
  'numbot/formula-3-end-7': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1891, y: 1123 },
  'numbot/formula-3-end-8': { left: 43, top: 24, bottom: 23, right: 20, width: 44, height: 13, x: 1937, y: 1123 },
  'numbot/formula-3-end-9': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 0, y: 1149 },
  'numbot/formula-3-end-10': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 46, y: 1149 },
  'numbot/formula-3-end-11': { left: 43, top: 24, bottom: 24, right: 20, width: 44, height: 12, x: 92, y: 1149 },
  'numbot/formula-3-end-12': { left: 43, top: 23, bottom: 24, right: 20, width: 44, height: 13, x: 138, y: 1149 },
  'numbot/formula-3-end-13': { left: 43, top: 22, bottom: 24, right: 20, width: 44, height: 14, x: 184, y: 1149 },
  'numbot/formula-3-end-14': { left: 47, top: 23, bottom: 24, right: 20, width: 40, height: 13, x: 230, y: 1149 },
  'numbot/formula-3-end-15': { left: 60, top: 24, bottom: 24, right: 20, width: 27, height: 12, x: 272, y: 1149 },
  'numbot/formula-3-end-16': { left: 60, top: 24, bottom: 25, right: 20, width: 27, height: 11, x: 301, y: 1149 },
  'numbot/formula-3-end-17': { left: 60, top: 23, bottom: 25, right: 20, width: 27, height: 12, x: 330, y: 1149 },
  'numbot/formula-3-end-18': { left: 60, top: 22, bottom: 27, right: 20, width: 27, height: 11, x: 359, y: 1149 },
  'numbot/formula-3-end-19': { left: 60, top: 20, bottom: 28, right: 20, width: 27, height: 12, x: 388, y: 1149 },
  'numbot/formula-3-end-20': { left: 60, top: 20, bottom: 30, right: 20, width: 27, height: 10, x: 417, y: 1149 },
  'numbot/formula-3-end-21': { left: 60, top: 20, bottom: 30, right: 20, width: 27, height: 10, x: 446, y: 1149 },
  'numbot/formula-3-end-22': { left: 60, top: 20, bottom: 30, right: 20, width: 27, height: 10, x: 475, y: 1149 },
  'numbot/formula-3-end-23': { left: 77, top: 24, bottom: 30, right: 20, width: 10, height: 6, x: 504, y: 1149 },
  'numbot/formula-3-end-24': { left: 77, top: 23, bottom: 31, right: 20, width: 10, height: 6, x: 516, y: 1149 },
  'numbot/formula-3-end-25': { left: 77, top: 22, bottom: 32, right: 20, width: 10, height: 6, x: 528, y: 1149 },
  'numbot/formula-3-end-26': { left: 77, top: 20, bottom: 34, right: 20, width: 10, height: 6, x: 540, y: 1149 },
  'numbot/formula-3-end-27': { left: 77, top: 18, bottom: 36, right: 21, width: 9, height: 6, x: 552, y: 1149 },
  'numbot/formula-3-end-28': { left: 77, top: 18, bottom: 39, right: 21, width: 9, height: 3, x: 563, y: 1149 },
  'numbot/formula-1-segment-1': { width: 34, height: 8, x: 574, y: 1149 },
  'numbot/formula-1-segment-2': { width: 7, height: 30, x: 610, y: 1149 },
  'numbot/formula-1-segment-3': { left: 1, right: 1, width: 5, height: 30, x: 619, y: 1149 },
  'numbot/formula-1-segment-4': { left: 5, width: 35, height: 9, x: 626, y: 1149 },
  'numbot/formula-1-segment-5': { width: 8, height: 35, x: 663, y: 1149 },
  'numbot/formula-1-segment-6': { left: 1, right: 1, width: 6, height: 34, x: 673, y: 1149 },
  'numbot/formula-1-segment-7': { width: 39, height: 9, x: 681, y: 1149 },
  'numbot/formula-2-segment-1': { width: 33, height: 8, x: 722, y: 1149 },
  'numbot/formula-2-segment-2': { width: 6, height: 30, x: 757, y: 1149 },
  'numbot/formula-2-segment-3': { left: 1, right: 1, width: 4, height: 30, x: 765, y: 1149 },
  'numbot/formula-2-segment-4': { left: 5, top: 1, bottom: 1, width: 35, height: 8, x: 771, y: 1149 },
  'numbot/formula-2-segment-5': { width: 7, height: 35, x: 808, y: 1149 },
  'numbot/formula-2-segment-6': { right: 1, width: 5, height: 34, x: 817, y: 1149 },
  'numbot/formula-2-segment-7': { top: 1, bottom: 1, width: 38, height: 8, x: 824, y: 1149 },
  'numbot/formula-3-segment-1': { width: 34, height: 8, x: 864, y: 1149 },
  'numbot/formula-3-segment-2': { width: 8, height: 30, x: 900, y: 1149 },
  'numbot/formula-3-segment-3': { left: 1, right: 1, width: 5, height: 30, x: 910, y: 1149 },
  'numbot/formula-3-segment-4': { left: 5, width: 37, height: 9, x: 917, y: 1149 },
  'numbot/formula-3-segment-5': { width: 9, height: 35, x: 956, y: 1149 },
  'numbot/formula-3-segment-6': { left: 1, right: 1, width: 6, height: 34, x: 967, y: 1149 },
  'numbot/formula-3-segment-7': { width: 40, height: 9, x: 975, y: 1149 },
  'demonbot/paper-finale-11': { left: 314, top: 133, bottom: 86, right: 98, width: 298, height: 353, x: 0, y: 0 },
  'demonbot/paper-finale-13': { left: 312, top: 20, bottom: 79, right: 92, width: 306, height: 473, x: 300, y: 0 },
  'demonbot/paper-finale-15': { left: 299, top: 25, bottom: 82, right: 88, width: 323, height: 465, x: 608, y: 0 },
  'demonbot/paper-finale-17': { left: 299, top: 25, bottom: 82, right: 88, width: 323, height: 465, x: 933, y: 0 },
  'demonbot/paper-finale-19': { left: 251, top: 28, bottom: 71, right: 81, width: 378, height: 473, x: 1258, y: 0 },
  'demonbot/paper-finale-21': { left: 178, top: 28, bottom: 71, right: 81, width: 451, height: 473, x: 0, y: 475 },
  'demonbot/paper-finale-23': { left: 179, top: 26, bottom: 72, right: 79, width: 452, height: 474, x: 453, y: 475 },
  'demonbot/paper-finale-25': { left: 20, top: 6, bottom: 70, right: 73, width: 617, height: 496, x: 907, y: 475 },
  'demonbot/paper-finale-27': { left: 30, top: 12, bottom: 70, right: 73, width: 607, height: 490, x: 0, y: 973 },
  'demonbot/paper-finale-29': { left: 27, top: 23, bottom: 36, right: 67, width: 616, height: 513, x: 609, y: 973 },
  'demonbot/hair': { width: 245, height: 189, x: 0, y: 0 },
  'demonbot/hair-rotate-0.5': { width: 243, height: 190, x: 247, y: 0 },
  'demonbot/hair-rotate-1': { width: 242, height: 192, x: 492, y: 0 },
  'demonbot/hair-rotate-1.5': { width: 241, height: 194, x: 736, y: 0 },
  'demonbot/hair-rotate-2': { width: 240, height: 196, x: 979, y: 0 },
  'demonbot/hair-rotate-2.5': { width: 239, height: 197, x: 1221, y: 0 },
  'demonbot/hair-rotate-3': { width: 237, height: 199, x: 1462, y: 0 },
  'demonbot/hair-rotate-3.5': { width: 236, height: 201, x: 1701, y: 0 },
  'demonbot/hair-rotate-4': { width: 235, height: 203, x: 0, y: 203 },
  'demonbot/hair-rotate-4.5': { width: 234, height: 204, x: 237, y: 203 },
  'demonbot/hair-rotate-4.75': { width: 233, height: 205, x: 473, y: 203 },
  'demonbot/hair-rotate-5': { width: 233, height: 206, x: 708, y: 203 },
  'hints/demonbot-target-wave-1': { width: 75, height: 54, x: 943, y: 203 },
  'hints/demonbot-target-wave-2': { width: 75, height: 54, x: 1020, y: 203 },
  'hints/demonbot-target-wave-3': { top: 2, right: 1, width: 74, height: 52, x: 1097, y: 203 },
  'hints/demonbot-wave-1': { bottom: 1, width: 73, height: 54, x: 1173, y: 203 },
  'hints/demonbot-wave-2': { top: 1, bottom: 1, width: 73, height: 53, x: 1248, y: 203 },
  'hints/demonbot-wave-3': { top: 2, width: 73, height: 53, x: 1323, y: 203 },
  'demonbot/paper-finale-1': { left: 434, top: 325, bottom: 92, right: 112, width: 164, height: 155, x: 1398, y: 203 },
  'demonbot/paper-finale-3': { left: 331, top: 327, bottom: 88, right: 110, width: 269, height: 157, x: 1564, y: 203 },
  'demonbot/paper-finale-5': { left: 311, top: 269, bottom: 87, right: 110, width: 289, height: 216, x: 0, y: 411 },
  'demonbot/paper-finale-7': { left: 313, top: 216, bottom: 84, right: 102, width: 295, height: 272, x: 291, y: 411 },
  'demonbot/paper-finale-9': { left: 314, top: 220, bottom: 86, right: 98, width: 298, height: 266, x: 588, y: 411 },
  'background/satellite': { width: 90, height: 87, x: 888, y: 411 },
  'demonbot/eye-big': { width: 11, height: 10, x: 980, y: 411 },
  'demonbot/eye-medium': { width: 8, height: 7, x: 993, y: 411 },
  'demonbot/eye-small': { width: 6, height: 5, x: 1003, y: 411 },
  'demonbot/big-eye-left': { left: 3, top: 15, bottom: 3, right: 49, width: 57, height: 55, x: 1011, y: 411 },
  'demonbot/big-eye-right-1': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1070, y: 411 },
  'demonbot/big-eye-right-2': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1129, y: 411 },
  'demonbot/big-eye-right-3': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1188, y: 411 },
  'demonbot/big-eye-right-4': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1247, y: 411 },
  'demonbot/big-eye-right-5': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1306, y: 411 },
  'demonbot/big-eye-right-6': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1365, y: 411 },
  'demonbot/big-eye-right-7': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1424, y: 411 },
  'demonbot/big-eye-right-8': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1483, y: 411 },
  'demonbot/big-eye-right-9': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1542, y: 411 },
  'demonbot/big-eye-right-10': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1601, y: 411 },
  'demonbot/big-eye-right-11': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1660, y: 411 },
  'demonbot/big-eye-right-12': { left: 49, top: 15, bottom: 3, right: 3, width: 57, height: 55, x: 1719, y: 411 },
  'demonbot/ui-cogs-1': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1778, y: 411 },
  'demonbot/ui-cogs-2': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 0, y: 685 },
  'demonbot/ui-cogs-3': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 168, y: 685 },
  'demonbot/ui-cogs-4': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 336, y: 685 },
  'demonbot/ui-cogs-5': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 504, y: 685 },
  'demonbot/ui-cogs-6': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 672, y: 685 },
  'demonbot/ui-cogs-7': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 840, y: 685 },
  'demonbot/ui-cogs-8': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1008, y: 685 },
  'demonbot/ui-cogs-9': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1176, y: 685 },
  'demonbot/ui-cogs-10': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1344, y: 685 },
  'demonbot/ui-cogs-11': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1512, y: 685 },
  'demonbot/ui-cogs-12': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1680, y: 685 },
  'demonbot/ui-cogs-13': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 0, y: 713 },
  'demonbot/ui-cogs-14': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 168, y: 713 },
  'demonbot/ui-cogs-15': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 336, y: 713 },
  'demonbot/ui-cogs-16': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 504, y: 713 },
  'demonbot/ui-cogs-17': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 672, y: 713 },
  'demonbot/ui-cogs-18': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 840, y: 713 },
  'demonbot/ui-cogs-19': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1008, y: 713 },
  'demonbot/ui-cogs-20': { left: 27, top: 52, bottom: 38, right: 35, width: 166, height: 26, x: 1176, y: 713 },
  'demonbot/ui': { width: 339, height: 185, x: 1344, y: 713 },
  'demonbot/ui-top': { width: 103, height: 70, x: 1685, y: 713 },
  'demonbot/ui-dial-amplitude-empty': { width: 26, height: 26, x: 1790, y: 713 },
  'demonbot/ui-dial-amplitude-mid': { width: 26, height: 26, x: 1818, y: 713 },
  'demonbot/ui-dial-amplitude-short': { width: 26, height: 26, x: 1846, y: 713 },
  'demonbot/ui-dial-amplitude-tall': { width: 26, height: 26, x: 1874, y: 713 },
  'demonbot/ui-dial-frequency-empty': { width: 25, height: 25, x: 1902, y: 713 },
  'demonbot/ui-dial-frequency-mid': { width: 25, height: 25, x: 1929, y: 713 },
  'demonbot/ui-dial-frequency-squish': { width: 25, height: 25, x: 1956, y: 713 },
  'demonbot/ui-dial-frequency-stretch': { width: 25, height: 25, x: 0, y: 900 },
  'demonbot/ui-dial-wave-empty': { width: 25, height: 25, x: 27, y: 900 },
  'demonbot/ui-dial-wave-saw': { width: 25, height: 25, x: 54, y: 900 },
  'demonbot/ui-dial-wave-sine': { width: 25, height: 25, x: 81, y: 900 },
  'demonbot/ui-dial-wave-square': { width: 25, height: 25, x: 108, y: 900 },
  'demonbot/ui-button-activate': { left: 13, top: 7, bottom: 26, right: 33, width: 57, height: 59, x: 135, y: 900 },
  'demonbot/ui-button-activate-press-1': { left: 13, top: 7, bottom: 26, right: 33, width: 57, height: 59, x: 194, y: 900 },
  'demonbot/ui-button-activate-press-2': { left: 13, top: 7, bottom: 26, right: 33, width: 57, height: 59, x: 253, y: 900 },
  'demonbot/ui-button-activate-press-3': { left: 13, top: 7, bottom: 26, right: 33, width: 57, height: 59, x: 312, y: 900 },
  'demonbot/ui-button-left': { width: 14, height: 19, x: 371, y: 900 },
  'demonbot/ui-button-right': { width: 13, height: 19, x: 387, y: 900 },
  'demonbot/ui-button-left-press': { width: 14, height: 19, x: 402, y: 900 },
  'demonbot/ui-button-right-press': { width: 13, height: 19, x: 418, y: 900 },
  'demonbot/ui-extension-1': { width: 97, height: 72, x: 433, y: 900 },
  'demonbot/ui-extension-2': { width: 88, height: 68, x: 532, y: 900 },
  'demonbot/ui-extension-3': { width: 80, height: 73, x: 622, y: 900 },
  'demonbot/paper-1': { bottom: 3, width: 351, height: 110, x: 704, y: 900 },
  'demonbot/paper-2': { top: 2, bottom: 4, right: 2, width: 349, height: 107, x: 1057, y: 900 },
  'demonbot/paper-3': { top: 5, bottom: 4, width: 351, height: 104, x: 1408, y: 900 },
  'demonbot/paper-4': { top: 8, bottom: 2, right: 1, width: 350, height: 103, x: 0, y: 1012 },
  'demonbot/paper-5': { top: 9, right: 3, width: 348, height: 104, x: 352, y: 1012 },
  'demonbot/paper-6': { top: 8, bottom: 2, right: 1, width: 350, height: 103, x: 702, y: 1012 },
  'demonbot/paper-7': { top: 5, bottom: 4, width: 351, height: 104, x: 1054, y: 1012 },
  'demonbot/paper-8': { top: 2, bottom: 4, right: 2, width: 349, height: 107, x: 1407, y: 1012 },
  'demonbot/left-hand-1': { left: 7, top: 6, bottom: 2, right: 16, width: 35, height: 48, x: 1758, y: 1012 },
  'demonbot/left-hand-2': { left: 4, top: 8, bottom: 2, right: 16, width: 38, height: 46, x: 1795, y: 1012 },
  'demonbot/left-hand-3': { left: 1, top: 10, bottom: 2, right: 16, width: 41, height: 44, x: 1835, y: 1012 },
  'demonbot/left-hand-4': { left: 15, top: 2, bottom: 1, right: 15, width: 28, height: 53, x: 1878, y: 1012 },
  'demonbot/left-hand-5': { left: 28, top: 1, bottom: 1, right: 13, width: 17, height: 54, x: 1908, y: 1012 },
  'demonbot/left-hand-6': { left: 28, top: 2, bottom: 1, right: 6, width: 24, height: 53, x: 1927, y: 1012 },
  'demonbot/left-hand-7': { left: 28, top: 3, bottom: 1, right: 2, width: 28, height: 52, x: 1953, y: 1012 },
  'demonbot/left-hand-8': { left: 28, top: 4, bottom: 1, width: 30, height: 51, x: 0, y: 1121 },
  'demonbot/left-hand-9': { left: 28, top: 3, bottom: 1, right: 2, width: 28, height: 52, x: 32, y: 1121 },
  'demonbot/left-hand-10': { left: 28, top: 2, bottom: 1, right: 6, width: 24, height: 53, x: 62, y: 1121 },
  'demonbot/left-hand-11': { left: 28, top: 1, bottom: 1, right: 13, width: 17, height: 54, x: 88, y: 1121 },
  'demonbot/left-hand-12': { left: 15, top: 2, bottom: 1, right: 15, width: 28, height: 53, x: 107, y: 1121 },
  'demonbot/left-hand-13': { left: 1, top: 10, bottom: 2, right: 16, width: 41, height: 44, x: 137, y: 1121 },
  'demonbot/left-hand-14': { left: 5, top: 7, bottom: 2, right: 16, width: 37, height: 47, x: 180, y: 1121 },
  'demonbot/left-hand-15': { left: 7, top: 6, bottom: 2, right: 16, width: 35, height: 48, x: 219, y: 1121 },
  'demonbot/right-hand-1': { left: 8, top: 8, bottom: 3, right: 22, width: 73, height: 74, x: 256, y: 1121 },
  'demonbot/right-hand-2': { left: 8, top: 8, bottom: 3, right: 22, width: 73, height: 74, x: 331, y: 1121 },
  'demonbot/right-hand-3': { left: 8, top: 8, bottom: 3, right: 21, width: 74, height: 74, x: 406, y: 1121 },
  'demonbot/right-hand-4': { left: 8, top: 8, bottom: 3, right: 21, width: 74, height: 74, x: 482, y: 1121 },
  'demonbot/right-hand-5': { left: 8, top: 8, bottom: 3, right: 19, width: 76, height: 74, x: 558, y: 1121 },
  'demonbot/right-hand-6': { left: 8, top: 8, bottom: 3, right: 17, width: 78, height: 74, x: 636, y: 1121 },
  'demonbot/right-hand-7': { left: 8, top: 8, bottom: 3, right: 14, width: 81, height: 74, x: 716, y: 1121 },
  'demonbot/right-hand-8': { left: 8, top: 8, bottom: 3, right: 10, width: 85, height: 74, x: 799, y: 1121 },
  'demonbot/right-hand-9': { left: 7, top: 8, bottom: 3, right: 6, width: 90, height: 74, x: 886, y: 1121 },
  'demonbot/right-hand-10': { left: 6, top: 8, bottom: 3, right: 3, width: 94, height: 74, x: 978, y: 1121 },
  'demonbot/right-hand-11': { left: 6, top: 6, bottom: 3, right: 11, width: 86, height: 76, x: 1074, y: 1121 },
  'demonbot/right-hand-12': { left: 5, top: 5, bottom: 3, right: 14, width: 84, height: 77, x: 1162, y: 1121 },
  'demonbot/right-hand-13': { left: 5, top: 5, bottom: 3, right: 15, width: 83, height: 77, x: 1248, y: 1121 },
  'demonbot/right-hand-14': { left: 5, top: 4, bottom: 3, right: 15, width: 83, height: 78, x: 1333, y: 1121 },
  'demonbot/right-hand-15': { left: 5, top: 4, bottom: 3, right: 15, width: 83, height: 78, x: 1418, y: 1121 },
  'demonbot/right-hand-16': { left: 5, top: 4, bottom: 3, right: 15, width: 83, height: 78, x: 1503, y: 1121 },
  'demonbot/right-hand-17': { left: 5, top: 4, bottom: 3, right: 15, width: 83, height: 78, x: 1588, y: 1121 },
  'demonbot/right-hand-18': { left: 4, top: 4, bottom: 3, right: 15, width: 84, height: 78, x: 1673, y: 1121 },
  'demonbot/right-hand-19': { left: 4, top: 4, bottom: 3, right: 16, width: 83, height: 78, x: 1759, y: 1121 },
  'demonbot/right-hand-20': { left: 3, top: 5, bottom: 3, right: 17, width: 83, height: 77, x: 1844, y: 1121 },
  'demonbot/right-hand-21': { left: 3, top: 8, bottom: 3, right: 18, width: 82, height: 74, x: 0, y: 1201 },
  'demonbot/right-hand-22': { left: 2, top: 12, bottom: 3, right: 19, width: 82, height: 70, x: 84, y: 1201 },
  'demonbot/right-hand-23': { left: 2, top: 16, bottom: 3, right: 19, width: 82, height: 66, x: 168, y: 1201 },
  'demonbot/right-hand-24': { left: 2, top: 15, bottom: 3, right: 19, width: 82, height: 67, x: 252, y: 1201 },
  'demonbot/right-hand-25': { left: 2, top: 15, bottom: 3, right: 20, width: 81, height: 67, x: 336, y: 1201 },
  'demonbot/right-hand-26': { left: 2, top: 14, bottom: 3, right: 20, width: 81, height: 68, x: 419, y: 1201 },
  'demonbot/right-hand-27': { left: 2, top: 13, bottom: 3, right: 20, width: 81, height: 69, x: 502, y: 1201 },
  'demonbot/right-hand-28': { left: 2, top: 10, bottom: 3, right: 20, width: 81, height: 72, x: 585, y: 1201 },
  'demonbot/right-hand-29': { left: 1, top: 7, bottom: 3, right: 21, width: 81, height: 75, x: 668, y: 1201 },
  'demonbot/right-hand-30': { left: 1, top: 4, bottom: 3, right: 22, width: 80, height: 78, x: 751, y: 1201 },
  'demonbot/right-hand-31': { left: 2, top: 8, bottom: 3, right: 22, width: 79, height: 74, x: 833, y: 1201 },
  'demonbot/right-hand-32': { left: 3, top: 8, bottom: 3, right: 22, width: 78, height: 74, x: 914, y: 1201 },
  'demonbot/right-hand-33': { left: 4, top: 8, bottom: 3, right: 22, width: 77, height: 74, x: 994, y: 1201 },
  'demonbot/right-hand-34': { left: 4, top: 8, bottom: 3, right: 22, width: 77, height: 74, x: 1073, y: 1201 },
  'demonbot/right-hand-35': { left: 5, top: 8, bottom: 3, right: 22, width: 76, height: 74, x: 1152, y: 1201 },
  'demonbot/right-hand-36': { left: 5, top: 8, bottom: 3, right: 22, width: 76, height: 74, x: 1230, y: 1201 },
  'demonbot/right-hand-37': { left: 5, top: 8, bottom: 3, right: 22, width: 76, height: 74, x: 1308, y: 1201 },
  'demonbot/right-hand-38': { left: 6, top: 8, bottom: 3, right: 22, width: 75, height: 74, x: 1386, y: 1201 },
  'demonbot/right-hand-39': { left: 8, top: 8, bottom: 3, right: 22, width: 73, height: 74, x: 1463, y: 1201 },
  'demonbot/right-hand-40': { left: 8, top: 8, bottom: 3, right: 22, width: 73, height: 74, x: 1538, y: 1201 },
  'demonbot/pen-base-top': { width: 48, height: 32, x: 1613, y: 1201 },
  'demonbot/pen-base-bottom': { width: 66, height: 60, x: 1663, y: 1201 },
  'demonbot/pen-extend-1': { left: 338, top: 157, bottom: 296, right: 32, width: 9, height: 32, x: 1731, y: 1201 },
  'demonbot/pen-extend-2': { left: 338, top: 155, bottom: 296, right: 32, width: 9, height: 34, x: 1742, y: 1201 },
  'demonbot/pen-extend-3': { left: 337, top: 147, bottom: 296, right: 30, width: 12, height: 42, x: 1753, y: 1201 },
  'demonbot/pen-extend-4': { left: 336, top: 126, bottom: 296, right: 30, width: 13, height: 63, x: 1767, y: 1201 },
  'demonbot/paper-finale-30': { left: 22, top: 37, bottom: 33, right: 48, width: 640, height: 502, x: 0, y: 0 },
  'demonbot/paper-finale-31': { left: 14, top: 59, bottom: 33, right: 48, width: 648, height: 480, x: 642, y: 0 },
  'demonbot/paper-finale-32': { left: 9, top: 67, bottom: 30, right: 51, width: 650, height: 475, x: 1292, y: 0 },
  'demonbot/paper-finale-33': { left: 8, top: 108, bottom: 32, right: 47, width: 655, height: 432, x: 0, y: 504 },
  'demonbot/paper-finale-34': { left: 6, top: 140, bottom: 31, right: 20, width: 684, height: 401, x: 657, y: 504 },
  'demonbot/paper-finale-35': { left: 2, top: 151, bottom: 33, right: 17, width: 691, height: 388, x: 0, y: 938 },
  'demonbot/paper-finale-36': { top: 151, bottom: 31, right: 7, width: 703, height: 390, x: 0, y: 0 },
  'demonbot/paper-finale-37': { left: 3, top: 158, bottom: 28, right: 2, width: 705, height: 386, x: 705, y: 0 },
  'demonbot/paper-finale-38': { left: 1, top: 161, bottom: 27, right: 1, width: 708, height: 384, x: 0, y: 392 },
  'demonbot/paper-finale-39': { top: 165, bottom: 26, width: 710, height: 381, x: 710, y: 392 },
  'demonbot/paper-finale-40': { top: 165, width: 710, height: 380, x: 0, y: 778 },
  'demonbot/body': { width: 565, height: 551, x: 712, y: 778 },
  'demonbot/wave-saw-mid-mid': { top: 14, bottom: 14, width: 772, height: 34, x: 0, y: 1331 },
  'demonbot/wave-saw-mid-squish': { top: 14, bottom: 13, width: 772, height: 35, x: 774, y: 1331 },
  'demonbot/wave-saw-mid-stretch': { top: 14, bottom: 13, width: 772, height: 35, x: 0, y: 1368 },
  'demonbot/wave-saw-short-mid': { top: 22, bottom: 21, width: 772, height: 19, x: 774, y: 1368 },
  'demonbot/wave-saw-short-squish': { top: 22, bottom: 21, width: 772, height: 19, x: 0, y: 1405 },
  'demonbot/wave-saw-short-stretch': { top: 22, bottom: 21, width: 772, height: 19, x: 774, y: 1405 },
  'demonbot/wave-saw-tall-mid': { top: 1, width: 772, height: 61, x: 0, y: 1426 },
  'demonbot/wave-saw-tall-squish': { width: 772, height: 62, x: 774, y: 1426 },
  'demonbot/wave-saw-tall-stretch': { top: 1, bottom: 1, width: 772, height: 60, x: 0, y: 1490 },
  'demonbot/wave-sine-mid-mid': { top: 15, bottom: 15, width: 772, height: 32, x: 774, y: 1490 },
  'demonbot/wave-sine-mid-squish': { top: 15, bottom: 15, width: 772, height: 32, x: 0, y: 1552 },
  'demonbot/wave-sine-mid-stretch': { top: 15, bottom: 13, width: 772, height: 34, x: 774, y: 1552 },
  'demonbot/wave-sine-short-mid': { top: 24, bottom: 23, width: 772, height: 15, x: 0, y: 1588 },
  'demonbot/wave-sine-short-squish': { top: 24, bottom: 24, width: 772, height: 14, x: 774, y: 1588 },
  'demonbot/wave-sine-short-stretch': { top: 24, bottom: 22, width: 772, height: 16, x: 0, y: 1605 },
  'demonbot/wave-sine-tall-mid': { top: 3, bottom: 3, width: 772, height: 56, x: 774, y: 1605 },
  'demonbot/wave-sine-tall-squish': { top: 3, bottom: 3, width: 772, height: 56, x: 0, y: 1663 },
  'demonbot/wave-sine-tall-stretch': { top: 3, bottom: 2, width: 772, height: 57, x: 774, y: 1663 },
  'demonbot/wave-square-mid-mid': { top: 15, bottom: 15, width: 772, height: 32, x: 0, y: 1722 },
  'demonbot/wave-square-mid-squish': { top: 15, bottom: 15, width: 772, height: 32, x: 774, y: 1722 },
  'demonbot/wave-square-mid-stretch': { top: 15, bottom: 15, width: 772, height: 32, x: 0, y: 1756 },
  'demonbot/wave-square-short-mid': { top: 23, bottom: 24, width: 772, height: 15, x: 774, y: 1756 },
  'demonbot/wave-square-short-squish': { top: 24, bottom: 24, width: 772, height: 14, x: 0, y: 1790 },
  'demonbot/wave-square-short-stretch': { top: 24, bottom: 24, width: 772, height: 14, x: 774, y: 1790 },
  'demonbot/wave-square-tall-mid': { top: 2, bottom: 2, width: 772, height: 58, x: 0, y: 1806 },
  'demonbot/wave-square-tall-squish': { top: 2, bottom: 2, width: 772, height: 58, x: 774, y: 1806 },
  'demonbot/wave-square-tall-stretch': { top: 2, bottom: 3, width: 772, height: 57, x: 0, y: 1866 },
  'demonbot/wave-target': { left: 1, top: 15, bottom: 15, right: 2, width: 769, height: 32, x: 774, y: 1866 },
  'demonbot/pen-extend-5': { left: 326, top: 3, bottom: 296, right: 18, width: 35, height: 186, x: 0, y: 0 },
  'demonbot/pen-extend-6': { left: 326, top: 3, bottom: 296, right: 18, width: 35, height: 186, x: 37, y: 0 },
  'demonbot/pen-extend-7': { left: 335, bottom: 296, right: 25, width: 19, height: 189, x: 74, y: 0 },
  'demonbot/pen-extend-8': { left: 336, bottom: 296, right: 27, width: 16, height: 189, x: 95, y: 0 },
  'demonbot/pen-extend-9': { left: 333, bottom: 296, right: 26, width: 20, height: 189, x: 113, y: 0 },
  'demonbot/pen-extend-10': { left: 327, bottom: 296, right: 21, width: 31, height: 189, x: 135, y: 0 },
  'demonbot/pen-extend-11': { left: 327, bottom: 312, right: 21, width: 31, height: 173, x: 168, y: 0 },
  'demonbot/pen-extend-12': { left: 327, bottom: 320, right: 21, width: 31, height: 165, x: 201, y: 0 },
  'demonbot/pen-extend-13': { left: 327, bottom: 321, right: 21, width: 31, height: 164, x: 234, y: 0 },
  'demonbot/pen-extend-14': { left: 327, bottom: 321, right: 17, width: 35, height: 164, x: 267, y: 0 },
  'demonbot/pen-extend-15': { left: 327, bottom: 321, right: 17, width: 35, height: 164, x: 304, y: 0 },
  'demonbot/pen-extend-16': { left: 3, bottom: 322, right: 13, width: 363, height: 163, x: 341, y: 0 },
  'demonbot/pen-extend-17': { left: 65, bottom: 322, right: 10, width: 304, height: 163, x: 706, y: 0 },
  'demonbot/pen-extend-18': { left: 119, bottom: 289, right: 8, width: 252, height: 196, x: 1012, y: 0 },
  'demonbot/pen-extend-19': { left: 142, bottom: 268, right: 7, width: 230, height: 217, x: 1266, y: 0 },
  'demonbot/pen-extend-20': { left: 150, bottom: 263, right: 7, width: 222, height: 222, x: 1498, y: 0 },
  'demonbot/pen-extend-21': { left: 150, bottom: 259, right: 8, width: 221, height: 226, x: 1722, y: 0 },
  'demonbot/pen-extend-22': { left: 151, bottom: 247, right: 12, width: 216, height: 238, x: 0, y: 228 },
  'demonbot/pen-extend-23': { left: 146, bottom: 227, right: 19, width: 214, height: 258, x: 218, y: 228 },
  'demonbot/pen-extend-24': { left: 137, bottom: 202, right: 21, width: 221, height: 283, x: 434, y: 228 },
  'demonbot/pen-extend-25': { left: 131, top: 3, bottom: 173, right: 20, width: 228, height: 309, x: 657, y: 228 },
  'demonbot/pen-extend-26': { left: 133, top: 25, bottom: 146, right: 20, width: 226, height: 314, x: 887, y: 228 },
  'demonbot/pen-extend-27': { left: 130, top: 50, bottom: 102, right: 19, width: 230, height: 333, x: 1115, y: 228 },
  'demonbot/pen-extend-28': { left: 133, top: 72, bottom: 67, right: 19, width: 227, height: 346, x: 1347, y: 228 },
  'demonbot/pen-extend-29': { left: 136, top: 81, bottom: 40, right: 19, width: 224, height: 364, x: 1576, y: 228 },
  'demonbot/pen-extend-30': { left: 140, top: 84, bottom: 22, right: 19, width: 220, height: 379, x: 0, y: 594 },
  'demonbot/pen-extend-31': { left: 143, top: 87, bottom: 11, right: 19, width: 217, height: 387, x: 222, y: 594 },
  'demonbot/pen-extend-32': { left: 144, top: 87, bottom: 7, right: 19, width: 216, height: 391, x: 441, y: 594 },
  'demonbot/pen-extend-33': { left: 146, top: 88, bottom: 10, right: 19, width: 214, height: 387, x: 659, y: 594 },
  'demonbot/pen-extend-34': { left: 148, top: 88, bottom: 12, right: 19, width: 212, height: 385, x: 875, y: 594 },
  'demonbot/pen-extend-35': { left: 148, top: 88, bottom: 13, right: 19, width: 212, height: 384, x: 1089, y: 594 },
  'demonbot/pen-extend-36': { left: 148, top: 89, bottom: 14, right: 19, width: 212, height: 382, x: 1303, y: 594 },
  'demonbot/pen-extend-37': { left: 148, top: 88, bottom: 14, right: 19, width: 212, height: 383, x: 1517, y: 594 },
  'demonbot/pen-extend-38': { left: 148, top: 88, bottom: 13, right: 19, width: 212, height: 384, x: 1731, y: 594 },
  'demonbot/pen-extend-39': { left: 148, top: 88, bottom: 12, right: 19, width: 212, height: 385, x: 0, y: 987 },
  'demonbot/pen-extend-40': { left: 146, top: 88, bottom: 10, right: 19, width: 214, height: 387, x: 214, y: 987 },
  'babybot/planet-opening-1': { left: 18, top: 5, bottom: 6, right: 16, width: 6, height: 21, x: 0, y: 0 },
  'babybot/planet-opening-2': { left: 11, top: 3, bottom: 3, right: 8, width: 21, height: 26, x: 8, y: 0 },
  'babybot/planet-opening-3': { left: 2, right: 2, width: 36, height: 32, x: 31, y: 0 },
  'babybot/planet-opening-4': { left: 2, right: 3, width: 35, height: 32, x: 69, y: 0 },
  'babybot/gift-1': { left: 34, top: 24, bottom: 25, right: 47, width: 26, height: 27, x: 106, y: 0 },
  'babybot/gift-2': { left: 25, top: 15, bottom: 12, right: 37, width: 45, height: 49, x: 134, y: 0 },
  'babybot/gift-3': { left: 16, top: 4, bottom: 7, right: 28, width: 63, height: 65, x: 181, y: 0 },
  'babybot/gift-4': { left: 6, bottom: 7, right: 15, width: 86, height: 69, x: 246, y: 0 },
  'babybot/gift-5': { top: 3, bottom: 7, right: 10, width: 97, height: 66, x: 334, y: 0 },
  'babybot/gift-6': { top: 21, width: 107, height: 55, x: 433, y: 0 },
  'babybot/gift-7': { top: 21, width: 107, height: 55, x: 542, y: 0 },
  'babybot/planet-1-explosion-1': { left: 90, top: 103, bottom: 106, right: 72, width: 48, height: 44, x: 651, y: 0 },
  'babybot/planet-1-explosion-2': { left: 79, top: 84, bottom: 100, right: 59, width: 72, height: 69, x: 701, y: 0 },
  'babybot/planet-1-explosion-3': { left: 76, top: 83, bottom: 94, right: 47, width: 87, height: 76, x: 775, y: 0 },
  'babybot/planet-1-explosion-4': { left: 65, top: 73, bottom: 87, right: 40, width: 105, height: 93, x: 864, y: 0 },
  'babybot/planet-2-explosion-1': { left: 85, top: 90, bottom: 106, right: 64, width: 61, height: 57, x: 971, y: 0 },
  'babybot/planet-2-explosion-2': { left: 72, top: 67, bottom: 100, right: 48, width: 90, height: 86, x: 1034, y: 0 },
  'babybot/planet-2-explosion-3': { left: 66, top: 63, bottom: 92, right: 33, width: 111, height: 98, x: 1126, y: 0 },
  'babybot/planet-2-explosion-4': { left: 53, top: 52, bottom: 84, right: 27, width: 130, height: 117, x: 1239, y: 0 },
  'babybot/planet-3-explosion-1': { left: 77, top: 78, bottom: 107, right: 56, width: 77, height: 68, x: 1371, y: 0 },
  'babybot/planet-3-explosion-2': { left: 62, top: 49, bottom: 97, right: 38, width: 110, height: 107, x: 1450, y: 0 },
  'babybot/planet-3-explosion-3': { left: 53, top: 46, bottom: 90, right: 20, width: 137, height: 117, x: 1562, y: 0 },
  'babybot/planet-3-explosion-4': { left: 38, top: 30, bottom: 78, right: 6, width: 166, height: 145, x: 1701, y: 0 },
  'babybot/planet-1-ambiance-1': { left: 70, top: 87, bottom: 104, right: 67, width: 73, height: 62, x: 1869, y: 0 },
  'babybot/planet-1-ambiance-2': { left: 70, top: 74, bottom: 104, right: 75, width: 65, height: 75, x: 0, y: 147 },
  'babybot/planet-1-ambiance-3': { left: 69, top: 82, bottom: 103, right: 75, width: 66, height: 68, x: 67, y: 147 },
  'babybot/planet-1-ambiance-4': { left: 69, top: 87, bottom: 103, right: 75, width: 66, height: 63, x: 135, y: 147 },
  'babybot/planet-1-ambiance-5': { left: 70, top: 87, bottom: 104, right: 75, width: 65, height: 62, x: 203, y: 147 },
  'babybot/planet-1-ambiance-6': { left: 70, top: 87, bottom: 90, right: 75, width: 65, height: 76, x: 270, y: 147 },
  'babybot/planet-1-ambiance-7': { left: 57, top: 87, bottom: 75, right: 75, width: 78, height: 91, x: 337, y: 147 },
  'babybot/planet-1-ambiance-8': { left: 42, top: 87, bottom: 64, right: 75, width: 93, height: 102, x: 417, y: 147 },
  'babybot/planet-1-ambiance-9': { left: 39, top: 87, bottom: 58, right: 75, width: 96, height: 108, x: 512, y: 147 },
  'babybot/planet-1-ambiance-10': { left: 36, top: 87, bottom: 62, right: 75, width: 99, height: 104, x: 610, y: 147 },
  'babybot/planet-1-ambiance-11': { left: 42, top: 87, bottom: 63, right: 75, width: 93, height: 103, x: 711, y: 147 },
  'babybot/planet-1-ambiance-12': { left: 70, top: 77, bottom: 104, right: 75, width: 65, height: 72, x: 806, y: 147 },
  'babybot/planet-1-ambiance-13': { left: 69, top: 63, bottom: 103, right: 43, width: 98, height: 87, x: 873, y: 147 },
  'babybot/planet-1-ambiance-14': { left: 69, top: 87, bottom: 103, right: 33, width: 108, height: 63, x: 973, y: 147 },
  'babybot/planet-1-ambiance-15': { left: 70, top: 87, bottom: 104, right: 42, width: 98, height: 62, x: 1083, y: 147 },
  'babybot/planet-1-ambiance-16': { left: 70, top: 87, bottom: 104, right: 44, width: 96, height: 62, x: 1183, y: 147 },
  'babybot/planet-1-ambiance-17': { left: 70, top: 87, bottom: 102, right: 33, width: 107, height: 64, x: 1281, y: 147 },
  'babybot/planet-1-ambiance-18': { left: 69, top: 87, bottom: 99, right: 21, width: 120, height: 67, x: 1390, y: 147 },
  'babybot/planet-1-ambiance-19': { left: 69, top: 87, bottom: 95, right: 16, width: 125, height: 71, x: 1512, y: 147 },
  'babybot/planet-1-ambiance-20': { left: 70, top: 87, bottom: 93, right: 17, width: 123, height: 73, x: 1639, y: 147 },
  'babybot/planet-2-ambiance-1': { left: 46, top: 70, bottom: 98, right: 15, width: 149, height: 85, x: 1764, y: 147 },
  'babybot/planet-2-ambiance-2': { left: 46, top: 70, bottom: 98, right: 15, width: 149, height: 85, x: 0, y: 257 },
  'babybot/planet-2-ambiance-3': { left: 46, top: 70, bottom: 96, right: 15, width: 149, height: 87, x: 151, y: 257 },
  'babybot/planet-2-ambiance-4': { left: 46, top: 70, bottom: 97, right: 15, width: 149, height: 86, x: 302, y: 257 },
  'babybot/planet-2-ambiance-5': { left: 46, top: 70, bottom: 98, right: 15, width: 149, height: 85, x: 453, y: 257 },
  'babybot/planet-3-ambiance-1': { left: 37, top: 45, bottom: 101, right: 55, width: 118, height: 107, x: 604, y: 257 },
  'babybot/planet-3-ambiance-2': { left: 37, top: 45, bottom: 98, right: 55, width: 118, height: 110, x: 724, y: 257 },
  'babybot/planet-3-ambiance-3': { left: 37, top: 45, bottom: 98, right: 55, width: 118, height: 110, x: 844, y: 257 },
  'babybot/planet-3-ambiance-4': { left: 37, top: 45, bottom: 98, right: 55, width: 118, height: 110, x: 964, y: 257 },
  'babybot/planet-3-ambiance-5': { left: 37, top: 45, bottom: 98, right: 55, width: 118, height: 110, x: 1084, y: 257 },
  'babybot/planet-4-ambiance-1': { bottom: 103, right: 44, width: 166, height: 150, x: 1204, y: 257 },
  'babybot/planet-4-ambiance-2': { bottom: 103, right: 44, width: 166, height: 150, x: 1372, y: 257 },
  'babybot/planet-4-ambiance-3': { top: 1, bottom: 101, right: 44, width: 166, height: 151, x: 1540, y: 257 },
  'babybot/planet-4-ambiance-4': { top: 1, bottom: 102, right: 44, width: 166, height: 150, x: 1708, y: 257 },
  'babybot/planet-4-ambiance-5': { bottom: 103, right: 44, width: 166, height: 150, x: 0, y: 410 },
  'babybot/cannon-wheel': { width: 110, height: 110, x: 168, y: 410 },
  'babybot/cannon-wheel-rotate24': { width: 110, height: 110, x: 280, y: 410 },
  'babybot/cannon-wheel-rotate48': { width: 110, height: 110, x: 392, y: 410 },
  'babybot/cannon-wheel-rotate72': { width: 110, height: 110, x: 504, y: 410 },
  'babybot/cannon-wheel-rotate96': { width: 110, height: 110, x: 616, y: 410 },
  'babybot/cannon-wheel-rotate120': { width: 110, height: 110, x: 728, y: 410 },
  'babybot/cannon-wheel-rotate144': { width: 110, height: 110, x: 840, y: 410 },
  'babybot/cannon-wheel-rotate168': { width: 109, height: 110, x: 952, y: 410 },
  'babybot/cannon-wheel-rotate-168': { width: 110, height: 110, x: 1063, y: 410 },
  'babybot/cannon-wheel-rotate-144': { width: 110, height: 111, x: 1175, y: 410 },
  'babybot/cannon-wheel-rotate-120': { width: 110, height: 110, x: 1287, y: 410 },
  'babybot/cannon-wheel-rotate-96': { width: 110, height: 110, x: 1399, y: 410 },
  'babybot/cannon-wheel-rotate-72': { width: 110, height: 109, x: 1511, y: 410 },
  'babybot/cannon-wheel-rotate-48': { width: 111, height: 110, x: 1623, y: 410 },
  'babybot/cannon-wheel-rotate-24': { width: 110, height: 110, x: 1736, y: 410 },
  'babybot/planet-3': { left: 54, top: 70, bottom: 36, right: 31, width: 125, height: 147, x: 1848, y: 410 },
  'babybot/planet-4': { left: 23, top: 24, width: 187, height: 229, x: 0, y: 562 },
  'babybot/cannon-body': { width: 132, height: 250, x: 189, y: 562 },
  'babybot/cannon-body-rotate1': { left: 1, right: 3, width: 132, height: 252, x: 323, y: 562 },
  'babybot/cannon-body-rotate2': { left: 2, top: 1, bottom: 2, right: 6, width: 132, height: 250, x: 457, y: 562 },
  'babybot/cannon-body-rotate3': { left: 3, top: 1, bottom: 3, right: 9, width: 132, height: 251, x: 591, y: 562 },
  'babybot/cannon-body-rotate4': { left: 4, top: 3, bottom: 4, right: 12, width: 133, height: 250, x: 725, y: 562 },
  'babybot/cannon-body-rotate5': { left: 5, top: 4, bottom: 5, right: 15, width: 133, height: 250, x: 860, y: 562 },
  'babybot/cannon-body-rotate-1': { left: 3, bottom: 1, right: 1, width: 132, height: 251, x: 995, y: 562 },
  'babybot/cannon-body-rotate-2': { left: 6, top: 1, bottom: 2, right: 2, width: 132, height: 250, x: 1129, y: 562 },
  'babybot/cannon-body-rotate-3': { left: 9, top: 1, bottom: 3, right: 3, width: 132, height: 251, x: 1263, y: 562 },
  'babybot/cannon-body-rotate-4': { left: 13, top: 2, bottom: 4, right: 3, width: 133, height: 251, x: 1397, y: 562 },
  'babybot/cannon-body-rotate-5': { left: 16, top: 3, bottom: 5, right: 5, width: 132, height: 251, x: 1532, y: 562 },
  'babybot/cannon-button-left': { width: 17, height: 26, x: 1666, y: 562 },
  'babybot/cannon-button-left-press': { top: 4, width: 17, height: 22, x: 1685, y: 562 },
  'babybot/cannon-button-left-rotate-2.5': { width: 17, height: 26, x: 1704, y: 562 },
  'babybot/cannon-button-left-rotate-5': { width: 17, height: 26, x: 1723, y: 562 },
  'babybot/cannon-button-left-rotate2.5': { width: 18, height: 25, x: 1742, y: 562 },
  'babybot/cannon-button-left-rotate5': { width: 18, height: 25, x: 1762, y: 562 },
  'babybot/cannon-button-right': { width: 17, height: 27, x: 1782, y: 562 },
  'babybot/cannon-button-right-press': { top: 4, width: 17, height: 23, x: 1801, y: 562 },
  'babybot/cannon-button-right-rotate-2.5': { width: 17, height: 27, x: 1820, y: 562 },
  'babybot/cannon-button-right-rotate-5': { width: 17, height: 27, x: 1839, y: 562 },
  'babybot/cannon-button-right-rotate2.5': { width: 17, height: 27, x: 1858, y: 562 },
  'babybot/cannon-button-right-rotate5': { width: 17, height: 27, x: 1877, y: 562 },
  'babybot/cannon-button-activate': { width: 34, height: 38, x: 1896, y: 562 },
  'babybot/cannon-button-activate-press': { top: 7, width: 34, height: 31, x: 1932, y: 562 },
  'babybot/cannon-button-activate-rotate-2.5': { width: 33, height: 38, x: 0, y: 816 },
  'babybot/cannon-button-activate-rotate-5': { width: 33, height: 38, x: 35, y: 816 },
  'babybot/cannon-button-activate-rotate2.5': { width: 34, height: 38, x: 70, y: 816 },
  'babybot/cannon-button-activate-rotate5': { width: 35, height: 38, x: 106, y: 816 },
  'babybot/cannon-baby-inside': { left: 43, top: 9, bottom: 62, right: 39, width: 38, height: 50, x: 143, y: 816 },
  'babybot/cannon-baby-right-1': { left: 33, top: 9, bottom: 62, right: 45, width: 42, height: 50, x: 183, y: 816 },
  'babybot/cannon-baby-right-2': { left: 49, top: 9, bottom: 61, right: 33, width: 38, height: 51, x: 227, y: 816 },
  'babybot/cannon-baby-right-3': { left: 51, top: 10, bottom: 61, right: 30, width: 39, height: 50, x: 267, y: 816 },
  'babybot/cannon-baby-right-4': { left: 48, top: 9, bottom: 61, right: 24, width: 48, height: 51, x: 308, y: 816 },
  'babybot/cannon-baby-right-5': { left: 47, top: 7, bottom: 61, right: 31, width: 42, height: 53, x: 358, y: 816 },
  'babybot/cannon-baby-right-6': { left: 47, top: 9, bottom: 62, right: 36, width: 37, height: 50, x: 402, y: 816 },
  'babybot/cannon-baby-right-7': { left: 34, top: 9, bottom: 62, right: 45, width: 41, height: 50, x: 441, y: 816 },
  'babybot/cannon-baby-right-8': { left: 41, top: 9, bottom: 62, right: 41, width: 38, height: 50, x: 484, y: 816 },
  'babybot/cannon-baby-left-1': { left: 51, top: 10, bottom: 61, right: 30, width: 39, height: 50, x: 524, y: 816 },
  'babybot/cannon-baby-left-2': { left: 36, top: 9, bottom: 62, right: 44, width: 40, height: 50, x: 565, y: 816 },
  'babybot/cannon-baby-left-3': { left: 33, top: 9, bottom: 62, right: 45, width: 42, height: 50, x: 607, y: 816 },
  'babybot/cannon-baby-left-4': { left: 30, top: 7, bottom: 64, right: 38, width: 52, height: 50, x: 651, y: 816 },
  'babybot/cannon-baby-left-5': { left: 35, top: 6, bottom: 64, right: 36, width: 49, height: 51, x: 705, y: 816 },
  'babybot/cannon-baby-left-6': { left: 41, top: 9, bottom: 62, right: 41, width: 38, height: 50, x: 756, y: 816 },
  'babybot/cannon-baby-left-7': { left: 51, top: 10, bottom: 60, right: 29, width: 40, height: 51, x: 796, y: 816 },
  'babybot/cannon-baby-left-8': { left: 39, top: 9, bottom: 63, right: 43, width: 38, height: 49, x: 838, y: 816 },
  'babybot/cannon-baby-load-1': { left: 44, top: 10, bottom: 65, right: 40, width: 36, height: 46, x: 878, y: 816 },
  'babybot/cannon-baby-load-2': { left: 44, top: 7, bottom: 68, right: 40, width: 36, height: 46, x: 916, y: 816 },
  'babybot/cannon-baby-load-3': { left: 43, top: 7, bottom: 63, right: 40, width: 37, height: 51, x: 954, y: 816 },
  'babybot/cannon-baby-load-4': { left: 43, top: 7, bottom: 63, right: 40, width: 37, height: 51, x: 993, y: 816 },
  'babybot/cannon-baby-load-5': { left: 43, top: 8, bottom: 62, right: 40, width: 37, height: 51, x: 1032, y: 816 },
  'babybot/cannon-baby-load-6': { left: 43, top: 9, bottom: 61, right: 40, width: 37, height: 51, x: 1071, y: 816 },
  'babybot/cannon-baby-load-7': { left: 43, top: 11, bottom: 59, right: 40, width: 37, height: 51, x: 1110, y: 816 },
  'babybot/cannon-baby-load-8': { left: 43, top: 14, bottom: 56, right: 40, width: 37, height: 51, x: 1149, y: 816 },
  'babybot/cannon-baby-load-9': { left: 43, top: 17, bottom: 53, right: 40, width: 37, height: 51, x: 1188, y: 816 },
  'babybot/cannon-baby-load-10': { left: 43, top: 21, bottom: 49, right: 40, width: 37, height: 51, x: 1227, y: 816 },
  'babybot/cannon-baby-load-11': { left: 43, top: 26, bottom: 44, right: 40, width: 37, height: 51, x: 1266, y: 816 },
  'babybot/cannon-baby-load-12': { left: 43, top: 31, bottom: 39, right: 40, width: 37, height: 51, x: 1305, y: 816 },
  'babybot/cannon-baby-load-13': { left: 43, top: 37, bottom: 33, right: 40, width: 37, height: 51, x: 1344, y: 816 },
  'babybot/cannon-baby-load-14': { left: 43, top: 43, bottom: 27, right: 40, width: 37, height: 51, x: 1383, y: 816 },
  'babybot/cannon-baby-load-15': { left: 43, top: 50, bottom: 20, right: 40, width: 37, height: 51, x: 1422, y: 816 },
  'babybot/cannon-baby-new-1': { left: 45, top: 57, bottom: 18, right: 39, width: 36, height: 46, x: 1461, y: 816 },
  'babybot/cannon-baby-new-2': { left: 45, top: 57, bottom: 18, right: 39, width: 36, height: 46, x: 1499, y: 816 },
  'babybot/cannon-baby-new-3': { left: 45, top: 56, bottom: 19, right: 39, width: 36, height: 46, x: 1537, y: 816 },
  'babybot/cannon-baby-new-4': { left: 45, top: 55, bottom: 20, right: 39, width: 36, height: 46, x: 1575, y: 816 },
  'babybot/cannon-baby-new-5': { left: 45, top: 53, bottom: 22, right: 39, width: 36, height: 46, x: 1613, y: 816 },
  'babybot/cannon-baby-new-6': { left: 45, top: 51, bottom: 24, right: 39, width: 36, height: 46, x: 1651, y: 816 },
  'babybot/cannon-baby-new-7': { left: 45, top: 48, bottom: 27, right: 39, width: 36, height: 46, x: 1689, y: 816 },
  'babybot/cannon-baby-new-8': { left: 45, top: 45, bottom: 30, right: 39, width: 36, height: 46, x: 1727, y: 816 },
  'babybot/cannon-baby-new-9': { left: 45, top: 41, bottom: 34, right: 39, width: 36, height: 46, x: 1765, y: 816 },
  'babybot/cannon-baby-new-10': { left: 45, top: 37, bottom: 39, right: 39, width: 36, height: 45, x: 1803, y: 816 },
  'babybot/cannon-baby-new-11': { left: 45, top: 32, bottom: 44, right: 39, width: 36, height: 45, x: 1841, y: 816 },
  'babybot/cannon-baby-new-12': { left: 45, top: 26, bottom: 49, right: 39, width: 36, height: 46, x: 1879, y: 816 },
  'babybot/cannon-baby-new-13': { left: 45, top: 20, bottom: 55, right: 39, width: 36, height: 46, x: 1917, y: 816 },
  'babybot/cannon-baby-new-14': { left: 45, top: 14, bottom: 61, right: 39, width: 36, height: 46, x: 1955, y: 816 },
  'babybot/cannon-baby-new-15': { left: 42, bottom: 70, right: 41, width: 37, height: 51, x: 0, y: 871 },
  'babybot/cannon-baby-new-16': { left: 42, top: 3, bottom: 67, right: 41, width: 37, height: 51, x: 39, y: 871 },
  'babybot/cannon-baby-flying-up-half': { left: 40, top: 62, right: 36, width: 44, height: 59, x: 78, y: 871 },
  'babybot/cannon-baby-flying-up-full': { left: 40, top: 1, bottom: 8, right: 36, width: 44, height: 112, x: 124, y: 871 },
  'babybot/cannon-baby-falling-down': { width: 21, height: 50, x: 170, y: 871 },
  'babybot/cannon-baby-falling-down-rotate24': { left: 3, top: 2, bottom: 4, right: 3, width: 33, height: 48, x: 193, y: 871 },
  'babybot/cannon-baby-falling-down-rotate48': { left: 4, top: 4, bottom: 7, right: 3, width: 44, height: 38, x: 228, y: 871 },
  'babybot/cannon-baby-falling-down-rotate72': { left: 2, top: 4, bottom: 6, right: 1, width: 51, height: 25, x: 274, y: 871 },
  'babybot/cannon-baby-falling-down-rotate96': { left: 1, top: 1, bottom: 2, right: 1, width: 50, height: 23, x: 327, y: 871 },
  'babybot/cannon-baby-falling-down-rotate120': { left: 4, top: 4, bottom: 3, right: 2, width: 48, height: 36, x: 379, y: 871 },
  'babybot/cannon-baby-falling-down-rotate144': { left: 7, top: 4, bottom: 2, right: 4, width: 35, height: 47, x: 429, y: 871 },
  'babybot/cannon-baby-falling-down-rotate168': { left: 5, top: 1, bottom: 1, right: 3, width: 22, height: 51, x: 466, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-168': { left: 2, top: 2, bottom: 1, right: 2, width: 26, height: 50, x: 490, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-144': { left: 3, top: 5, bottom: 3, right: 4, width: 39, height: 45, x: 518, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-120': { left: 2, top: 7, bottom: 4, right: 3, width: 49, height: 32, x: 559, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-96': { top: 3, bottom: 2, width: 52, height: 21, x: 610, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-72': { left: 2, top: 3, bottom: 2, right: 3, width: 49, height: 30, x: 664, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-48': { left: 3, top: 3, bottom: 4, right: 6, width: 42, height: 42, x: 715, y: 871 },
  'babybot/cannon-baby-falling-down-rotate-24': { left: 3, top: 2, bottom: 3, right: 7, width: 29, height: 49, x: 759, y: 871 },
  'babybot/bk-star': { bottom: 1, width: 11, height: 10, x: 790, y: 871 },
  'babybot/planet-1': { left: 79, top: 107, bottom: 69, right: 62, width: 69, height: 77, x: 803, y: 871 },
  'babybot/planet-2': { left: 68, top: 94, bottom: 51, right: 42, width: 100, height: 108, x: 874, y: 871 },
  'babybot/planet-1-moon': { width: 18, height: 21, x: 976, y: 871 },
  'babybot/planet-2-moon': { width: 25, height: 30, x: 996, y: 871 },
  'babybot/planet-3-moon': { width: 28, height: 37, x: 1023, y: 871 },
  'babybot/planet-4-moon': { width: 46, height: 57, x: 1053, y: 871 },
  'babybot/bk-constellation-1': { width: 83, height: 85, x: 1101, y: 871 },
  'babybot/bk-constellation-2': { width: 43, height: 68, x: 1186, y: 871 },
  'explosions/explosion-1-1': { left: 88, top: 89, bottom: 71, right: 90, width: 32, height: 28, x: 1231, y: 871 },
  'explosions/explosion-1-2': { left: 67, top: 77, bottom: 58, right: 80, width: 63, height: 53, x: 1265, y: 871 },
  'explosions/explosion-1-3': { left: 61, top: 51, bottom: 52, right: 70, width: 79, height: 85, x: 1330, y: 871 },
  'explosions/explosion-1-4': { left: 49, top: 51, bottom: 41, right: 57, width: 104, height: 96, x: 1411, y: 871 },
  'explosions/explosion-1-5': { left: 30, top: 33, bottom: 27, right: 36, width: 144, height: 128, x: 1517, y: 871 },
  'explosions/explosion-1-6': { left: 20, top: 23, bottom: 19, right: 22, width: 168, height: 146, x: 1663, y: 871 },
  'explosions/explosion-1-7': { left: 14, top: 18, bottom: 15, right: 14, width: 182, height: 155, x: 0, y: 1019 },
  'explosions/explosion-1-8': { left: 7, top: 10, bottom: 9, right: 6, width: 197, height: 169, x: 184, y: 1019 },
  'explosions/explosion-1-9': { left: 3, top: 4, bottom: 4, right: 3, width: 204, height: 180, x: 383, y: 1019 },
  'explosions/explosion-1-10': { width: 210, height: 188, x: 589, y: 1019 },
  'explosions/explosion-2-1': { left: 53, top: 51, bottom: 60, right: 57, width: 14, height: 11, x: 801, y: 1019 },
  'explosions/explosion-2-2': { left: 43, top: 45, bottom: 53, right: 50, width: 31, height: 24, x: 817, y: 1019 },
  'explosions/explosion-2-3': { left: 24, top: 30, bottom: 39, right: 29, width: 71, height: 53, x: 850, y: 1019 },
  'explosions/explosion-2-4': { left: 17, top: 24, bottom: 33, right: 21, width: 86, height: 65, x: 923, y: 1019 },
  'explosions/explosion-2-5': { left: 14, top: 17, bottom: 24, right: 14, width: 96, height: 81, x: 1011, y: 1019 },
  'explosions/explosion-2-6': { left: 11, top: 10, bottom: 16, right: 11, width: 102, height: 96, x: 1109, y: 1019 },
  'explosions/explosion-2-7': { left: 5, top: 5, bottom: 10, right: 6, width: 113, height: 107, x: 1213, y: 1019 },
  'explosions/explosion-2-8': { left: 3, top: 3, bottom: 6, right: 5, width: 116, height: 113, x: 1328, y: 1019 },
  'explosions/explosion-2-9': { left: 1, top: 1, bottom: 3, right: 2, width: 121, height: 118, x: 1446, y: 1019 },
  'explosions/explosion-2-10': { width: 124, height: 122, x: 1569, y: 1019 },
  'explosions/explosion-3-1': { left: 36, top: 71, bottom: 64, right: 31, width: 30, height: 45, x: 1695, y: 1019 },
  'explosions/explosion-3-2': { left: 34, top: 60, bottom: 54, right: 30, width: 33, height: 66, x: 1727, y: 1019 },
  'explosions/explosion-3-3': { left: 30, top: 48, bottom: 38, right: 25, width: 42, height: 94, x: 1762, y: 1019 },
  'explosions/explosion-3-4': { left: 25, top: 38, bottom: 33, right: 18, width: 54, height: 109, x: 1806, y: 1019 },
  'explosions/explosion-3-5': { left: 17, top: 34, bottom: 29, right: 15, width: 65, height: 117, x: 1862, y: 1019 },
  'explosions/explosion-3-6': { left: 11, top: 29, bottom: 26, right: 10, width: 76, height: 125, x: 0, y: 1209 },
  'explosions/explosion-3-7': { left: 8, top: 20, bottom: 22, right: 6, width: 83, height: 138, x: 78, y: 1209 },
  'explosions/explosion-3-8': { left: 4, top: 13, bottom: 13, right: 2, width: 91, height: 154, x: 163, y: 1209 },
  'explosions/explosion-3-9': { top: 5, bottom: 5, width: 97, height: 170, x: 256, y: 1209 },
  'explosions/explosion-3-10': { left: 13, right: 9, width: 75, height: 180, x: 355, y: 1209 },
  'explosions/explosion-4-1': { left: 42, top: 40, bottom: 41, right: 45, width: 27, height: 28, x: 432, y: 1209 },
  'explosions/explosion-4-2': { left: 34, top: 34, bottom: 34, right: 35, width: 45, height: 41, x: 461, y: 1209 },
  'explosions/explosion-4-3': { left: 25, top: 27, bottom: 26, right: 26, width: 63, height: 56, x: 508, y: 1209 },
  'explosions/explosion-4-4': { left: 20, top: 20, bottom: 22, right: 24, width: 70, height: 67, x: 573, y: 1209 },
  'explosions/explosion-4-5': { left: 15, top: 16, bottom: 16, right: 19, width: 80, height: 77, x: 645, y: 1209 },
  'explosions/explosion-4-6': { left: 7, top: 11, bottom: 8, right: 11, width: 96, height: 90, x: 727, y: 1209 },
  'explosions/explosion-4-7': { left: 4, top: 7, bottom: 5, right: 6, width: 104, height: 97, x: 825, y: 1209 },
  'explosions/explosion-4-8': { left: 1, top: 4, bottom: 2, right: 3, width: 110, height: 103, x: 931, y: 1209 },
  'explosions/explosion-4-9': { top: 1, width: 114, height: 108, x: 1043, y: 1209 },
  'explosions/explosion-4-10': { left: 54, right: 56, width: 4, height: 109, x: 1159, y: 1209 },
  'cat/sit-body': { left: 11, top: 5, right: 5, width: 32, height: 46, x: 1165, y: 1209 },
  'cat/sit-head-1': { left: 22, top: 1, bottom: 33, width: 26, height: 17, x: 1199, y: 1209 },
  'cat/sit-head-2': { left: 22, bottom: 33, width: 26, height: 18, x: 1227, y: 1209 },
  'cat/sit-head-3': { left: 23, bottom: 33, width: 25, height: 18, x: 1255, y: 1209 },
  'cat/sit-head-4': { left: 23, bottom: 31, width: 25, height: 20, x: 1282, y: 1209 },
  'cat/sit-head-5': { left: 21, top: 1, bottom: 29, width: 27, height: 21, x: 1309, y: 1209 },
  'cat/sit-head-6': { left: 21, top: 1, bottom: 31, width: 27, height: 19, x: 1338, y: 1209 },
  'cat/sit-head-7': { left: 22, bottom: 33, width: 26, height: 18, x: 1367, y: 1209 },
  'cat/sit-head-8': { left: 23, bottom: 33, width: 25, height: 18, x: 1395, y: 1209 },
  'cat/sit-head-9': { left: 23, bottom: 33, width: 25, height: 18, x: 1422, y: 1209 },
  'cat/sit-tail-1': { left: 3, top: 22, bottom: 9, right: 27, width: 18, height: 20, x: 1449, y: 1209 },
  'cat/sit-tail-2': { left: 3, top: 21, bottom: 9, right: 26, width: 19, height: 21, x: 1469, y: 1209 },
  'cat/sit-tail-3': { left: 3, top: 21, bottom: 9, right: 26, width: 19, height: 21, x: 1490, y: 1209 },
  'cat/sit-tail-4': { left: 4, top: 21, bottom: 9, right: 26, width: 18, height: 21, x: 1511, y: 1209 },
  'cat/sit-tail-5': { left: 4, top: 20, bottom: 9, right: 26, width: 18, height: 22, x: 1531, y: 1209 },
  'cat/sit-tail-6': { left: 4, top: 20, bottom: 9, right: 26, width: 18, height: 22, x: 1551, y: 1209 },
  'cat/stand': { top: 5, width: 68, height: 46, x: 1571, y: 1209 },
  'cat/walk-1': { left: 2, top: 1, width: 67, height: 48, x: 1641, y: 1209 },
  'cat/walk-2': { left: 2, top: 1, width: 67, height: 48, x: 1710, y: 1209 },
  'cat/walk-3': { left: 1, top: 2, width: 68, height: 47, x: 1779, y: 1209 },
  'cat/walk-4': { left: 1, top: 1, width: 68, height: 48, x: 1849, y: 1209 },
  'cat/walk-5': { top: 1, width: 69, height: 48, x: 1919, y: 1209 },
  'cat/walk-6': { left: 1, width: 68, height: 49, x: 0, y: 1391 },
  'cat/walk-7': { left: 1, bottom: 1, width: 68, height: 48, x: 70, y: 1391 },
  'cat/walk-8': { left: 2, width: 67, height: 49, x: 140, y: 1391 },
  'hints/babybot-1': { left: 2, top: 18, right: 5, width: 48, height: 85, x: 209, y: 1391 },
  'hints/babybot-2': { left: 2, top: 18, right: 5, width: 48, height: 85, x: 259, y: 1391 },
  'hints/babybot-3': { top: 18, right: 5, width: 50, height: 85, x: 309, y: 1391 },
  'hints/babybot-4': { top: 10, right: 5, width: 50, height: 93, x: 361, y: 1391 },
  'hints/babybot-5': { left: 2, top: 3, right: 5, width: 48, height: 100, x: 413, y: 1391 },
  'hints/babybot-6': { left: 2, right: 5, width: 48, height: 103, x: 463, y: 1391 },
  'hints/babybot-7': { left: 2, top: 1, right: 5, width: 48, height: 102, x: 513, y: 1391 },
  'hints/babybot-8': { left: 2, top: 3, right: 5, width: 48, height: 100, x: 563, y: 1391 },
  'hints/babybot-9': { left: 2, top: 8, right: 5, width: 48, height: 95, x: 613, y: 1391 },
  'hints/babybot-10': { left: 2, top: 13, right: 3, width: 50, height: 90, x: 663, y: 1391 },
  'hints/babybot-11': { left: 2, top: 10, right: 1, width: 52, height: 93, x: 715, y: 1391 },
  'hints/babybot-12': { left: 2, top: 8, width: 53, height: 95, x: 769, y: 1391 },
  'hints/babybot-13': { left: 2, top: 8, width: 53, height: 95, x: 824, y: 1391 },
  'intro-finale/items-letter-n': { width: 91, height: 89, x: 0, y: 0 },
  'intro-finale/items-letter-s': { left: 4, right: 9, width: 78, height: 94, x: 93, y: 0 },
  'intro-finale/items-letter-h': { top: 2, right: 4, width: 87, height: 87, x: 173, y: 0 },
  'intro-finale/items-clove': { left: 21, top: 6, bottom: 13, right: 19, width: 28, height: 55, x: 262, y: 0 },
  'intro-finale/items-control-room': { left: 3, top: 7, bottom: 8, right: 6, width: 56, height: 50, x: 292, y: 0 },
  'intro-finale/items-earmuffs': { left: 4, top: 8, bottom: 7, right: 18, width: 43, height: 50, x: 350, y: 0 },
  'intro-finale/items-forget-me-not': { left: 8, top: 11, bottom: 10, right: 13, width: 44, height: 44, x: 395, y: 0 },
  'intro-finale/items-halo-1': { top: 1, bottom: 1, width: 54, height: 48, x: 441, y: 0 },
  'intro-finale/items-halo-2': { left: 1, top: 1, bottom: 1, right: 2, width: 51, height: 48, x: 497, y: 0 },
  'intro-finale/items-halo-3': { left: 1, width: 53, height: 50, x: 550, y: 0 },
  'intro-finale/items-hole-1': { left: 23, top: 11, bottom: 4, right: 28, width: 9, height: 4, x: 605, y: 0 },
  'intro-finale/items-hole-2': { left: 1, bottom: 1, right: 4, width: 55, height: 18, x: 616, y: 0 },
  'intro-finale/items-hole-3': { left: 1, right: 3, width: 56, height: 19, x: 673, y: 0 },
  'intro-finale/items-hole-4': { width: 60, height: 19, x: 731, y: 0 },
  'intro-finale/items-narcissus': { left: 10, top: 10, bottom: 10, right: 16, width: 39, height: 45, x: 793, y: 0 },
  'intro-finale/items-needle-thread': { width: 68, height: 65, x: 834, y: 0 },
  'intro-finale/items-needle': { top: 8, width: 59, height: 51, x: 904, y: 0 },
  'intro-finale/items-neutron-1': { left: 8, bottom: 9, right: 9, width: 20, height: 39, x: 965, y: 0 },
  'intro-finale/items-neutron-2': { left: 6, right: 2, width: 29, height: 48, x: 987, y: 0 },
  'intro-finale/items-neutron-3': { left: 1, width: 36, height: 48, x: 1018, y: 0 },
  'intro-finale/items-neutron-4': { bottom: 1, right: 2, width: 35, height: 47, x: 1056, y: 0 },
  'intro-finale/items-neutron-5': { left: 2, bottom: 5, right: 9, width: 26, height: 43, x: 1093, y: 0 },
  'intro-finale/items-neutron-6': { left: 8, bottom: 11, right: 9, width: 20, height: 37, x: 1121, y: 0 },
  'intro-finale/items-neutron-7': { left: 3, bottom: 11, right: 9, width: 25, height: 37, x: 1143, y: 0 },
  'intro-finale/items-neutron-8': { bottom: 10, right: 5, width: 32, height: 38, x: 1170, y: 0 },
  'intro-finale/items-neutron-9': { bottom: 10, right: 3, width: 34, height: 38, x: 1204, y: 0 },
  'intro-finale/items-neutron-10': { left: 2, bottom: 9, right: 3, width: 32, height: 39, x: 1240, y: 0 },
  'intro-finale/items-neutron-11': { left: 8, bottom: 9, right: 5, width: 24, height: 39, x: 1274, y: 0 },
  'intro-finale/items-neutron-12': { left: 8, bottom: 9, right: 9, width: 20, height: 39, x: 1300, y: 0 },
  'intro-finale/items-neutron-dropped': { left: 12, top: 13, bottom: 14, right: 14, width: 39, height: 38, x: 1322, y: 0 },
  'intro-finale/items-noodles': { left: 9, top: 6, bottom: 4, right: 2, width: 54, height: 55, x: 1363, y: 0 },
  'intro-finale/items-nose': { left: 12, top: 3, bottom: 16, right: 19, width: 28, height: 40, x: 1419, y: 0 },
  'intro-finale/items-pinstripe': { left: 12, top: 18, bottom: 16, right: 4, width: 49, height: 31, x: 1449, y: 0 },
  'intro-finale/items-potion': { left: 14, top: 11, bottom: 8, right: 21, width: 30, height: 46, x: 1500, y: 0 },
  'intro-finale/items-scissors': { left: 8, top: 8, bottom: 8, right: 13, width: 44, height: 49, x: 1532, y: 0 },
  'intro-finale/items-shower-1': { left: 1, bottom: 2, width: 51, height: 62, x: 1578, y: 0 },
  'intro-finale/items-shower-2': { width: 52, height: 64, x: 1631, y: 0 },
  'intro-finale/items-shower-3': { left: 11, bottom: 5, width: 41, height: 59, x: 1685, y: 0 },
  'intro-finale/items-shower-4': { left: 11, bottom: 3, width: 41, height: 61, x: 1728, y: 0 },
  'intro-finale/items-shower-5': { left: 10, bottom: 3, width: 42, height: 61, x: 1771, y: 0 },
  'intro-finale/items-shower-6': { left: 7, width: 45, height: 64, x: 1815, y: 0 },
  'intro-finale/items-shower-7': { left: 5, bottom: 6, width: 47, height: 58, x: 1862, y: 0 },
  'intro-finale/items-shower-8': { left: 3, bottom: 2, width: 49, height: 62, x: 1911, y: 0 },
  'intro-finale/items-shower-9': { left: 3, bottom: 11, width: 49, height: 53, x: 0, y: 96 },
  'intro-finale/items-shower-10': { bottom: 8, width: 52, height: 56, x: 51, y: 96 },
  'intro-finale/items-shower-11': { left: 2, bottom: 2, width: 50, height: 62, x: 105, y: 96 },
  'intro-finale/items-shower-12': { width: 52, height: 64, x: 157, y: 96 },
  'intro-finale/items-shower-13': { left: 1, bottom: 18, width: 51, height: 46, x: 211, y: 96 },
  'intro-finale/items-shower-14': { bottom: 14, width: 52, height: 50, x: 264, y: 96 },
  'intro-finale/items-shower-15': { left: 6, bottom: 11, width: 46, height: 53, x: 318, y: 96 },
  'intro-finale/items-shower-16': { left: 4, bottom: 8, width: 48, height: 56, x: 366, y: 96 },
  'intro-finale/items-shower-17': { left: 8, bottom: 3, width: 44, height: 61, x: 416, y: 96 },
  'intro-finale/items-shower-18': { left: 6, width: 46, height: 64, x: 462, y: 96 },
  'intro-finale/items-shower-19': { left: 3, bottom: 4, width: 49, height: 60, x: 510, y: 96 },
  'intro-finale/items-shower-20': { bottom: 2, width: 52, height: 62, x: 561, y: 96 },
  'intro-finale/items-shower': { left: 11, bottom: 21, right: 13, width: 41, height: 44, x: 615, y: 96 },
  'intro-finale/items-thimble': { left: 16, top: 16, bottom: 10, right: 19, width: 30, height: 39, x: 658, y: 96 },
  'intro-finale/items-thread-thimble': { left: 2, top: 11, bottom: 14, right: 11, width: 52, height: 40, x: 690, y: 96 },
  'intro-finale/items-thread': { left: 4, top: 16, bottom: 15, right: 13, width: 48, height: 34, x: 744, y: 96 },
  'intro-finale/items-trim': { left: 9, top: 14, bottom: 9, right: 19, width: 37, height: 42, x: 794, y: 96 },
  'intro-finale/items-basket': { width: 46, height: 59, x: 833, y: 96 },
  'intro-finale/items-broom': { width: 35, height: 67, x: 881, y: 96 },
  'intro-finale/items-castanet': { width: 52, height: 47, x: 918, y: 96 },
  'intro-finale/items-crab-1': { top: 12, right: 1, width: 60, height: 48, x: 972, y: 96 },
  'intro-finale/items-crab-2': { top: 10, right: 1, width: 60, height: 50, x: 1034, y: 96 },
  'intro-finale/items-crab-3': { top: 11, width: 61, height: 49, x: 1096, y: 96 },
  'intro-finale/items-crab-4': { top: 12, width: 61, height: 48, x: 1159, y: 96 },
  'intro-finale/items-crab-5': { top: 11, right: 1, width: 60, height: 49, x: 1222, y: 96 },
  'intro-finale/items-crab-6': { top: 7, right: 1, width: 60, height: 53, x: 1284, y: 96 },
  'intro-finale/items-crab-7': { top: 2, right: 1, width: 60, height: 58, x: 1346, y: 96 },
  'intro-finale/items-crab-8': { right: 1, width: 60, height: 60, x: 1408, y: 96 },
  'intro-finale/items-frying-pan': { width: 71, height: 30, x: 1470, y: 96 },
  'intro-finale/items-gnocchi': { width: 50, height: 24, x: 1543, y: 96 },
  'intro-finale/items-hazelnut': { width: 42, height: 35, x: 1595, y: 96 },
  'intro-finale/items-knife': { width: 58, height: 51, x: 1639, y: 96 },
  'intro-finale/items-knot': { width: 58, height: 45, x: 1699, y: 96 },
  'intro-finale/items-lilypads': { width: 57, height: 39, x: 1759, y: 96 },
  'intro-finale/items-nacre-1': { left: 2, top: 3, width: 53, height: 47, x: 1818, y: 96 },
  'intro-finale/items-nacre-2': { width: 55, height: 50, x: 1873, y: 96 },
  'intro-finale/items-nacre-3': { left: 1, top: 1, width: 54, height: 49, x: 1930, y: 96 },
  'intro-finale/items-necesere': { width: 53, height: 50, x: 0, y: 165 },
  'intro-finale/items-pebbles': { width: 50, height: 24, x: 55, y: 165 },
  'intro-finale/items-rivet': { width: 45, height: 36, x: 107, y: 165 },
  'intro-finale/items-rolling-pin': { width: 67, height: 29, x: 154, y: 165 },
  'intro-finale/items-spinach': { width: 52, height: 52, x: 223, y: 165 },
  'intro-finale/dragon-1': { bottom: 14, right: 8, width: 86, height: 52, x: 277, y: 165 },
  'intro-finale/dragon-2': { bottom: 14, right: 10, width: 84, height: 52, x: 365, y: 165 },
  'intro-finale/dragon-3': { top: 1, bottom: 14, right: 14, width: 80, height: 51, x: 451, y: 165 },
  'intro-finale/dragon-4': { top: 1, bottom: 14, right: 17, width: 77, height: 51, x: 533, y: 165 },
  'intro-finale/dragon-5': { top: 1, bottom: 14, right: 19, width: 75, height: 51, x: 612, y: 165 },
  'intro-finale/dragon-6': { left: 1, top: 1, bottom: 14, right: 20, width: 73, height: 51, x: 689, y: 165 },
  'intro-finale/dragon-7': { left: 1, bottom: 14, right: 21, width: 72, height: 52, x: 764, y: 165 },
  'intro-finale/dragon-8': { left: 1, top: 1, bottom: 9, right: 15, width: 78, height: 56, x: 838, y: 165 },
  'intro-finale/dragon-9': { left: 4, top: 2, bottom: 7, right: 12, width: 78, height: 57, x: 918, y: 165 },
  'intro-finale/dragon-10': { left: 5, top: 2, bottom: 3, right: 5, width: 84, height: 61, x: 998, y: 165 },
  'intro-finale/dragon-11': { left: 14, top: 3, bottom: 1, right: 4, width: 76, height: 62, x: 1084, y: 165 },
  'intro-finale/dragon-12': { left: 12, top: 3, right: 1, width: 81, height: 63, x: 1162, y: 165 },
  'intro-finale/dragon-13': { left: 10, bottom: 7, width: 84, height: 59, x: 1245, y: 165 },
  'intro-finale/dragon-14': { left: 7, top: 24, bottom: 29, right: 5, width: 82, height: 13, x: 1331, y: 165 },
  'intro-finale/dragon-15': { left: 84, top: 24, bottom: 34, right: 3, width: 7, height: 8, x: 1415, y: 165 },
  'intro-finale/dragon-16': { left: 88, top: 29, bottom: 32, right: 3, width: 3, height: 5, x: 1424, y: 165 },
  'intro-finale/dragon-17': { left: 87, top: 32, bottom: 31, right: 4, width: 3, height: 3, x: 1429, y: 165 },
  'trurl/hi-1': { left: 18, top: 2, right: 19, width: 39, height: 106, x: 1434, y: 165 },
  'trurl/hi-2': { left: 18, top: 2, right: 8, width: 50, height: 106, x: 1475, y: 165 },
  'trurl/hi-3': { left: 18, top: 2, right: 1, width: 57, height: 106, x: 1527, y: 165 },
  'trurl/hi-4': { left: 18, top: 2, width: 58, height: 106, x: 1586, y: 165 },
  'trurl/hi-5': { left: 18, top: 1, right: 7, width: 51, height: 107, x: 1646, y: 165 },
  'trurl/hi-6': { left: 18, top: 1, right: 7, width: 51, height: 107, x: 1699, y: 165 },
  'trurl/hi-7': { left: 18, right: 7, width: 51, height: 108, x: 1752, y: 165 },
  'trurl/hi-8': { left: 18, right: 10, width: 48, height: 108, x: 1805, y: 165 },
  'trurl/hi-9': { left: 18, right: 10, width: 48, height: 108, x: 1855, y: 165 },
  'trurl/hi-10': { left: 18, right: 10, width: 48, height: 108, x: 1905, y: 165 },
  'trurl/hi-11': { left: 18, right: 7, width: 51, height: 108, x: 0, y: 275 },
  'trurl/hi-12': { left: 18, right: 4, width: 54, height: 108, x: 53, y: 275 },
  'trurl/hi-13': { left: 18, right: 2, width: 56, height: 108, x: 109, y: 275 },
  'trurl/hi-14': { left: 18, right: 4, width: 54, height: 108, x: 167, y: 275 },
  'klapaucjusz/standing': { width: 60, height: 135, x: 223, y: 275 },
  'klapaucjusz/hi-1': { width: 86, height: 136, x: 285, y: 275 },
  'klapaucjusz/hi-2': { left: 4, width: 82, height: 136, x: 373, y: 275 },
  'klapaucjusz/hi-3': { left: 5, width: 81, height: 136, x: 457, y: 275 },
  'klapaucjusz/hi-4': { left: 13, width: 73, height: 136, x: 540, y: 275 },
  'klapaucjusz/hi-5': { left: 17, width: 69, height: 136, x: 615, y: 275 },
  'klapaucjusz/hi-6': { left: 20, top: 1, width: 66, height: 135, x: 686, y: 275 },
  'klapaucjusz/hi-7': { left: 20, top: 1, width: 66, height: 135, x: 754, y: 275 },
  'klapaucjusz/hi-8': { left: 15, top: 1, width: 71, height: 135, x: 822, y: 275 },
  'klapaucjusz/hi-9': { left: 9, top: 1, width: 77, height: 135, x: 895, y: 275 },
  'klapaucjusz/hi-10': { left: 3, top: 1, width: 83, height: 135, x: 974, y: 275 },
  'klapaucjusz/looking-away-left': { width: 63, height: 134, x: 1059, y: 275 },
  'klapaucjusz/looking-trurl': { left: 35, top: 3, right: 12, width: 41, height: 133, x: 1124, y: 275 },
  'klapaucjusz/standing-back': { left: 24, top: 4, bottom: 1, right: 3, width: 61, height: 131, x: 1167, y: 275 },
  'klapaucjusz/standing-left': { width: 60, height: 134, x: 1230, y: 275 },
  'klapaucjusz/surprise': { width: 73, height: 134, x: 1354, y: 275 },
  'klapaucjusz/run-1': { top: 3, right: 6, width: 87, height: 137, x: 1429, y: 275 },
  'klapaucjusz/run-2': { left: 9, top: 7, bottom: 2, right: 18, width: 66, height: 131, x: 1518, y: 275 },
  'klapaucjusz/run-3': { left: 15, top: 6, bottom: 4, right: 26, width: 52, height: 130, x: 1586, y: 275 },
  'klapaucjusz/run-4': { bottom: 8, width: 93, height: 132, x: 1640, y: 275 },
  'klapaucjusz/run-5': { top: 3, right: 6, width: 87, height: 137, x: 1735, y: 275 },
  'klapaucjusz/run-6': { left: 9, top: 7, bottom: 2, right: 18, width: 66, height: 131, x: 1824, y: 275 },
  'klapaucjusz/run-7': { left: 15, top: 6, bottom: 4, right: 26, width: 52, height: 130, x: 1892, y: 275 },
  'klapaucjusz/run-8': { bottom: 8, width: 93, height: 132, x: 0, y: 414 },
  'trurl/run-1': { width: 60, height: 106, x: 95, y: 414 },
  'trurl/run-2': { width: 51, height: 108, x: 157, y: 414 },
  'trurl/run-3': { width: 45, height: 110, x: 210, y: 414 },
  'trurl/run-4': { width: 67, height: 103, x: 257, y: 414 },
  'trurl/run-5': { width: 59, height: 106, x: 326, y: 414 },
  'intro-finale/speech-bubble-1': { left: 56, top: 121, right: 54, width: 5, height: 23, x: 387, y: 414 },
  'intro-finale/speech-bubble-2': { left: 51, top: 103, right: 50, width: 14, height: 41, x: 394, y: 414 },
  'intro-finale/speech-bubble-3': { left: 45, top: 87, bottom: 1, right: 44, width: 26, height: 56, x: 410, y: 414 },
  'intro-finale/speech-bubble-4': { left: 25, top: 43, bottom: 2, right: 25, width: 65, height: 99, x: 438, y: 414 },
  'intro-finale/speech-bubble-5': { left: 13, top: 27, bottom: 3, right: 13, width: 89, height: 114, x: 505, y: 414 },
  'intro-finale/speech-bubble-6': { left: 8, top: 13, bottom: 2, right: 8, width: 99, height: 129, x: 596, y: 414 },
  'intro-finale/speech-bubble-7': { bottom: 2, width: 115, height: 142, x: 697, y: 414 },
  'intro-finale/speech-bubble-8': { bottom: 2, width: 115, height: 142, x: 814, y: 414 },
  'intro-finale/speech-bubble-9': { bottom: 2, width: 115, height: 142, x: 931, y: 414 },
  'intro-finale/speech-bubble-rays-1': { left: 15, top: 20, bottom: 15, right: 16, width: 72, height: 68, x: 1048, y: 414 },
  'intro-finale/speech-bubble-rays-2': { left: 12, top: 15, bottom: 12, right: 13, width: 78, height: 76, x: 1122, y: 414 },
  'intro-finale/speech-bubble-rays-3': { left: 8, top: 9, bottom: 6, right: 7, width: 88, height: 88, x: 1202, y: 414 },
  'intro-finale/speech-bubble-rays-4': { left: 1, top: 2, width: 102, height: 101, x: 1292, y: 414 },
  'intro-finale/speech-bubble-rays-5': { top: 1, width: 103, height: 102, x: 1396, y: 414 },
  'intro-finale/speech-bubble-rays-6': { right: 1, width: 102, height: 103, x: 1501, y: 414 },
  'intro-finale/speech-bubble-rays-no-3': { left: 8, top: 9, bottom: 6, right: 7, width: 88, height: 88, x: 1605, y: 414 },
  'intro-finale/speech-bubble-rays-no-4': { left: 1, top: 2, width: 102, height: 101, x: 1695, y: 414 },
  'intro-finale/speech-bubble-rays-no-5': { top: 1, width: 103, height: 102, x: 1799, y: 414 },
  'intro-finale/speech-bubble-rays-no-6': { right: 1, width: 102, height: 103, x: 0, y: 558 },
  'nbot/speech-bubble-1': { left: 116, top: 41, bottom: 64, right: 1, width: 23, height: 6, x: 104, y: 558 },
  'nbot/speech-bubble-2': { left: 98, top: 36, bottom: 60, right: 1, width: 41, height: 15, x: 129, y: 558 },
  'nbot/speech-bubble-3': { left: 53, top: 24, bottom: 34, right: 1, width: 86, height: 53, x: 172, y: 558 },
  'nbot/speech-bubble-4': { left: 29, top: 20, bottom: 23, right: 5, width: 106, height: 68, x: 260, y: 558 },
  'nbot/speech-bubble-5': { left: 17, top: 15, bottom: 13, right: 2, width: 121, height: 83, x: 368, y: 558 },
  'nbot/speech-bubble-6': { left: 12, top: 11, bottom: 10, right: 3, width: 125, height: 90, x: 491, y: 558 },
  'nbot/speech-bubble-7': { left: 8, top: 8, bottom: 6, right: 2, width: 130, height: 97, x: 618, y: 558 },
  'nbot/speech-bubble-8': { left: 4, top: 4, bottom: 3, right: 2, width: 134, height: 104, x: 750, y: 558 },
  'nbot/speech-bubble-9': { width: 140, height: 111, x: 886, y: 558 },
  'nbot/speech-bubble-10': { right: 1, width: 139, height: 111, x: 1028, y: 558 },
  'nbot/speech-bubble-11': { width: 140, height: 111, x: 1169, y: 558 },
  'intro-finale/button-hole-1': { left: 21, top: 12, bottom: 12, right: 22, width: 6, height: 5, x: 1311, y: 558 },
  'intro-finale/button-hole-2': { left: 16, top: 9, bottom: 9, right: 17, width: 16, height: 11, x: 1319, y: 558 },
  'intro-finale/button-hole-3': { left: 12, top: 7, bottom: 7, right: 13, width: 24, height: 15, x: 1337, y: 558 },
  'intro-finale/button-hole-4': { left: 8, top: 5, bottom: 4, right: 7, width: 34, height: 20, x: 1363, y: 558 },
  'intro-finale/button-hole-5': { left: 4, top: 3, bottom: 2, right: 4, width: 41, height: 24, x: 1399, y: 558 },
  'intro-finale/button-hole-6': { left: 3, top: 3, bottom: 2, right: 3, width: 43, height: 24, x: 1442, y: 558 },
  'intro-finale/button-hole-7': { width: 49, height: 29, x: 1487, y: 558 },
  'intro-finale/button-appear-1': { left: 16, top: 66, bottom: 75, right: 18, width: 19, height: 10, x: 1538, y: 558 },
  'intro-finale/button-appear-2': { left: 13, top: 56, bottom: 75, right: 15, width: 25, height: 20, x: 1559, y: 558 },
  'intro-finale/button-appear-3': { left: 6, top: 46, bottom: 75, right: 7, width: 40, height: 30, x: 1586, y: 558 },
  'intro-finale/button-appear-4': { left: 5, top: 38, bottom: 75, right: 4, width: 44, height: 38, x: 1628, y: 558 },
  'intro-finale/button-appear-5': { left: 5, top: 31, bottom: 75, right: 4, width: 44, height: 45, x: 1674, y: 558 },
  'intro-finale/button-appear-6': { left: 5, top: 24, bottom: 75, right: 4, width: 44, height: 52, x: 1720, y: 558 },
  'intro-finale/button-appear-7': { left: 5, top: 19, bottom: 75, right: 4, width: 44, height: 57, x: 1766, y: 558 },
  'intro-finale/button-appear-8': { left: 5, top: 14, bottom: 75, right: 4, width: 44, height: 62, x: 1812, y: 558 },
  'intro-finale/button-appear-9': { left: 5, top: 11, bottom: 75, right: 4, width: 44, height: 65, x: 1858, y: 558 },
  'intro-finale/button-appear-10': { left: 5, top: 8, bottom: 75, right: 4, width: 44, height: 68, x: 1904, y: 558 },
  'intro-finale/button-appear-11': { left: 5, top: 7, bottom: 75, right: 4, width: 44, height: 69, x: 1950, y: 558 },
  'intro-finale/button-appear-12': { left: 5, top: 6, bottom: 75, right: 4, width: 44, height: 70, x: 0, y: 671 },
  'intro-finale/button-appear-13': { left: 5, top: 6, bottom: 75, right: 4, width: 44, height: 70, x: 46, y: 671 },
  'intro-finale/button-press-1': { left: 5, top: 8, bottom: 75, right: 4, width: 44, height: 68, x: 92, y: 671 },
  'intro-finale/button-press-2': { left: 5, top: 9, bottom: 75, right: 4, width: 44, height: 67, x: 138, y: 671 },
  'intro-finale/button-press-3': { left: 5, top: 9, bottom: 75, right: 4, width: 44, height: 67, x: 184, y: 671 },
  'hints/finale-1': { left: 36, top: 32, bottom: 61, right: 31, width: 24, height: 54, x: 230, y: 671 },
  'hints/finale-2': { left: 36, top: 32, bottom: 61, right: 30, width: 25, height: 54, x: 256, y: 671 },
  'hints/finale-3': { left: 36, top: 32, bottom: 61, right: 30, width: 25, height: 54, x: 283, y: 671 },
  'hints/finale-4': { left: 36, top: 32, bottom: 61, right: 30, width: 25, height: 54, x: 310, y: 671 },
  'hints/finale-5': { left: 29, top: 32, bottom: 61, right: 28, width: 34, height: 54, x: 337, y: 671 },
  'hints/finale-6': { left: 22, top: 32, bottom: 61, right: 21, width: 48, height: 54, x: 373, y: 671 },
  'hints/finale-7': { left: 19, top: 32, bottom: 61, right: 16, width: 56, height: 54, x: 423, y: 671 },
  'hints/finale-8': { left: 18, top: 32, bottom: 61, right: 14, width: 59, height: 54, x: 481, y: 671 },
  'hints/finale-9': { left: 36, top: 32, bottom: 61, right: 31, width: 24, height: 54, x: 542, y: 671 },
  'hints/finale-10': { left: 36, top: 32, bottom: 61, right: 31, width: 24, height: 54, x: 568, y: 671 },
  'hints/finale-bk': { left: 26, top: 74, right: 25, width: 40, height: 73, x: 594, y: 671 },
  'nbot/head-2': { right: 1, width: 39, height: 62, x: 636, y: 671 },
  'nbot/head-3': { right: 2, width: 38, height: 62, x: 677, y: 671 },
  'nbot/head-4': { right: 2, width: 38, height: 62, x: 717, y: 671 },
  'nbot/head-5': { right: 2, width: 38, height: 62, x: 757, y: 671 },
  'nbot/head-6': { right: 2, width: 38, height: 62, x: 797, y: 671 },
  'nbot/head-7': { right: 2, width: 38, height: 62, x: 837, y: 671 },
  'nbot/head-8': { right: 2, width: 38, height: 62, x: 877, y: 671 },
  'nbot/head-9': { right: 2, width: 38, height: 62, x: 917, y: 671 },
  'nbot/head-10': { right: 2, width: 38, height: 62, x: 957, y: 671 },
  'intro-finale/scaffolding-left-1': { width: 122, height: 521, x: 997, y: 671 },
  'intro-finale/scaffolding-left-2': { width: 89, height: 329, x: 1121, y: 671 },
  'intro-finale/scaffolding-right-1': { width: 71, height: 221, x: 1212, y: 671 },
  'intro-finale/scaffolding-right-2': { width: 100, height: 379, x: 1285, y: 671 },
  'nbot/underwear-top': { width: 148, height: 322, x: 1387, y: 671 },
  'nbot/underwear-bottom': { width: 171, height: 123, x: 1537, y: 671 },
  'nbot/right-arm-action-8': { left: 69, top: 36, bottom: 153, right: 59, width: 111, height: 160, x: 1710, y: 671 },
  'nbot/right-arm-action-9': { left: 116, top: 1, bottom: 156, right: 26, width: 97, height: 192, x: 1823, y: 671 },
  'nbot/right-arm-action-10': { left: 130, top: 8, bottom: 158, right: 15, width: 94, height: 183, x: 0, y: 1194 },
  'nbot/right-arm-action-11': { left: 130, top: 13, bottom: 155, right: 8, width: 101, height: 181, x: 96, y: 1194 },
  'nbot/body-activate-1': { left: 31, top: 12, bottom: 16, right: 6, width: 178, height: 273, x: 0, y: 0 },
  'nbot/body-activate-2': { left: 26, top: 7, bottom: 7, right: 4, width: 185, height: 287, x: 180, y: 0 },
  'nbot/body-activate-3': { left: 23, top: 3, bottom: 2, right: 4, width: 188, height: 296, x: 367, y: 0 },
  'nbot/body-activate-4': { left: 18, top: 2, bottom: 3, right: 3, width: 194, height: 296, x: 557, y: 0 },
  'nbot/body-activate-5': { left: 14, top: 4, bottom: 10, right: 4, width: 197, height: 287, x: 753, y: 0 },
  'nbot/body-activate-6': { left: 10, top: 8, bottom: 19, right: 5, width: 200, height: 274, x: 952, y: 0 },
  'nbot/body-activate-7': { left: 5, top: 8, bottom: 27, right: 7, width: 203, height: 266, x: 1154, y: 0 },
  'nbot/left-arm-activate-1': { left: 61, top: 5, bottom: 22, right: 50, width: 110, height: 247, x: 1359, y: 0 },
  'nbot/left-arm-activate-2': { left: 52, top: 5, bottom: 15, right: 74, width: 95, height: 254, x: 1471, y: 0 },
  'nbot/left-arm-activate-3': { left: 39, top: 5, bottom: 6, right: 77, width: 105, height: 263, x: 1568, y: 0 },
  'nbot/left-arm-activate-4': { left: 13, top: 5, bottom: 11, right: 77, width: 131, height: 258, x: 1675, y: 0 },
  'nbot/left-arm-activate-5': { left: 13, top: 5, bottom: 10, right: 77, width: 131, height: 259, x: 1808, y: 0 },
  'nbot/left-arm-activate-6': { left: 23, top: 6, bottom: 7, right: 77, width: 121, height: 261, x: 0, y: 298 },
  'nbot/left-arm-activate-7': { left: 26, top: 6, bottom: 5, right: 76, width: 119, height: 263, x: 123, y: 298 },
  'nbot/right-arm-activate-1': { left: 79, top: 105, bottom: 31, right: 39, width: 121, height: 213, x: 244, y: 298 },
  'nbot/right-arm-activate-2': { left: 108, top: 105, bottom: 15, right: 35, width: 96, height: 229, x: 367, y: 298 },
  'nbot/right-arm-activate-3': { left: 131, top: 106, bottom: 3, right: 29, width: 79, height: 240, x: 465, y: 298 },
  'nbot/right-arm-activate-4': { left: 131, top: 105, bottom: 10, right: 3, width: 105, height: 234, x: 546, y: 298 },
  'nbot/right-arm-activate-5': { left: 131, top: 105, bottom: 7, right: 8, width: 100, height: 237, x: 653, y: 298 },
  'nbot/right-arm-activate-6': { left: 131, top: 105, bottom: 7, right: 18, width: 90, height: 237, x: 755, y: 298 },
  'nbot/right-arm-activate-7': { left: 131, top: 104, bottom: 16, right: 17, width: 91, height: 229, x: 847, y: 298 },
  'nbot/body-idle-1': { left: 4, top: 8, bottom: 27, right: 7, width: 204, height: 266, x: 940, y: 298 },
  'nbot/body-idle-2': { left: 3, top: 8, bottom: 26, right: 7, width: 205, height: 267, x: 1146, y: 298 },
  'nbot/body-idle-3': { left: 1, top: 8, bottom: 26, right: 6, width: 208, height: 267, x: 1353, y: 298 },
  'nbot/left-arm-idle-1': { left: 23, top: 5, bottom: 6, right: 76, width: 122, height: 263, x: 1563, y: 298 },
  'nbot/left-arm-idle-2': { left: 20, top: 6, bottom: 9, right: 76, width: 125, height: 259, x: 1687, y: 298 },
  'nbot/left-arm-idle-3': { left: 17, top: 6, bottom: 11, right: 77, width: 127, height: 257, x: 1814, y: 298 },
  'nbot/left-arm-idle-4': { left: 14, top: 5, bottom: 14, right: 77, width: 130, height: 255, x: 0, y: 567 },
  'nbot/left-arm-idle-5': { left: 12, top: 5, bottom: 17, right: 77, width: 132, height: 252, x: 132, y: 567 },
  'nbot/left-arm-idle-6': { left: 8, top: 5, bottom: 22, right: 77, width: 136, height: 247, x: 266, y: 567 },
  'nbot/right-arm-idle-1': { left: 131, top: 105, bottom: 15, right: 16, width: 92, height: 229, x: 404, y: 567 },
  'nbot/right-arm-idle-2': { left: 131, top: 105, bottom: 15, right: 14, width: 94, height: 229, x: 498, y: 567 },
  'nbot/right-arm-idle-3': { left: 131, top: 105, bottom: 15, right: 12, width: 96, height: 229, x: 594, y: 567 },
  'nbot/right-arm-idle-4': { left: 131, top: 105, bottom: 16, right: 11, width: 97, height: 228, x: 692, y: 567 },
  'nbot/right-arm-idle-5': { left: 131, top: 105, bottom: 17, right: 10, width: 98, height: 227, x: 791, y: 567 },
  'nbot/right-arm-idle-6': { left: 131, top: 105, bottom: 19, right: 9, width: 99, height: 225, x: 891, y: 567 },
  'nbot/body-action-1': { left: 5, top: 8, bottom: 27, right: 7, width: 203, height: 266, x: 992, y: 567 },
  'nbot/body-action-2': { left: 4, top: 8, bottom: 27, right: 7, width: 204, height: 266, x: 1197, y: 567 },
  'nbot/body-action-3': { left: 4, top: 8, bottom: 27, right: 7, width: 204, height: 266, x: 1403, y: 567 },
  'nbot/body-action-4': { left: 4, top: 8, bottom: 26, right: 7, width: 204, height: 267, x: 1609, y: 567 },
  'nbot/body-action-5': { left: 3, top: 8, bottom: 26, right: 7, width: 205, height: 267, x: 0, y: 836 },
  'nbot/body-action-6': { left: 3, top: 8, bottom: 26, right: 7, width: 205, height: 267, x: 207, y: 836 },
  'nbot/body-action-7': { left: 3, top: 8, bottom: 26, right: 7, width: 205, height: 267, x: 414, y: 836 },
  'nbot/body-action-8': { left: 2, top: 8, bottom: 26, right: 7, width: 206, height: 267, x: 621, y: 836 },
  'nbot/body-action-9': { left: 2, top: 8, bottom: 26, right: 6, width: 207, height: 267, x: 829, y: 836 },
  'nbot/body-action-10': { left: 2, top: 8, bottom: 26, right: 6, width: 207, height: 267, x: 1038, y: 836 },
  'nbot/body-action-11': { left: 1, top: 8, bottom: 26, right: 6, width: 208, height: 267, x: 1247, y: 836 },
  'nbot/left-arm-action-1': { left: 23, top: 6, bottom: 9, right: 76, width: 122, height: 259, x: 1457, y: 836 },
  'nbot/left-arm-action-2': { left: 20, top: 6, bottom: 17, right: 77, width: 124, height: 251, x: 1581, y: 836 },
  'nbot/left-arm-action-3': { left: 16, top: 6, bottom: 32, right: 77, width: 128, height: 236, x: 1707, y: 836 },
  'nbot/left-arm-action-4': { left: 11, top: 5, bottom: 55, right: 77, width: 133, height: 214, x: 1837, y: 836 },
  'nbot/left-arm-action-5': { left: 5, top: 5, bottom: 97, right: 77, width: 139, height: 172, x: 0, y: 1105 },
  'nbot/left-arm-action-6': { left: 2, top: 5, bottom: 122, right: 77, width: 142, height: 147, x: 141, y: 1105 },
  'nbot/left-arm-action-7': { left: 21, top: 5, bottom: 123, right: 51, width: 149, height: 146, x: 285, y: 1105 },
  'nbot/left-arm-action-8': { left: 34, top: 5, bottom: 117, right: 27, width: 160, height: 152, x: 436, y: 1105 },
  'nbot/left-arm-action-9': { left: 50, top: 6, bottom: 118, right: 11, width: 160, height: 150, x: 598, y: 1105 },
  'nbot/left-arm-action-10': { left: 66, top: 6, bottom: 119, right: 4, width: 151, height: 149, x: 760, y: 1105 },
  'nbot/left-arm-action-11': { left: 71, top: 6, bottom: 120, right: 4, width: 146, height: 148, x: 913, y: 1105 },
  'nbot/right-arm-action-1': { left: 131, top: 105, bottom: 12, right: 23, width: 85, height: 232, x: 1061, y: 1105 },
  'nbot/right-arm-action-2': { left: 130, top: 105, bottom: 11, right: 32, width: 77, height: 233, x: 1148, y: 1105 },
  'nbot/right-arm-action-3': { left: 93, top: 105, bottom: 16, right: 52, width: 94, height: 228, x: 1227, y: 1105 },
  'nbot/right-arm-action-4': { left: 21, top: 106, bottom: 57, right: 66, width: 152, height: 186, x: 1323, y: 1105 },
  'nbot/right-arm-action-5': { left: 2, top: 106, bottom: 122, right: 72, width: 165, height: 121, x: 1477, y: 1105 },
  'nbot/right-arm-action-6': { left: 25, top: 106, bottom: 128, right: 72, width: 142, height: 115, x: 1644, y: 1105 },
  'nbot/right-arm-action-7': { left: 47, top: 84, bottom: 129, right: 68, width: 124, height: 136, x: 1788, y: 1105 },
  'ui/tooltip-text-en': { left: 30, top: 7, bottom: 7, right: 11, width: 224, height: 76, x: 0, y: 1195 },
  'ui/tooltip-text-pl': { left: 50, top: 8, bottom: 7, right: 12, width: 203, height: 75, x: 0, y: 1195 },
  'ui/tooltip-text-de': { left: 48, top: 17, bottom: 20, right: 8, width: 209, height: 53, x: 0, y: 1195 },
  'ui/tooltip-text-fr': { left: 39, top: 4, bottom: 5, right: 11, width: 215, height: 81, x: 0, y: 1195 },
  'ui/tooltip-text-it': { left: 53, top: 8, bottom: 8, right: 12, width: 200, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-ru': { left: 74, top: 8, bottom: 8, right: 10, width: 181, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-lv': { left: 40, top: 8, bottom: 8, right: 11, width: 214, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-lt': { left: 39, top: 8, bottom: 8, right: 11, width: 215, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-et': { left: 17, top: 8, bottom: 8, right: 11, width: 237, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-be': { left: 60, top: 16, bottom: 16, right: 12, width: 193, height: 58, x: 0, y: 1195 },
  'ui/tooltip-text-uk': { left: 7, top: 8, bottom: 8, right: 10, width: 248, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-es': { left: 66, top: 8, bottom: 9, right: 10, width: 189, height: 73, x: 0, y: 1195 },
  'ui/tooltip-text-cs': { width: 265, height: 90, x: 0, y: 1195 },
  'ui/tooltip-text-hu': { left: 93, top: 8, bottom: 8, right: 11, width: 161, height: 74, x: 0, y: 1195 },
  'ui/tooltip-text-bg': { left: 47, top: 8, bottom: 9, right: 12, width: 206, height: 73, x: 0, y: 1195 }
};