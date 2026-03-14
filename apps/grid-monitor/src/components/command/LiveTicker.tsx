
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket, useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';

export function LiveTicker() {
    const { socket, isConnected } = useSocket();
    const { totalPower, avgPowerFactor, buildingCount } = useAllBuildingsSensor();
    const [avgFrequency, setAvgFrequency] = useState(0);
    const [activeAlarms, setActiveAlarms] = useState(0);
    const frequencyMap = useRef<Map<string, number>>(new Map());
    const prevTotalPower = useRef(0);
    const prevPowerFactor = useRef(0);

    // Track frequency from sensor events (not in useAllBuildingsSensor)
    useEffect(() => {
        if (!socket) return;
        const handler = (data: { buildingCode: string; parameter: string; value: number }) => {
            if (data.parameter === 'frequency') {
                frequencyMap.current.set(data.buildingCode.toUpperCase(), data.value);
                const vals = Array.from(frequencyMap.current.values());
                if (vals.length > 0) {
                    setAvgFrequency(vals.reduce((s, v) => s + v, 0) / vals.length);
                }
            }
        };
        socket.on('sensor:parameter', handler);
        return () => { socket.off('sensor:parameter', handler); };
    }, [socket]);

    // Seed frequency from buildingsData initial fetch
    useEffect(() => {
        // Also try to get frequency from API initial data
        const fetchInitialFrequency = async () => {
            try {
                const res = await fetch(`${API_URL}/api/buildings-latest-readings`, {
                    headers: getAuthHeaders(),
                });
                const json = await res.json();
                if (json.success && Array.isArray(json.data)) {
                    for (const item of json.data) {
                        const freq = item.reading?.frequency ? parseFloat(item.reading.frequency) : 0;
                        if (freq > 0) {
                            frequencyMap.current.set(item.buildingCode.toUpperCase(), freq);
                        }
                    }
                    const vals = Array.from(frequencyMap.current.values());
                    if (vals.length > 0) {
                        setAvgFrequency(vals.reduce((s, v) => s + v, 0) / vals.length);
                    }
                }
            } catch { /* silent */ }
        };
        fetchInitialFrequency();
    }, []);

    // Fetch active alarm count
    const fetchAlarms = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/alerts/counts`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (json.success) {
                const counts = json.data;
                const total = Object.values(counts as Record<string, number>).reduce((s: number, v) => s + (v as number), 0);
                setActiveAlarms(total);
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchAlarms();
        const interval = setInterval(fetchAlarms, 15000);
        return () => clearInterval(interval);
    }, [fetchAlarms]);

    // Listen for new alerts via socket
    useEffect(() => {
        if (!socket) return;
        const handler = () => fetchAlarms();
        socket.on('alert:new', handler);
        return () => { socket.off('alert:new', handler); };
    }, [socket, fetchAlarms]);

    // Compute changes
    const powerChange = prevTotalPower.current > 0
        ? ((totalPower - prevTotalPower.current) / prevTotalPower.current * 100)
        : 0;
    const pfChange = prevPowerFactor.current > 0
        ? ((avgPowerFactor - prevPowerFactor.current) / prevPowerFactor.current * 100)
        : 0;

    // Store previous values for change calculation
    useEffect(() => {
        if (totalPower > 0) prevTotalPower.current = totalPower;
        if (avgPowerFactor > 0) prevPowerFactor.current = avgPowerFactor;
    }, [totalPower, avgPowerFactor]);

    const formatChange = (change: number) => {
        if (change > 0.1) return { text: `${change.toFixed(1)}%`, icon: 'arrow_drop_up', cls: 'text-success' };
        if (change < -0.1) return { text: `${Math.abs(change).toFixed(1)}%`, icon: 'arrow_drop_down', cls: 'text-warning' };
        return { text: '0.0%', icon: 'remove', cls: 'text-slate-500' };
    };

    // Display values
    const gridLoadValue = totalPower > 1000 ? (totalPower / 1000).toFixed(2) : totalPower.toFixed(1);
    const gridLoadUnit = totalPower > 1000 ? 'MW' : 'kW';
    const gl = formatChange(powerChange);
    const pf = formatChange(pfChange);

    return (
        <div className="bg-white dark:bg-surface-darker border-b border-slate-200 dark:border-slate-800 h-14 shrink-0 flex items-center px-6 gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 pr-6 border-r border-slate-200 dark:border-slate-800 shrink-0">
                <div className={`size-2 rounded-full ${isConnected ? 'bg-success live-indicator' : 'bg-slate-500'}`}></div>
                <span className={`text-xs font-bold tracking-wider uppercase ${isConnected ? 'text-success' : 'text-slate-500'}`}>
                    {isConnected ? 'Live Feed' : 'Connecting...'}
                </span>
                {buildingCount > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">{buildingCount} sensors</span>
                )}
            </div>
            <div className="flex items-center gap-12 min-w-max">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Grid Load</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{gridLoadValue} {gridLoadUnit}</span>
                    <span className={`text-xs font-bold ${gl.cls} flex items-center`}>
                        <span className="material-symbols-outlined text-[14px]">{gl.icon}</span> {gl.text}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Frequency</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{avgFrequency > 0 ? avgFrequency.toFixed(2) : '--'} Hz</span>
                    <span className={`text-xs font-bold ${avgFrequency >= 49.5 && avgFrequency <= 50.5 ? 'text-success' : avgFrequency > 0 ? 'text-warning' : 'text-slate-500'} flex items-center`}>
                        <span className="material-symbols-outlined text-[14px]">{avgFrequency >= 49.5 && avgFrequency <= 50.5 ? 'check_circle' : avgFrequency > 0 ? 'warning' : 'remove'}</span>
                        {avgFrequency > 0 ? (avgFrequency >= 49.5 && avgFrequency <= 50.5 ? ' Stable' : ' Deviation') : ' 0.0%'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Power Factor</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{avgPowerFactor > 0 ? avgPowerFactor.toFixed(2) : '--'}</span>
                    <span className={`text-xs font-bold ${pf.cls} flex items-center`}>
                        <span className="material-symbols-outlined text-[14px]">{pf.icon}</span> {pf.text}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Active Alarms</span>
                    <span className={`text-lg font-mono font-bold ${activeAlarms > 0 ? 'text-danger' : 'text-success'}`}>{activeAlarms}</span>
                    {activeAlarms > 0 && (
                        <span className="text-xs font-bold text-danger flex items-center">
                            <span className="material-symbols-outlined text-[14px]">priority_high</span> ACTIVE
                        </span>
                    )}
                </div>
            </div>
            <style>{`
        @keyframes pulse-dot {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .live-indicator {
            animation: pulse-dot 2s infinite;
        }
      `}</style>
        </div>
    );
}
