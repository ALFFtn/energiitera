import { mysqlTable, varchar, timestamp, decimal, int, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { campuses } from './buildings';
import crypto from 'crypto';

export const departments = mysqlTable('departments', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    campusId: varchar('campus_id', { length: 36 }).notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    color: varchar('color', { length: 20 }),
});

export const consumptionRecords = mysqlTable('consumption_records', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    departmentId: varchar('department_id', { length: 36 }).notNull().references(() => departments.id, { onDelete: 'cascade' }),
    buildingId: varchar('building_id', { length: 36 }),
    timestamp: timestamp('timestamp').notNull(),
    consumptionKwh: decimal('consumption_kwh', { precision: 12, scale: 2 }).notNull(),
    costUsd: decimal('cost_usd', { precision: 10, scale: 2 }),
}, (table) => [
    index('consumption_records_timestamp_idx').on(table.timestamp),
    index('consumption_records_department_id_idx').on(table.departmentId),
]);

export const gridMetrics = mysqlTable('grid_metrics', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    campusId: varchar('campus_id', { length: 36 }).notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').notNull().defaultNow(),
    totalLoadMw: decimal('total_load_mw', { precision: 8, scale: 3 }),
    frequencyHz: decimal('frequency_hz', { precision: 6, scale: 3 }),
    powerFactor: decimal('power_factor', { precision: 4, scale: 3 }),
    activeAlarms: int('active_alarms').notNull().default(0),
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
