/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 *
 * .noConflict()
 * The routing is enclosed within an anonymous function so that you can
 * always reference jQuery with $, even when in .noConflict() mode.
 * ======================================================================== */

(function($) {

  // Use this variable to set up the common and page specific functions. If you
  // rename this variable, you will also need to rename the namespace below.
  var INSURTECH = {
    // All pages
    'common': {
      init: function() {
        // JavaScript to be fired on all pages

        gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, ScrollToPlugin);

        function calc_progress(x, x1, x2, y1, y2){
          return y1 + (((100*(x - x1)/(x2 - x1))*(y2 - y1))/100);
        }

        var satellite = {
          $image: $("#satellite img"),
          init: function(){
            var _this = this, 
                progress = 0;
            if(this.tween){
              progress = this.tween.progress();
              this.tween.kill();
            }
            this.tween = gsap.to("#satellite", {
              scrollTrigger: {
                trigger: "#satellite-path",
                start: "top 30%",
                end: "bottom 90%",
                scrub: true,
                //markers: true,
              },
              duration: 40,
              ease: "none",
              immediateRender: true,
              motionPath: {
                path: "#satellite-path",
                align: "#satellite-path",
                alignOrigin: [0.5, 0.5],
                autoRotate: true,
              }
            });
            this.tween.eventCallback("onUpdate", function(){
              var p = this.progress(), aux = 0.7;
              if(p < 0.1){
                aux = calc_progress(p, 0, 0.1, 1, aux);
              } 
              if(p > 0.35 && p <= 0.42){
                aux = calc_progress(p, 0.35, 0.42, aux, 1.2);
              }
              if(p > 0.42 && p <= 0.48){
                aux = calc_progress(p, 0.42, 0.48, 1.2, aux);
              }
              if(p > 0.95){
                aux = calc_progress(p, 0.95, 1, aux, 1);
              }
              _this.$image.css({'transform':'scale(' + aux + ')'});
            });
            this.tween.progress(progress);
          }
        },
        transitions = {
          init: function(){
            
            this.ray_tl = gsap.timeline({
              scrollTrigger: {
                trigger: '.i-sections__assets--bg__area',
                scrub: true,
                start: "bottom-=600px bottom",
                end: "bottom bottom"
              },
              defaults: {ease: "none"}
            });
            this.ray_tl.fromTo('.i-sections__assets--bg__ray > div', { height: 0}, {height: '100%', duration: 3})
              .to('body',{ duration: 2 }) 
              .fromTo('.i-sections__assets--bg__area', { opacity: 1}, {opacity: 0, duration: 3})
              .fromTo('.i-sections__assets--bg__ray > div', { height: '100%'}, {height: 0, duration: 2});

          }
        },
        $sliders = $('.i-feat__inner, .i-section--gestion'),
        sliders_init_count = 0,
        loading_count = 0;

        $sliders.on('init', function(event, slick){
          if(++sliders_init_count >= $sliders.length){
            transitions.init();
            satellite.init();
            setTimeout(function(){
              if($(window).scrollTop() == 0){
                $(window).scrollTop($(document).height());
              }
              loading_complete();
            },50);
          }
        });

        $('.i-sections').imagesLoaded( { background: '.i-sections__assets--bg__first, .i-sections__assets--bg__last' } )
          .always( function( instance ) {
            loading_complete();
          })
          /*.progress( function( instance, image ) {
            var result = image.isLoaded ? 'loaded' : 'broken';
            console.log( 'image is ' + result + ' for ' + image.img.src );
          })*/;

        $('html, body').css({
            overflow: 'hidden',
            height: '100%'
        });
        function loading_complete(){
          if(++loading_count >= 2){
            $('.i-loader').fadeOut('slow');
            $('html, body').css({
                overflow: 'auto',
                height: 'auto'
            });
          }
        }

        $(window).resize(function(){
          satellite.init();
        });

        $('.i-feat__inner').slick({
          draggable: true,
          autoplay: false,
          arrows: false,
          dots: true,
          fade: true,
          speed: 300,
          infinite: true,
          cssEase: 'ease-in-out',
          touchThreshold: 100
        });

        $('.i-feat__inner').on('beforeChange', function(event, slick, currentSlide, nextSlide){
          var $current = slick.$slides.eq(currentSlide).find('img, .i-feat__item__text'),
              $next = slick.$slides.eq(nextSlide).find('img, .i-feat__item__text'),
              direction = nextSlide - currentSlide >= 0 ? -1 : 1;

          $current.css({left:0}).stop(true,true).animate({left:200 * direction},300,'easeInOutSine');
          $next.css({left:-200 * direction}).stop(true,true).animate({left:0},300,'easeInOutSine');
        });

        $('.i-section--gestion').slick({
          draggable: true,
          autoplay: false,
          arrows: true,
          dots: false,
          fade: true,
          speed: 300,
          infinite: false,
          cssEase: 'ease-in-out',
          touchThreshold: 100
        });

        /*gsap.utils.toArray("nav a").forEach(function(a) {
          a.addEventListener("click", function(e) {
            e.preventDefault();
            gsap.to(window, {duration: 1, scrollTo: e.target.getAttribute("href")});
          });
        });*/

      },
      finalize: function() {
      }
    },
    // Home page
    'home': {
      init: function() {
        // JavaScript to be fired on the home page
      },
      finalize: function() {
        // JavaScript to be fired on the home page, after the init JS
      }
    },
    // About us page, note the change from about-us to about_us.
    'about_us': {
      init: function() {
        // JavaScript to be fired on the about us page
      }
    }
  };

  // The routing fires all common scripts, followed by the page specific scripts.
  // Add additional events for more control over timing e.g. a finalize event
  var UTIL = {
    fire: function(func, funcname, args) {
      var fire;
      var namespace = INSURTECH;
      funcname = (funcname === undefined) ? 'init' : funcname;
      fire = func !== '';
      fire = fire && namespace[func];
      fire = fire && typeof namespace[func][funcname] === 'function';

      if (fire) {
        namespace[func][funcname](args);
      }
    },
    loadEvents: function() {
      // Fire common init JS
      UTIL.fire('common');

      // Fire page-specific init JS, and then finalize JS
      $.each(document.body.className.replace(/-/g, '_').split(/\s+/), function(i, classnm) {
        UTIL.fire(classnm);
        UTIL.fire(classnm, 'finalize');
      });

      // Fire common finalize JS
      UTIL.fire('common', 'finalize');
    }
  };

  // Load Events
  $(document).ready(UTIL.loadEvents);

})(jQuery); // Fully reference jQuery after this point.
