CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`changes` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`clientId` int,
	`name` varchar(255) NOT NULL,
	`caseNumber` varchar(100),
	`description` text,
	`status` enum('active','closed','on_hold','pending') NOT NULL DEFAULT 'active',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`assignedTo` int,
	`dueDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cases_id` PRIMARY KEY(`id`),
	CONSTRAINT `cases_caseNumber_unique` UNIQUE(`caseNumber`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('individual','corporate') NOT NULL DEFAULT 'individual',
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`country` varchar(100),
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractCollaborators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('viewer','editor','owner') NOT NULL DEFAULT 'viewer',
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractCollaborators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`fileKey` varchar(255),
	`fileUrl` varchar(500),
	`createdBy` int NOT NULL,
	`changesSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contractVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`clientId` int,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('draft','review','approved','executed','archived') NOT NULL DEFAULT 'draft',
	`riskLevel` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`fileKey` varchar(255),
	`fileUrl` varchar(500),
	`fileName` varchar(255),
	`fileMimeType` varchar(100),
	`fileSize` int,
	`reviewProgress` int NOT NULL DEFAULT 0,
	`totalExposure` decimal(15,2) DEFAULT '0',
	`uploadedBy` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contracts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`contractId` int,
	`caseId` int,
	`name` varchar(255) NOT NULL,
	`type` enum('contract','brief','memo','discovery','other') NOT NULL DEFAULT 'other',
	`fileKey` varchar(255),
	`fileUrl` varchar(500),
	`fileName` varchar(255),
	`fileMimeType` varchar(100),
	`fileSize` int,
	`status` enum('active','archived','draft') NOT NULL DEFAULT 'active',
	`uploadedBy` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `firms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`address` text,
	`website` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `firms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `riskAlerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contractId` int NOT NULL,
	`level` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`issue` text NOT NULL,
	`exposure` decimal(15,2) DEFAULT '0',
	`recommendation` text,
	`status` enum('open','resolved','ignored') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `riskAlerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`contractId` int,
	`caseId` int,
	`type` enum('contract_review','due_diligence','litigation_prep','risk_analysis') NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`progress` int NOT NULL DEFAULT 0,
	`result` json,
	`error` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','lawyer','paralegal') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `firmId` int;