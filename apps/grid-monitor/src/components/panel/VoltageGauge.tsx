

export function VoltageGauge() {
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
                        {/* Progress Circle (Voltage) - 75% filled example */}
                        <circle className="text-cyan-500 stroke-current drop-shadow-[0_0_8px_rgba(6,182,212,0.6)] transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="42" strokeDasharray="264" strokeDashoffset="66" strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    {/* Digital Readout Center */}
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">230<span className="text-lg text-slate-400 font-medium ml-1">V</span></span>
                        <span className="text-emerald-400 text-xs font-bold flex items-center mt-1">
                            <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
                            +1.2%
                        </span>
                    </div>
                </div>
                <div className="w-full mt-4 flex justify-between text-xs text-slate-500 font-mono px-8">
                    <span>MIN: 228V</span>
                    <span>MAX: 234V</span>
                </div>
            </div>
        </div>
    );
}
