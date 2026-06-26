// ═══════════════════════════════════════════════
//  DASHBOARD.JS — Estado general, PAT 2026, grilla mensual
// ═══════════════════════════════════════════════

var ACTIVIDADES_PAT = [
    { id: 'supervision',  label: '🔍 Supervisión SST',          desc: 'Visita técnica mensual' },
    { id: 'inspeccion',   label: '📋 Inspección instalaciones', desc: 'Revisión física del edificio' },
    { id: 'induccion',    label: '🎓 Inducción contratistas',   desc: 'Capacitación SST mensual' },
    { id: 'mantenimiento',label: '🔧 Mantenimiento locativo',   desc: 'Según programa de mantenimiento' }
];

var MES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function initDashboard() {
    var sec = document.getElementById('section-dashboard');
    if (!sec) return;
    var cfg = window.edificioConfig;

    sec.innerHTML =
        '<div class="card" style="margin-bottom:20px;">' +
          '<div class="card-header"><span class="card-title">🏢 ' + cfg.nombre + '</span>' +
          '<span class="badge badge-success">SG-SST Activo 2026</span></div>' +
          '<div class="stats-grid" style="margin-top:6px;">' +
            mkStat('🏠', cfg.unidades,          'Unidades') +
            mkStat('👷', cfg.trabajadores,       'Trabajadores') +
            mkStat('🤝', cfg.contratistas_count, 'Contratistas') +
            mkStat('📋', 'Res. 0312/2019',       'Normativa') +
          '</div>' +
          '<div style="margin-top:14px;font-size:0.88rem;color:var(--text-gray);">' +
            '📍 ' + cfg.direccion + ' &nbsp;|&nbsp; 📧 ' + cfg.email +
            ' &nbsp;|&nbsp; 📱 Adm: ' + cfg.admin_nombre + ' · ' + cfg.admin_tel +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📊 Progreso PAT 2026</span>' +
          '<span id="dash-pat-pct" class="badge badge-gray">Cargando...</span></div>' +
          '<div class="progress-wrap">' +
            '<div class="progress-label"><span>Plan Anual de Trabajo</span><span id="dash-pat-label">0 / 48 actividades</span></div>' +
            '<div class="progress-track"><div id="dash-pat-bar" class="progress-fill" style="width:0%"></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">🗓️ Ejecución Mensual 2026</span>' +
          '<button class="btn-secondary" style="padding:6px 14px;font-size:0.82rem;" onclick="window.mostrarSeccion(\'ejecucion\')">Ver detalle →</button></div>' +
          '<div id="dash-meses-grid" class="meses-grid"></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">🗺️ Mapa de Evacuación</span>' +
          '<a href="assets/plano.png" target="_blank" class="btn-secondary" style="padding:6px 14px;font-size:0.82rem;">Ver en grande</a></div>' +
          '<div style="text-align:center;">' +
            '<img src="assets/plano.png" alt="Plano de evacuación" ' +
            'style="max-width:100%;border-radius:10px;border:2px solid var(--border);" ' +
            'onerror="this.outerHTML=\'<p style=\\\"padding:30px;color:var(--text-gray);text-align:center;\\\">📌 Plano aún no cargado. Reemplaza assets/plano.png con el plano de evacuación del edificio.</p>\'">' +
          '</div>' +
        '</div>';

    cargarProgresoPAT();
    renderMesesGrid();
}

function mkStat(icon, valor, label) {
    return '<div class="stat-card"><div class="stat-icon">' + icon + '</div>' +
           '<div class="stat-value">' + valor + '</div>' +
           '<div class="stat-label">' + label + '</div></div>';
}

function cargarProgresoPAT() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/ejecucion').once('value').then(function(snap) {
        var data = snap.val() || {};
        var completadas = 0, total = 12 * ACTIVIDADES_PAT.length;

        for (var m = 1; m <= 12; m++) {
            var clvMes = 'mes' + m;
            if (data[clvMes]) {
                ACTIVIDADES_PAT.forEach(function(act) {
                    if (data[clvMes][act.id] && data[clvMes][act.id].completado) completadas++;
                });
            }
        }

        var pct = Math.round((completadas / total) * 100);
        document.getElementById('dash-pat-bar').style.width = pct + '%';
        document.getElementById('dash-pat-label').textContent = completadas + ' / ' + total + ' actividades';
        var badge = document.getElementById('dash-pat-pct');
        badge.textContent = pct + '%';
        badge.className = 'badge ' + (pct >= 80 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger');
    }).catch(function() {
        document.getElementById('dash-pat-label').textContent = 'Error al cargar datos';
    });
}

function renderMesesGrid() {
    var cfg = window.edificioConfig;
    var grid = document.getElementById('dash-meses-grid');
    if (!grid) return;
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;

    window.db.ref('edificios/' + cfg.id + '/ejecucion').once('value').then(function(snap) {
        var data = snap.val() || {};
        var html = '';

        for (var m = 1; m <= 12; m++) {
            var clvMes = 'mes' + m;
            var mesData = data[clvMes] || {};
            var hechas = 0;
            ACTIVIDADES_PAT.forEach(function(act) {
                if (mesData[act.id] && mesData[act.id].completado) hechas++;
            });

            var estado = '';
            var esActual = m === mesActual;
            if (m > mesActual) {
                estado = 'pendiente';
            } else if (hechas === ACTIVIDADES_PAT.length) {
                estado = 'completado';
            } else if (hechas > 0) {
                estado = 'en-progreso';
            } else {
                estado = m < mesActual ? 'pendiente' : 'pendiente';
            }

            var etiEstado = hechas === ACTIVIDADES_PAT.length ? '✅' : hechas > 0 ? '⏳' : m < mesActual ? '⚠️' : '—';
            var m2 = String(m);

            html += '<div class="mes-card ' + estado + (esActual ? ' actual' : '') + '" ' +
                    'onclick="window.mostrarSeccion(\'ejecucion\')" title="' + MES_NOMBRES[m-1] + '">' +
                    '<span class="mes-num">' + etiEstado + '</span>' +
                    '<strong>' + MES_NOMBRES[m-1].substring(0,3) + '</strong>' +
                    '<br><small>' + hechas + '/' + ACTIVIDADES_PAT.length + '</small>' +
                    '</div>';
        }
        grid.innerHTML = html;
    });
}
