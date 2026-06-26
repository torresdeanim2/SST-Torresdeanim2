// ═══════════════════════════════════════════════
//  APP.JS — Coordinador principal
//  Público: Dashboard, Documentos, Cotizaciones, Habeas Data
//  Privado (requiere login): Ejecución 2026, Herramientas Admin
// ═══════════════════════════════════════════════

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const SECCIONES_PRIVADAS = ['ejecucion', 'herramientas'];

window.edificioConfig  = null;
window.isLoggedIn      = false;
window._seccionesInit  = {};
window._pendingSection = null;

// ─── Toast ────────────────────────────────────────
window.mostrarToast = function(mensaje, tipo) {
    var t = document.getElementById('toast');
    t.textContent = mensaje;
    t.className = 'toast' + (tipo ? ' ' + tipo : '');
    t.classList.remove('hidden');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() { t.classList.add('hidden'); }, 3200);
};

// ─── Navegación ───────────────────────────────────
window.mostrarSeccion = function(nombre) {
    if (SECCIONES_PRIVADAS.indexOf(nombre) !== -1 && !window.isLoggedIn) {
        window._pendingSection = nombre;
        abrirModalLogin();
        return;
    }

    document.querySelectorAll('.content-section').forEach(function(s) {
        s.classList.add('hidden'); s.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn, .nav-item').forEach(function(b) {
        b.classList.remove('active');
    });

    var sec = document.getElementById('section-' + nombre);
    if (sec) { sec.classList.remove('hidden'); sec.classList.add('active'); }
    document.querySelectorAll('[data-section="' + nombre + '"]').forEach(function(b) {
        b.classList.add('active');
    });

    if (!window._seccionesInit[nombre]) {
        window._seccionesInit[nombre] = true;
        switch (nombre) {
            case 'dashboard':    if (typeof initDashboard === 'function')    initDashboard(); break;
            case 'documentos':   if (typeof initDocumentos === 'function')   initDocumentos(); break;
            case 'ejecucion':    if (typeof initEjecucion === 'function')    initEjecucion(); break;
            case 'herramientas': if (typeof initHerramientas === 'function') initHerramientas(); break;
            case 'cotizaciones': if (typeof initCotizaciones === 'function') initCotizaciones(); break;
            case 'habeas-data':  if (typeof initHabeasData === 'function')   initHabeasData(); break;
        }
    }
};

// ─── Modal Login ──────────────────────────────────
window.abrirModalLogin = function() {
    document.getElementById('modal-login').classList.remove('hidden');
    document.getElementById('modal-login-user').value = '';
    document.getElementById('modal-login-pass').value = '';
    document.getElementById('modal-login-error').classList.add('hidden');
    setTimeout(function() { document.getElementById('modal-login-user').focus(); }, 100);
};

window.cerrarModalLogin = function() {
    document.getElementById('modal-login').classList.add('hidden');
    window._pendingSection = null;
};

// ─── Login / Logout ───────────────────────────────
window.hacerLogin = function() {
    window.isLoggedIn = true;
    var cfg = window.edificioConfig;
    document.getElementById('sb-usuario').textContent = cfg.admin_user || 'Admin';

    var badge   = document.getElementById('admin-badge');
    var btnOut  = document.getElementById('btn-logout');
    var btnOutSb = document.getElementById('btn-logout-sb');
    if (badge)   badge.classList.remove('hidden');
    if (btnOut)  btnOut.classList.remove('hidden');
    if (btnOutSb) btnOutSb.classList.remove('hidden');

    document.getElementById('modal-login').classList.add('hidden');
    var destino = window._pendingSection || 'dashboard';
    window._pendingSection = null;
    window._seccionesInit[destino] = false;
    window.mostrarSeccion(destino);
};

window.hacerLogout = function() {
    window.isLoggedIn = false;
    var badge   = document.getElementById('admin-badge');
    var btnOut  = document.getElementById('btn-logout');
    var btnOutSb = document.getElementById('btn-logout-sb');
    if (badge)   badge.classList.add('hidden');
    if (btnOut)  btnOut.classList.add('hidden');
    if (btnOutSb) btnOutSb.classList.add('hidden');
    document.getElementById('sb-usuario').textContent = '';
    window._seccionesInit = {};
    window.mostrarSeccion('dashboard');
};

window.abrirSidebar = function() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
};

window.cerrarSidebar = function() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
};

// ─── Inicialización ───────────────────────────────
async function initApp() {
    try {
        var resp = await fetch('datos-edificio.json');
        window.edificioConfig = await resp.json();
        var cfg = window.edificioConfig;

        document.documentElement.style.setProperty('--primary',   cfg.color_primary);
        document.documentElement.style.setProperty('--secondary', cfg.color_secondary);
        document.documentElement.style.setProperty('--accent',    cfg.color_secondary);

        var setTxt = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; };
        setTxt('header-emoji',    cfg.emoji);
        setTxt('header-nombre',   cfg.nombre);
        setTxt('header-nit',      'NIT: ' + cfg.nit + ' · ' + cfg.direccion);
        setTxt('sb-emoji',        cfg.emoji);
        setTxt('sb-nombre',       cfg.nombre);
        document.title = cfg.emoji + ' SG-SST | ' + cfg.nombre;

        var ahora = new Date();
        setTxt('header-mes-anio', MESES[ahora.getMonth()] + ' ' + ahora.getFullYear());

        document.querySelectorAll('[data-section]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                window.mostrarSeccion(btn.dataset.section);
                window.cerrarSidebar();
            });
        });

        document.getElementById('btn-sidebar-open').addEventListener('click', window.abrirSidebar);
        document.getElementById('btn-logout').addEventListener('click', window.hacerLogout);
        document.getElementById('btn-logout-sb').addEventListener('click', window.hacerLogout);

        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('main-app').classList.remove('hidden');
        window.mostrarSeccion('dashboard');

    } catch (err) {
        console.error('Error iniciando app:', err);
        document.getElementById('loading-screen').innerHTML =
            '<div class="loader-box"><p style="color:#ef4444;padding:20px;">⚠️ Error al cargar datos-edificio.json<br><small>' + err.message + '</small></p></div>';
    }
}

document.addEventListener('DOMContentLoaded', initApp);
