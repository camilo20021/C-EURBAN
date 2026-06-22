// Logica de navegacion compartida por TODAS las paginas:
// menu hamburguesa movil y dropdown de Productos por click.
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
