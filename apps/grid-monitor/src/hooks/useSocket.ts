import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/api';

interface SensorData {
    voltage_r?: number;
    voltage_s?: number;
    voltage_t?: number;
    current_r?: number;
    current_s?: number;
    current_t?: number;
    power?: number;
    power_factor?: number;
    frequency?: number;
    temperature?: number;
    energy?: number;
    thd_v?: number;
    thd_i?: number;
}

interface UseBuildingSensorOptions {
    buildingCode: string;
    zoneCode: string;
    sensorId?: string;
}

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Create socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });

        socketRef.current.on('connect', () => {
            console.log('🔌 Socket connected:', socketRef.current?.id);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    return { socket: socketRef.current, isConnected };
}

export function useBuildingSensor({ buildingCode, zoneCode, sensorId = 'lvmdp-01' }: UseBuildingSensorOptions) {
    const { socket, isConnected } = useSocket();
    const [sensorData, setSensorData] = useState<SensorData>({
        voltage_r: 0,
        voltage_s: 0,
        voltage_t: 0,
        current_r: 0,
        current_s: 0,
        current_t: 0,
        power: 0,
        power_factor: 0,
        frequency: 50,
        temperature: 0,
        energy: 0,
        thd_v: 0,
        thd_i: 0,
    });
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const handleParameterUpdate = useCallback((data: {
        zoneCode: string;
        buildingCode: string;
        sensorId: string;
        parameter: string;
        value: number;
        timestamp: Date;
    }) => {
        // Check if this update is for our building
        if (data.buildingCode.toLowerCase() === buildingCode.toLowerCase() &&
            data.zoneCode.toLowerCase() === zoneCode.toLowerCase()) {

            setSensorData(prev => ({
                ...prev,
                [data.parameter]: data.value,
            }));
            setLastUpdate(new Date(data.timestamp));
        }
    }, [buildingCode, zoneCode]);

    useEffect(() => {
        if (!socket) return;

        // Subscribe to building sensor updates
        const channel = `building:${zoneCode}:${buildingCode}`;
        socket.emit('subscribe', { channel });
        console.log(`📡 Subscribed to ${channel}`);

        // Listen for parameter updates
        socket.on('sensor:parameter', handleParameterUpdate);

        // Also listen for combined metrics
        socket.on('sensor:metrics', (data: {
            buildingCode: string;
            sensorId: string;
            readings: SensorData;
            timestamp: Date;
        }) => {
            if (data.buildingCode.toLowerCase() === buildingCode.toLowerCase()) {
                setSensorData(prev => ({ ...prev, ...data.readings }));
                setLastUpdate(new Date(data.timestamp));
            }
        });

        return () => {
            socket.emit('unsubscribe', { channel });
            socket.off('sensor:parameter', handleParameterUpdate);
            socket.off('sensor:metrics');
        };
    }, [socket, buildingCode, zoneCode, sensorId, handleParameterUpdate]);

    return {
        sensorData,
        lastUpdate,
        isConnected,
        // Helper getters
        voltage: {
            r: sensorData.voltage_r || 0,
            s: sensorData.voltage_s || 0,
            t: sensorData.voltage_t || 0,
            avg: Math.round(((sensorData.voltage_r || 0) + (sensorData.voltage_s || 0) + (sensorData.voltage_t || 0)) / 3),
        },
        current: {
            r: sensorData.current_r || 0,
            s: sensorData.current_s || 0,
            t: sensorData.current_t || 0,
            total: (sensorData.current_r || 0) + (sensorData.current_s || 0) + (sensorData.current_t || 0),
        },
        power: sensorData.power || 0,
        powerFactor: sensorData.power_factor || 0,
        frequency: sensorData.frequency || 50,
        temperature: sensorData.temperature || 0,
        thdVoltage: sensorData.thd_v || 0,
        thdCurrent: sensorData.thd_i || 0,
    };
}

// Hook to get ALL buildings sensor data for dashboard
interface BuildingSensorSummary {
    buildingCode: string;
    power: number;
    powerFactor: number;
    voltage: number;
    current: number;
    status: 'online' | 'offline';
    lastUpdate: Date;
}

export function useAllBuildingsSensor() {
    const { socket, isConnected } = useSocket();
    const [buildingsData, setBuildingsData] = useState<Map<string, BuildingSensorSummary>>(new Map());
    const [totalPower, setTotalPower] = useState(0);
    const [avgPowerFactor, setAvgPowerFactor] = useState(0);

    useEffect(() => {
        if (!socket) return;

        // Listen for all sensor parameter updates
        const handleParameterUpdate = (data: {
            zoneCode: string;
            buildingCode: string;
            sensorId: string;
            parameter: string;
            value: number;
            timestamp: Date;
        }) => {
            const key = data.buildingCode.toUpperCase();

            setBuildingsData(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(key) || {
                    buildingCode: key,
                    power: 0,
                    powerFactor: 0.95,
                    voltage: 220,
                    current: 0,
                    status: 'online' as const,
                    lastUpdate: new Date(),
                };

                // Update specific parameter
                switch (data.parameter) {
                    case 'power':
                        existing.power = data.value;
                        break;
                    case 'power_factor':
                        existing.powerFactor = data.value;
                        break;
                    case 'voltage_r':
                    case 'voltage_s':
                    case 'voltage_t':
                        existing.voltage = data.value;
                        break;
                    case 'current_r':
                    case 'current_s':
                    case 'current_t':
                        existing.current = (existing.current || 0) + data.value / 3;
                        break;
                }

                existing.status = 'online';
                existing.lastUpdate = new Date(data.timestamp);
                newMap.set(key, existing);

                return newMap;
            });
        };

        socket.on('sensor:parameter', handleParameterUpdate);

        return () => {
            socket.off('sensor:parameter', handleParameterUpdate);
        };
    }, [socket]);

    // Calculate totals whenever buildingsData changes
    useEffect(() => {
        const buildings = Array.from(buildingsData.values());
        const total = buildings.reduce((sum, b) => sum + (b.power || 0), 0);
        setTotalPower(total);

        const pfs = buildings.filter(b => b.powerFactor > 0);
        if (pfs.length > 0) {
            const avgPf = pfs.reduce((sum, b) => sum + b.powerFactor, 0) / pfs.length;
            setAvgPowerFactor(avgPf);
        }
    }, [buildingsData]);

    // Get sensor data for a specific building
    const getBuildingData = useCallback((buildingCode: string): BuildingSensorSummary | null => {
        return buildingsData.get(buildingCode.toUpperCase()) || null;
    }, [buildingsData]);

    return {
        buildingsData,
        getBuildingData,
        totalPower,
        avgPowerFactor,
        isConnected,
        buildingCount: buildingsData.size,
    };
}
