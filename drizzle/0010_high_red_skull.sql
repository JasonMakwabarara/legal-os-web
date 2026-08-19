CREATE TABLE `localAuthCredentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `localAuthCredentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `localAuthCredentials_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `contracts` ADD `caseId` int;--> statement-breakpoint
ALTER TABLE `contracts` ADD `originalText` mediumtext;--> statement-breakpoint
ALTER TABLE `contracts` ADD `redlinedText` mediumtext;--> statement-breakpoint
ALTER TABLE `contracts` ADD `analysisSummary` text;