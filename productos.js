// ==========================================
// DMAR - PRODUCTOS
// ==========================================

// Google Sheets de DMAR
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUxP6_JHi5hOzH0BL5vXZkReWi1OKRRUiNEQ52AvQ_Mt7NqqsBSgbok1C-u520vgIooOv8NaXfGETL/pub?gid=0&single=true&output=csv";

// Carpeta de imágenes de DMAR
const BASE_IMG = "https://kaleth77.github.io/dmar/img/";


// ==========================================
// PARSEAR CSV
// ==========================================

function parsearCSV(texto) {

  const filas = texto.trim().split("\n");

  const encabezados = filas[0]
    .split(",")
    .map(e => e.trim());

  return filas.slice(1).map(fila => {

    const valores = [];
    let actual = "";
    let dentroComillas = false;

    for (let c of fila) {

      if (c === '"') {

        dentroComillas = !dentroComillas;

      } else if (c === "," && !dentroComillas) {

        valores.push(actual.trim());
        actual = "";

      } else {

        actual += c;

      }

    }

    valores.push(actual.trim());

    const obj = {};

    encabezados.forEach((enc, i) => {
      obj[enc] = valores[i] || "";
    });

    return obj;

  });
}


// ==========================================
// CREAR TARJETA DEL PRODUCTO
// ==========================================

function crearCard(producto) {

  const imgUrl = BASE_IMG + producto.imagen;

  const precioNum = parseInt(producto.precio) || 0;


  // ========================================
  // NO DISPONIBLE
  // ========================================

  const noDisponible =
    producto.noDisponible &&
    producto.noDisponible.trim() !== "";


  // ========================================
  // PRECIO DE REBAJA
  // ========================================

  const tieneRebaja =
    producto.precioRebaja &&
    producto.precioRebaja.trim() !== "" &&
    !isNaN(parseInt(producto.precioRebaja)) &&
    parseInt(producto.precioRebaja) > 0 &&
    parseInt(producto.precioRebaja) < precioNum;


  const precioRebajaNum =
    tieneRebaja
      ? parseInt(producto.precioRebaja)
      : null;


  const precioCobrar =
    tieneRebaja
      ? precioRebajaNum
      : precioNum;


  // ========================================
  // FORMATO DE PRECIOS
  // ========================================

  const precioFormato =
    "$" + precioNum.toLocaleString("es-CO");


  const precioRebajaFormato =
    tieneRebaja
      ? "$" + precioRebajaNum.toLocaleString("es-CO")
      : "";


  // ========================================
  // DESCRIPCIÓN
  // ========================================

  const descripcion =
    (producto.descripcion || "").trim();


  const descId =
    "desc_" +
    (producto.nombre + producto.imagen)
      .replace(/[^a-zA-Z0-9]/g, "");


  // ========================================
  // BLOQUE DE PRECIO
  // ========================================

  const bloquePrecio = tieneRebaja

    ? `
      <div class="precio-rebaja-wrap">

        <span class="precio-original-tachado">
          ${precioFormato}
        </span>

        <span class="precio-valor precio-oferta">
          ${precioRebajaFormato}
        </span>

      </div>
    `

    : `
      <div class="precio-valor">
        ${precioFormato}
      </div>
    `;


  // ========================================
  // BADGES
  // ========================================

  const badgeOferta =
    tieneRebaja
      ? `<span class="badge-oferta">OFERTA</span>`
      : "";


  const badgeNoDisponible =
    noDisponible
      ? `<span class="badge-no-disponible">NO DISPONIBLE</span>`
      : "";


  // ========================================
  // BLOQUE DESCRIPCIÓN
  // ========================================

  const bloqueDescripcion = descripcion

    ? (
        descripcion.length > 60

        ? `
          <input
            type="checkbox"
            id="${descId}"
            class="desc-toggle-check"
          >

          <div class="descripcion-wrap">

            <p class="descripcion-producto">
              ${descripcion}
            </p>

            <label
              for="${descId}"
              class="desc-ver-mas"
            >
              Ver más
            </label>

            <label
              for="${descId}"
              class="desc-ver-menos"
            >
              Ver menos
            </label>

          </div>
        `

        : `
          <p class="descripcion-producto descripcion-corta">
            ${descripcion}
          </p>
        `
      )

    : "";


  // ========================================
  // DATOS PARA WHATSAPP
  // ========================================

  const precioTextoWA =
    tieneRebaja
      ? precioRebajaFormato
      : precioFormato;


  const nombreEscapado =
    producto.nombre
      .replace(/'/g, "\\'");


  // ========================================
  // BOTONES
  // ========================================

  const bloqueAcciones = noDisponible

    ? `
      <div class="acciones-card">

        <span class="texto-no-disponible">
          No disponible
        </span>

      </div>
    `

    : `
      <div class="acciones-card">


        <!-- AGREGAR AL CARRITO -->

        <a
          href="#"
          class="precio"
          onclick="
            agregarAlCarrito(
              '${nombreEscapado}',
              ${precioCobrar},
              '${imgUrl}'
            );
            return false;
          "
        >
          🛒 Agregar al carrito
        </a>


        <!-- PREGUNTAR -->

        <a
          href="#"
          class="btn-consultar"
          onclick="
            consultar(
              '${nombreEscapado}',
              '${precioTextoWA}',
              '${imgUrl}'
            );
            return false;
          "
        >
          💬 Preguntar por producto
        </a>


        <!-- COMPRAR YA -->

        <a
          href="#"
          class="btn-comprar"
          onclick="
            agregarAlCarrito(
              '${nombreEscapado}',
              ${precioCobrar},
              '${imgUrl}'
            );

            comprarWhatsApp();

            return false;
          "
        >
          🛍️ Comprar ya
        </a>


      </div>
    `;


  // ========================================
  // CARD COMPLETA
  // ========================================

  return `

    <div class="card${noDisponible ? " card-no-disponible" : ""}">

      ${badgeOferta}

      ${badgeNoDisponible}


      <img
        src="${imgUrl}"
        onclick="abrirImagen(this)"
        alt="${producto.nombre}"
      >


      <h3>
        ${producto.nombre}
      </h3>


      ${bloqueDescripcion}


      ${bloquePrecio}


      ${bloqueAcciones}

    </div>

  `;
}


// ==========================================
// CARGAR PRODUCTOS
// ==========================================

function cargarProductos(categoria) {

  const contenedor =
    document.getElementById("productos");


  if (!contenedor) {

    console.error(
      "No existe el elemento #productos."
    );

    return;

  }


  contenedor.innerHTML =
    "<p style='color:#d4af37; padding:20px;'>Cargando productos...</p>";


  fetch(SHEET_URL)

    .then(res => {

      if (!res.ok) {
        throw new Error(
          "No se pudo conectar con Google Sheets"
        );
      }

      return res.text();

    })


    .then(csv => {

      console.log(
        "Google Sheets DMAR cargado correctamente."
      );


      const todos =
        parsearCSV(csv);


      console.log(
        "Productos encontrados:",
        todos.length
      );


      // ======================================
      // FILTRAR POR CATEGORÍA
      // ======================================

      const filtrados =
        todos.filter(p =>

          p.categoria &&
          p.categoria.trim().toLowerCase() ===
          categoria.toLowerCase()

          &&

          p.nombre &&
          p.imagen

        );


      // ======================================
      // NO HAY PRODUCTOS
      // ======================================

      if (filtrados.length === 0) {

        contenedor.innerHTML =
          "<p style='color:#d4af37; padding:20px;'>No hay productos en esta categoría aún.</p>";

        return;

      }


      // ======================================
      // MOSTRAR PRODUCTOS
      // ======================================

      contenedor.innerHTML =
        filtrados
          .map(crearCard)
          .join("");

    })


    .catch(err => {

      console.error(
        "Error cargando productos DMAR:",
        err
      );


      contenedor.innerHTML =
        "<p style='color:red; padding:20px;'>Error cargando productos. Revisa la conexión con Google Sheets.</p>";

    });

}
