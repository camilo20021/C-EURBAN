document.addEventListener('DOMContentLoaded', () => {
    const loggedUserCard = document.getElementById('logged-user');
    const userPicture = document.getElementById('user-picture');
    const userName = document.getElementById('user-name');
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const manualForm = document.getElementById('manual-register');
    const googleButtonWrap = document.querySelector('.g_id_signin');

    function setUser(user) {
        localStorage.setItem('ceurbanUser', JSON.stringify(user));
        if (user && user.nombre) {
            if (userPicture) userPicture.src = user.imagen || 'IMAGENES/favicon.png';
            if (userName) userName.textContent = user.nombre;
            if (userEmail) userEmail.textContent = user.email;
            loggedUserCard?.classList.remove('hidden');
            logoutBtn?.classList.remove('hidden');
            googleButtonWrap?.classList.add('hidden');
        } else {
            loggedUserCard?.classList.add('hidden');
            logoutBtn?.classList.add('hidden');
            googleButtonWrap?.classList.remove('hidden');
        }
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error leyendo token de Google', error);
            return null;
        }
    }

    async function saveGoogleUser(payload, credential = '') {
        const user = {
            googleId: payload.sub || payload.googleId || `manual-${Date.now()}`,
            nombre: payload.name,
            email: payload.email,
            imagen: payload.picture || payload.pictureUrl || 'IMAGENES/favicon.png',
            credential
        };

        try {
            await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
        } catch (error) {
            console.warn('No se pudo guardar el usuario en el servidor:', error);
        }

        setUser(user);
    }

    // Llamado por el botón declarativo de Google (data-callback en login.html)
    window.handleCredentialResponse = async function (response) {
        const payload = parseJwt(response.credential);
        if (!payload) {
            alert('No se pudo iniciar sesion con Google. Intenta de nuevo.');
            return;
        }
        await saveGoogleUser(payload, response.credential);
    };

    const storedUser = localStorage.getItem('ceurbanUser');
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('ceurbanUser');
        setUser(null);
    });

    manualForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nombre = document.getElementById('manual-name').value.trim();
        const email = document.getElementById('manual-email').value.trim();

        if (!nombre || !email) {
            alert('Completa nombre y correo para continuar.');
            return;
        }

        await saveGoogleUser({
            sub: `manual-${Date.now()}`,
            name: nombre,
            email,
            picture: 'IMAGENES/favicon.png'
        });
    });
});
