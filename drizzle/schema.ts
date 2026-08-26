/**
 * SORNDI Version One schema: teacher-owned classroom records with explicit, inspectable relationships.
 * Operational timestamps remain UTC; class dates stay ISO date strings because they are school-calendar concepts.
 */
import {
  boolean,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const classrooms = mysqlTable(
  "classrooms",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    subject: varchar("subject", { length: 120 }),
    gradeLevel: varchar("gradeLevel", { length: 80 }),
    room: varchar("room", { length: 80 }),
    accent: varchar("accent", { length: 16 }).notNull().default("orange"),
    isArchived: boolean("isArchived").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("classrooms_owner_idx").on(table.ownerId)],
);

export const students = mysqlTable(
  "students",
  {
    id: int("id").autoincrement().primaryKey(),
    classroomId: int("classroomId").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
    fullName: varchar("fullName", { length: 160 }).notNull(),
    studentNumber: varchar("studentNumber", { length: 40 }).notNull(),
    notes: text("notes"),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("students_classroom_idx").on(table.classroomId),
    uniqueIndex("students_classroom_number_uq").on(table.classroomId, table.studentNumber),
  ],
);

export const lessons = mysqlTable(
  "lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    classroomId: int("classroomId").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    objective: text("objective"),
    plan: text("plan"),
    plannedDate: varchar("plannedDate", { length: 10 }),
    status: mysqlEnum("lessonStatus", ["draft", "ready", "taught", "cancelled"]).notNull().default("draft"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("lessons_classroom_idx").on(table.classroomId)],
);

export const teachingSessions = mysqlTable(
  "teachingSessions",
  {
    id: int("id").autoincrement().primaryKey(),
    classroomId: int("classroomId").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
    lessonId: int("lessonId").references(() => lessons.id, { onDelete: "set null" }),
    sessionDate: varchar("sessionDate", { length: 10 }).notNull(),
    startTime: varchar("startTime", { length: 5 }),
    status: mysqlEnum("sessionStatus", ["planned", "in_progress", "completed", "cancelled"]).notNull().default("planned"),
    reflection: text("reflection"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("sessions_classroom_date_idx").on(table.classroomId, table.sessionDate)],
);

export const attendanceRecords = mysqlTable(
  "attendanceRecords",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull().references(() => teachingSessions.id, { onDelete: "cascade" }),
    studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
    status: mysqlEnum("attendanceStatus", [
      "not_recorded",
      "present",
      "late",
      "absent_excused",
      "absent_unexcused",
      "sick",
      "left_early",
      "remote",
      "other",
    ]).notNull().default("not_recorded"),
    note: text("note"),
    markedAt: timestamp("markedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("attendance_session_idx").on(table.sessionId),
    uniqueIndex("attendance_session_student_uq").on(table.sessionId, table.studentId),
  ],
);

export const assessments = mysqlTable(
  "assessments",
  {
    id: int("id").autoincrement().primaryKey(),
    classroomId: int("classroomId").notNull().references(() => classrooms.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    category: varchar("category", { length: 80 }).notNull().default("Formative"),
    maximumScore: decimal("maximumScore", { precision: 7, scale: 2 }).notNull(),
    weight: decimal("weight", { precision: 7, scale: 2 }).notNull().default("1.00"),
    assessmentDate: varchar("assessmentDate", { length: 10 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("assessments_classroom_idx").on(table.classroomId)],
);

export const scoreRecords = mysqlTable(
  "scoreRecords",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull().references(() => assessments.id, { onDelete: "cascade" }),
    studentId: int("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
    value: decimal("value", { precision: 7, scale: 2 }),
    status: mysqlEnum("scoreStatus", ["recorded", "missing", "excused"]).notNull().default("missing"),
    feedback: text("feedback"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("scores_assessment_idx").on(table.assessmentId),
    uniqueIndex("scores_assessment_student_uq").on(table.assessmentId, table.studentId),
  ],
);

export const evidenceNotes = mysqlTable(
  "evidenceNotes",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull().references(() => teachingSessions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    nextAction: text("nextAction"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("evidence_session_idx").on(table.sessionId)],
);

export const attendanceChangeLog = mysqlTable(
  "attendanceChangeLog",
  {
    id: int("id").autoincrement().primaryKey(),
    attendanceRecordId: int("attendanceRecordId").notNull().references(() => attendanceRecords.id, { onDelete: "cascade" }),
    actorId: int("actorId").notNull().references(() => users.id, { onDelete: "cascade" }),
    previousStatus: mysqlEnum("previousAttendanceStatus", [
      "not_recorded", "present", "late", "absent_excused", "absent_unexcused", "sick", "left_early", "remote", "other",
    ]).notNull(),
    nextStatus: mysqlEnum("nextAttendanceStatus", [
      "not_recorded", "present", "late", "absent_excused", "absent_unexcused", "sick", "left_early", "remote", "other",
    ]).notNull(),
    previousNote: text("previousNote"),
    nextNote: text("nextNote"),
    changedAt: timestamp("changedAt").defaultNow().notNull(),
  },
  (table) => [index("attendance_audit_record_idx").on(table.attendanceRecordId)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Classroom = typeof classrooms.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type TeachingSession = typeof teachingSessions.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type AttendanceChange = typeof attendanceChangeLog.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type ScoreRecord = typeof scoreRecords.$inferSelect;
export type EvidenceNote = typeof evidenceNotes.$inferSelect;
