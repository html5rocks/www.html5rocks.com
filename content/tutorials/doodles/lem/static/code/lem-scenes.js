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
 * @fileoverview Lem doodle: Scenes.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

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
      // then lands. This below is how we usually add actions to the timeline,
      // 300 is in milliseconds.
      engine.addActions({
        300: function() {
          if (engine.curSceneId == 'intro') {
            $a('bird').pickUpStartButton({
              onPickUp: function() {
                $a('bird').setTarget({ x: 180, y: 440, land: false });
                engine.addActions({
                  5000: function() {
                    // This and the subsequent action can be fired after
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
          // This and the subsequent action can be fired after
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

      engine.addActions({
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
      engine.addActions({
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
      engine.addActions({
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
          // moment the bird picks it up (it’s action-based, not time-based),
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

                  engine.addActions({
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
      engine.addActions({
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
      engine.addAction({
        startTime: engine.rangeRand({ min: 10000, max: 30000 }),
        onAction: function() { $a('satellite').startPassage(); }
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
      engine.addActions({
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

                                  engine.addActions({
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
      engine.addActions({
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

      engine.addActions({
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

                      engine.addActions({
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
      engine.addActions({
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
            engine.addAction({
              startTime: engine.rangeRand({ min: 2000, max: 3000 }),
              onAction: function() {
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

              engine.addActions({
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

      engine.addActions({
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

      engine.addActions({
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
            engine.addAction({
              startTime: engine.rangeRand({ min: 0, max: 1000 }),
              onAction: (function(i) {
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
      engine.addActions({
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
