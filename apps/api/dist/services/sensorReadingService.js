"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSensorReading = saveSensorReading;
exports.flushSensorReadings = flushSensorReadings;
exports.getSensorReadings = getSensorReadings;
exports.getSensorReadingsInRange = getSensorReadingsInRange;
exports.getSensorReadingsBucketed = getSensorReadingsBucketed;
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
            console.warn(`⚠️  Building not found: ${buildingCode}`);
            return;
        }
        console.log(`✅ Found building: ${buildingCode} (id: ${building.id.substring(0, 8)}...)`);
        // Buffer the reading (only keep latest per building+sensor)
        const key = `${building.id}-${sensorId}`;
        readingsBuffer.set(key, {
            buildingId: building.id,
            sensorId,
            data,
            timestamp: new Date(),
        });
        console.log(`📝 Buffered reading for ${buildingCode}/${sensorId}, buffer size: ${readingsBuffer.size}`);
    }
    catch (error) {
        console.error(`❌ Error buffering sensor reading for ${buildingCode}/${sensorId}:`, error);
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
        const valuesToInsert = readings.map(r => ({
            buildingId: r.buildingId,
            sensorId: r.sensorId,
            timestamp: r.timestamp,
            voltageR: r.data.voltage_r != null ? String(r.data.voltage_r) : undefined,
            voltageS: r.data.voltage_s != null ? String(r.data.voltage_s) : undefined,
            voltageT: r.data.voltage_t != null ? String(r.data.voltage_t) : undefined,
            currentR: r.data.current_r != null ? String(r.data.current_r) : undefined,
            currentS: r.data.current_s != null ? String(r.data.current_s) : undefined,
            currentT: r.data.current_t != null ? String(r.data.current_t) : undefined,
            power: r.data.power != null ? String(r.data.power) : undefined,
            powerFactor: r.data.power_factor != null ? String(r.data.power_factor) : undefined,
            frequency: r.data.frequency != null ? String(r.data.frequency) : undefined,
            temperature: r.data.temperature != null ? String(r.data.temperature) : undefined,
            energy: r.data.energy != null ? String(r.data.energy) : undefined,
            thdVoltage: r.data.thd_v != null ? String(r.data.thd_v) : undefined,
            thdCurrent: r.data.thd_i != null ? String(r.data.thd_i) : undefined,
        }));
        console.log(`💾 Flushing ${readings.length} sensor readings to database:`, valuesToInsert.slice(0, 1).map(v => ({ buildingId: v.buildingId, sensorId: v.sensorId, voltageR: v.voltageR, currentR: v.currentR })));
        await database_1.db.insert(schema_1.buildingSensorReadings).values(valuesToInsert);
        console.log(`✅ Saved ${readings.length} sensor readings to database`);
        return readings.length;
    }
    catch (error) {
        console.error('❌ Error flushing sensor readings:', error);
        // Re-add failed readings back to buffer for retry
        readings.forEach(r => {
            const key = `${r.buildingId}-${r.sensorId}`;
            readingsBuffer.set(key, r);
        });
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
// Get sensor readings bucketed by time interval (for chart downsampling)
async function getSensorReadingsBucketed(buildingId, startDate, endDate, bucketSeconds) {
    const bs = bucketSeconds;
    return await database_1.db.select({
        timestamp: (0, drizzle_orm_1.sql) `FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(${schema_1.buildingSensorReadings.timestamp}) / ${bs}) * ${bs})`,
        voltageR: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.voltageR}    AS DECIMAL(10,4))) AS CHAR)`,
        voltageS: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.voltageS}    AS DECIMAL(10,4))) AS CHAR)`,
        voltageT: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.voltageT}    AS DECIMAL(10,4))) AS CHAR)`,
        currentR: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.currentR}    AS DECIMAL(10,4))) AS CHAR)`,
        currentS: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.currentS}    AS DECIMAL(10,4))) AS CHAR)`,
        currentT: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.currentT}    AS DECIMAL(10,4))) AS CHAR)`,
        power: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.power}       AS DECIMAL(10,4))) AS CHAR)`,
        powerFactor: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.powerFactor} AS DECIMAL(10,4))) AS CHAR)`,
        frequency: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.frequency}   AS DECIMAL(10,4))) AS CHAR)`,
        temperature: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.temperature} AS DECIMAL(10,4))) AS CHAR)`,
        thdVoltage: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.thdVoltage}  AS DECIMAL(10,4))) AS CHAR)`,
        thdCurrent: (0, drizzle_orm_1.sql) `CAST(AVG(CAST(${schema_1.buildingSensorReadings.thdCurrent}  AS DECIMAL(10,4))) AS CHAR)`,
    })
        .from(schema_1.buildingSensorReadings)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.buildingSensorReadings.buildingId, buildingId), (0, drizzle_orm_1.gte)(schema_1.buildingSensorReadings.timestamp, startDate), (0, drizzle_orm_1.lte)(schema_1.buildingSensorReadings.timestamp, endDate)))
        .groupBy((0, drizzle_orm_1.sql) `FLOOR(UNIX_TIMESTAMP(${schema_1.buildingSensorReadings.timestamp}) / ${bs})`)
        .orderBy((0, drizzle_orm_1.sql) `FLOOR(UNIX_TIMESTAMP(${schema_1.buildingSensorReadings.timestamp}) / ${bs}) ASC`);
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