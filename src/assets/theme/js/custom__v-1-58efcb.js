/**
 * Custom Toynbee functions
 */

jQuery(document).ready(function($) {

    //$(document).foundation();

    //$('#modalOpen').click(function() {
    //  $('#shareModal').reveal();
    //});

    // Fix absolute paths for file:// protocol
    if (window.location.protocol === 'file:') {
        // Find the base path by looking for existing relative href that works
        // Most pages have links like "../../assets/" or "../assets/" - use that pattern
        var existingRelative = $('a[href*="../assets/"], link[href*="assets/"]').first().attr('href');
        var prefix = './';
        if (existingRelative) {
            var match = existingRelative.match(/^((?:\.\.\/)*)/);
            if (match && match[1]) {
                prefix = match[1];
            }
        } else {
            // Fallback: calculate from path - count directories after last 'explore-static' or 'Sites'
            var path = window.location.pathname;
            var parts = path.split('/').filter(function(p) { return p !== '' && p !== 'index.html'; });
            // Find the root marker
            var rootIdx = -1;
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i].indexOf('explore-static') !== -1) {
                    rootIdx = i;
                    break;
                }
            }
            if (rootIdx !== -1) {
                var depth = parts.length - rootIdx - 1;
                prefix = '';
                for (var j = 0; j < depth; j++) {
                    prefix += '../';
                }
                if (prefix === '') prefix = './';
            }
        }

        // Fix data-lazy attributes (used by slick carousel)
        $('[data-lazy^="/assets/"]').each(function() {
            $(this).attr('data-lazy', prefix + $(this).attr('data-lazy').substring(1));
        });

        // Fix src attributes
        $('img[src^="/assets/"]').each(function() {
            $(this).attr('src', prefix + $(this).attr('src').substring(1));
        });

        // Fix srcset attributes - only replace absolute paths (not already relative)
        $('img[srcset]').each(function() {
            var srcset = $(this).attr('srcset');
            if (srcset) {
                // Split by comma, fix each URL, rejoin
                var parts = srcset.split(',');
                var fixed = parts.map(function(part) {
                    part = part.trim();
                    // Only fix if starts with /assets/ (absolute path)
                    if (part.indexOf('/assets/') === 0) {
                        return prefix + part.substring(1);
                    }
                    return part;
                });
                $(this).attr('srcset', fixed.join(', '));
            }
        });

        // Fix any link hrefs that use absolute paths
        $('a[href^="/assets/"]').each(function() {
            $(this).attr('href', prefix + $(this).attr('href').substring(1));
        });
    }

    // Inline SVG data URIs for carousel arrows (works with file:// protocol)
    var svgChevronLeftWhite = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.84 84.86"><defs><style>.cls-1{fill:#fff;}</style></defs><polygon class="cls-1" points="0 42.43 42.43 0 43.84 1.42 2.83 42.43 43.84 83.44 42.43 84.86 1.42 43.84 0 42.43"/></svg>');
    var svgChevronRightWhite = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.84 84.86"><defs><style>.cls-1{fill:#fff;}</style></defs><polygon class="cls-1" points="43.84 42.43 1.41 84.86 0 83.44 41.01 42.43 0 1.42 1.41 0 42.42 41.02 43.84 42.43"/></svg>');
    var svgChevronLeftBlue = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.84 84.86"><defs><style>.cls-1{fill:#175984;}</style></defs><polygon class="cls-1" points="0 42.43 42.43 0 43.84 1.42 2.83 42.43 43.84 83.44 42.43 84.86 1.42 43.84 0 42.43"/></svg>');
    var svgChevronRightBlue = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 43.84 84.86"><defs><style>.cls-1{fill:#175984;}</style></defs><polygon class="cls-1" points="43.84 42.43 1.41 84.86 0 83.44 41.01 42.43 0 1.42 1.41 0 42.42 41.02 43.84 42.43"/></svg>');
    var svgTickSml = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34"><defs><style>.cls-1{fill:#fff;}.cls-2{fill:#175984;}</style></defs><circle class="cls-1" cx="17" cy="17" r="17"/><polygon class="cls-2" points="25.91 12.38 13.89 24.4 12.48 22.99 12.47 22.99 8.23 18.74 9.64 17.33 13.89 21.58 24.5 10.97 25.91 12.38"/></svg>');

    var menu = $("#menuBar");
    var mast = $("#masthead");
    
    // Sticky header bar
    if ($(window).width() < 640 && $(window).width() > 520  ) {
        $(window).scroll(function() {    
        var scroll = $(window).scrollTop();
           if (scroll > 100 ) {
              menu.addClass("fixed tab");
              mast.addClass("height");
            } else {
              menu.removeClass("fixed tab");
              mast.removeClass("height");
            }
        });
        $(".audio-player").removeClass('absolute');
    };
    if ($(window).width() < 520 ) {
        $(window).scroll(function() {    
        var scroll = $(window).scrollTop();
           if (scroll > 80 ) {
              menu.addClass("fixed mob");
              mast.addClass("height");
            } else {
              menu.removeClass("fixed mob");
              mast.removeClass("height");
            }
        });
        $(".audio-player").removeClass('absolute');
    };

    
    
    //Slick carousel
    $('.slick').slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        prevArrow: '<button class="orbit-previous" type="button"><span class="show-for-sr">Previous Slide</span><img src="' + svgChevronLeftWhite + '"/></button>',
        nextArrow: '<button class="orbit-next" type="button"><span class="show-for-sr">Next Slide</span><img src="' + svgChevronRightWhite + '"/></button>',
        appendArrows: '.stories-carousel',
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
                prevArrow: '<button class="orbit-previous" type="button"><img src="' + svgChevronLeftBlue + '"/></button>',
                nextArrow: '<button class="orbit-next" type="button"><img src="' + svgChevronRightBlue + '"/></button>',
              }
            }
          ]
    });
    
    $('.collection_gallery').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: '<button class="orbit-previous" type="button"><span class="show-for-sr">Previous Slide</span><img src="' + svgChevronLeftWhite + '"/></button>',
        nextArrow: '<button class="orbit-next" type="button"><span class="show-for-sr">Next Slide</span><img src="' + svgChevronRightWhite + '"/></button>',
        asNavFor: '.collection_thumbs'
    });
    
    var $status = $('.paging');

    $('.collection_thumbs').on('init reInit afterChange', function (event, slick, currentSlide, nextSlide) {
        var i = (currentSlide ? currentSlide : 0) + 1;
        $status.text(i + ' of ' + slick.slideCount);
    });
    
    $('.collection_thumbs').slick({
        slidesToShow: 10,
        slidesToScroll: 1,
        prevArrow: '<button class="orbit-previous" type="button"><span class="show-for-sr">Previous Slide</span><img src="' + svgChevronLeftWhite + '"/></button>',
        nextArrow: '<button class="orbit-next" type="button"><span class="show-for-sr">Next Slide</span><img src="' + svgChevronRightWhite + '"/></button>',
        //appendArrows: '.stories-carousel',
        asNavFor: '.collection_gallery',
        focusOnSelect: true,
        responsive: [
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 6,
                slidesToScroll: 1,
                arrows: false,
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 3,
                slidesToScroll: 1,
                arrows: false,
              }
            }
          ]
    });

    $('.slick .slick-track').attr('data-equalizer','');
    $('.slick .slick-slide').attr('data-equalizer-watch','');
    
    // Lightgallery lightbox
    $('#storiesCont').lightGallery({
        selector: '.stories-img a',
        download: false,
        hash: false,
        thumbnail: false,
        autoplay: false,
        pager: false,
        share: false,
    });
    
    // LightGallery for collection images
    // Wait briefly for slick to fully initialize, then collect images
    setTimeout(function() {
        if ($('.collection_gallery').length && $('.collection_gallery').hasClass('slick-initialized')) {
            var $gallery = $('.collection_gallery');
            var collectionImages = [];

            // Collect image sources from non-cloned slides only
            $gallery.find('.slick-slide:not(.slick-cloned) .collection-img-wrap a').each(function() {
                var href = $(this).attr('href');
                if (href) {
                    collectionImages.push({ src: href });
                }
            });

            // Click handler for collection images
            $gallery.on('click', '.collection-img-wrap a', function(e) {
                e.preventDefault();
                if (collectionImages.length === 0) return;

                var clickedHref = $(this).attr('href');
                var startIndex = 0;
                for (var i = 0; i < collectionImages.length; i++) {
                    if (collectionImages[i].src === clickedHref) {
                        startIndex = i;
                        break;
                    }
                }

                // Destroy any existing lightGallery instance first
                var lgData = $('body').data('lightGallery');
                if (lgData) {
                    lgData.destroy(true);
                }

                // Use body as trigger for dynamic lightGallery
                $('body').lightGallery({
                    dynamic: true,
                    dynamicEl: collectionImages,
                    index: startIndex,
                    download: false,
                    hash: false,
                    thumbnail: false,
                    autoplay: false,
                    pager: false,
                    share: false,
                    closable: true
                });
            });
        }
    }, 100);
    
    $('.timeline .content-wrap').lightGallery({
        selector: '.event-image a',
        download: false,
        hash: false,
        thumbnail: false,
        autoplay: false,
        pager: false,
        share: false,
    });
    
    
    
    // Close thumbnails
    $(".paging-wrap p").click(function() {
      $(".collection_thumbs").toggle();
      $('.paging-wrap').toggleClass('minimise');
      $(this).toggleClass('rotate');
      $(this).text($(this).text() == 'Show thumbnails' ? 'Hide thumbnails' : 'Show thumbnails');
    });
    
    //Transcription accordion
    $(".transcription h3").click(function() {
      $(".transcription-text, .transcription-intro").slideToggle();
      $(this).toggleClass('rotate');
    });
    
    //Hamburger close image
    $(".menu-toggle").click(function() {
        $('img', this).toggle();
    });
    
    //Comment icon
    $(".comment-wrap textarea").click(function() {
      $("i.fa-pencil-alt").hide();
    });
    
    // Header search bar
    $("#navSearch").click(function() {
      $("#hideSearch").toggle();
      $(this).toggleClass('fa-search close');
    });
    
    // Accessibility menu show/hide
    $(".access").click(function() {
      $("#accessMenu").toggle();
      $(this).toggleClass('open');
    });
    
    // Homepage comment form
    $('.button.form-open').click(function() {
      $("#homeComments").slideToggle();
      $(this).text($(this).text() == 'Close' ? 'Leave a comment' : 'Close');
    });
    $('.comment-container .acf-field-textarea').prepend('<i class="fas fa-pencil-alt"></i>');
    $(".comment-container .acf-field-textarea").click(function() {
      $("i.fa-pencil-alt").hide();
    });
    $('.acf-form-submit').append('<img class="comment-sub" src="' + svgTickSml + '">');
    $(".acf-form-submit").click(function() {
      $(".comment-sub").hide();
    });
    if (window.location.href.indexOf("?updated=true#difference") > -1) {
        $("#homeComments").show();
        $('.button.form-open').text('Close');
    }
});