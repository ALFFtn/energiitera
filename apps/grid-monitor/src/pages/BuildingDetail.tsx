import { useParams, Link } from 'react-router-dom';
import { ProfileMenu } from '../components/common/ProfileMenu';
import { VoltageGauge } from '../components/panel/VoltageGauge';
import { CurrentGauge } from '../components/panel/CurrentGauge';
import { PowerFactorGauge } from '../components/panel/PowerFactorGauge';
import { PhaseLoadBalance } from '../components/panel/PhaseLoadBalance';
import { SignalQuality } from '../components/panel/SignalQuality';
import { EventLog } from '../components/panel/EventLog';

// Mock building data - will be replaced with API
const buildingsData: Record<string, {
    name: string;
    code: string;
    description: string;
    zone: string;
    status: 'operational' | 'warning' | 'critical' | 'offline';
    mqttTopic: string;
    lvmdp: {
        voltage: { r: number; s: number; t: number };
        current: { r: number; s: number; t: number };
        power: number;
        powerFactor: number;
        frequency: number;
        temperature: number;
        signalStrength: number;
        lastUpdate: string;
    };
}> = {
    'building-404': {
        name: 'Building 404 - Engineering Wing',
        code: 'ENG-404',
        description: 'Main server room and engineering facilities',
        zone: 'Zone A - Research',
        status: 'operational',
        mqttTopic: 'energy/buildings/a/eng-404',
        lvmdp: {
            voltage: { r: 231, s: 229, t: 230 },
            current: { r: 124, s: 118, t: 121 },
            power: 85.2,
            powerFactor: 0.96,
            frequency: 50.02,
            temperature: 42,
            signalStrength: 98,
            lastUpdate: '2s ago',
        }
    },
    'eng-quad': {
        name: 'Engineering Quad',
        code: 'ENG-QUAD',
        description: 'Main engineering research facility',
        zone: 'Zone A - Research',
        status: 'operational',
        mqttTopic: 'energy/buildings/a/eng-quad',
        lvmdp: {
            voltage: { r: 230, s: 228, t: 229 },
            current: { r: 145, s: 142, t: 140 },
            power: 98.5,
            powerFactor: 0.94,
            frequency: 50.01,
            temperature: 38,
            signalStrength: 95,
            lastUpdate: '5s ago',
        }
    },
    'science-labs': {
        name: 'Science Labs',
        code: 'SCI-LABS',
        description: 'Chemistry and Physics laboratories',
        zone: 'Zone A - Research',
        status: 'warning',
        mqttTopic: 'energy/buildings/a/sci-labs',
        lvmdp: {
            voltage: { r: 225, s: 223, t: 224 },
            current: { r: 189, s: 195, t: 192 },
            power: 125.8,
            powerFactor: 0.85,
            frequency: 49.98,
            temperature: 52,
            signalStrength: 87,
            lastUpdate: '3s ago',
        }
    },
};

export function BuildingDetail() {
    const { buildingId } = useParams<{ buildingId: string }>();
    const building = buildingsData[buildingId || ''] || buildingsData['building-404'];

    const statusColors: Record<string, string> = {
        operational: 'bg-green-500',
        warning: 'bg-orange-500',
        critical: 'bg-red-500',
        offline: 'bg-slate-400',
    };

    const statusBgColors: Record<string, string> = {
        operational: 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400',
        warning: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400',
        critical: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400',
        offline: 'bg-slate-100 dark:bg-slate-500/10 border-slate-300 dark:border-slate-500/20 text-slate-600 dark:text-slate-400',
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/monitoring" className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">arrow_back</span>
                    </Link>
                    <div className="size-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[24px]">apartment</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">{building.name}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{building.zone} • LVMDP Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Live indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-300">Live • {building.lvmdp.lastUpdate}</span>
                    </div>
                    {/* Status badge */}
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusBgColors[building.status]}`}>
                        <span className={`w-2 h-2 rounded-full ${statusColors[building.status]}`}></span>
                        <span className="text-xs font-medium capitalize">{building.status}</span>
                    </div>
                    <button className="text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <ProfileMenu />
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                {/* Building Info Header */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                            <span className="text-sm font-mono text-primary">{building.mqttTopic}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">thermostat</span>
                            <span className="text-sm">{building.lvmdp.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">frequency</span>
                            <span className="text-sm">{building.lvmdp.frequency} Hz</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{building.description}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-yellow-500 text-[20px]">electric_bolt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Active Power</span>
                        </div>
                        <p className="text-3xl font-bold">{building.lvmdp.power}</p>
                        <p className="text-xs text-slate-400 mt-1">kW</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">speed</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Power Factor</span>
                        </div>
                        <p className={`text-3xl font-bold ${building.lvmdp.powerFactor < 0.9 ? 'text-orange-500' : ''}`}>
                            {building.lvmdp.powerFactor.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{building.lvmdp.powerFactor >= 0.95 ? 'Excellent' : building.lvmdp.powerFactor >= 0.9 ? 'Good' : 'Needs Attention'}</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-500 text-[20px]">bolt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Avg Voltage</span>
                        </div>
                        <p className="text-3xl font-bold">
                            {Math.round((building.lvmdp.voltage.r + building.lvmdp.voltage.s + building.lvmdp.voltage.t) / 3)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">V (L-N)</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-green-500 text-[20px]">signal_cellular_alt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Signal</span>
                        </div>
                        <p className="text-3xl font-bold">{building.lvmdp.signalStrength}%</p>
                        <p className="text-xs text-green-500 mt-1">Strong</p>
                    </div>
                </div>

                {/* Dashboard Grid - Panel Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <VoltageGauge />
                    <CurrentGauge />
                    <PowerFactorGauge />
                    <PhaseLoadBalance />
                    <SignalQuality />
                    <EventLog />
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-lg hover:border-primary dark:hover:border-primary transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">download</span>
                        Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-lg hover:border-primary dark:hover:border-primary transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">history</span>
                        View History
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-lg hover:border-primary dark:hover:border-primary transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                        Schedule Maintenance
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Configure Sensor
                    </button>
                </div>
            </main>
        </div>
    );
}
