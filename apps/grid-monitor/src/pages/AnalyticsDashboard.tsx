
import { Header } from '../components/layout/Header';
import { KPICard } from '../components/dashboard/KPICard';
import { HourlyConsumptionChart } from '../components/dashboard/HourlyConsumptionChart';
import { PowerFactorChart } from '../components/dashboard/PowerFactorChart';
import { DeptBreakdown } from '../components/dashboard/DeptBreakdown';

export function AnalyticsDashboard() {
    return (
        <>
            <Header />
            <main className="flex-1 flex flex-col p-6 lg:px-10 lg:py-8 max-w-[1440px] mx-auto w-full">
                {/* Header & Controls */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl lg:text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">Analytics & Reporting</h1>
                        <p className="text-slate-500 dark:text-[#9ca6ba] text-base font-normal">Main Campus Grid - Historical Analysis</p>
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Date Range Picker */}
                        <div className="flex flex-col min-w-[180px]">
                            <label className="text-xs font-semibold text-slate-500 dark:text-[#9ca6ba] uppercase tracking-wider mb-2">Date Range</label>
                            <div className="relative">
                                <select className="appearance-none w-full bg-slate-100 dark:bg-[#1b1f27] border border-slate-200 dark:border-[#3b4354] text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 pr-8">
                                    <option>Last 30 Days</option>
                                    <option>This Quarter</option>
                                    <option>Year to Date</option>
                                    <option>Custom Range</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                </div>
                            </div>
                        </div>
                        {/* Building Selector */}
                        <div className="flex flex-col min-w-[180px]">
                            <label className="text-xs font-semibold text-slate-500 dark:text-[#9ca6ba] uppercase tracking-wider mb-2">Facility</label>
                            <div className="relative">
                                <select className="appearance-none w-full bg-slate-100 dark:bg-[#1b1f27] border border-slate-200 dark:border-[#3b4354] text-slate-900 dark:text-white text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 pr-8">
                                    <option>All Buildings</option>
                                    <option>Engineering Lab A</option>
                                    <option>Student Dorms</option>
                                    <option>Main Library</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <span className="material-symbols-outlined text-[20px]">domain</span>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-900/20">
                                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                <span>PDF</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg bg-slate-200 dark:bg-[#282e39] hover:bg-slate-300 dark:hover:bg-[#3b4354] text-slate-900 dark:text-white text-sm font-bold transition-colors border border-slate-300 dark:border-[#3b4354]">
                                <span className="material-symbols-outlined text-[20px]">csv</span>
                                <span>CSV</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <KPICard
                        title="Total Consumption"
                        value="124,592"
                        unit="kWh"
                        icon="bolt"
                        iconColor="text-primary"
                        trend={{
                            value: "12.5% vs last mo",
                            isPositive: false,
                            colorClass: "text-rose-500",
                            bgClass: "bg-rose-500/10",
                            iconName: "trending_up"
                        }}
                    />
                    <KPICard
                        title="Peak Demand"
                        value="450"
                        unit="kW"
                        icon="warning"
                        iconColor="text-amber-500"
                        footer={{
                            icon: "schedule",
                            text: "Recorded Oct 12, 14:00"
                        }}
                    />
                    <KPICard
                        title="Estimated Bill"
                        value="$15,400"
                        icon="payments"
                        iconColor="text-emerald-500"
                        trend={{
                            value: "2.1% projected saving",
                            isPositive: true,
                            iconName: "trending_down",
                            colorClass: "text-emerald-500",
                            bgClass: "bg-emerald-500/10"
                        }}
                    />
                </div>

                {/* Main Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">
                    <HourlyConsumptionChart />
                    <PowerFactorChart />
                    <DeptBreakdown />
                </div>
            </main>
        </>
    );
}
