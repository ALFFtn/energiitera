import { type NewAlert } from '../db/schema/index.js';
export declare class AlertService {
    getAlerts(options?: {
        status?: string;
        severity?: string;
        limit?: number;
    }): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }[]>;
    getActiveAlerts(): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }[]>;
    getAlertCounts(): Promise<Record<string, number>>;
    getAlertById(id: string): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }>;
    createAlert(data: NewAlert): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }>;
    acknowledgeAlert(id: string, userId: string): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }>;
    resolveAlert(id: string): Promise<{
        message: string | null;
        status: string;
        id: string;
        buildingId: string | null;
        panelId: string | null;
        severity: string;
        title: string;
        triggeredAt: Date;
        resolvedAt: Date | null;
        acknowledgedBy: string | null;
        acknowledgedAt: Date | null;
    }>;
}
export declare const alertService: AlertService;
//# sourceMappingURL=alertService.d.ts.map