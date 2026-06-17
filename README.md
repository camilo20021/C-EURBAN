# C&E Urban Wear — Tienda online

Sitio de la marca C&E Urban Wear (buzos, jeans, sudaderas y gorras), con
catalogo dinamico, carrito de compras, sistema de favoritos y puntos de
lealtad, y backend en Node.js que guarda clientes y pedidos en SQLite.

## Estado actual del pago

Por ahora el sitio NO procesa pagos en linea de forma automatica. El flujo
de "Finalizar compra" guarda el pedido en la base de datos y luego abre
WhatsApp con todos los datos ya armados, para coordinar el pago (Nequi,
Daviplata, transferencia o contraentrega) de forma manual.

Cuando quieras activar cobro automatico con tarjeta, el siguiente paso es
crear una cuenta en una pasarela colombiana (Wompi, PayU o Mercado Pago)
con tus datos bancarios, y conectar sus llaves de API en `pago.js` y
`server.js`. Ese registro debes hacerlo tu mismo: nadie mas puede crear esa
cuenta en tu nombre.

## Estructura del proyecto

```
index.html          Pagina principal
productos.html       Catalogo completo con filtros
buzos.html            Categoria: buzos
jeans.html             Categoria: jeans
sudaderas.html        Categoria: sudaderas
gorras.html            Categoria: gorras
contacto.html         Formulario de contacto (envia por WhatsApp)
login.html            Inicio de sesion (Google + registro manual)
pago.html             Checkout / confirmacion de pedido

CSS/
  main.css            Sistema de diseño principal (colores, layout, header, cards)
  componentes.css      Modal de vista rapida, panel de usuario, comparador, resenas
  pago.css             Estilos del checkout

jvs/
  placeholders.js       Genera las siluetas SVG de producto (mientras no hay fotos reales)
  advanced-features.js  Wishlist, lealtad, carrito (logica), historial, notificaciones
  ux-enhancements.js    Modal de vista rapida, comparador, resenas
  user-dashboard.js     Panel lateral de usuario (lealtad, favoritos, historial)
  index.js              Carga de catalogo, filtros, busqueda, carrusel, menu movil
  carrito.js             Interfaz del carrito lateral
  pago.js                 Logica de checkout
  auth.js                  Login con Google / registro manual
  user-state.js            Reservado para estado de sesion futuro

data/
  productos.json       Catalogo de productos (editar aqui para agregar/quitar productos)

server.js             Backend Express: guarda pedidos y clientes, envia email de confirmacion
db.js                  Inicializa SQLite (clientes, pedidos, pedido_items)
```

## Fotos de producto

Las fotos actuales son marcadores de posicion ilustrados (siluetas SVG con
los colores de marca), NO fotos reales. Esto fue intencional: las imagenes
que habia antes eran artes promocionales de catalogos de proveedores
externos, no fotos de los productos reales de C&E Urban Wear.

Para reemplazar un placeholder por una foto real:
1. Sube la foto a la carpeta `IMAGENES/`.
2. En `data/productos.json`, cambia el campo `"imagen": "placeholder"` por
   la ruta de la foto, por ejemplo `"imagen": "IMAGENES/buzo-negro-1.jpg"`.
3. Avisa para ajustar `index.js` y que muestre la foto en vez del SVG.

## Como correr el proyecto localmente

1. Instala dependencias:

```bash
npm install
```

2. Copia `.env.example` a `.env` y configura tu SMTP si quieres recibir
   emails de confirmacion (opcional, el sitio funciona igual sin esto):

```bash
cp .env.example .env
```

3. Ejecuta el servidor:

```bash
npm start
```

4. Abre `http://localhost:3000` en tu navegador.

## Panel de administrador

El panel de administrador fue removido por seguridad: la version anterior
tenia el usuario y la contraseña visibles en el codigo fuente del HTML, y
cualquiera podia ver los pedidos y datos de clientes sin loguearse de
verdad. Los pedidos siguen guardandose normalmente en `store.db`; cuando
quieras retomar un panel de administracion, hay que construirlo con
autenticacion validada del lado del servidor.

## Inicio de sesion con Google

El boton de Google en `login.html` usa un Client ID que viene del proyecto
original. Antes de lanzar el sitio en produccion, verifica en
https://console.cloud.google.com que ese Client ID sea tuyo y que el
dominio `urbandriveaccesorios.online` este autorizado, o crea uno nuevo.
