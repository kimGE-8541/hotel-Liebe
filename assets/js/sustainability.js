(function () {
  function initializeHeaderPastSubHero() {
    const header = document.querySelector(".main-header");
    const heroSection = document.querySelector(".sub-hero");
    if (!header || !heroSection) return;

    const CLASS_PAST = "is-past-kv";
    const MOBILE_MAX = 767;

    const update = () => {
      if (window.innerWidth <= MOBILE_MAX) {
        header.classList.remove(CLASS_PAST);
        header.removeAttribute("aria-hidden");
        return;
      }

      const past = heroSection.getBoundingClientRect().bottom <= 0;
      header.classList.toggle(CLASS_PAST, past);
      if (past) {
        header.setAttribute("aria-hidden", "true");
      } else {
        header.removeAttribute("aria-hidden");
      }
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

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

  initializeHeaderPastSubHero();
  initializeMobileMenu();
})();
