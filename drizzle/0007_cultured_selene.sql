CREATE TABLE `clauseCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`riskLevel` enum('low','medium','high') DEFAULT 'medium',
	`jurisdiction` varchar(100),
	`industry` varchar(100),
	`keywords` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clauseCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `clauseCategories_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `documentOcrContent` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`firmId` int NOT NULL,
	`extractedText` text NOT NULL,
	`pageCount` int,
	`ocrConfidence` decimal(5,2),
	`language` varchar(10) DEFAULT 'en',
	`processingStatus` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`processingError` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentOcrContent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `extractedClauses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`firmId` int NOT NULL,
	`categoryId` int,
	`clauseText` text NOT NULL,
	`startPage` int,
	`endPage` int,
	`riskLevel` enum('low','medium','high') DEFAULT 'medium',
	`aiConfidence` decimal(5,2) DEFAULT '0',
	`flaggedIssues` json,
	`suggestedRevision` text,
	`extractedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `extractedClauses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`searchQuery` varchar(500) NOT NULL,
	`filters` json,
	`searchType` enum('full_text','clause','document','advanced') DEFAULT 'full_text',
	`isPublic` enum('yes','no') DEFAULT 'no',
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchAnalytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`date` timestamp NOT NULL,
	`totalSearches` int DEFAULT 0,
	`uniqueUsers` int DEFAULT 0,
	`averageResultsPerSearch` decimal(8,2) DEFAULT '0',
	`topSearchQueries` json,
	`averageSearchDurationMs` int DEFAULT 0,
	`clauseSearchPercentage` decimal(5,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firmId` int NOT NULL,
	`userId` int NOT NULL,
	`searchQuery` varchar(500) NOT NULL,
	`resultCount` int DEFAULT 0,
	`filters` json,
	`searchType` enum('full_text','clause','document','advanced') DEFAULT 'full_text',
	`resultClicked` int,
	`durationMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `searchIndex` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentId` int NOT NULL,
	`firmId` int NOT NULL,
	`documentType` varchar(50) NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`searchableContent` text NOT NULL,
	`keywords` json,
	`summary` text,
	`relevanceScore` decimal(5,2) DEFAULT '0',
	`lastIndexedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `searchIndex_id` PRIMARY KEY(`id`)
);
