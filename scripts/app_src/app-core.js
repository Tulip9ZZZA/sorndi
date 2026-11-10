/* ================================================================ SORNDI app core
   State, persistence, i18n, icons, router, shared UI helpers. Vanilla JS, no deps. */

"use strict";

/* ---------------------------------------------------------------- icons */
const I = {
  today: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9.5h16M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  classes: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M12.5 8h3.5M12.5 12h3.5"/>',
  studio: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  quiz: '<path d="M3.5 6h9M3.5 12h9M3.5 18h6M14 16.5l2 2 4-4.5"/>',
  scorebook: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  records: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2.5h6v3H9zM9 11h6M9 15h4"/>',
  tools: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>',
  exports: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  settings: '<path d="M4 6h16M4 12h16M4 18h16M9 3.5v5M15 9.5v5M7 15.5v5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M3.5 19.5c.8-3.2 2.9-4.8 5.5-4.8s4.7 1.6 5.5 4.8M16.5 5.6a3 3 0 010 5.3M18 14.9c1.7.6 2.9 2 3.4 4.1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M5 20c1-3.5 3.7-5.2 7-5.2s6 1.7 7 5.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 13l4 4L19 7"/>',
  chevD: '<path d="M6 9l6 6 6-6"/>',
  chevR: '<path d="M9 6l6 6-6 6"/>',
  trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"/>',
  edit: '<path d="M4 20l4.5-1L20 7.5 16.5 4 5 15.5 4 20z"/>',
  warning: '<path d="M10.3 4.4L2.7 17.4a2 2 0 001.7 3.1h15.2a2 2 0 001.7-3.1L13.7 4.4a2 2 0 00-3.4 0zM12 9.5v4.5M12 17v.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11.5V16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 108.5-8.5A8.5 8.5 0 004 8M3.5 3.5V8H8M12 7.5V12l3 2"/>',
  dots: '<circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/>',
  arrowR: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14.5 14.5 0 010 18M12 3a14.5 14.5 0 000 18"/>',
  upload: '<path d="M12 15V4M7 9l5-5 5 5M5 20h14"/>',
  printer: '<path d="M7 8V3h10v5M7 17H4V8h16v9h-3M7 13h10v8H7z"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h8"/>',
  play: '<path d="M8 5.5l10 6.5-10 6.5v-13z"/>',
  pause: '<path d="M9 5.5v13M15 5.5v13"/>',
  refresh: '<path d="M20 12a8 8 0 11-2.34-5.66M20 3.5V8h-4.5"/>',
  file: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9.5 13h5M9.5 17h5"/>',
  chart: '<path d="M4 20V4M4 20h16M8.5 16v-5M13 16V8M17.5 16v-3"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 13V9.5M9.5 2h5"/>',
  book: '<path d="M4 5a2 2 0 012-2h13v17H6a2 2 0 00-2 2V5zM9 3v17"/>',
};

function icon(name, cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ""}</svg>`;
}

const MARK_PATH = 'M196 74 H104 A32 32 0 0 0 104 138 H152 A32 32 0 0 1 152 202 H60';
function markSVG(cls, color) {
  return `<svg class="${cls || ""}" viewBox="36 44 184 184" fill="none" aria-hidden="true"><path d="${MARK_PATH}" stroke="${color || "currentColor"}" stroke-width="44"/></svg>`;
}
const TAB_GLYPH = '<svg class="tab-glyph" viewBox="0 0 10 12" aria-hidden="true"><path d="M1 1h8v5H1z M1 6h5v5H1z" fill="currentColor" opacity="0.85"/></svg>';

/* ---------------------------------------------------------------- i18n */
const I18N = {
  en: {
    "app.tagline": "Teacher OS",
    "nav.today": "Today", "nav.classes": "Classrooms", "nav.studio": "Studio",
    "nav.tools": "Tools", "nav.exports": "Exports", "nav.settings": "Settings",
    "nav.overview": "Overview", "nav.roster": "Roster", "nav.attendance": "Attendance",
    "nav.lessons": "Lessons", "nav.scorebook": "Scorebook", "nav.records": "Daily records",
    "st.present": "Present", "st.late": "Late", "st.absentExcused": "Absent - excused",
    "st.absentUnexcused": "Absent", "st.sick": "Sick", "st.leftEarly": "Left early",
    "st.remote": "Remote", "st.other": "Other", "st.notRecorded": "Not recorded",
    "act.save": "Save", "act.cancel": "Cancel", "act.delete": "Delete", "act.edit": "Edit",
    "act.close": "Close", "act.add": "Add", "act.create": "Create", "act.open": "Open",
    "act.back": "Back", "act.done": "Done", "act.remove": "Remove",
    "today.title": "Today",
    "today.sessions": "Sessions today", "today.needs": "Needs attention",
    "today.upcoming": "Coming up", "today.start": "Start your day",
    "today.noSessions": "No sessions scheduled today",
    "today.createFirst": "Create a class, add your roster, and plan a lesson - it all starts there.",
    "today.takeAttendance": "Take attendance", "today.openLesson": "Open lesson",
    "today.missingReflection": "Reflection missing", "today.attendanceNotRecorded": "Attendance not recorded",
    "today.prepare": "Prepare",
    "classes.title": "Classrooms", "classes.new": "New class", "classes.empty": "No classes yet",
    "class.students": "students", "class.subject": "Subject", "class.grade": "Grade level",
    "class.room": "Room", "class.term": "Term", "class.name": "Class name",
    "class.timetable": "Timetable", "class.archive": "Archive", "class.unarchive": "Restore",
    "class.attRate": "Attendance recorded", "class.recentSessions": "Recent sessions",
    "class.addStudent": "Add student", "class.importRoster": "Paste roster",
    "roster.number": "No.", "roster.name": "Student name", "roster.notes": "Notes",
    "roster.importHint": "One student per line. Use number,name for a numbered roster - the number is optional.",
    "att.newSession": "New session", "att.markAll": "Mark all present", "att.history": "History",
    "att.notCounted": "Rows left untouched stay Not recorded - they are never counted as absent.",
    "att.correction": "Correction", "att.by": "by", "att.session": "Session", "att.date": "Date",
    "att.pickSession": "Choose a session to record attendance",
    "lesson.new": "New lesson", "lesson.objective": "Learning objective",
    "lesson.template": "Structure template", "lesson.stages": "Lesson stages",
    "lesson.totalTime": "Total time", "lesson.status": "Status", "lesson.planned": "Planned date",
    "lesson.openStudio": "Open in Studio", "lesson.generate": "Generate stages",
    "warn.noObjective": "This lesson has no learning objective yet",
    "warn.overTime": "The stages run longer than the timetable slot",
    "lesson.draft": "Draft", "lesson.ready": "Ready", "lesson.taught": "Taught", "lesson.cancelled": "Cancelled",
    "score.new": "New assessment", "score.name": "Assessment", "score.category": "Category",
    "score.max": "Max score", "score.weight": "Weight", "score.missing": "Missing",
    "score.excused": "Excused", "score.total": "Weighted total", "score.showMath": "Show the calculation",
    "score.formulaTitle": "How this total is calculated",
    "score.noScore": "No scored work yet",
    "quiz.new": "New quiz", "quiz.question": "Question", "quiz.prompt": "Question prompt",
    "quiz.option": "Option", "quiz.correct": "Correct", "quiz.explain": "Explanation",
    "quiz.run": "Run quiz", "quiz.preview": "Preview", "quiz.projector": "Projector / tally",
    "quiz.shared": "Shared device", "quiz.reveal": "Reveal answer", "quiz.next": "Next",
    "quiz.finish": "Finish", "quiz.results": "Results", "quiz.saveRun": "Save results",
    "quiz.modeNote": "Runs on this device only. No student accounts, no internet needed.",
    "quiz.tapTally": "Tap a letter for each answer you see or hear",
    "records.new": "New record template", "records.fields": "Fields",
    "records.entry": "Enter records", "records.na": "N/A",
    "records.absenceRule": "An absent student is prefilled Not applicable - you can change it.",
    "tools.pick": "Random student", "tools.teams": "Team maker", "tools.timer": "Class timer",
    "tools.pickDesc": "Pick a student. Everyone comes up once before anyone repeats.",
    "tools.teamsDesc": "Split the roster into balanced, random teams.",
    "tools.timerDesc": "A big countdown for the whole room.",
    "tools.pick": "Random student", "tools.teams": "Team maker", "tools.timer": "Class timer",
    "tools.reset": "Reset", "tools.pickOne": "Pick", "tools.teamCount": "Number of teams",
    "tools.minutes": "Minutes", "tools.start": "Start", "tools.pause": "Pause",
    "tools.resume": "Resume", "tools.remaining": "remaining", "tools.picked": "Picked",
    "exports.title": "Exports", "exports.attendance": "Attendance CSV",
    "exports.scorebook": "Scorebook CSV", "exports.log": "Daily log (Markdown)",
    "exports.report": "Class report (print)", "exports.quiz": "Quiz results CSV",
    "exports.backup": "Full backup (JSON)", "exports.restore": "Restore backup",
    "exports.wipe": "Erase all data", "exports.hint": "Every export is generated in your browser from your own data.",
    "exports.quizzesNone": "No saved quiz runs yet",
    "set.teacher": "Teacher name", "set.school": "School (optional)", "set.lang": "Language",
    "set.theme": "Theme", "set.light": "Light", "set.dark": "Dark", "set.system": "System",
    "set.demo": "Load demo class", "set.demoNote": "Replaces current data with a realistic sample class.",
    "set.data": "Data and privacy", "set.dataNote": "SornDi keeps everything in this browser. Nothing is sent to any server. A backup is a single JSON file you own.",
    "set.shortcuts": "Keyboard", "set.about": "About",
    "shell.foot1": "Local-first · No account", "shell.foot2": "Data stays in this browser",
    "demo.loaded": "Demo class loaded",
    "saved": "Saved", "exported": "Downloaded", "restored": "Backup restored",
    "confirm.wipe": "This deletes every class, student and record in this browser. Type ERASE to confirm.",
    "empty.noLessons": "No lessons yet", "empty.noQuizzes": "No quizzes yet",
    "empty.noAssessments": "No assessments yet", "empty.noRecords": "No record templates yet",
    "empty.noSessions": "No sessions yet - open a lesson or create a session below",
  },
  th: {
    "app.tagline": "ระบบประจำวันครู",
    "nav.today": "วันนี้", "nav.classes": "ห้องเรียน", "nav.studio": "สตูดิโอ",
    "nav.tools": "เครื่องมือ", "nav.exports": "ส่งออก", "nav.settings": "การตั้งค่า",
    "nav.overview": "ภาพรวม", "nav.roster": "รายชื่อนักเรียน", "nav.attendance": "การเข้าเรียน",
    "nav.lessons": "แผนการสอน", "nav.scorebook": "สมุดคะแนน", "nav.records": "บันทึกประจำวัน",
    "st.present": "มาเรียน", "st.late": "มาสาย", "st.absentExcused": "ลากิจ",
    "st.absentUnexcused": "ขาดเรียน", "st.sick": "ป่วย", "st.leftEarly": "กลับก่อนเวลา",
    "st.remote": "เรียนทางไกล", "st.other": "อื่น ๆ", "st.notRecorded": "ยังไม่บันทึก",
    "act.save": "บันทึก", "act.cancel": "ยกเลิก", "act.delete": "ลบ", "act.edit": "แก้ไข",
    "act.close": "ปิด", "act.add": "เพิ่ม", "act.create": "สร้าง", "act.open": "เปิด",
    "act.back": "กลับ", "act.done": "เสร็จ", "act.remove": "เอาออก",
    "today.title": "วันนี้",
    "today.sessions": "คาบเรียนวันนี้", "today.needs": "รอดำเนินการ",
    "today.upcoming": "กำลังจะมาถึง", "today.start": "เริ่มต้นวันสอน",
    "today.noSessions": "วันนี้ไม่มีคาบเรียนที่บันทึกไว้",
    "today.createFirst": "สร้างห้องเรียน ใส่รายชื่อนักเรียน และวางแผนการสอน - ทุกอย่างเริ่มที่นี่",
    "today.takeAttendance": "เช็คการเข้าเรียน", "today.openLesson": "เปิดแผนการสอน",
    "today.missingReflection": "ยังไม่ได้สะท้อนคิด", "today.attendanceNotRecorded": "ยังไม่ได้เช็คการเข้าเรียน",
    "today.prepare": "เตรียม",
    "classes.title": "ห้องเรียน", "classes.new": "สร้างห้องเรียน", "classes.empty": "ยังไม่มีห้องเรียน",
    "class.students": "นักเรียน", "class.subject": "วิชา", "class.grade": "ระดับชั้น",
    "class.room": "ห้อง", "class.term": "ภาคเรียน", "class.name": "ชื่อห้องเรียน",
    "class.timetable": "ตารางเรียน", "class.archive": "จัดเก็บ", "class.unarchive": "กู้คืน",
    "class.attRate": "บันทึกการเข้าเรียน", "class.recentSessions": "คาบเรียนล่าสุด",
    "class.addStudent": "เพิ่มนักเรียน", "class.importRoster": "วางรายชื่อ",
    "roster.number": "เลขที่", "roster.name": "ชื่อ-นามสกุล", "roster.notes": "หมายเหตุ",
    "roster.importHint": "นักเรียนหนึ่งคนต่อบรรทัด ใส่เลขที่นำหน้าชื่อได้ เช่น 1, ดาวิด",
    "att.newSession": "เปิดคาบเรียน", "att.markAll": "ทำเป็นมาเรียนทั้งหมด", "att.history": "ประวัติ",
    "att.notCounted": "แถวที่ไม่ได้บันทึกจะคงสถานะ ยังไม่บันทึก - ไม่ถูกนับเป็นขาดเรียน",
    "att.correction": "แก้ไข", "att.by": "โดย", "att.session": "คาบเรียน", "att.date": "วันที่",
    "att.pickSession": "เลือกคาบเรียนเพื่อบันทึกการเข้าเรียน",
    "lesson.new": "แผนการสอนใหม่", "lesson.objective": "จุดประสงค์การเรียนรู้",
    "lesson.template": "โครงสร้างกิจกรรม", "lesson.stages": "ขั้นตอนการสอน",
    "lesson.totalTime": "เวลารวม", "lesson.status": "สถานะ", "lesson.planned": "วันที่จะสอน",
    "lesson.openStudio": "เปิดในสตูดิโอ", "lesson.generate": "สร้างขั้นตอนอัตโนมัติ",
    "warn.noObjective": "แผนนี้ยังไม่มีจุดประสงค์การเรียนรู้",
    "warn.overTime": "ขั้นตอนรวมเกินเวลาในตารางเรียน",
    "lesson.draft": "ร่าง", "lesson.ready": "พร้อมสอน", "lesson.taught": "สอนแล้ว", "lesson.cancelled": "ยกเลิก",
    "score.new": "เพิ่มชิ้นงาน", "score.name": "ชิ้นงาน", "score.category": "หมวด",
    "score.max": "คะแนนเต็ม", "score.weight": "น้ำหนัก", "score.missing": "ไม่ส่ง",
    "score.excused": "ยกเว้น", "score.total": "คะแนนรวมถ่วงน้ำหนัก", "score.showMath": "ดูวิธีคิด",
    "score.formulaTitle": "วิธีคำนวณคะแนนรวม",
    "score.noScore": "ยังไม่มีชิ้นงาน",
    "quiz.new": "สร้างควิซ", "quiz.question": "คำถาม", "quiz.prompt": "โจทย์คำถาม",
    "quiz.option": "ตัวเลือก", "quiz.correct": "คำตอบที่ถูก", "quiz.explain": "เฉลยและคำอธิบาย",
    "quiz.run": "เริ่มควิซ", "quiz.preview": "ดูตัวอย่าง", "quiz.projector": "โปรเจกเตอร์ / นับเงยือก",
    "quiz.shared": "เครื่องเดียวส่งกันดู", "quiz.reveal": "เฉลย", "quiz.next": "ถัดไป",
    "quiz.finish": "จบควิซ", "quiz.results": "ผลลัพธ์", "quiz.saveRun": "บันทึกผล",
    "quiz.modeNote": "ทำงานบนเครื่องนี้เท่านั้น ไม่ต้องมีบัญชีนักเรียน ไม่ต้องใช้อินเทอร์เน็ต",
    "quiz.tapTally": "แตะตัวอักษรเพื่อนับคำตอบที่เห็นหรือได้ยิน",
    "records.new": "เทมเพลตบันทึกใหม่", "records.fields": "ฟิลด์",
    "records.entry": "กรอกบันทึก", "records.na": "ไม่เกี่ยวข้อง",
    "records.absenceRule": "นักเรียนที่ขาดจะถูกกรอก ไม่เกี่ยวข้อง ให้อัตโนมัติ - แก้ไขได้",
    "tools.pick": "สุ่มนักเรียน", "tools.teams": "แบ่งกลุ่ม", "tools.timer": "จับเวลา",
    "tools.pickDesc": "สุ่มนักเรียนหนึ่งคน ทุกคนได้ถูกเรียกก่อนเริ่มวนรอบใหม่",
    "tools.teamsDesc": "แบ่งรายชื่อเป็นกลุ่มแบบสุ่มให้สมดุล",
    "tools.timerDesc": "จับเวลาแบบตัวใหญ่เห็นทั้งห้อง",
    "tools.reset": "รีเซ็ต", "tools.pickOne": "สุ่ม", "tools.teamCount": "จำนวนกลุ่ม",
    "tools.minutes": "นาที", "tools.start": "เริ่ม", "tools.pause": "หยุด",
    "tools.resume": "ทำต่อ", "tools.remaining": "ที่เหลือ", "tools.picked": "ถูกเรียกแล้ว",
    "exports.title": "ส่งออก", "exports.attendance": "การเข้าเรียน CSV",
    "exports.scorebook": "สมุดคะแนน CSV", "exports.log": "บันทึกประจำวัน (Markdown)",
    "exports.report": "รายงานห้องเรียน (พิมพ์)", "exports.quiz": "ผลควิซ CSV",
    "exports.backup": "สำรองทั้งหมด (JSON)", "exports.restore": "กู้คืนข้อมูล",
    "exports.wipe": "ลบข้อมูลทั้งหมด", "exports.hint": "ทุกไฟล์ส่งออกสร้างจากข้อมูลของคุณในเบราว์เซอร์นี้",
    "exports.quizzesNone": "ยังไม่มีผลควิซที่บันทึกไว้",
    "set.teacher": "ชื่อครู", "set.school": "โรงเรียน (ไม่บังคับ)", "set.lang": "ภาษา",
    "set.theme": "ธีม", "set.light": "สว่าง", "set.dark": "มืด", "set.system": "ตามระบบ",
    "set.demo": "โหลดห้องเรียนตัวอย่าง", "set.demoNote": "แทนที่ข้อมูลปัจจุบันด้วยห้องเรียนตัวอย่าง",
    "set.data": "ข้อมูลและความเป็นส่วนตัว", "set.dataNote": "SornDi เก็บทุกอย่างไว้ในเบราว์เซอร์นี้ ไม่ส่งข้อมูลไปเซิร์ฟเวอร์ใด ไฟล์สำรองเป็น JSON ไฟล์เดียวที่คุณเป็นเจ้าของ",
    "set.shortcuts": "คีย์ลัด", "set.about": "เกี่ยวกับ",
    "shell.foot1": "ใช้งานส่วนตัว · ไม่ต้องมีบัญชี", "shell.foot2": "ข้อมูลอยู่ในเบราว์เซอร์นี้",
    "demo.loaded": "โหลดห้องเรียนตัวอย่างแล้ว",
    "saved": "บันทึกแล้ว", "exported": "ดาวน์โหลดแล้ว", "restored": "กู้คืนข้อมูลแล้ว",
    "confirm.wipe": "การกระทำนี้จะลบทุกห้องเรียน นักเรียน และบันทึกในเบราว์เซอร์นี้ พิมพ์ ERASE เพื่อยืนยัน",
    "empty.noLessons": "ยังไม่มีแผนการสอน", "empty.noQuizzes": "ยังไม่มีควิซ",
    "empty.noAssessments": "ยังไม่มีชิ้นงาน", "empty.noRecords": "ยังไม่มีเทมเพลตบันทึก",
    "empty.noSessions": "ยังไม่มีคาบเรียน - เปิดแผนการสอนหรือเพิ่มคาบเรียนด้านล่าง",
  },
};

let LANG = "en";
function t(key) {
  return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
}
function setLang(l) {
  LANG = l === "th" ? "th" : "en";
  document.documentElement.lang = LANG === "th" ? "th" : "en";
}

const WEEKDAYS = {
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  th: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"],
};
const WEEKDAYS_SHORT = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  th: ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."],
};
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  th: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
};

function fmtDateISO(iso, opts) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const wd = WEEKDAYS[LANG][new Date(y, m - 1, d).getDay()];
  if (opts && opts.long) {
    const year = LANG === "th" ? y + 543 : y;
    return LANG === "th"
      ? `${wd} ${d} ${MONTHS.th[m - 1]} ${year}`
      : `${wd} ${d} ${MONTHS.en[m - 1]} ${y}`;
  }
  const year = LANG === "th" ? y + 543 : y;
  return LANG === "th" ? `${d}/${m}/${year}` : `${d} ${MONTHS.en[m - 1].slice(0, 3)} ${y}`;
}
function fmtDateObj(d) {
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return fmtDateISO(iso, { long: true });
}

/* ---------------------------------------------------------------- state */
const STORE_KEY = "sorndi.v2";

function defaultState() {
  return {
    version: 2,
    settings: { lang: "en", theme: "system", teacherName: "", school: "" },
    classes: [], students: [], objectives: [], lessons: [], sessions: [],
    attendance: [], assessments: [], scores: [], recordTemplates: [], recordEntries: [],
    quizzes: [], quizRuns: [],
  };
}

let db = defaultState();
let saveTimer = null;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      db = Object.assign(defaultState(), parsed);
      db.settings = Object.assign({ lang: "en", theme: "system", teacherName: "", school: "" }, parsed.settings);
    }
  } catch (e) {
    console.warn("SornDi: could not read saved data, starting fresh", e);
    db = defaultState();
  }
}

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
    catch (e) { toast("Could not save: storage is full or blocked", true); }
  }, 200);
}

function uid() { return SorndiCore.uid(); }

/* ---------------------------------------------------------------- lookups */
const byId = (arr, id) => arr.find(x => x.id === id) || null;
const cls = id => byId(db.classes, id);
const lesson = id => byId(db.lessons, id);
const session = id => byId(db.sessions, id);
const quiz = id => byId(db.quizzes, id);

function classStudents(classId, activeOnly = true) {
  return db.students
    .filter(s => s.classId === classId && (!activeOnly || s.active))
    .sort((a, b) => (a.studentNumber || "").localeCompare(b.studentNumber || "", LANG === "th" ? "th" : "en", { numeric: true }) || a.fullName.localeCompare(b.fullName));
}
function classSessions(classId) {
  return db.sessions.filter(s => s.classId === classId).sort((a, b) => (b.date + (b.startTime || "")).localeCompare(a.date + (a.startTime || "")));
}
function classLessons(classId) {
  return db.lessons.filter(l => l.classId === classId).sort((a, b) => b.createdAt - a.createdAt);
}
function classAssessments(classId) {
  return db.assessments.filter(a => a.classId === classId).sort((a, b) => (a.date || "").localeCompare(b.date || "") || a.createdAt - b.createdAt);
}
function sessionAttendance(sessionId) {
  const map = {};
  for (const r of db.attendance) if (r.sessionId === sessionId) map[r.studentId] = r;
  return map;
}
function allAttendanceForClass(classId) {
  const ids = new Set(db.sessions.filter(s => s.classId === classId).map(s => s.id));
  return db.attendance.filter(r => ids.has(r.sessionId));
}
function getScore(assessmentId, studentId) {
  const r = db.scores.find(s => s.assessmentId === assessmentId && s.studentId === studentId);
  return r ? r.value : null;
}
function slotMinutesFor(classId) {
  const c = cls(classId);
  if (!c || !c.timetable || !c.timetable.length) return null;
  const slots = c.timetable.map(s => {
    if (!s.start || !s.end) return null;
    const [sh, sm] = s.start.split(":").map(Number);
    const [eh, em] = s.end.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }).filter(x => x && x > 0);
  return slots.length ? Math.min(...slots) : null;
}
function nextSlotFor(classId, fromISO) {
  const c = cls(classId);
  if (!c || !c.timetable) return null;
  const wd = SorndiCore.weekdayIndex(fromISO);
  return c.timetable.filter(s => s.day === wd).sort((a, b) => (a.start || "").localeCompare(b.start || ""))[0] || null;
}

/* ---------------------------------------------------------------- mutations */
function addAttendance(sessionId, studentId, status, note) {
  const actor = db.settings.teacherName || "Teacher";
  let rec = db.attendance.find(r => r.sessionId === sessionId && r.studentId === studentId);
  if (!rec) {
    rec = { id: uid(), sessionId, studentId, status: null, note: "", history: [] };
    db.attendance.push(rec);
  }
  const changed = rec.status !== status || (note !== undefined && rec.note !== note);
  if (rec.status !== null && rec.status !== status) {
    rec.history.push({ from: rec.status, to: status, actor, at: new Date().toISOString() });
  }
  rec.status = status;
  if (note !== undefined) rec.note = note;
  rec.updatedAt = new Date().toISOString();
  save();
  return changed;
}

/* ---------------------------------------------------------------- toast, dialog */
function toast(msg, isErr) {
  const eld = document.createElement("div");
  eld.className = "toast" + (isErr ? " error" : "");
  eld.textContent = msg;
  document.getElementById("toasts").appendChild(eld);
  setTimeout(() => { eld.style.opacity = "0"; eld.style.transition = "opacity .3s"; }, 2200);
  setTimeout(() => eld.remove(), 2600);
}

function openDialog(title, bodyHTML, footHTML, opts) {
  closeDialog();
  const ov = document.createElement("div");
  ov.className = "overlay"; ov.id = "overlay";
  ov.innerHTML = `<div class="dialog${opts && opts.wide ? " wide" : ""}" role="dialog" aria-modal="true" aria-label="${escAttr(title)}">
    <div class="dialog-head"><h3>${esc(title)}</h3><button class="iconbtn" data-close aria-label="${t("act.close")}">${icon("x")}</button></div>
    <div class="dialog-body">${bodyHTML}</div>
    ${footHTML ? `<div class="dialog-foot">${footHTML}</div>` : ""}
  </div>`;
  ov.addEventListener("click", e => { if (e.target === ov) closeDialog(); });
  document.body.appendChild(ov);
  const f = ov.querySelector("input, select, textarea, button:not([data-close])");
  if (f) f.focus();
  return ov;
}
function closeDialog() { const eld = document.getElementById("overlay"); if (eld) eld.remove(); }

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeDialog();
});

/* ---------------------------------------------------------------- helpers */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function escAttr(s) { return esc(s); }

function eld_from(html) { const tpl = document.createElement("template"); tpl.innerHTML = html.trim(); return tpl.content.firstElementChild; }

function downloadFile(name, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function statusTone(statusId) {
  const s = SorndiCore.ATTENDANCE_STATUSES.find(s => s.id === statusId);
  return s ? s.tone : "mut";
}
function statusChip(statusId) {
  if (!statusId) return `<span class="chip mut" style="border-style:dashed">${esc(t("st.notRecorded"))}</span>`;
  return `<span class="chip ${statusTone(statusId)}"><span class="dot"></span>${esc(t("st." + ({ absent_excused: "absentExcused", absent_unexcused: "absentUnexcused", left_early: "leftEarly" }[statusId] || statusId)))}</span>`;
}
function stKey(statusId) {
  return "st." + ({ absent_excused: "absentExcused", absent_unexcused: "absentUnexcused", left_early: "leftEarly" }[statusId] || statusId);
}

function emptyState(iconName, titleKey, body, actionHTML) {
  return `<div class="empty">${icon(iconName)}<div class="t">${esc(t(titleKey))}</div><div class="small">${body}</div>${actionHTML || ""}</div>`;
}

function sectionHead(titleKey, count, rightHTML) {
  return `<div class="section-head">${TAB_GLYPH}<h2>${esc(t(titleKey))}</h2>${count !== undefined ? `<span class="count">${count}</span>` : ""}<span class="right">${rightHTML || ""}</span></div>`;
}

/* theme */
function applyTheme() {
  const pref = db.settings.theme;
  const dark = pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = dark ? "#14120F" : "#FAF9F6";
}
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);

/* ---------------------------------------------------------------- router */
const routes = [];
function route(pattern, handler) {
  routes.push({ pattern, handler });
}
function parseHash() {
  return (location.hash || "#/today").replace(/^#/, "");
}
async function renderRoute() {
  closeDialog();
  const path = parseHash();
  for (const r of routes) {
    const m = path.match(r.pattern);
    if (m) { r.handler(...m.slice(1)); return; }
  }
  location.hash = "#/today";
}
window.addEventListener("hashchange", renderRoute);

function setActiveNav(name) {
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.nav === name));
}

function setView(html, navName, crumb) {
  setActiveNav(navName);
  const main = document.getElementById("view");
  main.innerHTML = `<div class="view">${html}</div>`;
  main.scrollTop = 0;
  document.getElementById("crumb").innerHTML = crumb || "";
  window.scrollTo(0, 0);
}

/* render the shell (sidebar + topbar) once */
function renderShell() {
  const nav = (name, iconName, labelKey) =>
    `<button class="nav-item" data-nav="${name}" data-go="#/${name}">${icon(iconName)}<span>${t(labelKey)}</span></button>`;
  document.getElementById("sidebar").innerHTML = `
    <a class="brand" href="#/today" style="text-decoration:none;color:inherit">
      ${markSVG("mark", "var(--accent)")}
      <span><span class="name">SORNDI</span><span class="sub">${t("app.tagline")} · v2.0</span></span>
    </a>
    ${nav("today", "today", "nav.today")}
    ${nav("classes", "classes", "nav.classes")}
    ${nav("studio", "studio", "nav.studio")}
    ${nav("tools", "tools", "nav.tools")}
    ${nav("exports", "exports", "nav.exports")}
    ${nav("settings", "settings", "nav.settings")}
    <div class="foot">${t("shell.foot1")}<br>${t("shell.foot2")}</div>`;
  document.getElementById("langbtn").innerHTML = icon("globe");
  document.getElementById("langbtn").title = "English / ไทย";
  document.getElementById("themebtn").innerHTML = icon(document.documentElement.dataset.theme === "dark" ? "sun" : "moon");
}

/* global click delegation */
document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]");
  if (go) { location.hash = go.dataset.go; return; }
  if (e.target.closest("[data-close]")) { closeDialog(); return; }
});

/* refresh icon on theme button after toggle */
function refreshTopbar() {
  renderShell();
}
