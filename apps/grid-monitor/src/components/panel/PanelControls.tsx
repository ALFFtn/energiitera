

export function PanelControls() {
    return (
        <div className="glass-panel rounded-2xl p-6 md:col-span-1 bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">tune</span> Controls
            </h3>
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-md text-blue-400 group-hover:text-blue-300">
                            <span className="material-symbols-outlined text-[20px]">download</span>
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-white">Export Data</div>
                            <div className="text-xs text-slate-400">CSV, Last Hour</div>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2 rounded-md text-amber-400 group-hover:text-amber-300">
                            <span className="material-symbols-outlined text-[20px]">warning</span>
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-medium text-white">Alert Thresholds</div>
                            <div className="text-xs text-slate-400">Configure Limits</div>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-500 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">build</span>
                            <span className="text-sm font-medium text-slate-300">Maintenance Mode</span>
                        </div>
                        {/* Toggle Switch */}
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input className="sr-only peer" type="checkbox" value="" />
                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 pl-7">Disables alerts during servicing.</p>
                </div>
            </div>
        </div>
    );
}
