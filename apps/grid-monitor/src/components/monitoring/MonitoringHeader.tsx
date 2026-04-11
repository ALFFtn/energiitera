import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ProfileMenu } from '../common/ProfileMenu';

export function MonitoringHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navLinks = [
        // { path: '/', label: 'Dashboard' },
        { path: '/monitoring', label: 'Buildings' },
        // { path: '/analytics', label: 'Analytics' },
    ];

    return (
        <>
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#111318] px-4 md:px-6 py-3 shrink-0 z-20 transition-colors">
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl md:text-3xl">bolt</span>
                        </div>
                        <h2 className="text-base md:text-lg font-bold leading-tight tracking-[-0.015em]">PowerGrid</h2>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium leading-normal transition-colors ${isActive(link.path)
                                        ? 'text-primary dark:text-white'
                                        : 'text-slate-500 dark:text-[#9ca6ba] hover:text-primary dark:hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3 md:gap-6">
                    {/* Search - Hidden on mobile */}
                    <div className="hidden lg:flex relative max-w-xs w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="w-full bg-slate-100 dark:bg-[#282e39] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary"
                            placeholder="Search..."
                        />
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-slate-500 dark:text-[#9ca6ba] hover:bg-slate-100 dark:hover:bg-[#282e39] rounded-full transition-colors">
                        <span className="material-symbols-outlined text-xl md:text-2xl">notifications</span>
                        <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border border-white dark:border-[#111318]"></span>
                    </button>

                    {/* Profile */}
                    <ProfileMenu />
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50" onClick={() => setMobileMenuOpen(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50" />

                    {/* Drawer */}
                    <nav
                        className="absolute top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#111318] shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <span className="material-symbols-outlined text-2xl text-primary">bolt</span>
                                <span className="font-bold">PowerGrid OS</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Nav Links */}
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
                                    <span className="material-symbols-outlined text-xl">
                                        {link.path === '/' ? 'dashboard' : link.path === '/monitoring' ? 'apartment' : 'analytics'}
                                    </span>
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="border-t border-slate-200 dark:border-slate-800 py-4">
                            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
                            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-xl">search</span>
                                Search
                            </button>
                            <button className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <span className="material-symbols-outlined text-xl">settings</span>
                                Settings
                            </button>
                        </div>
                    </nav>
                </div>
            )}
        </>
    );
}
