/// Copyright © 2009 British Broadcasting Corporation

/// Permission is hereby granted, free of charge, to any person obtaining
/// a copy of this software and associated documentation files (the
/// "Software"), to deal in the Software without restriction, including
/// without limitation the rights to use, copy, modify, merge, publish,
/// distribute, sublicense, and/or sell copies of the Software, and to
/// permit persons to whom the Software is furnished to do so, subject to
/// the following conditions:
/// 	
/// The above copyright notice and this permission notice shall be
/// included in all copies or substantial portions of the Software.
/// 
/// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
/// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
/// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
/// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
/// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
/// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
/// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

/// This prototype was built by BBC R&D Prototyping as part of the P2P-Next project
/// P2P-Next: www.p2p-next.org
/// LIMO: http://limo.rad0.net/wiki/Main_Page
/// Code documentation: http://limo.rad0.net/wiki/The_LIMO_JavaScript_library

/// Please note that this is a demo: not structured or optimised for production use.

/// NB: this code is for use with jCarousel: see jquery.jcarousel.js for licence notice.



function myCarousel_initCallback(carousel) {
//	initCarouselChapters(carousel);
}

function myCarousel_itemLoadCallback(carousel, state)
{
    for (var i = carousel.first; i <= carousel.last; i++) {
        if (carousel.has(i)) {
            continue;
        }

        if (i > metadataCues.length) {
            break;
        }

		var item = metadataCues[i-1];
        carousel.add(i, myCarousel_getItemHTML(item));
		jEl = $("#" + item.id);
		jEl.get(0).time = item.startTime;
		jEl.click(function(){$("video")[0].currentTime = this.time;});
    }
}

function myCarousel_getItemHTML(item)
{
    return '<img src="images/' + item.src + '" width="117" height="66" alt="' + item.description + '" id="' + item.id + '" /><div class="thumbnailOverlay">' + item.title + '</div>';
}