var SCSound = {
	isReady: false,
	isInited: false,
	webaudio: false,
	debug: false,
	doLog: false,
	disable: false,
	self:this,
	dummyConsole:{  
	    log : function(){},  
	},
	log:this.dummyConsole,
	/**
	 * Initializes sound engine
	 * @param {string} link to config.xml
	 * @param {string} link to mp3 folder
	 * @param {string} link to swfs folder
	 * @param {function} ready callback
	 * @param {function} progress callback
	 */
	initialize: function(xmlLink, mp3Link, swfLink,  f, p, l) {
		SCSound.progress = p; SCSound.callback = f; SCSound.xmlPath = xmlLink; SCSound.soundPath = mp3Link; SCSound.swfLink = swfLink; SCSound.libLoaded = l;
		var testFlash = false;
		if (SCSound.disable) {
			SCSound.callback(false);
		}
		if (testFlash) {
			SCSound.webaudio = false;
			SCSound.initFlash();
			return false;
		}
		if (SCSound.doLog && window.console !== undefined) {
			SCSound.console = window.console;
			SCSound.console.log("scsound log mode");
		}else {
			SCSound.console = SCSound.dummyConsole;
		}
		if (typeof webkitAudioContext !== "undefined") {
			SCSound.webaudio = true;
			SCSound.initWebAudio();
		} else {
			SCSound.webaudio = false;
			SCSound.initWebAudio();
			//Instead of init flash version we disable the sounds so we don't break android version.
			//SCSound.initFlash();
			//SCSound.disable = true;
		}
		SCSound.isInited = true;
	},
	/**
	 *  Loads and Initializes flash fallback
	 */
	initFlash: function() {
		/** Creates a div to load flash swf */
		var soundDIV = document.createElement('div');
		soundDIV.setAttribute('id', 'soundcontroller');
		document.body.appendChild(soundDIV);
		if (swfobject.hasFlashPlayerVersion("9.0.0")) {
			/** Vars needed to load Flash version */
			if (SCSound.debug) {
				window.location="assets/swfs/Main.swf";
			}
			var flashvars = {
				scDeployPath: SCSound.swfLink + "SCDeploy.swf",
				configXmlPath: SCSound.xmlPath,
				soundFolderPath: SCSound.swfLink
			};
			/** swfObject params */
			var params = {
				allowScriptAccess: "always"
			};
			/** id for div */
			var attributes = {
				id: "soundcontroller"
			};
			/** embed swf */
			swfobject.embedSWF(SCSound.swfLink + "scjs.swf", "soundcontroller", "1", "1", "9.0.0", "", flashvars, params, attributes, function(event) {
				SCSound.flashEmbeddedHandler(event.success);
			});
		} else {
			SCSound.console.log("Flash not available");
			SCSound.disable = true;
			SCSound.callback(false);
		}
	},
	/**
	 *  Initializes Web Audio Version.
	 */
	initWebAudio: function() {
		SCSound.Core.EventBus = new SCSound.Core.EventBusClass();
		SCSound.htmlAudio = true;
		SCSound.Core.EventBus.addEventListener("SCLoadProgress", function(event, percentLoaded) {
			SCSound.receive("scsound_progress", percentLoaded, "sounds_0.swf");
		}, self);
		SCSound.Core.EventBus.addEventListener("scsound_complete", function(event, percentLoaded, fakeName) {
			SCSound.receive("scsound_complete", percentLoaded, fakeName);
		}, self);
		/** initializes web audio engine. Links to xml and folder with mp3s.*/
		SCSound.sc = new SCSound.Core.SoundController(SCSound.xmlPath, SCSound.soundPath, function() {
			SCSound.receive("scsound_ready", 1, "");
			/** Only for debugging*/
			if (SCSound.debug) {
				var oHead = document.getElementsByTagName("head")[0];
				var oScript = document.createElement('script');
				oScript.type = 'text/javascript';
				oScript.src = "scdebug.js";
				oScript.onload = function() {
					scdebug.init();
				};
				if (scdebug) {
					scdebug.init();
				}
				oHead.appendChild(oScript);
			}
		});
	},
	/**
	 * Called by SWFObject when our sound SWF has finished
	 * embedding, or failed to embed.
	 *
	 * @param success {Boolean} true if the sound SWF was
	 * embedded successfully, false if not
	 */
	flashEmbeddedHandler: function(success) {
		if (success) {
			//swf embedded
			SCSound.hasSWF = true;
		} else {
			//Failed to embed swf
			SCSound.callback(false);
		}
	},
	/**
	 * Sends an event to Flash, usually to initiate playback
	 * of audio but may also be used for functional calls
	 * such as toggling mute or changing volume.
	 *
	 *  @param eventName {String} The event type to send to Flash.
	 *  @param _args Params to send along to flash (optional).
	 */
	send: function(eventName, _args) {
		if (SCSound.disable) return;
		SCSound.console.log(eventName);
		var args = Array.prototype.slice.call(arguments);
		if (args.length>1) {
			args.splice(0,1);
		}else {
			args = [];
		}

		SCSound.sc.trig(eventName, args);
		if (SCSound.webaudio) {
			//SCSound.sc.trig(eventName, args);
		} else if (SCSound.hasSWF) {
			if (swfobject.hasFlashPlayerVersion("9.0.0")) {
				if (typeof args == "undefined" || args.length == 0) {
					document.getElementById('soundcontroller').sendToActionScript(eventName);
				} else {
					document.getElementById('soundcontroller').sendToActionScript(eventName, args);
				}
			}
		}

	},
	setListenerPosition: function(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
		if (!SCSound.webaudio) return;
		SCSound.sc.setListenerPosition(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
		//SCSound.console.log("listener", cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
	},
	setPannerPosition: function(eventName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
		SCSound.sc.setPannerPosition(eventName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
		//SCSound.console.log(eventName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
	},
	/**
	 * Called whenever an event is sent from Flash to
	 * JavaScript.
	 *
	 * @param value {String} The event type that was
	 * dispatched from Flash.
	 */
	receive: function(value, percentLoaded, lib) {
		//SCSound.hasSWF = true;
		if (value == "scsound_ready" || value == 'soundcontroller_loaded') {
			// Flag that sound is now ready to be played
			SCSound.isReady = true;
			SCSound.callback(true);
		}
		//Sound loading progress
		if (value == "scsound_progress" && lib == 0) {
			SCSound.progress(percentLoaded);
		}
		if (value == "scsound_complete") {
			/*var s = swfName.split("sounds_");
			var n = s[1].split(".swf");*/
			var libNbr = lib;
			if (SCSound.libLoaded) {
				SCSound.libLoaded(libNbr);
				if (SCSound.onLibLoaded) {
					SCSound.onLibLoaded(libNbr);
				}
				SCSound.console.log("Sounds loaded:", libNbr);
			}
		}
	}
};
SCSound.Core = {};

/** Receives events from Flash version
* @param {String} eventName
* @param {number} loadProgress
* @param {String} name of loaded swf
*/
function sendToJavaScript(value, percentLoaded, swfName) {
	SCSound.receive(value, percentLoaded, swfName);
}
/**
 * Main sound engine class
 * @param {string} link to config.xml
 * @param {string} link to mp3s folder
 * @param {function} ready callback
 * @constructor
 */
SCSound.Core.SoundController = function(xmlPath, soundPath, initCallback) {
	this.initCallback = initCallback;
	this.xmlPath = xmlPath;
	if (SCSound.webaudio) {
		this.init();
	}else {
		this.initHTMLVersion();
	}
	this.soundPath = soundPath;
};
SCSound.Core.SoundController.prototype = {
	/** Initializes SoundController */
	init: function() {
		/** Web Audio Context */
		this.context = new webkitAudioContext();
		this.listener = this.context.listener;
		this.master = this.context.createGainNode();
		this.compressor = this.context.createDynamicsCompressor();
		this.startVolume = 1;
		this.master.gain.value = this.startVolume;
		this.master.connect(this.context.destination);
		//this.compressor.connect(this.context.destination);
		//this.compressor.treshold = -20;
		//this.compressor.attack = 1;
		//this.compressor.release = 250;
		//this.compressor.ratio = 4;
		//this.compressor.knee = 5;
		//this.master.connect(this.compressor);
		this.groups = {};
		this.sounds = {};
		this.arrangements = {};
		this.bufferList = {};
		this.soundObjects = {};
		this.soundNames = [];
		this.eventTriggers = {};
		this.sequencers = {};
		this.busses = {};
		this.total = [];
		this.totalLoaded = 0;
		this.autoload = {};
		this.loadXML();
		SCSound.Core.SoundController.bufferList = this.bufferList;
		SCSound.Core.SoundController.context = this.context;
		SCSound.Core.SoundController.master = this.master;
		SCSound.Core.SoundController.compressor = this.compressor;
		SCSound.Core.busses = this.busses;
		this.loadCount = 0;
		this.loadingLibs = {};
	},
	initHTMLVersion: function () {
		this.groups = {};
		this.sounds = {};
		this.arrangements = {};
		this.bufferList = {};
		this.soundObjects = {};
		this.soundNames = [];
		this.eventTriggers = {};
		this.sequencers = {};
		this.busses = {};
		this.total = [];
		this.totalLoaded = 0;
		this.autoload = {};
		this.loadXML();
		SCSound.Core.SoundController.bufferList = this.bufferList;
		SCSound.Core.SoundController.context = this.context;
		SCSound.Core.SoundController.master = this.master;
		SCSound.Core.SoundController.compressor = this.compressor;
		SCSound.Core.busses = this.busses;

		SCSound.audioSprite = undefined;
		SCSound.audioTag = new Audio();
	},
	/** Loads XML */
	loadXML: function() {
		var that = this;
		var xmlhttp, txt, xx, x, i;
		if (window.XMLHttpRequest) {
			xmlhttp = new XMLHttpRequest();
		} else {
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var xml = xmlhttp.responseXML;
				that.parseXML(xml);
			}
		}
		xmlhttp.open("GET", that.xmlPath, true);
		xmlhttp.send();
	},
	/** Loads XML 
	* @param {xml} xml file to parse
	*/
	parseXML: function(xml) {
		var that = this;
		var files = xml.getElementsByTagName("file");
		for (var i = 0; i < files.length; i++) {
			var name = files[i].childNodes[0].nodeValue.split(".");
			var autoload = files[i].getAttribute("autoload");
			var filesize = files[i].getAttribute("fileSize");
			SCSound.sc.total[i] = filesize;
			var n = name[0].split("sounds_");
			var a = n[1];
			if (autoload == "1") {
				that.autoload[a] = true;
				that.autoSwfNr = a;
			} else {
				that.autoload[a] = false;
			}
		}
		var busnodes = xml.getElementsByTagName("bus");
		for (var j = 0; j < busnodes.length; j++) {
			var bus = {
				name: busnodes[j].getAttribute("name"),
				parent: busnodes[j].getAttribute("parent"),
				volume: busnodes[j].getAttribute("volume"),
				panX: busnodes[j].getAttribute("pan"),
				panY: busnodes[j].getAttribute("panY"),
				panZ: busnodes[j].getAttribute("panZ"),
				refDistance: busnodes[j].getAttribute("refDistance"),
				group: busnodes[j].getAttribute("groupName")
			};
			
			if (bus.panX == null) {
				bus.pan = false;
			}else {
				bus.pan = false;
				if (bus.panY == null) bus.panY = 0;
				if (bus.panZ == null) bus.panZ = 0;
				if (bus.refDistance == null) bus.refDistance = 1;
			}
			var b = new SCSound.Core.Bus(bus.name, bus.volume, bus.parent, bus.panX, bus.panY, bus.panZ, bus.pan, bus.refDistance, bus.group);
			that.busses[bus.name] = b;
		}
		var groupnodes = xml.getElementsByTagName("group");
		var hasChildren = groupnodes.length > 0;
		if (hasChildren) {
			for (var k = 0; k < groupnodes.length; k++) {
				var name = groupnodes[k].getAttribute("name");
				var volume = groupnodes[k].getElementsByTagName("volume")[0].childNodes[0].nodeValue;
				var inserts = [];
				var sends = [];
				var effectnodes = groupnodes[k].getElementsByTagName("effect");
				for (var l = 0; l < effectnodes.length; l++) {
					var fx = {};
					var fxHasChildren = effectnodes[l].getElementsByTagName('param').length > 0;
					if (fxHasChildren) {
						fx.effectId = effectnodes[l].getAttribute("id");
						fx.effectInstance = effectnodes[l].getAttribute("instance");
						fx.effectType = effectnodes[l].getAttribute("type");
						fx.params = {};
						var paramnodes = effectnodes[l].getElementsByTagName('param');
						for (var m = 0; m < paramnodes.length; m++) {
							var key = paramnodes[m].getAttribute("key");
							var val = paramnodes[m].getAttribute("value");
							fx.params[key] = val;
						}
						if (fx.effectType == "insert") {
							inserts.push(fx);
						} else if (fx.effectType == "send") {
							sends.push(fx);
						}
					}
				}
				var group = new SCSound.Core.Group(volume, inserts, sends);
				that.groups[name] = group;
			}
		}
		var soundnodes = xml.getElementsByTagName("soundData")[0].childNodes;
		for (var n = 0; n < soundnodes.length; n++) {
			if (soundnodes[n].nodeName == "sound") {
				var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
				var stringLength = "1000";
				if (soundnodes[n].getElementsByTagName("length")[0]) {
					stringLength = soundnodes[n].getElementsByTagName("length")[0].childNodes[0].nodeValue;
				}
				var l = null;
				if (soundnodes[n].getElementsByTagName("load")[0]) {
					l = soundnodes[n].getElementsByTagName("load")[0].childNodes[0].nodeValue;
				}else {
					l = null;
				}
				var load = that.autoSwfNr;
				if (l) {
					load = l;
				}
				var length;
				if (stringLength.indexOf(",") > -1) {
					var lengthArr = stringLength.split(",");
					length = that.beatToMilliseconds(lengthArr[0], lengthArr[1]) / 1000;
				} else {
					length = stringLength / 1000;
				}
				var audioSprite = false;
				var start = 0;
				var duration = 0;
				var source = null;
				if (soundnodes[n].getElementsByTagName("start")[0]) {
					start = parseFloat(soundnodes[n].getElementsByTagName("start")[0].childNodes[0].nodeValue)/1000;
					duration = parseFloat(soundnodes[n].getElementsByTagName("duration")[0].childNodes[0].nodeValue)/1000;
					source = soundnodes[n].getElementsByTagName("src")[0].childNodes[0].nodeValue;
					audioSprite = true;
				}
				that.soundNames.push(name);
				var s = new SCSound.Core.Sound(name, length, "");
				s.load = load;
				s.audioSprite = audioSprite
				if (audioSprite) {
					s.start = (start/44.1);
					//s.start = start;
					s.source = source;
					s.duration = (duration/44.1)-0.02612;
					//s.duration = duration;
				}
				that.sounds[name] = s;
			} else if (soundnodes[n].nodeName == "soundObject") {
				var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
				var mode = soundnodes[n].getElementsByTagName("mode")[0].childNodes[0].nodeValue;
				var volume = soundnodes[n].getElementsByTagName("volume")[0].childNodes[0].nodeValue;
				var pan = soundnodes[n].getElementsByTagName("pan")[0].childNodes[0].nodeValue;
				var loop = soundnodes[n].getElementsByTagName("loop")[0].childNodes[0].nodeValue;
				var groupName = "";
				if (soundnodes[n].getElementsByTagName("groupName").length > 0) {
					groupName = soundnodes[n].getElementsByTagName("groupName")[0].childNodes[0].nodeValue;
				}
				var min;
				var max;
				if (soundnodes[n].getElementsByTagName("min").length > 0) {
					min = soundnodes[n].getElementsByTagName("min")[0].childNodes[0].nodeValue;
					max = soundnodes[n].getElementsByTagName("max")[0].childNodes[0].nodeValue;
				}
				var loopStart;
				var loopEnd;
				if (mode === "loop" && soundnodes[n].getElementsByTagName("loopStart")[0] !=undefined) {
					loopStart = soundnodes[n].getElementsByTagName("loopStart")[0].childNodes[0].nodeValue;
					loopEnd = soundnodes[n].getElementsByTagName("loopEnd")[0].childNodes[0].nodeValue;
				}
				var parentBus = soundnodes[n].getElementsByTagName("parentBus")[0].childNodes[0].nodeValue;
				var soSoundNames = [];
				var offsets = [];
				var hasUpbeat = false;
				var maxUpbeat = 0;
				var snodes = soundnodes[n].getElementsByTagName("sound");
				for (var o = 0; o < snodes.length; o++) {
					var sound = snodes[o].childNodes[0].nodeValue;
					var stringOffset = snodes[o].getAttribute("offset");
					var offset;
					if (stringOffset.indexOf(",") > -1) {
						var offsetArr = stringOffset.split(",");
						offset = that.beatToMilliseconds(offsetArr[0], offsetArr[1]) / 1000;
					} else {
						offset = stringOffset / 1000;
					}
					if (offset < 0) {
						hasUpbeat = true;
						if (offset < maxUpbeat) {
							maxUpbeat = offset;
						}
					}
					soSoundNames.push(sound);
					offsets.push(offset);
				}
				var so = new SCSound.Core.SoundObject([], offsets);
				so.hasUpbeat = hasUpbeat;
				so.upbeatTime = maxUpbeat;
				so.soundNames = soSoundNames;
				so.name = name;
				so.mode = mode;
				so.volume = volume;
				if (SCSound.webaudio) {
					so.gainNode.gain.value = so.volume;
				}
				so.parentBus = parentBus;
				if (loopStart) {
					so.loopStart = loopStart;
					so.loopEnd = loopEnd;
				}
				if (loop == "1") {
					so.loop = true;
				} else {
					so.loop = false;
				}
				if (groupName) {
					so.group = that.groups[groupName];
				}
				if (min) {
					so.min = min;
					so.max = max;
				}
				that.soundObjects[name] = so;
			} else if (soundnodes[n].nodeName == "arrangement") {
				var name = soundnodes[n].getElementsByTagName("name")[0].childNodes[0].nodeValue;
				var domain = soundnodes[n].getElementsByTagName("domain")[0].childNodes[0].nodeValue;
				var sos = [];
				var sonodes = soundnodes[n].getElementsByTagName("soundObject");
				if (soundnodes[n].getElementsByTagName("tempo").length > 0) {
					var tempo = soundnodes[n].getElementsByTagName("tempo")[0].childNodes[0].nodeValue;
				}
				for (var p = 0; p < sonodes.length; p++) {
					var so = sonodes[p].childNodes[0].nodeValue;
					sos.push(so);
				}
				var arr = new SCSound.Core.Arrangement(name, domain);
				if (tempo) arr.tempo = tempo;
				arr.soundObjectNames = sos;
				that.arrangements[name] = (arr);
			}
		}
		var actionnodes = xml.getElementsByTagName("action");
		for (var q = 0; q < actionnodes.length; q++) {
			var event = actionnodes[q].getElementsByTagName("event")[0].childNodes[0].nodeValue;
			var trigger = {
				event: event
			};
			var targets = [];
			var targetnodes = actionnodes[q].getElementsByTagName("target");
			for (var r = 0; r < targetnodes.length; r++) {
				var action = targetnodes[r].getAttribute("id");
				var target = {
					action: action
				};
				var args = [];
				var argnodes = targetnodes[r].getElementsByTagName("arg");
				for (var s = 0; s < argnodes.length; s++) {
					if (argnodes[s].getAttribute("id")) {
						var key = argnodes[s].getAttribute("key");
						var value = argnodes[s].getAttribute("value");
						if (args[key] == undefined) {
							args[key] = [];
							args[key].push(value);
						} else {
							args[key].push(value);
						}
					} else {
						var key = argnodes[s].getAttribute("key");
						var value = argnodes[s].getAttribute("value");
						args[key] = value;
					}
				}
				target.args = args;
				targets.push(target);
			}
			trigger.targets = targets;
			that.eventTriggers[event] = trigger;
		}
		var al = false;
		for (var l in that.autoload) {
			if (that.autoload[l]) {
				al = true;
				that.loadSounds(0, "auto");
			}
		}
		if (!al) {
			that.initSC("auto");
		}
	},
	/** 
	* Load sounds 
	* @param {int} sound id
	* @param {string} load mode
	*/
	loadSounds: function(i, load) {
		var that = this;
		var lib;
		//console.log("loadSounds", i,  that.soundNames.length, that.soundNames[i]);
		if (i != that.soundNames.length) {
			if (that.sounds[that.soundNames[i]].audioSprite && !SCSound.webaudio || SCSound.webaudio && that.sounds[that.soundNames[i]].load === "-1") {
				that.loadSounds(i + 1, load);
				return;

			}else if (that.sounds[that.soundNames[i]].load == "audiotag") {
				if (!SCSound.webaudio) {
					var format;
					if (document.createElement('audio').canPlayType('audio/mpeg')) {
						format = ".mp3";
					}else if (document.createElement('audio').canPlayType('audio/ogg')) {
						format = ".ogg";
					}
					SCSound.audioSprite = new SCSound.AudioSprite(this.soundPath+ that.soundNames[i] + format);
					that.initSC(load);					
				}
				that.loadSounds(i + 1, load);
				
				return;

			}else if (that.sounds[that.soundNames[i]].load == "stream") {
				//var audio = new Audio();
				//audio.src = this.soundPath+ that.soundNames[i] + ".mp3";
				//audio.preload = "none";
				that.bufferList[that.soundNames[i]] = SCSound.audioTag;
				that.loadSounds(i + 1, load);
				return;
			}else if (load == "auto" && that.autoload[that.sounds[that.soundNames[i]].load] == false) {
				that.loadSounds(i + 1, load);
				return;
			} else if (load != "auto" && load != that.sounds[that.soundNames[i]].load) {
				that.loadSounds(i + 1, load);
				return;
			}
			if (!SCSound.webaudio) return;
			that.loadCount ++;
			that.loadSounds(i + 1, load);
			lib = that.sounds[that.soundNames[i]].load;
			if (!that.loadingLibs[lib]) {
				that.loadingLibs[lib] = true;
			}
			var format;
			if (that.soundNames[i].indexOf(".")> -1) {
				format = "";
			}else {
				format = ".mp3";
			}
			
			var url = that.soundPath + that.soundNames[i] + format;
			var request = new XMLHttpRequest();
			request.open("GET", url, true);
			request.responseType = "arraybuffer";
			request.addEventListener("progress", function (evt) {
				if (evt.lengthComputable) {
					var percentComplete = (that.totalLoaded + evt.loaded) / that.total[lib];
					if (evt.loaded / evt.total == 1) {
						that.totalLoaded += evt.loaded;
						//SCSound.console.log(that.totalLoaded);
					}
					SCSound.Core.EventBus.dispatch("SCLoadProgress", this, percentComplete);
				}
			}, false);
			
			request.onload = function() {
				
				that.context.decodeAudioData(
		            request.response,
		            function(buffer) {
		                if (!buffer) {
		                    alert('error decoding file data: ' + url);
		                    return;
		                }
		                var name = that.soundNames[i];
		                that.bufferList[name] = buffer;
		                that.loadCount--;
		                SCSound.console.log("sound:", name, "loaded", i, load, "that.loadCount", that.loadCount);
		                
		                if (that.loadCount === 0) {
							that.totalLoaded = 0;
							for (var l in that.loadingLibs) {
								SCSound.Core.EventBus.dispatch("scsound_complete", this, 1, l);
							}
							that.loadingLibs = {};
							that.initSC(load);
		                }
		            }    
		        );
			}
			request.send();
		}
	},

	/** 
	* Sets up all objects needed
	* @param {string} load mode
	*/
	initSC: function(load) {	
		for (var k in this.sounds) {
			if (!this.sounds[k].audioBuffer) {
				//if (!this.sounds[k].audioSprite) {
					this.sounds[k].audioBuffer = this.bufferList[this.sounds[k].name];
					//console.log(this.sounds[k].audioBuffer, this.sounds[k].name);
				//}
			}
		}
		for (var i in this.soundObjects) {
			var so = this.soundObjects[this.soundObjects[i].name];
			if (so.sounds.length > 0) {
				if (so.sounds[0].audioBuffer || this.sounds[k].audioSprite) {
					continue;
				} 
			}
			so.sounds = [];
			for (var i=0; i<so.soundNames.length; i++) {
				var s = SCSound.Core.copy(this.sounds[so.soundNames[i]], "Sound");
				s.parentSO = so;
				so.sounds.push(s);
			}
		}
		for (var j in this.arrangements) {
			var arr = this.arrangements[this.arrangements[j].name];
			if (arr.soundObjects.length>0) {
				/*if (arr.soundObjects[0].sounds[0].audioBuffer || arr.soundObjects[0].sounds[0].audioSprite) {				
					continue;
				}*/
				if (arr.isPlaying) continue;
			}
			arr.soundObjects = [];
			for (var i= 0; i < arr.soundObjectNames.length; i++) {
				var so = SCSound.Core.copy(this.soundObjects[arr.soundObjectNames[i]], "SoundObject");
				arr.soundObjects.push(so);				
			}
			arr.soundObjects.sort(function (a, b) { return a.upbeatTime -b.upbeatTime});
		}
		if (load != "auto") {
			return;
		}
		for (var m in this.busses) {
			if (!SCSound.webaudio) continue;
			if (this.busses[m].name == "_MasterBus" || this.busses[m].parent == "_MasterBus") {
				this.busses[m].gainNode.connect(SCSound.Core.SoundController.master);
			}else if (this.busses[m].parent == "_MasterBus") {
				this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].gainNode);
			}else{
				if (this.busses[m].group) {
					if (this.busses[this.busses[m].parent].pan) {
						this.busses[m].gainNode.connect(this.groups[this.busses[m].group].firstNode);
						this.groups[this.busses[m].group].lastNode.connect(this.busses[this.busses[m].parent].panner);
					}else {
						this.busses[m].gainNode.connect(this.groups[this.busses[m].group].firstNode);
						this.groups[this.busses[m].group].lastNode.connect(this.busses[this.busses[m].parent].gainNode);
					}
				}else {
					if (this.busses[this.busses[m].parent].pan) {
						this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].panner);
					}else {
						this.busses[m].gainNode.connect(this.busses[this.busses[m].parent].gainNode);
					}
				}
				
			}
		}
		for (var l in this.groups) {
			if (this.groups[l].hasReverb) {
				this.groups[l].hasReverb.buffer = this.bufferList[this.groups[l].reverbFile];
			}
		}
		/** Calls ready callback */
		this.initCallback();
	},
	/** 
	* Trigs sound functions
	* @param {string} event name
	* @param {number} optional value to use with event
	*/
	trig: function(event, args) {
		if (!this.eventTriggers[event]) return false;
		if (this.bypass) {
			var bypass = true;
			for (var i= 0; i<this.exeptions.length; i++) {
				if (this.exeptions[i] === event) {
					bypass = false;
				}
			}
			if (bypass) {
				return;
			}
		}
		var targets = this.eventTriggers[event].targets;
		for (var i = 0; i < targets.length; i++) {
			switch (targets[i].action) {
			case "SyncPlayArrAction":
				if (!SCSound.webaudio) return;
				var arr = this.arrangements[targets[i].args["name"]];
				var _restart = args[2] || false;
				this.playSyncArr(targets[i].args["name"], args[0], _restart);
				//arr.checkListener();
				if (!this.sequencers[arr.domain]) {
					this.sequencers[arr.domain] = new SCSound.Core.Sequencer(args[1], arr.domain, arr.tempo);					
				}
				if(!this.sequencers[arr.domain].isPlaying) {
					this.sequencers[arr.domain].start();
				}
				else {
					this.sequencers[arr.domain].setPlayDelta(args[1]);
				}
				break;
			case "UpdateDeltaAction":
				if (this.sequencers[targets[i].args["name"]]) {
					this.sequencers[targets[i].args["name"]].setPlayDelta(args[1]);			
				}
				break;
			case "PlayArrAction":
				var delay = 0;
				if (targets[i].args["delay"]) {
					delay = targets[i].args["delay"];
				}
				var offsetSound = 0;
				if (targets[i].args["offsetSound"] == "1") {
					if (args[1]) {
						offsetSound = args[1]*3;
						if (offsetSound>1 && offsetSound < 1.375) {
							offsetSound = 1;
						}else if (offsetSound>1.765 && offsetSound < 2.142) {
							offsetSound = 2.142
						}
					}
				}else if (targets[i].args["offsetSound"]) {
					offsetSound = parseFloat(targets[i].args["offsetSound"]);
				}
				var name = targets[i].args["name"];
				if (targets[i].args["engine"] && args[0]>0) {
					name = name + args[0];
				}
				this.playArr(name, true, false, delay, offsetSound);
				break;
			case "StartSOAction":
				var delay = 0;
				if (targets[i].args["delay"]) {
					delay = targets[i].args["delay"];
				}else if (args[0]) {
					delay = args[0];
				}
				this.playSO(targets[i].args["name"], delay);
				break;
			case "PlaySOAction":
				var currArrs = this.getCurrentArrangements();
				var offset = 0;
				for (var j = 0; j < currArrs.length; j++) {
					var arr = currArrs[j];
					if (arr.domain == targets[i].args["domain"]) {
						offset = arr.getNextClipPoint();
					}
				}
				var now = 0;
				if (SCSound.webaudio) {
					now = SCSound.Core.SoundController.context.currentTime;
				}
				this.soundObjects[targets[i].args["name"]].play(now+offset, 0, 0);
				break;
			case "StopSOAction":
				this.stopSO(targets[i].args["name"], true);
				break;
			case "FadeAndStopDomainAction":
				this.fadeAndStopDomain(targets[i].args["name"], targets[i].args["fadeOutTime"]);
				break;
			case "FadeAndStopArrAction":
				var name = targets[i].args["name"];
				if (targets[i].args["engine"] && args[0]>0) {
					name = name + args[0];
				}
				this.arrangements[name].fadeAndStop(targets[i].args["fadeOutTime"]);
				break;
			case "SyncFadeAndStopDomainAction":
				this.syncFadeAndStopDomain(targets[i].args["name"], targets[i].args["fadeOutTime"]);
				break;
			case "BusVolumeAction":
				this.setBusVolume(targets[i].args["name"], targets[i].args["vol"], targets[i].args["time"]);
				break;
			case "BusPanAction":
				//SCSound.console.log("set pan", targets[i].args["pan"], targets[i].args["panY"], targets[i].args["panZ"]);
				this.setBusPan(targets[i].args["name"], targets[i].args["time"], targets[i].args["pan"], targets[i].args["panY"], targets[i].args["panZ"]);
				break;
			case "SetBusVolumeAction":
				if(!SCSound.webaudio) return;
				var val = args[0];
				if (val<0) {
					val = Math.abs(val);
				}
				if (val > 1) val = 1;
				this.setBusVolume(targets[i].args["name"], val, 0);
				break;
			case "SetBusPanAction":
				var val = args[0];
				if (targets[i].args["divide"]) {
					val /= targets[i].args["divide"];
				}	
				this.setBusPan(targets[i].args["name"], 0, val, 0, 1);
				break;
			case "LoadSWFAction":
				if(!SCSound.webaudio) return;
				var name = targets[i].args["name"].split(".");
				var n = name[0].split("sounds_");
				var a = n[1];
				this.loadSounds(0, a);
				break;
			case "PlayRandomArrAction":
				var names = targets[i].args["name"];
				var rdm = Math.floor(Math.random() * names.length);
				var currArrs = this.getCurrentArrangements();
				for (var j = 0; j < currArrs.length; j++) {
					var arr = currArrs[j];
					var arrName;
					if (arr.domain == "main") {
						arrName = arr.name;
					}
				}
				if (arrName == names[rdm]) {
					rdm = (rdm+1)%names.length;
				}
				if (arrName == "StartGame") {
					rdm = 0;
				}
				this.playArr(names[rdm], false, false, 0);
				break;
			case "ReplaceRandomArrAction":
				var currArrs = this.getCurrentArrangements();
				var offset = 0;
				for (var j = 0; j < currArrs.length; j++) {
					var arr = currArrs[j];
					var arrName;
					if (arr.domain == "main") {
						arrName = arr.name;
					}
				}
				var names = targets[i].args["name"];
				var rdm = Math.floor(Math.random() * names.length);
				this.playArr(names[rdm], false, true, 0);
				break;
			case "StopArrAction":
				this.stopArr(targets[i].args["name"], true);
				break;
			case "SetPlaybackRateAction":
				var val = args[0];
				this.arrangements[targets[i].args["name"]].setPlaybackRate(val);
				break;
			case "EffectParamAction":
				var value;
				if ((targets[i].args["value"]) == "val") {
					value = args[0]; 
				}else {
					value = (targets[i].args["value"]);
				}
				if (targets[i].args["factor"]) {
					value *= targets[i].args["factor"];
				}
				this.setEffectParam(targets[i].args["group"], targets[i].args["name"], targets[i].args["param"], value, targets[i].args["time"]/1000);
				break;
			case "UltimateUpbeatAction":
				var so = this.soundObjects[targets[i].args["name"]];
				var currArrs = this.getCurrentArrangements();
				var offset = 0;
				for (var j = 0; j < currArrs.length; j++) {
					var arr = currArrs[j];
					if (arr.domain == targets[i].args["domain"]) {
						offset = arr.getNextClipPoint();
					}
				}
				var k = so.offsets.length - 1;
				var longestUpbeat = -1;
				while (Math.abs(so.offsets[k]) < offset) {
					longestUpbeat = k;
					k--;
					if (k == -1) {
						break;
					}
				}
				if (longestUpbeat > -1) {
					so.play(SCSound.Core.SoundController.context.currentTime + offset - so.sounds[longestUpbeat].length, longestUpbeat, 0);
				}
				break;
			case "PauseArrAction":
				this.pauseArr(targets[i].args["name"]);
				break;
			case "ResumeArrAction":
				this.resumeArr(targets[i].args["name"]);
				break;
			case "SetListenerPositionAction":
				if (args[0] == undefined) return;
				this.setListenerPosition(args[0], args[1], args[2], 0, 0, 0, 0, 0, 0, 0, 0, 0);
				break;
			case "SyncPlaySOAction":
				this.soundObjects[targets[i].args["name"]].startSong(args[0], args[1]);
				break;
			case "MobileStartAction":
				if (SCSound.webaudio) {
					var bufferSource = SCSound.Core.SoundController.context.createBufferSource();
					if (bufferSource.start) {
						bufferSource.start(0);
					}else {
						bufferSource.noteOn(0);
					}
				}else {
					SCSound.audioSprite.load();
					SCSound.audioTag.play();
				}
				break;
			case "BypassEventsAction":
				this.bypass = true;
				this.exeptions = ["race_loop_1", "race_loop_2", "race_loop_3", "race_loop_4", "race_loop_5", "stop_race_loop"];
				break;
			case "ResetEventsAction":
				this.bypass = false;
				this.exeptions = [];
				break;
			default:
				SCSound.console.log("No actions for", targets[i].action);
			}
		}
	},
	/** 
	* Helper function to calculate time
	* @param {int} tempo bpm
	* @param {int} number of fourth beats
	*/
	beatToMilliseconds: function(tempo, beats) {
		return ((60 / tempo) * beats) * 1000;
	},
	/** 
	* Plays a SoundObject
	* @param {string} name of so
	* @param {int} delay time optional.
	*/
	playSO: function(name, delay) {
		var time = 0;
		if (SCSound.webaudio) {
			time = SCSound.Core.SoundController.context.currentTime;
		}
		this.soundObjects[name].play(time, 0, delay);
	},
	/** 
	* Stops a SoundObject
	* @param {string} name of so
	* @param {boolean} when to stop.
	*/
	stopSO: function(name, hard) {
		if (this.soundObjects[name]) {
			this.soundObjects[name].stop(hard);
		}
	},
	/** 
	* Sets volume of a SoundObject
	* @param {string} name of so
	* @param {int} volume.
	™ @param tween time
	*/
	setSOVolume: function(name, vol, time) {
		if (time) {
			this.soundObjects[name].gainNode.gain.setTargetValueAtTime(vol, 0, time);
		} else {
			this.soundObjects[name].gainNode.gain.cancelScheduledValues(0);
			this.soundObjects[name].gainNode.gain.value = vol;
		}
	},
	/** 
	* Sets playbackrate of a SoundObject
	* @param {string} name of so
	* @param {number} playbackrate.
	*/
	setSOPlaybackRate: function(name, rate) {
		this.soundObjects[name].setPlaybackRate(rate);
	},
	/** 
	* Plays a Arrangement
	* @param {string} name of Arrangement
	* @param {boolean} play upbeat.
	* @param {boolean} replace or start from beginning.
	* @param {int} delay time.
	*/
	playSyncArr: function(name, layers, restart) {
		if (!this.arrangements || !this.arrangements[name]) {
			return;
		}
		this.arrangements[name].startSong(layers, restart);
		var currArrs = this.getCurrentArrangements();
		var startDomain = this.arrangements[name].domain;
		var j =0;
		var l = currArrs.length;
		for (j; j < l; j++) {
			var arr = currArrs[j];
			if (arr.name === name) {
				continue;
			}
			if (arr.domain === startDomain) {
				arr.stopSync();
			}
		}		
	},
	playArr: function(name, forceUpbeat, replace, delay, offsetSound) {
		var offset = 0;
		var currArrs = this.getCurrentArrangements();
		var id = 0;
		for (var j = 0; j < currArrs.length; j++) {
			var arr = currArrs[j];
			if (arr.name == name) {
				continue;
			}
			if (arr.domain == this.arrangements[name].domain) {
				if (replace) {
					id = arr.getNextId();
				}
				offset = arr.stop(false);
			}
		}
		if (delay > 0) {
			offset = delay / 1000;
		}
		this.arrangements[name].play(offset, id, forceUpbeat, offsetSound);
	},
	/** 
	* Replaces a Arrangement
	* @param {string} name of Arrangement
	* @param {boolean} play upbeat.
	*/
	replaceArr: function(name, forceUpbeat) {
		if (forceUpbeat == undefined) {
			forceupbeat = false;
		}
		var offset = 0;
		var currArrs = this.getCurrentArrangements();
		for (var j = 0; j < currArrs.length; j++) {
			var arr = currArrs[j];
			if (arr.name == name) {
				continue;
			}
			var id = 0;
			if (arr.domain == this.arrangements[name].domain) {
				id = arr.getNextId();
				offset = arr.stop(false);
			}
		}
		this.arrangements[name].play(offset, id, forceUpbeat);
	},
	/** 
	* Stops an Arrangement
	* @param {string} name of arr
	* @param {boolean} when to stop.
	*/
	stopArr: function(name, hard) {
		var nextClipPoint = this.arrangements[name].stop(hard);
		return nextClipPoint;
	},
	pauseArr: function(name) {
		this.arrangements[name].pause();
	},
	resumeArr: function(name) {
		this.arrangements[name].resume();
	},
	/** 
	* Fades out and stops Arrangements from a certain domain
	* @param {string} name of domain
	* @param {int} tweentime.
	*/
	fadeAndStopDomain: function(domain, time) {
		var currArrs = this.getCurrentArrangements();
		var playingArr;
		for (var i = 0; i < currArrs.length; i++) {
			if (domain == currArrs[i].domain) {
				playingArr = currArrs[i];
			}
		}
		if (!playingArr) return;
		playingArr.fadeAndStop(time);
		/*playingArr.stopping = true;
		for (var j = 0; j < playingArr.soundObjects.length; j++) {
			playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(playingArr.soundObjects[j].volume, this.context.currentTime);
			playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + time / 1000);
		}
		setTimeout(function() {
			playingArr.stop(true);
			for (var k = 0; k < playingArr.soundObjects.length; k++) {
				playingArr.soundObjects[k].gainNode.gain.cancelScheduledValues(0);
				playingArr.soundObjects[k].gainNode.gain.value = playingArr.soundObjects[k].volume;
			}
		}, time)*/
	},
	syncFadeAndStopDomain: function(domain, time) {
		var currArrs = this.getCurrentArrangements();
		var playingArr;
		for (var i = 0; i < currArrs.length; i++) {
			if (domain == currArrs[i].domain) {
				playingArr = currArrs[i];
			}
		}
		if (!playingArr) return;
		for (var j = 0; j < playingArr.soundObjects.length; j++) {
			playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(playingArr.soundObjects[j].volume, this.context.currentTime);
			playingArr.soundObjects[j].gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + time / 1000);
		}
		setTimeout(function() {
			playingArr.stopSync(true);
			for (var k = 0; k < playingArr.soundObjects.length; k++) {
				playingArr.soundObjects[k].gainNode.gain.cancelScheduledValues(0);
				playingArr.soundObjects[k].gainNode.gain.value = playingArr.soundObjects[k].volume;
			}
		}, time)
	},
	/** 
	* Sets pan of a bus
	* @param {string} name of bus
	* @param {int} tweentime.
	* @param {number} x-pan.
	* @param {number} y-pan.
	* @param {number} z-pan.
	*/
	setBusPan: function(name, time, panX, panY, panZ) {
		panY = (typeof panY === "undefined") ? this.busses[name].panY : panY;
		panZ = (typeof panZ === "undefined") ? this.busses[name].panZ : panZ;

		this.busses[name].panner.setPosition(panX, panY, panZ);
		this.busses[name].panX = panX;
		this.busses[name].panY = panY;
		this.busses[name].panZ = panZ;
	},
	setPannerPosition: function(busName, soundX, soundY, soundZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
		if (!this.busses[busName]) return;
		var bus = this.busses[busName];
		var directional = false;
		if (directional) {
			bus.panner.setOrientation(frontX, frontY, frontZ, upX, upY, upZ);
		}else {
			bus.panner.setPosition( soundX, soundY, soundZ);
			bus.panner.setVelocity( deltaX, deltaY, deltaZ);
		}		
	},
	setListenerPosition: function(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ) {
		//console.log(cameraX, cameraY, cameraZ, deltaX, deltaY, deltaZ, frontX, frontY, frontZ, upX, upY, upZ);
		this.listener.setPosition(cameraX, cameraY, cameraZ);
		this.listener.setVelocity(deltaX, deltaY, deltaZ);
		//this.listener.setOrientation(frontX, frontY, frontZ, upX, upY, upZ);
	},
	/** 
	* Sets volume of a bus
	* @param {string} name of bus
	* @param {number} volume.
	* @param {int} tweentime.
	*/
	setBusVolume: function(name, vol, time) {
		if(!SCSound.webaudio) return;
		if (time > 0) {
			this.busses[name].gainNode.gain.linearRampToValueAtTime(this.busses[name].gainNode.gain.value, this.context.currentTime);
			this.busses[name].gainNode.gain.linearRampToValueAtTime(vol, this.context.currentTime + time / 1000);
		} else {
			this.busses[name].gainNode.gain.cancelScheduledValues(0);
			this.busses[name].gainNode.gain.value = vol;
		}
	},
	/** 
	* Sets volume of the master bus
	* @param {number} volume.
	*/
	setMasterVolume: function(_value) {
		this.master.gain.value = _value;
	},
	/** 
	* Changes effect params
	* @param {string} name of group
	* @param {string} effect id.
	* @param {string} param name.
	* @param {number} value to set.
	* @param {int} tween time.
	*/
	setEffectParam: function(group, _effectId, _paramName, _value, _time) {
		if (_paramName == "frequency") {
			if (_value < 20) _value = 20;
			if (_time) {
				this.groups[group].effects[_effectId].fx.frequency.linearRampToValueAtTime(this.groups[group].effects[_effectId].fx.frequency.value, this.context.currentTime);
				this.groups[group].effects[_effectId].fx.frequency.exponentialRampToValueAtTime(_value, _time +this.context.currentTime);
			} else {
				this.groups[group].effects[_effectId].fx.frequency.setValueAtTime(_value, this.context.currentTime);
			}
		}
		if (_paramName == "Q") {
			if (_time) {
				this.groups[group].effects[_effectId].fx.Q.setTargetValueAtTime(_value, 0, _time);
			} else {
				this.groups[group].effects[_effectId].fx.Q.value.cancelScheduledValues(0);
				this.groups[group].effects[_effectId].fx.Q.value = _value;
			}
		}
		if (_paramName == "delayTime") {
			if (_time) {
				this.groups[group].effects[_effectId].fx.delayTime.setTargetValueAtTime(_value, 0, _time);
			} else {
				this.groups[group].effects[_effectId].fx.delayTime.value.cancelScheduledValues(0);
				this.groups[group].effects[_effectId].fx.delayTime.value = _value;
			}
		}
		if (_paramName == "wet") {
			this.groups[group].effects[_effectId].effectNode.gain.value = _value;
		}
		if (_paramName == "sendVol") {
			if (_time) {
				this.groups[group].effects[_effectId].send.gain.setTargetValueAtTime(_value, 0, _time);
			} else {
				this.groups[group].effects[_effectId].send.gain.cancelScheduledValues(0);
				this.groups[group].effects[_effectId].send.gain.value = _value;
			}
		}
		if (_paramName == "volume") {
			if (_time) {
				this.groups[group].lastNode.gain.setTargetValueAtTime(_value, 0, _time);
			} else {
				this.groups[group].lastNode.gain.cancelScheduledValues(0);
				this.groups[group].lastNode.gain.value = _value;
			}
		}
	},
	/** 
	* Returns playing Arrangements
	*/
	getCurrentArrangements: function() {
		var currArrs = [];
		for (var name in this.arrangements) {
			var arr = this.arrangements[name];
			if (arr.isPlaying) {
				currArrs.push(arr);
			}
		}
		return currArrs;
	},
	/** 
	* Stops current Arrangements
	* @param {boolean} when to stop
	*/
	stopCurrentArrangements: function(hard) {
		var currArrs = this.getCurrentArrangements();
		for (var j = 0; j < currArrs.length; j++) {
			var arr = currArrs[j];
			var nextClipPoint = arr.stop(hard);
		}
		return nextClipPoint;
	}
};
/** 
* Copys an Sound or SoundObject
* @param {object} object to copy
* @param {string} type of object.
*/
SCSound.Core.copy = function(obj, type) {
	var copy;
	if (type == "Sound") {
		copy = new SCSound.Core.Sound(obj.name, obj.length, obj.parent);
	} else if (type == "SoundObject") {
		copy = new SCSound.Core.SoundObject(obj.soundNames, obj.offsets)
	}
	for (var k in obj) {
		copy[k] = obj[k];
	}
	return copy;
};
/**
 * Group of SoundObjects
 * @param {string} name
 * @param {string} domain name
 * @constructor
 */
SCSound.Core.Arrangement = function(name, domain) {
	this.name = name;
	this.domain = domain;
	this.soundObjectNames = [];
	this.isPlaying = false;
	this.soundObjects = [];
	this.hasListener = false;
	this.stoppedSos = {};
	this.stoppedSosCount = 0;
	this.hasListener = false;
	this.playingLayers = [];
	this.timeoutId;
	this.stopping = false;
};
SCSound.Core.Arrangement.prototype = {
	/**
	 * Starts the Arrangement
	 * @param {int} delay time
	 * @param {int} what sound to start on
	 * @param {boolean} play upbeat
	 */
	play: function(offset, id, forceUpbeat, offsetSound) {
		if (this.stopping) {
			this.resetSOVolume();
			clearTimeout(this.timeoutId);
			
		}
		if (!id) {
			id = 0
		};
		if (!forceUpbeat) {
			forceUpbeat = false;
		};
		if (!offsetSound) {
			offsetSound = 0;
		};
		if (this.isPlaying) {
			return;
		}
		this.isPlaying = true;
		var maxUpbeat = 0;
		for (var k = 0; k < this.soundObjects.length; k++) {
			if (this.soundObjects[k].hasUpbeat && this.soundObjects[k].upbeatTime < maxUpbeat) {
				maxUpbeat = this.soundObjects[k].upbeatTime;
			}
		}
		var playingUpbeat = false;
		for (var i = 0; i < this.soundObjects.length; i++) {
			if (maxUpbeat < 0) {
				if (this.soundObjects[i].hasUpbeat && this.soundObjects[i].upbeatTime == maxUpbeat) {
					if (offset == 0 || forceUpbeat) {
						playingUpbeat = true;
						this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id, 0, offsetSound);
					} else if (maxUpbeat > offset) {
						playingUpbeat = false;
						this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id, 0, offsetSound);
					}
				} else {
					if (playingUpbeat) {
						this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset + Math.abs(maxUpbeat), id, 0, offsetSound);
					} else {
						this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id, 0, offsetSound);
					}
				}
			} else {
				this.soundObjects[i].play(SCSound.Core.SoundController.context.currentTime + offset, id, 0, offsetSound);
			}
			SCSound.Core.EventBus.addEventListener(this.soundObjects[i].name + "_stopped", this.soStopped, this);
		}
	},
	startSong: function(layers, restart) {
		if (!layers || !layers.length || !this.soundObjects || !this.soundObjects.length) {
			return;
		}
		if (this.isPlaying) {
			var layerChanged = false;
			for (var i= 0; i< layers.length; i++) {
				if (layers[i] !== this.playingLayers[i]) {
					layerChanged = true;
				}
			}
			if (layerChanged) {
				for (var i= 0; i< this.playingLayers.length; i++) {
					if (this.soundObjects[this.playingLayers[i]]) {
						this.soundObjects[this.playingLayers[i]].isPlaying = false;
						this.soundObjects[this.playingLayers[i]].restart = restart;
						this.soundObjects[this.playingLayers[i]].counter = 0;
					}
				}
			}
		}
		this.addListener();
		this.playingLayers = layers;
		this.isPlaying = true;
		for (var layer in this.playingLayers) {
			var l = this.playingLayers[layer];
			if (this.soundObjects[l]) {
				this.soundObjects[l].isPlaying = true;
				this.soundObjects[l].restart = restart;
				this.soundObjects[l].counter = 0;
			}
		}
	},
	addListener: function() {
		if (!this.hasListener) {
			this.hasListener = true;
			SCSound.Core.EventBus.addEventListener(this.domain, this.onBeat, this);
		}
	},
	removeListener: function() {
		if (this.hasListener) {
			this.hasListener = false;
			SCSound.Core.EventBus.removeEventListener(this.domain, this.onBeat, this);
		}
	},
	onBeat: function (seq, nextBar, time) {
	    try {
			if (this.playingLayers.length) {
				for (var layer in this.playingLayers) {
					var l = this.playingLayers[layer];
					if (this.soundObjects[l]) {
						this.soundObjects[l].onBeat(nextBar, time);
					}
				}
				
			}
		} catch (e)  { }
	},
	soStopped: function(e) {
		if (!this.stoppedSos[e.target.type]) {
			this.stoppedSos[e.target.type] = true;
			this.stoppedSosCount++;
			if (this.stoppedSosCount == this.soundObjects.length) {
				this.isPlaying = false;
				this.stoppedSos = {};
				this.stoppedSosCount = 0;
			}
		}
	},
	/**
	 * Stops the Arrangement
	 * @param {boolean} when to stop
	 */
	 stopSync: function(hard) {
		this.isPlaying = false;
		//this.soundObjects[this.playingId].stopSync();
		this.removeListener();
		var i = 0;
		var l = this.soundObjects.length;
		for (i; i < l; i++) {
			this.soundObjects[i].stopSync(hard);
		}

	},
	stop: function(hard) {
		this.getNextId();
		this.stopping = false;
		if (this.isPlaying == false) {
			return 0
		}
		this.isPlaying = false;
		var nextClipPoint = 0;
		var i = 0;
		var l = this.soundObjects.length;
		for (i; i < l; i++) {
			var o = this.soundObjects[i].stop(hard);
			if (o > nextClipPoint) {
				nextClipPoint = o;
			}
		}
		this.stoppedSos = {};
		this.stoppedSosCount = 0;
		return nextClipPoint;
	},
	fadeAndStop: function(time) {
		if (!this.isPlaying || !SCSound.webaudio) return;
		this.stopping = true;
		for (var j = 0; j < this.soundObjects.length; j++) {
			this.soundObjects[j].gainNode.gain.cancelScheduledValues(0);
			this.soundObjects[j].gainNode.gain.setValueAtTime(this.soundObjects[j].volume, SCSound.Core.SoundController.context.currentTime);
			this.soundObjects[j].gainNode.gain.linearRampToValueAtTime(0, SCSound.Core.SoundController.context.currentTime + (time / 1000));
		}
		that = this;
		if (this.timeoutId) clearTimeout(this.timeoutId);
		this.timeoutId = setTimeout(function() {
			that.stop(true);
			for (var k = 0; k < that.soundObjects.length; k++) {
				that.soundObjects[k].gainNode.gain.cancelScheduledValues(0);
				that.soundObjects[k].gainNode.gain.value = that.soundObjects[k].volume;
			}
		}, time);
	},
	resetSOVolume: function() {
		for (var k = 0; k < this.soundObjects.length; k++) {
			this.soundObjects[k].gainNode.gain.cancelScheduledValues(0);
			this.soundObjects[k].gainNode.gain.setValueAtTime(this.soundObjects[k].volume, SCSound.Core.SoundController.context.currentTime);
		}
	},
	pause: function() {
		for (var i = 0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].pause();
		}
	},
	resume: function() {
		for (var i = 0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].resume();
		}
	},
	/**
	 * Returns time til next sound start
	 */
	getNextClipPoint: function() {
		if (this.isPlaying == false) {
			return 0
		}
		var nextClipPoint = 0;
		for (var i = 0; i < this.soundObjects.length; i++) {
			var o = this.soundObjects[i].getNextClipPoint();
			if (o > nextClipPoint) {
				nextClipPoint = o;
			}
		}
		return nextClipPoint;
	},
	/**
	 * Returns next sound id
	 */
	getNextId: function() {
		var nextId = 0;
		for (var i = 0; i < this.soundObjects.length; i++) {
			if (this.soundObjects[i].hasUpbeat) {
				continue;
			};
			var id = this.soundObjects[i].getNextId();
			if (id > nextId) {
				nextId = id;
			}
		}
		return nextId;
	},
	setPlaybackRate:function (rate) {
		this.playbackRate = rate;
		for (var i =0; i < this.soundObjects.length; i++) {
			this.soundObjects[i].setPlaybackRate(this.playbackRate);
		}
	}
}
/**
 * Group of Sounds
 * @param {array} sound names
 * @param {array} sound offsets
 * @constructor
 */
SCSound.Core.SoundObject = function(soundNames, offsets) {
	this.soundNames = soundNames;
	this.offsets = offsets;
	this.loop = true;
	this.mode = "pattern";
	this.volume = 1.0;
	this.upbeatTime = 0;
	this.isPlaying = false;
	this.sounds = [];
	if (SCSound.webaudio) {
		this.gainNode = SCSound.Core.SoundController.context.createGainNode();
		this.gainNode.gain.value = this.volume;
	}
	this.adder = 0;
	this.stepFlag = 0;
	this.skippedOffset = 0;
	this.startId = 0;
	this.nextSound = 0;
	this.currentSound = -1;
	this.hasStarted = false;
	this.queuedSounds = [];
	this.queuedRounds = -1;
	this.startTime = 0;
	this.soStartTime = 0;
	this.soStartId = 0;
	this.isChecking = false;
	this.playbackRate = 1.0;
	this.lastBeatTime = 0;
	this.counter = 0;
	this.restart = false;
};
SCSound.Core.SoundObject.prototype = {
	/**
	 * Plays the SoundObject
	 * @param {int} time to start on
	 * @param {int} sound id to start with
	 * @param {int} delay time
	 */
	play: function(time, id, delay, offsetSound) {
		this.offsetSound = offsetSound;
		if (!this.offsetSound) {
			this.offsetSound = 0;
		};
		if (!id) {
			id = 0;
		};
		if (!this.sounds.length) return;
		this.totalLength = this.offsets[this.offsets.length - 1] + this.sounds[this.sounds.length - 1].length;
		this.startId = id;
		if (!this.isPlaying) {
			this.soStartTime = time;
			this.soStartId = id;
		}
		this.isPlaying = true;
		if (this.mode == "pattern") {
			this.startTime = time;
			var _id = id % this.sounds.length;
			this.skippedOffset = this.offsets[_id];
			for (var i = _id; i < this.sounds.length; i++) {
				var s = SCSound.Core.copy(this.sounds[i], "Sound");
				
				this.queuedSounds.push(s);
				this.queuedSounds[this.queuedSounds.length - 1].play((this.offsets[i] - this.skippedOffset) + time, this.group, this.gainNode, false, this.offsetSound);
			}
			this.queuedRounds++;
			if (!this.isChecking) {
				this.isChecking = true;
				this.intervalId = setInterval(this.checkRound.bind(this), 100);
			}
		} else if (this.mode == "patternsingle") {
			this.startTime = time;
			var _id = id % this.sounds.length;
			this.skippedOffset = this.offsets[_id];
			var s = this.sounds[_id];
			this.queuedSounds.push(s);
			this.queuedSounds[this.queuedSounds.length - 1].play((this.offsets[_id] - this.skippedOffset) + time, this.group, this.gainNode, false, this.offsetSound);
		} else if (this.mode == "steptrig") {
			if (!SCSound.webaudio) {
				var that = this;
				if (this.loop && this.sounds[0].isPlaying) {
					SCSound.console.log("Already playing");
					return;
				}
				//console.log(this.name, "delay", delay);
				if (delay) {
					setTimeout(function() {
						that.sounds[that.adder % that.sounds.length].play(time, that.group, that.gainNode, that.loop, that.offsetSound);
					}, delay)
				}else {
					that.sounds[that.adder % that.sounds.length].play(time, that.group, that.gainNode, that.loop, that.offsetSound);
				}
			}else {
				this.sounds[this.adder % this.sounds.length].play(time + (delay / 1000), this.group, this.gainNode, false, this.offsetSound);
			}
			this.adder++;
		} else if (this.mode == "randomtrig") {
			this.adder = Math.floor(Math.random() * (this.sounds.length));
			if (this.adder < 1) this.adder = 1;
			this.stepFlag += this.adder;
			var _id = this.stepFlag % this.sounds.length;
			this.sounds[_id].play(time + (delay / 1000), this.group, this.gainNode, false, this.offsetSound);
		} else if (this.mode == "randompatternamb") {
			this.startTime = time;
			this.sounds = this.shuffleArray(this.sounds);
			var totOffset = 0;
			var lastOffset = 0;
			for (var i = 0; i < this.sounds.length; i++) {
				var s = SCSound.Core.copy(this.sounds[i], "Sound");
				this.queuedSounds.push(s);
				var randomOffset = lastOffset+this.min/1000+ (Math.random()*this.max/1000);
				lastOffset = randomOffset;
				this.queuedSounds[this.queuedSounds.length - 1].play(randomOffset + time, this.group, this.gainNode, false, this.offsetSound);
			}
			this.queuedRounds++;
			var soEnd = this.min/1000+ Math.random()*this.max/1000+(lastOffset+this.sounds[this.sounds.length-1].length);
			this.intervalId = setTimeout(this.play.bind(this,soEnd+time), (soEnd)*1000);
			
		} else if (this.mode == "loop") {
			var s = SCSound.Core.copy(this.sounds[0], "Sound");
			this.queuedSounds.push(s);
			this.queuedSounds[0].play(time, this.group, this.gainNode, true, this.offsetSound, this.loopStart, this.loopEnd);
		}
	},
	onBeat:function (nextBar, time) {
		//console.log(this.name, this.restart, this.counter, nextBar, time);
		if (!this.isPlaying) return;
		if (this.restart) {
			nextBar = this.counter;
			this.counter++
			if (this.counter > this.sounds.length-1) {
				this.counter = 0;
			}
		}
		if (nextBar > this.sounds.length-1) return;
		this.sounds[nextBar].play(time, this.group, this.gainNode, false, 0);
		//console.log(this.name, (time - this.lastBeatTime)*1000);
		//this.lastBeatTime  = time;
	},
	shuffleArray:function(o){
	    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
	    return o;
	},
	/**
	 * Sets playbackrate of the SoundObject
	 * @param {number} playbackrate
	 */
	setPlaybackRate:function (rate) {
		this.playbackRate = rate;
		for (var i =0; i < this.queuedSounds.length; i++) {
			if (this.queuedSounds[i].voice.playbackState != 3) {
				this.queuedSounds[i].setPlaybackRate(this.playbackRate);
			}
		}
	},
	/**
	 * Checks how many rounds played
	 */
	checkRound: function() {
		if (this.loop) {
			if (SCSound.Core.SoundController.context.currentTime - this.soStartTime > this.totalLength * this.queuedRounds) {
				this.doLoop();
			}
		} else {
			if (SCSound.Core.SoundController.context.currentTime - this.soStartTime > this.totalLength) {
				SCSound.Core.EventBus.dispatch(this.name + "_stopped", this);
				this.isPlaying = false;
				this.resetStuff();
			}
		}
	},
	/**
	 * Loops the SoundObject
	 */
	doLoop: function() {
		var playTime = this.startTime + this.totalLength - this.skippedOffset;
		this.play(playTime, 0, 0);
	},
	
	pause: function() {
		this.isPlaying = false;
		this.pauseTime = (SCSound.Core.SoundController.context.currentTime -this.soStartTime) + this.offsetSound;
		for (var i = 0; i < this.queuedSounds.length; i++) {
			this.queuedSounds[i].stop(true);
		}
		this.resetStuff();
	},
	resume: function() {
		this.play(SCSound.Core.SoundController.context.currentTime, 0, 0, this.pauseTime);
	},
	/**
	 * Stop the SoundObject
	 * @param {boolean} when to stop
	 */
	stopSync: function(hard) {
		this.isPlaying = false;
		if (hard) {
			for (var i=0; i<this.sounds.length; i++) {
				this.sounds[i].stop(hard);
			}
		}
	},
	stop: function(hard) {
		this.isPlaying = false;
		if (hard) {
			for (var i = 0; i < this.queuedSounds.length; i++) {
				this.queuedSounds[i].stop(hard);
			}
			if (!this.queuedSounds.length) {
				for (var i = 0; i < this.sounds.length; i++) {
					this.sounds[i].stop(hard);
				}
			}
		} else {
			var nextClipPoint = this.getNextClipPoint();
			for (var i = 0; i < this.queuedSounds.length; i++) {
				if (this.queuedSounds[i].voice.playbackState == 1) {
					this.queuedSounds[i].stop(hard);
				}
			}
		}
		this.resetStuff();
		if (this.hasUpbeat && currentSOTime > this.sounds[0].length) {
			nextClipPoint = 0;
		} else if (this.hasUpbeat && currentSOTime < this.sounds[0].length) {
			nextClipPoint = this.sounds[0].length - currentSOTime;
		}
		return nextClipPoint;
	},
	/**
	 * Returns time til next sound start
	 */
	getNextClipPoint: function() {
		if (this.hasUpbeat) return 0;
		var nextClipPoint = 0;
		var now = SCSound.Core.SoundController.context.currentTime;
		var currentSOTime = now - this.soStartTime;
		var totalLength = this.offsets[this.offsets.length - 1] + this.sounds[this.sounds.length - 1].length;
		var playedRounds = 0;
		while (currentSOTime > (totalLength * playedRounds)) {
			playedRounds++;
		}
		var relativeTime = currentSOTime - (totalLength * (playedRounds - 1));
		for (var j = 0; j < this.offsets.length; j++) {
			if (relativeTime >= (this.offsets[j] - this.skippedOffset) && relativeTime < ((this.offsets[j] - this.skippedOffset) + this.sounds[j].length)) {
				var currentSoundPosition = relativeTime - (this.offsets[j] - this.skippedOffset);
				nextClipPoint = this.sounds[j].length - currentSoundPosition;
			}
		}
		return nextClipPoint;
	},
	getPlayingSound: function() {
		var s;
		for (var i = 0; i < this.queuedSounds.length; i++) {
			if (this.queuedSounds[i].voice.playbackState == 2) {
				s = this.queuedSounds[i];
				break;
			}
			
		}
		return s;
	},
	/**
	 * Resets vars when stopping
	 */
	resetStuff: function() {
		clearInterval(this.intervalId);
		this.isChecking = false;
		this.queuedSounds = [];
		this.queuedRounds = -1;
		this.currentSound = -1;
		this.nextSound = 0;
		this.hasStarted = false;
	},
	/**
	 * Returns next sound id
	 */
	getNextId: function() {
		if (this.hasUpbeat) return -1;
		var now = SCSound.Core.SoundController.context.currentTime;
		var currentSOTime = now - this.soStartTime;
		var nextId = 0;
		for (var j = 0; j < this.offsets.length; j++) {
			if (currentSOTime >= (this.offsets[j] - this.skippedOffset) && currentSOTime < ((this.offsets[j] - this.skippedOffset) + this.sounds[j].length)) {
				var nextSound = j + 1 + this.soStartId;
				nextId = nextSound % this.sounds.length;
			}
		}
		return nextId;
	}
}
SCSound.Core.Sequencer = function( _playDelta, domain, bpm) {
	this.domain = domain;
	this.playDelta = _playDelta;// TODO: set 0.2 well above highest client latency
	this.bars = 8;
	this.bpm = bpm;
	this.barLength = (60/this.bpm) *4;
	this.loopLength = this.bars * this.barLength;
	this.isPlaying = false;
	this.lastSchedule = 0;
	this.lastCtx = 0;
	this.lastBeatTime = 0;
}
SCSound.Core.Sequencer.prototype = {
	setPlayDelta: function (delta) {
		this.playDelta = delta;
	},
	start: function() {
		//_playing	= true;				
		this.isPlaying = true;
		var lastBarScheduled = -1;
		var that = this;
		
		var schedule = function () {
			setTimeout(schedule, 100);

			ctxTime = SCSound.Core.SoundController.context.currentTime;
			playTime = that.playDelta + ctxTime;
			var nextBar = Math.ceil((playTime % that.loopLength)/that.barLength) % that.bars;
			if (nextBar !== lastBarScheduled) {

				var nextBarStartTimeInLoop = nextBar * that.barLength;
				
				var nrFullLoopsPlayed = Math.floor(playTime / that.loopLength);
				if (nextBar % that.bars === 0) {
					nrFullLoopsPlayed++;
				}
				
				var nextBarStartTime = (nrFullLoopsPlayed * that.loopLength) + nextBarStartTimeInLoop;
				var sToNextBar = nextBarStartTime - playTime;

				var time = ctxTime + sToNextBar;
				if (lastBarScheduled !=  nextBar) {
					SCSound.Core.EventBus.dispatch(that.domain ,that, nextBar, time);
					//console.log((time - that.lastBeatTime)*1000);
					//that.lastBeatTime  = time;
					//that.sounds[nextBar].play(time, that.group, that.gainNode, false, 0);
				}
				lastBarScheduled = nextBar;
			}
			//var now = Date.now()
			//console.log(now - this.lastSchedule, "ctx", (ctxTime - this.lastCtx)*1000, "diff", (now - this.lastSchedule) - ((ctxTime - this.lastCtx)*1000));
			//this.lastSchedule  = now;
			//this.lastCtx  = ctxTime;
		}

		//console.log('startTime', startTime)
		//console.log(' nowSync()',  nowSync());
		//console.log('songStartTime', songStartTime, 'playDelta', playDelta);
		schedule();
	},
	setDelta: function(delta) {
		this.playDelta = delta;
	}
}
/**
 * Sound file
 * @param {string} name of Sound
 * @param {int} length of Sound
 * @param {string} SoundObject
 * @constructor
 */
SCSound.Core.Sound = function(name, length, parent) {
	this.name = name;
	this.length = length;
	this.parentSO = parent;
	this.playbackRate = 1.0;
	this.isPlaying = false;
};
SCSound.Core.Sound.prototype = {
	/**
	 * Plays sound
	 * @param {int} time to start
	 * @param {string} group name
	 * @param {number} volume
	 * @param {boolean} looping
	 * @param {startTime} Pos in sound to start
	 */
	play: function(time, group, soGain, loop, offsetSound, loopStart, loopEnd) {
		this.isPlaying = true;
		this.playbackRate = this.parentSO.playbackRate;
		var audio = null;
		var stream = false;
		var startTime = 0;
		var duration = 0;
		if (SCSound.webaudio) {
			this.voice = SCSound.Core.SoundController.context.createBufferSource();
		}
		if (!this.audioBuffer && !this.audioSprite && this.load !== "stream") {
			SCSound.console.log("sound", this.name, "not loaded");
			return;
		}
		//console.log("play", this.name);
		if (this.audioSprite) {
			if (!SCSound.webaudio) {
				time = this.start +offsetSound;
				duration = this.duration-offsetSound;
				SCSound.console.log('Sprite: play from', time, 'for', duration);
				SCSound.audioSprite.play(time, duration);
				return;
			}else {
				//bypassed audiosprite for webaudio
				this.audio = this.voice;
				if (!this.audioBuffer) {
					SCSound.console.log("sound", this.name, "not loaded");
					return;
				}
				this.audio.buffer = this.audioBuffer;
				this.audio.playbackRate.value = this.playbackRate;
				startTime = offsetSound;
				duration = this.audioBuffer.duration-startTime;

				/*this.audioBuffer = SCSound.sc.bufferList[this.source];
				if (!this.audioBuffer) {
					SCSound.console.log("sound", this.source, "not loaded");
					return;
				}
				this.audio = this.voice;
				this.audio.buffer = this.audioBuffer;
				this.audio.playbackRate.value = this.playbackRate;*/
				
				//startTime = this.start +offsetSound;
				
				//duration = this.duration-offsetSound;
				if (loop) {
					//this.audio.loop = true;
				}
			}
		}else if (this.load === "stream") {
			//This is an audio tag
			stream = true;
			if (SCSound.webaudio) {
				if (!this.mediaElement) {
					this.mediaElement = this.audioBuffer;
					this.audio = SCSound.Core.SoundController.context.createMediaElementSource(this.mediaElement);
				}			
				if (loop) {
					this.mediaElement.loop = true;
				}
			}else {
				SCSound.audioTag.src = SCSound.soundPath+ this.name + ".mp3";
				if (loop) {
					if (SCSound.audioTag.loop) {
						SCSound.audioTag.loop = true;
					}else {
						SCSound.audioTag.addEventListener("ended", function() {
							SCSound.audioTag.currentTime = 0;
							SCSound.audioTag.play();
						});
					}
				}
				SCSound.audioTag.play();
				return;
			}
		}else if (this.audioBuffer.gain){
			this.audio = this.voice;
			this.audio.buffer = this.audioBuffer;
			this.audio.playbackRate.value = this.playbackRate;
			startTime = offsetSound;
			if (loop) {
				this.audio.loop = true;
				if (loopStart) {
					this.audio.loopStart = loopStart/1000;
					this.audio.loopEnd = loopEnd/1000;
				}
			}
		}else {
			SCSound.console.log("Unrecognized sound type", this.name);
			return;
		}
		this.audio.connect(soGain);
		var top = soGain;
		if (SCSound.Core.busses[this.parentSO.parentBus].pan) {
			top.connect(SCSound.Core.busses[this.parentSO.parentBus].panner);
		}else {
			top.connect(SCSound.Core.busses[this.parentSO.parentBus].gainNode);
		}
		if (stream) {
			this.mediaElement.play();
			if (this.voice.start) {
				this.voice.start(time, startTime, duration);
			}else {
				this.voice.noteGrainOn(time, startTime, duration);
			}
		}else if (time >= SCSound.Core.SoundController.context.currentTime - 0.2) {
			//console.log(this.voice, this.audioBuffer, startTime, duration);
			if (this.voice.start) {
				this.voice.start(time, startTime, this.audioBuffer.duration-startTime);
			}else {
				this.voice.noteGrainOn(time, startTime, this.audioBuffer.duration-startTime);
			}
		}
	},
	/**
	 * Sets playbackrate
	 * @param {number} playbackrate
	 */
	setPlaybackRate: function(rate) {
		if (this.voice) {
			this.playbackRate = rate;
			this.voice.playbackRate.value = this.playbackRate;
		}
	},
	/**
	 * Stops Sound
	 * @param {boolean} when to stop
	 */
	stop: function(hard) {
		this.isPlaying = false;
		if (this.voice) {
			this.voice.noteOff(0);
			this.isPlaying = false;
			if (this.mediaElement) {
				this.mediaElement.pause();
			}
		}else if (this.audioSprite &! SCSound.webaudio) {
			SCSound.audioSprite.pause();
		}else if (this.load === "stream" &! SCSound.webaudio) {
			SCSound.audioTag.pause();
		}
	}
}
/**
 * Group with effects
 * @param {int} volume
 * @param {array} effect inserts
 * @param {array} effect sends
 * @constructor
 */
SCSound.Core.Group = function(vol, inserts, sends) {
	this.inserts = inserts;
	this.sends = sends;
	this.effects = {};
	if (SCSound.webaudio) {
		this.lastNode = SCSound.Core.SoundController.context.createGainNode(); //volym för gruppen
		this.lastNode.gain.value = vol;
		//this.lastNode.connect(SCSound.Core.SoundController.master);
		this.firstNode = SCSound.Core.SoundController.context.createGainNode();
		this.createFX();
	}
}
SCSound.Core.Group.prototype = {
	/**
	 * Creates effect
	 */
	createFX: function() {
		var lastInsert = this.firstNode;
		if (this.inserts.length > 0) {
			for (var i = 0; i < this.inserts.length; i++) {
				var effect = {};
				if (this.inserts[i].effectId == "Biquad") {
					effect.fx = SCSound.Core.SoundController.context.createBiquadFilter();
					effect.fx.type = effect.fx[this.inserts[i].params["type"]];
					effect.fx.frequency.value = this.inserts[i].params["frequency"];
					effect.fx.Q.value = this.inserts[i].params["Q"];
					effect.fx.gain.value = this.inserts[i].params["gain"];
				}
				lastInsert.connect(effect.fx);
				lastInsert = effect.fx;
				this.effects[this.inserts[i].effectInstance] = effect;
			}
		}
		if (this.sends.length > 0) {
			for (var j = 0; j < this.sends.length; j++) {
				var effect = {};
				if (this.sends[j].effectId == "Convolver") {
					effect.fx = SCSound.Core.SoundController.context.createConvolver();
					this.reverbFile = this.sends[j].params["file"];
					this.hasReverb = effect.fx;
					effect.send = SCSound.Core.SoundController.context.createGainNode();
					lastInsert.connect(effect.send);
					effect.send.connect(effect.fx);
					effect.fx.connect(SCSound.Core.SoundController.master);
					effect.send.gain.value = 1;
				} else if (this.sends[j].effectId == "Delay") {
					effect.fx = SCSound.Core.SoundController.context.createDelayNode();
					effect.fx.delayTime.value = this.sends[j].params["time"];
					effect.send = SCSound.Core.SoundController.context.createGainNode();
					lastInsert.connect(effect.send);
					effect.send.connect(effect.fx);
					effect.fx.connect(SCSound.Core.SoundController.master);
					effect.send.gain.value = 0.5;
				}
				this.effects[this.sends[j].effectInstance] = effect;
			}
		}
		lastInsert.connect(this.lastNode);
	}
}
/**
 * Bus 
 * @param {string} bus name
 * @param {number} evolume
 * @param {bus} bus on level above
 * @param {number} x-pan.
 * @param {number} y-pan.
 * @param {number} z-pan.
 * @param {boolean} has pan.
 * @constructor
 */
SCSound.Core.Bus = function(name, volume, parent, panX, panY, panZ, pan, refDistance, group) {
	this.name = name;
	this.volume = volume;
	this.panX = panX;
	this.panY = panY;
	this.panZ = panZ;
	this.pan = pan;
	this.group = group;
	this.parent = parent;
	if (SCSound.webaudio) {
		this.gainNode = SCSound.Core.SoundController.context.createGainNode();
		this.gainNode.gain.value = this.volume;
		if (this.pan) {
			this.panner = SCSound.Core.SoundController.context.createPanner();
			this.panner.panningModel = "HRTF";
			this.panner.refDistance = refDistance;
			this.panner.setPosition(this.panX, this.panY, this.panZ);
			//SCSound.console.log(this.name, this.panX, this.panY, this.panZ);
			this.panner.connect(this.gainNode);
		}
	}

};
/**
 * Handles event sending
 * @constructor
 */
SCSound.Core.EventBusClass = function() {
	this.listeners = {};
};
SCSound.Core.EventBusClass.prototype = {
	/**
	 * listen to event
	 * @param {string} event name
	 * @param {function} callback.
	 * @param {object} scope
	 */
	addEventListener: function(type, callback, scope) {
		var args = [];
		var numOfArgs = arguments.length;
		for (var i = 0; i < numOfArgs; i++) {
			args.push(arguments[i]);
		}
		args = args.length > 3 ? args.splice(3, args.length - 1) : [];
		if (typeof this.listeners[type] != "undefined") {
			this.listeners[type].push({
				scope: scope,
				callback: callback,
				args: args
			});
		} else {
			this.listeners[type] = [{
				scope: scope,
				callback: callback,
				args: args
			}];
		}
	},
	/**
	 * removes listener
	 * @param {string} event name
	 * @param {function} callback.
	 * @param {object} scope
	 */
	removeEventListener: function(type, callback, scope) {
		if (typeof this.listeners[type] != "undefined") {
			var numOfCallbacks = this.listeners[type].length;
			var newArray = [];
			for (var i = 0; i < numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				if (listener.scope == scope && listener.callback == callback) {} else {
					newArray.push(listener);
				}
			}
			this.listeners[type] = newArray;
		}
	},
	/**
	 * Checks if object has listener
	 * @param {string} event name
	 * @param {function} callback.
	 * @param {object} scope
	 */
	hasEventListener: function(type, callback, scope) {
		if (typeof this.listeners[type] != "undefined") {
			var numOfCallbacks = this.listeners[type].length;
			var newArray = [];
			var hasListener;
			for (var i = 0; i < numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				if (listener.scope == scope && listener.callback == callback) {
					hasListener = true;
				} else {
					hasListener = false;
				}
			}
			return hasListener;
		}
	},
	/**
	 * Dispatches event
	 * @param {string} event name
	 * @param {object} object
	 */
	dispatch: function(type, target) {
		var numOfListeners = 0;
		var event = {
			type: type,
			target: target
		};
		var args = [];
		var numOfArgs = arguments.length;
		for (var i = 0; i < numOfArgs; i++) {
			args.push(arguments[i]);
		};
		args = args.length > 2 ? args.splice(2, args.length - 1) : [];
		args = [event].concat(args);
		if (typeof this.listeners[type] != "undefined") {
			var numOfCallbacks = this.listeners[type].length;
			for (var i = 0; i < numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				if (listener && listener.callback) {
					listener.args = args.concat(listener.args);
					listener.callback.apply(listener.scope, listener.args);
					numOfListeners += 1;
				}
			}
		}
	},
	/**
	 * Return events
	 */
	getEvents: function() {
		var str = "";
		for (var type in this.listeners) {
			var numOfCallbacks = this.listeners[type].length;
			for (var i = 0; i < numOfCallbacks; i++) {
				var listener = this.listeners[type][i];
				str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
				str += " listen for '" + type + "'\n";
			}
		}
		return str;
	}
};

SCSound.AudioSprite = function (src) {
	var _this = this,
	    audio = new Audio();
	
	audio.src = src;
	audio.autobuffer = true;
	audio.load();
		 
	var forcePauseOnLoad = function () {
		audio.pause();
		audio.removeEventListener('play', forcePauseOnLoad, false);
	};	
	audio.addEventListener('play', forcePauseOnLoad, false);

	// PUBLIC STUFF	
	this.updateCallback = null;
	this.audio = audio;
	this.playing = false;

	this.load = function () {
		audio.play();
	};

	this.pause = function () {
		audio.pause();
		_this.playing = false;
		Render.stopRender(_this._timer);
		clearTimeout(_this._backupTimeout);
		//clearInterval(_this._timer);
	};
}
 
SCSound.AudioSprite.prototype.play = function (startTime, duration) {
	var _this = this,
			audio = this.audio,
			nextTime = startTime + duration,
			startTime = Math.round(startTime*100)/100;

	// skip sound if frame rate drops
	if (Global.LAST_FRAME > 1000) {
		return;
	}

	var progress = function () {
		audio.removeEventListener('progress', progress, false);
		if (_this.updateCallback !== null && _this.playing) {
			_this.updateCallback();
		}
	};

	var delayPlay = function () {
		_this.updateCallback = function () {
			_this.updateCallback = null;
			
			if (waitForDuration() || !audio.duration) {
				// still no duration - server probably doesnt send "Accept-Ranges" headers - aborting');
				return;
			}

			audio.currentTime = startTime;
			audio.play();
		};	
		audio.addEventListener('progress', progress, false);
	};
	
	var waitForDuration = function () {
		// is NaN in Firefox
		// is Infinity in Mobile Safari
		// is 100 in Chrome on Android 
		return !isFinite(audio.duration) || audio.duration === 100;
	};

	_this.playing = true; 
	_this.updateCallback = null;

	Render.stopRender(_this._timer);
	audio.removeEventListener('progress', progress, false);
	clearTimeout(_this._backupTimeout);
	//clearInterval(_this._timer);
	audio.pause();

	try {
		if (startTime == 0) startTime = 0.01; // yay hacks. Sometimes setting startTime to 0 doesn't play back
		audio.currentTime = startTime;

		if (waitForDuration() || Math.round(audio.currentTime*100)/100 < startTime) {
			delayPlay();
		} else {
			audio.play();
		}
	} catch (e) {
		delayPlay();
	}

	/*_this._timer = setInterval(function () {
		if (audio.currentTime >= nextTime) {
			_this.pause();
		}
	}, 10);*/
	_this._timer = function () {
		if (audio.currentTime >= nextTime) {
			_this.pause();
			clearTimeout(_this._backupTimeout);
		}
	}
	_this._backupTimeout = setTimeout(function () {
		_this.pause();
	}, (duration*1000) + 1000);

	Render.startRender(_this._timer);
};