/**
 * SORNDI Field Ledger page: warm editorial teacher dashboard with an evidence-thread signature.
 * Keep next actions, visible calculations, and teacher control ahead of decorative dashboard metrics.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Home as HomeIcon,
  Languages,
  LayoutGrid,
  Menu,
  MoreHorizontal,
  PanelRightOpen,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = "EN" | "TH";
type AttendanceStatus =
  | "not_recorded"
  | "present"
  | "late"
  | "absent_excused"
  | "absent_unexcused"
  | "sick";

type Student = {
  id: string;
  name: string;
  number: string;
  initial: string;
  hue: string;
};

const students: Student[] = [
  { id: "s1", name: "Ananda S.", number: "01", initial: "AS", hue: "var(--avatar-sky)" },
  { id: "s2", name: "Chanin P.", number: "02", initial: "CP", hue: "var(--avatar-sand)" },
  { id: "s3", name: "Decha K.", number: "03", initial: "DK", hue: "var(--avatar-sage)" },
  { id: "s4", name: "Fah N.", number: "04", initial: "FN", hue: "var(--avatar-peach)" },
  { id: "s5", name: "Narin W.", number: "05", initial: "NW", hue: "var(--avatar-lilac)" },
];

const initialAttendance: Record<string, AttendanceStatus> = {
  s1: "present",
  s2: "present",
  s3: "late",
  s4: "present",
  s5: "not_recorded",
};

const initialScores: Record<string, string> = {
  s1: "8",
  s2: "9",
  s3: "7",
  s4: "10",
  s5: "",
};

const copy = {
  EN: {
    today: "Today",
    classes: "Classes",
    planner: "Planner",
    records: "Records",
    reports: "Reports",
    settings: "Settings",
    command: "Command menu",
    current: "Current block",
    next: "Next class",
    ready: "Ready to teach",
    openLesson: "Open lesson",
    markAll: "Mark all present",
    save: "Save attendance",
    export: "Export record",
    attendance: "Attendance",
    scorebook: "Scorebook",
    evidence: "Evidence",
    menu: "Menu",
  },
  TH: {
    today: "วันนี้",
    classes: "ห้องเรียน",
    planner: "แผนการสอน",
    records: "บันทึก",
    reports: "รายงาน",
    settings: "ตั้งค่า",
    command: "เมนูคำสั่ง",
    current: "คาบปัจจุบัน",
    next: "คาบถัดไป",
    ready: "พร้อมสอน",
    openLesson: "เปิดบทเรียน",
    markAll: "มาเรียนทั้งหมด",
    save: "บันทึกการเช็กชื่อ",
    export: "ส่งออกบันทึก",
    attendance: "เช็กชื่อ",
    scorebook: "สมุดคะแนน",
    evidence: "หลักฐาน",
    menu: "เมนู",
  },
};

const statusInfo: Record<AttendanceStatus, { label: string; th: string; dot: string }> = {
  not_recorded: { label: "Not recorded", th: "ยังไม่บันทึก", dot: "status-pending" },
  present: { label: "Present", th: "มาเรียน", dot: "status-present" },
  late: { label: "Late", th: "มาสาย", dot: "status-late" },
  absent_excused: { label: "Excused", th: "ลากิจ", dot: "status-excused" },
  absent_unexcused: { label: "Absent", th: "ขาดเรียน", dot: "status-absent" },
  sick: { label: "Sick", th: "ลาป่วย", dot: "status-sick" },
};

const navItems = [
  { id: "today", icon: HomeIcon },
  { id: "classes", icon: LayoutGrid },
  { id: "planner", icon: CalendarDays },
  { id: "records", icon: ClipboardCheck },
  { id: "reports", icon: FileText },
];

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("EN");
  const [activeNav, setActiveNav] = useState("today");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() =>
    loadLocal("sorndi-attendance", initialAttendance),
  );
  const [scores, setScores] = useState<Record<string, string>>(() => loadLocal("sorndi-scores", initialScores));
  const [savedAt, setSavedAt] = useState<string>(() => loadLocal("sorndi-saved-at", ""));
  const [showCalculation, setShowCalculation] = useState(false);
  const t = copy[language];

  useEffect(() => {
    document.documentElement.lang = language === "TH" ? "th" : "en";
  }, [language]);

  const attendanceCounts = useMemo(() => {
    const values = Object.values(attendance);
    return {
      present: values.filter((status) => status === "present").length,
      late: values.filter((status) => status === "late").length,
      pending: values.filter((status) => status === "not_recorded").length,
      absent: values.filter((status) => ["absent_excused", "absent_unexcused", "sick"].includes(status)).length,
    };
  }, [attendance]);

  const scoreSummary = useMemo(() => {
    const filledScores = Object.values(scores)
      .filter((score) => score.trim() !== "")
      .map(Number)
      .filter((score) => Number.isFinite(score));
    const total = filledScores.reduce((sum, score) => sum + score, 0);
    return {
      completed: filledScores.length,
      total,
      average: filledScores.length ? (total / filledScores.length).toFixed(1) : "—",
    };
  }, [scores]);

  const selectNav = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    if (id !== "today") {
      toast.message(`${copy[language][id as keyof typeof copy.EN] ?? id} stays in SORNDI’s next MVP slice.`);
    }
  };

  const updateStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance((current) => ({ ...current, [studentId]: status }));
  };

  const markAllPresent = () => {
    const next = Object.fromEntries(students.map((student) => [student.id, "present"] as const));
    setAttendance(next);
    toast.success(language === "EN" ? "Every student marked present. Review exceptions before saving." : "บันทึกนักเรียนทุกคนว่า มาเรียนแล้ว ตรวจสอบข้อยกเว้นก่อนบันทึก");
  };

  const saveAttendance = () => {
    const timestamp = new Date().toLocaleTimeString(language === "TH" ? "th-TH" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    window.localStorage.setItem("sorndi-attendance", JSON.stringify(attendance));
    window.localStorage.setItem("sorndi-scores", JSON.stringify(scores));
    window.localStorage.setItem("sorndi-saved-at", timestamp);
    setSavedAt(timestamp);
    toast.success(language === "EN" ? "Attendance saved to this browser." : "บันทึกการเช็กชื่อในเบราว์เซอร์นี้แล้ว");
  };

  const exportRecord = () => {
    const rows = [
      ["SORNDI attendance export", "Science 6/1", "18 June 2026"],
      ["Student", "Number", "Attendance", "Observation score / 10"],
      ...students.map((student) => [
        student.name,
        student.number,
        statusInfo[attendance[student.id]].label,
        scores[student.id] || "Not recorded",
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sorndi-science-6-1-2026-06-18.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(language === "EN" ? "CSV export prepared." : "เตรียมไฟล์ CSV แล้ว");
  };

  return (
    <div className="sorndi-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <button className="brand-mark" aria-label="SORNDI home" onClick={() => selectNav("today")}>
          <img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" />
        </button>

        <nav className="rail-nav">
          {navItems.map(({ id, icon: Icon }) => (
            <button
              className={`rail-link ${activeNav === id ? "is-active" : ""}`}
              key={id}
              onClick={() => selectNav(id)}
              aria-label={copy[language][id as keyof typeof copy.EN]}
              aria-current={activeNav === id ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{copy[language][id as keyof typeof copy.EN]}</span>
            </button>
          ))}
        </nav>

        <div className="rail-bottom">
          <button className="rail-link" onClick={() => toast.message("Settings comes after the core classroom flow.")} aria-label={t.settings}>
            <MoreHorizontal size={20} strokeWidth={1.8} />
            <span>{t.settings}</span>
          </button>
          <div className="teacher-avatar" title="Mira, teacher profile">M</div>
        </div>
      </aside>

      <main className="main-ledger">
        <header className="topbar">
          <div className="desktop-wordmark" aria-label="SORNDI teaching desk">
            <img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" />
            <span><strong>SORNDI</strong><small>Teaching desk</small></span>
          </div>
          <div className="mobile-brand">
            <img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" />
            <span>SORNDI</span>
          </div>
          <button className="mobile-menu-trigger" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen} aria-controls="mobile-nav">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span>{t.menu}</span>
          </button>
          <div className="breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{t.today}</strong></div>
          <div className="topbar-actions">
            <button className="command-button" onClick={() => toast.message("Quick actions will arrive with the next operational slice.")}>
              <Search size={16} />
              <span>{t.command}</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="language-button"
              onClick={() => setLanguage((current) => (current === "EN" ? "TH" : "EN"))}
              aria-label="Switch navigation language"
              title="Switch navigation language"
            >
              <Languages size={17} />
              <span>{language === "EN" ? "ไทย" : "EN"}</span>
            </button>
            <Button className="new-record-button" onClick={() => toast.message("New record opens after you select a classroom.")}>
              <Plus size={17} />
              <span>New record</span>
            </Button>
          </div>
        </header>

        {mobileMenuOpen && (
          <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile primary navigation">
            {navItems.map(({ id, icon: Icon }) => (
              <button key={id} onClick={() => selectNav(id)} className={activeNav === id ? "is-active" : ""}>
                <Icon size={18} />
                {copy[language][id as keyof typeof copy.EN]}
              </button>
            ))}
          </nav>
        )}

        <section className="day-heading" aria-labelledby="today-title">
          <div>
            <p className="index-label">Tuesday · 18 June 2026</p>
            <h1 id="today-title">The day, kept teachable.</h1>
            <p className="day-subtitle">Three teaching moments. One clear record.</p>
          </div>
          <div className="date-chip"><CalendarDays size={17} /><span>Week 04 · Term 1</span></div>
        </section>

        <section className="current-session" aria-labelledby="current-session-title">
          <div className="session-copy">
            <div className="section-eyebrow"><span className="pulse-dot" /> {t.current}</div>
            <div className="session-title-line">
              <p className="session-time">08:30</p>
              <div className="session-divider" />
              <div>
                <h2 id="current-session-title">Science 6/1</h2>
                <p>Room 302 · 35 minutes</p>
              </div>
            </div>
            <div className="lesson-ready-line"><CircleCheck size={17} /><span>Changes of matter is ready — retrieval prompt included.</span></div>
            <div className="session-actions">
              <Button className="open-lesson-button" onClick={() => toast.success("Lesson notes opened in your teaching flow.")}>
                <BookOpen size={17} /> {t.openLesson}
              </Button>
              <button className="text-action" onClick={() => toast.message("Current class setup is complete.")}>View setup <ArrowUpRight size={15} /></button>
            </div>
          </div>
          <div className="session-visual" aria-label="Teaching desk with lesson materials">
            <img src="/manus-storage/sorndi-desk-ledger_01a35fd9.jpg" alt="A sunlit teaching desk with a blank lesson notebook, colour tabs, and timer." />
            <div className="visual-stamp"><ShieldCheck size={16} /><span>Teacher controlled</span></div>
          </div>
        </section>

        <section className="today-grid" aria-label="Today’s teaching workspace">
          <div className="ledger-column">
            <div className="section-header">
              <div><p className="index-label">01 · Room check</p><h2>{t.attendance}</h2><p className="section-action">Next: confirm the one record still waiting.</p></div>
              <div className="attendance-summary" aria-label="Attendance count">
                <span><i className="status-dot status-present" />{attendanceCounts.present} present</span>
                <span><i className="status-dot status-late" />{attendanceCounts.late} late</span>
                <span><i className="status-dot status-pending" />{attendanceCounts.pending} pending</span>
              </div>
            </div>

            <div className="attendance-toolbar">
              <p><strong>Science 6/1</strong><span>18 June · Session 1</span></p>
              <button className="quiet-button" onClick={markAllPresent}><Check size={16} /> {t.markAll}</button>
            </div>

            <div className="roster" role="table" aria-label="Science 6/1 attendance roster">
              <div className="roster-head" role="row">
                <span role="columnheader">Student</span><span role="columnheader">Status</span><span role="columnheader">Note</span>
              </div>
              {students.map((student) => {
                const status = attendance[student.id];
                const meta = statusInfo[status];
                return (
                  <div className="roster-row" role="row" key={student.id}>
                    <div className="student-cell" role="cell">
                      <span className="student-number">{student.number}</span>
                      <span className="student-avatar" style={{ background: student.hue }}>{student.initial}</span>
                      <span>{student.name}</span>
                    </div>
                    <div role="cell" className="status-cell">
                      <label className="sr-only" htmlFor={`status-${student.id}`}>Attendance status for {student.name}</label>
                      <span className={`status-dot ${meta.dot}`} />
                      <select id={`status-${student.id}`} value={status} onChange={(event) => updateStatus(student.id, event.target.value as AttendanceStatus)}>
                        {Object.entries(statusInfo).map(([value, info]) => <option key={value} value={value}>{language === "EN" ? info.label : info.th}</option>)}
                      </select>
                    </div>
                    <button role="cell" className="note-button" onClick={() => toast.message(`Add a note for ${student.name} in the next roster update.`)}>Add note</button>
                  </div>
                );
              })}
            </div>

            <div className="attendance-footer">
              <p>{savedAt ? <><CircleCheck size={16} /> Saved locally at {savedAt}</> : <><Activity size={16} /> Unsaved changes stay in this browser until you save.</>}</p>
              <Button className="save-button" onClick={saveAttendance}><Save size={16} /> {t.save}</Button>
            </div>

            <section className="scorebook-section" aria-labelledby="scorebook-title">
              <div className="section-header compact">
                <div><p className="index-label">02 · Observe</p><h2 id="scorebook-title">{t.scorebook}</h2><p className="section-action">Next: capture an observation before the bell.</p></div>
                <div className="score-mean"><span>Class mean</span><strong>{scoreSummary.average}<small>/10</small></strong></div>
              </div>
              <div className="assessment-label"><span className="assessment-dot" /> Observation: changes of matter <span>10 points · formative</span></div>
              <div className="score-table" role="table" aria-label="Observation scorebook">
                {students.map((student) => (
                  <div className="score-row" key={student.id} role="row">
                    <span role="cell">{student.name}</span>
                    <label role="cell" className="score-input"><span className="sr-only">Score for {student.name}</span><input inputMode="numeric" max="10" min="0" value={scores[student.id]} onChange={(event) => setScores((current) => ({ ...current, [student.id]: event.target.value.replace(/[^0-9]/g, "").slice(0, 2) }))} /><small>/10</small></label>
                  </div>
                ))}
              </div>
              <button className="calculation-button" onClick={() => setShowCalculation((show) => !show)}><ChartNoAxesCombined size={16} /> {showCalculation ? "Hide calculation" : "Show calculation"}</button>
              {showCalculation && <div className="calculation-box"><strong>Transparent calculation</strong><span>{scoreSummary.total} points across {scoreSummary.completed} recorded observations ÷ {scoreSummary.completed || 1} included scores = <b>{scoreSummary.average}/10</b>. Missing score is excluded, not treated as zero.</span></div>}
            </section>
          </div>

          <aside className="context-column" aria-label="Class context and next actions">
            <div className="context-heading"><p className="index-label">Class control strip</p><span>Live · portable</span></div>
            <section className="next-class-card">
              <div className="card-topline"><p className="index-label">{t.next}</p><Clock3 size={17} /></div>
              <p className="next-time">10:10</p>
              <h3>Homeroom 6/1</h3>
              <p>Weekly check-in · Room 302</p>
              <div className="prep-state"><span><i className="status-dot status-present" /> Plan linked</span><ChevronRight size={16} /></div>
            </section>

            <section className="evidence-card" aria-labelledby="evidence-title">
              <div className="ribbon-image" aria-hidden="true" />
              <div className="evidence-content">
                <p className="index-label">03 · Teach</p>
                <h3 id="evidence-title">{t.evidence} thread</h3>
                <ol className="evidence-list">
                  <li className="done"><span><Check size={13} /></span><div><strong>Lesson planned</strong><small>08:12 · ready</small></div></li>
                  <li className="active"><span>2</span><div><strong>Attendance live</strong><small>{attendanceCounts.pending ? `${attendanceCounts.pending} record waiting` : "roster complete"}</small></div></li>
                  <li><span>3</span><div><strong>Evidence note</strong><small>Due after teaching</small></div></li>
                  <li><span>4</span><div><strong>Next action</strong><small>Schedule retrieval</small></div></li>
                </ol>
              </div>
            </section>

            <section className="export-card">
              <div><Download size={19} /><p className="index-label">Portable by default</p></div>
              <h3>Keep the record yours.</h3>
              <p>Download attendance and observation values as a transparent CSV.</p>
              <button onClick={exportRecord}>{t.export} <ArrowUpRight size={15} /></button>
            </section>

            <section className="lesson-photo" aria-label="Sunlit science classroom prepared for teaching">
              <img src="/manus-storage/sorndi-classroom-sun_c8e11742.jpg" alt="A quiet, sunlit science classroom prepared for a lesson." />
              <div><Sparkles size={16} /><span>Ready room · 302</span></div>
            </section>
          </aside>
        </section>

        <footer className="app-footer"><span>SORNDI MVP · Local browser preview</span><span>Missing is never zero. Unchecked is never absent.</span><PanelRightOpen size={15} /></footer>
        <p className="sr-only" aria-live="polite">{language === "EN" ? "SORNDI navigation language is English." : "เมนู SORNDI ใช้ภาษาไทย"}</p>
      </main>
    </div>
  );
}
