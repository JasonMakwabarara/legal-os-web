CREATE TABLE `documentDrafts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`documentId` int,
	`caseId` int,
	`templateId` varchar(50) NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`variables` json,
	`status` enum('draft','review','approved','rejected') NOT NULL DEFAULT 'draft',
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentDrafts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eSignatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`documentId` int NOT NULL,
	`signerId` int NOT NULL,
	`signerName` varchar(255) NOT NULL,
	`signerEmail` varchar(320) NOT NULL,
	`signatureImage` text,
	`signatureHash` varchar(255) NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`userAgent` text,
	`status` enum('pending','signed','rejected') NOT NULL DEFAULT 'pending',
	`signedAt` timestamp,
	`rejectionReason` text,
	`verificationToken` varchar(255) NOT NULL,
	`isVerified` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eSignatures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signatureAuditTrail` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`signatureId` int NOT NULL,
	`event` varchar(100) NOT NULL,
	`details` json,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signatureAuditTrail_id` PRIMARY KEY(`id`)
);
