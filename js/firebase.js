/* ===== Firebase: Auth + Firestore =====
   - Login con correo y contraseña (Firebase Auth).
   - Datos en Firestore, colección "flota": un documento por bloque
     (vehiculos, conductores, viajes, cfg). Si un bloque supera ~300 mil
     caracteres se divide en partes (bloque_0, bloque_1…) para no pasar
     el límite de 1 MB por documento. El documento "_meta" indica cuántas partes hay.
   - localStorage sigue funcionando como caché: si no hay conexión al abrir,
     se usan los últimos datos guardados en este navegador.
   - La app (scripts clásicos) se carga recién después de iniciar sesión. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence }
  from "https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, writeBatch }
  from "https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC5mEr6Ufx3XLbW6kY50A7v0_RpMKLM3HY",
  authDomain: "bulltrac-777fb.firebaseapp.com",
  projectId: "bulltrac-777fb",
  storageBucket: "bulltrac-777fb.firebasestorage.app",
  messagingSenderId: "1074138205295",
  appId: "1:1074138205295:web:7a85aef54044431acbd19a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const COL = 'flota';
const BLOQUES = ['vehiculos', 'conductores', 'viajes', 'cfg'];
const PARTE = 300000;          // caracteres por documento (≤ ~900 KB aun con acentos)
const APP_SCRIPTS = ['js/config.js', 'data/datos.js', 'js/core.js', 'js/buscable.js', 'js/vehiculos.js',
  'js/conductores.js', 'js/viajes.js', 'js/historial.js', 'js/configuracion.js', 'js/main.js'];
const MSG_KEY = 'flota_login_msg';

let enviado = {};              // último JSON enviado por bloque (para escribir solo lo que cambió)
let partesActuales = {};       // cuántas partes tiene cada bloque en Firestore
let pendiente = null, timer = null, enCurso = Promise.resolve();
let appCargada = false;
let sinNube = false;            // true si no se pudo leer Firestore al abrir: no se sube nada para no pisar datos de la nube

/* ---------- Lectura ---------- */
async function descargar(){
  const meta = await getDoc(doc(db, COL, '_meta'));
  if(!meta.exists()) return null;           // primera vez: la app usa caché local o datos iniciales y luego sube todo
  const partes = meta.data().partes || {};
  const out = {};
  await Promise.all(BLOQUES.map(async b => {
    const n = partes[b] || 0;
    if(!n) return;
    const snaps = await Promise.all(Array.from({length: n}, (_, i) => getDoc(doc(db, COL, `${b}_${i}`))));
    const json = snaps.map(s => (s.exists() ? s.data().json : '')).join('');
    out[b] = JSON.parse(json);
    enviado[b] = json;
  }));
  partesActuales = partes;
  return out;
}

/* ---------- Escritura (con espera de 800 ms para agrupar cambios) ---------- */
window.fbGuardar = function(datos){
  if(sinNube) return;
  pendiente = datos;
  clearTimeout(timer);
  timer = setTimeout(subir, 800);
};
function subir(){
  clearTimeout(timer);
  if(!pendiente || !auth.currentUser) return enCurso;
  const datos = pendiente; pendiente = null;
  enCurso = enCurso.then(async () => {
    const batch = writeBatch(db);
    const partes = { ...partesActuales };
    let cambios = 0;
    BLOQUES.forEach(b => {
      const json = JSON.stringify(datos[b] ?? null);
      if(json === enviado[b]) return;
      const trozos = [];
      for(let i = 0; i < json.length; i += PARTE) trozos.push(json.slice(i, i + PARTE));
      trozos.forEach((t, i) => batch.set(doc(db, COL, `${b}_${i}`), { json: t }));
      for(let i = trozos.length; i < (partesActuales[b] || 0); i++) batch.delete(doc(db, COL, `${b}_${i}`));
      partes[b] = trozos.length;
      enviado[b] = json;
      cambios++;
    });
    if(!cambios) return;
    batch.set(doc(db, COL, '_meta'), { partes, actualizado: new Date().toISOString(), por: auth.currentUser.email });
    try{
      await batch.commit();
      partesActuales = partes;
    }catch(e){
      console.error('Error guardando en Firestore', e);
      BLOQUES.forEach(b => delete enviado[b]);   // reintentar todo en el próximo guardado
      if(typeof toast === 'function') toast('⚠️ No se pudo guardar en la nube. Se reintentará.', 'danger');
    }
  });
  return enCurso;
}
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden') subir(); });
window.addEventListener('beforeunload', e => { if(pendiente){ subir(); e.preventDefault(); e.returnValue = ''; } });

/* ---------- Sesión ---------- */
window.fbEntrar = async (correo, clave) => {
  await setPersistence(auth, browserSessionPersistence);   // la sesión dura mientras la pestaña esté abierta
  return signInWithEmailAndPassword(auth, correo, clave);
};
window.fbSalir = async (mensaje) => {
  try{ await subir(); }catch(e){}
  try{ if(mensaje) sessionStorage.setItem(MSG_KEY, mensaje); }catch(e){}
  await signOut(auth);
};

function cargarScripts(){
  return APP_SCRIPTS.reduce((p, src) => p.then(() => new Promise((ok, err) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = () => err(new Error('No se pudo cargar ' + src));
    document.body.appendChild(s);
  })), Promise.resolve());
}

onAuthStateChanged(auth, async user => {
  if(!user){
    if(appCargada){ location.reload(); return; }   // al cerrar sesión se reinicia la app limpia
    loginOcupado(false);
    mostrarLogin();
    let msg = null;
    try{ msg = sessionStorage.getItem(MSG_KEY); sessionStorage.removeItem(MSG_KEY); }catch(e){}
    if(msg) errorLogin(msg);
    return;
  }
  if(appCargada) return;
  appCargada = true;
  loginOcupado(true, 'Cargando datos…');
  window.FB_EMAIL = (user.email || '').toLowerCase();
  try{
    window.FB_DATOS = await descargar();
  }catch(e){
    console.error('No se pudieron leer los datos de Firestore', e);
    window.FB_DATOS = null;   // se usa la caché local de este navegador
    sinNube = true;
    setTimeout(() => { if(typeof toast === 'function') toast('⚠️ Sin conexión: mostrando datos de este equipo. Los cambios NO se guardarán en la nube; recarga cuando tengas internet.', 'danger'); }, 500);
  }
  try{
    await cargarScripts();
  }catch(e){
    errorLogin(e.message);
  }
  loginOcupado(false);
});
