{% include "warning.html" %}

<h2 id="toc-into">Introduction</h2>

In this article, I'll cover two techniques for streaming audio/video using a
few of the newer HTML5 multimedia APIs coming about. The first is the
[MediaSource API][mediasource-spec]. The second is to use a binary [WebSocket](/tutorials/websockets/basics/) to
"stream" audio chunks to connected peers, then reconstruct the audio for the listeners
by using the precise playback scheduling of the [Web Audio API](/tutorials/webaudio/intro/)

<h2 id="toc-mediasource">Option 1: MediaSource API</h2>

The [MediaSource API][mediasource-spec] is an experimental feature implemented in
Chrome that extends the `HTMLMediaElement` (e.g. audio/video) with a simple JavaScript
API that allows you to append segments (or chunks) of a media file onto an existing
audio/video element. Such an API could be used to facilitate common use cases like
adaptive streaming and time shifting live streams.

What it looks like:

    var video = document.querySelector('video');
    video.src = video.webkitMediaSourceURL;

    video.addEventListener('webkitsourceopen', function(e) {
      this.webkitSourceAppend(new Uint8Array(arrayBuffer));
    }, false);

How it works:

1. grab a `<video>` element from the page.
2. populate its `src` with a special URL (`video.webkitMediaSourceURL`) returned by the API.
3. when the `webkitsourceopen` fires, the `<video>` is ready to be appended to.
4. append a single chunk to the `<video>` by passing an `Uint8Array` to `webkitSourceAppend()`.
The `Uint8Array` view is created from an `ArrayBuffer` containing our video chunk (perhaps [obtained from XHR2](/tutorials/file/xhr2/#toc-reponseTypeArrayBuffer)).

<p class="notice" style="text-align:center;">
Only the .webm container is supported at this time.
</p>

The above example only appends a single chunk. In practice however,
you'll likely be appending chunks until the entire movie is constructed.
A real-world example might look like this:

    Todo

Here, we're using XHR2 to pull down the entire movie. The important bits to note are:

- the `xhr.responseType` is set to `"arraybuffer"` to inform the server we're
interested in downloading the resource as a buffer of raw bytes rather than a string.
- TODO

<h3 id="toc-mediasource-enable">Enabling</h3>

The MediaSource API is still experimental. Since it is new, the API is behind
a flag in Chrome 17+. It can be enabled by visiting the `about:flags` page:

<figure>
  <img src="aboutflags.png">
  <figcaption>Enabling the MediaSource API in Chrome's <code>about:flags</code> page.</figcaption>
</figure>

Alternatively, you can [run Chrome](http://www.chromium.org/developers/how-tos/run-chromium-with-flags) with the `--enable-media-source` flag
instead of messing with `about:flags`.

<h3 id="toc-mediasource-detect">Feature detection</h3>

    function hasMediaSource() {
      return !!(HTMLMediaElement.prototype.sourceAppend ||
                HTMLMediaElement.prototype.webkitSourceAppend);
    }

    if (hasMediaSource()) {
      // Ready to (html5)rock!
    } else {
      alert("Sorry. Your browser doesn't support the MediaSource API!");
    }

<h3 id="toc-mediasource-chunks">Chunking a file</h3>

Todo


    var NUM_CHUNKS = 5;
    var FILE = 'test.webm';

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


<h2 id="toc-binarywebsockets">Option 2: Binary WebSocket</h2>

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

[mediasource-spec]: http://html5-mediasource-api.googlecode.com/svn/trunk/draft-spec/mediasource-draft-spec.html
[webaudio-spec]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
[websocket-spec]: http://dev.w3.org/html5/websockets/
