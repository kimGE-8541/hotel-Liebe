(function () {
  function guardReservationFlow() {
    if (typeof window.reservationSummaryHasValidState !== "function") return;
    if (!window.reservationSummaryHasValidState()) {
      window.location.replace("./reservation.html");
    }
  }

  function initializeRequestsPreview() {
    var el = document.getElementById("reservation-summary-requests");
    if (!el || typeof window.reservationSummaryLoadState !== "function") return;

    var state = window.reservationSummaryLoadState();
    el.textContent = state && state.requests ? state.requests : "";
  }

  function initializeOptionsCollapse() {
    var toggle = document.getElementById("reservation-summary-options-toggle");
    var panel = document.getElementById("reservation-summary-options-panel");
    var root = document.querySelector(".reservation-summary__options--collapsible");
    if (!toggle || !panel || !root) return;

    toggle.addEventListener("click", function () {
      var willExpand = root.classList.contains("is-collapsed");

      root.classList.toggle("is-collapsed", !willExpand);
      root.classList.toggle("is-expanded", willExpand);
      toggle.setAttribute("aria-expanded", willExpand ? "true" : "false");

      if (willExpand) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  var CONSENT_MODAL_CONTENT = {
    privacy: {
      title: "개인정보 수집항목 및 이용 동의",
      html:
        "<p>호텔 리에베(이하 \"호텔\")는 예약 및 투숙 서비스 제공을 위해 아래와 같이 개인정보를 수집·이용합니다.</p>" +
        "<ul>" +
        "<li>수집 항목: 성명(한글·영문), 이메일, 전화번호, 결제 정보(카드 소유자명, 카드번호, 유효기간)</li>" +
        "<li>수집 목적: 객실 예약 확인, 결제 처리, 고객 안내 및 본인 확인</li>" +
        "<li>보유 기간: 투숙 완료 후 5년 (관련 법령에 따라 달라질 수 있음)</li>" +
        "</ul>" +
        "<p>귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으나, 동의하지 않을 경우 예약 서비스 이용이 제한될 수 있습니다.</p>",
    },
    cancel: {
      title: "예약 변경 및 취소 규정",
      html:
        "<p>예약 변경 및 취소는 아래 규정에 따라 처리됩니다.</p>" +
        "<ul>" +
        "<li>체크인 24시간 전까지 무료 취소가 가능합니다.</li>" +
        "<li>체크인 24시간 이내 취소 시 1박 요금이 부과될 수 있습니다.</li>" +
        "<li>성수기 및 프로모션 상품은 별도의 취소·변경 규정이 적용됩니다.</li>" +
        "<li>노쇼(No-show) 발생 시 환불이 불가합니다.</li>" +
        "</ul>" +
        "<p>예약 변경은 호텔 운영 정책 및 객실 가용 현황에 따라 제한될 수 있으며, 변경 시 요금 차액이 발생할 수 있습니다.</p>",
    },
  };

  function initializeConsentModal() {
    var modal = document.getElementById("reservation-consent-modal");
    var titleEl = document.getElementById("reservation-consent-modal-title");
    var bodyEl = document.getElementById("reservation-consent-modal-body");
    if (!modal || !titleEl || !bodyEl) return;

    var lastFocused = null;

    function openModal(key) {
      var content = CONSENT_MODAL_CONTENT[key];
      if (!content) return;

      lastFocused = document.activeElement;
      titleEl.textContent = content.title;
      bodyEl.innerHTML = content.html;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-reservation-consent-modal-open");

      var closeBtn = modal.querySelector(".reservation-consent-modal__close");
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      bodyEl.innerHTML = "";
      document.body.classList.remove("is-reservation-consent-modal-open");

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    document.querySelectorAll("[data-consent-modal]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-consent-modal"));
      });
    });

    modal.querySelectorAll("[data-consent-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });
  }

  function initializeConsentCheckboxes() {
    var allCheckbox = document.getElementById("reservation-consent-all");
    var requiredCheckboxes = document.querySelectorAll(".reservation-info-consent__checkbox--required");
    if (!allCheckbox || !requiredCheckboxes.length) return;

    allCheckbox.addEventListener("change", function () {
      requiredCheckboxes.forEach(function (checkbox) {
        checkbox.checked = allCheckbox.checked;
      });
    });

    requiredCheckboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        var allChecked = Array.prototype.every.call(requiredCheckboxes, function (item) {
          return item.checked;
        });
        allCheckbox.checked = allChecked;
      });
    });
  }

  function initializeFormValidation() {
    var submitBtn = document.getElementById("reservation-summary-submit");
    var inputs = document.querySelectorAll(".reservation-info-field__input");
    var requiredCheckboxes = document.querySelectorAll(".reservation-info-consent__checkbox--required");
    if (!submitBtn || !inputs.length) return;

    var DEFAULT_ERROR_MESSAGE = "입력 필드를 입력해주세요.";
    var errorBubble = null;
    var activeErrorInput = null;

    function getErrorMessage(input) {
      return input.getAttribute("data-error-message") || DEFAULT_ERROR_MESSAGE;
    }

    function isEmpty(input) {
      return !input.value.trim();
    }

    function getOrCreateErrorBubble() {
      if (!errorBubble) {
        errorBubble = document.createElement("div");
        errorBubble.id = "reservation-info-field-error";
        errorBubble.className = "reservation-info-field__error-bubble txt-light-p20";
        errorBubble.setAttribute("role", "alert");
        errorBubble.hidden = true;
        document.body.appendChild(errorBubble);
      }
      return errorBubble;
    }

    function positionErrorBubble(input) {
      if (!errorBubble || !input) return;

      errorBubble.hidden = false;
      var rect = input.getBoundingClientRect();
      var gap = 10;
      var viewportPadding = 16;
      var bubbleWidth = errorBubble.offsetWidth;
      var bubbleHeight = errorBubble.offsetHeight;
      var left = Math.min(
        Math.max(viewportPadding, rect.left),
        window.innerWidth - bubbleWidth - viewportPadding
      );
      var topAbove = rect.top - bubbleHeight - gap;
      var showBelow = topAbove < viewportPadding;

      errorBubble.classList.toggle("is-below", showBelow);
      errorBubble.style.left = left + "px";
      errorBubble.style.top = (showBelow ? rect.bottom + gap : topAbove) + "px";
    }

    function hideErrorBubble() {
      if (errorBubble) {
        errorBubble.hidden = true;
        errorBubble.classList.remove("is-below");
      }
      activeErrorInput = null;
      window.removeEventListener("scroll", handleBubbleReposition, true);
      window.removeEventListener("resize", handleBubbleReposition);
    }

    function handleBubbleReposition() {
      if (activeErrorInput) {
        positionErrorBubble(activeErrorInput);
      }
    }

    function showErrorBubble(input) {
      var bubble = getOrCreateErrorBubble();
      bubble.textContent = getErrorMessage(input);
      activeErrorInput = input;
      positionErrorBubble(input);
      window.addEventListener("scroll", handleBubbleReposition, true);
      window.addEventListener("resize", handleBubbleReposition);
    }

    function clearValidation() {
      inputs.forEach(function (input) {
        input.classList.remove("is-invalid");
      });
      requiredCheckboxes.forEach(function (checkbox) {
        checkbox.classList.remove("is-invalid");
      });
      hideErrorBubble();
    }

    function getInvalidInputs() {
      var invalidInputs = [];
      inputs.forEach(function (input) {
        if (isEmpty(input)) {
          invalidInputs.push(input);
        }
      });
      return invalidInputs;
    }

    function getUncheckedConsent() {
      var unchecked = [];
      requiredCheckboxes.forEach(function (checkbox) {
        if (!checkbox.checked) {
          unchecked.push(checkbox);
        }
      });
      return unchecked;
    }

    function collectFormData() {
      return {
        nameKrLast: document.getElementById("reservation-info-name-kr-last").value.trim(),
        nameKrFirst: document.getElementById("reservation-info-name-kr-first").value.trim(),
        nameEnLast: document.getElementById("reservation-info-name-en-last").value.trim(),
        nameEnFirst: document.getElementById("reservation-info-name-en-first").value.trim(),
        email: document.getElementById("reservation-info-email").value.trim(),
        phone: document.getElementById("reservation-info-phone").value.trim(),
        cardholder: document.getElementById("reservation-info-cardholder").value.trim(),
        cardNumber1: document.getElementById("reservation-info-card-number-1").value.trim(),
        cardNumber2: document.getElementById("reservation-info-card-number-2").value.trim(),
        cardNumber3: document.getElementById("reservation-info-card-number-3").value.trim(),
        cardNumber4: document.getElementById("reservation-info-card-number-4").value.trim(),
        expiryMonth: document.getElementById("reservation-info-expiry-month").value.trim(),
        expiryYear: document.getElementById("reservation-info-expiry-year").value.trim(),
      };
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        if (!isEmpty(input)) {
          input.classList.remove("is-invalid");
          if (activeErrorInput === input) {
            hideErrorBubble();
          }
        }
      });
    });

    requiredCheckboxes.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          checkbox.classList.remove("is-invalid");
        }
      });
    });

    submitBtn.addEventListener("click", function () {
      clearValidation();

      var invalidInputs = getInvalidInputs();
      if (invalidInputs.length) {
        invalidInputs.forEach(function (input) {
          input.classList.add("is-invalid");
        });

        var firstInvalid = invalidInputs[0];
        showErrorBubble(firstInvalid);
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });

        window.setTimeout(function () {
          positionErrorBubble(firstInvalid);
          firstInvalid.focus({ preventScroll: true });
        }, 300);
        return;
      }

      var uncheckedConsent = getUncheckedConsent();
      if (uncheckedConsent.length) {
        uncheckedConsent.forEach(function (checkbox) {
          checkbox.classList.add("is-invalid");
        });

        var firstUnchecked = uncheckedConsent[0];
        firstUnchecked.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(function () {
          firstUnchecked.focus({ preventScroll: true });
        }, 300);
        return;
      }

      if (typeof window.openReservationConfirmModal === "function") {
        window.openReservationConfirmModal(collectFormData());
      }
    });
  }

  function initializeConfirmModal() {
    var modal = document.getElementById("reservation-confirm-modal");
    var confirmBtn = document.getElementById("reservation-confirm-modal-submit");
    if (!modal || !confirmBtn) return;

    var lastFocused = null;
    var pendingFormData = null;

    function openModal(formData) {
      pendingFormData = formData;
      lastFocused = document.activeElement;
      modal.removeAttribute("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-reservation-confirm-modal-open");
      confirmBtn.focus();
    }

    function closeModal() {
      modal.setAttribute("hidden", "");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-reservation-confirm-modal-open");
      pendingFormData = null;

      if (lastFocused && typeof lastFocused.focus === "function") {
        lastFocused.focus();
      }
    }

    function confirmReservation() {
      if (!pendingFormData || typeof window.reservationSummaryLoadState !== "function") return;

      var state = window.reservationSummaryLoadState() || {};
      state.customerInfo = pendingFormData;
      state.confirmed = true;

      if (typeof window.reservationSummarySaveState === "function") {
        window.reservationSummarySaveState(state);
      }

      window.location.href = "./reservation-complete.html";
    }

    window.openReservationConfirmModal = openModal;

    confirmBtn.addEventListener("click", confirmReservation);

    modal.querySelectorAll("[data-confirm-modal-close]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    guardReservationFlow();
    if (typeof window.reservationSummaryInitialize === "function") {
      window.reservationSummaryInitialize();
    }
    initializeRequestsPreview();
    initializeOptionsCollapse();
    initializeConsentModal();
    initializeConsentCheckboxes();
    initializeConfirmModal();
    initializeFormValidation();
  });
})();
