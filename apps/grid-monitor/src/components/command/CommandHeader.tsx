
import { Link } from 'react-router-dom';
import { ProfileMenu } from '../common/ProfileMenu';

export function CommandHeader() {
    return (
        <header className="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-darker px-6 shrink-0 z-20">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 text-primary dark:text-white">
                    <div className="size-8 bg-primary/20 rounded-md flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold uppercase tracking-wider leading-none">Global Command Center</h1>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 tracking-widest">SYSTEM ONLINE // V.4.2.0</p>
                    </div>
                </div>
                <nav className="hidden md:flex items-center gap-1 ml-8">
                    <Link className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white bg-primary rounded-md" to="/">Dashboard</Link>
                    <Link className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" to="/analytics">Analytics</Link>
                    <Link className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" to="/monitoring">Buildings</Link>
                    <a className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors" href="#">Maintenance</a>
                </nav>
            </div>
            <div className="flex items-center gap-4">
                {/* UTC Clock */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>14:32:45 UTC</span>
                </div>
                <div className="relative hidden sm:block">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">search</span>
                    <input className="h-9 w-64 bg-slate-100 dark:bg-slate-800 border-none text-sm rounded pl-9 pr-3 focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-500" placeholder="Search building, ID..." type="text" />
                </div>
                <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="absolute top-1.5 right-1.5 size-2 bg-danger rounded-full ring-2 ring-white dark:ring-surface-darker"></span>
                </button>
                <ProfileMenu />
            </div>
        </header>
    );
}
