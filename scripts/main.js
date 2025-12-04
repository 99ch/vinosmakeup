'use strict';

(function alignSpanElements($) {
  if (!$) {
    return;
  }
  $('.span-wrapper').each(function (index) {
    var relatedEl = $('.span-element').eq(index);
    relatedEl.appendTo($(this));
  });
})(window.jQuery);

class Scroll extends Lenis {
  constructor() {
    super({
      duration: 1.5,
      easing: function (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      },
      direction: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5
    });

    this.time = 0;
    this.isActive = true;
    this.init();
  }

  init() {
    this.config();
    this.render();
    this.handleEditorView();
  }

  config() {
    var overscroll = document.querySelectorAll('[data-scroll="overscroll"]');
    if (overscroll.length > 0) {
      overscroll.forEach(function (item) {
        item.setAttribute('onwheel', 'event.stopPropagation()');
      });
    }

    var stop = document.querySelectorAll('[data-scroll="stop"]');
    if (stop.length > 0) {
      stop.forEach(
        function (item) {
          item.onclick = function () {
            this.stop();
            this.isActive = false;
          }.bind(this);
        }.bind(this)
      );
    }

    var start = document.querySelectorAll('[data-scroll="start"]');
    if (start.length > 0) {
      start.forEach(
        function (item) {
          item.onclick = function () {
            this.start();
            this.isActive = true;
          }.bind(this);
        }.bind(this)
      );
    }

    var toggle = document.querySelectorAll('[data-scroll="toggle"]');
    if (toggle.length > 0) {
      toggle.forEach(
        function (item) {
          item.onclick = function () {
            if (this.isActive) {
              this.stop();
              this.isActive = false;
            } else {
              this.start();
              this.isActive = true;
            }
          }.bind(this);
        }.bind(this)
      );
    }

    var anchor = document.querySelectorAll('[data-scrolllink]');
    if (anchor.length > 0) {
      anchor.forEach(
        function (item) {
          var id = parseFloat(item.dataset.scrolllink);
          var target = document.querySelector('[data-scrolltarget="' + id + '"]');
          if (target) {
            item.onclick = function () {
              this.scrollTo(target);
            }.bind(this);
          }
        }.bind(this)
      );
    }
  }

  render() {
    this.raf((this.time += 10));
    window.requestAnimationFrame(this.render.bind(this));
  }

  handleEditorView() {
    var html = document.documentElement;
    var config = { attributes: true, childList: false, subtree: false };

    var callback = function (mutationList) {
      mutationList.forEach(
        function (mutation) {
          if (mutation.type === 'attributes') {
            var btn = document.querySelector('.w-editor-bem-EditSiteButton');
            var bar = document.querySelector('.w-editor-bem-EditorMainMenu');
            var addTrig = function (target) {
              return target.addEventListener('click', function () {
                this.destroy();
              });
            }.bind(this);

            if (btn) addTrig(btn);
            if (bar) addTrig(bar);
          }
        }.bind(this)
      );
    }.bind(this);

    var observer = new MutationObserver(callback);
    observer.observe(html, config);
  }
}

window.SmoothScroll = new Scroll();

document.addEventListener('DOMContentLoaded', function () {
  var cmsItems = document.querySelectorAll('[data-item-number]');
  cmsItems.forEach(function (item, index) {
    var num = (index + 1).toString().padStart(3, '0');
    item.setAttribute('data-item-number', num);
    item.innerHTML = num;
  });
});

window.addEventListener('load', function () {
  var customEase =
    'M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1';
  var counter = { value: 0 };
  var loaderDuration = 6;

  if (sessionStorage.getItem('visited') !== null) {
    loaderDuration = 6;
    counter = { value: 75 };
  }
  sessionStorage.setItem('visited', 'true');

  var updateLoaderText = function () {
    var progress = Math.round(counter.value);
    window.jQuery('.loader_number').text(progress);
  };

  var endLoaderAnimation = function () {
    window.jQuery('.trigger').click();
  };

  var tl = gsap.timeline({
    onComplete: endLoaderAnimation
  });
  tl.to(counter, {
    value: 100,
    onUpdate: updateLoaderText,
    duration: loaderDuration,
    ease: CustomEase.create('custom', customEase)
  });
  tl.to(
    '.loader_progress',
    {
      width: '100%',
      duration: loaderDuration,
      ease: CustomEase.create('custom', customEase)
    },
    0
  );
});

window.addEventListener('load', function () {
  var mainCarousel = '.tricks-slider';
  var mainSlides = '.tricks-slider_slide';
  var parallaxAmount = 49;
  var verticalAmount = 60;
  var rotationAmount = 6;
  var flkty = new Flickity(mainCarousel, {
    freeScroll: true,
    percentPosition: true,
    pageDots: false,
    cellSelector: mainSlides,
    cellAlign: 'center',
    wrapAround: true,
    resize: true,
    selectedAttraction: 0.01,
    dragThreshold: 1,
    freeScrollFriction: 0.05
  });

  var setImagePositions = function () {
    window.jQuery(mainSlides).each(function () {
      var targetElement = window.jQuery(this);
      var elementOffsetLeft =
        targetElement.offset().left +
        targetElement.width() -
        window.jQuery(mainCarousel).offset().left;
      var progressLeft =
        elementOffsetLeft /
        (window.jQuery(mainCarousel).width() + targetElement.width());
      var elementOffsetCenter =
        targetElement.offset().left +
        targetElement.width() / 2 -
        window.jQuery(mainCarousel).width() / 2;
      var parentWidth =
        window.jQuery(mainCarousel).width() + targetElement.width();
      var progressCenter = elementOffsetCenter / parentWidth;
      var imageMoveDistance = parallaxAmount * progressLeft;
      if (imageMoveDistance > parallaxAmount) {
        imageMoveDistance = parallaxAmount;
      } else if (imageMoveDistance < 0) {
        imageMoveDistance = 0;
      }
      targetElement
        .find('.image-8')
        .css('transform', 'translateX(-' + imageMoveDistance + '%)');
      targetElement
        .find('.tricks-slider_wrap')
        .css(
          'transform',
          'translateY(' +
            verticalAmount * progressCenter +
            '%) rotate(' +
            rotationAmount * progressCenter +
            'deg)'
        );
    });
  };

  flkty.on('scroll', function (progress) {
    setImagePositions();
    window.jQuery('.progress_fill').css('width', progress * 100 + '%');
  });

  setImagePositions();
});
