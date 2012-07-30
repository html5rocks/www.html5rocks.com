/*
* Copyright (c) 2012 gskinner.com inc.
* Authored by: Trevor Dunn
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

(function(window) {

	/**
	 * This class loads is used to load voices
	 * and assign them their AudioBuffers.
	 */
	VoiceLoader = function (progressCallback) {
		this.initialize(progressCallback);
	};

	var p = VoiceLoader.prototype = {};

// static interface:

	VoiceLoader.CONTEXT = null; // The webkitAudioContext used to create AudioBuffers.

// public properties:

	p.loading = false; // Specifies if this VoiceLoader is loading or not.
	p.progress = 0; // The overall progress of all the voices currently loading.

// private properties:

	p._progressCallback = null; // Callback to dispatch on progress change.

	p._voiceDatas = null; // A list of all voiceDatas.
	p._voiceDatasLoadQueue = null; // A list of all voiceDatas in the queue for loading.
	p._numVoices = 0; // The total number of voices requested to load.
	p._numVoicesLoaded = 0; // The number of voices currently loaded.

	p._currentVoiceData = null; // The current voice that is loading.

// constructor:

	p.initialize = function (progressCallback) {
		this._progressCallback = progressCallback;
		this._reset();
	};

// public methods:

	p.loadVoice = function (voice, successCallback, progressCallback, failCallback) {
		var voiceData = new VoiceData(voice, successCallback, progressCallback, failCallback);
		this._voiceDatas[voice.uid] = voiceData;

		if (voice.loaded || voice.loading || !voice.url) { return; }

		this.loading = true;
		voice.loading = true;
		this._numVoices++;

		/**
		 * The XMLHttpRequest allows you to get the load
		 * progress of your file download and has a responseType
		 * of "arraybuffer" that the Web Audio API uses to
		 * create its own AudioBufferNode.
		 * Note: the 'true' parameter of request.open makes the
		 * request asynchronous - this is required!
		 */
		var request = new XMLHttpRequest();
		request.open("GET", voice.url, true);
		request.responseType = "arraybuffer";
		voiceData.request = request;

		var self = this;
		request.onprogress = function (event) { self._onRequestProgress(event); };
		request.onload = function (event) { self._onRequestLoad(event); };
		request.onerror = function (event) { self._onRequestLoad(event); };
		request.onabort = function (event) { self._onRequestLoad(event); };

		if (this._currentVoiceData) {
			this._voiceDatasLoadQueue.push(voiceData);
		} else {
			this._currentVoiceData = voiceData;
			request.send();
		}
	};

// private methods:

	p._onRequestLoad = function (event) {
		this._currentVoiceData = null;
		this._numVoicesLoaded++;

		var request = event.target;
		request.onprogress = null;
		request.onload = null;
		request.onerror = null;
		request.onabort = null;

		var voiceData = this._getVoiceDataByRequest(request);
		if (voiceData) {
			var voice = voiceData.voice;
			voice.loading = false;
			if (request.status == 200) {
				// The voice load was a success, assign the AudioBuffer.
				voice.buffer = VoiceLoader.CONTEXT.createBuffer(request.response, voice.mono); // The voice.mono parameter specifies if you want to mix the sample to mono.
				voice.loaded = true;
				if (voiceData.successCallback) { voiceData.successCallback(voice); }
			} else if (voiceData.failCallback) {
				// The voice load failed.
				voiceData.failCallback(voice);
			}
			voiceData.reset(); // Reset to free up references.
		} else {
			// Error: can't find voiceData, failing silently.
		}

		this._calculateProgress();

		if (this._voiceDatasLoadQueue.length > 0) {
			this._currentVoiceData = this._voiceDatasLoadQueue.shift();
			this._currentVoiceData.request.send();
		} else {
			// Finished loading all voices.
			if (this._progressCallback) { this._progressCallback(1); }
			this._reset();
		}
	};

	p._onRequestProgress = function (event) {
		var voiceData = this._getVoiceDataByRequest(event.target);
		voiceData.voice.progress = event.loaded / event.total;
		if (voiceData.progressCallback) { voiceData.progressCallback(voiceData.voice, voiceData.voice.progress); }

		this._calculateProgress();
	};

	p._getVoiceDataByRequest = function (request) {
		var voices = this._voiceDatas;
		for (var i = 0, l = voices.length; i < l; i++) {
			if (!voices[i]) { continue; }
			if (voices[i].request == request) { return voices[i]; }
		}
		return null;
	};

	p._calculateProgress = function () {
		var total = this._numVoices;
		if (total == 0) { return 0; }
		var loaded = this._numVoicesLoaded + (this._currentVoiceData ? this._currentVoiceData.voice.progress : 0);
		this.progress = loaded / total;

		if (this._progressCallback) { this._progressCallback(this.progress); }
	};

	p._reset = function () {
		this.loading = false;
		this.progress = 0;

		this._voiceDatas = [];
		this._voiceDatasLoadQueue = [];
		this._numVoices = 0;
		this._numVoicesLoaded = 0;

		this._currentVoiceData = null;
	};

window.VoiceLoader = VoiceLoader;

	/**
	 * A private class used by VoiceLoader that contains
	 * the voice to load, callbacks, and the related XHR request.
	 */
	VoiceData = function (voice, successCallback, progressCallback, failCallback) {
		this.initialize(voice, successCallback, progressCallback, failCallback);
	};

	p = VoiceData.prototype = {};

	p.initialize = function (voice, successCallback, progressCallback, failCallback) {
		this.reset();
		this.voice = voice;
		this.successCallback = successCallback;
		this.progressCallback = progressCallback;
		this.failCallback = failCallback;
	};

	p.reset = function () {
		this.voice = null;
		this.request = null;
		this.successCallback = null;
		this.progressCallback = null;
		this.failCallback = null;
	};

}(window));