/* ===== CONDUCTORES ===== */
function renderConductores(){
  const f=state.filtrosConductores;
  const modoElim = state.modoEliminarCond;
  const puedeEditar = puede('editar_conductores');
  const puedeActualizar = puede('actualizar_licencias_conductores');
  const mostrarAcciones = puedeEditar || puedeActualizar;

  $('#tabla-conductores').innerHTML=`<div class="table-wrap"><table style="min-width:${modoElim?'1420':(mostrarAcciones?'1380':'1340')}px">
    <thead>
      <tr>
        ${modoElim?`<th style="width:40px"><input type="checkbox" class="row-check" id="chk-all-cond" onchange="toggleAllConductores(this.checked)"></th>`:''}
        <th>#</th><th>CONDUCTOR</th><th>DNI</th><th>LICENCIA</th><th>DNI VIGENCIA</th><th>PLACA TRACTO</th><th>PLACA CARRETA</th>
        <th>LIC. A3</th><th>LIC. A4</th>
        ${(modoElim || !mostrarAcciones)?'':`<th style="text-align:right">ACCIÓN</th>`}
      </tr>
      <tr class="filter-row">
        ${modoElim?'<th></th>':''}
        <th></th>
        <th><input class="th-filter" value="${esc(f.nombre)}" oninput="setFiltroCond('nombre',this.value)" placeholder="Buscar..."></th>
        <th><input class="th-filter" value="${esc(f.dni)}" oninput="setFiltroCond('dni',this.value)" placeholder="DNI..."></th>
        <th><input class="th-filter" value="${esc(f.licencia)}" oninput="setFiltroCond('licencia',this.value)" placeholder="Licencia..."></th>
        <th><select class="th-filter" onchange="setFiltroCond('dniVigencia',this.value)">${ESTADOS_OPTS(f.dniVigencia)}</select></th>
        <th><input class="th-filter" value="${esc(f.placaTracto)}" oninput="setFiltroCond('placaTracto',this.value)" placeholder="Placa..."></th>
        <th><input class="th-filter" value="${esc(f.placaCarreta)}" oninput="setFiltroCond('placaCarreta',this.value)" placeholder="Placa..."></th>
        <th><select class="th-filter" onchange="setFiltroCond('a3',this.value)">${ESTADOS_OPTS(f.a3)}</select></th>
        <th><select class="th-filter" onchange="setFiltroCond('a4',this.value)">${ESTADOS_OPTS(f.a4)}</select></th>
        ${(modoElim || !mostrarAcciones)?'':'<th></th>'}
      </tr>
    </thead>
    <tbody id="tbody-conductores"></tbody>
  </table></div>`;
  renderConductoresBody();
}

function filtrarConductores(){
  const f=state.filtrosConductores, s=state.search;
  return conductores.filter(c=>{
    if(f.nombre && !c.nombre.toLowerCase().includes(f.nombre.toLowerCase())) return false;
    if(f.dni && !c.dni.includes(f.dni)) return false;
    if(f.licencia && !(c.licencia||'').toLowerCase().includes(f.licencia.toLowerCase())) return false;
    if(f.dniVigencia && estado(c.dniVigencia).cls!==f.dniVigencia) return false;
    if(f.placaTracto && !c.placaTracto.toLowerCase().includes(f.placaTracto.toLowerCase())) return false;
    if(f.placaCarreta && !c.placaCarreta.toLowerCase().includes(f.placaCarreta.toLowerCase())) return false;
    if(f.a3 && estado(c.a3).cls!==f.a3) return false;
    if(f.a4 && estado(c.a4).cls!==f.a4) return false;
    if(s && !(c.nombre.toLowerCase().includes(s)||c.dni.includes(s)||(c.licencia||'').toLowerCase().includes(s)||c.placaTracto.toLowerCase().includes(s)||c.placaCarreta.toLowerCase().includes(s))) return false;
    return true;
  });
}

function renderConductoresBody(){
  const lista=filtrarConductores();
  const tbody=document.getElementById('tbody-conductores');
  if(!tbody) return;
  const modoElim = state.modoEliminarCond;
  const puedeEditar = puede('editar_conductores');
  const puedeActualizar = puede('actualizar_licencias_conductores');
  const mostrarAcciones = puedeEditar || puedeActualizar;
  if(!lista.length){
    tbody.innerHTML=`<tr><td colspan="${modoElim?'11':(mostrarAcciones?'10':'9')}" style="padding:40px;text-align:center;color:var(--text-sec);font-size:13px">No se encontraron conductores.</td></tr>`;
    actualizarDeleteBar(); return;
  }
  tbody.innerHTML=lista.map((c,i)=>{
    const eD=estado(c.dniVigencia), e3=estado(c.a3), e4=estado(c.a4);
    let accionesHTML = '';
    if(mostrarAcciones){
      accionesHTML = `<div class="row-actions">`;
      if(puedeActualizar) accionesHTML += `<button class="btn-row update" onclick="event.stopPropagation();abrirActualizarConductor(${c.id})" title="Actualizar licencias y DNI">📝</button>`;
      if(puedeEditar) accionesHTML += `<button class="btn-row edit" onclick="event.stopPropagation();abrirEditarConductor(${c.id})" title="Editar datos">✏️</button>`;
      accionesHTML += `</div>`;
    }
    return `<tr class="${modoElim?'':'clickable'}" ${modoElim?'':`onclick="verConductor(${c.id})"`}>
      ${modoElim?`<td class="center" onclick="event.stopPropagation()"><input type="checkbox" class="row-check" ${state.selConductores.has(c.id)?'checked':''} onchange="toggleSeleccionCond(${c.id},this.checked)"></td>`:''}
      <td class="center" style="color:var(--text-sec)">${i+1}</td>
      <td><b>${esc(c.nombre)}</b></td>
      <td>${esc(c.dni)}</td>
      <td>${esc(c.licencia||'—')}</td>
      <td class="center"><span class="pill ${eD.cls}" title="${c.dniVigencia?('Vence: '+fmtFecha(c.dniVigencia)):'Sin dato'}">${eD.short}</span></td>
      <td><b>${esc(c.placaTracto)}</b></td>
      <td><b>${esc(c.placaCarreta)}</b></td>
      <td class="center"><span class="pill ${e3.cls}">${e3.short}</span></td>
      <td class="center"><span class="pill ${e4.cls}">${e4.short}</span></td>
      ${(modoElim || !mostrarAcciones)?'':`<td style="text-align:right">${accionesHTML}</td>`}
    </tr>`;
  }).join('');
  actualizarDeleteBar();
  const chkAll = document.getElementById('chk-all-cond');
  if(chkAll){ const allChecked = lista.length > 0 && lista.every(c => state.selConductores.has(c.id)); chkAll.checked = allChecked; }
}

function setFiltroCond(campo, valor){ state.filtrosConductores[campo]=valor; renderConductoresBody(); }
function limpiarFiltrosConductores(){ for(const k in state.filtrosConductores) state.filtrosConductores[k]=''; renderConductores(); toast('Filtros limpiados','info'); }

function toggleSeleccionCond(id, checked){
  if(checked) state.selConductores.add(id); else state.selConductores.delete(id);
  actualizarDeleteBar();
  const chkAll = document.getElementById('chk-all-cond');
  if(chkAll){ const lista = filtrarConductores(); chkAll.checked = lista.length > 0 && lista.every(c => state.selConductores.has(c.id)); }
}
function toggleAllConductores(checked){
  const lista = filtrarConductores();
  if(checked) lista.forEach(c => state.selConductores.add(c.id));
  else lista.forEach(c => state.selConductores.delete(c.id));
  renderConductoresBody();
}

function abrirCrearConductor(){ if(!puede('editar_conductores')){ noPermiso(); return; } cerrarDropdowns(); abrirFormularioConductor(null); }
function abrirEditarConductor(id){ if(!puede('editar_conductores')){ noPermiso(); return; } abrirFormularioConductor(id); }

function abrirFormularioConductor(id){
  const esEdicion = id !== null;
  const c = esEdicion ? conductores.find(x=>x.id===id) : { nombre:'', dni:'', licencia:'', dniVigencia:'', placaTracto:'', placaCarreta:'', a3:'', a4:'' };
  if(!c) return;
  const tractos = vehiculos.filter(v => v.tipo==='TRACTO').map(v=>v.placa).sort();
  const carretas = vehiculos.filter(v => ['CARRETA','CORTINERA','TOLVA'].includes(v.tipo)).map(v=>v.placa).sort();
  const body = `
    <div class="alert danger hidden" id="cond-alert"><span class="ico">⚠</span><div class="msg"></div></div>
    <h4 class="sec-title">👤 Datos personales</h4>
    <div class="form-grid-3">
      <div class="field"><label>Nombre completo <span class="req">*</span></label><input id="cond-nombre" value="${esc(c.nombre)}" placeholder="Nombres y apellidos"></div>
      <div class="field"><label>DNI <span class="req">*</span></label><input id="cond-dni" value="${esc(c.dni)}" placeholder="8 dígitos" maxlength="8"></div>
      <div class="field"><label>N° de Licencia</label><input id="cond-licencia" value="${esc(c.licencia||'')}" placeholder="Ej: D72502924" maxlength="15" style="text-transform:uppercase"></div>
      <div class="field"><label>Vigencia del DNI</label><input id="cond-dni-vigencia" type="date" value="${c.dniVigencia||''}"></div>
    </div>
    <h4 class="sec-title">🚛 Asignación de vehículos</h4>
    <div class="form-grid">
      <div class="field"><label>Placa del tracto <span class="req">*</span></label><select id="cond-tracto"><option value="">— Seleccionar —</option>${tractos.map(p => `<option value="${esc(p)}" ${c.placaTracto===p?'selected':''}>${esc(p)}</option>`).join('')}${c.placaTracto && !tractos.includes(c.placaTracto) ? `<option value="${esc(c.placaTracto)}" selected>${esc(c.placaTracto)} (actual)</option>` : ''}</select></div>
      <div class="field"><label>Placa de la carreta <span class="req">*</span></label><select id="cond-carreta"><option value="">— Seleccionar —</option>${carretas.map(p => `<option value="${esc(p)}" ${c.placaCarreta===p?'selected':''}>${esc(p)}</option>`).join('')}${c.placaCarreta && !carretas.includes(c.placaCarreta) ? `<option value="${esc(c.placaCarreta)}" selected>${esc(c.placaCarreta)} (actual)</option>` : ''}</select></div>
    </div>
    <h4 class="sec-title">📄 Licencias</h4>
    <div class="form-grid">
      <div class="field"><label>Licencia A3</label><input id="cond-a3" type="date" value="${c.a3||''}"></div>
      <div class="field"><label>Licencia A4</label><input id="cond-a4" type="date" value="${c.a4||''}"></div>
    </div>
  `;
  const foot = `
    <button class="btn secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn primary" onclick="guardarConductor(${esEdicion ? id : 'null'})">${esEdicion ? '💾 Guardar cambios' : '➕ Crear conductor'}</button>
  `;
  openModal(esEdicion ? `✏️ Editar · ${c.nombre}` : '➕ Crear conductor', body, foot, true);
  setTimeout(()=>document.getElementById('cond-nombre').focus(),80);
}

function guardarConductor(id){
  if(!puede('editar_conductores')){ noPermiso(); return; }
  const alertEl = document.getElementById('cond-alert'); alertEl.classList.add('hidden');
  const form = {
    nombre: document.getElementById('cond-nombre').value.trim().toUpperCase(),
    dni: document.getElementById('cond-dni').value.trim(),
    licencia: document.getElementById('cond-licencia').value.trim().toUpperCase(),
    dniVigencia: document.getElementById('cond-dni-vigencia').value,
    placaTracto: document.getElementById('cond-tracto').value,
    placaCarreta: document.getElementById('cond-carreta').value,
    a3: document.getElementById('cond-a3').value,
    a4: document.getElementById('cond-a4').value
  };
  const errs = [];
  if(!form.nombre){ errs.push('El nombre es obligatorio.'); document.getElementById('cond-nombre').classList.add('error'); }
  if(!form.dni || !/^\d{8}$/.test(form.dni)){ errs.push('El DNI debe tener 8 dígitos.'); document.getElementById('cond-dni').classList.add('error'); }
  if(!form.placaTracto){ errs.push('Selecciona la placa del tracto.'); document.getElementById('cond-tracto').classList.add('error'); }
  if(!form.placaCarreta){ errs.push('Selecciona la placa de la carreta.'); document.getElementById('cond-carreta').classList.add('error'); }
  const dup = conductores.find(c => c.dni === form.dni && c.id !== id);
  if(dup) errs.push(`El DNI "${form.dni}" ya existe en otro conductor.`);
  if(errs.length){
    alertEl.querySelector('.msg').innerHTML = `<b>No se pudo guardar:</b><ul>${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    alertEl.classList.remove('hidden'); document.querySelector('#modal-body').scrollTo({top:0,behavior:'smooth'}); return;
  }
  if(id){
    const c = conductores.find(x=>x.id===id);
    const antes = {...c};
    Object.assign(c, form);
    ['nombre','dni','licencia','dniVigencia','placaTracto','placaCarreta','a3','a4'].forEach(k=>{
      if(String(antes[k]||'') !== String(form[k]||'')) {
        const labels = {nombre:'Nombre',dni:'DNI',licencia:'N° Licencia',dniVigencia:'Vigencia DNI',placaTracto:'Tracto',placaCarreta:'Carreta',a3:'Licencia A3',a4:'Licencia A4'};
        registrarCambio('Conductores','Editar', c.nombre, labels[k]||k, antes[k]||'', form[k]||'');
      }
    });
    toast('Conductor actualizado ✓','success');
  } else {
    conductores.push({ id: Date.now(), ...form });
    registrarCambio('Conductores','Crear', form.nombre, '', '', '', `DNI ${form.dni}`);
    toast('Conductor creado ✓','success');
  }
  guardar(); closeModal(); renderConductores();
}

function abrirActualizarConductor(id){
  if(!puede('actualizar_licencias_conductores')){ noPermiso(); return; }
  const c = conductores.find(x=>x.id===id); if(!c) return;
  const eD = estado(c.dniVigencia), e2 = estado(c.a3), e3 = estado(c.a4);
  const body = `
    <div class="veh-hero">
      <div class="veh-hero-icon">👤</div>
      <div class="veh-hero-info">
        <div class="veh-hero-placa">${esc(c.nombre)}</div>
        <div class="veh-hero-sub">DNI ${esc(c.dni)} · ${esc(c.placaTracto)} / ${esc(c.placaCarreta)}</div>
      </div>
    </div>
    <div class="alert info" style="margin-bottom:16px">
      <span class="ico">📝</span>
      <div class="msg">Actualiza las <b>fechas de vigencia del DNI y licencias</b>. Los cambios se guardan todos a la vez.</div>
    </div>
    <h4 class="sec-title">📄 Documentos</h4>
    <table class="doc-table doc-edit-table">
      <thead><tr><th>DOCUMENTO</th><th>VENCIMIENTO</th><th>ESTADO</th></tr></thead>
      <tbody>
        <tr><td><b>Vigencia del DNI</b></td><td><input class="inp-edit-doc" type="date" data-key="dniVigencia" value="${c.dniVigencia||''}"></td><td><span class="pill ${eD.cls}">${eD.txt}</span></td></tr>
        <tr><td><b>Licencia A3</b></td><td><input class="inp-edit-doc" type="date" data-key="a3" value="${c.a3||''}"></td><td><span class="pill ${e2.cls}">${e2.txt}</span></td></tr>
        <tr><td><b>Licencia A4</b></td><td><input class="inp-edit-doc" type="date" data-key="a4" value="${c.a4||''}"></td><td><span class="pill ${e3.cls}">${e3.txt}</span></td></tr>
      </tbody>
    </table>
  `;
  const foot = `<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="guardarLicenciasConductor(${id})">💾 Guardar cambios</button>`;
  openModal(`📝 Actualizar · ${c.nombre}`, body, foot);
  setTimeout(() => {
    document.querySelectorAll('.inp-edit-doc').forEach(inp => {
      const initial = inp.value;
      inp.addEventListener('input', () => { inp.classList.toggle('changed', inp.value !== initial); });
    });
  }, 60);
}

function guardarLicenciasConductor(id){
  if(!puede('actualizar_licencias_conductores')){ noPermiso(); return; }
  const c = conductores.find(x=>x.id===id); if(!c) return;
  let cambios = 0;
  const labels = {dniVigencia:'Vigencia DNI', a3:'Licencia A3', a4:'Licencia A4'};
  document.querySelectorAll('.inp-edit-doc').forEach(input => {
    const key = input.dataset.key; const val = (input.value || '').trim();
    if((c[key]||'') !== val){
      const ant = c[key]||'';
      c[key] = val; cambios++;
      registrarCambio('Conductores','Actualizar licencia', c.nombre, labels[key]||key, ant, val);
    }
  });
  guardar(); closeModal(); renderConductoresBody();
  if(cambios > 0) toast(`✓ ${cambios} fecha${cambios>1?'s':''} actualizada${cambios>1?'s':''}`, 'success');
  else toast('Sin cambios', 'info');
}

function verConductor(id){
  const c=conductores.find(x=>x.id===id); if(!c) return;
  const docs=[
    { label:'VIGENCIA DEL DNI', vence:c.dniVigencia },
    { label:'LICENCIA A3', vence:c.a3 },
    { label:'LICENCIA A4', vence:c.a4 }
  ].map(d=>({ ...d, est:estado(d.vence) })).sort((a,b)=>(a.vence||'9999-12-31').localeCompare(b.vence||'9999-12-31'));
  openModal(`👤 ${c.nombre}`,`
    <div class="det-grid"><div class="det-item"><span>DNI</span><b>${esc(c.dni)}</b></div><div class="det-item"><span>LICENCIA</span><b>${esc(c.licencia||"—")}</b></div><div class="det-item"><span>PLACA TRACTO</span><b>${esc(c.placaTracto)}</b></div><div class="det-item"><span>PLACA CARRETA</span><b>${esc(c.placaCarreta)}</b></div></div>
    <h4 class="sec-title">Documentos</h4>
    <table class="doc-table"><thead><tr><th>#</th><th>DOCUMENTO</th><th>VENCIMIENTO</th><th>ESTADO</th></tr></thead>
      <tbody>${docs.map((d,i)=>`<tr><td class="center" style="color:var(--text-sec)">${i+1}</td><td><b>${d.label}</b></td><td>${d.vence?fmtFecha(d.vence):'—'}</td><td><span class="pill big ${d.est.cls}">${d.est.txt}</span></td></tr>`).join('')}</tbody>
    </table>
  `);
}

