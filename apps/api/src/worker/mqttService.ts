import mqtt, { MqttClient, IClientOptions } from 'mqtt';
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

export class MqttService extends EventEmitter {
    private client: MqttClient | null = null;
    private config: MqttServiceConfig;
    private isConnected = false;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 10;

    constructor(config: MqttServiceConfig) {
        super();
        this.config = config;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const options: IClientOptions = {
                clientId: this.config.clientId || `energy-worker-${Date.now()}`,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30000,
            };

            if (this.config.username) {
                options.username = this.config.username;
                options.password = this.config.password;
            }

            console.log(`🔌 Connecting to MQTT broker: ${this.config.brokerUrl}`);

            this.client = mqtt.connect(this.config.brokerUrl, options);

            this.client.on('connect', () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('✅ MQTT connected successfully');
                this.subscribeToTopics();
                resolve();
            });

            this.client.on('error', (error) => {
                console.error('❌ MQTT error:', error.message);
                if (!this.isConnected) {
                    reject(error);
                }
                this.emit('error', error);
            });

            this.client.on('close', () => {
                this.isConnected = false;
                console.log('⚠️ MQTT connection closed');
                this.emit('disconnected');
            });

            this.client.on('reconnect', () => {
                this.reconnectAttempts++;
                console.log(`🔄 MQTT reconnecting... (attempt ${this.reconnectAttempts})`);
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    console.error('❌ Max reconnect attempts reached');
                    this.client?.end();
                }
            });

            this.client.on('message', (topic, message) => {
                this.handleMessage(topic, message);
            });
        });
    }

    private subscribeToTopics(): void {
        if (!this.client) return;

        // Subscribe to all panel metrics: energy/panels/+/metrics
        const metricsTopic = `${this.config.topicPrefix}/+/metrics`;
        // Subscribe to all panel events: energy/panels/+/events
        const eventsTopic = `${this.config.topicPrefix}/+/events`;

        this.client.subscribe([metricsTopic, eventsTopic], { qos: 1 }, (err) => {
            if (err) {
                console.error('❌ MQTT subscribe error:', err);
            } else {
                console.log(`📡 Subscribed to: ${metricsTopic}, ${eventsTopic}`);
            }
        });
    }

    private handleMessage(topic: string, message: Buffer): void {
        try {
            const payload = JSON.parse(message.toString());
            const mqttMessage: MqttMessage = {
                topic,
                payload,
                timestamp: new Date(),
            };

            // Extract panel ID from topic: energy/panels/{panelCode}/metrics
            const topicParts = topic.split('/');
            const panelCode = topicParts[2]; // e.g., "1A", "4B"
            const messageType = topicParts[3]; // "metrics" or "events"

            this.emit('message', {
                ...mqttMessage,
                panelCode,
                messageType,
            });

            // Emit specific events based on message type
            if (messageType === 'metrics') {
                this.emit('metrics', { panelCode, data: payload, timestamp: new Date() });
            } else if (messageType === 'events') {
                this.emit('event', { panelCode, data: payload, timestamp: new Date() });
            }
        } catch (error) {
            console.error('❌ Error parsing MQTT message:', error);
        }
    }

    publish(topic: string, payload: object): void {
        if (!this.client || !this.isConnected) {
            console.warn('⚠️ Cannot publish - MQTT not connected');
            return;
        }

        this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    }

    disconnect(): void {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
            console.log('🔌 MQTT disconnected');
        }
    }

    getConnectionStatus(): boolean {
        return this.isConnected;
    }
}
