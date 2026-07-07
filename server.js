require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { db, initialize } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(__dirname)));

initialize();

async function createTransporter() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
}

function saveCustomer(customer, callback) {
    const { nombre, email, telefono, google_id, imagen_perfil } = customer;
    db.get('SELECT id, google_id, imagen_perfil FROM clientes WHERE email = ? OR google_id = ?', [email, google_id], (err, row) => {
        if (err) return callback(err);
        if (row) {
            db.run(
                'UPDATE clientes SET nombre = ?, telefono = ?, google_id = ?, imagen_perfil = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?',
                [
                    nombre,
                    telefono,
                    google_id || row.google_id || null,
                    imagen_perfil || row.imagen_perfil || null,
                    row.id
                ],
                function (updateErr) {
                    if (updateErr) return callback(updateErr);
                    callback(null, row.id);
                }
            );
        } else {
            db.run(
                'INSERT INTO clientes (nombre, email, telefono, google_id, imagen_perfil) VALUES (?, ?, ?, ?, ?)',
                [nombre, email, telefono || null, google_id || null, imagen_perfil || null],
                function (insertErr) {
                    if (insertErr) return callback(insertErr);
                    callback(null, this.lastID);
                }
            );
        }
    });
}

function saveOrder(order, callback) {
    const { cliente_id, direccion, ciudad, metodo_pago, subtotal, envio, total, items } = order;
    db.run(
        'INSERT INTO pedidos (cliente_id, direccion, ciudad, metodo_pago, subtotal, envio, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [cliente_id, direccion, ciudad, metodo_pago, subtotal, envio, total],
        function (err) {
            if (err) return callback(err);
            const pedidoId = this.lastID;
            const stmt = db.prepare(`INSERT INTO pedido_items
                (pedido_id, nombre_producto, cantidad, precio_unitario, total_item, talla, imagen_personalizada, notas_personalizacion)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
            items.forEach(item => {
                stmt.run(
                    pedidoId,
                    item.nombre_producto,
                    item.cantidad,
                    item.precio_unitario,
                    item.total_item,
                    item.talla || null,
                    item.imagen_personalizada || null,
                    item.notas_personalizacion || null
                );
            });
            stmt.finalize(error => {
                if (error) return callback(error);
                callback(null, pedidoId);
            });
        }
    );
}

function buildOrderEmailHtml(orderData) {
    const esPersonalizado = orderData.total === 0;

    const itemsHtml = orderData.items
        .map(item => {
            const talla = item.talla ? ` (talla ${item.talla})` : '';
            const personalizado = item.imagen_personalizada ? ' — diseño personalizado adjunto' : '';
            const precio = esPersonalizado ? ' - Cotizacion pendiente' : ` - $${item.total_item.toLocaleString('es-CO')}`;
            return `<li>${item.nombre_producto}${talla} x${item.cantidad}${precio}${personalizado}</li>`;
        })
        .join('');

    const bloqueTotales = esPersonalizado
        ? `<p>Tu pedido es personalizado, asi que el precio final se confirma por WhatsApp segun el diseño y la cantidad.</p>`
        : `
            <p><strong>Subtotal:</strong> $${orderData.subtotal.toLocaleString('es-CO')}</p>
            <p><strong>Envio:</strong> $${orderData.envio.toLocaleString('es-CO')}</p>
            <p><strong>Total:</strong> $${orderData.total.toLocaleString('es-CO')}</p>
        `;

    const bloqueDireccion = esPersonalizado
        ? ''
        : `
            <h3>Datos de envio</h3>
            <p>${orderData.direccion}, ${orderData.ciudad}</p>
        `;

    return `
        <div style="font-family: Arial, sans-serif; color: #111;">
            <h2>Gracias por tu pedido en C&E Urban Wear</h2>
            <p>Hola <strong>${orderData.nombre}</strong>,</p>
            <p>Hemos recibido tu pedido. En breve te contactaremos por WhatsApp para coordinar el pago y el envio.</p>
            <h3>Resumen del pedido</h3>
            <ul>${itemsHtml}</ul>
            ${bloqueTotales}
            ${bloqueDireccion}
            <p><strong>Telefono:</strong> ${orderData.telefono}</p>
            <p><strong>Metodo de pago preferido:</strong> ${orderData.metodo_pago}</p>
            <p>Gracias por confiar en C&E Urban Wear.</p>
        </div>
    `;
}

function buildPaymentConfirmedEmailHtml(orderData) {
    return `
        <div style="font-family: Arial, sans-serif; color: #111;">
            <h2>Tu pago fue confirmado</h2>
            <p>Hola <strong>${orderData.nombre}</strong>,</p>
            <p>Confirmamos que recibimos el pago de tu pedido <strong>#${orderData.pedidoId}</strong> por un total de <strong>$${orderData.total.toLocaleString('es-CO')}</strong>.</p>
            <p>Estamos preparando tu pedido para el envio. Te avisaremos por WhatsApp cuando salga.</p>
            <p>Gracias por confiar en C&E Urban Wear.</p>
        </div>
    `;
}

app.post('/api/orders', async (req, res) => {
    const { nombre, email, direccion, ciudad, telefono, metodo_pago, carrito, subtotal, envio, total, googleId, imagen } = req.body;
    if (!nombre || !email || !direccion || !ciudad || !telefono || !metodo_pago || !Array.isArray(carrito) || carrito.length === 0) {
        return res.status(400).json({ error: 'Faltan datos requeridos en la orden.' });
    }

    saveCustomer({ nombre, email, telefono, google_id: googleId, imagen_perfil: imagen }, (customerErr, cliente_id) => {
        if (customerErr) {
            console.error(customerErr);
            return res.status(500).json({ error: 'Error guardando cliente.' });
        }

        const orderData = {
            cliente_id,
            direccion,
            ciudad,
            metodo_pago,
            subtotal,
            envio,
            total,
            items: carrito.map(item => ({
                nombre_producto: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                total_item: item.cantidad * item.precio,
                talla: item.talla || null,
                imagen_personalizada: item.imagen_personalizada || null,
                notas_personalizacion: item.notas_personalizacion || null
            }))
        };

        saveOrder(orderData, async (orderErr, pedidoId) => {
            if (orderErr) {
                console.error(orderErr);
                return res.status(500).json({ error: 'Error guardando pedido.' });
            }

            try {
                const transporter = await createTransporter();
                const info = await transporter.sendMail({
                    from: process.env.FROM_EMAIL || 'C&E Urban Wear <pedidos@urbandriveaccesorios.online>',
                    to: email,
                    subject: `Pedido #${pedidoId} recibido - C&E Urban Wear`,
                    html: buildOrderEmailHtml({
                        nombre,
                        items: orderData.items,
                        subtotal,
                        envio,
                        total,
                        direccion,
                        ciudad,
                        telefono,
                        metodo_pago
                    })
                });

                db.run('UPDATE pedidos SET email_pedido_enviado = 1 WHERE id = ?', [pedidoId]);
                res.json({ success: true, pedidoId, emailInfo: info });
            } catch (sendErr) {
                console.error(sendErr);
                res.status(200).json({ success: true, pedidoId, warning: 'Pedido guardado, pero no se pudo enviar el correo.' });
            }
        });
    });
});

function validarClaveAdmin(req, res, next) {
    const claveRecibida = req.headers['x-admin-key'] || req.body?.claveAdmin || req.query?.claveAdmin;
    const claveCorrecta = process.env.ADMIN_SECRET_KEY;

    if (!claveCorrecta) {
        console.error('ADMIN_SECRET_KEY no esta configurada en el .env del servidor.');
        return res.status(500).json({ error: 'El servidor no tiene configurada la clave de administrador.' });
    }

    if (!claveRecibida || claveRecibida !== claveCorrecta) {
        return res.status(401).json({ error: 'Clave de administrador invalida o ausente.' });
    }

    next();
}

app.get('/api/orders/pendientes', validarClaveAdmin, (req, res) => {
    const query = `SELECT p.id, p.total, p.estado, p.metodo_pago, p.creado_en, c.nombre, c.email, c.telefono
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.estado = 'pendiente'
        ORDER BY p.creado_en DESC
        LIMIT 50`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al recuperar pedidos.' });
        }
        res.json({ pedidos: rows });
    });
});

app.post('/api/orders/:id/confirmar-pago', validarClaveAdmin, async (req, res) => {
    const pedidoId = parseInt(req.params.id);
    if (!pedidoId) {
        return res.status(400).json({ error: 'Id de pedido invalido.' });
    }

    const query = `SELECT p.id, p.total, c.nombre, c.email
        FROM pedidos p
        LEFT JOIN clientes c ON p.cliente_id = c.id
        WHERE p.id = ?`;

    db.get(query, [pedidoId], async (err, pedido) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error buscando el pedido.' });
        }
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado.' });
        }

        db.run(
            "UPDATE pedidos SET estado = 'pagado', pago_confirmado_en = CURRENT_TIMESTAMP WHERE id = ?",
            [pedidoId]
        );

        if (!pedido.email) {
            return res.json({ success: true, warning: 'Pedido marcado como pagado, pero el cliente no tiene email registrado.' });
        }

        try {
            const transporter = await createTransporter();
            await transporter.sendMail({
                from: process.env.FROM_EMAIL || 'C&E Urban Wear <pedidos@urbandriveaccesorios.online>',
                to: pedido.email,
                subject: `Pago confirmado - Pedido #${pedido.id} - C&E Urban Wear`,
                html: buildPaymentConfirmedEmailHtml({
                    nombre: pedido.nombre,
                    pedidoId: pedido.id,
                    total: pedido.total
                })
            });
            db.run('UPDATE pedidos SET email_pago_enviado = 1 WHERE id = ?', [pedidoId]);
            res.json({ success: true });
        } catch (sendErr) {
            console.error(sendErr);
            res.status(200).json({ success: true, warning: 'Pago confirmado, pero no se pudo enviar el correo.' });
        }
    });
});

app.post('/api/auth/google', (req, res) => {
    const { googleId, nombre, email, imagen } = req.body;
    if (!googleId || !nombre || !email) {
        return res.status(400).json({ error: 'Faltan datos de autenticación de Google.' });
    }

    saveCustomer({
        nombre,
        email,
        telefono: '',
        google_id: googleId,
        imagen_perfil: imagen || null
    }, (err, cliente_id) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error guardando usuario.' });
        }

        res.json({ success: true, usuario: { id: cliente_id, nombre, email, imagen } });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
