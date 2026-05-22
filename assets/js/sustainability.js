(function () {
<<<<<<< HEAD
<<<<<<< HEAD
  function initializeHeaderPastSubHero() {
    const header = document.querySelector(".main-header");
    const heroSection = document.querySelector(".sub-hero");
    if (!header || !heroSection) return;

    const CLASS_PAST = "is-past-kv";

    const isPastHeroMidpoint = () => {
      const rect = heroSection.getBoundingClientRect();
      const midY = rect.top + rect.height * 0.5;
      return midY <= 0;
    };

    const update = () => {
      header.classList.toggle(CLASS_PAST, isPastHeroMidpoint());
      if (typeof window.updateHeaderTopShift === "function") {
        window.updateHeaderTopShift();
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

=======
>>>>>>> parent of 9bbdb86 (sustainability 구현중)
=======
>>>>>>> parent of 9bbdb86 (sustainability 구현중)
  function initializeMobileMenu() {
    const header = document.querySelector(".main-header");
    const menuButton = document.querySelector(".header__menu-btn");
    const mobileMenu = document.querySelector(".header__mobile-menu");
    if (!header || !menuButton || !mobileMenu) return;

    const OPEN_CLASS = "is-menu-open";

    const closeMenu = () => {
      header.classList.remove(OPEN_CLASS);
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "메뉴 열기");
      mobileMenu.setAttribute("aria-hidden", "true");
    };

    menuButton.addEventListener("click", () => {
      const willOpen = !header.classList.contains(OPEN_CLASS);
      header.classList.toggle(OPEN_CLASS, willOpen);
      menuButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
      menuButton.setAttribute("aria-label", willOpen ? "메뉴 닫기" : "메뉴 열기");
      mobileMenu.setAttribute("aria-hidden", willOpen ? "false" : "true");
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 767) closeMenu();
    });
  }

  initializeMobileMenu();
})();
