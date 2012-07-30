It's a fair bet you've done some animation work in your time as a developer, whether that's smaller UI effects or large iteractive canvas pieces. Chances are you've also come across `requestAnimationFrame`, or rAF (we say it _raff_ around these parts), and hopefully you've had chance to use it in your projects. In case you don't know, `requestAnimationFrame` is the browser's native way of handling your animations. Because rAF is specifically designed to deal with animation and rendering, the browser can schedule it at the most appropriate time and, if we play our cards right, it will help us get a buttery smooth 60 frames per second.

What we want to do in this article is **outline some additional ways to ensure you're getting the maximum benefit from your animation code.** Even if you're using `requestAnimationFrame` there are other ways you can end up with bottlenecks in your animations. At 60 frames per second each frame that you draw has 16.67ms to get everything done. That's not a lot, so every optimisation counts!

> **TL;DR** Decouple your events from animations; avoid animations that result in reflow-repaint loops; update your rAF calls to expect a high resolution timestamp as the first parameter; only call rAF when you have visual updates to do.


## Debouncing Scroll Events

Debouncing is the process of decoupling your animation from any inputs that affect it. Take, for example, an effect that is triggered when you scroll the page. The effect might check if some DOM elements are visible to the user and then, if they are, apply some CSS classes to those elements.

Or maybe you're coding a parallax scrolling effect where, as you scroll, background images change their position relative to page's scroll position. I'll go with the former of the two common uses, and the general gist of our code might be:

	function onScroll() {
		update();
	}

	function update() {

		// assume domElements has been declared
		// by this point :)
		for(var i = 0; i < domElements.length; i++) {

			// read offset of DOM elements
			// to determine visibility - a reflow

			// then apply some CSS classes
			// to the visible items	- a repaint

		}
	}

	window.addEventListener('scroll', onScroll, false);

The main issue here is that we are triggering a reflow and repaint whenever we get a scroll event: we ask the browser to recalculate the **real positions** of DOM elements, an expensive reflow operation, and then we apply some CSS classes, which causes the browser to repaint. We end up ping-ponging between reflowing and repainting, and this is going to undermine your app's performance. We're picking on scroll events here, but the same applies to resize events. In fact, any event that you're going to make use of in this way can cause performance issues. Read Tony Gentilcore's Fastersite blog post for a [breakdown of properties that cause a reflow in WebKit](http://gent.ilcore.com/2011/03/how-not-to-trigger-layout-in-webkit.html).

What we now need to do is decouple the scroll event from the `update` function, and this is exactly where `requestAnimationFrame` steps in to help. We need to change things around so that we are listening to our scroll events, but we will only store the most recent value:

	var latestKnownScrollY = 0;

	function onScroll() {
		latestKnownScrollY = window.scrollY;
	}

Now we're in a better place: `onScroll` runs whenever the browser chooses to execute it, but all we're doing is storing the window's scroll position. This code could run once, twenty or a hundred times _before_ we try to use the value in our animation and it wouldn't matter. The point is that we're keeping a track on the value but it's not using it to trigger potentially unnecessary draw calls. If your draw call is expensive then you'll really benefit from avoiding those extra calls.

The other part of this change is to use `requestAnimationFrame` to handle the visual updates at the most convenient time for the browser:

	function update() {
		requestAnimationFrame(update);

		var currentScrollY = latestKnownScrollY;

		// read offset of DOM elements
		// and compare to the currentScrollY value
		// then apply some CSS classes
		// to the visible items
	}

	// kick off
	requestAnimationFrame(update);


Now we're just pulling the latest value from `lastKnownScrollY` when we need it and discarding everything else. If you need to capture all the event values since the last draw you could use an array and push all the values captured in `onScroll` onto it. When the time comes to do the drawing you could average the values or do whatever's most appropriate. In this case we're keeping it simple and only tracking the last value we captured.

What else can we do? Well for one thing we are constantly running `requestAnimationFrame` and that's not necessary if we haven't just scrolled since nothing will have changed. To fix that we have the onScroll initiate the `requestAnimationFrame`:

	var latestKnownScrollY = 0,
		ticking = false;

	function onScroll() {
		latestKnownScrollY = window.scrollY;
		requestTick();
	}

	function requestTick() {
		if(!ticking) {
			requestAnimationFrame(update);
		}
		ticking = true;
	}

Now whenever we scroll we will try and call `requestAnimationFrame`, but if one is already requested we _don't initiate another_. This is an important optimization, since the browser will stack all the repeated rAF requests and we would be back to a situation with more calls to `update` than we need.

Thanks to this setup we no longer need to call `requestAnimationFrame` at the top of update because we know it will only be requested when one or more scroll events has taken place. We also no longer need the kick off call at the bottom, either, so let's update accordingly:

	function update() {
		// reset the tick so we can
		// capture the next onScroll
		ticking = false;

		var currentScrollY = latestKnownScrollY;

		// read offset of DOM elements
		// and compare to the currentScrollY value
		// then apply some CSS classes
		// to the visible items
	}

	// kick off - no longer needed! Woo.
	// update();

Hopefully you can see the benefits of debouncing the animations in your app from any scroll or resize events that influence it. If you're still in any doubt, John Resig wrote a great article about how [Twitter was affected by scroll events](http://ejohn.org/blog/learning-from-twitter/) a while ago. Had rAF been around back then, the above technique would likely been his recommendation.

## Debouncing Mouse Events

We've gone through one common use-case for using rAF to decouple animations from scroll and resize events, now let's talk about another one: using it to deal with interactions. In this instance we're going to have something stick to the current mouse position, but only when the mouse button is pressed. When it's released we'll stop the animation.

Let's jump straight into the code, then we'll pick it apart:

	var mouseIsDown = false,
		lastMousePosition = { x: 0, y: 0 };

	function onMouseDown() {
		mouseIsDown = true;
		requestAnimationFrame(update);
	}

	function onMouseUp() {
		mouseIsDown = false;
	}

	function onMouseMove(evt) {
		lastMousePosition.x = evt.clientX;
		lastMousePosition.y = evt.clientY;
	}

	function update() {
		if(mouseIsDown) {
			requestAnimationFrame(update);
		}

		// now draw object at lastMousePosition
	}

	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('mouseup',   onMouseUp,   false);
	document.addEventListener('mousemove', onMouseMove, false);

In this instance we are setting a boolean (`mouseIsDown`) depending on whether or not the mouse button is currently pressed. We can also piggy back on the `mousedown` event to initiate the first `requestAnimationFrame` call, which is handy. As we move the mouse we do a similar trick to the previous example where we simply store the last known position of the mouse, which we later use in the `update` function. The last thing to notice is that `update` requests the next animation frame until we've called `onMouseUp` and `mouseIsDown` is set back to `false`.

Again our tactic here is to let the mouse events all proceed as often as the browser deems necessary, and we have the draw calls happen _independently_ of those events. Not dissimilar to what we do with scroll events.

If things are a little more complex and you're animating something that carries on moving after `onMouseUp` has been called, you'll need to manage the calls to `requestAnimationFrame` differently. A suitable solution is to track the position of the animating object and when the change on two subsequent frames drops below a certain threshold you stop calling `requestAnimationFrame`. The changes to our code would look a little like this:

	var mouseIsDown = false,
		lastMousePosition = { x: 0, y: 0 },
		rAFIndex = 0;

	function onMouseDown() {
		mouseIsDown = true;

		// cancel the existing rAF
		cancelAnimationFrame(rAFIndex);

		rAFIndex = requestAnimationFrame(update);
	}

	// other event handlers as above

	function update() {

		var objectHasMovedEnough = calculateObjectMovement();

		if(objectHasMovedEnough) {
			rAFIndex = requestAnimationFrame(update);
		}

		// now draw object at lastMousePosition
	}

	function calculateObjectMovement() {

		var hasMovedFarEnough = true;

		// here we would perhaps use velocities
		// and so on to capture the object
		// movement and set hasMovedFarEnough
		return hasMovedFarEnough;
	}

The main change in the above comes from the fact that if you release the mouse the rAF calls would continue until the object has come to a rest _but_ you may start clicking and dragging again meaning you would get a second rAF call scheduled _as well as the original_. Not good. To combat this we make sure to cancel any scheduled `requestAnimationFrame` call (in `onMouseDown`) before we set about issuing a new one.

## requestAnimationFrame and High Resolution Timestamps

While we're spending some time talking about `requestAnimationFrame` it's worth noting a recent change to how callbacks are handled in Canary. Going forward the parameter passed to your callback function will be a high resolution timestamp, accurate to a fraction of a millisecond. Two things about this:

1. It's awesome for your animations if they're time-based because now they can be really accurate
2. You'll need to update any code you have in place today that expects an object or element to be the first parameter

Get the full rundown of this at: [requestAnimationFrame API: now with sub-millisecond precision](http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision)

## An Example

OK, let's finish this article off with an example, just so you can see it all in action. It's slightly contrived, and we'll also throw in a bonus performance killer that we can fix as we go. Way too much fun!

We have a document with 800 DOM elements that we're going to move when you scroll the mouse. Because we're well-versed in modern web development we're going to use CSS transitions and `requestAnimationFrame` from the off. As we scroll down the page we'll determine which of our 800 DOM elements are now above the middle of the visible area of the screen and we'll move them over to the left hand side by adding a `left` class.

It's worth bearing in mind that we've chosen such a large number of elements because it will allow us to really see any performance issues more easily. And there are some.

Here's what our JavaScript looks like:

	var movers = document.querySelectorAll('.mover');

	/**
	 * Set everthing up and position all the DOM elements
	 * - normally done with the CSS but, hey, there's heaps
	 * of them so we're doing it here!
	 */
    (function init() {

        for(var m = 0; m < movers.length; m++) {
            movers[m].style.top = (m * 10) + 'px';
        }

    })();

	/**
	 * Our animation loop - called by rAF
	 */
    function update() {

    	// grab the latest scroll position
        var scrollY             = window.scrollY,
            mover               = null,
            moverTop            = [],
            halfWindowHeight    = window.innerHeight * 0.5,
            offset              = 0;

		// now loop through each mover div
		// and change its class as we go
        for(var m = 0; m < movers.length; m++) {

            mover       = movers[m];
            moverTop[m] = mover.offsetTop;

            if(scrollY > moverTop[m] - halfWindowHeight) {
                mover.className = 'mover left';
            } else {
                mover.className = 'mover';
            }

        }

		// keep going
        requestAnimationFrame(update);
    }

	// schedule up the start
    window.addEventListener('load', update, false);


<figure>
  <a href="pre.html">
  <img src="pre-particle.jpg">
  </a>
  <figcaption>
  Our demo page before performance and rAF optimizations
  </figcaption>
</figure>

If you check out the [pre-optimized page](pre.html) you'll see it really struggle to keep up as you scroll, and there are a number of reasons why. Firstly we are brute force calling the `requestAnimationFrame`, whereas what we really should do is only calculate any changes when we get a scroll event. Secondly we are calling `offsetTop` which causes a reflow, but then we immediately apply the `className` change and that's going to cause a repaint. And then thirdly, for our bonus performance killer, we are using `className` rather than `classList`.

The reason using `className` is less performant than `classList` is that `className` will _always_ affect the DOM element, even if the value of `className` hasn't changed. By just setting the value we trigger a repaint, which can be very expensive. Using `classList`, however, allows the browser to be much more intelligent about updates, and it will leave the element alone should the list already contain the class you're adding (which is `left` in our case).

If you want more information on using `classList` and the new-and-extremely-useful frame breakdown mode in Chrome's Dev Tools you should watch this video by Paul Irish:

<iframe width="640" height="360" src="http://www.youtube.com/embed/hZJacl2VkKo?rel=0" frameborder="0" allowfullscreen></iframe>

So let's take a look at what a better version of this would look like:

    var movers          = document.querySelectorAll('.mover'),
        lastScrollY     = 0,
        ticking         = false;

	/**
	 * Set everthing up and position all the DOM elements
	 * - normally done with the CSS but, hey, there's heaps
	 * of them so we're doing it here!
	 */
    (function init() {

        for(var m = 0; m < movers.length; m++) {
            movers[m].style.top = (m * 10) + 'px';
        }

    })();

	/**
	 * Callback for our scroll event - just
	 * keeps a track on the last scroll value
	 */
    function onScroll() {
        lastScrollY = window.scrollY;
        requestTick();
    }

	/**
	 * Calls rAF if it's not already
	 * been done already
	 */
    function requestTick() {
        if(!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }

	/**
	 * Our animation callback
	 */
    function update() {
        var mover               = null,
            moverTop            = [],
            halfWindowHeight    = window.innerHeight * 0.5,
            offset              = 0;

		// first loop is going to do all
		// the reflows (since we use offsetTop)
        for(var m = 0; m < movers.length; m++) {

            mover       = movers[m];
            moverTop[m] = mover.offsetTop;
        }

		// second loop is going to go through
		// the movers and add the left class
		// to the elements' classlist
        for(var m = 0; m < movers.length; m++) {

            mover       = movers[m];

            if(lastScrollY > moverTop[m] - halfWindowHeight) {
                mover.classList.add('left');
            } else {
                mover.classList.remove('left');
            }

        }

		// allow further rAFs to be called
        ticking = false;
    }

	// only listen for scroll events
    window.addEventListener('scroll', onScroll, false);


<figure>
  <a href="post.html">
  <img src="post-particle.jpg">
  </a>
  <figcaption>
  Our demo page after performance and rAF optimizations
  </figcaption>
</figure>

If you look at [our new optimized version of the demo](post.html) you will see much smoother animations as you scroll up and down the page. We've stopped calling `requestAnimationFrame` indiscriminantly, we now only do it when we scroll (and we ensure there is only one call scheduled). We've also moved the `offsetTop` property lookups into one loop and put the class changes into a second loop which means that we're avoiding the reflow-repaint problem. We've decoupled our events from the draw call so they can happen as often as they like and we won't be doing unnecessary drawing. Finally we've switched out `className` for `classList`, which is a massive performance saver.

Of course there are other things we can do to take this further, in particular not iterating through _all 800_ DOM elements on each pass, but even just the changes we've made have given us great performance improvements.

#Conclusion

It's important to not only use `requestAnimationFrame` for your animations, but also to use it in the right way. As you can hopefully see it's quite easy to inadvertently cause bottlenecks, but by understanding how the browser actually executes your code you can fix any problems quickly. Take some time with Chrome's Dev Tools, especially the frame mode, and see where your animations can be improved.
