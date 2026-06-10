const toast = document.querySelector(".toast");
const contador = document.getElementById("cart-count");
const cartItems = document.querySelector(".cart-items");
const total = document.getElementById("cart-total");
const cartIcon = document.querySelector(".cart-icon");
const cartPanel = document.querySelector(".cart-panel");
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
        cantidad = carrito.length;
        totalCompra = carrito.reduce((sum, item) => sum + (item.precio * (item.quantity || 1)), 0);
    }

    if(!contador || !total || !cartItems) return;
    contador.textContent = cantidad;
    total.textContent = `$${totalCompra.toLocaleString()}`;
    
    if (carrito.length > 0) {
        cartItems.innerHTML = "";
        carrito.forEach((prod, index) => {
            crearItemEnCarritoHTML(
                prod.nombre, 
                prod.precio, 
                prod.imagen, 
                index, 
                prod.id || index,
                prod.quantity || 1
            );
        });
    } else {
        cartItems.innerHTML = `<p class="empty-cart">Tu carrito está vacío</p>`;
    }
}

if(cartIcon) cartIcon.addEventListener("click", () => cartPanel.classList.add("active"));
if(closeCart) closeCart.addEventListener("click", () => cartPanel.classList.remove("active"));

if(clearCartBtn) clearCartBtn.addEventListener("click", () => {
    const confirmar = confirm('¿Deseas vaciar todo el carrito?');
    if (!confirmar) return;

    if (typeof cart !== 'undefined' && cart.clear) {
        cart.clear();
    } else {
        carrito = [];
        localStorage.setItem("carrito", JSON.stringify(carrito));
    }

    cantidad = 0;
    contador.textContent = cantidad;

    totalCompra = 0;
    if (total) total.textContent = `$0`;

    if (cartItems) cartItems.innerHTML = `<p class="empty-cart">Tu carrito está vacío</p>`;

    if (notifier) notifier.info('Carrito vaciado');
});

document.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("add-cart")) {
        const boton = e.target;

        const nombre = boton.dataset.name;
        const precio = parseInt(boton.dataset.price);
        const imagen = boton.dataset.img;
        const id = parseInt(boton.dataset.id) || Date.now();

        if (typeof cart !== 'undefined' && cart.addItem) {
            const product = { id, nombre, precio, imagen };
            cart.addItem(product, 1);
            updateCartUI();
        } else {
            carrito.push({ id, nombre, precio, imagen, quantity: 1 });
            localStorage.setItem("carrito", JSON.stringify(carrito));

            cantidad++;
            contador.textContent = cantidad;
            totalCompra += precio;
            total.textContent = `$${totalCompra.toLocaleString()}`;

            const emptyCart = document.querySelector(".empty-cart");
            if(emptyCart) emptyCart.remove();

            crearItemEnCarritoHTML(nombre, precio, imagen, carrito.length - 1, id, 1);
        }

        if (notifier) {
            notifier.success(`${nombre} agregado al carrito`);
        } else if (toast) {
            toast.textContent = `${nombre} agregado al carrito ✅`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2500);
        }
    }
});

function crearItemEnCarritoHTML(nombre, precio, imagen, index, productId = index, quantity = 1) {
    const item = document.createElement("div");
    item.classList.add("cart-item");
    item.setAttribute("data-index", index);
    item.setAttribute("data-product-id", productId);
    
    item.innerHTML = `
        <img src="${imagen}" alt="${nombre}">
        <div style="flex: 1;">
            <h4 style="margin: 0; color: white;">${nombre}</h4>
            <p style="margin: 4px 0 0 0; color: #ccc;">$${precio.toLocaleString()}</p>
        </div>
        <div class="item-qty" style="display: flex; gap: 4px; align-items: center;">
            <button class="qty-decrease" data-product-id="${productId}" style="width: 24px; height: 24px; background: #ff6600; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;">-</button>
            <span class="qty-display" style="min-width: 30px; text-align: center;">${quantity}</span>\n            <button class="qty-increase" data-product-id="${productId}" style="width: 24px; height: 24px; background: #ff6600; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 12px;\">+</button>\n        </div>\n        <button class="remove-item" data-product-id="${productId}" style="background: #f44336; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;\">🗑️</button>
    `;

    cartItems.appendChild(item);

    item.querySelector(".qty-decrease").addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = parseInt(e.target.dataset.productId);
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
        const pId = parseInt(e.target.dataset.productId);
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

    item.querySelector(".remove-item").addEventListener("click", (e) => {
        e.stopPropagation();
        const pId = parseInt(e.target.dataset.productId);
        if (typeof cart !== 'undefined' && cart.removeItem) {
            cart.removeItem(pId);
            updateCartUI();
        } else {
            const idx = carrito.findIndex(p => p.id === pId);
            if (idx !== -1) {
                totalCompra -= carrito[idx].precio * (carrito[idx].quantity || 1);
                carrito.splice(idx, 1);
                localStorage.setItem("carrito", JSON.stringify(carrito));
                actualizarInterfazInicial();
            }
        }
        
        if (notifier) {
            notifier.info('Producto removido del carrito');
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarInterfazInicial();
    window.addEventListener('storage', actualizarInterfazInicial);
});