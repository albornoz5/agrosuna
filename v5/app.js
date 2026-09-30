/* Tienda Agrosuna: cabecera y pie comunes, catálogo, ficha de producto y carrito.
   El pedido se envía por WhatsApp; no hay servidor ni pasarela de pago. */
(function () {
  "use strict";

  var datos = window.AGROSUNA;
  var negocio = datos.negocio;
  var pagina = document.body.getAttribute("data-pagina");
  var parametros = new URLSearchParams(window.location.search);

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  function escapar(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function normalizar(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function pesos(n) { return "$ " + Math.round(n).toLocaleString("es-AR"); }
  function icono(nombre) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + nombre + '"/></svg>'; }
  function whatsapp(texto) {
    return "https://wa.me/" + negocio.whatsapp + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }
  function foto(p, corte) { return datos.fotos + p.imagen + "-" + (corte || "c") + ".webp"; }
  function urlProducto(p) { return "producto.html?id=" + encodeURIComponent(p.id); }
  function urlCategoria(c) { return "productos.html?categoria=" + encodeURIComponent(c); }
  function buscarProducto(id) {
    for (var i = 0; i < datos.productos.length; i++) if (datos.productos[i].id === id) return datos.productos[i];
    return null;
  }
  function categorias() {
    var lista = [];
    datos.productos.forEach(function (p) { if (lista.indexOf(p.categoria) === -1) lista.push(p.categoria); });
    return lista;
  }

  /* ---------- Carrito ---------- */

  var CLAVE = "agrosuna-pedido";
  var carrito = {};
  try { carrito = JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { carrito = {}; }

  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ }
    pintarContador();
  }
  function renglones() {
    return Object.keys(carrito).map(function (id) { return { p: buscarProducto(id), cantidad: carrito[id] }; })
      .filter(function (r) { return r.p && r.cantidad > 0; });
  }
  function unidades() { return renglones().reduce(function (n, r) { return n + r.cantidad; }, 0); }
  function sumar(id, cantidad) {
    carrito[id] = Math.max(0, (carrito[id] || 0) + cantidad);
    if (!carrito[id]) delete carrito[id];
    guardar();
  }
  function pintarContador() {
    var n = unidades();
    $$("[data-contador]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }

  /* ---------- Cabecera y pie ---------- */

  var enlacesCategorias = categorias().map(function (c) {
    return '<a href="' + urlCategoria(c) + '">' + escapar(c) + "</a>";
  }).join("");

  $("#cabecera").innerHTML =
    '<div class="aviso"><div class="contenedor aviso__fila">' +
      "<p>" + icono("shop") + "Retirá tu pedido en el local o coordinamos el envío a toda la provincia</p>" +
      '<p class="aviso__horario">' + icono("clock") + "Lun a Vie 7:30 a 12 y 14:30 a 19 · Sáb 7:30 a 12</p>" +
    "</div></div>" +
    '<div class="contenedor cabecera__fila">' +
      '<a class="cabecera__logo" href="index.html"><img src="../assets/marca/logo-secundario-verde.svg" alt="Agrosuna Servicios Agropecuarios" width="220" height="40"></a>' +
      '<form class="buscador" action="productos.html" role="search">' +
        '<label class="oculto" for="q">Buscar repuestos</label>' +
        '<input id="q" name="q" type="search" placeholder="Buscar repuestos, marcas o códigos" value="' + escapar(parametros.get("q") || "") + '">' +
        '<button type="submit" aria-label="Buscar">' + icono("search") + "</button>" +
      "</form>" +
      '<a class="cabecera__consulta" href="' + whatsapp("Hola, quiero hacer una consulta.") + '" target="_blank" rel="noopener">' +
        icono("whatsapp") + "<span>Consultas<strong>" + negocio.telefonoVisible + "</strong></span></a>" +
      '<a class="cabecera__carrito" href="carrito.html">' + icono("cart3") +
        '<span>Carrito</span><b data-contador hidden>0</b></a>' +
    "</div>" +
    '<nav class="rubros" aria-label="Categorías"><div class="contenedor rubros__fila">' +
      '<a class="rubros__todos" href="productos.html">' + icono("list") + "Todos los productos</a>" +
      enlacesCategorias +
      '<span class="rubros__separador"></span>' +
      '<a href="index.html#servicios">Servicios del taller</a>' +
      '<a href="index.html#contacto">Contacto</a>' +
    "</div></nav>";

  $("#pie").innerHTML =
    '<div class="contenedor pie__grilla">' +
      "<div>" +
        '<img src="../assets/marca/logo-secundario-blanco.svg" alt="Agrosuna Servicios Agropecuarios" width="200" height="37">' +
        "<p>Repuestos para maquinaria agrícola, mecánica pesada, tornería y soluciones hidráulicas. Desde 2001 en Laguna Blanca, Formosa.</p>" +
        '<a class="pie__red" href="' + negocio.instagram + '" target="_blank" rel="noopener">' + icono("instagram") + "Instagram</a>" +
      "</div>" +
      "<div><h2>Categorías</h2><ul>" +
        categorias().map(function (c) { return '<li><a href="' + urlCategoria(c) + '">' + escapar(c) + "</a></li>"; }).join("") +
      "</ul></div>" +
      "<div><h2>Información</h2><ul>" +
        '<li><a href="index.html#como-comprar">Cómo comprar</a></li>' +
        '<li><a href="index.html#como-comprar">Envíos y retiros</a></li>' +
        '<li><a href="index.html#servicios">Servicios del taller</a></li>' +
        '<li><a href="mailto:' + negocio.correo + '?subject=' + encodeURIComponent("Botón de arrepentimiento") + '">Botón de arrepentimiento</a></li>' +
      "</ul></div>" +
      "<div><h2>Contacto</h2><ul class=\"pie__contacto\">" +
        "<li>" + icono("geo-alt-fill") + "Ruta Nac. 86, km 1346,5<br>Laguna Blanca, Formosa</li>" +
        '<li><a href="' + whatsapp() + '" target="_blank" rel="noopener">' + icono("whatsapp") + negocio.telefonoVisible + "</a></li>" +
        '<li><a href="mailto:' + negocio.correo + '">' + icono("envelope") + negocio.correo + "</a></li>" +
        "<li>" + icono("clock") + "Lun a Vie 7:30 a 12 y 14:30 a 19<br>Sábados 7:30 a 12</li>" +
      "</ul></div>" +
    "</div>" +
    '<div class="pie__legal"><div class="contenedor">© 2026 Agrosuna Servicios Agropecuarios. Todos los derechos reservados.</div></div>' +
    '<a class="flotante" href="' + whatsapp("Hola, quiero hacer una consulta.") + '" target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp">' + icono("whatsapp") + "</a>" +
    '<div class="notificacion" role="status" hidden></div>';

  pintarContador();

  $$("[data-wa]").forEach(function (a) {
    a.href = whatsapp(a.getAttribute("data-wa") || "Hola, quiero hacer una consulta.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* ---------- Tarjeta de producto ---------- */

  function tarjeta(p) {
    return '<li class="producto">' +
      '<a class="producto__foto" href="' + urlProducto(p) + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + foto(p) + '" alt="" width="640" height="640" loading="lazy">' +
        (p.tipo === "Fabricación propia" ? '<span class="etiqueta">Fabricación propia</span>' : "") +
      "</a>" +
      '<div class="producto__datos">' +
        '<span class="producto__categoria">' + escapar(p.categoria) + "</span>" +
        '<h3><a href="' + urlProducto(p) + '">' + escapar(p.nombre) + "</a></h3>" +
        '<p class="producto__detalle">' + escapar(p.detalle) + "</p>" +
        '<p class="producto__precio' + (p.precio == null ? " producto__precio--consultar" : "") + '">' +
          (p.precio == null ? "Precio a consultar" : pesos(p.precio)) + "</p>" +
        '<button type="button" class="boton boton--verde" data-agregar="' + escapar(p.id) + '">' + icono("cart3") + "Agregar al carrito</button>" +
      "</div>" +
    "</li>";
  }

  var temporizador;
  function avisar(p) {
    var caja = $(".notificacion");
    caja.innerHTML = icono("check-circle-fill") + "<span><strong>" + escapar(p.nombre) +
      '</strong> se agregó al carrito</span><a href="carrito.html">Ver carrito</a>';
    caja.hidden = false;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { caja.hidden = true; }, 4000);
  }

  document.addEventListener("click", function (ev) {
    var boton = ev.target.closest("[data-agregar]");
    if (!boton) return;
    var cantidad = 1;
    var campo = $("[data-cantidad]");
    if (campo && boton.hasAttribute("data-con-cantidad")) cantidad = Math.max(1, parseInt(campo.value, 10) || 1);
    sumar(boton.getAttribute("data-agregar"), cantidad);
    avisar(buscarProducto(boton.getAttribute("data-agregar")));
  });

  if (datos.catalogoDeMuestra) $$("[data-aviso-muestra]").forEach(function (el) { el.hidden = false; });

  /* ---------- Inicio ---------- */

  if (pagina === "inicio") {
    var fotosCategoria = {};
    datos.productos.forEach(function (p) { if (!fotosCategoria[p.categoria]) fotosCategoria[p.categoria] = p; });
    $("[data-categorias]").innerHTML = categorias().map(function (c) {
      return '<li><a class="categoria" href="' + urlCategoria(c) + '">' +
        '<img src="' + foto(fotosCategoria[c]) + '" alt="" width="640" height="640" loading="lazy">' +
        "<span>" + escapar(c) + "</span></a></li>";
    }).join("");

    $("[data-destacados]").innerHTML = datos.productos.filter(function (p) { return p.destacado; })
      .slice(0, 8).map(tarjeta).join("");

    $("[data-marcas]").innerHTML = datos.marcas.map(function (m) {
      return '<li><a href="productos.html?marca=' + encodeURIComponent(m) + '">' + escapar(m) + "</a></li>";
    }).join("");
  }

  /* ---------- Listado ---------- */

  if (pagina === "productos") {
    var estado = {
      categoria: parametros.get("categoria") || "",
      q: parametros.get("q") || "",
      marca: parametros.get("marca") || "",
      tipos: [],
      orden: "destacados"
    };

    var titulo = estado.q ? "Resultados para “" + estado.q + "”" : (estado.categoria || "Todos los productos");
    $("[data-titulo]").textContent = titulo;
    $("[data-miga]").textContent = estado.categoria || (estado.q ? "Búsqueda" : "Productos");
    document.title = titulo + " | Agrosuna";

    $("[data-lista-categorias]").innerHTML =
      '<li><a href="productos.html"' + (!estado.categoria ? ' aria-current="page"' : "") + ">Todas<span>" + datos.productos.length + "</span></a></li>" +
      categorias().map(function (c) {
        var n = datos.productos.filter(function (p) { return p.categoria === c; }).length;
        return '<li><a href="' + urlCategoria(c) + '"' + (estado.categoria === c ? ' aria-current="page"' : "") + ">" + escapar(c) + "<span>" + n + "</span></a></li>";
      }).join("");

    // En escritorio los filtros van siempre abiertos; en el teléfono se despliegan.
    if (window.matchMedia("(min-width: 821px)").matches) $("[data-filtros]").open = true;

    var selectorMarca = $("[data-marca]");
    selectorMarca.innerHTML = '<option value="">Todas las marcas</option>' + datos.marcas.map(function (m) {
      return "<option" + (m === estado.marca ? " selected" : "") + ">" + escapar(m) + "</option>";
    }).join("");

    var pintarListado = function () {
      var visibles = datos.productos.filter(function (p) {
        if (estado.categoria && p.categoria !== estado.categoria) return false;
        if (estado.tipos.length && estado.tipos.indexOf(p.tipo) === -1) return false;
        var texto = normalizar([p.nombre, p.detalle, p.marca, p.categoria, p.codigo].join(" "));
        if (estado.marca && texto.indexOf(normalizar(estado.marca)) === -1) return false;
        return normalizar(estado.q).split(/\s+/).filter(Boolean).every(function (palabra) {
          return texto.indexOf(palabra) !== -1;
        });
      });
      // Los productos sin precio quedan al final al ordenar por precio.
      var valor = function (p, vacio) { return p.precio == null ? vacio : p.precio; };
      if (estado.orden === "menor") visibles.sort(function (a, b) { return valor(a, Infinity) - valor(b, Infinity); });
      if (estado.orden === "mayor") visibles.sort(function (a, b) { return valor(b, -1) - valor(a, -1); });
      if (estado.orden === "nombre") visibles.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });

      $("[data-cuenta]").textContent = visibles.length === 1 ? "1 producto" : visibles.length + " productos";
      $("[data-productos]").innerHTML = visibles.map(tarjeta).join("");
      $("[data-productos]").hidden = visibles.length === 0;
      $("[data-vacio]").hidden = visibles.length > 0;
      $("[data-vacio-wa]").href = whatsapp("Hola, busco este repuesto y no lo encontré en la tienda: " + [estado.q, estado.marca].filter(Boolean).join(" "));
    };

    $$("[data-tipo]").forEach(function (casilla) {
      casilla.addEventListener("change", function () {
        estado.tipos = $$("[data-tipo]:checked").map(function (c) { return c.value; });
        pintarListado();
      });
    });
    selectorMarca.addEventListener("change", function () { estado.marca = selectorMarca.value; pintarListado(); });
    $("[data-orden]").addEventListener("change", function (ev) { estado.orden = ev.target.value; pintarListado(); });
    pintarListado();
  }

  /* ---------- Ficha de producto ---------- */

  if (pagina === "producto") {
    var p = buscarProducto(parametros.get("id"));
    var ficha = $("[data-ficha]");
    if (!p) {
      ficha.innerHTML = '<div class="vacio"><h1>No encontramos ese producto</h1><p>Puede que ya no esté publicado. Mirá el catálogo completo o escribinos.</p>' +
        '<a class="boton boton--oscuro" href="productos.html">Ver todos los productos</a></div>';
    } else {
      document.title = p.nombre + " | Agrosuna";
      $("[data-miga-categoria]").textContent = p.categoria;
      $("[data-miga-categoria]").href = urlCategoria(p.categoria);
      $("[data-miga-producto]").textContent = p.nombre;
      ficha.innerHTML =
        '<div class="ficha__foto"><img src="' + foto(p) + '" alt="' + escapar(p.nombre) + '" width="640" height="640"></div>' +
        '<div class="ficha__datos">' +
          '<a class="producto__categoria" href="' + urlCategoria(p.categoria) + '">' + escapar(p.categoria) + "</a>" +
          "<h1>" + escapar(p.nombre) + "</h1>" +
          '<p class="ficha__codigo">Código ' + escapar(p.codigo) + '<span class="etiqueta etiqueta--suelta">' + escapar(p.tipo) + "</span></p>" +
          '<p class="ficha__precio' + (p.precio == null ? " ficha__precio--consultar" : "") + '">' + (p.precio == null ? "Precio a consultar" : pesos(p.precio)) + "</p>" +
          '<p class="ficha__detalle">' + escapar(p.detalle) + ".</p>" +
          '<div class="ficha__compra">' +
            '<div class="cantidad"><button type="button" data-restar aria-label="Restar una unidad">' + icono("dash-lg") + "</button>" +
              '<input data-cantidad type="number" min="1" value="1" aria-label="Cantidad">' +
              '<button type="button" data-sumar aria-label="Sumar una unidad">' + icono("plus-lg") + "</button></div>" +
            '<button type="button" class="boton boton--verde boton--grande" data-agregar="' + escapar(p.id) + '" data-con-cantidad>' + icono("cart3") + "Agregar al carrito</button>" +
          "</div>" +
          '<a class="boton boton--borde" target="_blank" rel="noopener" href="' + whatsapp("Hola, quiero consultar por este producto: " + p.nombre + " (código " + p.codigo + ").") + '">' + icono("whatsapp") + "Consultar por WhatsApp</a>" +
          '<ul class="ficha__info">' +
            "<li>" + icono("shop") + "Retiro sin cargo en el local de Laguna Blanca</li>" +
            "<li>" + icono("truck") + "Envío a toda la provincia, a coordinar</li>" +
            "<li>" + icono("shield-check") + "Garantía según el producto</li>" +
          "</ul>" +
        "</div>";

      var campoCantidad = $("[data-cantidad]");
      $("[data-restar]").addEventListener("click", function () { campoCantidad.value = Math.max(1, (parseInt(campoCantidad.value, 10) || 1) - 1); });
      $("[data-sumar]").addEventListener("click", function () { campoCantidad.value = (parseInt(campoCantidad.value, 10) || 1) + 1; });

      var relacionados = datos.productos.filter(function (o) { return o.categoria === p.categoria && o.id !== p.id; });
      datos.productos.forEach(function (o) {
        if (relacionados.length < 4 && o.id !== p.id && relacionados.indexOf(o) === -1) relacionados.push(o);
      });
      $("[data-relacionados]").innerHTML = relacionados.slice(0, 4).map(tarjeta).join("");
    }
  }

  /* ---------- Carrito ---------- */

  if (pagina === "carrito") {
    var pintarCarrito = function () {
      var filas = renglones();
      var total = 0, aCotizar = 0;
      filas.forEach(function (r) { if (r.p.precio == null) aCotizar += 1; else total += r.p.precio * r.cantidad; });

      $("[data-carrito-vacio]").hidden = filas.length > 0;
      $("[data-carrito-lleno]").hidden = filas.length === 0;

      $("[data-renglones]").innerHTML = filas.map(function (r) {
        return "<tr>" +
          '<td><div class="tabla__producto"><a href="' + urlProducto(r.p) + '"><img src="' + foto(r.p) + '" alt="" width="72" height="72"></a>' +
            '<div><a href="' + urlProducto(r.p) + '">' + escapar(r.p.nombre) + "</a><small>" + escapar(r.p.detalle) + "</small></div></div></td>" +
          '<td data-rotulo="Precio">' + (r.p.precio == null ? "A cotizar" : pesos(r.p.precio)) + "</td>" +
          '<td data-rotulo="Cantidad"><div class="cantidad cantidad--chica">' +
            '<button type="button" data-menos="' + escapar(r.p.id) + '" aria-label="Restar una unidad">' + icono("dash-lg") + "</button>" +
            "<span>" + r.cantidad + "</span>" +
            '<button type="button" data-mas="' + escapar(r.p.id) + '" aria-label="Sumar una unidad">' + icono("plus-lg") + "</button></div></td>" +
          '<td data-rotulo="Subtotal"><strong>' + (r.p.precio == null ? "A cotizar" : pesos(r.p.precio * r.cantidad)) + "</strong></td>" +
          '<td><button type="button" class="tabla__quitar" data-quitar="' + escapar(r.p.id) + '" aria-label="Quitar ' + escapar(r.p.nombre) + '">' + icono("trash3") + "</button></td>" +
        "</tr>";
      }).join("");

      $("[data-subtotal]").textContent = pesos(total);
      $("[data-total]").textContent = pesos(total);
      $("[data-a-cotizar]").hidden = aCotizar === 0;
      $("[data-a-cotizar]").textContent = aCotizar === 1
        ? "Hay 1 producto a cotizar: te pasamos el precio al confirmar el pedido."
        : "Hay " + aCotizar + " productos a cotizar: te pasamos el precio al confirmar el pedido.";
    };

    document.addEventListener("click", function (ev) {
      var mas = ev.target.closest("[data-mas]");
      var menos = ev.target.closest("[data-menos]");
      var quitar = ev.target.closest("[data-quitar]");
      if (mas) sumar(mas.getAttribute("data-mas"), 1);
      else if (menos) sumar(menos.getAttribute("data-menos"), -1);
      else if (quitar) { delete carrito[quitar.getAttribute("data-quitar")]; guardar(); }
      else return;
      pintarCarrito();
    });

    $("[data-pedido]").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = ev.target.elements;
      var total = 0, aCotizar = false;
      var lineas = renglones().map(function (r) {
        if (r.p.precio == null) aCotizar = true; else total += r.p.precio * r.cantidad;
        return "• " + r.cantidad + " × " + r.p.nombre + " (" + r.p.codigo + "): " + (r.p.precio == null ? "a cotizar" : pesos(r.p.precio * r.cantidad));
      });
      var mensaje = ["Hola, quiero hacer este pedido desde la tienda:"].concat(lineas, [
        "Total: " + pesos(total) + (aCotizar ? " más lo que haya que cotizar" : ""),
        "",
        "Nombre: " + f.nombre.value,
        "Teléfono: " + f.telefono.value,
        f.localidad.value ? "Localidad: " + f.localidad.value : "",
        "Entrega: " + f.entrega.value,
        "Pago: " + f.pago.value,
        f.comentario.value ? "Comentario: " + f.comentario.value : ""
      ]).filter(function (l, i) { return l !== "" || i === lineas.length + 2; }).join("\n");
      window.open(whatsapp(mensaje), "_blank", "noopener");
    });

    pintarCarrito();
  }

  /* ---------- Abierto / cerrado ---------- */

  var estadoEl = $("[data-estado]");
  if (estadoEl) {
    var partes = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { partes[x.type] = x.value; });
    var dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(partes.weekday);
    var ahora = (parseInt(partes.hour, 10) % 24) * 60 + parseInt(partes.minute, 10);
    var abierto = (negocio.horarios[dia] || []).some(function (t) {
      var a = t[0].split(":"), c = t[1].split(":");
      return ahora >= a[0] * 60 + +a[1] && ahora < c[0] * 60 + +c[1];
    });
    estadoEl.textContent = abierto ? "Abierto ahora" : "Cerrado en este momento";
    estadoEl.setAttribute("data-abierto", abierto ? "si" : "no");
  }
})();
