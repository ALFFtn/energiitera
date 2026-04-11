import { mysqlTable, varchar, timestamp, decimal, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { buildings } from './buildings';
import crypto from 'crypto';

// Building sensor readings for LVMDP data
export const buildingSensorReadings = mysqlTable('building_sensor_readings', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    buildingId: varchar('building_id', { length: 36 }).notNull().references(() => buildings.id, { onDelete: 'cascade' }),
    sensorId: varchar('sensor_id', { length: 50 }).notNull().default('lvmdp-01'),
    timestamp: timestamp('timestamp').notNull().defaultNow(),

    // Voltage L-N (3-phase)
    voltageR: decimal('voltage_r', { precision: 8, scale: 2 }),
    voltageS: decimal('voltage_s', { precision: 8, scale: 2 }),
    voltageT: decimal('voltage_t', { precision: 8, scale: 2 }),

    // Current (3-phase)
    currentR: decimal('current_r', { precision: 8, scale: 2 }),
    currentS: decimal('current_s', { precision: 8, scale: 2 }),
    currentT: decimal('current_t', { precision: 8, scale: 2 }),

    // Power
    power: decimal('power', { precision: 10, scale: 2 }),
    powerFactor: decimal('power_factor', { precision: 4, scale: 3 }),

    // Other metrics
    frequency: decimal('frequency', { precision: 6, scale: 3 }),
    temperature: decimal('temperature', { precision: 5, scale: 2 }),
    energy: decimal('energy', { precision: 12, scale: 2 }),

    // THD
    thdVoltage: decimal('thd_voltage', { precision: 5, scale: 2 }),
    thdCurrent: decimal('thd_current', { precision: 5, scale: 2 }),
}, (table) => [
    index('building_sensor_readings_building_id_idx').on(table.buildingId),
    index('building_sensor_readings_timestamp_idx').on(table.timestamp),
    index('building_sensor_readings_building_timestamp_idx').on(table.buildingId, table.timestamp),
]);

// Relations
export const buildingSensorReadingsRelations = relations(buildingSensorReadings, ({ one }) => ({
    building: one(buildings, {
        fields: [buildingSensorReadings.buildingId],
        references: [buildings.id],
    }),
}));

// Types
export type BuildingSensorReading = typeof buildingSensorReadings.$inferSelect;
export type NewBuildingSensorReading = typeof buildingSensorReadings.$inferInsert;
