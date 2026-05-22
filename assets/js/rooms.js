(function () {
    var roomSwipers = {};
    var isTabAnimating = false;
    var FADE_DURATION = 0.32;
    var FADE_EASE = "power1.inOut";
    var REVEAL_DURATION = 1.2;
    var REVEAL_STAGGER = 0.2;
    var REVEAL_EASE = "power2.out";
  
    function createRoomSwiper(selector) {
      var root = document.querySelector(selector);
      if (!root || typeof Swiper === "undefined") {
        return null;
      }
  
      var prevButton = root.querySelector(".rooms-intro__nav--prev");
      var nextButton = root.querySelector(".rooms-intro__nav--next");
  
      return new Swiper(root, {
        loop: true,
        slidesPerView: 1,
        speed: 650,
        grabCursor: true,
        navigation: {
          prevEl: prevButton,
          nextEl: nextButton,
        },
      });
    }
  
    function initializeRoomSwipers() {
      roomSwipers.standard = createRoomSwiper(".rooms-intro__swiper--standard");
      roomSwipers.deluxe = createRoomSwiper(".rooms-intro__swiper--deluxe");
      roomSwipers.suite = createRoomSwiper(".rooms-intro__swiper--suite");
    }
  
    function updateActiveSwiper(name) {
      if (roomSwipers[name]) {
        roomSwipers[name].update();
      }
    }
  
    function markRevealed(elements) {
      elements.forEach(function (el) {
        if (!el) {
          return;
        }
        el.classList.add("is-revealed");
        if (typeof gsap !== "undefined") {
          gsap.set(el, { opacity: 1, y: 0 });
        }
      });
    }
  
    function resetPanelRevealState(panel) {
      if (!panel) {
        return;
      }
  
      markRevealed(Array.prototype.slice.call(panel.querySelectorAll(".gsap-reveal")));
    }
  
    function syncPanelAccessibility(panels) {
      panels.forEach(function (panel) {
        panel.removeAttribute("hidden");
        panel.setAttribute(
          "aria-hidden",
          panel.classList.contains("is-active") ? "false" : "true"
        );
      });
    }
  
    function setTabState(tabs, panels, name) {
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-rooms-tab") === name;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
  
      panels.forEach(function (panel) {
        var isActive = panel.getAttribute("data-rooms-panel") === name;
        panel.classList.toggle("is-active", isActive);
        panel.classList.remove("is-fading-out", "is-fading-in");
        if (isActive) {
          resetPanelRevealState(panel);
        }
        if (typeof gsap !== "undefined") {
          gsap.set(panel, { clearProps: "opacity" });
        }
      });
  
      syncPanelAccessibility(panels);
    }
  
    function activateTabInstant(tabs, panels, name) {
      setTabState(tabs, panels, name);
      updateActiveSwiper(name);
    }
  
    function measurePanelHeight(panel, isVisible) {
      if (isVisible) {
        return panel.offsetHeight;
      }
  
      panel.classList.add("is-measuring");
      var height = panel.offsetHeight;
      panel.classList.remove("is-measuring");
      return height;
    }
  
    function lockPanelsHeight(panelsWrap, currentPanel, nextPanel) {
      var height = Math.max(
        measurePanelHeight(currentPanel, true),
        measurePanelHeight(nextPanel, false),
        panelsWrap.offsetHeight
      );
      panelsWrap.style.minHeight = height + "px";
      panelsWrap.classList.add("is-transitioning");
    }
  
    function unlockPanelsHeight(panelsWrap) {
      panelsWrap.style.minHeight = "";
      panelsWrap.classList.remove("is-transitioning");
    }
  
    function activateTabWithFade(tabs, panels, currentPanel, nextPanel, name) {
      isTabAnimating = true;
      var panelsWrap = currentPanel.closest(".rooms-intro__panels");
  
      resetPanelRevealState(currentPanel);
      resetPanelRevealState(nextPanel);
  
      if (panelsWrap) {
        lockPanelsHeight(panelsWrap, currentPanel, nextPanel);
      }
  
      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute("data-rooms-tab") === name;
        tab.classList.toggle("is-active", isActive);
        tab.setAttribute("aria-selected", isActive ? "true" : "false");
      });
  
      nextPanel.classList.add("is-fading-in");
      nextPanel.classList.remove("is-active");
      nextPanel.setAttribute("aria-hidden", "false");
  
      currentPanel.classList.add("is-fading-out");
      currentPanel.setAttribute("aria-hidden", "false");
  
      updateActiveSwiper(name);
  
      gsap.set(nextPanel, { opacity: 0 });
      gsap.set(currentPanel, { opacity: 1 });
  
      gsap
        .timeline({
          defaults: { ease: FADE_EASE },
          onComplete: function () {
            currentPanel.classList.remove("is-active", "is-fading-out");
            currentPanel.setAttribute("aria-hidden", "true");
            gsap.set(currentPanel, { clearProps: "opacity" });
  
            nextPanel.classList.remove("is-fading-in");
            nextPanel.classList.add("is-active");
            gsap.set(nextPanel, { clearProps: "opacity" });
  
            syncPanelAccessibility(panels);
            isTabAnimating = false;
  
            if (panelsWrap) {
              unlockPanelsHeight(panelsWrap);
            }
  
            if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
            }
          },
        })
        .to(currentPanel, { opacity: 0, duration: FADE_DURATION }, 0)
        .to(nextPanel, { opacity: 1, duration: FADE_DURATION }, 0);
    }
  
    function killRevealTriggers(elements) {
      if (typeof ScrollTrigger === "undefined") {
        return;
      }
  
      elements.forEach(function (el) {
        if (!el) {
          return;
        }
  
        ScrollTrigger.getAll().forEach(function (st) {
          var anim = st.animation;
          if (!anim) {
            return;
          }
  
          var targets = anim.targets();
          if (targets && targets.indexOf(el) !== -1) {
            st.kill();
            anim.kill();
          }
        });
      });
    }
  
    function initRoomsIntroSequence() {
      var section = document.querySelector(".rooms-intro");
      if (!section || typeof gsap === "undefined") {
        return;
      }
  
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
  
      var tabs = section.querySelector(".rooms-intro__tabs-wrap");
      var activePanel = section.querySelector(".rooms-intro__panel.is-active");
      if (!tabs || !activePanel) {
        return;
      }
  
      var media = activePanel.querySelector(".rooms-intro__media");
      var content = activePanel.querySelector(".rooms-intro__content");
      var sequenceEls = [tabs, media, content].filter(Boolean);
      var hiddenReveals = section.querySelectorAll(
        ".rooms-intro__panel:not(.is-active) .gsap-reveal"
      );
  
      killRevealTriggers(sequenceEls);
      killRevealTriggers(gsap.utils.toArray(hiddenReveals));
  
      gsap.set(sequenceEls.concat(gsap.utils.toArray(hiddenReveals)), {
        opacity: 0,
        y: 50,
      });
  
      gsap.to(sequenceEls, {
        opacity: 1,
        y: 0,
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
        stagger: REVEAL_STAGGER,
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          once: true,
          invalidateOnRefresh: true,
        },
        onComplete: function () {
          markRevealed(sequenceEls);
        },
      });
    }
  
    function initializeRoomsIntroTabs() {
      var section = document.querySelector(".rooms-intro");
      if (!section) {
        return;
      }
  
      var tabs = section.querySelectorAll(".rooms-intro__tab");
      var panels = section.querySelectorAll(".rooms-intro__panel");
      if (!tabs.length || !panels.length) {
        return;
      }
  
      function activateTab(name) {
        var currentPanel = section.querySelector(".rooms-intro__panel.is-active");
        var nextPanel = section.querySelector('[data-rooms-panel="' + name + '"]');
        if (!nextPanel || currentPanel === nextPanel) {
          return;
        }
  
        var useFade =
          typeof gsap !== "undefined" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
        if (!useFade) {
          activateTabInstant(tabs, panels, name);
          return;
        }
  
        activateTabWithFade(tabs, panels, currentPanel, nextPanel, name);
      }
  
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          if (tab.classList.contains("is-active") || isTabAnimating) {
            return;
          }
          activateTab(tab.getAttribute("data-rooms-tab"));
        });
      });
  
      syncPanelAccessibility(panels);
    }
  
    document.addEventListener("DOMContentLoaded", function () {
      initializeRoomSwipers();
      initializeRoomsIntroTabs();
      initRoomsIntroSequence();
    });
  
    window.addEventListener("load", function () {
      Object.keys(roomSwipers).forEach(function (key) {
        if (roomSwipers[key]) {
          roomSwipers[key].update();
        }
      });
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    });
  })();
  