

export function HourlyConsumptionChart() {
    return (
        <div className="xl:col-span-3 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col min-h-[400px]">
            <div className="p-5 border-b border-slate-200 dark:border-border-dark flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hourly Consumption Trend</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total kWh usage over the selected period</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Current</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-background-dark border border-slate-200 dark:border-border-dark">
                        <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600"></div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Previous</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 p-6 relative w-full h-full flex flex-col justify-end">
                {/* Fake Chart Grid Lines */}
                <div className="absolute inset-x-6 inset-y-6 flex flex-col justify-between pointer-events-none">
                    <div className="border-b border-slate-100 dark:border-white/5 w-full h-0"></div>
                    <div className="border-b border-slate-100 dark:border-white/5 w-full h-0"></div>
                    <div className="border-b border-slate-100 dark:border-white/5 w-full h-0"></div>
                    <div className="border-b border-slate-100 dark:border-white/5 w-full h-0"></div>
                    <div className="border-b border-slate-100 dark:border-white/5 w-full h-0"></div>
                </div>
                {/* SVG Chart */}
                <div className="relative w-full h-[300px] z-10">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 300">
                        {/* Previous Period Line (Dashed/Gray) */}
                        <path className="text-slate-300 dark:text-slate-700" d="M0,250 C100,240 150,200 200,210 C300,230 400,180 500,190 C600,200 700,150 800,160 C900,170 950,220 1000,230" fill="none" stroke="currentColor" strokeDasharray="5,5" strokeWidth="2"></path>
                        {/* Area Gradient Definition */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#0d59f2" stopOpacity="0.3"></stop>
                                <stop offset="100%" stopColor="#0d59f2" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        {/* Current Period Area */}
                        <path d="M0,200 C100,180 150,120 200,130 C300,150 400,80 500,100 C600,120 700,60 800,80 C900,100 950,180 1000,190 L1000,300 L0,300 Z" fill="url(#chartGradient)"></path>
                        {/* Current Period Line */}
                        <path d="M0,200 C100,180 150,120 200,130 C300,150 400,80 500,100 C600,120 700,60 800,80 C900,100 950,180 1000,190" fill="none" stroke="#0d59f2" strokeLinecap="round" strokeWidth="3"></path>
                        {/* Interactive Point (Mockup) */}
                        <circle className="dark:stroke-[#161b26]" cx="500" cy="100" fill="#0d59f2" r="6" stroke="white" strokeWidth="2"></circle>
                        {/* Tooltip Mockup */}
                        <g transform="translate(460, 40)">
                            <rect className="dark:fill-white" fill="#1e293b" height="30" rx="4" width="80"></rect>
                            <text className="dark:fill-slate-900" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle" x="40" y="20">482 kWh</text>
                        </g>
                    </svg>
                </div>
                {/* X-Axis Labels */}
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-4 pt-2 border-t border-slate-200 dark:border-border-dark">
                    <span>00:00</span>
                    <span>04:00</span>
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span>23:59</span>
                </div>
            </div>
        </div>
    );
}
