"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
class SocketService {
    io = null;
    connectedClients = new Map();
    initialize(httpServer, corsOrigin) {
        this.io = new socket_io_1.Server(httpServer, {
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
            socket.on('subscribe:panel', (panelCode) => {
                const room = `panel:${panelCode}`;
                socket.join(room);
                console.log(`👁️ Client ${socket.id} subscribed to ${room}`);
            });
            socket.on('unsubscribe:panel', (panelCode) => {
                const room = `panel:${panelCode}`;
                socket.leave(room);
                console.log(`👁️ Client ${socket.id} unsubscribed from ${room}`);
            });
            // Building sensor subscriptions
            socket.on('subscribe', ({ channel }) => {
                socket.join(channel);
                console.log(`👁️ Client ${socket.id} subscribed to ${channel}`);
            });
            socket.on('unsubscribe', ({ channel }) => {
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
    broadcastBuildingSensor(zoneCode, buildingCode, sensorId, parameter, value, unit) {
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
    broadcastPanelMetrics(panelCode, data) {
        if (!this.io)
            return;
        const room = `panel:${panelCode}`;
        this.io.to(room).emit('panel:metrics', data);
    }
    /**
     * Broadcast live ticker data to all grid subscribers
     */
    broadcastGridMetrics(data) {
        if (!this.io)
            return;
        this.io.to('grid').emit('grid:metrics', data);
    }
    /**
     * Broadcast alert to all alert subscribers
     */
    broadcastAlert(alert) {
        if (!this.io)
            return;
        this.io.to('alerts').emit('alert:new', alert);
        // Also send to specific panel room
        const room = `panel:${alert.panelCode}`;
        this.io.to(room).emit('panel:alert', alert);
    }
    /**
     * Broadcast alert acknowledgement
     */
    broadcastAlertAck(alertId) {
        if (!this.io)
            return;
        this.io.to('alerts').emit('alert:acknowledged', { id: alertId });
    }
    /**
     * Get connected clients count
     */
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
    /**
     * Get room subscribers count
     */
    getRoomSubscribersCount(room) {
        if (!this.io)
            return 0;
        const roomSockets = this.io.sockets.adapter.rooms.get(room);
        return roomSockets?.size || 0;
    }
}
exports.SocketService = SocketService;
exports.socketService = new SocketService();
//# sourceMappingURL=socketService.js.map