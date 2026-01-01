
interface PowerFactorGaugeProps {
    value?: number;
}

export function PowerFactorGauge({ value = 0.98 }: PowerFactorGaugeProps) {
    // Power factor ranges 0-1, typically 0.7-1.0
    const normalizedValue = Math.min(1, Math.max(0, value));

    // PF status
    const status = normalizedValue >= 0.95 ? 'Excellent' : normalizedValue >= 0.9 ? 'Good' : normalizedValue >= 0.8 ? 'Fair' : 'Poor';
    const statusColor = normalizedValue >= 0.95 ? 'text-emerald-500' : normalizedValue >= 0.9 ? 'text-amber-500' : 'text-red-500';

    // Calculate needle rotation (0.7 to 1.0 mapped to -90deg to 90deg)
    const rotation = ((normalizedValue - 0.7) / 0.3) * 180 - 90;

    // Semi-circle progress (based on PF from 0.7 to 1.0)
    const progress = Math.max(0, Math.min(100, ((normalizedValue - 0.7) / 0.3) * 100));

    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-slate-500">info</span>
            </div>
            <div className="flex flex-col items-center justify-center h-full">
                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Power Factor</h3>
                {/* SVG Gauge */}
                <div className="relative size-48">
                    <svg className="size-full -rotate-180 transform" viewBox="0 0 100 100">
                        {/* Semi circle background */}
                        <circle className="text-slate-700/30 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeDasharray="132 264" strokeWidth="8"></circle>
                        {/* Progress Semi Circle */}
                        <circle
                            className="text-amber-500 stroke-current drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-500 ease-out"
                            cx="50"
                            cy="50"
                            fill="transparent"
                            r="42"
                            strokeDasharray={`${132 * progress / 100} 264`}
                            strokeLinecap="round"
                            strokeWidth="8"
                        ></circle>
                    </svg>
                    {/* Needle Simulation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div
                            className="w-1 h-20 bg-gradient-to-t from-transparent to-amber-500 rounded-full origin-bottom opacity-80 transition-transform duration-500 ease-out mt-8"
                            style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center bottom' }}
                        ></div>
                    </div>
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center pt-8">
                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">
                            {normalizedValue.toFixed(2)}
                            <span className="text-lg text-slate-400 font-medium ml-1">PF</span>
                        </span>
                        <span className={`${statusColor} text-xs font-bold flex items-center mt-1`}>
                            <span className="material-symbols-outlined text-[14px] mr-0.5">
                                {normalizedValue >= 0.9 ? 'check_circle' : 'warning'}
                            </span>
                            {status}
                        </span>
                    </div>
                </div>
                <div className="w-full mt-4 flex justify-between text-xs text-slate-500 font-mono px-8">
                    <span>LAGGING</span>
                    <span className={statusColor + ' font-bold'}>{status.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
}
