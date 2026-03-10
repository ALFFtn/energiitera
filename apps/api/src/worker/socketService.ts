import { Server as SocketServer, Socket } from 'socket.io';
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

export class SocketService {
    private io: SocketServer | null = null;
    private connectedClients: Map<string, Socket> = new Map();

    initialize(httpServer: HttpServer, corsOrigin: string): void {
        this.io = new SocketServer(httpServer, {
            cors: {
                origin: corsOrigin,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        });

        this.io.on('connection', (socket) => {
            console.log(`📱 Client connected: ${socket.id}`);
            this.connectedClients.set(socket.id, socket);

            // Handle room subscriptions
            socket.on('subscribe:panel', (panelCode: string) => {
                const room = `panel:${panelCode}`;
                socket.join(room);
                console.log(`👁️ Client ${socket.id} subscribed to ${room}`);
            });

            socket.on('unsubscribe:panel', (panelCode: string) => {
                const room = `panel:${panelCode}`;
                socket.leave(room);
                console.log(`👁️ Client ${socket.id} unsubscribed from ${room}`);
            });

            // Building sensor subscriptions
            socket.on('subscribe', ({ channel }: { channel: string }) => {
                socket.join(channel);
                console.log(`👁️ Client ${socket.id} subscribed to ${channel}`);
            });

            socket.on('unsubscribe', ({ channel }: { channel: string }) => {
                socket.leave(channel);
                console.log(`👁️ Client ${socket.id} unsubscribed from ${channel}`);
            });

            socket.on('subscribe:alerts', () => {
                socket.join('alerts');
                console.log(`🔔 Client ${socket.id} subscribed to alerts`);
            });

            socket.on('subscribe:grid', () => {
                socket.join('grid');
                console.log(`⚡ Client ${socket.id} subscribed to grid metrics`);
            });

            socket.on('disconnect', (reason) => {
                console.log(`📴 Client disconnected: ${socket.id} (${reason})`);
                this.connectedClients.delete(socket.id);
            });
        });

        console.log('🔌 Socket.io initialized');
    }

    /**
     * Broadcast building sensor parameter update
     */
    broadcastBuildingSensor(zoneCode: string, buildingCode: string, sensorId: string, parameter: string, value: number, unit: string): void {
        if (!this.io) {
            console.warn('⚠️ Socket.io not initialized, cannot broadcast');
            return;
        }

        // Normalize case: broadcast to both lowercase and uppercase channel variants
        // so clients subscribing with either case receive data
        const channelLower = `building:${zoneCode.toLowerCase()}:${buildingCode.toLowerCase()}`;
        const channelUpper = `building:${zoneCode.toUpperCase()}:${buildingCode.toUpperCase()}`;
        const payload = {
            zoneCode,
            buildingCode,
            sensorId,
            parameter,
            value,
            unit,
            timestamp: new Date(),
        };

        // Log broadcast (only for power to reduce noise)
        if (parameter === 'power') {
            console.log(`📡 Broadcasting to ${this.getConnectedClientsCount()} clients:`, `${parameter}=${value}`);
        }

        this.io.to(channelLower).emit('sensor:parameter', payload);
        if (channelLower !== channelUpper) {
            this.io.to(channelUpper).emit('sensor:parameter', payload);
        }
        // Also broadcast to all connected clients
        this.io.emit('sensor:parameter', payload);
    }

    /**
     * Broadcast panel metrics to subscribers
     */
    broadcastPanelMetrics(panelCode: string, data: PanelMetricsPayload): void {
        if (!this.io) return;

        const room = `panel:${panelCode}`;
        this.io.to(room).emit('panel:metrics', data);
    }

    /**
     * Broadcast live ticker data to all grid subscribers
     */
    broadcastGridMetrics(data: {
        totalLoadMw: number;
        frequencyHz: number;
        powerFactor: number;
        activeAlarms: number;
    }): void {
        if (!this.io) return;
        this.io.to('grid').emit('grid:metrics', data);
    }

    /**
     * Broadcast alert to all alert subscribers
     */
    broadcastAlert(alert: AlertPayload): void {
        if (!this.io) return;
        this.io.to('alerts').emit('alert:new', alert);

        // Also send to specific panel room
        const room = `panel:${alert.panelCode}`;
        this.io.to(room).emit('panel:alert', alert);
    }

    /**
     * Broadcast alert acknowledgement
     */
    broadcastAlertAck(alertId: string): void {
        if (!this.io) return;
        this.io.to('alerts').emit('alert:acknowledged', { id: alertId });
    }

    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number {
        return this.connectedClients.size;
    }

    /**
     * Get room subscribers count
     */
    getRoomSubscribersCount(room: string): number {
        if (!this.io) return 0;
        const roomSockets = this.io.sockets.adapter.rooms.get(room);
        return roomSockets?.size || 0;
    }
}

export const socketService = new SocketService();
