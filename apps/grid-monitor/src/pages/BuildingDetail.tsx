import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProfileMenu } from '../components/common/ProfileMenu';
import { VoltageGauge } from '../components/panel/VoltageGauge';
import { LineVoltageGauge } from '../components/panel/LineVoltageGauge';
import { PowerFactorGauge } from '../components/panel/PowerFactorGauge';
import { PhaseLoadBalance } from '../components/panel/PhaseLoadBalance';
import { SignalQuality } from '../components/panel/SignalQuality';
import { EventLog } from '../components/panel/EventLog';
import { ConfigureSensorModal } from '../components/building/ConfigureSensorModal';
import { ParameterChart } from '../components/building/ParameterChart';
import { useBuildingSensor } from '../hooks/useSocket';

interface Building {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: 'operational' | 'warning' | 'critical' | 'offline';
    gridConnection: string;
    zone: {
        id: string;
        name: string;
        code: string;
        campus: {
            id: string;
            name: string;
        };
    };
}

export function BuildingDetail() {
    const { buildingId } = useParams<{ buildingId: string }>();
    const [building, setBuilding] = useState<Building | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // Real-time LVMDP sensor data via Socket.io
    const {
        voltage,
        current,
        power,
        powerFactor,
        frequency,
        temperature,
        thdVoltage,
        thdCurrent,
        lastUpdate,
        isConnected
    } = useBuildingSensor({
        buildingCode: building?.code || '',
        zoneCode: building?.zone?.code || '',
    });

    // Format last update time
    const formatLastUpdate = () => {
        if (!lastUpdate) return 'No data';
        const seconds = Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        return `${Math.floor(seconds / 60)}m ago`;
    };

    useEffect(() => {
        if (buildingId) {
            fetchBuilding(buildingId);
        }
    }, [buildingId]);

    const fetchBuilding = async (id: string) => {
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:3001/api/buildings/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Building not found');
            }

            const data = await response.json();
            if (data.success) {
                setBuilding(data.data);
            } else {
                throw new Error(data.error || 'Failed to load building');
            }
        } catch (err) {
            console.error('Failed to fetch building:', err);
            setError(err instanceof Error ? err.message : 'Failed to load building');
        } finally {
            setIsLoading(false);
        }
    };

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

    if (isLoading) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined animate-spin text-primary text-[32px]">progress_activity</span>
                    <p className="text-slate-500">Loading building...</p>
                </div>
            </div>
        );
    }

    if (error || !building) {
        return (
            <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                    <span className="material-symbols-outlined text-red-500 text-[48px]">error</span>
                    <p className="text-red-500 text-lg">{error || 'Building not found'}</p>
                    <Link to="/monitoring" className="text-primary hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back to Buildings
                    </Link>
                </div>
            </div>
        );
    }

    const mqttTopic = `energy/buildings/${building.zone.code.toLowerCase()}/${building.code.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

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
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {building.zone.name} • {building.zone.campus.name} • LVMDP Monitoring
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Live indicator */}
                    <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-500/10 border-slate-500/20'}`}>
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span className="text-xs font-medium text-slate-300">{isConnected ? 'Live' : 'Connecting'} • {formatLastUpdate()}</span>
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
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">tag</span>
                            <span className="text-sm font-mono">{building.code}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                            <span className="text-sm font-mono text-primary">{mqttTopic}</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">electrical_services</span>
                            <span className="text-sm capitalize">{building.gridConnection} Grid</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{building.description || 'No description available'}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-yellow-500 text-[20px]">electric_bolt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Active Power</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums">{power.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">kW</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-500 text-[20px]">dynamic_form</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Reactive Power</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums">{(power * Math.tan(Math.acos(powerFactor || 0.95))).toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">kVAR</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-orange-500 text-[20px]">thermostat</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Temperature</span>
                        </div>
                        <p className={`text-3xl font-bold tabular-nums ${temperature > 50 ? 'text-red-500' : temperature > 40 ? 'text-orange-500' : ''}`}>
                            {temperature.toFixed(1)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">°C</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-green-500 text-[20px]">signal_cellular_alt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Connection</span>
                        </div>
                        <p className="text-3xl font-bold">{isConnected ? 'Online' : 'Offline'}</p>
                        <p className={`text-xs ${isConnected ? 'text-green-500' : 'text-slate-400'} mt-1`}>{isConnected ? 'Receiving data' : 'Waiting...'}</p>
                    </div>
                </div>

                {/* Dashboard Grid - Panel Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <VoltageGauge
                        phaseR={voltage.r}
                        phaseS={voltage.s}
                        phaseT={voltage.t}
                    />
                    <LineVoltageGauge
                        phaseR={voltage.r}
                        phaseS={voltage.s}
                        phaseT={voltage.t}
                    />
                    <PowerFactorGauge value={powerFactor} />
                    <PhaseLoadBalance
                        phaseR={current.r}
                        phaseS={current.s}
                        phaseT={current.t}
                    />
                    <SignalQuality
                        frequency={frequency}
                        thdVoltage={thdVoltage}
                        thdCurrent={thdCurrent}
                    />
                    <EventLog />
                </div>

                {/* Parameter History Chart */}
                <div className="mb-8">
                    <ParameterChart
                        voltage_r={voltage.r}
                        voltage_s={voltage.s}
                        voltage_t={voltage.t}
                        current_r={current.r}
                        current_s={current.s}
                        current_t={current.t}
                        power={power}
                        power_factor={powerFactor}
                        frequency={frequency}
                        temperature={temperature}
                    />
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
                    <button
                        onClick={() => setIsConfigModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-[18px]">settings</span>
                        Configure Sensor
                    </button>
                </div>
            </main>

            {/* Configure Sensor Modal */}
            {building && (
                <ConfigureSensorModal
                    isOpen={isConfigModalOpen}
                    onClose={() => setIsConfigModalOpen(false)}
                    buildingId={building.id}
                    buildingCode={building.code}
                    buildingName={building.name}
                    zoneCode={building.zone.code}
                />
            )}
        </div>
    );
}
