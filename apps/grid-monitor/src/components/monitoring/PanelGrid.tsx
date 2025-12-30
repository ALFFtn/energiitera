
interface PanelProps {
    name: string;
    desc: string;
    current: number;
    powerFactor: number | string;
    status: 'normal' | 'warning' | 'offline';
}

function PanelCard({ name, desc, current, powerFactor, status }: PanelProps) {
    const isOffline = status === 'offline';
    const isWarning = status === 'warning';

    const statusColor = isOffline ? 'bg-red-500' : isWarning ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]';
    const borderColor = isWarning ? 'border-orange-200 dark:border-orange-500/30 hover:border-orange-500' : 'border-slate-200 dark:border-[#282e39] hover:border-primary dark:hover:border-primary';
    const bgColor = isOffline ? 'bg-slate-50 dark:bg-[#161a21] opacity-75 hover:opacity-100' : 'bg-white dark:bg-[#1e232e]';
    const textColor = isOffline ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white';
    const subTextColor = isOffline ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-[#9ca6ba]';


    const progressColor = isWarning ? 'bg-orange-500' : 'bg-primary';
    const pfColor = isWarning ? 'bg-orange-500' : 'bg-green-500';

    // Calculate widths for visual bars (simulated)
    const currentPercentage = isOffline ? 0 : Math.min(100, Math.max(10, (current / 200) * 100)); // Assume 200A max for Vis
    const pfPercentage = isOffline ? 0 : (typeof powerFactor === 'number' ? powerFactor * 100 : 0);

    return (
        <div className={`${bgColor} border ${borderColor} rounded-lg p-4 transition-all cursor-pointer group`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className={`${isOffline ? 'bg-slate-200 dark:bg-[#282e39]' : isWarning ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-slate-100 dark:bg-[#282e39]'} p-2 rounded ${isWarning ? 'text-orange-600 dark:text-orange-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[20px]">{isOffline ? 'power_off' : isWarning ? 'warning' : 'developer_board'}</span>
                    </div>
                    <div>
                        <h4 className={`font-bold ${isOffline ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'} text-sm`}>{name}</h4>
                        <p className={`text-xs ${subTextColor}`}>{desc}</p>
                    </div>
                </div>
                <div className={`size-2.5 rounded-full ${statusColor}`}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Current</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${textColor}`}>{current}</span>
                        <span className={`text-xs ${isOffline ? 'text-slate-400' : isWarning ? 'text-orange-500' : 'text-slate-500'}`}>{isOffline ? 'OFF' : isWarning ? 'High' : 'A'}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#282e39] h-1 rounded-full mt-1">
                        <div className={`${progressColor} h-1 rounded-full`} style={{ width: `${currentPercentage}%` }}></div>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Power Factor</p>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${textColor}`}>{powerFactor}</span>
                        {isWarning && <span className="text-xs text-orange-500">Low</span>}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#282e39] h-1 rounded-full mt-1">
                        <div className={`${pfColor} h-1 rounded-full`} style={{ width: `${pfPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PanelGrid() {
    return (
        <div className="xl:col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Panel Status (8)</h3>
                <div className="flex gap-2">
                    <select className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] text-xs rounded px-2 py-1 text-slate-600 dark:text-[#9ca6ba]">
                        <option>Sort by: Name</option>
                        <option>Sort by: Load</option>
                        <option>Sort by: Status</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PanelCard name="Panel 1A" desc="Main Distribution" current={124} powerFactor={0.98} status="normal" />
                <PanelCard name="Panel 1B" desc="HVAC Systems" current={86} powerFactor={0.95} status="normal" />
                <PanelCard name="Panel 2A" desc="Lighting Control" current={210} powerFactor={0.82} status="warning" />
                <PanelCard name="Panel 2B" desc="Server Room UPS" current={45} powerFactor={0.99} status="normal" />
                <PanelCard name="Panel 3A" desc="Auxiliary Power" current={0} powerFactor="-" status="offline" />
                <PanelCard name="Panel 3B" desc="Lab Equipment" current={156} powerFactor={0.96} status="normal" />
            </div>
        </div>
    );
}
