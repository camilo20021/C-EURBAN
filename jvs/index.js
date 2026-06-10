let productosContainer;
let botonesCategoria;
let searchInput;
let listaProductos = [];

document.addEventListener("DOMContentLoaded", () => {
    productosContainer = document.getElementById("productos-container");
    botonesCategoria = document.querySelectorAll(".btn-categoria");
    searchInput = document.getElementById("search-input");
    
    cargarProductos();
    configurarFiltros();
    configurarBuscador();
    iniciarCarrusel();
    configurarMenuHamburguesa();
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
        mostrarProductos(listaProductos);
    } catch (error) {
        console.error("Error cargando el JSON:", error);
        if(productosContainer) {
            productosContainer.innerHTML = `<p style="color: red; grid-column: 1/-1; text-align: center;">Error al conectar con el catálogo.</p>`;
        }
    }
}

function mostrarProductos(productos) {
    if (!productosContainer) return;
    productosContainer.innerHTML = "";

    if (productos.length === 0) {
        productosContainer.innerHTML = `<p style="color: #999; grid-column: 1/-1; text-align: center;">No se encontraron productos.</p>`;
        return;
    }

    productos.forEach(producto => {
        const card = document.createElement("article");
        card.classList.add("card");
        
        const isFavorite = wishlist && wishlist.isInWishlist(producto.id);
        
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <button class="wishlist-btn ${isFavorite ? 'active' : ''}" data-product-id="${producto.id}" title="Agregar a favoritos" style="position: absolute; top: 12px; left: 12px;">
                    ${isFavorite ? '❤️' : '🤍'}
                </button>
            </div>
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString()}</p>
            <div style="display: flex; gap: 8px;">
                <button 
                    class="add-cart" 
                    data-name="${producto.nombre}" 
                    data-id="${producto.id}"
                    data-price="${producto.precio}" 
                    data-img="${producto.imagen_carrito}"
                    style="flex: 1;">
                    🛒 Agregar
                </button>
                <button 
                    class="quick-view-btn" 
                    data-product-id="${producto.id}"
                    title="Vista rápida"
                    style="flex: 0 0 44px; background: rgba(255,102,0,0.2); border: 1px solid #ff6600; color: #ff6600; border-radius: 6px; cursor: pointer;">
                    👁️
                </button>
            </div>
        `;
        
        const wishlistBtn = card.querySelector('.wishlist-btn');
        if (wishlistBtn && wishlist) {
            wishlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = parseInt(e.target.dataset.productId);
                const product = listaProductos.find(p => p.id === productId);
                
                if (wishlist.isInWishlist(productId)) {
                    wishlist.removeFromWishlist(productId);
                    e.target.textContent = '🤍';
                    e.target.classList.remove('active');
                    notifier.info('Removido de favoritos');
                } else {
                    wishlist.addToWishlist(product);
                    e.target.textContent = '❤️';
                    e.target.classList.add('active');
                    notifier.success('Agregado a favoritos');
                }
            });
        }
        
        productosContainer.appendChild(card);
    });
}

function configurarFiltros() {
    if(!botonesCategoria) return;
    botonesCategoria.forEach(boton => {
        boton.addEventListener("click", (e) => {
            botonesCategoria.forEach(btn => btn.style.background = "rgba(255,255,255,0.05)");
            e.target.style.background = "#ff6600";

            const categoriaSeleccionada = e.target.dataset.category;

            if (categoriaSeleccionada === "todos") {
                mostrarProductos(listaProductos);
            } else {
                const productosFiltrados = listaProductos.filter(prod => prod.categoria === categoriaSeleccionada);
                mostrarProductos(productosFiltrados);
            }
        });
    });
}

function configurarBuscador() {
    if(!searchInput) return;
    searchInput.addEventListener("input", (e) => {
        const textoBusqueda = e.target.value.toLowerCase().trim();

        if (textoBusqueda === "") {
            mostrarProductos(listaProductos);
            return;
        }

        const productosFiltrados = listaProductos.filter(producto => {
            return producto.nombre.toLowerCase().includes(textoBusqueda);
        });

        mostrarProductos(productosFiltrados);
    });
}

function iniciarCarrusel(interval = 2500, visibleDesktop = 3) {
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

function configurarMenuHamburguesa() {
    const toggle = document.querySelector('.menu-toggle');
    const header = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.navbar a');
    if (!toggle || !header) return;

    toggle.addEventListener('click', () => {
        header.classList.toggle('open');
        toggle.textContent = header.classList.contains('open') ? '✖' : '☰';
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (header.classList.contains('open')) {
                header.classList.remove('open');
                toggle.textContent = '☰';
            }
        });
    });
}