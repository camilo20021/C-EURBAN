
class WishlistManager {
    constructor() {
        this.wishlistKey = 'ceurban-wishlist';
        this.wishlist = JSON.parse(localStorage.getItem(this.wishlistKey)) || [];
    }

    addToWishlist(product) {
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push({
                id: product.id,
                nombre: product.nombre,
                precio: product.precio,
                color: product.color,
                fechaAgregada: new Date().toISOString()
            });
            this.save();
            return true;
        }
        return false;
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(p => p.id !== productId);
        this.save();
    }

    isInWishlist(productId) {
        return this.wishlist.some(p => p.id === productId);
    }

    getWishlist() {
        return this.wishlist;
    }

    save() {
        localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
    }

    clear() {
        this.wishlist = [];
        this.save();
    }
}

class LoyaltySystem {
    constructor() {
        this.pointsKey = 'ceurban-loyalty-points';
        this.historyKey = 'ceurban-purchase-history';
        this.points = parseInt(localStorage.getItem(this.pointsKey)) || 0;
        this.history = JSON.parse(localStorage.getItem(this.historyKey)) || [];
    }

    addPoints(amount) {
        this.points += Math.floor(amount);
        this.save();
        return this.points;
    }

    removePoints(amount) {
        if (this.points >= amount) {
            this.points -= amount;
            this.save();
            return true;
        }
        return false;
    }

    getPoints() {
        return this.points;
    }

    getLevel() {
        if (this.points >= 5000) return { name: 'Platinum', color: '#e5e4e2', discount: 0.15 };
        if (this.points >= 3000) return { name: 'Gold', color: '#ffd700', discount: 0.10 };
        if (this.points >= 1000) return { name: 'Silver', color: '#c0c0c0', discount: 0.05 };
        return { name: 'Bronze', color: '#cd7f32', discount: 0 };
    }

    addPurchase(amount, items) {
        const purchase = {
            id: Date.now(),
            amount,
            items,
            date: new Date().toISOString(),
            points: Math.floor(amount * 0.1) 
        };
        this.history.push(purchase);
        this.addPoints(purchase.points);
        localStorage.setItem(this.historyKey, JSON.stringify(this.history));
        return purchase;
    }

    getPurchaseHistory() {
        return this.history;
    }

    getTotalSpent() {
        return this.history.reduce((sum, purchase) => sum + purchase.amount, 0);
    }

    save() {
        localStorage.setItem(this.pointsKey, this.points.toString());
    }
}

class ShoppingCart {
    constructor() {
        this.cartKey = 'carrito';
        this.cart = JSON.parse(localStorage.getItem(this.cartKey)) || [];
    }

    addItem(product, quantity = 1) {
        // Un producto es "igual" si tiene mismo ID, misma talla y mismo color de tela
        const existingItem = this.cart.find(item =>
            item.id === product.id && item.talla === product.talla && item.colorTela === (product.colorTela || null)
        );

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product, // Copia toda la info del producto
                nombre: product.nombre,
                precio: product.precio,
                color: product.color,
                talla: product.talla || null,
                colorTela: product.colorTela || null,
                quantity
            });
        }
        this.save();
        return this.getTotal();
    }

    updateQuantity(productId, quantity) {
        const item = this.cart.find(p => p.id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
        }
    }

    removeItem(productId) {
        this.cart = this.cart.filter(p => p.id !== productId);
        this.save();
    }

    getCart() {
        return this.cart;
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    }

    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    clear() {
        this.cart = [];
        this.save();
    }

    save() {
        localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    }

    applyDiscount(discountPercent) {
        return this.getTotal() * (1 - discountPercent / 100);
    }
}

class ViewHistory {
    constructor() {
        this.historyKey = 'ceurban-view-history';
        this.history = JSON.parse(localStorage.getItem(this.historyKey)) || [];
        this.maxItems = 10;
    }

    addView(product) {
        this.history = this.history.filter(p => p.id !== product.id);
        
        this.history.unshift({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            color: product.color,
            categoria: product.categoria,
            viewedAt: new Date().toISOString()
        });

        if (this.history.length > this.maxItems) {
            this.history = this.history.slice(0, this.maxItems);
        }

        this.save();
    }

    getHistory() {
        return this.history;
    }

    clear() {
        this.history = [];
        this.save();
    }

    save() {
        localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    }
}

class RecommendationEngine {
    constructor(allProducts) {
        this.products = allProducts;
        this.viewHistory = new ViewHistory();
        this.loyaltySystem = new LoyaltySystem();
    }

    getRecommendations(count = 5) {
        const history = this.viewHistory.getHistory();
        if (history.length === 0) return this.getPopularProducts(count);

        const viewedCategories = [...new Set(history.map(p => p.categoria))];
        
        const recommendations = this.products
            .filter(product => 
                !history.find(h => h.id === product.id) &&
                viewedCategories.includes(product.categoria)
            )
            .sort((a, b) => b.precio - a.precio) 
            .slice(0, count);

        if (recommendations.length < count) {
            const popular = this.getPopularProducts(count - recommendations.length);
            recommendations.push(...popular);
        }

        return recommendations.slice(0, count);
    }

    getPopularProducts(count = 5) {
        return this.products.slice(0, count);
    }

    getSimilarProducts(productId, count = 4) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return [];

        return this.products
            .filter(p => p.id !== productId && p.categoria === product.categoria)
            .slice(0, count);
    }
}

class PriceFilter {
    constructor(products) {
        this.products = products;
    }

    filterByPriceRange(minPrice, maxPrice) {
        return this.products.filter(p => p.precio >= minPrice && p.precio <= maxPrice);
    }

    getMinMaxPrice() {
        const prices = this.products.map(p => p.precio);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }

    filterByMultipleCriteria(filters) {
        return this.products.filter(product => {
            if (filters.category && product.categoria !== filters.category) return false;
            if (filters.minPrice && product.precio < filters.minPrice) return false;
            if (filters.maxPrice && product.precio > filters.maxPrice) return false;
            if (filters.search && !product.nombre.toLowerCase().includes(filters.search.toLowerCase())) return false;
            return true;
        });
    }
}

class NotificationManager {
    constructor() {
        this.toastContainer = document.querySelector('.toast') || this.createToastContainer();
    }

    createToastContainer() {
        const toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
        return toast;
    }

    show(message, type = 'info', duration = 2800) {
        const tipoClase = { success: 'exito', error: 'error', warning: 'aviso', info: '' };
        this.toastContainer.className = `toast mostrar ${tipoClase[type] || ''}`.trim();
        this.toastContainer.textContent = message;

        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this.toastContainer.classList.remove('mostrar');
        }, duration);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

const wishlist = new WishlistManager();
const loyalty = new LoyaltySystem();
const cart = new ShoppingCart();
const viewHistory = new ViewHistory();
const notifier = new NotificationManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WishlistManager,
        LoyaltySystem,
        ShoppingCart,
        ViewHistory,
        RecommendationEngine,
        PriceFilter,
        NotificationManager
    };
}
