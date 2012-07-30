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
 * @fileoverview Lem doodle: Constants.
 *
 * @author sfdimino@google.com (Sophia Foster-Dimino) – graphics/animation
 * @author mwichary@google.com (Marcin Wichary) – code
 * @author jdtang@google.com (Jonathan Tang)
 * @author khom@google.com (Kristopher Hom)
 */

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
engine.SPRITE_PATH = 'images-sprited/lem-sprite-';

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
