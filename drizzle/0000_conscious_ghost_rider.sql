CREATE TABLE `responses` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text NOT NULL,
	`attempts` text NOT NULL,
	`accepted` integer NOT NULL,
	`chases` integer NOT NULL
);
