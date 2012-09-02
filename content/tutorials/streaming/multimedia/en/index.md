{% include "warning.html" %}

<h2 id="toc-into">Introduction</h2>

In this article, I'll cover two techniques for streaming audio/video using a
few of the newer multimedia capabilities of the web platform. The first method is the
[MediaSource API][mediasource-spec], an API that allows JavaScript to dynamically construct and append media streams to an existing `<audio>` or `<video>` element.
The second is the collaboration of binary [WebSocket](/tutorials/websockets/basics/) and
the [Web Audio API](/tutorials/webaudio/intro/) to send, reconstruct, and schedule
audio chunks at precise times to produce a seamless playback.

<h2 id="toc-mediasource">Method 1: MediaSource API</h2>

An API designed with streaming in mind is the [MediaSource API][mediasource-spec].
It's an experimental feature that allows JavaScript to dynamically construct and append media streams to an `HTMLMediaElement`.

The `<audio>` or `<video>` media elements are frighteningly trivial to use.
That's why we like them! One sets a `src` attribute that points to a media file
and boom, the browser does its thing decoding the file in whatever codec(s) it
was created with. But we're dealing with entire files here. We have no control
over what the browser does after setting that `src`. For example, what if we
want to adaptively change the quality of video based on network conditions, or
splice in different sections of video from multiple sources? Aw shucks.
We can't!...without multiple videos elements and some JS hackery.

The MediaSource API is here to solve these issues. With it, we can tell
an audio/video element to behave differently.

<h3 id="toc-mediasource-enable">Enabling</h3>

The MediaSource API is still experimental and behind
a flag in Chrome 23. It can be enabled by visiting the `about:flags` page:

<figure>
  <img src="aboutflags.png">
  <figcaption>Enabling the MediaSource API in Chrome's <code>about:flags</code> page.</figcaption>
</figure>

Alternatively, you can [run Chrome](http://www.chromium.org/developers/how-tos/run-chromium-with-flags) with the `--enable-media-source` flag
instead of messing with `about:flags`.

<h3 id="toc-mediasource-detect">Feature detection</h3>

    function hasMediaSource() {
      return !!(window.MediaSource || window.WebKitMediaSource);
    }

    if (hasMediaSource()) {
      // Ready to (html5)rock!
    } else {
      alert("Bummer. Your browser doesn't support the MediaSource API!");
    }

<h3 id="mediasource-init">Initialization</h3>

Using the MediaSource API starts off with our old buddy, HTML5 `<video>`:

    <video controls autoplay></video>

<p class="notice" style="text-align:center"><strong>Note:</strong> Although we're going to use <code>&lt;video&gt;</code> for the examples in this section, the same can be applied to <code>&lt;audio&gt;</code>.</p>

Next, create a `MediaSource` object:

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;
    var ms = new MediaSource();

The source is going to be the brains behind our `<video>`. Instead of setting
its the video's `src` to a file URL, we're going to create a blob [blob: URL](https://developer.mozilla.org/en-US/docs/DOM/window.URL.createObjectURL) handle
to the `MediaSource`.  This makes the media element feel special. It knows we're going to do more with it than just feed it a URL. We're going to feed it video
segments! Yum.

The rest of the setup looks like this:

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;

    var ms = new MediaSource();
    ms.addEventListener('webkitsourceopen', onSourceOpen.bind(ms), false);

    // Use MediaSource to supply video data.
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(ms);

    function onSourceOpen(e) {
      // this.readyState === 'open'. Add source buffer that expects webm chunks.
      var sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
      
      // Add chunk of a webm file.
      sourceBuffer.append(webMChunk);
      ....
    }

<p class="notice" style="text-align:center;">
Only the .webm container is supported at this time.
</p>

When `sourceopen` fires on the `MediaSource`, our `<video>` is ready to accept data. We create a `SourceBuffer` (`.addSourceBuffer()`) and pass it a mimetype. This gives the buffer indication of what video format it should expect from us (webm in this case). Lastly, a single chunk of video is dynamically added to the `<video>` using `sourceBuffer.append()`. The chunk is a `Uint8Array` typed array containing a
portion of a webm video.

<h3 id="toc-appending-chunks">Appending additional media and closing the stream</h3>

The above example only appends a single chunk. In practice however,
you'll likely be appending chunks as more come in from the server or an entire
movie is constructed:

    ...
    sourceBuffer.append(initializationWebMChunk);
    sourceBuffer.append(webMChunk2);
    sourceBuffer.append(webMChunk3);

When there's no more data to append, call `.endOfStream()` to indicate you're done.
This also fires the `sourceended` event:

    ms.endOfStream();

    ms.addEventListener('webkitsourceended', function(e) {
      // this.readyState === 'ended'
    }, false);

===

<h3 id="toc-">Example</h3>

<p id="example-download-links"></p>
<button id="example-split-file-button">Split file</button>

<script>
var FILE = '/static/videos/mediasource_test.webm';
var NUM_CHUNKS = 5;

var downloadLinks = document.querySelector('#example-download-links');
var splitFileButton = document.querySelector('#example-split-file-button');

splitFileButton.addEventListener('click', function(e) {
  get(FILE, function(file) {
    //var file = new Blob([blob], {type: 'video/webm'});
    var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

    console.log('num chunks:' + NUM_CHUNKS);
    console.log('chunkSize:' + chunkSize + ', totalSize:' + file.size);

    var fileNameParts = FILE.split('.');

    for (var i = 0; i < NUM_CHUNKS; ++i) {
      var startByte = chunkSize * i;

    console.log(startByte, startByte + chunkSize);

      var chunk = file.slice(startByte, startByte + chunkSize, file.type);

      var a = document.createElement('a');
      a.download = [fileNameParts[0] + i, fileNameParts[1]].join('.');
      a.textContent = 'Download me';
      a.title = chunk.size + ' byte';
      // blob urls created from file parts use original file. See crbug.com/145156.
      a.href = window.URL.createObjectURL(chunk);
      downloadLinks.appendChild(a);
    }
  });
});

function get(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';

  xhr.onload = function(e) {
    if (this.status != 200) {
      alert("Unexpected status code " + this.status + " for " + url);
      return false;
    }
    callback(this.response);
  };

  xhr.send();
}
</script>

Here, we're using XHR2 to pull down the entire movie. The important bits to note are:

- the `xhr.responseType` is set to `"arraybuffer"` to inform the server we're
interested in downloading the resource as a buffer of raw bytes rather than a string.
- TODO

<h3 id="toc-mediasource-chunks">Chunking a file</h3>

Todo


    var NUM_CHUNKS = 5;
    var FILE = '/static/videos/mediasource_test.webm';

    var video = document.querySelector('video');
    video.src = video.webkitMediaSourceURL;

    video.addEventListener('webkitsourceopen', function(e) {
      var chunkSize = Math.ceil(file.size / NUM_CHUNKS);

      // Slice the video into NUM_CHUNKS and append each to the media element.
      for (var i = 0; i < NUM_CHUNKS; ++i) {
        var startByte = chunkSize * i;

        // file is a video file.
        var chunk = file.slice(startByte, startByte + chunkSize);

        var reader = new FileReader();
        reader.onload = (function(idx) {
          return function(e) {
            video.webkitSourceAppend(new Uint8Array(e.target.result));
            logger.log('appending chunk:' + idx);
            if (idx == NUM_CHUNKS - 1) {
              video.webkitSourceEndOfStream(HTMLMediaElement.EOS_NO_ERROR);
            }
          };
        })(i);

        reader.readAsArrayBuffer(chunk);
      }
    }, false);

TODO: Link to DashPlayer
http://downloads.webmproject.org/adaptive-demo/adaptive/dash-player.html


<h2 id="toc-binarywebsockets">Method 2: Binary WebSocket</h2>

Todo

<h3 id="toc-binarywebsockets-detect">Feature detection</h3>

Todo

<h2 id="toc-resources">Additional Resources</h2>

- [MediaSource API Demo](http://html5-demos.appspot.com/static/media-source.html)
- [Segmenting WebM Video and the MediaSource API](http://www.ioncannon.net/utilities/1515/segmenting-webm-video-and-the-mediasource-api/)
- [MediaSource API spec][mediasource-spec]
- [Web Audio API spec][webaudio-spec]
- [WebSocket API][websocket-spec]

<script>
</script>

[mediasource-spec]: http://dvcs.w3.org/hg/html-media/raw-file/tip/media-source/media-source.html
[webaudio-spec]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
[websocket-spec]: http://dev.w3.org/html5/websockets/
