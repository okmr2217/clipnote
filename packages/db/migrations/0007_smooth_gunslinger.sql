PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_page_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`content` text NOT NULL,
	`content_type` text NOT NULL,
	`version_number` integer NOT NULL,
	`source` text DEFAULT 'web' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "page_versions_content_type_check" CHECK("__new_page_versions"."content_type" in ('html', 'markdown', 'plaintext')),
	CONSTRAINT "page_versions_source_check" CHECK("__new_page_versions"."source" in ('web', 'api_key', 'oauth'))
);
--> statement-breakpoint
INSERT INTO `__new_page_versions`("id", "page_id", "content", "content_type", "version_number", "created_at") SELECT "id", "page_id", "content", "content_type", "version_number", "created_at" FROM `page_versions`;--> statement-breakpoint
DROP TABLE `page_versions`;--> statement-breakpoint
ALTER TABLE `__new_page_versions` RENAME TO `page_versions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `page_versions_page_id_idx` ON `page_versions` (`page_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `page_versions_page_id_version_number_unique` ON `page_versions` (`page_id`,`version_number`);