var metadataCues = [];

$(document).ready(function(){

var videoElement = document.querySelector("video");

if (typeof videoElement.textTracks === "undefined") {
	$(".trackNotSupported").fadeTo(1000, 0.8);
	$(".trackSupported").fadeTo(1000, 0.1);
	$("#moreInformation").css({height: "430px"});
	return;
}

var subtitles = [];
var trackElements = document.querySelectorAll("track");

/* 
function addListeners(cue){
	var cueSource = cue.text;
	var obj = JSON.parse(cueSource);
	var handleEnter = function(){
		console.log("enter", obj);
	}
	cue.onenter = handleEnter;
 
	var handleExit = function(){
		console.log("exit", obj);
	}
	cue.onexit = handleExit;
}

 */
	
// This is a bit of a 'hard coded' hack: it would be more extensible to trigger a 
// custom 'metadata' event that could be handled by whatever object chose to do so.  
// Note that the TextTrack cuechange event is used, and not the TextTrackCue enter/exit
// events, because the enter/exit events are not called if the video slider is dragged.
function handleMetadataCueChange(){
	// "this" is a textTrack
	var cue = this.activeCues[0]; // there is only one active cue in this example
	if (typeof cue === "undefined") {
		return;
	}
	
	// set text in #moreInformation panel
	var obj = JSON.parse(cue.text);
	$("#moreInformation h2").html(obj.title);
	$("#moreInformation p").html(obj.description);
	$("#moreInformation a").attr("href", obj.href);
	
	// set current item in carousel	
	$("#carousel img").css("border-color", "#272928");
	$("#" + cue.id).css("border-color", "white");
	$("#carousel .thumbnailOverlay").css("visibility", "hidden");
	$("#" + cue.id + " + .thumbnailOverlay").css("visibility", "visible");

	var carouselIndex;
	for (var i = 0; i != metadataCues.length; ++i)
	{
		if (metadataCues[i].id === cue.id)
		{
			carouselIndex = i + 1;
			break;
		}		
	}
	var carousel = $('#carousel').data('jcarousel');
	carousel.scroll(carouselIndex, true);	
}

// Convert decimal time to mm:ss, e.g. convert 123.3 to 2:03
function toMinSec(decimalSeconds){
	var mins = Math.floor(decimalSeconds/60);
	var secs = Math.floor(decimalSeconds % 60);
	if (secs < 10) {
		secs = "0" + secs
	};
	return mins + ":" + secs;
}
	

// for each track, set track mode and add event listeners
for (var i = 0; i != trackElements.length; i++) {
	trackElements[i].addEventListener("load", function(){			
		var textTrack = this.track; // gotcha: "this" is track *element*
		var isMetadata = textTrack.kind === "metadata";
		var isSubtitles = textTrack.kind === "subtitles";
		// for each cue, add to subtitles (for searching) or metadataCues (for chapters)
		for (var j = 0; j != textTrack.cues.length; ++j) {
			var cue = textTrack.cues[j];
			if (isSubtitles) { 
				subtitles.push({"value": cue.text, "label": toMinSec(cue.startTime) + ": " + cue.text});
			}
			if (isMetadata) { 
				var obj = JSON.parse(cue.text);
				obj.id = cue.id;
				obj.startTime = cue.startTime;
				obj.endTime = cue.endTime;
				metadataCues.push(obj);				
//				addListeners(cue);
			}
		}	
		if (isMetadata){
			textTrack.mode = 1; // emit events but do not show as subtitles
			textTrack.oncuechange = handleMetadataCueChange; 
			// hack!!! hard-coded here...
			$('#carousel').jcarousel({
				size: metadataCues.length,
				itemLoadCallback: {onBeforeAnimation: myCarousel_itemLoadCallback},
				initCallback: myCarousel_initCallback
			});
		}
	});
}

// This is a hack -- not sure how (else) to ensure the subtitles array
// is populated when the autocomplete is built.
videoElement.addEventListener("loadedmetadata", function(e){

	$("#searchInput").autocomplete({
		select: function(event, ui) { // when autocomplete item selected
			// each label consists of start time and cue text, e.g.
			// "00:05: The Web is always changing"
			var label = ui.item.label; 
			// startTime is in hh:mm format
			var minutes = parseInt(label.split(":")[0]);
			var seconds = parseInt(label.split(":")[1]);
			var startTimeSeconds = (60 * minutes) + seconds;
			videoElement.currentTime = startTimeSeconds;
			videoElement.play();
		},
		source: subtitles
	});

});

// Set up colorbox for 'Read original article' link in #moreInformation
$("#originalArticle").colorbox({iframe:true, width:"80%", height:"100%", transition:"elastic"});

});