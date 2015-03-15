tdl.require('tdl.fast');
tdl.require('tdl.io');
tdl.require('tdl.log');
tdl.require('tdl.math');
tdl.require('tdl.screenshot');
tdl.require('tdl.sync');

// globals
var math;                 // the math lib.
var fast;                 // the fast math lib.
var g_syncManager;

var g_viewSettingsIndex = 0;
var g_getCount = 0;
var g_putCount = 0;

var g_viewSettings = [
  // Inside 1
  {
    targetHeight: 63.3,
    targetRadius: 91.6,
    eyeHeight: 7.5,
    eyeRadius: 13.2,
    eyeSpeed: 0.0258,
    fieldOfView: 82.699,
    ambientRed: 0.218,
    ambientGreen: 0.502,
    ambientBlue: 0.706,
    fogPower: 16.5,
    fogMult: 1.5, //2.02,
    fogOffset: 0.738,
    fogRed: 0.338,
    fogGreen: 0.81,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 0.796
  },
  // Outside 1
  {
    targetHeight: 17.1,
    targetRadius: 69.2,
    eyeHeight: 59.1,
    eyeRadius: 124.4,
    eyeSpeed: 0.0258,
    fieldOfView: 56.923,
    ambientRed: 0.218,
    ambientGreen: 0.246,
    ambientBlue: 0.394,
    fogPower: 27.1,
    fogMult: 1.46,
    fogOffset: 0.53,
    fogRed: 0.382,
    fogGreen: 0.602,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 1
  },
  // Inside Original
  {
    targetHeight: 0,
    targetRadius: 88,
    eyeHeight: 38,
    eyeRadius: 69,
    eyeSpeed: 0.0258,
    fieldOfView: 64,
    ambientRed: 0.218,
    ambientGreen: 0.246,
    ambientBlue: 0.394,
    fogPower: 16.5,
    fogMult: 1.5, // 2.02,
    fogOffset: 0.738,
    fogRed: 0.338,
    fogGreen: 0.81,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 0.796
  },
  // Outside Original
  {
    targetHeight: 72,
    targetRadius: 73,
    eyeHeight: 3.9,
    eyeRadius: 120,
    eyeSpeed: 0.0258,
    fieldOfView: 74,
    ambientRed: 0.218,
    ambientGreen: 0.246,
    ambientBlue: 0.394,
    fogPower: 27.1,
    fogMult: 1.46,
    fogOffset: 0.53,
    fogRed: 0.382,
    fogGreen: 0.602,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 1
  },
  // Center for LG
  {
    targetHeight: 24,
    targetRadius: 73,
    eyeHeight: 24,
    eyeRadius: 0,
    eyeSpeed: 0.06,
    fieldOfView: 60,
    ambientRed: 0.22,
    ambientGreen: 0.25,
    ambientBlue: 0.39,
    fogPower: 14.5,
    fogMult: 1.3, //1.66,
    fogOffset: 0.53,
    fogRed: 0.54,
    fogGreen: 0.86,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 0.8
  },
  // Outside for LG
  {
    targetHeight: 20,
    targetRadius: 127,
    eyeHeight: 39.9,
    eyeRadius: 124,
    eyeSpeed: 0.06,
    fieldOfView: 24,
    ambientRed: 0.22,
    ambientGreen: 0.25,
    ambientBlue: 0.39,
    fogPower: 27.1,
    fogMult: 1.2, //1.46,
    fogOffset: 0.53,
    fogRed: 0.382,
    fogGreen: 0.602,
    fogBlue: 1,
    refractionFudge: 3,
    eta: 1,
    tankColorFudge: 1
  }
];

var g = {
  globals: {
    fishSetting: 2,
    drawLasers: false
  },
  net: {
    timeout: 3000,
    fovMult: 1.21,
    rotYMult: 0,
    offsetMult: 1.0,
    offset: [0, 0, 0],
    port: 8080
  },
  fish: {},
  innerConst: {},
  options: {
    normalMaps: { enabled: false, text: 'Normal Maps' },
    reflection: { enabled: false, text: 'Reflection' },
    tank:       { enabled: true,  text: 'Tank' },
    museum:     { enabled: true,  text: 'Museum' },
    fog:        { enabled: true,  text: 'Fog' },
    bubbles:    { enabled: true,  text: 'Bubbles' },
    lightRays:  { enabled: true,  text: 'Light Rays' }
  }
};

var g_uiWidgets = {};

function Log(msg) {
  if (g_logGLCalls) {
    tdl.log(msg);
  }
}

function getScriptText(id) {
  //tdl.log("loading: ", id);
  var elem = document.getElementById(id);
  if (!elem) {
    throw 'no element: ' + id
  }
  return elem.text;
}

function updateUI(settings) {
  function updateUIInner(obj, dst) {
    for (var name in obj) {
      var value = obj[name];
      if (typeof value == 'object') {
        var newDst = dst[name];
        if (newDst) {
          updateUIInner(value, newDst);
        }
      } else {
        var elem = dst[name];
        if (elem) {
          var newValue = Math.floor(value * 1000);
          var oldValue = $(elem).slider("value");
          if (newValue != oldValue) {
            //tdl.log("set:", oldValue, newValue);
            $(elem).slider("value", newValue);
          }
        }
      }
    }
  }
  updateUIInner(settings, g_uiWidgets);
}

function setViewSettings(index) {
  function setGlobal(name, value) {
    $(g_uiWidgets.globals[name]).slider("value", value * 1000);
    g.globals[name] = value;
  }

  var viewSettings = g_viewSettings[index];
  setSettings({globals: viewSettings})
}

function advanceViewSettings() {
  g_viewSettingsIndex = (g_viewSettingsIndex + 1) % g_viewSettings.length;
  setViewSettings(g_viewSettingsIndex);
}

function resetViewSettings() {
  setViewSettings(g_viewSettingsIndex);
}

/**
 * Sets the count
 */
function setSetting(elem, id) {
  switch (id) {
  case 8:
    break;
  case 7:
    advanceViewSettings();
    break;
  default:
    g_numSettingElements[id] = elem;
    setSettings({globals:{fishSetting:id}});
    for (var otherElem in g_numSettingElements) {
      g_numSettingElements[otherElem].style.color = "gray";
    }
    elem.style.color = "red";
  }
}

/**
 * Initializes stuff.
 */
function initializeCommon() {
  if (g.net.sync) {
    var server = window.location.href.match(/\/\/(.*?)\//)[1];
    tdl.log("server:", server);
    g.net.server = server;
    g_syncManager.init(g.net.server, g.net.port, g.net.slave);
    if (!g.net.slave) {
      g_viewSettingsIndex = 4;
      setViewSettings(g_viewSettingsIndex);
    }
  }

  return true;
}

var g_event;

function getParamId(id) {
  return id.substr(6).replace(/(\w)/, function(m) {return m.toLowerCase() });
}

function setParam(event, qui, ui, obj, valueElem) {
  var id = event.target.id;
  var value = qui.value / 1000;
  valueElem.innerHTML = value;
  var inner = {}
  var settings = {};
  settings[ui.obj] = inner;
  inner[ui.name] = value;
  setSettings(settings);
}

function getUIValue(obj, id) {
  return obj[id] * 1000;
}

function setupSlider($, elem, ui, obj) {
  var textDiv = document.createElement('div');
  var labelDiv = document.createElement('span');
  labelDiv.appendChild(document.createTextNode(ui.label || ui.name));
  var valueDiv = document.createElement('span');
  valueDiv.appendChild(
      document.createTextNode(getUIValue(obj, ui.name) / 1000));
  valueDiv.style.float = "right";
  var sliderDiv = document.createElement('div');
  sliderDiv.id = ui.name;
  textDiv.appendChild(labelDiv);
  textDiv.appendChild(valueDiv);
  elem.appendChild(textDiv);
  elem.appendChild(sliderDiv);
  if (!g_uiWidgets[ui.obj]) {
    g_uiWidgets[ui.obj] = { };
  }
  g_uiWidgets[ui.obj][ui.name] = sliderDiv;
  $(sliderDiv).slider({
    range: false,
    step: 1,
    max: ui.max * 1000,
    min: (ui.min || 0) * 1000,
    value: getUIValue(obj, ui.name),
    slide: function(event, qui) { setParam(event, qui, ui, obj, valueDiv); }
  });
}

function AddUI(uiObj) {
  var uiElem = document.getElementById('ui');
  for (var ii = 0; ii < uiObj.length; ++ii) {
    var ui = uiObj[ii];
    var obj = g[ui.obj];
    obj[ui.name] = ui.value;
    var div = document.createElement('div');
    setupSlider($, div, ui, obj);
    uiElem.appendChild(div);
  }
}

function setSettings(settings) {
  g_syncManager.setSettings(settings);
}



