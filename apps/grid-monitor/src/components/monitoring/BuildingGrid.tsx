import { Link } from 'react-router-dom';

interface BuildingProps {
    id: string;
    name: string;
    description: string;
    panelCount: number;
    totalPower: number;
    powerFactor: number;
    status: 'operational' | 'warning' | 'critical' | 'offline';
}

function BuildingCard({ id, name, description, panelCount, totalPower, powerFactor, status }: BuildingProps) {
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
                        <p className="text-xs text-slate-500 dark:text-[#9ca6ba]">{description}</p>
                    </div>
                </div>
                <div className={`size-3 rounded-full ${statusColor}`}></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Panels</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{panelCount}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Load</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-slate-900 dark:text-white">{totalPower}</span>
                        <span className="text-xs text-slate-500">kW</span>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">PF</p>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">{powerFactor.toFixed(2)}</span>
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
    );
}

interface ZoneData {
    name: string;
    code: string;
    status: 'normal' | 'warning' | 'critical';
    buildings: BuildingProps[];
}

// Mock data - will be replaced with API data
const zonesData: ZoneData[] = [
    {
        name: 'Zone A - Research',
        code: 'A',
        status: 'normal',
        buildings: [
            { id: 'eng-quad', name: 'Engineering Quad', description: 'Main engineering facility', panelCount: 8, totalPower: 245, powerFactor: 0.96, status: 'operational' },
            { id: 'science-labs', name: 'Science Labs', description: 'Chemistry & Physics', panelCount: 6, totalPower: 180, powerFactor: 0.88, status: 'critical' },
            { id: 'building-404', name: 'Building 404', description: 'Server Room Wing', panelCount: 12, totalPower: 320, powerFactor: 0.98, status: 'operational' },
        ]
    },
    {
        name: 'Zone B - Admin',
        code: 'B',
        status: 'warning',
        buildings: [
            { id: 'admin-hall', name: 'Admin Hall', description: 'Administrative offices', panelCount: 4, totalPower: 85, powerFactor: 0.94, status: 'operational' },
            { id: 'main-library', name: 'Main Library', description: 'Campus library', panelCount: 5, totalPower: 120, powerFactor: 0.92, status: 'warning' },
        ]
    },
    {
        name: 'Zone C - Dorms',
        code: 'C',
        status: 'normal',
        buildings: [
            { id: 'dorms-west', name: 'Dorms West', description: 'Western dormitory', panelCount: 6, totalPower: 95, powerFactor: 0.91, status: 'operational' },
            { id: 'dorms-east', name: 'Dorms East', description: 'Eastern dormitory', panelCount: 6, totalPower: 88, powerFactor: 0.93, status: 'operational' },
            { id: 'dorms-north', name: 'Dorms North', description: 'Northern dormitory', panelCount: 4, totalPower: 72, powerFactor: 0.89, status: 'warning' },
            { id: 'student-center', name: 'Student Center', description: 'Recreation & dining', panelCount: 8, totalPower: 156, powerFactor: 0.95, status: 'operational' },
        ]
    },
    {
        name: 'Zone D - Sports',
        code: 'D',
        status: 'normal',
        buildings: [
            { id: 'sports-complex', name: 'Sports Complex', description: 'Main gymnasium', panelCount: 10, totalPower: 280, powerFactor: 0.97, status: 'operational' },
            { id: 'aquatic-center', name: 'Aquatic Center', description: 'Swimming pools', panelCount: 4, totalPower: 145, powerFactor: 0.94, status: 'offline' },
        ]
    },
];

interface BuildingGridProps {
    selectedZone?: string;
}

export function BuildingGrid({ selectedZone }: BuildingGridProps) {
    const filteredZones = selectedZone
        ? zonesData.filter(z => z.code === selectedZone)
        : zonesData;

    const totalBuildings = filteredZones.reduce((acc, zone) => acc + zone.buildings.length, 0);

    return (
        <div className="xl:col-span-2 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Buildings ({totalBuildings})
                </h3>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] text-xs rounded px-2 py-1 text-slate-600 dark:text-[#9ca6ba]">
                        <option>Sort by: Name</option>
                        <option>Sort by: Load</option>
                        <option>Sort by: Status</option>
                    </select>
                </div>
            </div>

            {filteredZones.map((zone) => (
                <div key={zone.code} className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`size-2.5 rounded-full ${zone.status === 'critical' ? 'bg-red-500' : zone.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                        <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{zone.name}</h4>
                        <span className="text-xs text-slate-400">({zone.buildings.length} buildings)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zone.buildings.map((building) => (
                            <BuildingCard key={building.id} {...building} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
