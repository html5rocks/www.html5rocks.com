// Copyright 2011 Google Inc. All Rights Reserved.

/**
 * @fileoverview Lem doodle: Scenes.
 *
 * @author mwichary@google.com (Marcin Wichary)
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
  {
    id: 'pre',
    onEnter: function() {
      engine.preloadImageSet({ id: 'all-levels' });
      engine.preloadImageSet({ id: 'level-2-1' });
      engine.preloadImageSet({ id: 'level-2-2' });
      engine.preloadImageSet({ id: 'level-2-3' });
      engine.preloadImageSet({ id: 'level-2-4' });
      engine.preloadImageSet({ id: 'level-2-5' });

      engine.addTransition({
        duration: 10, properties: {
            height: engine.EXPANDED_HEIGHT } });

      engine.goToNextScene();      
    }
  },
  {
    id: 'level-2',
    interactive: false,
    onEnter: function() {
      $a('ground').transform({
          x: 0, y: engine.EXPANDED_HEIGHT - engine.GROUND_HEIGHT });
      $a('sky').setStyle({ speed: 30, opacity: .8 });
      $a('mountains').transform({ x: 0, y: 362 });
      $a('bk-mountains').transform({ x: 0, y: 362 });
      $a('bird').transform({ x: 180, y: 350 });
      $a('start-button').transform({ x: 180, y: 380 });
      $a('trurl').transform({ x: 350, y: 457 });
      $a('trurl').setVisible({ visible: true });
      $a('trurl').setState({ state: 'looking-away' });
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

      $a('mask-small').transform({ innerId: 'left', x: -20 });
      $a('mask-small').transform({
          innerId: 'right', x: engine.INITIAL_WIDTH - 36 + 20 });
      
      $a('bk-mountains').addTransition({
          duration: 1,
          properties: {
              relX: -75000 * engine.BK_MOUNTAINS_MULTIPLIER } });
      $a('mountains').addTransition({
          duration: 1,
          properties: {
              relX: -75000 * engine.MOUNTAINS_MULTIPLIER } });
      
      
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
       duration: 1, properties: { scrollX: -770 } });

      $a('demonbot-ui').addTransition({
        duration: 1, properties: { x: 78 } });
      $a('demonbot-ui-top').addTransition({
        duration: 1, properties: { x: 78 + 235 } });
      
      
      $a('demonbot').transform({ x: engine.OFFSCREEN_RIGHT, y: 10 });
      $a('demonbot').setVisible({ visible: true });
      $a('demonbot').startWavingLeftHand();
      $a('demonbot').addTransition({
        duration: 1, properties: { x: -260 } });
              
      $a('sky').setStyle({ speed: 300, opacity: .95 });

      $a('bird').setTarget({ x: 300, y: 140, land: false });

      engine.addEvents({
        100: function() {
          var actor = $a('demonbot-ui');
          $a('demonbot-ui-extension-1').transform({
              x: actor.rect.x + 240, y: actor.rect.y - 3 });
          $a('demonbot-ui-extension-1').setVisible({ visible: true });

          $a('demonbot-ui-extension-1').addTransition({
              duration: 1,
              easing: engine.backEaseInOut,
              properties: { relY: -37 } });

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
          
          $a('demonbot-ui').showOutput();          
          
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
        }
      });
      
      $a('satellite').startPassage();
    }
  }
];
