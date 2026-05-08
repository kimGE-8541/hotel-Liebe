(function () {
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
