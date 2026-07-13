/* ==========================================================================
   index-inline.js — Scripts inline extraits de index.html.
   Ordre d'exécution préservé. Chargé après toutes les libs CDN (fin du body).

   Dépendances requises au moment de l'exécution :
     - jQuery ($)
     - Lenis  (from lenis-bundled)
     - GSAP + CustomEase
     - Flickity
   ========================================================================== */


/* --------------------------------------------------------------------------
   1. Inline text spans
   Déplace chaque .span-element dans le .span-wrapper de même index.
   -------------------------------------------------------------------------- */
$(".span-wrapper").each(function (index) {
  const relatedEl = $(".span-element").eq(index);
  relatedEl.appendTo($(this));
});


/* --------------------------------------------------------------------------
   2. Smooth scrolling (Lenis)
   Instance globale accessible via window.SmoothScroll.
   Écoute les triggers [data-scroll="stop|start|toggle"] et [data-scrolllink].
   -------------------------------------------------------------------------- */
class Scroll extends Lenis {
  constructor() {
    super({
      duration: 1.5,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      direction: "vertical",
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
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
    // Autorise le scroll natif sur les zones marquées overscroll
    const overscroll = [...document.querySelectorAll('[data-scroll="overscroll"]')];
    overscroll.forEach((item) =>
      item.setAttribute("onwheel", "event.stopPropagation()")
    );

    // Boutons stop / start
    document.querySelectorAll('[data-scroll="stop"]').forEach((item) => {
      item.onclick = () => {
        this.stop();
        this.isActive = false;
      };
    });

    document.querySelectorAll('[data-scroll="start"]').forEach((item) => {
      item.onclick = () => {
        this.start();
        this.isActive = true;
      };
    });

    // Bouton toggle
    document.querySelectorAll('[data-scroll="toggle"]').forEach((item) => {
      item.onclick = () => {
        if (this.isActive) {
          this.stop();
          this.isActive = false;
        } else {
          this.start();
          this.isActive = true;
        }
      };
    });

    // Anchor links : [data-scrolllink="X"] -> [data-scrolltarget="X"]
    document.querySelectorAll("[data-scrolllink]").forEach((item) => {
      const id = parseFloat(item.dataset.scrolllink);
      const target = document.querySelector(`[data-scrolltarget="${id}"]`);
      if (target) {
        item.onclick = () => this.scrollTo(target);
      }
    });
  }

  render() {
    this.raf((this.time += 10));
    window.requestAnimationFrame(this.render.bind(this));
  }

  // Désactive Lenis quand l'éditeur Webflow est ouvert
  handleEditorView() {
    const html = document.documentElement;
    const config = { attributes: true, childList: false, subtree: false };

    const callback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === "attributes") {
          const btn = document.querySelector(".w-editor-bem-EditSiteButton");
          const bar = document.querySelector(".w-editor-bem-EditorMainMenu");
          const addTrig = (target) =>
            target.addEventListener("click", () => this.destroy());

          if (btn) addTrig(btn);
          if (bar) addTrig(bar);
        }
      }
    };

    new MutationObserver(callback).observe(html, config);
  }
}

window.SmoothScroll = new Scroll();


/* --------------------------------------------------------------------------
   3. Numérotation CMS
   Assigne un numéro séquentiel à 3 chiffres à chaque [data-item-number].
   -------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const cmsItems = document.querySelectorAll("[data-item-number]");
  cmsItems.forEach((item, index) => {
    const num = (index + 1).toString().padStart(3, "0");
    item.setAttribute("data-item-number", num);
    item.innerHTML = num;
  });
});


/* --------------------------------------------------------------------------
   4. Preloader — animation GSAP du compteur 0 -> 100
   Après ~6s, clique sur .trigger pour déclencher la sortie du loader.
   -------------------------------------------------------------------------- */
{
  const customEase =
    "M0,0,C0,0,0.13,0.34,0.238,0.442,0.305,0.506,0.322,0.514,0.396,0.54,0.478,0.568,0.468,0.56,0.522,0.584,0.572,0.606,0.61,0.719,0.714,0.826,0.798,0.912,1,1,1,1";

  let counter = { value: 0 };
  let loaderDuration = 6;

  // Si l'utilisateur a déjà visité dans cet onglet, on part de 75%
  if (sessionStorage.getItem("visited") !== null) {
    loaderDuration = 6;
    counter = { value: 75 };
  }
  sessionStorage.setItem("visited", "true");

  function updateLoaderText() {
    const progress = Math.round(counter.value);
    $(".loader_number").text(progress);
  }

  function endLoaderAnimation() {
    $(".trigger").click();
  }

  const tl = gsap.timeline({ onComplete: endLoaderAnimation });
  tl.to(counter, {
    value: 100,
    onUpdate: updateLoaderText,
    duration: loaderDuration,
    ease: CustomEase.create("custom", customEase),
  });
  tl.to(
    ".loader_progress",
    {
      width: "100%",
      duration: loaderDuration,
      ease: CustomEase.create("custom", customEase),
    },
    0
  );
}


/* --------------------------------------------------------------------------
   5. Carrousel principal (Flickity + parallax custom)
   Slides : .tricks-slider_slide dans .tricks-slider.
   -------------------------------------------------------------------------- */
{
  const mainCarousel = ".tricks-slider";
  const mainSlides = ".tricks-slider_slide";
  const parallaxAmount = 49;
  const verticalAmount = 60;
  const rotationAmount = 6;

  const flkty = new Flickity(mainCarousel, {
    freeScroll: true,
    percentPosition: true,
    pageDots: false,
    cellSelector: mainSlides,
    cellAlign: "center",
    wrapAround: true,
    resize: true,
    selectedAttraction: 0.01,
    dragThreshold: 1,
    freeScrollFriction: 0.05,
  });

  flkty.on("scroll", function (progress) {
    setImagePositions();
    $(".progress_fill").css("width", `${progress * 100}%`);
  });

  function setImagePositions() {
    $(mainSlides).each(function () {
      const targetElement = $(this);

      // Progress left : distance depuis le bord droit du slide au bord gauche du carrousel
      const elementOffsetLeft =
        targetElement.offset().left +
        targetElement.width() -
        $(mainCarousel).offset().left;
      const progressLeft =
        elementOffsetLeft / ($(mainCarousel).width() + targetElement.width());

      // Progress center : position du centre du slide par rapport au centre du carrousel
      const elementOffsetCenter =
        targetElement.offset().left +
        targetElement.width() / 2 -
        $(mainCarousel).width() / 2;
      const parentWidth = $(mainCarousel).width() + targetElement.width();
      const progressCenter = elementOffsetCenter / parentWidth;

      // Décalage horizontal de l'image (clampé entre 0 et parallaxAmount)
      let imageMoveDistance = parallaxAmount * progressLeft;
      if (imageMoveDistance > parallaxAmount) imageMoveDistance = parallaxAmount;
      else if (imageMoveDistance < 0) imageMoveDistance = 0;

      targetElement
        .find(".image-8")
        .css("transform", `translateX(-${imageMoveDistance}%)`);

      targetElement
        .find(".tricks-slider_wrap")
        .css(
          "transform",
          `translateY(${verticalAmount * progressCenter}%) rotate(${
            rotationAmount * progressCenter
          }deg)`
        );
    });
  }

  setImagePositions();
}
