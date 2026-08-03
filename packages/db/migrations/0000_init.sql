CREATE TABLE `collection_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`page_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `collection_pages_collection_id_idx` ON `collection_pages` (`collection_id`);--> statement-breakpoint
CREATE INDEX `collection_pages_page_id_idx` ON `collection_pages` (`page_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `collection_pages_collection_page_unique` ON `collection_pages` (`collection_id`,`page_id`);--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "collections_visibility_check" CHECK("collections"."visibility" in ('private', 'public'))
);
--> statement-breakpoint
CREATE INDEX `collections_user_id_idx` ON `collections` (`user_id`);--> statement-breakpoint
CREATE TABLE `page_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text NOT NULL,
	`version_number` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "page_versions_content_type_check" CHECK("page_versions"."content_type" in ('html', 'markdown'))
);
--> statement-breakpoint
CREATE INDEX `page_versions_page_id_idx` ON `page_versions` (`page_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_versions_page_id_version_number_unique` ON `page_versions` (`page_id`,`version_number`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "pages_content_type_check" CHECK("pages"."content_type" in ('html', 'markdown')),
	CONSTRAINT "pages_visibility_check" CHECK("pages"."visibility" in ('private', 'public'))
);
--> statement-breakpoint
CREATE INDEX `pages_user_id_idx` ON `pages` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL
);
