import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL } from '../../config/api';

interface BuildingProps {
    id: string;
    code: string;  // Building code for MQTT matching
    name: string;
    description: string;
    totalPower: number;
    powerFactor: number;
    status: 'operational' | 'warning' | 'critical' | 'offline';
}

function BuildingCardMenu({ buildingId, buildingName, onDelete }: { buildingId: string; buildingName: string; onDelete: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${buildingName}"? This action cannot be undone.`)) {
            setIsDeleting(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`${API_URL}/api/buildings/${buildingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    alert(`Building "${buildingName}" deleted successfully!`);
                    onDelete();
                } else {
                    alert('Failed to delete building');
                }
            } catch (error) {
                console.error('Error deleting building:', error);
                alert('Error deleting building');
            } finally {
                setIsDeleting(false);
                setIsOpen(false);
            }
        }
    };

    return (
        <div className="absolute top-4 right-4 z-10">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                title="Menu"
            >
                <span className="material-symbols-outlined text-[18px] text-slate-400">more_vert</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-lg shadow-lg z-50 min-w-max">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        {isDeleting ? 'Deleting...' : 'Delete Building'}
                    </button>
                </div>
            )}
        </div>
    );
}

function BuildingCard({ id, name, description, totalPower, powerFactor, status }: BuildingProps) {
    const isOffline = status === 'offline';
    const isCritical = status === 'critical';
    const isWarning = status === 'warning';

    const statusColor = isOffline
        ? 'bg-slate-400'
        : isCritical
            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse'
            : isWarning
                ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse'
                : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';

    const borderColor = isCritical
        ? 'border-red-200 dark:border-red-500/30 hover:border-red-500'
        : isWarning
            ? 'border-orange-200 dark:border-orange-500/30 hover:border-orange-500'
            : 'border-slate-200 dark:border-[#282e39] hover:border-primary dark:hover:border-primary';

    const bgColor = isOffline
        ? 'bg-slate-50 dark:bg-[#161a21] opacity-75 hover:opacity-100'
        : 'bg-white dark:bg-[#1e232e]';

    const statusLabel = isOffline ? 'Offline' : isCritical ? 'Critical' : isWarning ? 'Warning' : 'Operational';
    const statusLabelColor = isOffline
        ? 'text-slate-500 bg-slate-100 dark:bg-slate-800'
        : isCritical
            ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
            : isWarning
                ? 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10'
                : 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10';

    return (
        <div className="relative">
            <BuildingCardMenu
                buildingId={id}
                buildingName={name}
                onDelete={() => {
                    window.location.reload();
                }}
            />
            <Link
                to={`/building/${id}`}
                className={`${bgColor} border ${borderColor} rounded-xl p-5 transition-all cursor-pointer group block hover:shadow-lg`}
            >
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`${isOffline ? 'bg-slate-200 dark:bg-[#282e39]' : 'bg-primary/10'} p-3 rounded-lg`}>
                            <span className="material-symbols-outlined text-[24px] text-primary">apartment</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">{name}</h4>
                            <p className="text-xs text-slate-500 dark:text-[#9ca6ba]">{description || 'No description'}</p>
                        </div>
                    </div>
                    <div className={`size-3 rounded-full ${statusColor}`}></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Load</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{totalPower.toFixed(1)}</span>
                            <span className="text-xs text-slate-500">kW</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">PF</p>
                        <span className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{powerFactor.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusLabelColor}`}>
                        {statusLabel}
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-primary transition-colors flex items-center gap-1">
                        View Details
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                </div>
            </Link>
        </div>
    );
}

interface ZoneData {
    id: string;
    name: string;
    code: string;
    status: 'normal' | 'warning' | 'critical';
    buildings: BuildingProps[];
}

interface BuildingGridProps {
    selectedZone?: string | null;
}

interface BuildingCardWithLiveDataProps extends BuildingProps {
    liveData?: {
        power: number;
        powerFactor: number;
        status: 'online' | 'offline';
    } | null;
}

function BuildingCardWithLiveData({ liveData, ...props }: BuildingCardWithLiveDataProps) {
    // Override with live data if available
    const totalPower = liveData?.power ?? props.totalPower;
    const powerFactor = liveData?.powerFactor ?? props.powerFactor;
    const status = liveData?.status === 'online' ? props.status : props.status;

    return (
        <BuildingCard
            {...props}
            totalPower={totalPower}
            powerFactor={powerFactor}
            status={status}
        />
    );
}

export function BuildingGrid({ selectedZone }: BuildingGridProps) {
    const [zonesData, setZonesData] = useState<ZoneData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { getBuildingData, isConnected, totalPower } = useAllBuildingsSensor();

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/api/campuses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Transform API data to zone-based structure
                const zones: ZoneData[] = [];

                for (const campus of data.data) {
                    if (campus.zones) {
                        for (const zone of campus.zones) {
                            // Fetch buildings for each zone
                            const buildingsRes = await fetch(`${API_URL}/api/zones/${zone.id}/buildings`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            const buildingsData = await buildingsRes.json();

                            const buildings: BuildingProps[] = (buildingsData.data || []).map((b: {
                                id: string;
                                code: string;
                                name: string;
                                description?: string;
                                status?: string;
                            }) => ({
                                id: b.id,
                                code: b.code || '',
                                name: b.name,
                                description: b.description || '',
                                totalPower: 0, // Will be updated by real-time data
                                powerFactor: 0.95, // Default, will be updated by real-time data
                                status: (b.status as BuildingProps['status']) || 'operational',
                            }));

                            if (buildings.length > 0 || zone.buildings?.length > 0) {
                                zones.push({
                                    id: zone.id,
                                    name: zone.name,
                                    code: zone.code,
                                    status: 'normal',
                                    buildings: buildings.length > 0 ? buildings : (zone.buildings || []).map((b: {
                                        id: string;
                                        code: string;
                                        name: string;
                                        description?: string;
                                        status?: string;
                                    }) => ({
                                        id: b.id,
                                        code: b.code || '',
                                        name: b.name,
                                        description: b.description || '',
                                        totalPower: 0,
                                        powerFactor: 0.95,
                                        status: (b.status as BuildingProps['status']) || 'operational',
                                    })),
                                });
                            }
                        }
                    }
                }

                // Sort zones by code (A, B, C, etc.)
                zones.sort((a, b) => a.code.localeCompare(b.code));
                setZonesData(zones);
            }
        } catch (err) {
            console.error('Failed to fetch buildings:', err);
            setError('Failed to load buildings');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredZones = selectedZone
        ? zonesData.filter(z => z.code === selectedZone)
        : zonesData;

    const totalBuildings = filteredZones.reduce((acc, zone) => acc + zone.buildings.length, 0);

    if (isLoading) {
        return (
            <div className="xl:col-span-2 flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                    <p className="text-slate-500">Loading buildings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="xl:col-span-2 flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="material-symbols-outlined text-red-500 text-[32px]">error</span>
                    <p className="text-red-500">{error}</p>
                    <button
                        onClick={fetchBuildings}
                        className="text-sm text-primary hover:underline"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (totalBuildings === 0) {
        return (
            <div className="xl:col-span-2 flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="material-symbols-outlined text-slate-400 text-[48px]">apartment</span>
                    <p className="text-slate-500">No buildings found</p>
                    <p className="text-xs text-slate-400">Add a new building to get started</p>
                </div>
            </div>
        );
    }

    return (
        <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Buildings ({totalBuildings})
                    </h3>
                    {isConnected && (
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Live
                        </span>
                    )}
                    {totalPower > 0 && (
                        <span className="text-sm text-slate-500">
                            Total: <span className="font-bold text-slate-700 dark:text-white">{totalPower.toFixed(1)} kW</span>
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchBuildings}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                        title="Refresh"
                    >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">refresh</span>
                    </button>
                    <select className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] text-xs rounded px-2 py-1 text-slate-600 dark:text-[#9ca6ba]">
                        <option>Sort by: Name</option>
                        <option>Sort by: Load</option>
                        <option>Sort by: Status</option>
                    </select>
                </div>
            </div>

            {filteredZones.map((zone) => (
                <div key={zone.id} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full ${zone.status === 'critical' ? 'bg-red-500' : zone.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{zone.name}</h4>
                        <span className="text-xs text-slate-400">({zone.buildings.length} buildings)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zone.buildings.map((building) => {
                            // Get live data for this building using its code
                            const liveData = getBuildingData(building.code);
                            return (
                                <BuildingCardWithLiveData
                                    key={building.id}
                                    {...building}
                                    liveData={liveData}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
