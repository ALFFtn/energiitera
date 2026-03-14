"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
exports.createWorker = createWorker;
const mqttService_1 = require("./mqttService");
const socketService_1 = require("./socketService");
const dataProcessor_1 = require("./dataProcessor");
const batchWriter_1 = require("./batchWriter");
const sensorReadingService_1 = require("../services/sensorReadingService");
class Worker {
    config;
    mqttService;
    batchWriter;
    isRunning = false;
    metricsCount = 0;
    flushInterval = null;
    sensorBuffer = new Map();
    constructor(config) {
        this.config = config;
        this.mqttService = new mqttService_1.MqttService({
            brokerUrl: config.mqtt.brokerUrl,
            username: config.mqtt.username,
            password: config.mqtt.password,
            topicPrefix: config.mqtt.topicPrefix,
        });
        this.batchWriter = new batchWriter_1.BatchWriter({
            batchSize: config.batch.size,
            flushIntervalMs: config.batch.flushIntervalMs,
        });
    }
    /**
     * Initialize Socket.io with the HTTP server
     */
    initializeSocket(httpServer) {
        socketService_1.socketService.initialize(httpServer, this.config.corsOrigin);
    }
    /**
     * Start the worker (MQTT subscription)
     */
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Worker is already running');
            return;
        }
        console.log('🚀 Starting MQTT Worker...');
        // Setup MQTT event handlers
        this.mqttService.on('metrics', async ({ panelCode, data, timestamp }) => {
            this.metricsCount++;
            // Process the metrics (detect anomalies)
            const processed = await dataProcessor_1.dataProcessor.processMetrics({
                ...data,
                panel_code: panelCode,
            });
            if (processed) {
                // Add to batch writer
                this.batchWriter.add(processed);
                // Broadcast to Socket.io clients
                socketService_1.socketService.broadcastPanelMetrics(panelCode, {
                    panelCode,
                    timestamp,
                    voltageLnR: processed.voltageLnR,
                    voltageLnS: processed.voltageLnS,
                    voltageLnT: processed.voltageLnT,
                    currentR: processed.currentR,
                    currentS: processed.currentS,
                    currentT: processed.currentT,
                    frequency: processed.frequency,
                    powerFactor: processed.powerFactor,
                    thdCurrent: processed.thdCurrent,
                    thdVoltage: processed.thdVoltage,
                    powerKw: processed.powerKw,
                    energyKwh: processed.energyKwh,
                    temperature: processed.temperature,
                });
            }
        });
        this.mqttService.on('event', ({ panelCode, data }) => {
            console.log(`📢 Panel event from ${panelCode}:`, data);
            // Handle panel events (e.g., status changes, maintenance mode)
        });
        // Handle individual parameter updates from buildings
        this.mqttService.on('parameter', ({ zoneCode, buildingCode, sensorId, parameter, value, unit }) => {
            this.metricsCount++;
            // Broadcast to Socket.io clients
            socketService_1.socketService.broadcastBuildingSensor(zoneCode, buildingCode, sensorId, parameter, value, unit);
            // Buffer data for database storage
            const key = `${buildingCode}-${sensorId}`;
            const existing = this.sensorBuffer.get(key) || {};
            existing[parameter] = value;
            this.sensorBuffer.set(key, existing);
        });
        this.mqttService.on('error', (error) => {
            console.error('❌ MQTT Worker error:', error);
        });
        // Start batch writer
        this.batchWriter.start();
        // Start sensor data flush interval (every 10 seconds)
        this.flushInterval = setInterval(async () => {
            // Save buffered sensor data to database
            for (const [key, data] of this.sensorBuffer.entries()) {
                // Key format: buildingCode-sensorId (sensorId may contain dashes)
                const dashIdx = key.indexOf('-');
                const buildingCode = key.substring(0, dashIdx);
                const sensorId = key.substring(dashIdx + 1);
                await (0, sensorReadingService_1.saveSensorReading)(buildingCode, sensorId, data);
            }
            this.sensorBuffer.clear();
            // Flush to database
            await (0, sensorReadingService_1.flushSensorReadings)();
        }, 10000);
        // Connect to MQTT broker
        try {
            await this.mqttService.connect();
            this.isRunning = true;
            console.log('✅ MQTT Worker started successfully');
        }
        catch (error) {
            console.error('❌ Failed to start MQTT Worker:', error);
            throw error;
        }
    }
    /**
     * Stop the worker
     */
    stop() {
        console.log('🛑 Stopping MQTT Worker...');
        this.mqttService.disconnect();
        this.batchWriter.stop();
        this.isRunning = false;
        console.log('✅ MQTT Worker stopped');
    }
    /**
     * Get worker status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            mqttConnected: this.mqttService.getConnectionStatus(),
            metricsProcessed: this.metricsCount,
            bufferSize: this.batchWriter.getBufferSize(),
            totalWritten: this.batchWriter.getTotalWritten(),
            connectedClients: socketService_1.socketService.getConnectedClientsCount(),
        };
    }
}
exports.Worker = Worker;
// Factory function to create worker with environment config
function createWorker() {
    return new Worker({
        mqtt: {
            brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
            username: process.env.MQTT_USERNAME || undefined,
            password: process.env.MQTT_PASSWORD || undefined,
            topicPrefix: process.env.MQTT_TOPIC_PREFIX || 'energy/panels',
        },
        batch: {
            size: parseInt(process.env.BATCH_SIZE || '100', 10),
            flushIntervalMs: parseInt(process.env.BATCH_WRITE_INTERVAL_MS || '5000', 10),
        },
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    });
}
//# sourceMappingURL=index.js.map