/* Versión 2 — marca en el riel en qué sector del recorrido está la persona
   y hace girar el engranaje de fondo a medida que avanza. */
(function () {
  "use strict";

  var paradas = Array.prototype.slice.call(document.querySelectorAll("[data-parada]"));
  var enlaces = Array.prototype.slice.call(document.querySelectorAll(".paradas a"));
  var engranaje = document.querySelector(".engranaje");
  var quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pendiente = false;

  function actualizar() {
    pendiente = false;
    var referencia = window.innerHeight * 0.4;
    var actual = -1;
    paradas.forEach(function (seccion, i) {
      if (seccion.getBoundingClientRect().top <= referencia) actual = i;
    });

    enlaces.forEach(function (a) {
      var indice = paradas.findIndex(function (s) { return "#" + s.id === a.getAttribute("href"); });
      var li = a.parentElement;
      li.classList.toggle("is-pasada", indice > -1 && indice < actual);
      li.classList.toggle("is-actual", indice === actual);
      if (indice === actual) {
        a.setAttribute("aria-current", "step");
        if (li.parentElement.scrollWidth > li.parentElement.clientWidth) {
          li.parentElement.scrollLeft = li.offsetLeft - 16;
        }
      } else {
        a.removeAttribute("aria-current");
      }
    });

    if (engranaje && !quieto) {
      engranaje.style.setProperty("--giro", (window.scrollY / 12).toFixed(1) + "deg");
    }
  }

  window.addEventListener("scroll", function () {
    if (!pendiente) { pendiente = true; requestAnimationFrame(actualizar); }
  }, { passive: true });
  window.addEventListener("resize", actualizar);
  actualizar();
})();
