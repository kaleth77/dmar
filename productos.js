// Google Sheet NUEVO de productos
const SHEET_ID = "1axfPJmVA6eIOCcRsWRQKAhVYnHsofMOfJe1FVBVTzvs";
const SHEET_GID = "0";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

const BASE_IMG = "https://kaleth77.github.io/dmar/img/";

function parsearCSV(texto) {
  const filas = texto.trim().split(/\r?\n/);

  if (filas.length < 2) return [];

  const encabezados = filas[0].split(",").map(e => e.trim());

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


function crearCard(producto) {

  const imgUrl = BASE_IMG + producto.imagen;

  const precioNum = parseInt(
    String(producto.precio).replace(/[^\d]/g, "")
  ) || 0;

  // Verificar si el producto está marcado como no disponible
  const noDisponible =
    producto.noDisponible &&
    producto.noDisponible.trim() !== "";


  const precioFormato =
    "$" + precioNum.toLocaleString("es-CO");


  const descripcion =
    (producto.descripcion || "").trim();


  const descId =
    "desc_" +
    (producto.nombre + producto.imagen)
      .replace(/[^a-zA-Z0-9]/g, "");


  const bloquePrecio = `
    <div class="precio-valor">
      ${precioFormato}
    </div>
  `;


  const badgeNoDisponible = noDisponible
    ? `<span class="badge-no-disponible">
         NO DISPONIBLE
       </span>`
    : "";


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


  const nombreEscapado =
    producto.nombre.replace(/'/g, "\\'");


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

        <a
          href="#"
          class="precio"
          onclick="
            agregarAlCarrito(
              '${nombreEscapado}',
              ${precioNum},
              '${imgUrl}'
            );
            return false;
          "
        >
          🛒 Agregar al carrito
        </a>


        <a
          href="#"
          class="btn-consultar"
          onclick="
            consultar(
              '${nombreEscapado}',
              '${precioFormato}',
              '${imgUrl}'
            );
            return false;
          "
        >
          💬 Preguntar por producto
        </a>


        <a
          href="#"
          class="btn-comprar"
          onclick="
            agregarAlCarrito(
              '${nombreEscapado}',
              ${precioNum},
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


  return `

    <div class="card${noDisponible ? " card-no-disponible" : ""}">

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


function cargarProductos(categoria) {

  const contenedor =
    document.getElementById("productos");


  contenedor.innerHTML = `
    <p style="color:#d4afc6; padding:20px;">
      Cargando productos...
    </p>
  `;


  fetch(SHEET_URL)

    .then(res => {

      if (!res.ok) {
        throw new Error(
          "No se pudo acceder al Google Sheet"
        );
      }

      return res.text();

    })

    .then(csv => {

      const todos =
        parsearCSV(csv);


      const filtrados =
        todos.filter(p =>

          p.categoria &&
          p.categoria.trim().toLowerCase() ===
            categoria.toLowerCase()

          &&

          p.nombre &&
          p.imagen

          &&

          // Si está marcado como no disponible
          // igual se muestra, pero sin botones.
          true
        );


      if (filtrados.length === 0) {

        contenedor.innerHTML = `
          <p style="color:#d4afc6; padding:20px;">
            No hay productos en esta categoría aún.
          </p>
        `;

        return;
      }


      contenedor.innerHTML =
        filtrados.map(crearCard).join("");

    })

    .catch(err => {

      console.error(
        "Error cargando productos:",
        err
      );


      contenedor.innerHTML = `
        <p style="color:red; padding:20px;">
          Error cargando productos.
          Revisa que el Google Sheet esté publicado.
        </p>
      `;

    });
}
