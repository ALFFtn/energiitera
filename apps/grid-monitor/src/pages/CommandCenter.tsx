
import { CommandHeader } from '../components/command/CommandHeader';
import { LiveTicker } from '../components/command/LiveTicker';
import { KPISidebar } from '../components/command/KPISidebar';
import { CampusMap } from '../components/command/CampusMap';
import { PowerDistChart } from '../components/command/PowerDistChart';
import { AlertFeed } from '../components/command/AlertFeed';

export function CommandCenter() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-x-hidden">
            <CommandHeader />
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <LiveTicker />

                {/* Mobile: Stack layout, Desktop: Grid layout */}
                <div className="flex-1 p-3 md:p-4 overflow-y-auto">
                    {/* Mobile KPI Cards - Horizontal scroll */}
                    <div className="lg:hidden mb-4">
                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 scrollbar-hide">
                            <KPISidebar />
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Left Sidebar: KPIs - Desktop Only */}
                        <div className="hidden lg:block lg:w-64 shrink-0">
                            <KPISidebar />
                        </div>

                        {/* Center Stage: Map & Graph */}
                        <section className="flex-1 flex flex-col gap-4 min-w-0">
                            <CampusMap />
                            <PowerDistChart />
                        </section>

                        {/* Right Sidebar: Alerts Feed */}
                        <div className="w-full lg:w-80 shrink-0">
                            <AlertFeed />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
