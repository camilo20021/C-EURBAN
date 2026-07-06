/* ==========================================================================
   C&E URBAN WEAR — Generador de marcadores visuales de producto
   Mientras no haya fotos reales, mostramos siluetas ilustradas
   coherentes con la categoria y el color del producto.
   ========================================================================== */

const SVG_PRENDAS = {
    default: (color) => `
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="${color}"/>
            <image href="IMAGENES/favicon.wedp" x="50" y="50" height="100" width="100" />
        </svg>
    `
};

/**
 * Genera el marcador visual de un producto.
 * Si el producto tiene una foto real (campo "imagen" distinto de "placeholder"), la muestra.
 * Si no, usa una silueta SVG segun la categoria, tenida con el color del producto.
 */
function generarPlaceholderProducto(producto) {
    if (producto.imagen && producto.imagen !== 'placeholder') {
        return `
            <div class="prenda-placeholder foto-real">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
            </div>
        `;
    }

    const generador = SVG_PRENDAS.default;
    const color = producto.color || '#1c2f6e';
    return `
        <div class="prenda-placeholder">
            ${generador(color)}
            <span class="marca-sello">C&amp;E</span>
        </div>
    `;
}
