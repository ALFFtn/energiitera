import { Link } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { ProfileMenu } from '../common/ProfileMenu';

export function Header() {
    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] bg-white dark:bg-background-dark px-6 py-3 lg:px-10 transition-colors">
            <Link to="/dashboard" className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="size-8 text-primary">
                    <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_6_319)">
                            <path d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z" fill="currentColor"></path>
                        </g>
                        <defs>
                            <clipPath id="clip0_6_319"><rect fill="white" height="48" width="48"></rect></clipPath>
                        </defs>
                    </svg>
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">GridMonitor</h2>
            </Link>
            <div className="flex flex-1 justify-end gap-2 items-center">
                <ThemeToggle />
                <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-slate-100 dark:bg-[#282e39] text-slate-600 dark:text-white hover:bg-slate-200 dark:hover:bg-[#3b4354] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                </button>
                <ProfileMenu />
            </div>
        </header>
    );
}
