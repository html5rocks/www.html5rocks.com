function MeteringSample(meterElement) {
  this.buffer = null;

  // Load a sample that's overly loud.
  var loader = new BufferLoader(context, ["sounds/chrono.mp3"], onLoaded);

  var ctx = this;
  function onLoaded(buffers) {
    ctx.buffer = buffers[0];
  }
  loader.load();

  this.meterElement = meterElement;
  this.renderMeter();
}

MeteringSample.prototype.playPause = function() {
  if (!this.isPlaying) {
    // Make a source node for the sample.
    var source = context.createBufferSource();
    source.buffer = this.buffer;
    source.loop = true;
    // Run the source node through a gain node.
    var gain = context.createGain();
    gain.gain.value = this.gainValue;
    // Create mix node (gain node to combine everything).
    var mix = context.createGain();
    // Create meter.
    var meter = context.createJavaScriptNode(2048, 1, 1);
    var ctx = this;
    meter.onaudioprocess = function(e) { ctx.processAudio.call(ctx, e) };
    // Connect the whole sound to mix node.
    source.connect(gain);
    gain.connect(mix);
    mix.connect(meter);
    meter.connect(context.destination);
    // Connect source to destination for playback.
    mix.connect(context.destination);

    this.source = source;
    this.gain = gain;
    // Start playback.
    this.source.start(0);
  } else {
    this.source.stop(0);
  }
  this.isPlaying = !this.isPlaying;
};

MeteringSample.prototype.gainRangeChanged = function(e) {
  var value = parseInt(e.value);
  this.gain.gain.value = value;
};

MeteringSample.prototype.processAudio = function(e) {
  var leftBuffer = e.inputBuffer.getChannelData(0);
//  var rightBuffer = e.inputBuffer.getChannelData(1);
  this.checkClipping(leftBuffer);
//  this.checkClipping(rightBuffer);
}

MeteringSample.prototype.checkClipping = function(buffer) {
  var isClipping = false;
  // Iterate through buffer to check if any of the |values| exceeds 1.
  for (var i = 0; i < buffer.length; i++) {
    var absValue = Math.abs(buffer[i]);
    if (absValue >= 1) {
      isClipping = true;
      break;
    }
  }
  this.isClipping = isClipping;
  if (isClipping) {
    this.lastClipTime = new Date();
  }
}

MeteringSample.prototype.renderMeter = function() {
  var didRecentlyClip = (new Date() - this.lastClipTime) < 100;
  this.meterElement.className = didRecentlyClip ? 'clip' : 'noclip';
  var ctx = this;
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  requestAnimationFrame(function() { ctx.renderMeter.call(ctx) });
}
