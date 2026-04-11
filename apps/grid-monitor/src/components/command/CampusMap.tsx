import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';
import { useAuth } from '../common/AuthGuard';

interface MapBuilding {
    id: string;
    code: string;
    name: string;
    status: 'operational' | 'warning' | 'critical' | 'offline';
    zoneName?: string;
    zoneCode?: string;
    campusName?: string;
    campusLocation?: string;
}

interface ZoneSummary {
    id: string;
    code: string;
    name: string;
    campusName: string;
    buildingCount: number;
    totalPower: number;
    avgPowerFactor: number;
    statusCounts: Record<MapBuilding['status'], number>;
}

interface LiveBuilding extends MapBuilding {
    liveStatus: MapBuilding['status'];
    power: number;
    powerFactor: number;
    isLive: boolean;
}

const statusPalette: Record<MapBuilding['status'], { dot: string; bg: string; border: string }> = {
    operational: { dot: '#20c997', bg: 'rgba(32, 201, 151, 0.10)', border: 'rgba(32, 201, 151, 0.28)' },
    warning: { dot: '#f59e0b', bg: 'rgba(245, 158, 11, 0.10)', border: 'rgba(245, 158, 11, 0.28)' },
    critical: { dot: '#ff5252', bg: 'rgba(255, 82, 82, 0.12)', border: 'rgba(255, 82, 82, 0.30)' },
    offline: { dot: '#8aa2c9', bg: 'rgba(138, 162, 201, 0.08)', border: 'rgba(138, 162, 201, 0.22)' },
};

export function CampusMap() {
    const [buildings, setBuildings] = useState<MapBuilding[]>([]);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { getBuildingData, isConnected, totalPower } = useAllBuildingsSensor();

    const handleBuildingClick = useCallback((buildingId: string) => {
        if (isAuthenticated) {
            navigate(`/building/${buildingId}`);
            return;
        }

        navigate('/login', { state: { from: { pathname: `/building/${buildingId}` } } });
    }, [isAuthenticated, navigate]);

    const fetchBuildingData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/campuses`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (!json.success) return;

            const allBuildings: MapBuilding[] = [];
            for (const campus of json.data) {
                for (const zone of campus.zones || []) {
                    for (const building of zone.buildings || []) {
                        allBuildings.push({
                            id: building.id,
                            code: building.code || '',
                            name: building.name,
                            status: building.status || 'operational',
                            zoneName: zone.name,
                            zoneCode: zone.code,
                            campusName: campus.name,
                            campusLocation: campus.location,
                        });
                    }
                }
            }

            setBuildings(allBuildings);
        } catch {
            // Keep the previous snapshot on fetch failure.
        }
    }, []);

    useEffect(() => {
        fetchBuildingData();
        const interval = setInterval(fetchBuildingData, 15000);
        return () => clearInterval(interval);
    }, [fetchBuildingData]);

    const resolveStatus = useCallback((building: MapBuilding): MapBuilding['status'] => {
        const live = getBuildingData(building.code);
        if (!live) return building.status;
        if (live.status === 'offline') return 'offline';
        if (live.powerFactor > 0 && live.powerFactor < 0.7) return 'critical';
        if (live.powerFactor > 0 && live.powerFactor < 0.85) return 'warning';
        return building.status;
    }, [getBuildingData]);

    const liveBuildings: LiveBuilding[] = buildings.map((building) => {
        const live = getBuildingData(building.code);
        return {
            ...building,
            liveStatus: resolveStatus(building),
            power: live?.power ?? 0,
            powerFactor: live?.powerFactor ?? 0,
            isLive: Boolean(live),
        };
    });

    const statusCounts = liveBuildings.reduce(
        (acc, building) => {
            acc[building.liveStatus] += 1;
            return acc;
        },
        { operational: 0, warning: 0, critical: 0, offline: 0 } as Record<MapBuilding['status'], number>
    );

    const zoneSummaries = liveBuildings.reduce((acc, building) => {
        const zoneKey = `${building.zoneCode || 'NA'}-${building.zoneName || 'Unknown Zone'}`;
        const existing = acc.get(zoneKey) || {
            id: zoneKey,
            code: building.zoneCode || 'NA',
            name: building.zoneName || 'Unknown Zone',
            campusName: building.campusName || 'Unknown Campus',
            buildingCount: 0,
            totalPower: 0,
            avgPowerFactor: 0,
            statusCounts: { operational: 0, warning: 0, critical: 0, offline: 0 },
            _powerFactorSum: 0,
            _powerFactorCount: 0,
        } as ZoneSummary & { _powerFactorSum: number; _powerFactorCount: number };

        existing.buildingCount += 1;
        existing.totalPower += building.power;
        existing.statusCounts[building.liveStatus] += 1;

        if (building.powerFactor > 0) {
            existing._powerFactorSum += building.powerFactor;
            existing._powerFactorCount += 1;
        }

        acc.set(zoneKey, existing);
        return acc;
    }, new Map<string, ZoneSummary & { _powerFactorSum: number; _powerFactorCount: number }>());

    const zones = Array.from(zoneSummaries.values())
        .map((zone) => ({
            id: zone.id,
            code: zone.code,
            name: zone.name,
            campusName: zone.campusName,
            buildingCount: zone.buildingCount,
            totalPower: zone.totalPower,
            avgPowerFactor: zone._powerFactorCount > 0 ? zone._powerFactorSum / zone._powerFactorCount : 0,
            statusCounts: zone.statusCounts,
        }))
        .sort((a, b) => b.totalPower - a.totalPower);

    const topBuildings = [...liveBuildings]
        .sort((a, b) => b.power - a.power)
        .slice(0, 6);

    const totalBuildings = liveBuildings.length;
    const liveCount = liveBuildings.filter((building) => building.isLive).length;
    const avgPowerFactorReadings = liveBuildings.filter((building) => building.powerFactor > 0);
    const avgPowerFactor = avgPowerFactorReadings.length > 0
        ? avgPowerFactorReadings.reduce((sum, building) => sum + building.powerFactor, 0) / avgPowerFactorReadings.length
        : 0;

    const formatPower = (power: number) => {
        if (power >= 1000) {
            return `${(power / 1000).toFixed(2)} MW`;
        }

        return `${power.toFixed(1)} kW`;
    };

    return (
        <div className="bg-[#040f2c] rounded-lg border border-[#173160] relative overflow-hidden shadow-[inset_0_0_0_1px_rgba(23,49,96,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(15,47,109,0.28)_0%,rgba(4,15,44,0)_40%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.12)_0%,rgba(4,15,44,0)_30%)] pointer-events-none"></div>

            <div className="relative z-10 p-4 md:p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#9cb5de] text-[17px]">domain</span>
                            <span className="text-xs font-semibold text-[#d9e6ff] uppercase tracking-wider">Fleet Overview</span>
                            {isConnected && (
                                <span className="ml-1 flex items-center gap-1 text-[10px] text-[#20c997] font-semibold">
                                    <span className="size-1.5 rounded-full bg-[#20c997] animate-pulse"></span>
                                    Live
                                </span>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-[#9db4da] max-w-2xl">
                            Ringkasan gabungan seluruh bangunan, termasuk total beban, status realtime, dan zona yang paling aktif.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:min-w-[520px]">
                        <div className="rounded-lg border border-[#355089]/60 bg-[#0b1b47]/80 px-3 py-2">
                            <p className="text-[10px] uppercase text-[#8aa2c9] font-semibold">Buildings</p>
                            <p className="text-xl font-mono font-bold text-[#f2f7ff]">{totalBuildings}</p>
                        </div>
                        <div className="rounded-lg border border-[#355089]/60 bg-[#0b1b47]/80 px-3 py-2">
                            <p className="text-[10px] uppercase text-[#8aa2c9] font-semibold">Total Load</p>
                            <p className="text-xl font-mono font-bold text-[#f2f7ff]">{formatPower(totalPower)}</p>
                        </div>
                        <div className="rounded-lg border border-[#355089]/60 bg-[#0b1b47]/80 px-3 py-2">
                            <p className="text-[10px] uppercase text-[#8aa2c9] font-semibold">Avg PF</p>
                            <p className="text-xl font-mono font-bold text-[#f2f7ff]">{avgPowerFactor > 0 ? avgPowerFactor.toFixed(2) : '--'}</p>
                        </div>
                        <div className="rounded-lg border border-[#355089]/60 bg-[#0b1b47]/80 px-3 py-2">
                            <p className="text-[10px] uppercase text-[#8aa2c9] font-semibold">Live</p>
                            <p className="text-xl font-mono font-bold text-[#f2f7ff]">{liveCount}/{totalBuildings}</p>
                        </div>
                        <div className="rounded-lg border border-[#355089]/60 bg-[#0b1b47]/80 px-3 py-2 sm:col-span-4">
                            <p className="text-[10px] uppercase text-[#8aa2c9] font-semibold">Status Mix</p>
                            <p className="text-sm font-semibold text-[#f2f7ff] mt-0.5">
                                OK {statusCounts.operational} · Warn {statusCounts.warning} · Crit {statusCounts.critical} · Off {statusCounts.offline}
                            </p>
                        </div>
                    </div>
                </div>

                {buildings.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#355089]/70 bg-[#081735]/70 px-4 py-10 text-center text-[#9db4da]">
                        Loading building information...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <section className="rounded-xl border border-[#355089]/60 bg-[#081735]/75 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d9e6ff] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">layers</span>
                                    Zone Breakdown
                                </h3>
                                <span className="text-[10px] text-[#8aa2c9]">Campus + zone aggregation</span>
                            </div>

                            <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
                                {zones.map((zone) => {
                                    const hasIssue = zone.statusCounts.critical > 0 || zone.statusCounts.warning > 0;
                                    const tone: MapBuilding['status'] = hasIssue ? (zone.statusCounts.critical > 0 ? 'critical' : 'warning') : 'operational';
                                    const palette = statusPalette[tone];

                                    return (
                                        <button
                                            key={zone.id}
                                            type="button"
                                            onClick={() => navigate('/monitoring')}
                                            className="w-full text-left rounded-lg border px-3 py-3 transition-colors hover:brightness-110"
                                            style={{ background: palette.bg, borderColor: palette.border }}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="size-2 rounded-full" style={{ backgroundColor: palette.dot }}></span>
                                                        <p className="text-sm font-semibold text-[#f3f8ff]">{zone.name}</p>
                                                    </div>
                                                    <p className="text-[10px] text-[#94afd8] mt-1">{zone.campusName} • {zone.buildingCount} buildings • Zone {zone.code}</p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-sm font-mono font-bold text-[#f3f8ff]">{formatPower(zone.totalPower)}</p>
                                                    <p className="text-[10px] text-[#9cb5de]">PF {zone.avgPowerFactor > 0 ? zone.avgPowerFactor.toFixed(2) : '--'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center gap-2 text-[10px] text-[#cddcf4] flex-wrap">
                                                <span className="rounded-full bg-[#0b1b47]/75 px-2 py-0.5">OK {zone.statusCounts.operational}</span>
                                                <span className="rounded-full bg-[#0b1b47]/75 px-2 py-0.5">Warn {zone.statusCounts.warning}</span>
                                                <span className="rounded-full bg-[#0b1b47]/75 px-2 py-0.5">Crit {zone.statusCounts.critical}</span>
                                                <span className="rounded-full bg-[#0b1b47]/75 px-2 py-0.5">Off {zone.statusCounts.offline}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="rounded-xl border border-[#355089]/60 bg-[#081735]/75 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d9e6ff] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">electric_meter</span>
                                    Top Buildings
                                </h3>
                                <span className="text-[10px] text-[#8aa2c9]">Sorted by realtime power</span>
                            </div>

                            <div className="space-y-2.5 max-h-[330px] overflow-y-auto pr-1">
                                {topBuildings.map((building) => {
                                    const palette = statusPalette[building.liveStatus];

                                    return (
                                        <button
                                            key={building.id}
                                            type="button"
                                            onClick={() => handleBuildingClick(building.id)}
                                            className="w-full text-left rounded-lg border px-3 py-3 transition-colors hover:brightness-110"
                                            style={{ background: palette.bg, borderColor: palette.border }}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="size-2 rounded-full mt-1.5" style={{ backgroundColor: palette.dot }}></span>
                                                        <p className="text-sm font-semibold text-[#f3f8ff] truncate">{building.code} • {building.name}</p>
                                                    </div>
                                                    <p className="text-[10px] text-[#94afd8] mt-1 truncate">{building.campusName} • {building.zoneName}</p>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-mono font-bold text-[#f3f8ff]">{formatPower(building.power)}</p>
                                                    <p className="text-[10px] text-[#9cb5de]">PF {building.powerFactor > 0 ? building.powerFactor.toFixed(2) : '--'}</p>
                                                </div>
                                            </div>

                                            <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-[#cddcf4]">
                                                <span className="rounded-full bg-[#0b1b47]/75 px-2 py-0.5 uppercase">{building.liveStatus}</span>
                                                <span className="text-[#8aa2c9]">Open detail</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#355089]/55 bg-[#0b1b47]/70 px-3 py-2 text-[10px] text-[#9db4da]">
                    <span className="flex items-center gap-2 flex-wrap">
                        <span className="size-2 rounded-full bg-[#20c997]"></span>
                        Operational
                        <span className="size-2 rounded-full bg-[#f59e0b] ml-2"></span>
                        Warning
                        <span className="size-2 rounded-full bg-[#ff5252] ml-2"></span>
                        Critical
                        <span className="size-2 rounded-full bg-[#8aa2c9] ml-2"></span>
                        Offline
                    </span>

                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">touch_app</span>
                        Klik building untuk buka detail
                    </span>
                </div>
            </div>
        </div>
    );
}
