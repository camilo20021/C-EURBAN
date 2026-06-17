require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { db, initialize } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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
            const stmt = db.prepare('INSERT INTO pedido_items (pedido_id, nombre_producto, cantidad, precio_unitario, total_item) VALUES (?, ?, ?, ?, ?)');
            items.forEach(item => {
                stmt.run(pedidoId, item.nombre_producto, item.cantidad, item.precio_unitario, item.total_item);
            });
            stmt.finalize(error => {
                if (error) return callback(error);
                callback(null, pedidoId);
            });
        }
    );
}

function buildEmailHtml(orderData) {
    const itemsHtml = orderData.items
        .map(item => `<li>${item.nombre_producto} x${item.cantidad} - $${item.total_item.toLocaleString()}</li>`)
        .join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #111;">
            <h2>Gracias por tu compra en C&E Urban</h2>
            <p>Hola <strong>${orderData.nombre}</strong>,</p>
            <p>Hemos recibido tu pedido y estamos procesándolo.</p>
            <h3>Resumen de compra</h3>
            <ul>${itemsHtml}</ul>
            <p><strong>Subtotal:</strong> $${orderData.subtotal.toLocaleString()}</p>
            <p><strong>Envío:</strong> $${orderData.envio.toLocaleString()}</p>
            <p><strong>Total:</strong> $${orderData.total.toLocaleString()}</p>
            <h3>Datos de envío</h3>
            <p>${orderData.direccion}, ${orderData.ciudad}</p>
            <p><strong>Teléfono:</strong> ${orderData.telefono}</p>
            <p><strong>Método de pago:</strong> ${orderData.metodo_pago}</p>
            <p>Gracias por confiar en C&E Urban.</p>
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
                total_item: item.cantidad * item.precio
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
                    from: process.env.FROM_EMAIL || 'C&E Urban <no-reply@ceurban.com>',
                    to: email,
                    subject: 'Gracias por tu compra en C&E Urban',
                    html: buildEmailHtml({
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

                res.json({ success: true, pedidoId, emailInfo: info });
            } catch (sendErr) {
                console.error(sendErr);
                res.status(500).json({ success: true, pedidoId, warning: 'Pedido guardado, pero no se pudo enviar el correo.' });
            }
        });
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
