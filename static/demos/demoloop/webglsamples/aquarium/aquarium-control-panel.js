tdl.require('tdl.clock');
tdl.require('tdl.fast');
tdl.require('tdl.io');
tdl.require('tdl.log');
tdl.require('tdl.math');
tdl.require('tdl.sync');

// globals
var math;                 // the math lib.
var fast;                 // the fast math lib.
var g_setSettingElements = [];
var g_numSettingElements = {};
var g_inactiveSeconds = 0;
var g_inactiveTimeout = 30;

var g_ui = [
  { obj: 'globals', label: 'Look Down - Up',               name: 'targetHeight',    value: 0,     max:  150 },
  { obj: 'globals', label: 'Move Down - Up',               name: 'eyeHeight',       value: 19,    max:  150 },
  { obj: 'globals', label: 'Distance from Center of Tank', name: 'eyeRadius',       value: 60,    max:  150 },
  { obj: 'globals', label: 'Field Of View',                name: 'fieldOfView',     value: 85,    max:  120, min: 1},
  { obj: 'globals', label: 'Fog Edge Sharpness',           name: 'fogPower',        value: 14.5,  max:  50},
  { obj: 'globals', label: 'Fog Amount',                   name: 'fogMult',         value: 1.66,  max:  10},
];

function markAsActive() {
  g_inactiveSeconds = 0;
}

function checkActivity() {
  ++g_inactiveSeconds;
  if (g_inactiveSeconds >= g_inactiveTimeout) {
    g_inactiveSeconds = 0;
    advanceViewSettings();
  }
}

/**
 * Initializes stuff.
 */
function initialize() {
  math = tdl.math;
  fast = tdl.fast;

  initializeCommon();

  setInterval(checkActivity, 1000);

  return true;
}

function updateUILocal(settings) {
  updateUI(settings);
  markAsActive();
}

$(function(){
  g.net.sync = true;

  AddUI(g_ui);
  $("#reset").button().click(function() {
    resetViewSettings();
  });
  $("#changeView").button().click(function() {
    advanceViewSettings();
  });
  $("#lasers").button().click(function() {
    setSettings({drawLasers: !g.drawLasers});
  });
  $("#fish250").button().click(function() {
    setSettings({globals:{ fishSetting: 4}});
  });
  $("#fish1000").button().click(function() {
    setSettings({globals:{ fishSetting: 6}});
  });

  g_syncManager = new tdl.sync.SyncManager(g, updateUILocal);

  var div = document.getElementById("contentOuter");
  div.onmousedown = function() { return false; };
  div.onstartselect = function() { return false; };

  initialize();
});


