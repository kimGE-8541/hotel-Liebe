(function () {
  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatDisplayDate(date) {
    return date.getFullYear() + "." + pad2(date.getMonth() + 1) + "." + pad2(date.getDate());
  }

  function parseDateOnly(str) {
    var parts = str.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }

  function toDateKey(date) {
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate())
    );
  }

  function sameDay(a, b) {
    return toDateKey(a) === toDateKey(b);
  }

  function initializeDropdowns() {
    var wraps = document.querySelectorAll(".reservation-filter__dropdown-wrap");
    if (!wraps.length) return;

    var dropdowns = [];

    wraps.forEach(function (wrap) {
      var trigger = wrap.querySelector(".reservation-filter__control:not(.reservation-filter__control--date)");
      var menu = wrap.querySelector(".reservation-filter__menu");
      var valueEl = wrap.querySelector(".reservation-filter__value");
      if (!trigger || !menu || !valueEl) return;

      dropdowns.push({ wrap: wrap, trigger: trigger, menu: menu, valueEl: valueEl });

      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var isOpen = trigger.getAttribute("aria-expanded") === "true";
        closeAllDropdowns();
        if (typeof window.reservationCloseCalendar === "function") {
          window.reservationCloseCalendar();
        }
        if (!isOpen) {
          menu.removeAttribute("hidden");
          trigger.setAttribute("aria-expanded", "true");
        }
      });

      menu.querySelectorAll(".reservation-filter__menu-item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          valueEl.textContent = btn.textContent.trim();
          closeAllDropdowns();
        });
      });
    });

    function closeAllDropdowns() {
      dropdowns.forEach(function (d) {
        d.menu.setAttribute("hidden", "");
        d.trigger.setAttribute("aria-expanded", "false");
      });
    }

    window.reservationCloseDropdowns = closeAllDropdowns;
  }

  function initializeCalendar() {
    var trigger = document.getElementById("reservation-date-trigger");
    var calendar = document.getElementById("reservation-calendar");
    var valueEl = document.getElementById("reservation-date-value");
    var monthLabel = document.getElementById("reservation-calendar-month");
    var daysRoot = document.getElementById("reservation-calendar-days");
    var prevBtn = document.querySelector(".reservation-calendar__nav--prev");
    var nextBtn = document.querySelector(".reservation-calendar__nav--next");

    if (!trigger || !calendar || !valueEl || !monthLabel || !daysRoot) return;

    var rangeStart = parseDateOnly("2025-01-01");
    var rangeEnd = parseDateOnly("2025-12-31");
    var viewDate = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
    var pickingEnd = false;

    function updateValue() {
      valueEl.textContent =
        formatDisplayDate(rangeStart) + "~" + formatDisplayDate(rangeEnd);
    }

    function closeCalendar() {
      calendar.setAttribute("hidden", "");
      trigger.setAttribute("aria-expanded", "false");
    }

    function openCalendar() {
      if (typeof window.reservationCloseDropdowns === "function") {
        window.reservationCloseDropdowns();
      }
      calendar.removeAttribute("hidden");
      trigger.setAttribute("aria-expanded", "true");
      renderMonth();
    }

    function isInRange(date) {
      var t = date.getTime();
      return t >= rangeStart.getTime() && t <= rangeEnd.getTime();
    }

    function renderMonth() {
      var year = viewDate.getFullYear();
      var month = viewDate.getMonth();
      monthLabel.textContent = year + "년 " + (month + 1) + "월";

      var first = new Date(year, month, 1);
      var startOffset = first.getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var prevMonthDays = new Date(year, month, 0).getDate();

      daysRoot.innerHTML = "";

      for (var i = 0; i < startOffset; i++) {
        var d = prevMonthDays - startOffset + i + 1;
        daysRoot.appendChild(createDayBtn(new Date(year, month - 1, d), true));
      }

      for (var day = 1; day <= daysInMonth; day++) {
        daysRoot.appendChild(createDayBtn(new Date(year, month, day), false));
      }

      var totalCells = startOffset + daysInMonth;
      var remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
      for (var j = 1; j <= remainder; j++) {
        daysRoot.appendChild(createDayBtn(new Date(year, month + 1, j), true));
      }
    }

    function createDayBtn(date, outside) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reservation-calendar__day";
      btn.textContent = String(date.getDate());

      if (outside) btn.classList.add("is-outside");
      if (isInRange(date)) btn.classList.add("is-in-range");
      if (sameDay(date, rangeStart)) btn.classList.add("is-range-start");
      if (sameDay(date, rangeEnd)) btn.classList.add("is-range-end");

      btn.addEventListener("click", function () {
        if (!pickingEnd) {
          rangeStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          rangeEnd = new Date(rangeStart);
          pickingEnd = true;
        } else {
          rangeEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          if (rangeEnd.getTime() < rangeStart.getTime()) {
            var tmp = rangeStart;
            rangeStart = rangeEnd;
            rangeEnd = tmp;
          }
          pickingEnd = false;
          updateValue();
          closeCalendar();
        }
        renderMonth();
      });

      return btn;
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = trigger.getAttribute("aria-expanded") === "true";
      if (open) {
        closeCalendar();
      } else {
        pickingEnd = false;
        openCalendar();
      }
    });

    prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      viewDate.setMonth(viewDate.getMonth() - 1);
      renderMonth();
    });

    nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      viewDate.setMonth(viewDate.getMonth() + 1);
      renderMonth();
    });

    calendar.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    window.reservationCloseCalendar = closeCalendar;
    updateValue();
  }

  document.addEventListener("click", function () {
    if (typeof window.reservationCloseDropdowns === "function") {
      window.reservationCloseDropdowns();
    }
    if (typeof window.reservationCloseCalendar === "function") {
      window.reservationCloseCalendar();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (typeof window.reservationCloseDropdowns === "function") {
      window.reservationCloseDropdowns();
    }
    if (typeof window.reservationCloseCalendar === "function") {
      window.reservationCloseCalendar();
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    initializeDropdowns();
    initializeCalendar();
  });
})();
