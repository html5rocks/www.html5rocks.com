window.thirdParty = {

  init: function() {
    $('.share').before('<span class="share preview" onmouseover="thirdParty.load(this);"><img src="/static/images/share.png"></span>');
  },

  load: function(el) {
    $(el).remove();
    thirdParty.plus1();
    thirdParty.twitter();
    thirdParty.facebook();
    $('.share').css('display', 'block');
  },

  facebook: function() {

    $('li.facebook').not(':has("iframe")').html(function() {
      var html = '<iframe src="//www.facebook.com/plugins/like.php?href='+
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
      url : '//apis.google.com/js/plusone.js',
      dataType : 'script', cache: true,
      success : function(){
        gapi.plusone.go();
        gapi.plus.go();
      }
    });
  }
};

thirdParty.init();
