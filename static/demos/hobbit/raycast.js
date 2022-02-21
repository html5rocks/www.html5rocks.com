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
 * 2D raycast function.
 * @author Klas Kroon, North Kingdom / http://oos.moxiecode.com/
 */

var RayCast = (function() {

	var raycast = {};

	var context;
	var canvas;
	var winWidth = 304;
	var winHeight = 304;

	var delta;
	var time;
	var oldTime;

	// mouse
	var staticMouseX = 0;
	var staticMouseY = 0;

	var tileSize = 16;
	var gap = 0;
	var startX = 0;
	var startY = 0;
	var playerPos = {x: 9, y: 9, goalx: 0, goaly: 0};
	var colors = ["#dddddd", "#000000"];

	var testArray = [];

	var map = [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,1],
			    [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,1],
			    [1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,1],
			    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
			    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
			    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
			    [1,0,1,0,0,0,1,1,1,0,0,0,1,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
			    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
			    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  ];

	var mapW = map[0].length;
	var mapH = map.length;

	var drawMap = function () {

		for (var y = 0; y < map.length; y++) {

			for (var x = 0; x < map[y].length; x++) {
				
				var type = map[y][x];
				var color = colors[type];

				context.fillStyle = color;
				context.fillRect(startX+(x*tileSize)+(x*gap),startY+(y*tileSize)+(y*gap),tileSize,tileSize);

			}	
		}

		// testArray
		for (var i = 0; i < testArray.length; i++) {
			var o = testArray[i];
			context.strokeStyle = "#00ff00";
			context.strokeRect(startX+(o.x*tileSize)+(o.x*gap),startY+(o.y*tileSize)+(o.y*gap),tileSize,tileSize);
		}

		// start pos
		context.fillStyle = "#990000";
		context.fillRect(startX+(playerPos.x*tileSize)+(playerPos.x*gap),startY+(playerPos.y*tileSize)+(playerPos.y*gap),tileSize,tileSize);		


		// test draw line
		var t = time/2000;
		var start = {x: playerPos.x*tileSize + tileSize/2, y: playerPos.y*tileSize + tileSize/2};
		var end3 = {x: (playerPos.x*tileSize)+Math.sin(t)*2500, y: (playerPos.y*tileSize)+Math.cos(t)*2500};

		context.strokeStyle = "#0000ff";

		context.beginPath();

		context.moveTo(start.x, start.y);
		context.lineTo(end3.x, end3.y);

		context.stroke();

		
	}

	var checkClick = function () {
		
		var start = {x: playerPos.x*tileSize + tileSize/2, y: playerPos.y*tileSize + tileSize/2};

		var q = Math.PI/8;
		var t = time/2000;
		var end1 = {x: (playerPos.x*tileSize)+Math.sin(t-q)*500, y: (playerPos.y*tileSize)+Math.cos(t-q)*500};
		var firstArray = castRay(start, end1);

		var end2 = {x: (playerPos.x*tileSize)+Math.sin(t+q)*500, y: (playerPos.y*tileSize)+Math.cos(t+q)*500};
		var secondArray = castRay(start, end2);

		var end3 = {x: (playerPos.x*tileSize)+Math.sin(t)*500, y: (playerPos.y*tileSize)+Math.cos(t)*500};
		var thirdArray = castRay(start, end3);

		testArray = firstArray.concat(secondArray);

		testArray = testArray.concat(thirdArray);

		testArray = fillSurrounding(testArray);

		testArray = arrayUnique(testArray);

	}

	var fillSurrounding = function (array) {
		
		var newArray = [];

		for (var i = 0; i < array.length; i++) {
			var o = testArray[i];
			
			newArray.push(o);
			newArray.push({x: o.x-1, y: o.y});
			newArray.push({x: o.x+1, y: o.y});
			newArray.push({x: o.x, y: o.y-1});
			newArray.push({x: o.x, y: o.y+1});
				
		}

		return newArray;
	}

	var arrayUnique = function (array) {
	    var a = array.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i].x == a[j].x && a[i].y == a[j].y) {
	            	a.splice(j--, 1);
	            }
	        }
	    }

	    return a;
	}

	var castRay = function ( p1Original, p2Original ) {

		// normalize
		var p1 = {x: p1Original.x / tileSize, y: p1Original.y / tileSize};
		var p2 = {x: p2Original.x / tileSize, y: p2Original.y / tileSize};
	
		if ( Math.round( p1.x ) == Math.round( p2.x ) && Math.round( p1.y ) == Math.round( p2.y ) ) {
			return p2Original;
		}
		
		var stepX = ( p2.x > p1.x ) ? 1 : -1;  
		var stepY = ( p2.y > p1.y ) ? 1 : -1;

		var rayDirection = { x: p2.x - p1.x, y: p2.y - p1.y };

		var ratioX = rayDirection.x / rayDirection.y;
		var ratioY = rayDirection.y / rayDirection.x;

		var deltaY = Math.abs(p2.x - p1.x);
		var deltaX = Math.abs(p2.y - p1.y);

		var testX = Math.round(p1.x); 
		var testY = Math.round(p1.y);

		var maxX = deltaX * ( ( stepX > 0 ) ? ( 1.0 - (p1.x % 1) ) : (p1.x % 1) ); 
		var maxY = deltaY * ( ( stepY > 0 ) ? ( 1.0 - (p1.y % 1) ) : (p1.y % 1) );

		var endTileX = Math.round(p2.x);
		var endTileY = Math.round(p2.y);

		var hit;
		var collisionPoint = {};
		
		var intersectArray = [];
		intersectArray.push( {x:testX, y: testY} );

		while( testX != endTileX || testY != endTileY ) {
			
			if (  maxX < maxY ) {
			
				maxX += deltaX;
				testX += stepX;

				if ( map[testY][testX] != 0 ) {
					return intersectArray;
				}
			
			} else {
				
				maxY += deltaY;
				testY += stepY;

				if ( map[testY][testX] != 0 ) {
					return intersectArray;
				}
			}
	
			intersectArray.push( {x:testX, y: testY} );

		}
		
		//no intersection found
		return p2Original;
	}



	raycast.init = function() {

	    canvas = document.createElement("canvas");
	    canvas.width = winWidth;
	    canvas.height = winHeight;
	    context = canvas.getContext('2d');

	    document.body.appendChild(canvas);

		// start and run
		raycast.draw();


	}

	raycast.draw = function() {

		requestAnimationFrame( raycast.draw );

	    context.clearRect(0,0,winWidth,winHeight);

		time = Date.now();
		delta = time - oldTime;
		oldTime = time;
		
		if (isNaN(delta)) {
			delta = 1000/60;
		}

		// clear
	    context.fillStyle = "#aaaaaa";
	    context.fillRect(0,0,winWidth,winHeight);

	    checkClick();

	    drawMap();

	}


	return raycast;

})();

window.onload = function(){
	RayCast.init();
}
