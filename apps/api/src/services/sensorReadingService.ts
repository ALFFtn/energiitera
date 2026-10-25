import { db } from '../config/database';
import { buildingSensorReadings, buildings } from '../db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import { formatDateTimeWIB } from '../utils/datetime';

interface SensorData {
    voltage_r?: number;
    voltage_s?: number;
    voltage_t?: number;
    current_r?: number;
    current_s?: number;
    current_t?: number;
    power?: number;
    power_factor?: number;
    frequency?: number;
    temperature?: number;
    energy?: number;
    thd_v?: number;
    thd_i?: number;
}

// In-memory buffer for batching writes
const readingsBuffer: Map<string, { buildingId: string; sensorId: string; data: SensorData; timestamp: Date }> = new Map();

// Save a sensor reading to database
export async function saveSensorReading(
    buildingCode: string,
    sensorId: string,
    data: SensorData
): Promise<void> {
    try {
        // Find building by code
        const building = await db.query.buildings.findFirst({
            where: eq(buildings.code, buildingCode.toUpperCase()),
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

    } catch (error) {
        console.error(`❌ Error buffering sensor reading for ${buildingCode}/${sensorId}:`, error);
    }
}

// Flush buffered readings to database (call periodically)
export async function flushSensorReadings(): Promise<number> {
    if (readingsBuffer.size === 0) return 0;

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

        console.log(`💾 Flushing ${readings.length} sensor readings to database:`, 
            valuesToInsert.slice(0, 1).map(v => ({ buildingId: v.buildingId, sensorId: v.sensorId, voltageR: v.voltageR, currentR: v.currentR }))
        );

        await db.insert(buildingSensorReadings).values(valuesToInsert);

        console.log(`✅ Saved ${readings.length} sensor readings to database`);
        return readings.length;
    } catch (error) {
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
export async function getSensorReadings(
    buildingId: string,
    options?: {
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }
): Promise<typeof buildingSensorReadings.$inferSelect[]> {
    const { limit = 1000 } = options || {};

    const query = db.select()
        .from(buildingSensorReadings)
        .where(eq(buildingSensorReadings.buildingId, buildingId))
        .orderBy(desc(buildingSensorReadings.timestamp))
        .limit(limit);

    return await query;
}

// Get readings with date range
export async function getSensorReadingsInRange(
    buildingId: string,
    startDate: Date,
    endDate: Date,
    limit: number = 10000
): Promise<typeof buildingSensorReadings.$inferSelect[]> {
    return await db.select()
        .from(buildingSensorReadings)
        .where(
            and(
                eq(buildingSensorReadings.buildingId, buildingId),
                gte(buildingSensorReadings.timestamp, startDate),
                lte(buildingSensorReadings.timestamp, endDate)
            )
        )
        .orderBy(desc(buildingSensorReadings.timestamp))
        .limit(limit);
}

// Get sensor readings bucketed by time interval (for chart downsampling)
export async function getSensorReadingsBucketed(
    buildingId: string,
    startDate: Date,
    endDate: Date,
    bucketSeconds: number,
): Promise<Array<{
    timestamp: Date;
    voltageR: string | null;
    voltageS: string | null;
    voltageT: string | null;
    currentR: string | null;
    currentS: string | null;
    currentT: string | null;
    power: string | null;
    powerFactor: string | null;
    frequency: string | null;
    temperature: string | null;
    thdVoltage: string | null;
    thdCurrent: string | null;
    energy: string | null;
}>> {
    const bs = bucketSeconds;
    return await db.select({
        timestamp: sql<Date>`MIN(FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(${buildingSensorReadings.timestamp}) / ${bs}) * ${bs}))`,
        voltageR:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.voltageR}    AS DECIMAL(10,4))) AS CHAR)`,
        voltageS:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.voltageS}    AS DECIMAL(10,4))) AS CHAR)`,
        voltageT:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.voltageT}    AS DECIMAL(10,4))) AS CHAR)`,
        currentR:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.currentR}    AS DECIMAL(10,4))) AS CHAR)`,
        currentS:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.currentS}    AS DECIMAL(10,4))) AS CHAR)`,
        currentT:    sql<string>`CAST(AVG(CAST(${buildingSensorReadings.currentT}    AS DECIMAL(10,4))) AS CHAR)`,
        power:       sql<string>`CAST(AVG(CAST(${buildingSensorReadings.power}       AS DECIMAL(10,4))) AS CHAR)`,
        powerFactor: sql<string>`CAST(AVG(CAST(${buildingSensorReadings.powerFactor} AS DECIMAL(10,4))) AS CHAR)`,
        frequency:   sql<string>`CAST(AVG(CAST(${buildingSensorReadings.frequency}   AS DECIMAL(10,4))) AS CHAR)`,
        temperature: sql<string>`CAST(AVG(CAST(${buildingSensorReadings.temperature} AS DECIMAL(10,4))) AS CHAR)`,
        thdVoltage:  sql<string>`CAST(AVG(CAST(${buildingSensorReadings.thdVoltage}  AS DECIMAL(10,4))) AS CHAR)`,
        thdCurrent:  sql<string>`CAST(AVG(CAST(${buildingSensorReadings.thdCurrent}  AS DECIMAL(10,4))) AS CHAR)`,
        // Energy is a cumulative counter, not an instantaneous reading — take
        // the last (max) value in the bucket rather than averaging it.
        energy:      sql<string>`CAST(MAX(CAST(${buildingSensorReadings.energy}      AS DECIMAL(10,4))) AS CHAR)`,
    })
    .from(buildingSensorReadings)
    .where(and(
        eq(buildingSensorReadings.buildingId, buildingId),
        gte(buildingSensorReadings.timestamp, startDate),
        lte(buildingSensorReadings.timestamp, endDate),
    ))
    .groupBy(sql`FLOOR(UNIX_TIMESTAMP(${buildingSensorReadings.timestamp}) / ${bs})`)
    .orderBy(sql`FLOOR(UNIX_TIMESTAMP(${buildingSensorReadings.timestamp}) / ${bs}) ASC`);
}

// Get the latest sensor reading for a building
export async function getLatestSensorReading(
    buildingId: string
): Promise<typeof buildingSensorReadings.$inferSelect | null> {
    const results = await db.select()
        .from(buildingSensorReadings)
        .where(eq(buildingSensorReadings.buildingId, buildingId))
        .orderBy(desc(buildingSensorReadings.timestamp))
        .limit(1);

    return results[0] || null;
}

// Get latest sensor reading for all buildings at once
export async function getAllLatestReadings(): Promise<Array<{
    buildingId: string;
    buildingCode: string;
    reading: typeof buildingSensorReadings.$inferSelect;
}>> {
    // Get all buildings
    const allBuildings = await db.select({
        id: buildings.id,
        code: buildings.code,
    }).from(buildings);

    const results: Array<{
        buildingId: string;
        buildingCode: string;
        reading: typeof buildingSensorReadings.$inferSelect;
    }> = [];

    for (const b of allBuildings) {
        const latest = await db.select()
            .from(buildingSensorReadings)
            .where(eq(buildingSensorReadings.buildingId, b.id))
            .orderBy(desc(buildingSensorReadings.timestamp))
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

// Export bucket size: agregat per 5 menit (rata-rata), bukan baris mentah
// per ~10 detik — permintaan klien, sekaligus bikin file jauh lebih ringkas
// untuk rentang panjang (30 hari @ 5 menit ≈ 8.640 baris, vs sebelumnya
// cuma sanggup ~27 jam data mentah dalam batas 10.000 baris).
const EXPORT_BUCKET_SECONDS = 300;

// Export readings as CSV-ready array — selalu diagregasi per 5 menit.
export async function exportReadingsAsCSV(
    buildingId: string,
    startDate?: Date,
    endDate?: Date
): Promise<string[][]> {
    let from = startDate;
    let to = endDate;

    if (!from || !to) {
        // Tanpa rentang eksplisit = ekspor semua data yang ada: cari rentang
        // tanggal sungguhan dari data yang tersimpan, bukan sekadar N baris
        // terakhir (yang dulu, dgn data mentah, cuma menjangkau ~1 hari).
        const [bounds] = await db.select({
            minTs: sql<Date | null>`MIN(${buildingSensorReadings.timestamp})`,
            maxTs: sql<Date | null>`MAX(${buildingSensorReadings.timestamp})`,
        }).from(buildingSensorReadings).where(eq(buildingSensorReadings.buildingId, buildingId));

        if (!bounds?.minTs || !bounds?.maxTs) return [['Timestamp']]; // tidak ada data sama sekali

        from = from ?? new Date(bounds.minTs);
        to = to ?? new Date(bounds.maxTs);
    }

    const readings = await getSensorReadingsBucketed(buildingId, from, to, EXPORT_BUCKET_SECONDS);

    const headers = [
        'Timestamp',
        'Voltage R (V)', 'Voltage S (V)', 'Voltage T (V)',
        'Current R (A)', 'Current S (A)', 'Current T (A)',
        'Power (kW)', 'Power Factor',
        'Frequency (Hz)', 'Temperature (C)', 'Energy (kWh)',
        'THD Voltage (%)', 'THD Current (%)'
    ];

    const rows = readings.map(r => [
        // r.timestamp dari getSensorReadingsBucketed() adalah string mentah
        // MySQL ("YYYY-MM-DD HH:mm:ss"), bukan objek Date (beda dgn query
        // baris-mentah) -- harus dibungkus new Date() dulu.
        formatDateTimeWIB(new Date(r.timestamp)),
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
