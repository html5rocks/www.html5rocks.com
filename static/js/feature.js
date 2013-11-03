window.caniusecallback = function(data) {

  var page = $('.page.current');
  var dom  = page.find('.support div');

  window.caniusedata = data;

  if (page.hasClass('caniuseloaded')) return;

  $.each(caniuse.caniusefeatures, function(i, feature) {

    var featurestats = data.data[feature];
    var localdom = dom.clone();

    if (!featurestats) {
      return false;
    }

    var url = 'http://caniuse.com/#search=' + feature;
    localdom.find('h4').html((featurestats.title).link(url));

    $.each(featurestats.stats, function(browser, browserobj) {

      var resulttext = '—';

      $.each(data.agents[browser].versions, function(index, version) {
        if (!version) {
          return;
        }
        
        var result = browserobj[version];

        if (result.indexOf('y') === 0) {
          if (resulttext != '—') {
            resulttext += '+';
            return false;
          }
          resulttext = version;
        }
      });

      localdom.find('td.' + browser).text(resulttext);
    });

    localdom.find('table').css('visibility', 'visible').end()
            .insertAfter('.page.current .support h3');

    // remove placeholder table
    dom.remove();
    page.addClass('caniuseloaded');


    // Show names of browsers when hovering over the logo/version cells.
    $('section.support td').hover(
      function() {
         $('#support th.' + this.className).eq(0).addClass('current');
      },
      function() {
         $('#support th.' + this.className).eq(0).removeClass('current');
      }
    );

  }); // eo feature loop
}; // eo caniusecallback()


window.loadCanIUseData = function() {
  if (caniuse.caniusefeatures[0] && caniuse.caniusefeatures[0].length) {
    $('.page.current .support').show();

    if (window.caniusedata){
      return caniusecallback(caniusedata);
    }

    var myscript = document.createElement('script');
    myscript.src = 'http://caniuse.com/jsonp.php?callback=caniusecallback';

    var ref = document.getElementsByTagName('script')[0];
    ref.parentNode.insertBefore(myscript, ref);
  }
};

window.loadFeaturePanels = function() {
  var elem = $('.page.current').find('section.support')[0];

  if (!elem) {
    return;
  }

  window.caniuse = {
    caniusefeatures: elem.dataset.caniusefeatures.split(','),
    features: elem.dataset.features
  };

  loadCanIUseData();
};

window.loadFeaturePanels();
