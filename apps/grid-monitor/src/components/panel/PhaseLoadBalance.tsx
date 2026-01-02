
interface PhaseLoadBalanceProps {
    phaseR?: number;
    phaseS?: number;
    phaseT?: number;
    capacity?: number;
}

export function PhaseLoadBalance({ phaseR = 0, phaseS = 0, phaseT = 0, capacity = 300 }: PhaseLoadBalanceProps) {
    const totalLoad = phaseR + phaseS + phaseT;

    // Calculate percentages
    const percentR = totalLoad > 0 ? (phaseR / totalLoad) * 100 : 33;
    const percentS = totalLoad > 0 ? (phaseS / totalLoad) * 100 : 33;
    const percentT = totalLoad > 0 ? (phaseT / totalLoad) * 100 : 33;

    // Calculate load percentage for bar width (relative to capacity)
    const loadPercentR = Math.min(100, (phaseR / capacity) * 100);
    const loadPercentS = Math.min(100, (phaseS / capacity) * 100);
    const loadPercentT = Math.min(100, (phaseT / capacity) * 100);

    return (
        <div className="glass-panel rounded-2xl p-6 md:col-span-2 flex flex-col h-full bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">3-Phase Load Balance</h3>
                    <p className="text-slate-400 text-sm">Real-time amperage distribution across phases</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg px-3 py-1 border border-white/5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                        Total Load: <span className="text-white text-base ml-1 tabular-nums">{totalLoad.toFixed(1)} A</span>
                    </span>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6">
                {/* Phase R */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-cyan-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span> Phase R
                        </span>
                        <span className="text-white font-mono tabular-nums">
                            {phaseR.toFixed(1)} A <span className="text-slate-500 text-xs ml-1">/ {percentR.toFixed(0)}%</span>
                        </span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div
                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-500"
                            style={{ width: `${loadPercentR}%` }}
                        ></div>
                    </div>
                </div>
                {/* Phase S */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-yellow-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span> Phase S
                        </span>
                        <span className="text-white font-mono tabular-nums">
                            {phaseS.toFixed(1)} A <span className="text-slate-500 text-xs ml-1">/ {percentS.toFixed(0)}%</span>
                        </span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-500"
                            style={{ width: `${loadPercentS}%` }}
                        ></div>
                    </div>
                </div>
                {/* Phase T */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-blue-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> Phase T
                        </span>
                        <span className="text-white font-mono tabular-nums">
                            {phaseT.toFixed(1)} A <span className="text-slate-500 text-xs ml-1">/ {percentT.toFixed(0)}%</span>
                        </span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-500"
                            style={{ width: `${loadPercentT}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
