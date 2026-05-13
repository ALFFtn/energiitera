import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';
import { ThemeToggle } from '../components/common/ThemeToggle';

interface LocationState {
    from?: { pathname: string };
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState | null;
    const returnTo = locationState?.from?.pathname || '/monitoring';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Login failed');
            }

            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            navigate(returnTo, { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased overflow-x-hidden h-screen flex flex-col">
            <div className="flex flex-1 w-full h-full overflow-hidden">

                {/* Left panel — campus building image */}
                <div className="hidden lg:flex flex-1 relative bg-[#0a0f1a] flex-col justify-end overflow-hidden border-r border-white/5">
                    {/*
                     * Taruh foto gedung kampus kamu di:
                     *   apps/grid-monitor/public/campus.jpg
                     * File campus.jpg akan menimpa placeholder SVG ini secara otomatis.
                     */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: 'url("/campus.jpg"), url("/campus.svg")',
                            backgroundPosition: 'center 30%',
                        }}
                    />

                    {/* Subtle grid pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.06]"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.8) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />

                    {/* Gradient: dark at top and bottom for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/40 to-[#0a0f1a]/60" />

                    {/* Accent glow */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                    {/* Content */}
                    <div className="relative z-10 p-12 max-w-xl">
                        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-4 leading-tight">
                            Real-time Grid<br />Intelligence
                        </h2>
                        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                            Secure access to the campus electrical health monitoring system.
                            Visualize loads, detect anomalies, and manage power distribution in real-time.
                        </p>
                        <div className="mt-8 flex gap-3">
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <span className="material-symbols-outlined text-primary text-[16px]">bolt</span>
                                <span className="text-sm font-medium text-slate-200">Live Load: 84%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                                <span className="material-symbols-outlined text-green-400 text-[16px]">check_circle</span>
                                <span className="text-sm font-medium text-slate-200">Grid Stable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right panel — form, theme-aware */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 relative bg-background-light dark:bg-background-dark">
                    {/* Mobile background texture */}
                    <div className="absolute inset-0 lg:hidden pointer-events-none">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-10"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEjRQLJajnZvICXgUeup_BJ-AQb0mjyxh_kGsvrEmW9lOGfcCZarIktfLNfYQR_8ijEdEasESsR-IwrACcvFratZAMoX3Q42WNCFmDxwVLh-t5LIB2FsrWCCaB-cQFRPuW-sov3I8aobVBmaT48YmHBjq3FYVz6K5J8-vf8-XCHnYkbZ9qLUq5qOU_9pEyqLdoEXgA38N6Xi3YubffPhLcCeFEwpi4YghjmqCIR9Ae0a0B0D7X8pVdzgTPWH9tq4KYebAa-MVCOQQM")' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-light dark:to-background-dark" />
                    </div>

                    {/* Theme toggle — top right */}
                    <div className="absolute top-4 right-4 z-10">
                        <ThemeToggle />
                    </div>

                    <div className="w-full max-w-[420px] flex flex-col gap-8 relative z-10">
                        {/* System Status */}
                        <div className="flex justify-between items-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#1b222d] border border-slate-200 dark:border-[#3b4354]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-500 tracking-wider uppercase">System Online</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-300 dark:text-[#3b4354]">security</span>
                        </div>

                        {/* Header */}
                        <div>
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
                                Electrical Health Monitor
                            </h1>
                            <p className="text-slate-500 dark:text-[#9ca6ba] text-base font-normal leading-normal">
                                Please sign in to access the control panel.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 dark:text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-white text-sm font-medium leading-normal">Email Address</label>
                                <div className="group flex w-full items-stretch rounded-lg border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1b1f27] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none h-12 placeholder:text-slate-400 dark:placeholder:text-[#586275] px-4 text-base font-normal leading-normal"
                                        placeholder="Enter your email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="text-slate-400 dark:text-[#9ca6ba] flex items-center justify-center pr-4 group-focus-within:text-primary transition-colors duration-200">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-slate-700 dark:text-white text-sm font-medium leading-normal">Password</label>
                                    <a className="text-sm font-medium text-primary hover:text-blue-400 transition-colors" href="#">Forgot Password?</a>
                                </div>
                                <div className="group flex w-full items-stretch rounded-lg border border-slate-200 dark:border-[#3b4354] bg-white dark:bg-[#1b1f27] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-slate-900 dark:text-white focus:outline-0 focus:ring-0 border-none h-12 placeholder:text-slate-400 dark:placeholder:text-[#586275] px-4 text-base font-normal leading-normal"
                                        placeholder="Enter your password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-slate-400 dark:text-[#9ca6ba] flex items-center justify-center pr-4 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors duration-200"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <button
                                className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary py-3.5 px-4 text-sm font-bold text-white shadow-[0_0_20px_rgba(13,89,242,0.3)] hover:shadow-[0_0_30px_rgba(13,89,242,0.5)] hover:bg-blue-600 transition-all active:scale-[0.99] gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        <span>Signing In...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <span className="material-symbols-outlined text-[18px]">login</span>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-[#3b4354]/30">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <p className="text-xs text-slate-400 dark:text-[#586275] font-medium uppercase tracking-wider">
                                    Restricted Access • Authorized Personnel Only
                                </p>
                                <p className="text-xs text-slate-300 dark:text-[#3b4354]">v1.0.4 • Electrical Health Systems Inc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
