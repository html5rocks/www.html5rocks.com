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
	 * This class connects a voice to a chain of various nodes
	 * that are adjusted to produce a desired output.
	 */
	NodeChain = function() {
		this.initialize();
	};

	var p = NodeChain.prototype = {};

// static interface:

	NodeChain.CONTEXT = null;

	NodeChain.FADE_IN_EXPONENTIAL = 0.1;
	NodeChain.FADE_OUT_EXPONENTIAL = 0.25;

// public properties:

	p.playbackRate = 1;

	p._prevGain = null;
	p._muted = false;
	p.__defineGetter__("muted", function () { return this._muted; });
	p.__defineSetter__("muted", function (value) {
		this._muted = value;
		if (this._muted) { this._prevGain = this.gain; }
		this.gain = this._muted ? 0 : this._prevGain;
	});

	p._gain = 1; // Specifies the gain of this node chain.
	p.__defineGetter__("gain", function () { return this._gain; });
	p.__defineSetter__("gain", function (value) {
		this._gain = value;
		this._gainNode.gain.value = this._gain;
	});

	p._dryGain = 1; // Specifies the gain of the dry sub-chain.
	p.__defineGetter__("dryGain", function () { return this._dryGain; });
	p.__defineSetter__("dryGain", function (value) {
		this._dryGain = value;
		this._dryGainNode.gain.value = this._dryGain;
	});

	p._wetGain = 1; // Specifies the gain of the effects sub-chain.
	p.__defineGetter__("wetGain", function () { return this._wetGain; });
	p.__defineSetter__("wetGain", function (value) {
		this._wetGain = value;
		this._wetGainNode.gain.value = this.wetGain;
	});

	p._delay = false; // Specifies whether delaying is enabled. Disable for optimization.
	p.__defineGetter__("delay", function () { return this._delay; });
	p.__defineSetter__("delay", function (value) {
		var old = this._delay;
		this._delay = value;
		if (old != this._delay) { this._updateWetNodeChain(); }
	});

	p._delayGain = 0.8; // Specifies the amount of feedback given from the delay effect.
	p.__defineGetter__("delayGain", function () { return this._delayGain; });
	p.__defineSetter__("delayGain", function (value) {
		this._delayGain = value;
		this._delayGainNode.gain.value = this._delayGain;
		this.delay = this._delayGain > 0;
	});

	p._delayTime = 0.4; // Specifies the duration between each delay in seconds.
	p.__defineGetter__("delayTime", function () { return this._delayTime; });
	p.__defineSetter__("delayTime", function (value) {
		this._delayTime = value;
		this._delayNode.delayTime.value = this._delayTime;
		this.delay = this._delayTime > 0;
	});

	p._convolve = false; // Specifies whether convolution is enabled. Disable for optimization.
	p.__defineGetter__("convolve", function () { return this._convolve; });
	p.__defineSetter__("convolve", function (value) {
		var old = this._convolve;
		this._convolve = value;
		if (old != this._convolve) { this._updateWetNodeChain(); }
	});

	p.voice = null; // The voice used when noteOn() is called.

	p.__defineGetter__("voiceId", function () { return this.voice ? this.voice.id : null; });

	/**
	 * The impulse response voice used by the ConvolverNode.
	 */
	p.__defineGetter__("impulseResponseVoice", function () { return this._impulseResponseVoice; });
	p.__defineSetter__("impulseResponseVoice", function (voice) {
		this._impulseResponseVoice = voice;
		if (this._impulseResponseVoice) {
			if (this._impulseResponseVoice.loaded) {
				this._convolverNode.buffer = this._impulseResponseVoice.buffer;
			} else {
				this.convolve = false;
				// The buffer isn't loaded yet.
			}
		} else {
			this._convolverNode.buffer = null;
			this.convolve = false;
		}
	});

	p.__defineGetter__("impulseResponseVoiceId", function () { return this._impulseResponseVoice ? this._impulseResponseVoice.id : null; });

// private properties:

	p._gainNode = null; // The last node through which all effects get routed to.
	p._dryGainNode = null; // This node controls the gain of the original dry sound.
	p._wetGainNode = null; // This node controls the gain of all wet effects.
	p._convolverNode = null; // This node is used for applying impulse-responses to your sound.
	p._delayNode = null; // This node controls the delay time for the delay effect.
	p._delayGainNode = null; // This node specifies the feedback for the delay effect.

	p._firstWetNode = null; // The wet node the BufferSource is connected to in noteOn().

	p._sourceNode = null;

// constructor:

	p.initialize = function () {
		this._initRouting();
		this._updateWetNodeChain();
	};

// public methods:

	/**
	 * Connects the node chain to the specified node.
	 */
	p.connect = function (node) {
		this._gainNode.connect(node);
	};

	/**
	 * Disconnects the node chain from all its connections.
	 */
	p.disconnect = function (channel) {
		this._gainNode.disconnect(channel || 0);
	};

	/**
	 * Schedules a sound to playback.
	 */
	p.noteOn = function (noteTime) {
		if (this._muted || !this.voice || !this.voice.loaded) { return; }

		try {
			// Put this in a try/catch in case the audioBuffer is corrupt when assigning it to the AudioBufferSourceNode.

			// The AudioBufferSourceNode is usually the very first node.
			// It's what you feed your AudioBuffer into before it gets
			// manipulated by all the other nodes and outputted to your
			// speakers via the context.destination.
			this._sourceNode = NodeChain.CONTEXT.createBufferSource();
			this._sourceNode.buffer = this.voice.buffer;
			this._sourceNode.playbackRate.value = this.playbackRate;
			this._sourceNode.connect(this._dryGainNode);
			this._sourceNode.connect(this._firstWetNode);

			/**
			 * noteTime is at what time (in seconds relative to the
			 * currentTime attribute of the AudioContext) it needs
			 * to play the sound.
			 *
			 * 0 == now!
			 * 1 == one second from now.
			 * etc...
			 */
			this._sourceNode.noteOn(noteTime);
		} catch (error) {
			// Error: an error occurred when assigning the buffer.
		}
	};

	/**
	 * Fades in the output audio.
	 */
	p.fadeIn = function () {
		this._muted = false;
		this._gainNode.gain.setTargetValueAtTime(this.gain, 0, NodeChain.FADE_IN_EXPONENTIAL);
	};

	/**
	 * Fades out the output audio.
	 */
	p.fadeOut = function () {
		this._muted = true;
		this._gainNode.gain.setTargetValueAtTime(0, 0, NodeChain.FADE_OUT_EXPONENTIAL);
	};

	/**
	 * Readies the instance for garbage-collection.
	 */
	p.destroy = function () {
		this.disconnect();

		this.voice = null;
		this.impulseResponseVoice = null;
	};

// private methods:

	/**
	 * Setup the general routing chain and create any
	 * nodes that may be routed in the future.
	 */
	p._initRouting = function () {
		this._gainNode = NodeChain.CONTEXT.createGainNode();

		this._dryGainNode = NodeChain.CONTEXT.createGainNode();
		this._dryGainNode.connect(this._gainNode);

		this._wetGainNode = NodeChain.CONTEXT.createGainNode();
		this._wetGainNode.connect(this._gainNode);

		this._convolverNode = NodeChain.CONTEXT.createConvolver();

		this._delayGainNode = NodeChain.CONTEXT.createGainNode();
		this._delayGainNode.gain.value = this._delayGain;

		this._delayNode = NodeChain.CONTEXT.createDelayNode();
		this._delayNode.delayTime.value = this._delayTime;
		this._delayNode.connect(this._delayGainNode);

		this._firstWetNode = NodeChain.CONTEXT.createGainNode();
	};

	/**
	 * This is where all effect node routing is updated.
	 * This is where you would add other types of nodes like
	 * Biquad filters, WaveShapers, etc.
	 */
	p._updateWetNodeChain = function () {
		this._convolverNode.disconnect(0);
		this._delayGainNode.disconnect(0);
		this._firstWetNode.disconnect(0);

		var wetNodeChain = [this._wetGainNode];

		if (this.convolve) { wetNodeChain.unshift(this._convolverNode); }
		// ...add other effect node checks here (in order)...
		wetNodeChain.unshift(this._firstWetNode);

		for (var l = wetNodeChain.length, i = l - 2; i >= 0; i--) {
			wetNodeChain[i].connect(wetNodeChain[i + 1]);
		}

		/**
		 * The delay effect needs some special routing.
		 * Unlike most effects, this one takes the sound data out
		 * of the the flow and reinserts it after a specified time.
		 * You can also add an AudioGainNode to quieten the
		 * delayed sound...just so things don't get crazy :)
		 *
		 * Your routing may look like this for example:
		 * AudioBufferSourceNode  ---> CompressorNode > AudioContext.destination
		 *                       |     ^
		 *                       |     |________________________
		 *                       |                             |
		 *                       -> DelayNode > AudioGainNode _|
		 */
		if (this.delay) {
			this._firstWetNode.connect(this._delayNode);
			this._delayGainNode.connect(this._delayNode);
			this._delayGainNode.connect(wetNodeChain[1]);
		}
	};

window.NodeChain = NodeChain;
}(window));
