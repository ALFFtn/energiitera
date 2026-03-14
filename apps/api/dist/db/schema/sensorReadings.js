"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingSensorReadingsRelations = exports.buildingSensorReadings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const buildings_1 = require("./buildings");
// Building sensor readings for LVMDP data
exports.buildingSensorReadings = (0, pg_core_1.pgTable)('building_sensor_readings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    buildingId: (0, pg_core_1.uuid)('building_id').notNull().references(() => buildings_1.buildings.id, { onDelete: 'cascade' }),
    sensorId: (0, pg_core_1.varchar)('sensor_id', { length: 50 }).notNull().default('lvmdp-01'),
    timestamp: (0, pg_core_1.timestamp)('timestamp').notNull().defaultNow(),
    // Voltage L-N (3-phase)
    voltageR: (0, pg_core_1.decimal)('voltage_r', { precision: 8, scale: 2 }),
    voltageS: (0, pg_core_1.decimal)('voltage_s', { precision: 8, scale: 2 }),
    voltageT: (0, pg_core_1.decimal)('voltage_t', { precision: 8, scale: 2 }),
    // Current (3-phase)
    currentR: (0, pg_core_1.decimal)('current_r', { precision: 8, scale: 2 }),
    currentS: (0, pg_core_1.decimal)('current_s', { precision: 8, scale: 2 }),
    currentT: (0, pg_core_1.decimal)('current_t', { precision: 8, scale: 2 }),
    // Power
    power: (0, pg_core_1.decimal)('power', { precision: 10, scale: 2 }),
    powerFactor: (0, pg_core_1.decimal)('power_factor', { precision: 4, scale: 3 }),
    // Other metrics
    frequency: (0, pg_core_1.decimal)('frequency', { precision: 6, scale: 3 }),
    temperature: (0, pg_core_1.decimal)('temperature', { precision: 5, scale: 2 }),
    energy: (0, pg_core_1.decimal)('energy', { precision: 12, scale: 2 }),
    // THD
    thdVoltage: (0, pg_core_1.decimal)('thd_voltage', { precision: 5, scale: 2 }),
    thdCurrent: (0, pg_core_1.decimal)('thd_current', { precision: 5, scale: 2 }),
}, (table) => [
    (0, pg_core_1.index)('building_sensor_readings_building_id_idx').on(table.buildingId),
    (0, pg_core_1.index)('building_sensor_readings_timestamp_idx').on(table.timestamp),
    (0, pg_core_1.index)('building_sensor_readings_building_timestamp_idx').on(table.buildingId, table.timestamp),
]);
// Relations
exports.buildingSensorReadingsRelations = (0, drizzle_orm_1.relations)(exports.buildingSensorReadings, ({ one }) => ({
    building: one(buildings_1.buildings, {
        fields: [exports.buildingSensorReadings.buildingId],
        references: [buildings_1.buildings.id],
    }),
}));
//# sourceMappingURL=sensorReadings.js.map