<h2 id="toc-into">Introduction</h2>

Audio/Video capture has been *the* "Holy Grail" of web development for a long time.
For many years we've had to rely on browser plugins ([Flash](http://www.kevinmusselman.com/2009/02/access-webcam-with-flash/) or
[Silverlight](http://www.silverlightshow.net/items/Capturing-the-Webcam-in-Silverlight-4.aspx))
to get the job done. <a href="http://www.youtube.com/watch?v=SP_9zH9Q44o" target="_blank">Come on!</a>

HTML5 to the rescue. It might not be apparent, but the rise of HTML5 has brought
a surge of access to device hardware. [Geolocation](/tutorials/geolocation/trip_meter/) (GPS),
the [Orientation API](/tutorials/device/orientation/) (accelerometer), [WebGL](/tutorials/webgl/shaders/) (GPU),
and the [Web Audio API](/tutorials/webaudio/intro/) (audio hardware) are perfect examples. These features
are ridiculously powerful, exposing high level JavaScript APIs that sit
on top of the system's underlying hardware capabilities.

This tutorial introduces a new API, [`navigator.getUserMedia()`][getusermedia-spec], which allows
web apps to access a user's camera and microphone.

<h2 id="toc-history">The road to getUserMedia()</h2>

If you're not aware of its history, the way we arrived at the `getUserMedia()` API is an interesting tale.

Several variants of "Media Capture APIs" have evolved over the past few years.
Many folks recognized the need to be able to access native devices on the web, but
that led everyone and their mom to put together a new spec. Things got
so messy that the W3C finally decided to form a working group. Their sole purpose?
Make sense of the madness! The [Device APIs Policy (DAP) Working Group](http://www.w3.org/2009/dap/)
has been tasked to consolidate + standardize the plethora of proposals.

I'll try to summarize what happened in 2011...

<h3 id="toc-round1">Round 1: HTML Media Capture</h3>

[HTML Media Capture](http://dev.w3.org/2009/dap/camera/) was the DAP's first go at
standardizing media capture on the web. It works by overloading the `<input type="file">`
and adding new values for the `accept` parameter.

If you wanted to let users take a snapshot of themselves with the webcam,
that's possible with `capture=camera`:

    <input type="file" accept="image/*;capture=camera">

Recording a video or audio is similar:

    <input type="file" accept="video/*;capture=camcorder">
    <input type="file" accept="audio/*;capture=microphone">

Kinda nice right? I particularly like that it reuses a file input. Semantically,
it makes a lot of sense. Where this particular "API" falls short is the ability to do realtime effects
(e.g. render live webcam data to a `<canvas>` and apply WebGL filters).
HTML Media Capture only allows you to record a media file or take a snapshot in time.

**Support:**

- [Android 3.0 browser](http://developer.android.com/sdk/android-3.0.html) -
one of the first implementations. Check out [this video](http://davidbcalhoun.com/2011/android-3-0-honeycomb-is-first-to-implement-the-device-api) to see it in action.
- Chrome for Android (0.16)
- Firefox Mobile 10.0
- iOS6 Safari and Chrome (partial support)

<h3 id="toc-round2">Round 2: device element</h3>

Many thought HTML Media Capture was too limiting, so a new spec
emerged that supported any type of (future) device. Not surprisingly, the design called
for a new element, the [`<device>` element](http://dev.w3.org/html5/html-device/),
which became the predecessor to `getUserMedia()`.

Opera was among the first browsers to create [initial implementations](http://my.opera.com/core/blog/2011/03/14/web-meet-device)
of video capture based on the `<device>` element. Soon after 
([the same day](http://my.opera.com/core/blog/2011/03/23/webcam-orientation-preview) to be precise),
the WhatWG decided to scrap the `<device>` tag in favor of another up and comer, this time a JavaScript API called 
`navigator.getUserMedia()`. A week later, Opera put out new builds that included
support for the updated `getUserMedia()` spec. Later that year,
Microsoft joined the party by releasing a [Lab for IE9](http://blogs.msdn.com/b/ie/archive/2011/12/09/media-capture-api-helping-web-developers-directly-import-image-video-and-sound-data-into-web-apps.aspx)
supporting the new spec.

Here's what `<device>` would have looked like:

    <device type="media" onchange="update(this.data)"></device>
    <video autoplay></video>
    <script>
      function update(stream) {
        document.querySelector('video').src = stream.url;
      }
    </script>

**Support:**

Unfortunately, no released browser ever included `<device>`.
One less API to worry about I guess :) `<device>` did have two great things going
for it though: 1.) it was semantic, and 2.) it was easily extendible to support
more than just audio/video devices.

Take a breath. This stuff moves fast!

<h3 id="toc-round3">Round 3: WebRTC</h3>

The `<device>` element eventually went the way of the Dodo.

The pace to find a suitable capture API accelerated thanks to the larger [WebRTC][webrtc-spec] (Web Real Time Communications) effort. That spec is overseen by the [W3C WebRTC Working Group](http://www.w3.org/2011/04/webrtc/). Google, Opera, Mozilla, and [a few others](http://webrtc.org) have
implementations.

`getUserMedia()` is related to WebRTC because it's the gateway into that set of APIs.
It provides the means to access the user's local camera/microphone stream.

**Support:**

`getUserMedia()` has been supported since Chrome 21, Opera 18, and Firefox 17.

<h2 id="toc-gettingstarted">Getting started</h2>

With `navigator.getUserMedia()`, we can finally tap into webcam and microphone input without a plugin.
Camera access is now a call away, not an install away. It's baked directly into the browser. Excited yet?

<h3 id="toc-featuredecting">Feature detection</h3>

Feature detecting is a simple check for the existence of `navigator.getUserMedia`:

    function hasGetUserMedia() {
      return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    if (hasGetUserMedia()) {
      // Good to go!
    } else {
      alert('getUserMedia() is not supported in your browser');
    }

You can also [use Modernizr](http://modernizr.com/) to detect `getUserMedia` to avoid the vendor prefix dance yourself:

    if (Modernizr.getusermedia){
      var gUM = Modernizr.prefixed('getUserMedia', navigator);
      gUM({video: true}, function( //...
      //...
    }

<h3 id="toc-acccess">Gaining access to an input device</h3>

To use the webcam or microphone, we need to request permission.
The first parameter to `getUserMedia()` is an object specifying the details and
requirements for each type of media you want to access. For example, if you want to access the webcam, the first parameter should be `{video: true}`. To use both the microphone and camera,
pass `{video: true, audio: true}`:

    <video autoplay></video>

    <script>
      var errorCallback = function(e) {
        console.log('Reeeejected!', e);
      };

      // Not showing vendor prefixes.
      navigator.getUserMedia({video: true, audio: true}, function(localMediaStream) {
        var video = document.querySelector('video');
        video.src = window.URL.createObjectURL(localMediaStream);

        // Note: onloadedmetadata doesn't fire in Chrome when using it with getUserMedia.
        // See crbug.com/110938.
        video.onloadedmetadata = function(e) {
          // Ready to go. Do some stuff.
        };
      }, errorCallback);
    </script>

OK. So what's going on here? Media capture is a perfect example of new HTML5 APIs
working together. It works in conjunction with our other HTML5 buddies, `<audio>` and `<video>`.
Notice that we're not setting a `src` attribute or including `<source>` elements
on the `<video>` element. Instead of feeding the video a URL to a media file, we're feeding
it a [Blob URL](/tutorials/workers/basics/#toc-inlineworkers-bloburis) obtained
from a `LocalMediaStream` object representing the webcam.

I'm also telling the `<video>` to `autoplay`, otherwise it would be frozen on
the first frame. Adding `controls` also works as you'd expected.

If you want something that works cross-browser, try this:

    navigator.getUserMedia  = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia;

    var video = document.querySelector('video');

    if (navigator.getUserMedia) {
      navigator.getUserMedia({audio: true, video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
      }, errorCallback);
    } else {
      video.src = 'somevideo.webm'; // fallback.
    }

<h3 id="toc-constraints">Setting media constraints (resolution, height, width)</h3>

The first parameter to `getUserMedia()` can also be used to specify more requirements
(or constraints) on the returned media stream. For example, instead of just indicating you want basic access to video (e.g. `{vide: true}`), you can additionally require the stream
to be HD:

    var hdConstraints = {
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        }
      }
    };

    navigator.getUserMedia(hdConstraints, successCallback, errorCallback);

    ...

    var vgaConstraints = {
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 360
        }
      }
    };

    navigator.getUserMedia(vgaConstraints, successCallback, errorCallback);

For more configurations, see the [constraints API](http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-MediaTrackConstraints)

<h3 id="toc-source">Selecting a media source</h3>

In Chrome 30 or later, `getUserMedia()` also supports selecting the the video/audio source
using the `MediaStreamTrack.getSources()` API.

In this example, the last microphone and camera that's found is selected as the
media stream source:

    MediaStreamTrack.getSources(function(sourceInfos) {
      var audioSource = null;
      var videoSource = null;

      for (var i = 0; i != sourceInfos.length; ++i) {
        var sourceInfo = sourceInfos[i];
        if (sourceInfo.kind === 'audio') {
          console.log(sourceInfo.id, sourceInfo.label || 'microphone');

          audioSource = sourceInfo.id;
        } else if (sourceInfo.kind === 'video') {
          console.log(sourceInfo.id, sourceInfo.label || 'camera');

          videoSource = sourceInfo.id;
        } else {
          console.log('Some other kind of source: ', sourceInfo);
        }
      }

      sourceSelected(audioSource, videoSource);
    });

    function sourceSelected(audioSource, videoSource) {
      var constraints = {
        audio: {
          optional: [{sourceId: audioSource}]
        },
        video: {
          optional: [{sourceId: videoSource}]
        }
      };

      navigator.getUserMedia(constraints, successCallback, errorCallback);
    }

Check out Sam Dutton's [great demo](https://simpl.info/getusermedia/sources/) of how
to let users select the media source.

<h3 id="toc-security">Security</h3>

Some browsers throw up an infobar upon calling `getUserMedia()`,
which gives users the option to grant or deny access to their camera/mic.
The spec unfortunately is very quiet when it comes to security. For example, here
is Chrome's permission dialog:

<figure>
<img src="permission.png" alt="Permission dialog in Chrome" title="Permission dialog in Chrome">
<figcaption>Permission dialog in Chrome</figcaption>
</figure>

If your app is running from SSL (`https://`), this permission will be persistent.
That is, users won't have to grant/deny access every time.

<h3 id="toc-fallback">Providing fallback</h3>

For users that don't have support for `getUserMedia()`, one option is to fallback
to an existing video file if the API isn't supported and/or the call fails for some reason:

    // Not showing vendor prefixes or code that works cross-browser:

    function fallback(e) {
      video.src = 'fallbackvideo.webm';
    }

    function success(stream) {
      video.src = window.URL.createObjectURL(stream);
    }

    if (!navigator.getUserMedia) {
      fallback();
    } else {
      navigator.getUserMedia({video: true}, success, fallback);
    }

<h3 id="toc-basic-demo">Basic demo</h3>

<div style="text-align:center;">
  <video id="basic-stream" class="videostream" autoplay></video>
  <p><button id="capture-button">Capture video</button> <button id="stop-button">Stop</button></p>
</div>

<h2 id="toc-screenshot">Taking screenshots</h2>

The `<canvas>` API's `ctx.drawImage(video, 0, 0)` method makes it trivial to draw
`<video>` frames to `<canvas>`. Of course, now that we have video
input via `getUserMedia()`,  it's just as easy to create a photo booth application
with realtime video:

    <video autoplay></video>
    <img src="">
    <canvas style="display:none;"></canvas>

    <script>
      var video = document.querySelector('video');
      var canvas = document.querySelector('canvas');
      var ctx = canvas.getContext('2d');
      var localMediaStream = null;

      function snapshot() {
        if (localMediaStream) {
          ctx.drawImage(video, 0, 0);
          // "image/webp" works in Chrome.
          // Other browsers will fall back to image/png.
          document.querySelector('img').src = canvas.toDataURL('image/webp');
        }
      }

      video.addEventListener('click', snapshot, false);

      // Not showing vendor prefixes or code that works cross-browser.
      navigator.getUserMedia({video: true}, function(stream) {
        video.src = window.URL.createObjectURL(stream);
        localMediaStream = stream;
      }, errorCallback);
    </script>


<div style="text-align:center;">
  <video id="screenshot-stream" class="videostream" autoplay></video>
  <img id="screenshot" src="">
  <canvas id="screenshot-canvas" style="display:none;"></canvas>
  <p><button id="screenshot-button">Capture</button> <button id="screenshot-stop-button">Stop</button></p>
</div>

<h2 id="toc-effects">Applying Effects</h2>

<h3 id="toc-effects-css">CSS Filters</h3>

Using [CSS Filters][cssfilters-spec], we can apply some gnarly effects to the `<video>`
as it is captured:

    <style>
    video {
      width: 307px;
      height: 250px;
      background: rgba(255,255,255,0.5);
      border: 1px solid #ccc;
    }
    .grayscale {
      {% mixin filter: grayscale(1); %}
    }
    .sepia {
      {% mixin filter: sepia(1); %}
    }
    .blur {
      {% mixin filter: blur(3px); %}
    }
    ...
    </style>

    <video autoplay></video>

    <script>
    var idx = 0;
    var filters = ['grayscale', 'sepia', 'blur', 'brightness',
                   'contrast', 'hue-rotate', 'hue-rotate2',
                   'hue-rotate3', 'saturate', 'invert', ''];

    function changeFilter(e) {
      var el = e.target;
      el.className = '';
      var effect = filters[idx++ % filters.length]; // loop through filters.
      if (effect) {
        el.classList.add(effect);
      }
    }

    document.querySelector('video').addEventListener(
        'click', changeFilter, false);
    </script>

<div style="text-align:center;">
  <video id="cssfilters-stream" class="videostream" autoplay title="Click me to apply CSS Filters" alt="Click me to apply CSS Filters"></video>
  <p>Click the video to cycle through CSS filters</p>
  <p><button id="capture-button2">Capture video</button> <button id="stop-button2">Stop</button></p>
</div>

<h3 id="toc-effects-webgl">WebGL Textures</h3>

One amazing use case for video capture is to render live input as a WebGL texture.
Since I know absolutely nothing about WebGL (other than it's sweet), I'm going
to suggest you give Jerome Etienne's [tutorial](http://learningthreejs.com/blog/2012/02/07/live-video-in-webgl/)
and [demo](http://learningthreejs.com/data/live-video-in-webgl/) a look. 
It talks about how to use `getUserMedia()` and [Three.js](/tutorials/three/intro/)
to render live video into WebGL.

<h2 id="toc-webaudio-api">Using getUserMedia with the Web Audio API</h2>

One of my dreams is to build AutoTune in the browser with nothing more than open web technology! 

Chrome supports live microphone input from `getUserMedia()` to the [Web Audio API](/tutorials/webaudio/intro/) for real-time effects. Piping microphone input to the Web Audio API looks like this:

    window.AudioContext = window.AudioContext ||
                          window.webkitAudioContext;

    var context = new AudioContext();

    navigator.getUserMedia({audio: true}, function(stream) {
      var microphone = context.createMediaStreamSource(stream);
      var filter = context.createBiquadFilter();

      // microphone -> filter -> destination.
      microphone.connect(filter);
      filter.connect(context.destination);
    }, errorCallback);

Demos:

- [Live Input Visualizer](http://webaudiodemos.appspot.com/input/index.html)
- [Audio Recorder](http://webaudiodemos.appspot.com/AudioRecorder/index.html)
- [Pitch Detector](http://webaudiodemos.appspot.com/pitchdetect/index.html)

For more information, see [Chris Wilson's post](http://updates.html5rocks.com/2012/09/Live-Web-Audio-Input-Enabled).

<h2 id="toc-conclusion">Conclusion</h2>

In general, device access on the web has been a tough cookie to crack. Many
[people have tried](http://www.slideshare.net/jamesgpearce/mobile-device-apis),
few have succeeded. Most of the early ideas have never taken hold outside of a
proprietary environment nor have they gained widespread adoption.

The real problem is that the web's security model is *very* different from the native world.
For example, I probably don't want every Joe Shmoe web site to have random access to my
video camera. It's a tough problem to get right.

Bridging frameworks like [PhoneGap](http://phonegap.com/) have helped push the boundary,
but they're only a start and a temporary solution to an underlying problem. To make web
apps competitive to their desktop counterparts, we need access to native devices.

`getUserMedia()` is but the first wave of access to new types of devices. I hope
we'll continue to see more in the very near future!

<h2 id="toc-resources">Additional resources</h2>

- [W3C specification][getusermedia-spec]
- Bruce Lawson's [HTML5Doctor article](http://html5doctor.com/getusermedia/)
- Bruce Lawson's [dev.opera.com article](http://dev.opera.com/articles/view/getusermedia-access-camera-privacy-ui/)

<h3 id="toc-demos">Demos</h3>

- [Live Photo booth](http://html5-demos.appspot.com/static/getusermedia/photobooth.html)
- [Instant Camera](http://people.opera.com/danield/webapps/instant-camera/)
- [Exploding Video](http://people.opera.com/danield/html5/explode/)
- Paul Neave's [WebGL Camera Effects](http://neave.com/webcam/html5/)
- [Snapster](http://html5photobooth.com/)
- [Live video in WebGL](http://learningthreejs.com/data/live-video-in-webgl/)
- [Play Xylophone with your hands](http://www.soundstep.com/blog/experiments/jsdetection/)

<script>
function errorCallback(e) {
  if (e.code == 1) {
    alert('User denied access to their camera');
  } else {
    alert('getUserMedia() not supported in your browser.');
  }
  //e.target.src = 'http://www.html5rocks.com/en/tutorials/video/basics/Chrome_ImF.ogv';
}

(function() {
var video = document.querySelector('#basic-stream');
var button = document.querySelector('#capture-button');
var localMediaStream = null;

button.addEventListener('click', function(e) {
  if (navigator.getUserMedia) {
    navigator.getUserMedia('video', function(stream) {
      video.src = stream;
      video.controls = true;
      localMediaStream = stream;
    }, errorCallback);
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({video: true}, function(stream) {
      video.src = window.URL.createObjectURL(stream);
      video.controls = true;
      localMediaStream = stream;
    }, errorCallback);
  } else {
    errorCallback({target: video});
  }
}, false);

document.querySelector('#stop-button').addEventListener('click', function(e) {
  video.pause();
  localMediaStream.stop(); // Doesn't do anything in Chrome.
}, false);
})();

(function() {
var video = document.querySelector('#screenshot-stream');
var button = document.querySelector('#screenshot-button');
var canvas = document.querySelector('#screenshot-canvas');
var img = document.querySelector('#screenshot');
var ctx = canvas.getContext('2d');
var localMediaStream = null;

function sizeCanvas() {
  // video.onloadedmetadata not firing in Chrome so we have to hack.
  // See crbug.com/110938.
  setTimeout(function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    img.height = video.videoHeight;
    img.width = video.videoWidth;
  }, 100);
}

function snapshot() {
  ctx.drawImage(video, 0, 0);
  img.src = canvas.toDataURL('image/webp');
}

button.addEventListener('click', function(e) {
  if (localMediaStream) {
    snapshot();
    return;
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia('video', function(stream) {
      video.src = stream;
      localMediaStream = stream;
      sizeCanvas();
      button.textContent = 'Take Shot';
    }, errorCallback);
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({video: true}, function(stream) {
      video.src = window.URL.createObjectURL(stream);
      localMediaStream = stream;
      sizeCanvas();
      button.textContent = 'Take Shot';
    }, errorCallback);
  } else {
    errorCallback({target: video});
  }
}, false);

video.addEventListener('click', snapshot, false);

document.querySelector('#screenshot-stop-button').addEventListener('click', function(e) {
  video.pause();
  localMediaStream.stop(); // Doesn't do anything in Chrome.
}, false);
})();

(function() {
var video = document.querySelector('#cssfilters-stream');
var button = document.querySelector('#capture-button2');
var localMediaStream = null;

var idx = 0;
var filters = [
  'grayscale',
  'sepia',
  'blur',
  'brightness',
  'contrast',
  'hue-rotate', 'hue-rotate2', 'hue-rotate3',
  'saturate',
  'invert',
  ''
];

function changeFilter(e) {
  var el = e.target;
  el.className = '';
  var effect = filters[idx++ % filters.length];
  if (effect) {
    el.classList.add(effect);
  }
}

button.addEventListener('click', function(e) {
  if (navigator.getUserMedia) {
    navigator.getUserMedia('video, audio', function(stream) {
      video.src = stream;
      localMediaStream = stream;
    }, errorCallback);
  } else if (navigator.webkitGetUserMedia) {
    navigator.webkitGetUserMedia({video: true}, function(stream) {
      video.src = window.URL.createObjectURL(stream);
      localMediaStream = stream;
    }, errorCallback);
  } else {
    errorCallback({target: video});
  }
}, false);

document.querySelector('#stop-button2').addEventListener('click', function(e) {
  video.pause();
  localMediaStream.stop(); // Doesn't do anything in Chrome.
}, false);

video.addEventListener('click', changeFilter, false);
})();
</script>

[getusermedia-spec]: http://dev.w3.org/2011/webrtc/editor/getusermedia.html
[webrtc-spec]: http://dev.w3.org/2011/webrtc/editor/webrtc.html
[cssfilters-spec]: https://dvcs.w3.org/hg/FXTF/raw-file/tip/filters/index.html
