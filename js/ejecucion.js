// ═══════════════════════════════════════════════
//  EJECUCION.JS — Tabla mensual PAT 2026 + generador WhatsApp
// ═══════════════════════════════════════════════

var EJ_ACTOS = [
    { id: 'supervision',   label: '🔍 Supervisión SST' },
    { id: 'inspeccion',    label: '📋 Inspección instalaciones' },
    { id: 'induccion',     label: '🎓 Inducción contratistas' },
    { id: 'mantenimiento', label: '🔧 Mantenimiento locativo' }
];
var EJ_MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
var EJ_MESES_COMPLETO = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                          'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function initEjecucion() {
    var sec = document.getElementById('section-ejecucion');
    if (!sec) return;

    sec.innerHTML =
        '<div class="card">' +
          '<div class="card-header">' +
            '<span class="card-title">✅ Ejecución Constante 2026</span>' +
            '<button class="btn-secondary" style="padding:7px 16px;font-size:0.83rem;" onclick="generarResumenWhatsApp()">📱 Resumen WhatsApp</button>' +
          '</div>' +
          '<p style="color:var(--text-gray);font-size:0.88rem;margin-bottom:16px;">Marca cada actividad como completada al realizarla. Los cambios se guardan automáticamente en Firebase.</p>' +
          '<div class="table-wrap">' +
            '<table class="ej-table">' +
              '<thead><tr><th>Actividad</th>' +
              EJ_MESES.map(function(m,i){ return '<th class="ej-mes-header" style="text-align:center;min-width:55px;">' + m + '</th>'; }).join('') +
              '</tr></thead>' +
              '<tbody id="ej-tbody"></tbody>' +
            '</table>' +
          '</div>' +
        '</div>' +

        // Notas por mes
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📝 Observaciones por Mes</span></div>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;" id="ej-notas-grid"></div>' +
        '</div>' +

        // Modal WhatsApp
        '<div id="modal-wa" class="modal-overlay hidden">' +
          '<div class="modal-box">' +
            '<div class="modal-header">' +
              '<h3>📱 Resumen para WhatsApp</h3>' +
              '<button class="btn-icon" onclick="document.getElementById(\'modal-wa\').classList.add(\'hidden\')">✕</button>' +
            '</div>' +
            '<pre id="wa-texto" style="background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:16px;font-size:0.82rem;line-height:1.6;overflow-x:auto;white-space:pre-wrap;max-height:360px;overflow-y:auto;"></pre>' +
            '<div class="modal-footer">' +
              '<button class="btn-primary" style="background:#25D366;" onclick="copiarTextoWA()">📋 Copiar mensaje</button>' +
              '<button class="btn-secondary" onclick="document.getElementById(\'modal-wa\').classList.add(\'hidden\')">Cerrar</button>' +
            '</div>' +
          '</div>' +
        '</div>';

    cargarEjecucion();
}

var _ejData = {};

function cargarEjecucion() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/ejecucion').on('value', function(snap) {
        _ejData = snap.val() || {};
        renderEjecucionTabla();
        renderNotasMes();
    });
}

function renderEjecucionTabla() {
    var tbody = document.getElementById('ej-tbody');
    if (!tbody) return;
    var html = '';

    EJ_ACTOS.forEach(function(act) {
        html += '<tr><td style="font-weight:600;font-size:0.88rem;">' + act.label + '</td>';
        for (var m = 1; m <= 12; m++) {
            var clv = 'mes' + m;
            var completado = _ejData[clv] && _ejData[clv][act.id] && _ejData[clv][act.id].completado;
            var enlace = _ejData[clv] && _ejData[clv][act.id] && _ejData[clv][act.id].enlace;
            html += '<td class="ej-cell">' +
                '<input type="checkbox" class="ej-check" ' + (completado ? 'checked' : '') +
                ' onchange="toggleEjecucion(\'' + clv + '\',\'' + act.id + '\',this.checked)" title="Marcar como realizado">' +
                '<br><button class="ej-link-btn' + (enlace ? ' tiene-link' : '') + '" style="margin-top:3px;" ' +
                'onclick="abrirModalEnlaceEj(\'' + clv + '\',\'' + act.id + '\')">📎</button>' +
                '</td>';
        }
        html += '</tr>';
    });
    tbody.innerHTML = html;
}

function renderNotasMes() {
    var grid = document.getElementById('ej-notas-grid');
    if (!grid) return;
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;
    var html = '';

    for (var m = 1; m <= 12; m++) {
        var clv = 'mes' + m;
        var nota = (_ejData[clv] && _ejData[clv].observacion) || '';
        var esActual = m === mesActual;
        html += '<div style="border:' + (esActual ? '2px solid var(--primary)' : '1px solid var(--border)') + ';border-radius:10px;padding:12px;">' +
            '<strong style="display:block;margin-bottom:6px;color:var(--primary);font-size:0.85rem;">' + EJ_MESES_COMPLETO[m-1] + (esActual ? ' 📍' : '') + '</strong>' +
            '<textarea rows="2" style="width:100%;border:1px solid var(--border);border-radius:6px;padding:6px;font-size:0.82rem;resize:none;outline:none;" ' +
            'placeholder="Observaciones..." onblur="guardarObservacion(\'' + clv + '\',this.value)">' + nota + '</textarea>' +
            '</div>';
    }
    grid.innerHTML = html;
}

window.toggleEjecucion = function(clvMes, actId, checked) {
    var cfg = window.edificioConfig;
    var ref = window.db.ref('edificios/' + cfg.id + '/ejecucion/' + clvMes + '/' + actId);
    ref.update({ completado: checked, fecha: checked ? new Date().toLocaleDateString('es-CO') : null })
        .then(function() { mostrarToast(checked ? '✅ Actividad completada' : 'Actividad desmarcada'); })
        .catch(function() { mostrarToast('Error al guardar', 'error'); });
};

window.guardarObservacion = function(clvMes, texto) {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/ejecucion/' + clvMes).update({ observacion: texto });
};

// ─── Modal enlace ejecución ──────────────────────
var _ejLinkRuta = '';
window.abrirModalEnlaceEj = function(clvMes, actId) {
    _ejLinkRuta = 'edificios/' + window.edificioConfig.id + '/ejecucion/' + clvMes + '/' + actId;
    // Reutilizar modal de documentos
    document.getElementById('modal-enlace-titulo').textContent = '🔗 Enlace soporte: ' + actId + ' — ' + clvMes;
    document.getElementById('modal-enlace-input').value = '';
    document.getElementById('modal-enlace').classList.remove('hidden');
    // Temporalmente redirigir confirmar
    window._confirmEnlaceOverride = function() {
        var val = document.getElementById('modal-enlace-input').value.trim();
        if (!val || !val.startsWith('http')) { mostrarToast('Enlace no válido', 'error'); return; }
        window.db.ref(_ejLinkRuta).update({ enlace: val }).then(function() {
            mostrarToast('✅ Enlace guardado', 'success');
            cerrarModalEnlace();
        });
    };
};

// Sobrescribir confirmarEnlace si hay override
var _origConfirmarEnlace = window.confirmarEnlace;
window.confirmarEnlace = function() {
    if (window._confirmEnlaceOverride) {
        var fn = window._confirmEnlaceOverride;
        window._confirmEnlaceOverride = null;
        fn();
    } else {
        _origConfirmarEnlace();
    }
};

// ─── Resumen WhatsApp ────────────────────────────
function generarResumenWhatsApp() {
    var cfg = window.edificioConfig;
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;
    var mesNombre = EJ_MESES_COMPLETO[mesActual - 1];
    var clv = 'mes' + mesActual;
    var mesDat = _ejData[clv] || {};

    var lineas = [
        '╔══════════════════════════╗',
        '║  INFORME SST — ' + mesNombre.toUpperCase().substring(0,3) + ' 2026   ║',
        '╚══════════════════════════╝',
        '',
        cfg.emoji + ' ' + cfg.nombre,
        '📍 ' + cfg.direccion,
        '📅 ' + hoy.toLocaleDateString('es-CO', { dateStyle: 'full' }),
        ''
    ];

    var hayPendientes = false;
    EJ_ACTOS.forEach(function(act) {
        var info = mesDat[act.id] || {};
        var ok = info.completado;
        if (!ok) hayPendientes = true;
        lineas.push((ok ? '✅' : '⏳') + ' ' + act.label.replace(/^[^ ]+ /,'') + (ok && info.fecha ? ' — ' + info.fecha : ''));
    });

    lineas.push('');
    if (mesDat.observacion) { lineas.push('📝 ' + mesDat.observacion); lineas.push(''); }
    lineas.push(hayPendientes ? '⚠️ Hay actividades pendientes este mes.' : '🎯 Todas las actividades del mes completadas.');
    lineas.push('');
    lineas.push('—');
    lineas.push('Carla Castellano Madriz | C.E. 679955');
    lineas.push('Compliance Pro · 2026');

    document.getElementById('wa-texto').textContent = lineas.join('\n');
    document.getElementById('modal-wa').classList.remove('hidden');
}

window.copiarTextoWA = function() {
    var texto = document.getElementById('wa-texto').textContent;
    navigator.clipboard.writeText(texto).then(function() {
        mostrarToast('✅ Mensaje copiado al portapapeles', 'success');
    }).catch(function() { mostrarToast('No se pudo copiar. Selecciona el texto manualmente.', 'error'); });
};
