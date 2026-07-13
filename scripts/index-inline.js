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


