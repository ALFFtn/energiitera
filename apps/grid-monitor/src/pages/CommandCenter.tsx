
import { CommandHeader } from '../components/command/CommandHeader';
import { LiveTicker } from '../components/command/LiveTicker';
import { KPISidebar } from '../components/command/KPISidebar';
import { CampusMap } from '../components/command/CampusMap';
import { PowerDistChart } from '../components/command/PowerDistChart';
import { AlertFeed } from '../components/command/AlertFeed';

export function CommandCenter() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-hidden">
            <CommandHeader />
            {/* Main Content Area: Grid Layout */}
            <main className="flex-1 flex flex-col min-h-0">
                <LiveTicker />
                {/* Dashboard Grid Content */}
                <div className="flex flex-1 p-4 gap-4 min-h-0 overflow-hidden">
                    {/* Left Sidebar: KPIs */}
                    <KPISidebar />

                    {/* Center Stage: Map & Graph */}
                    <section className="flex-1 flex flex-col gap-4 min-w-0">
                        <CampusMap />
                        <PowerDistChart />
                    </section>

                    {/* Right Sidebar: Alerts Feed */}
                    <AlertFeed />
                </div>
            </main>
        </div>
    );
}
