
class UserDashboardPanel {
    constructor() {
        this.panelHTML = `
            <div id="user-dashboard-panel" class="user-dashboard-panel">
                <div class="dashboard-header">
                    <h2>Mi Panel</h2>
                    <button class="close-dashboard" id="close-dashboard">✖</button>
                </div>

                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="loyalty">⭐ Lealtad</button>
                    <button class="tab-btn" data-tab="favorites">❤️ Favoritos</button>
                    <button class="tab-btn" data-tab="history">📜 Historial</button>
                    <button class="tab-btn" data-tab="points">🎁 Puntos</button>
                </div>

                <div class="tab-content active" id="tab-loyalty">
                    <div class="loyalty-section">
                        <h3>Nivel de Membresía</h3>
                        <div id="loyalty-info" class="loyalty-info">
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="tab-favorites">
                    <div id="favorites-list" class="favorites-list">
                    </div>
                </div>

                <div class="tab-content" id="tab-history">
                    <div id="history-list" class="history-list">
                    </div>
                </div>

                <div class="tab-content" id="tab-points">
                    <div class="points-section">
                        <h3>Mis Puntos</h3>
                        <div id="points-info" class="points-info">
                        </div>
                    </div>
                </div>
            </div>
            <div id="dashboard-overlay" class="dashboard-overlay"></div>
        `;

        this.style = `
            <style>
                .user-dashboard-panel {
                    position: fixed;
                    right: -400px;
                    top: 0;
                    width: 400px;
                    height: 100vh;
                    background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
                    border: 1px solid rgba(255, 102, 0, 0.2);
                    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    transition: right 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    overflow-y: auto;
                }

                .user-dashboard-panel.active {
                    right: 0;
                }

                .dashboard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .dashboard-overlay.active {
                    opacity: 1;
                    pointer-events: auto;
                }

                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    position: sticky;
                    top: 0;
                    background: rgba(0, 0, 0, 0.3);
                }

                .dashboard-header h2 {
                    color: #ff6b35;
                    margin: 0;
                }

                .close-dashboard {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .close-dashboard:hover {
                    color: #ff6b35;
                    transform: rotate(90deg);
                }

                .dashboard-tabs {
                    display: flex;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.3);
                }

                .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                    font-size: 13px;
                    border-bottom: 2px solid transparent;
                }

                .tab-btn:hover {
                    color: #ff6b35;
                    background: rgba(255, 102, 0, 0.05);
                }

                .tab-btn.active {
                    color: #ff6b35;
                    border-bottom-color: #ff6b35;
                }

                .tab-content {
                    display: none;
                    padding: 20px;
                    animation: slideDown 0.3s ease;
                }

                .tab-content.active {
                    display: block;
                }

                .loyalty-section, .points-section {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 102, 0, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                }

                .loyalty-info, .points-info {
                    display: grid;
                    gap: 12px;
                }

                .loyalty-card {
                    background: linear-gradient(135deg, rgba(255, 102, 0, 0.1) 0%, rgba(255, 102, 0, 0.05) 100%);
                    border: 1px solid rgba(255, 102, 0, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                }

                .level-badge {
                    font-size: 32px;
                    margin: 10px 0;
                }

                .level-name {
                    font-size: 18px;
                    font-weight: bold;
                    color: #ff6b35;
                }

                .level-benefit {
                    color: #ccc;
                    font-size: 13px;
                    margin-top: 8px;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 12px 0;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ff6b35, #ff8c5a);
                    transition: width 0.3s ease;
                }

                .favorites-list, .history-list {
                    display: grid;
                    gap: 12px;
                }

                .favorite-item, .history-item {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 12px;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .favorite-item img, .history-item img {
                    width: 60px;
                    height: 60px;
                    border-radius: 6px;
                    object-fit: cover;
                }

                .favorite-info, .history-info {
                    flex: 1;
                }

                .favorite-info h4, .history-info h4 {
                    margin: 0 0 4px 0;
                    color: #ff6b35;
                    font-size: 13px;
                }

                .favorite-price {
                    color: #ccc;
                    font-size: 12px;
                }

                .remove-favorite {
                    background: #f44336;
                    color: white;
                    border: none;
                    padding: 6px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .remove-favorite:hover {
                    background: #d32f2f;
                }

                .empty-message {
                    text-align: center;
                    color: #999;
                    padding: 40px 20px;
                }

                @media (max-width: 768px) {
                    .user-dashboard-panel {
                        width: 100%;
                        right: -100%;
                    }
                }
            </style>
        `;

        this.init();
    }

    init() {
        if (!document.querySelector('#dashboard-styles')) {
            document.head.insertAdjacentHTML('beforeend', this.style);
        }

        if (!document.getElementById('user-dashboard-panel')) {
            document.body.insertAdjacentHTML('beforeend', this.panelHTML);
        }

        this.panel = document.getElementById('user-dashboard-panel');
        this.overlay = document.getElementById('dashboard-overlay');
        this.setupListeners();
        this.updateContent();
    }

    setupListeners() {
        const closeBtn = this.panel.querySelector('.close-dashboard');
        const tabBtns = this.panel.querySelectorAll('.tab-btn');

        closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    open() {
        this.panel.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.updateContent();
    }

    close() {
        this.panel.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    switchTab(tabName) {
        const tabBtns = this.panel.querySelectorAll('.tab-btn');
        const tabContents = this.panel.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        this.panel.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        this.panel.querySelector(`#tab-${tabName}`).classList.add('active');
    }

    updateContent() {
        if (typeof loyalty === 'undefined') return;

        const loyaltyLevel = loyalty.getLevel();
        const points = loyalty.getPoints();
        const loyaltyInfo = this.panel.querySelector('#loyalty-info');
        
        const levelEmojis = { 'Bronze': '🥉', 'Silver': '🥈', 'Gold': '🥇', 'Platinum': '👑' };
        loyaltyInfo.innerHTML = `
            <div class="loyalty-card">
                <div class="level-badge">${levelEmojis[loyaltyLevel.name] || '⭐'}</div>
                <div class="level-name">${loyaltyLevel.name} Member</div>
                <div class="level-benefit">Descuento: ${(loyaltyLevel.discount * 100).toFixed(0)}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(100, (points / 5000) * 100)}%"></div>
                </div>
                <p style="color: #ccc; font-size: 12px; margin: 0;">
                    ${points} / 5000 puntos para Platinum
                </p>
            </div>
        `;

        const favoritesListEl = this.panel.querySelector('#favorites-list');
        const favorites = wishlist.getWishlist();
        
        if (favorites.length === 0) {
            favoritesListEl.innerHTML = '<div class="empty-message">No tienes favoritos aún</div>';
        } else {
            favoritesListEl.innerHTML = favorites.map(fav => `
                <div class="favorite-item">
                    <div style="width:50px;height:50px;border-radius:8px;background:${fav.color || '#1c2f6e'};flex-shrink:0;"></div>
                    <div class="favorite-info">
                        <h4>${fav.nombre}</h4>
                        <div class="favorite-price">$${fav.precio.toLocaleString('es-CO')}</div>
                    </div>
                    <button class="remove-favorite" data-remove-fav-id="${fav.id}">🗑️</button>
                </div>
            `).join('');
        }

        const historyListEl = this.panel.querySelector('#history-list');
        const history = viewHistory.getHistory();
        
        if (history.length === 0) {
            historyListEl.innerHTML = '<div class="empty-message">No tienes historial de búsqueda</div>';
        } else {
            historyListEl.innerHTML = history.map(item => `
                <div class="history-item">
                    <div style="width:50px;height:50px;border-radius:8px;background:${item.color || '#1c2f6e'};flex-shrink:0;"></div>
                    <div class="history-info">
                        <h4>${item.nombre}</h4>
                        <div class="favorite-price">$${item.precio.toLocaleString('es-CO')}</div>
                    </div>
                </div>
            `).join('');
        }

        const pointsInfo = this.panel.querySelector('#points-info');
        const totalSpent = loyalty.getTotalSpent();
        pointsInfo.innerHTML = `
            <div class="loyalty-card">
                <div style="font-size: 28px; font-weight: bold; color: #ff6b35;">${points}</div>
                <p style="color: #ccc; margin: 8px 0 0 0;">Puntos disponibles</p>
                <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 12px 0;">
                <p style="color: #ccc; font-size: 13px; margin: 0;"><strong>Total Gastado:</strong> $${totalSpent.toLocaleString('es-CO')}</p>
                <p style="color: #ccc; font-size: 13px; margin: 8px 0 0 0;"><strong>Compras Realizadas:</strong> ${loyalty.history.length}</p>
            </div>
        `;
    }
}

let userDashboard;

document.addEventListener('DOMContentLoaded', () => {
    userDashboard = new UserDashboardPanel();

    const userIcon = document.querySelector('.user-icon');
    if (userIcon) {
        userIcon.addEventListener('click', (e) => {
            const hayUsuario = localStorage.getItem('ceurbanUser');
            if (hayUsuario) {
                e.preventDefault();
                userDashboard.open();
            }
            // Si no hay sesion, deja que el link navegue normalmente a login.html
        });
    }
});

document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-remove-fav-id]');
    if (!btn) return;
    const id = parseInt(btn.dataset.removeFavId);
    wishlist.removeFromWishlist(id);
    userDashboard.updateContent();
});
