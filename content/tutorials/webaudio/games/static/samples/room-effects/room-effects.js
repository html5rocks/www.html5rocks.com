function RoomEffectsSample(inputs, context) {
  var ctx = this;
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function(e) {
      var value = e.target.value;
      ctx.setImpulseResponse(value);
    });
  }

  this.impulseResponses = [];
  this.buffer = null;

  // Load all of the needed impulse responses and the actual sample.
  var loader = new BufferLoader(context, [
    "sounds/speech.mp3",
    "sounds/impulse-response/telephone.wav",
    "sounds/impulse-response/muffler.wav",
    "sounds/impulse-response/spring.wav",
    "sounds/impulse-response/echo.wav"
  ], onLoaded);

  function onLoaded(buffers) {
    ctx.buffer = buffers[0];
    ctx.impulseResponses = buffers.splice(1);
    ctx.impulseResponseBuffer = ctx.impulseResponses[0];
  }
  loader.load();
}

RoomEffectsSample.prototype.setImpulseResponse = function(index) {
  this.impulseResponseBuffer = this.impulseResponses[index];
  // Change the impulse response buffer.
  this.convolver.buffer = this.impulseResponseBuffer;
};

RoomEffectsSample.prototype.playPause = function() {
  if (!this.isPlaying) {
    // Make a source node for the sample.
    var source = context.createBufferSource();
    source.buffer = this.buffer;
    // Make a convolver node for the impulse response.
    var convolver = context.createConvolver();
    convolver.buffer = this.impulseResponseBuffer;
    // Connect the graph.
    source.connect(convolver);
    convolver.connect(context.destination);
    // Save references to important nodes.
    this.source = source;
    this.convolver = convolver;
    // Start playback.
    this.source.start(0);
  } else {
    this.source.stop(0);
  }
  this.isPlaying = !this.isPlaying;
};
