// ═══════════════════════════════════════════════
//  AUTH.JS — Login modal para secciones protegidas
//  (Ejecución 2026 y Herramientas Admin)
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

    var form   = document.getElementById('modal-login-form');
    var errMsg = document.getElementById('modal-login-error');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        errMsg.classList.add('hidden');

        var usuario    = document.getElementById('modal-login-user').value.trim();
        var contrasena = document.getElementById('modal-login-pass').value;
        var cfg        = window.edificioConfig;

        if (!cfg) {
            errMsg.textContent = 'Sistema no cargado. Recarga la página.';
            errMsg.classList.remove('hidden');
            return;
        }

        if (await window.sstAuth.entrar(usuario, contrasena)) {
            window.hacerLogin();
        } else {
            errMsg.textContent = window.sstAuth.ultimoError || 'Correo o contraseña incorrectos.';
            errMsg.classList.remove('hidden');
            document.getElementById('modal-login-pass').value = '';
        }
    });

});

// La sesión recordada solo vale si Firebase Auth confirma que hay usuario
document.addEventListener('sst-auth', function(e) {
    if (!e.detail && window.isLoggedIn && window.hacerLogout) window.hacerLogout();
});
