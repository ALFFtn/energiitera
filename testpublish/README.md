# MQTT Test Publisher - LVMDP Sensor Simulator

This tool simulates an LVMDP (Low Voltage Main Distribution Panel) sensor publishing data to an MQTT broker.

## Setup

```bash
cd testpublish
npm install
```

## Run

```bash
npm start
```

## Configuration

Edit `publisher.js` to change:

- **MQTT Server**: Currently set to `iterahero.com:1883`
- **Building Info**: `zoneCode`, `buildingCode`, `sensorId`
- **Publish Interval**: Default 2 seconds

## Published Topics

Base topic: `energy/buildings/{zoneCode}/{buildingCode}/{sensorId}`

Individual parameters:
- `/voltage_r`, `/voltage_s`, `/voltage_t` - Voltage per phase (V)
- `/current_r`, `/current_s`, `/current_t` - Current per phase (A)
- `/power` - Active power (kW)
- `/power_factor` - Power factor (0-1)
- `/frequency` - Grid frequency (Hz)
- `/temperature` - Panel temperature (°C)
- `/energy` - Cumulative energy (kWh)
- `/thd_v`, `/thd_i` - Total Harmonic Distortion (%)
- `/metrics` - Combined payload with all readings

## Example Output

```
⏱️  2024-01-01T12:00:00.000Z
   📊 voltage_r         230.5 V    → energy/buildings/a/eng-01/lvmdp-01/voltage_r
   📊 power              85.2 kW   → energy/buildings/a/eng-01/lvmdp-01/power
   📦 Combined payload → energy/buildings/a/eng-01/lvmdp-01/metrics
```

## Payload Format

Individual parameter:
```json
{
  "value": 230.5,
  "unit": "V",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Combined metrics:
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "sensorId": "lvmdp-01",
  "buildingCode": "eng-01",
  "zoneCode": "a",
  "readings": {
    "voltage_r": { "value": 230.5, "unit": "V" },
    "power": { "value": 85.2, "unit": "kW" }
  }
}
```
