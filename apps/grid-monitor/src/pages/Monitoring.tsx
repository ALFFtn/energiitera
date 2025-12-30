
import { MonitoringHeader } from '../components/monitoring/MonitoringHeader';
import { MonitoringSidebar } from '../components/monitoring/MonitoringSidebar';
import { StatCardMain } from '../components/monitoring/StatCardMain';
import { PanelGrid } from '../components/monitoring/PanelGrid';
import { MonitoringRightSidebar } from '../components/monitoring/MonitoringRightSidebar';

export function Monitoring() {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            <MonitoringHeader />
            <div className="flex flex-1 overflow-hidden">
                <MonitoringSidebar />
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center text-sm text-slate-500 dark:text-[#9ca6ba]">
                            <a className="hover:text-primary transition-colors" href="#">Campus Grid</a>
                            <span className="material-symbols-outlined text-base mx-2">chevron_right</span>
                            <a className="hover:text-primary transition-colors" href="#">Zone A - Research</a>
                            <span className="material-symbols-outlined text-base mx-2">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-medium">Building 404</span>
                        </nav>
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Building 404 - Engineering Wing</h1>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium border border-green-500/20">
                                        <span className="size-1.5 rounded-full bg-green-500"></span>
                                        Operational
                                    </span>
                                    <span className="text-slate-500 dark:text-[#9ca6ba]">Last Sync: 30s ago</span>
                                    <span className="text-slate-500 dark:text-[#9ca6ba] hidden sm:inline">|</span>
                                    <span className="text-slate-500 dark:text-[#9ca6ba] hidden sm:inline">Grid Connection: Primary</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1e232e] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#282e39] font-medium text-sm transition-colors">
                                    <span className="material-symbols-outlined mr-2 text-[20px]">print</span>
                                    Report
                                </button>
                                <button className="flex items-center justify-center h-10 px-4 rounded-lg bg-primary text-white hover:bg-blue-600 font-medium text-sm transition-colors shadow-lg shadow-primary/25">
                                    <span className="material-symbols-outlined mr-2 text-[20px]">settings_input_component</span>
                                    Config Panels
                                </button>
                            </div>
                        </div>

                        {/* Stats Overview */}
                        <StatCardMain />

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <PanelGrid />
                            <MonitoringRightSidebar />
                        </div>

                        <footer className="mt-12 mb-6 text-center text-xs text-slate-400 dark:text-slate-600">
                            <p>© 2023 PowerGrid OS. All systems nominal.</p>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}
