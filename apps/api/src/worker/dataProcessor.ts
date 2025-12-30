import { z } from 'zod';
import { socketService, type AlertPayload } from './socketService';
import { db } from '../config/database';
import { alerts, panels } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Threshold configuration
export const THRESHOLDS = {
    frequency: {
        min: 49.5,    // Hz - Under frequency
        max: 50.5,    // Hz - Over frequency
        nominal: 50,
    },
    powerFactor: {
        min: 0.85,    // PF below this triggers warning
        critical: 0.7, // PF below this triggers critical
    },
    thd: {
        warning: 15,  // THD > 15% triggers warning
        critical: 25, // THD > 25% triggers critical
    },
    voltage: {
        sagThreshold: 0.9,   // 90% of nominal = SAG
        swellThreshold: 1.1, // 110% of nominal = SWELL
        nominal: 230,        // Nominal voltage L-N
    },
    current: {
        overload: 0.95,    // 95% of rated = overload warning
        critical: 1.0,     // 100% of rated = critical
    },
    temperature: {
        warning: 60,  // °C
        critical: 75, // °C
    },
};

// Schema for incoming MQTT metrics
export const metricsSchema = z.object({
    panel_code: z.string(),
    timestamp: z.string().optional(),
    voltage_ln_r: z.number().optional(),
    voltage_ln_s: z.number().optional(),
    voltage_ln_t: z.number().optional(),
    current_r: z.number().optional(),
    current_s: z.number().optional(),
    current_t: z.number().optional(),
    frequency: z.number().optional(),
    power_factor: z.number().optional(),
    thd_current: z.number().optional(),
    thd_voltage: z.number().optional(),
    power_kw: z.number().optional(),
    energy_kwh: z.number().optional(),
    temperature: z.number().optional(),
});

export type MetricsData = z.infer<typeof metricsSchema>;

export interface ProcessedMetrics {
    panelCode: string;
    timestamp: Date;
    voltageLnR: number;
    voltageLnS: number;
    voltageLnT: number;
    currentR: number;
    currentS: number;
    currentT: number;
    frequency: number;
    powerFactor: number;
    thdCurrent: number;
    thdVoltage: number;
    powerKw: number;
    energyKwh: number;
    temperature?: number;
    anomalies: AnomalyDetection[];
}

export interface AnomalyDetection {
    type: 'frequency' | 'power_factor' | 'thd' | 'voltage_sag' | 'voltage_swell' | 'overload' | 'temperature';
    severity: 'warning' | 'critical';
    phase?: string;
    value: number;
    threshold: number;
    message: string;
}

export class DataProcessor {
    private panelCache: Map<string, string> = new Map(); // panelCode -> panelId

    /**
     * Process incoming MQTT metrics data
     */
    async processMetrics(rawData: unknown): Promise<ProcessedMetrics | null> {
        try {
            const parsed = metricsSchema.parse(rawData);

            const anomalies = this.detectAnomalies(parsed);

            const processed: ProcessedMetrics = {
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
        } catch (error) {
            console.error('❌ Error processing metrics:', error);
            return null;
        }
    }

    /**
     * Detect anomalies in the metrics data
     */
    private detectAnomalies(data: MetricsData): AnomalyDetection[] {
        const anomalies: AnomalyDetection[] = [];

        // Frequency check
        if (data.frequency) {
            if (data.frequency < THRESHOLDS.frequency.min) {
                anomalies.push({
                    type: 'frequency',
                    severity: 'critical',
                    value: data.frequency,
                    threshold: THRESHOLDS.frequency.min,
                    message: `Under-frequency detected: ${data.frequency.toFixed(2)} Hz (min: ${THRESHOLDS.frequency.min} Hz)`,
                });
            } else if (data.frequency > THRESHOLDS.frequency.max) {
                anomalies.push({
                    type: 'frequency',
                    severity: 'critical',
                    value: data.frequency,
                    threshold: THRESHOLDS.frequency.max,
                    message: `Over-frequency detected: ${data.frequency.toFixed(2)} Hz (max: ${THRESHOLDS.frequency.max} Hz)`,
                });
            }
        }

        // Power Factor check
        if (data.power_factor) {
            if (data.power_factor < THRESHOLDS.powerFactor.critical) {
                anomalies.push({
                    type: 'power_factor',
                    severity: 'critical',
                    value: data.power_factor,
                    threshold: THRESHOLDS.powerFactor.critical,
                    message: `Critical low power factor: ${data.power_factor.toFixed(3)} (min: ${THRESHOLDS.powerFactor.critical})`,
                });
            } else if (data.power_factor < THRESHOLDS.powerFactor.min) {
                anomalies.push({
                    type: 'power_factor',
                    severity: 'warning',
                    value: data.power_factor,
                    threshold: THRESHOLDS.powerFactor.min,
                    message: `Low power factor: ${data.power_factor.toFixed(3)} (min: ${THRESHOLDS.powerFactor.min})`,
                });
            }
        }

        // THD Current check
        if (data.thd_current) {
            if (data.thd_current > THRESHOLDS.thd.critical) {
                anomalies.push({
                    type: 'thd',
                    severity: 'critical',
                    value: data.thd_current,
                    threshold: THRESHOLDS.thd.critical,
                    message: `Critical THD current: ${data.thd_current.toFixed(1)}% (max: ${THRESHOLDS.thd.critical}%)`,
                });
            } else if (data.thd_current > THRESHOLDS.thd.warning) {
                anomalies.push({
                    type: 'thd',
                    severity: 'warning',
                    value: data.thd_current,
                    threshold: THRESHOLDS.thd.warning,
                    message: `High THD current: ${data.thd_current.toFixed(1)}% (max: ${THRESHOLDS.thd.warning}%)`,
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
                const ratio = phase.voltage / THRESHOLDS.voltage.nominal;

                if (ratio < THRESHOLDS.voltage.sagThreshold) {
                    anomalies.push({
                        type: 'voltage_sag',
                        severity: 'warning',
                        phase: phase.name,
                        value: phase.voltage,
                        threshold: THRESHOLDS.voltage.nominal * THRESHOLDS.voltage.sagThreshold,
                        message: `Voltage sag on Phase ${phase.name}: ${phase.voltage.toFixed(1)}V (${(ratio * 100).toFixed(1)}%)`,
                    });
                } else if (ratio > THRESHOLDS.voltage.swellThreshold) {
                    anomalies.push({
                        type: 'voltage_swell',
                        severity: 'warning',
                        phase: phase.name,
                        value: phase.voltage,
                        threshold: THRESHOLDS.voltage.nominal * THRESHOLDS.voltage.swellThreshold,
                        message: `Voltage swell on Phase ${phase.name}: ${phase.voltage.toFixed(1)}V (${(ratio * 100).toFixed(1)}%)`,
                    });
                }
            }
        }

        // Temperature check
        if (data.temperature) {
            if (data.temperature > THRESHOLDS.temperature.critical) {
                anomalies.push({
                    type: 'temperature',
                    severity: 'critical',
                    value: data.temperature,
                    threshold: THRESHOLDS.temperature.critical,
                    message: `Critical temperature: ${data.temperature.toFixed(1)}°C (max: ${THRESHOLDS.temperature.critical}°C)`,
                });
            } else if (data.temperature > THRESHOLDS.temperature.warning) {
                anomalies.push({
                    type: 'temperature',
                    severity: 'warning',
                    value: data.temperature,
                    threshold: THRESHOLDS.temperature.warning,
                    message: `High temperature: ${data.temperature.toFixed(1)}°C (max: ${THRESHOLDS.temperature.warning}°C)`,
                });
            }
        }

        return anomalies;
    }

    /**
     * Create an alert in the database and broadcast via Socket.io
     */
    private async createAlert(panelCode: string, anomaly: AnomalyDetection): Promise<void> {
        try {
            // Get panel ID from code (with caching)
            let panelId = this.panelCache.get(panelCode);
            if (!panelId) {
                const panel = await db.query.panels.findFirst({
                    where: eq(panels.code, panelCode),
                });
                if (panel) {
                    panelId = panel.id;
                    this.panelCache.set(panelCode, panel.id);
                }
            }

            // Create alert in database
            const [newAlert] = await db.insert(alerts).values({
                panelId: panelId || null,
                severity: anomaly.severity,
                title: `${anomaly.type.replace('_', ' ').toUpperCase()} Alert`,
                message: anomaly.message,
                status: 'active',
            }).returning();

            // Broadcast alert via Socket.io
            const alertPayload: AlertPayload = {
                id: newAlert.id,
                panelCode,
                severity: anomaly.severity,
                title: `${anomaly.type.replace('_', ' ').toUpperCase()} Alert`,
                message: anomaly.message,
                timestamp: new Date(),
            };

            socketService.broadcastAlert(alertPayload);

            console.log(`🚨 Alert created: ${anomaly.message}`);
        } catch (error) {
            console.error('❌ Error creating alert:', error);
        }
    }
}

export const dataProcessor = new DataProcessor();
