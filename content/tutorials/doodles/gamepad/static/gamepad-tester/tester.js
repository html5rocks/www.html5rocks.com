/**
 * Copyright 2012 Google Inc. All Rights Reserved.
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
 * @author mwichary@google.com (Marcin Wichary)
 */

var tester = {
  // If the number exceeds this in any way, we treat the label as active
  // and highlight it.
  VISIBLE_THRESHOLD: 0.1,

  // How far can a stick move on screen.
  STICK_OFFSET: 25,

  // How “deep” does an analogue button need to be depressed to consider it
  // a button down.
  ANALOGUE_BUTTON_THRESHOLD: .5,

  init: function() {
    tester.updateMode();
    tester.updateGamepads();
  },

  /**
   * Tell the user the browser doesn’t support Gamepad API.
   */
  showNotSupported: function() {
    document.querySelector('#no-gamepad-support').classList.add('visible');
  },

  /**
   * Update the mode (visual vs. raw) if any of the radio buttons were
   * pressed.
   */
  updateMode: function() {
    if (document.querySelector('#mode-raw').checked) {
      document.querySelector('#gamepads').classList.add('raw');
    } else {
      document.querySelector('#gamepads').classList.remove('raw');
    }
  },

  /**
   * Update the gamepads on the screen, creating new elements from the
   * template.
   */
  updateGamepads: function(gamepads) {
    var els = document.querySelectorAll('#gamepads > :not(.template)');
    for (var i = 0, el; el = els[i]; i++) {
      el.parentNode.removeChild(el);
    }

    var padsConnected = false;

    if (gamepads) {
      for (var i in gamepads) {
        var gamepad = gamepads[i];

        if (gamepad) {
          var el = document.createElement('li');

          // Copy from the template.
          el.innerHTML =
              document.querySelector('#gamepads > .template').innerHTML;

          el.id = 'gamepad-' + i;
          el.querySelector('.name').innerHTML = gamepad.id;
          el.querySelector('.index').innerHTML = gamepad.index;

          document.querySelector('#gamepads').appendChild(el);

          // Create extra elements for extraneous buttons.
          var extraButtonId = gamepadSupport.TYPICAL_BUTTON_COUNT;
          while (typeof gamepad.buttons[extraButtonId] != 'undefined') {
            var labelEl = document.createElement('label');
            labelEl.setAttribute('for', 'extra-button-' + extraButtonId);
            labelEl.setAttribute('description', 'Extra button');
            labelEl.setAttribute('access', 'buttons[' + extraButtonId + ']');
            el.querySelector('.extra-inputs').appendChild(labelEl);

            extraButtonId++;
          }

          // Create extra elements for extraneous sticks.
          var extraAxisId = gamepadSupport.TYPICAL_AXIS_COUNT;
          while (typeof gamepad.axes[extraAxisId] != 'undefined') {
            var labelEl = document.createElement('label');
            labelEl.setAttribute('for', 'extra-axis-' + extraAxisId);
            labelEl.setAttribute('description', 'Extra axis');
            labelEl.setAttribute('access', 'axes[' + extraAxisId + ']');
            el.querySelector('.extra-inputs').appendChild(labelEl);

            extraAxisId++;
          }

          padsConnected = true;
        }
      }
    }

    if (padsConnected) {
      document.querySelector('#no-gamepads-connected').classList.remove('visible');
    } else {
      document.querySelector('#no-gamepads-connected').classList.add('visible');
    }
  },

  /**
   * Update a given button on the screen.
   */
  updateButton: function(button, gamepadId, id) {
    var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

    var value, pressed;

    // Older version of the gamepad API provided buttons as a floating point
    // value from 0 to 1. Newer implementations provide GamepadButton objects,
    // which contain an analog value and a pressed boolean.
    if (typeof(button) == 'object') {
      value = button.value;
      pressed = button.pressed;
    } else {
      value = button;
      pressed = button > tester.ANALOGUE_BUTTON_THRESHOLD;
    }

    // Update the button visually.
    var buttonEl = gamepadEl.querySelector('[name="' + id + '"]');
    if (buttonEl) { // Extraneous buttons have just a label.
      if (pressed) {
        buttonEl.classList.add('pressed');
      } else {
        buttonEl.classList.remove('pressed');
      }
    }

    // Update its label.
    var labelEl = gamepadEl.querySelector('label[for="' + id + '"]');
    if (typeof value == 'undefined') {
      labelEl.innerHTML = '?';
    } else {
      labelEl.innerHTML = value.toFixed(2);

      if (value > tester.VISIBLE_THRESHOLD) {
        labelEl.classList.add('visible');
      } else {
        labelEl.classList.remove('visible');
      }
    }
  },

  /**
   * Update a given analogue stick on the screen.
   */
  updateAxis: function(value, gamepadId, labelId, stickId, horizontal) {
    var gamepadEl = document.querySelector('#gamepad-' + gamepadId);

    // Update the stick visually.

    var stickEl = gamepadEl.querySelector('[name="' + stickId + '"]');
    if (stickEl) { // Extraneous sticks have just a label.
      var offsetVal = value * tester.STICK_OFFSET;

      if (horizontal) {
        stickEl.style.marginLeft = offsetVal + 'px';
      } else {
        stickEl.style.marginTop = offsetVal + 'px';
      }
    }

    // Update its label.

    var labelEl = gamepadEl.querySelector('label[for="' + labelId + '"]');
    if (typeof value == 'undefined') {
      labelEl.innerHTML = '?';
    } else {
      labelEl.innerHTML = value.toFixed(2);

      if ((value < -tester.VISIBLE_THRESHOLD) ||
          (value > tester.VISIBLE_THRESHOLD)) {
        labelEl.classList.add('visible');

        if (value > tester.VISIBLE_THRESHOLD) {
          labelEl.classList.add('positive');
        } else {
          labelEl.classList.add('negative');
        }
      } else {
        labelEl.classList.remove('visible');
        labelEl.classList.remove('positive');
        labelEl.classList.remove('negative');
      }
    }
  }
};
