window.tuts = {

  feed      : undefined,
  feeddfr   : $.Deferred(),
  authors   : undefined,
  tmpl      : undefined,

  classToTag : {
      "offline"       : ['appcache'],
      "storage"       : ['indexeddb'],
      "connectivity"  : ['xhr2', 'websockets'],
      "file_access"   : ['filesystem', 'file', 'quota'],
      "semantics"     : [],
      "multimedia"    : ['webaudio', 'video', 'media source'],
      "graphics"      : ['webgl', '3d'],
      "presentation"  : ['css','css3'],
      "performance"   : ['workers'],
      "nuts_and_bolts": ['devtools'],
  },

  feedsapi : function(){
    var gfeed = new google.feeds.Feed("http://updates.html5rocks.com/feeds/atom.xml");
    gfeed.setNumEntries(100);
    gfeed.load(function(result) {
      tuts.feed = result.feed;
      tuts.feeddfr.resolve();
    });
  },

  init : function() {

    // bind filter link
    $('#filter a').click(clearFilter);

     // load the gfeed API
     var jsapiurl = 'https://www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name%22%3A%22feeds%22%2C%22version%22%3A%221%22%2C%22callback%22%3A%22tuts.feedsapi%22%7D%5D%7D';
     $.getScript(jsapiurl);

    // get author data
    var authorXHR = $.ajax({
      url: '/api/authors',
      dataType: 'json',
      localCache : true,
      success: function(data){
        tuts.authors = data;
      }
    });

    // get template
    var templateXHR = $.ajax({
      url: '/static/js/tutstmpl.html',
      dataType: 'text',
      localCache : true,
      success: function(data){
        tuts.tmpl = Handlebars.compile( data );
      }
    });

    // when the three of these async events finish. kick things off.
    $.when( tuts.feeddfr.promise(), authorXHR, templateXHR )
     .done(tuts.compile);

  }, // eo init()

  compile : function(){

      tuts.normalize();

      var html     = tuts.tmpl({ updates: tuts.feed.entries });
      $('#index').append(html);

      tuts.resort();

  }, // eo compile()

  normalize : function(){

    tuts.feed.entries = tuts.feed.entries.map(function(entry){

      // author names (thx ERIC...)  :p
      if (entry.author == 'ebidelman') entry.author = 'ericbidelman';
      // okay on with the author names
      var authorentry = tuts.authors[entry.author];
      entry.fullname = authorentry.given_name + ' ' + authorentry.family_name;

      var months = ["January", "February", "March",
                    "April", "May", "June", "July", "August", "September",
                    "October", "November", "December"];
      var date = new Date(entry.publishedDate);
      entry.date = date.toJSON().split('T')[0]; // 2012-01-01
      entry.formattedDateStr = months[date.getMonth()].slice(0,3) +
                               '. ' + date.getDate() + ', ' +
                               date.getFullYear();


      // tags
      entry.categories = entry.categories.map(function(cat){
        return cat.replace(/,/g,'').trim();
      });
      entry.tags = entry.categories.join(', '); // not sure these are actually used...

      // map some of these into classes
      var classesObj = {};
      entry.classes = [];
      // iterate over categories
      for ( var i = 0, len = entry.categories.length;
            cat = entry.categories[i], i < len;
            i++)  {
        // for each category iterate over hash
        for (var key in tuts.classToTag){
          // if category matches key of hash,
          //  or
          // if the array in the hash contains the category...
          //   strip that out of categories and add to classes
          //if (key == cat || ~tuts.classToTag[key].indexOf(cat)){
          if (key == cat) {
            entry.categories.splice(i,1)
            classesObj[key] = true;
          }
        }
      }

      // remove duplicate categories
      entry.classes = Object.keys(classesObj);

      return entry;
    });


  }, // eo normalize()

  resort : function(){

    var entries = $('.tutorial_listing');

    // always rely on sort returning what you want
    entries = entries.each(function(i, entry) {

      // make real dates
      var date = new Date(entry.getAttribute('data-pubdate'));
      //$.data(entry, 'date', date.toJSON());
      $.data(entry, 'date', date); // Implicit date.toString().

    }).get().sort(function(a, b) {
      // compare the dates
      return $.data(a,'date') > $.data(b,'date') ? -1 : 1;
    });

    // hello DOM
    $(entries).appendTo('#index');

    if (typeof initPage === 'function')
      initPage();
  }
}; // eo tuts{}


function clearFilter() {
  $('.tutorial_listing.hidden').removeClass('hidden');
  $('#updates_tag_filter').val('');
  $('section.filter input[type="checkbox"]').attr('checked', false);
  $('#filter').parent().addClass('hidden');
  if (!!window.history) {
    var lang = document.documentElement.lang || 'en';
    history.replaceState({}, document.title, '/' + lang + '/tutorials/');
  } else {
    window.location.hash = '';
  }
  return false;
};

function initializeFilters(tag_str) {
  var simple_tags = [];
  tag_str.toLowerCase().split(',').forEach(function(eachtag, i) {
      var type_and_value = eachtag.split(':');
      if (type_and_value.length == 2) {
        var value_str = ' input[value="' + type_and_value[1] + '"]';
        switch (type_and_value[0]) {
          case 'type':
            $('#updates_format_filter' + value_str).attr('checked', true);
            break;
          case 'audience':
            $('#updates_audience_filter' + value_str).attr('checked', true);
            break;
          case 'technology':
            $('#updates_technology_filter' + value_str).attr('checked', true);
            break;
          default:
            break;
        }
    } else {
      simple_tags.push(type_and_value[0]);
    }
  });
  if (simple_tags.length) {
    var updates_tag_filter_elem = $('#updates_tag_filter')[0];
    if (updates_tag_filter_elem.value) {
      updates_tag_filter_elem.value += ',';
    }
    updates_tag_filter_elem.value += simple_tags.join(',');
  }
}

tuts.init();
