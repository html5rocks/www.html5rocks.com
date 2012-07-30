/* GET FONT METRICS
----------------------- */

(function() {

var image = document.createElement("img");
image.width = 42;
image.height = 1;
image.src = op_8x8.data;
image.style.cssText = "display: inline";

getMetrics = function(text, font) {
	var metrics = document.getElementById("metrics");
	if (metrics) {	
		metrics.style.cssText = "display: block";
		var parent = metrics.firstChild;
		parent.firstChild.textContent = text;
	} else {
		// setting up html used for measuring text-metrics
		var parent = document.createElement("span");
		parent.appendChild(document.createTextNode(text));
		parent.appendChild(image);
		var metrics = document.createElement("div");
		metrics.id = "metrics";
		metrics.appendChild(parent);
		document.body.insertBefore(metrics, document.body.firstChild);
	}
	
	// direction of the text
	var direction = window.getComputedStyle(document.body, "")["direction"];

	// getting css equivalent of ctx.measureText()
	parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
	var width = parent.offsetWidth;
	var height = parent.offsetHeight;

	// capturing the "top" and "bottom" baseline
	parent.style.cssText = "font: " + font + "; white-space: nowrap; display: block;";
	var top = image.offsetTop;
	var bottom = top - height;

	// capturing the "middle" baseline
	parent.style.cssText = "font: " + font + "; white-space: nowrap; line-height: 0; display: block;";
	var middle = image.offsetTop + 1;
	
	// cleanup
	metrics.style.display = "none";

	return {
		direction: direction,
		top: top,
		middle: middle,
		bottom: bottom,
		height: height,
		width: width
	};
};

getBoundingBox = function(props) {
	var ctx = props.ctx;
	var text = props.text;
	var bboxHeight = props.bboxHeight;
	var bboxWidth = props.bboxWidth;
	var forceHeight = props.forceHeight;
	var flip = props.flip || false;
	var drawBaseline = props.drawBaseline || false;
	// setting up the canvas
	ctx.save();
	ctx.font = props.font;
	// Offsets keep the font in-screen when otherwise clipped
	var offsetx = bboxHeight;
	var offsety = bboxHeight;
	// 
	var canvasWidth = ctx.canvas.width = Math.round(bboxWidth + offsetx);
	var canvasHeight = ctx.canvas.height = (forceHeight ? forceHeight : bboxHeight) + offsety;
	var pixelWidth = canvasWidth * 4;
	if (typeof(props.baseline) == "string") {
		offsety = 0; // using <canvas> baseline
		ctx.textBaseline = props.baseline;
	}
	// ctx.font has to be called twice because resetting the size resets the state
	if (flip) ctx.scale(1, -1);
	ctx.font = props.font;
	ctx.fillText(text, offsetx / 1.5, offsety);
	// drawing baseline
	if (drawBaseline) {
		ctx.fillRect(0, forceHeight / 2, ctx.canvas.width, 1);
	}
	// grabbing image data
	var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
	var data = imageData.data;
	var ret = {};
	// calculating left
	var left = 0;
	var col = 0, row = 0; // left bounds
	while (row < canvasHeight && col < canvasWidth) {
		if (data[(row * pixelWidth) + (col * 4) + 3]) { 
			left = (col - offsetx / 1.5);
			break;
		}
		row ++;
		if (row % canvasHeight == 0) {
			row = 0;
			col++;
		}
	}
	ret.left = -left;
	// calculating right
	var right = 0;
	var col = canvasWidth, row = 0; // right bounds
	while (row < canvasHeight && col > 0) {
		if (data[(row * pixelWidth) + (col * 4) + 3]) {
			right = (col - offsetx / 1.5) + 1;
			break;
		}
		row ++;
		if (row % canvasHeight == 0) {
			row = 0;
			col --;
		}
	}
	ret.right = right;
	ret.width = (right - left);
	// calculating top
	var top = 0;
	var pos = 0;
	while (pos < data.length) {
		if (data[pos + 3]) {
			pos -= pos % pixelWidth; // back to beginning of the line
			top = (pos / 4) / canvasWidth; // calculate pixel position
			break;
		}
		pos += 4;
	}
	ret.top = top;
	// calculating bottom
	var bottom = 0;	
	var pos = data.length;
	while (pos > 0) {
		if (data[pos + 3]) {
			pos += pixelWidth - (pos % pixelWidth); // to the end of the line
			bottom = (pos / 4) / canvasWidth;
			break;
		}
		pos -= 4;
	}
	ret.height = (bottom - top);
	ret.bottom = ret.height + ret.top;
	ctx.restore();
	// returning metrics
	return ret;
};

})();