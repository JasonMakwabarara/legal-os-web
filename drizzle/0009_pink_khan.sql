CREATE TABLE `billableRates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int,
	`role` varchar(64),
	`practiceArea` varchar(255),
	`hourlyRate` decimal(10,2) NOT NULL,
	`effectiveDate` date NOT NULL,
	`expiryDate` date,
	`isActive` enum('yes','no') NOT NULL DEFAULT 'yes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `billableRates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoiceLineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`invoiceId` int NOT NULL,
	`timeEntryId` int,
	`description` text NOT NULL,
	`taskType` varchar(64),
	`hours` decimal(8,2) NOT NULL,
	`hourlyRate` decimal(10,2) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `invoiceLineItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`clientId` int NOT NULL,
	`invoiceNumber` varchar(64) NOT NULL,
	`periodStartDate` date NOT NULL,
	`periodEndDate` date NOT NULL,
	`totalAmount` decimal(12,2) NOT NULL,
	`totalHours` decimal(8,2) NOT NULL,
	`status` enum('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
	`issuedDate` date,
	`dueDate` date,
	`paidDate` date,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `timeEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`caseId` int,
	`contractId` int,
	`taskType` enum('research','drafting','review','client_meeting','court_appearance','negotiation','filing','consultation','administrative','other') NOT NULL,
	`description` text NOT NULL,
	`startTime` timestamp NOT NULL,
	`endTime` timestamp,
	`durationMinutes` int,
	`billableMinutes` int,
	`isBillable` enum('yes','no') NOT NULL DEFAULT 'yes',
	`hourlyRate` decimal(10,2),
	`billableAmount` decimal(12,2),
	`status` enum('draft','submitted','approved','billed','paid') NOT NULL DEFAULT 'draft',
	`notes` text,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeEntryAdjustments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timeEntryId` int NOT NULL,
	`adjustmentType` enum('write_off','rate_change','duration_change','billability_change') NOT NULL,
	`originalValue` text NOT NULL,
	`newValue` text NOT NULL,
	`reason` text,
	`adjustedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeEntryAdjustments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeTrackingAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int,
	`date` date NOT NULL,
	`totalHours` decimal(8,2) DEFAULT '0',
	`billableHours` decimal(8,2) DEFAULT '0',
	`nonBillableHours` decimal(8,2) DEFAULT '0',
	`billabilityPercentage` decimal(5,2) DEFAULT '0',
	`totalAmount` decimal(12,2) DEFAULT '0',
	`taskTypeBreakdown` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeTrackingAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeTrackingSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`caseId` int,
	`contractId` int,
	`taskType` enum('research','drafting','review','client_meeting','court_appearance','negotiation','filing','consultation','administrative','other') NOT NULL,
	`description` text,
	`startTime` timestamp NOT NULL,
	`pausedAt` timestamp,
	`totalPausedMinutes` int DEFAULT 0,
	`status` enum('running','paused','stopped') NOT NULL DEFAULT 'running',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeTrackingSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timesheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`periodStartDate` date NOT NULL,
	`periodEndDate` date NOT NULL,
	`totalHours` decimal(8,2) DEFAULT '0',
	`totalBillableHours` decimal(8,2) DEFAULT '0',
	`totalAmount` decimal(12,2) DEFAULT '0',
	`status` enum('draft','submitted','approved','rejected','billed') NOT NULL DEFAULT 'draft',
	`submittedAt` timestamp,
	`approvedAt` timestamp,
	`approvedBy` int,
	`rejectionReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timesheets_id` PRIMARY KEY(`id`)
);
