$(document).keydown(function(e) {

  if (e.keyCode === 27) { // ESC
    // Hide search and/or feature bar.
    $('#search_hide, #features_hide').click();
  }
});

// Features navigation.

// Toggle the feature nav.
$('.outline_nav_toggle').click(function(e) {
  $(this).toggleClass('activated');
  $(this).find('nav.outline').fadeToggle('fast');
});

// A feature is clicked.
$('nav.features_outline').on('click','a.section_title', function(e) {

  if ($(this).parent('li').hasClass('current')) {
    $(this).parent('li').removeClass('current');
    $(this).siblings('ul').slideUp('fast');
  } else {
    $('nav.features_outline li').removeClass('current');
    $('nav.features_outline a.section_title').siblings('ul').slideUp('fast');
    $(this).parent('li').addClass('current');
    $(this).siblings('ul').slideDown('fast');
  }
  
  e.stopPropagation();

});