/*
 * Copyright (c) 2012 gskinner.com inc.
 * Authored by: Ryan Matsikas
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
$(function () {


createPotion();


$('.illo').click(function() {
	randomPotion();
})

// listen for clicks on our "swatches"
$('ul > li').click(function (event) {

	event.stopPropagation();

	// get element color
	var swatch = $(this);

	if (!swatch.hasClass('selected')) {
		// de-select previous selected color
		var parent = swatch.parent();
		parent.children('.selected').removeClass('selected');

		// select our new colors
		swatch.addClass('selected');

		// it's alive!
		createPotion();
			
	}
});

function createPotion() {
	
	var primaryColor = $('.picker.color-primary > li.selected').css('background-color');
	var secondaryColor = $('.picker.color-secondary > li.selected').css('background-color');
	console.log(primaryColor, secondaryColor);
	$('.illo.color-primary').css('background-color', primaryColor);
	$('.illo.color-secondary').css('background-color', secondaryColor);

	var mixedColor = mixColors (
			parseColor(primaryColor),
			parseColor(secondaryColor)
	);

	$('.color-mixed').css('background-color', mixedColor);
}

function randomPotion() {
	var l = $('.picker.color-primary > li').length;
	var pr = Math.random()*l|0;
	var sr = Math.random()*l|0;

	$('.picker.color-primary > li.selected').removeClass('selected');
	$('.picker.color-primary > li:eq('+(pr)+')').addClass('selected');
	
	
	while (sr == pr) { sr = Math.random()*l|0; }
	
	$('.picker.color-secondary > li.selected').removeClass('selected');
	$('.picker.color-secondary > li:eq('+(sr)+')').addClass('selected');
	
	createPotion();
}

// take our rgb(x,x,x) value and return an array of numeric values
function parseColor(value) {
	return (
			(value = value.match(/(\d+),\s*(\d+),\s*(\d+)/)))
			? [value[1], value[2], value[3]]
			: [0,0,0];
}

// blend two rgb arrays into a single value
function mixColors(primary, secondary) {		

	var r = Math.round( (primary[0] * .5) + (secondary[0] * .5) );
	var g = Math.round( (primary[1] * .5) + (secondary[1] * .5) );
	var b = Math.round( (primary[2] * .5) + (secondary[2] * .5) );

	return 'rgb('+r+', '+g+', '+b+')';
}

});