function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

window.handleCredentialResponse = function(response) {
    const responsePayload = decodeJwtResponse(response.credential);

    console.log("Nombre: " + responsePayload.name);
    console.log("Email: " + responsePayload.email);
    console.log("Foto: " + responsePayload.picture);

    document.querySelector('.auth-help').style.display = 'none';

    document.getElementById('logged-user').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');

    document.getElementById('user-picture').src = responsePayload.picture;
    document.getElementById('user-name').textContent = responsePayload.name;
    document.getElementById('user-email').textContent = responsePayload.email;

    localStorage.setItem('usuarioGoogle', JSON.stringify(responsePayload));
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('usuarioGoogle');
    
    window.location.reload();
});

window.onload = function() {
    const usuarioGuardado = localStorage.getItem('usuarioGoogle');
    
    if (usuarioGuardado) {
        const responsePayload = JSON.parse(usuarioGuardado);
        
        document.querySelector('.g_id_signin').style.display = 'none';
        document.querySelector('.auth-help').style.display = 'none';
        
        document.getElementById('logged-user').classList.remove('hidden');
        document.getElementById('logout-btn').classList.remove('hidden');
        
        document.getElementById('user-picture').src = responsePayload.picture;
        document.getElementById('user-name').textContent = responsePayload.name;
        document.getElementById('user-email').textContent = responsePayload.email;
    }
}