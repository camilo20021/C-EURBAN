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
});
