// 1. Función para desencriptar la respuesta de Google
function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// 2. Esta es la función que Google busca cuando el inicio de sesión es exitoso
window.handleCredentialResponse = function(response) {
    // Desencriptamos los datos del usuario
    const responsePayload = decodeJwtResponse(response.credential);

    // Mostramos los datos en la consola (opcional, para que veas qué llega)
    console.log("Nombre: " + responsePayload.name);
    console.log("Email: " + responsePayload.email);
    console.log("Foto: " + responsePayload.picture);

    // 3. Actualizamos la página web para mostrar el perfil
    // Ocultamos el botón de Google y el formulario manual
    document.querySelector('.g_id_signin').style.display = 'none';
    document.querySelector('.auth-help').style.display = 'none';

    // Mostramos la tarjeta del usuario y el botón de cerrar sesión
    document.getElementById('logged-user').classList.remove('hidden');
    document.getElementById('logout-btn').classList.remove('hidden');

    // Insertamos la foto, el nombre y el correo en el HTML
    document.getElementById('user-picture').src = responsePayload.picture;
    document.getElementById('user-name').textContent = responsePayload.name;
    document.getElementById('user-email').textContent = responsePayload.email;

    // Guardamos la sesión en el navegador para que no se cierre si recargamos la página
    localStorage.setItem('usuarioGoogle', JSON.stringify(responsePayload));
}

// 4. Configurar el botón de Cerrar Sesión
document.getElementById('logout-btn').addEventListener('click', () => {
    // Borramos los datos del navegador
    localStorage.removeItem('usuarioGoogle');
    
    // Recargamos la página para volver a mostrar el botón de inicio de sesión
    window.location.reload();
});

// 5. Comprobar si ya hay una sesión iniciada al recargar la página
window.onload = function() {
    const usuarioGuardado = localStorage.getItem('usuarioGoogle');
    
    if (usuarioGuardado) {
        // Si hay un usuario guardado, ejecutamos la actualización visual de una vez
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