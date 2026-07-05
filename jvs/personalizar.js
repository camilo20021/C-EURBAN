/* ==========================================================================
   C&E URBAN WEAR — Personalizacion de buzo con imagen
   Comprime la imagen en el navegador (canvas) antes de guardarla,
   para que el archivo final sea liviano.
   ========================================================================== */

const MAX_DIMENSION_PX = 900;
const JPEG_QUALITY = 0.72;

function comprimirImagen(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('El archivo debe ser una imagen.'));
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;

                if (width > height && width > MAX_DIMENSION_PX) {
                    height = Math.round((height * MAX_DIMENSION_PX) / width);
                    width = MAX_DIMENSION_PX;
                } else if (height > MAX_DIMENSION_PX) {
                    width = Math.round((width * MAX_DIMENSION_PX) / height);
                    height = MAX_DIMENSION_PX;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                resolve(dataUrl);
            };
            img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('No se pudo cargar el archivo.'));
        reader.readAsDataURL(file);
    });
}

function calcularPesoBase64KB(dataUrl) {
    const base64 = dataUrl.split(',')[1] || '';
    const bytes = base64.length * 0.75;
    return Math.round(bytes / 1024);
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('personalizar-form');
    if (!form) return;

    const inputImagen = document.getElementById('personalizar-imagen');
    const previewWrap = document.getElementById('personalizar-preview');
    const pesoTexto = document.getElementById('personalizar-peso');
    const submitBtn = document.getElementById('personalizar-submit');
    let imagenComprimidaBase64 = null;

    inputImagen?.addEventListener('change', async () => {
        const file = inputImagen.files?.[0];
        if (!file) return;

        if (file.size > 12 * 1024 * 1024) {
            alert('La imagen es demasiado pesada (maximo 12MB antes de comprimir). Elige otra foto.');
            inputImagen.value = '';
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando imagen...';

            imagenComprimidaBase64 = await comprimirImagen(file);
            const pesoKB = calcularPesoBase64KB(imagenComprimidaBase64);

            if (previewWrap) {
                previewWrap.innerHTML = `<img src="${imagenComprimidaBase64}" alt="Vista previa de tu diseño" style="max-width:100%; border-radius:8px; border:1px solid var(--gris-linea);">`;
            }
            if (pesoTexto) {
                pesoTexto.textContent = `Imagen lista (${pesoKB} KB aprox.)`;
            }
        } catch (error) {
            console.error(error);
            alert('No se pudo procesar la imagen. Intenta con otra foto.');
            imagenComprimidaBase64 = null;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar pedido personalizado';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('personalizar-nombre').value.trim();
        const email = document.getElementById('personalizar-email').value.trim();
        const telefono = document.getElementById('personalizar-telefono').value.trim();
        const talla = document.getElementById('personalizar-talla').value;
        const color = document.getElementById('personalizar-color').value;
        const notas = document.getElementById('personalizar-notas').value.trim();

        if (!nombre || !email || !telefono) {
            alert('Completa nombre, email y telefono para continuar.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const payload = {
            nombre,
            email,
            direccion: 'Pendiente por confirmar (pedido personalizado)',
            ciudad: 'Pendiente por confirmar',
            telefono,
            metodo_pago: 'A coordinar por WhatsApp',
            carrito: [{
                nombre: `Buzo personalizado (${color}, talla ${talla})`,
                precio: 0,
                cantidad: 1,
                talla,
                imagen_personalizada: imagenComprimidaBase64 || null,
                notas_personalizacion: notas || null
            }],
            subtotal: 0,
            envio: 0,
            total: 0
        };

        try {
            const respuesta = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await respuesta.json();

            if (!respuesta.ok) {
                console.warn('Error guardando la personalizacion:', data);
            }
        } catch (error) {
            console.warn('No se pudo conectar con el servidor:', error);
        }

        const tieneImagen = !!imagenComprimidaBase64;
        const mensajeWsp =
`¡Hola C&E Urban Wear! 👋

Quiero un buzo personalizado. Aqui estan mis datos:

📋 Pedido:
• Talla: ${talla}
• Color del buzo: ${color}
• Notas de diseño: ${notas || 'Sin notas adicionales'}
${tieneImagen ? '• ✅ Ya envie mi diseño desde el formulario del sitio web' : '• ⚠️ No adjunte imagen aun, la enviare por este chat'}

👤 Mis datos:
• Nombre: ${nombre}
• Telefono: ${telefono}
• Email: ${email}

¡Gracias!`;

        window.open(`https://wa.me/573142921523?text=${encodeURIComponent(mensajeWsp)}`, '_blank');

        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar pedido personalizado';
        form.reset();
        if (previewWrap) previewWrap.innerHTML = '';
        if (pesoTexto) pesoTexto.textContent = '';
        imagenComprimidaBase64 = null;

        alert('Tu pedido personalizado fue enviado. Te escribimos por WhatsApp para coordinar los detalles y el pago.');
    });
});
