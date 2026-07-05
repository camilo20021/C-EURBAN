const toastEl = document.querySelector(".toast");
const contador = document.getElementById("cart-count");
const cartItems = document.querySelector(".cart-items");
const totalEl = document.getElementById("cart-total");
const cartIcon = document.querySelector(".cart-icon");
const cartPanel = document.querySelector(".cart-panel");
const cartOverlay = document.querySelector(".cart-overlay");
const closeCart = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");

let carrito = [];
let cantidad = 0;
let totalCompra = 0;

function actualizarInterfazInicial() {
    if (typeof cart !== 'undefined' && cart.getCart) {
        carrito = cart.getCart();
        cantidad = cart.getItemCount();
        totalCompra = cart.getTotal();
    } else {
        carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        cantidad = carrito.reduce((sum, item) => sum + (item.quantity || 1), 0);
        totalCompra = carrito.reduce((sum, item) => sum + (item.precio * (item.quantity || 1)), 0);
    }

    if (!contador || !totalEl || !cartItems) return;
    contador.textContent = cantidad;
    totalEl.textContent = `$${totalCompra.toLocaleString('es-CO')}`;

    cartItems.innerHTML = "";
    if (carrito.length > 0) {
        carrito.forEach((prod, index) => {
            crearItemEnCarritoHTML(
                prod.nombre,
                prod.precio,
                prod.color || '#1c2f6e',
                index,
                prod.id || index,
                prod.quantity || 1,
                prod.talla || null,
                prod.imagen || null
            );
        });
    } else {
        cartItems.innerHTML = `<p class="empty-cart">Tu carrito esta vacio</p>`;
    }
}

function abrirCarrito() {
    if (cartPanel) cartPanel.classList.add("open");
    if (cartOverlay) cartOverlay.classList.add("open");
}

function cerrarCarrito() {
    if (cartPanel) cartPanel.classList.remove("open");
    if (cartOverlay) cartOverlay.classList.remove("open");
}

if (cartIcon) cartIcon.addEventListener("click", abrirCarrito);
if (closeCart) closeCart.addEventListener("click", cerrarCarrito);
if (cartOverlay) cartOverlay.addEventListener("click", cerrarCarrito);

if (clearCartBtn) clearCartBtn.addEventListener("click", () => {
    const confirmar = confirm('¿Deseas vaciar todo el carrito?');
    if (!confirmar) return;

    if (typeof cart !== 'undefined' && cart.clear) {
        cart.clear();
    } else {
        carrito = [];
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    actualizarInterfazInicial();

    if (typeof notifier !== 'undefined') notifier.info('Carrito vaciado');
});

document.addEventListener("click", (e) => {
    const boton = e.target.closest(".add-cart");
    if (!boton) return;

    const nombre = boton.dataset.name;
    const precio = parseInt(boton.dataset.price);
    const id = parseInt(boton.dataset.id) || Date.now();
    const talla = boton.dataset.talla || null;
    const imagen = boton.dataset.img || null;
    const productoCompleto = (typeof listaProductos !== 'undefined') ? listaProductos.find(p => p.id === id) : null;
    const color = productoCompleto ? productoCompleto.color : '#1c2f6e';
    const imagenFinal = imagen || (productoCompleto ? productoCompleto.imagen : null);

    if (typeof cart !== 'undefined' && cart.addItem) {
        const product = { id, nombre, precio, color, talla, imagen: imagenFinal };
        cart.addItem(product, 1);
    } else {
        const existente = carrito.find(p => p.id === id && p.talla === talla);
        if (existente) {
            existente.quantity = (existente.quantity || 1) + 1;
        } else {
            carrito.push({ id, nombre, precio, color, talla, imagen: imagenFinal, quantity: 1 });
        }
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    actualizarInterfazInicial();
    abrirCarrito();

    if (typeof notifier !== 'undefined') {
        notifier.success(`${nombre} agregado al carrito`);
    } else if (toastEl) {
        toastEl.textContent = `${nombre} agregado al carrito`;
        toastEl.classList.add('mostrar');
        setTimeout(() => toastEl.classList.remove('mostrar'), 2500);
    }
});

function updateCartUI() {
    actualizarInterfazInicial();
}

function crearItemEnCarritoHTML(nombre, precio, color, index, productId = index, quantity = 1, talla = null, imagen = null) {
    const item = document.createElement("div");
    item.classList.add("cart-item");
    item.setAttribute("data-index", index);
    item.setAttribute("data-product-id", productId);

    const thumbHTML = imagen
        ? `<div class="cart-item-thumb"><img src="${imagen}" alt="${nombre}"></div>`
        : `<div class="cart-item-thumb" style="background:${color};"></div>`;

    item.innerHTML = `
        ${thumbHTML}
        <div class="cart-item-info">
            <h4>${nombre}</h4>
            ${talla ? `<span class="cart-item-talla">Talla: ${talla}</span>` : ''}
            <span class="precio">$${precio.toLocaleString('es-CO')}</span>
            <div class="cart-item-qty">
                <button class="qty-decrease" data-product-id="${productId}">-</button>
                <span class="qty-display">${quantity}</span>
                <button class="qty-increase" data-product-id="${productId}">+</button>
            </div>
        </div>
        <button class="cart-item-remove" data-product-id="${productId}" title="Quitar">✕</button>
    `;

    cartItems.appendChild(item);

    item.querySelector(".qty-decrease").addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = parseInt(e.currentTarget.dataset.productId);
        if (typeof cart !== 'undefined' && cart.getCart) {
            const cartItem = cart.cart.find(p => p.id === pId);
            if (cartItem && cartItem.quantity > 1) {
                cart.updateQuantity(pId, cartItem.quantity - 1);
                updateCartUI();
            }
        } else {
            const cartItem = carrito.find(p => p.id === pId);
            if (cartItem && cartItem.quantity > 1) {
                cartItem.quantity--;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarInterfazInicial();
            }
        }
    });

    item.querySelector(".qty-increase").addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = parseInt(e.currentTarget.dataset.productId);
        if (typeof cart !== 'undefined' && cart.getCart) {
            const cartItem = cart.cart.find(p => p.id === pId);
            if (cartItem) {
                cart.updateQuantity(pId, cartItem.quantity + 1);
                updateCartUI();
            }
        } else {
            const cartItem = carrito.find(p => p.id === pId);
            if (cartItem) {
                cartItem.quantity++;
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarInterfazInicial();
            }
        }
    });

    item.querySelector(".cart-item-remove").addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = parseInt(e.currentTarget.dataset.productId);
        if (typeof cart !== 'undefined' && cart.removeItem) {
            cart.removeItem(pId);
            updateCartUI();
        } else {
            const idx = carrito.findIndex(p => p.id === pId);
            if (idx !== -1) {
                carrito.splice(idx, 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarInterfazInicial();
            }
        }

        if (typeof notifier !== 'undefined') notifier.info('Producto removido del carrito');
    });
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarInterfazInicial();
    window.addEventListener('storage', actualizarInterfazInicial);
});
