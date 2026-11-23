const LS_KEY = 'flota_erp_v29';

const ROLES = {
  admin:  { name:'Administrador', icon:'👑', avatar:'AD', cls:'role-admin',  color:'#B8860B' },
  editor: { name:'Editor GRR/GRT', icon:'✏️', avatar:'ED', cls:'role-editor', color:'#7c3aed' },
  viewer: { name:'Visor', icon:'👁', avatar:'VI', cls:'role-viewer', color:'#64748B' },
  personalizado: { name:'Personalizado', icon:'⚙️', avatar:'PE', cls:'role-personalizado', color:'#0D9488' }
};

const PERMISOS_LIST = [
  { k:'ver_resumen', label:'Ver Resumen', group:'Vistas' },
  { k:'ver_viajes', label:'Ver Viajes', group:'Vistas' },
  { k:'ver_historico', label:'Ver Histórico', group:'Vistas' },
  { k:'ver_vehiculos', label:'Ver Vehículos', group:'Vistas' },
  { k:'ver_conductores', label:'Ver Conductores', group:'Vistas' },
  { k:'crear_viajes', label:'Crear / editar viajes', group:'Viajes' },
  { k:'editar_grr_grt', label:'Editar GRR / GRT', group:'Viajes' },
  { k:'cambiar_estatus', label:'Cambiar estatus de viaje', group:'Viajes' },
  { k:'terminar_viajes', label:'Terminar viajes (enviar al histórico)', group:'Viajes' },
  { k:'aplicar_apoyo', label:'Aplicar apoyo / adicional', group:'Viajes' },
  { k:'editar_vehiculos', label:'Crear / editar vehículos', group:'Vehículos' },
  { k:'actualizar_docs_vehiculos', label:'Actualizar documentos de vehículos', group:'Vehículos' },
  { k:'eliminar_vehiculos', label:'Eliminar vehículos', group:'Vehículos' },
  { k:'editar_conductores', label:'Crear / editar conductores', group:'Conductores' },
  { k:'actualizar_licencias_conductores', label:'Actualizar licencias de conductores', group:'Conductores' },
  { k:'eliminar_conductores', label:'Eliminar conductores', group:'Conductores' },
  { k:'config_catalogos', label:'Configurar catálogos (rutas / materiales / clientes)', group:'Configuración' },
  { k:'config_tipos', label:'Configurar tipos de viaje', group:'Configuración' },
  { k:'config_alertas', label:'Configurar umbrales de alerta', group:'Configuración' },
  { k:'gestionar_usuarios', label:'Gestionar usuarios y permisos', group:'Configuración' },
  { k:'ver_registro', label:'Ver registro de cambios (auditoría)', group:'Sistema' },
];

const PERMISOS_PRESET = {
  admin: Object.fromEntries(PERMISOS_LIST.map(p=>[p.k, true])),
  editor: {
    ver_resumen:true, ver_viajes:true, ver_historico:true, ver_vehiculos:true, ver_conductores:true,
    editar_grr_grt:true,
  },
  viewer: {
    ver_resumen:true, ver_viajes:true, ver_historico:true, ver_vehiculos:true, ver_conductores:true,
  },
  personalizado: {}
};

const PERMISOS_OPERADOR = {
  ver_resumen:true, ver_viajes:true, ver_historico:true,
  ver_vehiculos:true, ver_conductores:true,
  crear_viajes:true, editar_grr_grt:true, cambiar_estatus:true,
  terminar_viajes:true, aplicar_apoyo:true
};

const CAMPOS_VIAJE_LABELS = {
  tipo:'Tipo', conductorId:'Conductor', numero:'N°', unidad:'Unidad',
  placaTracto:'Tracto', placaCarreta:'Carreta', tipoCarreta:'Tipo carreta',
  ruta:'Ruta', cliente:'Cliente', material:'Material'
};
const CAMPOS_VEHICULO_LABELS = {
  placa:'Placa', tipo:'Tipo', propietario:'Propietario', iv:'IV',
  contrato:'Contrato', vencimiento:'Vencimiento', titulo:'Título',
  ruta:'Ruta habitual', marca:'Marca', modelo:'Modelo', fabr:'Año',
  color:'Color', motor:'Motor', vin:'VIN', ejes:'Ejes', ruedas:'Ruedas',
  configuracion:'Configuración', cilindros:'Cilindros', pBruto:'Peso bruto',
  pNeto:'Peso neto', cargaU:'Carga útil', longitud:'Longitud',
  altura:'Altura', ancho:'Ancho'
};

const ALERTAS_DEFAULT = {
  mtc: 14, mtcMatpel: 75, rdMatpel: 75, soat: 15, rtv12: 10, rtv6: 10,
  poliza: 15, bonificacion: 10, iqbf: 30, chip: 15, cilindros: 45, leasing: 30
};
const UMBRALES_LABELS = {
  mtc:'MTC', mtcMatpel:'MTC MATPEL', rdMatpel:'RD MATPEL', soat:'SOAT',
  rtv12:'RTV 12 meses', rtv6:'RTV 6 meses', poliza:'Póliza', bonificacion:'Bonificación',
  iqbf:'IQBF', chip:'Chip cilindros', cilindros:'Inspección cilindros', leasing:'Contrato leasing'
};
const UNIDADES_CARGA = ['Toneladas','Bolsa','Fijo'];

const state = {
  view:'resumen', tipoViaje:'general', search:'', filtroMesHistorico:null,
  usuarioActualId: null,
  selVehiculos: new Set(), selConductores: new Set(),
  modoEliminarVeh: false, modoEliminarCond: false,
  configOpen:{rutas:true,materiales:false,clientes:false,tipos:false,alertas:false,usuarios:false},
  filtroRegistro:{texto:'',modulo:''},
  filtrosVehiculo:{placa:'',propietario:'',tipo:'',leasing:'',cilindros:'',mtc:'',mtcMatpel:'',rdMatpel:'',soat:'',rtv12:'',rtv6:'',poliza:'',bonificacion:'',iqbf:'',chip:''},
  filtrosConductores:{nombre:'',dni:'',licencia:'',dniVigencia:'',placaTracto:'',placaCarreta:'',a3:'',a4:''}
};

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function fecha(dias){ const d=new Date(); d.setDate(d.getDate()+dias); return d.toISOString().slice(0,10); }
function hoyISO(){ return new Date().toISOString().slice(0,10); }
function fmtFecha(f){ if(!f) return '—'; const p=String(f).split('-'); if(p.length!==3) return f; return `${p[2]}/${p[1]}/${p[0]}`; }
function fmtFechaHora(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  if(isNaN(d.getTime())) return iso;
  const dia=String(d.getDate()).padStart(2,'0'), mes=String(d.getMonth()+1).padStart(2,'0'), anio=d.getFullYear();
  const hh=String(d.getHours()).padStart(2,'0'), mm=String(d.getMinutes()).padStart(2,'0'), ss=String(d.getSeconds()).padStart(2,'0');
  return `${dia}/${mes}/${anio} ${hh}:${mm}:${ss}`;
}
function mesLabel(ym){ const [y,m]=ym.split('-'); const meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; return `${meses[parseInt(m)-1]} ${y}`; }

function nombreCorto(nombre){
  if(!nombre) return '';
  const parts = String(nombre).trim().split(/\s+/);
  if(parts.length >= 4) return parts[0] + ' ' + parts[2];
  if(parts.length === 3) return parts[0] + ' ' + parts[1];
  if(parts.length === 2) return parts[0] + ' ' + parts[1];
  return parts[0];
}

function estado(fechaStr, umbralDias){
  const umbral = (typeof umbralDias === 'number' && umbralDias >= 0) ? umbralDias : 30;
  if(!fechaStr) return { cls:'nd', txt:'SIN DATO', short:'S/D', dias:null };
  const f=new Date(fechaStr+'T00:00:00');
  if(isNaN(f.getTime())) return { cls:'nd', txt:'SIN DATO', short:'S/D', dias:null };
  const hoy=new Date(); hoy.setHours(0,0,0,0);
  const dias=Math.round((f-hoy)/86400000);
  if(dias<0) return { cls:'vencido', txt:'VENCIDO', short:'VENC', dias };
  if(dias<=umbral) return { cls:'porvencer', txt:'POR VENCER', short:'X VENC', dias };
  return { cls:'activo', txt:'ACTIVO', short:'ACT', dias };
}
function getUmbral(key){
  const v = cfg.alertas && cfg.alertas[key];
  return (typeof v === 'number' && v >= 0) ? v : (ALERTAS_DEFAULT[key] || 30);
}
function estadoPorDoc(v, docKey){ const doc=v.docs&&v.docs[docKey]; if(!doc) return estado(null); return estado(doc.vence, getUmbral(docKey)); }
function estadoLeasing(v){ return estado(v.vencimiento, getUmbral('leasing')); }
function estadoChip(v){ const chip=v.docs&&v.docs.chip; if(!chip) return estado(null); return estado(chip.vence, getUmbral('chip')); }
function estadoCilindros(v){ const cil=v.docs&&v.docs.cilindros; if(!cil) return estado(null); return estado(cil.vence, getUmbral('cilindros')); }
function esLeasing(propietario){ return /banco|leasing|financiera|financiamiento|credit/i.test(propietario||''); }

function conductorApto(c){
  if(!c) return { apto:false, motivo:'Sin datos' };
  if(!c.dni || !/^\d{8}$/.test(c.dni)) return { apto:false, motivo:'DNI inválido' };
  const problemas = [];
  if(estado(c.dniVigencia).cls === 'vencido') problemas.push('DNI');
  if(estado(c.a3).cls === 'vencido') problemas.push('A3');
  if(estado(c.a4).cls === 'vencido') problemas.push('A4');
  if(problemas.length) return { apto:false, motivo:'Vencido: ' + problemas.join(', ') };
  return { apto:true, motivo:'' };
}

function getUsuarioActual(){
  return cfg.usuarios.find(u=>u.id===state.usuarioActualId);
}
function puede(permiso){
  const u = getUsuarioActual();
  return !!(u && u.permisos && u.permisos[permiso]);
}
function noPermiso(msg){ toast(msg||'⛔ No tienes permiso para esta acción','danger'); }
function tieneAccesoConfig(){
  return puede('config_catalogos') || puede('config_tipos') || puede('config_alertas') || puede('gestionar_usuarios');
}

function toast(msg, type='success'){
  const c=$('#toast-container'); const el=document.createElement('div');
  el.className='toast '+type; el.textContent=msg; c.appendChild(el);
  setTimeout(()=>{ el.style.animation='slideOut .22s ease-in forwards'; setTimeout(()=>el.remove(),220); },3200);
}
function toggleSidebar(){ $('#sidebar').classList.toggle('open'); }

function registrarCambio(modulo, accion, entidad, campo, valorAnterior, valorNuevo, detalle){
  if(!Array.isArray(cfg.registro)) cfg.registro = [];
  const u = getUsuarioActual();
  cfg.registro.unshift({
    id: 'r' + Date.now() + Math.random().toString(36).slice(2,6),
    fecha: new Date().toISOString(),
    usuarioId: u ? u.id : 'sistema',
    usuarioNombre: u ? u.nombre : 'Sistema',
    modulo, accion,
    entidad: entidad || '',
    campo: campo || '',
    valorAnterior: valorAnterior == null ? '' : String(valorAnterior),
    valorNuevo: valorNuevo == null ? '' : String(valorNuevo),
    detalle: detalle || ''
  });
  if(cfg.registro.length > 1000) cfg.registro.length = 1000;
}

function conductoresEnRuta(excludeViajeId=null){
  const ids=new Set();
  viajes.forEach(v=>{
    if(v.historico) return;
    if(excludeViajeId && v.id===excludeViajeId) return;
    if(v.estatus==='EN RUTA' && v.conductorId) ids.add(parseInt(v.conductorId));
  });
  return ids;
}
function tieneChip(v){ return v.docs && v.docs.chip && (v.docs.chip.numero || v.docs.chip.vence); }
function tieneCilindros(v){ return v.docs && v.docs.cilindros && (v.docs.cilindros.numero || v.docs.cilindros.vence); }

function getAlertasVehiculo(vehiculo){
  if(!vehiculo) return [];
  const alerts = [];
  if(esLeasing(vehiculo.propietario) && vehiculo.vencimiento){
    const e = estadoLeasing(vehiculo);
    if(e.cls === 'vencido' || e.cls === 'porvencer') alerts.push({ placa: vehiculo.placa, tipo: 'LEASING', vence: vehiculo.vencimiento, est: e });
  }
  DOCS.forEach(d => {
    const doc = vehiculo.docs && vehiculo.docs[d.k];
    if(doc && doc.vence){
      const e = estadoPorDoc(vehiculo, d.k);
      if(e.cls === 'vencido' || e.cls === 'porvencer') alerts.push({ placa: vehiculo.placa, tipo: d.label, vence: doc.vence, est: e });
    }
  });
  const cil = vehiculo.docs && vehiculo.docs.cilindros;
  if(cil && cil.vence){
    const e = estadoCilindros(vehiculo);
    if(e.cls === 'vencido' || e.cls === 'porvencer') alerts.push({ placa: vehiculo.placa, tipo: 'CILINDROS', vence: cil.vence, est: e });
  }
  return alerts;
}

const DOCS = [
  { k:'mtc', label:'MTC' },{ k:'mtcMatpel', label:'MTC MATPEL' },
  { k:'rdMatpel', label:'RD MATPEL' },{ k:'soat', label:'SOAT' },
  { k:'rtv12', label:'RTV 12 M' },{ k:'rtv6', label:'RTV 6 M' },
  { k:'poliza', label:'PÓLIZA' },{ k:'bonificacion', label:'BONIF.' },
  { k:'iqbf', label:'IQBF' },{ k:'chip', label:'CHIP' }
];

const TIPOS_VIAJE = {
  general:   { label:'Generales',   lic:'a3',  licNombre:'A3',          color:'#245B91' },
  peligroso: { label:'Peligrosos',  lic:'a4',  licNombre:'A4 + MATPEL', color:'#E88736' },
  iqf:       { label:'IQF',         lic:'iqf', licNombre:'IQF',         color:'#7c3aed' },
  bombonas:  { label:'Bombonas',    lic:'a4',  licNombre:'A4 + MATPEL', color:'#20A477' }
};

const CFG_DEFAULT = {
  rutas: ['TRUJILLO-CALLAO','CHICAMA-CALLAO','LIMA-TRUJILLO','ATE-TRUJILLO','HUACHIPA-TRUJILLO','PIURA - TARAPOTO','SULLANA - TRUJILLO'],
  materiales: ['Arena gruesa','Arena fina','Piedra chancada','Cemento','Fierro de construcción','Combustible - Diésel','GLP - Gas licuado','Bombonas de gas','Productos químicos','Contenedor','Carga seca','Materiales peligrosos','Otros'],
  clientes: ['BACKUS','ALICORP','REPSOL','DREAMS','MINERA SUR ANDINA'],
  tiposLabels: {
    general:   { label:'Generales',   color:'#245B91' },
    peligroso: { label:'Peligrosos',  color:'#E88736' },
    iqf:       { label:'IQF',         color:'#7c3aed' },
    bombonas:  { label:'Bombonas',    color:'#20A477' }
  },
  alertas: JSON.parse(JSON.stringify(ALERTAS_DEFAULT)),
  registro: [],
  usuarios: [
    { id:'u-admin', nombre:'Administrador', rol:'admin', activo:true, permisos: Object.fromEntries(PERMISOS_LIST.map(p=>[p.k, true])) }
  ]
};

const ESTATUS_VIAJE_MANUAL = ['EN RUTA','DESCARGADO'];
