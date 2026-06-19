let productosContainer;
let botonesCategoria;
let searchInput;
let listaProductos = [];
let categoriaActivaActual = 'todos';

document.addEventListener("DOMContentLoaded", () => {
    productosContainer = document.getElementById("productos-container");
    botonesCategoria = document.querySelectorAll(".btn-categoria");
    searchInput = document.getElementById("search-input");

    cargarProductos();
    configurarFiltros();
    configurarBuscador();
    iniciarCarrusel();
    actualizarAdminLink();
});

function actualizarAdminLink() {
    const adminLink = document.querySelector('.admin-link');
    if (!adminLink) return;
    const isAdmin = localStorage.getItem('ceurbanAdmin') === 'true';
    if (isAdmin) {
        adminLink.classList.remove('hidden');
    } else {
        adminLink.classList.add('hidden');
    }
}

async function cargarProductos() {
    try {
        const respuesta = await fetch('data/productos.json');
        listaProductos = await respuesta.json();

        const filtroPagina = productosContainer ? productosContainer.dataset.categoriaFija : null;
        if (filtroPagina) {
            mostrarProductos(listaProductos.filter(p => p.categoria === filtroPagina));
        } else {
            mostrarProductos(listaProductos);
        }
    } catch (error) {
        console.error("Error cargando el catalogo:", error);
        if (productosContainer) {
            productosContainer.innerHTML = `<p style="color: var(--rojo-claro); grid-column: 1/-1; text-align: center; padding: 40px;">No se pudo cargar el catalogo. Intenta de nuevo en unos minutos.</p>`;
        }
    }
}

function mostrarProductos(productos) {
    if (!productosContainer) return;
    productosContainer.innerHTML = "";

    if (productos.length === 0) {
        productosContainer.innerHTML = `<p style="color: var(--gris); grid-column: 1/-1; text-align: center; padding: 40px;">No encontramos productos con esos filtros.</p>`;
        return;
    }

    productos.forEach(producto => {
        const card = document.createElement("article");
        card.classList.add("card");

        const isFavorite = typeof wishlist !== 'undefined' && wishlist.isInWishlist(producto.id);
        const placeholderHtml = typeof generarPlaceholderProducto === 'function'
            ? generarPlaceholderProducto(producto)
            : '';

        card.innerHTML = `
            <div class="card-img">
                ${placeholderHtml}
                <button class="wishlist-btn ${isFavorite ? 'active' : ''}" data-product-id="${producto.id}" title="Agregar a favoritos" style="position: absolute; top: 12px; left: 12px; z-index: 2; background: rgba(10,10,15,0.7); border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 14px;">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="card-body">
                <span class="categoria-tag">${producto.categoria}</span>
                <h4>${producto.nombre}</h4>
                <span class="precio">$${producto.precio.toLocaleString('es-CO')}</span>
                <div style="display: flex; gap: 8px;">
                    <button
                        class="btn-agregar add-cart"
                        data-name="${producto.nombre}"
                        data-id="${producto.id}"
                        data-price="${producto.precio}"
                        data-img="placeholder"
                        style="flex: 1;">
                        Agregar
                    </button>
                    <button
                        class="quick-view-btn"
                        data-product-id="${producto.id}"
                        title="Vista rapida"
                        style="flex: 0 0 44px; background: var(--negro-suave); border: 1px solid var(--gris-linea); color: var(--blanco); border-radius: 6px;">
                        👁
                    </button>
                </div>
            </div>
        `;

        const wishlistBtn = card.querySelector('.wishlist-btn');
        if (wishlistBtn && typeof wishlist !== 'undefined') {
            wishlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.currentTarget.dataset.productId);
                const product = listaProductos.find(p => p.id === productId);

                if (wishlist.isInWishlist(productId)) {
                    wishlist.removeFromWishlist(productId);
                    e.currentTarget.textContent = '🤍';
                    e.currentTarget.classList.remove('active');
                    if (typeof notifier !== 'undefined') notifier.info('Removido de favoritos');
                } else {
                    wishlist.addToWishlist(product);
                    e.currentTarget.textContent = '❤️';
                    e.currentTarget.classList.add('active');
                    if (typeof notifier !== 'undefined') notifier.success('Agregado a favoritos');
                }
            });
        }

        const quickViewBtn = card.querySelector('.quick-view-btn');
        if (quickViewBtn && typeof quickViewModal !== 'undefined') {
            quickViewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.currentTarget.dataset.productId);
                const product = listaProductos.find(p => p.id === productId);
                quickViewModal.open(product);
            });
        }

        productosContainer.appendChild(card);
    });
}

function configurarFiltros() {
    if (!botonesCategoria) return;
    botonesCategoria.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesCategoria.forEach(btn => btn.classList.remove('activa'));
            e.currentTarget.classList.add('activa');

            categoriaActivaActual = e.currentTarget.dataset.category;
            aplicarFiltrosCombinados();
        });
    });
}

function configurarBuscador() {
    if (!searchInput) return;
    searchInput.addEventListener("input", () => {
        aplicarFiltrosCombinados();
    });
}

function aplicarFiltrosCombinados() {
    let resultado = listaProductos;

    if (categoriaActivaActual !== 'todos') {
        resultado = resultado.filter(p => p.categoria === categoriaActivaActual);
    }

    const textoBusqueda = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (textoBusqueda !== '') {
        resultado = resultado.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
    }

    mostrarProductos(resultado);
}

function applyFilters() {
    const minPrice = parseInt(document.getElementById('min-price')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('max-price')?.value) || Infinity;

    let resultado = listaProductos.filter(p => p.precio >= minPrice && p.precio <= maxPrice);

    if (categoriaActivaActual !== 'todos') {
        resultado = resultado.filter(p => p.categoria === categoriaActivaActual);
    }

    mostrarProductos(resultado);
}

function applySort() {
    const sortValue = document.getElementById('sort-select')?.value;
    let resultado = [...listaProductos];

    if (categoriaActivaActual !== 'todos') {
        resultado = resultado.filter(p => p.categoria === categoriaActivaActual);
    }

    switch (sortValue) {
        case 'price-asc':
            resultado.sort((a, b) => a.precio - b.precio);
            break;
        case 'price-desc':
            resultado.sort((a, b) => b.precio - a.precio);
            break;
        case 'name-asc':
            resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'newest':
            resultado.sort((a, b) => b.id - a.id);
            break;
        default:
            break;
    }

    mostrarProductos(resultado);
}

function iniciarCarrusel(interval = 3000, visibleDesktop = 3) {
    const container = document.querySelector('.carrusel-contenedor');
    const track = document.querySelector('.carrusel-imagenes');
    if (!container || !track) return;

    let items = Array.from(track.querySelectorAll('.carrusel-item'));
    if (items.length === 0) return;

    let visible = window.innerWidth < 768 ? 1 : visibleDesktop;
    let index = 0;
    let itemWidth = 0;
    let autoTimer = null;

    function setup() {
        const clones = track.querySelectorAll('.clone-item');
        clones.forEach(c => c.remove());

        items = Array.from(track.querySelectorAll('.carrusel-item'));
        visible = window.innerWidth < 768 ? 1 : visibleDesktop;
        itemWidth = container.clientWidth / visible;

        items.forEach(it => {
            it.style.flex = `0 0 ${itemWidth}px`;
            it.style.width = `${itemWidth}px`;
        });

        for (let i = 0; i < visible; i++) {
            const clone = items[i].cloneNode(true);
            clone.classList.add('clone-item');
            clone.style.flex = `0 0 ${itemWidth}px`;
            clone.style.width = `${itemWidth}px`;
            track.appendChild(clone);
        }

        track.style.transition = 'none';
        index = 0;
        track.style.transform = `translateX(0px)`;
        void track.offsetWidth;
        track.style.transition = 'transform 0.6s ease';
    }

    function next() {
        index++;
        track.style.transform = `translateX(${-index * itemWidth}px)`;

        const totalOriginal = items.length;
        if (index >= totalOriginal) {
            setTimeout(() => {
                track.style.transition = 'none';
                index = 0;
                track.style.transform = `translateX(0px)`;
                void track.offsetWidth;
                track.style.transition = 'transform 0.6s ease';
            }, 620);
        }
    }

    function start() {
        stop();
        autoTimer = setInterval(next, interval);
    }

    function stop() {
        if (autoTimer) {
            clearInterval(autoTimer);
            autoTimer = null;
        }
    }

    let resizeTimer = null;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            setup();
        }, 150);
    }

    setup();
    start();

    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
    window.addEventListener('resize', onResize);
}

// La navegacion (menu hamburguesa y dropdown de Productos) vive en navegacion.js
// para que se comparta entre todas las paginas del sitio.
