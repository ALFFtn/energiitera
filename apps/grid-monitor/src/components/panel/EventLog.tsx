
export function EventLog() {
    return (
        <div className="rounded-2xl p-6 flex flex-col h-full bg-white dark:bg-card-dark/75 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">list_alt</span> Event Log
                </h3>
                <button className="text-xs text-primary hover:text-blue-500 dark:hover:text-white transition-colors font-medium uppercase tracking-wide">View All</button>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 pr-2">
                <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border-l-4 border-emerald-500">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                                <span className="material-symbols-outlined text-[16px]">check</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">System Normalized</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Voltage stabilized within nominal range.</p>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">10:41 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border-l-4 border-amber-500">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
                                <span className="material-symbols-outlined text-[16px]">bolt</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Minor Voltage Spike</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Phase A experienced momentary surge (+2%).</p>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">09:15 AM</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-white/5 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                                <span className="material-symbols-outlined text-[16px]">person</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Maintenance Access</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Engineer J. Doe logged in locally.</p>
                            </div>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Yesterday</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
