// ═══════════════════════════════════════════════
//  HABEAS-DATA.JS — Autorización Ley 1581/2012
//  Accesible sin login (desde botón en pantalla de login)
// ═══════════════════════════════════════════════

function initHabeasData() {
    var sec = document.getElementById('section-habeas-data');
    if (!sec) return;
    var cfg = window.edificioConfig || {};
    var nombreEdif = cfg.nombre || 'el edificio';

    sec.innerHTML =
        '<div class="card hd-form">' +
          '<div class="card-header"><span class="card-title">🔒 Habeas Data — Ley 1581/2012</span></div>' +

          '<div class="hd-aviso">' +
            '<strong>📋 Aviso de tratamiento de datos personales</strong><br><br>' +
            nombreEdif + ', en cumplimiento de la Ley Estatutaria 1581 de 2012 y el Decreto ' +
            'reglamentario 1377 de 2013, informa que los datos personales recopilados serán ' +
            'utilizados exclusivamente para:<br><br>' +
            '• Gestión del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)<br>' +
            '• Comunicaciones relacionadas con actividades de seguridad y salud<br>' +
            '• Registro y control de inducciones, capacitaciones y actividades SST<br><br>' +
            'Los datos no serán compartidos con terceros sin su consentimiento previo, ' +
            'expreso e informado. Usted tiene derecho a conocer, actualizar, rectificar y ' +
            'suprimir sus datos personales.' +
          '</div>' +

          '<h3 style="font-size:1rem;margin-bottom:14px;color:var(--primary);">Formulario de autorización</h3>' +

          '<div class="form-row">' +
            '<div class="form-group-inline"><label>Nombre completo *</label><input type="text" id="hd-nombre" placeholder="Nombres y apellidos"></div>' +
            '<div class="form-group-inline"><label>Cédula / Documento *</label><input type="text" id="hd-cedula" placeholder="Número de documento"></div>' +
          '</div>' +
          '<div class="form-row">' +
            '<div class="form-group-inline"><label>Correo electrónico</label><input type="email" id="hd-email" placeholder="correo@ejemplo.com"></div>' +
            '<div class="form-group-inline"><label>Teléfono</label><input type="tel" id="hd-tel" placeholder="Celular o fijo"></div>' +
          '</div>' +
          '<div class="form-row-1 form-group-inline">' +
            '<label>Calidad en la que actúa *</label>' +
            '<select id="hd-calidad">' +
              '<option value="">Selecciona...</option>' +
              '<option value="residente">Residente</option>' +
              '<option value="propietario">Propietario</option>' +
              '<option value="contratista">Contratista / Empresa externa</option>' +
              '<option value="trabajador">Trabajador del edificio</option>' +
              '<option value="visitante">Visitante frecuente</option>' +
            '</select>' +
          '</div>' +

          '<div class="hd-check-row">' +
            '<input type="checkbox" id="hd-autoriza">' +
            '<label for="hd-autoriza">Declaro que he leído y entendido el aviso de tratamiento de datos personales y ' +
            '<strong>autorizo de manera libre, previa, expresa e informada</strong> el tratamiento de mis datos personales ' +
            'para los fines indicados, de conformidad con la Ley 1581 de 2012.</label>' +
          '</div>' +

          '<div id="hd-error" class="error-msg hidden" style="margin-top:14px;"></div>' +

          '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap;">' +
            '<button class="btn-primary" onclick="enviarHabeasData()">✅ Registrar autorización</button>' +
            '<button class="btn-secondary" onclick="window.mostrarSeccion(\'dashboard\')" id="btn-volver-hd">← Volver al sistema</button>' +
          '</div>' +
        '</div>' +

        '<div class="card" id="hd-registros-card" style="margin-top:20px;">' +
          '<div class="card-header"><span class="card-title">📋 Autorizaciones registradas</span>' +
          '<span id="hd-total-badge" class="badge badge-gray">Cargando...</span></div>' +
          '<div id="hd-lista"><p style="color:var(--text-gray);padding:16px;">Cargando...</p></div>' +
        '</div>';

    // Mostrar botón volver solo si hay sesión activa
    if (!window.currentUser) {
        var btnVolver = document.getElementById('btn-volver-hd');
        if (btnVolver) btnVolver.style.display = 'none';
    }

    cargarRegistrosHD();
}

window.enviarHabeasData = function() {
    var nombre  = document.getElementById('hd-nombre').value.trim();
    var cedula  = document.getElementById('hd-cedula').value.trim();
    var email   = document.getElementById('hd-email').value.trim();
    var tel     = document.getElementById('hd-tel').value.trim();
    var calidad = document.getElementById('hd-calidad').value;
    var autoriza = document.getElementById('hd-autoriza').checked;
    var errDiv  = document.getElementById('hd-error');

    errDiv.classList.add('hidden');

    if (!nombre || !cedula || !calidad) {
        errDiv.textContent = 'Por favor completa los campos obligatorios (nombre, cédula y calidad).';
        errDiv.classList.remove('hidden'); return;
    }
    if (!autoriza) {
        errDiv.textContent = 'Debes aceptar el aviso de tratamiento de datos para continuar.';
        errDiv.classList.remove('hidden'); return;
    }

    var cfg = window.edificioConfig || {};
    var registro = {
        nombre: nombre,
        cedula: cedula,
        email: email || null,
        tel: tel || null,
        calidad: calidad,
        autoriza: true,
        fecha: new Date().toLocaleDateString('es-CO'),
        timestamp: Date.now(),
        edificio: cfg.nombre || 'N/A'
    };

    window.db.ref('edificios/' + (cfg.id || 'template') + '/habeas_data').push(registro)
        .then(function() {
            mostrarToast('✅ Autorización registrada correctamente', 'success');
            // Limpiar formulario
            ['hd-nombre','hd-cedula','hd-email','hd-tel'].forEach(function(id) {
                document.getElementById(id).value = '';
            });
            document.getElementById('hd-calidad').value = '';
            document.getElementById('hd-autoriza').checked = false;
            cargarRegistrosHD();
        })
        .catch(function(err) {
            errDiv.textContent = 'Error al guardar. Por favor intenta de nuevo.';
            errDiv.classList.remove('hidden');
        });
};

function cargarRegistrosHD() {
    var cfg = window.edificioConfig || {};
    var lista = document.getElementById('hd-lista');
    var badge = document.getElementById('hd-total-badge');
    var card  = document.getElementById('hd-registros-card');

    // Solo mostrar lista a administradores
    if (!window.currentUser) {
        if (card) card.style.display = 'none';
        return;
    }

    window.db.ref('edificios/' + (cfg.id || 'template') + '/habeas_data').once('value').then(function(snap) {
        var items = [];
        snap.forEach(function(c) { items.push(c.val()); });
        items.sort(function(a,b) { return (b.timestamp||0) - (a.timestamp||0); });

        if (badge) {
            badge.textContent = items.length + ' registros';
            badge.className = 'badge ' + (items.length > 0 ? 'badge-success' : 'badge-gray');
        }

        if (!items.length) {
            lista.innerHTML = '<p style="color:var(--text-gray);padding:16px;">Sin autorizaciones registradas aún.</p>';
            return;
        }

        var html = '<div class="table-wrap"><table>' +
            '<thead><tr><th>Nombre</th><th>Cédula</th><th>Calidad</th><th>Correo</th><th>Fecha</th></tr></thead><tbody>';
        items.forEach(function(it) {
            html += '<tr>' +
                '<td style="font-weight:600;">' + it.nombre + '</td>' +
                '<td>' + it.cedula + '</td>' +
                '<td><span class="badge badge-gray">' + (it.calidad || '—') + '</span></td>' +
                '<td style="font-size:0.83rem;">' + (it.email || '—') + '</td>' +
                '<td style="font-size:0.83rem;color:var(--text-gray);">' + (it.fecha || '—') + '</td>' +
                '</tr>';
        });
        html += '</tbody></table></div>';
        lista.innerHTML = html;
    });
}
