

export function PanelHeader() {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2">
                <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <a className="hover:text-primary transition-colors" href="#">Campus Overview</a>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <a className="hover:text-primary transition-colors" href="#">Building 4</a>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded text-xs">Panel 4B</span>
                </nav>
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                        Panel 4B <span className="font-light text-slate-500">|</span> Server Room
                    </h1>
                    <span className="hidden sm:inline-flex items-center justify-center rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-sm font-medium text-emerald-500 border border-emerald-500/20">
                        Online
                    </span>
                </div>
                <div className="text-slate-400 text-sm font-mono flex gap-4">
                    <span>UPTIME: <span className="text-white">42d 14h 22m</span></span>
                    <span className="hidden sm:inline">|</span>
                    <span className="hidden sm:inline">LAST SYNC: <span className="text-emerald-400">0.02ms ago</span></span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all group text-white">
                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">history</span>
                    <span>History</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all">
                    <span className="material-symbols-outlined text-[18px] animate-pulse">videocam</span>
                    <span>Live Stream</span>
                </button>
            </div>
        </div>
    );
}
