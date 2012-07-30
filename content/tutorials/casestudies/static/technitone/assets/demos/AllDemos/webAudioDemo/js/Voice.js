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
	 * This class is just a simple data object that contains
	 * information about a sound file.
	 * @param id Specifies the id used to reference this voice.
	 * @param label Specifies the visual label to use for this voice.
	 * @param url Specifies the url used to load this voice.
	 * @param mono Specifies if the voice is a mono or stereo sample.
	 */
	Voice = function(id, label, url, mono) {
		this.initialize(id, label, url, mono);
	};

	var p = Voice.prototype = {};

// static interface:

	Voice._nextUniqueId = 0; // The next unique id to assigned a newly instantiated voice.

// public properties:

	p.uid = null; // The unique id assigned to this voice.

	p.id = null; // The id used to reference this voice.
	p.label = null; // The visual label to use for this voice.
	p.url = null; // The url used to load this voice.
	p.mono = true; // Specifies if the voice is a mono or stereo sample.

	p.loading = false; // Specifies if this voice is loading or not.
	p.progress = 0; // The current loading progress of this voice.

	p._loaded = false; // Specifies if this voice is fully loaded or not.
	p.__defineGetter__("loaded", function () { return this._loaded; });
	p.__defineSetter__("loaded", function (value) {
		this._loaded = value;
		if (this._loaded) {
			this.loading = false;
			this.progress = 1;
		}
	});

	p.buffer = null; // The AudioBuffer associated with this voice.

// private properties:

// constructor:

	p.initialize = function (id, label, url, mono) {
		this.uid = Voice._nextUniqueId++;

		this.id = id;
		this.label = label;
		this.url = url;
		this.mono = mono != null ? mono : true;
	};

// public methods:

// private methods:

window.Voice = Voice;
}(window));
