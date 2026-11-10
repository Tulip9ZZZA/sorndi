/* ================================================================ SORNDI views 4
   Exports, Settings, print report, demo data, global action dispatch, init. */

/* ---------------------------------------------------------------- Exports */
route(/^\/exports$/, () => {
  const runs = [...db.quizRuns].sort((a, b) => b.createdAt - a.createdAt);
  setView(`
    <div class="page-title">${t("exports.title")}</div>
    <p class="page-sub">${t("exports.hint")}</p>
    <div class="card pad section" style="max-width:640px">
      <label class="field"><span>${t("nav.classes")}</span>
        <select class="input" id="ex-class">${classOptions()}</select></label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" data-action="ex-attendance">${icon("exports")}${t("exports.attendance")}</button>
        <button class="btn" data-action="ex-scorebook">${icon("exports")}${t("exports.scorebook")}</button>
        <button class="btn" data-action="ex-log">${icon("file")}${t("exports.log")}</button>
        <button class="btn" data-action="ex-report">${icon("printer")}${t("exports.report")}</button>
      </div>
    </div>
    <div class="section">${sectionHead("quiz.results", runs.length || undefined)}
      <div class="card">
      ${runs.length ? runs.map(r => {
        const q = quiz(r.quizId);
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid var(--line)">
          <div style="flex:1"><b>${esc(q ? q.title : "?")}</b>
            <div class="meta mono">${esc(fmtDateISO(r.date))} · ${r.mode === "projector" ? t("quiz.projector") : t("quiz.shared")}${r.sessionId ? " · " + esc(t("att.session")) : ""}</div></div>
          <button class="btn sm" data-action="ex-quizrun" data-id="${r.id}">${icon("exports")}CSV</button>
        </div>`;
      }).join("") : `<div class="empty" style="padding:24px"><div class="small">${t("exports.quizzesNone")}</div></div>`}
      </div>
    </div>
    <div class="card pad section" style="max-width:640px">
      <b>${t("exports.backup")}</b>
      <p class="small muted" style="margin:6px 0 12px">${t("set.dataNote")}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn primary" data-action="ex-backup">${icon("exports")}${t("exports.backup")}</button>
        <button class="btn" data-action="ex-restore">${icon("upload")}${t("exports.restore")}</button>
        <button class="btn danger" data-action="ex-wipe">${icon("trash")}${t("exports.wipe")}</button>
      </div>
      <input type="file" id="restore-file" accept="application/json" style="display:none">
    </div>`, "exports");
});

function exportClassId() {
  const sel = document.getElementById("ex-class");
  return sel ? sel.value : (db.classes[0] && db.classes[0].id);
}

function exportAttendanceCSV(classId) {
  const c = cls(classId); if (!c) return;
  const students = classStudents(classId, false);
  const sessions = [...classSessions(classId)].sort((a, b) => a.date.localeCompare(b.date));
  const rows = [];
  for (const s of sessions) {
    const att = sessionAttendance(s.id);
    for (const st of students) {
      const r = att[st.id];
      rows.push([s.date, s.startTime || "", c.name, (s.lessonId && lesson(s.lessonId)) ? lesson(s.lessonId).title : "", st.studentNumber, st.fullName, r ? r.status : "not_recorded", r ? r.note || "" : ""]);
    }
  }
  downloadFile(`sorndi-attendance-${slug(c.name)}.csv`,
    SorndiCore.toCSV(["date", "time", "class", "lesson", "student_number", "student", "status", "note"], rows));
  toast(t("exported"));
}

function exportScorebookCSV(classId) {
  const c = cls(classId); if (!c) return;
  const students = classStudents(classId, false);
  const assessments = classAssessments(classId);
  const headers = ["student_number", "student", ...assessments.flatMap(a => [`${a.name} (${a.maxScore},w${a.weight})`, "state"]), "weighted_total"];
  const rows = students.map(st => {
    const wt = SorndiCore.weightedTotal(assessments, st.id, getScore);
    const cells = [];
    for (const a of assessments) {
      const v = getScore(a.id, st.id);
      cells.push(typeof v === "number" ? v : "");
      cells.push(typeof v === "number" ? "scored" : v || "");
    }
    return [st.studentNumber, st.fullName, ...cells, wt.total === null ? "" : Math.round(wt.total * 10) / 10];
  });
  downloadFile(`sorndi-scorebook-${slug(c.name)}.csv`, SorndiCore.toCSV(headers, rows));
  toast(t("exported"));
}

function exportDailyLogMD(classId) {
  const c = cls(classId); if (!c) return;
  const sessions = [...classSessions(classId)].sort((a, b) => a.date.localeCompare(b.date));
  let md = `# ${c.name} — ${t("today.sessions")}\n\n`;
  for (const s of sessions) {
    const l = s.lessonId ? lesson(s.lessonId) : null;
    const att = sessionAttendance(s.id);
    const counts = SorndiCore.attendanceSummary(classStudents(classId, false).map(st => att[st.id]));
    md += `## ${s.date}${s.startTime ? " " + s.startTime : ""}\n\n`;
    if (l) md += `**${l.title}**\n\n${l.objective ? l.objective + "\n\n" : ""}`;
    md += `- ${t("nav.attendance")}: ${["present", "late", "absent_excused", "absent_unexcused", "sick", "left_early", "remote", "other", "not_recorded"]
      .map(k => `${k} ${counts[k] || 0}`).join(", ")}\n`;
    if (s.reflection) md += `- ${t("today.missingReflection").replace("missing", "")}: ${s.reflection}\n`;
    if (s.nextAction) md += `- Next: ${s.nextAction}\n`;
    md += "\n";
  }
  downloadFile(`sorndi-log-${slug(c.name)}.md`, md);
  toast(t("exported"));
}

function exportQuizRunCSV(runId) {
  const r = byId(db.quizRuns, runId); if (!r) return;
  const q = quiz(r.quizId);
  const rows = r.results.map((res, i) => [i + 1, res.prompt, res.options[res.correct] || "", res.totalAnswers, res.correctPct ?? "", ...(res.tally || [])]);
  downloadFile(`sorndi-quiz-${slug(q ? q.title : "run")}-${r.date}.csv`,
    SorndiCore.toCSV(["q", "prompt", "correct_answer", "answers", "correct_pct", "A", "B", "C", "D"], rows));
  toast(t("exported"));
}

function slug(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/gi, "-").replace(/^-+|-+$/g, "") || "class";
}

function printReport(classId) {
  location.hash = `#/print/${classId}`;
}

route(/^\/print\/([a-z0-9]+)$/, (classId) => {
  const c = cls(classId);
  if (!c) { location.hash = "#/classes"; return; }
  const students = classStudents(classId, false);
  const assessments = classAssessments(classId);
  const sessions = [...classSessions(classId)].sort((a, b) => a.date.localeCompare(b.date));
  const rows = students.map(st => {
    const wt = SorndiCore.weightedTotal(assessments, st.id, getScore);
    return `<tr><td>${esc(st.studentNumber)}</td><td>${esc(st.fullName)}</td>
      ${assessments.map(a => { const v = getScore(a.id, st.id); return `<td style="text-align:center">${typeof v === "number" ? v : (v === "excused" ? "E" : v === "missing" ? "M" : "")}</td>`; }).join("")}
      <td style="text-align:center"><b>${wt.total === null ? "" : Math.round(wt.total) + "%"}</b></td></tr>`;
  }).join("");
  let attRows = "";
  for (const s of sessions.slice(0, 40)) {
    const att = sessionAttendance(s.id);
    const counts = SorndiCore.attendanceSummary(students.map(st => att[st.id]));
    const l = s.lessonId ? lesson(s.lessonId) : null;
    attRows += `<tr><td>${esc(s.date)}</td><td>${esc(l ? l.title : "")}</td>
      <td style="text-align:center">${counts.present}</td><td style="text-align:center">${counts.late}</td>
      <td style="text-align:center">${counts.absent_excused}</td><td style="text-align:center">${counts.absent_unexcused}</td>
      <td style="text-align:center">${counts.sick}</td><td style="text-align:center">${counts.not_recorded}</td></tr>`;
  }
  setView(`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px" class="no-print">
        <button class="iconbtn" data-go="#/class/${c.id}" aria-label="${t("act.back")}">${icon("chevR").replace('class=""', 'style="transform:rotate(180deg)"')}</button>
        <b>${t("exports.report")}</b><span style="flex:1"></span>
        <button class="btn primary" onclick="window.print()">${icon("printer")}Print / PDF</button>
      </div>
      <div class="card pad" style="margin-top:16px">
        <div style="display:flex;align-items:center;gap:12px">
          ${markSVG("", "var(--ink)")}
          <div><div style="font-weight:600;font-size:16px">${esc(c.name)}</div>
          <div class="meta">${esc([c.subject, c.gradeLevel, c.room, c.term].filter(Boolean).join(" · "))} · ${esc(fmtDateISO(SorndiCore.todayISO(), { long: true }))}</div></div>
        </div>
        <h3 style="margin:22px 0 8px;font-size:14px">${t("nav.scorebook")}</h3>
        <table class="table"><thead><tr><th>${t("roster.number")}</th><th>${t("roster.name")}</th>
          ${assessments.map(a => `<th style="text-align:center">${esc(a.name)}<br><span class="mono">/${a.maxScore} w${a.weight}</span></th>`).join("")}
          <th>${t("score.total")}</th></tr></thead><tbody>${rows}</tbody></table>
        <p class="meta">total = Σ(pct × weight) / Σ(weight) · M = ${t("score.missing")} · E = ${t("score.excused")}</p>
        <h3 style="margin:22px 0 8px;font-size:14px">${t("nav.attendance")}</h3>
        <table class="table"><thead><tr><th>${t("att.date")}</th><th>${t("nav.lessons")}</th>
          <th>${t("st.present")}</th><th>${t("st.late")}</th><th>${t("st.absentExcused")}</th><th>${t("st.absentUnexcused")}</th><th>${t("st.sick")}</th><th>${t("st.notRecorded")}</th>
        </tr></thead><tbody>${attRows}</tbody></table>
      </div>
    </div>`, "exports");
});

/* ---------------------------------------------------------------- Settings */
route(/^\/settings$/, () => {
  setView(`
    <div class="page-title">${t("nav.settings")}</div>
    <div class="grid-2 section" style="max-width:860px">
      <div class="card pad">
        <h3 style="font-size:15px;margin-bottom:14px">${t("set.teacher")}</h3>
        <label class="field"><span>${t("set.teacher")}</span><input class="input" id="st-teacher" value="${escAttr(db.settings.teacherName)}"></label>
        <label class="field"><span>${t("set.school")}</span><input class="input" id="st-school" value="${escAttr(db.settings.school)}"></label>
        <div class="row">
          <label class="field"><span>${t("set.lang")}</span>
            <select class="input" id="st-lang">
              <option value="en" ${LANG === "en" ? "selected" : ""}>English</option>
              <option value="th" ${LANG === "th" ? "selected" : ""}>ไทย</option>
            </select></label>
          <label class="field"><span>${t("set.theme")}</span>
            <select class="input" id="st-theme">
              ${["light", "dark", "system"].map(v => `<option value="${v}" ${db.settings.theme === v ? "selected" : ""}>${t("set." + v)}</option>`).join("")}
            </select></label>
        </div>
        <button class="btn primary" data-action="st-save">${t("act.save")}</button>
      </div>
      <div>
        <div class="card pad">
          <h3 style="font-size:15px;margin-bottom:10px">${t("set.demo")}</h3>
          <p class="small muted" style="margin-bottom:12px">${t("set.demoNote")}</p>
          <button class="btn" data-action="load-demo">${icon("refresh")}${t("set.demo")}</button>
        </div>
        <div class="card pad" style="margin-top:16px">
          <h3 style="font-size:15px;margin-bottom:10px">${t("set.data")}</h3>
          <p class="small muted" style="margin-bottom:12px">${t("set.dataNote")}</p>
          <button class="btn" data-action="ex-backup">${icon("exports")}${t("exports.backup")}</button>
          <button class="btn danger" data-action="ex-wipe">${icon("trash")}${t("exports.wipe")}</button>
        </div>
        <div class="card pad" style="margin-top:16px">
          <h3 style="font-size:15px;margin-bottom:10px">${t("set.shortcuts")}</h3>
          <div class="small" style="line-height:2.1">
            <span class="kbd">P</span> ${t("st.present")} · <span class="kbd">L</span> ${t("st.late")} · <span class="kbd">A</span> ${t("st.absentUnexcused")} · <span class="kbd">E</span> ${t("st.absentExcused")} · <span class="kbd">S</span> ${t("st.sick")} · <span class="kbd">R</span> ${t("st.remote")}<br>
            <span class="kbd">Tab</span> → student row · <span class="kbd">Enter</span> ${t("att.history")} · <span class="kbd">Esc</span> ${t("act.close")}
          </div>
        </div>
        <div class="card pad" style="margin-top:16px">
          <h3 style="font-size:15px;margin-bottom:10px">${t("set.about")}</h3>
          <p class="small muted">SornDi v2.0 — ${t("app.tagline")}. สอนดี = teach well.<br>
          Plan less. Teach better. Share what works.<br>
          MIT licensed · <a href="https://github.com/Tulip9ZZZA/sorndi" target="_blank" rel="noopener">github.com/Tulip9ZZZA/sorndi</a></p>
        </div>
      </div>
    </div>`, "settings");
});

/* ---------------------------------------------------------------- demo data */
function loadDemo() {
  const d = defaultState();
  d.settings = { ...db.settings };
  db = d;
  const classId = uid();
  db.classes.push({
    id: classId, name: "M.2 Science — Room 204", subject: "Science", gradeLevel: "Grade 8 (ม.2)",
    room: "204", term: "Term 1 / 2569", archived: false, createdAt: Date.now(),
    timetable: [
      { day: 1, start: "08:30", end: "09:20" }, { day: 3, start: "10:20", end: "11:10" }, { day: 5, start: "13:00", end: "13:50" },
    ],
  });
  const names = [
    "Arisa Wongurai", "Chokchai Nuengplub", "Dawid Klin Pakdee", "Fahsai Bunnag", "Kanokwan Sitho",
    "Napat Chaiyaphon", "Nongnuch Rattanee", "Ploychompoo Nualpaka", "Prasert Onkla", "Primroj Boonmee",
    "Sarisa Kong-asa", "Teerapat Wongsri", "Thanwa Pumipanth", "Wanida Sukkasem", "Yodchai Kerdvichai",
  ];
  names.forEach((n, i) => {
    db.students.push({ id: uid(), classId, studentNumber: String(i + 1), fullName: n, notes: i === 3 ? "Front row, needs larger print" : "", active: true });
  });
  const objId = uid();
  db.objectives.push({ id: objId, classId, statement: "Explain how energy transforms in a simple circuit" });
  const stages = SorndiCore.templateStages("worked_example");
  const lessonId = uid();
  db.lessons.push({
    id: lessonId, classId, title: "Energy transfer in circuits", objective: "Explain how energy transforms in a simple circuit",
    template: "worked_example", stages, plannedDate: SorndiCore.todayISO(), status: "ready", createdAt: Date.now(),
  });
  const sessionId = uid();
  db.sessions.push({ id: sessionId, classId, lessonId, date: SorndiCore.todayISO(), startTime: "08:30", status: "completed", reflection: "Batteries vs bulbs analogy landed; 3 students still confuse current with energy.", nextAction: "Start next lesson with the sorting task.", createdAt: Date.now() });
  const att = ["present", "present", "present", "present", "present", "late", "present", "present", "present", "present", "sick", "present", "present", "present", "present"];
  classStudents(classId).forEach((st, i) => {
    db.attendance.push({ id: uid(), sessionId, studentId: st.id, status: att[i % att.length], note: "", history: [], updatedAt: new Date().toISOString() });
  });
  const a1 = uid();
  db.assessments.push({ id: a1, classId, name: "Circuit quiz", category: "Quiz", date: SorndiCore.todayISO(), maxScore: 10, weight: 2, objectiveId: objId, createdAt: Date.now() });
  const a2 = uid();
  db.assessments.push({ id: a2, classId, name: "Lab worksheet", category: "Classwork", date: SorndiCore.todayISO(), maxScore: 20, weight: 1, objectiveId: objId, createdAt: Date.now() });
  classStudents(classId).forEach((st, i) => {
    db.scores.push({ assessmentId: a1, studentId: st.id, value: i % 5 === 0 ? "missing" : [6, 7, 8, 9, 10, 5, 7, 8, 6, 9, 10, 4, 7, 8, 6][i % 15] });
    db.scores.push({ assessmentId: a2, studentId: st.id, value: [14, 18, 12, 20, 16, "excused", 17, 19, 15, 18, 20, 11, 16, 17, 15][i % 15] });
  });
  db.quizzes.push({
    id: uid(), classId, title: "Energy in circuits — exit quiz", objective: "Explain how energy transforms in a simple circuit",
    seconds: 30, createdAt: Date.now(),
    questions: [
      { prompt: "A bulb lights up in a closed circuit. Where does the energy come from?", options: ["The battery", "The wire", "The bulb", "The switch"], correct: 0, explanation: "Chemical energy in the battery is transformed to electrical energy, then to light and heat in the bulb." },
      { prompt: "What happens if you open the switch?", options: ["The bulb gets brighter", "Current stops and the bulb goes out", "The battery charges", "Nothing changes"], correct: 1, explanation: "An open switch breaks the loop, so no current flows." },
      { prompt: "Which material conducts electricity?", options: ["Plastic ruler", "Dry wood", "Copper wire", "Rubber band"], correct: 2, explanation: "Metals like copper have free electrons that carry current." },
    ],
  });
  save();
  location.hash = "#/today";
  renderRoute();
  toast(t("demo.loaded"));
}

function runTimer() {
  const d = document.getElementById("timer-display");
  if (!d) return;
  if (timerState) {
    if (timerState.running) {
      timerState.left = Math.max(0, timerState.left - 1);
      const m = String(Math.floor(timerState.left / 60)).padStart(2, "0");
      const s = String(timerState.left % 60).padStart(2, "0");
      d.textContent = `${m}:${s}`;
      d.style.color = timerState.left === 0 ? "var(--red)" : "";
      if (timerState.left === 0) { timerState = null; d.textContent = "00:00"; return; }
    }
    setTimeout(runTimer, 1000);
  }
}

/* ---------------------------------------------------------------- global actions */
const ACTIONS = {
  "load-demo": () => loadDemo(),
  "open-class": el => { location.hash = `#/class/${el.dataset.id}`; },
  "class-tab": el => { location.hash = `#/class/${el.dataset.id}/${el.dataset.tab}`; },
  "new-class": () => classDialog(null),
  "edit-class": el => classDialog(cls(el.dataset.id)),
  "unarchive-class": el => { const c = cls(el.dataset.id); if (c) c.archived = false; save(); renderRoute(); },
  "add-student": el => studentDialog(cls(el.dataset.id), null),
  "import-roster": el => importRosterDialog(cls(el.dataset.id)),
  "edit-student": el => {
    const s = byId(db.students, el.dataset.id);
    if (s) studentDialog(cls(s.classId), s);
  },
  "del-student": el => {
    const s = byId(db.students, el.dataset.id);
    if (s && confirm(`${t("act.delete")}: ${s.fullName}?`)) { db.students.splice(db.students.indexOf(s), 1); save(); renderRoute(); }
  },
  "new-session": el => sessionDialog(cls(el.dataset.id)),
  "go-att": el => {
    const s = session(el.dataset.session);
    if (!s) return;
    location.hash = `#/class/${s.classId}/attendance`;
    sessionStorage.setItem("sorndi.session", s.id);
    setTimeout(() => {
      const sel = document.getElementById("att-session");
      if (sel) { sel.value = s.id; sel.dispatchEvent(new Event("change")); }
    }, 80);
  },
  "open-lesson": el => { const l = lesson(el.dataset.id); if (l) lessonDialog(cls(l.classId), l); },
  "new-lesson": el => lessonDialog(cls(el.dataset.id), null),
  "edit-lesson": el => { const l = lesson(el.dataset.id); if (l) lessonDialog(cls(l.classId), l); },
  "del-lesson": el => {
    const l = lesson(el.dataset.id);
    if (l && confirm(`${t("act.delete")}: ${l.title}?`)) { db.lessons.splice(db.lessons.indexOf(l), 1); save(); renderRoute(); }
  },
  "new-session-for-lesson": el => {
    const l = lesson(el.dataset.lesson);
    if (!l) return;
    const s = { id: uid(), classId: l.classId, lessonId: l.id, date: l.plannedDate || SorndiCore.todayISO(), startTime: "", status: "planned", reflection: "", nextAction: "", createdAt: Date.now() };
    db.sessions.push(s); save();
    location.hash = `#/class/${l.classId}/attendance`;
    sessionStorage.setItem("sorndi.session", s.id);
    setTimeout(() => {
      const sel = document.getElementById("att-session");
      if (sel) { sel.value = s.id; sel.dispatchEvent(new Event("change")); }
    }, 80);
  },
  "mark-all": el => {
    const sId = el.dataset.session;
    const s = session(sId);
    const students = classStudents(s.classId);
    for (const st of students) addAttendance(sId, st.id, "present");
    renderRoute();
    const root2 = document.getElementById("att-area");
    if (root2) renderAttendanceRows(root2, s ? cls(s.classId) : null, sId);
  },
  "new-assessment": el => assessmentDialog(cls(el.dataset.id)),
  "export-scorebook": el => exportScorebookCSV(el.dataset.id),
  "new-template": el => templateDialog(cls(el.dataset.id)),
  "del-template": el => {
    const tp = byId(db.recordTemplates, el.dataset.id);
    if (tp && confirm(`${t("act.delete")}: ${tp.name}?`)) { db.recordTemplates.splice(db.recordTemplates.indexOf(tp), 1); save(); renderRoute(); }
  },
  "open-record-entry": el => recordEntryDialog(byId(db.recordTemplates, el.dataset.id)),
  "studio-tab": el => {
    document.querySelectorAll("[data-action='studio-tab']").forEach(b => b.classList.toggle("active", b === el));
    renderStudioTab(document.getElementById("studio-tab"), el.dataset.tab);
  },
  "studio-new-lesson": () => studioLessonDialog(null),
  "studio-edit-lesson": el => studioLessonDialog(lesson(el.dataset.id)),
  "new-quiz": () => quizDialog(null),
  "edit-quiz": el => quizDialog(quiz(el.dataset.id)),
  "del-quiz": el => {
    const q = quiz(el.dataset.id);
    if (q && confirm(`${t("act.delete")}: ${q.title}?`)) { db.quizzes.splice(db.quizzes.indexOf(q), 1); save(); renderRoute(); }
  },
  "run-quiz": el => { location.hash = `#/run/${el.dataset.id}`; },
  "run-mode": el => {
    if (!runner) return;
    runner.mode = el.dataset.mode;
    if (runner.mode === "shared") {
      const students = classStudents(runner.quiz.classId);
      if (!students.length) { toast(t("class.students") + " — 0", true); return; }
      runner.teams = students.map((s, i) => ({ name: `${t("tools.teams")} ${Math.floor(i / 3) + 1} · ${s.fullName.split(" ")[0]}`, studentId: s.id, score: 0, answered: 0 }));
      runner.teamIdx = 0;
    }
    renderQuestion();
  },
  "run-mode-switch": () => {
    if (!runner) return;
    const btn = document.querySelector("[data-action='run-mode-switch']");
    runner.mode = runner.mode === "projector" ? "shared" : "projector";
    if (runner.mode === "shared" && !runner.teams) {
      const students = classStudents(runner.quiz.classId);
      runner.teams = students.map((s, i) => ({ name: `${t("tools.teams")} ${Math.floor(i / 3) + 1} · ${s.fullName.split(" ")[0]}`, studentId: s.id, score: 0, answered: 0 }));
      runner.teamIdx = 0;
    }
    runner.revealed = false;
    renderQuestion();
  },
  "run-reveal": () => doReveal(),
  "run-next": () => {
    if (!runner) return;
    if (runner.idx + 1 < runner.quiz.questions.length) { runner.idx++; runner.revealed = false; renderQuestion(); }
    else finishRun();
  },
  "run-exit": () => { stopTimer(); runner = null; location.hash = "#/studio"; },
  "tool-pick": () => {
    const sel = document.getElementById("pick-class");
    const out = document.getElementById("pick-name");
    const students = classStudents(sel.value);
    if (!students.length) { out.textContent = "—"; return; }
    let picked = pickState[sel.value] || [];
    if (picked.length >= students.length) picked = [];
    const remaining = students.filter(s => !picked.includes(s.id));
    const chosen = remaining[Math.floor(Math.random() * remaining.length)];
    picked.push(chosen.id);
    pickState[sel.value] = picked;
    out.textContent = chosen.fullName;
    updatePickLeft();
  },
  "tool-pick-reset": () => {
    const sel = document.getElementById("pick-class");
    pickState[sel.value] = [];
    document.getElementById("pick-name").textContent = "—";
    updatePickLeft();
  },
  "tool-teams": () => {
    const sel = document.getElementById("teams-class");
    const n = Math.max(2, Number(document.getElementById("teams-n").value) || 4);
    const students = classStudents(sel.value);
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const teams = Array.from({ length: n }, () => []);
    shuffled.forEach((s, i) => teams[i % n].push(s));
    teamsState = teams;
    document.getElementById("teams-out").innerHTML = teams.map((tm, i) =>
      `<div style="margin-top:10px"><b>${t("tools.teams")} ${i + 1}</b> <span class="meta mono">${tm.length}</span><br>${tm.map(s => esc(s.fullName)).join(", ")}</div>`).join("");
  },
  "timer-start": () => {
    const min = Number(document.getElementById("timer-min").value) || 5;
    timerState = { total: min * 60, left: min * 60, running: true };
    document.getElementById("timer-pausebtn").textContent = t("tools.pause");
    runTimer();
  },
  "timer-pause": () => {
    if (!timerState) return;
    timerState.running = !timerState.running;
    document.getElementById("timer-pausebtn").textContent = timerState.running ? t("tools.pause") : t("tools.resume");
  },
  "timer-reset": () => {
    timerState = null;
    const d = document.getElementById("timer-display");
    if (d) d.textContent = "00:00";
  },
  "st-save": () => {
    db.settings.teacherName = document.getElementById("st-teacher").value.trim();
    db.settings.school = document.getElementById("st-school").value.trim();
    const newLang = document.getElementById("st-lang").value;
    db.settings.theme = document.getElementById("st-theme").value;
    save();
    if (newLang !== LANG) { setLang(newLang); renderShell(); }
    applyTheme();
    toast(t("saved"));
    renderRoute();
  },
  "ex-attendance": () => exportAttendanceCSV(exportClassId()),
  "ex-scorebook": () => exportScorebookCSV(exportClassId()),
  "ex-log": () => exportDailyLogMD(exportClassId()),
  "ex-report": () => printReport(exportClassId()),
  "ex-quizrun": el => exportQuizRunCSV(el.dataset.id),
  "ex-backup": () => {
    downloadFile(`sorndi-backup-${SorndiCore.todayISO()}.json`, JSON.stringify(db, null, 2), "application/json");
    toast(t("exported"));
  },
  "ex-restore": () => document.getElementById("restore-file").click(),
  "ex-wipe": () => {
    const txt = prompt(t("confirm.wipe"));
    if (txt && txt.trim().toUpperCase() === "ERASE") {
      localStorage.removeItem(STORE_KEY);
      db = defaultState();
      toast(t("exports.wipe"));
      location.hash = "#/today";
      renderRoute();
    }
  },
};

document.addEventListener("click", e => {
  // actions
  const act = e.target.closest("[data-action]");
  if (act && ACTIONS[act.dataset.action]) { e.preventDefault(); ACTIONS[act.dataset.action](act); return; }
  // quiz tally (projector)
  const tally = e.target.closest("[data-tally]");
  if (tally && runner) {
    const oi = Number(tally.dataset.tally);
    runner.tallies[runner.idx][oi]++;
    tally.querySelector(".tally").textContent = runner.tallies[runner.idx][oi];
    return;
  }
  // shared-device answer
  const ans = e.target.closest("[data-answer]");
  if (ans && runner && !runner.revealed) {
    const oi = Number(ans.dataset.answer);
    const qq = runner.quiz.questions[runner.idx];
    const team = runner.teams[runner.teamIdx];
    team.answered = (team.answered || 0) + 1;
    if (oi === qq.correct) team.score++;
    runner.tallies[runner.idx][oi]++;
    runner.teamIdx = (runner.teamIdx + 1) % runner.teams.length;
    doReveal();
    return;
  }
  // attendance status
  const stBtn = e.target.closest("[data-att]");
  if (stBtn) {
    const statusId = stBtn.dataset.att, studentId = stBtn.dataset.student, sessionId = stBtn.dataset.session;
    addAttendance(sessionId, studentId, statusId);
    const row = stBtn.closest("tr");
    const rec = sessionAttendance(sessionId)[studentId];
    const st = byId(db.students, studentId);
    row.outerHTML = attendanceRowHTML(sessionId, st, rec);
    const root2 = document.getElementById("att-area");
    if (root2) updateAttendanceCounters(root2, sessionId, clsOfSession(sessionId));
    return;
  }
  // attendance history toggle
  const hist = e.target.closest("[data-att-history]");
  if (hist) {
    const panel = hist.closest("td").querySelector(".att-history");
    if (panel) panel.style.display = panel.style.display === "none" ? "block" : "none";
    return;
  }
  // scorebook cell handled by input listener in view
});

function clsOfSession(sessionId) {
  const s = session(sessionId);
  return s ? s.classId : null;
}

/* attendance note input + keyboard shortcuts */
document.addEventListener("input", e => {
  const note = e.target.closest("[data-att-note]");
  if (note) {
    const sessionId = note.dataset.session, studentId = note.dataset.attNote;
    addAttendance(sessionId, studentId, (sessionAttendance(sessionId)[studentId] || {}).status || null, note.value);
    return;
  }
});
document.addEventListener("keydown", e => {
  const row = e.target.closest && e.target.closest("tr[data-row]");
  if (!row || e.ctrlKey || e.metaKey || e.altKey) return;
  const map = { p: "present", l: "late", a: "absent_unexcused", e: "absent_excused", s: "sick", r: "remote" };
  const k = e.key.toLowerCase();
  if (map[k]) {
    const studentId = row.dataset.row;
    const sessionIdEl = document.querySelector("#att-session");
    const sessionEl = document.querySelector("[data-att]");
    const sessionId = sessionEl ? sessionEl.dataset.session : null;
    if (sessionId) {
      addAttendance(sessionId, studentId, map[k]);
      const rec = sessionAttendance(sessionId)[studentId];
      const st = byId(db.students, studentId);
      row.outerHTML = attendanceRowHTML(sessionId, st, rec);
      const root2 = document.getElementById("att-area");
      if (root2) updateAttendanceCounters(root2, sessionId, clsOfSession(sessionId));
    }
  }
});

/* restore file input */
document.addEventListener("change", e => {
  if (e.target && e.target.id === "restore-file" && e.target.files && e.target.files[0]) {
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || parsed.version !== 2) throw new Error("not a SornDi v2 backup");
        db = Object.assign(defaultState(), parsed);
        save(); toast(t("restored")); renderShell(); renderRoute();
      } catch (err) { toast("Invalid backup file", true); }
    };
    reader.readAsText(f);
    e.target.value = "";
  }
});

/* topbar buttons */
document.getElementById("langbtn").addEventListener("click", () => {
  setLang(LANG === "en" ? "th" : "en");
  db.settings.lang = LANG; save();
  renderShell(); renderRoute();
});
document.getElementById("themebtn").addEventListener("click", () => {
  const cur = document.documentElement.dataset.theme;
  db.settings.theme = cur === "dark" ? "light" : "dark";
  save(); applyTheme(); renderShell();
});

/* keyboard: sessions preselect after route is handled via sessionStorage in go-att */

/* ---------------------------------------------------------------- init */
load();
setLang(db.settings.lang);
applyTheme();
renderShell();
renderRoute();
window.addEventListener("beforeunload", () => { clearTimeout(saveTimer); try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); } catch (e) {} });
