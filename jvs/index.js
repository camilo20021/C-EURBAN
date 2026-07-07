let productosContainer;
let botonesCategoria;
let searchInput;
let listaProductos = [];
let listaBase = [];
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

const SUPABASE_URL = 'https://vtztpvjbhwlnspjpwhim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_FdF3E71-r0Ku4NVb-uSN7A_yNvIiTqv';

async function cargarProductos() {
    try {
        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/productos?select=*&order=creado_en.desc`,
            { headers: { apikey: SUPABASE_KEY } }
        );

        // Convertir tallas de texto ('S,M,L') a lista (['S','M','L'])
        listaProductos = (await respuesta.json()).map(p => ({
            ...p,
            tallas: typeof p.tallas === 'string'
                ? p.tallas.split(',').map(t => t.trim())
                : (p.tallas || [])
        }));

        // Si la pagina tiene categoria fija (ej: buzos.html), filtrar desde el inicio
        const categoriaPagina = productosContainer?.dataset.categoriaFija || productosContainer?.dataset.category;
        if (categoriaPagina && categoriaPagina !== 'todos') {
            categoriaActivaActual = categoriaPagina;
            listaBase = listaProductos.filter(p => p.categoria === categoriaPagina);
        } else {
            listaBase = listaProductos;
        }

        if (productosContainer) {
            mostrarProductos(listaBase, productosContainer);
        }

        // Grids extra (ej: seccion damas en el index)
        document.querySelectorAll('.productos-grid[data-extra]').forEach(grid => {
            const cat = grid.dataset.categoriaFija;
            const soloD = grid.dataset.soloDestacados === 'true';
            const lim = parseInt(grid.dataset.limite) || Infinity;
            let base = cat ? listaProductos.filter(p => p.categoria === cat) : listaProductos;
            if (soloD) base = base.filter(p => p.destacado === true);
            if (isFinite(lim)) base = base.slice(0, lim);
            mostrarProductos(base, grid);
        });

    } catch (error) {
        console.error("Error cargando el catalogo:", error);
        if (productosContainer) {
            productosContainer.innerHTML = `<p style="color: var(--rojo-claro); grid-column: 1/-1; text-align: center; padding: 40px;">No se pudo cargar el catalogo. Intenta de nuevo en unos minutos.</p>`;
        }
    }
}

function mostrarProductos(productos, contenedor = productosContainer) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor.innerHTML = `<p style="color: var(--gris); grid-column: 1/-1; text-align: center; padding: 40px;">No encontramos productos con esos filtros.</p>`;
        return;
    }

    // Agrupar productos por campo 'grupo'
    const gruposMap = {};
    const renderizados = new Set();

    productos.forEach(p => {
        if (p.grupo) {
            if (!gruposMap[p.grupo]) gruposMap[p.grupo] = [];
            gruposMap[p.grupo].push(p);
        }
    });

    productos.forEach(producto => {
        if (producto.grupo) {
            if (renderizados.has(producto.grupo)) return;
            renderizados.add(producto.grupo);
            contenedor.appendChild(crearCardGrupo(gruposMap[producto.grupo]));
        } else {
            contenedor.appendChild(crearCardSimple(producto));
        }
    });
}

function buildWishlistHandler(card, getProductId) {
    const btn = card.querySelector('.wishlist-btn');
    if (!btn || typeof wishlist === 'undefined') return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = getProductId();
        const product = listaProductos.find(p => p.id === productId);
        if (wishlist.isInWishlist(productId)) {
            wishlist.removeFromWishlist(productId);
            btn.textContent = '🤍';
            btn.classList.remove('active');
            if (typeof notifier !== 'undefined') notifier.info('Removido de favoritos');
        } else {
            wishlist.addToWishlist(product);
            btn.textContent = '❤️';
            btn.classList.add('active');
            if (typeof notifier !== 'undefined') notifier.success('Agregado a favoritos');
        }
    });
}

function buildTallaHandler(card, addBtn) {
    card.querySelectorAll('.talla-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            card.querySelectorAll('.talla-chip').forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            addBtn.dataset.talla = e.currentTarget.dataset.talla;
        });
    });
}

// Card simple: un producto con una imagen, selector de talla
// Card simple: un producto con una imagen, selector de talla
function crearCardSimple(producto) {
    const card = document.createElement("article");
    card.classList.add("card");

    const agotado = (producto.stock ?? 1) <= 0;
    if (agotado) card.classList.add("agotado");

    const isFavorite = typeof wishlist !== 'undefined' && wishlist.isInWishlist(producto.id);
    const tallas = producto.tallas || [];
    const soloUnaTalla = tallas.length <= 1;
    const tallaDefecto = tallas.length > 1 ? (tallas[1] || tallas[0]) : (tallas[0] || '');

    const imagenHTML = typeof generarPlaceholderProducto === 'function'
        ? generarPlaceholderProducto(producto)
        : `<div class="prenda-placeholder foto-real"><img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy"></div>`;

    const tallasHTML = (!soloUnaTalla && !agotado) ? `
        <div class="card-tallas">
            ${tallas.map(t => `<button class="talla-chip${t === tallaDefecto ? ' active' : ''}" data-talla="${t}">${t}</button>`).join('')}
        </div>` : '';

    card.innerHTML = `
        <div class="card-img">
            ${imagenHTML}
            ${agotado ? '<span class="badge-agotado">AGOTADO</span>' : ''}
            <button class="wishlist-btn ${isFavorite ? 'active' : ''}" data-product-id="${producto.id}" title="Agregar a favoritos" style="position:absolute;top:12px;left:12px;z-index:2;background:rgba(10,10,15,0.7);border:none;border-radius:50%;width:32px;height:32px;font-size:14px;">
                ${isFavorite ? '❤️' : '🤍'}
            </button>
        </div>
        <div class="card-body">
            <span class="categoria-tag">${producto.categoria}</span>
            <h4>${producto.nombre}</h4>
            <span class="precio">$${producto.precio.toLocaleString('es-CO')}</span>
            ${tallasHTML}
            <button
                class="btn-agregar add-cart"
                data-name="${producto.nombre}"
                data-id="${producto.id}"
                data-price="${producto.precio}"
                data-talla="${tallaDefecto}"
                data-img="${producto.imagen}"
                style="width:100%;"
                ${agotado ? 'disabled' : ''}>
                ${agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
        </div>
    `;

    const addBtn = card.querySelector('.add-cart');
    buildTallaHandler(card, addBtn);
    buildWishlistHandler(card, () => producto.id);

    return card;
}
// Card agrupada: varias variantes de color, selector de color + talla
function crearCardGrupo(variantes) {
    const card = document.createElement("article");
    card.classList.add("card");

    const primera = variantes[0];
    const isFavorite = typeof wishlist !== 'undefined' && wishlist.isInWishlist(primera.id);
    const tallas = primera.tallas || [];
    const soloUnaTalla = tallas.length <= 1;
    const tallaDefecto = tallas.length > 1 ? (tallas[1] || tallas[0]) : (tallas[0] || '');

    const swatchesHTML = variantes.map((v, i) => `
        <button class="color-swatch${i === 0 ? ' active' : ''}"
            data-img="${v.imagen}"
            data-nombre="${v.colorNombre}"
            data-id="${v.id}"
            data-price="${v.precio}"
            data-fullname="${v.nombre}"
            style="background:${v.color};"
            title="${v.colorNombre}">
        </button>`).join('');

    const tallasHTML = !soloUnaTalla ? `
        <div class="card-tallas">
            ${tallas.map(t => `<button class="talla-chip${t === tallaDefecto ? ' active' : ''}" data-talla="${t}">${t}</button>`).join('')}
        </div>` : '';

    card.innerHTML = `
        <div class="card-img">
            <div class="prenda-placeholder foto-real">
                <img src="${primera.imagen}" alt="${primera.grupo}" loading="lazy" class="card-img-display">
            </div>
            <button class="wishlist-btn ${isFavorite ? 'active' : ''}" title="Agregar a favoritos" style="position:absolute;top:12px;left:12px;z-index:2;background:rgba(10,10,15,0.7);border:none;border-radius:50%;width:32px;height:32px;font-size:14px;">
                ${isFavorite ? '❤️' : '🤍'}
            </button>
        </div>
        <div class="card-body">
            <span class="categoria-tag">${primera.categoria}</span>
            <h4>${primera.grupo}</h4>
            <span class="precio">$${primera.precio.toLocaleString('es-CO')}</span>
            <div class="card-colores">
                <span class="colores-label">Color: <strong class="color-nombre-actual">${primera.colorNombre}</strong></span>
                <div class="colores-swatches">${swatchesHTML}</div>
            </div>
            ${tallasHTML}
            <button
                class="btn-agregar add-cart"
                data-name="${primera.nombre}"
                data-id="${primera.id}"
                data-price="${primera.precio}"
                data-talla="${tallaDefecto}"
                data-img="${primera.imagen}"
                style="width:100%;">
                Agregar al carrito
            </button>
        </div>
    `;

    const imgDisplay = card.querySelector('.card-img-display');
    const colorNombreEl = card.querySelector('.color-nombre-actual');
    const addBtn = card.querySelector('.add-cart');

    card.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            card.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const { img, nombre, id, price, fullname } = e.currentTarget.dataset;
            if (imgDisplay) imgDisplay.src = img;
            if (colorNombreEl) colorNombreEl.textContent = nombre;
            addBtn.dataset.id = id;
            addBtn.dataset.price = price;
            addBtn.dataset.name = fullname;
            addBtn.dataset.img = img;
        });
    });

    buildTallaHandler(card, addBtn);
    buildWishlistHandler(card, () => parseInt(addBtn.dataset.id));

    return card;
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
    let resultado = listaBase;

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

    let resultado = listaBase.filter(p => p.precio >= minPrice && p.precio <= maxPrice);

    if (categoriaActivaActual !== 'todos') {
        resultado = resultado.filter(p => p.categoria === categoriaActivaActual);
    }

    mostrarProductos(resultado);
}

function applySort() {
    const sortValue = document.getElementById('sort-select')?.value;
    let resultado = [...listaBase];

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
    document.querySelectorAll('.carrusel-contenedor').forEach(container => {
        iniciarUnCarrusel(container, interval, visibleDesktop);
    });
}

function iniciarUnCarrusel(container, interval, visibleDesktop) {
    const track = container.querySelector('.carrusel-imagenes');
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