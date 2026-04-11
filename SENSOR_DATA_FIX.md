# Sensor Data Saving - Testing Guide

## Overview
The sensor data saving functionality has been fixed to properly save MQTT sensor readings from building sensors to the MySQL database in the `building_sensor_readings` table.

## Architecture

### Data Flow
```
MQTT Broker (iterahero.com:1883)
    ↓
MQTT Topic: energy/buildings/{zone}/{building}/{sensor}/{parameter}
    ↓
Worker Process (mqttService)
    ↓
Parameter Event Handler (buffers data)
    ↓
Flush Interval (every 10 seconds)
    ↓
MySQL Database (building_sensor_readings table)
```

### Components

1. **MQTT Service** (`src/worker/mqttService.ts`)
   - Connects to MQTT broker at `iterahero.com:1883`
   - Subscribes to `energy/buildings/#` topics
   - Parses incoming messages and emits 'parameter' events

2. **Worker** (`src/worker/index.ts`)
   - Listens to 'parameter' events from MQTT
   - Buffers sensor data by building code and sensor ID
   - Flushes data to database every 10 seconds

3. **Sensor Reading Service** (`src/services/sensorReadingService.ts`)
   - Manages in-memory buffer for sensor readings
   - Looks up buildings by code
   - Flushes data to `building_sensor_readings` table

4. **Database** (`MySQL`)
   - Table: `building_sensor_readings`
   - Stores: voltage (3-phase), current (3-phase), power, frequency, temperature, energy, THD

## MQTT Topic Structure

Expected format:
```
energy/buildings/{zone}/{building}/{sensor}/{parameter}
```

Example topics:
```
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/L1_N          (Voltage Phase R)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/L2_N          (Voltage Phase S)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/L3_N          (Voltage Phase T)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/I1            (Current Phase R)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/I2            (Current Phase S)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/I3            (Current Phase T)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/frequency     (Frequency)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/temperature   (Temperature)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/power_factor  (Power Factor)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/energy        (Energy)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/thd_v         (THD Voltage)
energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/thd_i         (THD Current)
```

## Parameter Name Mapping

The MQTT parameters are automatically mapped to database fields:

| MQTT Parameter | Database Field | Unit |
|---|---|---|
| L1_N (or voltage_r) | voltageR | V |
| L2_N (or voltage_s) | voltageS | V |
| L3_N (or voltage_t) | voltageT | V |
| I1 (or current_r) | currentR | A |
| I2 (or current_s) | currentS | A |
| I3 (or current_t) | currentT | A |
| power | power | kW |
| power_factor | powerFactor | (0-1) |
| frequency | frequency | Hz |
| temperature | temperature | °C |
| energy | energy | kWh |
| thd_v | thdVoltage | % |
| thd_i | thdCurrent | % |

## Testing Steps

### 1. Start the API Server
```bash
cd apps/api
npm install
npm run build
npm start
```

The server should output:
```
🚀 Dashboard Energy API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Local:   http://localhost:3001
📡 Network: http://{your-ip}:3001
🔧 Environment: development
🔌 Socket.io: ws://{your-ip}:3001
```

### 2. Check Worker Status
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-08T...",
  "worker": {
    "isRunning": true,
    "mqttConnected": true,
    "metricsProcessed": 0,
    "bufferSize": 0,
    "totalWritten": 0,
    "connectedClients": 0
  }
}
```

### 3. Monitor Logs
The API will output logs like:
```
📊 Buffered BUILDING-CODE/SENSOR-ID: voltage_r=230.5 V (buffer size: 1)
⏱️  Sensor flush interval started. Buffer size: 1
📤 Saving BUILDING-CODE/SENSOR-ID data: ['voltage_r', 'current_r']
✅ Found building: BUILDING-CODE (id: xxxx...)
📝 Buffered reading for BUILDING-CODE/SENSOR-ID, buffer size: 2
💾 Flushing 1 sensor readings to database
✅ Saved 1 sensor readings to database
✅ Flush complete: 1 readings saved to database
```

### 4. Query Saved Data
```bash
# Get all readings for a building
curl -H "Authorization: Bearer {token}" \
  http://localhost:3001/api/buildings/{building-id}/readings

# Get latest reading for a building  
curl -H "Authorization: Bearer {token}" \
  http://localhost:3001/api/buildings/{building-id}/readings/latest
```

### 5. Publish Test MQTT Message
```bash
mosquitto_pub -h iterahero.com -t "energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/voltage_r" -m "230.5"
mosquitto_pub -h iterahero.com -t "energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/current_r" -m "110.59"
mosquitto_pub -h iterahero.com -t "energy/buildings/MAIN-ZONE/GDC-01/LVMDP-01/frequency" -m "50.01"
```

## Recent Fixes

### Fixed in sensorReadingService.ts
- **Before**: Using `.toString()` on undefined values resulted in string "undefined"
- **After**: Using proper null checks: `value != null ? String(value) : undefined`
- **Impact**: Prevents spurious strings from being inserted into numeric fields

### Enhanced Logging
- Added detailed logs for every step of the data pipeline
- Helps diagnose where data loss occurs
- Shows buffer sizes and failed inserts with retry logic

### Error Handling
- Failed database inserts are re-added to buffer for retry
- Prevents data loss during transient database issues
- Logs detailed error messages for troubleshooting

## Troubleshooting

### Data Not Being Saved
1. **Check MQTT connection**: Look for `✅ MQTT connected successfully` in logs
2. **Verify topic format**: Ensure building code matches a building in the database
3. **Check buffer logs**: Look for `📊 Buffered` messages
4. **Check flush logs**: Look for `💾 Flushing` messages

### Common Issues:
- **"Building not found"** - Ensure the building code in MQTT topic matches database
- **No logs appearing** - MQTT broker might not be accessible
- **Data not inserting** - Check database connection and table permissions

## Database Queries

### Check recent readings:
```sql
SELECT * FROM building_sensor_readings 
WHERE building_id = '{building-id}'
ORDER BY timestamp DESC 
LIMIT 10;
```

### Check by building code:
```sql
SELECT b.code, r.* FROM building_sensor_readings r
JOIN buildings b ON r.building_id = b.id
WHERE b.code = 'GDC-01'
ORDER BY r.timestamp DESC
LIMIT 100;
```

## Configuration

### MQTT Settings (.env)
```
MQTT_BROKER_URL=mqtt://iterahero.com:1883
MQTT_USERNAME=          (leave empty if no auth)
MQTT_PASSWORD=          (leave empty if no auth)
MQTT_TOPIC_PREFIX=energy/buildings
```

### Database Settings (.env)
```
DATABASE_URL=mysql://root@localhost:3306/dashboard_energy
```

### Flush Settings (in Worker)
- Flush interval: 10 seconds
- Batch size: 100 readings

## Next Steps

1. Publish sensor data via MQTT to the broker
2. Monitor the API logs for data flow
3. Query the API endpoints to verify data is saved
4. Use the dashboard UI to view real-time sensor data

## Support

If data is not being saved:
1. Check `/health` endpoint for worker status
2. Monitor API logs for error messages
3. Verify MQTT topic format matches building codes in database
4. Check database connectivity and permissions
