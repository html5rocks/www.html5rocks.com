{% include "warning.html" %}

<h2 id="toc-into">Introduction</h2>

In this article, I'll cover two techniques for streaming audio/video using a
few of the newer multimedia capabilities in web platform. The first method is the
[MediaSource API][mediasource-spec], an API that allows JavaScript to dynamically construct and append media segments to an existing `<audio>` or `<video>` element.
The second is the collaboration of binary [WebSocket](/tutorials/websockets/basics/) and
the [Web Audio API](/tutorials/webaudio/intro/) to send, reconstruct, and schedule
audio chunks at precise times, producing seamless playback.

<h2 id="toc-mediasource">Method 1: MediaSource API</h2>

An API designed with streaming in mind is the [MediaSource API][mediasource-spec].
It's an experimental feature that allows JavaScript to dynamically append media
to an `HTMLMediaElement`.

HTML `<audio>` and `<video>` are frighteningly trivial to use. Set a `src`
attribute to some URL, and boom, the browser does its thing: loads the media,
decodes it, buffers it, and handles codec issues.

The devil is in the details though. The cost of such simplicity is less flexibility.
First, ee're dealing with the entire file for playback. We have little control
over what the browser does with our media after setting the `src`. For example,
what if we want to adaptively change the quality of video based on network conditions?
Or, splice in different sections of video from multiple sources? Aw shucks. Can't!

*Without multiple media elements and JS hackery, doing anything
more complex than basic playback becomes a week-long chore when using
`<audio>`/`<video>`.*

The MediaSource API is here to solve these issues. With it, we can tell
`<audio>`/`<video>` to behave differently.

<h3 id="toc-mediasource-detect">Feature detection</h3>

The MediaSource API is still experimental but is enabled by default in Chrome 23,
with a vendor prefix:

    function hasMediaSource() {
      return !!(window.MediaSource || window.WebKitMediaSource);
    }

    if (hasMediaSource()) {
      // Ready to (html5)rock!
    } else {
      alert("Bummer. Your browser doesn't support the MediaSource API!");
    }

<h3 id="mediasource-init">Getting started</h3>

To use MediaSource API, start off with your old buddy HTML5 `<video>`:

    <video controls autoplay></video>

<p class="notice" style="text-align:center"><strong>Note:</strong> the examples in this section use <code>&lt;video&gt;</code>, but the same concepts apply to <code>&lt;audio&gt;</code>.</p>

Next, create a `MediaSource` object:

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;
    var ms = new MediaSource();

The source is going to be the brains behind the `<video>`. Instead of setting
its `src` to a file, we're going to create a [blob: URL](https://developer.mozilla.org/en-US/docs/DOM/window.URL.createObjectURL) as the `MediaSource`.  This makes the media element feel special
because it knows we're going to do more than just set a file. We're going to feed it
chunks of video data. Yum!

The rest of the setup looks like this:

    function onSourceOpen(e) {
      // this.readyState === 'open'. Add a source buffer that expects webm chunks.
      sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');

      ....
    }

    var ms = new MediaSource();
    ms.addEventListener('webkitsourceopen', onSourceOpen.bind(ms), false);

    var sourceBuffer = null;

    // Use MediaSource to supply video data.
    var video = document.querySelector('video');
    video.src = window.URL.createObjectURL(ms); // blob URL pointing to the MediaSource.

<p class="notice" style="text-align:center;">
Only the .webm container is supported at this time.
</p>

`sourceopen` fires after setting the blob URL. Once that happens, the `<video>`
is ready to accept incoming data. To hold those bytes, you create a new `SourceBuffer`
in the callback and inform the buffer what mimetype the `<video>` should
expect (webm in this case).

Chunks of .webm can now be dynamically appended to the `<video>`:

    // Append a portion of a webm file.
    sourceBuffer.append(webmChunk);

Herein lies the flexibility of the Media Source API. `.append()` takes an `Uint8Array` [typed array](/tutorials/webgl/typed_arrays/) of data. The format of that data is what we've
specified in `.addSourceBuffer()`. And the thing we're appending is a byte range
of video data, not an entire .webm movie. This is fundamentally different than how
`<video>` normally works.

Of course, if you wanted to, you could append an entire .webm movie in one go!

<h3 id="toc-appending-chunks">Appending chunks of media</h3>

The previous example appended a single chunk of webm to our `<video>`. However,
for the purposes of streaming, we need API functionality that lets us continuously
append new video chunks as they come in from the server. Most people
don't have their media split into a bunch of pieces, so there are a couple of ways
to do this.

**<h4 id="toc-range-headers">Using range requests</h4>**

If your server supports it, you can request portions of a file using the `Range` header. Two APIs that support partial resources out of the box are the [Google Drive API](https://developers.google.com/google-apps/documents-list/#downloading_documents_and_files) and the [App Engine BlobStore API](https://developers.google.com/appengine/docs/python/blobstore/overview#Serving_a_Blob) (via `X-AppEngine-BlobRange`).

You can set custom headers on an XHR request using `setRequestHeader()`. For instance, here's an example of requesting the first 500 bytes of a file:

    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/path/to/video.webm', true);
    xhr.responseType = 'arraybuffer';
    xhr.setRequestHeader('Range', 'bytes=0-500'); // Request first 500 bytes of the video.
    xhr.onload = function(e) {
      var initializationWebMChunk = new Uint8Array(e.target.result);
      sourceBuffer.append(initializationWebMChunk);
    }
    xhr.send();

The first portion of a webm file is the "initialization chunk". It contains the
container's header information and should always be the first segment added.
Don't worry. If your videos are constructed correctly, there's nothing special
you need to do. Just make sure the initialization chunk is indeed the first one
you append.

For subsequent appends, request the appropriate byte range and go to town:

    sourceBuffer.append(webMChunk2);
    sourceBuffer.append(webMChunk3);
    ...

**<h4 id="toc-slicing-file">Slicing a file</h4>**

The second way to dice a file is to do things ahead of time on the server.
However, for demonstration purposes, we can do the same thing client-side using
the File APIs. 

For example, here's how to use XHR to request and slice a file into pieces:

    var FILENAME = 'test.webm';
    var NUM_CHUNKS = 5;

    function get(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';

      xhr.onload = function(e) {
        if (this.status == 200) {
          callback(this.response);
        }
      };

      xhr.send();
    }

    get(FILENAME, function(file) {
      var chunkSize = Math.ceil(file.size / NUM_CHUNKS);
      var fileNameParts = FILENAME.split('.');

      for (var i = 0; i < NUM_CHUNKS; ++i) {
        var startByte = chunkSize * i;

        var chunk = file.slice(startByte, startByte + chunkSize, file.type);

        var a = document.createElement('a');
        a.download = [fileNameParts[0] + i, fileNameParts[1]].join('.');
        a.textContent = 'Download chunk ' + i;
        a.title = chunk.size + ' byte';
        // blob urls created from file parts use original file. See crbug.com/145156.
        a.href = window.URL.createObjectURL(chunk);
        document.body.appendChild(a);
      }
    });

The important bits are:

- `.responseType` is set to `"blob"` to inform the server we're
interested in the resource as a file rather than a string.
- `File.slice()` is used to break up the file into `NUM_CHUNKS` pieces.
- For each chunk, fashion a `blob:` URL using `window.URL.createObjectURL()` and
create a downloadable anchor using `a[download]`.

<h3 id="toc-appending-closing">Closing the stream</h3>

When there's no more data to append, call `.endOfStream()` to indicate you're done.
This also fires the `sourceended` event:

    ms.endOfStream();

    ms.addEventListener('webkitsourceended', function(e) {
      // this.readyState === 'ended'
    }, false);

Now we have everything needed for adaptive streaming. For that use case, we can
detect network changes in JS and append higher/lower quality video chunks based
on the connection.

<h3 id="toc-example-chunks">Example: Chunking a file and appending for continuous playback</h3>

To demonstrate appending video data onto a `<video>`, we need a .webm movie that's
split into multiple pieces. Since you probably don't one of these laying around,
I've created the following script to do that for you. It uses `file.slice()` to
break up a .webm file into `NUM_CHUNKS` pieces.

<b>Select a .webm file:</b><input type="file" id="file-import">
<button id="example-split-file-button">Split file</button>
<p id="example-download-links"></p>
<div id="piechart"></div>
<video id="example-split-video" autoplay></video>

Here, we're using XHR2 to pull down the entire webm movie. The important bits to note are:


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

http://www.smartjava.org/content/record-audio-using-webrtc-chrome-and-speech-recognition-websockets

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
