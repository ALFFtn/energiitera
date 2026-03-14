import type { ProcessedMetrics } from './dataProcessor';
export interface BatchWriterConfig {
    batchSize: number;
    flushIntervalMs: number;
}
export declare class BatchWriter {
    private buffer;
    private config;
    private flushTimer;
    private panelIdCache;
    private isProcessing;
    private totalWritten;
    constructor(config: BatchWriterConfig);
    start(): void;
    stop(): void;
    /**
     * Add metrics to the buffer
     */
    add(metrics: ProcessedMetrics): void;
    /**
     * Flush buffer to database
     */
    flush(): Promise<void>;
    /**
     * Resolve panel code to panel ID (with caching)
     */
    private resolvePanelId;
    /**
     * Get buffer size
     */
    getBufferSize(): number;
    /**
     * Get total written count
     */
    getTotalWritten(): number;
}
//# sourceMappingURL=batchWriter.d.ts.map