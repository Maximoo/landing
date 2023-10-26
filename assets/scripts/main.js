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

        var satellite = {
          $image: $("#satellite img"),
          tween: false,
          calc_progress: function(x, x1, x2, y1, y2){
            return y1 + (((100*(x - x1)/(x2 - x1))*(y2 - y1))/100);
          },
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
                aux = _this.calc_progress(p, 0, 0.1, 1, aux);
              } 
              if(p > 0.35 && p <= 0.42){
                aux = _this.calc_progress(p, 0.35, 0.42, aux, 1.2);
              }
              if(p > 0.42 && p <= 0.48){
                aux = _this.calc_progress(p, 0.42, 0.48, 1.2, aux);
              }
              if(p > 0.95){
                aux = _this.calc_progress(p, 0.95, 1, aux, 1);
              }
              _this.$image.css({'transform':'scale(' + aux + ')'});
            });
            this.tween.progress(progress);
          }
        },
        transitions = {
          reveal: function(e, type, delay) {
            var from = {autoAlpha: 0},
                to = {
                  duration: 1.25, 
                  autoAlpha: 1, 
                  ease: "expo",
                  overwrite: "auto",
                  delay: 0.25 * (parseInt(delay) + 1)
                },
                plus = type.substr(-1) === '+';
            if(plus){
              type = type.substr(0, type.length-1);
            }

            e.style.opacity = "0";
            switch(type){
              case 'top':
                from.x = 0;
                from.y = plus ? -100 : -20;
              break;
              case 'right':
                from.x = plus ? 100 : 20;
                from.y = 0;
              break;
              case 'bottom':
                from.x = 0;
                from.y = plus ? 100 : 20;
              break;
              case 'left':
                from.x = plus ? -100 : -20;
                from.y = 0;
              break;
            }

            if(typeof from.x !== 'undefined'){
              e.style.transform = "translate(" + from.x + "px, " + from.y + "px)";
              to.x = to.y = 0;
            }
            gsap.fromTo(e, from, to);
          },
          hide: function(e) {
            gsap.set(e, {autoAlpha: 0});
          },
          init: function(){
            var _this = this;
            this.ray_tl = gsap.timeline({
              scrollTrigger: {
                trigger: '.i-sections__assets--bg__area',
                scrub: true,
                start: $(window).width() >= 768 ? "bottom-=600px bottom" : "bottom-=300px bottom",
                end: "bottom bottom"
              },
              defaults: {ease: "none"}
            });
            this.ray_tl.fromTo('.i-sections__assets--bg__ray > div', { height: 0}, {height: '100%', duration: 3})
              .to('body',{ duration: 2 }) 
              .fromTo('.i-sections__assets--bg__area', { opacity: 1}, {opacity: 0, duration: 3})
              .fromTo('.i-sections__assets--bg__ray > div', { height: '100%'}, {height: 0, duration: 2});

            $("[data-parallax]").each(function(i, e){
              gsap.to(e, {
                yPercent: $(e).data('parallax'),
                ease: "none",
                scrollTrigger: {
                  trigger: e,
                  start: "top bottom",  
                  end: "bottom top",
                  scrub: true
                }, 
              });
            });

            $("[data-reveal]").each(function(i, e){
              var type = $(e).data('reveal'),
                  delay = $(e).data('reveal-delay') || '0:0';
              delay = $(window).width() >= 768 ? delay.split(':') : [0,0];
              _this.hide(e);
              ScrollTrigger.create({
                trigger: e,
                onEnter: function() { _this.reveal(e, type, delay[0]); }, 
                onLeave: function() { _this.hide(e); },
                onEnterBack: function() { _this.reveal(e, type, delay[1]); },
                onLeaveBack: function() { _this.hide(e); }
              });
            });
          }
        },
        sliders = {
          sliders: {
            $feat: $('.i-feat__inner'),
            $grenade: $('.i-section--grenade')
          },
          events: $({}),
          on: function(event, call){ this.events.on(event, call); },
          is_init: function(){
            for(var slider in this.sliders){
              if(!this.sliders[slider].hasClass('slick-initialized')){
                return false;
              }
            }
            return true;
          },
          init: function(){
            var _this = this,
                oninit = function(){
                  if(_this.is_init()){
                    _this.events.trigger('init');
                  }
                };

            for(var slider in this.sliders){
              this.sliders[slider].on('init',oninit);
            }

            this.sliders.$feat.slick({
              draggable: true,
              autoplay: false,
              autoplaySpeed: 3500,
              arrows: false,
              dots: true,
              fade: true,
              speed: 300,
              infinite: false,
              cssEase: 'ease-in-out'
            });

            this.sliders.$feat.on('beforeChange', function(event, slick, currentSlide, nextSlide){
              var $current = slick.$slides.eq(currentSlide).find('img, .i-feat__item__text'),
                  $next = slick.$slides.eq(nextSlide).find('img, .i-feat__item__text'),
                  direction = nextSlide - currentSlide >= 0 ? -1 : 1;

              $current.css({left:0}).stop(true,true).animate({left:200 * direction},300,'easeInOutSine');
              $next.css({left:-200 * direction}).stop(true,true).animate({left:0},300,'easeInOutSine');
            });

            ScrollTrigger.create({
              trigger: this.sliders.$feat.get(0),
              onEnter: function(){ 
                _this.sliders.$feat.slick('slickPlay');
              },
              onLeave: function(){ 
                _this.sliders.$feat.slick('slickPause');
              },
              onEnterBack: function(){ 
                _this.sliders.$feat.slick('slickPlay');
              },
              onLeaveBack: function(){ 
                _this.sliders.$feat.slick('slickPause');
              }
            });

            var slick_flag = false;
            this.sliders.$grenade.on('init breakpoint', function(event, slick){
              if ( ! slick_flag ) {
                slick_flag = true;
                slick.slickUnfilter();
                slick.slickFilter(slick.activeBreakpoint ? ':not(.slick-hide-mobile)' : ':not(.slick-hide-desktop)');
                slick_flag = false;
              }
            }).slick({
              draggable: true,
              autoplay: false,
              arrows: true,
              dots: false,
              speed: 300,
              infinite: false,
              rows: 0,
              cssEase: 'ease-in-out',
              responsive: [
                { 
                  breakpoint: 768,
                  settings: {
                    arrows: false,
                    dots: true
                  }
                }
              ]
            });
          }
        },
        app = {
          toggle_nav: function( value ){
            $('html').toggleClass('nav-open', value);
            $('.i-footer__menu__trigger').toggleClass('is-active', value);
          },
          goto: function(section, instant){
            var $section = $('[data-section="'+ section +'"]');
            if ($section.length){
              if(instant === true){
                $(window).scrollTop($section.offset().top - 50);
              } else {
                gsap.to(window, {duration: 0.6, scrollTo: $section.offset().top - 50});
              }
              this.toggle_nav(false);
              return true;
            }
            return false;
          },
          init_contact: function(){

            var $form = $('#contact_form');

            $form.submit(function (event) {
              event.preventDefault();
              if(!$form.hasClass('form-sending')){
                var values = {},
                    rules = {},
                    $fields = $form.find('[name]');

                $fields.each(function(i,e){
                  var $e = $(e),
                      name = $e.attr('name');
                  values[name] = $e.val();
                  rules[name] = {presence: { allowEmpty: !$e.is(':required'), message: $e.data( 'error-required') }};
                  switch($e.attr('type')){
                    case 'email':
                      rules[name].email = { message: $e.data( 'error-email') };
                    break;
                  }
                  $e.removeClass('is-invalid');
                  $e.siblings('.invalid-feedback').remove();
                });
                var errors = validate(values, rules, {format: "grouped"});

                if(errors){
                  for(var name in errors){
                    $form.find('[name="'+ name +'"]').addClass('is-invalid').parent().append($('<div class="invalid-feedback">'+ errors[name][0] +'</div>'));
                  }
                } else {
                  $form.addClass('form-sending');
                  $.ajax({
                    url: $form.attr('action'),
                    method: $form.attr('method'),
                    data: values,
                    dataType: "json"
                  }).done(function( data ) {
                    $('#contactMessage .modal-body').text(data.message);
                    $('#contactMessage').modal('show');
                    if(data.success){
                      $form.trigger("reset");
                      var on_success = $form.data('on-success');
                      if(on_success && typeof window[on_success] === 'function'){
                        window[on_success](values, data);
                      }
                    }
                  })
                  .always(function() {
                    $form.removeClass('form-sending');
                  });
                }
              }     
            });
          },
          init: function(){
            var _this = this;

            $('html, body').css({
              overflow: 'hidden',
              height: '100%'
            });

            $('.i-footer__menu__trigger').click(function(){
              _this.toggle_nav(!$('html').hasClass('nav-open'));
            });
            $(window).on('hashchange', function(){
              _this.goto( window.location.hash );
            });
            $('a[href^="#"]').click(function(){
              _this.goto( $(this).attr('href') );
            });

            this.init_contact();

            sliders.on('init', function(){
              setTimeout(function(){
                _this.finalize();
              },50);
            });

            $('.i-sections').imagesLoaded( { background: '.i-sections__assets--bg__first, .i-sections__assets--bg__last, .i-sections__assets__nube4' } )
              .always( function( instance ) {
                sliders.init();
              });
          },
          finalize: function(){
            transitions.init();
            satellite.init();
            var timeout = false;
            $(window).resize(function(){
              if(timeout){
                clearTimeout(timeout);
              }
              timeout = setTimeout(function(){
                satellite.init();  
              },100);
            });
            $('.i-loader').fadeOut('slow');
            $('html, body').css({
                overflow: 'auto',
                height: 'auto'
            });
            if(!this.goto( window.location.hash, true )){
              if($(window).scrollTop() == 0){
                $(window).scrollTop($(document).height());
              }
            }
          }
        };

        app.init();

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
