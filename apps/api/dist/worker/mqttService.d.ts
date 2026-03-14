import { EventEmitter } from 'events';
export interface MqttMessage {
    topic: string;
    payload: unknown;
    timestamp: Date;
}
export interface MqttServiceConfig {
    brokerUrl: string;
    username?: string;
    password?: string;
    topicPrefix: string;
    clientId?: string;
}
export declare class MqttService extends EventEmitter {
    private client;
    private config;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(config: MqttServiceConfig);
    connect(): Promise<void>;
    private subscribeToTopics;
    /**
     * Safely parse MQTT message payload.
     * Handles: JSON objects, raw numbers, "nan", and other non-JSON strings.
     */
    private parsePayload;
    /**
     * Extract the numeric value from a payload that could be:
     *  - A raw number:  110.59
     *  - An object:     { value: 110.59, unit: "A" }
     */
    private extractValue;
    private handleMessage;
    publish(topic: string, payload: object): void;
    disconnect(): void;
    getConnectionStatus(): boolean;
}
//# sourceMappingURL=mqttService.d.ts.map