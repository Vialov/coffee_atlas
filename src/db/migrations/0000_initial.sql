CREATE TABLE `coffee_lots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`roaster` text NOT NULL,
	`country` text,
	`region` text,
	`process` text,
	`variety` text,
	`roast_date` text,
	`package_descriptors` text NOT NULL,
	`my_impression` text,
	`rating` real,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
