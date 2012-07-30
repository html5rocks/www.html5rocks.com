
window.thirdParty = {

    delay: 500,

    init: function() {
      $(window).load(function() {
        setTimeout(function() {
          //thirdParty.GA(); // moved to base.html to record hits immediately.
          thirdParty.plus1();
          thirdParty.twitter();
          thirdParty.facebook();
          $('.share').css('display', 'block');
        }, thirdParty.delay);
      });
    },

    facebook: function() {

      $('li.facebook').not(':has("iframe")').html(function() {

        var html = '<iframe src="http://www.facebook.com/plugins/like.php?href='+
          this.getAttribute('data-url') +
          '&amp;layout=button_count&amp;show_faces=false&amp;width=80&amp;action=like'+
          '&amp;font=arial&amp;colorscheme=light&amp;height=21" scrolling="no" '+
          'frameborder="0" style="border:none; overflow:hidden; width:100px; height:21px;"'+
          ' allowTransparency="true"></iframe>';

        return html;
      });
    },

    twitter: function() {
      $.ajax({
        url : '//platform.twitter.com/widgets.js',
        dataType : 'script', cache: true,
        success : function() {   twttr.widgets.load();  }
      });
    },

    plus1: function() {
      // https://developers.google.com/+/plugins/+1button/#async-load
      window.___gcfg = { lang: document.documentElement.lang, parsetags: 'explicit' };

      $.ajax({
        url : 'https://apis.google.com/js/plusone.js',
        dataType : 'script', cache: true,
        success : function(){
          gapi.plusone.go();
          gapi.plus.go();
        }
      });
    },

    GA: function() {
        window._gaq = window._gaq || [];
        _gaq.push(['_setAccount', 'UA-15028909-1']);
        _gaq.push(['_trackPageview']);
        (function() {
            var ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            ga.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(ga, s);
        }());

    } // eo GA()
};

thirdParty.init();
