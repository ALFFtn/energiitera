import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';

interface Building {
    id: string;
    code: string;
    name: string;
    status: string;
    zone?: { name: string; code: string };
}

interface ZoneSummary {
    id: string;
    name: string;
    code: string;
    buildingCount: number;
    totalPower: number;
    avgPf: number;
    statusCounts: { operational: number; warning: number; critical: number; offline: number };
}

export function BuildingSummary() {
    const { getBuildingData, isConnected, totalPower, avgPowerFactor, buildingCount } = useAllBuildingsSensor();
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [zones, setZones] = useState<ZoneSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBuildings = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/campuses`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (!json.success) return;

            const allBuildings: Building[] = [];
            const zoneSummaries: ZoneSummary[] = [];

            for (const campus of json.data) {
                for (const zone of campus.zones || []) {
                    const zoneBuildings = zone.buildings || [];
                    allBuildings.push(
                        ...zoneBuildings.map((b: Building) => ({
                            ...b,
                            zone: { name: zone.name, code: zone.code },
                        }))
                    );
                    zoneSummaries.push({
                        id: zone.id,
                        name: zone.name,
                        code: zone.code,
                        buildingCount: zoneBuildings.length,
                        totalPower: 0,
                        avgPf: 0,
                        statusCounts: { operational: 0, warning: 0, critical: 0, offline: 0 },
                    });
                }
            }

            setBuildings(allBuildings);
            setZones(zoneSummaries);
        } catch {
            // keep stale
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBuildings();
    }, [fetchBuildings]);

    // Compute live stats per zone
    const liveZones = zones.map(zone => {
        const zoneBuildings = buildings.filter(b => b.zone?.code === zone.code);
        let zonePower = 0;
        let pfSum = 0;
        let pfCount = 0;
        const statusCounts = { operational: 0, warning: 0, critical: 0, offline: 0 };

        for (const b of zoneBuildings) {
            const live = getBuildingData(b.code);
            const power = live?.power ?? 0;
            const pf = live?.powerFactor ?? 0;
            zonePower += power;
            if (pf > 0) { pfSum += pf; pfCount++; }

            const st = (b.status as keyof typeof statusCounts) || 'operational';
            if (st in statusCounts) statusCounts[st]++;
            else statusCounts.operational++;
        }

        return {
            ...zone,
            buildingCount: zoneBuildings.length,
            totalPower: zonePower,
            avgPf: pfCount > 0 ? pfSum / pfCount : 0,
            statusCounts,
        };
    });

    // Top 5 buildings by power
    const topBuildings = [...buildings]
        .map(b => {
            const live = getBuildingData(b.code);
            return { ...b, power: live?.power ?? 0, pf: live?.powerFactor ?? 0, liveStatus: live?.status ?? 'offline' };
        })
        .sort((a, b) => b.power - a.power)
        .slice(0, 5);

    const totalBldgs = buildings.length;
    const onlineCount = buildings.filter(b => getBuildingData(b.code)?.status === 'online').length;
    const offlineCount = totalBldgs - onlineCount;

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <div className="flex items-center justify-center py-8 gap-3">
                    <span className="material-symbols-outlined animate-spin text-primary text-xl">progress_activity</span>
                    <span className="text-sm text-slate-400">Loading building summary...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Fleet Overview Header */}
            <div className="bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">domain</span>
                        <h3 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">PowerGrid Fleet</h3>
                    </div>
                    <Link
                        to="/monitoring"
                        className="text-xs font-semibold text-primary hover:text-blue-400 flex items-center gap-1 transition-colors"
                    >
                        View All
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{totalBldgs}</p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold mt-0.5">Buildings</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {totalPower > 1000 ? `${(totalPower / 1000).toFixed(1)}` : totalPower.toFixed(1)}
                        </p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold mt-0.5">
                            {totalPower > 1000 ? 'Total MW' : 'Total kW'}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <p className={`text-2xl font-mono font-bold ${avgPowerFactor >= 0.9 ? 'text-success' : avgPowerFactor >= 0.8 ? 'text-warning' : 'text-danger'}`}>
                            {avgPowerFactor > 0 ? avgPowerFactor.toFixed(2) : '--'}
                        </p>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold mt-0.5">Avg PF</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                            <span className="flex items-center gap-1">
                                <span className="size-2 rounded-full bg-success"></span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{onlineCount}</span>
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">/</span>
                            <span className="flex items-center gap-1">
                                <span className="size-2 rounded-full bg-slate-400"></span>
                                <span className="text-sm font-bold text-slate-500">{offlineCount}</span>
                            </span>
                        </div>
                        <p className="text-[10px] uppercase text-slate-400 font-semibold mt-0.5">Online / Offline</p>
                    </div>
                </div>
            </div>

            {/* Two-column: Zone breakdown + Top consumers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zone Breakdown */}
                <div className="bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">layers</span>
                        Zone Breakdown
                    </h4>
                    <div className="space-y-2.5">
                        {liveZones.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No zones found</p>
                        ) : (
                            liveZones.map(zone => {
                                const hasIssue = zone.statusCounts.critical > 0 || zone.statusCounts.warning > 0;
                                return (
                                    <Link
                                        key={zone.id}
                                        to={`/monitoring`}
                                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`size-2 rounded-full ${hasIssue ? (zone.statusCounts.critical > 0 ? 'bg-danger animate-pulse' : 'bg-warning animate-pulse') : 'bg-success'}`}></div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{zone.name}</p>
                                                <p className="text-[10px] text-slate-400">{zone.buildingCount} buildings</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">{zone.totalPower.toFixed(1)} kW</p>
                                            {zone.avgPf > 0 && (
                                                <p className={`text-[10px] font-mono ${zone.avgPf >= 0.9 ? 'text-success' : 'text-warning'}`}>
                                                    PF {zone.avgPf.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Power Consumers */}
                <div className="bg-white dark:bg-surface-dark rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">electric_meter</span>
                        Top Consumers
                    </h4>
                    <div className="space-y-2">
                        {topBuildings.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
                        ) : (
                            topBuildings.map((b, idx) => {
                                const maxPower = topBuildings[0]?.power || 1;
                                const pct = maxPower > 0 ? (b.power / maxPower) * 100 : 0;
                                return (
                                    <Link
                                        key={b.id}
                                        to={`/building/${b.id}`}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                    >
                                        <span className="text-xs font-mono font-bold text-slate-400 w-4 text-right">{idx + 1}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{b.name}</p>
                                                <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 ml-2 shrink-0">{b.power.toFixed(1)} kW</span>
                                            </div>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
                                                <div
                                                    className={`h-1 rounded-full transition-all ${idx === 0 ? 'bg-primary' : idx < 3 ? 'bg-primary/60' : 'bg-primary/30'}`}
                                                    style={{ width: `${Math.max(pct, 3)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className={`size-2 rounded-full shrink-0 ${b.liveStatus === 'online' ? 'bg-success' : 'bg-slate-400'}`}></span>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Connection Status Badge */}
            {buildingCount > 0 && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                    <span className={`size-1.5 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-slate-400'}`}></span>
                    {isConnected ? `Real-time · ${buildingCount} sensors active` : 'Connecting to sensors...'}
                </div>
            )}
        </div>
    );
}
