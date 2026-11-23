/* ===== VIAJES ===== */
function renderTiposViaje(){
  const todosCount = viajes.filter(v=>!v.historico).length;
  const btnTodos = `<button class="chip ${state.tipoViaje==='todos'?'active':''}" onclick="setTipoViaje('todos')">Todos <span class="cnt">${todosCount}</span></button>`;
  const btns = Object.entries(TIPOS_VIAJE).map(([k,t])=>{
    const n=viajes.filter(v=>v.tipo===k && !v.historico).length;
    return `<button class="chip ${state.tipoViaje===k?'active':''}" onclick="setTipoViaje('${k}')">${t.label}<span class="cnt">${n}</span></button>`;
  }).join('');
  $('#tipos-viaje').innerHTML = btnTodos + btns;
}
function setTipoViaje(t){ state.tipoViaje=t; renderViajes(); }
function estatusColors(st){
  if(st==='DESCARGADO') return { bg:'#E5F6EF', color:'#16825A' };
  if(st==='PROGRAMADO') return { bg:'#E8EFFA', color:'#245B91' };
  return { bg:'#FCF0DC', color:'#B77918' };
}

function renderViajes(){
  renderTiposViaje();
  const puedeCrearViaje = puede('crear_viajes');
  const puedeEditarGRR = puede('editar_grr_grt');
  const puedeCambiarEstatus = puede('cambiar_estatus');
  const puedeTerminar = puede('terminar_viajes');
  const puedeApoyo = puede('aplicar_apoyo');
  const esTodos = state.tipoViaje === 'todos';

  let lista=viajes.filter(v=>!v.historico);
  if(!esTodos) lista = lista.filter(v=>v.tipo===state.tipoViaje);
  if(state.search){
    lista=lista.filter(v=>{
      const c=conductores.find(x=>x.id===v.conductorId);
      return (c&&c.nombre.toLowerCase().includes(state.search))||(v.ruta||'').toLowerCase().includes(state.search)||(v.cliente||'').toLowerCase().includes(state.search)||(v.material||'').toLowerCase().includes(state.search)||(v.placaTracto||'').toLowerCase().includes(state.search)||(v.placaCarreta||'').toLowerCase().includes(state.search)||(v.estatus||'').toLowerCase().includes(state.search)||(v.numero||'').toLowerCase().includes(state.search)||(v.unidad||'').toLowerCase().includes(state.search);
    });
  }
  if(!lista.length){
    const tipoLabel = esTodos ? 'todos los tipos' : TIPOS_VIAJE[state.tipoViaje].label;
    $('#tabla-viajes').innerHTML=`<div class="empty">No hay viajes activos de ${tipoLabel}.${puedeCrearViaje?' Usa "Agregar viaje".':''}</div>`;
    return;
  }

  const hayAcciones = true; // incluye el botón de copiar, visible para todos
  const minWidth = (esTodos ? '1950' : '1850') + (hayAcciones ? '' : '-100');
  let html=`<div class="table-wrap"><table style="min-width:${minWidth}px"><thead><tr>
    <th>#</th>
    ${esTodos?'<th>TIPO</th>':''}
    <th>CONDUCTOR</th><th>TRACTO</th><th>CARRETA</th><th>TIPO CARRETA</th>
    <th>RUTA</th><th>CLIENTE</th><th>MATERIAL</th>
    <th>N°</th><th>UNIDAD</th>
    <th>GRR</th><th>GRT</th><th>ESTATUS</th>${hayAcciones?'<th style="text-align:right">ACCIONES</th>':''}
  </tr></thead><tbody>`;
  lista.forEach((v,i)=>{
    const c=conductores.find(x=>x.id===v.conductorId);
    const grrPill=v.grr?(puedeEditarGRR?`<span class="pill registrado clickable" onclick="event.stopPropagation();editarCampo(${v.id},'grr')">${esc(v.grr)}</span>`:`<span class="pill registrado">${esc(v.grr)}</span>`):(puedeEditarGRR?`<span class="pill vacio clickable" onclick="event.stopPropagation();editarCampo(${v.id},'grr')">VACÍO</span>`:`<span class="pill vacio static">VACÍO</span>`);
    const grtPill=v.grt?(puedeEditarGRR?`<span class="pill registrado clickable" onclick="event.stopPropagation();editarCampo(${v.id},'grt')">${esc(v.grt)}</span>`:`<span class="pill registrado">${esc(v.grt)}</span>`):(puedeEditarGRR?`<span class="pill vacio clickable" onclick="event.stopPropagation();editarCampo(${v.id},'grt')">VACÍO</span>`:`<span class="pill vacio static">VACÍO</span>`);

    const esApoyoConductor=!!v.apoyoConductorOriginal;
    const esApoyoTracto=!!v.apoyoTractoOriginal;
    const nombreFull=c?c.nombre:'— sin conductor —';
    const nombreShow=c?nombreCorto(c.nombre):'— sin conductor —';
    const conductorHTML=esApoyoConductor
      ? `<span class="apoyo-tag" title="Apoyo · reemplazó a ${esc(v.apoyoConductorOriginal||'—')}">${esc(nombreShow)}</span><span class="apoyo-badge">Apoyo</span>`
      : `<b title="${esc(nombreFull)}">${esc(nombreShow)}</b>`;
    const tractoHTML=esApoyoTracto
      ? `<span class="apoyo-tag" title="Apoyo · reemplazó a ${esc(v.apoyoTractoOriginal||'—')}">${esc(v.placaTracto||'—')}</span>`
      : `<b>${esc(v.placaTracto||'—')}</b>`;
    const carretaHTML=esApoyoConductor
      ? `<span class="apoyo-tag" title="Apoyo · reemplazó a ${esc(v.apoyoConductorOriginal||'—')}">${esc(v.placaCarreta||'—')}</span>`
      : (v.sinCarreta ? `<span class="pill solo-pill">SOLO TRACTO</span>` : `<b>${esc(v.placaCarreta||'—')}</b>`);
    const tipoCarretaHTML = v.tipoCarreta ? `<span class="tipo-tag">${esc(v.tipoCarreta)}</span>` : `<span style="color:var(--text-dis)">—</span>`;

    const tipoInfo = TIPOS_VIAJE[v.tipo] || TIPOS_VIAJE.general;
    const numeroHTML = v.numero ? `<b>${esc(v.numero)}</b>` : '<span style="color:var(--text-dis)">—</span>';
    const unidadHTML = v.unidad ? `<span class="tipo-tag">${esc(v.unidad)}</span>` : '<span style="color:var(--text-dis)">—</span>';

    const sc=estatusColors(v.estatus);
    let estatusHTML;
    if(v.estatus === 'PROGRAMADO' || !puedeCambiarEstatus){
      estatusHTML = `<span class="estatus-pill" style="background:${sc.bg};color:${sc.color}" title="${v.estatus==='PROGRAMADO'?'Se activa al registrar GRR + GRT':''}">${v.estatus==='PROGRAMADO'?'🔒 ':''}${v.estatus}</span>`;
    } else {
      estatusHTML = `<select class="estatus-select" style="background-color:${sc.bg};color:${sc.color}" onchange="setCampo(${v.id},'estatus',this.value)">${ESTATUS_VIAJE_MANUAL.map(e=>`<option value="${e}" ${v.estatus===e?'selected':''}>${e}</option>`).join('')}</select>`;
    }

    let accionesHTML = '';
    if(hayAcciones){
      accionesHTML += `<button class="btn secondary sm" onclick="copiarDatosViaje(${v.id})" title="Copiar datos del viaje">📋</button>`;
      if(puedeCrearViaje) accionesHTML += `<button class="btn secondary sm" onclick="abrirModalViaje(${v.id})" title="Editar viaje">✏️</button>`;
      if(puedeApoyo) accionesHTML += `<button class="btn secondary sm" onclick="abrirAdicional(${v.id})" title="Adicional / apoyo">➕</button>`;
      if(puedeTerminar){
        const listo = v.grr && v.grt && v.estatus === 'DESCARGADO';
        accionesHTML += listo
          ? `<button class="btn success sm" onclick="terminarProceso(${v.id})" title="Enviar al histórico">✓ Terminar</button>`
          : `<button class="btn secondary sm" style="opacity:.7" onclick="terminarProceso(${v.id})" title="Faltan requisitos">🔒 Terminar</button>`;
      }
      if(!accionesHTML) accionesHTML = `<span style="font-size:11px;color:var(--text-sec);font-style:italic">Solo lectura</span>`;
    }

    html+=`<tr>
      <td class="center" style="color:var(--text-sec)">${i+1}</td>
      ${esTodos?`<td><span class="tipo-tag" style="background:${tipoInfo.color};color:#fff;border:none">${esc(tipoInfo.label)}</span></td>`:''}
      <td>${conductorHTML}</td>
      <td>${tractoHTML}</td>
      <td>${carretaHTML}</td>
      <td>${tipoCarretaHTML}</td>
      <td>${esc(v.ruta||'—')}</td>
      <td>${esc(v.cliente||'—')}</td>
      <td>${v.vacio?'<span class="pill vacio-pill">🚛 VACÍO</span>':esc(v.material||'—')}</td>
      <td class="center">${numeroHTML}</td>
      <td class="center">${unidadHTML}</td>
      <td class="center">${grrPill}</td>
      <td class="center">${grtPill}</td>
      <td class="center">${estatusHTML}</td>
      ${hayAcciones?`<td style="text-align:right">${accionesHTML}</td>`:''}
    </tr>`;
  });
  html+=`</tbody></table></div>`;
  $('#tabla-viajes').innerHTML=html;
}

function setCampo(viajeId, campo, valor){
  if(campo === 'estatus' && !puede('cambiar_estatus')){ noPermiso(); renderViajes(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  if(campo === 'estatus'){
    if(valor === 'PROGRAMADO'){
      toast('⛔ El estatus PROGRAMADO es automático.', 'warning');
      renderViajes(); return;
    }
    if(!ESTATUS_VIAJE_MANUAL.includes(valor)){ renderViajes(); return; }
    if(valor === 'EN RUTA'){
      const enRuta=conductoresEnRuta(viajeId);
      if(v.conductorId && enRuta.has(parseInt(v.conductorId))){
        const c=conductores.find(x=>x.id===v.conductorId);
        toast(`⛔ ${c?c.nombre:'El conductor'} ya está EN RUTA en otro viaje`,'danger');
        renderViajes(); return;
      }
    }
  }
  const anterior = v[campo] || '';
  v[campo]=valor;
  if(String(anterior) !== String(valor) && campo === 'estatus') {
    registrarCambio('Viajes','Cambio estatus', `${v.ruta} / ${v.cliente}`, 'Estatus', anterior, valor);
  }
  guardar(); renderTodo();
  toast(`${campo.toUpperCase()}: ${valor}`,'success');
}

function terminarProceso(viajeId){
  if(!puede('terminar_viajes')){ noPermiso(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  const faltantes=[];
  if(!v.grr) faltantes.push('Registrar <b>GRR</b>');
  if(!v.grt) faltantes.push('Registrar <b>GRT</b>');
  if(v.estatus!=='DESCARGADO') faltantes.push('Cambiar estatus a <b>DESCARGADO</b>');
  if(faltantes.length){
    openModal('⚠️ Requisitos faltantes',`
      <div class="alert danger" style="margin-bottom:0"><span class="ico">⚠</span><div class="msg"><b>Este viaje aún no puede pasar al histórico:</b><ul style="margin-top:8px">${faltantes.map(f=>`<li>${f}</li>`).join('')}</ul></div></div>
    `,`<button class="btn primary" onclick="closeModal()">Entendido</button>`);
    return;
  }
  if(!confirm(`¿Terminar el proceso del viaje?\n\nRuta: ${v.ruta}\nCliente: ${v.cliente}\n\nSe enviará al histórico.`)) return;
  const estatusAntes = v.estatus;
  v.historico=true; v.fechaFin=hoyISO();
  registrarCambio('Viajes','Enviar al histórico', `${v.ruta} / ${v.cliente}`, 'Estatus', estatusAntes, 'HISTÓRICO');
  guardar(); renderTodo();
  toast('✓ Viaje enviado al histórico','success');
}

function abrirModalViaje(viajeId){
  if(!puede('crear_viajes')){ noPermiso(); return; }
  const esEdicion=viajeId!=null;
  const tipoDefault = state.tipoViaje === 'todos' ? 'general' : state.tipoViaje;
  const v=esEdicion?viajes.find(x=>x.id===viajeId):{ tipo:tipoDefault, conductorId:null, numero:'', unidad:'', placaTracto:'', placaCarreta:'', tipoCarreta:'', ruta:'', cliente:'', material:'', grr:'', grt:'', estatus:'PROGRAMADO' };
  if(!v) return;
  const rutasOpts=Array.from(new Set([...cfg.rutas, ...(v.ruta?[v.ruta]:[])])).sort();
  const clientesOpts=Array.from(new Set([...cfg.clientes, ...(v.cliente?[v.cliente]:[]), ...viajes.map(x=>x.cliente).filter(Boolean)])).sort();
  const materialesOpts=Array.from(new Set([...cfg.materiales, ...(v.material?[v.material]:[])])).sort();
  const enRuta=conductoresEnRuta(esEdicion?viajeId:null);

  let hayOcupados = enRuta.size > 0;
  let hayNoAptos = false;

  const conductorOpts=conductores.map(c=>{
    const isBusy=enRuta.has(parseInt(c.id));
    const isCurrent=parseInt(c.id)===parseInt(v.conductorId);
    const apt=conductorApto(c);
    if(!apt.apto) hayNoAptos=true;
    const blockedBusy = isBusy && !isCurrent;
    const blockedApto = !apt.apto && !isCurrent;
    const blocked = blockedBusy || blockedApto;
    let style='', prefix='', suffix='';
    if(blockedBusy){ style='color:#B23B3B;background:#FBE6E6;font-style:italic;font-weight:700'; prefix='🔴 '; suffix=' — EN RUTA'; }
    else if(blockedApto){ style='color:#B77918;background:#FCF0DC;font-style:italic;font-weight:700'; prefix='⚠️ '; suffix=' — ' + apt.motivo; }
    return `<option value="${c.id}" ${isCurrent?'selected':''} ${blocked?'disabled':''} style="${style}">${prefix}${esc(c.nombre)} · ${esc(c.dni)}${suffix}</option>`;
  }).join('');

  const bodyHTML=`
    <div class="alert danger hidden" id="viaje-alert"><span class="ico">⚠</span><div class="msg"></div></div>
    ${(hayOcupados||hayNoAptos)?`<div class="alert info" style="margin-bottom:16px"><span class="ico">🔒</span><div class="msg">Los conductores marcados en <b style="color:#B23B3B">rojo (EN RUTA)</b> o <b style="color:#B77918">ámbar (DNI o licencias vencidas)</b> no pueden seleccionarse.</div></div>`:''}
    <h4 class="sec-title">Información general</h4>
    <label class="vacio-card ${v.vacio?'on':''}" id="vacio-card">
      <input type="checkbox" id="m-vacio" ${v.vacio?'checked':''} onchange="toggleVacio()">
      <span class="vacio-switch"></span>
      <span class="vacio-ico">🚛</span>
      <span class="vacio-txt"><b>Viaje en vacío</b><small>Sin carga ni material</small></span>
      <span class="vacio-badge">VACÍO</span>
    </label>
    <div class="form-grid">
      <div class="field"><label>Tipo de viaje <span class="req">*</span></label><select id="m-tipo" onchange="onTipoViajeChange()">${Object.entries(TIPOS_VIAJE).map(([k,t])=>`<option value="${k}" ${v.tipo===k?'selected':''}>${esc(t.label)}</option>`).join('')}</select></div>
      <div class="field"><label>Conductor <span class="req">*</span></label><select id="m-conductor" onchange="autoFillPlacas()"><option value="">— Seleccionar —</option>${conductorOpts}</select></div>
      <div class="field"><label>Placa del tracto</label><input id="m-tracto" value="${esc(v.placaTracto)}" readonly placeholder="Auto desde conductor"></div>
      <div class="field"><label>Placa de la carreta <span id="carreta-hint" class="hidden" style="font-weight:500;color:var(--text-sec)">· disponibles (no en ruta)</span></label><select id="m-carreta"><option value="${esc(v.placaCarreta)}">${esc(v.placaCarreta)||'Auto desde conductor'}</option></select>
        <div id="carreta-swap" class="hidden" style="margin-top:6px">
          <button type="button" class="btn secondary sm" id="btn-suplantar" onclick="abrirSuplantar()" title="Cambiar por otra carreta (ej. carreta del cliente)">✏️ Cambiar carreta</button>
          <div id="swap-box" class="hidden" style="display:none;gap:6px;align-items:center;margin-top:6px"><input id="m-carreta-nueva" maxlength="10" placeholder="Nueva placa" style="text-transform:uppercase;flex:1;min-width:0" onkeydown="if(event.key==='Enter'){event.preventDefault();aplicarSuplantar();}"><button type="button" class="btn sm" onclick="aplicarSuplantar()" title="Aplicar">✔</button><button type="button" class="btn secondary sm" onclick="cerrarSuplantar()" title="Cancelar">✖</button></div>
          <small id="swap-note" style="display:block;color:var(--text-sec);margin-top:4px"></small>
        </div></div>
      <div class="peli-box hidden" id="vacio-config">
        <div class="peli-title">🚛 Configuración de la unidad <small>(Viaje en vacío)</small></div>
        <div class="peli-opts" style="margin-bottom:0">
          <label class="peli-opt ${v.sinCarreta?'':'sel'}" id="peli-opt-completo"><input type="radio" name="m-config" value="completo" ${v.sinCarreta?'':'checked'} onchange="onConfigUnidad()"><span class="peli-ico">🚛🔗</span><span><b>Tracto + Carreta</b><small>Sale con semirremolque</small></span></label>
          <label class="peli-opt ${v.sinCarreta?'sel':''}" id="peli-opt-solo"><input type="radio" name="m-config" value="solo" ${v.sinCarreta?'checked':''} onchange="onConfigUnidad()"><span class="peli-ico">🚛</span><span><b>Solo tracto</b><small>Sale sin carreta</small></span></label>
        </div>
      </div>
      <div class="field"><label>Ruta <span class="req">*</span></label><select id="m-ruta"><option value="">— Seleccionar —</option>${rutasOpts.map(r=>`<option value="${esc(r)}" ${v.ruta===r?'selected':''}>${esc(r)}</option>`).join('')}</select></div>
      <div class="field"><label>Cliente <span class="req">*</span></label><select id="m-cliente"><option value="">— Seleccionar —</option>${clientesOpts.map(c=>`<option value="${esc(c)}" ${v.cliente===c?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
      <div class="field"><label>Material <span class="req">*</span></label><select id="m-material"><option value="">— Seleccionar —</option>${materialesOpts.map(m=>`<option value="${esc(m)}" ${v.material===m?'selected':''}>${esc(m)}</option>`).join('')}</select></div>
      <div class="field"><label>N°</label><input id="m-numero" value="${esc(v.numero||'')}" placeholder="Ej. 1500"></div>
      <div class="field"><label>Unidad</label><select id="m-unidad"><option value="">— Seleccionar —</option>${UNIDADES_CARGA.map(u=>`<option value="${esc(u)}" ${v.unidad===u?'selected':''}>${esc(u)}</option>`).join('')}</select></div>
    </div>
  `;
  openModal(esEdicion?'✏️ Editar viaje':'➕ Agregar viaje',bodyHTML,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="guardarViajeModal(${esEdicion?viajeId:'null'})">${esEdicion?'Actualizar':'Registrar'}</button>`, true);
  if(v.vacio) toggleVacio(true);
  onTipoViajeChange(v.id||0);
  setTimeout(()=>document.getElementById('m-conductor').focus(),80);
}

function toggleVacio(init){
  const on = document.getElementById('m-vacio').checked;
  document.getElementById('vacio-card').classList.toggle('on', on);
  document.getElementById('vacio-config').classList.toggle('hidden', !on);
  ['m-material','m-numero','m-unidad'].forEach(id => {
    const el = document.getElementById(id);
    if(on) el.value = '';
    el.disabled = on;
    el.closest('.field').classList.toggle('field-off', on);
  });
  onConfigUnidad(init === true);
}

let _viajeEditId = null;
function esPeligroso(){ return document.getElementById('m-tipo').value === 'peligroso'; }
function esSolo(){
  const r = document.querySelector('input[name="m-config"]:checked');
  return document.getElementById('m-vacio').checked && !!r && r.value === 'solo';
}
function setCarreta(placa){
  const sel = document.getElementById('m-carreta'); placa = placa || '';
  if(placa && ![...sel.options].some(o => o.value === placa)) sel.add(new Option(placa, placa));
  sel.value = placa;
}
function poblarCarreta(){
  const sel = document.getElementById('m-carreta');
  const actual = sel.value;
  sel.innerHTML = '<option value="">Auto desde conductor</option>' + (actual ? `<option value="${esc(actual)}">${esc(actual)}</option>` : '');
  sel.value = actual;
  bloquearCarreta();
}
function bloquearCarreta(){
  const sel = document.getElementById('m-carreta');
  const solo = esSolo();
  if(solo) sel.value = '';
  sel.disabled = true;
  const hint = document.getElementById('carreta-hint'); if(hint) hint.classList.add('hidden');
  const sw = document.getElementById('carreta-swap');
  if(sw) sw.classList.toggle('hidden', !esPeligroso() || solo);
  if(!esPeligroso() || solo) cerrarSuplantar(true);
}
function abrirSuplantar(){
  const box = document.getElementById('swap-box');
  box.style.display = 'flex'; box.classList.remove('hidden');
  const i = document.getElementById('m-carreta-nueva'); i.value = ''; i.focus();
}
function cerrarSuplantar(limpiarNota){
  const box = document.getElementById('swap-box'); if(!box) return;
  box.style.display = 'none';
  if(limpiarNota){ const n = document.getElementById('swap-note'); if(n) n.textContent = ''; }
}
function aplicarSuplantar(){
  const i = document.getElementById('m-carreta-nueva');
  const nueva = i.value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  if(!nueva){ i.classList.add('error'); i.focus(); return; }
  i.classList.remove('error');
  const orig = document.getElementById('m-carreta').value;
  setCarreta(nueva);
  document.getElementById('swap-note').textContent = '🔁 Carreta suplantada' + (orig && orig !== nueva ? ' (antes: ' + orig + ')' : '');
  cerrarSuplantar();
}
function onTipoViajeChange(viajeId){
  const inicial = viajeId !== undefined;
  if(inicial) _viajeEditId = viajeId || null;
  if(!inicial && !esPeligroso() && !esSolo()){
    const c = conductores.find(x => x.id === parseInt(document.getElementById('m-conductor').value));
    setCarreta(c ? c.placaCarreta : '');
  }
  poblarCarreta();
}
function onConfigUnidad(silencioso){
  const solo = esSolo();
  document.getElementById('peli-opt-solo').classList.toggle('sel', solo);
  document.getElementById('peli-opt-completo').classList.toggle('sel', !solo);
  if(!solo && !silencioso && !esPeligroso()){
    const c = conductores.find(x => x.id === parseInt(document.getElementById('m-conductor').value));
    setCarreta(c ? c.placaCarreta : '');
  }
  bloquearCarreta();
}

function autoFillPlacas(){
  const cid=parseInt(document.getElementById('m-conductor').value);
  const c=conductores.find(x=>x.id===cid);
  if(c){
    document.getElementById('m-tracto').value=c.placaTracto||'';
    setCarreta(esSolo() ? '' : (c.placaCarreta||''));
    cerrarSuplantar(true);
    poblarCarreta();
  }
}

function mostrarAlertaViaje(msgs){
  const alertEl=document.getElementById('viaje-alert');
  alertEl.querySelector('.msg').innerHTML=`<b>No se pudo guardar el viaje.</b><ul>${msgs.map(m=>`<li>${m}</li>`).join('')}</ul>`;
  alertEl.classList.remove('hidden');
  document.querySelector('#modal-body').scrollTo({top:0,behavior:'smooth'});
}

function limpiarErroresForm(){
  document.querySelectorAll('#modal-body .error').forEach(el=>el.classList.remove('error'));
  const alertEl=document.getElementById('viaje-alert');
  if(alertEl) alertEl.classList.add('hidden');
}

function guardarViajeModal(viajeId){
  if(!puede('crear_viajes')){ noPermiso(); return; }
  limpiarErroresForm();
  const form={
    tipo:document.getElementById('m-tipo').value,
    conductorId:parseInt(document.getElementById('m-conductor').value)||null,
    numero: document.getElementById('m-numero').value.trim(),
    unidad: document.getElementById('m-unidad').value,
    placaTracto:document.getElementById('m-tracto').value.trim().toUpperCase(),
    placaCarreta:document.getElementById('m-carreta').value.trim().toUpperCase(),
    ruta:document.getElementById('m-ruta').value.trim().toUpperCase(),
    cliente:document.getElementById('m-cliente').value.trim().toUpperCase(),
    material:document.getElementById('m-material').value,
    vacio:document.getElementById('m-vacio').checked,
    sinCarreta: esSolo()
  };
  if(form.vacio){ form.material='VACÍO'; form.numero=''; form.unidad=''; }
  const errores=[];
  if(!form.conductorId){ errores.push('Selecciona un conductor.'); document.getElementById('m-conductor').classList.add('error'); }
  if(!form.ruta){ errores.push('Selecciona la ruta.'); document.getElementById('m-ruta').classList.add('error'); }
  if(esPeligroso() && !form.sinCarreta && !form.placaCarreta){ errores.push('El conductor no tiene carreta: usa "✏️ Cambiar carreta" o marca "Solo tracto".'); document.getElementById('m-carreta').classList.add('error'); }
  if(!form.cliente){ errores.push('Selecciona el cliente.'); document.getElementById('m-cliente').classList.add('error'); }
  if(!form.vacio && !form.material){ errores.push('Selecciona el material.'); document.getElementById('m-material').classList.add('error'); }

  if(form.conductorId){
    const c = conductores.find(x=>x.id===form.conductorId);
    const apt = conductorApto(c);
    if(!apt.apto){
      const viajeActual = viajeId ? viajes.find(x=>x.id===viajeId) : null;
      const isCurrent = viajeActual && parseInt(viajeActual.conductorId)===form.conductorId;
      if(!isCurrent) errores.push(`El conductor no está apto: ${apt.motivo}. Actualiza sus documentos.`);
    }
  }

  if(errores.length){ mostrarAlertaViaje(errores); return; }
  const tracto = vehiculos.find(x => x.placa === form.placaTracto);
  const carreta = vehiculos.find(x => x.placa === form.placaCarreta);
  const alerts = [...getAlertasVehiculo(tracto), ...getAlertasVehiculo(carreta)];
  if(alerts.length > 0){
    mostrarAlertaVehiculos(alerts, () => _guardarViajeConfirmado(form, viajeId));
    return;
  }
  _guardarViajeConfirmado(form, viajeId);
}

function _guardarViajeConfirmado(form, viajeId){
  const car=vehiculos.find(x=>x.placa===form.placaCarreta);
  form.tipoCarreta=car?car.tipo:'';
  if(viajeId){
    const v=viajes.find(x=>x.id===viajeId);
    const estatusActual = v.estatus;
    const antes = {...v};
    Object.assign(v,form);
    v.estatus = estatusActual;
    v.apoyoTractoOriginal=null; v.apoyoConductorOriginal=null;
    ['tipo','conductorId','numero','unidad','placaTracto','placaCarreta','ruta','cliente','material'].forEach(k=>{
      if(String(antes[k]||'') !== String(v[k]||'')) {
        let valorAnt = antes[k]||'', valorNue = v[k]||'';
        if(k==='conductorId'){
          const cAnt = conductores.find(c=>c.id===parseInt(antes[k]));
          const cNue = conductores.find(c=>c.id===parseInt(v[k]));
          valorAnt = cAnt ? cAnt.nombre : (antes[k]||'—');
          valorNue = cNue ? cNue.nombre : (v[k]||'—');
        }
        registrarCambio('Viajes','Editar viaje', `${v.ruta} / ${v.cliente}`, CAMPOS_VIAJE_LABELS[k]||k, valorAnt, valorNue);
      }
    });
    toast('Viaje actualizado','success');
  } else {
    const idNuevo = Date.now();
    viajes.push({ id:idNuevo, ...form, grr:'', grt:'', estatus:'PROGRAMADO', historico:false, fechaFin:null, apoyoTractoOriginal:null, apoyoConductorOriginal:null });
    registrarCambio('Viajes','Crear viaje', `${form.ruta} / ${form.cliente}`, '', '', '', `N° ${form.numero||'—'} ${form.unidad||''}`);
    toast('✓ Viaje registrado en PROGRAMADO','success');
  }
  guardar(); closeModal(); renderTodo();
}

function editarCampo(viajeId, campo){
  if(!puede('editar_grr_grt')){ noPermiso(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  const titulo=campo==='grr'?'GRR · Guía Remitente':'GRT · Guía Transportista';
  openModal(titulo,`<div class="field"><label>Número de ${campo.toUpperCase()}</label><input id="inp-campo" value="${esc(v[campo]||'')}" placeholder="Dejar vacío si aún no se realiza"></div><p style="font-size:11.5px;color:var(--text-sec);margin-top:12px">💡 Al registrar ambas guías, el viaje pasará a <b>EN RUTA</b> automáticamente.</p>`,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="guardarCampo(${viajeId},'${campo}')">Guardar</button>`);
  setTimeout(()=>{ const i=document.getElementById('inp-campo'); if(i){ i.focus(); i.select(); } },80);
}

function guardarCampo(viajeId, campo){
  if(!puede('editar_grr_grt')){ noPermiso(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  const anterior = v[campo]||'';
  v[campo]=(document.getElementById('inp-campo').value||'').trim();
  if(anterior !== v[campo]){
    registrarCambio('Viajes', campo==='grr'?'Registrar GRR':'Registrar GRT', `${v.ruta} / ${v.cliente}`, campo.toUpperCase(), anterior, v[campo]);
  }
  let autoMsg=null, autoType='success';
  let shouldTransition=false;
  if(v.estatus==='PROGRAMADO' && v.grr && v.grt){
    const otherBusy = viajes.some(x =>
      !x.historico && x.id !== v.id &&
      x.estatus === 'EN RUTA' &&
      parseInt(x.conductorId) === parseInt(v.conductorId)
    );
    if(otherBusy){ autoMsg='Ambas guías registradas, pero el conductor ya está EN RUTA en otro viaje'; autoType='warning'; }
    else { shouldTransition=true; }
  }
  if(shouldTransition){
    const tracto = vehiculos.find(x => x.placa === v.placaTracto);
    const carreta = vehiculos.find(x => x.placa === v.placaCarreta);
    const alerts = [...getAlertasVehiculo(tracto), ...getAlertasVehiculo(carreta)];
    if(alerts.length > 0){
      guardar(); closeModal(); renderTodo();
      toast(`${campo.toUpperCase()} actualizado`, 'success');
      setTimeout(() => {
        mostrarAlertaVehiculos(alerts, () => {
          v.estatus='EN RUTA';
          registrarCambio('Viajes','Cambio estatus', `${v.ruta} / ${v.cliente}`, 'Estatus', 'PROGRAMADO', 'EN RUTA');
          guardar(); renderTodo();
          toast('✓ En Ruta (con alertas confirmadas)', 'success');
        });
      }, 250);
      return;
    }
    v.estatus='EN RUTA';
    registrarCambio('Viajes','Cambio estatus', `${v.ruta} / ${v.cliente}`, 'Estatus', 'PROGRAMADO', 'EN RUTA');
    autoMsg='✓ Ambas guías registradas → En Ruta automáticamente';
  }
  guardar(); closeModal(); renderTodo();
  toast(`${campo.toUpperCase()} actualizado`, 'success');
  if(autoMsg) setTimeout(()=>toast(autoMsg, autoType), 400);
}

function abrirAdicional(viajeId){
  if(!puede('aplicar_apoyo')){ noPermiso(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  const tractos=vehiculos.filter(x=>x.tipo==='TRACTO');
  const enRuta=conductoresEnRuta(viajeId);
  const conductorOpts=conductores.map(c=>{
    const isBusy=enRuta.has(parseInt(c.id));
    const apt=conductorApto(c);
    const blocked = isBusy || !apt.apto;
    let style='', prefix='', suffix='';
    if(isBusy){ style='color:#B23B3B;background:#FBE6E6;font-style:italic;font-weight:700'; prefix='🔴 '; suffix=' — EN RUTA'; }
    else if(!apt.apto){ style='color:#B77918;background:#FCF0DC;font-style:italic;font-weight:700'; prefix='⚠️ '; suffix=' — ' + apt.motivo; }
    return `<option value="${c.id}" ${blocked?'disabled':''} style="${style}">${prefix}${esc(c.nombre)} (DNI ${esc(c.dni)})${suffix}</option>`;
  }).join('');
  openModal('➕ Adicional · Apoyo del viaje',`
    <div class="alert success" style="margin-bottom:16px"><span class="ico">♻</span><div class="msg">Los datos reemplazados se marcarán en <b style="color:#A65A00">amarillo</b>.</div></div>
    <p style="font-size:12.5px;color:var(--text-sec);margin:0 0 16px;line-height:1.6">Viaje: <b style="color:var(--text)">${esc(v.ruta||'Sin ruta')}</b> · Cliente: <b style="color:var(--text)">${esc(v.cliente||'—')}</b></p>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div><label class="apoyo-check-label" for="chk-tracto"><input type="checkbox" id="chk-tracto" onchange="toggleApoyoSelect('tracto')"><span>🚛 Tracto de apoyo</span></label><div id="apoyo-tracto-cont" class="apoyo-selector-box" style="display:none"><div class="field" style="margin:0"><label>Placa del tracto</label><select id="sel-tracto"><option value="">— Seleccionar —</option>${tractos.map(t=>`<option value="${esc(t.placa)}">${esc(t.placa)} — ${esc(t.marca)}</option>`).join('')}</select></div></div></div>
      <div><label class="apoyo-check-label" for="chk-conductor"><input type="checkbox" id="chk-conductor" onchange="toggleApoyoSelect('conductor')"><span>👤 Conductor de apoyo</span></label><div id="apoyo-conductor-cont" class="apoyo-selector-box" style="display:none"><div class="field" style="margin:0"><label>Conductor</label><select id="sel-conductor"><option value="">— Seleccionar —</option>${conductorOpts}</select></div></div></div>
    </div>
  `,`<button class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn primary" onclick="aplicarApoyo(${viajeId})">Aplicar</button>`);
}

function toggleApoyoSelect(tipo){
  const check=document.getElementById('chk-'+tipo);
  document.getElementById('apoyo-'+tipo+'-cont').style.display=check.checked?'block':'none';
}

function aplicarApoyo(viajeId){
  if(!puede('aplicar_apoyo')){ noPermiso(); return; }
  const v=viajes.find(x=>x.id===viajeId); if(!v) return;
  const checkTracto=document.getElementById('chk-tracto').checked;
  const checkConductor=document.getElementById('chk-conductor').checked;
  if(!checkTracto && !checkConductor){ toast('Selecciona al menos un apoyo','danger'); return; }
  const originalTracto=v.placaTracto||'—';
  const condOrig=conductores.find(c=>c.id===v.conductorId);
  const nombreOrig=condOrig?condOrig.nombre:'—';
  let selTractoVal=null, selConductorVal=null;
  if(checkTracto){ selTractoVal=document.getElementById('sel-tracto').value; if(!selTractoVal){ toast('Selecciona un tracto','danger'); return; } }
  if(checkConductor){ selConductorVal=document.getElementById('sel-conductor').value; if(!selConductorVal){ toast('Selecciona un conductor','danger'); return; } }
  if(checkConductor){
    const enRuta=conductoresEnRuta(viajeId);
    if(enRuta.has(parseInt(selConductorVal))){
      const c=conductores.find(x=>x.id==selConductorVal);
      toast(`⛔ ${c.nombre} ya está EN RUTA`,'danger'); return;
    }
    const cApt=conductores.find(x=>x.id==selConductorVal);
    const apt=conductorApto(cApt);
    if(!apt.apto){ toast(`⛔ Conductor no apto: ${apt.motivo}`,'danger'); return; }
  }
  if(checkConductor){
    const c=conductores.find(x=>x.id==selConductorVal);
    if(c){
      v.conductorId=c.id; v.placaTracto=c.placaTracto; v.placaCarreta=c.placaCarreta;
      const car=vehiculos.find(x=>x.placa===c.placaCarreta);
      v.tipoCarreta=car?car.tipo:'';
      v.apoyoConductorOriginal=nombreOrig;
      registrarCambio('Viajes','Aplicar apoyo', `${v.ruta} / ${v.cliente}`, 'Conductor', nombreOrig, c.nombre);
    }
  }
  if(checkTracto){
    v.placaTracto=selTractoVal; v.apoyoTractoOriginal=originalTracto;
    registrarCambio('Viajes','Aplicar apoyo', `${v.ruta} / ${v.cliente}`, 'Tracto', originalTracto, selTractoVal);
  }
  guardar(); closeModal(); renderTodo();
  toast('Apoyo aplicado','success');
}

function togglePeriodoBox(){ const box=document.getElementById('periodo-box'); if(box) box.classList.toggle('open'); }

function renderHistorico(){
  const hist=viajes.filter(v=>v.historico);
  const meses={};
  hist.forEach(v=>{ const m=(v.fechaFin||hoyISO()).slice(0,7); meses[m]=(meses[m]||0)+1; });
  const mesesOrdenados=Object.keys(meses).sort().reverse();
  const selected=state.filtroMesHistorico;
  const mesValue=selected?mesLabel(selected):'Todos los meses';
  const totalFiltrado=selected?(meses[selected]||0):hist.length;
  const valueEl=document.getElementById('periodo-value');
  const countEl=document.getElementById('periodo-count');
  const bodyEl=document.getElementById('periodo-body');
  const totalEl=document.getElementById('historico-total');
  if(valueEl) valueEl.textContent=mesValue;
  if(countEl) countEl.textContent=`${totalFiltrado} viaje${totalFiltrado!==1?'s':''}`;
  if(totalEl) totalEl.textContent=`${hist.length} viaje${hist.length!==1?'s':''} totales`;
  if(bodyEl){
    bodyEl.innerHTML=`<button class="month-pill ${!selected?'active':''}" onclick="setFiltroMes(null)">📅 Todos <span class="month-count">${hist.length}</span></button>${mesesOrdenados.map(m=>`<button class="month-pill ${selected===m?'active':''}" onclick="setFiltroMes('${m}')">${mesLabel(m)} <span class="month-count">${meses[m]}</span></button>`).join('')}`;
  }
  renderHistoricoBody();
}
function setFiltroMes(m){ state.filtroMesHistorico=m; renderHistorico(); }

function renderHistoricoBody(){
  let hist=viajes.filter(v=>v.historico);
  if(state.filtroMesHistorico){ hist=hist.filter(v=>(v.fechaFin||hoyISO()).slice(0,7)===state.filtroMesHistorico); }
  if(state.search){
    hist=hist.filter(v=>{
      const c=conductores.find(x=>x.id===v.conductorId);
      return (c&&c.nombre.toLowerCase().includes(state.search))||(v.ruta||'').toLowerCase().includes(state.search)||(v.cliente||'').toLowerCase().includes(state.search)||(v.material||'').toLowerCase().includes(state.search)||(v.numero||'').toLowerCase().includes(state.search);
    });
  }
  hist.sort((a,b)=>(b.fechaFin||'').localeCompare(a.fechaFin||''));
  if(!hist.length){
    $('#tabla-historico').innerHTML=`<div class="empty">No hay viajes históricos con esos filtros.</div>`;
    return;
  }
  let html=`<div class="table-wrap"><table style="min-width:1550px"><thead><tr>
    <th>#</th><th>FECHA FIN</th><th>CONDUCTOR</th><th>TRACTO</th><th>CARRETA</th>
    <th>RUTA</th><th>CLIENTE</th><th>MATERIAL</th><th>N°</th><th>UNIDAD</th>
    <th>TIPO</th><th>GRR</th><th>GRT</th>
  </tr></thead><tbody>`;
  hist.forEach((v,i)=>{
    const c=conductores.find(x=>x.id===v.conductorId);
    const tipoInfo=TIPOS_VIAJE[v.tipo]||TIPOS_VIAJE.general;
    const nombreMostrar = c ? nombreCorto(c.nombre) : '—';
    const nombreFull = c ? c.nombre : '—';
    html+=`<tr>
      <td class="center" style="color:var(--text-sec)">${i+1}</td>
      <td><b>${fmtFecha(v.fechaFin)}</b></td>
      <td><b title="${esc(nombreFull)}">${esc(nombreMostrar)}</b></td>
      <td><b>${esc(v.placaTracto||'—')}</b></td>
      <td><b>${esc(v.placaCarreta||'—')}</b></td>
      <td>${esc(v.ruta||'—')}</td>
      <td>${esc(v.cliente||'—')}</td>
      <td>${v.vacio?'<span class="pill vacio-pill">🚛 VACÍO</span>':esc(v.material||'—')}</td>
      <td class="center">${v.numero?esc(v.numero):'<span style="color:var(--text-dis)">—</span>'}</td>
      <td class="center">${v.unidad?`<span class="tipo-tag">${esc(v.unidad)}</span>`:'<span style="color:var(--text-dis)">—</span>'}</td>
      <td><span class="tipo-tag">${tipoInfo.label}</span></td>
      <td class="center"><span class="pill ${v.grr?'registrado':'nd'}">${v.grr?esc(v.grr):'S/N'}</span></td>
      <td class="center"><span class="pill ${v.grt?'registrado':'nd'}">${v.grt?esc(v.grt):'S/N'}</span></td>
    </tr>`;
  });
  html+=`</tbody></table></div>`;
  $('#tabla-historico').innerHTML=html;
}


/* ===== COPIAR DATOS DEL VIAJE ===== */
function textoDatosViaje(v){
  const c = conductores.find(x => x.id === parseInt(v.conductorId)) || {};
  const mtcDe = placa => {
    const u = vehiculos.find(x => x.placa === placa);
    return (u && u.docs && u.docs.mtc && u.docs.mtc.numero) || '—';
  };
  return [
    'SIGUIENTES DATOS*',
    `Placa de Tracto: ${v.placaTracto || '—'}`,
    `MTC Tracto: ${mtcDe(v.placaTracto)}`,
    `Placa de Semi Remolque: ${v.placaCarreta || '—'}`,
    `MTC Semirremolque: ${mtcDe(v.placaCarreta)}`,
    `Conductor: ${c.nombre || '—'}`,
    `Licencia: ${c.licencia || '—'}`
  ].join('\n');
}

function copiarDatosViaje(id){
  const v = viajes.find(x => x.id === id);
  if(!v) return;
  const txt = textoDatosViaje(v);
  const ok = () => toast('Datos copiados al portapapeles', 'success');
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try{ document.execCommand('copy'); ok(); }catch(e){ toast('No se pudo copiar', 'warning'); }
    ta.remove();
  };
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(txt).then(ok, fallback);
  } else fallback();
}
