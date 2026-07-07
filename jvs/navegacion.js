// Logica de navegacion compartida por TODAS las paginas:
// menu hamburguesa movil y dropdown de Productos por click.

function actualizarMenuProductos() {
    const dropdownContent = document.querySelector('.dropdown-content');
    if (!dropdownContent) return;

    if (dropdownContent.querySelector('.submenu-container')) return;

    const camisetasSubmenu = document.createElement('div');
    camisetasSubmenu.className = 'submenu-container';
    camisetasSubmenu.innerHTML = `
        <a href="#" class="submenu-trigger">Camisetas <span class="trigger-arrow">›</span></a>
        <div class="submenu">
            <a href="camisetas-hombres.html">Hombre</a>
            <a href="camisetas-damas.html">Dama</a>
        </div>`;
    dropdownContent.appendChild(camisetasSubmenu);

    const trigger = camisetasSubmenu.querySelector('.submenu-trigger');
    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.submenu-container.abierto').forEach(container => {
            if (container !== camisetasSubmenu) container.classList.remove('abierto');
        });
        camisetasSubmenu.classList.toggle('abierto');
    });
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
    insertarMediosDePago();
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

// Barra de medios de pago encima del copyright.
function insertarMediosDePago() {
    const barra = document.createElement('div');
    barra.className = 'pagos-bar';
    barra.innerHTML = `
        <span class="pagos-label">Medios de pago</span>
        <div class="pagos-iconos">
            <div class="pago-badge visa">VISA</div>
            <div class="pago-badge mastercard">
                <span class="mc-red"></span>
                <span class="mc-orange"></span>
            </div>
            <div class="pago-badge nequi">nequi</div>
            <div class="pago-badge daviplata">daviplata</div>
        </div>
    `;
    const copyright = document.querySelector('.copyright');
    if (copyright) copyright.parentNode.insertBefore(barra, copyright);
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
// Menu dinamico segun sesion del cliente
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('ceurbanUser') || 'null');
    const linkNosotros = document.querySelector('a[href*="nosotros"]')?.closest('li') 
                      || document.querySelector('a[href*="nosotros"]');

    if (usuario && usuario.nombre) {
        // Logueado: "Nosotros" se convierte en "Mis compras"
        if (linkNosotros) {
            const enlace = linkNosotros.querySelector('a') || linkNosotros;
            enlace.textContent = '🛍️ Mis compras';
            enlace.setAttribute('href', 'cuenta.html');
        }
    } else {
        // No logueado: agregar enlace de iniciar sesion si no existe
        const menu = document.querySelector('nav ul');
        if (menu && !document.querySelector('a[href*="cuenta.html"]')) {
            const li = document.createElement('li');
            li.innerHTML = '<a href="cuenta.html">Iniciar sesión</a>';
            menu.appendChild(li);
        }
    }
});