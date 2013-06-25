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

// basic routing setup based on the global page variable
// everything happens on the `page` variable

// if it is equal to 'features-offline', then we will execute (in this order)
// route.common();
// route['features']();
// route['features-offline']();

window.route = {
  
  features: function() {
    window.loadFeaturePanels && loadFeaturePanels();
  },

  init: function(thing) {
    var commonfn = route[(thing || '').split('-')[0]],
        pagefn   = route[thing];

    route.state = thing;

    route.fire(route.common);
    route.fire(commonfn);
    if (pagefn != commonfn) {
      route.fire(pagefn);
    }
  },

  fire: function(fn) {
    if (typeof fn == 'function') {
      fn.call(route);
    }
  },

  onload: function() {
    // kick off any functions associated with the current route
    route.init(document.body.getAttribute('data-href'));
  }
};

window.addEventListener('DOMContentLoaded', route.onload, false);
