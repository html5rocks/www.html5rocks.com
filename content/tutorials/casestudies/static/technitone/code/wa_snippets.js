/***********************
 * Loading a sound file:
 **********************/

/**
 * The XMLHttpRequest allows you to get the load
 * progress of your file download and has a responseType
 * of "arraybuffer" that the Web Audio API uses to
 * create its own AudioBufferNode.
 * Note: the 'true' parameter of request.open makes the
 * request asynchronous - this is required!
 */
var request = new XMLHttpRequest();
request.open("GET", "mySample.mp3", true);
request.responseType = "arraybuffer";
request.onprogress = onRequestProgress; // Progress callback.
request.onload = onRequestLoad; // Complete callback.
request.onerror = onRequestError; // Error callback.
request.onabort = onRequestError; // Abort callback.
request.send();

// Use this context to create nodes, route everything together, etc.
var context = new webkitAudioContext();

// Feed this AudioBuffer into your AudioBufferSourceNode:
var audioBuffer = null;

function onRequestProgress (event) {
	var progress = event.loaded / event.total;
}

function onRequestLoad (event) {
	// The 'true' parameter specifies if you want to mix the sample to mono.
	audioBuffer = context.createBuffer(request.response, true);
}

function onRequestError (event) {
	// An error occurred when trying to load the sound file.
}


/*********************
 * Setup node routing:
 ********************/

/**
 * Generally you'll want to set up your routing like this:
 * AudioBufferSourceNode > [effect nodes] > CompressorNode > AudioContext.destination
 * Note: nodes are designed to be able to connect to multiple nodes.
 */

// The DynamicsCompressorNode makes the loud parts
// of the sound quieter and quiet parts louder.
var compressorNode = context.createDynamicsCompressor();
compressorNode.connect(context.destination);

// [other effect nodes]

// Create and route the AudioBufferSourceNode when you want to play the sample.


/********************************************************************
 * Applying a sound file (impulse response) as an convolution effect:
 *******************************************************************/

/**
 * Your routing now looks like this:
 * AudioBufferSourceNode > ConvolverNode > CompressorNode > AudioContext.destination
 */

var convolverNode = context.createConvolver();
convolverNode.connect(compressorNode);
convolverNode.buffer = impulseResponseAudioBuffer;


/********************************
 * Applying another delay effect:
 *******************************/

/**
 * The delay effect needs some special routing.
 * Unlike most effects, this one takes the sound data out
 * of the the flow, reinserts it after a specified time (while
 * looping it back into itself for another iteration).
 * You should add an AudioGainNode to quieten the
 * delayed sound...just so things don't get crazy :)
 *
 * Your routing now looks like this:
 * AudioBufferSourceNode -> ConvolverNode > CompressorNode > AudioContext.destination
 *                       |  ^
 *                       |  |___________________________
 *                       |  v                          |
 *                       -> DelayNode > AudioGainNode _|
 */

var delayGainNode = context.createGainNode();
delayGainNode.gain.value = 0.7; // Quieten the feedback a bit.
delayGainNode.connect(convolverNode);

var delayNode = context.createDelayNode();
delayNode.delayTime = 0.5; // Re-sound every 0.5 seconds.
delayNode.connect(delayGainNode);

delayGainNode.connect(delayNode); // make the loop

/***************************
 * Making the sound audible:
 **************************/

/**
 * Once your routing is set up properly, playing a sound
 * is easy-shmeezy. All you need to do is create an
 * AudioSourceBufferNode, route it, and tell it what time
 * (in seconds relative to the currentTime attribute of
 * the AudioContext) it needs to play the sound.
 *
 * 0 == now!
 * 1 == one second from now.
 * etc...
 */

var sourceNode = context.createBufferSource();
sourceNode.connect(convolverNode);
sourceNode.connect(delayNode);
sourceNode.buffer = audioBuffer;
sourceNode.noteOn(0); // play now!