import{initializeApp as A}from"https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import{initializeFirestore as F,persistentLocalCache as P,persistentMultipleTabManager as M,doc as D,onSnapshot as O,setDoc as S}from"https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";
const app=A({apiKey:"AIzaSyDNGw6RYdIOFwlFTZyGm1tNNZ5ToS4zq-E",authDomain:"bulltrac-acfb4.firebaseapp.com",projectId:"bulltrac-acfb4",storageBucket:"bulltrac-acfb4.firebasestorage.app",messagingSenderId:"723011892458",appId:"1:723011892458:web:7810898bd04b939968d393"});
let db;
try{db=F(app,{localCache:P({tabManager:M()}),experimentalAutoDetectLongPolling:true})}catch(e){db=F(app,{experimentalAutoDetectLongPolling:true})}
const ref=D(db,"control_vehicular","datos"),yo=Math.random().toString(36).slice(2);
let listo=false,ultimo="",colaW=Promise.resolve(),colaR=Promise.resolve();
window.NUBE={get listo(){return listo},subir(d){
  if(!listo)return Promise.resolve();
  const j=JSON.stringify(d);
  if(j===ultimo)return Promise.resolve();
  ultimo=j;
  colaW=colaW.then(async()=>{
    try{await S(ref,{datos:await window.__enc(j),actualizado:Date.now(),cliente:yo})}
    catch(e){ultimo="";window.nubeError&&window.nubeError(e)}
  });
  return colaW;
}};
O(ref,s=>{
  if(s.metadata.hasPendingWrites)return;
  const primera=!listo;listo=true;
  if(!s.exists()){
    if(!s.metadata.fromCache)window.nubeVacia&&window.nubeVacia();
    return;
  }
  const x=s.data();
  if(x.cliente===yo&&!primera)return;
  colaR=colaR.then(async()=>{
    try{
      const j=await window.__dec(x.datos);
      if(j===ultimo)return;
      ultimo=j;
      window.nubeAplicarRemoto&&window.nubeAplicarRemoto(JSON.parse(j));
    }catch(e){console.warn("Datos remotos inválidos",e)}
  });
},e=>{listo=true;window.nubeError&&window.nubeError(e)});
