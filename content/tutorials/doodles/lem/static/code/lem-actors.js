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

        this.setClickable({ clickable: this.interactive });
        this.setState({ state: this.interactive ? 'user' : 'looking-away' });
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
      if (this.footTappingAction) {
        engine.removeAction({ action: this.footTappingAction });
      }

      this.footTappingAction = engine.addAction({
        startTime: this.FOOT_TAPPING_DELAY,
        onAction: function() { $a('trurl').tapFoot(); }
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
      engine.addAction({
        startTime: engine.rangeRand({
            min: this.MIN_MOVEMENT_DELAY,
            max: this.MAX_MOVEMENT_DELAY
        }),
        onAction: function() { $a('cat').moveHead(); }
      });
    },

    /**
     * The cat will move its tail in a (randomized) while.
     */
    scheduleTailMovement: function() {
      engine.addAction({
        startTime: engine.rangeRand({
            min: this.MIN_MOVEMENT_DELAY,
            max: this.MAX_MOVEMENT_DELAY
        }),
        onAction: function() { $a('cat').moveTail(); }
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

      engine.addActions({
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
      engine.addActions({
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

      engine.addActions({
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

      engine.addActions({
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
                    engine.addActions({
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
      engine.addActions({
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
    NO_AUTO_HIDE: true,

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
        var el = document.getElementById('back-link');
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
            y: pos.top - engine.bodyPos.top - 32,
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
      engine.addAction({
        startTime: this.RANDOMIZE_DELAY,
        onAction: function() {
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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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

          engine.addActions({
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
          engine.addActions({
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

      engine.addActions({
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

      engine.addActions({
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

      engine.addActions({
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
      engine.addActions({
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

        engine.addActions({
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
            engine.addAction({
              startTime: delayBetween,
              onAction: function() {
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
          engine.addActions({
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
          engine.addActions({
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

          engine.addActions({
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

      engine.addActions({
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
        engine.addActions({
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

      engine.addActions({
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
    NO_AUTO_HIDE: true,

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

      engine.addActions({
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
      engine.addActions({
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
            engine.addActions({
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
      engine.addActions({
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

      engine.addActions({
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

              engine.addActions({
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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    NO_AUTO_HIDE: true,

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
    PLANE_CORRECTION: +2,
    NO_AUTO_HIDE: true,

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
      engine.addAction({
        startTime: 250,
        onAction: function() {
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
    NO_AUTO_HIDE: true,
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
        engine.addAction({
          startTime: this.FIRST_EXPLOSION_DELAY + i * timeDistance,
          onAction: function() {
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

      engine.addAction({
       startTime: speed * 5,
       onAction: function() {
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

      engine.addAction({
        startTime: this.TRANSITION_UP_TIME - 100,
        onAction: function() {
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
        engine.addAction({
          startTime: this.TRANSITION_UP_TIME,
          onAction: function() {
            $a('tooltip').showImage({
                innerId: 'hand',
                align: [engine.ALIGN_CENTER, engine.ALIGN_END],
                imageId: 'ui/tooltip-hand' });
          }
        });
      }

      engine.addAction({
        startTime: this.TRANSITION_UP_TIME + this.TRANSITION_DOWN_TIME,
        onAction: function() {
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
