"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchWriter = void 0;
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class BatchWriter {
    buffer = [];
    config;
    flushTimer = null;
    panelIdCache = new Map();
    isProcessing = false;
    totalWritten = 0;
    constructor(config) {
        this.config = config;
    }
    start() {
        if (this.flushTimer)
            return;
        this.flushTimer = setInterval(() => {
            this.flush();
        }, this.config.flushIntervalMs);
        console.log(`📝 Batch writer started (batch: ${this.config.batchSize}, interval: ${this.config.flushIntervalMs}ms)`);
    }
    stop() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        // Final flush
        this.flush();
        console.log(`📝 Batch writer stopped (total written: ${this.totalWritten})`);
    }
    /**
     * Add metrics to the buffer
     */
    add(metrics) {
        this.buffer.push(metrics);
        // Flush immediately if buffer is full
        if (this.buffer.length >= this.config.batchSize) {
            this.flush();
        }
    }
    /**
     * Flush buffer to database
     */
    async flush() {
        if (this.buffer.length === 0 || this.isProcessing)
            return;
        this.isProcessing = true;
        const batch = [...this.buffer];
        this.buffer = [];
        try {
            // Resolve panel codes to IDs
            const records = await Promise.all(batch.map(async (m) => {
                const panelId = await this.resolvePanelId(m.panelCode);
                if (!panelId)
                    return null;
                return {
                    panelId,
                    timestamp: m.timestamp,
                    voltageLn: m.voltageLnR.toString(), // Store phase R as primary
                    voltageLnMin: Math.min(m.voltageLnR, m.voltageLnS, m.voltageLnT).toString(),
                    voltageLnMax: Math.max(m.voltageLnR, m.voltageLnS, m.voltageLnT).toString(),
                    currentTotal: (m.currentR + m.currentS + m.currentT).toString(),
                    currentPhaseA: m.currentR.toString(),
                    currentPhaseB: m.currentS.toString(),
                    currentPhaseC: m.currentT.toString(),
                    powerFactor: m.powerFactor.toString(),
                    frequency: m.frequency.toString(),
                    powerKw: m.powerKw.toString(),
                    energyKwh: m.energyKwh.toString(),
                    signalQuality: 95, // Default signal quality
                    thdPercentage: m.thdCurrent.toString(),
                };
            }));
            // Filter out null records
            const validRecords = records.filter((r) => r !== null);
            if (validRecords.length > 0) {
                await database_1.db.insert(schema_1.panelReadings).values(validRecords);
                this.totalWritten += validRecords.length;
                console.log(`💾 Wrote ${validRecords.length} readings to database (total: ${this.totalWritten})`);
            }
        }
        catch (error) {
            console.error('❌ Error writing batch to database:', error);
            // Re-add failed items to buffer for retry
            this.buffer.unshift(...batch);
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Resolve panel code to panel ID (with caching)
     */
    async resolvePanelId(panelCode) {
        // Check cache first
        if (this.panelIdCache.has(panelCode)) {
            return this.panelIdCache.get(panelCode);
        }
        // Query database
        const panel = await database_1.db.query.panels.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.panels.code, panelCode),
        });
        if (panel) {
            this.panelIdCache.set(panelCode, panel.id);
            return panel.id;
        }
        console.warn(`⚠️ Panel not found for code: ${panelCode}`);
        return null;
    }
    /**
     * Get buffer size
     */
    getBufferSize() {
        return this.buffer.length;
    }
    /**
     * Get total written count
     */
    getTotalWritten() {
        return this.totalWritten;
    }
}
exports.BatchWriter = BatchWriter;
//# sourceMappingURL=batchWriter.js.map