import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, API_URL } from '../config/api';

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
    buildingId?: string;  // Used to fetch initial data from DB
}

// ── Singleton socket shared by all hooks ──────────────────────────────
let _socket: Socket | null = null;
let _isConnected = false;
const _listeners = new Set<() => void>();

function getSharedSocket(): Socket {
    if (!_socket) {
        _socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: Infinity,
        });

        _socket.on('connect', () => {
            console.log('🔌 Socket connected:', _socket?.id);
            _isConnected = true;
            _listeners.forEach(l => l());
        });

        _socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            _isConnected = false;
            _listeners.forEach(l => l());
        });

        _socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
        });
    }
    return _socket;
}

function subscribeToSocket(listener: () => void) {
    _listeners.add(listener);
    // Ensure socket is initialised
    getSharedSocket();
    return () => { _listeners.delete(listener); };
}

function getSocketSnapshot() {
    return _isConnected;
}

export function useSocket() {
    const isConnected = useSyncExternalStore(subscribeToSocket, getSocketSnapshot);
    const socket = getSharedSocket();
    return { socket, isConnected };
}

export function useBuildingSensor({ buildingCode, zoneCode, sensorId = 'lvmdp-01', buildingId }: UseBuildingSensorOptions) {
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
    const initialFetchDone = useRef(false);

    // Fetch initial data from API so the page isn't blank on load/refresh
    useEffect(() => {
        if (initialFetchDone.current) return;

        const fetchLatest = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                let bid = buildingId;

                // If no buildingId, try to resolve from buildingCode
                if (!bid && buildingCode) {
                    const buildingsRes = await fetch(`${API_URL}/api/buildings?code=${encodeURIComponent(buildingCode)}`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const buildingsData = await buildingsRes.json();
                    if (buildingsData.success && buildingsData.data) {
                        const list = Array.isArray(buildingsData.data) ? buildingsData.data : [buildingsData.data];
                        const match = list.find((b: { code: string }) => b.code.toLowerCase() === buildingCode.toLowerCase());
                        if (match) bid = match.id;
                    }
                }

                if (!bid) return;

                initialFetchDone.current = true;

                const res = await fetch(`${API_URL}/api/buildings/${bid}/readings/latest`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const json = await res.json();
                if (json.success && json.data) {
                    const r = json.data;
                    setSensorData(prev => ({
                        ...prev,
                        voltage_r: r.voltageR ? parseFloat(r.voltageR) : prev.voltage_r,
                        voltage_s: r.voltageS ? parseFloat(r.voltageS) : prev.voltage_s,
                        voltage_t: r.voltageT ? parseFloat(r.voltageT) : prev.voltage_t,
                        current_r: r.currentR ? parseFloat(r.currentR) : prev.current_r,
                        current_s: r.currentS ? parseFloat(r.currentS) : prev.current_s,
                        current_t: r.currentT ? parseFloat(r.currentT) : prev.current_t,
                        power: r.power ? parseFloat(r.power) : prev.power,
                        power_factor: r.powerFactor ? parseFloat(r.powerFactor) : prev.power_factor,
                        frequency: r.frequency ? parseFloat(r.frequency) : prev.frequency,
                        temperature: r.temperature ? parseFloat(r.temperature) : prev.temperature,
                        energy: r.energy ? parseFloat(r.energy) : prev.energy,
                        thd_v: r.thdVoltage ? parseFloat(r.thdVoltage) : prev.thd_v,
                        thd_i: r.thdCurrent ? parseFloat(r.thdCurrent) : prev.thd_i,
                    }));
                    setLastUpdate(new Date(r.timestamp));
                }
            } catch (err) {
                console.warn('Could not fetch initial sensor data:', err);
            }
        };

        fetchLatest();
    }, [buildingCode, buildingId]);

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
    const initialFetchDone = useRef(false);

    // Fetch initial data from API so cards aren't blank on refresh
    useEffect(() => {
        if (initialFetchDone.current) return;
        initialFetchDone.current = true;

        const fetchLatest = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await fetch(`${API_URL}/api/buildings-latest-readings`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    setBuildingsData(prev => {
                        const newMap = new Map(prev);
                        for (const item of json.data) {
                            const key = item.buildingCode.toUpperCase();
                            const r = item.reading;
                            newMap.set(key, {
                                buildingCode: key,
                                power: r.power ? parseFloat(r.power) : 0,
                                powerFactor: r.powerFactor ? parseFloat(r.powerFactor) : 0.95,
                                voltage: r.voltageR ? parseFloat(r.voltageR) : 220,
                                current: (r.currentR ? parseFloat(r.currentR) : 0)
                                       + (r.currentS ? parseFloat(r.currentS) : 0)
                                       + (r.currentT ? parseFloat(r.currentT) : 0),
                                status: 'online' as const,
                                lastUpdate: new Date(r.timestamp),
                            });
                        }
                        return newMap;
                    });
                }
            } catch (err) {
                console.warn('Could not fetch initial buildings data:', err);
            }
        };

        fetchLatest();
    }, []);

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
