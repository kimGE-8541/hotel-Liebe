(function () {
  var STAGGER = 0.2;
  var LINE_DURATION = 1.05;
  var CARD_DURATION = 0.95;
  var EASE = "power2.out";
  var START = "top 80%";

  function initializeValuesScroll() {
    var section = document.querySelector(".values");
    var line = document.querySelector(".values__line");
    var cards = section ? section.querySelectorAll(".values__item") : null;

    if (!section || !line || !cards || !cards.length) {
      return;
    }

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
        cards.forEach(function (el) {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      }
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(line, { scaleY: 1, clearProps: "transform" });
      gsap.set(cards, { opacity: 1, y: 0, clearProps: "transform,opacity" });
      return;
    }

    gsap.set(line, { scaleY: 0, transformOrigin: "top center" });
    gsap.set(cards, { opacity: 0, y: 36 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: START,
        once: true,
      },
    });

    tl.to(
      line,
      {
        scaleY: 1,
        duration: LINE_DURATION,
        ease: EASE,
      },
      0
    );

    tl.to(
      cards,
      {
        opacity: 1,
        y: 0,
        duration: CARD_DURATION,
        ease: EASE,
        stagger: STAGGER,
      },
      0.12
    );
  }

  function initializeStoreLocationControls() {
    var section = document.querySelector(".store-location");
    var map = document.querySelector(".store-location__map");
    var zoomIn = document.querySelector(".store-location__toolbar-btn--zoom-in");
    var zoomOut = document.querySelector(".store-location__toolbar-btn--zoom-out");
    var fullscreenBtn = document.querySelector(".store-location__toolbar-btn--fullscreen");
    if (!section || !map) {
      return;
    }

    var scale = 1;
    var minScale = 1;
    var maxScale = 2.5;
    var step = 0.12;

    function applyMapScale() {
      map.style.transformOrigin = "center center";
      map.style.transform = "scale(" + scale + ")";
    }

    if (zoomIn) {
      zoomIn.addEventListener("click", function () {
        scale = Math.min(maxScale, scale + step);
        applyMapScale();
      });
    }
    if (zoomOut) {
      zoomOut.addEventListener("click", function () {
        scale = Math.max(minScale, scale - step);
        applyMapScale();
      });
    }

    if (fullscreenBtn) {
      var icon = fullscreenBtn.querySelector(".material-symbols-outlined");
      fullscreenBtn.addEventListener("click", function () {
        var doc = document;
        if (!doc.fullscreenElement && typeof section.requestFullscreen === "function") {
          section
            .requestFullscreen()
            .then(function () {
              if (icon) {
                icon.textContent = "fullscreen_exit";
              }
              fullscreenBtn.setAttribute("aria-label", "전체 화면 종료");
            })
            .catch(function () {});
        } else if (doc.fullscreenElement === section && typeof doc.exitFullscreen === "function") {
          doc.exitFullscreen().catch(function () {});
        }
      });

      document.addEventListener("fullscreenchange", function () {
        if (document.fullscreenElement !== section && icon) {
          icon.textContent = "fullscreen";
          fullscreenBtn.setAttribute("aria-label", "전체 화면");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeValuesScroll();
    initializeStoreLocationControls();
  });

  window.addEventListener("load", function () {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });

  window.addEventListener("resize", function () {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
})();
