// ═══════════════════════════════════════════════
//  COTIZACIONES.JS — Gestión de empresas, análisis, carta, tracking
// ═══════════════════════════════════════════════

var COT_STEPS = [
    { id: 'carta',       label: 'Carta enviada a la administradora' },
    { id: 'aprobacion',  label: 'Aprobación de la administradora' },
    { id: 'pedidos',     label: 'Pedidos realizados a proveedores' },
    { id: 'anticipo',    label: 'Anticipo cancelado (50%)' },
    { id: 'recepcion',   label: 'Recepción de materiales/equipos' },
    { id: 'instalacion', label: 'Instalación completada' },
    { id: 'saldo',       label: 'Saldo cancelado (50%)' },
    { id: 'docs',        label: 'Documentos entregados al edificio' }
];

function initCotizaciones() {
    var sec = document.getElementById('section-cotizaciones');
    if (!sec) return;

    sec.innerHTML =
        '<div class="card">' +
          '<div class="card-header">' +
            '<span class="card-title">💼 Cotizaciones SST</span>' +
            '<button class="btn-primary" style="padding:8px 18px;font-size:0.85rem;" onclick="abrirModalNuevaCot()">+ Agregar empresa</button>' +
          '</div>' +
          '<div id="cot-empresas-lista"><p style="color:var(--text-gray);text-align:center;padding:20px;">Cargando...</p></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📊 Análisis Comparativo</span></div>' +
          '<div id="cot-analisis"></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📋 Tracking Proceso</span></div>' +
          '<p style="color:var(--text-gray);font-size:0.88rem;margin-bottom:14px;">Seguimiento paso a paso del proceso de cotización y contratación.</p>' +
          '<ul class="checklist-cotiz" id="cot-checklist">' +
          COT_STEPS.map(function(s) {
              return '<li id="cot-step-' + s.id + '">' +
                  '<input type="checkbox" id="cot-cb-' + s.id + '" onchange="guardarStepCot(\'' + s.id + '\',this.checked)">' +
                  '<span class="step-label">' + s.label + '</span>' +
                  '<input type="date" class="step-fecha-input" id="cot-fecha-' + s.id + '" ' +
                  'onchange="guardarFechaCot(\'' + s.id + '\',this.value)">' +
                  '</li>';
          }).join('') +
          '</ul>' +
          '<div class="progress-wrap" style="margin-top:16px;">' +
            '<div class="progress-label"><span>Progreso</span><span id="cot-prog-label">0% completado</span></div>' +
            '<div class="progress-track"><div id="cot-prog-bar" class="progress-fill" style="width:0%"></div></div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header"><span class="card-title">📄 Carta para Administradora</span></div>' +
          '<p style="color:var(--text-gray);font-size:0.88rem;margin-bottom:14px;">Genera carta formal solicitando aprobación para la contratación SST.</p>' +
          '<div class="form-row">' +
            '<div class="form-group-inline"><label>Servicio o elemento a contratar</label>' +
              '<input type="text" id="carta-servicio" placeholder="Ej: Extintor ABC 20 lb"></div>' +
            '<div class="form-group-inline"><label>Valor aproximado</label>' +
              '<input type="text" id="carta-valor" placeholder="Ej: $450.000"></div>' +
          '</div>' +
          '<div class="form-row-1 form-group-inline"><label>Justificación</label>' +
            '<textarea id="carta-justif" rows="3" placeholder="Razón por la que es necesario..."></textarea>' +
          '</div>' +
          '<button class="btn-primary" style="margin-top:10px;" onclick="generarCartaAdmin()">📋 Generar carta</button>' +
          '<pre id="carta-preview" style="margin-top:14px;background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:14px;font-size:0.8rem;line-height:1.6;white-space:pre-wrap;display:none;"></pre>' +
        '</div>' +

        // Modal nueva empresa
        '<div id="modal-cot" class="modal-overlay hidden">' +
          '<div class="modal-box">' +
            '<div class="modal-header">' +
              '<h3 id="modal-cot-titulo">Agregar empresa cotizante</h3>' +
              '<button class="btn-icon" onclick="cerrarModalCot()">✕</button>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group-inline"><label>Nombre empresa</label><input type="text" id="cot-nombre"></div>' +
              '<div class="form-group-inline"><label>NIT / CC</label><input type="text" id="cot-nit"></div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group-inline"><label>Contacto (nombre)</label><input type="text" id="cot-contacto"></div>' +
              '<div class="form-group-inline"><label>Teléfono</label><input type="tel" id="cot-tel"></div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group-inline"><label>Servicio cotizado</label><input type="text" id="cot-servicio"></div>' +
              '<div class="form-group-inline"><label>Valor cotizado (COP)</label><input type="number" id="cot-valor"></div>' +
            '</div>' +
            '<div class="form-row-1 form-group-inline"><label>Estado</label>' +
              '<select id="cot-estado">' +
                '<option value="pendiente">Pendiente respuesta</option>' +
                '<option value="recibida">Cotización recibida</option>' +
                '<option value="aprobada">Aprobada</option>' +
                '<option value="rechazada">Rechazada</option>' +
              '</select>' +
            '</div>' +
            '<div class="modal-footer">' +
              '<button class="btn-secondary" onclick="cerrarModalCot()">Cancelar</button>' +
              '<button class="btn-primary" onclick="guardarEmpresaCot()">💾 Guardar</button>' +
            '</div>' +
          '</div>' +
        '</div>';

    cargarCotizaciones();
    cargarTrackingCot();
}

function cargarCotizaciones() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/cotizaciones/empresas').on('value', function(snap) {
        var data = snap.val() || {};
        var lista = document.getElementById('cot-empresas-lista');
        var analisis = document.getElementById('cot-analisis');
        if (!lista) return;

        var empresas = [];
        Object.keys(data).forEach(function(k) { empresas.push(Object.assign({ _key: k }, data[k])); });
        empresas.sort(function(a,b) { return (a.valor||0) - (b.valor||0); });

        if (!empresas.length) {
            lista.innerHTML = '<p style="color:var(--text-gray);text-align:center;padding:30px;">Sin empresas cotizantes registradas. Agrega la primera.</p>';
            if (analisis) analisis.innerHTML = '';
            return;
        }

        var badgeMap = { pendiente: 'badge-gray', recibida: 'badge-warning', aprobada: 'badge-success', rechazada: 'badge-danger' };
        var htmlL = '';
        empresas.forEach(function(e) {
            var valorFmt = e.valor ? '$ ' + parseInt(e.valor).toLocaleString('es-CO') : '—';
            htmlL += '<div class="cot-empresa-card">' +
                '<div style="flex:1;">' +
                  '<div class="cot-empresa-nombre">' + e.nombre + (e.nit ? ' <small style="color:var(--text-gray);">· ' + e.nit + '</small>' : '') + '</div>' +
                  '<div class="cot-empresa-info">' + (e.servicio || '') + (e.contacto ? ' · ' + e.contacto : '') + (e.tel ? ' · ' + e.tel : '') + '</div>' +
                  '<div style="margin-top:6px;"><span class="badge ' + (badgeMap[e.estado] || 'badge-gray') + '">' + (e.estado || 'pendiente') + '</span></div>' +
                '</div>' +
                '<div class="cot-empresa-valor">' + valorFmt + '</div>' +
                '<button class="btn-secondary" style="margin-left:12px;padding:5px 12px;font-size:0.8rem;" onclick="eliminarEmpresaCot(\'' + e._key + '\')">🗑️</button>' +
                '</div>';
        });
        lista.innerHTML = htmlL;

        // Análisis comparativo
        if (analisis && empresas.length > 1) {
            var min = empresas[0];
            var htmlA = '<div class="alert-banner success" style="margin-bottom:14px;">' +
                '<span class="ab-icon">🏆</span>' +
                '<div class="ab-body"><div class="ab-title">Mejor propuesta: ' + min.nombre + '</div>' +
                '<div class="ab-msg">Valor: $' + (min.valor ? parseInt(min.valor).toLocaleString('es-CO') : '—') + ' · ' + (min.servicio || '') + '</div></div>' +
                '</div>';
            analisis.innerHTML = htmlA;
        } else if (analisis) {
            analisis.innerHTML = '<p style="color:var(--text-gray);">Agrega al menos 2 empresas para ver el análisis comparativo.</p>';
        }
    });
}

var _cotEditKey = null;
window.abrirModalNuevaCot = function() {
    _cotEditKey = null;
    ['cot-nombre','cot-nit','cot-contacto','cot-tel','cot-servicio','cot-valor'].forEach(function(id) {
        document.getElementById(id).value = '';
    });
    document.getElementById('cot-estado').value = 'pendiente';
    document.getElementById('modal-cot-titulo').textContent = 'Agregar empresa cotizante';
    document.getElementById('modal-cot').classList.remove('hidden');
};

window.cerrarModalCot = function() {
    document.getElementById('modal-cot').classList.add('hidden');
};

window.guardarEmpresaCot = function() {
    var cfg = window.edificioConfig;
    var nombre = document.getElementById('cot-nombre').value.trim();
    if (!nombre) { mostrarToast('El nombre es obligatorio', 'error'); return; }

    var data = {
        nombre:   nombre,
        nit:      document.getElementById('cot-nit').value.trim(),
        contacto: document.getElementById('cot-contacto').value.trim(),
        tel:      document.getElementById('cot-tel').value.trim(),
        servicio: document.getElementById('cot-servicio').value.trim(),
        valor:    parseFloat(document.getElementById('cot-valor').value) || 0,
        estado:   document.getElementById('cot-estado').value
    };

    var ref = _cotEditKey
        ? window.db.ref('edificios/' + cfg.id + '/cotizaciones/empresas/' + _cotEditKey)
        : window.db.ref('edificios/' + cfg.id + '/cotizaciones/empresas').push();

    ref.set(data).then(function() {
        mostrarToast('✅ Empresa guardada', 'success');
        cerrarModalCot();
    }).catch(function() { mostrarToast('Error al guardar', 'error'); });
};

window.eliminarEmpresaCot = function(key) {
    if (!confirm('¿Eliminar esta empresa?')) return;
    window.db.ref('edificios/' + window.edificioConfig.id + '/cotizaciones/empresas/' + key).remove()
        .then(function() { mostrarToast('Empresa eliminada'); });
};

// ─── Tracking ─────────────────────────────────────
function cargarTrackingCot() {
    var cfg = window.edificioConfig;
    window.db.ref('edificios/' + cfg.id + '/cotizaciones/tracking').once('value').then(function(snap) {
        var data = snap.val() || {};
        var completados = 0;
        COT_STEPS.forEach(function(s) {
            if (data[s.id] && data[s.id].completado) {
                var cb = document.getElementById('cot-cb-' + s.id);
                var li = document.getElementById('cot-step-' + s.id);
                if (cb) cb.checked = true;
                if (li) li.classList.add('done');
                completados++;
                if (data[s.id].fecha) {
                    var fi = document.getElementById('cot-fecha-' + s.id);
                    if (fi) fi.value = data[s.id].fecha;
                }
            }
        });
        actualizarProgCot(completados);
    });
}

window.guardarStepCot = function(stepId, completado) {
    var cfg = window.edificioConfig;
    var fecha = document.getElementById('cot-fecha-' + stepId).value || null;
    window.db.ref('edificios/' + cfg.id + '/cotizaciones/tracking/' + stepId).update({ completado: completado, fecha: fecha })
        .then(function() {
            var li = document.getElementById('cot-step-' + stepId);
            if (li) { if (completado) li.classList.add('done'); else li.classList.remove('done'); }
            recalcularProgCot();
            mostrarToast(completado ? '✅ Paso completado' : 'Paso desmarcado');
        });
};

window.guardarFechaCot = function(stepId, fecha) {
    window.db.ref('edificios/' + window.edificioConfig.id + '/cotizaciones/tracking/' + stepId).update({ fecha: fecha });
};

function recalcularProgCot() {
    var completados = 0;
    COT_STEPS.forEach(function(s) {
        var li = document.getElementById('cot-step-' + s.id);
        if (li && li.classList.contains('done')) completados++;
    });
    actualizarProgCot(completados);
}

function actualizarProgCot(completados) {
    var pct = Math.round((completados / COT_STEPS.length) * 100);
    var bar = document.getElementById('cot-prog-bar');
    var lbl = document.getElementById('cot-prog-label');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% completado (' + completados + '/' + COT_STEPS.length + ' pasos)';
}

// ─── Carta administradora ─────────────────────────
window.generarCartaAdmin = function() {
    var cfg = window.edificioConfig;
    var servicio = document.getElementById('carta-servicio').value || '(servicio)';
    var valor    = document.getElementById('carta-valor').value || '(valor)';
    var justif   = document.getElementById('carta-justif').value || '';
    var hoy = new Date();

    var texto = [
        cfg.nombre + ' — ' + cfg.nit,
        cfg.direccion,
        '',
        hoy.toLocaleDateString('es-CO', { dateStyle: 'long' }),
        '',
        'Señora',
        cfg.admin_nombre,
        'Administradora del ' + cfg.nombre,
        '',
        'Asunto: Solicitud de aprobación — ' + servicio,
        '',
        'Estimada administradora:',
        '',
        'En mi calidad de Profesional SST responsable del Sistema de Gestión de Seguridad ' +
        'y Salud en el Trabajo de ' + cfg.nombre + ', me permito comunicar:',
        '',
        justif || ('La adquisición de "' + servicio + '" es requerida para el cumplimiento de los estándares mínimos establecidos en la Resolución 0312 de 2019 del Ministerio del Trabajo.'),
        '',
        'Valor aproximado de la inversión: ' + valor,
        '',
        'Solicito respetuosamente su aprobación para proceder con la gestión correspondiente.',
        '',
        'Cordialmente,',
        '',
        'Carla Castellano Madriz',
        'C.E. 679955',
        'Profesional SST — SG-SST ' + cfg.nombre,
        'Compliance Pro · 2026'
    ];

    var textoFinal = texto.join('\n');
    var pre = document.getElementById('carta-preview');
    pre.textContent = textoFinal;
    pre.style.display = 'block';
    navigator.clipboard.writeText(textoFinal)
        .then(function() { mostrarToast('✅ Carta copiada al portapapeles', 'success'); })
        .catch(function() { mostrarToast('Carta generada. Cópiala del cuadro.'); });
};
