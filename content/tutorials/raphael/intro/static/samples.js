function drawSample1() {
	var paper = Raphael("sample-1", 200, 75)
	var rect = paper.rect(10,10, 50, 50)
	var circle = paper.circle(110,35, 25)
	
	rect.attr({fill:"green"})
	circle.attr({fill:"blue"})
}

function drawSample2() {
	var paper = Raphael("sample-2", 200, 100)
	var rectPath = paper.path("M10,10L10,90L90,90L90,10Z")
	var curvePath = paper.path("M110,10s55,25 40,80Z")
	rectPath.attr({fill:"green"})
	curvePath.attr({fill:"blue"})
}

function drawSample3() {
	var paper = Raphael("sample-3", 600, 100)
	var t = paper.text(50, 10, "HTML5ROCKS")
	var letters = paper.print(50,50, "HTML5ROCKS", paper.getFont("Vegur"),40)
	
	letters[4].attr({fill:"orange"})
	for(var i=5; i<letters.length; i++) {
		letters[i].attr({fill:"#3D5C9D", "stroke-width":"2", stroke:"#3D5C9D"})
	}
}

function drawSample4() {
	var paper = Raphael("sample-4", 600, 100)
	var letters = paper.print(50,50, "HTML5ROCKS", paper.getFont("Vegur"),40)
	
	
	letters[4].attr({fill:"orange"})
	for(var i=5; i<letters.length; i++) {
		letters[i].attr({fill:"#3D5C9D", "stroke-width":"2", stroke:"#3D5C9D"})
		letters[i].click(function(evt) {
				this.rotate(45)
		})
	}
}

$(document).ready(
	function() {
		drawSample1();
		drawSample2()
		drawSample3()
		drawSample4()
	}
);
