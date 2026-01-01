/**
 * MQTT Test Publisher - LVMDP Sensor Simulator
 * 
 * Simulates sending sensor data from an LVMDP (Low Voltage Main Distribution Panel)
 * to an MQTT broker for testing the energy monitoring dashboard.
 * 
 * Usage: npm start
 */

const mqtt = require('mqtt');

// MQTT Configuration
const MQTT_CONFIG = {
    host: 'mqtt://iterahero.com',
    port: 1883,
    options: {
        clientId: `lvmdp-simulator-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        // No username/password required
    }
};

// Simulated Building/Sensor Configuration
// These values should match your database!
// Zone code 'A' (lowercase 'a' for topic)
// Building code 'ENG' (Engineering Quad in seed)
const SENSOR_CONFIG = {
    zoneCode: 'a',
    buildingCode: 'eng',  // Matches 'ENG' in database (case-insensitive)
    sensorId: 'lvmdp-01'
};

// Calculate base topic
const BASE_TOPIC = `energy/buildings/${SENSOR_CONFIG.zoneCode}/${SENSOR_CONFIG.buildingCode}/${SENSOR_CONFIG.sensorId}`;

// Simulated sensor parameters with realistic ranges
const PARAMETERS = {
    voltage_r: { min: 218, max: 242, unit: 'V' },
    voltage_s: { min: 218, max: 242, unit: 'V' },
    voltage_t: { min: 218, max: 242, unit: 'V' },
    current_r: { min: 50, max: 200, unit: 'A' },
    current_s: { min: 50, max: 200, unit: 'A' },
    current_t: { min: 50, max: 200, unit: 'A' },
    power: { min: 30, max: 150, unit: 'kW' },
    power_factor: { min: 0.85, max: 0.99, unit: '' },
    frequency: { min: 49.9, max: 50.1, unit: 'Hz' },
    temperature: { min: 30, max: 55, unit: '°C' },
    energy: { min: 1000, max: 50000, unit: 'kWh', cumulative: true },
    thd_v: { min: 1, max: 8, unit: '%' },
    thd_i: { min: 3, max: 15, unit: '%' }
};

// State for cumulative values
let cumulativeEnergy = 15000;

// Generate random value within range with some variation
function generateValue(param, lastValue = null) {
    const { min, max, cumulative } = PARAMETERS[param];

    if (cumulative) {
        // For cumulative values, slowly increase
        cumulativeEnergy += Math.random() * 0.5;
        return parseFloat(cumulativeEnergy.toFixed(2));
    }

    // Add some realistic variation if we have a last value
    if (lastValue !== null) {
        const variation = (max - min) * 0.05; // 5% variation
        let newValue = lastValue + (Math.random() - 0.5) * variation;
        return parseFloat(Math.max(min, Math.min(max, newValue)).toFixed(2));
    }

    // Generate random value within range
    const value = min + Math.random() * (max - min);
    return parseFloat(value.toFixed(2));
}

// Store last values for smooth transitions
const lastValues = {};

// Connect to MQTT broker
console.log('🔌 Connecting to MQTT broker...');
console.log(`   Host: ${MQTT_CONFIG.host}:${MQTT_CONFIG.port}`);
console.log(`   Client ID: ${MQTT_CONFIG.options.clientId}`);

const client = mqtt.connect(MQTT_CONFIG.host, {
    port: MQTT_CONFIG.port,
    ...MQTT_CONFIG.options
});

client.on('connect', () => {
    console.log('✅ Connected to MQTT broker!\n');
    console.log(`📡 Publishing to base topic: ${BASE_TOPIC}`);
    console.log('━'.repeat(60));

    // Start publishing sensor data every 2 seconds
    setInterval(publishSensorData, 2000);

    // Publish immediately on connect
    publishSensorData();
});

client.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
});

client.on('close', () => {
    console.log('🔌 Disconnected from MQTT broker');
});

client.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
});

// Publish all sensor data
function publishSensorData() {
    const timestamp = new Date().toISOString();

    console.log(`\n⏱️  ${timestamp}`);

    // Build combined payload
    const payload = {
        timestamp,
        sensorId: SENSOR_CONFIG.sensorId,
        buildingCode: SENSOR_CONFIG.buildingCode,
        zoneCode: SENSOR_CONFIG.zoneCode,
        readings: {}
    };

    // Generate and publish each parameter
    for (const [param, config] of Object.entries(PARAMETERS)) {
        const value = generateValue(param, lastValues[param]);
        lastValues[param] = value;

        const topic = `${BASE_TOPIC}/${param}`;
        const paramPayload = JSON.stringify({
            value,
            unit: config.unit,
            timestamp
        });

        // Publish individual parameter
        client.publish(topic, paramPayload, { qos: 1 });

        // Add to combined payload
        payload.readings[param] = { value, unit: config.unit };

        // Log output
        const valueStr = value.toString().padStart(8);
        const unitStr = config.unit.padEnd(4);
        console.log(`   📊 ${param.padEnd(15)} ${valueStr} ${unitStr} → ${topic}`);
    }

    // Also publish combined payload to metrics topic
    const metricsTopic = `${BASE_TOPIC}/metrics`;
    client.publish(metricsTopic, JSON.stringify(payload), { qos: 1 });
    console.log(`   📦 Combined payload → ${metricsTopic}`);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    client.end(true, () => {
        console.log('✅ Disconnected cleanly');
        process.exit(0);
    });
});

console.log('\n🚀 LVMDP Sensor Simulator Starting...');
console.log('   Press Ctrl+C to stop\n');
