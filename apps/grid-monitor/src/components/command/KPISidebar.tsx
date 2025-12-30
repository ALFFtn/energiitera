

export function KPISidebar() {
    return (
        <aside className="w-64 flex flex-col gap-4 shrink-0 overflow-y-auto pr-1">
            {/* Card 1 */}
            <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Total Consumption</h3>
                    <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                </div>
                <div className="mt-1">
                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">12,450 <span className="text-sm font-sans font-normal text-slate-500">kWh</span></p>
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        +12% vs last week
                    </p>
                </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Carbon Footprint</h3>
                    <span className="material-symbols-outlined text-green-500 text-[20px]">eco</span>
                </div>
                <div className="mt-1">
                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">8.4 <span className="text-sm font-sans font-normal text-slate-500">tons</span></p>
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_down</span>
                        -2.1% efficiency gain
                    </p>
                </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Est. Cost / Hr</h3>
                    <span className="material-symbols-outlined text-slate-400 text-[20px]">attach_money</span>
                </div>
                <div className="mt-1">
                    <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">$452.00</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-right">65% of daily budget</p>
                </div>
            </div>
            {/* Weather Widget (Context) */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 shadow-sm border border-slate-700 flex flex-col gap-2 mt-auto">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-yellow-400 text-[28px]">partly_cloudy_day</span>
                    <div>
                        <p className="text-white font-bold text-lg">24°C</p>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Austin, TX</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700">
                    <div>
                        <p className="text-[10px] text-slate-500">HUMIDITY</p>
                        <p className="text-xs text-slate-300 font-mono">45%</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500">WIND</p>
                        <p className="text-xs text-slate-300 font-mono">12 km/h</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
