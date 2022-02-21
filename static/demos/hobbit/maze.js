/**
 * @author Klas Kroon, North Kingdom / http://oos.moxiecode.com/
 */

var context;
var canvas;
// init
var rows = 20;
var columns = 20;
var tileSize = 8;
var startx = 0;
var starty = 0;
var cellstack = [];
var grid = [];
var currentcell;
var visitedcells = 0;

function init() {
	canvas = document.getElementById('myCanvas');
	context = canvas.getContext('2d');

	initMaze();

	canvas.onmousedown = canvas.ontouchstart = function(event) {
		initMaze();
	}

}

function initMaze(){
	cellstack=[];
	grid = [];
	visitedcells = 0;

	// setup
	for(var y=0;y<rows;++y){
		grid[y] = [];
		for(var x=0;x<columns;++x){
			var o = {x:startx+x*tileSize,y:starty+y*tileSize,visited:false,r:y,c:x,n:true,e:true,s:true,w:true};
			grid[y][x] = o;
		}
	}

	//random cell
	currentcell = grid[Math.floor(Math.random()*rows)][Math.floor(Math.random()*columns)];

	// populate
	populate();

	// make tiles out of it...
	// setup map
	var map = [];
	for (var y = 0; y < 1+grid.length*2; y++) {
		map[y] = [];
		for (var x = 0; x < 1+grid[0].length*2; x++) {
			map[y][x] = 1;
		}
	}

	for (var y = 0; y < grid.length; y++) {
		for (var x = 0; x < grid[0].length; x++) {
			var rx = 1+(x*2);
			var ry = 1+(y*2);
			var o = grid[y][x];

			map[ry][rx] = 0;

			// n
			if (!o.n) {
				map[ry-1][rx] = 0;
			}
			// s
			if (!o.s) {
				map[ry+1][rx] = 0;
			}
			// w
			if (!o.w) {
				map[ry][rx-1] = 0;
			}
			// e
			if (!o.e) {
				map[ry][rx+1] = 0;			
			}

		}
	}

	// draw it
	draw(map);
}


//hide walls
function hideWall (x,y,dir){
	grid[y][x][dir] = false;
}

//hide opposite wall
function oppHideWall (x,y,dir){
	var opp;
	if(dir == "s"){
		opp="n";
	}else if(dir == "n"){
		opp="s";
	}else if(dir == "e"){
		opp="w";
	}else if(dir == "w"){
		opp="e";
	}
	grid[y][x][opp] = false;
}

// neightbours
function neighbours(r,c){
	var n;
	var s;
	var e;
	var w;

	try {
		var n=grid[r-1][c];
	}
	catch(err) {}
	try {
		var s=grid[r+1][c];
	}
	catch(err) {}
	try {
		var e=grid[r][c+1];
	}
	catch(err) {}
	try {
		var w=grid[r][c-1];
	}
	catch(err) {}

	var empty=[];
	var dirs=[];
	if (n != undefined) {
		if(!n.visited){
			empty.push(n);
			dirs.push("n");
		}
	}
	if (s != undefined) {
		if(!s.visited){
			empty.push(s);
			dirs.push("s");
		}
	}
	if (e != undefined) {
		if(!e.visited){
			empty.push(e);
			dirs.push("e");
		}
	}
	if (w != undefined) {
		if(!w.visited){
			empty.push(w);
			dirs.push("w");
		}
	}
	if(empty.length){
		var rn=Math.floor(Math.random()*empty.length);
		var dir=dirs[rn];
		cellstack.push(currentcell);
		hideWall(currentcell.c,currentcell.r,dir);
		currentcell.visited=true;
		currentcell=empty[rn];
		oppHideWall(currentcell.c,currentcell.r,dir);
		currentcell.visited=true;
		visitedcells++;
	}else{
		currentcell=cellstack.pop();
	}	
}

function populate() {
	while (visitedcells<(rows*columns)-1) {
		neighbours(currentcell.r,currentcell.c);
	}
}

function draw(map) {
	context.clearRect(0, 0, canvas.width, canvas.height);
	// bg
	context.fillStyle="#EFEFEF";
	context.fillRect(0, 0, canvas.width, canvas.height);

	// maze
	context.fillStyle="#000000";

	startx = canvas.width/2 - (4+columns*tileSize);
	starty = canvas.height/2 - (4+rows*tileSize);

	for (var y = 0; y < map.length; y++) {
		
		for (var x = 0; x < map[y].length; x++) {
			
			var cell = map[y][x];
			if (cell != 0) {

				context.fillRect(startx + tileSize*x, starty + tileSize*y, tileSize, tileSize);

			}
			
		}

	}

}