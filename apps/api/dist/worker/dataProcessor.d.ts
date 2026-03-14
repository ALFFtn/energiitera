import { z } from 'zod';
export declare const THRESHOLDS: {
    frequency: {
        min: number;
        max: number;
        nominal: number;
    };
    powerFactor: {
        min: number;
        critical: number;
    };
    thd: {
        warning: number;
        critical: number;
    };
    voltage: {
        sagThreshold: number;
        swellThreshold: number;
        nominal: number;
    };
    current: {
        overload: number;
        critical: number;
    };
    temperature: {
        warning: number;
        critical: number;
    };
};
export declare const metricsSchema: z.ZodObject<{
    panel_code: z.ZodString;
    timestamp: z.ZodOptional<z.ZodString>;
    voltage_ln_r: z.ZodOptional<z.ZodNumber>;
    voltage_ln_s: z.ZodOptional<z.ZodNumber>;
    voltage_ln_t: z.ZodOptional<z.ZodNumber>;
    current_r: z.ZodOptional<z.ZodNumber>;
    current_s: z.ZodOptional<z.ZodNumber>;
    current_t: z.ZodOptional<z.ZodNumber>;
    frequency: z.ZodOptional<z.ZodNumber>;
    power_factor: z.ZodOptional<z.ZodNumber>;
    thd_current: z.ZodOptional<z.ZodNumber>;
    thd_voltage: z.ZodOptional<z.ZodNumber>;
    power_kw: z.ZodOptional<z.ZodNumber>;
    energy_kwh: z.ZodOptional<z.ZodNumber>;
    temperature: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    panel_code: string;
    current_r?: number | undefined;
    current_s?: number | undefined;
    current_t?: number | undefined;
    timestamp?: string | undefined;
    power_factor?: number | undefined;
    frequency?: number | undefined;
    power_kw?: number | undefined;
    energy_kwh?: number | undefined;
    temperature?: number | undefined;
    thd_voltage?: number | undefined;
    thd_current?: number | undefined;
    voltage_ln_r?: number | undefined;
    voltage_ln_s?: number | undefined;
    voltage_ln_t?: number | undefined;
}, {
    panel_code: string;
    current_r?: number | undefined;
    current_s?: number | undefined;
    current_t?: number | undefined;
    timestamp?: string | undefined;
    power_factor?: number | undefined;
    frequency?: number | undefined;
    power_kw?: number | undefined;
    energy_kwh?: number | undefined;
    temperature?: number | undefined;
    thd_voltage?: number | undefined;
    thd_current?: number | undefined;
    voltage_ln_r?: number | undefined;
    voltage_ln_s?: number | undefined;
    voltage_ln_t?: number | undefined;
}>;
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
export declare class DataProcessor {
    private panelCache;
    /**
     * Process incoming MQTT metrics data
     */
    processMetrics(rawData: unknown): Promise<ProcessedMetrics | null>;
    /**
     * Detect anomalies in the metrics data
     */
    private detectAnomalies;
    /**
     * Create an alert in the database and broadcast via Socket.io
     */
    private createAlert;
}
export declare const dataProcessor: DataProcessor;
//# sourceMappingURL=dataProcessor.d.ts.map