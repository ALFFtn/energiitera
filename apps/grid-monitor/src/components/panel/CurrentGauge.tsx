
interface CurrentGaugeProps {
    phaseR?: number;
    phaseS?: number;
    phaseT?: number;
    capacity?: number;
}

export function CurrentGauge({ phaseR = 0, phaseS = 0, phaseT = 0, capacity = 300 }: CurrentGaugeProps) {
    const totalCurrent = phaseR + phaseS + phaseT;
    const avgCurrent = totalCurrent / 3;

    // Calculate load percentage
    const loadPercent = Math.min(100, (totalCurrent / capacity) * 100);
    const circumference = 264;
    const dashOffset = circumference - (circumference * loadPercent / 100);

    // Determine status color based on load
    const colorClass = loadPercent < 70 ? 'text-fuchsia-500' : loadPercent < 90 ? 'text-orange-500' : 'text-red-500';
    const isNormal = loadPercent < 80;

    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-slate-500">info</span>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Total Current</h3>
                {/* SVG Gauge */}
                <div className="relative size-48">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-slate-700/30 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
                        {/* Progress Circle (Current) */}
                        <circle
                            className={`${colorClass} stroke-current drop-shadow-[0_0_8px_rgba(217,70,239,0.6)] transition-all duration-500 ease-out`}
                            cx="50" cy="50"
                            fill="transparent"
                            r="42"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            strokeWidth="8"
                        ></circle>
                    </svg>
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                            {avgCurrent.toFixed(1)}
                            <span className="text-lg text-slate-400 font-medium ml-1">A</span>
                        </span>
                        <span className={`${isNormal ? 'text-emerald-400' : 'text-orange-400'} text-xs font-bold flex items-center mt-1`}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5">
                                {loadPercent < 70 ? 'trending_flat' : loadPercent < 90 ? 'trending_up' : 'warning'}
                            </span>
                            Load: {loadPercent.toFixed(0)}%
                        </span>
                    </div>
                </div>
                {/* Capacity info */}
                <div className="w-full mt-4 flex justify-between text-xs text-slate-500 font-mono px-8">
                    <span>CAP: {capacity}A</span>
                    <span>AVG: {avgCurrent.toFixed(1)}A</span>
                </div>
            </div>
        </div>
    );
}
