/* ===== Listas desplegables con búsqueda (combobox) =====
   Convierte cualquier <select> de un modal en un cuadro donde se puede
   escribir para filtrar o desplegar la lista. El <select> original se
   mantiene oculto, así el resto del sistema sigue funcionando igual. */
(function(){
  const norm = t => (t || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const nativoValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  let abierto = null;   // combobox con la lista abierta

  function crear(sel){
    if(sel.dataset.buscable) return;
    sel.dataset.buscable = '1';

    const wrap = document.createElement('div');
    wrap.className = 'cbx';
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = 'cbx-input'; inp.autocomplete = 'off'; inp.spellcheck = false;
    const flecha = document.createElement('span');
    flecha.className = 'cbx-arrow'; flecha.textContent = '▾';
    const lista = document.createElement('div');
    lista.className = 'cbx-list hidden';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.append(inp, flecha, sel, lista);
    sel.classList.add('cbx-native');
    sel.tabIndex = -1;

    let activo = -1, items = [];

    const textoSel = () => { const o = sel.options[sel.selectedIndex]; return o && o.value !== '' ? o.text : ''; };
    const placeholder = () => { const o = [...sel.options].find(x => x.value === ''); return o ? o.text : 'Buscar...'; };
    function sync(){
      inp.value = textoSel();
      inp.placeholder = placeholder();
      inp.disabled = sel.disabled;
      wrap.classList.toggle('cbx-off', sel.disabled);
      inp.classList.toggle('error', sel.classList.contains('error'));
    }

    function pintar(filtro){
      const f = norm(filtro);
      items = [...sel.options].filter(o => (f ? (o.value !== '' && norm(o.text).includes(f)) : true));
      activo = items.findIndex(o => o.value === sel.value && o.value !== '');
      if(activo < 0) activo = items.findIndex(o => !o.disabled && o.value !== '');
      lista.innerHTML = items.length ? '' : '<div class="cbx-empty">Sin resultados</div>';
      items.forEach((o, i) => {
        const d = document.createElement('div');
        d.className = 'cbx-item' + (o.disabled ? ' cbx-dis' : '') + (o.value === sel.value && o.value !== '' ? ' cbx-sel' : '') + (o.value === '' ? ' cbx-ph' : '') + (i === activo ? ' cbx-act' : '');
        d.textContent = o.text;
        d.addEventListener('mousedown', e => { e.preventDefault(); if(!o.disabled) elegir(o); });
        lista.appendChild(d);
      });
    }

    function posicionar(){
      const r = inp.getBoundingClientRect();
      const abajo = window.innerHeight - r.bottom, alto = Math.min(240, lista.scrollHeight || 240);
      lista.style.left = r.left + 'px'; lista.style.width = r.width + 'px';
      if(abajo < alto + 12 && r.top > abajo){ lista.style.top = 'auto'; lista.style.bottom = (window.innerHeight - r.top + 4) + 'px'; }
      else { lista.style.bottom = 'auto'; lista.style.top = (r.bottom + 4) + 'px'; }
    }

    function abrir(filtrar){
      if(sel.disabled) return;
      if(abierto && abierto !== api) abierto.cerrar();
      abierto = api;
      pintar(filtrar ? inp.value : '');
      lista.classList.remove('hidden');
      posicionar();
      const a = lista.querySelector('.cbx-act'); if(a) a.scrollIntoView({block:'nearest'});
    }
    function cerrar(){
      lista.classList.add('hidden');
      if(abierto === api) abierto = null;
      // si lo escrito coincide exactamente con una opción, elegirla; si no, volver al valor actual
      const exacta = [...sel.options].find(o => o.value !== '' && !o.disabled && norm(o.text) === norm(inp.value));
      if(exacta && exacta.value !== sel.value) elegir(exacta, true);
      else if(inp.value.trim() === '' && sel.value !== '' && document.activeElement !== inp) { /* se mantiene */ }
      sync();
    }
    function elegir(o, sinCerrar){
      sel.value = o.value;
      sel.dispatchEvent(new Event('change', {bubbles:true}));
      sync();
      if(!sinCerrar){ lista.classList.add('hidden'); if(abierto === api) abierto = null; inp.blur(); }
    }
    function mover(d){
      const val = items.map((o, i) => i).filter(i => !items[i].disabled);
      if(!val.length) return;
      let p = val.indexOf(activo); p = p < 0 ? 0 : Math.max(0, Math.min(val.length - 1, p + d));
      activo = val[p];
      [...lista.children].forEach((c, i) => c.classList.toggle('cbx-act', i === activo));
      const a = lista.children[activo]; if(a && a.scrollIntoView) a.scrollIntoView({block:'nearest'});
    }

    inp.addEventListener('focus', () => { inp.select(); abrir(false); });
    inp.addEventListener('click', () => { if(lista.classList.contains('hidden')) abrir(false); });
    inp.addEventListener('input', () => { abrir(true); if(inp.value.trim() === '' && sel.value !== ''){ /* permite borrar para buscar otro */ } });
    inp.addEventListener('blur', cerrar);
    inp.addEventListener('keydown', e => {
      if(e.key === 'ArrowDown'){ e.preventDefault(); if(lista.classList.contains('hidden')) abrir(false); else mover(1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); mover(-1); }
      else if(e.key === 'Enter'){ if(!lista.classList.contains('hidden')){ e.preventDefault(); const o = items[activo]; if(o && !o.disabled) elegir(o); } }
      else if(e.key === 'Escape'){ if(!lista.classList.contains('hidden')){ e.stopPropagation(); sync(); lista.classList.add('hidden'); abierto = null; } }
    });
    flecha.addEventListener('mousedown', e => { e.preventDefault(); if(lista.classList.contains('hidden')){ inp.focus(); } else { inp.blur(); } });

    // Sincronizar cuando el código cambia el valor, las opciones o el estado del <select>
    Object.defineProperty(sel, 'value', { get(){ return nativoValue.get.call(sel); }, set(v){ nativoValue.set.call(sel, v); sync(); }, configurable: true });
    new MutationObserver(sync).observe(sel, {childList:true, subtree:true, attributes:true, attributeFilter:['disabled','class']});

    const api = { cerrar, posicionar, lista };
    sync();
  }

  window.activarBuscables = function(root){
    (root || document).querySelectorAll('select:not([data-buscable]):not(.th-filter):not([data-nobuscar])').forEach(crear);
  };
  const reubicar = () => { if(abierto) abierto.posicionar(); };
  window.addEventListener('resize', reubicar);
  document.addEventListener('scroll', reubicar, true);
})();
