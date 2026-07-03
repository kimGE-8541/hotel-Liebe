(function () {
  var mobileQuery = window.matchMedia("(max-width: 767px)");
  var swiperInstance = null;

  function unifyDiningVenueCardHeights() {
    var cards = document.querySelectorAll(".dining-venue__card");
    if (!cards.length || mobileQuery.matches) {
      cards.forEach(function (card) {
        card.style.height = "";
      });
      return;
    }

    cards.forEach(function (card) {
      card.style.height = "auto";
    });

    var maxHeight = 0;
    cards.forEach(function (card) {
      maxHeight = Math.max(maxHeight, card.getBoundingClientRect().height);
    });

    if (maxHeight > 0) {
      cards.forEach(function (card) {
        card.style.height = maxHeight + "px";
      });
    }
  }

  function enableStaticLayout(swiperEl) {
    if (!swiperEl) return;
    swiperEl.classList.add("dining-venues__swiper--static");
  }

  function disableStaticLayout(swiperEl) {
    if (!swiperEl) return;
    swiperEl.classList.remove("dining-venues__swiper--static");
  }

  function destroySwiper(swiperEl) {
    if (!swiperInstance) {
      enableStaticLayout(swiperEl);
      unifyDiningVenueCardHeights();
      return;
    }

    swiperInstance.destroy(true, true);
    swiperInstance = null;
    enableStaticLayout(swiperEl);
    unifyDiningVenueCardHeights();
  }

  function createSwiper(swiperEl, prevBtn, nextBtn) {
    disableStaticLayout(swiperEl);

    swiperInstance = new Swiper(swiperEl, {
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      loop: true,
      speed: 700,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      navigation: {
        prevEl: prevBtn,
        nextEl: nextBtn,
      },
    });

    unifyDiningVenueCardHeights();
  }

  function updateDiningVenueSwiper() {
    var swiperEl = document.querySelector(".dining-venues__swiper");
    var prevBtn = document.querySelector(".dining-venues__nav--prev");
    var nextBtn = document.querySelector(".dining-venues__nav--next");
    if (!swiperEl || typeof Swiper === "undefined") return;

    if (mobileQuery.matches) {
      destroySwiper(swiperEl);
      return;
    }

    if (swiperInstance) {
      unifyDiningVenueCardHeights();
      return;
    }

    createSwiper(swiperEl, prevBtn, nextBtn);
  }

  document.addEventListener("DOMContentLoaded", updateDiningVenueSwiper);

  window.addEventListener("resize", function () {
    window.requestAnimationFrame(updateDiningVenueSwiper);
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", updateDiningVenueSwiper);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(updateDiningVenueSwiper);
  }
})();
