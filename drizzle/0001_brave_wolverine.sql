CREATE TABLE `attendanceChangeLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attendanceRecordId` int NOT NULL,
	`actorId` int NOT NULL,
	`previousAttendanceStatus` enum('not_recorded','present','late','absent_excused','absent_unexcused','sick','left_early','remote','other') NOT NULL,
	`nextAttendanceStatus` enum('not_recorded','present','late','absent_excused','absent_unexcused','sick','left_early','remote','other') NOT NULL,
	`previousNote` text,
	`nextNote` text,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendanceChangeLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `attendanceChangeLog` ADD CONSTRAINT `attendanceChangeLog_attendanceRecordId_attendanceRecords_id_fk` FOREIGN KEY (`attendanceRecordId`) REFERENCES `attendanceRecords`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `attendanceChangeLog` ADD CONSTRAINT `attendanceChangeLog_actorId_users_id_fk` FOREIGN KEY (`actorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `attendance_audit_record_idx` ON `attendanceChangeLog` (`attendanceRecordId`);