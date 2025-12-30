/**
 * MQTT Simulator - Simulates smart meter data
 * Run with: npx tsx src/worker/simulator.ts
 */

import mqtt from 'mqtt';

const BROKER_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || 'energy/panels';

// Panel configurations matching seed data
const PANELS = [
    { code: '1A', name: 'Main Distribution', nominalCurrent: 100 },
    { code: '1B', name: 'HVAC Systems', nominalCurrent: 80 },
    { code: '2A', name: 'Lighting Control', nominalCurrent: 60 },
    { code: '2B', name: 'Server Room UPS', nominalCurrent: 120 },
    { code: '3A', name: 'Auxiliary Power', nominalCurrent: 50 },
    { code: '3B', name: 'Lab Equipment', nominalCurrent: 70 },
    { code: '4A', name: 'Emergency Lighting', nominalCurrent: 40 },
    { code: '4B', name: 'Server Room', nominalCurrent: 150 },
];

function randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

function generateMetrics(panel: typeof PANELS[0]) {
    // Generate realistic 3-phase electrical readings
    const baseVoltage = 230;
    const voltageVariation = randomInRange(-5, 5);

    const baseCurrent = panel.nominalCurrent * randomInRange(0.3, 0.8);
    const currentImbalance = randomInRange(0.9, 1.1);

    return {
        panel_code: panel.code,
        timestamp: new Date().toISOString(),

        // Voltage L-N (230V nominal ±5%)
        voltage_ln_r: baseVoltage + voltageVariation + randomInRange(-2, 2),
        voltage_ln_s: baseVoltage + voltageVariation + randomInRange(-2, 2),
        voltage_ln_t: baseVoltage + voltageVariation + randomInRange(-2, 2),

        // Current per phase (with some imbalance)
        current_r: baseCurrent * currentImbalance,
        current_s: baseCurrent * randomInRange(0.95, 1.05),
        current_t: baseCurrent / currentImbalance,

        // Frequency (50Hz nominal, usually 49.9-50.1)
        frequency: 50 + randomInRange(-0.1, 0.1),

        // Power Factor (typically 0.85-0.99)
        power_factor: randomInRange(0.85, 0.99),

        // THD (Total Harmonic Distortion) - typically 3-12%
        thd_current: randomInRange(3, 12),
        thd_voltage: randomInRange(1, 5),

        // Power calculations
        power_kw: (baseCurrent * 3 * baseVoltage * 0.92) / 1000,
        energy_kwh: randomInRange(100, 5000),

        // Temperature (25-45°C typical)
        temperature: randomInRange(28, 42),
    };
}

async function main() {
    console.log(`🔌 Connecting to MQTT broker: ${BROKER_URL}`);

    const client = mqtt.connect(BROKER_URL, {
        clientId: `simulator-${Date.now()}`,
    });

    client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        console.log(`📡 Publishing to: ${TOPIC_PREFIX}/+/metrics`);
        console.log('');

        // Publish metrics every second
        setInterval(() => {
            for (const panel of PANELS) {
                const metrics = generateMetrics(panel);
                const topic = `${TOPIC_PREFIX}/${panel.code}/metrics`;

                client.publish(topic, JSON.stringify(metrics), { qos: 1 });
                console.log(`📤 ${panel.code}: V=${metrics.voltage_ln_r.toFixed(1)}V, I=${metrics.current_r.toFixed(1)}A, PF=${metrics.power_factor.toFixed(3)}, freq=${metrics.frequency.toFixed(2)}Hz`);
            }
            console.log('---');
        }, 1000);

        // Occasionally publish an anomaly (every 30 seconds)
        setInterval(() => {
            const panel = PANELS[Math.floor(Math.random() * PANELS.length)];
            const anomalyTypes = ['low_pf', 'high_thd', 'freq_deviation', 'voltage_sag'];
            const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];

            let metrics = generateMetrics(panel);

            switch (anomalyType) {
                case 'low_pf':
                    metrics.power_factor = randomInRange(0.65, 0.8);
                    console.log(`⚠️ Simulating LOW POWER FACTOR on ${panel.code}: ${metrics.power_factor.toFixed(3)}`);
                    break;
                case 'high_thd':
                    metrics.thd_current = randomInRange(16, 25);
                    console.log(`⚠️ Simulating HIGH THD on ${panel.code}: ${metrics.thd_current.toFixed(1)}%`);
                    break;
                case 'freq_deviation':
                    metrics.frequency = randomInRange(49.3, 49.5);
                    console.log(`⚠️ Simulating FREQUENCY DEVIATION on ${panel.code}: ${metrics.frequency.toFixed(2)}Hz`);
                    break;
                case 'voltage_sag':
                    metrics.voltage_ln_r = 230 * 0.85; // 15% sag
                    console.log(`⚠️ Simulating VOLTAGE SAG on ${panel.code}: ${metrics.voltage_ln_r.toFixed(1)}V`);
                    break;
            }

            const topic = `${TOPIC_PREFIX}/${panel.code}/metrics`;
            client.publish(topic, JSON.stringify(metrics), { qos: 1 });
        }, 30000);
    });

    client.on('error', (error: Error) => {
        console.error('❌ MQTT Error:', error.message);
    });

    client.on('close', () => {
        console.log('📴 Disconnected from MQTT broker');
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping simulator...');
        client.end();
        process.exit(0);
    });
}

main();
