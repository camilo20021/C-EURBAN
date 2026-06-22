/* ==========================================================================
   C&E URBAN WEAR — Generador de marcadores visuales de producto
   Mientras no haya fotos reales, mostramos siluetas ilustradas
   coherentes con la categoria y el color del producto.
   ========================================================================== */

const SVG_PRENDAS = {
    buzos: (color) => `
        <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 30 C70 18 80 10 100 10 C120 10 130 18 130 30 L130 38 L160 50 L172 90 L150 100 L142 78 L142 200 C142 208 136 212 128 212 L72 212 C64 212 58 208 58 200 L58 78 L50 100 L28 90 L40 50 L70 38 Z"
                fill="${color}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
            <path d="M82 30 C82 42 90 50 100 50 C110 50 118 42 118 30" stroke="rgba(255,255,255,0.18)" stroke-width="2" fill="none"/>
            <circle cx="100" cy="100" r="22" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
            <path d="M88 100 L100 112 L116 92" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
    sudaderas: (color) => `
        <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M65 28 L100 18 L135 28 L135 36 L165 48 L176 86 L154 96 L146 76 L146 195 C146 204 139 208 130 208 L70 208 C61 208 54 204 54 195 L54 76 L46 96 L24 86 L35 48 L65 36 Z"
                fill="${color}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
            <circle cx="100" cy="95" r="20" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
            <path d="M91 95 L100 104 L112 88" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `,
    jeans: (color) => `
        <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M62 12 L138 12 L142 60 L150 200 L120 204 L106 92 L100 92 L94 92 L80 204 L50 200 L58 60 Z"
                fill="${color}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
            <line x1="62" y1="30" x2="138" y2="30" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
            <line x1="100" y1="92" x2="100" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
            <rect x="86" y="18" width="28" height="14" rx="2" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" fill="none"/>
        </svg>
    `,
    gorras: (color) => `
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 95 C40 55 66 30 100 30 C134 30 160 55 160 95 Z"
                fill="${color}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>
            <path d="M40 95 L168 95 C172 95 176 99 174 105 L168 112 C140 100 60 100 32 112 L26 105 C24 99 28 95 40 95 Z"
                fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
            <circle cx="100" cy="55" r="16" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none"/>
            <circle cx="100" cy="32" r="4" fill="rgba(255,255,255,0.2)"/>
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

    const generador = SVG_PRENDAS[producto.categoria] || SVG_PRENDAS.buzos;
    const color = producto.color || '#1c2f6e';
    return `
        <div class="prenda-placeholder">
            ${generador(color)}
            <span class="marca-sello">C&amp;E</span>
        </div>
    `;
}
