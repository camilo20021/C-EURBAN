
class QuickViewModal {
    constructor() {
        this.modalHTML = `
            <div class="quick-view-modal" id="quick-view-modal">
                <div class="modal-content">
                    <button class="close-modal">&times;</button>
                    <div class="modal-body">
                        <div class="modal-images" id="modal-main-image-wrap">
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
                                <div class="size-selector-wrap" id="size-selector-wrap" style="display: none;">
                                    <select id="modal-size-selector" class="size-selector"></select>
                                </div>
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

    getUrbanDescription(product) {
        const brand = "C&E Urban Wear";
        switch (product.categoria) {
            case 'buzos':
                return `Domina el asfalto con este buzo de ${brand}. Diseñado para el movimiento, su tejido premium te da confort y una silueta impecable. La pieza clave que define tu look, del día a la noche.`;
            case 'gorras':
                return `La corona del rey urbano. Esta gorra de ${brand} es el toque final que sella tu estilo. Protección, actitud y un diseño que no pasa desapercibido. Llévala y haz que cada esquina sea tu trono.`;
            case 'camisetas-caballeros':
            case 'camisetas-damas':
            case 'camisetas':
                return `La base de tu estilo urbano. Esta camiseta de ${brand} combina comodidad y actitud. Hecha con algodon suave para el dia a dia, es el lienzo perfecto para tus outfits mas creativos.`;
            default:
                return product.descripcion || `Un producto esencial de ${brand} para tu estilo de vida.`;
        }
    }

    renderSizeSelector(product) {
        const sizeWrap = this.modal.querySelector('#size-selector-wrap');
        const sizeSelector = this.modal.querySelector('#modal-size-selector');
        sizeSelector.innerHTML = '';

        let tallas = [];
        if (product.categoria === 'buzos' || product.categoria.startsWith('camisetas')) {
            tallas = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        } else if (product.categoria === 'jeans') { // Dejado por si se vuelve a usar en el futuro
            tallas = ['6', '8', '10', '12', '14'];
        }

        if (tallas.length > 0) {
            sizeSelector.innerHTML = `<option value="">Elige tu talla</option>` + tallas.map(t => `<option value="${t}">Talla ${t}</option>`).join('');
            sizeWrap.style.display = 'block';
        } else {
            sizeWrap.style.display = 'none';
        }
    }

    open(product) {
        this.currentProduct = product;

        if (typeof viewHistory !== 'undefined') {
            viewHistory.addView(product);
        }

        const imgWrap = this.modal.querySelector('#modal-main-image-wrap');
        if (imgWrap && typeof generarPlaceholderProducto === 'function') {
            imgWrap.innerHTML = generarPlaceholderProducto(product);
        }
        this.modal.querySelector('#modal-product-name').textContent = product.nombre;
        this.modal.querySelector('#modal-product-price').textContent = `$${product.precio.toLocaleString('es-CO')}`;
        this.modal.querySelector('#modal-product-description').textContent = this.getUrbanDescription(product);
        this.modal.querySelector('#modal-quantity').value = '1';

        this.renderSizeSelector(product);

        const wishlistBtn = this.modal.querySelector('.modal-wishlist-btn');
        if (wishlist.isInWishlist(product.id)) {
            wishlistBtn.style.background = 'var(--acento)';
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
        const sizeSelector = this.modal.querySelector('#modal-size-selector');
        const sizeWrap = this.modal.querySelector('#size-selector-wrap');
        let tallaSeleccionada = null;

        if (sizeWrap.style.display !== 'none') {
            if (!sizeSelector.value) {
                notifier.error('Por favor, elige una talla para continuar.');
                return;
            }
            tallaSeleccionada = sizeSelector.value;
        }

        const productToAdd = { ...this.currentProduct, talla: tallaSeleccionada };

        cart.addItem(productToAdd, quantity);
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
            wishlistBtn.style.background = 'var(--acento)';
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
                color: product.color,
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

        html += '<tr><td>Vista previa</td>';
        this.comparableItems.forEach(item => {
            html += `<td><div style="width:60px;height:60px;border-radius:8px;background:${item.color || '#1c2f6e'};margin:0 auto;"></div></td>`;
        });
        html += '</tr>';

        html += '<tr><td>Nombre</td>';
        this.comparableItems.forEach(item => {
            html += `<td>${item.nombre}</td>`;
        });
        html += '</tr>';

        html += '<tr><td>Precio</td>';
        this.comparableItems.forEach(item => {
            html += `<td>$${item.precio.toLocaleString('es-CO')}</td>`;
        });
        html += '</tr>';

        html += '<tr><td>Accion</td>';
        this.comparableItems.forEach(item => {
            html += `<td><button data-compare-add-id="${item.id}">Agregar</button></td>`;
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

/* La actualizacion del carrito vive en carrito.js (updateCartUI) para evitar
   logica duplicada con estilos inline obsoletos. */

const quickViewModal = new QuickViewModal();
const comparator = new ProductComparator();
const reviews = new ReviewSystem();

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-compare-add-id]');
    if (!btn) return;
    const id = parseInt(btn.dataset.compareAddId);
    const item = comparator.getComparableItems().find(p => p.id === id);
    if (item && typeof cart !== 'undefined') {
        cart.addItem(item, 1);
        if (typeof updateCartUI === 'function') updateCartUI();
        if (typeof notifier !== 'undefined') notifier.success(`${item.nombre} agregado al carrito`);
    }
});
