CREATE TABLE `clauseUsageAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`clauseId` int NOT NULL,
	`documentId` int,
	`contractId` int,
	`userId` int NOT NULL,
	`usageType` varchar(50) NOT NULL,
	`context` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `clauseUsageAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legalClauses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`subcategory` varchar(100),
	`content` text NOT NULL,
	`description` text,
	`tags` json,
	`riskLevel` enum('low','medium','high') DEFAULT 'medium',
	`jurisdiction` varchar(100),
	`industry` varchar(100),
	`createdBy` int NOT NULL,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalClauses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realtimeNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`isRead` tinyint NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `realtimeNotifications_id` PRIMARY KEY(`id`)
);
