# 🔧 DOCUMENTACIÓN TÉCNICA - CLASES Y FUNCIONES

## 📦 Estructura de Archivos Nuevos

```
jvs/
├── advanced-features.js      (450+ líneas) - Lógica principal
├── ux-enhancements.js        (400+ líneas) - Componentes UI
└── user-dashboard.js         (350+ líneas) - Panel de usuario

CSS/
└── ux-improvements.css       (1000+ líneas) - Estilos nuevos
```

---

## 📘 CLASES Y MÉTODOS

### 1. **WishlistManager** (advanced-features.js)

**Propósito**: Gestionar lista de favoritos del usuario

**Métodos**:
```javascript
addToWishlist(product)           
removeFromWishlist(productId)    
isInWishlist(productId)          
getWishlist()                    
clear()                          
```

**Ejemplo de uso**:
```javascript
const product = { id: 1, nombre: "Hoodie", precio: 85000, imagen: "..." };
wishlist.addToWishlist(product);

if (wishlist.isInWishlist(1)) {
    console.log("Es favorito");
}

wishlist.removeFromWishlist(1);
```

**LocalStorage Key**: `ceurban-wishlist`

---

### 2. **LoyaltySystem** (advanced-features.js)

**Propósito**: Sistema de puntos y niveles de membresía

**Métodos**:
```javascript
addPoints(amount)              
removePoints(amount)           
getPoints()                    
getLevel()                     
addPurchase(amount, items)    
getPurchaseHistory()          
getTotalSpent()               
```

**Niveles**:
```javascript
getLevel()
```

**Ejemplo de uso**:
```javascript
loyalty.addPoints(50000 * 0.1); 

const nivel = loyalty.getLevel();
console.log(`${nivel.name} - ${nivel.discount * 100}% descuento`);

const compra = loyalty.addPurchase(50000, items);
```

**LocalStorage Keys**:
- `ceurban-loyalty-points`
- `ceurban-purchase-history`

---

### 3. **ShoppingCart** (advanced-features.js)

**Propósito**: Carrito mejorado con manejo de cantidades

**Métodos**:
```javascript
addItem(product, quantity)     
updateQuantity(productId, qty) 
removeItem(productId)          
getCart()                      
getTotal()                     
getItemCount()                 
clear()                        
applyDiscount(percent)         
```

**Ejemplo de uso**:
```javascript
const product = { id: 1, nombre: "Hoodie", precio: 85000, imagen: "..." };
cart.addItem(product, 2);

cart.updateQuantity(1, 3);

const total = cart.getTotal();

const count = cart.getItemCount();
```

**LocalStorage Key**: `carrito`

---

### 4. **ViewHistory** (advanced-features.js)

**Propósito**: Historial de productos visualizados

**Métodos**:
```javascript
addView(product)   
getHistory()       
clear()            
```

**Límite**: 10 productos máximo

**Ejemplo de uso**:
```javascript
viewHistory.addView(product);

const historial = viewHistory.getHistory();
historial.forEach(item => {
    console.log(`${item.nombre} - $${item.precio}`);
});
```

**LocalStorage Key**: `ceurban-view-history`

---

### 5. **RecommendationEngine** (advanced-features.js)

**Propósito**: Sistema de recomendaciones inteligentes

**Métodos**:
```javascript
getRecommendations(count)      
getPopularProducts(count)      
getSimilarProducts(productId)  
```

**Algoritmo**:
1. Lee el historial de visualización
2. Obtiene categorías vistas
3. Recomienda productos no vistos de esas categorías
4. Completa con productos populares si es necesario

**Ejemplo de uso**:
```javascript
const engine = new RecommendationEngine(listaProductos);
const recomendaciones = engine.getRecommendations(5);

const similares = engine.getSimilarProducts(1);
```

---

### 6. **PriceFilter** (advanced-features.js)

**Propósito**: Filtrado de productos por precio

**Métodos**:
```javascript
filterByPriceRange(min, max)       
getMinMaxPrice()                   
filterByMultipleCriteria(filters)  
```

**Ejemplo de uso**:
```javascript
const filter = new PriceFilter(listaProductos);

const porPrecio = filter.filterByPriceRange(50000, 100000);

const filtrados = filter.filterByMultipleCriteria({
    category: 'ropa',
    minPrice: 50000,
    maxPrice: 100000,
    search: 'hoodie'
});
```

---

### 7. **NotificationManager** (advanced-features.js)

**Propósito**: Sistema de notificaciones toast

**Métodos**:
```javascript
show(message, type, duration)  
success(message)               
error(message)                 
warning(message)               
info(message)                  
```

**Tipos**:
- `success` (verde) ✅
- `error` (rojo) ❌
- `warning` (naranja) ⚠️
- `info` (azul) ℹ️

**Ejemplo de uso**:
```javascript
notifier.success("Producto agregado");
notifier.error("Error al procesar");
notifier.warning("Intenta nuevamente");
notifier.info("Información importante");
```

---

### 8. **QuickViewModal** (ux-enhancements.js)

**Propósito**: Modal de vista rápida de productos

**Métodos**:
```javascript
open(product)           
close()                 
changeQuantity(change)  
addToCart()            
toggleWishlist()       
```

**Ejemplo de uso**:
```javascript
const product = listaProductos[0];
quickViewModal.open(product);

```

---

### 9. **AnimationManager** (ux-enhancements.js)

**Propósito**: Gestor de animaciones

**Métodos**:
```javascript
addAnimation(element, name, duration)  
fadeIn(element, duration)              
fadeOut(element, duration)             
slideDown(element, duration)           
slideUp(element, duration)             
scaleIn(element, duration)             
bounce(element, duration)              
pulse(element)                         
```

**Ejemplo de uso**:
```javascript
AnimationManager.fadeIn(miElemento, 400);

await AnimationManager.scaleIn(elemento, 500);
console.log("Animación completada");
```

---

### 10. **ProductComparator** (ux-enhancements.js)

**Propósito**: Comparador de productos lado a lado

**Métodos**:
```javascript
addProduct(product)           
removeProduct(productId)      
isSelected(productId)         
getComparableItems()         
clear()                      
generateComparisonHTML()     
```

**Límite**: 4 productos máximo

**Ejemplo de uso**:
```javascript
comparator.addProduct(product1);
comparator.addProduct(product2);

const html = comparator.generateComparisonHTML();
document.getElementById('comparison').innerHTML = html;
```

**LocalStorage Key**: `ceurban-compare`

---

### 11. **ReviewSystem** (ux-enhancements.js)

**Propósito**: Sistema de reseñas y calificaciones

**Métodos**:
```javascript
addReview(productId, rating, comment, authorName)  
getReviews(productId)                               
getAverageRating(productId)                        
getRatingDistribution(productId)                   
deleteReview(productId, reviewId)                  
renderStars(rating)                                
```

**Ejemplo de uso**:
```javascript
reviews.addReview(
    1,                          
    5,                          
    "Excelente producto!",      
    "Juan Pérez"                
);

const avg = reviews.getAverageRating(1);
console.log(`${avg}/5 ⭐`);

const dist = reviews.getRatingDistribution(1);
console.log(`5 estrellas: ${dist[5]}`);
```

**LocalStorage Key**: `ceurban-reviews`

---

### 12. **UserDashboardPanel** (user-dashboard.js)

**Propósito**: Panel de usuario completo

**Métodos**:
```javascript
open()           
close()          
switchTab(name)  
updateContent()  
```

**Tabs disponibles**:
- `loyalty` - Nivel de lealtad
- `favorites` - Lista de favoritos
- `history` - Historial de visualización
- `points` - Información de puntos

**Ejemplo de uso**:
```javascript
userDashboard.open();

userDashboard.switchTab('favoritos');

userDashboard.updateContent();
```

---

## 🎨 FUNCIONES GLOBALES

### **updateCartUI()**
Actualiza la interfaz del carrito con los datos más recientes.

```javascript
updateCartUI();
```

### **applyFilters()**
Aplica filtros activos (categoría, precio, búsqueda).

```javascript
function applyFilters() {
    const category = document.querySelector('input[name="category"]:checked').value;
    const minPrice = parseInt(document.getElementById('min-price').value) || 0;
}
```

### **applySort()**
Ordena los productos según la selección.

```javascript
function applySort() {
    const sortValue = document.getElementById('sort-select').value;
}
```

---

## 🔗 VARIABLES GLOBALES

```javascript
wishlist              
loyalty              
cart                 
viewHistory          
notifier             
quickViewModal       
comparator           
reviews              
userDashboard        

listaProductos       
```

---

## 🔄 FLUJO DE DATOS

```
index.html
    ↓
advanced-features.js (Inicializar clases globales)
    ↓
ux-enhancements.js (Crear modales y managers)
    ↓
user-dashboard.js (Crear panel de usuario)
    ↓
index.js (Cargar productos y configurar eventos)
    ↓
carrito.js (Configurar eventos del carrito)
    ↓
user-state.js (Configurar autenticación)
```

---

## 🔌 INTEGRACIÓN CON BACKEND

Para conectar con un servidor:

```javascript
POST /api/orders
{
    customerEmail: "...",
    items: [...],
    total: 50000,
    points: 5000  
}

GET /api/loyalty/points?email=...

GET/POST /api/wislist
```

---

## 🚀 EXTENSIÓN FUTURA

Para agregar nuevas funcionalidades:

1. **Crear nueva clase** en `advanced-features.js` o `ux-enhancements.js`
2. **Instanciar globalmente** al final del archivo
3. **Agregar eventos** en `index.js` o `carrito.js`
4. **Agregar estilos** en `CSS/ux-improvements.css`
5. **Actualizar documentación**

---

## 📊 EJEMPLO: AGREGAR NUEVA FUNCIONALIDAD

**Crear sistema de cupones:**

```javascript
class CouponSystem {
    constructor() {
        this.coupon = localStorage.getItem('ceurban-coupon') || null;
    }
    
    applyCoupon(code) {
        const discounts = {
            'DESCUENTO10': 0.10,
            'DESCUENTO20': 0.20
        };
        
        if (discounts[code]) {
            this.coupon = { code, discount: discounts[code] };
            localStorage.setItem('ceurban-coupon', JSON.stringify(this.coupon));
            return true;
        }
        return false;
    }
    
    getDiscount() {
        return this.coupon?.discount || 0;
    }
}

const coupon = new CouponSystem();

const total = cart.getTotal();
const conDescuento = total * (1 - coupon.getDiscount());
```

---

## 🐛 DEBUGGING

Para depurar en la consola:

```javascript
console.log(cart.getCart());

console.log(wishlist.getWishlist());

console.log(loyalty.getPoints(), loyalty.getLevel());

console.log(viewHistory.getHistory());

console.log(reviews.reviews);

console.log(comparator.getComparableItems());
```

---

## ✅ TESTING

Para probar nuevas características:

```javascript
cart.addItem({ id: 1, nombre: "Test", precio: 100, imagen: "..." }, 2);
console.assert(cart.getItemCount() === 2, "Debe tener 2 items");

loyalty.addPoints(100);
console.assert(loyalty.getPoints() >= 100, "Debe tener al menos 100 puntos");

wishlist.addToWishlist({ id: 1, nombre: "Test", precio: 100 });
console.assert(wishlist.isInWishlist(1), "Debe estar en favoritos");
```

---

## 📖 REFERENCIAS

- **Documentación**: `MEJORAS_IMPLEMENTADAS.md`
- **Guía de Usuario**: `GUIA_RAPIDA.md`
- **Archivo Principal**: `index.html`
- **Estilos**: `CSS/ux-improvements.css`

---

¡Usa esta documentación como referencia para mantener y extender el sistema! 🚀
