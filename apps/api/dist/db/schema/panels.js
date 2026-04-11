"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertThresholdsRelations = exports.panelEventsRelations = exports.panelReadingsRelations = exports.panelsRelations = exports.alertThresholds = exports.panelEvents = exports.panelReadings = exports.panels = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const buildings_1 = require("./buildings");
const crypto_1 = __importDefault(require("crypto"));
exports.panels = (0, mysql_core_1.mysqlTable)('panels', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    buildingId: (0, mysql_core_1.varchar)('building_id', { length: 36 }).notNull().references(() => buildings_1.buildings.id, { onDelete: 'cascade' }),
    code: (0, mysql_core_1.varchar)('code', { length: 20 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, mysql_core_1.varchar)('description', { length: 255 }),
    location: (0, mysql_core_1.varchar)('location', { length: 100 }),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('normal'),
    maintenanceMode: (0, mysql_core_1.boolean)('maintenance_mode').notNull().default(false),
    uptimeSeconds: (0, mysql_core_1.bigint)('uptime_seconds', { mode: 'number' }).notNull().default(0),
    startedAt: (0, mysql_core_1.timestamp)('started_at'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.panelReadings = (0, mysql_core_1.mysqlTable)('panel_readings', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    panelId: (0, mysql_core_1.varchar)('panel_id', { length: 36 }).notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    timestamp: (0, mysql_core_1.timestamp)('timestamp').notNull().defaultNow(),
    voltageLn: (0, mysql_core_1.decimal)('voltage_ln', { precision: 8, scale: 2 }),
    voltageLnMin: (0, mysql_core_1.decimal)('voltage_ln_min', { precision: 8, scale: 2 }),
    voltageLnMax: (0, mysql_core_1.decimal)('voltage_ln_max', { precision: 8, scale: 2 }),
    currentTotal: (0, mysql_core_1.decimal)('current_total', { precision: 8, scale: 2 }),
    currentPhaseA: (0, mysql_core_1.decimal)('current_phase_a', { precision: 8, scale: 2 }),
    currentPhaseB: (0, mysql_core_1.decimal)('current_phase_b', { precision: 8, scale: 2 }),
    currentPhaseC: (0, mysql_core_1.decimal)('current_phase_c', { precision: 8, scale: 2 }),
    powerFactor: (0, mysql_core_1.decimal)('power_factor', { precision: 4, scale: 3 }),
    frequency: (0, mysql_core_1.decimal)('frequency', { precision: 6, scale: 3 }),
    powerKw: (0, mysql_core_1.decimal)('power_kw', { precision: 10, scale: 2 }),
    energyKwh: (0, mysql_core_1.decimal)('energy_kwh', { precision: 12, scale: 2 }),
    signalQuality: (0, mysql_core_1.int)('signal_quality'),
    thdPercentage: (0, mysql_core_1.decimal)('thd_percentage', { precision: 5, scale: 2 }),
}, (table) => [
    (0, mysql_core_1.index)('panel_readings_panel_id_idx').on(table.panelId),
    (0, mysql_core_1.index)('panel_readings_timestamp_idx').on(table.timestamp),
]);
exports.panelEvents = (0, mysql_core_1.mysqlTable)('panel_events', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    panelId: (0, mysql_core_1.varchar)('panel_id', { length: 36 }).notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    type: (0, mysql_core_1.varchar)('type', { length: 50 }).notNull(),
    severity: (0, mysql_core_1.varchar)('severity', { length: 20 }).notNull().default('info'),
    title: (0, mysql_core_1.varchar)('title', { length: 200 }).notNull(),
    description: (0, mysql_core_1.varchar)('description', { length: 500 }),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.alertThresholds = (0, mysql_core_1.mysqlTable)('alert_thresholds', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    panelId: (0, mysql_core_1.varchar)('panel_id', { length: 36 }).notNull().references(() => exports.panels.id, { onDelete: 'cascade' }),
    metric: (0, mysql_core_1.varchar)('metric', { length: 50 }).notNull(),
    minWarning: (0, mysql_core_1.decimal)('min_warning', { precision: 10, scale: 2 }),
    maxWarning: (0, mysql_core_1.decimal)('max_warning', { precision: 10, scale: 2 }),
    minCritical: (0, mysql_core_1.decimal)('min_critical', { precision: 10, scale: 2 }),
    maxCritical: (0, mysql_core_1.decimal)('max_critical', { precision: 10, scale: 2 }),
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