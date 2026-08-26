/**
 * SORNDI Version One tRPC contracts.
 * Every protected query confirms teacher ownership through the classroom relation before it reads or changes records.
 */
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
  assessments,
  attendanceChangeLog,
  attendanceRecords,
  classrooms,
  evidenceNotes,
  lessons,
  scoreRecords,
  students,
  teachingSessions,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";
import { calculateAssessmentMean, calculateWeightedPercent } from "./gradebook";
import { protectedProcedure, router } from "./_core/trpc";

const attendanceStatus = z.enum([
  "not_recorded", "present", "late", "absent_excused", "absent_unexcused", "sick", "left_early", "remote", "other",
]);
const scoreStatus = z.enum(["recorded", "missing", "excused"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.");

async function databaseOrThrow() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "SORNDI database is unavailable." });
  return db;
}

async function ownedClassroomOrThrow(userId: number, classroomId: number) {
  const db = await databaseOrThrow();
  const [classroom] = await db.select().from(classrooms).where(and(
    eq(classrooms.id, classroomId),
    eq(classrooms.ownerId, userId),
  )).limit(1);
  if (!classroom) throw new TRPCError({ code: "NOT_FOUND", message: "Classroom not found." });
  return { db, classroom };
}

async function ownedSessionOrThrow(userId: number, sessionId: number) {
  const db = await databaseOrThrow();
  const [session] = await db.select().from(teachingSessions).where(eq(teachingSessions.id, sessionId)).limit(1);
  if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Teaching session not found." });
  const { classroom } = await ownedClassroomOrThrow(userId, session.classroomId);
  return { db, session, classroom };
}

async function ownedAssessmentOrThrow(userId: number, assessmentId: number) {
  const db = await databaseOrThrow();
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  if (!assessment) throw new TRPCError({ code: "NOT_FOUND", message: "Assessment not found." });
  const { classroom } = await ownedClassroomOrThrow(userId, assessment.classroomId);
  return { db, assessment, classroom };
}

export const sorndiRouter = router({
  dashboard: protectedProcedure.query(async ({ ctx }) => {
    const db = await databaseOrThrow();
    const teacherClassrooms = await db.select().from(classrooms).where(and(
      eq(classrooms.ownerId, ctx.user.id),
      eq(classrooms.isArchived, false),
    )).orderBy(asc(classrooms.name));
    const classCards = await Promise.all(teacherClassrooms.map(async (classroom) => {
      const [studentCount, nextSession] = await Promise.all([
        db.select({ id: students.id }).from(students).where(and(eq(students.classroomId, classroom.id), eq(students.isActive, true))),
        db.select().from(teachingSessions).where(and(
          eq(teachingSessions.classroomId, classroom.id),
          eq(teachingSessions.status, "planned"),
        )).orderBy(asc(teachingSessions.sessionDate), asc(teachingSessions.startTime)).limit(1),
      ]);
      return { ...classroom, studentCount: studentCount.length, nextSession: nextSession[0] ?? null };
    }));
    return { classrooms: classCards };
  }),

  classrooms: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await databaseOrThrow();
      return db.select().from(classrooms).where(and(eq(classrooms.ownerId, ctx.user.id), eq(classrooms.isArchived, false))).orderBy(asc(classrooms.name));
    }),
    create: protectedProcedure.input(z.object({
      name: z.string().trim().min(1).max(120),
      subject: z.string().trim().max(120).optional(),
      gradeLevel: z.string().trim().max(80).optional(),
      room: z.string().trim().max(80).optional(),
      accent: z.enum(["orange", "sage", "sky", "sand"]).default("orange"),
    })).mutation(async ({ ctx, input }) => {
      const db = await databaseOrThrow();
      const result = await db.insert(classrooms).values({
        ownerId: ctx.user.id,
        name: input.name,
        subject: input.subject || null,
        gradeLevel: input.gradeLevel || null,
        room: input.room || null,
        accent: input.accent,
      });
      return { id: Number(result[0].insertId) };
    }),
    detail: protectedProcedure.input(z.object({ classroomId: z.number().int().positive(), sessionId: z.number().int().positive().optional() })).query(async ({ ctx, input }) => {
      const { db, classroom } = await ownedClassroomOrThrow(ctx.user.id, input.classroomId);
      const [roster, lessonRows, sessionRows, assessmentRows] = await Promise.all([
        db.select().from(students).where(and(eq(students.classroomId, classroom.id), eq(students.isActive, true))).orderBy(asc(students.studentNumber)),
        db.select().from(lessons).where(eq(lessons.classroomId, classroom.id)).orderBy(desc(lessons.plannedDate), desc(lessons.createdAt)),
        db.select().from(teachingSessions).where(eq(teachingSessions.classroomId, classroom.id)).orderBy(desc(teachingSessions.sessionDate), desc(teachingSessions.createdAt)),
        db.select().from(assessments).where(eq(assessments.classroomId, classroom.id)).orderBy(desc(assessments.assessmentDate), desc(assessments.createdAt)),
      ]);
      const selectedSession = input.sessionId ? sessionRows.find((session) => session.id === input.sessionId) : sessionRows[0];
      if (input.sessionId && !selectedSession) throw new TRPCError({ code: "NOT_FOUND", message: "Session is not part of this classroom." });
      const [attendance, evidence, allScoreRows] = await Promise.all([
        selectedSession ? db.select().from(attendanceRecords).where(eq(attendanceRecords.sessionId, selectedSession.id)) : [],
        selectedSession ? db.select().from(evidenceNotes).where(eq(evidenceNotes.sessionId, selectedSession.id)).orderBy(desc(evidenceNotes.createdAt)) : [],
        assessmentRows.length ? db.select().from(scoreRecords).where(inArray(scoreRecords.assessmentId, assessmentRows.map((assessment) => assessment.id))) : [],
      ]);
      const attendanceHistory = attendance.length ? await db.select({
        id: attendanceChangeLog.id,
        previousStatus: attendanceChangeLog.previousStatus,
        nextStatus: attendanceChangeLog.nextStatus,
        previousNote: attendanceChangeLog.previousNote,
        nextNote: attendanceChangeLog.nextNote,
        changedAt: attendanceChangeLog.changedAt,
        actorName: users.name,
      }).from(attendanceChangeLog).leftJoin(users, eq(attendanceChangeLog.actorId, users.id)).where(inArray(attendanceChangeLog.attendanceRecordId, attendance.map((record) => record.id))).orderBy(desc(attendanceChangeLog.changedAt)).limit(12) : [];
      const currentAssessment = assessmentRows[0];
      const scores = currentAssessment ? allScoreRows.filter((record) => record.assessmentId === currentAssessment.id) : [];
      const assessmentSummaries = assessmentRows.map((assessment) => {
        const assessmentScores = allScoreRows.filter((record) => record.assessmentId === assessment.id).map((record) => ({ value: record.value === null ? null : Number(record.value), status: record.status }));
        return { id: assessment.id, title: assessment.title, maximumScore: Number(assessment.maximumScore), weight: Number(assessment.weight), mean: calculateAssessmentMean(assessmentScores), recorded: assessmentScores.filter((record) => record.status === "recorded").length };
      });
      const studentTotals = roster.map((student) => {
        const assessmentInputs = assessmentRows.map((assessment) => ({
          maximumScore: Number(assessment.maximumScore),
          weight: Number(assessment.weight),
          scores: allScoreRows.filter((record) => record.assessmentId === assessment.id && record.studentId === student.id).map((record) => ({ value: record.value === null ? null : Number(record.value), status: record.status })),
        }));
        return { studentId: student.id, weightedPercent: calculateWeightedPercent(assessmentInputs) };
      });
      const classWeightedPercent = calculateWeightedPercent(assessmentRows.map((assessment) => ({
        maximumScore: Number(assessment.maximumScore),
        weight: Number(assessment.weight),
        scores: allScoreRows.filter((record) => record.assessmentId === assessment.id).map((record) => ({ value: record.value === null ? null : Number(record.value), status: record.status })),
      })));
      return { classroom, roster, lessons: lessonRows, sessions: sessionRows, selectedSession: selectedSession ?? null, attendance, attendanceHistory, evidence, assessments: assessmentRows, scores, gradebook: { assessmentSummaries, studentTotals, classWeightedPercent } };
    }),
  }),

  students: router({
    create: protectedProcedure.input(z.object({ classroomId: z.number().int().positive(), fullName: z.string().trim().min(1).max(160), studentNumber: z.string().trim().min(1).max(40), notes: z.string().trim().max(1200).optional() })).mutation(async ({ ctx, input }) => {
      const { db, classroom } = await ownedClassroomOrThrow(ctx.user.id, input.classroomId);
      try {
        const result = await db.insert(students).values({ classroomId: classroom.id, fullName: input.fullName, studentNumber: input.studentNumber, notes: input.notes || null });
        return { id: Number(result[0].insertId) };
      } catch {
        throw new TRPCError({ code: "CONFLICT", message: "That student number already exists in this classroom." });
      }
    }),
  }),

  lessons: router({
    create: protectedProcedure.input(z.object({ classroomId: z.number().int().positive(), title: z.string().trim().min(1).max(180), objective: z.string().trim().max(4000).optional(), plan: z.string().trim().max(12000).optional(), plannedDate: isoDate.optional(), status: z.enum(["draft", "ready"]).default("draft") })).mutation(async ({ ctx, input }) => {
      const { db, classroom } = await ownedClassroomOrThrow(ctx.user.id, input.classroomId);
      const result = await db.insert(lessons).values({ classroomId: classroom.id, title: input.title, objective: input.objective || null, plan: input.plan || null, plannedDate: input.plannedDate || null, status: input.status });
      return { id: Number(result[0].insertId) };
    }),
    updateStatus: protectedProcedure.input(z.object({ lessonId: z.number().int().positive(), status: z.enum(["draft", "ready", "taught", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      const db = await databaseOrThrow();
      const [lesson] = await db.select().from(lessons).where(eq(lessons.id, input.lessonId)).limit(1);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found." });
      await ownedClassroomOrThrow(ctx.user.id, lesson.classroomId);
      await db.update(lessons).set({ status: input.status }).where(eq(lessons.id, input.lessonId));
      return { success: true };
    }),
  }),

  sessions: router({
    create: protectedProcedure.input(z.object({ classroomId: z.number().int().positive(), lessonId: z.number().int().positive().optional(), sessionDate: isoDate, startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(), status: z.enum(["planned", "in_progress", "completed", "cancelled"]).default("planned") })).mutation(async ({ ctx, input }) => {
      const { db, classroom } = await ownedClassroomOrThrow(ctx.user.id, input.classroomId);
      if (input.lessonId) {
        const [lesson] = await db.select().from(lessons).where(and(eq(lessons.id, input.lessonId), eq(lessons.classroomId, classroom.id))).limit(1);
        if (!lesson) throw new TRPCError({ code: "BAD_REQUEST", message: "Lesson does not belong to this classroom." });
      }
      const result = await db.insert(teachingSessions).values({ classroomId: classroom.id, lessonId: input.lessonId ?? null, sessionDate: input.sessionDate, startTime: input.startTime || null, status: input.status });
      return { id: Number(result[0].insertId) };
    }),
    updateReflection: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), reflection: z.string().trim().max(12000), status: z.enum(["planned", "in_progress", "completed", "cancelled"]) })).mutation(async ({ ctx, input }) => {
      const { db, session } = await ownedSessionOrThrow(ctx.user.id, input.sessionId);
      await db.update(teachingSessions).set({ reflection: input.reflection || null, status: input.status }).where(eq(teachingSessions.id, session.id));
      return { success: true };
    }),
  }),

  attendance: router({
    save: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), rows: z.array(z.object({ studentId: z.number().int().positive(), status: attendanceStatus, note: z.string().trim().max(1200).optional() })).min(1) })).mutation(async ({ ctx, input }) => {
      const { db, session } = await ownedSessionOrThrow(ctx.user.id, input.sessionId);
      const roster = await db.select({ id: students.id }).from(students).where(eq(students.classroomId, session.classroomId));
      const allowed = new Set(roster.map((student) => student.id));
      if (input.rows.some((row) => !allowed.has(row.studentId))) throw new TRPCError({ code: "BAD_REQUEST", message: "Attendance row does not match this classroom." });
      const existingRows = await db.select().from(attendanceRecords).where(eq(attendanceRecords.sessionId, session.id));
      const existingByStudent = new Map(existingRows.map((record) => [record.studentId, record]));
      for (const row of input.rows) {
        const previous = existingByStudent.get(row.studentId);
        const nextNote = row.note || null;
        if (!previous) {
          const result = await db.insert(attendanceRecords).values({ sessionId: session.id, studentId: row.studentId, status: row.status, note: nextNote });
          const recordId = Number(result[0].insertId);
          await db.insert(attendanceChangeLog).values({ attendanceRecordId: recordId, actorId: ctx.user.id, previousStatus: "not_recorded", nextStatus: row.status, previousNote: null, nextNote });
          continue;
        }
        if (previous.status !== row.status || (previous.note || null) !== nextNote) {
          await db.update(attendanceRecords).set({ status: row.status, note: nextNote, markedAt: new Date() }).where(eq(attendanceRecords.id, previous.id));
          await db.insert(attendanceChangeLog).values({ attendanceRecordId: previous.id, actorId: ctx.user.id, previousStatus: previous.status, nextStatus: row.status, previousNote: previous.note || null, nextNote });
        }
      }
      return { saved: input.rows.length };
    }),
  }),

  assessments: router({
    create: protectedProcedure.input(z.object({ classroomId: z.number().int().positive(), title: z.string().trim().min(1).max(180), category: z.string().trim().min(1).max(80), maximumScore: z.number().positive().max(100000), weight: z.number().positive().max(100000), assessmentDate: isoDate.optional() })).mutation(async ({ ctx, input }) => {
      const { db, classroom } = await ownedClassroomOrThrow(ctx.user.id, input.classroomId);
      const result = await db.insert(assessments).values({ classroomId: classroom.id, title: input.title, category: input.category, maximumScore: String(input.maximumScore), weight: String(input.weight), assessmentDate: input.assessmentDate || null });
      return { id: Number(result[0].insertId) };
    }),
  }),

  scores: router({
    save: protectedProcedure.input(z.object({ assessmentId: z.number().int().positive(), rows: z.array(z.object({ studentId: z.number().int().positive(), value: z.number().min(0).optional(), status: scoreStatus, feedback: z.string().trim().max(1200).optional() })).min(1) })).mutation(async ({ ctx, input }) => {
      const { db, assessment, classroom } = await ownedAssessmentOrThrow(ctx.user.id, input.assessmentId);
      const maximum = Number(assessment.maximumScore);
      if (input.rows.some((row) => row.status === "recorded" && (row.value === undefined || row.value > maximum))) throw new TRPCError({ code: "BAD_REQUEST", message: `Recorded scores must be between 0 and ${maximum}.` });
      const roster = await db.select({ id: students.id }).from(students).where(eq(students.classroomId, classroom.id));
      const allowed = new Set(roster.map((student) => student.id));
      if (input.rows.some((row) => !allowed.has(row.studentId))) throw new TRPCError({ code: "BAD_REQUEST", message: "Score row does not match this classroom." });
      for (const row of input.rows) {
        await db.insert(scoreRecords).values({ assessmentId: assessment.id, studentId: row.studentId, value: row.status === "recorded" ? String(row.value) : null, status: row.status, feedback: row.feedback || null }).onDuplicateKeyUpdate({ set: { value: row.status === "recorded" ? String(row.value) : null, status: row.status, feedback: row.feedback || null } });
      }
      return { saved: input.rows.length };
    }),
  }),

  evidence: router({
    create: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), content: z.string().trim().min(1).max(12000), nextAction: z.string().trim().max(4000).optional() })).mutation(async ({ ctx, input }) => {
      const { db, session } = await ownedSessionOrThrow(ctx.user.id, input.sessionId);
      const result = await db.insert(evidenceNotes).values({ sessionId: session.id, content: input.content, nextAction: input.nextAction || null });
      return { id: Number(result[0].insertId) };
    }),
  }),
});
