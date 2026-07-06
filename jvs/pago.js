document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("summary-items-container");
    const subtotalEl = document.getElementById("checkout-subtotal");
    const totalEl = document.getElementById("checkout-total");
    const formulario = document.getElementById("payment-form");
    const SUPABASE_URL = 'https://vtztpvjbhwlnspjpwhim.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_FdF3E71-r0Ku4NVb-uSN7A_yNvIiTqv';

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

        const thumbHtml = producto.imagen
            ? `<img src="${producto.imagen}" alt="${producto.nombre}" style="width:56px;height:56px;border-radius:6px;object-fit:cover;flex-shrink:0;">`
            : `<div style="width:56px;height:56px;border-radius:6px;flex-shrink:0;background:${producto.color || '#1c2f6e'};"></div>`;

        const tallaHtml = producto.talla
            ? `<p style="color:var(--gris);font-size:12px;margin:2px 0;">Talla: ${producto.talla}</p>`
            : '';

        itemRow.innerHTML = `
            ${thumbHtml}
            <div style="flex:1; min-width:0;">
                <h4 style="font-size:14px;margin-bottom:2px;color:white;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${producto.nombre}${cantidad > 1 ? ` x${cantidad}` : ''}</h4>
                ${tallaHtml}
                <p style="color:var(--acento);font-size:13px;font-weight:bold;margin-top:2px;">$${(producto.precio * cantidad).toLocaleString('es-CO')}</p>
            </div>
        `;
        container.appendChild(itemRow);
        acumulado += producto.precio * cantidad;
    });

    subtotalEl.textContent = `$${acumulado.toLocaleString('es-CO')}`;
    totalEl.textContent = `$${acumulado.toLocaleString('es-CO')}`;

    // --- MEJORA DE EXPERIENCIA DE USUARIO ---
    const usuarioGuardado = JSON.parse(localStorage.getItem('ceurbanUser') || 'null');
    if (usuarioGuardado) {
        const nameInput = document.getElementById('customer-name');
        const emailInput = document.getElementById('customer-email');

        // Pre-llenamos los campos (aunque estarán ocultos)
        if (nameInput) nameInput.value = usuarioGuardado.nombre;
        if (emailInput) emailInput.value = usuarioGuardado.email;

        // Ocultamos los campos de nombre y email y mostramos un saludo
        const nameWrapper = nameInput.parentElement;
        const emailWrapper = emailInput.parentElement;
        if (nameWrapper && emailWrapper) {
            nameWrapper.style.display = 'none';
            emailWrapper.style.display = 'none';

            const saludoHTML = `
                <div class="logged-in-user-info">
                    <p>Hola, <strong>${usuarioGuardado.nombre}</strong>. Finaliza tu compra ingresando los datos de envío.</p>
                </div>`;
            formulario.insertAdjacentHTML('afterbegin', saludoHTML);
        }
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
                const respuesta = await fetch(`${SUPABASE_URL}/rest/v1/rpc/crear_pedido`, {
                    method: 'POST',
                    headers: {
                        apikey: SUPABASE_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        p_nombre: nombre,
                        p_email: email,
                        p_telefono: telefono,
                        p_direccion: direccion,
                        p_ciudad: ciudad,
                        p_metodo_pago: metodo_pago,
                        p_total: acumulado,
                        p_items: carrito.map(producto => ({
                            producto_id: producto.id || null,
                            nombre_producto: producto.nombre,
                            talla: producto.talla || null,
                            cantidad: producto.quantity || 1,
                            precio_unitario: producto.precio
                        }))
                    })
                });

                if (!respuesta.ok) {
                    console.warn('Error guardando pedido:', await respuesta.json());
                } else {
                    const pedidoId = await respuesta.json();
                    console.log(`Pedido #${pedidoId} guardado en Supabase`);
                }
            } catch (error) {
                console.warn('No se pudo conectar con Supabase:', error);
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
            const productosTexto = carrito.map(p => {
                const tallaInfo = p.talla ? ` — Talla ${p.talla}` : '';
                const cant = p.quantity || 1;
                return `• ${p.nombre}${tallaInfo} x${cant} — $${(p.precio * cant).toLocaleString('es-CO')}`;
            }).join('\n');

            const mensajeWsp =
`¡Hola C&E Urban Wear! 👋

Quiero confirmar mi pedido (${totalUnidades} producto${totalUnidades > 1 ? 's' : ''}):

🛒 Productos:
${productosTexto}

💰 Total: ${totalEl.textContent}

📍 Datos de envio:
• Nombre: ${nombre}
• Telefono: ${telefono}
• Email: ${email}
• Direccion: ${direccion}, ${ciudad}

💳 ${cierrePago}

¡Gracias!`;

            window.location.href = `https://wa.me/573142921523?text=${encodeURIComponent(mensajeWsp)}`;
        });
    }
});
