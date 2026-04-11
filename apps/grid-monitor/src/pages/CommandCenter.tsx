
import { CommandHeader } from '../components/command/CommandHeader';
import { DashboardDescription } from '../components/command/DashboardDescription';

export function CommandCenter() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 font-display min-h-screen flex flex-col overflow-x-hidden">
            <CommandHeader />
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-y-auto">
                <DashboardDescription />
            </main>
        </div>
    );
}
