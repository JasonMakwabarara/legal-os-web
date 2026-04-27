CREATE TABLE `firmInvitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`inviteCode` varchar(64) NOT NULL,
	`email` varchar(320),
	`invitedBy` int NOT NULL,
	`status` enum('pending','accepted','expired') NOT NULL DEFAULT 'pending',
	`expiresAt` timestamp,
	`acceptedAt` timestamp,
	`acceptedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `firmInvitations_id` PRIMARY KEY(`id`),
	CONSTRAINT `firmInvitations_inviteCode_unique` UNIQUE(`inviteCode`)
);
