

export function LiveTicker() {
    return (
        <div className="bg-surface-darker border-b border-slate-800 h-14 shrink-0 flex items-center px-6 gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 pr-6 border-r border-slate-800 shrink-0">
                <div className="size-2 rounded-full bg-success live-indicator"></div>
                <span className="text-xs font-bold text-success tracking-wider uppercase">Live Feed</span>
            </div>
            {/* Ticker Items */}
            <div className="flex items-center gap-12 min-w-max">
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Grid Load</span>
                    <span className="text-lg font-mono font-bold text-white">45.2 MW</span>
                    <span className="text-xs font-bold text-success flex items-center">
                        <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> 2.1%
                    </span>
                    {/* Tiny Sparkline SVG representation */}
                    <svg className="opacity-50" fill="none" height="20" viewBox="0 0 60 20" width="60">
                        <path d="M0 15L10 10L20 16L30 5L40 12L50 8L60 14" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Frequency</span>
                    <span className="text-lg font-mono font-bold text-white">60.01 Hz</span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                        <span className="material-symbols-outlined text-[14px]">remove</span> 0.0%
                    </span>
                    <svg className="opacity-50" fill="none" height="20" viewBox="0 0 60 20" width="60">
                        <path d="M0 10H60" stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1.5"></path>
                        <path d="M0 10L10 9L20 11L30 10L40 10L50 9L60 11" stroke="#94a3b8" strokeLinecap="round" strokeWidth="1.5"></path>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Power Factor</span>
                    <span className="text-lg font-mono font-bold text-white">0.98</span>
                    <span className="text-xs font-bold text-warning flex items-center">
                        <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span> 0.5%
                    </span>
                    <svg className="opacity-50" fill="none" height="20" viewBox="0 0 60 20" width="60">
                        <path d="M0 5L10 8L20 10L30 12L40 10L50 14L60 16" stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                    </svg>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Active Alarms</span>
                    <span className="text-lg font-mono font-bold text-danger">3</span>
                    <span className="text-xs font-bold text-danger flex items-center">
                        <span className="material-symbols-outlined text-[14px]">priority_high</span> CRITICAL
                    </span>
                </div>
            </div>
            <style>{`
        @keyframes pulse-dot {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .live-indicator {
            animation: pulse-dot 2s infinite;
        }
      `}</style>
        </div>
    );
}
