document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("summary-items-container");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-total");
    const formulario = document.getElementById("payment-form");

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        if (container) {
            container.innerHTML = `<p style="color: var(--gris); text-align: center; padding: 20px;">No tienes productos seleccionados. <a href="productos.html" style="color: var(--acento);">Ver catalogo</a></p>`;
        }
        if (formulario) formulario.style.display = 'none';
        return;
    }

    let acumulado = 0;
    container.innerHTML = "";

    carrito.forEach(producto => {
        const cantidad = producto.quantity || 1;
        const itemRow = document.createElement("div");
        itemRow.style.cssText = "display:flex; align-items:center; gap:15px; margin-bottom:15px; background:rgba(255,255,255,0.02); padding:10px; border-radius:6px; border:1px solid var(--gris-linea);";

        itemRow.innerHTML = `
            <div style="width:50px; height:50px; border-radius:6px; flex-shrink:0; background:${producto.color || '#1c2f6e'};"></div>
            <div style="flex: 1;">
                <h4 style="font-size: 14px; margin-bottom: 2px; color: white;">${producto.nombre} ${cantidad > 1 ? `x${cantidad}` : ''}</h4>
                <p style="color: var(--acento); font-size: 13px; font-weight: bold;">$${(producto.precio * cantidad).toLocaleString('es-CO')}</p>
            </div>
        `;
        container.appendChild(itemRow);
        acumulado += producto.precio * cantidad;
    });

    subtotalEl.textContent = `$${acumulado.toLocaleString('es-CO')}`;
    totalEl.textContent = `$${acumulado.toLocaleString('es-CO')}`;

    const usuarioGuardado = JSON.parse(localStorage.getItem('ceurbanUser') || 'null');
    if (usuarioGuardado) {
        const nameInput = document.getElementById('customer-name');
        const emailInput = document.getElementById('customer-email');
        if (nameInput) nameInput.value = usuarioGuardado.nombre || '';
        if (emailInput) emailInput.value = usuarioGuardado.email || '';
    }

    if (formulario) {
        formulario.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById('customer-name')?.value || '';
            const email = document.getElementById('customer-email')?.value || '';
            const direccion = document.getElementById('customer-address')?.value || '';
            const ciudad = document.getElementById('customer-city')?.value || '';
            const telefono = document.getElementById('customer-phone')?.value || '';
            const metodo_pago = document.getElementById('payment-method')?.value || '';

            if (carrito.length === 0) {
                alert('Tu carrito esta vacio. Agrega productos antes de continuar.');
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
                    cantidad: producto.quantity || 1
                })),
                subtotal: acumulado,
                envio: 0,
                total: acumulado
            };

            try {
                const respuesta = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });
                const data = await respuesta.json();
                if (!respuesta.ok) {
                    console.warn('Error guardando pedido:', data);
                }
            } catch (error) {
                console.warn('No se pudo conectar con el servidor:', error);
            }

            if (typeof loyalty !== 'undefined') {
                loyalty.addPurchase(acumulado, orderPayload.carrito);
            }
            if (typeof cart !== 'undefined' && cart.clear) {
                cart.clear();
            } else {
                localStorage.removeItem('carrito');
            }

            const metodoPagoLabels = {
                nequi: 'Nequi',
                daviplata: 'Daviplata',
                transferencia: 'transferencia bancaria',
                contraentrega: 'efectivo contraentrega'
            };
            const metodoPagoTexto = metodoPagoLabels[metodo_pago] || metodo_pago;
            const cierrePago = metodo_pago === 'contraentrega'
                ? 'Quedo atento para coordinar la entrega y pagar en efectivo contraentrega.'
                : `Quedo atento a los datos para pagar por ${metodoPagoTexto}.`;

            const totalUnidades = carrito.reduce((acc, p) => acc + (p.quantity || 1), 0);
            const productosTexto = carrito.map(p => `🔸 ${p.nombre} x${p.quantity || 1} — $${(p.precio * (p.quantity || 1)).toLocaleString('es-CO')}`).join('\n');

            const mensaje = `¡Hola C&E Urban Wear! 👋%0A%0AQuiero confirmar mis productos a pagar (${totalUnidades} producto${totalUnidades > 1 ? 's' : ''}):%0A%0A🛒 Productos a pagar:%0A${encodeURIComponent(productosTexto)}%0A%0A💰 Total a pagar: ${encodeURIComponent(totalEl.textContent)}%0A%0A📍 Datos de envio:%0ANombre: ${encodeURIComponent(nombre)}%0ATelefono: ${encodeURIComponent(telefono)}%0AEmail: ${encodeURIComponent(email)}%0ADireccion: ${encodeURIComponent(direccion)}, ${encodeURIComponent(ciudad)}%0A%0A💳 ${encodeURIComponent(cierrePago)}%0A%0A¡Gracias!`;

            const whatsappUrl = `https://wa.me/573142921523?text=${mensaje}`;
            window.location.href = whatsappUrl;
        });
    }
});
