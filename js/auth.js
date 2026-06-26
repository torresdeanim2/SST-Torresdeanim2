// ═══════════════════════════════════════════════
//  AUTH.JS — Login modal para secciones protegidas
//  (Ejecución 2026 y Herramientas Admin)
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

    var form   = document.getElementById('modal-login-form');
    var errMsg = document.getElementById('modal-login-error');

    if (!form) return;

    form.addEventListener('submit', function(e) {
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

        if (usuario === cfg.admin_user && contrasena === cfg.admin_pass) {
            window.hacerLogin();
        } else {
            errMsg.textContent = 'Usuario o contraseña incorrectos.';
            errMsg.classList.remove('hidden');
            document.getElementById('modal-login-pass').value = '';
        }
    });

});
