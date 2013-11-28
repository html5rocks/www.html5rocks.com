/**
 * Provides requestAnimationFrame in a cross browser way.
 * @author greggman / http://greggman.com/
 */

if ( !window.requestAnimationFrame ) {

	window.requestAnimationFrame = ( function() {

		return window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

			window.setTimeout( callback, 1000 / 60 );

		};

	} )();

}

/**
 * Swipe detection
 * @author Klas Kroon, North Kingdom / http://oos.moxiecode.com/
 */

var context;
var canvas;
var time = 0;

// mouse/touch
var mouseStartX, mouseStartY;
var mouseX, mouseY;
var mouseIsDown = false;

// arrow
var arrow = new Image();
arrow.src = "http://i781.photobucket.com/albums/yy100/danielisaksson/arrow_zps5c669314.png";
var arrowTime = 0;
var arrowRotation = 0;

function init() {

	canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');

	// listeners
	document.addEventListener('touchstart', onTouchStart);
	document.addEventListener('touchmove', onTouchMove);
	document.addEventListener('touchend', onTouchEnd);

	document.addEventListener('mousedown', onDocumentMouseDown);
	document.addEventListener('mouseup', onDocumentMouseUp);
	document.addEventListener('mousemove', onDocumentMouseMove);

	loop();

}

function loop() {

	requestAnimationFrame( loop );

	time = Date.now();

	context.clearRect(0, 0, canvas.width, canvas.height);
	// bg
	context.fillStyle="#CACACA";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// arrow
	if (arrowTime+1000 > time) {
		context.save();

		var alpha = 1-(time-arrowTime)/1000;
		context.globalAlpha = alpha;

		context.translate(canvas.width/2, canvas.height/2);
		context.rotate(arrowRotation);
		context.drawImage(arrow, -arrow.width/2, -arrow.height/2);

		context.restore();
	}

}

function showArrow () {

	arrowTime = Date.now();
	arrowRotation = 0;
	if (rightIsDown) arrowRotation = Math.PI*0.5;
	if (downIsDown) arrowRotation = Math.PI;
	if (leftIsDown) arrowRotation = Math.PI*1.5;
	
}

function checkSwipe() {
	
	// check distance between start position and current
	var dx = mouseStartX - mouseX;
	var dy = mouseStartY - mouseY;
	var distance =  dx * dx + dy * dy;

	// over a certain distance, detect a swipe
	if (distance > 8000) {

		// reset
		upIsDown = false;
		rightIsDown = false;
		downIsDown = false;
		leftIsDown = false;

		// check the angle
		var angle = 360 - 180 - getAngle(mouseStartX, mouseStartY, mouseX, mouseY) * 180 / Math.PI;
		if (angle > 315 || angle < 45) {
			upIsDown = true;
		}
		if (angle >= 45 && angle < 135) {
			rightIsDown = true;
		}
		if (angle >= 135 && angle < 225) {
			downIsDown = true;
		}
		if (angle >= 225 && angle < 315) {
			leftIsDown = true;
		}

		showArrow();

		// reset start position
		mouseStartX = mouseX;
		mouseStartY = mouseY;

	}

}

/*
 * Events
 */

function onDocumentMouseMove(event) {

	mouseX = event.clientX;
	mouseY = event.clientY;

	if (mouseIsDown) {
		checkSwipe();
	}

}

function onDocumentMouseDown(event) {

	event.preventDefault();

	mouseIsDown = true;

	mouseStartX = event.clientX;
	mouseStartY = event.clientY;

}

function onDocumentMouseUp(event) {

	event.preventDefault();

	mouseIsDown = false;

}

function onTouchStart(event) {

	event.preventDefault();

	mouseIsDown = true;

	mouseStartX = event.touches[0].clientX;
	mouseStartY = event.touches[0].clientY;

	mouseX = mouseStartX;
	mouseY = mouseStartY;

}

function onTouchMove(event) {

	event.preventDefault();

	mouseX = event.touches[0].clientX;
	mouseY = event.touches[0].clientY;

	if (mouseIsDown) {
		checkSwipe();
	}

}

function onTouchEnd(event) {

	event.preventDefault();

	mouseIsDown = false;

}

// helpers
function getAngle (x1, y1, x2, y2) {
	
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.atan2(dx,dy);

}