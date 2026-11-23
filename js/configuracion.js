/* ===== CONFIGURACIÓN ===== */
function renderConfiguracion(){
  if(!tieneAccesoConfig()){ $('#config-content').innerHTML='<div class="empty">⛔ Sin permiso para acceder a Configuración</div>'; return; }
  const op=state.configOpen;
  let html = '<div class="config-stack">';

  if(puede('config_catalogos')){
    html += renderConfigCajon('rutas','🚚','Rutas',`${cfg.rutas.length} rutas registradas`,op.rutas,`
      <div class="config-list">${cfg.rutas.length?cfg.rutas.map((r,i)=>`<div class="config-item"><span class="config-item-name">${esc(r)}</span><div class="config-actions"><button class="btn-icon" onclick="event.stopPropagation();editConfigItem('rutas',${i})" title="Editar">✏️</button><button class="btn-icon danger" onclick="event.stopPropagation();deleteConfigItem('rutas',${i})" title="Eliminar">✕</button></div></div>`).join(''):'<div class="empty" style="padding:20px">Sin rutas.</div>'}</div>
      <button class="btn primary sm" onclick="addConfigItem('rutas')">➕ Agregar ruta</button>
    `);
    html += renderConfigCajon('materiales','📦','Materiales',`${cfg.materiales.length} materiales`,op.materiales,`
      <div class="config-list">${cfg.materiales.length?cfg.materiales.map((m,i)=>`<div class="config-item"><span class="config-item-name">${esc(m)}</span><div class="config-actions"><button class="btn-icon" onclick="event.stopPropagation();editConfigItem('materiales',${i})" title="Editar">✏️</button><button class="btn-icon danger" onclick="event.stopPropagation();deleteConfigItem('materiales',${i})" title="Eliminar">✕</button></div></div>`).join(''):'<div class="empty" style="padding:20px">Sin materiales.</div>'}</div>
      <button class="btn primary sm" onclick="addConfigItem('materiales')">➕ Agregar material</button>
    `);
    html += renderConfigCajon('clientes','🏢','Clientes',`${cfg.clientes.length} clientes`,op.clientes,`
      <div class="config-list">${cfg.clientes.length?cfg.clientes.map((c,i)=>`<div class="config-item"><span class="config-item-name">${esc(c)}</span><div class="config-actions"><button class="btn-icon" onclick="event.stopPropagation();editConfigItem('clientes',${i})" title="Editar">✏️</button><button class="btn-icon danger" onclick="event.stopPropagation();deleteConfigItem('clientes',${i})" title="Eliminar">✕</button></div></div>`).join(''):'<div class="empty" style="padding:20px">Sin clientes.</div>'}</div>
      <button class="btn primary sm" onclick="addConfigItem('clientes')">➕ Agregar cliente</button>
    `);
  }

  if(puede('config_tipos')){
    html += renderConfigCajon('tipos','🏷️','Tipos de viaje',`${Object.keys(TIPOS_VIAJE).length} tipos`,op.tipos,`
      <div class="config-list">${Object.entries(TIPOS_VIAJE).map(([k,t])=>`<div class="config-item"><span class="config-item-color" style="background:${t.color}"></span><span class="config-item-name">${esc(t.label)}</span><span class="config-item-badge">Lic. ${esc(t.licNombre)}</span><div class="config-actions"><button class="btn-icon" onclick="event.stopPropagation();editTipo('${k}')" title="Editar">✏️</button></div></div>`).join('')}</div>
    `);
  }

  if(puede('config_alertas')){
    html += renderConfigCajon('alertas','⏰','Umbrales de alerta',`${Object.keys(ALERTAS_DEFAULT).length} umbrales configurables`,op.alertas,`
      <div class="alert info" style="margin-bottom:14px"><span class="ico">ℹ️</span><div class="msg">Días antes del vencimiento en que un documento pasa a estado <b>POR VENCER</b> (ámbar) y dispara la alerta al crear viajes.</div></div>
      <div class="config-list">
        ${Object.keys(UMBRALES_LABELS).map(k=>`<div class="config-item" style="gap:12px"><span class="config-item-name" style="flex:1">${esc(UMBRALES_LABELS[k])}</span><input type="number" min="0" class="umbral-input" value="${cfg.alertas[k]}" onchange="setUmbral('${k}',this.value)"><span style="font-size:11px;color:var(--text-sec);min-width:35px;text-align:right">días</span></div>`).join('')}
      </div>
      <button class="btn secondary sm" onclick="resetUmbrales()">↺ Restaurar valores por defecto</button>
    `);
  }

  if(puede('gestionar_usuarios')){
    html += renderConfigCajon('usuarios','👥','Usuarios y permisos',`${cfg.usuarios.length} usuarios registrados`,op.usuarios, renderUsuariosSectionHTML());
  }

  html += '</div>';
  $('#config-content').innerHTML = html;
}

function renderUsuariosSectionHTML(){
  const header = `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px;flex-wrap:wrap">
      <div class="alert info" style="margin:0;flex:1;min-width:200px">
        <span class="ico">💡</span>
        <div class="msg">Crea usuarios y personaliza exactamente qué acciones pueden realizar. Los permisos son individuales.</div>
      </div>
      <button class="btn primary" onclick="abrirCrearUsuario()">➕ Nuevo usuario</button>
    </div>
  `;
  if(!cfg.usuarios.length){
    return header + `<div class="empty" style="padding:30px">No hay usuarios registrados.</div>`;
  }
  const cards = cfg.usuarios.map(u=>renderUserCardHTML(u)).join('');
  return header + `<div style="display:flex;flex-direction:column;gap:10px">${cards}</div>`;
}

function renderUserCardHTML(u){
  const isCurrent = u.id === state.usuarioActualId;
  const preset = ROLES[u.rol] || ROLES.viewer;
  const numPermisos = Object.values(u.permisos||{}).filter(Boolean).length;
  const totalPermisos = PERMISOS_LIST.length;
  const pct = Math.round(numPermisos/totalPermisos*100);
  return `
    <div class="user-card ${u.activo?'':'inactive'}">
      <div class="user-card-avatar" style="background:${preset.color}">${esc((u.nombre||'??').slice(0,2).toUpperCase())}</div>
      <div class="user-card-info">
        <div class="user-card-name">
          ${esc(u.nombre)}
          ${isCurrent?'<span class="user-card-badge" style="background:var(--success)">SESIÓN ACTUAL</span>':''}
          ${!u.activo?'<span class="user-card-badge" style="background:var(--text-dis)">INACTIVO</span>':''}
        </div>
        <div class="user-card-sub">
          ${preset.icon} ${esc(preset.name)} · <b>${numPermisos}/${totalPermisos}</b> permisos (${pct}%)
        </div>
        <div class="user-card-cred">👤 Usuario: <b>${esc(u.usuario||'—')}</b></div>
      </div>
      <div style="display:flex;gap:4px">
        <button class="btn-icon" onclick="abrirEditarUsuario('${u.id}')" title="Editar usuario y permisos">✏️</button>
        <button class="btn-icon danger" onclick="eliminarUsuario('${u.id}')" title="Eliminar usuario" ${isCurrent?'disabled':''}>✕</button>
      </div>
    </div>
  `;
}

function abrirCrearUsuario(){
  if(!puede('gestionar_usuarios')){ noPermiso(); return; }
  abrirFormularioUsuario(null);
}
function abrirEditarUsuario(id){
  if(!puede('gestionar_usuarios')){ noPermiso(); return; }
  abrirFormularioUsuario(id);
}

function abrirFormularioUsuario(id){
  const esEdicion = id !== null;
  const u = esEdicion ? cfg.usuarios.find(x=>x.id===id) : {
    id:null, nombre:'', rol:'viewer', activo:true,
    permisos: JSON.parse(JSON.stringify(PERMISOS_PRESET.viewer))
  };
  if(!u) return;

  const grupos = {};
  PERMISOS_LIST.forEach(p=>{ (grupos[p.group]=grupos[p.group]||[]).push(p); });
  const gruposHTML = Object.entries(grupos).map(([grupo, permisos])=>`
    <div class="permiso-group-title">${grupo}</div>
    <div class="permiso-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:6px">
      ${permisos.map(p=>`
        <label class="permiso-check" data-permiso="${p.k}">
          <input type="checkbox" id="perm-${p.k}" ${u.permisos[p.k]?'checked':''}>
          <span>${p.label}</span>
        </label>
      `).join('')}
    </div>
  `).join('');

  const body = `
    <div class="alert danger hidden" id="user-alert"><span class="ico">⚠</span><div class="msg"></div></div>
    <h4 class="sec-title">👤 Datos del usuario</h4>
    <div class="form-grid">
      <div class="field"><label>Nombre <span class="req">*</span></label><input id="u-nombre" value="${esc(u.nombre)}" placeholder="Nombre del usuario"></div>
      <div class="field"><label>Usuario (para iniciar sesión) <span class="req">*</span></label><input id="u-usuario" value="${esc(u.usuario||'')}" placeholder="Ej: jperez" autocomplete="off" autocapitalize="none"></div>
      <div class="field"><label>Rol base</label>
        <select id="u-rol" onchange="cambiarRolFormulario(this.value)">
          <option value="admin" ${u.rol==='admin'?'selected':''}>👑 Administrador (todos los permisos)</option>
          <option value="editor" ${u.rol==='editor'?'selected':''}>✏️ Editor GRR/GRT</option>
          <option value="viewer" ${u.rol==='viewer'?'selected':''}>👁 Visor (solo lectura)</option>
          <option value="personalizado" ${u.rol==='personalizado'?'selected':''}>⚙️ Personalizado</option>
        </select>
      </div>
    </div>
    <div class="field" style="margin-top:12px">
      <label class="permiso-check" style="background:#F4F8FC;border-color:#B8D0ED">
        <input type="checkbox" id="u-activo" ${u.activo?'checked':''}>
        <span><b>Usuario activo</b> — puede iniciar sesión en el sistema</span>
      </label>
    </div>
    <h4 class="sec-title">🔐 Permisos granulares</h4>
    <div class="alert info" style="margin-bottom:14px"><span class="ico">💡</span><div class="msg">Marca las acciones que este usuario puede realizar. Al cambiar el rol base se aplican los permisos típicos de ese rol (puedes ajustarlos después).</div></div>
    ${gruposHTML}
  `;
  const foot = `<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="guardarUsuarioFormulario(${esEdicion?`'${id}'`:'null'})">${esEdicion?'💾 Guardar cambios':'➕ Crear usuario'}</button>`;
  openModal(esEdicion?`✏️ Editar usuario · ${u.nombre}`:'➕ Nuevo usuario', body, foot, true);
  setTimeout(()=>{ const n = document.getElementById('u-nombre'); if(n) n.focus(); }, 80);
}

function cambiarRolFormulario(rol){
  const preset = PERMISOS_PRESET[rol];
  if(!preset) return;
  PERMISOS_LIST.forEach(p=>{
    const cb = document.getElementById('perm-'+p.k);
    if(cb) cb.checked = !!preset[p.k];
  });
}

function guardarUsuarioFormulario(id){
  if(!puede('gestionar_usuarios')){ noPermiso(); return; }
  const alertEl = document.getElementById('user-alert'); alertEl.classList.add('hidden');
  const nombre = document.getElementById('u-nombre').value.trim();
  const rol = document.getElementById('u-rol').value;
  const usuario = document.getElementById('u-usuario').value.trim().toLowerCase();
  const activo = document.getElementById('u-activo').checked;
  const permisos = {};
  PERMISOS_LIST.forEach(p=>{
    const cb = document.getElementById('perm-'+p.k);
    permisos[p.k] = cb ? cb.checked : false;
  });

  const errs = [];
  if(!nombre) errs.push('El nombre es obligatorio.');
  if(!usuario) errs.push('El usuario es obligatorio.');
  else if(/\s/.test(usuario)) errs.push('El usuario no puede tener espacios.');
  else if(cfg.usuarios.some(x => x.id !== id && (x.usuario||'').toLowerCase() === usuario)) errs.push('Ya existe otro usuario con ese nombre de usuario.');

  if(id){
    const adminActual = cfg.usuarios.find(x=>x.id===id);
    const eraAdmin = adminActual && adminActual.rol==='admin';
    const seraAdmin = rol==='admin' && activo;
    if(eraAdmin && !seraAdmin){
      const otrosAdmins = cfg.usuarios.filter(x=>x.id!==id && x.rol==='admin' && x.activo).length;
      if(otrosAdmins === 0){
        errs.push('No puedes quitar el rol de administrador al último administrador activo.');
      }
    }
    if(id === state.usuarioActualId && !permisos.gestionar_usuarios){
      errs.push('No puedes quitarte el permiso de "Gestionar usuarios" a ti mismo.');
    }
  }

  if(errs.length){
    alertEl.querySelector('.msg').innerHTML = `<b>No se pudo guardar:</b><ul>${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    alertEl.classList.remove('hidden');
    document.querySelector('#modal-body').scrollTo({top:0,behavior:'smooth'});
    return;
  }

  if(id){
    const u = cfg.usuarios.find(x=>x.id===id);
    const antes = {nombre:u.nombre, rol:u.rol, activo:u.activo};
    Object.assign(u, {nombre, usuario, rol, activo, permisos}); delete u.clave;
    registrarCambio('Configuración','Editar usuario', u.nombre, 'Datos', JSON.stringify(antes), JSON.stringify({nombre,rol,activo}));
    toast('Usuario actualizado ✓', 'success');
  } else {
    cfg.usuarios.push({ id:'u'+Date.now(), nombre, usuario, rol, activo, permisos });
    registrarCambio('Configuración','Crear usuario', nombre, '', '', rol);
    toast('Usuario creado ✓', 'success');
  }

  guardar();
  closeModal();
  actualizarSelectorUsuarios();
  actualizarNavVisibilidad();
  actualizarDropdowns();
  renderConfiguracion();

  if(id === state.usuarioActualId){
    cambiarVista(state.view);
  }
}

function eliminarUsuario(id){
  if(!puede('gestionar_usuarios')){ noPermiso(); return; }
  const u = cfg.usuarios.find(x=>x.id===id);
  if(!u) return;
  if(id === state.usuarioActualId){
    toast('⛔ No puedes eliminar tu propio usuario','danger');
    return;
  }
  if(u.rol === 'admin' && u.activo){
    const otrosAdmins = cfg.usuarios.filter(x=>x.id!==id && x.rol==='admin' && x.activo).length;
    if(otrosAdmins === 0){
      toast('⛔ No puedes eliminar el último administrador activo','danger');
      return;
    }
  }
  if(!confirm(`¿Eliminar el usuario "${u.nombre}"?\n\nEsta acción no se puede deshacer.`)) return;
  cfg.usuarios = cfg.usuarios.filter(x=>x.id!==id);
  registrarCambio('Configuración','Eliminar usuario', u.nombre);
  guardar();
  renderConfiguracion();
  actualizarSelectorUsuarios();
  toast('Usuario eliminado', 'warning');
}

function renderConfigCajon(key, icon, title, sub, open, body){
  return `<div class="config-card ${open?'open':''}"><div class="config-head" onclick="toggleConfigSection('${key}')"><div class="config-head-left"><div class="config-icon">${icon}</div><div><div class="config-title">${title}</div><div class="config-sub">${sub}</div></div></div><span class="config-chevron">▼</span></div><div class="config-body">${body}</div></div>`;
}
function toggleConfigSection(sec){ state.configOpen[sec]=!state.configOpen[sec]; renderConfiguracion(); }

function setUmbral(key, val){
  if(!puede('config_alertas')){ noPermiso(); return; }
  const n = parseInt(val);
  if(isNaN(n) || n < 0){ toast('Valor inválido','danger'); renderConfiguracion(); return; }
  const anterior = cfg.alertas[key];
  cfg.alertas[key] = n;
  if(anterior !== n) registrarCambio('Configuración','Editar umbral', UMBRALES_LABELS[key], 'Días', anterior, n);
  guardar(); renderVehiculos(); renderResumen();
  toast(`✓ ${UMBRALES_LABELS[key]}: ${n} días`, 'success');
}
function resetUmbrales(){
  if(!puede('config_alertas')){ noPermiso(); return; }
  if(!confirm('¿Restaurar todos los umbrales a sus valores por defecto?')) return;
  cfg.alertas = JSON.parse(JSON.stringify(ALERTAS_DEFAULT));
  registrarCambio('Configuración','Restaurar umbrales', 'Todos', '', '', 'Valores por defecto');
  guardar(); renderConfiguracion(); renderVehiculos(); renderResumen();
  toast('Umbrales restaurados ✓','success');
}

function addConfigItem(sec){
  if(!puede('config_catalogos')){ noPermiso(); return; }
  openModal(`Agregar ${sec.slice(0,-1)}`,`<div class="field"><label>Nuevo valor</label><input id="inp-new-config" placeholder="Escribe el nombre..."></div>`,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveNewConfig('${sec}')">Agregar</button>`);
  setTimeout(()=>document.getElementById('inp-new-config').focus(),80);
}
function saveNewConfig(sec){
  if(!puede('config_catalogos')){ noPermiso(); return; }
  const val=(document.getElementById('inp-new-config').value||'').trim();
  if(!val){ toast('Valor vacío','danger'); return; }
  if(cfg[sec].some(x=>x.toLowerCase()===val.toLowerCase())){ toast('Ya existe ese valor','warning'); return; }
  cfg[sec].push(val);
  registrarCambio('Configuración','Crear', sec.toUpperCase().slice(0,-1), '', '', val);
  guardar(); closeModal(); renderConfiguracion();
  toast('Agregado ✓','success');
}
function editConfigItem(sec, index){
  if(!puede('config_catalogos')){ noPermiso(); return; }
  const current=cfg[sec][index];
  openModal('Editar',`<div class="field"><label>Valor</label><input id="inp-edit-config" value="${esc(current)}"></div>`,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveEditConfig('${sec}',${index})">Guardar</button>`);
  setTimeout(()=>{ const i=document.getElementById('inp-edit-config'); i.focus(); i.select(); },80);
}
function saveEditConfig(sec, index){
  if(!puede('config_catalogos')){ noPermiso(); return; }
  const val=(document.getElementById('inp-edit-config').value||'').trim();
  if(!val){ toast('Valor vacío','danger'); return; }
  const anterior = cfg[sec][index];
  cfg[sec][index]=val;
  if(anterior !== val) registrarCambio('Configuración','Editar', sec.toUpperCase().slice(0,-1), '', anterior, val);
  guardar(); closeModal(); renderConfiguracion();
  toast('Actualizado ✓','success');
}
function deleteConfigItem(sec, index){
  if(!puede('config_catalogos')){ noPermiso(); return; }
  const val=cfg[sec][index];
  if(!confirm(`¿Eliminar "${val}"?`)) return;
  cfg[sec].splice(index,1);
  registrarCambio('Configuración','Eliminar', sec.toUpperCase().slice(0,-1), '', val, '');
  guardar(); renderConfiguracion();
  toast('Eliminado','warning');
}
function editTipo(key){
  if(!puede('config_tipos')){ noPermiso(); return; }
  const t=TIPOS_VIAJE[key];
  openModal('Editar tipo de viaje',`<div class="field"><label>Nombre</label><input id="inp-tipo-label" value="${esc(t.label)}"></div><div class="field" style="margin-top:12px"><label>Color</label><input id="inp-tipo-color" type="color" value="${t.color}" style="height:42px;padding:4px;cursor:pointer"></div><p style="font-size:11px;color:var(--text-sec);margin-top:12px">Licencia requerida: <b>${esc(t.licNombre)}</b> (no editable).</p>`,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="saveTipo('${key}')">Guardar</button>`);
}
function saveTipo(key){
  if(!puede('config_tipos')){ noPermiso(); return; }
  const label=(document.getElementById('inp-tipo-label').value||'').trim();
  const color=document.getElementById('inp-tipo-color').value;
  if(!label){ toast('Nombre vacío','danger'); return; }
  const antLabel = TIPOS_VIAJE[key].label;
  const antColor = TIPOS_VIAJE[key].color;
  cfg.tiposLabels[key]={label,color};
  TIPOS_VIAJE[key].label=label;
  TIPOS_VIAJE[key].color=color;
  if(antLabel !== label) registrarCambio('Configuración','Editar tipo', key, 'Nombre', antLabel, label);
  if(antColor !== color) registrarCambio('Configuración','Editar tipo', key, 'Color', antColor, color);
  guardar(); closeModal(); renderConfiguracion(); renderTodo();
  toast('Tipo actualizado ✓','success');
}

function renderTodo(){
  if(puede('ver_resumen')) renderResumen();
  if(puede('ver_vehiculos')) renderVehiculos();
  if(puede('ver_conductores')) renderConductores();
  if(puede('ver_viajes')) renderViajes();
  if(state.view==='historico' && puede('ver_historico')) renderHistorico();
  if(state.view==='historial' && puede('ver_registro')) renderHistorial();
  if(state.view==='configuracion' && tieneAccesoConfig()) renderConfiguracion();
}

function actualizarUICompleta(){
  actualizarSelectorUsuarios();
  actualizarNavVisibilidad();
  actualizarDropdowns();
}

