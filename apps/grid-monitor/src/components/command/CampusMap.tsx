

export function CampusMap() {
    return (
        <div className="bg-surface-darker rounded-lg border border-slate-800 relative flex-1 min-h-[400px] overflow-hidden group">
            {/* Map Header Overlay */}
            <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded p-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-[18px]">map</span>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Campus Map View: Zone A</span>
            </div>
            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded p-2 text-[10px] text-slate-300 space-y-1.5 w-32">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Normal
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> Warning
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span> Critical
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-slate-600"></span> Offline
                    </div>
                </div>
            </div>
            {/* SVG Map */}
            <div className="w-full h-full flex items-center justify-center bg-[#0b1121]" data-location="Austin, TX Campus Map">
                <svg className="w-full h-full p-8" fill="none" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Grid */}
                    <defs>
                        <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1"></path>
                        </pattern>
                    </defs>
                    <rect fill="url(#grid)" height="500" width="800"></rect>
                    {/* Connecting Lines (Power Lines) */}
                    <path d="M150 250 L 300 150 L 500 150 L 650 250" stroke="#334155" strokeDasharray="4 4" strokeWidth="2"></path>
                    <path d="M300 150 L 300 350 L 500 350" stroke="#334155" strokeDasharray="4 4" strokeWidth="2"></path>
                    {/* Building A (Engineering - Normal) */}
                    <g className="building-group group/bldg">
                        <path className="building-path text-slate-700 fill-current stroke-slate-600 hover:text-success/20 hover:stroke-success" d="M100 200 H200 V300 H100 Z" strokeWidth="2"></path>
                        <circle className="fill-success animate-pulse" cx="150" cy="250" r="4"></circle>
                        <text className="fill-slate-500 text-[10px] font-mono group-hover/bldg:fill-white transition-colors" textAnchor="middle" x="150" y="320">ENG. QUAD</text>
                    </g>
                    {/* Building B (Admin - Normal) */}
                    <g className="building-group group/bldg">
                        <path className="building-path text-slate-700 fill-current stroke-slate-600 hover:text-success/20 hover:stroke-success" d="M280 100 H400 V180 H280 Z" strokeWidth="2"></path>
                        <circle className="fill-success" cx="340" cy="140" r="4"></circle>
                        <text className="fill-slate-500 text-[10px] font-mono group-hover/bldg:fill-white transition-colors" textAnchor="middle" x="340" y="200">ADMIN HALL</text>
                    </g>
                    {/* Building C (Dorms - Warning) */}
                    <g className="building-group group/bldg">
                        <path className="building-path text-slate-700 fill-current stroke-warning hover:text-warning/20 hover:stroke-warning" d="M280 320 H450 V420 H280 Z" strokeWidth="2"></path>
                        <circle className="fill-warning animate-pulse" cx="365" cy="370" r="4"></circle>
                        <text className="fill-warning text-[10px] font-mono font-bold" textAnchor="middle" x="365" y="440">DORMS (WEST)</text>
                        {/* Warning Tooltip simulation */}
                        <g className="opacity-0 group-hover/bldg:opacity-100 transition-opacity">
                            <rect fill="#0f172a" height="40" rx="4" stroke="#f59e0b" strokeWidth="1" width="100" x="380" y="300"></rect>
                            <text className="text-[8px] font-bold" fill="#f59e0b" x="390" y="315">⚠ VOLTAGE SPIKE</text>
                            <text className="text-[8px]" fill="white" x="390" y="330">Load: 92%</text>
                        </g>
                    </g>
                    {/* Building D (Science - Critical) */}
                    <g className="building-group group/bldg">
                        <path className="building-path text-slate-700 fill-current stroke-danger hover:text-danger/20 hover:stroke-danger" d="M500 120 L650 120 L680 220 L470 220 Z" strokeWidth="2"></path>
                        <circle className="fill-danger animate-ping opacity-75" cx="575" cy="170" r="6"></circle>
                        <circle className="fill-danger" cx="575" cy="170" r="4"></circle>
                        <text className="fill-danger text-[10px] font-mono font-bold" textAnchor="middle" x="575" y="240">SCIENCE LABS</text>
                    </g>
                    {/* Building E (Library - Normal) */}
                    <g className="building-group group/bldg">
                        <path className="building-path text-slate-700 fill-current stroke-slate-600 hover:text-success/20 hover:stroke-success" d="M550 300 H700 V400 H550 Z" strokeWidth="2"></path>
                        <circle className="fill-success" cx="625" cy="350" r="4"></circle>
                        <text className="fill-slate-500 text-[10px] font-mono group-hover/bldg:fill-white transition-colors" textAnchor="middle" x="625" y="420">MAIN LIBRARY</text>
                    </g>
                </svg>
            </div>
            <style>{`
        .building-path { transition: all 0.3s ease; cursor: pointer; }
        .building-path:hover { filter: brightness(1.2); stroke-width: 2; color: white !important; }
      `}</style>
        </div>
    );
}
