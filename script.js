function consultar(producto, precioTexto, imgUrl) {
    let numero = "573126714681";
    let mensaje = "Hola, quiero consultar por: " + producto;
    if (precioTexto) {
        mensaje += " (" + precioTexto + ")";
    }
    if (imgUrl) {
        mensaje += "\n" + imgUrl;
    }
    let url = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
    window.open(url, "_blank");
}
