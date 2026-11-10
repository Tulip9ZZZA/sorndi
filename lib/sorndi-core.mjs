/* SORNDI core domain logic — pure functions, no DOM, no storage.
   Inlined into index.html at build time; imported by tests/run-tests.mjs. */

export const ATTENDANCE_STATUSES = [
  { id: "present", key: "st.present", tone: "green" },
  { id: "late", key: "st.late", tone: "amber" },
  { id: "absent_excused", key: "st.absentExcused", tone: "slate" },
  { id: "absent_unexcused", key: "st.absentUnexcused", tone: "red" },
  { id: "sick", key: "st.sick", tone: "clay" },
  { id: "left_early", key: "st.leftEarly", tone: "mut" },
  { id: "remote", key: "st.remote", tone: "teal" },
  { id: "other", key: "st.other", tone: "mut" },
];

export const LESSON_TEMPLATES = [
  {
    id: "retrieval",
    key: "tpl.retrieval",
    stages: [
      { name: "Retrieval starter", minutes: 8, note: "Recall of prior objectives, no notes" },
      { name: "Review and correct", minutes: 5, note: "Feedback on the starter" },
      { name: "New content", minutes: 12, note: "Input with worked examples" },
      { name: "Guided practice", minutes: 12, note: "Teacher circulates, checks" },
      { name: "Independent practice", minutes: 10, note: "Solo work" },
      { name: "Exit check", minutes: 3, note: "One question, all answer" },
    ],
  },
  {
    id: "worked_example",
    key: "tpl.workedExample",
    stages: [
      { name: "Worked example", minutes: 10, note: "Model the thinking aloud" },
      { name: "Guided practice", minutes: 15, note: "Completion problems" },
      { name: "Independent practice", minutes: 15, note: "Fading support" },
      { name: "Exit check", minutes: 5, note: "Evidence of the objective" },
    ],
  },
  {
    id: "discussion",
    key: "tpl.discussion",
    stages: [
      { name: "Prediction", minutes: 5, note: "Commit before reveal" },
      { name: "Pair discussion", minutes: 10, note: "Argue from evidence" },
      { name: "Compare and error analysis", minutes: 15, note: "Contrast solutions" },
      { name: "Consolidation", minutes: 10, note: "Summarise the rule" },
    ],
  },
  {
    id: "task",
    key: "tpl.task",
    stages: [
      { name: "Task brief", minutes: 10, note: "Goal, roles, success criteria" },
      { name: "Team work", minutes: 25, note: "Teacher checks in per team" },
      { name: "Share and feedback", minutes: 10, note: "Two stars and a step" },
      { name: "Reflection", minutes: 5, note: "What changed in your thinking" },
    ],
  },
  {
    id: "spaced_review",
    key: "tpl.spacedReview",
    stages: [
      { name: "Cumulative quiz", minutes: 10, note: "Mix of older objectives" },
      { name: "Reteach weak spots", minutes: 15, note: "From quiz results" },
      { name: "Practice", minutes: 15, note: "Apply again" },
      { name: "Next steps", minutes: 5, note: "Schedule the next review" },
    ],
  },
];

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

/* ------------------------------------------------------------- gradebook
   Score values: number (0..max), "missing", "excused", or null (not entered).
   Missing and excused are never counted as zero: they are excluded from both
   the sum and the weight denominator, and reported separately. */

export function scoreIsNumber(v) {
  return typeof v === "number" && isFinite(v);
}

export function assessmentStats(scores, maxScore) {
  let recorded = 0, missing = 0, excused = 0, unentered = 0, sum = 0;
  for (const v of scores) {
    if (v === null || v === undefined) { unentered++; continue; }
    if (v === "missing") { missing++; continue; }
    if (v === "excused") { excused++; continue; }
    if (scoreIsNumber(v)) { recorded++; sum += v; }
  }
  const average = recorded > 0 ? sum / recorded / maxScore * 100 : null;
  return { recorded, missing, excused, unentered, sum, average };
}

/* Weighted total per student.
   assessments: [{id, maxScore, weight}]
   getScore(assessmentId, studentId) -> value
   Returns { total, included: [{assessmentId, pct, weight, contribution}], missing, excused, weightSum }
   total is null when no numeric scores exist. */
export function weightedTotal(assessments, studentId, getScore) {
  const included = [];
  let weightSum = 0, weightedSum = 0, missing = 0, excused = 0;
  for (const a of assessments) {
    const v = getScore(a.id, studentId);
    if (v === "missing") { missing++; continue; }
    if (v === "excused") { excused++; continue; }
    if (!scoreIsNumber(v)) continue;
    if (v < 0 || v > a.maxScore) continue; // out-of-range scores are ignored, never invented
    const pct = v / a.maxScore * 100;
    included.push({ assessmentId: a.id, pct, weight: a.weight, contribution: pct * a.weight });
    weightSum += a.weight;
    weightedSum += pct * a.weight;
  }
  const total = weightSum > 0 ? weightedSum / weightSum : null;
  return { total, included, missing, excused, weightSum };
}

export function weightSumOf(assessments) {
  return assessments.reduce((s, a) => s + (Number(a.weight) || 0), 0);
}

/* ------------------------------------------------------------- attendance */

export function attendanceSummary(records) {
  // records: [{status}] with status null/undefined meaning not recorded
  const counts = { not_recorded: 0 };
  for (const s of ATTENDANCE_STATUSES) counts[s.id] = 0;
  for (const r of records) {
    const k = r && r.status && counts[r.status] !== undefined ? r.status : "not_recorded";
    counts[k]++;
  }
  return counts;
}

export function attendanceRate(records) {
  // Share of explicitly recorded, in-room-or-remote attendance over all recorded rows.
  const counted = records.filter(r => r && r.status);
  if (counted.length === 0) return null;
  const ok = counted.filter(r => r.status === "present" || r.status === "remote").length;
  return Math.round(ok / counted.length * 1000) / 10;
}

/* ------------------------------------------------------------- lesson plan */

export function templateStages(templateId) {
  const t = LESSON_TEMPLATES.find(t => t.id === templateId);
  return t ? t.stages.map(s => ({ ...s })) : null;
}

export function planTotalMinutes(stages) {
  return (stages || []).reduce((s, st) => s + (Number(st.minutes) || 0), 0);
}

export function planWarnings(stages, slotMinutes, hasObjective) {
  const warns = [];
  if (!hasObjective) warns.push("no_objective");
  const total = planTotalMinutes(stages);
  if (slotMinutes && total > slotMinutes) warns.push("over_time");
  if (total === 0) warns.push("no_stages");
  return warns;
}

/* ------------------------------------------------------------- CSV / data */

export function csvEscape(v) {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function toCSV(headers, rows) {
  return [headers.map(csvEscape).join(",")]
    .concat(rows.map(r => r.map(csvEscape).join(",")))
    .join("\r\n");
}

export function todayISO(d = new Date()) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function weekdayIndex(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay(); // 0 = Sunday
}
