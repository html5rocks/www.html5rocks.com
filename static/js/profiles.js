$(function() {
  function updateHash(e) {
    $activeProfile = $('.profile.active');
    var lang = document.documentElement.lang || 'en';
    if ($activeProfile.length) {
      var profileID = $activeProfile.attr('id');
      history.replaceState({}, document.title, '/' + lang + '/profiles/#' +
                           profileID);
    } else {
      if (!!window.history) {
        history.replaceState({}, document.title, '/' + lang + '/profiles');
      } else {
        location.hash = "#"; // oh well, old browsers have to live with a #
      }
    }
  }

  $('.profile .list-articles').click(function(e) {
    var $profile = $(this).closest('.profile');
    $(this).toggleClass('active');
    $profile.find('.articles').toggleClass('active');
    $profile.find('.map').toggleClass('active');
    e.stopPropagation();
    return false;
  });

  window.scrollToProfile = function(opt_profileID) {
    var profileID = opt_profileID || null;
    if (!profileID && location.hash.length) {
      profileID = location.hash;
    }
    if (profileID) {
      $.scrollTo(profileID, 800, {offset: {top: -32}, onAfter: function() {
        $(profileID).addClass("active");
      }});
      setTimeout(function(){
        $(profileID).find('.list-articles').click();
      }, 700);
    }
  };

  $('.profile').click(function(e) {
    $('.profile').not(this).removeClass('active');
    $(this).toggleClass('active');
    $(this).find('.list-articles').toggleClass('active');
    $(this).find('.articles').toggleClass('active');
    $(this).find('.map').toggleClass('active');
    updateHash(e);
    e.stopPropagation();
  });

  function onHashChange(profileID) {
    $(".profile").removeClass("active");
    window.scrollToProfile(profileID);
  }

  window.addEventListener('hashchange', function(e) {
    if (!location.hash.length) {
      return;
    }
    onHashChange(location.hash);
  }, false);

});
