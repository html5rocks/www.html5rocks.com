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
 * @fileoverview Doodle game engine: All sorts of helper functions, polyfills,
 *               abstractions that are not unique to our engine and oftentimes
 *               indeed actually just come from elsewhere.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

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
