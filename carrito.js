console.log("Carrito KP conectado");

let carrito = JSON.parse(localStorage.getItem("kp_carrito")) || [];

function guardarCarrito() {
  localStorage.setItem("kp_carrito", JSON.stringify(carrito));
}

function abrirCarrito() {
  const modal = document.getElementById("modal-carrito");
  if (modal) modal.style.display = "flex";
}

function cerrarCarrito() {
  const modal = document.getElementById("modal-carrito");
  if (modal) modal.style.display = "none";
}

function agregarAlCarrito(nombre, precio, imagen) {
  carrito.push({ nombre, precio: Number(precio), imagen });
  guardarCarrito();
  actualizarCarrito();
}

function eliminarDelCarrito(index) {
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById("lista-carrito");
  const totalElemento = document.getElementById("total");
  const contador = document.getElementById("contador-carrito");
  let total = 0;
  if (lista) {
    lista.innerHTML = "";
    carrito.forEach((producto, index) => {
      total += producto.precio;
      lista.innerHTML += `
        <div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #444;">
          <img src="${producto.imagen}" width="60" style="border-radius:6px;"><br><br>
          <strong>${producto.nombre}</strong><br>
          $${producto.precio.toLocaleString('es-CO')}<br><br>
          <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
        </div>
      `;
    });
    if (totalElemento) totalElemento.textContent = total.toLocaleString('es-CO');
  }
  if (contador) contador.textContent = carrito.length;
}

function comprarWhatsApp() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  let mensaje = "\uD83D\uDED2 NUEVO PEDIDO - KP RELOJES \u231A\n\n\uD83D\uDCE6 Productos seleccionados:\n";

  let total = 0;
  carrito.forEach(function(producto) {
    total += producto.precio;
    mensaje += "\n\u231A " + producto.nombre
             + "\n\uD83D\uDCB0 Precio: $" + producto.precio.toLocaleString('es-CO')
             + "\n\uD83D\uDCF8 Imagen: " + producto.imagen
             + "\n";
  });

  mensaje += "\n——————————————"
           + "\n\uD83D\uDCB5 TOTAL DEL PEDIDO: $" + total.toLocaleString('es-CO')
           + "\n\n\uD83D\uDCCD Datos de entrega:"
           + "\n\u270D Nombre:"
           + "\n\uD83D\uDCDE Telefono:"
           + "\n\uD83C\uDFE0 Direccion:"
           + "\n\n\uD83D\uDE9A Envio a domicilio."
           + "\n\n\u2728 Gracias por elegir KP RELOJES"
           + "\n\uD83D\uDD70 Calidad y elegancia en cada detalle.";

  localStorage.setItem("kp_ultimo_total", total);
  localStorage.setItem("kp_ultima_compra", new Date().toISOString());

  const textoEncoded = encodeURIComponent(mensaje);

  // En iPhone abre la app directamente, en otros usa api.whatsapp.com
  const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isIphone
    ? "whatsapp://send?phone=+573126714681&text=" + textoEncoded
    : "https://api.whatsapp.com/send?phone=+573104264496&text=" + textoEncoded;

  window.open(url, "_blank");

  carrito = [];
  guardarCarrito();
  actualizarCarrito();
}

document.addEventListener("DOMContentLoaded", actualizarCarrito);
