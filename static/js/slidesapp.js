
window.SLD = window.SLD || {};
window.SLD = {

  talks     : [],
  authors   : {},
  template  : undefined,
  talksdfr  : $.Deferred(),

  // called from jsonp
  receiveSpreadsheet : function(data) {
    if (data.feed)
      data.feed.entry.forEach(SLD.normalizeData);

    // fix the sort order in case.
    SLD.talks = SLD.talks.sort(function(a, b){

      function parseDate(str){
        var sp = str.split('/');
        return new Date(sp[2], sp[0] - 1, sp[1]);
      }

      return parseDate(a.dateexact) > parseDate(b.dateexact) ? -1 : 1;
    });

    SLD.talksdfr.resolve();

  }, // eo receiveSpreadsheet()

  normalizeData : function(obj, i) {

    var talk = {};
    talk.title = obj.title.$t;

    // split up the weird list view. all key names start with 'omg'
    var items = obj.content.$t.split(/(^|,\s)omg/)
          // drop whitespace items
          .filter(function(item){ return !!item.replace(/,?\s+/g,''); })
          // iterate over the rest, populating our talk obj
          .forEach(function(item){
            var splitted = item.split(':');
            talk[splitted.shift()] = splitted.join(':').trim();
    });

    SLD.talks.push(talk);

  }, // eo normalizeData()


  render : function(talks) {
    var html    = SLD.template({ talksArr: talks })
      , output  = document.querySelector('#output')
      , elems

    output.innerHTML = html;

    SLD.lazyEmbed();
    FLTR.setup();

  }, // eo render()

  lazyEmbed : function() {

    $('#output').on('click', 'div[data-embed]', function(){
      $(this).replaceWith( $(this).data('embed') );
    });

  },

  offline : function() {
    SLD.receiveSpreadsheet(SLD.talks = SLD.backuptalks);
  },

  init : function(){

    $.ajax({
     url      :"https://spreadsheets.google.com/feeds/list/0ArK1Uipy0SbDdHpQMzFWVFlMX1Zyd0tOWUxNeUE5QUE/od6/public/basic?alt=json-in-script",
     dataType :'jsonp',
     fail     : SLD.offline,
     success  : SLD.receiveSpreadsheet
    });

    var tmplXHR = $.ajax({
     url        :"/static/js/talkstmpl.html",
     dataType   :'text',
     localCache : true,
     success    : function(data){
       SLD.template = Handlebars.compile( data )
     }
    });

    var authXHR = $.getJSON('/api/authors', function(data){
      SLD.authors = data;
    })

    $.when( SLD.talksdfr.promise(), authXHR, tmplXHR ).done(function(){
      var talks = SLD.talks.length && SLD.talks || SLD.backuptalks
      SLD.render(talks);
    });

  }, // eo init()

  url2png : function(url,size){

    var api_key = "P4EA9CF92E4F9C";
    var f2 = 'F2';
    var private_key = ("4024A1" + f2 + "D6FD6S").split('').reverse().join('');

    url = url.trim()

    var token = md5("" + private_key + '+' + url);

    size = size || "s1280x1024-t459x359";

    // v4: // currently not resolving some things..
    // return "http://api.url2png.com/v4/" + [api_key, token, size, url].join('/');

    // v3:
    return "//api.url2png.com/v3/" + [api_key, token, '459x359', url].join('/');

  } // eo url2png


} // eo SLD{}

// handles filtering
window.FLTR = {

  input     : document.querySelector('input#filter_input'),
  dateinput : document.querySelector('input#datefilter'),
  dateoutput: document.querySelector('output'),

  elems   : undefined,
  entries : undefined,
  value   : undefined,

  setup : function(){
    inputPlaceholder( FLTR.input );
    FLTR.elems = document.querySelector('#output').querySelectorAll('h2,h3,h4,p,span.date');
    FLTR.entries = document.querySelector('#output').querySelectorAll('article');
    $(FLTR.input).on('keyup', FLTR.keyup);
    FLTR.dateinput.addEventListener('change', FLTR.datechange, false)
    FLTR.datechange();
    FLTR.keyup();
    FLTR.readFromHash();

    // hide slider if not supported.
    var input = document.createElement('input');
    input.setAttribute('type', 'range');
    if (input.type != 'range') FLTR.dateinput.parentNode.style.display = 'none';
  },

  keyup : function(e){
    var val = FLTR.value = (e && e.target.value.toLowerCase()) || '';

    FLTR.toggle(false);

    FLTR.filterElems(function(elem){
      var text = elem.innerText || elem.textContent;
      return ~text.toLowerCase().indexOf(val);
    });


    if (val == ''){
      FLTR.toggle(true);
      FLTR.filterElems(function(elem){ return true; });
    }

  },

  // include the elements if they match the callback
  filterElems : function(callback) {
    var i    = 0
      , hash = {};

    [].forEach.call( FLTR.elems, function(elem){
      if (callback(elem)){
        var curNode = elem;
        while (curNode.nodeName != 'ARTICLE') curNode = curNode.parentNode;

        var event = curNode.getAttribute('data-event');
        if (hash[event]) return;
        hash[event] = true;

        curNode.classList.remove('hidden');
        curNode.classList.remove('even');
        if (++i % 2) curNode.classList.add('even')
      }
    });
  },

  toggle : function(bool){
    [].forEach.call( FLTR.entries, function(elem) {
      // can't do elem.classList[ bool ? 'remove' : 'add' ]('hidden') because of the polyfill
      if (bool) {
        elem.classList.remove('hidden')
      }
      else {
        elem.classList.add('hidden')
      }
    });
  },

  datechange : function(e) {
    var val = (e && e.target.value) || '0';

    // earliest date in there.
    var min = new Date(SLD.talks[SLD.talks.length - 1].dateexact);
    // today
    var max = new Date();
    // num days since min
    var choice = new Date(+new Date(((max - min) * val / 100)) + +min);

    var months = ["January", "February", "March",
                  "April", "May", "June", "July", "August", "September",
                  "October", "November", "December"];

    FLTR.dateoutput.textContent = [months[choice.getMonth()], choice.getDate() + ',', choice.getFullYear()].join(' ');

    FLTR.toggle(false);

    FLTR.filterElems(function(elem){
      if (elem.nodeName != 'SPAN') return;
      var date = new Date(elem.getAttribute('data-time'));
      return date > choice;
    });

  }, // eo datechange()

  readFromHash : function(){
    var hash = location.hash.replace(/^#/,'');
    if (hash){
      $(FLTR.input).val(hash).keyup();
    }
  } // eo readFromHash

};


// in case of offline or spreadsheets is down or returning nothing..
SLD.backuptalks = [{"title":"The Latest in HTML5","presenter":"Eric Bidelman","dateexact":"7/7/2011","date":"July 2011","event":"Google Developer Relations Brown Bag","location":"Mountain View, CA","slideslink":"http://html5-demos.appspot.com/static/html5-whats-new/template/index.html"},{"title":"Building Web Apps with\nHTML5 and Chrome","presenter":"Boris Smus","dateexact":"5/15/2011","date":"May 2011","location":"Sao Paulo, Brazil","slideslink":"http://smustalks.appspot.com/brazil-11/"},{"title":"HTML5 Showcase for Web Developers: The Wow and the How","presenter":"Eric Bidelman, Arne Roomann-Kurrik","dateexact":"5/11/2011","date":"May 2011","event":"Google IO 2011","location":"San Francisco, CA","image":"http://functionscopedev.files.wordpress.com/2011/05/html5wow1.png?w=620&h=367","slideslink":"http://www.htmlfivewow.com/slide1","youtube":"http://www.youtube.com/watch?v=WlwY6_W4VG8","notes":"All code and demos are open sourced at <a href=\"http://code.google.com/p/html5wow/\">code.google.com/p/html5wow/</a>."},{"title":"HTML5 Development with the Chrome Dev Tools","presenter":"Boris Smus & Paul Irish","dateexact":"5/9/2011","date":"May 2011","event":"Google IO","location":"San Francisco","slideslink":"http://smustalks.appspot.com/devtools-lab-11/"},{"title":"MunichJS (IndexedDB & Chrome Extensions)","presenter":"Mike West","dateexact":"4/6/2011","event":"MunichJS","location":"Munich, Germany","slideslink":"http://20110406-munichjs.appspot.com/","slideshare":"http://www.slideshare.net/mikewest/munichjs-20110406"},{"title":"HTML5 & DOM & CSS3 Performance","presenter":"Paul Irish","dateexact":"4/1/2011","date":"April 2011","slideslink":"http://dl.dropbox.com/u/39519/talks/gperf/index.html","youtube":"http://www.youtube.com/watch?v=q_O9_C2ZjoA"},{"title":"State of the Browser","presenter":"Michael Mahemoff","dateexact":"3/19/2011","date":"March 2011","event":"State Of the Browser","location":"Ravensbourne, UK","slideslink":"http://prez.mahemoff.com/state-chrome/#0"},{"title":"HTML5 Storage: Application Cache","presenter":"Nikolas Coukoum","dateexact":"1/1/2011","date":"January 2011","event":"Google Tech Talk","youtube":"http://www.youtube.com/watch?v=CoUSIBep1G8","presently":"https://docs.google.com/present/view?id=ajdqczcmx5pv_147df36gf5x"},{"title":"Introduction to IndexedDB","presenter":"Mike West","dateexact":"12/13/2010","date":"December 2010","event":"Google Tech Talk","slideshare":"http://www.slideshare.net/mikewest/intro-to-indexeddb-beta","notes":"Full transcript and code examples available at <a href=\"http://mikewest.org/2010/12/intro-to-indexeddb\">mikewest.org/2010/12/intro-to-indexeddb</a>"},{"title":"HTML5 Storage","presenter":"Eric Bidelman","dateexact":"12/1/2010","date":"December 2010","event":"SenchaCon","location":"San Francisco","image":"/static/images/pres/html5storagesencha.png","slideslink":"http://html5-demos.appspot.com/static/html5storage/index.html","vimeo":"http://vimeo.com/17844271","notes":"Covers: local/sessionStorage, WebSQL, IndexedDB, app cache, File API, FileReader, BlobBuilder, FileSystem, FileWriter."},{"title":"Utilizing HTML5 in Google Chrome Extensions","presenter":"Eric Bidelman","dateexact":"12/1/2010","date":"December 2010","event":"Add-On-Con","location":"Mountain View, CA","image":"/static/images/pres/html5chromeext.png","slideslink":"http://html5-demos.appspot.com/static/addoncon2010/index.html"},{"title":"Building for a Faster Web","presenter":"Eric Bidelman","dateexact":"11/2/2010","date":"November 2010","event":"Google DevFest","location":"Buenos Aires, Argentina","slideshare":"http://www.slideshare.net/ebidel/html5-building-for-a-faster-web-5635959","youtube":"http://www.youtube.com/watch?v=PsmPF9pO56I"},{"title":"What's a web app? Building Apps for the Chrome Web Store","presenter":"Eric Bidelman","dateexact":"11/2/2010","date":"November 2010","event":"Google DevFest","location":"Buenos Aires, Argentina","slideshare":"http://www.slideshare.net/ebidel/so-whats-a-web-app-introduction-to-the-chrome-web-store","youtube":"http://www.youtube.com/watch?v=TcaWEk2O3CM"},{"title":"Web Apps and the Chrome Web Store","presenter":"Paul Kinlan","dateexact":"11/1/2010","date":"November 2010","event":"GDD","location":"Munich","image":"/static/images/pres/waandcws.png","slideslink":"http://gdd-2010.appspot.com/WebStore/index.html"},{"title":"The State of HTML5","presenter":"Paul Irish","dateexact":"10/1/2010","date":"October 2010","slideslink":"http://stateofhtml5.appspot.com/","blip":"<embed src=\"http://blip.tv/play/hq0KgoeYRwI\" type=\"application/x-shockwave-flash\" width=\"480\" height=\"300\" wmode=\"transparent\" allowscriptaccess=\"always\" allowfullscreen=\"true\" ></embed>"},{"title":"HTML5: Building the Next Generation of Web Applications","presenter":"Eric Bidelman","dateexact":"8/14/2010","date":"August 2010","event":"COSUP/GNOME.Asia","location":"Taipei, Taiwan","slideshare":"http://www.slideshare.net/ChromiumDev/html5-building-the-next-generation-of-web-applications?from=ss_embed","youtube":"http://www.youtube.com/watch?v=dVyq79wWCU4&feature=player_embedded"}];

SLD.backupauthors = {"paulirish":{"given_name":"Paul","family_name":"Irish"},"idogreen":{"given_name":"Ido","family_name":"Green"},"ilmari":{"given_name":"Ilmari","family_name":"Heikkinen"},"wesleyhales":{"given_name":"Wesley","family_name":"Hales"},"taligarsiel":{"given_name":"Tali","family_name":"Garsiel"},"adammark":{"given_name":"Adam","family_name":"Mark"},"paulkinlan":{"given_name":"Paul","family_name":"Kinlan"},"eligrey":{"given_name":"Eli","family_name":"Grey"},"derekdetweiler":{"given_name":"Derek","family_name":"Detweiler"},"davidtong":{"given_name":"David","family_name":"Tong"},"ericbidelman":{"given_name":"Eric","family_name":"Bidelman"},"luigimontanez":{"given_name":"Luigi","family_name":"Montanez"},"marcinwichary":{"given_name":"Marcin","family_name":"Wichary"},"michaeldewey":{"given_name":"Mike","family_name":"Dewey"},"malteubl":{"given_name":"Malte","family_name":"Ubl"},"geoffblair":{"given_name":"Geoff","family_name":"Blair"},"monsurhossain":{"given_name":"Monsur","family_name":"Hossain"},"jameswilliams":{"given_name":"James","family_name":"Williams"},"jankleinert":{"given_name":"Jan","family_name":"Kleinert"},"smus":{"given_name":"Boris","family_name":"Smus"},"matthackett":{"given_name":"Matt","family_name":"Hackett"},"jeremychone":{"given_name":"Jeremy","family_name":"Chone"},"paullewis":{"given_name":"Paul","family_name":"Lewis"},"danielmoore":{"given_name":"Daniel X.","family_name":"Moore"},"agektmr":{"given_name":"Eiji","family_name":"Kitamura"},"adriangould":{"given_name":"Adrian","family_name":"Gould"},"mahemoff":{"given_name":"Michael","family_name":"Mahemoff"},"hakimelhattab":{"given_name":"Hakim","family_name":"El Hattab"},"ernestd":{"given_name":"Ernest","family_name":"Delgado"},"petele":{"given_name":"Pete","family_name":"LePage"},"mdeal":{"given_name":"Michael","family_name":"Deal"},"dutton":{"given_name":"Sam","family_name":"Dutton"},"sethladd":{"given_name":"Seth","family_name":"Ladd"}};


// kick things off
$(SLD.init);


// handlebars helpers
Handlebars.registerHelper('video', function(video) {

  var uri = parseUri(video)
    , domain = uri.host
    , id
    , html

  if (/youtube\.com$/.test(domain)){
    id = uri.queryKey.v;

    iframe = '<iframe src=\'http://www.youtube.com/embed/' + id +
           '?autoplay=1' +  (uri.anchor ? '&start=' + uri.anchor.match(/\d+/) : '') +
           '\' frameborder=\'0\' allowfullscreen></iframe>';
    html = '<div data-embed="' + iframe + '"><span></span>' + // ▶  ▷
             '<img src="http://i.ytimg.com/vi/' + id + '/hqdefault.jpg">' +  // ideally this is 'hqdefault.jpg', but can be 'default' if HQ isnt available.
           '</div>';

  } else if (/vimeo\.com$/.test(domain)){
    id = uri.path.match(/\d+/)[0];
    html = '<iframe src="http://player.vimeo.com/video/' + id +
           '?title=0&amp;byline=0&amp;portrait=0&amp;color=0" frameborder="0"></iframe>';
  } else if (~video.indexOf('blip.tv')){

    html = '<iframe src="' + video.match(/src="(.*?)"/)[1] +
           '" frameborder="0" scrolling="no"></iframe>';
  }

  return new Handlebars.SafeString('<div class="video">' + html + '</div>');
});


Handlebars.registerHelper('slides', function(slides) {

  var uri = parseUri(slides)
    , domain = uri.host
    , id
    , html

  if (~slides.indexOf('docs.google.com/present')){
    id = uri.queryKey.id;
    html = '<iframe src="https://docs.google.com/present/view?id=' + id +
           '&revision=_latest&start=0&theme=blank&cwj=true" frameborder="0"></iframe> ';

  } else if (/slideshare\.net$/.test(domain)){

    html = '<iframe ' +
           'src="http://icant.co.uk/slidesharehtml/embed.php?url=' + uri.source +
           '&width=450"></iframe>';
  }

  return new Handlebars.SafeString('<div class="slides">' + html + '</div>');
});




Handlebars.registerHelper('img', function() {

  var image = this.image;

  if (image && ~image.indexOf('/')) return image;
  if (image) return '/static/images/pres/' + image;
  // return 'http://www.awwwards.com/awards/images/1284023910slides.jpg';
  return SLD.url2png(this.slideslink);
});




Handlebars.registerHelper('presntr', function(names) {


  // normalize authors data
  if (Object.keys(SLD.authors).length == 0) SLD.authors = SLD.backupauthors;

  var authormap = {};
  for (author in SLD.authors){
    var obj = SLD.authors[author];
    authormap[obj.given_name + ' ' + obj.family_name] = author;
  }

  var html = '';

  names = names.split(/ and|&|, /)

  // using map polyfill and string.trim
  html = names.map(function(name) {

    var lookup = authormap[name.trim()];
    if (lookup) {
      return '<a href="/profiles/#' + lookup + '">' + name + '</a>';
    } else {
      return name;
    }

  }).join(' & ');

  return new Handlebars.SafeString(html);
});
