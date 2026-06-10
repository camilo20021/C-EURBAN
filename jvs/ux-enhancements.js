
class QuickViewModal {
    constructor() {
        this.modalHTML = `
            <div class="quick-view-modal" id="quick-view-modal">
                <div class="modal-content">
                    <button class="close-modal">&times;</button>
                    <div class="modal-body">
                        <div class="modal-images">
                            <img id="modal-main-image" src="" alt="Producto">
                        </div>
                        <div class="modal-info">
                            <h2 id="modal-product-name"></h2>
                            <div class="modal-rating">
                                <span id="modal-rating-stars">⭐⭐⭐⭐⭐</span>
                                <span id="modal-rating-count">(0 reseñas)</span>
                            </div>
                            <div class="modal-price-section">
                                <p class="modal-price" id="modal-product-price"></p>
                                <span class="badge-discount" id="modal-discount" style="display:none;"></span>
                            </div>
                            <p id="modal-product-description" class="modal-description"></p>
                            <div class="modal-stock">
                                <span id="modal-stock-status">En Stock</span>
                            </div>
                            <div class="modal-actions">
                                <div class="quantity-selector">
                                    <button class="qty-btn" id="qty-minus">-</button>
                                    <input type="number" id="modal-quantity" value="1" min="1">
                                    <button class="qty-btn" id="qty-plus">+</button>
                                </div>
                                <button class="modal-add-cart-btn">Agregar al Carrito</button>
                                <button class="modal-wishlist-btn">❤️ Favorito</button>
                            </div>
                            <div class="modal-benefits">
                                <p>✓ Envío gratis en compras mayores a $150.000</p>
                                <p>✓ Devolución gratis en 30 días</p>
                                <p>✓ Garantía de satisfacción</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.init();
    }

    init() {
        if (!document.getElementById('quick-view-modal')) {
            document.body.insertAdjacentHTML('beforeend', this.modalHTML);
        }
        
        this.modal = document.getElementById('quick-view-modal');
        this.setupListeners();
    }

    setupListeners() {
        const closeBtn = this.modal.querySelector('.close-modal');
        const addCartBtn = this.modal.querySelector('.modal-add-cart-btn');
        const wishlistBtn = this.modal.querySelector('.modal-wishlist-btn');
        const qtyPlus = this.modal.querySelector('#qty-plus');
        const qtyMinus = this.modal.querySelector('#qty-minus');
        const qtyInput = this.modal.querySelector('#modal-quantity');

        closeBtn.addEventListener('click', () => this.close());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        addCartBtn.addEventListener('click', () => this.addToCart());
        wishlistBtn.addEventListener('click', () => this.toggleWishlist());
        qtyPlus.addEventListener('click', () => this.changeQuantity(1));
        qtyMinus.addEventListener('click', () => this.changeQuantity(-1));
        qtyInput.addEventListener('change', (e) => {
            if (e.target.value < 1) e.target.value = 1;
        });
    }

    open(product) {
        this.currentProduct = product;
        
        this.modal.querySelector('#modal-main-image').src = product.imagen;
        this.modal.querySelector('#modal-product-name').textContent = product.nombre;
        this.modal.querySelector('#modal-product-price').textContent = `$${product.precio.toLocaleString()}`;
        this.modal.querySelector('#modal-quantity').value = '1';

        const wishlistBtn = this.modal.querySelector('.modal-wishlist-btn');
        if (wishlist.isInWishlist(product.id)) {
            wishlistBtn.style.background = '#ff6600';
        } else {
            wishlistBtn.style.background = '';
        }

        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    changeQuantity(change) {
        const input = this.modal.querySelector('#modal-quantity');
        let newValue = parseInt(input.value) + change;
        if (newValue < 1) newValue = 1;
        input.value = newValue;
    }

    addToCart() {
        const quantity = parseInt(this.modal.querySelector('#modal-quantity').value);
        cart.addItem(this.currentProduct, quantity);
        notifier.success(`${this.currentProduct.nombre} agregado al carrito`);
        updateCartUI();
        this.close();
    }

    toggleWishlist() {
        const wishlistBtn = this.modal.querySelector('.modal-wishlist-btn');
        if (wishlist.isInWishlist(this.currentProduct.id)) {
            wishlist.removeFromWishlist(this.currentProduct.id);
            wishlistBtn.style.background = '';
            notifier.info('Removido de favoritos');
        } else {
            wishlist.addToWishlist(this.currentProduct);
            wishlistBtn.style.background = '#ff6600';
            notifier.success('Agregado a favoritos');
        }
    }
}

class AnimationManager {
    static addAnimation(element, animationName, duration = 600) {
        element.style.animation = `${animationName} ${duration}ms ease forwards`;
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }

    static fadeIn(element, duration = 400) {
        return this.addAnimation(element, 'fadeIn', duration);
    }

    static fadeOut(element, duration = 400) {
        return this.addAnimation(element, 'fadeOut', duration);
    }

    static slideDown(element, duration = 500) {
        return this.addAnimation(element, 'slideDown', duration);
    }

    static slideUp(element, duration = 500) {
        return this.addAnimation(element, 'slideUp', duration);
    }

    static scaleIn(element, duration = 500) {
        return this.addAnimation(element, 'scaleIn', duration);
    }

    static bounce(element, duration = 600) {
        return this.addAnimation(element, 'bounce', duration);
    }

    static pulse(element) {
        element.style.animation = 'pulse 2s infinite';
    }
}

class ProductComparator {
    constructor() {
        this.comparableItems = JSON.parse(localStorage.getItem('ceurban-compare')) || [];
        this.maxItems = 4;
    }

    addProduct(product) {
        if (!this.isSelected(product.id) && this.comparableItems.length < this.maxItems) {
            this.comparableItems.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                imagen: product.imagen,
                categoria: product.categoria
            });
            this.save();
            return true;
        }
        return false;
    }

    removeProduct(productId) {
        this.comparableItems = this.comparableItems.filter(p => p.id !== productId);
        this.save();
    }

    isSelected(productId) {
        return this.comparableItems.some(p => p.id === productId);
    }

    getComparableItems() {
        return this.comparableItems;
    }

    clear() {
        this.comparableItems = [];
        this.save();
    }

    save() {
        localStorage.setItem('ceurban-compare', JSON.stringify(this.comparableItems));
    }

    generateComparisonHTML() {
        if (this.comparableItems.length === 0) return '<p>No hay productos para comparar</p>';

        let html = '<table class="comparison-table"><tr><th>Producto</th>';
        this.comparableItems.forEach(() => html += '<th>Producto</th>');
        html += '</tr>';

        html += '<tr><td>Imagen</td>';
        this.comparableItems.forEach(item => {
            html += `<td><img src="${item.imagen}" alt="${item.nombre}" style="max-width:100px;"></td>`;
        });
        html += '</tr>';

        html += '<tr><td>Nombre</td>';
        this.comparableItems.forEach(item => {
            html += `<td>${item.nombre}</td>`;
        });
        html += '</tr>';

        html += '<tr><td>Precio</td>';
        this.comparableItems.forEach(item => {
            html += `<td>$${item.precio.toLocaleString()}</td>`;
        });
        html += '</tr>';

        html += '<tr><td>Acción</td>';
        this.comparableItems.forEach(item => {
            html += `<td><button onclick="cart.addItem({id:${item.id}, nombre:'${item.nombre}', precio:${item.precio}, imagen:'${item.imagen}'}, 1)">Agregar</button></td>`;
        });
        html += '</tr>';

        html += '</table>';
        return html;
    }
}

class ReviewSystem {
    constructor() {
        this.reviewsKey = 'ceurban-reviews';
        this.reviews = JSON.parse(localStorage.getItem(this.reviewsKey)) || {};
    }

    addReview(productId, rating, comment, authorName) {
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }

        const review = {
            id: Date.now(),
            rating: Math.min(5, Math.max(1, rating)),
            comment,
            authorName: authorName || 'Anónimo',
            date: new Date().toISOString(),
            helpful: 0
        };

        this.reviews[productId].push(review);
        this.save();
        return review;
    }

    getReviews(productId) {
        return this.reviews[productId] || [];
    }

    getAverageRating(productId) {
        const reviews = this.getReviews(productId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    getRatingDistribution(productId) {
        const reviews = this.getReviews(productId);
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => distribution[r.rating]++);
        return distribution;
    }

    deleteReview(productId, reviewId) {
        if (this.reviews[productId]) {
            this.reviews[productId] = this.reviews[productId].filter(r => r.id !== reviewId);
            this.save();
        }
    }

    save() {
        localStorage.setItem(this.reviewsKey, JSON.stringify(this.reviews));
    }

    renderStars(rating) {
        return '⭐'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartItems = document.querySelector('.cart-items');

    if (!cartCount) return;

    cartCount.textContent = cart.getItemCount();
    if (cartTotal) cartTotal.textContent = `$${cart.getTotal().toLocaleString()}`;

    if (cartItems && cart.cart.length > 0) {
        cartItems.innerHTML = '';
        cart.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.style.cssText = `
                display: flex;
                gap: 12px;
                padding: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                align-items: center;
            `;
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}" style="width:60px; height:60px; border-radius:6px; object-fit:cover;">
                <div style="flex:1;">
                    <p style="margin:0; font-weight:bold;">${item.nombre}</p>
                    <p style="margin:4px 0 0 0; color:#ccc;">$${item.precio.toLocaleString()}</p>
                </div>
                <div class="item-qty" style="display:flex; gap:6px; align-items:center;">
                    <button data-product-id="${item.id}" class="qty-decrease" style="width:28px; height:28px; background:#ff6600; border:none; border-radius:4px; color:white; cursor:pointer;">-</button>
                    <span style="min-width:25px; text-align:center;">${item.quantity}</span>
                    <button data-product-id="${item.id}" class="qty-increase" style="width:28px; height:28px; background:#ff6600; border:none; border-radius:4px; color:white; cursor:pointer;">+</button>
                </div>
                <button data-product-id="${item.id}" class="remove-item" style="background:#f44336; color:white; border:none; padding:6px 10px; border-radius:4px; cursor:pointer;">🗑️</button>
            `;
            cartItems.appendChild(itemElement);
        });

        cartItems.querySelectorAll('.qty-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const item = cart.cart.find(p => p.id === productId);
                if (item) {
                    cart.updateQuantity(productId, item.quantity + 1);
                    updateCartUI();
                }
            });
        });

        cartItems.querySelectorAll('.qty-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                const item = cart.cart.find(p => p.id === productId);
                if (item && item.quantity > 1) {
                    cart.updateQuantity(productId, item.quantity - 1);
                    updateCartUI();
                }
            });
        });

        cartItems.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.productId);
                cart.removeItem(productId);
                notifier.info('Producto removido del carrito');
                updateCartUI();
            });
        });
    }
}

const quickViewModal = new QuickViewModal();
const comparator = new ProductComparator();
const reviews = new ReviewSystem();
