import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3001';

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
