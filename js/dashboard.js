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

var ESPECIFICACIONES_TECNICAS = [
    { key: 'tanques_lavado',     item: 'Tanques de agua',                    norma: 'Lavado y desinfección — Ley 9/1979, Res. 2115/2007, Decreto 1575/2007', periodicidad: 'Cada 6 meses' },
    { key: 'ascensor_contrato',  item: 'Ascensor',                           norma: 'Contrato de mantenimiento preventivo — NTC 5926-1',                      periodicidad: 'Mensual' },
    { key: 'ascensor_onac',      item: 'Ascensor',                           norma: 'Certificación de operatividad por organismo acreditado ONAC',            periodicidad: 'Anual' },
    { key: 'gas_revision',       item: 'Instalación de gas (redes comunes)', norma: 'Revisión periódica — Res. CREG 059/2012',                                periodicidad: 'Cada 5 años' },
    { key: 'extintores_mant',    item: 'Extintores',                        norma: 'Mantenimiento preventivo / recarga — NTC 2885',                          periodicidad: 'Anual (o al descargarse)' },
    { key: 'extintores_hidro',   item: 'Extintores',                        norma: 'Prueba hidrostática',                                                    periodicidad: 'Cada 5 años (CO2, ABC, agentes limpios)' },
    { key: 'red_contraincendio', item: 'Red contra incendio / gabinetes',    norma: 'Mantenimiento e inspección — NTC 1669 / NFPA',                           periodicidad: 'Anual' },
    { key: 'pararrayos',         item: 'Pararrayos / puesta a tierra',       norma: 'Certificado de medición de resistencia — RETIE',                         periodicidad: 'Anual' },
    { key: 'planta_electrica',   item: 'Planta eléctrica de emergencia',     norma: 'Prueba de arranque y mantenimiento',                                     periodicidad: 'Mensual / según manual fabricante' },
    { key: 'subestacion',        item: 'Subestación eléctrica',              norma: 'Mantenimiento e inspección — RETIE',                                     periodicidad: 'Anual' },
    { key: 'puertas_electricas', item: 'Puertas eléctricas',                 norma: 'Certificación de funcionamiento',                                        periodicidad: 'Anual' },
    { key: 'montacoches_mant',   item: 'Elevador vehicular / Montacoches',   norma: 'Mantenimiento preventivo — NTC 5926-1',                                  periodicidad: 'Mensual' },
    { key: 'montacoches_onac',   item: 'Elevador vehicular / Montacoches',   norma: 'Certificación de operatividad por organismo acreditado ONAC',            periodicidad: 'Anual' },
    { key: 'bbq_gas',            item: 'Parrilla / BBQ terraza',             norma: 'Revisión de instalación de gas',                                         periodicidad: 'Anual' }
];

function initDashboard() {
    var sec = document.getElementById('section-dashboard');
    if (!sec) return;
    var cfg = window.edificioConfig;

    sec.innerHTML =
        '<div class="card" style="margin-bottom:20px;">' +
          '<div class="card-header"><span class="card-title">🏢 ' + cfg.nombre + '</span>' +
          '<span class="badge badge-success">SG-SST Activo 2026</span></div>' +
          '<div class="stats-grid" style="margin-top:6px;">' +
            mkStat('✅', cfg.cumplimiento_global ? cfg.cumplimiento_global + '%' : 'Pendiente', 'Cumplimiento Global SG-SST') +
            mkStat('📄', cfg.documentos_completos || 'Pendiente', 'Documentos Completos') +
            mkStat('🎓', cfg.capacitacion_cobertura ? cfg.capacitacion_cobertura + '%' : 'Pendiente', 'Cobertura Capacitación') +
            '<div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-value" id="dash-stat-accidentes">—</div><div class="stat-label">Accidentes 2026</div></div>' +
            '<div class="stat-card"><div class="stat-icon">🔍</div><div class="stat-value" id="dash-stat-inspecciones">—</div><div class="stat-label">Inspecciones Realizadas</div></div>' +
            mkStat('👷', cfg.trabajadores, 'Número de Trabajadores') +
            mkStat('🏘️', cfg.unidades, 'Unidades Habitacionales') +
          '</div>' +
          '<div style="margin-top:14px;font-size:0.88rem;color:var(--text-gray);">' +
            '📍 ' + cfg.direccion + ' &nbsp;|&nbsp; 📧 ' + cfg.email +
            ' &nbsp;|&nbsp; 📱 Adm: ' + cfg.admin_nombre + ' · ' + cfg.admin_tel +
          '</div>' +
        '</div>' +

        '<div id="dash-banner-cotiz" class="alert-banner hidden" style="margin-bottom:20px;">' +
          '<span class="ab-icon">💰</span>' +
          '<div class="ab-body"><div class="ab-title">Cotizaciones pendientes</div>' +
          '<div class="ab-msg" id="dash-banner-cotiz-msg">Cargando...</div></div>' +
          '<button class="btn-primary" style="padding:8px 16px;font-size:0.83rem;white-space:nowrap;" onclick="window.mostrarSeccion(\'cotizaciones\')">Ver Cotizaciones</button>' +
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
          '<div class="card-header"><span class="card-title">🔧 Especificaciones Técnicas — Mantenimientos Obligatorios</span>' +
          '<span id="et-pct" class="badge badge-gray">Cargando...</span></div>' +
          '<div class="progress-wrap">' +
            '<div class="progress-label"><span>Cumplimiento</span><span id="et-label">0 / ' + ESPECIFICACIONES_TECNICAS.length + ' al día</span></div>' +
            '<div class="progress-track"><div id="et-bar" class="progress-fill" style="width:0%"></div></div>' +
          '</div>' +
          '<div class="table-wrap" style="margin-top:14px;">' +
            '<table class="ej-table">' +
              '<thead><tr><th>Ítem</th><th>Norma</th><th>Periodicidad</th><th style="text-align:center;">Aplica</th><th style="text-align:center;">Al día</th><th>Última fecha</th></tr></thead>' +
              '<tbody id="et-tbody"></tbody>' +
            '</table>' +
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
    cargarStatsExtra();
    actualizarBannerCotizacionesDash();
    cargarEspecTecnicas();
}

function mkStat(icon, valor, label) {
    return '<div class="stat-card"><div class="stat-icon">' + icon + '</div>' +
           '<div class="stat-value">' + valor + '</div>' +
           '<div class="stat-label">' + label + '</div></div>';
}

function cargarProgresoPAT() {
    var cfg = window.edificioConfig;
    var mesInicio = cfg.mes_inicio || 1;
    window.db.ref('edificios/' + cfg.id + '/ejecucion').once('value').then(function(snap) {
        var data = snap.val() || {};
        var mesesTotal = 12 - mesInicio + 1;
        var completadas = 0, total = mesesTotal * ACTIVIDADES_PAT.length;

        for (var m = mesInicio; m <= 12; m++) {
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
    var mesInicio = cfg.mes_inicio || 1;
    var grid = document.getElementById('dash-meses-grid');
    if (!grid) return;
    var hoy = new Date();
    var mesActual = hoy.getMonth() + 1;

    window.db.ref('edificios/' + cfg.id + '/ejecucion').once('value').then(function(snap) {
        var data = snap.val() || {};
        var html = '';

        for (var m = mesInicio; m <= 12; m++) {
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

function cargarStatsExtra() {
    var cfg = window.edificioConfig;
    var mesInicio = cfg.mes_inicio || 1;

    // Accidentes (real, colección 'accidentes' — vacía por defecto)
    window.db.ref('edificios/' + cfg.id + '/accidentes').once('value').then(function(snap) {
        var data = snap.val() || {};
        var el = document.getElementById('dash-stat-accidentes');
        if (el) el.textContent = Object.keys(data).length;
    }).catch(function() {
        var el = document.getElementById('dash-stat-accidentes');
        if (el) el.textContent = '0';
    });

    // Inspecciones Realizadas — meses (desde mes_inicio) con supervisión o inspección completada
    window.db.ref('edificios/' + cfg.id + '/ejecucion').once('value').then(function(snap) {
        var data = snap.val() || {};
        var mesesConInspeccion = 0;
        for (var m = mesInicio; m <= 12; m++) {
            var mesData = data['mes' + m];
            if (mesData && ((mesData.supervision && mesData.supervision.completado) || (mesData.inspeccion && mesData.inspeccion.completado))) {
                mesesConInspeccion++;
            }
        }
        var totalMeses = 12 - mesInicio + 1;
        var el = document.getElementById('dash-stat-inspecciones');
        if (el) el.textContent = mesesConInspeccion + '/' + totalMeses;
    });
}

// ─── Especificaciones Técnicas (checklist mantenimientos obligatorios) ──
function cargarEspecTecnicas() {
    var cfg = window.edificioConfig;
    var tbody = document.getElementById('et-tbody');
    if (!tbody) return;
    window.db.ref('edificios/' + cfg.id + '/especificaciones_tecnicas').once('value').then(function(snap) {
        var data = snap.val() || {};
        var html = '';
        var total = 0, completados = 0;
        ESPECIFICACIONES_TECNICAS.forEach(function(e) {
            var d = data[e.key] || {};
            var aplica = d.aplica !== false;
            if (aplica) {
                total++;
                if (d.completado) completados++;
            }
            var aplicaCell = '<select id="et-aplica-' + e.key + '" onchange="cambiarAplicaEspecTecnica(\'' + e.key + '\',this.value)" style="padding:3px 6px;border:1px solid var(--border);border-radius:6px;font-size:0.8rem;">' +
                    '<option value="si"' + (aplica ? ' selected' : '') + '>Sí</option>' +
                    '<option value="no"' + (!aplica ? ' selected' : '') + '>No</option>' +
                  '</select>';
            html += '<tr' + (aplica ? '' : ' style="opacity:0.5;"') + '>' +
                '<td style="font-weight:600;">' + e.item + '</td>' +
                '<td style="font-size:0.82rem;">' + e.norma + '</td>' +
                '<td style="font-size:0.82rem;white-space:nowrap;">' + e.periodicidad + '</td>' +
                '<td style="text-align:center;">' + aplicaCell + '</td>' +
                '<td style="text-align:center;"><input type="checkbox" id="et-cb-' + e.key + '"' + (d.completado ? ' checked' : '') + (aplica ? '' : ' disabled') + ' onchange="toggleEspecTecnica(\'' + e.key + '\',this.checked)"></td>' +
                '<td><input type="date" id="et-fecha-' + e.key + '" value="' + (d.fecha || '') + '"' + (aplica ? '' : ' disabled') + ' onchange="guardarFechaEspecTecnica(\'' + e.key + '\',this.value)"></td>' +
                '</tr>';
        });
        tbody.innerHTML = html;
        actualizarEtProgreso(completados, total);
    });
}

window.toggleEspecTecnica = function(key, checked) {
    var cfg = window.edificioConfig;
    var fechaInput = document.getElementById('et-fecha-' + key);
    var fecha = (fechaInput && fechaInput.value) || null;
    window.db.ref('edificios/' + cfg.id + '/especificaciones_tecnicas/' + key).update({ completado: checked, fecha: fecha })
        .then(function() {
            mostrarToast(checked ? '✅ Marcado al día' : 'Desmarcado');
            cargarEspecTecnicas();
        }).catch(function() { mostrarToast('Error al guardar', 'error'); });
};

window.guardarFechaEspecTecnica = function(key, fecha) {
    window.db.ref('edificios/' + window.edificioConfig.id + '/especificaciones_tecnicas/' + key).update({ fecha: fecha });
};

window.cambiarAplicaEspecTecnica = function(key, valor) {
    var cfg = window.edificioConfig;
    var aplica = valor === 'si';
    window.db.ref('edificios/' + cfg.id + '/especificaciones_tecnicas/' + key).update({ aplica: aplica })
        .then(function() {
            mostrarToast(aplica ? '✅ Marcado como aplica' : '➖ Marcado como no aplica');
            cargarEspecTecnicas();
        }).catch(function() { mostrarToast('Error al guardar', 'error'); });
};

function actualizarEtProgreso(completados, total) {
    var pct = total > 0 ? Math.round((completados / total) * 100) : 0;
    var bar = document.getElementById('et-bar');
    if (bar) bar.style.width = pct + '%';
    var lbl = document.getElementById('et-label');
    if (lbl) lbl.textContent = completados + ' / ' + total + ' al día';
    var badge = document.getElementById('et-pct');
    if (badge) {
        badge.textContent = pct + '%';
        badge.className = 'badge ' + (pct >= 80 ? 'badge-success' : pct >= 40 ? 'badge-warning' : 'badge-danger');
    }
}

// ─── Banner de cotizaciones pendientes (dashboard) ──
function actualizarBannerCotizacionesDash() {
    var cfg = window.edificioConfig;
    var banner = document.getElementById('dash-banner-cotiz');
    if (!banner) return;

    window.db.ref('edificios/' + cfg.id + '/cotizaciones').once('value').then(function(snap) {
        var data = snap.val() || {};
        var empresas = data.empresas ? Object.keys(data.empresas).map(function(k) { return data.empresas[k]; }) : [];
        var tracking = data.tracking || {};
        var pasosCompletos = (typeof COT_STEPS !== 'undefined' ? COT_STEPS : []).filter(function(s) {
            return tracking[s.id] && tracking[s.id].completado;
        }).length;
        var totalPasos = (typeof COT_STEPS !== 'undefined' ? COT_STEPS.length : 0);
        var completado = empresas.length > 0 && totalPasos > 0 && pasosCompletos === totalPasos;

        if (!empresas.length || completado) { banner.classList.add('hidden'); return; }

        var conValor = empresas.filter(function(e) { return e.valor > 0; }).sort(function(a, b) { return a.valor - b.valor; });
        var msg = document.getElementById('dash-banner-cotiz-msg');
        if (msg) {
            if (conValor.length) {
                var min = conValor[0];
                msg.innerHTML = 'Mejor propuesta: <strong>' + min.nombre + '</strong> — $' + parseInt(min.valor).toLocaleString('es-CO') + (min.servicio ? ' · ' + min.servicio : '') + '. Cumplimiento Res. 0312/2019.';
            } else {
                msg.textContent = 'Hay ' + empresas.length + ' empresa(s) cotizante(s) registrada(s), falta definir valor y aprobar.';
            }
        }
        banner.classList.remove('hidden');
    }).catch(function() { banner.classList.add('hidden'); });
}
