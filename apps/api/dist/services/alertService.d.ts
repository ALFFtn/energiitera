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
        building: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            zoneId: string;
            gridConnection: string;
            lastSyncAt: Date | null;
            mapCoordinates: unknown;
        } | null;
        panel: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            location: string | null;
            buildingId: string;
            maintenanceMode: boolean;
            uptimeSeconds: number;
            startedAt: Date | null;
        } | null;
        acknowledgedByUser: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            role: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        building: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            zoneId: string;
            gridConnection: string;
            lastSyncAt: Date | null;
            mapCoordinates: unknown;
        } | null;
        panel: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            location: string | null;
            buildingId: string;
            maintenanceMode: boolean;
            uptimeSeconds: number;
            startedAt: Date | null;
        } | null;
        acknowledgedByUser: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            role: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        building: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            zoneId: string;
            gridConnection: string;
            lastSyncAt: Date | null;
            mapCoordinates: unknown;
        } | null;
        panel: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            location: string | null;
            buildingId: string;
            maintenanceMode: boolean;
            uptimeSeconds: number;
            startedAt: Date | null;
        } | null;
        acknowledgedByUser: {
            id: string;
            name: string;
            email: string;
            passwordHash: string;
            role: string;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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