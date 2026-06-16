(function () {
  function guardReservationComplete() {
    if (typeof window.reservationSummaryLoadState !== "function") {
      window.location.replace("./reservation.html");
      return;
    }

    var state = window.reservationSummaryLoadState();
    if (!state || !state.roomName || !state.confirmed) {
      window.location.replace("./reservation.html");
    }
  }

  document.addEventListener("DOMContentLoaded", guardReservationComplete);
})();
