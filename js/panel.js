const supa = supabase.createClient(
    'https://vtztpvjbhwlnspjpwhim.supabase.co',
    'sb_publishable_FdF3E71-r0Ku4NVb-uSN7A_yNvIiTqv'
);

const vistaLogin = document.getElementById('vista-login');
const vistaPanel = document.getElementById('vista-panel');
let filtroActual = 'pendiente';

// ¿Ya hay sesión iniciada?
supa.auth.getSession().then(({ data }) => {
    if (data.session) mostrarPanel();
});

document.getElementById('btn-entrar').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-pass').value;
    const { error } = await supa.auth.signInWithPassword({ email, password });
    if (error) {
        document.getElementById('login-error').textContent = 'Correo o contraseña incorrectos';
    } else {
        mostrarPanel();
    }
});

document.getElementById('btn-salir').addEventListener('click', async () => {
    await supa.auth.signOut();
    location.reload();
});

document.getElementById('filtros').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    document.querySelectorAll('#filtros button').forEach(b => b.classList.remove('activo'));
    btn.classList.add('activo');
    filtroActual = btn.dataset.estado;
    cargarPedidos();
});

function mostrarPanel() {
            vistaLogin.classList.add('oculto');
            vistaPanel.classList.remove('oculto');
            cargarPedidos();
            cargarStats();
        }

async function cargarPedidos() {
    let consulta = supa.from('pedidos')
        .select('*, pedido_items(*)')
        .order('creado_en', { ascending: false });

    if (filtroActual !== 'todos') {
        consulta = consulta.eq('estado', filtroActual);
    }

    const { data: pedidos, error } = await consulta;
    const lista = document.getElementById('lista-pedidos');

    if (error) {
        lista.innerHTML = `<p id="sin-pedidos">Error cargando pedidos: ${error.message}</p>`;
        return;
    }
    if (!pedidos.length) {
        lista.innerHTML = `<p id="sin-pedidos">No hay pedidos en este estado.</p>`;
        return;
    }

    lista.innerHTML = pedidos.map(p => `
        <div class="pedido">
            <div class="pedido-top">
                <h3>Pedido #${p.id} — $${Number(p.total).toLocaleString('es-CO')}</h3>
                <span class="estado ${p.estado}">${p.estado.toUpperCase()}</span>
            </div>
            <div class="pedido-datos">
                <div class="pedido-datos">
                        👤 ${p.cliente_nombre} · 📞 ${p.cliente_telefono}<br>
                        ✉️ ${p.cliente_email || 'Sin correo'}<br>
                        📍 ${p.cliente_direccion || ''}, ${p.cliente_ciudad || ''} · 💳 ${p.metodo_pago || '-'}<br>
                        🕐 ${new Date(p.creado_en).toLocaleString('es-CO')}
                </div>
            </div>
            <div class="pedido-items">
                ${p.pedido_items.map(i =>
                    `• ${i.nombre_producto}${i.talla ? ' — Talla ' + i.talla : ''} x${i.cantidad} — $${Number(i.precio_unitario * i.cantidad).toLocaleString('es-CO')}`
                ).join('<br>')}
            </div>
            <div class="pedido-acciones">
                <select id="estado-${p.id}">
                    ${['pendiente','confirmado','enviado','entregado','cancelado'].map(e =>
                        `<option value="${e}" ${e === p.estado ? 'selected' : ''}>${e}</option>`
                    ).join('')}
                </select>
                <button onclick="cambiarEstado(${p.id})">Actualizar</button>
            </div>
        </div>
    `).join('');
}

async function cambiarEstado(id) {
    const nuevoEstado = document.getElementById(`estado-${id}`).value;
    const { error } = await supa.from('pedidos').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
    } else {
        cargarPedidos();
    }
}
// ---- PESTAÑAS ----
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
                btn.classList.add('activo');
                const tab = btn.dataset.tab;
                document.getElementById('titulo-seccion').textContent = tab === 'pedidos' ? '📦 Pedidos' : '📋 Inventario';
                document.getElementById('filtros').classList.toggle('oculto', tab !== 'pedidos');
                document.getElementById('lista-pedidos').classList.toggle('oculto', tab !== 'pedidos');
                document.getElementById('resumen-stats').classList.toggle('oculto', tab !== 'pedidos');
                document.getElementById('vista-inventario').classList.toggle('oculto', tab !== 'inventario');
                if (tab === 'inventario') cargarInventario();
            });
        });

        // ---- ESTADÍSTICAS ----
        async function cargarStats() {
            const hoy = new Date(); hoy.setHours(0,0,0,0);
            const semana = new Date(); semana.setDate(semana.getDate() - 7);

            const { data: pedidos } = await supa.from('pedidos')
                .select('total, estado, creado_en')
                .neq('estado', 'cancelado');

            if (!pedidos) return;
            const vendidoHoy = pedidos.filter(p => new Date(p.creado_en) >= hoy)
                .reduce((s, p) => s + Number(p.total), 0);
            const vendidoSemana = pedidos.filter(p => new Date(p.creado_en) >= semana)
                .reduce((s, p) => s + Number(p.total), 0);
            const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;

            document.getElementById('resumen-stats').innerHTML = `
                <div class="stat-caja">Hoy<div class="valor">$${vendidoHoy.toLocaleString('es-CO')}</div></div>
                <div class="stat-caja">Últimos 7 días<div class="valor">$${vendidoSemana.toLocaleString('es-CO')}</div></div>
                <div class="stat-caja">Pendientes<div class="valor">${pendientes}</div></div>
            `;
        }

        // ---- INVENTARIO ----
        async function cargarInventario() {
            const { data: productos, error } = await supa.from('productos')
                .select('*')
                .order('categoria')
                .order('nombre');

            const lista = document.getElementById('lista-inventario');
            if (error) { lista.innerHTML = `<p id="sin-pedidos">Error: ${error.message}</p>`; return; }

            lista.innerHTML = productos.map(p => {
                const clase = p.stock === 0 ? 'agotado' : (p.stock <= (p.stock_minimo || 3) ? 'stock-bajo' : '');
                return `
                <div class="inv-fila ${clase}">
                    <div class="inv-nombre">
                        ${p.nombre} ${!p.activo ? '(inactivo)' : ''}
                        <small>${p.categoria} · ${p.stock === 0 ? '⛔ Agotado' : p.stock <= (p.stock_minimo || 3) ? '⚠️ Stock bajo' : 'OK'}</small>
                    </div>
                    <div><label>Stock</label><input type="number" min="0" id="stock-${p.id}" value="${p.stock}"></div>
                    <div><label>Precio</label><input type="number" min="0" id="precio-${p.id}" value="${p.precio}"></div>
                    <button onclick="guardarProducto(${p.id})">Guardar</button>
                </div>`;
            }).join('');
        }

        async function guardarProducto(id) {
            const stock = parseInt(document.getElementById(`stock-${id}`).value) || 0;
            const precio = Number(document.getElementById(`precio-${id}`).value) || 0;
            const { error } = await supa.from('productos').update({ stock, precio }).eq('id', id);
            if (error) alert('Error: ' + error.message);
            else cargarInventario();
        }
