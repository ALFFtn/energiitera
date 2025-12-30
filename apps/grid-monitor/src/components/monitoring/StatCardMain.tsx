
export function StatCardMain() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stat Card 1 */}
            <div className="bg-white dark:bg-[#1e232e] rounded-xl p-5 border border-slate-200 dark:border-[#282e39] shadow-sm flex flex-col justify-between transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">health_metrics</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400">Stable</span>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-[#9ca6ba] text-sm font-medium mb-1">Overall Health Score</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">98%</span>
                        <span className="text-green-500 text-sm font-medium mb-1 flex items-center">
                            <span className="material-symbols-outlined text-sm">arrow_upward</span> 0.5%
                        </span>
                    </div>
                </div>
            </div>
            {/* Stat Card 2 */}
            <div className="bg-white dark:bg-[#1e232e] rounded-xl p-5 border border-slate-200 dark:border-[#282e39] shadow-sm flex flex-col justify-between transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">electric_bolt</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-[#282e39] text-slate-600 dark:text-slate-400">Daily</span>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-[#9ca6ba] text-sm font-medium mb-1">Today's Consumption</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">2,845</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">kWh</span>
                        <span className="text-red-500 text-sm font-medium mb-1 flex items-center ml-auto">
                            <span className="material-symbols-outlined text-sm">arrow_upward</span> 4.5%
                        </span>
                    </div>
                </div>
            </div>
            {/* Stat Card 3 */}
            <div className="bg-white dark:bg-[#1e232e] rounded-xl p-5 border border-slate-200 dark:border-[#282e39] shadow-sm flex flex-col justify-between transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        <span className="material-symbols-outlined">balance</span>
                    </div>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-[#9ca6ba] text-sm font-medium mb-1">Load Balance Score</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">92/100</span>
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-[#282e39] rounded-full mb-2 ml-auto">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
