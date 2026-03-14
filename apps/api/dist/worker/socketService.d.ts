import { Server as HttpServer } from 'http';
export interface PanelMetricsPayload {
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
}
export interface AlertPayload {
    id: string;
    panelCode: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
}
export declare class SocketService {
    private io;
    private connectedClients;
    initialize(httpServer: HttpServer, corsOrigin: string): void;
    /**
     * Broadcast building sensor parameter update
     */
    broadcastBuildingSensor(zoneCode: string, buildingCode: string, sensorId: string, parameter: string, value: number, unit: string): void;
    /**
     * Broadcast panel metrics to subscribers
     */
    broadcastPanelMetrics(panelCode: string, data: PanelMetricsPayload): void;
    /**
     * Broadcast live ticker data to all grid subscribers
     */
    broadcastGridMetrics(data: {
        totalLoadMw: number;
        frequencyHz: number;
        powerFactor: number;
        activeAlarms: number;
    }): void;
    /**
     * Broadcast alert to all alert subscribers
     */
    broadcastAlert(alert: AlertPayload): void;
    /**
     * Broadcast alert acknowledgement
     */
    broadcastAlertAck(alertId: string): void;
    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number;
    /**
     * Get room subscribers count
     */
    getRoomSubscribersCount(room: string): number;
}
export declare const socketService: SocketService;
//# sourceMappingURL=socketService.d.ts.map