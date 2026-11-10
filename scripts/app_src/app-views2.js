/* ================================================================ SORNDI views 2
   Lessons (class tab), Scorebook, Daily records. */

/* ---------------------------------------------------------------- Lessons tab (class) */
function renderClassLessons(root, c) {
  const lessons = classLessons(c.id);
  let html = `<div style="display:flex;gap:8px;margin-bottom:14px">
    <button class="btn primary" data-action="new-lesson" data-id="${c.id}">${icon("plus")}${t("lesson.new")}</button>
  </div>`;
  if (!lessons.length) {
    html += `<div class="card">${emptyState("book", "empty.noLessons", esc(t("lesson.template") + " → " + t("lesson.stages")), `<button class="btn sm" data-action="new-lesson" data-id="${c.id}">${icon("plus")}${t("lesson.new")}</button>`)}</div>`;
  } else {
    html += `<div class="card">`;
    for (const l of lessons) {
      const statusTone = { draft: "mut", ready: "green", taught: "slate", cancelled: "red" }[l.status] || "mut";
      html += `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line)">
        <span class="chip ${statusTone}">${t("lesson." + l.status)}</span>
        <div style="flex:1;min-width:0">
          <b>${esc(l.title)}</b>
          <div class="meta">${l.objective ? esc(l.objective) : ""}</div>
        </div>
        <span class="mono small muted">${l.plannedDate ? esc(fmtDateISO(l.plannedDate)) : ""}</span>
        <button class="btn sm ghost" data-action="edit-lesson" data-id="${l.id}">${icon("edit")}${t("act.edit")}</button>
        ${l.status === "ready" ? `<button class="btn sm" data-action="new-session-for-lesson" data-lesson="${l.id}" data-id="${c.id}">${icon("play")}${t("att.newSession")}</button>` : ""}
        <button class="iconbtn" data-action="del-lesson" data-id="${l.id}" aria-label="${t("act.delete")}">${icon("trash")}</button>
      </div>`;
    }
    html += `</div>`;
  }
  root.innerHTML = html;
}

function lessonDialog(c, existing) {
  const templates = SorndiCore.LESSON_TEMPLATES;
  const slotMin = slotMinutesFor(c.id);
  openDialog(existing ? t("act.edit") : t("lesson.new"), `
    <label class="field"><span>Lesson title *</span><input class="input" id="lf-title" value="${escAttr(existing ? existing.title : "")}"></label>
    <label class="field"><span>${t("lesson.objective")} *</span>
      <input class="input" id="lf-objective" value="${escAttr(existing ? existing.objective : "")}" placeholder="Students can…">
      ${existing && existing.objective ? "" : `<div class="hint">${esc(t("warn.noObjective"))}</div>`}
    </label>
    <div class="row">
      <label class="field"><span>${t("lesson.planned")}</span><input class="input" type="date" id="lf-date" value="${escAttr(existing ? existing.plannedDate || "" : "")}"></label>
      <label class="field"><span>${t("lesson.status")}</span>
        <select class="input" id="lf-status">
          ${["draft", "ready", "taught", "cancelled"].map(s => `<option value="${s}" ${existing && existing.status === s ? "selected" : ""}>${t("lesson." + s)}</option>`).join("")}
        </select></label>
    </div>
    <label class="field"><span>${t("lesson.template")}</span>
      <select class="input" id="lf-template">
        <option value="">—</option>
        ${templates.map(tp => `<option value="${tp.id}" ${existing && existing.template === tp.id ? "selected" : ""}>${tp.stages.map(s => s.name).join(" · ")}</option>`).join("")}
      </select>
      <div class="hint">${esc(slotMin ? t("lesson.totalTime") + ": " + slotMin + " min" : "")}</div>
    </label>
    <div id="lf-stages"></div>
  `, `<button class="btn primary" id="lf-save">${t("act.save")}</button>`, { wide: true });
  const ov = document.getElementById("overlay");

  function stageRow(s) {
    const div = eld_from(`<div class="row" style="align-items:center;margin-bottom:6px">
      <input class="input sg-name" style="flex:2" value="${escAttr(s.name || "")}" placeholder="${esc(t("lesson.stages"))}">
      <input class="input sg-min num" style="flex:0 0 76px" type="number" min="0" value="${escAttr(s.minutes ?? "")}">
      <span class="meta">min</span>
      <button class="iconbtn sg-del">${icon("x")}</button>
    </div>`);
    div.querySelector(".sg-del").addEventListener("click", () => { div.remove(); updateTotal(); });
    return div;
  }
  function readStages() {
    return [...ov.querySelectorAll("#lf-stages .row")].map(r => ({
      name: r.querySelector(".sg-name").value.trim(),
      minutes: parseInt(r.querySelector(".sg-min").value, 10) || 0,
    })).filter(s => s.name);
  }
  function updateTotal() {
    const stages = readStages();
    const total = SorndiCore.planTotalMinutes(stages);
    const box = ov.querySelector("#lf-total");
    if (box) box.innerHTML = `<span class="mono">${total}</span> min` + (slotMin && total > slotMin ? ` · <span style="color:var(--amber)">${esc(t("warn.overTime"))}</span>` : "");
  }
  function renderStages(stages) {
    const box = ov.querySelector("#lf-stages");
    box.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <b class="small">${esc(t("lesson.stages"))}</b><span class="meta" id="lf-total"></span></div>`;
    for (const s of stages) box.appendChild(stageRow(s));
    box.insertAdjacentHTML("beforeend", `<button class="btn sm" id="sg-add">${icon("plus")}${t("act.add")}</button>`);
    box.querySelector("#sg-add").addEventListener("click", () => { box.querySelector("#sg-add").before(stageRow({})); updateTotal(); });
    box.addEventListener("input", updateTotal);
    updateTotal();
  }
  if (existing && existing.stages && existing.stages.length) renderStages(existing.stages);
  ov.querySelector("#lf-template").addEventListener("change", e => {
    const stages = SorndiCore.templateStages(e.target.value);
    if (stages) renderStages(stages);
  });
  if (!existing) renderStages([]);
  else updateTotal();

  ov.querySelector("#lf-save").addEventListener("click", () => {
    const title = ov.querySelector("#lf-title").value.trim();
    const objective = ov.querySelector("#lf-objective").value.trim();
    if (!title) { ov.querySelector("#lf-title").focus(); return; }
    const stages = readStages();
    const data = {
      title, objective,
      plannedDate: ov.querySelector("#lf-date").value || null,
      status: ov.querySelector("#lf-status").value,
      template: ov.querySelector("#lf-template").value || null,
      stages,
    };
    if (existing) Object.assign(existing, data);
    else db.lessons.push({ id: uid(), classId: c.id, createdAt: Date.now(), ...data });
    save(); closeDialog(); renderRoute();
  });
}

/* ---------------------------------------------------------------- Scorebook tab */
function renderScorebook(root, c) {
  const students = classStudents(c.id);
  const assessments = classAssessments(c.id);
  const objectives = db.objectives.filter(o => o.classId === c.id);
  let html = `<div style="display:flex;gap:8px;margin-bottom:14px;align-items:center;flex-wrap:wrap">
    <button class="btn primary" data-action="new-assessment" data-id="${c.id}">${icon("plus")}${t("score.new")}</button>
    ${assessments.length ? `<button class="btn" data-action="export-scorebook" data-id="${c.id}">${icon("exports")}CSV</button>` : ""}
  </div>`;
  if (!assessments.length) {
    root.innerHTML = html + `<div class="card">${emptyState("scorebook", "empty.noAssessments", esc(t("score.total") + " = Σ(pct × weight) / Σ(weight)"))}</div>`;
    return;
  }

  html += `<div class="card" style="overflow-x:auto"><table class="table"><thead><tr><th style="min-width:150px">${t("roster.name")}</th>`;
  for (const a of assessments) {
    html += `<th title="${esc(a.category || "")}" style="text-align:center;min-width:86px">
      <div style="font-weight:500">${esc(a.name)}</div>
      <div class="meta mono">/${a.maxScore} · w${a.weight}</div></th>`;
  }
  html += `<th style="min-width:110px;text-align:right">${t("score.total")}</th><th style="width:40px"></th></tr></thead><tbody id="sb-rows">`;
  for (const st of students) {
    html += `<tr><td><b>${esc(st.fullName)}</b></td>`;
    for (const a of assessments) {
      const v = getScore(a.id, st.id);
      html += `<td style="text-align:center">
        <input class="input sb-cell" style="width:64px;text-align:center;padding:4px 6px" data-a="${a.id}" data-s="${st.id}" data-max="${a.maxScore}"
          value="${typeof v === "number" ? v : ""}" inputmode="decimal" placeholder="—">
        <div style="display:flex;gap:2px;justify-content:center;margin-top:3px">
          <button class="st-btn ${v === "missing" ? "on red" : ""}" data-flag="missing" data-a="${a.id}" data-s="${st.id}" title="${t("score.missing")}">M</button>
          <button class="st-btn ${v === "excused" ? "on slate" : ""}" data-flag="excused" data-a="${a.id}" data-s="${st.id}" title="${t("score.excused")}">E</button>
        </div></td>`;
    }
    html += `<td style="text-align:right"><span class="mono sb-total" data-s="${st.id}">—</span></td>
      <td><button class="iconbtn" data-math="${st.id}" title="${t("score.showMath")}">${icon("info")}</button></td></tr>`;
  }
  html += `</tbody></table></div>
  <div class="note" style="margin-top:10px">M = ${t("score.missing")} · E = ${t("score.excused")} — ${esc("not zero")}. ${t("score.showMath")} → ${icon("info")}</div>`;
  root.innerHTML = html;
  updateAllTotals(root, c);
  root.querySelector(".card").addEventListener("input", e => {
    const cell = e.target.closest(".sb-cell");
    if (!cell) return;
    const aId = cell.dataset.a, sId = cell.dataset.s, max = Number(cell.dataset.max);
    let val = cell.value.trim();
    if (val === "") {
      db.scores = db.scores.filter(r => !(r.assessmentId === aId && r.studentId === sId));
    } else {
      const num = Number(val);
      if (isNaN(num)) return;
      const clamped = Math.min(Math.max(num, 0), max);
      if (clamped !== num) { cell.value = clamped; }
      setScore(aId, sId, clamped);
    }
    save();
    updateTotalCell(root, c, sId);
    const avgCell = root.querySelector(`.sb-avg[data-a="${aId}"]`);
    if (avgCell) avgCell.textContent = fmtNum(SorndiCore.assessmentStats(db.scores.filter(r => r.assessmentId === aId).map(r => r.value), max).average);
  });
  root.querySelector(".card").addEventListener("click", e => {
    const flag = e.target.closest("[data-flag]");
    if (flag) {
      const aId = flag.dataset.a, sId = flag.dataset.s, kind = flag.dataset.flag;
      const cur = getScore(aId, sId);
      setScore(aId, sId, cur === kind ? null : kind);
      save(); renderScorebook(root, c);
      return;
    }
    const mathBtn = e.target.closest("[data-math]");
    if (mathBtn) showCalculation(c, mathBtn.dataset.math);
  });
}

function setScore(assessmentId, studentId, value) {
  let r = db.scores.find(s => s.assessmentId === assessmentId && s.studentId === studentId);
  if (value === null) {
    if (r) db.scores.splice(db.scores.indexOf(r), 1);
    return;
  }
  if (!r) { r = { assessmentId, studentId }; db.scores.push(r); }
  r.value = value;
}

function fmtNum(n) {
  return n === null || n === undefined ? "—" : (Math.round(n * 10) / 10).toFixed(1);
}

function updateTotalCell(root, c, studentId) {
  const assessments = classAssessments(c.id);
  const wt = SorndiCore.weightedTotal(assessments, studentId, getScore);
  const cell = root.querySelector(`.sb-total[data-s="${studentId}"]`);
  if (cell) cell.textContent = wt.total === null ? "—" : Math.round(wt.total) + "%";
}

function updateAllTotals(root, c) {
  for (const st of classStudents(c.id)) updateTotalCell(root, c, st.id);
  // class average row per assessment in header is optional; show averages under header via title
}

function showCalculation(c, studentId) {
  const st = byId(db.students, studentId);
  const assessments = classAssessments(c.id);
  const wt = SorndiCore.weightedTotal(assessments, studentId, getScore);
  let rows = wt.included.map(inc => {
    const a = byId(assessments, inc.assessmentId);
    return `${a.name.padEnd(22)} ${String(Math.round(inc.pct)).padStart(3)}%  × w${inc.weight}  →  ${(Math.round(inc.contribution * 10) / 10).toFixed(1)}`;
  }).join("\n");
  if (wt.missing) rows += `\n${t("score.missing")}: ${wt.missing} (excluded)`;
  if (wt.excused) rows += `\n${t("score.excused")}: ${wt.excused} (excluded)`;
  openDialog(`${t("score.formulaTitle")} — ${st ? st.fullName : ""}`, `
    <div class="formula">total = Σ(pct × weight) / Σ(weight)

${rows}

Σ(weight) = ${wt.weightSum}
total = ${wt.total === null ? "—" : (Math.round(wt.total * 10) / 10).toFixed(1) + "%"}</div>
    <p class="hint" style="margin-top:10px">${t("score.missing")}/${t("score.excused")} ≠ 0</p>
  `, `<button class="btn" data-close>${t("act.close")}</button>`);
}

function assessmentDialog(c) {
  const lessons = classLessons(c.id);
  openDialog(t("score.new"), `
    <label class="field"><span>${t("score.name")} *</span><input class="input" id="af-name"></label>
    <div class="row">
      <label class="field"><span>${t("score.category")}</span>
        <select class="input" id="af-cat">
          <option>Quiz</option><option>Homework</option><option>Classwork</option><option>Project</option><option>Exam</option>
        </select></label>
      <label class="field"><span>${t("att.date")}</span><input class="input" type="date" id="af-date" value="${SorndiCore.todayISO()}"></label>
    </div>
    <div class="row">
      <label class="field"><span>${t("score.max")}</span><input class="input" type="number" id="af-max" value="10" min="1"></label>
      <label class="field"><span>${t("score.weight")}</span><input class="input" type="number" id="af-weight" value="1" min="0" step="0.5"></label>
    </div>
    <label class="field"><span>${t("lesson.objective")}</span>
      <select class="input" id="af-objective">
        <option value="">—</option>
        ${db.objectives.filter(o => o.classId === c.id).map(o => `<option value="${o.id}">${esc(o.statement)}</option>`).join("")}
      </select></label>
  `, `<button class="btn primary" id="af-save">${t("act.create")}</button>`);
  const ov = document.getElementById("overlay");
  ov.querySelector("#af-save").addEventListener("click", () => {
    const name = ov.querySelector("#af-name").value.trim();
    if (!name) { ov.querySelector("#af-name").focus(); return; }
    db.assessments.push({
      id: uid(), classId: c.id, name,
      category: ov.querySelector("#af-cat").value,
      date: ov.querySelector("#af-date").value || null,
      maxScore: Math.max(1, Number(ov.querySelector("#af-max").value) || 10),
      weight: Math.max(0, Number(ov.querySelector("#af-weight").value) || 1),
      objectiveId: ov.querySelector("#af-objective").value || null,
      createdAt: Date.now(),
    });
    save(); closeDialog(); renderRoute();
  });
}

/* ---------------------------------------------------------------- Daily records tab */
function renderRecords(root, c) {
  const templates = db.recordTemplates.filter(r => r.classId === c.id);
  let html = `<div style="display:flex;gap:8px;margin-bottom:14px">
    <button class="btn primary" data-action="new-template" data-id="${c.id}">${icon("plus")}${t("records.new")}</button>
  </div>`;
  if (!templates.length) {
    html += `<div class="card">${emptyState("records", "empty.noRecords",
      esc("Homework submitted · Reading log · Equipment returned · anything you check per student per day"),
      `<button class="btn sm" data-action="new-template" data-id="${c.id}">${icon("plus")}${t("records.new")}</button>`)}</div>`;
  } else {
    html += `<div class="card">`;
    for (const tp of templates) {
      html += `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line)">
        <div style="flex:1"><b>${esc(tp.name)}</b>
          <div class="meta">${tp.fields.map(f => esc(f.label)).join(" · ")}</div></div>
        <button class="btn sm" data-action="open-record-entry" data-id="${tp.id}">${icon("check")}${t("records.entry")}</button>
        <button class="iconbtn" data-action="del-template" data-id="${tp.id}" aria-label="${t("act.delete")}">${icon("trash")}</button>
      </div>`;
    }
    html += `</div><div class="note" style="margin-top:10px">${t("records.absenceRule")}</div><div id="record-entry"></div>`;
  }
  root.innerHTML = html;
}

function templateDialog(c) {
  openDialog(t("records.new"), `
    <label class="field"><span>${t("score.name")} *</span><input class="input" id="tf-name" placeholder="Homework submitted"></label>
    <label class="field"><span>${t("records.fields")}</span>
      <div id="tf-fields"></div>
      <div class="row" style="margin-top:8px">
        <select class="input" id="tf-kind"><option value="check">✓ / —</option><option value="score">0–10</option><option value="text">text</option></select>
        <button class="btn sm" id="tf-add">${icon("plus")}${t("act.add")}</button>
      </div>
      <div class="hint">✓ / — works for routines; 0–10 for graded checks</div>
    </label>
  `, `<button class="btn primary" id="tf-save">${t("act.create")}</button>`);
  const ov = document.getElementById("overlay");
  function fieldRow() {
    const div = eld_from(`<div class="row" style="margin-bottom:6px"><input class="input tf-label" placeholder="${esc(t("records.fields"))} — label"></div>`);
    ov.querySelector("#tf-fields").appendChild(div);
  }
  ov.querySelector("#tf-add").addEventListener("click", fieldRow);
  fieldRow();
  ov.querySelector("#tf-save").addEventListener("click", () => {
    const name = ov.querySelector("#tf-name").value.trim();
    const fields = [...ov.querySelectorAll(".tf-label")].map((inp, i) => ({
      id: "f" + i, label: inp.value.trim() || `Field ${i + 1}`, kind: ov.querySelector("#tf-kind").value,
    }));
    if (!name || !fields.length) return;
    db.recordTemplates.push({ id: uid(), classId: c.id, name, fields, createdAt: Date.now() });
    save(); closeDialog(); renderRoute();
  });
}

function recordEntryDialog(tp) {
  const c = cls(tp.classId);
  const students = classStudents(tp.classId);
  const sessions = classSessions(tp.classId);
  openDialog(tp.name, `
    <div class="row" style="margin-bottom:12px">
      <label class="field"><span>${t("att.session")}</span>
        <select class="input" id="re-session">
          ${sessions.map(s => `<option value="${s.id}">${esc(fmtDateISO(s.date))}</option>`).join("")}
        </select></label>
    </div>
    <div class="card" style="overflow-x:auto"><table class="table"><thead><tr>
      <th>${t("roster.name")}</th>${tp.fields.map(f => `<th style="text-align:center">${esc(f.label)}</th>`).join("")}
    </tr></thead><tbody>
    ${students.map(st => {
      const attRec = null;
      return `<tr><td>${esc(st.fullName)}</td>
        ${tp.fields.map(f => f.kind === "check"
          ? `<td style="text-align:center"><button class="st-btn" data-re="${st.id}|${f.id}">✓</button></td>`
          : `<td style="text-align:center"><input class="input re-cell" style="width:64px;text-align:center;padding:4px" data-re-cell="${st.id}|${f.id}"></td>`)
        .join("")}</tr>`;
    }).join("")}
    </tbody></table></div>
    <div class="note" style="margin-top:10px">${t("records.absenceRule")}</div>
  `, `<button class="btn primary" data-close>${t("act.done")}</button>`, { wide: true });
  const ov = document.getElementById("overlay");
  const sessionIdSel = ov.querySelector("#re-session");
  function key(sessionId, stId, fId) { return `${sessionId}|${stId}|${fId}`; }
  function existing(sessionId, stId, fId) {
    return db.recordEntries.find(r => r.templateId === tp.id && r.sessionId === sessionId && r.studentId === stId && r.fieldId === fId);
  }
  function applyAbsenceDefaults(sessionId) {
    const s = session(sessionId);
    if (!s) return;
    const att = sessionAttendance(sessionId);
    for (const st of students) {
      const status = att[st.id] && att[st.id].status;
      if (status && status !== "present" && status !== "remote" && status !== "late") {
        for (const f of tp.fields) {
          if (f.kind === "check" && !existing(sessionId, st.id, f.id)) {
            db.recordEntries.push({ id: uid(), templateId: tp.id, sessionId, studentId: st.id, fieldId: f.id, value: "NA", auto: true, at: new Date().toISOString() });
          }
        }
      }
    }
  }
  function refreshMarks(sessionId) {
    ov.querySelectorAll("[data-re]").forEach(btn => {
      const [stId, fId] = btn.dataset.re.split("|");
      btn.classList.toggle("on", !!existing(sessionId, stId, fId) && existing(sessionId, stId, fId).value === "✓");
      btn.textContent = existing(sessionId, stId, fId) && existing(sessionId, stId, fId).value === "NA" ? "—" : "✓";
    });
    ov.querySelectorAll("[data-re-cell]").forEach(inp => {
      const [stId, fId] = inp.dataset.reCell.split("|");
      const r = existing(sessionId, stId, fId);
      if (r && document.activeElement !== inp) inp.value = r.value;
    });
  }
  if (sessionIdSel) {
    sessionIdSel.addEventListener("change", () => { applyAbsenceDefaults(sessionIdSel.value); refreshMarks(sessionIdSel.value); });
    applyAbsenceDefaults(sessionIdSel.value);
    refreshMarks(sessionIdSel.value);
    ov.addEventListener("click", e => {
      const btn = e.target.closest("[data-re]");
      if (!btn) return;
      const [stId, fId] = btn.dataset.re.split("|");
      const sessionId = sessionIdSel.value;
      const r = existing(sessionId, stId, fId);
      if (!r) db.recordEntries.push({ id: uid(), templateId: tp.id, sessionId, studentId: stId, fieldId: fId, value: "✓", at: new Date().toISOString() });
      else if (r.value === "✓") r.value = "NA";
      else db.recordEntries.splice(db.recordEntries.indexOf(r), 1);
      save(); refreshMarks(sessionId);
    });
    ov.addEventListener("input", e => {
      const inp = e.target.closest("[data-re-cell]");
      if (!inp) return;
      const [stId, fId] = inp.dataset.reCell.split("|");
      const sessionId = sessionIdSel.value;
      let r = existing(sessionId, stId, fId);
      if (!r) { r = { id: uid(), templateId: tp.id, sessionId, studentId: stId, fieldId: fId, at: new Date().toISOString() }; db.recordEntries.push(r); }
      r.value = inp.value;
      save();
    });
  }
}
