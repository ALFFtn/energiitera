import { Link } from 'react-router-dom';
import { ProfileMenu } from '../common/ProfileMenu';

export function MonitoringHeader() {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#111318] px-6 py-3 shrink-0 z-20 transition-colors">
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                    <div className="size-8 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">bolt</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">PowerGrid OS</h2>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <Link className="text-slate-500 dark:text-[#9ca6ba] hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" to="/">Dashboard</Link>
                    <Link className="text-primary dark:text-white text-sm font-medium leading-normal" to="/monitoring">Monitoring</Link>
                    <Link className="text-slate-500 dark:text-[#9ca6ba] hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" to="/analytics">Analytics</Link>
                    <a className="text-slate-500 dark:text-[#9ca6ba] hover:text-primary dark:hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Settings</a>
                </div>
            </div>
            <div className="flex flex-1 justify-end gap-6 items-center">
                <div className="hidden sm:flex relative max-w-xs w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">search</span>
                    </span>
                    <input className="w-full bg-slate-100 dark:bg-[#282e39] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary" placeholder="Search assets, zones..." />
                </div>
                <button className="relative p-2 text-slate-500 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#282e39] rounded-full transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-[#111318]"></span>
                </button>
                <ProfileMenu />
            </div>
        </header>
    );
}
