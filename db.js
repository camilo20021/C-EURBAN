const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'store.db');
const db = new sqlite3.Database(dbPath);

function initialize() {
    db.serialize(() => {
        // TABLA DE CLIENTES
        db.run(`CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefono TEXT,
            google_id TEXT,
            imagen_perfil TEXT,
            creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP
        )`);

        // TABLA DE PEDIDOS
        db.run(`CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER,
            direccion TEXT,
            ciudad TEXT,
            metodo_pago TEXT,
            subtotal REAL NOT NULL,
            envio REAL NOT NULL DEFAULT 0,
            total REAL NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            pago_confirmado_en TEXT,
            email_pedido_enviado INTEGER DEFAULT 0,
            email_pago_enviado INTEGER DEFAULT 0,
            creado_en TEXT DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(cliente_id) REFERENCES clientes(id)
        )`);

        // TABLA DE ITEMS EN UN PEDIDO
        db.run(`CREATE TABLE IF NOT EXISTS pedido_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            nombre_producto TEXT NOT NULL,
            cantidad INTEGER NOT NULL DEFAULT 1,
            precio_unitario REAL NOT NULL,
            total_item REAL NOT NULL,
            talla TEXT,
            imagen_personalizada TEXT,
            notas_personalizacion TEXT,
            FOREIGN KEY(pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
        )`);

        db.all("PRAGMA table_info(clientes)", (err, rows) => {
            if (err) return;
            const columns = rows.map(col => col.name);
            if (!columns.includes('google_id')) {
                db.run('ALTER TABLE clientes ADD COLUMN google_id TEXT');
            }
            if (!columns.includes('imagen_perfil')) {
                db.run('ALTER TABLE clientes ADD COLUMN imagen_perfil TEXT');
            }
        });

        db.all("PRAGMA table_info(pedidos)", (err, rows) => {
            if (err) return;
            const columns = rows.map(col => col.name);
            if (!columns.includes('pago_confirmado_en')) {
                db.run('ALTER TABLE pedidos ADD COLUMN pago_confirmado_en TEXT');
            }
            if (!columns.includes('email_pedido_enviado')) {
                db.run('ALTER TABLE pedidos ADD COLUMN email_pedido_enviado INTEGER DEFAULT 0');
            }
            if (!columns.includes('email_pago_enviado')) {
                db.run('ALTER TABLE pedidos ADD COLUMN email_pago_enviado INTEGER DEFAULT 0');
            }
        });

        db.all("PRAGMA table_info(pedido_items)", (err, rows) => {
            if (err) return;
            const columns = rows.map(col => col.name);
            if (!columns.includes('talla')) {
                db.run('ALTER TABLE pedido_items ADD COLUMN talla TEXT');
            }
            if (!columns.includes('imagen_personalizada')) {
                db.run('ALTER TABLE pedido_items ADD COLUMN imagen_personalizada TEXT');
            }
            if (!columns.includes('notas_personalizacion')) {
                db.run('ALTER TABLE pedido_items ADD COLUMN notas_personalizacion TEXT');
            }
        });
    });
}

module.exports = {
    db,
    initialize
};
