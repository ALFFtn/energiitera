"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataProcessor = exports.DataProcessor = exports.metricsSchema = exports.THRESHOLDS = void 0;
const zod_1 = require("zod");
const socketService_1 = require("./socketService");
const database_1 = require("../config/database");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// Threshold configuration
exports.THRESHOLDS = {
    frequency: {
        min: 49.5, // Hz - Under frequency
        max: 50.5, // Hz - Over frequency
        nominal: 50,
    },
    powerFactor: {
        min: 0.85, // PF below this triggers warning
        critical: 0.7, // PF below this triggers critical
    },
    thd: {
        warning: 15, // THD > 15% triggers warning
        critical: 25, // THD > 25% triggers critical
    },
    voltage: {
        sagThreshold: 0.9, // 90% of nominal = SAG
        swellThreshold: 1.1, // 110% of nominal = SWELL
        nominal: 230, // Nominal voltage L-N
    },
    current: {
        overload: 0.95, // 95% of rated = overload warning
        critical: 1.0, // 100% of rated = critical
    },
    temperature: {
        warning: 60, // °C
        critical: 75, // °C
    },
};
// Schema for incoming MQTT metrics
exports.metricsSchema = zod_1.z.object({
    panel_code: zod_1.z.string(),
    timestamp: zod_1.z.string().optional(),
    voltage_ln_r: zod_1.z.number().optional(),
    voltage_ln_s: zod_1.z.number().optional(),
    voltage_ln_t: zod_1.z.number().optional(),
    current_r: zod_1.z.number().optional(),
    current_s: zod_1.z.number().optional(),
    current_t: zod_1.z.number().optional(),
    frequency: zod_1.z.number().optional(),
    power_factor: zod_1.z.number().optional(),
    thd_current: zod_1.z.number().optional(),
    thd_voltage: zod_1.z.number().optional(),
    power_kw: zod_1.z.number().optional(),
    energy_kwh: zod_1.z.number().optional(),
    temperature: zod_1.z.number().optional(),
});
class DataProcessor {
    panelCache = new Map(); // panelCode -> panelId
    /**
     * Process incoming MQTT metrics data
     */
    async processMetrics(rawData) {
        try {
            const parsed = exports.metricsSchema.parse(rawData);
            const anomalies = this.detectAnomalies(parsed);
            const processed = {
                panelCode: parsed.panel_code,
                timestamp: parsed.timestamp ? new Date(parsed.timestamp) : new Date(),
                voltageLnR: parsed.voltage_ln_r || 0,
                voltageLnS: parsed.voltage_ln_s || 0,
                voltageLnT: parsed.voltage_ln_t || 0,
                currentR: parsed.current_r || 0,
                currentS: parsed.current_s || 0,
                currentT: parsed.current_t || 0,
                frequency: parsed.frequency || 50,
                powerFactor: parsed.power_factor || 1,
                thdCurrent: parsed.thd_current || 0,
                thdVoltage: parsed.thd_voltage || 0,
                powerKw: parsed.power_kw || 0,
                energyKwh: parsed.energy_kwh || 0,
                temperature: parsed.temperature,
                anomalies,
            };
            // Generate alerts for anomalies
            for (const anomaly of anomalies) {
                await this.createAlert(processed.panelCode, anomaly);
            }
            return processed;
        }
        catch (error) {
            console.error('❌ Error processing metrics:', error);
            return null;
        }
    }
    /**
     * Detect anomalies in the metrics data
     */
    detectAnomalies(data) {
        const anomalies = [];
        // Frequency check
        if (data.frequency) {
            if (data.frequency < exports.THRESHOLDS.frequency.min) {
                anomalies.push({
                    type: 'frequency',
                    severity: 'critical',
                    value: data.frequency,
                    threshold: exports.THRESHOLDS.frequency.min,
                    message: `Under-frequency detected: ${data.frequency.toFixed(2)} Hz (min: ${exports.THRESHOLDS.frequency.min} Hz)`,
                });
            }
            else if (data.frequency > exports.THRESHOLDS.frequency.max) {
                anomalies.push({
                    type: 'frequency',
                    severity: 'critical',
                    value: data.frequency,
                    threshold: exports.THRESHOLDS.frequency.max,
                    message: `Over-frequency detected: ${data.frequency.toFixed(2)} Hz (max: ${exports.THRESHOLDS.frequency.max} Hz)`,
                });
            }
        }
        // Power Factor check
        if (data.power_factor) {
            if (data.power_factor < exports.THRESHOLDS.powerFactor.critical) {
                anomalies.push({
                    type: 'power_factor',
                    severity: 'critical',
                    value: data.power_factor,
                    threshold: exports.THRESHOLDS.powerFactor.critical,
                    message: `Critical low power factor: ${data.power_factor.toFixed(3)} (min: ${exports.THRESHOLDS.powerFactor.critical})`,
                });
            }
            else if (data.power_factor < exports.THRESHOLDS.powerFactor.min) {
                anomalies.push({
                    type: 'power_factor',
                    severity: 'warning',
                    value: data.power_factor,
                    threshold: exports.THRESHOLDS.powerFactor.min,
                    message: `Low power factor: ${data.power_factor.toFixed(3)} (min: ${exports.THRESHOLDS.powerFactor.min})`,
                });
            }
        }
        // THD Current check
        if (data.thd_current) {
            if (data.thd_current > exports.THRESHOLDS.thd.critical) {
                anomalies.push({
                    type: 'thd',
                    severity: 'critical',
                    value: data.thd_current,
                    threshold: exports.THRESHOLDS.thd.critical,
                    message: `Critical THD current: ${data.thd_current.toFixed(1)}% (max: ${exports.THRESHOLDS.thd.critical}%)`,
                });
            }
            else if (data.thd_current > exports.THRESHOLDS.thd.warning) {
                anomalies.push({
                    type: 'thd',
                    severity: 'warning',
                    value: data.thd_current,
                    threshold: exports.THRESHOLDS.thd.warning,
                    message: `High THD current: ${data.thd_current.toFixed(1)}% (max: ${exports.THRESHOLDS.thd.warning}%)`,
                });
            }
        }
        // Voltage SAG/SWELL checks for each phase
        const phases = [
            { name: 'R', voltage: data.voltage_ln_r },
            { name: 'S', voltage: data.voltage_ln_s },
            { name: 'T', voltage: data.voltage_ln_t },
        ];
        for (const phase of phases) {
            if (phase.voltage) {
                const ratio = phase.voltage / exports.THRESHOLDS.voltage.nominal;
                if (ratio < exports.THRESHOLDS.voltage.sagThreshold) {
                    anomalies.push({
                        type: 'voltage_sag',
                        severity: 'warning',
                        phase: phase.name,
                        value: phase.voltage,
                        threshold: exports.THRESHOLDS.voltage.nominal * exports.THRESHOLDS.voltage.sagThreshold,
                        message: `Voltage sag on Phase ${phase.name}: ${phase.voltage.toFixed(1)}V (${(ratio * 100).toFixed(1)}%)`,
                    });
                }
                else if (ratio > exports.THRESHOLDS.voltage.swellThreshold) {
                    anomalies.push({
                        type: 'voltage_swell',
                        severity: 'warning',
                        phase: phase.name,
                        value: phase.voltage,
                        threshold: exports.THRESHOLDS.voltage.nominal * exports.THRESHOLDS.voltage.swellThreshold,
                        message: `Voltage swell on Phase ${phase.name}: ${phase.voltage.toFixed(1)}V (${(ratio * 100).toFixed(1)}%)`,
                    });
                }
            }
        }
        // Temperature check
        if (data.temperature) {
            if (data.temperature > exports.THRESHOLDS.temperature.critical) {
                anomalies.push({
                    type: 'temperature',
                    severity: 'critical',
                    value: data.temperature,
                    threshold: exports.THRESHOLDS.temperature.critical,
                    message: `Critical temperature: ${data.temperature.toFixed(1)}°C (max: ${exports.THRESHOLDS.temperature.critical}°C)`,
                });
            }
            else if (data.temperature > exports.THRESHOLDS.temperature.warning) {
                anomalies.push({
                    type: 'temperature',
                    severity: 'warning',
                    value: data.temperature,
                    threshold: exports.THRESHOLDS.temperature.warning,
                    message: `High temperature: ${data.temperature.toFixed(1)}°C (max: ${exports.THRESHOLDS.temperature.warning}°C)`,
                });
            }
        }
        return anomalies;
    }
    /**
     * Create an alert in the database and broadcast via Socket.io
     */
    async createAlert(panelCode, anomaly) {
        try {
            // Get panel ID from code (with caching)
            let panelId = this.panelCache.get(panelCode);
            if (!panelId) {
                const panel = await database_1.db.query.panels.findFirst({
                    where: (0, drizzle_orm_1.eq)(schema_1.panels.code, panelCode),
                });
                if (panel) {
                    panelId = panel.id;
                    this.panelCache.set(panelCode, panel.id);
                }
            }
            // Create alert in database
            const [newAlert] = await database_1.db.insert(schema_1.alerts).values({
                panelId: panelId || null,
                severity: anomaly.severity,
                title: `${anomaly.type.replace('_', ' ').toUpperCase()} Alert`,
                message: anomaly.message,
                status: 'active',
            }).returning();
            // Broadcast alert via Socket.io
            const alertPayload = {
                id: newAlert.id,
                panelCode,
                severity: anomaly.severity,
                title: `${anomaly.type.replace('_', ' ').toUpperCase()} Alert`,
                message: anomaly.message,
                timestamp: new Date(),
            };
            socketService_1.socketService.broadcastAlert(alertPayload);
            console.log(`🚨 Alert created: ${anomaly.message}`);
        }
        catch (error) {
            console.error('❌ Error creating alert:', error);
        }
    }
}
exports.DataProcessor = DataProcessor;
exports.dataProcessor = new DataProcessor();
//# sourceMappingURL=dataProcessor.js.map