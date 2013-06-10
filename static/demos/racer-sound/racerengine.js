
var xmlLink = "../../../../static/demos/racer-sound/config.xml";
var mp3link = "../../../../static/audio/racer-sound/";
var _throttle = 0;
var _throttleVal = 0;
var _playing = false;
var _throttleId;
var _ready = false;
SCSound.initialize(xmlLink, mp3link, null, soundsLoaded, null, null);

function soundsLoaded() {
	_ready = true;
}
function playStop() {
	if (!_ready) return;
	if (_playing) {
		_playing = false;
		stopThrottle();
	}else {
		_playing = true;
		startThrottle();
	}	
}
function startThrottle() {
	if (!_ready) return;
	SCSound.send("new_engine");
	_throttleId = setInterval(doThrottle, 20); 
}
function stopThrottle() {
	if (!_ready) return;
	SCSound.send("stop_engine");
	clearInterval(_throttleId);
}
function doThrottle() {
	if (_throttle<1 || _throttleVal < 0) {
		_throttle += _throttleVal;
	}
	if (_throttle > 1) _throttle = 1;
	if (_throttle < 0 ) _throttle = 0;
}
function throttleOn() {
	_throttleVal = 0.02;
	SCSound.send("throttle_on", 0, _throttle);
}
function throttleOff() {
	_throttleVal = -0.02;
	SCSound.send("throttle_off");
}