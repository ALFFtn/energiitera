import { pgTable, uuid, varchar, boolean, bigint, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { buildings } from './buildings';

export const panels = pgTable('panels', {
    id: uuid('id').primaryKey().defaultRandom(),
    buildingId: uuid('building_id').notNull().references(() => buildings.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }),
    location: varchar('location', { length: 100 }),
    status: varchar('status', { length: 20 }).notNull().default('normal'),
    maintenanceMode: boolean('maintenance_mode').notNull().default(false),
    uptimeSeconds: bigint('uptime_seconds', { mode: 'number' }).notNull().default(0),
    startedAt: timestamp('started_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const panelReadings = pgTable('panel_readings', {
    id: uuid('id').primaryKey().defaultRandom(),
    panelId: uuid('panel_id').notNull().references(() => panels.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    voltageLn: decimal('voltage_ln', { precision: 8, scale: 2 }),
    voltageLnMin: decimal('voltage_ln_min', { precision: 8, scale: 2 }),
    voltageLnMax: decimal('voltage_ln_max', { precision: 8, scale: 2 }),
    currentTotal: decimal('current_total', { precision: 8, scale: 2 }),
    currentPhaseA: decimal('current_phase_a', { precision: 8, scale: 2 }),
    currentPhaseB: decimal('current_phase_b', { precision: 8, scale: 2 }),
    currentPhaseC: decimal('current_phase_c', { precision: 8, scale: 2 }),
    powerFactor: decimal('power_factor', { precision: 4, scale: 3 }),
    frequency: decimal('frequency', { precision: 6, scale: 3 }),
    powerKw: decimal('power_kw', { precision: 10, scale: 2 }),
    energyKwh: decimal('energy_kwh', { precision: 12, scale: 2 }),
    signalQuality: integer('signal_quality'),
    thdPercentage: decimal('thd_percentage', { precision: 5, scale: 2 }),
}, (table) => [
    index('panel_readings_panel_id_idx').on(table.panelId),
    index('panel_readings_timestamp_idx').on(table.timestamp),
]);

export const panelEvents = pgTable('panel_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    panelId: uuid('panel_id').notNull().references(() => panels.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    severity: varchar('severity', { length: 20 }).notNull().default('info'),
    title: varchar('title', { length: 200 }).notNull(),
    description: varchar('description', { length: 500 }),
    userId: uuid('user_id'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const alertThresholds = pgTable('alert_thresholds', {
    id: uuid('id').primaryKey().defaultRandom(),
    panelId: uuid('panel_id').notNull().references(() => panels.id, { onDelete: 'cascade' }),
    metric: varchar('metric', { length: 50 }).notNull(),
    minWarning: decimal('min_warning', { precision: 10, scale: 2 }),
    maxWarning: decimal('max_warning', { precision: 10, scale: 2 }),
    minCritical: decimal('min_critical', { precision: 10, scale: 2 }),
    maxCritical: decimal('max_critical', { precision: 10, scale: 2 }),
});

// Relations
export const panelsRelations = relations(panels, ({ one, many }) => ({
    building: one(buildings, {
        fields: [panels.buildingId],
        references: [buildings.id],
    }),
    readings: many(panelReadings),
    events: many(panelEvents),
    thresholds: many(alertThresholds),
}));

export const panelReadingsRelations = relations(panelReadings, ({ one }) => ({
    panel: one(panels, {
        fields: [panelReadings.panelId],
        references: [panels.id],
    }),
}));

export const panelEventsRelations = relations(panelEvents, ({ one }) => ({
    panel: one(panels, {
        fields: [panelEvents.panelId],
        references: [panels.id],
    }),
}));

export const alertThresholdsRelations = relations(alertThresholds, ({ one }) => ({
    panel: one(panels, {
        fields: [alertThresholds.panelId],
        references: [panels.id],
    }),
}));

// Types
export type Panel = typeof panels.$inferSelect;
export type NewPanel = typeof panels.$inferInsert;
export type PanelReading = typeof panelReadings.$inferSelect;
export type NewPanelReading = typeof panelReadings.$inferInsert;
export type PanelEvent = typeof panelEvents.$inferSelect;
export type NewPanelEvent = typeof panelEvents.$inferInsert;
export type AlertThreshold = typeof alertThresholds.$inferSelect;
export type NewAlertThreshold = typeof alertThresholds.$inferInsert;
