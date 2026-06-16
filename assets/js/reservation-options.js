(function () {
  function syncOptionItemToSummary(item) {
    var qtyEl = item.querySelector(".reservation-option-item__qty");
    var nameEl = item.querySelector(".reservation-option-item__name");
    if (!qtyEl || !nameEl) return;

    var qty = Number(qtyEl.textContent);
    var optionId = item.getAttribute("data-option-id") || nameEl.textContent.trim();
    var unitPrice = Number(item.getAttribute("data-unit-price"));

    if (!isFinite(qty) || qty <= 0) {
      removeOptionFromSummary(optionId);
      persistOptionsState();
      return;
    }

    upsertOptionInSummary({
      id: optionId,
      name: nameEl.textContent.trim(),
      qty: qty,
      unitPrice: unitPrice,
    });
    persistOptionsState();
  }

  function upsertOptionInSummary(option) {
    var options = window.reservationSummaryGetSelectedOptions();
    var index = options.findIndex(function (item) {
      return item.id === option.id;
    });

    if (index === -1) {
      options.push(option);
    } else {
      options[index] = option;
    }

    window.reservationSummarySetSelectedOptions(options);
  }

  function removeOptionFromSummary(optionId) {
    var options = window.reservationSummaryGetSelectedOptions().filter(function (item) {
      return item.id !== String(optionId);
    });
    window.reservationSummarySetSelectedOptions(options);
  }

  function persistOptionsState() {
    var state = window.reservationSummaryLoadState() || {};
    state.options = window.reservationSummaryGetSelectedOptions();
    window.reservationSummarySaveState(state);
  }

  function updateOptionItemQty(item, nextQty) {
    var qtyEl = item.querySelector(".reservation-option-item__qty");
    if (!qtyEl) return;

    qtyEl.textContent = String(Math.max(0, nextQty));
    syncOptionItemToSummary(item);
  }

  function restoreOptionItemsFromSummary() {
    window.reservationSummaryGetSelectedOptions().forEach(function (option) {
      var item = document.querySelector(
        '.reservation-option-item[data-option-id="' + option.id + '"]'
      );
      if (!item) return;

      var qtyEl = item.querySelector(".reservation-option-item__qty");
      if (qtyEl) qtyEl.textContent = String(option.qty);
    });
  }

  function initializeOptionItems() {
    var items = document.querySelectorAll(".reservation-option-item");
    if (!items.length) return;

    items.forEach(function (item) {
      var decreaseBtn = item.querySelector('[data-action="decrease"]');
      var increaseBtn = item.querySelector('[data-action="increase"]');

      if (decreaseBtn) {
        decreaseBtn.addEventListener("click", function () {
          var qtyEl = item.querySelector(".reservation-option-item__qty");
          var currentQty = qtyEl ? Number(qtyEl.textContent) : 0;
          updateOptionItemQty(item, currentQty - 1);
        });
      }

      if (increaseBtn) {
        increaseBtn.addEventListener("click", function () {
          var qtyEl = item.querySelector(".reservation-option-item__qty");
          var currentQty = qtyEl ? Number(qtyEl.textContent) : 0;
          updateOptionItemQty(item, currentQty + 1);
        });
      }
    });
  }

  function initializeRequestsPersistence() {
    var textarea = document.getElementById("reservation-requests-input");
    if (!textarea) return;

    var state = window.reservationSummaryLoadState();
    if (state && state.requests) {
      textarea.value = state.requests;
    }

    textarea.addEventListener("input", function () {
      var nextState = window.reservationSummaryLoadState() || {};
      nextState.requests = textarea.value;
      window.reservationSummarySaveState(nextState);
    });
  }

  function initializeSubmitButton() {
    var submitBtn = document.getElementById("reservation-summary-submit");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", function () {
      var state = window.reservationSummaryLoadState() || {};
      state.options = window.reservationSummaryGetSelectedOptions();

      var textarea = document.getElementById("reservation-requests-input");
      if (textarea) {
        state.requests = textarea.value.trim();
      }

      window.reservationSummarySaveState(state);
      window.location.href = "./reservation-info.html";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.reservationSummaryHasValidState === "function" && !window.reservationSummaryHasValidState()) {
      window.location.replace("./reservation.html");
      return;
    }

    if (typeof window.reservationSummaryInitialize === "function") {
      window.reservationSummaryInitialize();
    }
    restoreOptionItemsFromSummary();
    initializeOptionItems();
    initializeRequestsPersistence();
    initializeSubmitButton();
  });
})();
