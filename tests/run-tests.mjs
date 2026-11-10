#!/usr/bin/env node
/* SornDi domain tests — pure functions from lib/sorndi-core.mjs.
   Run: npm test   (or: node tests/run-tests.mjs) */

import assert from "node:assert/strict";
import {
  weightedTotal, assessmentStats, attendanceSummary, attendanceRate,
  templateStages, planTotalMinutes, planWarnings, toCSV, csvEscape,
  todayISO, weekdayIndex, weightSumOf,
} from "../lib/sorndi-core.mjs";

let passed = 0;
function test(name, fn) {
  fn();
  passed++;
  console.log("  ok -", name);
}

console.log("SORNDI core tests");

/* ---------------------------------------------------------- gradebook */
const assessments = [
  { id: "a1", maxScore: 10, weight: 2 },
  { id: "a2", maxScore: 20, weight: 1 },
];
const get = (map) => (aId, sId) => (aId === "a1" ? map.a1 : map.a2);

test("weighted total: normal case", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: 7, a2: 18 }));
  // (70×2 + 90×1) / 3 = 76.666…
  assert.ok(Math.abs(r.total - 76.66666666666667) < 1e-9);
  assert.equal(r.weightSum, 3);
});

test("missing is excluded, never zero", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: "missing", a2: 18 }));
  assert.equal(r.total, 90);            // only a2 counts
  assert.equal(r.missing, 1);
  assert.equal(r.weightSum, 1);
});

test("excused is excluded, never zero", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: 10, a2: "excused" }));
  assert.equal(r.total, 100);
  assert.equal(r.excused, 1);
  assert.equal(r.weightSum, 2);
});

test("all missing yields null, not 0", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: "missing", a2: "excused" }));
  assert.equal(r.total, null);
});

test("out-of-range scores are ignored, not clamped into the average", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: 99, a2: 18 }));
  assert.equal(r.total, 90);
  assert.equal(r.included.length, 1);
});

test("unentered (null) contributes nothing and is not reported missing", () => {
  const r = weightedTotal(assessments, "s1", get({ a1: null, a2: 18 }));
  assert.equal(r.total, 90);
  assert.equal(r.missing, 0);
});

test("assessmentStats separates recorded, missing, excused, unentered", () => {
  const s = assessmentStats([5, "missing", "excused", null, 9], 10);
  assert.deepEqual(s, { recorded: 2, missing: 1, excused: 1, unentered: 1, sum: 14, average: 70 });
});

test("weightSumOf", () => {
  assert.equal(weightSumOf(assessments), 3);
});

/* ---------------------------------------------------------- attendance */
test("attendanceSummary counts statuses and leaves untouched rows as not_recorded", () => {
  const s = attendanceSummary([{ status: "present" }, { status: "late" }, {}, { status: "weird" }]);
  assert.equal(s.present, 1);
  assert.equal(s.late, 1);
  assert.equal(s.not_recorded, 2);
  assert.equal(s.absent_unexcused, 0);
});

test("attendanceRate counts present+remote over recorded rows only", () => {
  const rows = [
    { status: "present" }, { status: "remote" }, { status: "late" },
    { status: "absent_unexcused" }, { status: null },
  ];
  assert.equal(attendanceRate(rows), 50);   // 2 of 4 recorded
  assert.equal(attendanceRate([]), null);
});

/* ---------------------------------------------------------- lesson plans */
test("templateStages returns a copy that can be edited safely", () => {
  const a = templateStages("worked_example");
  a[0].minutes = 999;
  const b = templateStages("worked_example");
  assert.ok(b[0].minutes < 100);
  assert.equal(templateStages("nope"), null);
});

test("planTotalMinutes and warnings", () => {
  const stages = [{ minutes: 30 }, { minutes: 15 }];
  assert.equal(planTotalMinutes(stages), 45);
  assert.deepEqual(planWarnings(stages, 40, true), ["over_time"]);
  assert.deepEqual(planWarnings(stages, 45, false), ["no_objective"]);
  assert.deepEqual(planWarnings([], null, true), ["no_stages"]);
});

/* ---------------------------------------------------------- CSV + dates */
test("CSV escaping", () => {
  assert.equal(csvEscape("plain"), "plain");
  assert.equal(csvEscape('has "quotes"'), '"has ""quotes"""');
  assert.equal(csvEscape("a,b\nc"), '"a,b\nc"');
  const csv = toCSV(["a", "b"], [["1", "x,y"], ["2", '"q"']]);
  assert.equal(csv, "a,b\r\n1,\"x,y\"\r\n2,\"\"\"q\"\"\"");
});

test("todayISO format", () => {
  assert.match(todayISO(new Date(2026, 10, 10)), /^2026-11-10$/);
});

test("weekdayIndex maps ISO date to JS weekday", () => {
  assert.equal(weekdayIndex("2026-11-10"), 2); // Tuesday
  assert.equal(weekdayIndex("2026-11-15"), 0); // Sunday
});

console.log(`\n${passed} tests passed`);
