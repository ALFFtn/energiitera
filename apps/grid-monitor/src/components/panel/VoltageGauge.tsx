
interface VoltageGaugeProps {
    phaseR?: number;
    phaseS?: number;
    phaseT?: number;
}

export function VoltageGauge({ phaseR = 230, phaseS = 230, phaseT = 230 }: VoltageGaugeProps) {
    const avgVoltage = Math.round((phaseR + phaseS + phaseT) / 3);
    const minVoltage = Math.min(phaseR, phaseS, phaseT);
    const maxVoltage = Math.max(phaseR, phaseS, phaseT);

    // Calculate progress (voltage typically 200-250V, show as percentage)
    const minRange = 200;
    const maxRange = 260;
    const progress = Math.min(100, Math.max(0, ((avgVoltage - minRange) / (maxRange - minRange)) * 100));
    const circumference = 264;
    const dashOffset = circumference - (circumference * progress / 100);

    // Determine status color
    const isNormal = avgVoltage >= 218 && avgVoltage <= 242;
    const colorClass = isNormal ? 'text-cyan-500' : 'text-orange-500';

    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-slate-500">info</span>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Voltage (L-N)</h3>
                {/* SVG Gauge */}
                <div className="relative size-48">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                        {/* Background Circle */}
                        <circle className="text-slate-700/30 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
                        {/* Progress Circle (Voltage) */}
                        <circle
                            className={`${colorClass} stroke-current drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-500 ease-out`}
                            cx="50" cy="50"
                            fill="transparent"
                            r="42"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            strokeWidth="8"
                        ></circle>
                    </svg>
                    {/* Digital Readout Center */}
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                            {avgVoltage}
                            <span className="text-lg text-slate-400 font-medium ml-1">V</span>
                        </span>
                        <span className={`${isNormal ? 'text-emerald-400' : 'text-orange-400'} text-xs font-bold flex items-center mt-1`}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5">
                                {isNormal ? 'check_circle' : 'warning'}
                            </span>
                            {isNormal ? 'Normal' : 'Abnormal'}
                        </span>
                    </div>
                </div>
                {/* Phase breakdown */}
                <div className="w-full mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-cyan-400 font-bold">R</span>
                        <span className="text-white ml-1 tabular-nums">{phaseR.toFixed(1)}V</span>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-yellow-400 font-bold">S</span>
                        <span className="text-white ml-1 tabular-nums">{phaseS.toFixed(1)}V</span>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-blue-400 font-bold">T</span>
                        <span className="text-white ml-1 tabular-nums">{phaseT.toFixed(1)}V</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
