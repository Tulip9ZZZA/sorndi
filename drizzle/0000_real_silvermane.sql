CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classroomId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`category` varchar(80) NOT NULL DEFAULT 'Formative',
	`maximumScore` decimal(7,2) NOT NULL,
	`weight` decimal(7,2) NOT NULL DEFAULT '1.00',
	`assessmentDate` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendanceRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`studentId` int NOT NULL,
	`attendanceStatus` enum('not_recorded','present','late','absent_excused','absent_unexcused','sick','left_early','remote','other') NOT NULL DEFAULT 'not_recorded',
	`note` text,
	`markedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `attendanceRecords_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_session_student_uq` UNIQUE(`sessionId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `classrooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(120) NOT NULL,
	`subject` varchar(120),
	`gradeLevel` varchar(80),
	`room` varchar(80),
	`accent` varchar(16) NOT NULL DEFAULT 'orange',
	`isArchived` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classrooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidenceNotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`content` text NOT NULL,
	`nextAction` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evidenceNotes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classroomId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`objective` text,
	`plan` text,
	`plannedDate` varchar(10),
	`lessonStatus` enum('draft','ready','taught','cancelled') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scoreRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assessmentId` int NOT NULL,
	`studentId` int NOT NULL,
	`value` decimal(7,2),
	`scoreStatus` enum('recorded','missing','excused') NOT NULL DEFAULT 'missing',
	`feedback` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoreRecords_id` PRIMARY KEY(`id`),
	CONSTRAINT `scores_assessment_student_uq` UNIQUE(`assessmentId`,`studentId`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classroomId` int NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`studentNumber` varchar(40) NOT NULL,
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_classroom_number_uq` UNIQUE(`classroomId`,`studentNumber`)
);
--> statement-breakpoint
CREATE TABLE `teachingSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classroomId` int NOT NULL,
	`lessonId` int,
	`sessionDate` varchar(10) NOT NULL,
	`startTime` varchar(5),
	`sessionStatus` enum('planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
	`reflection` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachingSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_classroomId_classrooms_id_fk` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD CONSTRAINT `attendanceRecords_sessionId_teachingSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `teachingSessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendanceRecords` ADD CONSTRAINT `attendanceRecords_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classrooms` ADD CONSTRAINT `classrooms_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `evidenceNotes` ADD CONSTRAINT `evidenceNotes_sessionId_teachingSessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `teachingSessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_classroomId_classrooms_id_fk` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scoreRecords` ADD CONSTRAINT `scoreRecords_assessmentId_assessments_id_fk` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scoreRecords` ADD CONSTRAINT `scoreRecords_studentId_students_id_fk` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `students` ADD CONSTRAINT `students_classroomId_classrooms_id_fk` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachingSessions` ADD CONSTRAINT `teachingSessions_classroomId_classrooms_id_fk` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teachingSessions` ADD CONSTRAINT `teachingSessions_lessonId_lessons_id_fk` FOREIGN KEY (`lessonId`) REFERENCES `lessons`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `assessments_classroom_idx` ON `assessments` (`classroomId`);--> statement-breakpoint
CREATE INDEX `attendance_session_idx` ON `attendanceRecords` (`sessionId`);--> statement-breakpoint
CREATE INDEX `classrooms_owner_idx` ON `classrooms` (`ownerId`);--> statement-breakpoint
CREATE INDEX `evidence_session_idx` ON `evidenceNotes` (`sessionId`);--> statement-breakpoint
CREATE INDEX `lessons_classroom_idx` ON `lessons` (`classroomId`);--> statement-breakpoint
CREATE INDEX `scores_assessment_idx` ON `scoreRecords` (`assessmentId`);--> statement-breakpoint
CREATE INDEX `students_classroom_idx` ON `students` (`classroomId`);--> statement-breakpoint
CREATE INDEX `sessions_classroom_date_idx` ON `teachingSessions` (`classroomId`,`sessionDate`);