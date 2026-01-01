
export function MonitoringSidebar() {
    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#111318] border-r border-slate-200 dark:border-[#282e39] overflow-y-auto shrink-0 transition-colors">
            <div className="p-4">
                <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">Campus Monitor</h1>
                    <p className="text-slate-500 dark:text-[#9ca6ba] text-xs">Building Zones</p>
                </div>
                <nav className="flex flex-col gap-1">
                    <div className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Zones</div>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary dark:text-white dark:bg-[#282e39]" href="#">
                        <div className="size-2.5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Zone A - Research</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">3 Buildings</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#1e232e] transition-colors" href="#">
                        <div className="size-2.5 rounded-full bg-yellow-500"></div>
                        <span className="text-sm font-medium">Zone B - Admin</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">2 Buildings</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#1e232e] transition-colors" href="#">
                        <div className="size-2.5 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">Zone C - Dorms</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">4 Buildings</span>
                    </a>
                    <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#1e232e] transition-colors" href="#">
                        <div className="size-2.5 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium">Zone D - Sports</span>
                        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">2 Buildings</span>
                    </a>
                </nav>
            </div>
            <div className="mt-auto p-4 border-t border-slate-200 dark:border-[#282e39]">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-[#1e232e]">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-500">cloud_done</span>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium dark:text-white">System Online</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Ping: 12ms</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
