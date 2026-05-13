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

function parseMaybeNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') return undefined;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

// If incoming value is 0 or undefined, keep the previous non-zero value
function nonZero(next: number | undefined, prev: number): number {
    return (next !== undefined && next !== 0) ? next : prev;
}

function getBuildingSensorCacheKey(buildingId?: string, buildingCode?: string): string | null {
    if (buildingId) return `building-sensor:${buildingId}`;
    if (buildingCode) return `building-sensor:${buildingCode.toLowerCase()}`;
    return null;
}

function normalizeSensorReadings(readings: Record<string, unknown>): Partial<SensorData> {
    return {
        voltage_r: parseMaybeNumber(readings.voltage_r ?? readings.voltageR),
        voltage_s: parseMaybeNumber(readings.voltage_s ?? readings.voltageS),
        voltage_t: parseMaybeNumber(readings.voltage_t ?? readings.voltageT),
        current_r: parseMaybeNumber(readings.current_r ?? readings.currentR),
        current_s: parseMaybeNumber(readings.current_s ?? readings.currentS),
        current_t: parseMaybeNumber(readings.current_t ?? readings.currentT),
        power: parseMaybeNumber(readings.power),
        power_factor: parseMaybeNumber(readings.power_factor ?? readings.powerFactor),
        frequency: parseMaybeNumber(readings.frequency),
        temperature: parseMaybeNumber(readings.temperature),
        energy: parseMaybeNumber(readings.energy),
        thd_v: parseMaybeNumber(readings.thd_v ?? readings.thdVoltage),
        thd_i: parseMaybeNumber(readings.thd_i ?? readings.thdCurrent),
    };
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

    // Hydrate from local cache first so values don't flash to zero after page refresh.
    useEffect(() => {
        const cacheKey = getBuildingSensorCacheKey(buildingId, buildingCode);
        if (!cacheKey) return;

        try {
            const raw = localStorage.getItem(cacheKey);
            if (!raw) return;
            const parsed = JSON.parse(raw) as { sensorData?: Partial<SensorData>; lastUpdate?: string };
            if (parsed.sensorData) {
                setSensorData(prev => ({ ...prev, ...parsed.sensorData }));
            }
            if (parsed.lastUpdate) {
                setLastUpdate(new Date(parsed.lastUpdate));
            }
        } catch {
            // Ignore cache parse failures and continue with live/API data.
        }
    }, [buildingId, buildingCode]);

    // Fetch initial data from API so the page isn't blank on load/refresh
    useEffect(() => {
        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;

        const fetchLatest = async (attempt: number = 1) => {
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

                if (!bid || cancelled) return;

                const res = await fetch(`${API_URL}/api/buildings/${bid}/readings/latest`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!res.ok) {
                    throw new Error(`Failed latest reading request (${res.status})`);
                }
                const json = await res.json();
                if (json.success && json.data) {
                    const r = json.data;
                    const normalized = normalizeSensorReadings(r as Record<string, unknown>);
                    setSensorData(prev => ({
                        ...prev,
                        voltage_r: nonZero(normalized.voltage_r, prev.voltage_r ?? 0),
                        voltage_s: nonZero(normalized.voltage_s, prev.voltage_s ?? 0),
                        voltage_t: nonZero(normalized.voltage_t, prev.voltage_t ?? 0),
                        current_r: nonZero(normalized.current_r, prev.current_r ?? 0),
                        current_s: nonZero(normalized.current_s, prev.current_s ?? 0),
                        current_t: nonZero(normalized.current_t, prev.current_t ?? 0),
                        power: nonZero(normalized.power, prev.power ?? 0),
                        power_factor: nonZero(normalized.power_factor, prev.power_factor ?? 0),
                        frequency: nonZero(normalized.frequency, prev.frequency ?? 50),
                        temperature: nonZero(normalized.temperature, prev.temperature ?? 0),
                        energy: nonZero(normalized.energy, prev.energy ?? 0),
                        thd_v: nonZero(normalized.thd_v, prev.thd_v ?? 0),
                        thd_i: nonZero(normalized.thd_i, prev.thd_i ?? 0),
                    }));
                    setLastUpdate(new Date(r.timestamp));
                } else {
                    throw new Error('Latest reading not available yet');
                }
            } catch (err) {
                if (attempt < 3 && !cancelled) {
                    retryTimer = setTimeout(() => fetchLatest(attempt + 1), 1000 * attempt);
                    return;
                }
                console.warn('Could not fetch initial sensor data:', err);
            }
        };

        fetchLatest();

        return () => {
            cancelled = true;
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [buildingCode, buildingId]);

    useEffect(() => {
        const cacheKey = getBuildingSensorCacheKey(buildingId, buildingCode);
        if (!cacheKey) return;

        try {
            localStorage.setItem(cacheKey, JSON.stringify({
                sensorData,
                lastUpdate: lastUpdate?.toISOString(),
            }));
        } catch {
            // Ignore quota/storage errors.
        }
    }, [buildingId, buildingCode, sensorData, lastUpdate]);

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

            const nextValue = parseMaybeNumber(data.value);
            if (nextValue === undefined) return;

            setSensorData(prev => {
                const prevValue = (prev[data.parameter as keyof SensorData] as number) ?? 0;
                return {
                    ...prev,
                    [data.parameter]: nonZero(nextValue, prevValue),
                };
            });
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
                const normalized = normalizeSensorReadings(data.readings as Record<string, unknown>);
                setSensorData(prev => ({
                    ...prev,
                    voltage_r: nonZero(normalized.voltage_r, prev.voltage_r ?? 0),
                    voltage_s: nonZero(normalized.voltage_s, prev.voltage_s ?? 0),
                    voltage_t: nonZero(normalized.voltage_t, prev.voltage_t ?? 0),
                    current_r: nonZero(normalized.current_r, prev.current_r ?? 0),
                    current_s: nonZero(normalized.current_s, prev.current_s ?? 0),
                    current_t: nonZero(normalized.current_t, prev.current_t ?? 0),
                    power: nonZero(normalized.power, prev.power ?? 0),
                    power_factor: nonZero(normalized.power_factor, prev.power_factor ?? 0),
                    frequency: nonZero(normalized.frequency, prev.frequency ?? 50),
                    temperature: nonZero(normalized.temperature, prev.temperature ?? 0),
                    energy: nonZero(normalized.energy, prev.energy ?? 0),
                    thd_v: nonZero(normalized.thd_v, prev.thd_v ?? 0),
                    thd_i: nonZero(normalized.thd_i, prev.thd_i ?? 0),
                }));
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
