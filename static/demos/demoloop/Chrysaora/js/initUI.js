// JavaScript Document
function initUI(){
  docWidth = $(window).width();
  docHeight = $(window).height();
  $("#console").height(docHeight-25);	
}

function toggleDebug(ID){
	$('#'+ID).animate({"height": "toggle", "opacity": "toggle"}, 500);
}

function toggleConsole(){
	$('#console').animate({"width": "toggle", "opacity": "toggle"}, 500);
}
