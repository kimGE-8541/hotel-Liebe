/**
 * GSAP ScrollTrigger — 공통 reveal (.gsap-reveal)
 * 옵션: initGsapReveal({ root, once }) — once false 시 스크롤 역방향 시 역재생
 */
(function () {
  var STAGGER = 0.2;
  var DURATION = 1.2;
  var EASE = "power2.out";
  var START = "top 80%";

  function parseDelay(el) {
    var v = parseFloat(el.getAttribute("data-delay") || "0", 10);
    return isNaN(v) ? 0 : v;
  }

  function initGsapReveal(options) {
    options = options || {};
    var root = options.root || document;
    var once = options.once !== false;

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.utils.toArray(root.querySelectorAll(".gsap-reveal")).forEach(function (el) {
        gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
      });
      return;
    }

    var reveals = gsap.utils.toArray(root.querySelectorAll(".gsap-reveal"));
    if (!reveals.length) {
      return;
    }

    gsap.set(reveals, { opacity: 0, y: 50 });

    var processed = new Set();

    reveals.forEach(function (el) {
      if (processed.has(el)) return;

      var parent = el.parentElement;
      if (!parent) return;

      var siblings = gsap.utils
        .toArray(parent.children)
        .filter(function (child) {
          return child.classList && child.classList.contains("gsap-reveal");
        });

      if (siblings.length > 1) {
        var stConfig = {
          trigger: parent,
          start: START,
          invalidateOnRefresh: true,
        };
        if (once) {
          stConfig.once = true;
        } else {
          stConfig.toggleActions = "play none reverse reverse";
        }

        gsap.to(siblings, {
          opacity: 1,
          y: 0,
          duration: DURATION,
          ease: EASE,
          stagger: function (index, target) {
            return index * STAGGER + parseDelay(target);
          },
          scrollTrigger: stConfig,
        });

        siblings.forEach(function (s) {
          processed.add(s);
        });
      } else {
        var stSingle = {
          trigger: el,
          start: START,
          invalidateOnRefresh: true,
        };
        if (once) {
          stSingle.once = true;
        } else {
          stSingle.toggleActions = "play none reverse reverse";
        }

        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: DURATION,
          ease: EASE,
          delay: parseDelay(el),
          scrollTrigger: stSingle,
        });
        processed.add(el);
      }
    });

    ScrollTrigger.refresh();
  }

  window.initGsapReveal = initGsapReveal;

  document.addEventListener("DOMContentLoaded", function () {
    initGsapReveal({ once: true });
  });

  window.addEventListener("load", function () {
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
})();
