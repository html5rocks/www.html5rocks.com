window.requestAnimFrame = (function(){
  // requestAnim shim layer by Paul Irish
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     || 
		  function(/* function */ callback, /* DOMElement */ element){
			window.setTimeout(animate, 1000 / 60);
		  };
})();

// space-age vector effect
var spaceAgeEffect = function(props) {
	/// initiate globals
	var doColorCycle = true;
	var text = props.text || String.fromCharCode(0x272E) + "googlio";
	var color = props.color || 0;
	var xoffset = props.x || 0;
	var yoffset = props.y || 0;
	var definition = props.definition || 0;
	var startpos = props.start || 0;
	var endpos = props.end || 0;
	var alpha = props.alpha || 0;
	var cosdiv = props.cosA || 1;
	var sindiv = props.sinA || 1;
	var cosmult = props.cosB || 1;
	var sinmult = props.sinB || 1;
	var size = props.size || 100;
	var hue = color;
	var uniqueID = 0;
	var n = 0;
	animate = function() {
		if (ctx.canvas.uniqueID != uniqueID) return;
		var i = 42; while(i--) {
			if (n > endpos) return;
			n += definition;
			ctx.globalAlpha = (0.5 - (n + startpos) / endpos) * alpha;
			if (doColorCycle) {
				hue = n + color;
				ctx.strokeStyle = "hsl(" + (hue % 360) + ",99%,50%)"; // iterate hue
			}
			var x = cos(n / cosdiv) * n * cosmult; // cosine
			var y = sin(n / sindiv) * n * sinmult; // sin
			ctx.strokeText(text, x + xoffset, y + yoffset); // draw rainbow text
		}
		window.requestAnimFrame(animate, ctx.canvas);
	};
	/// handle drawing
	function draw() {
		/// setup properties
		if (startpos > endpos) return;
		ctx.globalCompositeOperation = "lighter"; 
		ctx.lineWidth = definition;
		ctx.font = size + "px arial";
		ctx.globalAlpha = alpha;
		/// runLoop through spectrum
		n = startpos;
		if (!doColorCycle) {
			ctx.strokeStyle = "hsl(" + (color % 360) + ",99%,50%)"; // iterate hue
		}
		uniqueID = (new Date()).getTime();
		ctx.canvas.uniqueID = uniqueID;
		animate();
	};
	
	/// handle mouse-movements
	window.onmousedown = function(e) {
		var n = 0;
		var lastx = e.pageX;
		var lasty = e.pageY;
		function draw(e) {
			var callback = function(x, y) {
				n += definition;
				ctx.globalAlpha = alpha;
				console.log(n, endpos)
				if (doColorCycle) hue = n + color;
				ctx.strokeStyle = "hsl(" + (hue % 360) + ",99%,50%)"; // iterate hue
				var width = ctx.measureText(text).width;
				ctx.strokeText(text, x + lastx - width/2, y + lasty); // draw rainbow text
			};
			var flow = 1;
			var oX = e.pageX - lastx;
			var oY = e.pageY - lasty;
			if (Math.abs(oX) > Math.abs(oY)) {  // primarily x-movement
				var a = flow; 
				var b = flow * (oY / oX);
				var n = oX;
			} else { // primarily y-movement
				var a = flow * (oX / oY);
				var b = flow;
				var n = oY;
			}
			var max = (n / flow);
			if (n > 0) {
				for (var i = max; i > 0; i --) {
					callback(a * i, b * i);
				}
			} else {
				for (var i = max; i < 0; i ++) { 
					callback(a * i, b * i);
				}
			}
			lastx = e.pageX;
			lasty = e.pageY;
		};
		draw(e);
		window.onmousemove = draw;
		window.onmouseup = function() {
			window.onmouseup = undefined;
			window.onmousemove = undefined;
		};
	};
	/// handle external controls
	function externalControl(that, event) {
		switch(that.id) {
			case "huecycle":
				doColorCycle = that.checked;
				break;
			case "hue": 
				color = parseInt(that.value);
				break;
			case "linewidth":
				definition = parseInt(that.value) / 100;
				break;
			case "cosdiv": 
				cosdiv = parseInt(that.value);
				break;
			case "cosmult": 
				cosmult = (1.0 - (parseInt(that.value) / 500));
				break;
			case "sindiv": 
				sindiv = parseInt(that.value);
				break;
			case "sinmult": 
				sinmult = (1.0 - (parseInt(that.value) / 500));
				break;
			case "xoffset": 
				xoffset = parseInt(that.value);
				break;
			case "yoffset": 
				yoffset = parseInt(that.value);
				break;
			case "startpos": 
				startpos = parseInt(that.value);
				break;
			case "endpos": 
				endpos = parseInt(that.value);
				break;
			case "alpha":
				alpha = parseInt(that.value) / 100;
				break;
			case "text":
				text = that.value;
				break;
			case "size":
				size = that.value;
				break;
		};
		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		// draw space-age
		draw();
	};
	/// create external controls
	if (!document.getElementById("spaceage")) {
		var d = document.createElement("div");
		d.style.cssText = "border: none";
		d.id = "spaceage";
		var controls = {
			"text": { type: "text", value: String.fromCharCode(0x272E) + "googlio", style: "height: 20px" },
			"size": { type: "range", min: 1, max: 1000, value: size },
			"line-width": { type: "range", min: 10, max: 1000, value: definition },
			"hue": { type: "range", min: 0, max: 360, value: color },
			"hue-cycle": { type: "checkbox", value: size, checked: true, style: "float: right" },
			"alpha": { type: "range", min: 1, max: 100, value: alpha },
			"x-offset": { type: "range", min: 0, max: window.innerWidth, value: xoffset },
			"y-offset": { type: "range", min: 0, max: window.innerHeight, value: yoffset },
			"start-pos": { type: "range", min: 1, max: 1000, value: startpos },
			"end-pos": { type: "range", min: 1, max: 5000, value: endpos },
			"cos-mult": { type: "range", min: 0, max: 1000, value: cosmult },
			"sin-mult": { type: "range", min: 0, max: 1000, value: sinmult },
			"cos-div": { type: "range", min: 1, max: 250, value: cosdiv },
			"sin-div": { type: "range", min: 1, max: 250, value: sindiv }
		};
		for (var key in controls) {
			var div = document.createElement("div");
			var span = document.createElement("span");
			span.textContent = key;
			div.appendChild(span);
			var input = document.createElement("input");
			var control = controls[key];
			control.id = key.replace("-", "");
			control.onchange = function() { textcontrol.range(this, event); };
			for (var attr in control) {
				if (attr == "style") {
					input.style.cssText = control[attr];
				} else {
					input[attr] = control[attr];
				}
			}
			div.appendChild(input);
			div.appendChild(document.createElement("br"));
			d.appendChild(div);
		}
		document.getElementById("controls").appendChild(d);
	} else {
		document.getElementById("spaceage").style.display = "block";
	}
	/// return interface
	return {
		"range": externalControl,
		"draw": draw
	};
};