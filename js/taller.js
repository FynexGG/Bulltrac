/* ================================================================
   TALLER · Equipos entregados a conductores + Mano de obra
   Integrado al sistema Control Vehicular (misma nube y diseño)
   ================================================================ */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const toast = (m, t) => (window.__toast ? window.__toast(m, t) : alert(m));
  const subir = () => window.__subir && window.__subir();
  const leer = (k) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } };
  const grabar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  /* ---------- Confirmación con el modal del sistema ---------- */
  let confirmCb = null;
  function confirmar(titulo, html, textoBtn, cb) {
    $("tConfTitle").textContent = titulo;
    $("tConfBody").innerHTML = html;
    $("tConfOk").textContent = textoBtn || "🗑 Eliminar";
    confirmCb = cb;
    $("tModalConfirm").classList.add("show");
  }
  const cerrarConf = () => { $("tModalConfirm").classList.remove("show"); confirmCb = null; };

  /* ================================================================
     1) EQUIPOS ENTREGADOS A CONDUCTORES
     ================================================================ */
  const EQ_KEY = "cv_equipos_v1", EQ_LEGACY = "control-conductores-v1";
  const EQ_DEFECTO = ["Mallas Plásticos", "Soga", "Carpa", "Palos", "Tripley"];
  const nid = () => "it_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const eqVacio = () => ({ items: EQ_DEFECTO.map((n) => ({ id: nid(), name: n })), rows: [{ conductor: "", tracto: "", carreta: "", vals: {} }] });
  let eq = leer(EQ_KEY) || leer(EQ_LEGACY) || eqVacio();
  if (!Array.isArray(eq.items)) eq = eqVacio();
  if (!Array.isArray(eq.rows)) eq.rows = [];
  let eqFiltro = "";

  let tEq = null;
  function eqGuardar(inmediato) {
    clearTimeout(tEq);
    const f = () => { grabar(EQ_KEY, eq); subir(); };
    inmediato ? f() : (tEq = setTimeout(f, 500));
  }

  function eqKpis() {
    let marcados = 0, unidades = 0, completos = 0;
    eq.rows.forEach((r) => {
      let todos = eq.items.length > 0;
      eq.items.forEach((it) => {
        const v = r.vals && r.vals[it.id];
        if (v && v.chk) { marcados++; unidades += parseFloat(v.num) || 0; } else todos = false;
      });
      if (todos) completos++;
    });
    $("eqKpis").innerHTML = [
      ["👤", eq.rows.length, "Conductores", "#2563eb"],
      ["🧰", eq.items.length, "Elementos", "#6366f1"],
      ["✅", marcados, "Entregas marcadas", "#16a34a"],
      ["📦", unidades, "Unidades entregadas", "#f59e0b"],
      ["🏁", completos, "Con kit completo", "#0ea5e9"],
    ].map(([i, v, l, c]) => `<div class="kpi" style="--c:${c}"><div class="val">${v}</div><div class="lbl">${i} ${l}</div></div>`).join("");
    const b = $("badgeEquipos"); if (b) b.textContent = eq.rows.length;
  }

  function eqRender() {
    const head = `<tr><th class="t-idx">#</th><th>Conductor</th><th>Placa tracto</th><th>Placa carreta</th>${eq.items.map((it) => `<th class="t-item"><span>${esc(it.name)}</span><button class="t-delcol" data-delcol="${it.id}" title="Eliminar columna">✕</button></th>`).join("")}<th class="t-acc">Acción</th></tr>`;
    const q = eqFiltro.trim().toUpperCase();
    let body = "", vis = 0;
    eq.rows.forEach((r, i) => {
      const txt = (r.conductor + " " + r.tracto + " " + r.carreta).toUpperCase();
      if (q && !txt.includes(q)) return;
      vis++;
      body += `<tr data-i="${i}"><td class="t-idx">${i + 1}</td>
        <td><input class="t-in" data-f="conductor" value="${esc(r.conductor)}" placeholder="Nombre del conductor"></td>
        <td><input class="t-in t-up" data-f="tracto" value="${esc(r.tracto)}" placeholder="Placa tracto"></td>
        <td><input class="t-in t-up" data-f="carreta" value="${esc(r.carreta)}" placeholder="Placa carreta"></td>
        ${eq.items.map((it) => { const v = (r.vals && r.vals[it.id]) || {}; return `<td class="t-item"><label class="t-chk"><input type="checkbox" data-chk="${it.id}" ${v.chk ? "checked" : ""}><span></span></label><input type="number" min="0" class="t-num" data-num="${it.id}" value="${v.chk ? esc(v.num ?? "") : ""}" placeholder="0" ${v.chk ? "" : "disabled"}></td>`; }).join("")}
        <td class="t-acc"><button class="t-delrow" data-delrow="${i}" title="Eliminar fila">🗑</button></td></tr>`;
    });
    if (!vis) body = `<tr><td colspan="${5 + eq.items.length}" class="t-empty">${q ? "Sin resultados para la búsqueda." : "Sin conductores registrados. Usa “+ Agregar conductor”."}</td></tr>`;
    $("eqHead").innerHTML = head;
    $("eqBody").innerHTML = body;
    $("eqSub").innerHTML = `<b>${eq.rows.length}</b> conductores · <b>${eq.items.length}</b> elementos`;
    eqKpis();
  }

  function eqInit() {
    $("eqBuscar").addEventListener("input", (e) => { eqFiltro = e.target.value; eqRender(); });
    $("eqAddRow").addEventListener("click", () => {
      eq.rows.push({ conductor: "", tracto: "", carreta: "", vals: {} });
      eqFiltro = ""; $("eqBuscar").value = "";
      eqRender(); eqGuardar();
      const ins = $("eqBody").querySelectorAll('input[data-f="conductor"]');
      ins.length && ins[ins.length - 1].focus();
    });
    $("eqAddCol").addEventListener("click", () => {
      $("eqColNombre").value = "";
      $("tModalCol").classList.add("show");
      setTimeout(() => $("eqColNombre").focus(), 60);
    });
    const agregarCol = () => {
      const n = $("eqColNombre").value.trim();
      if (!n) { toast("Debes escribir un nombre", "error"); $("eqColNombre").focus(); return; }
      eq.items.push({ id: nid(), name: n });
      $("tModalCol").classList.remove("show");
      eqRender(); eqGuardar(true);
      toast("Columna agregada: " + n, "info");
    };
    $("eqColOk").addEventListener("click", agregarCol);
    $("eqColNombre").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); agregarCol(); } });
    $("eqGuardar").addEventListener("click", () => { eqGuardar(true); toast("Datos guardados ✔"); });
    $("eqCsv").addEventListener("click", eqCSV);
    $("eqPrint").addEventListener("click", () => {
      document.body.classList.add("print-eq");
      setTimeout(() => { window.print(); document.body.classList.remove("print-eq"); }, 50);
    });
    $("eqClear").addEventListener("click", () => confirmar("🗑 Limpiar todo", "¿Borrar <b>TODOS</b> los conductores, columnas y registros de equipos?<br><br>Esta acción no se puede deshacer.", "🗑 Borrar todo", () => {
      eq = eqVacio(); eqRender(); eqGuardar(true); toast("Todo borrado", "error");
    }));

    const tb = $("eqTabla");
    tb.addEventListener("input", (e) => {
      const t = e.target, tr = t.closest("tr[data-i]"); if (!tr) return;
      const r = eq.rows[+tr.dataset.i]; if (!r) return;
      if (t.dataset.f) { r[t.dataset.f] = t.classList.contains("t-up") ? t.value.toUpperCase() : t.value; if (t.classList.contains("t-up")) { const p = t.selectionStart; t.value = t.value.toUpperCase(); t.setSelectionRange(p, p); } }
      else if (t.dataset.num) { r.vals = r.vals || {}; (r.vals[t.dataset.num] = r.vals[t.dataset.num] || { chk: true }).num = t.value; eqKpis(); }
      eqGuardar();
    });
    tb.addEventListener("change", (e) => {
      const t = e.target; if (!t.dataset.chk) return;
      const tr = t.closest("tr[data-i]"), r = eq.rows[+tr.dataset.i];
      r.vals = r.vals || {};
      const num = tr.querySelector(`input[data-num="${t.dataset.chk}"]`);
      r.vals[t.dataset.chk] = { chk: t.checked, num: t.checked ? num.value : "" };
      num.disabled = !t.checked;
      if (t.checked) { num.focus(); num.select(); } else num.value = "";
      eqKpis(); eqGuardar();
    });
    tb.addEventListener("click", (e) => {
      const dr = e.target.closest("[data-delrow]"), dc = e.target.closest("[data-delcol]");
      if (dr) {
        const i = +dr.dataset.delrow, r = eq.rows[i];
        confirmar("🗑 Eliminar fila", `¿Eliminar la fila <b>#${i + 1}</b>${r.conductor ? " de <b>" + esc(r.conductor) + "</b>" : ""}?`, "🗑 Eliminar", () => {
          eq.rows.splice(i, 1); eqRender(); eqGuardar(true); toast("Fila eliminada", "warn");
        });
      } else if (dc) {
        const it = eq.items.find((x) => x.id === dc.dataset.delcol); if (!it) return;
        confirmar("🗑 Eliminar columna", `¿Eliminar la columna <b>${esc(it.name)}</b> de todos los conductores?`, "🗑 Eliminar", () => {
          eq.items = eq.items.filter((x) => x.id !== it.id);
          eq.rows.forEach((r) => r.vals && delete r.vals[it.id]);
          eqRender(); eqGuardar(true); toast("Columna eliminada", "warn");
        });
      }
    });
    eqRender();
  }

  function eqCSV() {
    const c = (v) => { v = v == null ? "" : String(v); return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    const L = [["#", "Conductor", "Placa Tracto", "Placa Carreta", ...eq.items.map((i) => i.name)]];
    eq.rows.forEach((r, i) => L.push([i + 1, r.conductor, r.tracto, r.carreta, ...eq.items.map((it) => { const v = r.vals && r.vals[it.id]; return v && v.chk ? (v.num === "" || v.num == null ? "Sí" : v.num) : ""; })]));
    const blob = new Blob(["﻿" + L.map((l) => l.map(c).join(";")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "control_conductores_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("CSV descargado ⬇️", "info");
  }

  /* ================================================================
     2) MANO DE OBRA (registro de trabajos por mes)
     ================================================================ */
  const MO_KEY = "cv_mano_obra_v1", MO_LEGACY = "taller_trabajos_v2";
  const PEOPLE = [
    { id: "jhosmi", name: "Jhosmi", role: "Divemotor", color: "#6366f1" },
    { id: "david", name: "David", role: "Lavador", color: "#0ea5e9" },
    { id: "chamo", name: "Chamo", role: "Lavador", color: "#10b981" },
    { id: "mecanicos", name: "Mecánicos", role: "Mecánicos", color: "#f59e0b" },
  ];
  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const nfN = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  const nfM = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fN = (n) => nfN.format(n || 0), fM = (n) => "S/ " + nfM.format(n || 0);
  const mesActual = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
  const mesLabel = (k) => { const [y, m] = k.split("-"); return (MESES[parseInt(m, 10) - 1] || m) + " " + y; };
  const perVacio = () => { const p = { people: {} }; PEOPLE.forEach((x) => (p.people[x.id] = { rate: 0, rows: [] })); return p; };
  const forma = (p) => { p.people = p.people || {}; PEOPLE.forEach((x) => { const d = p.people[x.id]; if (!d || typeof d !== "object") p.people[x.id] = { rate: 0, rows: [] }; else { if (typeof d.rate !== "number") d.rate = parseFloat(d.rate) || 0; if (!Array.isArray(d.rows)) d.rows = []; } }); return p; };

  let mo = leer(MO_KEY) || leer(MO_LEGACY) || { periods: {} };
  if (!mo.periods) mo.periods = {};
  if (!Object.keys(mo.periods).length) mo.periods[mesActual()] = perVacio();
  let moKey = mo.periods[mesActual()] ? mesActual() : Object.keys(mo.periods).sort().pop();

  let tMo = null;
  function moGuardar(inmediato) {
    clearTimeout(tMo);
    const f = () => { grabar(MO_KEY, mo); subir(); };
    inmediato ? f() : (tMo = setTimeout(f, 500));
  }
  const totales = (d) => { let h = 0; d.rows.forEach((r) => (h += parseFloat(r.horas) || 0)); return { h, c: h * (parseFloat(d.rate) || 0) }; };

  function moRender() {
    const per = forma(mo.periods[moKey]);
    $("moMes").innerHTML = Object.keys(mo.periods).sort().map((k) => `<option value="${k}" ${k === moKey ? "selected" : ""}>${mesLabel(k)}</option>`).join("");
    $("moCards").innerHTML = PEOPLE.map((p) => {
      const d = per.people[p.id], rate = parseFloat(d.rate) || 0, t = totales(d);
      const filas = d.rows.length ? d.rows.map((r, i) => `<tr>
          <td class="t-idx">${i + 1}</td>
          <td><input class="t-in t-up" data-f="placa" data-i="${i}" value="${esc(r.placa)}" placeholder="ABC-123"></td>
          <td><input class="t-in" data-f="trabajo" data-i="${i}" value="${esc(r.trabajo)}" placeholder="Descripción del trabajo"></td>
          <td><input class="t-in t-r" type="number" min="0" step="0.5" data-f="horas" data-i="${i}" value="${esc(r.horas)}" placeholder="0"></td>
          <td class="mo-sub" data-sub="${i}">${fM((parseFloat(r.horas) || 0) * rate)}</td>
          <td class="t-acc"><button class="t-delrow" data-del="${i}" title="Eliminar fila">🗑</button></td></tr>`).join("")
        : `<tr><td colspan="6" class="t-empty">Sin trabajos registrados. Haz clic en “+ Agregar trabajo”.</td></tr>`;
      return `<section class="card mo-card" data-p="${p.id}">
        <div class="mo-head">
          <div class="mo-who"><div class="mo-av" style="background:${p.color}">${esc(p.name[0])}</div><div><h3>${esc(p.name)}</h3><span class="mo-role">${esc(p.role)}</span></div></div>
          <label class="mo-rate"><span>Costo / hora</span><div class="mo-money"><b>S/</b><input type="number" min="0" step="0.01" class="mo-rate-in" value="${rate}"></div></label>
        </div>
        <div class="mo-tw"><table class="t-tab mo-tab"><thead><tr><th class="t-idx">#</th><th>Placa</th><th>Trabajo</th><th class="t-r" style="width:86px">Horas</th><th class="t-r" style="width:104px">Subtotal</th><th class="t-acc"></th></tr></thead><tbody>${filas}</tbody></table></div>
        <button class="mo-add">+ Agregar trabajo</button>
        <div class="mo-foot"><div><span>Horas totales</span><b class="mo-th">${fN(t.h)} h</b></div><div class="r"><span>Costo total</span><b class="mo-tc">${fM(t.c)}</b></div></div>
      </section>`;
    }).join("");
    moGrand();
  }

  function moRefresh(pid) {
    const d = mo.periods[moKey].people[pid], rate = parseFloat(d.rate) || 0, card = $("moCards").querySelector(`[data-p="${pid}"]`);
    d.rows.forEach((r, i) => { const el = card.querySelector(`[data-sub="${i}"]`); el && (el.textContent = fM((parseFloat(r.horas) || 0) * rate)); });
    const t = totales(d);
    card.querySelector(".mo-th").textContent = fN(t.h) + " h";
    card.querySelector(".mo-tc").textContent = fM(t.c);
    moGrand();
  }

  function moGrand() {
    const per = forma(mo.periods[moKey]);
    let H = 0, C = 0, J = 0, top = null;
    PEOPLE.forEach((p) => { const d = per.people[p.id], t = totales(d); H += t.h; C += t.c; J += d.rows.length; if (!top || t.c > top.c) top = { n: p.name, c: t.c }; });
    $("moKpis").innerHTML = [
      [fN(H) + " h", "⏱ Horas del mes", "#f59e0b"],
      [fM(C), "💰 Costo del mes", "#16a34a"],
      [J, "🔧 Trabajos registrados", "#2563eb"],
      [top && top.c > 0 ? esc(top.n) : "—", "🏆 Mayor costo", "#6366f1"],
    ].map(([v, l, c]) => `<div class="kpi" style="--c:${c}"><div class="val">${v}</div><div class="lbl">${l}</div></div>`).join("");
    $("moSub").innerHTML = `Periodo: <b>${mesLabel(moKey)}</b>`;
  }

  function moMeses() {
    const keys = Object.keys(mo.periods).sort(), uno = keys.length <= 1;
    $("moLista").innerHTML = keys.map((k) => {
      let j = 0; Object.values(mo.periods[k].people || {}).forEach((x) => (j += (x.rows || []).length));
      return `<div class="mo-mes ${k === moKey ? "active" : ""}" data-mes="${k}"><span class="mo-mes-ico">📅</span><div class="mo-mes-info"><h4>${mesLabel(k)}</h4><p>${j} trabajo${j === 1 ? "" : "s"} registrado${j === 1 ? "" : "s"}</p></div>${k === moKey ? '<span class="mo-badge">Activo</span>' : ""}<button class="t-delrow" data-delmes="${k}" ${uno ? 'disabled title="No puedes eliminar el último mes"' : 'title="Eliminar mes"'}>🗑</button></div>`;
    }).join("");
  }

  function moInit() {
    $("moMes").addEventListener("change", (e) => { moKey = e.target.value; moRender(); });
    $("moEditar").addEventListener("click", () => { moMeses(); $("tModalMeses").classList.add("show"); });
    $("moLista").addEventListener("click", (e) => {
      const del = e.target.closest("[data-delmes]");
      if (del) {
        e.stopPropagation();
        if (del.disabled || Object.keys(mo.periods).length <= 1) return;
        const k = del.dataset.delmes;
        $("tModalMeses").classList.remove("show");
        confirmar("🗑 Eliminar mes", `¿Eliminar <b>TODOS</b> los datos de <b>${mesLabel(k)}</b>?<br><br>Esta acción no se puede deshacer.`, "🗑 Eliminar", () => {
          delete mo.periods[k];
          if (moKey === k) moKey = Object.keys(mo.periods).sort().pop();
          moRender(); moGuardar(true); toast("Mes eliminado", "warn");
        });
        return;
      }
      const it = e.target.closest("[data-mes]");
      if (it) { moKey = it.dataset.mes; moRender(); $("tModalMeses").classList.remove("show"); }
    });
    $("moAddMes").addEventListener("click", () => {
      const v = $("moNuevoMes").value;
      if (!v) { $("moNuevoMes").focus(); return; }
      if (!mo.periods[v]) mo.periods[v] = perVacio();
      moKey = v; $("moNuevoMes").value = "";
      moRender(); moGuardar(true);
      $("tModalMeses").classList.remove("show");
      toast("Mes activo: " + mesLabel(v), "info");
    });
    $("moGuardar").addEventListener("click", () => { moGuardar(true); toast("Datos guardados ✔"); });
    $("moExcel").addEventListener("click", moExcel);

    const cont = $("moCards");
    cont.addEventListener("input", (e) => {
      const t = e.target, card = t.closest("[data-p]"); if (!card) return;
      const pid = card.dataset.p, d = mo.periods[moKey].people[pid];
      if (t.classList.contains("mo-rate-in")) d.rate = parseFloat(t.value) || 0;
      else if (t.dataset.f) {
        let v = t.value;
        if (t.classList.contains("t-up")) { const p = t.selectionStart; v = t.value = v.toUpperCase(); t.setSelectionRange(p, p); }
        d.rows[+t.dataset.i] && (d.rows[+t.dataset.i][t.dataset.f] = v);
      }
      moRefresh(pid); moGuardar();
    });
    cont.addEventListener("click", (e) => {
      const card = e.target.closest("[data-p]"); if (!card) return;
      const pid = card.dataset.p, d = mo.periods[moKey].people[pid];
      const del = e.target.closest("[data-del]");
      if (del) { d.rows.splice(+del.dataset.del, 1); moRender(); moGuardar(true); return; }
      if (e.target.closest(".mo-add")) {
        d.rows.push({ placa: "", trabajo: "", horas: "" });
        moRender(); moGuardar();
        const ins = $("moCards").querySelector(`[data-p="${pid}"]`).querySelectorAll('input[data-f="placa"]');
        ins.length && ins[ins.length - 1].focus();
      }
    });
    moRender();
  }

  async function moExcel() {
    await (window.__cargarXLSX ? window.__cargarXLSX() : Promise.resolve());
    if (!window.XLSX) { toast("No se pudo cargar el exportador", "error"); return; }
    const per = forma(mo.periods[moKey]), A = [["Persona", "Rol", "Costo/hora (S/)", "Placa", "Trabajo", "Horas", "Subtotal (S/)"]];
    PEOPLE.forEach((p) => { const d = per.people[p.id]; d.rows.forEach((r) => { const h = parseFloat(r.horas) || 0; A.push([p.name, p.role, d.rate, r.placa, r.trabajo, h, +(h * d.rate).toFixed(2)]); }); });
    const R = [["Persona", "Rol", "Costo/hora (S/)", "Horas", "Costo (S/)"]];
    let H = 0, C = 0;
    PEOPLE.forEach((p) => { const d = per.people[p.id], t = totales(d); H += t.h; C += t.c; R.push([p.name, p.role, d.rate, t.h, +t.c.toFixed(2)]); });
    R.push(["TOTAL", "", "", H, +C.toFixed(2)]);
    const wb = XLSX.utils.book_new(), w1 = XLSX.utils.aoa_to_sheet(R), w2 = XLSX.utils.aoa_to_sheet(A);
    w1["!cols"] = [{ wch: 14 }, { wch: 12 }, { wch: 15 }, { wch: 10 }, { wch: 12 }];
    w2["!cols"] = [{ wch: 12 }, { wch: 11 }, { wch: 15 }, { wch: 11 }, { wch: 44 }, { wch: 8 }, { wch: 13 }];
    XLSX.utils.book_append_sheet(wb, w1, "Resumen");
    XLSX.utils.book_append_sheet(wb, w2, "Detalle");
    XLSX.writeFile(wb, "mano_de_obra_" + moKey + ".xlsx");
    toast("Excel descargado ⬇️", "info");
  }

  /* ================================================================
     Nube (mismo documento Firestore del sistema)
     ================================================================ */
  window.__eqGet = () => eq;
  window.__moGet = () => mo;
  window.__eqApplyRemote = (d) => {
    if (!d || !Array.isArray(d.items)) return;
    eq = d; if (!Array.isArray(eq.rows)) eq.rows = [];
    grabar(EQ_KEY, eq);
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#eqTabla")) return;
    eqRender();
  };
  window.__moApplyRemote = (d) => {
    if (!d || !d.periods || !Object.keys(d.periods).length) return;
    mo = d;
    if (!mo.periods[moKey]) moKey = mo.periods[mesActual()] ? mesActual() : Object.keys(mo.periods).sort().pop();
    grabar(MO_KEY, mo);
    if (document.activeElement && document.activeElement.closest && document.activeElement.closest("#moCards")) return;
    moRender();
  };

  /* ---------- Arranque ---------- */
  function init() {
    $("tConfOk").addEventListener("click", () => { const cb = confirmCb; cerrarConf(); cb && cb(); });
    ["tConfCancel", "tConfClose"].forEach((id) => $(id).addEventListener("click", cerrarConf));
    document.querySelectorAll("[data-tclose]").forEach((b) => b.addEventListener("click", () => b.closest(".modal-overlay").classList.remove("show")));
    ["tModalConfirm", "tModalCol", "tModalMeses"].forEach((id) => $(id).addEventListener("click", (e) => { if (e.target.id === id) { $(id).classList.remove("show"); if (id === "tModalConfirm") confirmCb = null; } }));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") ["tModalConfirm", "tModalCol", "tModalMeses"].forEach((id) => $(id).classList.remove("show")); });
    eqInit(); moInit();
    grabar(EQ_KEY, eq); grabar(MO_KEY, mo);
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();
})();
