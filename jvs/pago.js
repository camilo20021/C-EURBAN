document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("summary-items-container");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-total");
    const formulario = document.getElementById("payment-form");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        if(container) {
            container.innerHTML = `<p style="color: #666; text-align: center; padding: 20px;">No tienes productos seleccionados.</p>`;
        }
        return;
    }

    let acumulado = 0;
    container.innerHTML = "";

    carrito.forEach(producto => {
        const itemRow = document.createElement("div");
        itemRow.style.display = "flex";
        itemRow.style.alignItems = "center";
        itemRow.style.gap = "15px";
        itemRow.style.marginBottom = "15px";
        itemRow.style.background = "rgba(255,255,255,0.02)";
        itemRow.style.padding = "10px";
        itemRow.style.borderRadius = "6px";
        itemRow.style.border = "1px solid rgba(255,255,255,0.05)";

        itemRow.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
                <h4 style="font-size: 14px; margin-bottom: 2px; color: white;">${producto.nombre}</h4>
                <p style="color: #ff6600; font-size: 13px; font-weight: bold;">$${producto.precio.toLocaleString()}</p>
            </div>
        `;
        container.appendChild(itemRow);
        acumulado += producto.precio;
    });

    subtotalEl.textContent = `$${acumulado.toLocaleString()}`;
    totalEl.textContent = `$${acumulado.toLocaleString()}`;

    const usuarioGuardado = JSON.parse(localStorage.getItem('ceurbanUser') || 'null');
    if (usuarioGuardado) {
        document.getElementById('customer-name').value = usuarioGuardado.nombre || '';
        document.getElementById('customer-email').value = usuarioGuardado.email || '';
    }

    if(formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('customer-name')?.value || '';
            const email = document.getElementById('customer-email')?.value || '';
            const direccion = document.getElementById('customer-address')?.value || '';
            const ciudad = document.getElementById('customer-city')?.value || '';
            const telefono = document.getElementById('customer-phone')?.value || '';
            const metodo_pago = document.getElementById('payment-method')?.value || '';

            if (carrito.length === 0) {
                alert('Tu carrito está vacío. Agrega productos antes de realizar el pago.');
                return;
            }

            const usuarioGuardado = JSON.parse(localStorage.getItem('ceurbanUser') || 'null');
            const orderPayload = {
                nombre,
                email,
                direccion,
                ciudad,
                telefono,
                metodo_pago,
                googleId: usuarioGuardado?.googleId || null,
                imagen: usuarioGuardado?.imagen || null,
                carrito: carrito.map(producto => ({
                    nombre: producto.nombre,
                    precio: producto.precio,
                    cantidad: producto.cantidad || 1,
                    imagen: producto.imagen
                })),
                subtotal: acumulado,
                envio: 0,
                total: acumulado
            };

            try {
                const respuesta = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderPayload)
                });
                const data = await respuesta.json();
                if (!respuesta.ok) {
                    console.warn('Error guardando pedido:', data);
                }
            } catch (error) {
                console.warn('No se pudo conectar con el servidor:', error);
            }

            const productosTexto = carrito.map(p => `- ${p.nombre} x${p.cantidad || 1}: $${p.precio.toLocaleString()}`).join('\n');
            const mensaje = `Hola C&E Urban,%0A%0AHe terminado de seleccionar mi pedido y necesito el link de pago.%0A%0ANombre: ${encodeURIComponent(nombre)}%0AEmail: ${encodeURIComponent(email)}%0ADirección: ${encodeURIComponent(direccion)}%0ACiudad: ${encodeURIComponent(ciudad)}%0ATeléfono: ${encodeURIComponent(telefono)}%0AMétodo de pago: ${encodeURIComponent(metodo_pago)}%0A%0AProductos:%0A${encodeURIComponent(productosTexto)}%0A%0ATotal: ${encodeURIComponent(subtotalEl.textContent)}%0A%0AMuchas gracias.`;

            const whatsappUrl = `https://wa.me/573142921523?text=${mensaje}`;
            window.location.href = whatsappUrl;
        });
    }
});