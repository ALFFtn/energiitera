export declare class AnalyticsService {
    getConsumption(options: {
        from?: Date;
        to?: Date;
        buildingId?: string;
        departmentId?: string;
    }): Promise<{
        id: string;
        buildingId: string | null;
        timestamp: Date;
        departmentId: string;
        consumptionKwh: string;
        costUsd: string | null;
    }[]>;
    getKPIs(campusId: string, dateRange?: {
        from: Date;
        to: Date;
    }): Promise<{
        totalConsumption: {
            value: number;
            unit: string;
            change: number;
            changeType: "negative";
        };
        peakDemand: {
            value: number;
            unit: string;
            recordedAt: string;
        };
        estimatedBill: {
            value: number;
            unit: string;
            change: number;
            changeType: "positive";
        };
        carbonFootprint: {
            value: number;
            unit: string;
            change: number;
            changeType: "positive";
        };
    }>;
    getDepartmentBreakdown(campusId: string): Promise<{
        percentage: number;
        name: string;
        color: string | null;
        consumption: number;
    }[]>;
    getHourlyTrend(campusId: string, date?: Date): Promise<{
        hour: number;
        current: number;
        previous: number;
    }[]>;
    getPowerFactorTrend(buildingId?: string, daysBack?: number): Promise<{
        date: string;
        value: number;
    }[]>;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=analyticsService.d.ts.map