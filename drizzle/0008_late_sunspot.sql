CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`type` enum('slack','salesforce','teams','outlook') NOT NULL,
	`status` enum('active','inactive','error') NOT NULL DEFAULT 'active',
	`config` json NOT NULL,
	`createdBy` int NOT NULL,
	`lastSyncAt` timestamp,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
