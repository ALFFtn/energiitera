CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`refresh_token` varchar(500) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` varchar(20) NOT NULL DEFAULT 'operator',
	`avatar_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `buildings` (
	`id` varchar(36) NOT NULL,
	`zone_id` varchar(36) NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`status` varchar(20) NOT NULL DEFAULT 'operational',
	`grid_connection` varchar(50) NOT NULL DEFAULT 'primary',
	`last_sync_at` timestamp,
	`map_coordinates` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `buildings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `campuses` (
	`id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`location` varchar(255),
	`timezone` varchar(50) NOT NULL DEFAULT 'UTC',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campuses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` varchar(36) NOT NULL,
	`campus_id` varchar(36) NOT NULL,
	`code` varchar(10) NOT NULL,
	`name` varchar(100) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'normal',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alert_thresholds` (
	`id` varchar(36) NOT NULL,
	`panel_id` varchar(36) NOT NULL,
	`metric` varchar(50) NOT NULL,
	`min_warning` decimal(10,2),
	`max_warning` decimal(10,2),
	`min_critical` decimal(10,2),
	`max_critical` decimal(10,2),
	CONSTRAINT `alert_thresholds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `panel_events` (
	`id` varchar(36) NOT NULL,
	`panel_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL DEFAULT 'info',
	`title` varchar(200) NOT NULL,
	`description` varchar(500),
	`user_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `panel_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `panel_readings` (
	`id` varchar(36) NOT NULL,
	`panel_id` varchar(36) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`voltage_ln` decimal(8,2),
	`voltage_ln_min` decimal(8,2),
	`voltage_ln_max` decimal(8,2),
	`current_total` decimal(8,2),
	`current_phase_a` decimal(8,2),
	`current_phase_b` decimal(8,2),
	`current_phase_c` decimal(8,2),
	`power_factor` decimal(4,3),
	`frequency` decimal(6,3),
	`power_kw` decimal(10,2),
	`energy_kwh` decimal(12,2),
	`signal_quality` int,
	`thd_percentage` decimal(5,2),
	CONSTRAINT `panel_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `panels` (
	`id` varchar(36) NOT NULL,
	`building_id` varchar(36) NOT NULL,
	`code` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`location` varchar(100),
	`status` varchar(20) NOT NULL DEFAULT 'normal',
	`maintenance_mode` boolean NOT NULL DEFAULT false,
	`uptime_seconds` bigint NOT NULL DEFAULT 0,
	`started_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `panels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `building_sensor_readings` (
	`id` varchar(36) NOT NULL,
	`building_id` varchar(36) NOT NULL,
	`sensor_id` varchar(50) NOT NULL DEFAULT 'lvmdp-01',
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`voltage_r` decimal(8,2),
	`voltage_s` decimal(8,2),
	`voltage_t` decimal(8,2),
	`current_r` decimal(8,2),
	`current_s` decimal(8,2),
	`current_t` decimal(8,2),
	`power` decimal(10,2),
	`power_factor` decimal(4,3),
	`frequency` decimal(6,3),
	`temperature` decimal(5,2),
	`energy` decimal(12,2),
	`thd_voltage` decimal(5,2),
	`thd_current` decimal(5,2),
	CONSTRAINT `building_sensor_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` varchar(36) NOT NULL,
	`panel_id` varchar(36),
	`building_id` varchar(36),
	`severity` varchar(20) NOT NULL,
	`title` varchar(200) NOT NULL,
	`message` text,
	`status` varchar(20) NOT NULL DEFAULT 'active',
	`triggered_at` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	`acknowledged_by` varchar(36),
	`acknowledged_at` timestamp,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consumption_records` (
	`id` varchar(36) NOT NULL,
	`department_id` varchar(36) NOT NULL,
	`building_id` varchar(36),
	`timestamp` timestamp NOT NULL,
	`consumption_kwh` decimal(12,2) NOT NULL,
	`cost_usd` decimal(10,2),
	CONSTRAINT `consumption_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` varchar(36) NOT NULL,
	`campus_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`color` varchar(20),
	CONSTRAINT `departments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grid_metrics` (
	`id` varchar(36) NOT NULL,
	`campus_id` varchar(36) NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`total_load_mw` decimal(8,3),
	`frequency_hz` decimal(6,3),
	`power_factor` decimal(4,3),
	`active_alarms` int NOT NULL DEFAULT 0,
	`carbon_footprint_tons` decimal(8,2),
	`estimated_cost_per_hour` decimal(10,2),
	CONSTRAINT `grid_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `buildings` ADD CONSTRAINT `buildings_zone_id_zones_id_fk` FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `zones` ADD CONSTRAINT `zones_campus_id_campuses_id_fk` FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alert_thresholds` ADD CONSTRAINT `alert_thresholds_panel_id_panels_id_fk` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `panel_events` ADD CONSTRAINT `panel_events_panel_id_panels_id_fk` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `panel_readings` ADD CONSTRAINT `panel_readings_panel_id_panels_id_fk` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `panels` ADD CONSTRAINT `panels_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `building_sensor_readings` ADD CONSTRAINT `building_sensor_readings_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_panel_id_panels_id_fk` FOREIGN KEY (`panel_id`) REFERENCES `panels`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_building_id_buildings_id_fk` FOREIGN KEY (`building_id`) REFERENCES `buildings`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alerts` ADD CONSTRAINT `alerts_acknowledged_by_users_id_fk` FOREIGN KEY (`acknowledged_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `consumption_records` ADD CONSTRAINT `consumption_records_department_id_departments_id_fk` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_campus_id_campuses_id_fk` FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `grid_metrics` ADD CONSTRAINT `grid_metrics_campus_id_campuses_id_fk` FOREIGN KEY (`campus_id`) REFERENCES `campuses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `panel_readings_panel_id_idx` ON `panel_readings` (`panel_id`);--> statement-breakpoint
CREATE INDEX `panel_readings_timestamp_idx` ON `panel_readings` (`timestamp`);--> statement-breakpoint
CREATE INDEX `building_sensor_readings_building_id_idx` ON `building_sensor_readings` (`building_id`);--> statement-breakpoint
CREATE INDEX `building_sensor_readings_timestamp_idx` ON `building_sensor_readings` (`timestamp`);--> statement-breakpoint
CREATE INDEX `building_sensor_readings_building_timestamp_idx` ON `building_sensor_readings` (`building_id`,`timestamp`);--> statement-breakpoint
CREATE INDEX `alerts_status_idx` ON `alerts` (`status`);--> statement-breakpoint
CREATE INDEX `alerts_severity_idx` ON `alerts` (`severity`);--> statement-breakpoint
CREATE INDEX `consumption_records_timestamp_idx` ON `consumption_records` (`timestamp`);--> statement-breakpoint
CREATE INDEX `consumption_records_department_id_idx` ON `consumption_records` (`department_id`);--> statement-breakpoint
CREATE INDEX `grid_metrics_timestamp_idx` ON `grid_metrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `grid_metrics_campus_id_idx` ON `grid_metrics` (`campus_id`);