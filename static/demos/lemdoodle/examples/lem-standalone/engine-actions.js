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
 * @fileoverview Doodle game engine: Actions and transitions library.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

/**
 * Creates an action. Action is something that happens one time, or every tick
 * during a specific time span (we’re not using a term “event” since that
 * would conflict with browser events). We need our separate action system
 * instead of relying on setTimeouts, because at any given point our doodle
 * time can get divorced from physical time as it gets faster (fast forward),
 * slower (low frame rate or falling asleep to save CPU), stops altogether
 * (waiting for images to finish loading), or just lags behind physical time.
 * @param {Object} params Constructor parameters (explained below).
 * @constructor
 */
function EngineAction(params) {
  this.type = engine.ACTION_TYPE_EVENT;

  /**
   * Start time (in absolute ms).
   */
  this.startTime = params.startTime;

  /**
   * End time (in absolute ms).
   */
  this.endTime = params.endTime;

  /**
   * A function to be called while the action is active and within
   * startTime/endTime.
   */
  this.onAction = params.onAction;
}

/**
 * Creates a transition. A transition is a specialized type of action running
 * in a specific time span that interpolates one property from one value to
 * another.
 * @param {Object} params Constructor parameters (explained below).
 * @constructor
 */
function EngineTransition(params) {
  this.type = engine.ACTION_TYPE_TRANSITION;

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

  this.onAction = engine.bind(this.tick, this);

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
          // Perhaps a change height action – this would also fix the
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

    engine.removeAction({ action: this });
  }
};
