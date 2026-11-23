
let STORED = window.FB_DATOS || (function(){ try{ const raw=localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw); }catch(e){} return null; })();
const datos = STORED || datosIniciales();
let { vehiculos, conductores, viajes } = datos;
let cfg = datos.cfg || JSON.parse(JSON.stringify(CFG_DEFAULT));
if(!STORED){ // primera carga: incorporar rutas, clientes y materiales del Excel importado
  ['rutas','clientes','materiales'].forEach(k => { cfg[k] = Array.from(new Set([...(cfg[k]||[]), ...CFG_IMPORT[k]])); });
}

Object.keys(cfg.tiposLabels || {}).forEach(k => { if(TIPOS_VIAJE[k]){ TIPOS_VIAJE[k].label = cfg.tiposLabels[k].label; TIPOS_VIAJE[k].color = cfg.tiposLabels[k].color; } });
if(!cfg.alertas) cfg.alertas = {};
Object.keys(ALERTAS_DEFAULT).forEach(k => { if(typeof cfg.alertas[k] !== 'number') cfg.alertas[k] = ALERTAS_DEFAULT[k]; });

if(!Array.isArray(cfg.usuarios) || cfg.usuarios.length === 0){
  cfg.usuarios = [
    { id:'u-admin', nombre:'Administrador', rol:'admin', activo:true, permisos: Object.fromEntries(PERMISOS_LIST.map(p=>[p.k, true])) }
  ];
}
const hayAdmin = cfg.usuarios.some(u=>u.rol==='admin' && u.activo);
if(!hayAdmin){
  cfg.usuarios.push({ id:'u-admin-'+Date.now(), nombre:'Administrador', rol:'admin', activo:true, permisos: Object.fromEntries(PERMISOS_LIST.map(p=>[p.k, true])) });
}
state.usuarioActualId = datos.usuarioActualId && cfg.usuarios.find(u=>u.id===datos.usuarioActualId)
  ? datos.usuarioActualId
  : (cfg.usuarios.find(u=>u.rol==='admin' && u.activo)||cfg.usuarios[0]).id;

viajes.forEach(v => {
  if(!v.estatus) v.estatus = (v.grr && v.grt) ? 'EN RUTA' : 'PROGRAMADO';
  if(v.historico===undefined) v.historico=false;
  if(!v.fechaFin) v.fechaFin=v.historico?hoyISO():null;
  if(!v.material) v.material='Otros';
  if(v.numero===undefined) v.numero='';
  if(v.unidad===undefined) v.unidad='';
});
vehiculos.forEach(v => {
  if(!v.docs) v.docs = {};
  if(!v.docs.chip) v.docs.chip = { numero: '', vence: '' };
  if(!v.docs.cilindros){
    if(v.docs.chip.numero){ v.docs.cilindros = { numero: v.docs.chip.numero.replace('CHIP','CIL'), vence: v.docs.chip.vence }; }
    else { v.docs.cilindros = { numero: '', vence: '' }; }
  }
  if(v.cilindros===undefined){ v.cilindros = (v.tipo==='TRACTO'?'6':'—'); }
});
conductores.forEach(c => { if(c.dniVigencia === undefined) c.dniVigencia = ''; if(c.licencia === undefined) c.licencia = ''; });

if(!Array.isArray(cfg.registro)) cfg.registro = [];

cfg.usuarios.forEach(u => {
  if(!u.permisos) u.permisos = {};
  PERMISOS_LIST.forEach(p => {
    if(u.permisos[p.k] === undefined) u.permisos[p.k] = (u.rol === 'admin');
  });
});

if(!cfg.operadoresCreados){
  ['Operador 1','Operador 2','Operador 3'].forEach((nombre, i) => {
    if(!cfg.usuarios.some(u => u.nombre === nombre)){
      cfg.usuarios.push({
        id: 'u-op-' + (i+1),
        nombre,
        rol: 'personalizado',
        activo: true,
        permisos: { ...PERMISOS_OPERADOR }
      });
    }
  });
  cfg.operadoresCreados = true;
}

/* Credenciales: usuarios existentes reciben usuario y contraseña por defecto */
(function(){
  const slug = t => (t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const usados = new Set(cfg.usuarios.filter(u=>u.usuario).map(u=>u.usuario.toLowerCase()));
  cfg.usuarios.forEach(u => {
    if(!u.usuario){
      let base = (u.rol==='admin' && !usados.has('admin')) ? 'admin' : (slug(u.nombre) || 'usuario'), n = base, i = 1;
      while(usados.has(n)) n = base + (++i);
      u.usuario = n; usados.add(n);
    }
    delete u.clave; // las contraseñas ahora las maneja Firebase Auth
  });
})();

function guardar(){
  try{
    localStorage.setItem(LS_KEY, JSON.stringify({
      vehiculos, conductores, viajes, cfg,
      usuarioActualId: state.usuarioActualId
    }));
  }catch(e){}
  if(window.fbGuardar) window.fbGuardar({ vehiculos, conductores, viajes, cfg });
}

const VISTA_META = {
  resumen: { title:'Resumen', sub:'Vista general de la operación', breadcrumb:'Resumen', permiso:'ver_resumen' },
  viajes: { title:'Viajes', sub:'Programación y seguimiento', breadcrumb:'Viajes', permiso:'ver_viajes' },
  historico: { title:'Histórico', sub:'Viajes completados por mes', breadcrumb:'Histórico', permiso:'ver_historico' },
  vehiculos: { title:'Vehículos', sub:'Gestión de unidades de la flota', breadcrumb:'Vehículos', permiso:'ver_vehiculos' },
  conductores: { title:'Conductores', sub:'Personal operativo y licencias', breadcrumb:'Conductores', permiso:'ver_conductores' },
  historial: { title:'Historial', sub:'Registro de cambios del sistema', breadcrumb:'Historial', permiso:'ver_registro' },
  configuracion:{ title:'Configuración', sub:'Catálogos y usuarios del sistema', breadcrumb:'Configuración', permiso:null }
};

function cambiarVista(view){
  if(view==='configuracion' && !tieneAccesoConfig()){ noPermiso('No tienes permiso para acceder a Configuración'); return; }
  if(view==='historial' && !puede('ver_registro')){ noPermiso('No tienes permiso para ver el Historial'); return; }
  const meta = VISTA_META[view];
  if(meta && meta.permiso && !puede(meta.permiso)){ noPermiso('No tienes permiso para ver esta sección'); return; }

  state.view=view; state.search='';
  if(state.modoEliminarVeh) cancelarEliminacion();
  if(state.modoEliminarCond) cancelarEliminacion();
  cerrarDropdowns();
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view===view));
  $$('.view').forEach(v => v.classList.toggle('active', v.id==='view-'+view));
  $('#page-title').textContent=meta.title;
  $('#page-sub').textContent=meta.sub;
  $('#breadcrumb').innerHTML=`Inicio / <b>${meta.breadcrumb}</b>`;
  $('#sidebar').classList.remove('open');
  if(view==='resumen') renderResumen();
  else if(view==='vehiculos') renderVehiculos();
  else if(view==='conductores') renderConductores();
  else if(view==='viajes') renderViajes();
  else if(view==='historico') renderHistorico();
  else if(view==='historial') renderHistorial();
  else if(view==='configuracion') renderConfiguracion();
}

function buscarGlobal(term){
  state.search=(term||'').toLowerCase().trim();
  if(state.view==='vehiculos') renderVehiculosBody();
  else if(state.view==='conductores') renderConductoresBody();
  else if(state.view==='viajes') renderViajes();
  else if(state.view==='historico') renderHistoricoBody();
  else if(state.view==='historial') renderHistorial();
}

function cambiarUsuarioActual(id){
  const u = cfg.usuarios.find(x=>x.id===id);
  if(!u) return;
  if(!u.activo){ toast('⛔ Este usuario está inactivo','danger'); actualizarSelectorUsuarios(); return; }
  state.usuarioActualId = id;
  guardar();
  actualizarSelectorUsuarios();
  actualizarNavVisibilidad();
  const meta = VISTA_META[state.view];
  const puedeVerActual = meta && meta.permiso ? puede(meta.permiso) : (state.view==='configuracion' ? tieneAccesoConfig() : true);
  if(!puedeVerActual){
    const primeraVista = ['resumen','viajes','historico','vehiculos','conductores','historial'].find(v => VISTA_META[v].permiso ? puede(VISTA_META[v].permiso) : true) || 'resumen';
    cambiarVista(primeraVista);
  } else {
    cambiarVista(state.view);
  }
  actualizarDropdowns();
  toast(`Sesión: ${u.nombre}`, 'info');
}

function actualizarSelectorUsuarios(){
  const sel = document.getElementById('user-name');
  const av = document.getElementById('user-avatar');
  if(!sel) return;
  const current = cfg.usuarios.find(x=>x.id===state.usuarioActualId);
  if(sel && current) sel.textContent = (ROLES[current.rol]||ROLES.viewer).icon+' '+current.nombre;
  if(av && current){
    const preset = ROLES[current.rol] || ROLES.viewer;
    av.className = 'avatar ' + preset.cls;
    av.textContent = (current.nombre||'??').slice(0,2).toUpperCase();
  }
}

function actualizarNavVisibilidad(){
  const mapa = {
    resumen:'ver_resumen', viajes:'ver_viajes', historico:'ver_historico',
    vehiculos:'ver_vehiculos', conductores:'ver_conductores', historial:'ver_registro'
  };
  $$('.nav-item').forEach(n=>{
    const view = n.dataset.view;
    if(view === 'configuracion'){
      n.style.display = tieneAccesoConfig() ? '' : 'none';
    } else {
      n.style.display = puede(mapa[view]) ? '' : 'none';
    }
  });
}

function actualizarDropdowns(){
  const ddVeh = document.getElementById('dropdown-veh');
  const btnMenuVeh = document.getElementById('btn-menu-veh');
  if(ddVeh && btnMenuVeh){
    let html = '';
    if(puede('editar_vehiculos')) html += `<button class="dropdown-item" onclick="abrirCrearVehiculo()"><span class="ico">➕</span>Crear vehículo</button>`;
    if(puede('eliminar_vehiculos')) html += `<button class="dropdown-item danger" onclick="activarModoEliminarVeh()"><span class="ico">🗑️</span>Eliminar vehículos</button>`;
    ddVeh.innerHTML = html;
    btnMenuVeh.style.display = html ? '' : 'none';
  }
  const ddCond = document.getElementById('dropdown-cond');
  const btnMenuCond = document.getElementById('btn-menu-cond');
  if(ddCond && btnMenuCond){
    let html = '';
    if(puede('editar_conductores')) html += `<button class="dropdown-item" onclick="abrirCrearConductor()"><span class="ico">➕</span>Crear conductor</button>`;
    if(puede('eliminar_conductores')) html += `<button class="dropdown-item danger" onclick="activarModoEliminarCond()"><span class="ico">🗑️</span>Eliminar conductores</button>`;
    ddCond.innerHTML = html;
    btnMenuCond.style.display = html ? '' : 'none';
  }
  const btnAdd = document.getElementById('btn-agregar-viaje');
  if(btnAdd) btnAdd.style.display = puede('crear_viajes') ? '' : 'none';
}

function toggleDropdown(tipo){
  const dd = document.getElementById('dropdown-'+tipo);
  if(!dd) return;
  const isHidden = dd.classList.contains('hidden');
  cerrarDropdowns();
  if(isHidden) dd.classList.remove('hidden');
}
function cerrarDropdowns(){ $$('.dropdown-menu').forEach(d => d.classList.add('hidden')); }
document.addEventListener('click', e => { if(!e.target.closest('.dropdown')) cerrarDropdowns(); });

function activarModoEliminarVeh(){
  if(!puede('eliminar_vehiculos')){ noPermiso(); return; }
  cerrarDropdowns();
  state.modoEliminarVeh = true; state.selVehiculos.clear();
  document.getElementById('modo-eliminar-veh-info').style.display = '';
  renderVehiculosBody(); actualizarDeleteBar();
}
function activarModoEliminarCond(){
  if(!puede('eliminar_conductores')){ noPermiso(); return; }
  cerrarDropdowns();
  state.modoEliminarCond = true; state.selConductores.clear();
  document.getElementById('modo-eliminar-cond-info').style.display = '';
  renderConductoresBody(); actualizarDeleteBar();
}
function cancelarEliminacion(){
  state.modoEliminarVeh = false; state.modoEliminarCond = false;
  state.selVehiculos.clear(); state.selConductores.clear();
  const infoVeh = document.getElementById('modo-eliminar-veh-info');
  const infoCond = document.getElementById('modo-eliminar-cond-info');
  if(infoVeh) infoVeh.style.display = 'none';
  if(infoCond) infoCond.style.display = 'none';
  const bar = document.getElementById('delete-bar');
  if(bar) bar.style.display = 'none';
  if(state.view==='vehiculos') renderVehiculosBody();
  if(state.view==='conductores') renderConductoresBody();
}
function actualizarDeleteBar(){
  const bar = document.getElementById('delete-bar');
  const count = document.getElementById('delete-bar-count');
  const btn = document.getElementById('btn-confirmar-eliminar');
  if(!bar || !count || !btn) return;
  const total = state.selVehiculos.size + state.selConductores.size;
  if(state.modoEliminarVeh || state.modoEliminarCond){
    bar.style.display = 'flex'; count.textContent = total; btn.disabled = total === 0;
  } else { bar.style.display = 'none'; }
}
function confirmarEliminacion(){
  if(state.modoEliminarVeh){
    if(!puede('eliminar_vehiculos')){ noPermiso(); return; }
    const ids = Array.from(state.selVehiculos);
    if(!ids.length) return;
    const conViajeActivo = ids.filter(id => {
      const v = vehiculos.find(x => x.id === id);
      if(!v) return false;
      return viajes.some(t => !t.historico && (t.placaTracto === v.placa || t.placaCarreta === v.placa));
    });
    if(conViajeActivo.length > 0){
      const placas = conViajeActivo.map(id => vehiculos.find(x => x.id === id)?.placa).filter(Boolean).join(', ');
      if(!confirm(`⚠️ Los siguientes vehículos tienen viajes activos:\n${placas}\n\n¿Eliminar de todas formas?`)) return;
    } else {
      if(!confirm(`¿Eliminar ${ids.length} vehículo(s)? Esta acción no se puede deshacer.`)) return;
    }
    const eliminados = ids.map(id => vehiculos.find(x => x.id === id)?.placa).filter(Boolean);
    vehiculos = vehiculos.filter(v => !ids.includes(v.id));
    eliminados.forEach(placa => registrarCambio('Vehículos','Eliminar', placa));
    state.selVehiculos.clear(); state.modoEliminarVeh = false;
    document.getElementById('modo-eliminar-veh-info').style.display = 'none';
    guardar(); renderVehiculos(); actualizarDeleteBar();
    toast(`${ids.length} vehículo(s) eliminado(s)`, 'warning');
  } else if(state.modoEliminarCond){
    if(!puede('eliminar_conductores')){ noPermiso(); return; }
    const ids = Array.from(state.selConductores);
    if(!ids.length) return;
    const conViajeActivo = ids.filter(id => {
      const c = conductores.find(x => x.id === id);
      if(!c) return false;
      return viajes.some(t => !t.historico && parseInt(t.conductorId) === c.id);
    });
    if(conViajeActivo.length > 0){
      const nombres = conViajeActivo.map(id => conductores.find(x => x.id === id)?.nombre).filter(Boolean).join(', ');
      alert(`No se puede eliminar: los siguientes conductores tienen viajes activos:\n${nombres}`);
      return;
    }
    if(!confirm(`¿Eliminar ${ids.length} conductor(es)? Esta acción no se puede deshacer.`)) return;
    const eliminados = ids.map(id => conductores.find(x => x.id === id)?.nombre).filter(Boolean);
    conductores = conductores.filter(c => !ids.includes(c.id));
    eliminados.forEach(nombre => registrarCambio('Conductores','Eliminar', nombre));
    state.selConductores.clear(); state.modoEliminarCond = false;
    document.getElementById('modo-eliminar-cond-info').style.display = 'none';
    guardar(); renderConductores(); actualizarDeleteBar();
    toast(`${ids.length} conductor(es) eliminado(s)`, 'warning');
  }
}

let pendingAction = null;
function openModal(title, bodyHTML, footHTML, large){
  $('#modal-title').textContent=title;
  $('#modal-box').classList.toggle('modal-lg', !!large);
  $('#modal-body').innerHTML=bodyHTML;
  if(window.activarBuscables) activarBuscables($('#modal-body'));
  $('#modal-foot').innerHTML=footHTML||`<button class="btn secondary" onclick="closeModal()">Cerrar</button>`;
  $('#modal-backdrop').classList.remove('hidden');
  document.body.style.overflow='hidden';
}
function closeModal(){ $('#modal-backdrop').classList.add('hidden'); document.body.style.overflow=''; pendingAction = null; }
document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

function mostrarAlertaVehiculos(alerts, onContinue){
  if(!alerts || !alerts.length){ if(onContinue) onContinue(); return; }
  pendingAction = onContinue;
  const rows = alerts.map(a => `
    <tr>
      <td><b>${esc(a.placa)}</b></td><td>${esc(a.tipo)}</td><td>${fmtFecha(a.vence)}</td>
      <td><span class="pill ${a.est.cls}">${a.est.txt}</span></td>
      <td style="text-align:right;font-weight:700">${a.est.dias !== null ? (a.est.dias < 0 ? '<span style="color:#B23B3B">'+a.est.dias+'</span>' : a.est.dias) : '—'} días</td>
    </tr>
  `).join('');
  openModal('⚠️ Alerta de vencimiento', `
    <div class="alert danger" style="margin-bottom:16px"><span class="ico">⚠</span><div class="msg"><b>Los siguientes documentos están vencidos o por vencer:</b><div style="margin-top:6px;font-size:12px;opacity:.85">Operar con documentos en esta condición puede acarrear sanciones legales y responsabilidad administrativa.</div></div></div>
    <div class="table-wrap" style="max-height:none;border-radius:8px;border:1px solid #F5C6C6">
      <table class="alert-doc-table"><thead><tr><th>PLACA</th><th>DOCUMENTO</th><th>VENCE</th><th>ESTADO</th><th style="text-align:right">DÍAS</th></tr></thead><tbody>${rows}</tbody></table>
    </div>
    <label class="alert-check-label" for="chk-responsabilidad">
      <input type="checkbox" id="chk-responsabilidad">
      <span>He sido notificado de estos vencimientos, <b>ya avisé al área correspondiente</b> y asumo la responsabilidad de continuar con esta operación.</span>
    </label>
  `, `
    <button class="btn secondary" onclick="closeModal()">Cancelar operación</button>
    <button class="btn danger" id="btn-continuar-alerta" onclick="continuarConAlerta()" disabled>Continuar bajo mi responsabilidad</button>
  `);
  setTimeout(() => {
    const chk = document.getElementById('chk-responsabilidad');
    const btn = document.getElementById('btn-continuar-alerta');
    if(!chk || !btn) return;
    chk.addEventListener('change', () => { btn.disabled = !chk.checked; });
  }, 60);
}
function continuarConAlerta(){
  const action = pendingAction; pendingAction = null; closeModal();
  if(action) action();
}

function renderDonut(items){
  const total=items.reduce((s,i)=>s+i.value,0)||1; let offset=0;
  const circles=items.map(it=>{
    if(it.value===0) return '';
    const pct=(it.value/total)*100;
    const c=`<circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="${it.color}" stroke-width="6" stroke-dasharray="${pct} ${100-pct}" stroke-dashoffset="${-offset}" stroke-linecap="butt"/>`;
    offset+=pct; return c;
  }).join('');
  return `<div class="donut-wrap"><svg viewBox="0 0 42 42" class="donut"><circle cx="21" cy="21" r="15.9155" fill="transparent" stroke="#EDF1F5" stroke-width="6"/>${circles}</svg><div class="donut-center"><div class="donut-total">${total}</div><div class="donut-total-label">Total</div></div></div><div class="donut-legend">${items.map(it=>`<div class="legend-item"><span class="legend-dot" style="background:${it.color}"></span><span class="legend-label">${esc(it.label)}</span><span class="legend-value">${it.value}</span><span class="legend-pct">${total?Math.round(it.value/total*100):0}%</span></div>`).join('')}</div>`;
}
function renderRanking(items, color){
  const max=Math.max(...items.map(x=>x.value),1); const medals=['🥇','🥈','🥉'];
  return `<div class="rank-list">${items.length?items.map((it,i)=>`<div class="rank-row"><div class="rank-pos ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${medals[i]||(i+1)}</div><div class="rank-name" title="${esc(it.label)}">${esc(it.label)}</div><div class="rank-track"><div class="rank-fill" style="width:${Math.max((it.value/max*100),8)}%;background:${color}"></div></div><div class="rank-count">${it.value}</div></div>`).join(''):'<div class="empty">Sin datos</div>'}</div>`;
}

function renderResumen(){
  const activos=viajes.filter(v=>!v.historico);
  const historicos=viajes.filter(v=>v.historico);
  const programados=activos.filter(v=>v.estatus==='PROGRAMADO').length;
  const enRuta=activos.filter(v=>v.estatus==='EN RUTA').length;
  const descargados=activos.filter(v=>v.estatus==='DESCARGADO').length;
  const porTipo=Object.keys(TIPOS_VIAJE).map(k=>({label:TIPOS_VIAJE[k].label,color:TIPOS_VIAJE[k].color,value:viajes.filter(v=>v.tipo===k).length}));
  const porEstado=[
    { label:'Programado', color:'#245B91', value: programados },
    { label:'En ruta',    color:'#E5A13B', value: enRuta },
    { label:'Descargado', color:'#20A477', value: descargados },
    { label:'Histórico',  color:'#7c3aed', value: historicos.length }
  ];
  $('#resumen-charts-1').innerHTML=`
    <div class="dash-card"><h3>🍩 Distribución por tipo de viaje</h3>${renderDonut(porTipo)}</div>
    <div class="dash-card"><h3>🍩 Estado general de la flota</h3>${renderDonut(porEstado)}</div>
  `;
  const cntCond={};
  conductores.forEach(c=>cntCond[c.id]={label:c.nombre,value:0});
  viajes.forEach(v=>{ if(cntCond[v.conductorId]) cntCond[v.conductorId].value++; });
  const rankingCond=Object.values(cntCond).sort((a,b)=>b.value-a.value).slice(0,5);
  const cntCli={};
  viajes.forEach(v=>{ const k=v.cliente||'Sin cliente'; cntCli[k]=(cntCli[k]||0)+1; });
  const rankingCli=Object.entries(cntCli).map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value).slice(0,5);
  $('#resumen-charts-2').innerHTML=`
    <div class="dash-card"><h3>🏆 Top conductores</h3>${renderRanking(rankingCond,'linear-gradient(90deg,#3985C9,#245B91)')}</div>
    <div class="dash-card"><h3>🏆 Top clientes</h3>${renderRanking(rankingCli,'linear-gradient(90deg,#E5A13B,#E88736)')}</div>
  `;
}

