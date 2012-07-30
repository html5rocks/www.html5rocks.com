<h2 id="toc-intro">Introduction</h2>

HTML5 canvas, which started as an experiment from Apple, is the most
widely supported standard for 2D [immediate mode graphics][immediate] on
the web.  Many developers now rely on it for a wide variety of
multimedia projects, visualizations, and games. However, as the
applications we build increase in complexity, developers inadvertently
hit the performance wall. 

There’s a lot of disconnected wisdom about optimizing canvas
performance. This article aims to consolidate some of this body into a
more readily digestible resource for developers. This article includes
fundamental optimizations that apply to all computer graphics
environments as well as canvas-specific techniques that are subject to
change as canvas implementations improve. In particular, as browser
vendors implement canvas GPU acceleration, some of the outlined
performance techniques discussed will likely become less impactful. This
will be noted where appropriate.

Note that this article does not go into usage of HTML5 canvas. For that,
check out these [canvas related articles][canvas] on HTML5Rocks, this
this [Dive into HTML5 chapter][divehtml] and the [MDN Canvas][mdn]
tutorial.

<h2 id="toc-perf">Performance testing</h2>

To address the quickly changing world of HTML5 canvas, [JSPerf][jsperf]
([jsperf.com][jsperf]) tests verify that every proposed optimization
still works.  JSPerf is a web application that allows developers to
write JavaScript performance tests. Each test focuses on a result that
you’re trying to achieve (for example, clearing the canvas), and
includes multiple approaches that achieve the same result. JSPerf runs
each approach as many times as possible over a short time period and
gives a statistically meaningful number of iterations per second. Higher
scores are always better!

Visitors to a JSPerf performance test page can run the test on their
browser, and let JSPerf store the normalized test results on
[Browserscope][bs] ([browserscope.org][bs]). Because the optimization
techniques in this article are backed up by a JSPerf result, you can
return to see up-to-date information about whether or not the technique
still applies. I’ve written a small [helper application][jspv] that
renders these results as graphs, embedded throughout this article.

<h2 id="toc-pre-render">Pre-render to an off-screen canvas</h2>

If you’re re-drawing similar primitives to the screen across multiple
frames, as is often the case when writing a game, you can make large
performance gains by pre-rendering large parts of the scene.
Pre-rendering means using a separate off-screen canvas (or canvases) on
which to render temporary images, and then rendering the off-screen
canvases back onto the visible one. For those familiar with computer
graphics, this technique is also known as a [display list][dl].

For example, suppose you’re redrawing Mario running at 60 frames a
second. You could either redraw his hat, moustache, and “M” at each
frame, or pre-render Mario before running the animation. 

no pre-rendering:

    // canvas, context are defined
    function render() {
      drawMario(context);
      requestAnimationFrame(render);
    }

pre-rendering:

    var m_canvas = document.createElement('canvas');
    m_canvas.width = 64;
    m_canvas.height = 64;
    var m_context = m_canvas.getContext(‘2d’);
    drawMario(m_context);

    function render() {
      context.drawImage(m_canvas, 0, 0);
      requestAnimationFrame(render);
    }

Note the use of `requestAnimationFrame`, which is discussed in more detail
in a later section. The following graph illustrates the performance
benefits of using pre-rendering (from this
[jsperf](http://jsperf.com/render-vs-prerender)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBiDqJQHDA">
</iframe>

This technique is especially effective when the rendering operation
(`drawMario` in the above example) is expensive. A good example of this is
text rendering, which is a very expensive operation. Here is the sort of
dramatic performance boost you can expect from pre-rendering this
operation (from this [jsperf](http://jsperf.com/render-vs-prerender/3)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBjPoK8HDA">
</iframe>

However, observe that in the above example, the poor performance of the
“pre-rendered loose” test case. When pre-rendering, it’s important to
make sure that your temporary canvas fits snugly around the image you
are drawing, otherwise the performance gain of off-screen rendering is
counterweighted by the performance loss of copying one large canvas onto
another (which varies as a function of source target size). A snug
canvas in the above test is simply smaller:

    can2.width = 100;
    can2.height = 40;

Compared to the loose one that yields poorer performance:

    can3.width = 300;
    can3.height = 100;

<h2 id="toc-batch">Batch canvas calls together</h2>

Since drawing is an expensive operation, it’s more efficient to load the
drawing state machine with a long set of commands, and then have it dump
them all onto the video buffer. In other words, rather than drawing
separate lines:

    for (var i = 0; i < points.length - 1; i++) {
      var p1 = points[i];
      var p2 = points[i+1];
      context.beginPath();
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
      context.stroke();
    }

We get better performance from drawing a single polyline:

    context.beginPath();
    for (var i = 0; i < points.length - 1; i++) {
      var p1 = points[i];
      var p2 = points[i+1];
      context.moveTo(p1.x, p1.y);
      context.lineTo(p2.x, p2.y);
    }
    context.stroke();

This applies to the world of HTML5 canvas as well. When drawing a
complex path, for example, it’s better to put all of the points into the
path, rather than rendering the segments separately
([jsperf](http://jsperf.com/batching-line-drawing-calls/2)).

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBjf9K4HDA">
</iframe>

Note, however, that with Canvas, there’s an important exception to this
rule: if the primitives involved in drawing the desired object have
small bounding boxes (for example, horizontal and vertical lines), it
may actually be more efficient to render them separately
([jsperf](http://jsperf.com/batching-line-drawing-calls)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBjRzK4HDA">
</iframe>

<h2 id="toc-avoid-state-change">Avoid unnecessary canvas state
changes</h2>

The HTML5 canvas element is implemented on top of a state machine that
tracks things like fill and stroke styles, as well as previous points
that make up the current path. When trying to optimize graphics
performance, it’s tempting to focus solely on the graphics rendering.
However, manipulating the state machine can also incur a performance
overhead.

If you use multiple fill colors to render a scene, for example, it’s
cheaper to render by color rather than by placement on the canvas. To
render a pinstripe pattern, you could render a stripe, change colors,
render the next stripe, etc:

    for (var i = 0; i < STRIPES; i++) {
      context.fillStyle = (i % 2 ? COLOR1 : COLOR2);
      context.fillRect(i * GAP, 0, GAP, 480);
    }

Or render all odd stripes and then all even stripes:

    for (var i = 0; i < STRIPES/2; i++) {
      context.fillStyle = COLOR1;
      context.fillRect((i*2) * GAP, 0, GAP, 480);
    }
    for (var i = 0; i < STRIPES/2; i++) {
      context.fillStyle = COLOR2;
      context.fillRect((i*2+1) * GAP, 0, GAP, 480);
    }

The following performance test draws an interlaced pinstripe pattern
using the two approaches
([jsperf](http://jsperf.com/changing-canvas-state)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBjMsK4HDA">
</iframe>

As expected, the interlaced approach is slower because changing the
state machine is expensive.

<h2 id="toc-render-diff">Render screen differences only, not the whole
new state</h2>

As one would expect, rendering less on the screen is cheaper than
rendering more. If you have only incremental differences between
redraws, you can get a significant performance boost by just drawing the
difference. In other words, rather than clearing the whole screen before
drawing:

    context.fillRect(0, 0, canvas.width, canvas.height);

Keep track of the drawn bounding box, and only clear that.

    context.fillRect(last.x, last.y, last.width, last.height);

This is illustrated in the following performance test which involves a
white dot crossing the screen
([jsperf](http://jsperf.com/partial-re-rendering/2)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBiXy8wHDA">
</iframe>

If you are familiar with computer graphics, you might also know this
technique as “redraw regions”, where the previously rendered bounding
box is saved, and then cleared on each rendering.

This technique also applies to pixel-based rendering contexts, as is
illustrated by this JavaScript [Nintendo emulator talk][nesemu].

<h2 id="toc-mul-canvas">Use multiple layered canvases for complex
scenes</h2>

As mentioned before, drawing large images is expensive and should be
avoided if possible. In addition to using another canvas for rendering
off screen, as illustrated in the pre-rendering section, we can also use
canvases layered on top of one another. By using transparency in the
foreground canvas, we can rely on the GPU to composite the alphas
together at render time. You might set this up as follows, with two
absolutely positioned canvases one on top of the other.

    <canvas id="bg" width="640" height="480" style="position: absolute; z-index: 0">
    </canvas>
    <canvas id="fg" width="640" height="480" style="position: absolute; z-index: 1">
    </canvas>

The advantage over having just one canvas here, is that when we draw or
clear the foreground canvas, we don’t ever modify the background. If
your game or multimedia app can be split up into a foreground and
background, consider rendering these on separate canvases to get a
significant performance boost. The following graph compares the naive
single canvas case to one where you merely redraw and clear the
foreground ([jsperf](http://jsperf.com/layered-canvases/3)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBjeg68HDA">
</iframe>

You can often take advantage of imperfect human perception and render
the background just once or at a slower speed compared to the foreground
(which is likely to occupy most of your user’s attention). For example,
you can render the foreground every time you render, but render the
background only every Nth frame.

Also note that this approach generalizes well for any number of
composite canvases if your application works better with a this sort of
structure.

<h2 id="toc-avoid-blur">Avoid shadowBlur</h2>

Like many other graphics environments, HTML5 canvas allows developers to
blur primitives, but this operation can be very expensive:

    context.shadowOffsetX = 5;
    context.shadowOffsetY = 5;
    context.shadowBlur = 4;
    context.shadowColor = 'rgba(255, 0, 0, 0.5)';
    context.fillRect(20, 20, 150, 100);

The following performance test shows the same scene rendered with and
without shadow and the drastic performance difference
([jsperf](http://jsperf.com/layered-canvases/3)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBiwja8HDA">
</iframe>

<h2 id="toc-clear-canvas">Know various ways to clear the canvas</h2>

Since HTML5 canvas is an [immediate mode][immediate] drawing paradigm,
the scene needs to be redrawn explicitly at each frame. Because of this,
clearing the canvas is a fundamentally important operation for HTML5
canvas apps and games.

As mentioned in the
[Avoid canvas state changes](#avoid-canvas-state-changes) section,
clearing the entire canvas is often undesirable, but if you *must* do
it, there are two options: calling `context.clearRect(0, 0, width,
height)` or using a canvas-specific hack to do it: `canvas.width =
canvas.width`;.

At the time of writing, `clearRect` generally outperforms the width
reset version, but in some cases using the `canvas.width` resetting hack
is significantly faster in Chrome 14
([jsperf](http://jsperf.com/canvas-clear-speed )):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBj_2JEGDA">
</iframe>

Be careful with this tip, since it depends heavily on the underlying
canvas implementation and is very much subject to change. For more
information, see [Simon Sarris' article on clearing the canvas][clear].

<h2 id="toc-avoid-float">Avoid floating point coordinates</h2>

HTML5 canvas supports sub-pixel rendering, and there’s no way to turn it
off. If you draw with coordinates that are not integers, it
automatically uses anti-aliasing to try to to smooth out the lines.
Here’s the visual effect, taken from
[this sub-pixel canvas performance article by Seb Lee-Delisle][subpixel]:

![sub-pixel](bunny.png)

If the smoothed sprite is not the effect you seek, it can be much faster
to convert your coordinates to integers using `Math.floor` or
`Math.round` ([jsperf](http://jsperf.com/drawimage-whole-pixels)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBiRk-kDDA">
</iframe>

To convert your floating point coordinates to integers, you can use
several clever techniques, the most performant of which involve adding
one half to the target number, and then performing bitwise operations on
the result to eliminate the fractional part.

    // With a bitwise or.
    rounded = (0.5 + somenum) | 0;
    // A double bitwise not.
    rounded = ~~ (0.5 + somenum);
    // Finally, a left bitwise shift.
    rounded = (0.5 + somenum) << 0;

The full performance breakdown is here
([jsperf](http://jsperf.com/math-round-vs-hack/3)):

<iframe src="embed.html?id=agt1YS1wcm9maWxlcnINCxIEVGVzdBj36qAEDA">
</iframe>

Note that this sort of optimization should no longer matter once canvas
implementations are GPU accelerated which will be able to quickly
render non-integer coordinates.

<h2 id="toc-raf">Optimize your animations with
`requestAnimationFrame`</h2>

The relatively new `requestAnimationFrame` API is the recommended way of
implementing interactive applications in the browser. Rather than
command the browser to render at a particular fixed tick rate, you
politely ask the browser to call your rendering routine and get called
when the browser is available. As a nice side effect, if the page is not
in the foreground, the browser is smart enough not to render.

The `requestAnimationFrame` callback aims for a 60 FPS callback rate but
doesn’t guarantee it, so you need to keep track of how much time passed
since the last render. This can look something like the following:

    var x = 100;
    var y = 100;
    var lastRender = new Date();
    function render() {
      var delta = new Date() - lastRender;
      x += delta;
      y += delta;
      context.fillRect(x, y, W, H);
      requestAnimationFrame(render);
    }
    render();

Note that this use of `requestAnimationFrame` applies to canvas as well as
other rendering technologies such as WebGL.

At the time of writing, this API is only available in Chrome, Safari and
Firefox, so you should use [this shim][rafshim].

<h2 id="toc-mobile">Most mobile canvas implementations are slow</h2>

Let’s talk about mobile. Unfortunately at the time of writing, only iOS
5.0 beta running Safari 5.1 has GPU accelerated mobile canvas
implementation. Without GPU acceleration, mobile browsers don’t
generally have powerful enough CPUs for modern canvas-based
applications. A number of the JSPerf tests described above perform an
order of magnitude worse on mobile compared to desktop, greatly
restricting the kinds of cross-device apps you can expect to
successfully run.

<h2 id="toc-conclusion">Conclusion</h2>

To recap, this article covered a comprehensive set of useful
optimization techniques that will help you develop performant HTML5
canvas-based projects. Now that you’ve learned something new here, go
forth and optimize your awesome creations. Or, if you don’t currently
have a game or application to optimize, check out
[Chrome Experiments][crexp] and [Creative JS][cjs] for inspiration.

<h2 id="toc-ref">References</h2>

* [Immediate][immediate] mode vs. [retained][] mode.
* Other HTML5Rocks [canvas articles][canvas].
* The [Canvas section][divehtml] of Dive into HTML5.
* [JSPerf][jsperf] lets developers create JS performance tests.
* [Browserscope][bs] stores browser performance data.
* [JSPerfView][jspv], which renders JSPerf tests as charts.
* Simon's [blog post][clear] on clearing the canvas.
* Sebastian's [blog post][subpixel] on sub-pixel rendering performance.
* Paul's [blog post][rafshim] on using the `requestAnimationFrame`.
* Ben's [talk][nesemu] about optimizing a JS NES emulator.

[immediate]: http://en.wikipedia.org/wiki/Immediate_mode
[retained]: http://en.wikipedia.org/wiki/Retained_mode
[canvas]: http://www.html5rocks.com/en/tutorials/#canvas
[divehtml]: http://diveintohtml5.info/canvas.html
[mdn]: https://developer.mozilla.org/en/canvas_tutorial
[bs]: http://www.browserscope.org/
[jsperf]: http://jsperf.com/
[dl]: http://en.wikipedia.org/wiki/Display_list
[nesemu]: http://jsconf.eu/2010/speaker/lessons_learnt_pushing_browser.html
[rafshim]: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
[crexp]: http://www.chromeexperiments.com/
[cjs]: http://creativejs.com/
[subpixel]: http://sebleedelisle.com/2011/02/html5-canvas-sprite-optimisation
[clear]: http://simonsarris.com/blog/346-how-you-clear-your-canvas-matters
[jspv]: https://github.com/borismus/jsperfview

