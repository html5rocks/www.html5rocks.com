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
 * @fileoverview Doodle game engine: General constants.
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
 * Event action type (at time X or between time X and Y).
 * @const
 */
engine.ACTION_TYPE_EVENT = 1;

/**
 * Transition action type (special case of an action between time X and Y).
 * @const
 */
engine.ACTION_TYPE_TRANSITION = 2;

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
