
export function MonitoringRightSidebar() {
    return (
        <div className="xl:col-span-1 flex flex-col gap-6">
            {/* 24h Trend Chart */}
            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-dark-lighter rounded-xl p-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">24h Trend</h3>
                    <button className="text-xs font-medium text-primary hover:text-blue-500 dark:hover:text-blue-400 transition-colors">View History</button>
                </div>
                <div className="relative w-full h-48">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                        {[0, 25, 50, 75, 100].map(y => (
                            <line key={y} x1="0" x2="300" y1={y} y2={y} stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-800" />
                        ))}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#0d59f2" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#0d59f2" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d="M0,80 Q30,70 60,75 T120,60 T180,40 T240,55 T300,30 V100 H0 Z" fill="url(#chartGradient)" />
                        <path d="M0,80 Q30,70 60,75 T120,60 T180,40 T240,55 T300,30" fill="none" stroke="#0d59f2" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <circle cx="300" cy="30" r="4" fill="#0d59f2" stroke="white" strokeWidth="2" />
                    </svg>
                    <div className="absolute top-4 right-0 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded shadow-lg -translate-x-1/2 -translate-y-full">
                        324 kWh
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-2">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>Now</span>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Recent Activity</h3>
                {[
                    { icon: 'warning', color: 'text-orange-500', title: 'Voltage Sag Detected', sub: 'Panel 2A - 10:42 AM' },
                    { icon: 'check_circle', color: 'text-green-500', title: 'Maintenance Completed', sub: 'Panel 1B - 08:15 AM' },
                    { icon: 'info', color: 'text-blue-500', title: 'Daily Report Generated', sub: 'System - 06:00 AM' },
                ].map((item) => (
                    <div key={item.title} className="flex gap-3 items-start p-3 rounded-lg bg-white dark:bg-surface-dark border border-slate-200 dark:border-surface-dark-lighter transition-colors">
                        <div className={`mt-0.5 ${item.color}`}>
                            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone Map Preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-surface-dark-lighter group">
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                    <span className="text-white font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined">zoom_in</span>
                        View Floorplan
                    </span>
                </div>
                <div className="w-full h-full bg-slate-100 dark:bg-surface-dark transition-colors"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(13,89,242,0.08) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(16,185,129,0.08) 0%, transparent 20%)',
                    }}>
                    <svg className="w-full h-full p-4 opacity-60" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="160" height="80" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-surface-dark-lighter" />
                        <path d="M60 20 V100" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-surface-dark-lighter" />
                        <path d="M140 20 V100" stroke="currentColor" strokeWidth="2" className="text-slate-300 dark:text-surface-dark-lighter" />
                        <rect x="30" y="30" width="20" height="20" fill="#0d59f2" fillOpacity="0.25" />
                        <rect x="70" y="30" width="60" height="60" fill="#10b981" fillOpacity="0.2" />
                    </svg>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                    Zone Map
                </div>
            </div>
        </div>
    );
}
