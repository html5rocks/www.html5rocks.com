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
 * @fileoverview Doodle game engine: Actor library.
 *
 * Everything in a doodle is an actor: Protagonists, scenery, items,
 * background.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

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
    scrollable: origActorData.SCROLLABLE || false,
    forceRenderDom: origActorData.FORCE_RENDER_DOM,
    attachedToDocumentBody: origActorData.ATTACHED_TO_DOCUMENT_BODY,
    noAutoHide: origActorData.NO_AUTO_HIDE });
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
    for (var i = engine.actions.length - 1; i >= 0; i--) {
      var action = engine.actions[i];
      if (action.actorId == this.id) {
        engine.removeAction({ action: action });
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
