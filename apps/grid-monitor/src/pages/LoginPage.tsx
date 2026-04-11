import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

interface LocationState {
    from?: { pathname: string };
}

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LocationState | null;
    const returnTo = locationState?.from?.pathname || '/';
    const [email, setEmail] = useState('admin@gridmonitor.iot');
    const [password, setPassword] = useState('password');
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Login failed');
            }

            // Store tokens in localStorage
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            console.log('Login successful:', data.data.user);
            navigate(returnTo);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display antialiased text-white overflow-x-hidden h-screen flex flex-col">
            {/* Main Layout Container */}
            <div className="flex flex-1 w-full h-full overflow-hidden">
                {/* Left Panel: Visual / Mission Control Context (Hidden on mobile) */}
                <div className="hidden lg:flex flex-1 relative bg-[#0a0c10] flex-col justify-end overflow-hidden border-r border-[#3b4354]/30">
                    {/* Background Image with Data Alt - Using exact URL from user request */}
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
                        data-alt="Digital blue circuit board data visualization pattern representing power grid network"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuASu_OKCt875XkEsnEfjYP-x5gaUOm8mvOeYVsQHh9Rb_E6CAO79XAxSefN5KAFZkFBZ9Pf5CB8wIhZ0yX_bP92f41F9e6t0899POfZCawDqIbZmFunaC5WgNKd5OoGZwGoap7obXGAGb2PQa17iI8I3Qv2BkBuGe2SX42_E7Wd7WJi1iZmacsH8Gi4zh2c1IYWZBdhD1o_mUo3rQl_A_ylia5s7IORoVlmZnHlpEi_PPr7fgedDPHMt8t-QuqwieRUTjPlRy93FM0R")' }}
                    >
                    </div>
                    {/* Abstract Grid Overlay */}
                    <div
                        className="absolute inset-0 opacity-20"
                        data-alt="Technical grid overlay pattern"
                        style={{ backgroundImage: 'linear-gradient(#3b4354 1px, transparent 1px), linear-gradient(to right, #3b4354 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                    >
                    </div>
                    {/* Gradient Fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                    {/* Content */}
                    <div className="relative z-10 p-12 max-w-2xl">
                        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-sm">
                            <span className="material-symbols-outlined text-primary text-4xl">monitoring</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Real-time Grid Intelligence</h2>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                            Secure access to the campus electrical health monitoring system.
                            Visualize loads, detect anomalies, and manage power distribution in real-time.
                        </p>
                        <div className="mt-8 flex gap-4">
                            <div className="flex items-center gap-2 bg-[#1b1f27]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#3b4354]/50">
                                <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                                <span className="text-sm font-medium text-gray-300">Live Load: 84%</span>
                            </div>
                            <div className="flex items-center gap-2 bg-[#1b1f27]/80 backdrop-blur-md px-4 py-2 rounded-lg border border-[#3b4354]/50">
                                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                <span className="text-sm font-medium text-gray-300">Grid Stable</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Login Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 relative bg-background-dark">
                    {/* Mobile background texture */}
                    <div className="absolute inset-0 lg:hidden pointer-events-none">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-10"
                            data-alt="Abstract dark technology background with glowing nodes"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAEjRQLJajnZvICXgUeup_BJ-AQb0mjyxh_kGsvrEmW9lOGfcCZarIktfLNfYQR_8ijEdEasESsR-IwrACcvFratZAMoX3Q42WNCFmDxwVLh-t5LIB2FsrWCCaB-cQFRPuW-sov3I8aobVBmaT48YmHBjq3FYVz6K5J8-vf8-XCHnYkbZ9qLUq5qOU_9pEyqLdoEXgA38N6Xi3YubffPhLcCeFEwpi4YghjmqCIR9Ae0a0B0D7X8pVdzgTPWH9tq4KYebAa-MVCOQQM")' }}
                        >
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background-dark"></div>
                    </div>

                    <div className="w-full max-w-[420px] flex flex-col gap-8 relative z-10">
                        {/* System Status Indicator */}
                        <div className="flex justify-between items-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b222d] border border-[#3b4354]">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-green-500 tracking-wider uppercase">System Online</span>
                            </div>
                            <span className="material-symbols-outlined text-[#3b4354]">security</span>
                        </div>

                        {/* Header */}
                        <div>
                            <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight mb-2">Electrical Health Monitor</h1>
                            <p className="text-[#9ca6ba] text-base font-normal leading-normal">Please sign in to access the control panel.</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}

                        {/* Login Form */}
                        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
                            {/* Email Input */}
                            <div className="flex flex-col gap-2">
                                <label className="text-white text-sm font-medium leading-normal">Email Address</label>
                                <div className="group flex w-full items-stretch rounded-lg border border-[#3b4354] bg-[#1b1f27] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-white focus:outline-0 focus:ring-0 border-none h-12 placeholder:text-[#586275] px-4 text-base font-normal leading-normal"
                                        placeholder="Enter your email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <div className="text-[#9ca6ba] flex items-center justify-center pr-4 group-focus-within:text-primary transition-colors duration-200">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-white text-sm font-medium leading-normal">Password</label>
                                    <a className="text-sm font-medium text-primary hover:text-blue-400 transition-colors" href="#">Forgot Password?</a>
                                </div>
                                <div className="group flex w-full items-stretch rounded-lg border border-[#3b4354] bg-[#1b1f27] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all duration-200">
                                    <input
                                        className="flex w-full min-w-0 flex-1 resize-none bg-transparent text-white focus:outline-0 focus:ring-0 border-none h-12 placeholder:text-[#586275] px-4 text-base font-normal leading-normal"
                                        placeholder="Enter your password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-[#9ca6ba] flex items-center justify-center pr-4 cursor-pointer hover:text-white transition-colors duration-200"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
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

                        {/* Test Credentials Hint */}
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs text-primary font-medium mb-1">Test Credentials</p>
                            <p className="text-xs text-[#9ca6ba]">Email: admin@gridmonitor.iot</p>
                            <p className="text-xs text-[#9ca6ba]">Password: password</p>
                        </div>

                        {/* Footer / Disclaimer */}
                        <div className="mt-auto pt-6 border-t border-[#3b4354]/30">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <p className="text-xs text-[#586275] font-medium uppercase tracking-wider">Restricted Access • Authorized Personnel Only</p>
                                <p className="text-xs text-[#3b4354]">v1.0.4 • Electrical Health Systems Inc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
