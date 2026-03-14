import { type NewPanelReading, type NewGridMetric } from '../db/schema/index.js';
export declare class ReadingService {
    submitReading(data: NewPanelReading): Promise<{
        id: string;
        panelId: string;
        timestamp: Date;
        voltageLn: string | null;
        voltageLnMin: string | null;
        voltageLnMax: string | null;
        currentTotal: string | null;
        currentPhaseA: string | null;
        currentPhaseB: string | null;
        currentPhaseC: string | null;
        powerFactor: string | null;
        frequency: string | null;
        powerKw: string | null;
        energyKwh: string | null;
        signalQuality: number | null;
        thdPercentage: string | null;
    }>;
    submitBulkReadings(readings: NewPanelReading[]): Promise<{
        id: string;
        panelId: string;
        timestamp: Date;
        voltageLn: string | null;
        voltageLnMin: string | null;
        voltageLnMax: string | null;
        currentTotal: string | null;
        currentPhaseA: string | null;
        currentPhaseB: string | null;
        currentPhaseC: string | null;
        powerFactor: string | null;
        frequency: string | null;
        powerKw: string | null;
        energyKwh: string | null;
        signalQuality: number | null;
        thdPercentage: string | null;
    }[]>;
    getLatestGridMetrics(campusId: string): Promise<{
        id: string;
        campusId: string;
        timestamp: Date;
        powerFactor: string | null;
        totalLoadMw: string | null;
        frequencyHz: string | null;
        activeAlarms: number;
        carbonFootprintTons: string | null;
        estimatedCostPerHour: string | null;
    } | {
        totalLoadMw: string;
        frequencyHz: string;
        powerFactor: string;
        activeAlarms: number;
        carbonFootprintTons: string;
        estimatedCostPerHour: string;
    }>;
    submitGridMetric(data: NewGridMetric): Promise<{
        id: string;
        campusId: string;
        timestamp: Date;
        powerFactor: string | null;
        totalLoadMw: string | null;
        frequencyHz: string | null;
        activeAlarms: number;
        carbonFootprintTons: string | null;
        estimatedCostPerHour: string | null;
    }>;
    getPowerDistribution(campusId: string): Promise<{
        hour: number;
        powerKw: number;
    }[]>;
    getLiveFeedData(campusId: string): Promise<{
        gridLoad: {
            value: number;
            unit: string;
            change: number;
        };
        frequency: {
            value: number;
            unit: string;
            change: number;
        };
        powerFactor: {
            value: number;
            change: number;
        };
        activeAlarms: number;
    }>;
}
export declare const readingService: ReadingService;
//# sourceMappingURL=readingService.d.ts.map