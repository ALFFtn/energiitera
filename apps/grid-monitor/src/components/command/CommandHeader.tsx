import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileMenu } from '../common/ProfileMenu';

export function CommandHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: 'dashboard' },
        { path: '/monitoring', label: 'Buildings', icon: 'apartment' },
        { path: '/analytics', label: 'Analytics', icon: 'analytics' },
    ];

    return (
        <>
            <header className="h-14 md:h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-darker px-3 md:px-6 shrink-0 z-20">
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    <Link to="/" className="flex items-center gap-2 text-primary dark:text-white">
                        <div className="size-7 md:size-8 bg-primary/20 rounded-md flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-lg md:text-xl">bolt</span>
                        </div>
                        <div>
                            <h1 className="text-xs md:text-sm font-bold uppercase tracking-wider leading-none">
                                <span className="hidden sm:inline">Global Command</span>
                                <span className="sm:hidden">GCC</span>
                            </h1>
                            <p className="hidden md:block text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 tracking-widest">SYSTEM ONLINE</p>
                        </div>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1 ml-4">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide rounded-md transition-colors ${isActive(link.path)
                                        ? 'text-white bg-primary'
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                    {/* UTC Clock - Hidden on mobile */}
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>14:32:45 UTC</span>
                    </div>
                    {/* Search - Hidden on mobile */}
                    <div className="relative hidden lg:block">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[18px]">search</span>
                        <input className="h-9 w-48 bg-slate-100 dark:bg-slate-800 border-none text-sm rounded pl-9 pr-3 focus:ring-1 focus:ring-primary text-slate-900 dark:text-white placeholder-slate-500" placeholder="Search..." type="text" />
                    </div>
                    <button className="relative p-1.5 md:p-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">notifications</span>
                        <span className="absolute top-1 right-1 size-2 bg-danger rounded-full ring-2 ring-white dark:ring-surface-darker"></span>
                    </button>
                    <ProfileMenu />
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileMenuOpen(false)}>
                    <div className="absolute inset-0 bg-black/50" />
                    <nav
                        className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#111318] shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-primary">
                                <span className="material-symbols-outlined text-2xl">bolt</span>
                                <span className="font-bold text-sm">PowerGrid OS</span>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="py-4">
                            {navLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive(link.path)
                                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
