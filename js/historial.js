/* ===== HISTORIAL (REGISTRO DE CAMBIOS) ===== */
function renderHistorial(){
  if(!puede('ver_registro')){ $('#historial-content').innerHTML='<div class="empty">⛔ Sin permiso para ver el Historial</div>'; return; }
  const registros = cfg.registro || [];
  const filtro = state.filtroRegistro || {texto:'',modulo:''};
  let filtrados = registros;
  if(filtro.modulo) filtrados = filtrados.filter(r => r.modulo === filtro.modulo);
  if(filtro.texto){
    const t = filtro.texto.toLowerCase();
    filtrados = filtrados.filter(r =>
      (r.usuarioNombre||'').toLowerCase().includes(t) ||
      (r.entidad||'').toLowerCase().includes(t) ||
      (r.accion||'').toLowerCase().includes(t) ||
      (r.campo||'').toLowerCase().includes(t)
    );
  }
  const totalEl = document.getElementById('historial-total');
  if(totalEl) totalEl.textContent = `${filtrados.length} cambio${filtrados.length!==1?'s':''}`;

  const filtrosHTML = `
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">
      <div class="alert info" style="margin:0;flex:1;min-width:200px">
        <span class="ico">📋</span>
        <div class="msg">Historial completo de cambios realizados en el sistema: quién, cuándo y qué se modificó.</div>
      </div>
      <input class="th-filter" style="max-width:240px;font-size:12px;padding:8px 10px" placeholder="Buscar usuario / entidad / acción..." value="${esc(filtro.texto)}" oninput="setFiltroRegistro('texto', this.value)">
      <select class="th-filter" style="max-width:160px;font-size:12px;padding:8px 10px" onchange="setFiltroRegistro('modulo', this.value)">
        <option value="">Todos los módulos</option>
        ${['Viajes','Vehículos','Conductores','Configuración'].map(m=>`<option value="${m}" ${filtro.modulo===m?'selected':''}>${m}</option>`).join('')}
      </select>
    </div>
  `;

  if(!filtrados.length){
    $('#historial-content').innerHTML = filtrosHTML + `<div class="empty" style="padding:30px">No hay cambios registrados${filtro.texto||filtro.modulo?' con esos filtros':''}.</div>`;
    return;
  }

  const tablaHTML = `
    <div style="max-height:calc(100vh - 320px);overflow:auto;border:1px solid var(--border);border-radius:8px">
      <table class="registro-table">
        <thead>
          <tr>
            <th>FECHA</th>
            <th>USUARIO</th>
            <th>MÓDULO</th>
            <th>ACCIÓN</th>
            <th>ENTIDAD</th>
            <th>CAMPO</th>
            <th>VALOR ANTERIOR</th>
            <th>VALOR NUEVO</th>
          </tr>
        </thead>
        <tbody>
          ${filtrados.slice(0,200).map(r => `
            <tr>
              <td style="font-size:11.5px;color:var(--text-sec);white-space:nowrap">${fmtFechaHora(r.fecha)}</td>
              <td><b>${esc(r.usuarioNombre)}</b></td>
              <td><span class="tipo-tag">${esc(r.modulo)}</span></td>
              <td>${esc(r.accion)}</td>
              <td class="registro-celda" title="${esc(r.entidad||'')}">${esc(r.entidad || '—')}</td>
              <td class="registro-celda" title="${esc(r.campo||'')}">${esc(r.campo || '—')}</td>
              <td class="registro-celda" title="${esc(r.valorAnterior||'')}" style="color:var(--critical)">${esc(r.valorAnterior || '—')}</td>
              <td class="registro-celda" title="${esc(r.valorNuevo||'')}" style="color:var(--success);font-weight:600">${esc(r.valorNuevo || '—')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div style="font-size:11px;color:var(--text-sec);margin-top:8px">
      Mostrando ${Math.min(filtrados.length,200)} de ${filtrados.length} registro${filtrados.length!==1?'s':''}
    </div>
  `;
  $('#historial-content').innerHTML = filtrosHTML + tablaHTML;
}

function setFiltroRegistro(campo, valor){
  if(!state.filtroRegistro) state.filtroRegistro = {texto:'',modulo:''};
  state.filtroRegistro[campo] = valor;
  renderHistorial();
}

