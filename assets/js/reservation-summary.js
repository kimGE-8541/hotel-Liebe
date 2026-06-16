(function () {
  var STORAGE_KEY = "hotelLiebeReservation";
  var WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
  var selectedOptions = [];
  var basePriceAmount = 0;

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatSummaryDate(dateStr) {
    var parts = String(dateStr || "").split("-");
    if (parts.length !== 3) return dateStr;

    var date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(date.getTime())) return dateStr;

    var year = String(date.getFullYear()).slice(-2);
    return year + "." + pad2(date.getMonth() + 1) + "." + pad2(date.getDate()) + " (" + WEEKDAYS[date.getDay()] + ")";
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function normalizeBasePrice(price) {
    return String(price || "").replace(/~\s*$/, "").trim();
  }

  function formatOptionPrice(amount) {
    var value = Number(amount);
    if (!isFinite(value) || value < 0) value = 0;
    return value.toLocaleString("en-US") + " KRW";
  }

  function parsePriceAmount(text) {
    var digits = String(text || "").replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  }

  function getOptionsTotalAmount() {
    return selectedOptions.reduce(function (sum, option) {
      return sum + option.unitPrice * option.qty;
    }, 0);
  }

  function updateAmounts() {
    var subtotal = basePriceAmount + getOptionsTotalAmount();
    var tax = Math.round(subtotal * 0.1);

    setText("reservation-summary-tax", formatOptionPrice(tax));
    setText("reservation-summary-grand-total", formatOptionPrice(subtotal));
  }

  function normalizeOption(option) {
    if (!option || typeof option !== "object") return null;

    var name = String(option.name || "").trim();
    var qty = Number(option.qty);
    var unitPrice = Number(option.unitPrice);

    if (!name || !isFinite(qty) || qty <= 0 || !isFinite(unitPrice) || unitPrice < 0) {
      return null;
    }

    return {
      id: option.id != null ? String(option.id) : name,
      name: name,
      qty: qty,
      unitPrice: unitPrice,
    };
  }

  function renderOptionsList() {
    var list = document.getElementById("reservation-summary-options-list");
    var totalEl = document.getElementById("reservation-summary-options-total");
    if (!list || !totalEl) return;

    list.innerHTML = "";

    var total = 0;

    selectedOptions.forEach(function (option) {
      var lineTotal = option.unitPrice * option.qty;
      total += lineTotal;

      var item = document.createElement("li");
      item.className = "reservation-summary__option-item";
      item.dataset.optionId = option.id;

      var main = document.createElement("div");
      main.className = "reservation-summary__option-main";

      var name = document.createElement("span");
      name.className = "reservation-summary__option-name txt-light-p20";
      name.textContent = option.name;

      var qty = document.createElement("span");
      qty.className = "reservation-summary__option-qty txt-light-p20";
      qty.textContent = "x " + String(option.qty);

      var price = document.createElement("span");
      price.className = "reservation-summary__option-price txt-light-p20";
      price.textContent = formatOptionPrice(lineTotal);

      main.appendChild(name);
      main.appendChild(qty);
      item.appendChild(main);
      item.appendChild(price);
      list.appendChild(item);
    });

    totalEl.textContent = formatOptionPrice(total);
    updateAmounts();
  }

  function setSelectedOptions(options) {
    selectedOptions = (options || [])
      .map(normalizeOption)
      .filter(function (option) {
        return option !== null;
      });
    renderOptionsList();
  }

  function loadReservationState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function saveReservationState(state) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* ignore storage errors */
    }
  }

  function initializeSummaryPanel() {
    var state = loadReservationState();
    if (!state) {
      basePriceAmount = parsePriceAmount(
        document.getElementById("reservation-summary-base-price")
          ? document.getElementById("reservation-summary-base-price").textContent
          : ""
      );
      renderOptionsList();
      return;
    }

    setText("reservation-summary-check-in", formatSummaryDate(state.checkIn));
    setText("reservation-summary-check-out", formatSummaryDate(state.checkOut));
    setText("reservation-summary-room-name", state.roomName || "");
    setText("reservation-summary-adults", state.adults != null ? String(state.adults) : "");
    setText("reservation-summary-children", state.children != null ? String(state.children) : "");
    setText("reservation-summary-rooms", state.rooms != null ? String(state.rooms) : "");
    setText("reservation-summary-base-price", normalizeBasePrice(state.basePrice));
    basePriceAmount = parsePriceAmount(state.basePrice);

    if (Array.isArray(state.options)) {
      setSelectedOptions(state.options);
    } else {
      renderOptionsList();
    }
  }

  function hasValidReservationState() {
    var state = loadReservationState();
    return !!(state && state.roomName);
  }

  window.reservationSummaryInitialize = initializeSummaryPanel;
  window.reservationSummaryLoadState = loadReservationState;
  window.reservationSummarySaveState = saveReservationState;
  window.reservationSummaryGetSelectedOptions = function () {
    return selectedOptions.slice();
  };
  window.reservationSummarySetSelectedOptions = setSelectedOptions;
  window.reservationSummaryHasValidState = hasValidReservationState;
})();
