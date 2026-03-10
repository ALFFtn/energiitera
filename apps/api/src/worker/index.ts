import { Server as HttpServer } from 'http';
import { MqttService } from './mqttService';
import { socketService } from './socketService';
import { dataProcessor } from './dataProcessor';
import { BatchWriter } from './batchWriter';
import { saveSensorReading, flushSensorReadings } from '../services/sensorReadingService';

export interface WorkerConfig {
    mqtt: {
        brokerUrl: string;
        username?: string;
        password?: string;
        topicPrefix: string;
    };
    batch: {
        size: number;
        flushIntervalMs: number;
    };
    corsOrigin: string;
}

export class Worker {
    private mqttService: MqttService;
    private batchWriter: BatchWriter;
    private isRunning = false;
    private metricsCount = 0;
    private flushInterval: NodeJS.Timeout | null = null;
    private sensorBuffer: Map<string, Record<string, number>> = new Map();

    constructor(private config: WorkerConfig) {
        this.mqttService = new MqttService({
            brokerUrl: config.mqtt.brokerUrl,
            username: config.mqtt.username,
            password: config.mqtt.password,
            topicPrefix: config.mqtt.topicPrefix,
        });

        this.batchWriter = new BatchWriter({
            batchSize: config.batch.size,
            flushIntervalMs: config.batch.flushIntervalMs,
        });
    }

    /**
     * Initialize Socket.io with the HTTP server
     */
    initializeSocket(httpServer: HttpServer): void {
        socketService.initialize(httpServer, this.config.corsOrigin);
    }

    /**
     * Start the worker (MQTT subscription)
     */
    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️ Worker is already running');
            return;
        }

        console.log('🚀 Starting MQTT Worker...');

        // Setup MQTT event handlers
        this.mqttService.on('metrics', async ({ panelCode, data, timestamp }) => {
            this.metricsCount++;

            // Process the metrics (detect anomalies)
            const processed = await dataProcessor.processMetrics({
                ...data,
                panel_code: panelCode,
            });

            if (processed) {
                // Add to batch writer
                this.batchWriter.add(processed);

                // Broadcast to Socket.io clients
                socketService.broadcastPanelMetrics(panelCode, {
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
            socketService.broadcastBuildingSensor(zoneCode, buildingCode, sensorId, parameter, value, unit);

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
                await saveSensorReading(buildingCode, sensorId, data);
            }
            this.sensorBuffer.clear();

            // Flush to database
            await flushSensorReadings();
        }, 10000);

        // Connect to MQTT broker
        try {
            await this.mqttService.connect();
            this.isRunning = true;
            console.log('✅ MQTT Worker started successfully');
        } catch (error) {
            console.error('❌ Failed to start MQTT Worker:', error);
            throw error;
        }
    }

    /**
     * Stop the worker
     */
    stop(): void {
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
            connectedClients: socketService.getConnectedClientsCount(),
        };
    }
}

// Factory function to create worker with environment config
export function createWorker(): Worker {
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
