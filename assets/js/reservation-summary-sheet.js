(function () {
  var TABLET_MAX_WIDTH = 1280;

  function isSheetMode() {
    return window.innerWidth <= TABLET_MAX_WIDTH;
  }

  function initializeSummarySheet() {
    var sheet = document.getElementById("reservation-summary-sheet");
    var handle = document.getElementById("reservation-summary-sheet-handle");
    var backdrop = document.getElementById("reservation-summary-sheet-backdrop");
    if (!sheet || !handle || !backdrop) return;

    function collapseSheet() {
      sheet.classList.remove("is-expanded");
      handle.setAttribute("aria-expanded", "false");
      handle.querySelector(".visually-hidden").textContent = "예약 요약 펼치기";
      backdrop.hidden = true;
      backdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-reservation-summary-sheet-open");
    }

    function expandSheet() {
      if (!isSheetMode()) return;

      sheet.classList.add("is-expanded");
      handle.setAttribute("aria-expanded", "true");
      handle.querySelector(".visually-hidden").textContent = "예약 요약 접기";
      backdrop.hidden = false;
      backdrop.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-reservation-summary-sheet-open");
    }

    handle.addEventListener("click", function () {
      if (!isSheetMode()) return;

      if (sheet.classList.contains("is-expanded")) {
        collapseSheet();
      } else {
        expandSheet();
      }
    });

    backdrop.addEventListener("click", collapseSheet);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && sheet.classList.contains("is-expanded")) {
        collapseSheet();
      }
    });

    window.addEventListener("resize", function () {
      if (!isSheetMode()) {
        collapseSheet();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initializeSummarySheet);
})();
