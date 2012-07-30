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
 * @fileoverview Doodle game engine: Rect drawing and manipulation library.
 *
 * A rect is a generic graphic element (a rectangle) that can contain a number
 * of things (colours, images, animations) and be drawn using canvas or DOM.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

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
  this.noAutoHide = !!params.noAutoHide;

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
    // e.g. for buttons. We need to store bindings somewhere in order to be
    // able to remove event handlers later.

    if (params.onMouseDown) {
      this.clickableEl.onMouseDownHandler =
          engine.bind(params.onMouseDown, this);
    }
    if (params.onMouseUp) {
      this.clickableEl.onMouseUpHandler =
          engine.bind(params.onMouseUp, this);
    }

    // Adding mouse down/up event listeners and corresponding touch
    // event listeners. We assign generic mouse event listeners that are
    // shared between all the actors so, for example, the engine knows
    // whether the user interacted with the doodle in a meaningful way
    // without us having to put that in every custom event listener.
    // The custom event listeners for some actors, assigned to this.clickableEl
    // above, are called from within the listeners below.

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

    // Remembering the bindings for hover in and out handlers, and adding
    // them as event listeners directly. We animate the mouse pointer on
    // hover in and out for all the clickable rects.

    this.clickableEl.onMouseOverHandler =
        engine.bind(this.actor.onClickableMouseOver, this.actor);
    this.clickableEl.onMouseOutHandler =
        engine.bind(this.actor.onClickableMouseOut, this.actor);

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
    // Garbage collection, do that thing you do.
    this.clickableEl = null;
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
 * - {number} .align Image alignment.
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
 * - {number} .align Image alignment vis-a-vis the rect.
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
  if (!this.innerId && !this.noAutoHide && this.actor && this.visible &&
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
      engine.removeAnimation({ id: this.actor.id, innerId: this.innerId });
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
          // Not using sprites.

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
        } else {
          // Using sprites.

          var alignment = '-' + this.spriteX + 'px -' + this.spriteY + 'px';
        }

        var backgroundStyle = 'url(' + url + ') ' + alignment + ' no-repeat';

        if (this.horLoop) {
          this.horLoopEl1.style.height = this.height + 'px';
          this.horLoopEl2.style.height = this.height + 'px';

          this.horLoopEl1.style.background = backgroundStyle;
          this.horLoopEl2.style.background = backgroundStyle;
        } else {
          this.el.style.background = backgroundStyle;
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
 * - {Object} .canvasCtx Canvas context.
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
