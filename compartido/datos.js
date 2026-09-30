/* Datos del negocio y catálogo. Es el único archivo que hay que tocar para
   cambiar teléfonos, horarios, marcas o productos en todas las versiones. */
window.AGROSUNA = {
  // Carpeta de fotos, calculada a partir de la ubicación de este archivo.
  fotos: new URL("../assets/fotos/", document.currentScript.src).href,

  negocio: {
    nombre: "Agrosuna Servicios Agropecuarios",
    whatsapp: "5493718417471",
    telefono: "+543718417471",
    telefonoVisible: "3718 417471",
    correo: "serviciosagrop.osuna@gmail.com",
    instagram: "https://www.instagram.com/agrosunaserviciosagropecuarios/",
    direccion: "Ruta Nacional N.º 86, km 1346,5 — Laguna Blanca, Formosa",
    mapa: "https://www.google.com/maps/search/?api=1&query=Agrosuna+Servicios+Agropecuarios+Ruta+Nacional+86+Laguna+Blanca+Formosa",
    // Día 0 = domingo. Cada tramo es [abre, cierra] en formato 24 h.
    horarios: {
      1: [["07:30", "12:00"], ["14:30", "19:00"]],
      2: [["07:30", "12:00"], ["14:30", "19:00"]],
      3: [["07:30", "12:00"], ["14:30", "19:00"]],
      4: [["07:30", "12:00"], ["14:30", "19:00"]],
      5: [["07:30", "12:00"], ["14:30", "19:00"]],
      6: [["07:30", "12:00"]]
    }
  },

  marcas: [
    "John Deere", "Massey Ferguson", "Valtra", "Zanello", "Pauny", "Fiat",
    "Deutz", "Deutz-Fahr", "New Holland", "Agco Allis", "Hanomag", "Maxion",
    "Carraro", "ZF", "Cummins", "Perkins", "Komatsu", "LiuGong"
  ],

  /* CATÁLOGO DE MUESTRA: los productos, precios y fotos de abajo son ejemplos
     para ver el diseño. Reemplazarlos por la lista real y poner
     catalogoDeMuestra en false para que desaparezca el aviso en la página.
     precio: número en pesos, o null para que figure "Consultar".
     imagen: nombre del archivo en assets/fotos, sin "-c.webp". */
  catalogoDeMuestra: true,
  productos: [
    { id: "rimula-r4x-20", codigo: "LU-1001", nombre: "Shell Rimula R4 X 15W-40", detalle: "Aceite para motor diésel. Balde de 20 L", categoria: "Lubricantes", marca: "Shell", tipo: "Original", precio: 186000, imagen: "aceite", destacado: true },
    { id: "spirax-s4-txm-20", codigo: "LU-1002", nombre: "Shell Spirax S4 TXM", detalle: "Transmisión, hidráulico y frenos húmedos. Balde de 20 L", categoria: "Lubricantes", marca: "Shell", tipo: "Original", precio: 172000, imagen: "tractor-hidraulico" },
    { id: "filtro-aceite-mf", codigo: "FI-2001", nombre: "Filtro de aceite de motor", detalle: "Para Massey Ferguson con motor Perkins", categoria: "Filtros", marca: "Massey Ferguson", tipo: "Alternativo", precio: 18500, imagen: "filtro", destacado: true },
    { id: "rodamiento-conico", codigo: "RO-3001", nombre: "Rodamiento cónico de rodillos", detalle: "Para mazas y puntas de eje. Varias medidas", categoria: "Rodamientos", marca: "Varias", tipo: "Original", precio: 38500, imagen: "rodamiento-conico", destacado: true },
    { id: "rodamiento-bolas", codigo: "RO-3002", nombre: "Rodamiento rígido de bolas", detalle: "Blindado, serie 6200 y 6300", categoria: "Rodamientos", marca: "Varias", tipo: "Alternativo", precio: 12400, imagen: "rodamientos" },
    { id: "engranaje-caja", codigo: "TR-4001", nombre: "Engranaje de caja de cambios", detalle: "Para Massey Ferguson, Deutz y Fiat. Consultar por modelo", categoria: "Transmisión", marca: "Massey Ferguson", tipo: "Alternativo", precio: null, imagen: "engranajes" },
    { id: "juntas-perkins", codigo: "MO-5001", nombre: "Juego de juntas de motor", detalle: "Para Perkins 4.236 y 4.248", categoria: "Motor", marca: "Perkins", tipo: "Original", precio: 94500, imagen: "motor-distribucion", destacado: true },
    { id: "inyeccion", codigo: "MO-5002", nombre: "Repuestos de bomba inyectora", detalle: "Elementos, válvulas y toberas. Consultar por modelo", categoria: "Motor", marca: "Varias", tipo: "Alternativo", precio: null, imagen: "piezas-blanco" },
    { id: "manguera-hidraulica", codigo: "HI-6001", nombre: "Manguera hidráulica a medida", detalle: "SAE 100 R2 con terminales prensados", categoria: "Hidráulica", marca: "Agrosuna", tipo: "Fabricación propia", precio: null, imagen: "mangueras", destacado: true },
    { id: "conexiones", codigo: "HI-6002", nombre: "Conexiones y terminales hidráulicos", detalle: "Codos de 90°, 45° y 37°, niples, bridas y adaptadores", categoria: "Hidráulica", marca: "Varias", tipo: "Original", precio: 7900, imagen: "conexion" },
    { id: "cilindro-medida", codigo: "HI-6003", nombre: "Cilindro hidráulico a medida", detalle: "Fabricado en nuestra tornería según plano o muestra", categoria: "Hidráulica", marca: "Agrosuna", tipo: "Fabricación propia", precio: null, imagen: "vastago", destacado: true },
    { id: "bulon-grado-8", codigo: "BU-7001", nombre: "Bulón hexagonal grado 8 con tuerca", detalle: "Rosca fina y gruesa. Precio por unidad", categoria: "Bulonería", marca: "Varias", tipo: "Original", precio: 1850, imagen: "bulones-blanco", destacado: true },
    { id: "buloneria-kilo", codigo: "BU-7002", nombre: "Bulonería surtida", detalle: "Bulones, tornillos, arandelas y chavetas. Precio por kilo", categoria: "Bulonería", marca: "Varias", tipo: "Original", precio: 9800, imagen: "bulones" },
    { id: "tuercas", codigo: "BU-7003", nombre: "Tuercas hexagonales", detalle: "Milimétricas y en pulgadas. Bolsa de 10 unidades", categoria: "Bulonería", marca: "Varias", tipo: "Original", precio: 4200, imagen: "tuercas" },
    { id: "pieza-torneada", codigo: "FA-8001", nombre: "Pieza torneada a medida", detalle: "En hierro, grilón, poliamida o bronce", categoria: "Fabricación propia", marca: "Agrosuna", tipo: "Fabricación propia", precio: null, imagen: "torno", destacado: true },
    { id: "cuchilla-desmalezadora", codigo: "FA-8002", nombre: "Cuchilla para desmalezadora", detalle: "Hierro templado. Par izquierda y derecha", categoria: "Fabricación propia", marca: "Agrosuna", tipo: "Fabricación propia", precio: 58000, imagen: "amoladora", destacado: true }
  ]
};
