"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gridMetricsRelations = exports.consumptionRecordsRelations = exports.departmentsRelations = exports.gridMetrics = exports.consumptionRecords = exports.departments = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const buildings_1 = require("./buildings");
exports.departments = (0, pg_core_1.pgTable)('departments', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    campusId: (0, pg_core_1.uuid)('campus_id').notNull().references(() => buildings_1.campuses.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
});
exports.consumptionRecords = (0, pg_core_1.pgTable)('consumption_records', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    departmentId: (0, pg_core_1.uuid)('department_id').notNull().references(() => exports.departments.id, { onDelete: 'cascade' }),
    buildingId: (0, pg_core_1.uuid)('building_id'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull(),
    consumptionKwh: (0, pg_core_1.decimal)('consumption_kwh', { precision: 12, scale: 2 }).notNull(),
    costUsd: (0, pg_core_1.decimal)('cost_usd', { precision: 10, scale: 2 }),
}, (table) => [
    (0, pg_core_1.index)('consumption_records_timestamp_idx').on(table.timestamp),
    (0, pg_core_1.index)('consumption_records_department_id_idx').on(table.departmentId),
]);
exports.gridMetrics = (0, pg_core_1.pgTable)('grid_metrics', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    campusId: (0, pg_core_1.uuid)('campus_id').notNull().references(() => buildings_1.campuses.id, { onDelete: 'cascade' }),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    totalLoadMw: (0, pg_core_1.decimal)('total_load_mw', { precision: 8, scale: 3 }),
    frequencyHz: (0, pg_core_1.decimal)('frequency_hz', { precision: 6, scale: 3 }),
    powerFactor: (0, pg_core_1.decimal)('power_factor', { precision: 4, scale: 3 }),
    activeAlarms: (0, pg_core_1.integer)('active_alarms').notNull().default(0),
    carbonFootprintTons: (0, pg_core_1.decimal)('carbon_footprint_tons', { precision: 8, scale: 2 }),
    estimatedCostPerHour: (0, pg_core_1.decimal)('estimated_cost_per_hour', { precision: 10, scale: 2 }),
}, (table) => [
    (0, pg_core_1.index)('grid_metrics_timestamp_idx').on(table.timestamp),
    (0, pg_core_1.index)('grid_metrics_campus_id_idx').on(table.campusId),
]);
// Relations
exports.departmentsRelations = (0, drizzle_orm_1.relations)(exports.departments, ({ one, many }) => ({
    campus: one(buildings_1.campuses, {
        fields: [exports.departments.campusId],
        references: [buildings_1.campuses.id],
    }),
    consumptionRecords: many(exports.consumptionRecords),
}));
exports.consumptionRecordsRelations = (0, drizzle_orm_1.relations)(exports.consumptionRecords, ({ one }) => ({
    department: one(exports.departments, {
        fields: [exports.consumptionRecords.departmentId],
        references: [exports.departments.id],
    }),
}));
exports.gridMetricsRelations = (0, drizzle_orm_1.relations)(exports.gridMetrics, ({ one }) => ({
    campus: one(buildings_1.campuses, {
        fields: [exports.gridMetrics.campusId],
        references: [buildings_1.campuses.id],
    }),
}));
//# sourceMappingURL=analytics.js.map