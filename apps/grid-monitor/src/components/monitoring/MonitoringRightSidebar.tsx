
export function MonitoringRightSidebar() {
    return (
        <div className="xl:col-span-1 flex flex-col gap-6">
            {/* Trend Chart */}
            <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 shadow-sm transition-colors">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">24h Trend</h3>
                    <button className="text-xs font-medium text-primary hover:text-blue-400">View History</button>
                </div>
                {/* SVG Chart Simulation */}
                <div className="relative w-full h-48">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line key={y} className="text-slate-100 dark:text-slate-800" stroke="currentColor" strokeWidth="1" x1="0" x2="300" y1={y} y2={y} />
                        ))}
                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#0d59f2" stopOpacity="0.4"></stop>
                                <stop offset="100%" stopColor="#0d59f2" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path d="M0,80 Q30,70 60,75 T120,60 T180,40 T240,55 T300,30 V100 H0 Z" fill="url(#chartGradient)"></path>
                        {/* Line stroke */}
                        <path d="M0,80 Q30,70 60,75 T120,60 T180,40 T240,55 T300,30" fill="none" stroke="#0d59f2" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                        {/* Active Point */}
                        <circle cx="300" cy="30" fill="#0d59f2" r="4" stroke="white" strokeWidth="2"></circle>
                    </svg>
                    {/* Tooltip simulation */}
                    <div className="absolute top-4 right-0 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg transform -translate-x-1/2 -translate-y-full">
                        324 kWh
                    </div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>Now</span>
                </div>
            </div>
            {/* Recent Alerts */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-[#9ca6ba]">Recent Activity</h3>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39]">
                    <div className="mt-0.5 text-orange-500">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Voltage Sag Detected</p>
                        <p className="text-xs text-slate-500 dark:text-[#9ca6ba]">Panel 2A - 10:42 AM</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39]">
                    <div className="mt-0.5 text-green-500">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Maintenance Completed</p>
                        <p className="text-xs text-slate-500 dark:text-[#9ca6ba]">Panel 1B - 08:15 AM</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39]">
                    <div className="mt-0.5 text-blue-500">
                        <span className="material-symbols-outlined text-[20px]">info</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Daily Report Generated</p>
                        <p className="text-xs text-slate-500 dark:text-[#9ca6ba]">System - 06:00 AM</p>
                    </div>
                </div>
            </div>
            {/* Map Preview */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-[#282e39] group">
                <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                    <span className="text-white font-medium flex items-center gap-2"><span className="material-symbols-outlined">zoom_in</span> View Floorplan</span>
                </div>
                {/* Placeholder for map image, using a CSS pattern related to grids instead of an external image to ensure it works */}
                <div className="w-full h-full bg-[#1e232e]" style={{
                    backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(13, 89, 242, 0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 20%)',
                }}>
                    <svg className="w-full h-full p-4 opacity-50" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
                        <rect x="20" y="20" width="160" height="80" fill="none" stroke="#282e39" strokeWidth="2" />
                        <path d="M60 20 V100" stroke="#282e39" strokeWidth="2" />
                        <path d="M140 20 V100" stroke="#282e39" strokeWidth="2" />
                        <rect x="30" y="30" width="20" height="20" fill="#0d59f2" fillOpacity="0.2" />
                        <rect x="70" y="30" width="60" height="60" fill="#10b981" fillOpacity="0.2" />
                    </svg>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                    Zone B Map
                </div>
            </div>
        </div>
    );
}
