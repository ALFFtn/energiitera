"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const events_1 = require("events");
class MqttService extends events_1.EventEmitter {
    client = null;
    config;
    isConnected = false;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    constructor(config) {
        super();
        this.config = config;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            const options = {
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
            this.client = mqtt_1.default.connect(this.config.brokerUrl, options);
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
    subscribeToTopics() {
        if (!this.client)
            return;
        // Subscribe to all building sensor data: energy/buildings/+/+/+/# 
        // Pattern: energy/buildings/{zoneCode}/{buildingCode}/{sensorId}/{parameter}
        const allDataTopic = `${this.config.topicPrefix}/#`;
        this.client.subscribe([allDataTopic], { qos: 1 }, (err) => {
            if (err) {
                console.error('❌ MQTT subscribe error:', err);
            }
            else {
                console.log(`📡 Subscribed to: ${allDataTopic}`);
            }
        });
    }
    /**
     * Safely parse MQTT message payload.
     * Handles: JSON objects, raw numbers, "nan", and other non-JSON strings.
     */
    parsePayload(raw) {
        const trimmed = raw.trim();
        // Handle known non-JSON values
        if (trimmed === 'nan' || trimmed === 'NaN' || trimmed === 'null' || trimmed === '') {
            return null;
        }
        try {
            return JSON.parse(trimmed);
        }
        catch {
            // If it looks like a number, parse it
            const num = Number(trimmed);
            if (!isNaN(num)) {
                return num;
            }
            // Return null for unparseable values
            return null;
        }
    }
    /**
     * Extract the numeric value from a payload that could be:
     *  - A raw number:  110.59
     *  - An object:     { value: 110.59, unit: "A" }
     */
    extractValue(payload) {
        if (payload === null || payload === undefined) {
            return { value: null, unit: '' };
        }
        if (typeof payload === 'number') {
            return { value: isNaN(payload) ? null : payload, unit: '' };
        }
        if (typeof payload === 'object' && payload !== null) {
            const obj = payload;
            if ('value' in obj && typeof obj.value === 'number') {
                return { value: isNaN(obj.value) ? null : obj.value, unit: obj.unit || '' };
            }
        }
        return { value: null, unit: '' };
    }
    handleMessage(topic, message) {
        try {
            const raw = message.toString();
            const payload = this.parsePayload(raw);
            // Skip null/unparseable payloads
            if (payload === null) {
                return;
            }
            const mqttMessage = {
                topic,
                payload,
                timestamp: new Date(),
            };
            // Parse topic: energy/buildings/{zoneCode}/{buildingCode}/{sensorId}/{parameter}
            const topicParts = topic.split('/');
            // Determine if it's the old panel format or new building format
            if (topicParts[1] === 'buildings' && topicParts.length >= 6) {
                // New format: energy/buildings/{zoneCode}/{buildingCode}/{sensorId}/{parameter}
                const zoneCode = topicParts[2];
                const buildingCode = topicParts[3];
                const sensorId = topicParts[4];
                const parameter = topicParts[5];
                // Extract value (handles both raw numbers and {value, unit} objects)
                const { value, unit } = this.extractValue(payload);
                console.log(`📥 ${zoneCode}/${buildingCode}/${sensorId}/${parameter}:`, value ?? payload);
                this.emit('message', {
                    ...mqttMessage,
                    zoneCode,
                    buildingCode,
                    sensorId,
                    parameter,
                });
                // Emit specific events based on parameter
                if (parameter === 'metrics') {
                    this.emit('metrics', {
                        panelCode: `${buildingCode}-${sensorId}`,
                        buildingCode,
                        sensorId,
                        data: payload,
                        timestamp: new Date()
                    });
                }
                else if (parameter === 'data' && typeof payload === 'object') {
                    // "data" topic contains combined readings like {L2_L3: 414.4, I1: 110.59}
                    // Map device keys to standard parameter names
                    const DATA_KEY_MAP = {
                        I1: 'current_r',
                        I2: 'current_s',
                        I3: 'current_t',
                        L1_N: 'voltage_r',
                        L2_N: 'voltage_s',
                        L3_N: 'voltage_t',
                        Total_Active_Energy_Import: 'power',
                    };
                    // Fan out each key as an individual parameter
                    const dataObj = payload;
                    for (const [key, val] of Object.entries(dataObj)) {
                        if (typeof val === 'number' && !isNaN(val)) {
                            const mappedKey = DATA_KEY_MAP[key] || key;
                            this.emit('parameter', {
                                zoneCode,
                                buildingCode,
                                sensorId,
                                parameter: mappedKey,
                                value: val,
                                unit: '',
                                timestamp: new Date(),
                            });
                        }
                    }
                }
                else if (value !== null) {
                    // Individual parameter update (only emit if value is valid)
                    this.emit('parameter', {
                        zoneCode,
                        buildingCode,
                        sensorId,
                        parameter,
                        value,
                        unit,
                        timestamp: new Date(),
                    });
                }
            }
            else if (topicParts.length >= 4) {
                // Old format: energy/panels/{panelCode}/{type}
                const panelCode = topicParts[2];
                const messageType = topicParts[3];
                this.emit('message', {
                    ...mqttMessage,
                    panelCode,
                    messageType,
                });
                if (messageType === 'metrics') {
                    this.emit('metrics', { panelCode, data: payload, timestamp: new Date() });
                }
                else if (messageType === 'events') {
                    this.emit('event', { panelCode, data: payload, timestamp: new Date() });
                }
            }
        }
        catch (error) {
            console.error('❌ Error parsing MQTT message:', error);
        }
    }
    publish(topic, payload) {
        if (!this.client || !this.isConnected) {
            console.warn('⚠️ Cannot publish - MQTT not connected');
            return;
        }
        this.client.publish(topic, JSON.stringify(payload), { qos: 1 });
    }
    disconnect() {
        if (this.client) {
            this.client.end();
            this.isConnected = false;
            console.log('🔌 MQTT disconnected');
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.MqttService = MqttService;
//# sourceMappingURL=mqttService.js.map