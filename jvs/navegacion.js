// Logica de navegacion compartida por TODAS las paginas:
// menu hamburguesa movil y dropdown de Productos por click.

/**
 * Actualiza dinámicamente el menú de productos para reflejar las categorías correctas.
 * Reemplaza 'Jeans' por 'Camisetas' con submenús para 'Hombre' y 'Dama'.
 */
function actualizarMenuProductos() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (!dropdownContent) return;

    // Busca el enlace de 'Jeans' para reemplazarlo.
    const linkJeans = Array.from(dropdownContent.querySelectorAll('a')).find(a => a.textContent.trim() === 'Jeans');

    if (linkJeans) {
        // Crea el nuevo elemento de menú para 'Camisetas' con un submenú.
        const camisetasSubmenu = document.createElement('div');
        camisetasSubmenu.className = 'submenu-container'; // Clase para estilizar si es necesario.
        // Se cambia el href del enlace principal para que no navegue, solo despliegue.
        camisetasSubmenu.innerHTML = `
            <a href="#" class="submenu-trigger">Camisetas</a>
            <div class="submenu">
                <a href="productos.html?categoria=camisetas-caballeros">Hombre</a>
                <a href="productos.html?categoria=camisetas-damas">Dama</a>
            </div>`;
        linkJeans.replaceWith(camisetasSubmenu);

        // Lógica para desplegar el submenú al hacer clic
        const trigger = camisetasSubmenu.querySelector('.submenu-trigger');
        const submenu = camisetasSubmenu.querySelector('.submenu');

        trigger.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que el enlace navegue
            e.stopPropagation(); // Evita que el menú principal se cierre

            // Cierra otros submenús si los hubiera
            document.querySelectorAll('.submenu-container.abierto').forEach(container => {
                if (container !== camisetasSubmenu) container.classList.remove('abierto');
            });

            camisetasSubmenu.classList.toggle('abierto');
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');

    if (dropdown && dropbtn) {
        dropbtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropdown.classList.toggle('abierto');
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('abierto');
            }
        });

        // Cierra el submenú de camisetas si se hace clic en sus enlaces
        dropdown.addEventListener('click', (e) => {
            if (e.target.closest('.submenu a')) {
                dropdown.classList.remove('abierto');
            }
        });

        dropdown.querySelectorAll('.dropdown-content a').forEach(link => {
            link.addEventListener('click', () => {
                dropdown.classList.remove('abierto');
            });
        });
    }

    const toggle = document.querySelector('.menu-toggle');
    const navbar = document.querySelector('.navbar');
    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('abierto');
            toggle.textContent = navbar.classList.contains('abierto') ? '✖' : '☰';
        });

        navbar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navbar.classList.contains('abierto')) {
                    navbar.classList.remove('abierto');
                    toggle.textContent = '☰';
                }
            });
        });
    }

    actualizarMenuProductos();
    insertarBarraDeAnuncios();
    insertarWhatsappYVolverArriba();
    configurarFaq();
});

// Barra de anuncios fija arriba de todas las paginas (mismo mensaje en todo el sitio).
function insertarBarraDeAnuncios() {
    const barra = document.createElement('div');
    barra.className = 'promo-bar';
    barra.innerHTML = `
        <span>🚚 Envios a toda Colombia</span>
        <span>⭐ Calidad real, hecho para durar</span>
        <span>💬 Coordinamos tu pedido por WhatsApp</span>
    `;
    document.body.insertBefore(barra, document.body.firstChild);
}

// Boton flotante de WhatsApp (mismo numero que usa el resto del sitio) y boton de volver arriba.
function insertarWhatsappYVolverArriba() {
    const whatsapp = document.createElement('a');
    whatsapp.href = 'https://wa.me/573142921523?text=' + encodeURIComponent('Hola C&E Urban Wear, tengo una pregunta.');
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener';
    whatsapp.className = 'whatsapp-flotante';
    whatsapp.title = 'Escribenos por WhatsApp';
    whatsapp.textContent = '💬';
    document.body.appendChild(whatsapp);

    const arriba = document.createElement('button');
    arriba.className = 'volver-arriba';
    arriba.title = 'Volver arriba';
    arriba.textContent = '↑';
    arriba.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(arriba);

    window.addEventListener('scroll', () => {
        arriba.classList.toggle('visible', window.scrollY > 400);
    });
}

// Acordeon de preguntas frecuentes (si la pagina actual tiene una seccion .faq).
function configurarFaq() {
    document.querySelectorAll('.faq-item').forEach(item => {
        const pregunta = item.querySelector('.faq-pregunta');
        const respuesta = item.querySelector('.faq-respuesta');
        if (!pregunta || !respuesta) return;

        pregunta.addEventListener('click', () => {
            const abierto = item.classList.toggle('abierto');
            respuesta.style.maxHeight = abierto ? respuesta.scrollHeight + 'px' : null;
        });
    });
}
