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
            '<span class="card-title">🗓️ ¿Qué hice y qué me falta por mes?</span>' +
            '<button class="btn-secondary" style="padding:7px 16px;font-size:0.83rem;" onclick="generarResumenWhatsApp()">📱 Resumen WhatsApp</button>' +
          '</div>' +
          '<p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:15px;">Estado de actividades mensuales — datos en tiempo real desde Firebase</p>' +
          '<div class="table-wrap">' +
            '<table class="ej-table">' +
              '<thead><tr><th>Mes</th><th>📋 Supervisión</th><th>🔍 Inspección</th><th>🎓 Inducción</th><th>🔧 Mantenimiento</th><th>Total</th><th>Estado</th></tr></thead>' +
              '<tbody id="qh-tbody"><tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-gray);">⏳ Cargando datos...</td></tr></tbody>' +
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
    cargarQueHiceTabla();
}

// ─── ¿Qué hice y qué me falta por mes? (datos reales de Firebase) ──
function filtrarPorMesQH(items, mes, anio) {
    var periodoStr = EJ_MESES_COMPLETO[mes] + ' ' + anio;
    return (items || []).filter(function(item) {
        if (!item) return false;
        var c = item.fecha || item.fechaActividad || item.date || '';
        if (c) {
            try {
                var fechaStr = String(c).length === 10 ? c + 'T12:00:00' : c;
                var f = new Date(fechaStr);
                if (!isNaN(f)) return f.getMonth() === mes && f.getFullYear() === anio;
            } catch(e) {}
        }
        if (item.periodo) return item.periodo.indexOf(periodoStr) !== -1 || item.periodo.indexOf(EJ_MESES_COMPLETO[mes]) !== -1;
        return false;
    });
}

function cargarQueHiceTabla() {
    var cfg = window.edificioConfig;
    var mesInicio = cfg.mes_inicio || 1;
    var anio = new Date().getFullYear();
    var mesActual = new Date().getMonth();
    var tbody = document.getElementById('qh-tbody');
    if (!tbody) return;

    window.db.ref('edificios/' + cfg.id).once('value').then(function(snap) {
        var n = snap.val() || {};
        var supervisiones  = n.supervisiones  ? Object.values(n.supervisiones)  : [];
        var inspecciones   = n.inspecciones   ? Object.values(n.inspecciones)   : [];
        var inducciones    = n.inducciones    ? Object.values(n.inducciones)    : [];
        var mantenimientos = n.mantenimientos ? Object.values(n.mantenimientos) : [];

        var html = '';
        for (var m = mesInicio; m <= 12; m++) {
            var mIdx = m - 1;
            var sup  = filtrarPorMesQH(supervisiones,  mIdx, anio).length;
            var ins  = filtrarPorMesQH(inspecciones,   mIdx, anio).length;
            var ind  = filtrarPorMesQH(inducciones,    mIdx, anio).length;
            var mant = filtrarPorMesQH(mantenimientos, mIdx, anio).length;
            var total = sup + ins + ind + mant;
            var esFuturo = mIdx > mesActual;
            var esActual = mIdx === mesActual;
            var esPasado = mIdx < mesActual;

            var cellText = function(val) {
                if (esFuturo) return '<span style="color:#94a3b8;">—</span>';
                if (val > 0)  return '<span style="color:#059669;font-weight:700;">✓ ' + val + '</span>';
                if (esPasado) return '<span style="color:#dc2626;font-weight:700;">✗ 0</span>';
                return '<span style="color:#94a3b8;">Pendiente</span>';
            };

            var estadoBadge;
            if (esFuturo) {
                estadoBadge = '<span style="color:#94a3b8;font-size:0.8rem;">Próximo</span>';
            } else if (total >= 4) {
                estadoBadge = '<span class="badge badge-success">Completo ✅</span>';
            } else if (total > 0) {
                estadoBadge = '<span class="badge badge-warning">Parcial 🟡</span>';
            } else if (esPasado) {
                estadoBadge = '<span class="badge badge-danger">Sin registro ⚠️</span>';
            } else {
                estadoBadge = '<span class="badge" style="background:#dbeafe;color:#1e40af;">Mes actual 📌</span>';
            }

            html += '<tr' + (esActual ? ' style="background:#eff6ff;"' : '') + '>' +
                '<td style="font-weight:600;text-align:left;padding-left:12px;">' + (esActual ? '👉 ' : '') + EJ_MESES_COMPLETO[mIdx] + '</td>' +
                '<td style="text-align:center;">' + cellText(sup)  + '</td>' +
                '<td style="text-align:center;">' + cellText(ins)  + '</td>' +
                '<td style="text-align:center;">' + cellText(ind)  + '</td>' +
                '<td style="text-align:center;">' + cellText(mant) + '</td>' +
                '<td style="text-align:center;font-weight:700;">'  + (esFuturo ? '—' : total) + '</td>' +
                '<td style="text-align:center;">' + estadoBadge + '</td>' +
                '</tr>';
        }
        tbody.innerHTML = html;
    }).catch(function(err) {
        console.error('Error tabla qué hice:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#ef4444;">Error cargando datos</td></tr>';
    });
}

// ─── Observaciones por mes ───────────────────────
var _ejData = {};

function cargarEjecucion() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/ejecucion').on('value', function(snap) {
        _ejData = snap.val() || {};
        renderNotasMes();
    });
}

function renderNotasMes() {
    var cfg = window.edificioConfig;
    var mesInicio = cfg.mes_inicio || 1;
    var grid = document.getElementById('ej-notas-grid');
    if (!grid) return;
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;
    var html = '';

    for (var m = mesInicio; m <= 12; m++) {
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

window.guardarObservacion = function(clvMes, texto) {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/ejecucion/' + clvMes).update({ observacion: texto });
};

// ─── Resumen WhatsApp (datos reales de Firebase) ──
function generarResumenWhatsApp() {
    var cfg = window.edificioConfig;
    var hoy = new Date();
    var mesIdx = hoy.getMonth();
    var anio = hoy.getFullYear();
    var mesNombre = EJ_MESES_COMPLETO[mesIdx];
    var clv = 'mes' + (mesIdx + 1);

    window.db.ref('edificios/' + cfg.id).once('value').then(function(snap) {
        var n = snap.val() || {};
        var conteos = {
            supervision:   filtrarPorMesQH(n.supervisiones  ? Object.values(n.supervisiones)  : [], mesIdx, anio).length,
            inspeccion:    filtrarPorMesQH(n.inspecciones   ? Object.values(n.inspecciones)   : [], mesIdx, anio).length,
            induccion:     filtrarPorMesQH(n.inducciones    ? Object.values(n.inducciones)    : [], mesIdx, anio).length,
            mantenimiento: filtrarPorMesQH(n.mantenimientos ? Object.values(n.mantenimientos) : [], mesIdx, anio).length
        };
        var observacion = (n.ejecucion && n.ejecucion[clv] && n.ejecucion[clv].observacion) || '';

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
            var cant = conteos[act.id] || 0;
            if (cant === 0) hayPendientes = true;
            lineas.push((cant > 0 ? '✅' : '⏳') + ' ' + act.label.replace(/^[^ ]+ /,'') +
                        (cant > 0 ? ' — ' + cant + (cant === 1 ? ' registro' : ' registros') : ''));
        });

        lineas.push('');
        if (observacion) { lineas.push('📝 ' + observacion); lineas.push(''); }
        lineas.push(hayPendientes ? '⚠️ Hay actividades sin registro este mes.' : '🎯 Todas las actividades del mes tienen registro.');
        lineas.push('');
        lineas.push('—');
        lineas.push('Carla Castellano Madriz | C.E. 679955');
        lineas.push('Compliance Pro · 2026');

        document.getElementById('wa-texto').textContent = lineas.join('\n');
        document.getElementById('modal-wa').classList.remove('hidden');
    }).catch(function(err) {
        console.error('Error resumen WhatsApp:', err);
        mostrarToast('Error al generar el resumen', 'error');
    });
}

window.copiarTextoWA = function() {
    var texto = document.getElementById('wa-texto').textContent;
    navigator.clipboard.writeText(texto).then(function() {
        mostrarToast('✅ Mensaje copiado al portapapeles', 'success');
    }).catch(function() { mostrarToast('No se pudo copiar. Selecciona el texto manualmente.', 'error'); });
};
