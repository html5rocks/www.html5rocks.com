

// Page header pulldowns.
$('#search_show a').click(function(e) {

  if (!window.google || (window.google && !google.search)){

    var url = '//www.google.com/jsapi?autoload=%7B%22modules%22%3A%5B%7B%22name' +
        '%22%3A%22search%22%2C%22version%22%3A%221%22%2C%22language%22%3A%22' +
        document.documentElement.lang + '%22%2C%20callback%3A%20wireUpSearch%7D%5D%7D';

    $.ajax({
      url: url,
      dataType: "script",
      cache: true
    });
  }

  e.preventDefault();
  $('#features_hide').click(); // Hide features panel if it's out.

  if ($(this).hasClass('current')) {
    $('.subheader.search').hide();
    $(this).removeClass('current');
    $('.watermark').css('top', '30px');
    $('#search_show a').focus();
  } else {
    $('.main nav .current').removeClass('current');
    $(this).addClass('current');
    $('.subheader.search').show();
    $('.watermark').css('top', '100px');
    $('#q').focus();
  }
});

$('#search_hide').click(function() {
  $('#search_show').removeClass('current');
  $('.subheader.search').hide();
  $('.watermark').css('top', '30px');
  $('#search_show a').focus();
});

// global used by search API callback
window.wireUpSearch = function(){
    var q = document.getElementById('q');

    if (window.google && google.search)
        google.search.CustomSearchControl.attachAutoCompletion(
            '007435387813601113811:ef_kuvvx6a8', 
            q, 'cse-search-box');

    if (q.addEventListener) {
      q.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) { // enter key
          document.getElementById('cse-search-box').submit();
        }
      }, false);
    }
}