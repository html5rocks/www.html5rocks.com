// Augment the context with a createMeterNode call that returns an augmented
// JavaScriptAudioNode.

function registerCustomWebAudioNode(context, constructorName, classObject) {
  // Get the webkitAudioContext and extend its prototype.
  webkitAudioContext.prototype[constructorName] = function() {
    var customNode = new classObject(this);
    customNode.prototype = context.createJavaScriptNode(2048, 1, 1);
    return customNode;
  }
}

function MeterNode(context) {
  console.log('init');
}

MeterNode.prototype.onClip = function(callback) {
  // ...
};
