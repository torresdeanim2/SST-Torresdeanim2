// ═══════════════════════════════════════════════
//  DOCUMENTOS.JS — 9 documentos base + informes + cuentas de cobro
// ═══════════════════════════════════════════════

var DOCS_BASE = [
    { id: 'politica',        nombre: 'Política SST',                      desc: 'Resolución 0312/2019 — Estándar 1.1.1' },
    { id: 'organigrama',     nombre: 'Organigrama SST',                   desc: 'Estructura organizacional del SG-SST' },
    { id: 'pat2026',         nombre: 'Plan Anual de Trabajo 2026',        desc: 'PAT con 12 meses de actividades' },
    { id: 'matriz_legal',    nombre: 'Matriz Legal',                      desc: 'Normativa aplicable vigente' },
    { id: 'gtc45',           nombre: 'Matriz GTC-45',                     desc: 'Identificación de peligros y riesgos' },
    { id: 'emergencias',     nombre: 'Plan de Emergencias',               desc: 'Respuesta ante emergencias' },
    { id: 'mantenimiento',   nombre: 'Programa de Mantenimiento 2026',    desc: 'Preventivo y correctivo' },
    { id: 'autoevaluacion',  nombre: 'Autoevaluación Res. 0312/2019',     desc: 'Nivel de cumplimiento estándares mínimos' },
    { id: 'mejoramiento',    nombre: 'Plan de Mejoramiento',              desc: 'Acciones correctivas y preventivas' }
];

var MESES_DOCS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function initDocumentos() {
    var sec = document.getElementById('section-documentos');
    if (!sec) return;

    sec.innerHTML =
        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📁 Documentos Base SG-SST</span>' +
          '<span class="badge badge-gray">9 documentos</span></div>' +
          '<div class="table-wrap"><table id="tabla-docs-base">' +
            '<thead><tr><th>#</th><th>Documento</th><th>Descripción</th><th>Estado</th><th>Enlace</th><th>Acción</th></tr></thead>' +
            '<tbody id="tbody-docs-base"><tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-gray);">Cargando...</td></tr></tbody>' +
          '</table></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📁 Informes y Cuentas por Cobrar 2026</span>' +
          '<button class="btn-secondary" style="padding:6px 14px;font-size:0.82rem;" onclick="window.mostrarSeccion(\'herramientas\')">Generar informe →</button></div>' +
          '<p style="color:var(--text-gray);font-size:0.85rem;margin-bottom:14px;">Documentos mensuales del Sistema de Gestión SST — vincula el enlace de Google Drive de cada mes.</p>' +
          '<div class="table-wrap"><table>' +
            '<thead><tr><th>Mes</th><th style="text-align:center;">📋 Informe Mensual SST</th><th style="text-align:center;">💰 Cuenta por Cobrar</th></tr></thead>' +
            '<tbody id="tbody-informes"></tbody>' +
          '</table></div>' +
        '</div>' +


        // Modal vincular enlace
        '<div id="modal-enlace" class="modal-overlay hidden">' +
          '<div class="modal-box">' +
            '<div class="modal-header">' +
              '<h3 id="modal-enlace-titulo">Vincular documento</h3>' +
              '<button class="btn-icon" onclick="cerrarModalEnlace()">✕</button>' +
            '</div>' +
            '<div class="alert-banner info">' +
              '<span class="ab-icon">📌</span>' +
              '<div class="ab-body">' +
                '<div class="ab-title">Cómo obtener el enlace</div>' +
                '<div class="ab-msg">1. Abre el documento en Google Drive<br>2. Clic en <strong>Compartir → Copiar enlace</strong><br>3. Asegúrate de que el acceso sea <em>"Cualquiera con el enlace"</em></div>' +
              '</div>' +
            '</div>' +
            '<div class="form-group-inline" style="margin-top:14px;">' +
              '<label>Enlace de Google Drive</label>' +
              '<input type="url" id="modal-enlace-input" placeholder="https://drive.google.com/file/d/...">' +
            '</div>' +
            '<div class="modal-footer">' +
              '<button class="btn-secondary" onclick="cerrarModalEnlace()">Cancelar</button>' +
              '<button class="btn-primary" onclick="confirmarEnlace()">💾 Guardar enlace</button>' +
            '</div>' +
          '</div>' +
        '</div>';

    cargarDocumentosBase();
    cargarInformesYCuentas();
}

function cargarDocumentosBase() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/documentos').once('value').then(function(snap) {
        var data = snap.val() || {};
        var tbody = document.getElementById('tbody-docs-base');
        var html = '';
        DOCS_BASE.forEach(function(doc, i) {
            var info = data[doc.id] || {};
            var tieneLink = !!info.enlace;
            html += '<tr>' +
                '<td style="font-weight:700;color:var(--text-gray);">' + (i+1) + '</td>' +
                '<td style="font-weight:600;">' + doc.nombre + '</td>' +
                '<td style="color:var(--text-gray);font-size:0.85rem;">' + doc.desc + '</td>' +
                '<td>' + (tieneLink ? '<span class="badge badge-success">✅ Vinculado</span>' : '<span class="badge badge-gray">Sin enlace</span>') + '</td>' +
                '<td>' + (tieneLink ? '<a href="' + info.enlace + '" target="_blank" class="btn-secondary" style="padding:4px 12px;font-size:0.8rem;">📂 Abrir</a>' : '—') + '</td>' +
                '<td><button class="ej-link-btn' + (tieneLink ? ' tiene-link' : '') + '" onclick="abrirModalEnlace(\'documentos\',\'' + doc.id + '\',\'' + doc.nombre + '\')">Vincular</button></td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
    });
}

function cargarInformesYCuentas() {
    var cfg = window.edificioConfig;
    var mesInicio = cfg.mes_inicio || 1;
    Promise.all([
        window.db.ref('edificios/' + cfg.id + '/informes').once('value'),
        window.db.ref('edificios/' + cfg.id + '/cuentas').once('value')
    ]).then(function(snaps) {
        var informes = snaps[0].val() || {};
        var cuentas  = snaps[1].val() || {};
        var hoy = new Date();
        var mesActual = hoy.getMonth() + 1;
        var htmlI = '';

        for (var m = mesInicio; m <= 12; m++) {
            var infoI = informes['mes' + m] || {};
            var infoC = cuentas['mes' + m]  || {};
            var esPasado = m < mesActual;
            var esActual = m === mesActual;
            htmlI += mkFilaDocCombinada(m, infoI, infoC, esPasado, esActual);
        }
        document.getElementById('tbody-informes').innerHTML = htmlI;
    });
}

function mkCeldaDoc(numMes, info, tipo, esPasado, esActual) {
    var tieneLink = !!info.enlace;
    if (!tieneLink) {
        var pendienteLbl = esPasado ? '⚠️ Pendiente' : (esActual ? '⏳ Mes actual' : '—');
        return '<div style="text-align:center;">' +
            '<span class="badge ' + (esPasado ? 'badge-danger' : (esActual ? 'badge-warning' : 'badge-gray')) + '" style="margin-bottom:5px;display:inline-block;">' + pendienteLbl + '</span><br>' +
            '<button class="ej-link-btn" onclick="abrirModalEnlace(\'' + tipo + '\',\'mes' + numMes + '\',\'mes ' + numMes + '\')">🔗 Vincular</button>' +
            '</div>';
    }
    var mesLabel = MESES_DOCS[numMes-1] + ' 2026';
    var etiqueta = tipo === 'informes' ? 'Informe SST' : 'Cuenta por Cobrar';
    return '<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;align-items:center;">' +
        '<button class="btn-secondary" style="padding:5px 12px;font-size:0.8rem;" onclick="window.open(\'' + info.enlace.replace(/'/g,"\\'") + '\',\'_blank\')">📄 Ver</button>' +
        '<button class="btn-secondary" style="padding:5px 12px;font-size:0.8rem;background:#25D366;color:#fff;border-color:#25D366;" onclick="compartirWA(\'' + etiqueta + '\',\'' + mesLabel + '\',\'' + info.enlace.replace(/'/g,"\\'") + '\')">📲 WhatsApp</button>' +
        '<button class="ej-link-btn tiene-link" onclick="abrirModalEnlace(\'' + tipo + '\',\'mes' + numMes + '\',\'mes ' + numMes + '\')">✏️</button>' +
        '</div>';
}

function mkFilaDocCombinada(numMes, infoInforme, infoCuenta, esPasado, esActual) {
    return '<tr>' +
        '<td style="font-weight:600;">' + MESES_DOCS[numMes-1] + '</td>' +
        '<td style="padding:8px;">' + mkCeldaDoc(numMes, infoInforme, 'informes', esPasado, esActual) + '</td>' +
        '<td style="padding:8px;">' + mkCeldaDoc(numMes, infoCuenta,  'cuentas',  esPasado, esActual) + '</td>' +
        '</tr>';
}

window.compartirWA = function(tipo, mes, link) {
    var cfg = window.edificioConfig;
    var texto = encodeURIComponent('Hola, te comparto el ' + tipo + ' de ' + mes + ' — ' + cfg.nombre + ':\n' + link);
    window.open('https://wa.me/?text=' + texto, '_blank');
};

// ─── Modal enlace ────────────────────────────────
var _modalEnlaceRuta = '';
window.abrirModalEnlace = function(coleccion, clave, etiqueta) {
    _modalEnlaceRuta = 'edificios/' + window.edificioConfig.id + '/' + coleccion + '/' + clave;
    document.getElementById('modal-enlace-titulo').textContent = '🔗 Vincular: ' + etiqueta;
    document.getElementById('modal-enlace-input').value = '';
    document.getElementById('modal-enlace').classList.remove('hidden');
};
window.cerrarModalEnlace = function() {
    document.getElementById('modal-enlace').classList.add('hidden');
};
window.confirmarEnlace = function() {
    var val = document.getElementById('modal-enlace-input').value.trim();
    if (!val || !val.startsWith('http')) {
        mostrarToast('Ingresa un enlace válido (https://...)', 'error'); return;
    }
    window.db.ref(_modalEnlaceRuta).update({ enlace: val }).then(function() {
        mostrarToast('✅ Enlace guardado correctamente', 'success');
        cerrarModalEnlace();
        window._seccionesInit['documentos'] = false;
        initDocumentos();
    }).catch(function() { mostrarToast('Error al guardar', 'error'); });
};
