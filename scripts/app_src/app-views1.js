/* ================================================================ SORNDI views 1
   Today, Classrooms, Class detail: Overview / Roster / Attendance. */

/* ---------------------------------------------------------------- Today */
route(/^\/today$/, () => {
  const todayISOv = SorndiCore.todayISO();
  const wd = SorndiCore.weekdayIndex(todayISOv);

  const todaySessions = db.sessions
    .filter(s => s.date === todayISOv)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));

  const needs = [];
  for (const s of db.sessions) {
    if (s.date >= todayISOv) continue;
    const att = Object.values(sessionAttendance(s.id));
    if (!att.length || att.every(r => !r.status)) {
      needs.push({ kind: "attendance", s });
    } else if (s.status === "completed" && !s.reflection) {
      needs.push({ kind: "reflection", s });
    }
  }
  needs.sort((a, b) => b.s.date.localeCompare(a.s.date));
  needs.splice(8);

  const upcoming = [];
  for (let i = 1; i <= 7 && upcoming.length < 6; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = SorndiCore.todayISO(d);
    for (const c of db.classes.filter(c => !c.archived)) {
      const slot = nextSlotFor(c.id, iso);
      if (slot) upcoming.push({ date: iso, slot, c });
    }
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date) || (a.slot.start || "").localeCompare(b.slot.start || ""));
  upcoming.splice(6);

  const openRefl = db.sessions.filter(s => s.status === "completed" && !s.reflection).length;

  let html = `
    <div class="page-title">${esc(fmtDateObj(new Date()))}</div>
    <p class="page-sub">${esc(db.settings.teacherName ? `${db.settings.teacherName}${db.settings.school ? " · " + db.settings.school : ""}` : t("today.start"))}</p>`;

  if (!db.classes.length) {
    html += `<div class="card pad section">${emptyState("classes", "today.start",
      esc(t("today.createFirst")),
      `<button class="btn primary" data-go="#/classes">${icon("plus")}${esc(t("classes.new"))}</button>
       <button class="btn" data-action="load-demo" style="margin-left:8px">${esc(t("set.demo"))}</button>`)}</div>`;
  } else {
    html += `<div class="stat-row section">
      <div class="stat"><div class="n">${db.classes.filter(c => !c.archived).length}</div><div class="l">${esc(t("nav.classes"))}</div></div>
      <div class="stat"><div class="n">${db.students.filter(s => s.active).length}</div><div class="l">${esc(t("class.students"))}</div></div>
      <div class="stat"><div class="n">${db.lessons.filter(l => l.status === "ready").length}</div><div class="l">${esc(t("lesson.ready"))}</div></div>
      ${openRefl ? `<div class="stat"><div class="n">${openRefl}</div><div class="l">${esc(t("today.missingReflection"))}</div></div>` : ""}
    </div>`;
  }

  if (db.classes.length) {
    html += `<div class="section">${sectionHead("today.sessions", todaySessions.length || undefined)}`;
    if (!todaySessions.length) {
      html += `<div class="card"><div class="empty" style="padding:28px">${icon("today")}<div class="t">${esc(t("today.noSessions"))}</div><div class="small">${esc(WEEKDAYS[LANG][wd])}</div></div></div>`;
    } else {
      html += `<div class="card">`;
      for (const s of todaySessions) {
        const c = cls(s.classId); const l = s.lessonId ? lesson(s.lessonId) : null;
        const att = Object.values(sessionAttendance(s.id));
        const attCount = att.filter(r => r.status).length;
        const nStudents = classStudents(s.classId).length;
        html += `<div style="display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid var(--line)">
          <div class="mono" style="width:52px">${esc(s.startTime || "—")}</div>
          <div style="flex:1;min-width:0">
            <div><b>${esc(c ? c.name : "?")}</b>${l ? ` <span class="muted">· ${esc(l.title)}</span>` : ""}</div>
            <div class="meta">${l && l.objective ? esc(l.objective) : ""}</div>
          </div>
          ${attCount ? `<span class="chip green">${attCount}/${nStudents} ${esc(t("nav.attendance"))}</span>` : `<button class="btn sm" data-action="go-att" data-session="${s.id}">${icon("check")}${esc(t("today.takeAttendance"))}</button>`}
          ${l ? `<button class="btn sm ghost" data-action="open-lesson" data-id="${l.id}">${esc(t("today.openLesson"))}</button>` : ""}
        </div>`;
      }
      html += `</div>`;
    }
    html += `</div>`;

    if (needs.length) {
      html += `<div class="section">${sectionHead("today.needs", needs.length)}`;
      html += `<div class="card">`;
      for (const n of needs) {
        const c = cls(n.s.classId); const l = n.s.lessonId ? lesson(n.s.lessonId) : null;
        html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 18px;border-bottom:1px solid var(--line)">
          <span class="chip ${n.kind === "attendance" ? "amber" : "slate"}">${esc(n.kind === "attendance" ? t("today.attendanceNotRecorded") : t("today.missingReflection"))}</span>
          <div style="flex:1;min-width:0"><span class="mono small muted">${esc(fmtDateISO(n.s.date))}</span> ${esc(c ? c.name : "")}${l ? ` · ${esc(l.title)}` : ""}</div>
          <button class="btn sm ghost" data-action="go-att" data-session="${n.s.id}">${icon("arrowR")}${esc(t("act.open"))}</button>
        </div>`;
      }
      html += `</div></div>`;
    }

    if (upcoming.length) {
      html += `<div class="section">${sectionHead("today.upcoming")}`;
      html += `<div class="card">`;
      for (const u of upcoming) {
        html += `<div style="display:flex;align-items:center;gap:14px;padding:10px 18px;border-bottom:1px solid var(--line)">
          <div class="mono small muted" style="width:96px">${esc(WEEKDAYS_SHORT[LANG][u.slot.day])} ${esc(fmtDateISO(u.date))}</div>
          <div style="flex:1"><b>${esc(u.c.name)}</b> <span class="muted mono small">${esc(u.slot.start || "")}–${esc(u.slot.end || "")}</span></div>
          <button class="btn sm ghost" data-action="open-class" data-id="${u.c.id}">${esc(t("today.prepare"))}</button>
        </div>`;
      }
      html += `</div></div>`;
    }
  }
  setView(html, "today");
});

/* ---------------------------------------------------------------- Classes list */
route(/^\/classes$/, () => {
  const active = db.classes.filter(c => !c.archived);
  const archived = db.classes.filter(c => c.archived);
  let html = `<div style="display:flex;align-items:center;gap:12px">
      <div><div class="page-title">${esc(t("classes.title"))}</div></div>
      <span style="flex:1"></span>
      <button class="btn primary" data-action="new-class">${icon("plus")}${esc(t("classes.new"))}</button>
    </div>`;
  if (!active.length) {
    html += `<div class="card pad section">${emptyState("classes", "classes.empty",
      esc(t("today.createFirst")),
      `<button class="btn primary" data-action="new-class">${icon("plus")}${esc(t("classes.new"))}</button>`)}</div>`;
  } else {
    html += `<div class="class-grid section">`;
    for (const c of active) {
      const n = classStudents(c.id).length;
      const recent = classSessions(c.id)[0];
      html += `<div class="card class-card" data-action="open-class" data-id="${c.id}" role="button" tabindex="0">
        <div class="name">${esc(c.name)}</div>
        <div class="meta meta-line">${esc([c.subject, c.gradeLevel, c.room].filter(Boolean).join(" · ")) || "&nbsp;"}</div>
        <div class="meta" style="margin-top:10px">
          <span class="mono">${n}</span> ${esc(t("class.students"))}
          ${recent ? ` · <span class="mono">${esc(fmtDateISO(recent.date))}</span>` : ""}
        </div>
        ${c.term ? `<div class="meta" style="margin-top:2px">${esc(c.term)}</div>` : ""}
      </div>`;
    }
    html += `</div>`;
  }
  if (archived.length) {
    html += `<div class="section">${sectionHead("class.archive", archived.length)}<div class="card">`;
    for (const c of archived) {
      html += `<div style="display:flex;align-items:center;padding:10px 16px;border-bottom:1px solid var(--line)">
        <span style="flex:1">${esc(c.name)} <span class="muted small">· ${esc(t("class.archive"))}</span></span>
        <button class="btn sm" data-action="unarchive-class" data-id="${c.id}">${esc(t("class.unarchive"))}</button>
      </div>`;
    }
    html += `</div></div>`;
  }
  setView(html, "classes");
});

/* ---------------------------------------------------------------- New / edit class dialog */
function classDialog(existing) {
  const c = existing || { name: "", subject: "", gradeLevel: "", room: "", term: "", timetable: [] };
  const dayOpts = (sel) => WEEKDAYS_SHORT[LANG === "th" ? "th" : "en"].map((d, i) =>
    `<option value="${i}" ${sel === i ? "selected" : ""}>${d}</option>`).join("");
  const rows = (c.timetable && c.timetable.length ? c.timetable : [{}]).map(s => `
    <div class="row tt-row" style="align-items:center;margin-bottom:8px">
      <select class="input tt-day" style="flex:1.2">${[1,2,3,4,5,6,0].map(i => `<option value="${i}" ${Number(s.day) === i ? "selected" : ""}>${WEEKDAYS_SHORT[LANG][i]}</option>`).join("")}</select>
      <input class="input tt-start" type="time" value="${esc(s.start || "")}">
      <input class="input tt-end" type="time" value="${esc(s.end || "")}">
      <button class="iconbtn tt-del">${icon("trash")}</button>
    </div>`).join("");
  const ov = openDialog(existing ? t("act.edit") : t("classes.new"), `
    <label class="field"><span>${t("class.name")} *</span><input class="input" id="cf-name" value="${escAttr(c.name)}"></label>
    <div class="row">
      <label class="field"><span>${t("class.subject")}</span><input class="input" id="cf-subject" value="${escAttr(c.subject)}"></label>
      <label class="field"><span>${t("class.grade")}</span><input class="input" id="cf-grade" value="${escAttr(c.gradeLevel)}"></label>
    </div>
    <div class="row">
      <label class="field"><span>${t("class.room")}</span><input class="input" id="cf-room" value="${escAttr(c.room)}"></label>
      <label class="field"><span>${t("class.term")}</span><input class="input" id="cf-term" value="${escAttr(c.term)}"></label>
    </div>
    <label class="field"><span>${t("class.timetable")}</span><div id="tt-rows">${rows}</div>
      <button class="btn sm" id="tt-add">${icon("plus")}${esc(t("act.add"))}</button>
    </label>
  `, `<button class="btn primary" id="cf-save">${esc(t("act.save"))}</button>`);
  ov.querySelector("#tt-add").addEventListener("click", () => {
    const div = eld_from(`<div class="row tt-row" style="align-items:center;margin-bottom:8px">
      <select class="input tt-day" style="flex:1.2">${[1,2,3,4,5,6,0].map(i => `<option value="${i}">${WEEKDAYS_SHORT[LANG][i]}</option>`).join("")}</select>
      <input class="input tt-start" type="time"><input class="input tt-end" type="time">
      <button class="iconbtn tt-del">${icon("trash")}</button></div>`);
    div.querySelector(".tt-del").addEventListener("click", () => div.remove());
    ov.querySelector("#tt-rows").appendChild(div);
  });
  ov.querySelectorAll(".tt-del").forEach(b => b.addEventListener("click", e => e.target.closest(".tt-row").remove()));
  ov.querySelector("#cf-save").addEventListener("click", () => {
    const name = ov.querySelector("#cf-name").value.trim();
    if (!name) { ov.querySelector("#cf-name").focus(); return; }
    const timetable = [...ov.querySelectorAll(".tt-row")].map(r => ({
      day: Number(r.querySelector(".tt-day").value),
      start: r.querySelector(".tt-start").value || "",
      end: r.querySelector(".tt-end").value || "",
    })).filter(s => s.start || s.end);
    const data = {
      name,
      subject: ov.querySelector("#cf-subject").value.trim(),
      gradeLevel: ov.querySelector("#cf-grade").value.trim(),
      room: ov.querySelector("#cf-room").value.trim(),
      term: ov.querySelector("#cf-term").value.trim(),
      timetable,
    };
    if (existing) Object.assign(existing, data);
    else db.classes.push({ id: uid(), createdAt: Date.now(), archived: false, ...data });
    save(); closeDialog(); renderRoute();
  });
}

/* ---------------------------------------------------------------- Class detail */
route(/^\/class\/([a-z0-9]+)(?:\/([a-z]+))?$/, (classId, tab) => {
  const c = cls(classId);
  if (!c) { location.hash = "#/classes"; return; }
  tab = tab || "overview";
  const tabs = [["overview", "nav.overview"], ["roster", "nav.roster"], ["attendance", "nav.attendance"], ["lessons", "nav.lessons"], ["scorebook", "nav.scorebook"], ["records", "nav.records"]];
  let html = `<div style="display:flex;align-items:center;gap:10px">
      <button class="iconbtn" data-go="#/classes" aria-label="${t("act.back")}">${icon("chevR").replace('class=""', 'style="transform:rotate(180deg)"')}</button>
      <div>
        <div class="page-title">${esc(c.name)}</div>
        <div class="meta">${esc([c.subject, c.gradeLevel, c.room, c.term].filter(Boolean).join(" · "))}</div>
      </div>
      <span style="flex:1"></span>
      <button class="btn sm" data-action="edit-class" data-id="${c.id}">${icon("edit")}${esc(t("act.edit"))}</button>
    </div>
    <div class="tabs" style="margin-top:18px">
      ${tabs.map(([id, key]) => `<button class="tab${tab === id ? " active" : ""}" data-action="class-tab" data-tab="${id}" data-id="${c.id}">${esc(t(key))}</button>`).join("")}
    </div><div id="class-tab-content"></div>`;
  setView(html, "classes", `<b>${esc(c.name)}</b>`);
  const content = document.getElementById("class-tab-content");
  if (tab === "overview") renderClassOverview(content, c);
  else if (tab === "roster") renderRoster(content, c);
  else if (tab === "attendance") renderAttendance(content, c);
  else if (tab === "lessons") renderClassLessons(content, c);
  else if (tab === "scorebook") renderScorebook(content, c);
  else if (tab === "records") renderRecords(content, c);
});

/* ---------------------------------------------------------------- Overview tab */
function renderClassOverview(root, c) {
  const students = classStudents(c.id);
  const sessions = classSessions(c.id);
  const rate = SorndiCore.attendanceRate(allAttendanceForClass(c.id));
  const lessons = classLessons(c.id);
  const ready = lessons.filter(l => l.status === "ready").length;

  let html = `<div class="stat-row">
    <div class="stat"><div class="n">${students.length}</div><div class="l">${t("class.students")}</div></div>
    <div class="stat"><div class="n">${ready}</div><div class="l">${t("lesson.ready")}</div></div>
    <div class="stat"><div class="n">${sessions.length}</div><div class="l">${t("att.session")}</div></div>
    <div class="stat"><div class="n">${rate === null ? "—" : rate + "%"}</div><div class="l">${t("class.attRate")}</div></div>
  </div>`;

  if (c.timetable && c.timetable.length) {
    html += `<div class="section">${sectionHead("class.timetable", c.timetable.length)}<div class="card">`;
    for (const s of [...c.timetable].sort((a, b) => a.day - b.day || (a.start || "").localeCompare(b.start || ""))) {
      html += `<div style="display:flex;gap:14px;padding:9px 16px;border-bottom:1px solid var(--line)">
        <span class="mono small muted" style="width:36px">${esc(WEEKDAYS_SHORT[LANG][s.day])}</span>
        <span class="mono small">${esc(s.start || "")}–${esc(s.end || "")}</span></div>`;
    }
    html += `</div></div>`;
  }

  html += `<div class="section">${sectionHead("class.recentSessions", sessions.length || undefined)}
    <div class="card">`;
  if (!sessions.length) {
    html += `<div class="empty" style="padding:26px">${icon("clock")}<div class="t">${esc(t("empty.noSessions"))}</div>
      <button class="btn sm" data-action="new-session" data-id="${c.id}">${icon("plus")}${esc(t("att.newSession"))}</button></div>`;
  } else {
    for (const s of sessions.slice(0, 6)) {
      const l = s.lessonId ? lesson(s.lessonId) : null;
      const att = sessionAttendance(s.id);
      const counts = SorndiCore.attendanceSummary(Object.values(att));
      html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line);cursor:pointer" data-action="go-att" data-session="${s.id}">
        <span class="mono small" style="width:92px">${esc(fmtDateISO(s.date))}</span>
        <span style="flex:1;min-width:0">${l ? esc(l.title) : `<span class="muted">${esc(t("att.session"))}</span>`}</span>
        ${counts.not_recorded ? `<span class="chip mut">${counts.not_recorded} ·</span>` : ""}
        <span class="chip green">${counts.present}</span>
        ${counts.late ? `<span class="chip amber">${counts.late}</span>` : ""}
        ${counts.absent_unexcused + counts.absent_excused ? `<span class="chip red">${counts.absent_unexcused + counts.absent_excused}</span>` : ""}
      </div>`;
    }
  }
  html += `</div></div>`;
  root.innerHTML = html;
}

/* ---------------------------------------------------------------- Roster tab */
function renderRoster(root, c) {
  const students = db.students.filter(s => s.classId === c.id).sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0) || (a.studentNumber || "").localeCompare(b.studentNumber || "", undefined, { numeric: true }));
  let html = `<div style="display:flex;gap:8px;margin-bottom:14px">
    <button class="btn primary" data-action="add-student" data-id="${c.id}">${icon("plus")}${t("class.addStudent")}</button>
    <button class="btn" data-action="import-roster" data-id="${c.id}">${icon("upload")}${t("class.importRoster")}</button>
  </div><div class="card"><table class="table"><thead><tr>
    <th style="width:64px">${t("roster.number")}</th><th>${t("roster.name")}</th><th>${t("roster.notes")}</th><th style="width:90px"></th>
  </tr></thead><tbody>`;
  if (!students.length) {
    html += `<tr><td colspan="4"><div class="empty" style="padding:26px">${icon("users")}<div class="t">${t("class.students")}</div><div class="small">${t("roster.importHint")}</div></div></td></tr>`;
  } else {
    for (const s of students) {
      html += `<tr ${s.active ? "" : 'style="opacity:.45"'}>
        <td class="num">${esc(s.studentNumber)}</td>
        <td>${esc(s.fullName)}${s.active ? "" : ` <span class="chip mut">${t("class.archive")}</span>`}</td>
        <td class="muted small">${esc(s.notes || "")}</td>
        <td class="actions"><button class="iconbtn" data-action="edit-student" data-id="${s.id}" aria-label="${t("act.edit")}">${icon("edit")}</button>
        <button class="iconbtn" data-action="del-student" data-id="${s.id}" aria-label="${t("act.delete")}">${icon("trash")}</button></td>
      </tr>`;
    }
  }
  html += `</tbody></table></div>`;
  root.innerHTML = html;
}

function studentDialog(c, existing) {
  openDialog(existing ? t("act.edit") : t("class.addStudent"), `
    <div class="row">
      <label class="field"><span>${t("roster.number")}</span><input class="input" id="sf-num" value="${escAttr(existing ? existing.studentNumber : nextStudentNumber(c.id))}"></label>
      <label class="field" style="flex:2.4"><span>${t("roster.name")} *</span><input class="input" id="sf-name" value="${escAttr(existing ? existing.fullName : "")}"></label>
    </div>
    <label class="field"><span>${t("roster.notes")}</span><input class="input" id="sf-notes" value="${escAttr(existing ? existing.notes : "")}"></label>
    ${existing ? `<label class="check"><input type="checkbox" id="sf-active" ${existing.active ? "checked" : ""}> ${esc(t("nav.roster"))} — ${esc(t("class.archive"))}?</label>` : ""}
  `, `<button class="btn primary" id="sf-save">${t("act.save")}</button>`);
  const ov = document.getElementById("overlay");
  ov.querySelector("#sf-save").addEventListener("click", () => {
    const name = ov.querySelector("#sf-name").value.trim();
    if (!name) { ov.querySelector("#sf-name").focus(); return; }
    const data = {
      studentNumber: ov.querySelector("#sf-num").value.trim(),
      fullName: name,
      notes: ov.querySelector("#sf-notes").value.trim(),
    };
    if (existing) {
      Object.assign(existing, data);
      if (ov.querySelector("#sf-active")) existing.active = ov.querySelector("#sf-active").checked;
    } else {
      db.students.push({ id: uid(), classId: c.id, active: true, ...data });
    }
    save(); closeDialog(); renderRoute();
  });
}

function nextStudentNumber(classId) {
  const nums = classStudents(classId, false).map(s => parseInt(s.studentNumber, 10)).filter(n => !isNaN(n));
  return String((nums.length ? Math.max(...nums) : 0) + 1);
}

function importRosterDialog(c) {
  openDialog(t("class.importRoster"), `
    <p class="hint" style="margin-bottom:10px">${t("roster.importHint")}</p>
    <textarea class="input" id="ir-text" rows="9" placeholder="1, Somchai Jaidee\n2, Malee Sookjai\nAnna Wittaya"></textarea>
  `, `<button class="btn primary" id="ir-save">${t("act.add")}</button>`);
  const ov = document.getElementById("overlay");
  ov.querySelector("#ir-save").addEventListener("click", () => {
    const lines = ov.querySelector("#ir-text").value.split("\n").map(l => l.trim()).filter(Boolean);
    let n = 0;
    let next = parseInt(nextStudentNumber(c.id), 10) || 1;
    for (const line of lines) {
      const m = line.match(/^(\d+)\s*[,.:;]?\s*(.+)$/);
      const num = m ? m[1] : String(next);
      const name = (m ? m[2] : line).trim();
      if (!name) continue;
      db.students.push({ id: uid(), classId: c.id, studentNumber: num, fullName: name, notes: "", active: true });
      next = (parseInt(num, 10) || next) + 1;
      n++;
    }
    save(); closeDialog(); renderRoute(); toast(`${n} ${t("class.students")}`);
  });
}

/* ---------------------------------------------------------------- Attendance tab */
function renderAttendance(root, c) {
  const sessions = classSessions(c.id);
  let html = `<div style="display:flex;gap:8px;margin-bottom:14px;align-items:center;flex-wrap:wrap">
    <select class="input" id="att-session" style="max-width:380px">
      ${sessions.length ? sessions.map(s => {
        const l = s.lessonId ? lesson(s.lessonId) : null;
        return `<option value="${s.id}">${esc(fmtDateISO(s.date))} · ${esc(l ? l.title : t("att.session"))}${s.startTime ? " · " + esc(s.startTime) : ""}</option>`;
      }).join("") : ""}
    </select>
    <button class="btn primary" data-action="new-session" data-id="${c.id}">${icon("plus")}${t("att.newSession")}</button>
  </div><div id="att-area"></div>`;
  if (!sessions.length) {
    html = `<div style="display:flex;gap:8px;margin-bottom:14px">
      <button class="btn primary" data-action="new-session" data-id="${c.id}">${icon("plus")}${t("att.newSession")}</button></div>
      <div class="card">${emptyState("check", "att.pickSession", esc(t("empty.noSessions")))}</div><div id="att-area"></div>`;
  }
  root.innerHTML = html;
  const sel = root.querySelector("#att-session");
  if (sel && sessions.length) {
    sel.addEventListener("change", () => renderAttendanceRows(document.getElementById("att-area"), cls(c.id), sel.value));
    renderAttendanceRows(document.getElementById("att-area"), c, sel.value);
  }
}

function sessionDialog(c) {
  const lessons = classLessons(c.id);
  openDialog(t("att.newSession"), `
    <div class="row">
      <label class="field"><span>${t("att.date")} *</span><input class="input" type="date" id="ns-date" value="${SorndiCore.todayISO()}"></label>
      <label class="field"><span>${t("today.sessions")} · ${t("class.timetable")}</span><input class="input" type="time" id="ns-time"></label>
    </div>
    <label class="field"><span>${t("nav.lessons")}</span>
      <select class="input" id="ns-lesson">
        <option value="">—</option>
        ${lessons.map(l => `<option value="${l.id}">${esc(l.title)}</option>`).join("")}
      </select></label>
  `, `<button class="btn primary" id="ns-save">${t("act.create")}</button>`);
  const ov = document.getElementById("overlay");
  ov.querySelector("#ns-save").addEventListener("click", () => {
    const date = ov.querySelector("#ns-date").value;
    if (!date) return;
    const s = {
      id: uid(), classId: c.id,
      lessonId: ov.querySelector("#ns-lesson").value || null,
      date, startTime: ov.querySelector("#ns-time").value || "",
      status: "planned", reflection: "", nextAction: "",
      createdAt: Date.now(),
    };
    db.sessions.push(s); save(); closeDialog();
    location.hash = `#/class/${c.id}/attendance`;
    renderRoute();
    setTimeout(() => {
      const sel = document.getElementById("att-session");
      if (sel) { sel.value = s.id; sel.dispatchEvent(new Event("change")); }
    }, 60);
  });
}

function renderAttendanceRows(root, c, sessionIdValue) {
  const s = session(sessionIdValue);
  if (!s) { root.innerHTML = ""; return; }
  const students = classStudents(c.id);
  const att = sessionAttendance(s.id);
  const counts = SorndiCore.attendanceSummary(students.map(st => att[st.id]));

  let html = `<div class="card">
    <div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid var(--line);flex-wrap:wrap">
      <b>${esc(fmtDateISO(s.date, { long: true }))}</b>
      ${s.lessonId && lesson(s.lessonId) ? `<span class="muted small">· ${esc(lesson(s.lessonId).title)}</span>` : ""}
      <span style="flex:1"></span>
      <button class="btn sm primary" data-action="mark-all" data-session="${s.id}">${icon("check")}${t("att.markAll")}</button>
    </div>
    <div class="attendance-summary" style="padding:10px 16px;border-bottom:1px solid var(--line)" id="att-counts">
      <span class="chip green">${t("st.present")} <span class="mono">${counts.present}</span></span>
      <span class="chip amber">${t("st.late")} <span class="mono">${counts.late}</span></span>
      <span class="chip slate">${t("st.absentExcused")} <span class="mono">${counts.absent_excused}</span></span>
      <span class="chip red">${t("st.absentUnexcused")} <span class="mono">${counts.absent_unexcused}</span></span>
      <span class="chip clay">${t("st.sick")} <span class="mono">${counts.sick}</span></span>
      <span class="chip mut" style="border-style:dashed">${t("st.notRecorded")} <span class="mono">${counts.not_recorded}</span></span>
    </div>
    <table class="table"><tbody id="att-rows">`;
  if (!students.length) {
    html += `<tr><td>${emptyState("users", "class.students", esc(t("roster.importHint")), `<button class="btn sm" data-action="add-student" data-id="${c.id}">${icon("plus")}${t("class.addStudent")}</button>`)}</td></tr>`;
  }
  for (const st of students) {
    const rec = att[st.id];
    html += attendanceRowHTML(s.id, st, rec);
  }
  html += `</tbody></table></div>
  <div class="note" style="margin-top:10px">${t("att.notCounted")}</div>`;
  root.innerHTML = html;
}

function attendanceRowHTML(sessionId, st, rec) {
  const btns = SorndiCore.ATTENDANCE_STATUSES.map(s =>
    `<button class="st-btn ${s.tone} ${rec && rec.status === s.id ? "on " + s.tone : ""}" data-att="${s.id}" data-student="${st.id}" data-session="${sessionId}" title="${esc(t(s.key))}">${esc(t(s.key))}</button>`).join("");
  const history = rec && rec.history && rec.history.length ? `
    <div class="att-history" style="display:none;margin-top:6px">
      ${rec.history.map(h => `<div class="meta">${esc(t("att.correction"))}: ${esc(t(stKey(h.from)))} → <b>${esc(t(stKey(h.to)))}</b> · ${esc(h.actor)} · ${new Date(h.at).toLocaleString(LANG === "th" ? "th-TH" : "en-GB")}</div>`).join("")}
    </div>` : "";
  return `<tr data-row="${st.id}" tabindex="0">
    <td class="num" style="width:44px">${esc(st.studentNumber)}</td>
    <td style="min-width:140px"><b>${esc(st.fullName)}</b>
      ${rec && rec.status ? `<button class="iconbtn" style="width:22px;height:22px;vertical-align:middle" data-att-history="${st.id}" title="${t("att.history")}">${icon("history")}</button>${history}` : ""}
    </td>
    <td><div class="status-btns">${btns}</div>
      <input class="input" style="margin-top:6px;max-width:340px;font-size:12.5px;padding:4px 8px" placeholder="${esc(t("roster.notes"))}…" value="${escAttr(rec && rec.note || "")}" data-att-note="${st.id}" data-session="${sessionId}">
    </td>
  </tr>`;
}

function updateAttendanceCounters(rootEl, sessionId, classId) {
  const students = classStudents(classId);
  const att = sessionAttendance(sessionId);
  const counts = SorndiCore.attendanceSummary(students.map(st => att[st.id]));
  const box = rootEl.querySelector("#att-counts");
  if (box) box.innerHTML =
    `<span class="chip green">${t("st.present")} <span class="mono">${counts.present}</span></span>
     <span class="chip amber">${t("st.late")} <span class="mono">${counts.late}</span></span>
     <span class="chip slate">${t("st.absentExcused")} <span class="mono">${counts.absent_excused}</span></span>
     <span class="chip red">${t("st.absentUnexcused")} <span class="mono">${counts.absent_unexcused}</span></span>
     <span class="chip clay">${t("st.sick")} <span class="mono">${counts.sick}</span></span>
     <span class="chip mut" style="border-style:dashed">${t("st.notRecorded")} <span class="mono">${counts.not_recorded}</span></span>`;
}
