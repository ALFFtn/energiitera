import { Server as HttpServer } from 'http';
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
export declare class Worker {
    private config;
    private mqttService;
    private batchWriter;
    private isRunning;
    private metricsCount;
    private flushInterval;
    private sensorBuffer;
    constructor(config: WorkerConfig);
    /**
     * Initialize Socket.io with the HTTP server
     */
    initializeSocket(httpServer: HttpServer): void;
    /**
     * Start the worker (MQTT subscription)
     */
    start(): Promise<void>;
    /**
     * Stop the worker
     */
    stop(): void;
    /**
     * Get worker status
     */
    getStatus(): {
        isRunning: boolean;
        mqttConnected: boolean;
        metricsProcessed: number;
        bufferSize: number;
        totalWritten: number;
        connectedClients: number;
    };
}
export declare function createWorker(): Worker;
//# sourceMappingURL=index.d.ts.map