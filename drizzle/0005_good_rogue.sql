CREATE TABLE `clauseTemplateVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`versionNumber` int NOT NULL,
	`content` text NOT NULL,
	`components` json,
	`changeLog` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clauseTemplateVersions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clauseTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`content` text NOT NULL,
	`components` json,
	`tags` json,
	`riskLevel` varchar(20),
	`jurisdiction` varchar(100),
	`industry` varchar(100),
	`isActive` tinyint DEFAULT 1,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clauseTemplates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templateApprovalRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`category` varchar(100) NOT NULL,
	`requiredApprovals` int NOT NULL DEFAULT 1,
	`approverRoles` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `templateApprovalRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templateApprovals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`versionId` int NOT NULL,
	`status` varchar(20) NOT NULL,
	`requestedBy` int NOT NULL,
	`approvedBy` int,
	`rejectionReason` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	CONSTRAINT `templateApprovals_id` PRIMARY KEY(`id`)
);
