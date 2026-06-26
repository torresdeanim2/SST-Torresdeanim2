// ═══════════════════════════════════════════════
//  HERRAMIENTAS.JS — Admin: informe, cuenta, PAT, supervisión, contratistas
// ═══════════════════════════════════════════════

var HT_MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                         'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function initHerramientas() {
    var sec = document.getElementById('section-herramientas');
    if (!sec) return;

    sec.innerHTML =
        '<div class="alert-banner info" style="margin-bottom:20px;">' +
          '<span class="ab-icon">🔧</span>' +
          '<div class="ab-body">' +
            '<div class="ab-title">Panel de Herramientas Administrativas</div>' +
            '<div class="ab-msg">Acceso restringido. Genera informes, edita el PAT, gestiona supervisiones y comunícate con contratistas.</div>' +
          '</div>' +
        '</div>' +

        '<div class="herramientas-grid">' +
          mkHerrCard('📝', 'Registros Operacionales', 'Inducción, inspecciones, mantenimiento, contratistas, accidentes y simulacros.', 'abrirHerramienta("registros.html")') +
          mkHerrCard('📸', 'Módulo Supervisión (Fotos)', 'Registra supervisiones mensuales con evidencia fotográfica y genera PDF.', 'abrirHerramienta("supervision.html")') +
          mkHerrCard('📊', 'Informe Mensual PDF', 'Genera el informe consolidado del mes con todas las actividades en PDF.', 'abrirHerramienta("informe-mensual.html")') +
          mkHerrCard('📋', 'Plan Anual de Trabajo 2026', 'Edita las 51 actividades del PAT y marca avances mes a mes.', 'abrirHerramienta("pat-2026.html")') +
          mkHerrCard('🔧', 'Programa de Mantenimiento', 'Gestiona el programa de mantenimientos preventivos y correctivos.', 'abrirHerramienta("mantenimiento-2026.html")') +
          mkHerrCard('⚠️', 'Investigación de Accidentes', 'Diligencia el formato oficial de investigación de accidentes e incidentes.', 'abrirHerramienta("investigacion-accidentes.html")') +
          mkHerrCard('🚨', 'Registro de Simulacros', 'Registra simulacros de emergencia con participantes y evaluación.', 'abrirHerramienta("simulacros.html")') +
          mkHerrCard('💰', 'Cuenta de Cobro', 'Genera la cuenta de cobro mensual de honorarios SST.', 'abrirGeneradorCuenta()') +
          mkHerrCard('📱', 'Comunicaciones Contratistas', 'Genera mensajes preformateados para WhatsApp.', 'abrirComunicaciones()') +
        '</div>' +

        // Panel Cuenta de Cobro
        '<div id="panel-cuenta" class="card hidden" style="margin-top:20px;">' +
          '<div class="card-header"><span class="card-title">💰 Generador Cuenta de Cobro</span><button class="btn-icon" onclick="cerrarPanel(\'panel-cuenta\')">✕</button></div>' +
          '<div class="form-row">' +
            '<div class="form-group-inline"><label>Mes de prestación</label>' +
              '<select id="cc-mes">' + HT_MESES_NOMBRES.map(function(m,i){ return '<option value="' + (i+1) + '">' + m + '</option>'; }).join('') + '</select>' +
            '</div>' +
            '<div class="form-group-inline"><label>Año</label><input type="number" id="cc-anio" value="2026"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group-inline"><label>Valor honorarios (COP)</label><input type="number" id="cc-valor" placeholder="Ej: 350000"></div>' +
            '<div class="form-group-inline"><label>Número de cuenta</label><input type="text" id="cc-numero" placeholder="Ej: CC-001-2026"></div>' +
          '</div>' +
          '<div style="display:flex;gap:10px;margin-top:14px;">' +
            '<button class="btn-primary" onclick="generarCuentaTexto()">📋 Copiar cuenta de cobro</button>' +
            '<button class="btn-secondary" onclick="cerrarPanel(\'panel-cuenta\')">Cerrar</button>' +
          '</div>' +
          '<pre id="cc-preview" style="margin-top:16px;background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:14px;font-size:0.8rem;line-height:1.6;white-space:pre-wrap;display:none;"></pre>' +
        '</div>' +

        // Panel Comunicaciones
        '<div id="panel-comunicaciones" class="card hidden" style="margin-top:20px;">' +
          '<div class="card-header"><span class="card-title">📱 Comunicaciones Contratistas</span><button class="btn-icon" onclick="cerrarPanel(\'panel-comunicaciones\')">✕</button></div>' +
          '<div id="panel-comm-contenido"></div>' +
        '</div>';

    // Prellenar mes actual en Cuenta de Cobro
    var hoy = new Date();
    var mesActual = hoy.getMonth();
    var elCcMes = document.getElementById('cc-mes');
    if (elCcMes) elCcMes.value = mesActual + 1;
}

function mkHerrCard(icon, titulo, desc, onclick) {
    return '<div class="herr-card" onclick="' + onclick + '">' +
        '<h3>' + icon + ' ' + titulo + '</h3>' +
        '<p>' + desc + '</p>' +
        '</div>';
}

window.cerrarPanel = function(id) {
    document.getElementById(id).classList.add('hidden');
};

window.abrirGeneradorCuenta = function() { document.getElementById('panel-cuenta').classList.remove('hidden'); };

window.abrirHerramienta = function(archivo) {
    window.open('tools/' + archivo, '_blank');
};

window.abrirComunicaciones = function() {
    var panel = document.getElementById('panel-comunicaciones');
    panel.classList.remove('hidden');
    var cfg = window.edificioConfig;
    var html = '<p style="color:var(--text-gray);font-size:0.88rem;margin-bottom:14px;">Genera mensajes preformateados para comunicarte con los contratistas del edificio.</p>';
    if (cfg.contratistas && cfg.contratistas.length) {
        cfg.contratistas.forEach(function(c, i) {
            if (!c.nombre || c.nombre.startsWith('{{')) return;
            html += '<div style="border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px;">' +
                '<strong>' + c.nombre + '</strong> — <span style="color:var(--text-gray);">' + (c.servicio || '') + '</span>' +
                '<br><button class="btn-secondary" style="margin-top:10px;padding:6px 14px;font-size:0.83rem;" onclick="generarMsgContratista(' + i + ')">📱 Generar mensaje</button>' +
                '</div>';
        });
    } else {
        html += '<p style="color:var(--text-gray);">Configura los contratistas en datos-edificio.json.</p>';
    }
    document.getElementById('panel-comm-contenido').innerHTML = html;
};

window.generarMsgContratista = function(idx) {
    var cfg = window.edificioConfig;
    var c = cfg.contratistas[idx];
    var hoy = new Date();
    var texto = 'Buen día ' + c.nombre + ',\n\n' +
        'Me comunico en nombre del ' + cfg.nombre + ' para recordarle las actividades ' +
        'de Seguridad y Salud en el Trabajo del mes de ' + HT_MESES_NOMBRES[hoy.getMonth()] + ' 2026:\n\n' +
        '• Inducción SST para el personal\n' +
        '• Entrega actualizada de ARL y seguridad social\n' +
        '• Revisión de EPPs\n\n' +
        'Quedo atenta a su confirmación.\n\n' +
        'Carla Castellano Madriz | C.E. 679955\nCompliance Pro · 2026';
    navigator.clipboard.writeText(texto)
        .then(function() { mostrarToast('✅ Mensaje copiado para ' + c.nombre, 'success'); })
        .catch(function() { mostrarToast('No se pudo copiar. Código: ' + texto.substring(0,30), 'error'); });
};

// ─── Generador Cuenta de Cobro ────────────────────
window.generarCuentaTexto = function() {
    var cfg = window.edificioConfig;
    var mes = parseInt(document.getElementById('cc-mes').value);
    var anio = document.getElementById('cc-anio').value;
    var valor = document.getElementById('cc-valor').value;
    var numero = document.getElementById('cc-numero').value || 'CC-' + String(mes).padStart(2,'0') + '-' + anio;
    var hoy = new Date();

    var valorFmt = valor ? '$ ' + parseInt(valor).toLocaleString('es-CO') : '$ ___________';
    var texto = [
        'CUENTA DE COBRO N° ' + numero,
        '═════════════════════════════════',
        '',
        'CONTRATANTE:',
        cfg.nombre,
        'NIT: ' + cfg.nit,
        'Dirección: ' + cfg.direccion,
        '',
        'CONTRATISTA:',
        'Carla Castellano Madriz',
        'C.E. 679955',
        'Servicios profesionales en Seguridad y Salud en el Trabajo',
        '',
        '─── DESCRIPCIÓN DEL SERVICIO ───',
        '',
        'Por concepto de asesoría y ejecución del Sistema de Gestión de Seguridad',
        'y Salud en el Trabajo (SG-SST) correspondiente al mes de',
        HT_MESES_NOMBRES[mes-1] + ' de ' + anio + ', según Resolución 0312/2019.',
        '',
        'VALOR TOTAL: ' + valorFmt,
        '',
        'Fecha de expedición: ' + hoy.toLocaleDateString('es-CO'),
        '',
        '─────────────────────────────────',
        'Carla Castellano Madriz',
        'C.E. 679955',
        'Compliance Pro'
    ];

    var textoFinal = texto.join('\n');
    var pre = document.getElementById('cc-preview');
    pre.textContent = textoFinal;
    pre.style.display = 'block';
    navigator.clipboard.writeText(textoFinal)
        .then(function() { mostrarToast('✅ Cuenta de cobro copiada', 'success'); })
        .catch(function() { mostrarToast('Texto generado en el cuadro.'); });
};

