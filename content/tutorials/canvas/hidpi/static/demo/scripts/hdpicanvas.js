/**
 * Acts as a wrapper for drawImage ensuring that if the canvas's
 * backing store pixel ratio is different to the device pixel
 * ratio that the canvas is scaled appropriately.
 *
 * @version 0.1
 * @author Paul Lewis
 */
var HDPICanvas = (function() {

/**
 * Writes an image into a canvas taking into
 * account the backing store pixel ratio and
 * the device pixel ratio.
 *
 * @author Paul Lewis
 * @param {Object} opts The params for drawing an image to the canvas
 */
function drawImage(opts) {

	if(!opts.canvas) {
		throw("A canvas is required");
	}
	if(!opts.image) {
		throw("Image is required");
	}

	// get the canvas and context
	var canvas = opts.canvas,
		context = canvas.getContext('2d'),
		image = opts.image,

	// now default all the dimension info
		srcx = opts.srcx || 0,
		srcy = opts.srcy || 0,
		srcw = opts.srcw || image.naturalWidth,
		srch = opts.srch || image.naturalHeight,
		desx = opts.desx || srcx,
		desy = opts.desy || srcy,
		desw = opts.desw || srcw,
		desh = opts.desh || srch,
		auto = opts.auto,

	// finally query the various pixel ratios
		devicePixelRatio = window.devicePixelRatio || 1,
		backingStoreRatio = context.webkitBackingStorePixelRatio ||
												context.mozBackingStorePixelRatio ||
												context.msBackingStorePixelRatio ||
												context.oBackingStorePixelRatio ||
												context.backingStorePixelRatio || 1,

		ratio = devicePixelRatio / backingStoreRatio;

	// ensure we have a value set for auto.
	// If auto is set to false then we
	// will simply not upscale the canvas
	// and the default behaviour will be maintained
	if (typeof auto === 'undefined') {
		auto = true;
	}

	// upscale the canvas if the two ratios don't match
	if (auto && devicePixelRatio !== backingStoreRatio) {

		var oldWidth = canvas.width;
		var oldHeight = canvas.height;

		canvas.width = oldWidth * ratio;
		canvas.height = oldHeight * ratio;

		canvas.style.width = oldWidth + 'px';
		canvas.style.height = oldHeight + 'px';

		// now scale the context to counter
		// the fact that we've manually scaled
		// our canvas element
		context.scale(ratio, ratio);
	}

	context.drawImage(pic, srcx, srcy, srcw, srch, desx, desy, desw, desh);
}

	return {
		drawImage: drawImage
	};

})();
