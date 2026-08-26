/**
 * SORNDI Version One teacher workspace. This page connects every visible record to authenticated tRPC data.
 * Empty states ask teachers to create their own classroom data; no fictional student records are seeded.
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cloneElement, isValidElement, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  Home,
  Languages,
  LoaderCircle,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type View = "today" | "classes" | "planner" | "records" | "reports";
type Language = "EN" | "TH";
type AttendanceStatus = "not_recorded" | "present" | "late" | "absent_excused" | "absent_unexcused" | "sick" | "left_early" | "remote" | "other";
type ScoreStatus = "recorded" | "missing" | "excused";

const todayIso = () => new Date().toISOString().slice(0, 10);

const labels = {
  EN: {
    today: "Today", classes: "Classes", planner: "Planner", records: "Records", reports: "Reports",
    createClass: "Create classroom", addStudent: "Add student", addLesson: "Add lesson", addSession: "Create teaching session",
    saveAttendance: "Save attendance", saveScores: "Save scorebook", addEvidence: "Add evidence", export: "Export CSV",
    signIn: "Sign in to begin", signOut: "Sign out", language: "ไทย",
  },
  TH: {
    today: "วันนี้", classes: "ห้องเรียน", planner: "แผนการสอน", records: "บันทึก", reports: "รายงาน",
    createClass: "สร้างห้องเรียน", addStudent: "เพิ่มนักเรียน", addLesson: "เพิ่มบทเรียน", addSession: "สร้างคาบสอน",
    saveAttendance: "บันทึกการเช็กชื่อ", saveScores: "บันทึกคะแนน", addEvidence: "เพิ่มหลักฐาน", export: "ส่งออก CSV",
    signIn: "เข้าสู่ระบบเพื่อเริ่มต้น", signOut: "ออกจากระบบ", language: "EN",
  },
};

const nav = [
  { id: "today" as const, icon: Home },
  { id: "classes" as const, icon: Users },
  { id: "planner" as const, icon: CalendarDays },
  { id: "records" as const, icon: ClipboardCheck },
  { id: "reports" as const, icon: FileText },
];

const attendanceLabels: Record<AttendanceStatus, string> = {
  not_recorded: "Not recorded", present: "Present", late: "Late", absent_excused: "Excused", absent_unexcused: "Absent", sick: "Sick", left_early: "Left early", remote: "Remote", other: "Other",
};

function formatDate(date?: string | null) {
  if (!date) return "No date yet";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "ST";
}

const thaiInterfaceText: Record<string, string> = {
  "Field Ledger": "สมุดบันทึกภาคสนาม",
  "Active classroom": "ห้องเรียนปัจจุบัน",
  "Every change is kept with the classroom it belongs to.": "ทุกการเปลี่ยนแปลงจะอยู่กับห้องเรียนที่เกี่ยวข้อง",
  "No date yet": "ยังไม่มีวันที่",
  "Formative": "ระหว่างเรียน",
  "No recorded scores": "ยังไม่มีคะแนนที่บันทึก",
  "Available weighted class total:": "คะแนนรวมถ่วงน้ำหนักของห้องที่มีข้อมูล:",
  "weight": "น้ำหนัก",
  "Missing and excused work stays excluded rather than becoming zero.": "งานที่ขาดหรือได้รับการยกเว้นจะไม่ถูกนับเป็นศูนย์",
  "Teacher-owned Version One": "เวอร์ชันหนึ่งที่ครูเป็นเจ้าของ",
  "The day, connected.": "เชื่อมต่อทุกช่วงของวัน",
  "Create your classroom record once. Carry it from plan to attendance to evidence.": "สร้างบันทึกห้องเรียนเพียงครั้งเดียว แล้วเชื่อมต่อจากแผนการสอน การเช็กชื่อ ไปจนถึงหลักฐาน",
  "Your first working record": "บันทึกการทำงานแรกของคุณ",
  "Start with one classroom.": "เริ่มต้นด้วยหนึ่งห้องเรียน",
  "Create a room, add your own roster, then SORNDI connects lessons, attendance, evidence, and scores without inventing any student data.": "สร้างห้องเรียน เพิ่มรายชื่อนักเรียนของคุณ แล้ว SORNDI จะเชื่อมต่อบทเรียน การเช็กชื่อ หลักฐาน และคะแนน โดยไม่สร้างข้อมูลนักเรียนขึ้นเอง",
  "Room 01 · First working record": "ห้อง 01 · บันทึกการทำงานแรก",
  "Set up the room before the bell.": "ตั้งค่าห้องก่อนเสียงกริ่ง",
  "Create this classroom first. Then its lessons, attendance, evidence, and scores remain connected under one teacher-controlled record.": "สร้างห้องเรียนนี้ก่อน แล้วบทเรียน การเช็กชื่อ หลักฐาน และคะแนนจะเชื่อมต่อกันภายใต้บันทึกที่ครูควบคุมได้",
  "Create the room": "สร้างห้องเรียน",
  "Give every record a home.": "ให้ทุกบันทึกมีที่อยู่",
  "Add your roster": "เพิ่มรายชื่อนักเรียน",
  "Use only your own student data.": "ใช้เฉพาะข้อมูลนักเรียนของคุณ",
  "Teach and record": "สอนและบันทึก",
  "Keep the evidence trail visible.": "รักษาเส้นทางหลักฐานให้มองเห็นได้",
  "Record navigator": "ตัวเลือกบันทึก",
  "Open a specific teaching session": "เปิดคาบสอนที่ต้องการ",
  "Choose a saved date to review or correct its attendance without overwriting another session.": "เลือกวันที่ที่บันทึกไว้เพื่อตรวจสอบหรือแก้ไขการเช็กชื่อ โดยไม่เขียนทับคาบสอนอื่น",
  "Who corrected this record": "ผู้ที่แก้ไขบันทึกนี้",
  "Audit trail": "ประวัติการแก้ไข",
  "Teacher": "ครู",
  "Note updated": "แก้ไขบันทึกแล้ว",
  "Weighted totals": "คะแนนรวมถ่วงน้ำหนัก",
  "Student totals, kept visible": "แสดงคะแนนรวมของนักเรียนเสมอ",
  "Totals use recorded scores only. Missing and excused work stays excluded rather than becoming zero.": "คะแนนรวมใช้เฉพาะคะแนนที่บันทึกแล้ว งานที่ขาดหรือได้รับการยกเว้นจะไม่ถูกนับเป็นศูนย์",
  "Current classroom": "ห้องเรียนปัจจุบัน",
  "No session created": "ยังไม่ได้สร้างคาบสอน",
  "Record attendance": "บันทึกการเช็กชื่อ",
  "Open plan": "เปิดแผนการสอน",
  "Evidence thread": "เส้นทางหลักฐาน",
  "Lesson": "บทเรียน",
  "Plan exists": "มีแผนการสอนแล้ว",
  "Create a plan": "สร้างแผนการสอน",
  "Teaching session": "คาบสอน",
  "Schedule the class": "กำหนดคาบสอน",
  "Attendance": "การเช็กชื่อ",
  "Ready to record": "พร้อมบันทึก",
  "Requires a session": "ต้องมีคาบสอน",
  "Evidence": "หลักฐาน",
  "Reflect after teaching": "สะท้อนผลหลังสอน",
  "Next action": "ขั้นตอนถัดไป",
  "Record the room before teaching.": "บันทึกสถานะของห้องก่อนสอน",
  "Create today’s teaching session.": "สร้างคาบสอนของวันนี้",
  "No unchecked row becomes absent. Save statuses deliberately.": "แถวที่ยังไม่เช็กจะไม่กลายเป็นขาดเรียน บันทึกสถานะอย่างตั้งใจ",
  "A session is the link between plan, attendance, evidence, and reports.": "คาบสอนคือจุดเชื่อมระหว่างแผน การเช็กชื่อ หลักฐาน และรายงาน",
  "Open records": "เปิดบันทึก",
  "Create session": "สร้างคาบสอน",
  "Classroom setup": "ตั้งค่าห้องเรียน",
  "New classroom": "ห้องเรียนใหม่",
  "Subject": "รายวิชา",
  "Not set": "ยังไม่ระบุ",
  "Level": "ระดับชั้น",
  "Room": "ห้อง",
  "Roster": "รายชื่อนักเรียน",
  "active students": "นักเรียนที่ใช้งาน",
  "Add to roster": "เพิ่มในรายชื่อ",
  "New student": "นักเรียนใหม่",
  "Full name": "ชื่อ-นามสกุล",
  "Student number": "เลขที่นักเรียน",
  "Private note": "บันทึกส่วนตัว",
  "(optional)": "(ไม่บังคับ)",
  "Lesson design": "ออกแบบบทเรียน",
  "Plan a lesson": "วางแผนบทเรียน",
  "Lesson title": "ชื่อบทเรียน",
  "Learning objective": "จุดประสงค์การเรียนรู้",
  "Plan or prompts": "แผนหรือคำถามนำ",
  "Date": "วันที่",
  "Status": "สถานะ",
  "Draft": "ฉบับร่าง",
  "Ready": "พร้อมสอน",
  "Put plan on calendar": "วางแผนลงปฏิทิน",
  "Linked lesson": "บทเรียนที่เชื่อมโยง",
  "No linked lesson": "ไม่มีบทเรียนที่เชื่อมโยง",
  "Start time": "เวลาเริ่ม",
  "Time not set": "ยังไม่ระบุเวลา",
  "planned": "วางแผนแล้ว",
  "in progress": "กำลังสอน",
  "completed": "เสร็จสิ้น",
  "cancelled": "ยกเลิก",
  "Attendance needs a session": "การเช็กชื่อต้องมีคาบสอน",
  "Create a teaching session first.": "สร้างคาบสอนก่อน",
  "SORNDI records attendance against a real teaching session, not a loose calendar date.": "SORNDI บันทึกการเช็กชื่อกับคาบสอนจริง ไม่ใช่วันที่แยกออกจากกัน",
  "Open planner": "เปิดแผนการสอน",
  "Mark the room": "บันทึกสถานะห้องเรียน",
  "Mark all present": "มาเรียนทั้งหมด",
  "present": "มาเรียน",
  "late": "มาสาย",
  "waiting": "รอบันทึก",
  "Present": "มาเรียน",
  "Late": "มาสาย",
  "Not recorded": "ยังไม่บันทึก",
  "Excused": "ลากิจ",
  "Absent": "ขาดเรียน",
  "Sick": "ลาป่วย",
  "Left early": "กลับก่อน",
  "Remote": "เรียนทางไกล",
  "Other": "อื่น ๆ",
  "Evidence and reflection": "หลักฐานและการสะท้อนผล",
  "Leave the next useful trace.": "เก็บร่องรอยที่ช่วยให้ทำงานต่อได้",
  "What happened in the room?": "เกิดอะไรขึ้นในห้องเรียน",
  "Recent attendance corrections": "การแก้ไขการเช็กล่าสุด",
  "Corrections will appear here with the time they were saved.": "การแก้ไขจะแสดงที่นี่พร้อมเวลาที่บันทึก",
  "Transparent scorebook": "สมุดคะแนนแบบโปร่งใส",
  "Create your first assessment": "สร้างการประเมินครั้งแรก",
  "Missing and excused records are not zero.": "รายการที่ขาดหรือได้รับการยกเว้นไม่ใช่ศูนย์",
  "Recorded": "บันทึกแล้ว",
  "Missing": "ยังไม่มีคะแนน",
  "Show calculation": "แสดงการคำนวณ",
  "Hide calculation": "ซ่อนการคำนวณ",
  "Weighted calculation": "การคำนวณแบบถ่วงน้ำหนัก",
  "Assessment setup": "ตั้งค่าการประเมิน",
  "What will you record?": "คุณจะบันทึกอะไร",
  "Assessment title": "ชื่อการประเมิน",
  "Category": "ประเภท",
  "Maximum score": "คะแนนเต็ม",
  "Weight": "น้ำหนัก",
  "Portable record": "บันทึกที่พกพาได้",
  "Export the active classroom’s current attendance and first assessment as CSV.": "ส่งออกการเช็กชื่อและการประเมินแรกของห้องเรียนปัจจุบันเป็น CSV",
  "Create a classroom": "สร้างห้องเรียน",
  "Classroom name": "ชื่อห้องเรียน",
  "Ledger tab colour": "สีแท็บสมุดบันทึก",
  "Sorndi Orange": "ส้ม SORNDI",
  "Sage": "เขียวเซจ",
  "Sky": "ฟ้าคราม",
  "Sand": "สีทราย",
  "Sign out": "ออกจากระบบ",
  "Menu": "เมนู",
};

function localizeText(value: string, language: Language) {
  if (language === "EN") return value;
  const trimmed = value.trim();
  const translated = thaiInterfaceText[trimmed];
  return translated ? value.replace(trimmed, translated) : value;
}

function localizeTree(node: ReactNode, language: Language): ReactNode {
  if (typeof node === "string") return localizeText(node, language);
  if (Array.isArray(node)) return node.map((child) => localizeTree(child, language));
  if (!isValidElement(node)) return node;
  const element = node as React.ReactElement<{ children?: ReactNode; placeholder?: string; "aria-label"?: string }>;
  const nextProps: { children?: ReactNode; placeholder?: string; "aria-label"?: string } = {};
  if (element.props.children !== undefined) nextProps.children = localizeTree(element.props.children, language);
  if (element.props.placeholder) nextProps.placeholder = localizeText(element.props.placeholder, language);
  if (element.props["aria-label"]) nextProps["aria-label"] = localizeText(element.props["aria-label"], language);
  return cloneElement(element, nextProps);
}

function EmptyWorkspace({ onCreate, language }: { onCreate: () => void; language: Language }) {
  const ledgerLabel = language === "TH" ? "สมุดบันทึกภาคสนาม" : "Field Ledger";
  return localizeTree(<section className="v1-empty-desk"><aside className="v1-empty-spine" aria-label={`SORNDI ${ledgerLabel}`}><img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" /><strong>SORNDI</strong><small>{ledgerLabel}</small><div><span className="is-ready">01</span><span>02</span><span>03</span><span>04</span></div></aside><div className="v1-empty-ledger"><span className="v1-empty-mark"><img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" /></span><p className="v1-index">Room 01 · First working record</p><h2>Set up the room before the bell.</h2><p>Create this classroom first. Then its lessons, attendance, evidence, and scores remain connected under one teacher-controlled record.</p><Button className="v1-primary" onClick={onCreate}><Plus size={17} /> Create the room</Button><ol className="v1-empty-trail"><li><span>1</span><p><strong>Create the room</strong><small>Give every record a home.</small></p></li><li><span>2</span><p><strong>Add your roster</strong><small>Use only your own student data.</small></p></li><li><span>3</span><p><strong>Teach and record</strong><small>Keep the evidence trail visible.</small></p></li></ol></div></section>, language);
}

export default function VersionOne() {
  const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
  const utils = trpc.useUtils();
  const [language, setLanguage] = useState<Language>("EN");
  const [view, setView] = useState<View>("today");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [classForm, setClassForm] = useState({ name: "", subject: "", gradeLevel: "", room: "", accent: "orange" as "orange" | "sage" | "sky" | "sand" });
  const [studentForm, setStudentForm] = useState({ fullName: "", studentNumber: "", notes: "" });
  const [lessonForm, setLessonForm] = useState({ title: "", objective: "", plan: "", plannedDate: todayIso(), status: "ready" as "draft" | "ready" });
  const [sessionForm, setSessionForm] = useState({ sessionDate: todayIso(), startTime: "", lessonId: "" });
  const [assessmentForm, setAssessmentForm] = useState({ title: "", category: "Formative", maximumScore: "10", weight: "1", assessmentDate: todayIso() });
  const [evidenceForm, setEvidenceForm] = useState({ content: "", nextAction: "" });
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, { status: AttendanceStatus; note: string }>>({});
  const [scoreDraft, setScoreDraft] = useState<Record<number, { status: ScoreStatus; value: string; feedback: string }>>({});
  const [showCalculation, setShowCalculation] = useState(false);
  const t = labels[language];

  useEffect(() => {
    document.documentElement.lang = language === "TH" ? "th" : "en";
  }, [language]);

  const dashboard = trpc.sorndi.dashboard.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const detailQuery = trpc.sorndi.classrooms.detail.useQuery({ classroomId: selectedClassroomId ?? 0, sessionId: selectedSessionId ?? undefined }, { enabled: isAuthenticated && selectedClassroomId !== null, retry: false });
  type DetailData = NonNullable<typeof detailQuery.data>;
  const detail = detailQuery as typeof detailQuery & { data: DetailData };

  useEffect(() => {
    if (!selectedClassroomId && dashboard.data?.classrooms[0]) setSelectedClassroomId(dashboard.data.classrooms[0].id);
  }, [dashboard.data, selectedClassroomId]);

  useEffect(() => {
    if (!selectedSessionId && detail.data?.sessions[0]) setSelectedSessionId(detail.data.sessions[0].id);
  }, [detail.data?.sessions, selectedSessionId]);

  useEffect(() => {
    setSelectedSessionId(null);
  }, [selectedClassroomId]);

  useEffect(() => {
    if (!detail.data) return;
    const attendanceByStudent = new Map(detail.data.attendance.map((record) => [record.studentId, record]));
    setAttendanceDraft(Object.fromEntries(detail.data.roster.map((student) => {
      const record = attendanceByStudent.get(student.id);
      return [student.id, { status: (record?.status ?? "not_recorded") as AttendanceStatus, note: record?.note ?? "" }];
    })));
    const scoreByStudent = new Map(detail.data.scores.map((record) => [record.studentId, record]));
    setScoreDraft(Object.fromEntries(detail.data.roster.map((student) => {
      const record = scoreByStudent.get(student.id);
      return [student.id, { status: (record?.status ?? "missing") as ScoreStatus, value: record?.value ?? "", feedback: record?.feedback ?? "" }];
    })));
  }, [detail.data?.classroom.id, detail.data?.selectedSession?.id, detail.data?.assessments[0]?.id]);

  const createClassroom = trpc.sorndi.classrooms.create.useMutation({
    onSuccess: async ({ id }) => {
      await utils.sorndi.dashboard.invalidate();
      setSelectedClassroomId(id);
      setSelectedSessionId(null);
      setShowClassForm(false);
      setClassForm({ name: "", subject: "", gradeLevel: "", room: "", accent: "orange" });
      toast.success("Classroom created. Add your roster next.");
    },
    onError: (error) => toast.error(error.message),
  });
  const createStudent = trpc.sorndi.students.create.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); setStudentForm({ fullName: "", studentNumber: "", notes: "" }); toast.success("Student added."); }, onError: (error) => toast.error(error.message) });
  const createLesson = trpc.sorndi.lessons.create.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); setLessonForm({ title: "", objective: "", plan: "", plannedDate: todayIso(), status: "ready" }); toast.success("Lesson saved."); }, onError: (error) => toast.error(error.message) });
  const createSession = trpc.sorndi.sessions.create.useMutation({ onSuccess: async ({ id }) => { await utils.sorndi.classrooms.detail.invalidate(); await utils.sorndi.dashboard.invalidate(); setSelectedSessionId(id); setSessionForm({ sessionDate: todayIso(), startTime: "", lessonId: "" }); toast.success("Teaching session created."); }, onError: (error) => toast.error(error.message) });
  const saveAttendance = trpc.sorndi.attendance.save.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); toast.success("Attendance saved."); }, onError: (error) => toast.error(error.message) });
  const createAssessment = trpc.sorndi.assessments.create.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); setAssessmentForm({ title: "", category: "Formative", maximumScore: "10", weight: "1", assessmentDate: todayIso() }); toast.success("Assessment created."); }, onError: (error) => toast.error(error.message) });
  const saveScores = trpc.sorndi.scores.save.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); toast.success("Scores saved."); }, onError: (error) => toast.error(error.message) });
  const addEvidence = trpc.sorndi.evidence.create.useMutation({ onSuccess: async () => { await utils.sorndi.classrooms.detail.invalidate(); setEvidenceForm({ content: "", nextAction: "" }); toast.success("Evidence note saved."); }, onError: (error) => toast.error(error.message) });

  const activeClassroom = useMemo(() => dashboard.data?.classrooms.find((classroom) => classroom.id === selectedClassroomId) ?? null, [dashboard.data, selectedClassroomId]);
  const scoreMean = useMemo(() => {
    const recorded = Object.values(scoreDraft).filter((score) => score.status === "recorded" && score.value !== "").map((score) => Number(score.value)).filter(Number.isFinite);
    return recorded.length ? (recorded.reduce((sum, score) => sum + score, 0) / recorded.length).toFixed(1) : "—";
  }, [scoreDraft]);
  const attendanceSummary = useMemo(() => Object.values(attendanceDraft).reduce<Record<AttendanceStatus, number>>((summary, row) => ({ ...summary, [row.status]: (summary[row.status] ?? 0) + 1 }), {} as Record<AttendanceStatus, number>), [attendanceDraft]);
  const weightedByStudent = useMemo(() => new Map((detail.data?.gradebook.studentTotals ?? []).map((total) => [total.studentId, total.weightedPercent])), [detail.data?.gradebook.studentTotals]);

  const refreshDetail = async () => { await utils.sorndi.classrooms.detail.invalidate(); await utils.sorndi.dashboard.invalidate(); };
  const exportCsv = () => {
    if (!detail.data || !activeClassroom) return;
    const assessment = detail.data.assessments[0];
    const rows = [
      ["SORNDI record export", activeClassroom.name, activeClassroom.subject || ""],
      ["Student", "Number", "Attendance", assessment ? `${assessment.title} / ${assessment.maximumScore}` : "Score"],
      ...detail.data.roster.map((student) => [student.fullName, student.studentNumber, attendanceLabels[attendanceDraft[student.id]?.status ?? "not_recorded"], scoreDraft[student.id]?.status === "recorded" ? scoreDraft[student.id].value : scoreDraft[student.id]?.status ?? "missing"]),
    ];
    const content = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sorndi-${activeClassroom.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-record.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export prepared.");
  };

  if (authLoading) return <div className="v1-loading"><LoaderCircle className="v1-spin" size={26} /> Loading your teaching desk…</div>;
  if (!user) return <div className="v1-auth"><div className="v1-auth-card"><img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="SORNDI" /><p className="v1-index">SORNDI VERSION ONE</p><h1>Keep your classroom record yours.</h1><p>Sign in to create secure, teacher-owned classes, rosters, attendance, lessons, evidence, scorebooks, and exports.</p><Button className="v1-primary" onClick={() => startLogin()}><ShieldCheck size={17} /> {t.signIn}</Button><small>Nothing is seeded. You start with your own class data.</small></div></div>;

  const hasClassrooms = Boolean(dashboard.data?.classrooms.length);
  if (hasClassrooms && !detail.data) {
    return <div className="v1-loading"><LoaderCircle className="v1-spin" size={24} /> Opening this classroom record…</div>;
  }
  const currentSession = detail.data?.selectedSession;
  const currentAssessment = detail.data?.assessments[0];

  return localizeTree(<div className="v1-shell">
    <aside className="v1-rail" aria-label="SORNDI navigation">
      <button className="v1-logo" onClick={() => setView("today")} aria-label="SORNDI home"><img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" /><span>SORNDI</span></button>
      <nav>{nav.map(({ id, icon: Icon }) => <button key={id} className={view === id ? "is-active" : ""} onClick={() => { setView(id); setMobileMenuOpen(false); }}><Icon size={18} /><span>{t[id]}</span></button>)}</nav>
      <div className="v1-rail-user"><span>{user.name?.slice(0, 1).toUpperCase() || "T"}</span><button onClick={() => logout()} aria-label={t.signOut}><LogOut size={16} /></button></div>
    </aside>

    <main className="v1-main">
      <header className="v1-header"><div className="v1-mobile-brand"><img src="/manus-storage/sorndi-mark_e790a5bb.png" alt="" /><strong>SORNDI</strong></div><button className="v1-mobile-menu" onClick={() => setMobileMenuOpen((open) => !open)} aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X size={19} /> : <Menu size={19} />} <span>Menu</span></button><div className="v1-header-status"><span><ShieldCheck size={15} /> {user.name || "Teacher"}</span><button onClick={() => setLanguage((current) => current === "EN" ? "TH" : "EN")}><Languages size={16} /> {t.language}</button><button className="v1-signout" onClick={() => logout()}>{t.signOut}</button></div></header>
      {mobileMenuOpen && <nav className="v1-mobile-nav">{nav.map(({ id, icon: Icon }) => <button key={id} className={view === id ? "is-active" : ""} onClick={() => { setView(id); setMobileMenuOpen(false); }}><Icon size={17} /> {t[id]}</button>)}</nav>}

      <section className="v1-page-head"><div><p className="v1-index">Teacher-owned Version One</p><h1>{view === "today" ? "The day, connected." : t[view]}</h1><p>{view === "today" ? "Create your classroom record once. Carry it from plan to attendance to evidence." : "Every change is kept with the classroom it belongs to."}</p></div>{hasClassrooms && <label className="v1-class-picker"><span>Active classroom</span><select value={selectedClassroomId ?? ""} onChange={(event) => { setSelectedClassroomId(Number(event.target.value)); setSelectedSessionId(null); }}>{dashboard.data?.classrooms.map((classroom) => <option key={classroom.id} value={classroom.id}>{classroom.name}</option>)}</select></label>}</section>

      {dashboard.isLoading ? <div className="v1-loading"><LoaderCircle className="v1-spin" size={24} /> Opening your teaching desk…</div> : dashboard.error ? <section className="v1-error"><strong>Could not open your records.</strong><p>{dashboard.error.message}</p><Button onClick={() => dashboard.refetch()}>Try again</Button></section> : !hasClassrooms ? <EmptyWorkspace language={language} onCreate={() => setShowClassForm(true)} /> : <>
        {view === "today" && <section className="v1-today-grid">
          <article className="v1-current-card"><div className="v1-ledger-tab" /><p className="v1-index">Current classroom</p><h2>{activeClassroom?.name}</h2><p>{activeClassroom?.subject || "Subject not set"} · {activeClassroom?.room || "Room not set"}</p><div className="v1-current-meta"><span><Users size={15} /> {activeClassroom?.studentCount ?? 0} active students</span><span><CalendarDays size={15} /> {currentSession ? formatDate(currentSession.sessionDate) : "No session created"}</span></div><div className="v1-current-actions"><Button className="v1-primary" onClick={() => setView("records")}><ClipboardCheck size={16} /> Record attendance</Button><button onClick={() => setView("planner")}>Open plan <ChevronRight size={15} /></button></div></article>
          <article className="v1-thread-card"><p className="v1-index">Evidence thread</p><ol><li className={detail.data?.lessons.length ? "is-done" : ""}><span>1</span><div><strong>Lesson</strong><small>{detail.data?.lessons.length ? "Plan exists" : "Create a plan"}</small></div></li><li className={currentSession ? "is-done" : ""}><span>2</span><div><strong>Teaching session</strong><small>{currentSession ? formatDate(currentSession.sessionDate) : "Schedule the class"}</small></div></li><li className={currentSession ? "is-live" : ""}><span>3</span><div><strong>Attendance</strong><small>{currentSession ? "Ready to record" : "Requires a session"}</small></div></li><li><span>4</span><div><strong>Evidence</strong><small>Reflect after teaching</small></div></li></ol></article>
          <article className="v1-next-card"><p className="v1-index">Next action</p><h3>{currentSession ? "Record the room before teaching." : "Create today’s teaching session."}</h3><p>{currentSession ? "No unchecked row becomes absent. Save statuses deliberately." : "A session is the link between plan, attendance, evidence, and reports."}</p><button onClick={() => setView(currentSession ? "records" : "planner")}>{currentSession ? "Open records" : "Create session"} <ChevronRight size={15} /></button></article>
        </section>}

        {view === "classes" && <section className="v1-work-grid"><article className="v1-panel"><div className="v1-panel-head"><div><p className="v1-index">Classroom setup</p><h2>{activeClassroom?.name}</h2></div><button className="v1-link-button" onClick={() => setShowClassForm(true)}><Plus size={16} /> New classroom</button></div><div className="v1-info-grid"><span><small>Subject</small>{activeClassroom?.subject || "Not set"}</span><span><small>Level</small>{activeClassroom?.gradeLevel || "Not set"}</span><span><small>Room</small>{activeClassroom?.room || "Not set"}</span></div><div className="v1-roster-head"><div><p className="v1-index">Roster</p><h3>{detail.data?.roster.length ?? 0} active students</h3></div></div><div className="v1-roster-list">{detail.data?.roster.map((student) => <div key={student.id}><span className="v1-avatar">{initials(student.fullName)}</span><strong>{student.fullName}</strong><small>#{student.studentNumber}</small></div>)}</div></article><form className="v1-panel v1-form-panel" onSubmit={(event) => { event.preventDefault(); if (!selectedClassroomId) return; createStudent.mutate({ classroomId: selectedClassroomId, ...studentForm, notes: studentForm.notes || undefined }); }}><p className="v1-index">Add to roster</p><h2>New student</h2><label>Full name<input value={studentForm.fullName} onChange={(event) => setStudentForm({ ...studentForm, fullName: event.target.value })} required maxLength={160} /></label><label>Student number<input value={studentForm.studentNumber} onChange={(event) => setStudentForm({ ...studentForm, studentNumber: event.target.value })} required maxLength={40} /></label><label>Private note <span>(optional)</span><textarea value={studentForm.notes} onChange={(event) => setStudentForm({ ...studentForm, notes: event.target.value })} maxLength={1200} /></label><Button className="v1-primary" disabled={createStudent.isPending}><Plus size={16} /> {t.addStudent}</Button></form></section>}

        {view === "planner" && <section className="v1-work-grid"><article className="v1-panel"><p className="v1-index">Lesson design</p><h2>Plan a lesson</h2><form className="v1-stacked-form" onSubmit={(event) => { event.preventDefault(); if (!selectedClassroomId) return; createLesson.mutate({ classroomId: selectedClassroomId, title: lessonForm.title, objective: lessonForm.objective || undefined, plan: lessonForm.plan || undefined, plannedDate: lessonForm.plannedDate || undefined, status: lessonForm.status }); }}><label>Lesson title<input value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} required maxLength={180} /></label><label>Learning objective<textarea value={lessonForm.objective} onChange={(event) => setLessonForm({ ...lessonForm, objective: event.target.value })} maxLength={4000} /></label><label>Plan or prompts<textarea value={lessonForm.plan} onChange={(event) => setLessonForm({ ...lessonForm, plan: event.target.value })} maxLength={12000} /></label><div className="v1-inline-inputs"><label>Date<input type="date" value={lessonForm.plannedDate} onChange={(event) => setLessonForm({ ...lessonForm, plannedDate: event.target.value })} /></label><label>Status<select value={lessonForm.status} onChange={(event) => setLessonForm({ ...lessonForm, status: event.target.value as "draft" | "ready" })}><option value="draft">Draft</option><option value="ready">Ready</option></select></label></div><Button className="v1-primary" disabled={createLesson.isPending}><NotebookPen size={16} /> {t.addLesson}</Button></form></article><article className="v1-panel"><p className="v1-index">Teaching session</p><h2>Put plan on calendar</h2><form className="v1-stacked-form" onSubmit={(event) => { event.preventDefault(); if (!selectedClassroomId) return; createSession.mutate({ classroomId: selectedClassroomId, lessonId: sessionForm.lessonId ? Number(sessionForm.lessonId) : undefined, sessionDate: sessionForm.sessionDate, startTime: sessionForm.startTime || undefined, status: "planned" }); }}><label>Linked lesson<select value={sessionForm.lessonId} onChange={(event) => setSessionForm({ ...sessionForm, lessonId: event.target.value })}><option value="">No linked lesson</option>{detail.data?.lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label><div className="v1-inline-inputs"><label>Date<input type="date" value={sessionForm.sessionDate} onChange={(event) => setSessionForm({ ...sessionForm, sessionDate: event.target.value })} required /></label><label>Start time<input type="time" value={sessionForm.startTime} onChange={(event) => setSessionForm({ ...sessionForm, startTime: event.target.value })} /></label></div><Button className="v1-primary" disabled={createSession.isPending}><CalendarDays size={16} /> {t.addSession}</Button></form><div className="v1-history-list">{detail.data?.sessions.map((session) => <div key={session.id} className={session.id === currentSession?.id ? "is-current" : ""}><span><CalendarDays size={15} /></span><div><strong>{formatDate(session.sessionDate)}</strong><small>{session.startTime || "Time not set"} · {session.status.replace("_", " ")}</small></div></div>)}</div></article></section>}

        {view === "records" && <section className="v1-records-layout">{!currentSession ? <article className="v1-empty-ledger compact"><p className="v1-index">Attendance needs a session</p><h2>Create a teaching session first.</h2><p>SORNDI records attendance against a real teaching session, not a loose calendar date.</p><Button className="v1-primary" onClick={() => setView("planner")}>Open planner</Button></article> : <><article className="v1-panel"><div className="v1-panel-head"><div><p className="v1-index">Attendance · {formatDate(currentSession.sessionDate)}</p><h2>Mark the room</h2></div><button className="v1-link-button" onClick={() => setAttendanceDraft(Object.fromEntries((detail.data?.roster ?? []).map((student) => [student.id, { status: "present", note: attendanceDraft[student.id]?.note ?? "" }]))) }><Check size={16} /> Mark all present</button></div><div className="v1-status-summary"><span><i className="v1-dot present" />{attendanceSummary.present ?? 0} present</span><span><i className="v1-dot late" />{attendanceSummary.late ?? 0} late</span><span><i className="v1-dot pending" />{attendanceSummary.not_recorded ?? 0} waiting</span></div><div className="v1-attendance-list">{detail.data?.roster.map((student) => <div key={student.id}><span className="v1-avatar">{initials(student.fullName)}</span><strong>{student.fullName}</strong><select value={attendanceDraft[student.id]?.status ?? "not_recorded"} onChange={(event) => setAttendanceDraft({ ...attendanceDraft, [student.id]: { ...attendanceDraft[student.id], status: event.target.value as AttendanceStatus } })}>{Object.entries(attendanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input aria-label={`Attendance note for ${student.fullName}`} placeholder="Note" value={attendanceDraft[student.id]?.note ?? ""} onChange={(event) => setAttendanceDraft({ ...attendanceDraft, [student.id]: { ...attendanceDraft[student.id], note: event.target.value } })} /></div>)}</div><Button className="v1-primary" disabled={saveAttendance.isPending || !detail.data?.roster.length} onClick={() => saveAttendance.mutate({ sessionId: currentSession.id, rows: (detail.data?.roster ?? []).map((student) => ({ studentId: student.id, status: attendanceDraft[student.id]?.status ?? "not_recorded", note: attendanceDraft[student.id]?.note || undefined })) })}><Save size={16} /> {t.saveAttendance}</Button></article><article className="v1-panel v1-evidence-panel"><p className="v1-index">Evidence and reflection</p><h2>Leave the next useful trace.</h2><form className="v1-stacked-form" onSubmit={(event) => { event.preventDefault(); addEvidence.mutate({ sessionId: currentSession.id, content: evidenceForm.content, nextAction: evidenceForm.nextAction || undefined }); }}><label>What happened in the room?<textarea value={evidenceForm.content} onChange={(event) => setEvidenceForm({ ...evidenceForm, content: event.target.value })} required maxLength={12000} /></label><label>Next action <span>(optional)</span><input value={evidenceForm.nextAction} onChange={(event) => setEvidenceForm({ ...evidenceForm, nextAction: event.target.value })} maxLength={4000} /></label><Button className="v1-secondary" disabled={addEvidence.isPending}><Sparkles size={16} /> {t.addEvidence}</Button></form><div className="v1-evidence-list">{detail.data?.evidence.map((note) => <div key={note.id}><span><Check size={13} /></span><p><strong>{note.content}</strong>{note.nextAction && <small>Next: {note.nextAction}</small>}</p></div>)}</div>{detail.data?.attendanceHistory.length ? <div className="v1-audit-list"><p className="v1-index">Recent attendance corrections</p>{detail.data.attendanceHistory.map((change) => <div key={change.id}><span>↺</span><p><strong>{attendanceLabels[change.previousStatus as AttendanceStatus]} to {attendanceLabels[change.nextStatus as AttendanceStatus]}</strong><small>{new Date(change.changedAt).toLocaleString()}</small></p></div>)}</div> : <p className="v1-audit-empty">Corrections will appear here with the time they were saved.</p>}</article></>}</section>}

        {view === "reports" && <section className="v1-work-grid"><article className="v1-panel"><div className="v1-panel-head"><div><p className="v1-index">Transparent scorebook</p><h2>{currentAssessment?.title || "Create your first assessment"}</h2></div>{currentAssessment && <strong className="v1-mean">{scoreMean}<small> / {currentAssessment.maximumScore}</small></strong>}</div>{currentAssessment ? <><p className="v1-assessment-meta">{currentAssessment.category} · Weight {currentAssessment.weight} · Missing and excused records are not zero.</p><div className="v1-score-list">{detail.data?.roster.map((student) => <div key={student.id}><span>{student.fullName}</span><select value={scoreDraft[student.id]?.status ?? "missing"} onChange={(event) => setScoreDraft({ ...scoreDraft, [student.id]: { ...scoreDraft[student.id], status: event.target.value as ScoreStatus } })}><option value="recorded">Recorded</option><option value="missing">Missing</option><option value="excused">Excused</option></select><input aria-label={`Score for ${student.fullName}`} inputMode="decimal" disabled={scoreDraft[student.id]?.status !== "recorded"} value={scoreDraft[student.id]?.value ?? ""} onChange={(event) => setScoreDraft({ ...scoreDraft, [student.id]: { ...scoreDraft[student.id], value: event.target.value.replace(/[^0-9.]/g, "") } })} /><small>/ {currentAssessment.maximumScore}</small><em aria-label={`Weighted total for ${student.fullName}`}>{weightedByStudent.get(student.id) === null || weightedByStudent.get(student.id) === undefined ? "—" : `${weightedByStudent.get(student.id)?.toFixed(1)}%`}</em></div>)}</div><Button className="v1-primary" disabled={saveScores.isPending || !detail.data?.roster.length} onClick={() => saveScores.mutate({ assessmentId: currentAssessment.id, rows: (detail.data?.roster ?? []).map((student) => { const draft = scoreDraft[student.id] ?? { status: "missing" as ScoreStatus, value: "", feedback: "" }; return { studentId: student.id, status: draft.status, value: draft.status === "recorded" && draft.value !== "" ? Number(draft.value) : undefined, feedback: draft.feedback || undefined }; }) })}><Save size={16} /> {t.saveScores}</Button><button className="v1-calculation-toggle" onClick={() => setShowCalculation((show) => !show)}>{showCalculation ? "Hide calculation" : "Show calculation"}</button>{showCalculation && <div className="v1-calculation-box"><strong>Weighted calculation</strong><p>For each assessment, SORNDI averages recorded scores only, converts that mean to a percentage of the assessment maximum, then applies its weight. Missing and excused records are excluded rather than counted as zero.</p><ul>{detail.data?.gradebook.assessmentSummaries.map((summary) => <li key={summary.id}><span>{summary.title}</span><b>{summary.mean === null ? "No recorded scores" : `${summary.mean.toFixed(2)} / ${summary.maximumScore}`}</b><small>weight {summary.weight}</small></li>)}</ul><p className="v1-class-total">Available weighted class total: <b>{detail.data?.gradebook.classWeightedPercent === null ? "—" : `${detail.data.gradebook.classWeightedPercent.toFixed(1)}%`}</b></p></div>}</> : <p className="v1-muted-copy">Create an assessment in the panel beside this scorebook. Scores remain visible with their maximum and weight.</p>}</article><article className="v1-panel v1-form-panel"><p className="v1-index">Assessment setup</p><h2>What will you record?</h2><form className="v1-stacked-form" onSubmit={(event) => { event.preventDefault(); if (!selectedClassroomId) return; createAssessment.mutate({ classroomId: selectedClassroomId, title: assessmentForm.title, category: assessmentForm.category, maximumScore: Number(assessmentForm.maximumScore), weight: Number(assessmentForm.weight), assessmentDate: assessmentForm.assessmentDate || undefined }); }}><label>Assessment title<input value={assessmentForm.title} onChange={(event) => setAssessmentForm({ ...assessmentForm, title: event.target.value })} required maxLength={180} /></label><label>Category<input value={assessmentForm.category} onChange={(event) => setAssessmentForm({ ...assessmentForm, category: event.target.value })} required maxLength={80} /></label><div className="v1-inline-inputs"><label>Maximum score<input type="number" min="0.01" step="0.01" value={assessmentForm.maximumScore} onChange={(event) => setAssessmentForm({ ...assessmentForm, maximumScore: event.target.value })} required /></label><label>Weight<input type="number" min="0.01" step="0.01" value={assessmentForm.weight} onChange={(event) => setAssessmentForm({ ...assessmentForm, weight: event.target.value })} required /></label></div><label>Date<input type="date" value={assessmentForm.assessmentDate} onChange={(event) => setAssessmentForm({ ...assessmentForm, assessmentDate: event.target.value })} /></label><Button className="v1-secondary" disabled={createAssessment.isPending}><Plus size={16} /> Create assessment</Button></form><div className="v1-export-box"><Download size={18} /><div><strong>Portable record</strong><p>Export the active classroom’s current attendance and first assessment as CSV.</p><button onClick={exportCsv}>{t.export} <ChevronRight size={14} /></button></div></div></article></section>}
      </>}
      {view === "records" && currentSession && <section className="v1-record-navigator"><div><p className="v1-index">Record navigator</p><h2>Open a specific teaching session</h2><p>Choose a saved date to review or correct its attendance without overwriting another session.</p></div><label>Teaching session<select value={selectedSessionId ?? ""} onChange={(event) => setSelectedSessionId(Number(event.target.value))}>{detail.data?.sessions.map((session) => <option key={session.id} value={session.id}>{formatDate(session.sessionDate)} · {session.startTime || "Time not set"}</option>)}</select></label></section>}
      {view === "records" && currentSession && detail.data?.attendanceHistory.length ? <section className="v1-audit-wide"><p className="v1-index">Audit trail · {formatDate(currentSession.sessionDate)}</p><h2>Who corrected this record</h2><div>{detail.data.attendanceHistory.map((change) => <article key={change.id}><span>↺</span><p><strong>{change.actorName || "Teacher"}</strong><small>{attendanceLabels[change.previousStatus as AttendanceStatus]} to {attendanceLabels[change.nextStatus as AttendanceStatus]} · {new Date(change.changedAt).toLocaleString()}</small>{change.previousNote !== change.nextNote && <em>Note updated</em>}</p></article>)}</div></section> : null}
      {view === "reports" && detail.data?.roster.length ? <section className="v1-student-total-panel"><div><p className="v1-index">Weighted totals</p><h2>Student totals, kept visible</h2><p>Totals use recorded scores only. Missing and excused work stays excluded rather than becoming zero.</p></div><div className="v1-student-total-list">{detail.data.roster.map((student) => <article key={student.id}><span className="v1-avatar">{initials(student.fullName)}</span><strong>{student.fullName}</strong><b>{weightedByStudent.get(student.id) === null || weightedByStudent.get(student.id) === undefined ? "—" : `${weightedByStudent.get(student.id)?.toFixed(1)}%`}</b></article>)}</div></section> : null}
    </main>

    {showClassForm && <div className="v1-modal-backdrop" role="presentation"><section className="v1-modal" role="dialog" aria-modal="true" aria-labelledby="new-class-title"><button className="v1-close" onClick={() => setShowClassForm(false)} aria-label="Close"><X size={19} /></button><p className="v1-index">Classroom setup</p><h2 id="new-class-title">Create a classroom</h2><form className="v1-stacked-form" onSubmit={(event) => { event.preventDefault(); createClassroom.mutate({ ...classForm, subject: classForm.subject || undefined, gradeLevel: classForm.gradeLevel || undefined, room: classForm.room || undefined }); }}><label>Classroom name<input value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} required maxLength={120} placeholder="e.g. Science 6/1" /></label><label>Subject <span>(optional)</span><input value={classForm.subject} onChange={(event) => setClassForm({ ...classForm, subject: event.target.value })} maxLength={120} /></label><div className="v1-inline-inputs"><label>Level <input value={classForm.gradeLevel} onChange={(event) => setClassForm({ ...classForm, gradeLevel: event.target.value })} maxLength={80} /></label><label>Room <input value={classForm.room} onChange={(event) => setClassForm({ ...classForm, room: event.target.value })} maxLength={80} /></label></div><label>Ledger tab colour<select value={classForm.accent} onChange={(event) => setClassForm({ ...classForm, accent: event.target.value as typeof classForm.accent })}><option value="orange">Sorndi Orange</option><option value="sage">Sage</option><option value="sky">Sky</option><option value="sand">Sand</option></select></label><Button className="v1-primary" disabled={createClassroom.isPending}><Plus size={16} /> {t.createClass}</Button></form></section></div>}
  </div>, language);
}
