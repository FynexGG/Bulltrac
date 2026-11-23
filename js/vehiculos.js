/* ===== VEHÍCULOS ===== */
function pillHTML(doc, key){ const e=estado(doc && doc.vence, getUmbral(key)); return `<span class="pill ${e.cls}">${e.short}</span>`; }
const ESTADOS_OPTS = (sel) => `<option value="">Todos</option><option value="activo" ${sel==='activo'?'selected':''}>ACT</option><option value="porvencer" ${sel==='porvencer'?'selected':''}>X VENC</option><option value="vencido" ${sel==='vencido'?'selected':''}>VENC</option><option value="nd" ${sel==='nd'?'selected':''}>S/D</option>`;
const LEASING_OPTS = (sel) => `<option value="">Todos</option><option value="leasing" ${sel==='leasing'?'selected':''}>Con leasing</option><option value="propio" ${sel==='propio'?'selected':''}>Propio</option>`;
const CILINDROS_OPTS = (sel) => `<option value="">Todos</option><option value="activo" ${sel==='activo'?'selected':''}>ACT</option><option value="porvencer" ${sel==='porvencer'?'selected':''}>X VENC</option><option value="vencido" ${sel==='vencido'?'selected':''}>VENC</option><option value="sin_registro" ${sel==='sin_registro'?'selected':''}>Sin registro</option>`;

function leasingCellHTML(v){
  if(!esLeasing(v.propietario)) return `<span style="color:var(--text-dis);font-weight:700">—</span>`;
  const ec = estadoLeasing(v);
  return `<span class="pill ${ec.cls}" title="Contrato ${esc(v.contrato||'')} · Vence ${v.vencimiento?fmtFecha(v.vencimiento):'—'}">${ec.short}</span>`;
}
function chipCellHTML(v){
  if(!tieneChip(v)) return `<span style="color:var(--text-dis)">—</span>`;
  const chip = v.docs.chip;
  const e = estadoChip(v);
  return `<span class="pill ${e.cls}" title="${chip.numero?esc(chip.numero)+' · ':''}Vence: ${chip.vence?fmtFecha(chip.vence):'—'}">${e.short}</span>`;
}
function cilindrosCellHTML(v){
  if(!tieneCilindros(v)) return `<span style="color:var(--text-dis)">—</span>`;
  const cil = v.docs.cilindros;
  const e = estadoCilindros(v);
  return `<span class="pill ${e.cls}" title="${cil.numero?esc(cil.numero)+' · ':''}Vence: ${cil.vence?fmtFecha(cil.vence):'—'}">${e.short}</span>`;
}

function renderVehiculos(){
  const f=state.filtrosVehiculo;
  let venc=0, por=0;
  vehiculos.forEach(v=>DOCS.forEach(d=>{
    const e = estadoPorDoc(v, d.k);
    if(e.cls==='vencido') venc++;
    if(e.cls==='porvencer') por++;
  }));
  $('#resumen-vehiculos').innerHTML=`
    <span><span class="dot" style="background:var(--critical)"></span><b>${venc}</b> docs vencidos</span>
    <span><span class="dot" style="background:var(--preventive)"></span><b>${por}</b> por vencer</span>
    <span><span class="dot" style="background:var(--corp)"></span><b>${vehiculos.length}</b> unidades</span>
  `;

  const modoElim = state.modoEliminarVeh;
  const puedeEditar = puede('editar_vehiculos');
  const puedeActualizar = puede('actualizar_docs_vehiculos');
  const mostrarAcciones = puedeEditar || puedeActualizar;

  $('#tabla-vehiculos').innerHTML=`<div class="table-wrap"><table style="min-width:${modoElim?'1900':(mostrarAcciones?'1850':'1800')}px">
    <thead>
      <tr>
        ${modoElim?`<th style="width:40px"><input type="checkbox" class="row-check" id="chk-all-veh" onchange="toggleAllVehiculos(this.checked)"></th>`:''}
        <th>#</th><th>PLACA</th><th>PROPIETARIO</th><th>TIPO</th><th>LEASING</th>
        ${DOCS.map(d=>`<th>${d.label}</th>`).join('')}
        <th>CILINDROS</th>
        ${(modoElim || !mostrarAcciones)?'':`<th style="text-align:right">ACCIÓN</th>`}
      </tr>
      <tr class="filter-row">
        ${modoElim?'<th></th>':''}
        <th></th>
        <th><input class="th-filter" value="${esc(f.placa)}" oninput="setFiltroVeh('placa',this.value)" placeholder="Buscar..."></th>
        <th><input class="th-filter" value="${esc(f.propietario)}" oninput="setFiltroVeh('propietario',this.value)" placeholder="Buscar..."></th>
        <th><select class="th-filter" onchange="setFiltroVeh('tipo',this.value)"><option value="">Todos</option>${['TRACTO','CARRETA','CORTINERA','TOLVA'].map(t=>`<option value="${t}" ${f.tipo===t?'selected':''}>${t}</option>`).join('')}</select></th>
        <th><select class="th-filter" onchange="setFiltroVeh('leasing',this.value)">${LEASING_OPTS(f.leasing)}</select></th>
        ${DOCS.map(d=>`<th><select class="th-filter" onchange="setFiltroVeh('${d.k}',this.value)">${ESTADOS_OPTS(f[d.k])}</select></th>`).join('')}
        <th><select class="th-filter" onchange="setFiltroVeh('cilindros',this.value)">${CILINDROS_OPTS(f.cilindros)}</select></th>
        ${(modoElim || !mostrarAcciones)?'':'<th></th>'}
      </tr>
    </thead>
    <tbody id="tbody-vehiculos"></tbody>
  </table></div>`;
  renderVehiculosBody();
}

function filtrarVehiculos(){
  const f=state.filtrosVehiculo, s=state.search;
  return vehiculos.filter(v=>{
    if(f.placa && !v.placa.toLowerCase().includes(f.placa.toLowerCase())) return false;
    if(f.propietario && !(v.propietario||'').toLowerCase().includes(f.propietario.toLowerCase())) return false;
    if(f.tipo && v.tipo!==f.tipo) return false;
    if(f.leasing){
      const esLeas=esLeasing(v.propietario);
      if(f.leasing==='leasing' && !esLeas) return false;
      if(f.leasing==='propio' && esLeas) return false;
    }
    if(f.cilindros){
      if(f.cilindros==='sin_registro'){
        if(tieneCilindros(v)) return false;
      } else {
        if(!tieneCilindros(v)) return false;
        if(estadoCilindros(v).cls !== f.cilindros) return false;
      }
    }
    for(const d of DOCS){
      if(f[d.k] && estadoPorDoc(v, d.k).cls!==f[d.k]) return false;
    }
    if(s && !(v.placa.toLowerCase().includes(s)||(v.propietario||'').toLowerCase().includes(s)||(v.marca||'').toLowerCase().includes(s)||(v.modelo||'').toLowerCase().includes(s)||v.tipo.toLowerCase().includes(s))) return false;
    return true;
  });
}

function renderVehiculosBody(){
  const lista=filtrarVehiculos();
  const tbody=document.getElementById('tbody-vehiculos');
  if(!tbody) return;
  const modoElim = state.modoEliminarVeh;
  const puedeEditar = puede('editar_vehiculos');
  const puedeActualizar = puede('actualizar_docs_vehiculos');
  const mostrarAcciones = puedeEditar || puedeActualizar;
  const colsCount = 6 + DOCS.length + (modoElim?1:(mostrarAcciones?1:0));
  if(!lista.length){
    tbody.innerHTML=`<tr><td colspan="${colsCount}" style="padding:40px;text-align:center;color:var(--text-sec);font-size:13px">No se encontraron vehículos.</td></tr>`;
    actualizarDeleteBar(); return;
  }
  tbody.innerHTML=lista.map((v,i)=>{
    const docsSinChip = DOCS.filter(d=>d.k!=='chip');
    let accionesHTML = '';
    if(mostrarAcciones){
      accionesHTML = `<div class="row-actions">`;
      if(puedeActualizar) accionesHTML += `<button class="btn-row update" onclick="event.stopPropagation();abrirActualizarVehiculo(${v.id})" title="Actualizar documentos">📝</button>`;
      if(puedeEditar) accionesHTML += `<button class="btn-row edit" onclick="event.stopPropagation();abrirEditarVehiculo(${v.id})" title="Editar datos">✏️</button>`;
      accionesHTML += `</div>`;
    }
    return `<tr class="${modoElim?'':'clickable'}" ${modoElim?'':`onclick="verVehiculo(${v.id})"`}>
      ${modoElim?`<td class="center" onclick="event.stopPropagation()"><input type="checkbox" class="row-check" ${state.selVehiculos.has(v.id)?'checked':''} onchange="toggleSeleccionVeh(${v.id},this.checked)"></td>`:''}
      <td class="center" style="color:var(--text-sec)">${i+1}</td>
      <td><b>${esc(v.placa)}</b></td>
      <td>${esc(v.propietario)}</td>
      <td><span class="tipo-tag">${v.tipo}</span></td>
      <td class="center">${leasingCellHTML(v)}</td>
      ${docsSinChip.map(d=>`<td class="center">${pillHTML(v.docs[d.k], d.k)}</td>`).join('')}
      <td class="center">${chipCellHTML(v)}</td>
      <td class="center">${cilindrosCellHTML(v)}</td>
      ${(modoElim || !mostrarAcciones)?'':`<td style="text-align:right">${accionesHTML}</td>`}
    </tr>`;
  }).join('');
  actualizarDeleteBar();
  const chkAll = document.getElementById('chk-all-veh');
  if(chkAll){
    const allChecked = lista.length > 0 && lista.every(v => state.selVehiculos.has(v.id));
    chkAll.checked = allChecked;
  }
}

function setFiltroVeh(campo, valor){ state.filtrosVehiculo[campo]=valor; renderVehiculosBody(); }
function limpiarFiltrosVehiculo(){ for(const k in state.filtrosVehiculo) state.filtrosVehiculo[k]=''; renderVehiculos(); toast('Filtros limpiados','info'); }

function toggleSeleccionVeh(id, checked){
  if(checked) state.selVehiculos.add(id); else state.selVehiculos.delete(id);
  actualizarDeleteBar();
  const chkAll = document.getElementById('chk-all-veh');
  if(chkAll){ const lista = filtrarVehiculos(); chkAll.checked = lista.length > 0 && lista.every(v => state.selVehiculos.has(v.id)); }
}
function toggleAllVehiculos(checked){
  const lista = filtrarVehiculos();
  if(checked) lista.forEach(v => state.selVehiculos.add(v.id));
  else lista.forEach(v => state.selVehiculos.delete(v.id));
  renderVehiculosBody();
}

function abrirCrearVehiculo(){ if(!puede('editar_vehiculos')){ noPermiso(); return; } cerrarDropdowns(); abrirFormularioVehiculo(null); }
function abrirEditarVehiculo(id){ if(!puede('editar_vehiculos')){ noPermiso(); return; } abrirFormularioVehiculo(id); }

function abrirFormularioVehiculo(id){
  const esEdicion = id !== null;
  const v = esEdicion ? vehiculos.find(x=>x.id===id) : {
    placa:'', tipo:'TRACTO', propietario:'', iv:'', contrato:'', vencimiento:'',
    ruta:'', titulo:'', fabr:'', marca:'', modelo:'', color:'', motor:'', vin:'',
    ejes:'', ruedas:'', pBruto:'', pNeto:'', cargaU:'', longitud:'', altura:'', ancho:'',
    configuracion:'', cilindros:''
  };
  if(!v) return;
  const tiposOpts = ['TRACTO','CARRETA','CORTINERA','TOLVA'];
  const configOpts = ['6X4','4X2','6X2','3 EJES','2 EJES','OTRO'];

  const body = `
    <div class="alert danger hidden" id="veh-alert"><span class="ico">⚠</span><div class="msg"></div></div>
    <h4 class="sec-title">🆔 Identificación</h4>
    <div class="form-grid-3">
      <div class="field"><label>Placa <span class="req">*</span></label><input id="veh-placa" value="${esc(v.placa)}" placeholder="Ej. V1A-925"></div>
      <div class="field"><label>Tipo <span class="req">*</span></label><select id="veh-tipo">${tiposOpts.map(t=>`<option value="${t}" ${v.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
      <div class="field"><label>Cilindros (cantidad)</label><input id="veh-cilindros" value="${esc(v.cilindros||'')}" placeholder="6 / —"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Propietario <span class="req">*</span></label><input id="veh-propietario" value="${esc(v.propietario)}" placeholder="Empresa o banco"></div>
      <div class="field"><label>IV</label><input id="veh-iv" value="${esc(v.iv||'')}" placeholder="IV-001"></div>
    </div>
    <h4 class="sec-title">📄 Contrato</h4>
    <div class="form-grid-3">
      <div class="field"><label>N° Contrato</label><input id="veh-contrato" value="${esc(v.contrato||'')}" placeholder="CT-2024-001"></div>
      <div class="field"><label>Vencimiento contrato</label><input id="veh-vencimiento" type="date" value="${v.vencimiento||''}"></div>
      <div class="field"><label>Título</label><input id="veh-titulo" value="${esc(v.titulo||'')}" placeholder="TIT-8891"></div>
    </div>
    <div class="form-grid">
      <div class="field"><label>Ruta habitual</label><input id="veh-ruta" value="${esc(v.ruta||'')}" placeholder="LIMA - AREQUIPA"></div>
    </div>
    <h4 class="sec-title">🔧 Especificaciones</h4>
    <div class="form-grid-3">
      <div class="field"><label>Marca</label><input id="veh-marca" value="${esc(v.marca||'')}" placeholder="VOLVO"></div>
      <div class="field"><label>Modelo</label><input id="veh-modelo" value="${esc(v.modelo||'')}" placeholder="FH 460"></div>
      <div class="field"><label>Año fabricación</label><input id="veh-fabr" value="${esc(v.fabr||'')}" placeholder="2021"></div>
      <div class="field"><label>Color</label><input id="veh-color" value="${esc(v.color||'')}" placeholder="BLANCO"></div>
      <div class="field"><label>Motor</label><input id="veh-motor" value="${esc(v.motor||'')}" placeholder="D13K460"></div>
      <div class="field"><label>VIN / Serie</label><input id="veh-vin" value="${esc(v.vin||'')}" placeholder="YV2RT40A1MB123456"></div>
      <div class="field"><label>Ejes</label><input id="veh-ejes" value="${esc(v.ejes||'')}" placeholder="3"></div>
      <div class="field"><label>Ruedas</label><input id="veh-ruedas" value="${esc(v.ruedas||'')}" placeholder="10"></div>
      <div class="field"><label>Configuración</label><select id="veh-configuracion">${configOpts.map(c=>`<option value="${c}" ${v.configuracion===c?'selected':''}>${c}</option>`).join('')}</select></div>
    </div>
    <h4 class="sec-title">⚖️ Pesos y dimensiones</h4>
    <div class="form-grid-3">
      <div class="field"><label>Peso bruto (t)</label><input id="veh-pBruto" value="${esc(v.pBruto||'')}" placeholder="48.00"></div>
      <div class="field"><label>Peso neto (t)</label><input id="veh-pNeto" value="${esc(v.pNeto||'')}" placeholder="15.00"></div>
      <div class="field"><label>Carga útil (t)</label><input id="veh-cargaU" value="${esc(v.cargaU||'')}" placeholder="33.00"></div>
      <div class="field"><label>Longitud (m)</label><input id="veh-longitud" value="${esc(v.longitud||'')}" placeholder="6.50"></div>
      <div class="field"><label>Altura (m)</label><input id="veh-altura" value="${esc(v.altura||'')}" placeholder="3.20"></div>
      <div class="field"><label>Ancho (m)</label><input id="veh-ancho" value="${esc(v.ancho||'')}" placeholder="2.55"></div>
    </div>
    <div class="alert info" style="margin-top:16px;margin-bottom:0"><span class="ico">💡</span><div class="msg">Los documentos (MTC, SOAT, etc.) se editan desde el botón <b>📝 Actualizar</b> en la tabla.</div></div>
  `;
  const foot = `
    <button class="btn secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn primary" onclick="guardarVehiculo(${esEdicion ? id : 'null'})">${esEdicion ? '💾 Guardar cambios' : '➕ Crear vehículo'}</button>
  `;
  openModal(esEdicion ? `✏️ Editar · ${v.placa}` : '➕ Crear vehículo', body, foot, true);
  setTimeout(()=>document.getElementById('veh-placa').focus(),80);
}

function guardarVehiculo(id){
  if(!puede('editar_vehiculos')){ noPermiso(); return; }
  const alertEl = document.getElementById('veh-alert'); alertEl.classList.add('hidden');
  const form = {
    placa: document.getElementById('veh-placa').value.trim().toUpperCase(),
    tipo: document.getElementById('veh-tipo').value,
    propietario: document.getElementById('veh-propietario').value.trim(),
    iv: document.getElementById('veh-iv').value.trim(),
    contrato: document.getElementById('veh-contrato').value.trim(),
    vencimiento: document.getElementById('veh-vencimiento').value,
    titulo: document.getElementById('veh-titulo').value.trim(),
    ruta: document.getElementById('veh-ruta').value.trim(),
    marca: document.getElementById('veh-marca').value.trim(),
    modelo: document.getElementById('veh-modelo').value.trim(),
    fabr: document.getElementById('veh-fabr').value.trim(),
    color: document.getElementById('veh-color').value.trim(),
    motor: document.getElementById('veh-motor').value.trim(),
    vin: document.getElementById('veh-vin').value.trim(),
    ejes: document.getElementById('veh-ejes').value.trim(),
    ruedas: document.getElementById('veh-ruedas').value.trim(),
    configuracion: document.getElementById('veh-configuracion').value,
    cilindros: document.getElementById('veh-cilindros').value.trim(),
    pBruto: document.getElementById('veh-pBruto').value.trim(),
    pNeto: document.getElementById('veh-pNeto').value.trim(),
    cargaU: document.getElementById('veh-cargaU').value.trim(),
    longitud: document.getElementById('veh-longitud').value.trim(),
    altura: document.getElementById('veh-altura').value.trim(),
    ancho: document.getElementById('veh-ancho').value.trim()
  };
  const errs = [];
  if(!form.placa){ errs.push('La placa es obligatoria.'); document.getElementById('veh-placa').classList.add('error'); }
  if(!form.propietario){ errs.push('El propietario es obligatorio.'); document.getElementById('veh-propietario').classList.add('error'); }
  const dup = vehiculos.find(v => v.placa.toUpperCase() === form.placa && v.id !== id);
  if(dup) errs.push(`La placa "${form.placa}" ya existe en otro vehículo.`);
  if(errs.length){
    alertEl.querySelector('.msg').innerHTML = `<b>No se pudo guardar:</b><ul>${errs.map(e=>`<li>${e}</li>`).join('')}</ul>`;
    alertEl.classList.remove('hidden'); document.querySelector('#modal-body').scrollTo({top:0,behavior:'smooth'}); return;
  }
  if(id){
    const v = vehiculos.find(x=>x.id===id);
    const antes = {...v};
    Object.assign(v, form);
    Object.keys(form).forEach(k => {
      if(String(antes[k]||'') !== String(form[k]||'')) {
        registrarCambio('Vehículos', 'Editar', v.placa, CAMPOS_VEHICULO_LABELS[k]||k, antes[k]||'', form[k]||'');
      }
    });
    toast('Vehículo actualizado ✓','success');
  } else {
    vehiculos.push({ id: Date.now(), ...form, foto:'', docs:{} });
    registrarCambio('Vehículos', 'Crear', form.placa, '', '', '', form.propietario);
    toast('Vehículo creado ✓','success');
  }
  guardar(); closeModal(); renderVehiculos();
}

function abrirActualizarVehiculo(id){
  if(!puede('actualizar_docs_vehiculos')){ noPermiso(); return; }
  const v=vehiculos.find(x=>x.id===id);
  if(!v) return;
  const esLeas=esLeasing(v.propietario);

  const docsRows = DOCS.map(d => {
    const doc = v.docs[d.k] || { numero:'', vence:'' };
    const e = estado(doc.vence, getUmbral(d.k));
    return `<tr>
      <td><b>${d.label}</b></td>
      <td><input class="inp-edit-doc" data-key="${d.k}" data-field="numero" value="${esc(doc.numero||'')}" placeholder="N°"></td>
      <td><input class="inp-edit-doc" type="date" data-key="${d.k}" data-field="vence" value="${doc.vence||''}"></td>
      <td><span class="pill ${e.cls}">${e.txt}</span></td>
    </tr>`;
  }).join('');

  const cil = v.docs.cilindros || { numero:'', vence:'' };
  const eCil = estado(cil.vence, getUmbral('cilindros'));
  const cilRow = `<tr>
      <td><b>CILINDROS</b></td>
      <td><input class="inp-edit-doc" data-key="cilindros" data-field="numero" value="${esc(cil.numero||'')}" placeholder="N°"></td>
      <td><input class="inp-edit-doc" type="date" data-key="cilindros" data-field="vence" value="${cil.vence||''}"></td>
      <td><span class="pill ${eCil.cls}">${eCil.txt}</span></td>
    </tr>`;

  let leasingRow = '';
  if(esLeas){
    const eL = estadoLeasing(v);
    leasingRow = `<tr style="background:#F3E8FF">
      <td><b>LEASING</b></td>
      <td><span style="font-size:12px;color:#6B21A8;font-weight:600">${esc(v.contrato||'—')}</span></td>
      <td><input class="inp-edit-doc" type="date" data-key="_leasing" data-field="vence" value="${v.vencimiento||''}"></td>
      <td><span class="pill ${eL.cls}">${eL.txt}</span></td>
    </tr>`;
  }

  const body = `
    <div class="veh-hero">
      <div class="veh-hero-icon">🚛</div>
      <div class="veh-hero-info">
        <div class="veh-hero-placa">${esc(v.placa)}</div>
        <div class="veh-hero-sub">${esc(v.marca)} ${esc(v.modelo)} · ${esc(v.propietario)}</div>
      </div>
      <span class="tipo-tag veh-hero-tipo">${v.tipo}</span>
    </div>
    <div class="alert info" style="margin-bottom:16px">
      <span class="ico">📝</span>
      <div class="msg">Actualiza los <b>números y fechas de vencimiento</b>. Los cambios se guardan todos a la vez.</div>
    </div>
    <h4 class="sec-title">📄 Documentación</h4>
    <table class="doc-table doc-edit-table">
      <thead><tr><th>DOCUMENTO</th><th>NÚMERO</th><th>VENCIMIENTO</th><th>ESTADO</th></tr></thead>
      <tbody>${docsRows}${cilRow}${leasingRow}</tbody>
    </table>
  `;
  const foot = `
    <button class="btn secondary" onclick="closeModal()">Cancelar</button>
    <button class="btn primary" onclick="guardarDocumentosVehiculo(${id})">💾 Guardar cambios</button>
  `;
  openModal(`📝 Actualizar · ${v.placa}`, body, foot);
  setTimeout(() => {
    document.querySelectorAll('.inp-edit-doc').forEach(inp => {
      const initial = inp.value;
      inp.addEventListener('input', () => { inp.classList.toggle('changed', inp.value !== initial); });
    });
  }, 60);
}

function guardarDocumentosVehiculo(id){
  if(!puede('actualizar_docs_vehiculos')){ noPermiso(); return; }
  const v=vehiculos.find(x=>x.id===id); if(!v) return;
  let cambios = 0;
  document.querySelectorAll('.inp-edit-doc').forEach(input => {
    const key = input.dataset.key; const field = input.dataset.field; const val = (input.value || '').trim();
    if(key === '_leasing'){
      if(field === 'vence' && (v.vencimiento||'') !== val){
        const ant = v.vencimiento||'';
        v.vencimiento = val; cambios++;
        registrarCambio('Vehículos', 'Actualizar doc', v.placa, 'LEASING vencimiento', ant, val);
      }
      return;
    }
    if(!v.docs[key]) v.docs[key] = {numero:'',vence:''};
    if((v.docs[key][field]||'') !== val){
      const ant = v.docs[key][field]||'';
      v.docs[key][field] = val; cambios++;
      const campo = (DOCS.find(d=>d.k===key)||{label:key}).label + '.' + (field==='numero'?'Número':'Vencimiento');
      registrarCambio('Vehículos', 'Actualizar doc', v.placa, campo, ant, val);
    }
  });
  guardar(); closeModal(); renderVehiculosBody();
  if(cambios > 0) toast(`✓ ${cambios} campo${cambios>1?'s':''} actualizado${cambios>1?'s':''}`, 'success');
  else toast('Sin cambios', 'info');
}

function verVehiculo(id){
  const v=vehiculos.find(x=>x.id===id);
  if(!v) return;
  const alerts = getAlertasVehiculo(v);
  const numAlertas = alerts.length;
  const esLeas = esLeasing(v.propietario);

  let rowsHtml = '';
  if(esLeas){
    const ec = estadoLeasing(v);
    rowsHtml += `<tr><td><b>Leasing vehicular</b></td><td>${v.vencimiento ? fmtFecha(v.vencimiento) : '—'}</td><td><span class="pill ${ec.cls}">${ec.txt}</span></td></tr>`;
  }
  DOCS.forEach(d => {
    const doc = v.docs[d.k] || { numero:'', vence:'' };
    const e = estado(doc.vence, getUmbral(d.k));
    const venceTxt = doc.vence ? fmtFecha(doc.vence) : '—';
    const estadoTxt = doc.vence ? e.txt : 'N/A';
    const pillCls = doc.vence ? e.cls : 'nd';
    rowsHtml += `<tr><td><b>${d.label}</b></td><td>${venceTxt}</td><td><span class="pill ${pillCls}">${estadoTxt}</span></td></tr>`;
  });
  const cil = v.docs.cilindros || { numero:'', vence:'' };
  const eCil = estado(cil.vence, getUmbral('cilindros'));
  rowsHtml += `<tr><td><b>Inspección de cilindros</b></td><td>${cil.vence?fmtFecha(cil.vence):'—'}</td><td><span class="pill ${cil.vence?eCil.cls:'nd'}">${cil.vence?eCil.txt:'N/A'}</span></td></tr>`;
  const alertBadge = numAlertas > 0 ? `<span class="badge-alert">${numAlertas} alerta${numAlertas>1?'s':''}</span>` : '';

  const body = `
    <div class="veh-hero">
      <div class="veh-hero-icon">🚛</div>
      <div class="veh-hero-info">
        <div class="veh-hero-placa">${esc(v.placa)}</div>
        <div class="veh-hero-sub">${esc(v.tipo)} · ${esc(v.marca)} ${esc(v.modelo||'')}</div>
        <span class="veh-hero-status">Unidad activa</span>
      </div>
      <div class="veh-hero-stats">
        <div class="veh-hero-stat"><span>Peso bruto</span><b>${v.pBruto || '—'} ${v.pBruto?'t':''}</b></div>
        <div class="veh-hero-stat"><span>Carga útil</span><b>${v.cargaU || '—'} ${v.cargaU?'t':''}</b></div>
        <div class="veh-hero-stat"><span>Propietario</span><b>${esc(v.propietario || '—')}</b></div>
      </div>
      <button class="btn secondary sm" onclick="abrirDetallesTecnicos(${v.id})">Ver más detalles ↗</button>
    </div>
    <div class="docs-header"><h4>Documentación vehicular</h4>${alertBadge}</div>
    <table class="modal-doc-table"><thead><tr><th>Documento</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody>${rowsHtml}</tbody></table>
  `;
  openModal('Detalle del vehículo', body);
}

function abrirDetallesTecnicos(id){
  const v = vehiculos.find(x => x.id === id);
  if(!v) return;
  const esLeas = esLeasing(v.propietario);
  const body = `
    <div class="veh-hero">
      <div class="veh-hero-icon">🚛</div>
      <div class="veh-hero-info">
        <div class="veh-hero-placa">${esc(v.placa)}</div>
        <div class="veh-hero-sub">${esc(v.tipo)} · ${esc(v.marca)} ${esc(v.modelo||'')}</div>
      </div>
    </div>
    <h4 class="sec-title">🔧 Especificaciones técnicas</h4>
    <div class="det-grid">
      <div class="det-item"><span>Marca</span><b>${esc(v.marca||'—')}</b></div>
      <div class="det-item"><span>Modelo</span><b>${esc(v.modelo||'—')}</b></div>
      <div class="det-item"><span>Año fabr.</span><b>${esc(v.fabr||'—')}</b></div>
      <div class="det-item"><span>Color</span><b>${esc(v.color||'—')}</b></div>
      <div class="det-item"><span>Configuración</span><b>${esc(v.configuracion||'—')}</b></div>
      <div class="det-item"><span>Ejes / Ruedas</span><b>${esc(v.ejes||'—')} / ${esc(v.ruedas||'—')}</b></div>
      <div class="det-item"><span>Motor</span><b>${esc(v.motor||'—')}</b></div>
      <div class="det-item"><span>VIN / Serie</span><b>${esc(v.vin||'—')}</b></div>
      <div class="det-item"><span>Cilindros</span><b>${esc(v.cilindros||'—')}</b></div>
      <div class="det-item"><span>Peso bruto</span><b>${v.pBruto?v.pBruto+' t':'—'}</b></div>
      <div class="det-item"><span>Peso neto</span><b>${v.pNeto?v.pNeto+' t':'—'}</b></div>
      <div class="det-item"><span>Carga útil</span><b>${v.cargaU?v.cargaU+' t':'—'}</b></div>
      <div class="det-item"><span>Dimensiones</span><b>${(v.longitud&&v.altura&&v.ancho)?`${v.longitud} × ${v.altura} × ${v.ancho} m`:'—'}</b></div>
    </div>
    <h4 class="sec-title">📋 Información del contrato</h4>
    <div class="det-grid">
      <div class="det-item"><span>Propietario</span><b>${esc(v.propietario||'—')}</b></div>
      <div class="det-item"><span>IV</span><b>${esc(v.iv||'—')}</b></div>
      <div class="det-item"><span>N° Contrato</span><b>${esc(v.contrato||'—')}</b></div>
      <div class="det-item"><span>Vencimiento</span><b>${v.vencimiento?fmtFecha(v.vencimiento):'—'}</b></div>
      <div class="det-item"><span>Ruta habitual</span><b>${esc(v.ruta||'—')}</b></div>
      <div class="det-item"><span>Título</span><b>${esc(v.titulo||'—')}</b></div>
      <div class="det-item"><span>Modalidad</span><b>${esLeas?'Leasing':'Propio'}</b></div>
    </div>
  `;
  const foot = `<button class="btn secondary" onclick="verVehiculo(${id})">← Volver al detalle</button><button class="btn primary" onclick="closeModal()">Cerrar</button>`;
  openModal(`🔧 Detalles técnicos · ${v.placa}`, body, foot);
}

