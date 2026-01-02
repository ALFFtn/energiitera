import { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';

interface Zone {
    id: string;
    code: string;
    name: string;
    buildingCount: number;
    status: 'normal' | 'warning' | 'critical';
}

interface MonitoringSidebarProps {
    selectedZone: string | null;
    onZoneSelect: (zoneCode: string | null) => void;
}

export function MonitoringSidebar({ selectedZone, onZoneSelect }: MonitoringSidebarProps) {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/campuses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                const allZones: Zone[] = [];
                for (const campus of data.data) {
                    if (campus.zones) {
                        for (const zone of campus.zones) {
                            allZones.push({
                                id: zone.id,
                                code: zone.code,
                                name: zone.name,
                                buildingCount: zone.buildings?.length || 0,
                                status: zone.status || 'normal',
                            });
                        }
                    }
                }
                setZones(allZones);
            }
        } catch (err) {
            console.error('Failed to fetch zones:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const statusColors: Record<string, string> = {
        normal: 'bg-green-500',
        warning: 'bg-yellow-500',
        critical: 'bg-red-500',
    };

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111318] border-r border-slate-200 dark:border-[#282e39] overflow-y-auto shrink-0 transition-colors">
            <div className="p-4">
                <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">Campus Monitor</h1>
                    <p className="text-slate-500 dark:text-[#9ca6ba] text-xs">Building Zones</p>
                </div>
                <nav className="flex flex-col gap-1">
                    <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Zones</div>

                    {/* All Zones Option */}
                    <button
                        onClick={() => onZoneSelect(null)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${selectedZone === null
                            ? 'bg-primary/10 text-primary dark:text-white dark:bg-[#282e39]'
                            : 'text-slate-600 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#1e232e]'
                            }`}
                    >
                        <div className="size-2.5 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">All Zones</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                            {zones.reduce((acc, z) => acc + z.buildingCount, 0)}
                        </span>
                    </button>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <span className="material-symbols-outlined animate-spin text-slate-400 text-[20px]">progress_activity</span>
                        </div>
                    ) : (
                        zones.map((zone) => (
                            <button
                                key={zone.id}
                                onClick={() => onZoneSelect(zone.code)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-left ${selectedZone === zone.code
                                    ? 'bg-primary/10 text-primary dark:text-white dark:bg-[#282e39]'
                                    : 'text-slate-600 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#1e232e]'
                                    }`}
                            >
                                <div className={`size-2.5 rounded-full ${statusColors[zone.status] || 'bg-green-500'}`}></div>
                                <span className="text-sm font-medium">{zone.name}</span>
                                <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                                    {zone.buildingCount}
                                </span>
                            </button>
                        ))
                    )}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-[#282e39]">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-[#1e232e]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500">cloud_done</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium dark:text-white">System Online</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Ping: 12ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
