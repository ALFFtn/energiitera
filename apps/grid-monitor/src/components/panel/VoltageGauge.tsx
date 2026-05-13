
interface VoltageGaugeProps {
    phaseR?: number;
    phaseS?: number;
    phaseT?: number;
}

export function VoltageGauge({ phaseR = 230, phaseS = 230, phaseT = 230 }: VoltageGaugeProps) {
    const avgVoltage = Math.round((phaseR + phaseS + phaseT) / 3);

    const minRange = 200;
    const maxRange = 260;
    const progress = Math.min(100, Math.max(0, ((avgVoltage - minRange) / (maxRange - minRange)) * 100));
    const circumference = 264;
    const dashOffset = circumference - (circumference * progress / 100);

    const isNormal = avgVoltage >= 218 && avgVoltage <= 242;
    const colorClass = isNormal ? 'text-cyan-500' : 'text-orange-500';

    return (
        <div className="rounded-2xl p-6 relative overflow-hidden group bg-white dark:bg-card-dark/75 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
            <div className="absolute top-0 right-0 p-4 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500">info</span>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Voltage (L-N)</h3>
                <div className="relative size-48">
                    <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-slate-200 dark:text-slate-700/30 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8" />
                        <circle
                            className={`${colorClass} stroke-current drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-500 ease-out`}
                            cx="50" cy="50"
                            fill="transparent"
                            r="42"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            strokeWidth="8"
                        />
                    </svg>
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">
                            {avgVoltage}
                            <span className="text-lg text-slate-400 font-medium ml-1">V</span>
                        </span>
                        <span className={`${isNormal ? 'text-emerald-500 dark:text-emerald-400' : 'text-orange-500 dark:text-orange-400'} text-xs font-bold flex items-center mt-1`}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5">
                                {isNormal ? 'check_circle' : 'warning'}
                            </span>
                            {isNormal ? 'Normal' : 'Abnormal'}
                        </span>
                    </div>
                </div>
                <div className="w-full mt-4 grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-cyan-500 dark:text-cyan-400 font-bold">R</span>
                        <span className="text-slate-800 dark:text-white ml-1 tabular-nums">{phaseR.toFixed(1)}V</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-yellow-500 dark:text-yellow-400 font-bold">S</span>
                        <span className="text-slate-800 dark:text-white ml-1 tabular-nums">{phaseS.toFixed(1)}V</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg py-1.5 px-2">
                        <span className="text-blue-500 dark:text-blue-400 font-bold">T</span>
                        <span className="text-slate-800 dark:text-white ml-1 tabular-nums">{phaseT.toFixed(1)}V</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
