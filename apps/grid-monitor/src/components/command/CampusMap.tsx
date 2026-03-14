import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';

interface MapBuilding {
    id: string;
    code: string;
    name: string;
    status: 'operational' | 'warning' | 'critical' | 'offline';
    mapCoordinates?: { x: number; y: number; width: number; height: number } | null;
    zoneName?: string;
    zoneCode?: string;
}

const layoutSlots = [
    { x: 120, y: 260, width: 120, height: 88 },
    { x: 340, y: 130, width: 140, height: 88 },
    { x: 580, y: 150, width: 180, height: 94 },
    { x: 340, y: 370, width: 180, height: 94 },
    { x: 660, y: 340, width: 160, height: 100 },
    { x: 130, y: 105, width: 130, height: 84 },
    { x: 560, y: 430, width: 150, height: 90 },
    { x: 760, y: 100, width: 130, height: 84 },
];

const statusPalette: Record<MapBuilding['status'], { stroke: string; dot: string; label: string; pulse: boolean }> = {
    operational: { stroke: '#64748b', dot: '#20c997', label: '#8fa2bf', pulse: false },
    warning: { stroke: '#f59e0b', dot: '#fbbf24', label: '#f59e0b', pulse: true },
    critical: { stroke: '#ef4444', dot: '#ff5252', label: '#ff5252', pulse: true },
    offline: { stroke: '#475569', dot: '#64748b', label: '#7a8da8', pulse: false },
};

export function CampusMap() {
    const [buildings, setBuildings] = useState<MapBuilding[]>([]);
    const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
    const navigate = useNavigate();
    const { getBuildingData, isConnected, totalPower } = useAllBuildingsSensor();

    const getPos = useCallback((building: MapBuilding, i: number) => {
        if (building.mapCoordinates) {
            return {
                x: (building.mapCoordinates.x / 500) * 1000,
                y: (building.mapCoordinates.y / 350) * 620,
                width: (building.mapCoordinates.width / 500) * 1000,
                height: (building.mapCoordinates.height / 350) * 620,
            };
        }
        return layoutSlots[i % layoutSlots.length];
    }, []);

    const fetchMapData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/campuses`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (!json.success) return;

            const allBuildings: MapBuilding[] = [];
            for (const campus of json.data) {
                for (const zone of campus.zones || []) {
                    for (const b of zone.buildings || []) {
                        allBuildings.push({
                            id: b.id,
                            code: b.code || '',
                            name: b.name,
                            status: b.status || 'operational',
                            mapCoordinates: b.mapCoordinates || null,
                            zoneName: zone.name,
                            zoneCode: zone.code,
                        });
                    }
                }
            }
            setBuildings(allBuildings);
        } catch {
            // Keep stale data when request fails.
        }
    }, []);

    useEffect(() => {
        fetchMapData();
        const interval = setInterval(fetchMapData, 15000);
        return () => clearInterval(interval);
    }, [fetchMapData]);

    const getBuildingStatus = (building: MapBuilding): MapBuilding['status'] => {
        const live = getBuildingData(building.code);
        if (!live) return building.status;
        if (live.status === 'offline') return 'offline';
        if (live.powerFactor > 0 && live.powerFactor < 0.7) return 'critical';
        if (live.powerFactor > 0 && live.powerFactor < 0.85) return 'warning';
        return building.status;
    };

    const statusCounts = buildings.reduce(
        (acc, b) => {
            const s = getBuildingStatus(b);
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    return (
        <div className="bg-[#040f2c] rounded-lg border border-[#173160] relative overflow-hidden shadow-[inset_0_0_0_1px_rgba(23,49,96,0.35)]">
            <div className="absolute top-3 left-3 z-10 bg-[#0b1b47]/85 backdrop-blur-sm border border-[#355089]/70 rounded px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#9cb5de] text-[17px]">map</span>
                <span className="text-xs font-semibold text-[#d9e6ff] uppercase tracking-wider">
                    Campus Map View
                    <span className="ml-1 text-[#89a3cf]">Zone A</span>
                </span>
                {isConnected && (
                    <span className="ml-1 flex items-center gap-1 text-[10px] text-[#20c997] font-semibold">
                        <span className="size-1.5 rounded-full bg-[#20c997] animate-pulse"></span>
                        Live
                    </span>
                )}
            </div>

            {buildings.length > 0 && (
                <div className="absolute top-3 right-3 z-10 bg-[#0b1b47]/85 backdrop-blur-sm border border-[#355089]/70 rounded px-2.5 py-1.5 flex items-center gap-3">
                    {totalPower > 0 && (
                        <div className="text-center px-2">
                            <p className="text-xs font-mono font-bold text-[#e8f1ff]">
                                {totalPower > 1000 ? `${(totalPower / 1000).toFixed(1)} MW` : `${totalPower.toFixed(1)} kW`}
                            </p>
                            <p className="text-[9px] uppercase text-[#8aa2c9] font-semibold">Total Load</p>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px]">
                        {(statusCounts.operational || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[#20c997] font-semibold">
                                <span className="size-1.5 rounded-full bg-[#20c997]"></span>
                                {statusCounts.operational}
                            </span>
                        )}
                        {(statusCounts.warning || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[#f59e0b] font-semibold">
                                <span className="size-1.5 rounded-full bg-[#f59e0b]"></span>
                                {statusCounts.warning}
                            </span>
                        )}
                        {(statusCounts.critical || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[#ff5252] font-semibold">
                                <span className="size-1.5 rounded-full bg-[#ff5252]"></span>
                                {statusCounts.critical}
                            </span>
                        )}
                        {(statusCounts.offline || 0) > 0 && (
                            <span className="flex items-center gap-1 text-[#8aa2c9] font-semibold">
                                <span className="size-1.5 rounded-full bg-[#8aa2c9]"></span>
                                {statusCounts.offline}
                            </span>
                        )}
                    </div>
                </div>
            )}

            <div className="absolute bottom-3 left-3 z-10">
                <div className="bg-[#0b1b47]/88 backdrop-blur-sm border border-[#355089]/70 rounded px-3 py-2 text-[10px] text-[#c8d9f4] flex flex-col gap-1.5 min-w-40">
                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#20c997]"></span>Normal</span>
                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#f59e0b]"></span>Warning</span>
                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#ff5252]"></span>Critical</span>
                    <span className="flex items-center gap-2"><span className="size-2 rounded-full bg-[#8aa2c9]"></span>Offline</span>
                </div>
            </div>

            <div className="w-full h-[680px] md:h-[700px] flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#0b2358_0%,#040f2c_55%,#040b1f_100%)]">
                <svg className="w-full h-full" fill="none" viewBox="0 0 1000 620" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
                            <path d="M 46 0 L 0 0 0 46" fill="none" stroke="#1f3b72" strokeOpacity="0.5" strokeWidth="1"></path>
                        </pattern>
                        <pattern id="grid-major" width="230" height="230" patternUnits="userSpaceOnUse">
                            <path d="M 230 0 L 0 0 0 230" fill="none" stroke="#365ea5" strokeOpacity="0.35" strokeWidth="1.2"></path>
                        </pattern>
                    </defs>

                    <rect width="1000" height="620" fill="url(#grid)"></rect>
                    <rect width="1000" height="620" fill="url(#grid-major)"></rect>

                    {buildings.length === 0 ? (
                        <text x="500" y="310" textAnchor="middle" className="fill-[#9bb2d8] text-sm">Loading buildings...</text>
                    ) : (
                        <>
                            {buildings.slice(1).map((building, i) => {
                                const from = getPos(buildings[i], i);
                                const to = getPos(building, i + 1);
                                return (
                                    <line
                                        key={`line-${building.id}`}
                                        x1={from.x + from.width / 2}
                                        y1={from.y + from.height / 2}
                                        x2={to.x + to.width / 2}
                                        y2={to.y + to.height / 2}
                                        stroke="#5d7eb5"
                                        strokeOpacity="0.45"
                                        strokeDasharray="7 7"
                                        strokeWidth="2"
                                    />
                                );
                            })}

                            {buildings.map((building, i) => {
                                const pos = getPos(building, i);
                                const liveStatus = getBuildingStatus(building);
                                const palette = statusPalette[liveStatus];
                                const cx = pos.x + pos.width / 2;
                                const cy = pos.y + pos.height / 2;
                                const live = getBuildingData(building.code);
                                const isHovered = hoveredBuilding === building.id;

                                return (
                                    <g
                                        key={building.id}
                                        className="building-group cursor-pointer"
                                        onClick={() => navigate(`/building/${building.id}`)}
                                        onMouseEnter={() => setHoveredBuilding(building.id)}
                                        onMouseLeave={() => setHoveredBuilding(null)}
                                    >
                                        {liveStatus === 'critical' ? (
                                            <polygon
                                                points={`${pos.x + 16},${pos.y} ${pos.x + pos.width - 16},${pos.y} ${pos.x + pos.width},${pos.y + pos.height} ${pos.x},${pos.y + pos.height}`}
                                                fill="#364762"
                                                stroke={palette.stroke}
                                                strokeWidth="3"
                                            />
                                        ) : (
                                            <rect
                                                className="building-path"
                                                x={pos.x}
                                                y={pos.y}
                                                width={pos.width}
                                                height={pos.height}
                                                fill="#364762"
                                                stroke={palette.stroke}
                                                rx="2"
                                                strokeWidth={liveStatus === 'warning' ? 3 : 2}
                                            />
                                        )}

                                        {liveStatus === 'critical' && (
                                            <circle className="animate-ping opacity-55" cx={cx} cy={cy} r="6" fill="#ff5252" />
                                        )}
                                        <circle
                                            className={palette.pulse ? 'animate-pulse' : ''}
                                            cx={cx}
                                            cy={cy}
                                            r="5"
                                            fill={palette.dot}
                                        />

                                        <text
                                            className="font-mono text-[14px] font-semibold"
                                            textAnchor="middle"
                                            x={cx}
                                            y={pos.y + pos.height + 22}
                                            fill={palette.label}
                                        >
                                            {(building.code || building.name).toUpperCase()}
                                        </text>

                                        {live && live.power > 0 && (
                                            <text
                                                className="text-[11px] font-mono"
                                                textAnchor="middle"
                                                x={cx}
                                                y={cy + 18}
                                                fill="#9fb5da"
                                            >
                                                {live.power.toFixed(1)} kW
                                            </text>
                                        )}

                                        {isHovered && live && (
                                            <g>
                                                <rect
                                                    x={cx + 16}
                                                    y={cy - 35}
                                                    width="130"
                                                    height="56"
                                                    rx="3"
                                                    fill="#081734"
                                                    stroke={liveStatus === 'critical' ? '#ef4444' : liveStatus === 'warning' ? '#f59e0b' : '#365ea5'}
                                                    strokeWidth="1"
                                                    opacity="0.95"
                                                />
                                                <text x={cx + 24} y={cy - 19} className="fill-[#f5f8ff] text-[9px] font-bold">
                                                    {building.name}
                                                </text>
                                                <text x={cx + 24} y={cy - 5} className="fill-[#bacceb] text-[8px] font-mono">
                                                    {live.power.toFixed(1)} kW | PF {live.powerFactor.toFixed(2)}
                                                </text>
                                                <text x={cx + 24} y={cy + 8} className="fill-[#bacceb] text-[8px] font-mono">
                                                    V: {live.voltage.toFixed(0)}V
                                                </text>
                                                <text x={cx + 24} y={cy + 19} className="fill-[#86a3cf] text-[7px] uppercase">
                                                    {building.zoneName || ''}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </>
                    )}
                </svg>
            </div>

            {buildings.length > 0 && (
                <div className="absolute bottom-3 right-3 z-10 bg-[#0b1b47]/70 backdrop-blur-sm rounded px-2 py-1 text-[10px] text-[#9db4da] flex items-center gap-1 border border-[#355089]/60">
                    <span className="material-symbols-outlined text-[12px]">touch_app</span>
                    Klik gedung untuk buka detail
                </div>
            )}

            <style>{`
                .building-path { transition: all 0.25s ease; }
                .building-group:hover .building-path { filter: brightness(1.13); }
            `}</style>
        </div>
    );
}
