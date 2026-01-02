CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"role" varchar(20) DEFAULT 'operator' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"zone_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(20) DEFAULT 'operational' NOT NULL,
	"grid_connection" varchar(50) DEFAULT 'primary' NOT NULL,
	"last_sync_at" timestamp,
	"map_coordinates" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campuses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"location" varchar(255),
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" varchar(20) DEFAULT 'normal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alert_thresholds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_id" uuid NOT NULL,
	"metric" varchar(50) NOT NULL,
	"min_warning" numeric(10, 2),
	"max_warning" numeric(10, 2),
	"min_critical" numeric(10, 2),
	"max_critical" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "panel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_id" uuid NOT NULL,
	"type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'info' NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" varchar(500),
	"user_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "panel_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"voltage_ln" numeric(8, 2),
	"voltage_ln_min" numeric(8, 2),
	"voltage_ln_max" numeric(8, 2),
	"current_total" numeric(8, 2),
	"current_phase_a" numeric(8, 2),
	"current_phase_b" numeric(8, 2),
	"current_phase_c" numeric(8, 2),
	"power_factor" numeric(4, 3),
	"frequency" numeric(6, 3),
	"power_kw" numeric(10, 2),
	"energy_kwh" numeric(12, 2),
	"signal_quality" integer,
	"thd_percentage" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "panels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"location" varchar(100),
	"status" varchar(20) DEFAULT 'normal' NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"uptime_seconds" bigint DEFAULT 0 NOT NULL,
	"started_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "building_sensor_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid NOT NULL,
	"sensor_id" varchar(50) DEFAULT 'lvmdp-01' NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"voltage_r" numeric(8, 2),
	"voltage_s" numeric(8, 2),
	"voltage_t" numeric(8, 2),
	"current_r" numeric(8, 2),
	"current_s" numeric(8, 2),
	"current_t" numeric(8, 2),
	"power" numeric(10, 2),
	"power_factor" numeric(4, 3),
	"frequency" numeric(6, 3),
	"temperature" numeric(5, 2),
	"energy" numeric(12, 2),
	"thd_voltage" numeric(5, 2),
	"thd_current" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"panel_id" uuid,
	"building_id" uuid,
	"severity" varchar(20) NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"acknowledged_by" uuid,
	"acknowledged_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "consumption_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"building_id" uuid,
	"timestamp" timestamp NOT NULL,
	"consumption_kwh" numeric(12, 2) NOT NULL,
	"cost_usd" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"color" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "grid_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campus_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"total_load_mw" numeric(8, 3),
	"frequency_hz" numeric(6, 3),
	"power_factor" numeric(4, 3),
	"active_alarms" integer DEFAULT 0 NOT NULL,
	"carbon_footprint_tons" numeric(8, 2),
	"estimated_cost_per_hour" numeric(10, 2)
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_zone_id_zones_id_fk" FOREIGN KEY ("zone_id") REFERENCES "public"."zones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zones" ADD CONSTRAINT "zones_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_thresholds" ADD CONSTRAINT "alert_thresholds_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_events" ADD CONSTRAINT "panel_events_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panel_readings" ADD CONSTRAINT "panel_readings_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "panels" ADD CONSTRAINT "panels_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "building_sensor_readings" ADD CONSTRAINT "building_sensor_readings_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_panel_id_panels_id_fk" FOREIGN KEY ("panel_id") REFERENCES "public"."panels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_acknowledged_by_users_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consumption_records" ADD CONSTRAINT "consumption_records_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_metrics" ADD CONSTRAINT "grid_metrics_campus_id_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "panel_readings_panel_id_idx" ON "panel_readings" USING btree ("panel_id");--> statement-breakpoint
CREATE INDEX "panel_readings_timestamp_idx" ON "panel_readings" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "building_sensor_readings_building_id_idx" ON "building_sensor_readings" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "building_sensor_readings_timestamp_idx" ON "building_sensor_readings" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "building_sensor_readings_building_timestamp_idx" ON "building_sensor_readings" USING btree ("building_id","timestamp");--> statement-breakpoint
CREATE INDEX "alerts_status_idx" ON "alerts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alerts_severity_idx" ON "alerts" USING btree ("severity");--> statement-breakpoint
CREATE INDEX "consumption_records_timestamp_idx" ON "consumption_records" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "consumption_records_department_id_idx" ON "consumption_records" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "grid_metrics_timestamp_idx" ON "grid_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "grid_metrics_campus_id_idx" ON "grid_metrics" USING btree ("campus_id");