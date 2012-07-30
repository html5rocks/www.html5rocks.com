/// CSS text-effects in <canvas>

/// Shadow-based effects (parsing popular css-based text-effects)

var shadowStyles = {	
	// http://simurai.com/post/802968365/css3d-css3-3d-text
	"Stereoscopic": { 
		color: "#000",
		background: "#fff",
		shadow: "-0.06em 0 0 red, 0.06em 0 0 cyan"
	},
	// http://line25.com/articles/using-css-text-shadow-to-create-cool-text-effects
	"Neon": {
		color: "#FFF",
		background: "#000",
		shadow: "0 0 10px #fff, 0 0 20px #fff, 0 0 30px #fff, 0 0 40px #ff00de, 0 0 70px #ff00de, 0 0 80px #ff00de, 0 0 100px #ff00de, 0 0 150px #ff00de"
	},
	"Anaglyphic": {
		color: "rgba(0,0,255,0.5)",
		background: "#fff",
		shadow: "3px 3px 0 rgba(255,0,180,0.5)"
	},
	"Vintage Radio": {
		color: "#707070",
		background: "#ddd",
		shadow: "2px 2px 0px #eee, 4px 4px 0px #666"
	},
	"Inset": {
		color: "#222",
		background: "#444",
		shadow: "0px 1px 1px #777"
	},
	// meinen kopf
	"Shadow": {
		color: "#444",
		background: "#444",
		shadow: "0 0 11px #000"
	},
	"Shadow ;)": {
		background: "#ddd",
		shadow: "0 0 11px #000"
	},
	// http://pgwebdesign.net/blog/3d-css-shadow-text-tutorial
	"Shadow3D": {
		color: "#fff",
		background: "#ddd",
		shadow: "1px -1px #444, 2px -2px #444, 3px -3px #444, 4px -4px #444"
	}
};

function demoShadowEffects() {
	function parseShadow(shadows) {
		shadows = shadows.split(", ");
		var ret = [];
		for (var n = 0, length = shadows.length; n < length; n ++) {
			var shadow = shadows[n].split(" ");
			var type = shadow[0].replace(parseFloat(shadow[0]), "");
			if (type == "em") {
				var obj = {
					x: metrics.em * parseFloat(shadow[0]),
					y: metrics.em * parseFloat(shadow[1])
				};
			} else {
				var obj = {
					x: parseFloat(shadow[0]),
					y: parseFloat(shadow[1])
				};
			}
			if (shadow[3]) {
				obj.blur = parseFloat(shadow[2]);
				obj.color = shadow[3];
			} else {
				obj.blur = 0;
				obj.color = shadow[2];		
			}
			ret.push(obj);
		}
		return ret;
	};
	ctx.save();
	ctx.font = "60px Futura, Helvetica, sans-serif";
	// absolute position of the text (within a translation state)
	var offsetX = 50;
	var offsetY = 62;
	// gather information about the height of the font
	var metrics = getMetrics("thequickbrownfox", ctx.font);
	var textHeight = metrics.height * 1.20;
	// loop through text-shadow based effects
	for (var text in shadowStyles) {
		var width = ctx.measureText(text).width;
		var style = shadowStyles[text];
		// add a background to the current effect
		ctx.fillStyle = style.background;
		ctx.fillRect(0, offsetY, ctx.canvas.width, textHeight - 1)
		// parse text-shadows from css
		var shadows = parseShadow(style.shadow);
		// loop through the shadow collection
		var n = shadows.length; while(n--) {
			var shadow = shadows[n];
			var totalWidth = width + shadow.blur * 2;
			ctx.save();
			ctx.beginPath();
			ctx.rect(offsetX - shadow.blur, offsetY, offsetX + totalWidth, textHeight);
			ctx.clip();
			if (shadow.blur) { // just run shadow (clip text)
				ctx.shadowColor = shadow.color;
				ctx.shadowOffsetX = shadow.x + totalWidth;
				ctx.shadowOffsetY = shadow.y;
				ctx.shadowBlur = shadow.blur;
				ctx.fillText(text, -totalWidth + offsetX, offsetY + metrics.top);
			} else { // just run pseudo-shadow
				ctx.fillStyle = shadow.color;
				ctx.fillText(text, offsetX + (shadow.x||0), offsetY - (shadow.y||0) + metrics.top);
			}
			ctx.restore();
		}
		// drawing the text in the foreground
		if (style.color) {
			ctx.fillStyle = style.color;
			ctx.fillText(text, offsetX, offsetY + metrics.top);
		}
		// jump to next em-line
		ctx.translate(0, textHeight);
	}
	ctx.restore();
};

/// Text effect w/ translucent pattern (showing through to text-color)

function sleekZebraEffect() {
	// inspired by - http://www.webdesignerwall.com/demo/css-gradient-text/
	var text = "Sleek Zebra...";
	var font = "100px Futura, Helvetica, sans-serif";
	// save state
	ctx.save();
	ctx.font = font;
	// getMetrics calculates:
	// width + height of text-block
	// top + middle + bottom baseline
	var metrics = getMetrics(text, font);
	var offsetRefectionY = -20;
	var offsetY = 70;
	var offsetX = 60;
	// throwing a linear-gradient in to shine up the text
	var gradient = ctx.createLinearGradient(0, offsetY, 0, metrics.height + offsetY);
	gradient.addColorStop(0.1, '#000');
	gradient.addColorStop(0.35, '#fff');
	gradient.addColorStop(0.65, '#fff');
	gradient.addColorStop(1.0, '#000');
	ctx.fillStyle = gradient
	ctx.fillText(text, offsetX, offsetY + metrics.top);
	// draw reflected text
	ctx.save();
	ctx.globalCompositeOperation = "source-over";
	ctx.translate(0, metrics.height + offsetRefectionY)
	ctx.scale(1, -1);
	ctx.font = font;
	ctx.fillStyle = "#fff";
	ctx.fillText(text, offsetX, -metrics.height - offsetY + metrics.top);
	ctx.scale(1, -1);
	// cut the gradient out of the reflected text 
	ctx.globalCompositeOperation = "destination-out";
	var gradient = ctx.createLinearGradient(0, offsetY, 0, metrics.height + offsetY);
	gradient.addColorStop(0.0, 'rgba(0,0,0,0.65)');
	gradient.addColorStop(1.0, '#000');
	ctx.fillStyle = gradient;
	ctx.fillRect(offsetX, offsetY, metrics.width, metrics.height);
	// restore back to original transform state
	ctx.restore();
	// using source-atop to allow the transparent .png to show through to the gradient
	ctx.globalCompositeOperation = "source-atop";
	// creating pattern from <image> sourced
	ctx.fillStyle = ctx.createPattern(image, 'repeat');
	// fill the height of two em-boxes, to encompass both normal and reflected state
	ctx.fillRect(offsetX, offsetY, metrics.width, metrics.height * 2);
	ctx.restore();
};

/// Neon light text-effect

function neonLightEffect() {
	var text = "alert('"+String.fromCharCode(0x2665)+"')";
	var font = "120px Futura, Helvetica, sans-serif";
	var jitter = 25; // the distance of the maximum jitter
	var offsetX = 30;
	var offsetY = 70;
	var blur = getBlurValue(100);
	// save state
	ctx.save();
	ctx.font = font;
	// calculate width + height of text-block
	var metrics = getMetrics(text, font);
	// create clipping mask around text-effect
	ctx.rect(offsetX - blur/2, offsetY - blur/2, offsetX + metrics.width + blur, metrics.height + blur);
	ctx.clip();
	// create shadow-blur to mask rainbow onto (since shadowColor doesn't accept gradients)
	ctx.save();
	ctx.fillStyle = "#fff";
	ctx.shadowColor = "rgba(0,0,0,1)";
	ctx.shadowOffsetX = metrics.width + blur;
	ctx.shadowOffsetY = 0;
	ctx.shadowBlur = blur;
	ctx.fillText(text, -metrics.width + offsetX - blur, offsetY + metrics.top);
	ctx.restore();
	// create the rainbow linear-gradient
	var gradient = ctx.createLinearGradient(0, 0, metrics.width, 0);
	gradient.addColorStop(0, "rgba(255, 0, 0, 1)");
	gradient.addColorStop(0.15, "rgba(255, 255, 0, 1)");
	gradient.addColorStop(0.3, "rgba(0, 255, 0, 1)");
	gradient.addColorStop(0.5, "rgba(0, 255, 255, 1)");
	gradient.addColorStop(0.65, "rgba(0, 0, 255, 1)");
	gradient.addColorStop(0.8, "rgba(255, 0, 255, 1)");
	gradient.addColorStop(1, "rgba(255, 0, 0, 1)");
	// change composite so source is applied within the shadow-blur
	ctx.globalCompositeOperation = "source-atop";
	// apply gradient to shadow-blur
	ctx.fillStyle = gradient;
	ctx.fillRect(offsetX - jitter/2, offsetY, metrics.width + offsetX, metrics.height + offsetY);
	// change composite to mix as light
	ctx.globalCompositeOperation = "lighter";
	// multiply the layer
	ctx.globalAlpha = 0.7
	ctx.drawImage(ctx.canvas, 0, 0);
	ctx.drawImage(ctx.canvas, 0, 0);
	ctx.globalAlpha = 1
	// draw white-text ontop of glow
	ctx.fillStyle = "rgba(255,255,255,0.95)";
	ctx.fillText(text, offsetX, offsetY + metrics.top);
	// created jittered stroke
	ctx.lineWidth = 0.80;
	ctx.strokeStyle = "rgba(255,255,255,0.25)";
	var i = 10; while(i--) { 
		var left = jitter / 2 - Math.random() * jitter;
		var top = jitter / 2 - Math.random() * jitter;
		ctx.strokeText(text, left + offsetX, top + offsetY + metrics.top);
	}	
	ctx.strokeStyle = "rgba(0,0,0,0.20)";
	ctx.strokeText(text, offsetX, offsetY + metrics.top);
	ctx.restore();
};

// 

function innerShadow() {
	function drawShape() { // draw anti-clockwise
		ctx.arc(0, 0, 100, 0, Math.PI * 2, true); // Outer circle
		ctx.moveTo(70, 0);
		ctx.arc(0, 0, 70, 0, Math.PI, false); // Mouth
		ctx.moveTo(-20, -20);
		ctx.arc(30, -30, 10, 0, Math.PI * 2, false); // Left eye
		ctx.moveTo(140, 70);
		ctx.arc(-20, -30, 10, 0, Math.PI * 2, false); // Right eye
	};
	var width = 200;
	var offset = width + 50;
	var innerColor = "rgba(0,0,0,1)";
	var outerColor = "rgba(0,0,0,1)";
	///
	ctx.translate(150, 170);
	// apply inner-shadow
	ctx.save();
	ctx.fillStyle = "#000";
	ctx.shadowColor = innerColor;
	ctx.shadowBlur = getBlurValue(120);
	ctx.shadowOffsetX = -15;
	ctx.shadowOffsetY = 15;
	// create clipping path (around blur + shape, preventing outer-rect blurring)
	ctx.beginPath();
	ctx.rect(-offset/2, -offset/2, offset, offset);
	ctx.clip();
	// apply inner-shadow (w/ clockwise vs. anti-clockwise cutout)
	ctx.beginPath();
	ctx.rect(-offset/2, -offset/2, offset, offset);
	drawShape();
	ctx.fill();
	ctx.restore();
	// cutout temporary rectangle used to create inner-shadow
	ctx.globalCompositeOperation = "destination-out";
	ctx.fill();
	// prepare vector paths
	ctx.beginPath();
	drawShape();
	// apply fill-gradient to inner-shadow
	ctx.save();
	ctx.globalCompositeOperation = "source-in";
	var gradient = ctx.createLinearGradient(-offset/2, 0, offset/2, 0);
	gradient.addColorStop(0.3, '#ff0');
	gradient.addColorStop(0.7, '#f00');
	ctx.fillStyle = gradient;
	ctx.fill();
	// apply fill-pattern to inner-shadow
	ctx.globalCompositeOperation = "source-atop";
	ctx.globalAlpha = 1;
	ctx.rotate(0.9);
	ctx.fillStyle = ctx.createPattern(image, 'repeat');
	ctx.fill();
	ctx.restore();
	// apply fill-gradient
	ctx.save();
	ctx.globalCompositeOperation = "destination-over";
	var gradient = ctx.createLinearGradient(-offset/2, -offset/2, offset/2, offset/2);
	gradient.addColorStop(0.1, '#f00');
	gradient.addColorStop(0.5, 'rgba(255,255,0,1)');
	gradient.addColorStop(1.0, '#00f');
	ctx.fillStyle = gradient
	ctx.fill();
	// apply fill-pattern
	ctx.globalCompositeOperation = "source-atop";
	ctx.globalAlpha = 0.2;
	ctx.rotate(-0.4);
	ctx.fillStyle = ctx.createPattern(image, 'repeat');
	ctx.fill();
	ctx.restore();
	// apply outer-shadow (color-only without temporary layer)
	ctx.globalCompositeOperation = "destination-over";
	ctx.shadowColor = outerColor;
	ctx.shadowBlur = 40;
	ctx.shadowOffsetX = 15;
	ctx.shadowOffsetY = 10;
	ctx.fillStyle = "#fff";
	ctx.fill();
};	

function getBlurValue(blur) {
	var userAgent = navigator.userAgent;
	if (userAgent && userAgent.indexOf('Firefox/4') != -1) {
		var kernelSize = (blur < 8 ? blur / 2 : Math.sqrt(blur * 2));
		var blurRadius = Math.ceil(kernelSize);
		return blurRadius * 2;
	}
	return blur;
};