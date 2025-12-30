

export function PhaseLoadBalance() {
    return (
        <div className="glass-panel rounded-2xl p-6 md:col-span-2 flex flex-col h-full bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">3-Phase Load Balance</h3>
                    <p className="text-slate-400 text-sm">Real-time amperage distribution across phases</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg px-3 py-1 border border-white/5">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Total Load: <span className="text-white text-base ml-1">132 A</span></span>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6">
                {/* Phase A */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-blue-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> Phase A
                        </span>
                        <span className="text-white font-mono">44.2 A <span className="text-slate-500 text-xs ml-1">/ 33%</span></span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        {/* Grid lines for bar */}
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full w-[44%] shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-700"></div>
                    </div>
                </div>
                {/* Phase B */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-violet-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]"></span> Phase B
                        </span>
                        <span className="text-white font-mono">46.5 A <span className="text-slate-500 text-xs ml-1">/ 35%</span></span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full w-[46%] shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all duration-700"></div>
                    </div>
                </div>
                {/* Phase C */}
                <div className="group">
                    <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-pink-400 flex items-center gap-2">
                            <span className="size-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span> Phase C
                        </span>
                        <span className="text-white font-mono">41.3 A <span className="text-slate-500 text-xs ml-1">/ 31%</span></span>
                    </div>
                    <div className="h-4 w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="absolute inset-0 flex justify-between px-1">
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                            <div className="w-px h-full bg-white/5"></div>
                        </div>
                        <div className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full w-[41%] shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all duration-700"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
