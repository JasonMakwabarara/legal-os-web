CREATE TABLE `aiChatConversations` (
	`id` varchar(64) NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`model` varchar(50) NOT NULL DEFAULT 'qwen-3.5',
	`context` json,
	`messageCount` int NOT NULL DEFAULT 0,
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aiChatConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aiChatMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`model` varchar(50) NOT NULL DEFAULT 'qwen-3.5',
	`tokens` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiChatMessages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clientCommunications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`clientId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('email','call','meeting','note','document') NOT NULL,
	`subject` varchar(255),
	`content` text NOT NULL,
	`participants` json,
	`duration` int,
	`attachments` json,
	`followUpDate` timestamp,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientCommunications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deadline','case_update','contract_review','collaboration','system') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`relatedEntityType` varchar(50),
	`relatedEntityId` int,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`isRead` tinyint NOT NULL DEFAULT 0,
	`actionUrl` varchar(255),
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
