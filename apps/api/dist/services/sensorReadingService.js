"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSensorReading = saveSensorReading;
exports.flushSensorReadings = flushSensorReadings;
exports.getSensorReadings = getSensorReadings;
exports.getSensorReadingsInRange = getSensorReadingsInRange;
exports.getLatestSensorReading = getLatestSensorReading;
exports.getAllLatestReadings = getAllLatestReadings;
exports.exportReadingsAsCSV = exportReadingsAsCSV;
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// In-memory buffer for batching writes
const readingsBuffer = new Map();
// Save a sensor reading to database
async function saveSensorReading(buildingCode, sensorId, data) {
    try {
        // Find building by code
        const building = await database_1.db.query.buildings.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.buildings.code, buildingCode.toUpperCase()),
        });
        if (!building) {
            console.log(`Warning: Building not found: ${buildingCode}`);
            return;
        }
        // Buffer the reading (only keep latest per building+sensor)
        const key = `${building.id}-${sensorId}`;
        readingsBuffer.set(key, {
            buildingId: building.id,
            sensorId,
            data,
            timestamp: new Date(),
        });
    }
    catch (error) {
        console.error('Error buffering sensor reading:', error);
    }
}
// Flush buffered readings to database (call periodically)
async function flushSensorReadings() {
    if (readingsBuffer.size === 0)
        return 0;
    const readings = Array.from(readingsBuffer.values());
    readingsBuffer.clear();
    try {
        // Insert all buffered readings
        await database_1.db.insert(schema_1.buildingSensorReadings).values(readings.map(r => ({
            buildingId: r.buildingId,
            sensorId: r.sensorId,
            timestamp: r.timestamp,
            voltageR: r.data.voltage_r?.toString(),
            voltageS: r.data.voltage_s?.toString(),
            voltageT: r.data.voltage_t?.toString(),
            currentR: r.data.current_r?.toString(),
            currentS: r.data.current_s?.toString(),
            currentT: r.data.current_t?.toString(),
            power: r.data.power?.toString(),
            powerFactor: r.data.power_factor?.toString(),
            frequency: r.data.frequency?.toString(),
            temperature: r.data.temperature?.toString(),
            energy: r.data.energy?.toString(),
            thdVoltage: r.data.thd_v?.toString(),
            thdCurrent: r.data.thd_i?.toString(),
        })));
        console.log(`Saved ${readings.length} sensor readings to database`);
        return readings.length;
    }
    catch (error) {
        console.error('Error flushing sensor readings:', error);
        return 0;
    }
}
// Get sensor readings for a building
async function getSensorReadings(buildingId, options) {
    const { limit = 1000 } = options || {};
    const query = database_1.db.select()
        .from(schema_1.buildingSensorReadings)
        .where((0, drizzle_orm_1.eq)(schema_1.buildingSensorReadings.buildingId, buildingId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.buildingSensorReadings.timestamp))
        .limit(limit);
    return await query;
}
// Get readings with date range
async function getSensorReadingsInRange(buildingId, startDate, endDate, limit = 10000) {
    return await database_1.db.select()
        .from(schema_1.buildingSensorReadings)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.buildingSensorReadings.buildingId, buildingId), (0, drizzle_orm_1.gte)(schema_1.buildingSensorReadings.timestamp, startDate), (0, drizzle_orm_1.lte)(schema_1.buildingSensorReadings.timestamp, endDate)))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.buildingSensorReadings.timestamp))
        .limit(limit);
}
// Get the latest sensor reading for a building
async function getLatestSensorReading(buildingId) {
    const results = await database_1.db.select()
        .from(schema_1.buildingSensorReadings)
        .where((0, drizzle_orm_1.eq)(schema_1.buildingSensorReadings.buildingId, buildingId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.buildingSensorReadings.timestamp))
        .limit(1);
    return results[0] || null;
}
// Get latest sensor reading for all buildings at once
async function getAllLatestReadings() {
    // Get all buildings
    const allBuildings = await database_1.db.select({
        id: schema_1.buildings.id,
        code: schema_1.buildings.code,
    }).from(schema_1.buildings);
    const results = [];
    for (const b of allBuildings) {
        const latest = await database_1.db.select()
            .from(schema_1.buildingSensorReadings)
            .where((0, drizzle_orm_1.eq)(schema_1.buildingSensorReadings.buildingId, b.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.buildingSensorReadings.timestamp))
            .limit(1);
        if (latest[0]) {
            results.push({
                buildingId: b.id,
                buildingCode: b.code,
                reading: latest[0],
            });
        }
    }
    return results;
}
// Export readings as CSV-ready array
async function exportReadingsAsCSV(buildingId) {
    const readings = await getSensorReadings(buildingId, { limit: 10000 });
    const headers = [
        'Timestamp',
        'Voltage R (V)', 'Voltage S (V)', 'Voltage T (V)',
        'Current R (A)', 'Current S (A)', 'Current T (A)',
        'Power (kW)', 'Power Factor',
        'Frequency (Hz)', 'Temperature (C)', 'Energy (kWh)',
        'THD Voltage (%)', 'THD Current (%)'
    ];
    const rows = readings.map(r => [
        r.timestamp.toISOString(),
        r.voltageR || '',
        r.voltageS || '',
        r.voltageT || '',
        r.currentR || '',
        r.currentS || '',
        r.currentT || '',
        r.power || '',
        r.powerFactor || '',
        r.frequency || '',
        r.temperature || '',
        r.energy || '',
        r.thdVoltage || '',
        r.thdCurrent || '',
    ]);
    return [headers, ...rows];
}
//# sourceMappingURL=sensorReadingService.js.map