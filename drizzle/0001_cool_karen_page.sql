CREATE TABLE `assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`skill` varchar(100) NOT NULL,
	`assessmentType` varchar(50) NOT NULL,
	`scores` json NOT NULL,
	`totalScore` int NOT NULL,
	`answers` json NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`exerciseId` varchar(100) NOT NULL,
	`attempt` int DEFAULT 1,
	`isCorrect` boolean NOT NULL,
	`userAnswer` json NOT NULL,
	`needsReview` boolean DEFAULT false,
	`nextReviewAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `exercise_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`skill` varchar(100) NOT NULL,
	`lessonId` varchar(100) NOT NULL,
	`keypointId` varchar(100) NOT NULL,
	`status` enum('required','recommended','optional','completed') NOT NULL DEFAULT 'required',
	`score` int DEFAULT 0,
	`completed` boolean DEFAULT false,
	`lastAttemptAt` timestamp,
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `learning_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_onboarding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(64) NOT NULL,
	`userName` varchar(255) NOT NULL,
	`favoriteTopics` json NOT NULL,
	`selectedSkill` varchar(100) NOT NULL,
	`learningTime` varchar(50) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `user_onboarding_id` PRIMARY KEY(`id`)
);
