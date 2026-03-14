"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertThresholdsRelations = exports.panelEventsRelations = exports.panelReadingsRelations = exports.panelsRelations = exports.alertThresholds = exports.panelEvents = exports.panelReadings = exports.panels = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const buildings_1 = require("./buildings");
exports.panels = (0, pg_core_1.pgTable)('panels', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    buildingId: (0, pg_core_1.uuid)('building_id').notNull().references(() => buildings_1.buildings.id, { onDelete: 'cascade' }),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 255 }),
    location: (0, pg_core_1.varchar)('location', { length: 100 }),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('normal'),
    maintenanceMode: (0, pg_core_1.boolean)('maintenance_mode').notNull().default(false),
    uptimeSeconds: (0, pg_core_1.bigint)('uptime_seconds', { mode: 'number' }).notNull().default(0),
    startedAt: (0, pg_core_1.timestamp)('started_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.panelReadings = (0, pg_core_1.pgTable)('panel_readings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    panelId: (0, pg_core_1.uuid)('panel_id').notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    voltageLn: (0, pg_core_1.decimal)('voltage_ln', { precision: 8, scale: 2 }),
    voltageLnMin: (0, pg_core_1.decimal)('voltage_ln_min', { precision: 8, scale: 2 }),
    voltageLnMax: (0, pg_core_1.decimal)('voltage_ln_max', { precision: 8, scale: 2 }),
    currentTotal: (0, pg_core_1.decimal)('current_total', { precision: 8, scale: 2 }),
    currentPhaseA: (0, pg_core_1.decimal)('current_phase_a', { precision: 8, scale: 2 }),
    currentPhaseB: (0, pg_core_1.decimal)('current_phase_b', { precision: 8, scale: 2 }),
    currentPhaseC: (0, pg_core_1.decimal)('current_phase_c', { precision: 8, scale: 2 }),
    powerFactor: (0, pg_core_1.decimal)('power_factor', { precision: 4, scale: 3 }),
    frequency: (0, pg_core_1.decimal)('frequency', { precision: 6, scale: 3 }),
    powerKw: (0, pg_core_1.decimal)('power_kw', { precision: 10, scale: 2 }),
    energyKwh: (0, pg_core_1.decimal)('energy_kwh', { precision: 12, scale: 2 }),
    signalQuality: (0, pg_core_1.integer)('signal_quality'),
    thdPercentage: (0, pg_core_1.decimal)('thd_percentage', { precision: 5, scale: 2 }),
}, (table) => [
    (0, pg_core_1.index)('panel_readings_panel_id_idx').on(table.panelId),
    (0, pg_core_1.index)('panel_readings_timestamp_idx').on(table.timestamp),
]);
exports.panelEvents = (0, pg_core_1.pgTable)('panel_events', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    panelId: (0, pg_core_1.uuid)('panel_id').notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    severity: (0, pg_core_1.varchar)('severity', { length: 20 }).notNull().default('info'),
    title: (0, pg_core_1.varchar)('title', { length: 200 }).notNull(),
    description: (0, pg_core_1.varchar)('description', { length: 500 }),
    userId: (0, pg_core_1.uuid)('user_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.alertThresholds = (0, pg_core_1.pgTable)('alert_thresholds', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    panelId: (0, pg_core_1.uuid)('panel_id').notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    metric: (0, pg_core_1.varchar)('metric', { length: 50 }).notNull(),
    minWarning: (0, pg_core_1.decimal)('min_warning', { precision: 10, scale: 2 }),
    maxWarning: (0, pg_core_1.decimal)('max_warning', { precision: 10, scale: 2 }),
    minCritical: (0, pg_core_1.decimal)('min_critical', { precision: 10, scale: 2 }),
    maxCritical: (0, pg_core_1.decimal)('max_critical', { precision: 10, scale: 2 }),
});
// Relations
exports.panelsRelations = (0, drizzle_orm_1.relations)(exports.panels, ({ one, many }) => ({
    building: one(buildings_1.buildings, {
        fields: [exports.panels.buildingId],
        references: [buildings_1.buildings.id],
    }),
    readings: many(exports.panelReadings),
    events: many(exports.panelEvents),
    thresholds: many(exports.alertThresholds),
}));
exports.panelReadingsRelations = (0, drizzle_orm_1.relations)(exports.panelReadings, ({ one }) => ({
    panel: one(exports.panels, {
        fields: [exports.panelReadings.panelId],
        references: [exports.panels.id],
    }),
}));
exports.panelEventsRelations = (0, drizzle_orm_1.relations)(exports.panelEvents, ({ one }) => ({
    panel: one(exports.panels, {
        fields: [exports.panelEvents.panelId],
        references: [exports.panels.id],
    }),
}));
exports.alertThresholdsRelations = (0, drizzle_orm_1.relations)(exports.alertThresholds, ({ one }) => ({
    panel: one(exports.panels, {
        fields: [exports.alertThresholds.panelId],
        references: [exports.panels.id],
    }),
}));
//# sourceMappingURL=panels.js.map