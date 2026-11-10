/* ================================================================ SORNDI views 3
   Studio: lessons and quizzes. Quiz runner. Tools. */

/* ---------------------------------------------------------------- Studio */
route(/^\/studio$/, () => {
  const lessons = [...db.lessons].sort((a, b) => b.createdAt - a.createdAt);
  const quizzes = [...db.quizzes].sort((a, b) => b.createdAt - a.createdAt);
  let html = `<div style="display:flex;align-items:center;gap:12px">
    <div><div class="page-title">${t("nav.studio")}</div></div>
  </div>
  <div class="tabs" style="margin-top:18px">
    <button class="tab active" data-action="studio-tab" data-tab="lessons">${t("nav.lessons")} <span class="mono muted small">${lessons.length}</span></button>
    <button class="tab" data-action="studio-tab" data-tab="quizzes">${t("quiz.new").replace("New ", "")} <span class="mono muted small">${quizzes.length}</span></button>
  </div><div id="studio-tab"></div>`;
  setView(html, "studio");
  renderStudioTab(document.getElementById("studio-tab"), "lessons");
});

function renderStudioTab(root, which) {
  if (which === "lessons") {
    const lessons = [...db.lessons].sort((a, b) => b.createdAt - a.createdAt);
    let html = `<button class="btn primary" data-action="studio-new-lesson">${icon("plus")}${t("lesson.new")}</button>`;
    if (!lessons.length) {
      html += `<div class="card section">${emptyState("book", "empty.noLessons", esc("Pick a structure template and adjust the stages to your class."))}</div>`;
    } else {
      html += `<div class="card section">`;
      for (const l of lessons) {
        const c = cls(l.classId);
        const statusTone = { draft: "mut", ready: "green", taught: "slate", cancelled: "red" }[l.status] || "mut";
        html += `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line)">
          <span class="chip ${statusTone}">${t("lesson." + l.status)}</span>
          <div style="flex:1;min-width:0"><b>${esc(l.title)}</b> <span class="muted small">· ${esc(c ? c.name : "")}</span>
            <div class="meta">${l.objective ? esc(l.objective) : ""}</div></div>
          <span class="mono small muted">${SorndiCore.planTotalMinutes(l.stages)} min</span>
          <button class="btn sm ghost" data-action="studio-edit-lesson" data-id="${l.id}">${icon("edit")}${t("act.edit")}</button>
          <button class="iconbtn" data-action="del-lesson" data-id="${l.id}">${icon("trash")}</button>
        </div>`;
      }
      html += `</div>`;
    }
    root.innerHTML = html;
  } else {
    const quizzes = [...db.quizzes].sort((a, b) => b.createdAt - a.createdAt);
    let html = `<button class="btn primary" data-action="new-quiz">${icon("plus")}${t("quiz.new")}</button>`;
    if (!quizzes.length) {
      html += `<div class="card section">${emptyState("quiz", "empty.noQuizzes", esc("Multiple choice, 4 options, with explanations. Runs on the projector or on one shared device."))}</div>`;
    } else {
      html += `<div class="card section">`;
      for (const q of quizzes) {
        const c = cls(q.classId);
        html += `<div style="display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid var(--line)">
          <div style="flex:1;min-width:0"><b>${esc(q.title)}</b> <span class="muted small">· ${esc(c ? c.name : "")}</span>
            <div class="meta mono">${q.questions.length} ${t("quiz.question")} · ${q.seconds || 30}s</div></div>
          <button class="btn sm" data-action="run-quiz" data-id="${q.id}">${icon("play")}${t("quiz.run")}</button>
          <button class="btn sm ghost" data-action="edit-quiz" data-id="${q.id}">${icon("edit")}${t("act.edit")}</button>
          <button class="iconbtn" data-action="del-quiz" data-id="${q.id}">${icon("trash")}</button>
        </div>`;
      }
      html += `</div>`;
    }
    root.innerHTML = html;
  }
}

function studioLessonDialog(existing) {
  const classOpts = db.classes.filter(c => !c.archived).map(c => `<option value="${c.id}" ${existing && existing.classId === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  if (!db.classes.length) { toast(t("classes.empty") + " — " + t("classes.new"), true); return; }
  openDialog(existing ? t("act.edit") : t("lesson.new"), `
    <div class="row">
      <label class="field"><span>${t("nav.classes")} *</span><select class="input" id="slf-class">${classOpts}</select></label>
      <label class="field" style="flex:2"><span>Lesson title *</span><input class="input" id="slf-title" value="${escAttr(existing ? existing.title : "")}"></label>
    </div>
    <label class="field"><span>${t("lesson.objective")} *</span><input class="input" id="slf-objective" value="${escAttr(existing ? existing.objective : "")}" placeholder="Students can…"></label>
    <div class="row">
      <label class="field"><span>${t("lesson.planned")}</span><input class="input" type="date" id="slf-date" value="${escAttr(existing ? existing.plannedDate || "" : "")}"></label>
      <label class="field"><span>${t("lesson.status")}</span>
        <select class="input" id="slf-status">${["draft", "ready", "taught", "cancelled"].map(s => `<option value="${s}" ${existing && existing.status === s ? "selected" : ""}>${t("lesson." + s)}</option>`).join("")}</select></label>
    </div>
    <label class="field"><span>${t("lesson.template")}</span>
      <select class="input" id="slf-template">
        <option value="">—</option>
        ${SorndiCore.LESSON_TEMPLATES.map(tp => `<option value="${tp.id}" ${existing && existing.template === tp.id ? "selected" : ""}>${tp.stages.map(s => s.name).join(" · ")}</option>`).join("")}
      </select></label>
    <div id="slf-stages"></div>
  `, `<button class="btn primary" id="slf-save">${t("act.save")}</button>`, { wide: true });
  const ov = document.getElementById("overlay");
  function stageRow(s) {
    const div = eld_from(`<div class="row" style="align-items:center;margin-bottom:6px">
      <input class="input sg-name" style="flex:2" value="${escAttr(s.name || "")}">
      <input class="input sg-min" style="flex:0 0 76px" type="number" min="0" value="${escAttr(s.minutes ?? "")}">
      <span class="meta">min</span>
      <button class="iconbtn sg-del">${icon("x")}</button></div>`);
    div.querySelector(".sg-del").addEventListener("click", () => { div.remove(); updateTotal(); });
    return div;
  }
  function readStages() {
    return [...ov.querySelectorAll("#slf-stages .row")].map(r => ({
      name: r.querySelector(".sg-name").value.trim(),
      minutes: parseInt(r.querySelector(".sg-min").value, 10) || 0,
    })).filter(s => s.name);
  }
  function updateTotal() {
    const box = ov.querySelector("#slf-total");
    if (box) box.innerHTML = `<span class="mono">${SorndiCore.planTotalMinutes(readStages())}</span> min`;
  }
  function renderStages(stages) {
    const box = ov.querySelector("#slf-stages");
    box.innerHTML = `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
      <b class="small">${esc(t("lesson.stages"))}</b><span class="meta" id="slf-total"></span></div>`;
    for (const s of stages) box.appendChild(stageRow(s));
    box.insertAdjacentHTML("beforeend", `<button class="btn sm" id="sg-add">${icon("plus")}${t("act.add")}</button>`);
    box.querySelector("#sg-add").addEventListener("click", () => { box.querySelector("#sg-add").before(stageRow({})); updateTotal(); });
    box.addEventListener("input", updateTotal);
    updateTotal();
  }
  if (existing && existing.stages) renderStages(existing.stages); else renderStages([]);
  ov.querySelector("#slf-template").addEventListener("change", e => {
    const stages = SorndiCore.templateStages(e.target.value);
    if (stages) renderStages(stages);
  });
  ov.querySelector("#slf-save").addEventListener("click", () => {
    const title = ov.querySelector("#slf-title").value.trim();
    if (!title) { ov.querySelector("#slf-title").focus(); return; }
    const data = {
      classId: ov.querySelector("#slf-class").value,
      title,
      objective: ov.querySelector("#slf-objective").value.trim(),
      plannedDate: ov.querySelector("#slf-date").value || null,
      status: ov.querySelector("#slf-status").value,
      template: ov.querySelector("#slf-template").value || null,
      stages: readStages(),
    };
    if (existing) Object.assign(existing, data);
    else db.lessons.push({ id: uid(), createdAt: Date.now(), ...data });
    save(); closeDialog(); renderRoute();
  });
}

/* ---------------------------------------------------------------- Quiz editor */
function quizDialog(existing) {
  if (!db.classes.length) { toast(t("classes.empty"), true); return; }
  const classOpts = db.classes.filter(c => !c.archived).map(c => `<option value="${c.id}" ${existing && existing.classId === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("");
  openDialog(existing ? t("act.edit") : t("quiz.new"), `
    <div class="row">
      <label class="field"><span>${t("nav.classes")}</span><select class="input" id="qf-class">${classOpts}</select></label>
      <label class="field" style="flex:2"><span>Quiz title *</span><input class="input" id="qf-title" value="${escAttr(existing ? existing.title : "")}"></label>
    </div>
    <label class="field"><span>${t("lesson.objective")}</span><input class="input" id="qf-objective" value="${escAttr(existing ? existing.objective || "" : "")}"></label>
    <div class="row">
      <label class="field"><span>${t("tools.timer")} (s/question)</span><input class="input" type="number" id="qf-seconds" value="${existing ? existing.seconds || 30 : 30}" min="5" max="300"></label>
    </div>
    <div id="qf-questions"></div>
    <button class="btn sm" id="qf-add">${icon("plus")}${t("quiz.question")}</button>
  `, `<button class="btn primary" id="qf-save">${t("act.save")}</button>`, { wide: true });
  const ov = document.getElementById("overlay");
  const box = ov.querySelector("#qf-questions");

  function qCard(q, i) {
    const div = eld_from(`<div class="card" style="padding:14px;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
        <b class="mono muted">Q${i + 1}</b><span style="flex:1"></span>
        <button class="iconbtn qf-del" aria-label="${t("act.remove")}">${icon("trash")}</button></div>
      <input class="input qf-prompt" placeholder="${esc(t("quiz.prompt"))}" value="${escAttr(q.prompt || "")}">
      <div style="height:8px"></div>
      ${[0, 1, 2, 3].map(o => `<div class="row" style="margin-bottom:6px;align-items:center">
        <label class="check" style="flex:0 0 auto"><input type="radio" class="qf-correct" name="qc-${Date.now()}-${i}" ${q.correct === o ? "checked" : ""}></label>
        <input class="input qf-opt" data-o="${o}" value="${escAttr(q.options && q.options[o] || "")}" placeholder="${esc(t("quiz.option"))} ${o + 1}">
      </div>`).join("")}
      <input class="input qf-explain" placeholder="${esc(t("quiz.explain"))}" value="${escAttr(q.explanation || "")}">
    </div>`);
    div.querySelector(".qf-del").addEventListener("click", () => { div.remove(); renumber(); });
    return div;
  }
  function renumber() {
    [...box.children].forEach((d, i) => d.querySelector(".mono").textContent = "Q" + (i + 1));
  }
  function addQ(q) { box.appendChild(qCard(q || {}, box.children.length)); renumber(); }
  ov.querySelector("#qf-add").addEventListener("click", () => addQ());

  if (existing) { for (const q of existing.questions) addQ(q); } else { addQ(); addQ(); }

  ov.querySelector("#qf-save").addEventListener("click", () => {
    const title = ov.querySelector("#qf-title").value.trim();
    if (!title) { ov.querySelector("#qf-title").focus(); return; }
    const questions = [...box.children].map(d => ({
      prompt: d.querySelector(".qf-prompt").value.trim(),
      options: [...d.querySelectorAll(".qf-opt")].map(o => o.value.trim()),
      correct: [...d.querySelectorAll(".qf-correct")].findIndex(r => r.checked),
      explanation: d.querySelector(".qf-explain").value.trim(),
    })).filter(q => q.prompt && q.options.filter(Boolean).length >= 2);
    if (!questions.length) { toast("Add at least one question with two options", true); return; }
    const data = {
      classId: ov.querySelector("#qf-class").value,
      title,
      objective: ov.querySelector("#qf-objective").value.trim(),
      seconds: Math.max(5, Number(ov.querySelector("#qf-seconds").value) || 30),
      questions,
    };
    if (existing) Object.assign(existing, data);
    else db.quizzes.push({ id: uid(), createdAt: Date.now(), ...data });
    save(); closeDialog(); renderRoute();
  });
}

/* ---------------------------------------------------------------- Quiz runner */
let runner = null;

route(/^\/run\/([a-z0-9]+)$/, (quizId) => {
  const q = quiz(quizId);
  if (!q) { location.hash = "#/studio"; return; }
  runner = { quiz: q, mode: null, idx: 0, tallies: q.questions.map(() => [0, 0, 0, 0]), teams: null, teamIdx: 0, revealed: false, timer: null, timeLeft: 0, startedAt: Date.now(), sessionId: null };
  const sessions = classSessions(q.classId);
  setView(`
    <div style="display:flex;align-items:center;gap:10px">
      <button class="iconbtn" data-go="#/studio" aria-label="${t("act.back")}">${icon("chevR").replace('class=""', 'style="transform:rotate(180deg)"')}</button>
      <div class="page-title">${esc(q.title)}</div>
    </div>
    <p class="page-sub">${esc(t("quiz.modeNote"))}</p>
    ${sessions.length ? `<label class="field" style="max-width:420px;margin-top:12px"><span>${t("att.session")} — ${esc(t("quiz.saveRun"))}</span>
      <select class="input" id="run-session"><option value="">—</option>${sessions.map(s => {
        const l = s.lessonId ? lesson(s.lessonId) : null;
        return `<option value="${s.id}">${esc(fmtDateISO(s.date))} · ${esc(l ? l.title : t("att.session"))}</option>`;
      }).join("")}</select></label>` : ""}
    <div class="grid-2 section" style="max-width:760px">
      <div class="card pad" style="cursor:pointer" data-action="run-mode" data-mode="projector">
        <h3 style="font-size:16px;margin-bottom:6px">${icon("printer")} ${t("quiz.projector")}</h3>
        <p class="small muted">${t("quiz.tapTally")}. ${esc("No student devices needed.")}</p>
      </div>
      <div class="card pad" style="cursor:pointer" data-action="run-mode" data-mode="shared">
        <h3 style="font-size:16px;margin-bottom:6px">${icon("users")} ${t("quiz.shared")}</h3>
        <p class="small muted">${esc("Teams answer in turn on this device or tablet.")}</p>
      </div>
    </div>`, "studio");
});

function runnerShell(inner) {
  const q = runner.quiz;
  return `<div class="quiz-stage">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px">
      <button class="iconbtn" data-action="run-exit" aria-label="${t("act.close")}">${icon("x")}</button>
      <div class="mono muted">Q${runner.idx + 1}/${q.questions.length}</div>
      <div class="timer-bar" style="flex:1"><div id="timer-fill" style="width:100%"></div></div>
      <button class="btn sm" data-action="run-mode-switch">${runner.mode === "projector" ? t("quiz.shared") : t("quiz.projector")}</button>
    </div>
    ${inner}
  </div>`;
}

function renderQuestion() {
  const q = runner.quiz;
  const qq = q.questions[runner.idx];
  const main = document.getElementById("view");
  if (runner.mode === "projector") {
    main.innerHTML = `<div class="view">${runnerShell(`
      <div class="quiz-q serif">${esc(qq.prompt)}</div>
      <div class="quiz-opts">
        ${qq.options.map((o, oi) => o ? `<button class="quiz-opt ${runner.revealed && oi === qq.correct ? "correct" : ""}" data-tally="${oi}">
          <span class="key">${"ABCD"[oi]}</span><span>${esc(o)}</span>
          ${runner.revealed ? `<span class="tally mono">${runner.tallies[runner.idx][oi]}</span>` : `<span class="tally mono muted">${runner.tallies[runner.idx][oi] || ""}</span>`}
        </button>` : "").join("")}
      </div>
      ${runner.revealed ? `<div class="card pad" style="margin-top:18px"><b>${esc(qq.options[qq.correct] || "")}</b><p class="small muted" style="margin-top:4px">${esc(qq.explanation || "")}</p></div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn primary" data-action="run-next">${runner.idx + 1 < q.questions.length ? t("quiz.next") : t("quiz.finish")}${icon("arrowR")}</button>
        </div>` : `<div style="display:flex;gap:8px;margin-top:22px">
        <button class="btn primary" data-action="run-reveal">${icon("check")}${t("quiz.reveal")}</button>
        <span class="meta" style="align-self:center">${esc(t("quiz.tapTally"))}</span></div>`}
    `)}</div>`;
  } else {
    // shared device: teams answer in turn
    const teams = runner.teams;
    main.innerHTML = `<div class="view">${runnerShell(`
      <div class="quiz-q serif">${esc(qq.prompt)}</div>
      <div class="meta" style="margin-top:8px">${esc(teams[runner.teamIdx].name)}</div>
      <div class="quiz-opts">
        ${qq.options.map((o, oi) => o ? `<button class="quiz-opt ${runner.revealed && oi === qq.correct ? "correct" : ""}" data-answer="${oi}">
          <span class="key">${"ABCD"[oi]}</span><span>${esc(o)}</span>
        </button>` : "").join("")}
      </div>
      ${runner.revealed ? `<div class="card pad" style="margin-top:18px"><b>${esc(qq.options[qq.correct] || "")}</b><p class="small muted" style="margin-top:4px">${esc(qq.explanation || "")}</p></div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn primary" data-action="run-next">${runner.idx + 1 < q.questions.length ? t("quiz.next") : t("quiz.finish")}${icon("arrowR")}</button>
        </div>` : `<div class="meta" style="margin-top:18px">${esc("The team taps its answer, then pass the device on.")}</div>`}
    `)}</div>`;
  }
  startTimer();
}

function startTimer() {
  stopTimer();
  const q = runner.quiz;
  const qq = q.questions[runner.idx];
  if (!qq || runner.revealed) { updateTimerBar(0); return; }
  runner.timeLeft = q.seconds || 30;
  updateTimerBar(1);
  runner.timer = setInterval(() => {
    runner.timeLeft--;
    updateTimerBar(runner.timeLeft / (q.seconds || 30));
    if (runner.timeLeft <= 0) { stopTimer(); if (runner.mode === "projector") doReveal(); }
  }, 1000);
}
function stopTimer() { if (runner && runner.timer) { clearInterval(runner.timer); runner.timer = null; } }
function updateTimerBar(frac) {
  const fill = document.getElementById("timer-fill");
  if (fill) fill.style.width = Math.max(0, Math.min(1, frac)) * 100 + "%";
}
function doReveal() {
  if (!runner) return;
  runner.revealed = true;
  stopTimer();
  renderQuestion();
}

function finishRun() {
  stopTimer();
  const q = runner.quiz;
  const results = q.questions.map((qq, i) => {
    const tally = runner.tallies[i];
    const totalAnswers = tally.reduce((s, n) => s + n, 0);
    return { prompt: qq.prompt, correct: qq.correct, options: qq.options, tally, totalAnswers, correctPct: totalAnswers ? Math.round((tally[qq.correct] || 0) / totalAnswers * 100) : null };
  });
  if (runner.mode === "shared" && runner.teams) {
    openDialog(t("quiz.results"), `
      <div class="card"><table class="table"><thead><tr><th>#</th><th>${t("tools.teams")}</th><th style="text-align:right">${t("quiz.correct")}</th></tr></thead><tbody>
      ${runner.teams.map((tm, i) => `<tr><td class="mono">${i + 1}</td><td>${esc(tm.name)}</td><td class="mono" style="text-align:right">${tm.score}/${tm.answered || 0}</td></tr>`).join("")}
      </tbody></table></div>`, `<button class="btn primary" id="qr-save">${t("quiz.saveRun")}</button>`);
  } else {
    openDialog(t("quiz.results"), `
      ${results.map((r, i) => `<div style="margin-bottom:14px">
        <div class="small" style="margin-bottom:4px"><b class="mono">Q${i + 1}</b> ${esc(r.prompt)}</div>
        ${r.totalAnswers ? `<div class="timer-bar" style="height:10px"><div style="width:${r.correctPct}%;background:${r.correctPct >= 60 ? "var(--accent)" : "var(--amber)"}"></div></div>
        <div class="meta mono">${r.correctPct}% ${t("quiz.correct")} · ${r.totalAnswers} answers</div>`
        : `<div class="meta">—</div>`}
      </div>`).join("")}
    `, `<button class="btn primary" id="qr-save">${t("quiz.saveRun")}</button>`, { wide: true });
  }
  document.getElementById("qr-save").addEventListener("click", () => {
    const sel = document.getElementById("run-session");
    db.quizRuns.push({
      id: uid(), quizId: q.id, sessionId: sel ? (sel.value || null) : null,
      date: SorndiCore.todayISO(), mode: runner.mode,
      results, teams: runner.mode === "shared" ? runner.teams : null,
      createdAt: Date.now(),
    });
    save(); closeDialog(); runner = null;
    location.hash = "#/studio";
    toast(t("saved"));
  });
}

/* ---------------------------------------------------------------- Tools */
route(/^\/tools$/, () => {
  setView(`
    <div class="page-title">${t("nav.tools")}</div>
    <div class="grid-3 section">
      <div class="card pad" id="tool-pick">
        <h3 style="font-size:15px;margin-bottom:4px">${icon("user")} ${t("tools.pick")}</h3>
        <p class="small muted" style="margin-bottom:12px">${t("tools.pickDesc")}</p>
        <select class="input" id="pick-class">${classOptions()}</select>
        <div class="pick-name serif" id="pick-name">—</div>
        <div class="meta" id="pick-left" style="text-align:center;margin-bottom:12px"></div>
        <div style="display:flex;gap:8px;justify-content:center">
          <button class="btn primary" data-action="tool-pick">${t("tools.pickOne")}</button>
          <button class="btn ghost" data-action="tool-pick-reset">${t("tools.reset")}</button>
        </div>
      </div>
      <div class="card pad" id="tool-teams">
        <h3 style="font-size:15px;margin-bottom:4px">${icon("users")} ${t("tools.teams")}</h3>
        <p class="small muted" style="margin-bottom:12px">${t("tools.teamsDesc")}</p>
        <select class="input" id="teams-class">${classOptions()}</select>
        <div class="row" style="margin-top:8px">
          <label class="field" style="margin-bottom:0"><span>${t("tools.teamCount")}</span><input class="input" type="number" id="teams-n" value="4" min="2" max="12"></label>
          <div style="align-self:flex-end;padding-bottom:14px"><button class="btn primary" data-action="tool-teams">${t("tools.start")}</button></div>
        </div>
        <div id="teams-out" class="small"></div>
      </div>
      <div class="card pad" id="tool-timer">
        <h3 style="font-size:15px;margin-bottom:4px">${icon("timer")} ${t("tools.timer")}</h3>
        <p class="small muted" style="margin-bottom:12px">${t("tools.timerDesc")}</p>
        <div class="row" style="align-items:flex-end">
          <label class="field"><span>${t("tools.minutes")}</span><input class="input" type="number" id="timer-min" value="5" min="1" max="120"></label>
          <button class="btn primary" data-action="timer-start" style="margin-bottom:14px">${t("tools.start")}</button>
        </div>
        <div class="big-count" id="timer-display">00:00</div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn sm" data-action="timer-pause" id="timer-pausebtn">${t("tools.pause")}</button>
          <button class="btn sm ghost" data-action="timer-reset">${t("tools.reset")}</button>
        </div>
      </div>
    </div>`, "tools");
  updatePickLeft();
});

function classOptions() {
  return db.classes.filter(c => !c.archived).map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join("");
}

let pickState = {};
let teamsState = null;
let timerState = null;

function updatePickLeft() {
  const sel = document.getElementById("pick-class");
  const left = document.getElementById("pick-left");
  if (!sel || !left) return;
  const st = pickState[sel.value] || [];
  const total = classStudents(sel.value).length;
  left.textContent = total ? `${st.length}/${total} ${t("tools.picked")}` : "";
}
