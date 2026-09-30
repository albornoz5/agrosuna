/* Comportamiento compartido por las tres versiones: enlaces de contacto,
   estado abierto/cerrado, catálogo con filtros, pedido por WhatsApp y
   formulario de presupuesto. No depende de ningún servicio pago. */
(function () {
  "use strict";

  var datos = window.AGROSUNA;
  var negocio = datos.negocio;
  var $ = function (sel, raiz) { return (raiz || document).querySelector(sel); };
  var $$ = function (sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); };

  function enlaceWhatsApp(texto) {
    return "https://wa.me/" + negocio.whatsapp + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }

  function pesos(n) {
    return "$ " + Math.round(n).toLocaleString("es-AR");
  }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function normalizar(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  /* ---------- Enlaces de contacto ---------- */

  $$("[data-wa]").forEach(function (a) {
    a.href = enlaceWhatsApp(a.getAttribute("data-wa") || "Hola Agrosuna, quiero hacer una consulta.");
    a.target = "_blank";
    a.rel = "noopener";
  });
  $$("[data-tel]").forEach(function (a) { a.href = "tel:" + negocio.telefono; });
  $$("[data-correo]").forEach(function (a) { a.href = "mailto:" + negocio.correo; });
  $$("[data-instagram]").forEach(function (a) { a.href = negocio.instagram; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-mapa]").forEach(function (a) { a.href = negocio.mapa; a.target = "_blank"; a.rel = "noopener"; });

  /* ---------- Abierto / cerrado (hora de Argentina) ---------- */

  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

  function ahoraEnArgentina() {
    var partes = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Argentina/Buenos_Aires",
      weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return {
      dia: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(v.weekday),
      minutos: (parseInt(v.hour, 10) % 24) * 60 + parseInt(v.minute, 10)
    };
  }

  function aMinutos(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function horaCorta(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) + (p[1] === "00" ? "" : ":" + p[1]);
  }

  function estadoDelLocal() {
    var ahora = ahoraEnArgentina();
    var hoy = negocio.horarios[ahora.dia] || [];
    for (var i = 0; i < hoy.length; i++) {
      if (ahora.minutos >= aMinutos(hoy[i][0]) && ahora.minutos < aMinutos(hoy[i][1])) {
        return { abierto: true, texto: "Abierto ahora, hasta las " + horaCorta(hoy[i][1]) };
      }
      if (ahora.minutos < aMinutos(hoy[i][0])) {
        return { abierto: false, texto: "Cerrado. Abrimos hoy a las " + horaCorta(hoy[i][0]) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var dia = (ahora.dia + d) % 7;
      var tramos = negocio.horarios[dia];
      if (tramos && tramos.length) {
        return {
          abierto: false,
          texto: "Cerrado. Abrimos " + (d === 1 ? "mañana" : "el " + DIAS[dia]) + " a las " + horaCorta(tramos[0][0])
        };
      }
    }
    return { abierto: false, texto: "Cerrado" };
  }

  function pintarEstado() {
    var e = estadoDelLocal();
    $$("[data-estado]").forEach(function (el) {
      el.textContent = e.texto;
      el.setAttribute("data-abierto", e.abierto ? "si" : "no");
    });
  }
  pintarEstado();
  setInterval(pintarEstado, 60000);

  /* ---------- Catálogo ---------- */

  var filtro = { categoria: "Todos", marca: "", busqueda: "" };
  var lista = $("[data-productos]");
  var vacio = $("[data-vacio]");
  var cajaFiltros = $("[data-filtros]");
  var cajaMarcas = $("[data-marcas]");
  var contador = $("[data-resultados]");
  var verMas = $("[data-ver-mas]");
  // data-por-pagina en la lista limita cuántos repuestos se ven de entrada.
  var porPagina = lista ? parseInt(lista.getAttribute("data-por-pagina"), 10) || 0 : 0;
  var mostrados = porPagina;

  if (datos.catalogoDeMuestra) {
    $$("[data-aviso-muestra]").forEach(function (el) { el.hidden = false; });
  }

  function categorias() {
    var vistas = ["Todos"];
    datos.productos.forEach(function (p) {
      if (vistas.indexOf(p.categoria) === -1) vistas.push(p.categoria);
    });
    return vistas;
  }

  function pintarFiltros() {
    if (!cajaFiltros) return;
    cajaFiltros.innerHTML = categorias().map(function (c) {
      return '<button type="button" class="filtro" data-categoria="' + escapar(c) + '" aria-pressed="' +
        (filtro.categoria === c) + '">' + escapar(c) + "</button>";
    }).join("");
  }

  function pintarMarcas() {
    if (!cajaMarcas) return;
    cajaMarcas.innerHTML = datos.marcas.map(function (m) {
      return '<li><button type="button" class="marca" data-marca="' + escapar(m) + '" aria-pressed="' +
        (filtro.marca === m) + '">' + escapar(m) + "</button></li>";
    }).join("");
  }

  function coincide(p) {
    if (filtro.categoria !== "Todos" && p.categoria !== filtro.categoria) return false;
    var texto = normalizar([p.nombre, p.detalle, p.marca, p.categoria, p.tipo].join(" "));
    if (filtro.marca && texto.indexOf(normalizar(filtro.marca)) === -1) return false;
    if (filtro.busqueda) {
      var palabras = normalizar(filtro.busqueda).split(/\s+/).filter(Boolean);
      for (var i = 0; i < palabras.length; i++) {
        if (texto.indexOf(palabras[i]) === -1) return false;
      }
    }
    return true;
  }

  function pintarProductos() {
    if (!lista) return;
    var visibles = datos.productos.filter(coincide);
    var enPantalla = porPagina ? visibles.slice(0, mostrados) : visibles;
    if (verMas) verMas.hidden = enPantalla.length >= visibles.length;
    lista.innerHTML = enPantalla.map(function (p) {
      return '<li class="prod" data-tipo="' + escapar(normalizar(p.tipo).replace(/\s+/g, "-")) + '">' +
        (p.imagen ? '<img class="prod__foto" src="' + datos.fotos + escapar(p.imagen) + '-c.webp" alt="" width="640" height="640" loading="lazy">' : "") +
        '<div class="prod__cuerpo">' +
          '<span class="prod__tipo">' + escapar(p.tipo) + "</span>" +
          '<h3 class="prod__nombre">' + escapar(p.nombre) + "</h3>" +
          '<p class="prod__detalle">' + escapar(p.detalle) + "</p>" +
        "</div>" +
        '<div class="prod__compra">' +
          '<span class="prod__precio' + (p.precio == null ? " prod__precio--consultar" : "") + '">' +
            (p.precio == null ? "Precio a consultar" : pesos(p.precio)) + "</span>" +
          '<button type="button" class="prod__agregar" data-agregar="' + escapar(p.id) + '">Agregar al pedido</button>' +
        "</div>" +
      "</li>";
    }).join("");

    if (contador) {
      contador.textContent = visibles.length === 1 ? "1 repuesto" : visibles.length + " repuestos";
    }
    if (vacio) {
      vacio.hidden = visibles.length > 0;
      var buscado = [filtro.busqueda, filtro.marca].filter(Boolean).join(" ");
      var pedir = $("[data-vacio-wa]", vacio);
      if (pedir) {
        pedir.href = enlaceWhatsApp("Hola Agrosuna, busco este repuesto y no lo encontré en la página: " + (buscado || ""));
        pedir.target = "_blank";
        pedir.rel = "noopener";
      }
    }
    lista.hidden = visibles.length === 0;
  }

  function refiltrar() {
    mostrados = porPagina;
    pintarProductos();
  }

  if (verMas) {
    verMas.addEventListener("click", function () {
      mostrados += porPagina;
      pintarProductos();
    });
  }

  function irAlCatalogo() {
    var destino = document.getElementById("catalogo");
    if (!destino) return;
    var suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  }

  document.addEventListener("click", function (ev) {
    var cat = ev.target.closest("[data-categoria]");
    if (cat) {
      filtro.categoria = cat.getAttribute("data-categoria");
      pintarFiltros();
      refiltrar();
      return;
    }
    var marca = ev.target.closest("[data-marca]");
    if (marca) {
      var m = marca.getAttribute("data-marca");
      filtro.marca = filtro.marca === m ? "" : m;
      pintarMarcas();
      pintarQuitarMarca();
      refiltrar();
      if (filtro.marca && !marca.closest("#catalogo")) irAlCatalogo();
      return;
    }
    if (ev.target.closest("[data-quitar-marca]")) {
      filtro.marca = "";
      pintarMarcas();
      pintarQuitarMarca();
      refiltrar();
    }
  });

  function pintarQuitarMarca() {
    $$("[data-marca-activa]").forEach(function (el) {
      el.hidden = !filtro.marca;
      var nombre = $("[data-marca-nombre]", el);
      if (nombre) nombre.textContent = filtro.marca;
    });
  }

  $$("[data-buscar]").forEach(function (campo) {
    campo.addEventListener("input", function () {
      filtro.busqueda = campo.value;
      $$("[data-buscar]").forEach(function (otro) { if (otro !== campo) otro.value = campo.value; });
      refiltrar();
    });
    if (campo.form) {
      campo.form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        irAlCatalogo();
      });
    }
  });

  pintarFiltros();
  pintarMarcas();
  pintarQuitarMarca();
  pintarProductos();

  /* ---------- Pedido (carrito) ---------- */

  var CLAVE = "agrosuna-pedido";
  var pedido = {};
  try { pedido = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { pedido = {}; }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento: el pedido vive en la pestaña */ }
  }

  function producto(id) {
    for (var i = 0; i < datos.productos.length; i++) {
      if (datos.productos[i].id === id) return datos.productos[i];
    }
    return null;
  }

  function renglones() {
    return Object.keys(pedido).map(function (id) {
      return { p: producto(id), cantidad: pedido[id] };
    }).filter(function (r) { return r.p && r.cantidad > 0; });
  }

  var dialogo = $("[data-carrito]");
  var listaPedido = $("[data-carrito-lista]");
  var totalEl = $("[data-carrito-total]");
  var enviar = $("[data-carrito-enviar]");
  var pedidoVacio = $("[data-carrito-vacio]");
  var pie = $("[data-carrito-pie]");

  function pintarPedido() {
    var filas = renglones();
    var unidades = 0, total = 0, aCotizar = 0;
    filas.forEach(function (r) {
      unidades += r.cantidad;
      if (r.p.precio == null) aCotizar += 1; else total += r.p.precio * r.cantidad;
    });

    $$("[data-carrito-cuenta]").forEach(function (el) {
      el.textContent = unidades;
      el.hidden = unidades === 0;
    });

    if (!listaPedido) return;
    listaPedido.innerHTML = filas.map(function (r) {
      return '<li class="renglon">' +
        '<div class="renglon__texto">' +
          '<strong class="renglon__nombre">' + escapar(r.p.nombre) + "</strong>" +
          '<span class="renglon__detalle">' + escapar(r.p.detalle) + "</span>" +
        "</div>" +
        '<div class="renglon__cantidad">' +
          '<button type="button" data-menos="' + escapar(r.p.id) + '" aria-label="Quitar una unidad de ' + escapar(r.p.nombre) + '">−</button>' +
          '<span aria-live="polite">' + r.cantidad + "</span>" +
          '<button type="button" data-mas="' + escapar(r.p.id) + '" aria-label="Sumar una unidad de ' + escapar(r.p.nombre) + '">+</button>' +
        "</div>" +
        '<span class="renglon__importe">' + (r.p.precio == null ? "A cotizar" : pesos(r.p.precio * r.cantidad)) + "</span>" +
      "</li>";
    }).join("");

    if (pedidoVacio) pedidoVacio.hidden = filas.length > 0;
    if (pie) pie.hidden = filas.length === 0;
    if (totalEl) {
      totalEl.innerHTML = pesos(total) + (aCotizar
        ? "<small>más " + aCotizar + (aCotizar === 1 ? " repuesto a cotizar" : " repuestos a cotizar") + "</small>"
        : "");
    }
    if (enviar) {
      var lineas = filas.map(function (r) {
        return "• " + r.cantidad + " × " + r.p.nombre + " (" + r.p.detalle + "): " +
          (r.p.precio == null ? "a cotizar" : pesos(r.p.precio * r.cantidad));
      });
      enviar.href = enlaceWhatsApp(
        "Hola Agrosuna, quiero hacer este pedido:\n" + lineas.join("\n") +
        "\nTotal estimado: " + pesos(total) + (aCotizar ? " más lo que haya que cotizar" : "") +
        "\n¿Me confirman disponibilidad y forma de pago?"
      );
      enviar.target = "_blank";
      enviar.rel = "noopener";
    }
  }

  function cambiar(id, delta) {
    pedido[id] = Math.max(0, (pedido[id] || 0) + delta);
    if (pedido[id] === 0) delete pedido[id];
    guardar();
    pintarPedido();
  }

  document.addEventListener("click", function (ev) {
    var agregar = ev.target.closest("[data-agregar]");
    if (agregar) {
      cambiar(agregar.getAttribute("data-agregar"), 1);
      agregar.textContent = "Agregado al pedido";
      agregar.classList.add("is-agregado");
      setTimeout(function () {
        agregar.textContent = "Agregar al pedido";
        agregar.classList.remove("is-agregado");
      }, 1600);
      return;
    }
    var mas = ev.target.closest("[data-mas]");
    if (mas) { cambiar(mas.getAttribute("data-mas"), 1); return; }
    var menos = ev.target.closest("[data-menos]");
    if (menos) { cambiar(menos.getAttribute("data-menos"), -1); return; }

    if (ev.target.closest("[data-abrir-carrito]") && dialogo) {
      if (dialogo.showModal) dialogo.showModal(); else dialogo.setAttribute("open", "");
      return;
    }
    if (dialogo && (ev.target.closest("[data-cerrar-carrito]") || ev.target === dialogo)) {
      if (dialogo.close) dialogo.close(); else dialogo.removeAttribute("open");
    }
  });

  pintarPedido();

  /* ---------- Pedido de presupuesto ---------- */

  $$("form[data-presupuesto]").forEach(function (form) {
    function mensaje() {
      var f = form.elements;
      var lineas = ["Hola Agrosuna, quiero pedir un presupuesto."];
      if (f.nombre && f.nombre.value) lineas.push("Nombre: " + f.nombre.value);
      if (f.telefono && f.telefono.value) lineas.push("Teléfono: " + f.telefono.value);
      if (f.localidad && f.localidad.value) lineas.push("Localidad: " + f.localidad.value);
      if (f.maquina && f.maquina.value) lineas.push("Máquina: " + f.maquina.value);
      if (f.necesidad && f.necesidad.value) lineas.push("Lo que necesito: " + f.necesidad.value);
      return lineas.join("\n");
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      window.open(enlaceWhatsApp(mensaje()), "_blank", "noopener");
    });

    var porCorreo = $("[data-por-correo]", form);
    if (porCorreo) {
      porCorreo.addEventListener("click", function () {
        if (!form.reportValidity()) return;
        window.location.href = "mailto:" + negocio.correo +
          "?subject=" + encodeURIComponent("Pedido de presupuesto desde la página") +
          "&body=" + encodeURIComponent(mensaje());
      });
    }
  });
})();
