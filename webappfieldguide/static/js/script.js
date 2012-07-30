/*
Copyright 2012 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License

See /humans.txt for details on authors and contributors

*/

var History, goToChapter, nextpage, prevpage, goToNextChapter, rightKeyActive,
    leftKeyActive, typeSearchBar, cursorAnimation, updateURL, updateTocNav,
    updateLocalDB, updateShareWidgets, rightKey, leftKey,
    disableStuffForZoom, enableStuffForZoom, previewLinkParent,
    previewLinkParentLocation, previewListLocation, previewDivLocation,
    previewLinkPosition, throw404, loadFirstSection, _gaq, goToChapterMobile,
    clearLocalDB, localStorageDB, twttr, FB, gapi, bookmarkedSectionIndex,
    sectionStateIndex, zoomOut, escapeKey, showPageDecorations;

(function () {
  "use strict";


  (function (window, undefined) {

    // Prepare
    var History = window.History; // Note: We are using a capital H instead of a lower h
    if (!History.enabled) {
      // History.js is disabled for this browser.
      // This is because we can optionally choose to support HTML4 browsers or not.
      return false;
    }

  })(window);

  var BASE_URL = '/webappfieldguide/';

  $(document).ready(function () {

    var isMobileView = false;

    // calculate window width
    var windowWidth = $(window).width();

    if (windowWidth < 1025) {
      isMobileView = true;
    }

    var sectionIndex = null;

    // anytime the state is changed, this function fires
    function handlePopState(event) {
      if (sectionIndex != null) {
          var state = History.getState();

        //console.log("handlePopState", state, state.data.index, state.data.direction, state.title, state.data.relativePath);

        var curChapter = $('.chapter.current').attr('id');
        var URLparts = document.location.href.split("/");
        var urlChapter = URLparts[4];
        var urlPage = URLparts[5];
        if (urlPage === null) {
          urlPage = 1;
        }

        if (urlChapter === '') {
          goToChapter('toc', 'prev');
        } else if (state.data.index === undefined) {
          goToChapter('404', 'next');
        } else {
          var currentChapterIndex = $('.chapter.current').index('.chapter');
          var currentSectionIndex = $('section.current').index('section');

          // is there a section in the history url?
          if (urlPage) {
            sectionStateIndex = $('.chapter section#' + urlPage).index('section');
            if (sectionStateIndex === currentSectionIndex) {
              // Do nothing, we're already at the right place
            } else if (sectionStateIndex > currentSectionIndex) {
              goToChapter(urlChapter, 'next', sectionStateIndex);
            } else {
              goToChapter(urlChapter, 'prev', sectionStateIndex);
            }
          } else {
            // just go to the fist page of the chapter
            if (sectionStateIndex > currentChapterIndex) {
              goToChapter(urlChapter, 'next');
            } else {
              goToChapter(urlChapter, 'prev');
            }
            //goToChapter(id, direction, sectionNum)
          }
        }
        event.preventDefault();
      }
      event.preventDefault();
    }

    window.addEventListener('popstate', handlePopState, false);


    ////////////// Mobile logic //////////////

    function goMobile() {
      $('section').css('width', '');
      $('.booknav,.chapterNav,.pagesRight,.pagesLeft,.pageTurnTargetRight,.PageTurnTargetLeft').hide();

      isMobileView = true;
      $('.chapter').not('.current').hide();
      $('.chapter.current section').show();
      var currentPagePos = $('.chapter.current section.current').position().top;
      $(window).scrollTop(currentPagePos);
    }

    function goDesktop() {
      $('section').css('width', '');
      $('.chapter.current section.current').prevAll().hide();
      isMobileView = false;
      $('.booknav,.chapterNav,.pagesRight,.pagesLeft,.pageTurnTargetRight,.PageTurnTargetLeft').show();
      $('#binding-container').css('marginTop', 0);
      $('#background').css('opacity', 1);
    }


    // mobile menu

    $('.mobileNav').click(function () {
      $(this).toggleClass('down');
      $('.mobileMenu').toggle();
    });


    // recalculate window width if you resize the browser
    $(window).resize(function () {
      windowWidth = $(window).width();
      if (windowWidth < 1025) {
        goMobile();
      } else {
        goDesktop();
      }

    });





    ////////////// NEXT & PREVIOUS PAGE BUTTONS //////////////

    $('.pageTurnTargetRight').click(function () {
      $('.PageTurnPreviewRight').width('0');
      nextpage();
      updateURL('next');
    });

    $('.pageTurnTargetLeft').click(function () {
      prevpage();
      $('.PageTurnPreviewLeft').width('0');
      updateURL('prev');
    });

    var sections = null;
    var sectionWidth = null;
    var nextSection = null;
    var pageWidth = $('section.current .page').outerWidth();
    var pageWidthInner = $('section.current .page').width();
    var pageOneStartPos = null;
    var pageOneStartPosL = null;
    var pageTwoStartPos = null;
    var pageTwoStartPosR = null;
    var pageTwoStartPosL = null;
    var nextChapterID = null;
    var prevChapterID = null;



    function nextpage(indexNum) {

      // if on the last section of a given chapter, go to the next chapter
      if ($('.chapter.current section:last').hasClass('current')) {
        goToNextChapter();
      } else {
        // get left positions of page one and two in case the browser window width has changed
        sectionWidth = $('section.current').outerWidth();
        pageWidth = $('section.current .page').outerWidth();
        pageOneStartPosL = $('section.current .page.one').position().left;
        pageTwoStartPos = pageWidth;
        pageTwoStartPosR = sectionWidth;
        pageWidthInner = $('section.current .page').width();

        $('.chapterNav').fadeOut('fast');

        $('section.current').next('section').css('width', sectionWidth);

        // animate the current section's width to zero
        $('section.current').prepend('<div class="turnshadow right"></div>')
          .addClass('turning right')
          .animate({'width': '0'}, {duration: 600, easing: 'swing', complete: function () {
              $(this).removeClass('turning right');
              $('div.turnshadow').remove();
              $(this).css({'width': ''}).hide();
            }
        });

        // if a specific section index is passed, animate to the index page instead of the next page
        if (indexNum === undefined) {
          // make the next section the current section
          sectionIndex++;
        } else {
          $('section').not('section.current').hide();
          sectionIndex = indexNum;
        }

        $('section.current').removeClass('current');

        nextSection = sections.eq(sectionIndex);
        nextSection.addClass('current').show();

        // move page one of the next section to the right of the book, then animate it open at the same time as the current section is animating away
        $('section.current .page.one')
          .css({'width': '0', 'left': pageTwoStartPosR})
          .animate({'width': pageWidthInner, 'left': '0'},
            {duration: 600, easing: 'swing', complete: function () {
                $(this).css({'width': '', 'left': ''});
                $('.chapterNav').fadeIn('fast');
              }
          });

        $('.chapterPreview').hide();

        var currentChapter = $('.chapter.current').attr('id');
        var currentPage = $('.cf.current').attr('id');
        showPageDecorations(currentChapter, currentPage);
      }
    }


    function prevpage(indexNum) {

      if ($('.chapter.current section:first').hasClass('current')) {
        prevChapterID = $('.chapter.current').prev().attr('id');
        var goToSectionIndex = sectionIndex - 1;
        goToChapter(prevChapterID, 'prev', goToSectionIndex);
      } else {

        // get left positions of page one and two in case the browser window
        // width has changed
        sectionWidth = $('section.current').outerWidth();
        pageWidth = $('section.current .page').outerWidth();
        pageOneStartPosL = $('section.current .page.one').position().left;
        pageTwoStartPos = pageWidth;
        pageTwoStartPosR = pageTwoStartPos + pageWidth;
        pageWidthInner = $('section.current .page').width();

        $('.chapterNav').fadeOut('fast');

        if (indexNum === undefined) {
          // make the next section the current section
          sectionIndex--;
        } else {
          sectionIndex = indexNum;
        }

        // make the previous section the current section
        $('section.current').removeClass('current');
        nextSection = sections.eq(sectionIndex);
        nextSection.addClass('current');
        $('section.current').prevAll().hide();

        // move page one of the next section to the right of the book, then
        // animate it open at the same time as the current section is animating
        // away
        $('section.current').css({'width': '0'}).show()
          .prepend('<div class="turnshadow left"></div>')
          .addClass('turning left')
          .animate({'width': sectionWidth},
            {duration: 600, easing: 'swing', complete: function () {
                $(this).removeClass('turning left').css({'width': ''});
                $('div.turnshadow').remove();
              }
            });

        $('section.current .page.two')
          .css({'width': '0', 'left': '0', 'z-index': '999'})
          .animate({'width': pageWidthInner, 'left': pageTwoStartPos},
            {duration: 600, easing: 'swing', complete: function () {
                $(this).css({'width': '', 'left': '', 'z-index': ''});
                $('.chapterNav').fadeIn('fast');
              }
          });

        $('.chapterPreview').hide();
        var currentChapter = $('.chapter.current').attr('id');
        var currentPage = $('.cf.current').attr('id');
        showPageDecorations(currentChapter, currentPage);
      }
    }

    ////////////// NAV TABS //////////////

    // give a push down effect when you click down and up on the tab
    $('a.booknav.home').mousedown(function () {
      if (!($(this).hasClass('current'))) {
        $(this).css({"padding": "9px 4px 9px 4px", "margin": "1px 0 1px 0", "left": "-18px"});
      }
    });

    $('a.booknav.home').mouseup(function () {
      if (!($(this).hasClass('current'))) {
        $(this).css({"padding": "10px 5px 10px 5px", "margin": "0", "left": "-20px"});
      }
    });

    // animate tab out when you hover over it
    $('a.booknav.home').hover(
      function () {
        if (!($(this).hasClass('current'))) {
          $(this).animate({left: '-20px'}, {duration: 100, easing: 'swing'});
        }
      },
      function () {
        if (!($(this).hasClass('current'))) {
          $(this).animate({left: '-15px'}, {duration: 100, easing: 'swing'});
        }
      }
    );

    $('a.booknav.home').click(function () {
      if (!($(this).hasClass('current'))) {
        //$('a.booknav').removeClass('current');
        //$(this).addClass('current');
        goToChapter('toc', 'prev');
        $('.pagesLeft').hide();
        //rightKeyActive = true;
        //leftKeyActive = false;
      }
    });

    // give a push down effect when you click down and up on the tab
    $('a.booknav.search').mousedown(function () {
      if (!($(this).hasClass('current'))) {
        $(this).css({"padding": "9px 4px 9px 4px", "margin": "1px 0 1px 0", "right": "-20px"});
      }
    });

    $('a.booknav.search').mouseup(function () {
      if (!($(this).hasClass('current'))) {
        $(this).css({"padding": "10px 5px 10px 5px", "margin": "0", "right": "-15px"});
      }
    });

    // animate tab out when you hover over it
    $('a.booknav.search').hover(function () {
        if (!($(this).hasClass('current'))) {
          $(this).animate({right: '-20px'}, {duration: 100, easing: 'swing'});
        }
      },
      function () {
        if (!($(this).hasClass('current'))) {
          $(this).animate({right: '-15px'}, {duration: 100, easing: 'swing'});
        }
      }
    );

    $('a.booknav.search').click(function () {
      if (!($(this).hasClass('current'))) {
        //$('a.booknav').removeClass('current');
        //$(this).addClass('current');
        goToChapter('search', 'next');
        $('.pagesRight').hide();
        //updateURL('next');
      }
    });





    ////////////// PAGE TURN PREVIEW //////////////
    $('.pageTurnTargetRight').hoverIntent(function () {
        $('.PageTurnPreviewRight').animate({'width': '200px'},
          {duration: 400, easing: 'swing'});
      }, function () {
        $('.PageTurnPreviewRight').animate({'width': ''},
          {duration: 400, easing: 'swing'});
      });

    $('.pageTurnTargetLeft').hoverIntent(function () {
        $('.PageTurnPreviewLeft').animate({'width': '200px'},
          {duration: 400, easing: 'swing'});
      }, function () {
        $('.PageTurnPreviewLeft').animate({'width': ''},
          {duration: 400, easing: 'swing'});
      });






    ////////////// SHARE BUTTON LOGIC //////////////

    var shareclicked = false;
    $('div.share').hoverIntent(function () {
        $('.shareOptions').fadeIn('fast');
        var shareCardHeight = $('.shareOptions').height();
        var animateShareCardPreviewTo = shareCardHeight;
        $('.shareOptions').animate({opacity: '1'}, {duration: 300, easing: 'swing'});
      }, function () {
          $('.shareOptions').animate({opacity: '0'}, {duration: 300, easing: 'swing', complete: function () {
            $(this).hide();
          }
        });
      });






    ////////////// LOAD CHAPTER FUNCTION //////////////

    var pagenum = 1;
    var index = 2000;
    var numSections = null;
    var numPages = null;
    var numChapters = $('.chapter').size();

    function loadChapter(chapter) {
      // get the chapter name of current chapter
      var chapterName = $('#' + chapter).attr("data-title");
      var chapterNum = null;
      if (!(chapter === 'toc' || chapter === 'search' || chapter === '404')) {
        chapterNum = $('#' + chapter).attr('class').split(' ')[1];
      }

      // add the chapter name to the top of each page
      $('#' + chapter + ' .page.one').prepend('<p class="page-title"><em>' + chapterName + '<\/em><\/p>');
      $('#' + chapter + ' .page.two').prepend('<p class="page-title">Bert Appward&#39;s Field Guide to Web Applications | 2012 Edition<\/p>');

      // add page numbers to the bottom of each page
      $('#' + chapter + ' .page').append('<p class="pageNum"><\/p>').trigger('myhoverintent');

      if (!(chapter === '404' || chapter === 'search')) {
        $('#' + chapter + ' .page:last').append('<div class="mobileNextSpacer"></div><a class="mobileNext" href="return false;">Next Chapter</a>');
      }

      // count the number of pages in said chapter
      pagenum = 1;
      numPages = $('#' + chapter + ' .page').size();

      // auto increment page numbers and add the number of pages in each chapter
      if (chapterNum) {
        $('#' + chapter + ' p.pageNum').each(function () {
          $(this).text('Chapter ' + chapterNum + ' | Page ' + pagenum + '\/' + numPages);
          pagenum++;
        });
      }

      // re generate z-indexes for all sections in book
      index = 2000;
      $('section').each(function () {
          $(this).css('z-index', index--);
        });

      $('#' + chapter + ' .page').wrapInner('<div class="page-innerwrap"/>');

      // grab all sections
      sections = $('section');
      //sectionIndex = sections.index();

      // make the first section of the chapter the current

      numSections = $('section').size();
    }

    // hide all chapters
    $('div.chapter').hide();

    var currentChapter = $('.chapter.current').attr('id');

    // goToChapter Function - figure out if chapter has been loaded, if so, navigate to it
    function goToChapter(id, direction, sectionNum) {
      currentChapter = $('#' + id).attr('id');
      if (sectionNum == null) {
        sectionNum = $('#' + id + ' section:first').index('section');
      }

      if (isMobileView) {
        $('.chapter').removeClass('current').hide();
        $('section').removeClass('current');
        $('#' + id).addClass('current');
        if (!(sectionNum)) {
          $('.chapter.current section:first').addClass('current');
          $('#' + id).show();
          scroll(0, 0);
          sectionIndex = $('.chapter.current section.current').index('section');
        } else {
          $('section').eq(sectionNum).addClass('current');
          $('#' + id).show();
          var currentSectionTopPos = $('section.current').position().top;
          if (currentSectionTopPos >= 25) {
            $.smoothScroll({scrollTarget: 'section.current', speed: 500});
          } else {
            scroll(0, 0);
          }
        }
      } else {
        $('.chapter').not($('.chapter.current')).hide();
        $('.chapter.current').removeClass('current');
        $('#' + id).addClass('current').show();

        if (direction == 'next') {
          nextpage(sectionNum);
        } else {
          prevpage(sectionNum);
        }
      }
      updateTocNav();
    }

    function goToNextChapter() {
      var nextChapterID = $('.chapter.current').next('.chapter').attr('id');
      goToChapter(nextChapterID, 'next');
    }


    function goToPrevChapter() {
      var prevChapterID = $('.chapter.current').prev('.chapter').attr('id');
      goToChapter(prevChapterID, 'prev');
    }

    function showPageDecorations(chapter, section) {
      $('a.booknav').removeClass('current');
      if ((chapter == 'toc' && section == 'index') || (chapter == 'toc' && section === '') || (chapter == 'toc' && section === undefined)) {
        $('a.booknav.home').addClass('current');
        $('.pagesLeft,.pageTurnTargetLeft').hide();
        $('.pagesRight,.pageTurnTargetRight').show();
        leftKeyActive = false;
        rightKeyActive = true;
        $('.share').show();
      } else if (chapter == 'toc' || chapter == 'know-your-apps' || chapter == 'designing-web-applications' || chapter == 'case-studies' || chapter == 'building-great-web-applications' || chapter == 'about-appward') {
        $('.pagesLeft,.pageTurnTargetLeft').show();
        $('.pagesRight,.pageTurnTargetRight').show();
        leftKeyActive = true;
        rightKeyActive = true;
        $('.share').show();
      } else if (chapter == 'search') {
        $('a.booknav.search').addClass('current');
        $('.pagesLeft,.pageTurnTargetLeft').show();
        $('.pagesRight,.pageTurnTargetRight').hide();
        leftKeyActive = true;
        rightKeyActive = false;
        if (!($('#s_b').val())) {
          typeSearchBar();
          setInterval(cursorAnimation(), 600);
        }
        $('.share').hide();
      } else {
        $('.pagesLeft,.pageTurnTargetLeft').hide();
        $('.pagesRight,.pageTurnTargetRight').hide();
        rightKeyActive = false;
        leftKeyActive = false;
        $('.share').hide();
      }
    }

    $('.mobileNext').live('click', function () {
      goToNextChapter();
    });






    ////////////// History.js Helpers //////////////

    // Prepare Variables
    var activeClass = 'active selected current youarehere',
        activeSelector = '.active,.selected,.current,.youarehere',
        $body = $(document.body),
        rootUrl = History.getRootUrl();

    // Internal Helper
    $.expr[':'].internal = function (obj, index, meta, stack) {
      // Prepare
      var $this = $(obj),
          url = $this.attr('href') || '',
          isInternalLink;

      // Check link
      isInternalLink = url.substring(0, rootUrl.length) === rootUrl || url.indexOf(':') === -1;

      // Ignore or Keep
      return isInternalLink;
    };






    ////////////// CHAPTER NAV //////////////

    // chapter nav circle hovers
    $(".chapterNav a").hoverIntent(function () {
        $('.chapterPreview', this).fadeIn();
      }, function () {
        $('.chapterPreview', this).fadeOut();
      });


    // Figure out which TOCnav item to one to mark current
    var currentChaptNum = null;
    function updateTocNav() {
      if (!(isMobileView)) {
        currentChaptNum = $('.chapter.current').attr('class').split(' ')[1];
        $('.chapterNav a').removeClass('current');
        if (currentChaptNum !== 'null') {
          $('.chapterNav a.' + currentChaptNum).addClass('current');
        } else {
          $('.chapterNav').hide();
        }
      }
    }


    function updateURL(direction) {
      if (sectionIndex !== -1) {
        var curChapter = $('.chapter.current');
        var curPage = $('.chapter section.current').attr('id');
        var title = curChapter.attr('data-title') || null;
        var url = "";
        if (!(curPage)) {
          url = BASE_URL + curChapter.attr('id') + '/';
        } else {
          url = BASE_URL + curChapter.attr('id') + "/" + curPage + '/';
        }
        var fullURL = document.location.href;
        var state = {};
        state.index = sectionIndex;
        state.chapter = curChapter.attr('id');
        state.page = curPage;
        state.relativePath = url;
        state.direction = direction;
        History.pushState(state, title, url);
        if (_gaq) {
          _gaq.push(['_trackPageview', url]);
        }
        updateLocalDB(fullURL);
        updateShareWidgets();
        //log("updateURL", state, sectionIndex, direction, title, url);
      } else {
        //log("weird updateURL error state");
      }
    }


    // TOC Nav
    $('.toc-chapter').live('click', function () {
      var goTo = $(this).attr('data-title');
      goToChapter(goTo, 'next');
      updateURL('next');
    });








    ////////////// AJAXIFY //////////////

    // ajaxify all links in site except external links and links with the class no-ajaxy
    $('a:not(.no-ajaxy)').live("click", function (event) {
      // Prepare
      var
        $this = $(this),
        url = $this.attr('href'),
        title = $this.attr('data-title') || null;

      // Continue as normal for cmd clicks etc
      if (event.which == 2 || event.metaKey) {
        return true;
      }

      var hrefPieces = url.split("/");
      if (!(hrefPieces.length <= 1)) {
        var hrefChapter = hrefPieces[2];
        var hrefSection = hrefPieces[3];

        // is there a chapter in the url?
        if (hrefChapter) {
          // does that chapter exist in the content?
          if ($('.chapter#' + hrefChapter).is('*')) {

            var currentChapterIndex = $('.chapter.current').index('.chapter');
            var hrefChapterIndex = $('.chapter#' + hrefChapter).index('.chapter');

            // is there a section in the url?
            if (hrefSection) {
              // does that section exist in the content?
              if ($('section#' + hrefSection).is('*')) {
                var currentSectionIndex = $('section.current').index('section');
                var hrefSectionIndex = $('section#' + hrefSection).index('section');

                if (hrefSectionIndex > currentSectionIndex) {
                  goToChapter(hrefChapter, 'next', hrefSectionIndex);
                } else {
                  goToChapter(hrefChapter, 'prev', hrefSectionIndex);
                }

              } else {
                goToChapter('404', 'next');
              }
            } else {
              // just go to the fist page of the chapter
              if (hrefChapterIndex > currentChapterIndex) {
                goToChapter(hrefChapter, 'next');
              } else {
                goToChapter(hrefChapter, 'prev');
              }
            }
          } else {
            goToChapter('404', 'next');
          }
        } else {
          goToChapter('toc', 'prev');
        }
      }
      updateURL('ajaxy');
      event.preventDefault();
      return false;
    });







    ////////////// KEYBOARD SHORTCUTS //////////////

    $(document).bind('keydown', 'right', function (evt) {rightKey(); });
    $(document).bind('keydown', 'left', function (evt) {leftKey(); });
    $(document).bind('keydown', 'j', function (evt) {rightKey(); });
    $(document).bind('keydown', 'k', function (evt) {leftKey(); });
    $(document).bind('keydown', 'esc', function (evt) {escapeKey(); });
    var rightKeyActive = true;
    var leftKeyActive = false;



    function rightKey() {
      if (rightKeyActive) {
        if (!(isMobileView)) {
          nextpage();
          updateURL('next');
        }
      }
    }

    function leftKey() {
      if (leftKeyActive) {
        if (!(isMobileView)) {
          prevpage();
          updateURL('prev');
        }
      }
    }









    ////////// BOOKMARK BUTTON ///////////

    $(".shareOptions a.bookmark").click(function (e) {
      e.preventDefault(); // this will prevent the anchor tag from going the user off to the link
      var bookmarkUrl = this.href;
      var bookmarkTitle = this.title;

      if (window.sidebar) { // For Mozilla Firefox Bookmark
        window.sidebar.addPanel(bookmarkTitle, bookmarkUrl, '');
      } else if (window.external || document.all) { // For IE Favorite
        window.external.AddFavorite(bookmarkUrl, bookmarkTitle);
      } else if (window.opera) { // For Opera Browsers
        $("a.jQueryBookmark").attr("href", bookmarkUrl);
        $("a.jQueryBookmark").attr("title", bookmarkTitle);
        $("a.jQueryBookmark").attr("rel", 'sidebar');
      } else { // for other browsers which does not support
        //TODO remove alert
        //alert('Your browser does not support this bookmark action');
        return false;
      }
    });







    ////////// CASE STUDY LOGIC ///////////

    var hoveredCaseStudy = null;
    var arrowpos = null;
    var currentCaseStudy = null;

    $('#case-studies').bind('myhoverintent', function () {
      $('.techIcons a').hoverIntent(
        function () {
          currentCaseStudy = $(this).parent().parent().attr('id');
          hoveredCaseStudy = $(this).attr('class');
          arrowpos = $(this).position().left + 2;
          $('#' + currentCaseStudy + ' .techArrow').css('left', arrowpos + 'px').fadeIn('fast');
          $('#' + currentCaseStudy + ' .caseStudyDescription.' + hoveredCaseStudy).fadeIn('fast');
        }, function () {
          $('#' + currentCaseStudy + ' .caseStudyDescription.' + hoveredCaseStudy + ', #' + currentCaseStudy + ' .techArrow').fadeOut('fast');
        });
    });

    var isZoomed = false;

    $('.caseStudyImg').live('click', function () {
      if (!(isMobileView)) {
        isZoomed = true;
        $('section').removeClass('rightside leftside');

        if ($(this).parents('.page').hasClass('one')) {
          $('.lightbox').fadeIn(function () {
            $('section.current').addClass('leftside zoom');
            $('#container').addClass('zoomed');
          });
        } else {
          $('.lightbox').fadeIn(function () {
            $('section.current').addClass('rightside zoom');
            $('#container').addClass('zoomed');
          });
        }
        disableStuffForZoom();
      }
    });

    $('#container.zoomed').live('click', function () {
      zoomOut();
    });

    function escapeKey() {
      if (isZoomed) {
        zoomOut();
      }
    }



    function zoomOut() {
      $('section').removeClass('zoom');
      $('#container.zoomed').removeClass('zoomed');
      enableStuffForZoom();
    }

    function disableStuffForZoom() {
      $('div.share, .pageTurnTargetLeft, .pageTurnTargetRight, .booknav,.chapterNav,.techIcons a').hide();
      rightKeyActive = false;
      leftKeyActive = false;
    }

    function enableStuffForZoom() {
      $('div.share, .pageTurnTargetLeft, .pageTurnTargetRight, .booknav,.chapterNav,.techIcons a').show();
      rightKeyActive = true;
      leftKeyActive = true;
      $('.lightbox').fadeOut();
    }




  ////////// THUMBNAIL PREVIEW ///////////

    var previewImg = null;
    var previewCaption = null;
    var previewImgTag = null;
    var previewLinkLocation = null;
    var previewLinkUrl = null;
    var previewDiffList = null;
    var previewDiffDiv = null;

    $('.chapter').bind('myhoverintent', function () {
      if (!(isMobileView)) {
        $('a.preview').hoverIntent(function () {
          previewLinkParent = $(this).parent().parent().attr('id'); // Container ID
          previewLinkParentLocation = $(this).parent().parent().position();
          previewLinkUrl = $(this).attr('href');
          previewLinkLocation = $(this).position(); // Current location
          previewListLocation = $('#' + previewLinkParent + ' li.li_last').position(); // Last list item
          previewDivLocation = $('#' + previewLinkParent + '_div').position(); // Bottom of page
          previewDiffList = (previewListLocation.top - previewLinkLocation.top);
          previewDiffDiv = (previewDivLocation.top - previewListLocation.top);
          previewLinkPosition = previewDiffList + previewDiffDiv;
          previewImg = '\/webappfieldguide\/img\/' + $(this).attr('data-url');
          previewImgTag = '<img src="' +  previewImg + '">';
          previewCaption = $(this).text();
          $('#' + previewLinkParent + ' .previewWindow').attr('href', previewLinkUrl);
          $('#' + previewLinkParent + ' .previewWindow .screenshot img').attr('src', previewImg);
          $('#' + previewLinkParent + ' .previewWindow .caption').text(previewCaption);

          if (previewLinkParentLocation.top < (previewDivLocation.top / 2)) {
            $('#' + previewLinkParent + ' .previewWindow').css({'left': previewLinkLocation.left + 0 + 'px', 'top': previewLinkLocation.top + 33 + 'px'}); // Top Lists
            $('#' + previewLinkParent + ' .previewWindow .arrow').css({'top': '-14px', 'background-position': '0px 0px'});
          } else {
            $('#' + previewLinkParent + ' .previewWindow').css({'left': previewLinkLocation.left + 0 + 'px', 'bottom': previewLinkPosition + 6 + 'px'}); // Bottom Lists
            $('#' + previewLinkParent + ' .previewWindow .arrow').css({'bottom': '-14px', 'background-position': '0px -14px'});
          }
          $('#' + previewLinkParent + ' .previewWindow').fadeIn('fast');
        }, function () {
          if ($('#' + previewLinkParent + ' .previewWindow').is(':hover') === true) {
            $('#' + previewLinkParent + ' .previewWindow').mouseleave(function () {
              $('#' + previewLinkParent + ' .previewWindow').fadeOut('fast');
            });
          } else {
            $('#' + previewLinkParent + ' .previewWindow').fadeOut('fast');
          }
        });
      }
    });




    ////////// LOAD CHAPTERS ///////////

    var loadWhichChapter = null;
    var loadWhichChapter2 = null;

    // chapter logic
    var url = location.href;
    var currentURLparts = url.split("/");
    var firstChapter = currentURLparts[4] || "toc";
    firstChapter = firstChapter.toLocaleLowerCase();
    if (firstChapter[0] === '#') {
      firstChapter = firstChapter.substring(1);
    }
    var firstPage = currentURLparts[5] || "";
    if (firstPage[0] === '#') {
      firstPage = firstPage.substring(1);
    }
    if (firstChapter == '' || firstChapter == 'index.html' || firstChapter == 'undefined' || (firstChapter == 'toc' && firstPage == 'index' || firstChapter == 'toc' && !(firstPage))) {

      firstChapter = "toc";
      var state = {};
      state.index = 0;
      state.chapter = firstChapter;
      state.page = 'index';
      state.relativePath = BASE_URL + 'toc/index/';
      state.direction = 'first_load';

      History.replaceState(state, "Table of Contents", state.relativePath);
      $('.booknav.home').addClass('current');
      $('.chapter.current').addClass('current');
      $('section.current').addClass('current');
    } else if (firstChapter == 'toc' || firstChapter == 'know-your-apps' || firstChapter == 'designing-web-applications' || firstChapter == 'case-studies' || firstChapter == 'building-great-web-applications' || firstChapter == 'about-appward') {
      // nothing
    } else if (firstChapter == 'search') {
      $('.booknav.search').addClass('current');
    } else {
      firstChapter = '404';
      $('#404').addClass('current');
      $('#404 section:first').addClass('current');
    }





    $.ajax({
      url: BASE_URL + firstChapter + '.html',
      success: function (data) {
        $('#' + firstChapter).html(data);
        loadChapter(firstChapter);
        showPageDecorations(firstChapter, firstPage);
        if (firstPage) {
          var firstPageExists = $('#' + firstChapter + ' #' + firstPage).length;
          if (firstPageExists === 1) {
            loadFirstSection();
          } else {
            throw404();
          }
        } else {
          loadFirstSection();
        }
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        if (XMLHttpRequest.status == 0) {
          //alert(' Check Your Network.');
        } else if (XMLHttpRequest.status == 404) {
          throw404();
        } else if (XMLHttpRequest.status == 500) {
          //TODO
          //alert('Internel Server Error.');
        }  else {
          //TODO
          //alert('Unknown Error.\n' + XMLHttpRequest.responseText);
        }
      }
    });

    // loads the first section requested by the url, then all the other sections once the first is loaded
    function loadFirstSection() {
      $('#' + firstChapter).show().addClass('current');

      if (!(isMobileView)) {

        if (firstPage) {
          $('#' + firstChapter + ' #' + firstPage).addClass('current').show().prevAll().hide();
        } else {
          $('#' + firstChapter + ' section:first').addClass('current');
        }
        updateTocNav();
        $('#background').delay(800).animate({opacity: '1'}, {duration: 300, easing: 'swing', complete: function () {
            $('#binding-container').animate({marginTop: '0'}, {duration: 450, easing: 'swing', complete: function () {
              //when default chapter loaded, load in all other chapters
              $('.chapter').not($('.chapter.current')).each(function () {
                  loadWhichChapter = $(this).attr('id');
                  $('#' + loadWhichChapter).load(BASE_URL + loadWhichChapter + '.html', function () {
                    loadWhichChapter2 = $(this).attr('id');
                    loadChapter(loadWhichChapter2);
                    sectionIndex = $('#' + firstChapter + ' section.current').index('section');
                  });
                });
              updateShareWidgets();


            }
          });
          }
        });
      } else {
        // if mobile view
        if (firstPage) {
          $('#' + firstChapter + ' #' + firstPage).addClass('current');
        } else {
          $('#' + firstChapter + ' section:first').addClass('current');
        }

        $('.chapter').not($('.chapter.current')).each(function () {
          loadWhichChapter = $(this).attr('id');
          $('#' + loadWhichChapter).load(BASE_URL + loadWhichChapter + '.html', function () {
            loadWhichChapter2 = $(this).attr('id');
            loadChapter(loadWhichChapter2);
            sectionIndex = $('#' + firstChapter + ' section.current').index('section');
          });
        });
        goMobile();
      }
    }


    // 404 page
    function throw404() {
      clearLocalDB();
      $.ajax({
        url: BASE_URL + '404.html',
        success: function (data) {
          $('#404').html(data);
          loadChapter('404');
          $('.pageTurnTargetRight,.pageTurnTargetLeft').hide();
          rightKeyActive = false;
          leftKeyActive = false;
          $('#404').show().addClass('current');
          $('#404 section:first').addClass('current');
          $('.share').hide();


          if (!(isMobileView)) {
            $('#background').delay(800).animate({opacity: '1'}, {duration: 300, easing: 'swing', complete: function () {
                $('#binding-container').animate({marginTop: '0'}, {duration: 450, easing: 'swing', complete: function () {
                    //when default chapter loaded, load in all other chapters
                    $('.chapter').not($('.chapter.current')).each(function () {
                          loadWhichChapter = $(this).attr('id');
                          $('#' + loadWhichChapter).load(BASE_URL + loadWhichChapter + '.html', function () {
                            loadWhichChapter2 = $(this).attr('id');
                            loadChapter(loadWhichChapter2);
                            //sectionIndex = $('#404 section:first').index('section');
                          });
                        });
                  }
                });
              }
              });
          } else {
          // if mobile view

            $('.chapter').not($('.chapter.current')).each(function () {
              loadWhichChapter = $(this).attr('id');
              $('#' + loadWhichChapter).load(BASE_URL + loadWhichChapter + '.html', function () {
                loadWhichChapter2 = $(this).attr('id');
                loadChapter(loadWhichChapter2);
                //sectionIndex = $('#404 section:first').index('section');
              });
            });
            goMobile();
          }


        } // end if is mobile view
      });


    }






    //////////// LOCAL BOOKMARKING & PERSISTANCE ////////////

    var appwardDB = new localStorageDB("appwardDB");

    var bookmarkURL = null;

    if (appwardDB.isNew()) {
      appwardDB.createTable("bookmark", ["url"]);
      appwardDB.insert("bookmark", {url: url});
      appwardDB.commit();
    } else {
      var bookmarkData = appwardDB.query("bookmark");
      if ((bookmarkData.length >= 1) && (bookmarkData[0].url)) {
        bookmarkURL = bookmarkData[0].url;
        bookmarkData = bookmarkData[0].url;

        var curURLLength = document.location.href.split("/").length;
        var bookmarkUrlParts = bookmarkURL.split("/");
        var bookmarkURLChapter = bookmarkUrlParts[4];
        var bookmarkURLPage = bookmarkUrlParts[5];

        if (curURLLength < 5) {
          if (url != bookmarkURL) {
            if (curURLLength == 4 && bookmarkURLChapter != 'toc') {
              $('.bookmark .savedspot').click(function () {
                if (bookmarkURLPage) {
                  bookmarkedSectionIndex = $('section#' + bookmarkURLPage).index('section');
                }
                if (bookmarkedSectionIndex) {
                  goToChapter(bookmarkURLChapter, 'next', bookmarkedSectionIndex);
                } else {
                  goToChapter(bookmarkURLChapter, 'next');
                }

                $('.bookmark').delay(500).animate({top: -600}, {duration: 200, easing: 'swing'});

              });
              $('.bookmark').animate({top: 0}, {duration: 200, easing: 'swing'});

              $('.bookmark .close').click(function () {
                  $('.bookmark').animate({top: -600}, {duration: 200, easing: 'swing'});
                });
            }
          }

        } else  {
          if (url != bookmarkURL) {
            updateLocalDB(url);
          }
        }
      }
    }



    function updateLocalDB(newUrl) {
      if (appwardDB) {
        appwardDB.truncate("bookmark");
        appwardDB.insert("bookmark", {url: newUrl});
        appwardDB.commit();
      }
    }

    function clearLocalDB() {
      if (appwardDB) {
        appwardDB.truncate("bookmark");
        appwardDB.commit();
      }
    }





    //////////// LOCAL BOOKMARKING & PERSISTANCE ////////////

    function updateShareWidgets() {
      setTimeout(function () {
        url = location.href;
        var title = $('.chapter.current').attr('data-title');
        var hash = '#Appward';

        //The plus one button doesn't handle dynamically updated titles yet.
        //$('meta[property="og:title"]').attr('content','Appward\'s Field Guide to Web Applications '+title);

        $('g-plusone,.fb-like').attr('data-href', url);
        $('.twitter-share-button').remove();
        $('<a class="twitter-share-button" data-text="' + title + ' ' + hash + '" href="http:\/\/twitter.com\/share" data-url="' + url + '">tweet<\/a>').insertAfter('.fb-like-btn');
        twttr.widgets.load();

        var dynLike = document.createElement('fb:like');
        dynLike.setAttribute('href', url);
        dynLike.setAttribute('send', 'false');
        dynLike.setAttribute('width', '130');
        dynLike.setAttribute('show_faces', 'false');
        dynLike.setAttribute('layout', 'button_count');
        $('.fb-like-btn').html(dynLike);
        FB.XFBML.parse();

        var gplustag = '<div id="plusone-div" class="g-plusone social-btn" data-size="medium"></div>';
        $('.gplus').html(gplustag);

        gapi.plusone.go();

      }, 1000);


    }


  }); // end doc ready



})();
