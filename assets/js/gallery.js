(function () {
  function closeDropdown(trigger, list) {
    list.setAttribute("hidden", "");
    trigger.setAttribute("aria-expanded", "false");
  }

  function openDropdown(trigger, list) {
    list.removeAttribute("hidden");
    trigger.setAttribute("aria-expanded", "true");
  }

  function applyFilter(category, tiles) {
    var cat = (category || "").trim();
    tiles.forEach(function (tile) {
      var tileCat = (tile.getAttribute("data-gallery-category") || "").trim();
      if (!cat) {
        tile.classList.remove("is-filtered-out");
        return;
      }
      if (tileCat === cat) {
        tile.classList.remove("is-filtered-out");
      } else {
        tile.classList.add("is-filtered-out");
      }
    });

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  }

  function initializeGalleryFilter() {
    var root = document.querySelector(".gallery__filter");
    var trigger = document.getElementById("gallery-filter-trigger");
    var list = document.getElementById("gallery-filter-list");
    var label = document.querySelector(".gallery__filter-label");
    var grid = document.getElementById("gallery-grid");
    if (!root || !trigger || !list || !label || !grid) {
      return;
    }

    var tiles = grid.querySelectorAll(".gallery__tile");

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = trigger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeDropdown(trigger, list);
      } else {
        openDropdown(trigger, list);
      }
    });

    list.querySelectorAll(".gallery__dropdown-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var value = btn.getAttribute("data-gallery-filter") || "";
        var text = btn.textContent.trim();
        label.textContent = text;
        applyFilter(value, tiles);
        closeDropdown(trigger, list);
      });
    });

    document.addEventListener("click", function (e) {
      if (!root.contains(e.target)) {
        closeDropdown(trigger, list);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") {
        return;
      }
      var modal = document.getElementById("gallery-modal");
      if (modal && !modal.hasAttribute("hidden")) {
        return;
      }
      if (trigger.getAttribute("aria-expanded") === "true") {
        closeDropdown(trigger, list);
      }
    });
  }

  function initializeGalleryModal() {
    var modal = document.getElementById("gallery-modal");
    var modalImage = document.getElementById("gallery-modal-image");
    var grid = document.getElementById("gallery-grid");
    if (!modal || !modalImage || !grid) {
      return;
    }

    var lastFocused = null;

    function openModal(tile) {
      var img = tile.querySelector("img");
      var file = tile.getAttribute("data-gallery-file") || "";
      if (!img) {
        return;
      }

      lastFocused = document.activeElement;
      modalImage.src = img.currentSrc || img.src;
      modalImage.alt = file;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-gallery-modal-open");

      var closeBtn = modal.querySelector(".gallery-modal__close");
      if (closeBtn) {
        closeBtn.focus();
      }
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      modalImage.src = "";
      modalImage.alt = "";
      document.body.classList.remove("is-gallery-modal-open");

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    grid.querySelectorAll(".gallery__tile-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tile = btn.closest(".gallery__tile");
        if (!tile || tile.classList.contains("is-filtered-out")) {
          return;
        }
        openModal(tile);
      });
    });

    modal.querySelectorAll("[data-gallery-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeGalleryFilter();
    initializeGalleryModal();
  });
})();
