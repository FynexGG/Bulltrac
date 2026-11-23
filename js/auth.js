/* ===== Inicio de sesión (Firebase Auth) =====
   La contraseña la valida Firebase. Los roles y permisos siguen en cfg.usuarios,
   emparejados por usuario (en Firebase la cuenta es usuario@bulltrac.app). Ver js/firebase.js */

function mostrarLogin(){
  document.getElementById('login-screen').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const u = document.getElementById('login-user'); if(u) u.focus(); }, 60);
}
function ocultarLogin(){
  document.getElementById('login-screen').classList.add('hidden');
  document.body.style.overflow = '';
}
function verClave(){
  const i = document.getElementById('login-pass');
  i.type = i.type === 'password' ? 'text' : 'password';
}
function errorLogin(msg){
  const e = document.getElementById('login-error');
  e.textContent = msg; e.classList.remove('hidden');
  const c = document.querySelector('.login-card');
  c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
}
function loginOcupado(si, texto){
  const b = document.querySelector('.login-btn');
  if(!b) return;
  b.disabled = si;
  b.textContent = si ? (texto || 'Ingresando…') : 'Iniciar sesión';
}

/* Usuario → correo para Firebase: "jperez" se convierte en "jperez@bulltrac.app" */
const DOMINIO_USUARIOS = '@bulltrac.app';
function usuarioAEmail(u){ u = (u || '').trim().toLowerCase(); return u.includes('@') ? u : u + DOMINIO_USUARIOS; }

/* Se llama desde main.js cuando la app ya cargó. Devuelve false si el correo no tiene acceso. */
function restaurarSesion(){
  const email = (window.FB_EMAIL || '').toLowerCase();
  const u = cfg.usuarios.find(x => x.usuario && usuarioAEmail(x.usuario) === email);
  if(!u || !u.activo){
    const msg = !u ? `El usuario ${email.replace(DOMINIO_USUARIOS, '')} no está registrado en Configuración › Usuarios.`
                   : 'Este usuario está inactivo. Contacta al administrador.';
    if(window.fbSalir) window.fbSalir(msg);
    return false;
  }
  state.usuarioActualId = u.id;
  ocultarLogin();
  return true;
}

async function iniciarSesion(ev){
  ev.preventDefault();
  const usuario = document.getElementById('login-user').value.trim().toLowerCase();
  const clave = document.getElementById('login-pass').value;
  if(!usuario || !clave) return errorLogin('Ingresa tu usuario y contraseña.');
  if(!window.fbEntrar) return errorLogin('Conectando con el servidor, intenta de nuevo en unos segundos.');
  document.getElementById('login-error').classList.add('hidden');
  loginOcupado(true);
  try{
    await window.fbEntrar(usuarioAEmail(usuario), clave);
    document.getElementById('login-pass').value = '';
    loginOcupado(true, 'Cargando datos…');
  }catch(e){
    loginOcupado(false);
    const c = e && e.code || '';
    if(c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found') || c.includes('invalid-email'))
      errorLogin('Usuario o contraseña incorrectos.');
    else if(c.includes('too-many-requests')) errorLogin('Demasiados intentos. Espera unos minutos.');
    else if(c.includes('network')) errorLogin('Sin conexión a internet.');
    else if(c.includes('user-disabled')) errorLogin('Esta cuenta está deshabilitada.');
    else errorLogin('No se pudo iniciar sesión (' + (c || e.message) + ').');
  }
}
function cerrarSesion(){
  if(typeof closeModal === 'function') closeModal();
  if(window.fbSalir) window.fbSalir();
}
