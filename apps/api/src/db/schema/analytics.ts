import { pgTable, uuid, varchar, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { campuses } from './buildings';

export const departments = pgTable('departments', {
    id: uuid('id').primaryKey().defaultRandom(),
    campusId: uuid('campus_id').notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    color: varchar('color', { length: 20 }),
});

export const consumptionRecords = pgTable('consumption_records', {
    id: uuid('id').primaryKey().defaultRandom(),
    departmentId: uuid('department_id').notNull().references(() => departments.id, { onDelete: 'cascade' }),
    buildingId: uuid('building_id'),
    timestamp: timestamp('timestamp').notNull(),
    consumptionKwh: decimal('consumption_kwh', { precision: 12, scale: 2 }).notNull(),
    costUsd: decimal('cost_usd', { precision: 10, scale: 2 }),
}, (table) => [
    index('consumption_records_timestamp_idx').on(table.timestamp),
    index('consumption_records_department_id_idx').on(table.departmentId),
]);

export const gridMetrics = pgTable('grid_metrics', {
    id: uuid('id').primaryKey().defaultRandom(),
    campusId: uuid('campus_id').notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    totalLoadMw: decimal('total_load_mw', { precision: 8, scale: 3 }),
    frequencyHz: decimal('frequency_hz', { precision: 6, scale: 3 }),
    powerFactor: decimal('power_factor', { precision: 4, scale: 3 }),
    activeAlarms: integer('active_alarms').notNull().default(0),
    carbonFootprintTons: decimal('carbon_footprint_tons', { precision: 8, scale: 2 }),
    estimatedCostPerHour: decimal('estimated_cost_per_hour', { precision: 10, scale: 2 }),
}, (table) => [
    index('grid_metrics_timestamp_idx').on(table.timestamp),
    index('grid_metrics_campus_id_idx').on(table.campusId),
]);

// Relations
export const departmentsRelations = relations(departments, ({ one, many }) => ({
    campus: one(campuses, {
        fields: [departments.campusId],
        references: [campuses.id],
    }),
    consumptionRecords: many(consumptionRecords),
}));

export const consumptionRecordsRelations = relations(consumptionRecords, ({ one }) => ({
    department: one(departments, {
        fields: [consumptionRecords.departmentId],
        references: [departments.id],
    }),
}));

export const gridMetricsRelations = relations(gridMetrics, ({ one }) => ({
    campus: one(campuses, {
        fields: [gridMetrics.campusId],
        references: [campuses.id],
    }),
}));

// Types
export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type ConsumptionRecord = typeof consumptionRecords.$inferSelect;
export type NewConsumptionRecord = typeof consumptionRecords.$inferInsert;
export type GridMetric = typeof gridMetrics.$inferSelect;
export type NewGridMetric = typeof gridMetrics.$inferInsert;
