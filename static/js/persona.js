window.updates = {
  feedsapi: function() {
    var gfeed = new google.feeds.Feed('http://updates.html5rocks.com/feeds/atom.xml');
    gfeed.setNumEntries(100);
    gfeed.load(function(result) {
      // get template
      var templateXHR = $.ajax({
        url: '/static/js/personatmpl.html',
        dataType: 'text',
        localCache: true,
        success: function(data) {
          var entries = [];
          for (var i = 0, entry; entry = result.feed.entries[i]; ++i) {
            if ($.inArray(selfPage, entry.categories) != -1 || selfPage == 'home') {
              var date = new Date(entry.publishedDate);
              entry.formattedDateStr = (date.getUTCMonth() + 1) + '/' + date.getUTCDate();
              entries.push(entry);
            }
          }

          // If we're on the homepage, cut the results to max 5.
          if (selfPage == 'home') {
            entries = entries.slice(0, 5);
          }

          updates.tmpl = Handlebars.compile(data);
          var html = updates.tmpl({updates: entries});
          $('#updates_list').append(html);
          updates.resort();
        }
      });
    });
  },
  init: function() {
    // load the gfeed API
    var jsapiurl = 'https://www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name%22%3A%22feeds%22%2C%22version%22%3A%221%22%2C%22callback%22%3A%22updates.feedsapi%22%7D%5D%7D';
    $.getScript(jsapiurl);
  },
  resort: function() {

    var entries = $('#updates_list li');

    entries = entries.each(function(i, entry) {

      // make real dates
      var date = new Date(entry.getAttribute('data-pubdate'));
      $.data(entry, 'date', date);

    }).get().sort(function(a, b) {

      // compare the dates
      return $.data(a,'date') > $.data(b,'date') ? -1 : 1;
    });

    // hello DOM
    $(entries).appendTo('#updates_list');
  }
};

updates.init();