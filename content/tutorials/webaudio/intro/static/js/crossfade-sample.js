var CrossfadeSample = {};

CrossfadeSample.play = function() {
  // Create two sources.
  this.ctl1 = createSource(BUFFERS.drums);
  this.ctl2 = createSource(BUFFERS.organ);
  // Mute the second source.
  this.ctl1.gainNode.gain.value = 0;
  // Start playback in a loop
  this.ctl1.source.noteOn(0);
  this.ctl2.source.noteOn(0);
  // Set the initial crossfade to be just source 1.
  this.crossfade(0);

  function createSource(buffer) {
    var source = context.createBufferSource();
    var gainNode = context.createGainNode();
    source.buffer = buffer;
    // Turn on looping
    source.loop = true;
    // Connect source to gain.
    source.connect(gainNode);
    // Connect gain to destination.
    gainNode.connect(context.destination);

    return {
      source: source,
      gainNode: gainNode
    };
  }
};

CrossfadeSample.stop = function() {
  this.ctl1.source.noteOff(0);
  this.ctl2.source.noteOff(0);
};

// Fades between 0 (all source 1) and 1 (all source 2)
CrossfadeSample.crossfade = function(element) {
  var x = parseInt(element.value) / parseInt(element.max);
  // Use an equal-power crossfading curve:
  var gain1 = Math.cos(x * 0.5*Math.PI);
  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
  this.ctl1.gainNode.gain.value = gain1;
  this.ctl2.gainNode.gain.value = gain2;
};

CrossfadeSample.toggle = function() {
  this.playing ? this.stop() : this.play();
  this.playing = !this.playing;
};
