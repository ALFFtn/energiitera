import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { VoltageGauge } from '../components/panel/VoltageGauge';
import { LineVoltageGauge } from '../components/panel/LineVoltageGauge';
import { PowerFactorGauge } from '../components/panel/PowerFactorGauge';
import { PhaseLoadBalance } from '../components/panel/PhaseLoadBalance';
import { SignalQuality } from '../components/panel/SignalQuality';
import { EventLog } from '../components/panel/EventLog';
import { ParameterChart } from '../components/building/ParameterChart';

// Halaman promosi publik — tidak butuh login, tidak memanggil API/socket
// asli sama sekali. Semua angka di sini disimulasi lokal di browser
// (random-walk kecil tiap beberapa detik) supaya terasa "hidup" tanpa
// menyentuh data gedung sungguhan. ParameterChart sengaja TIDAK diberi
// buildingId: itu membuat fetch historinya otomatis dilewati (lihat
// useEffect di ParameterChart.tsx — `if (!props.buildingId) return`),
// sementara mekanisme "live update" yang sudah ada di komponen itu tetap
// jalan dari props yang terus berubah di bawah ini, jadi grafiknya
// terisi sendiri secara organik tanpa perlu mengubah komponen itu.

interface DemoState {
    voltageR: number; voltageS: number; voltageT: number;
    currentR: number; currentS: number; currentT: number;
    power: number; powerFactor: number; frequency: number; temperature: number;
}

const BASE: DemoState = {
    voltageR: 236.2, voltageS: 238.4, voltageT: 237.1,
    currentR: 34.5, currentS: 29.8, currentT: 38.2,
    power: 24.6, powerFactor: 0.98, frequency: 50.02, temperature: 29.4,
};

// Random-walk ringan: bergerak sedikit tiap tick, ditarik pelan kembali ke
// nilai dasar supaya tidak melayang jauh, dan dibatasi ke rentang wajar.
function jitter(value: number, base: number, step: number, min: number, max: number): number {
    const next = value + (Math.random() - 0.5) * step + (base - value) * 0.08;
    return Math.min(max, Math.max(min, Number(next.toFixed(2))));
}

// THD tidak diukur sensor sungguhan (lihat catatan di hooks/useSocket.ts) --
// dipakai rumus estimasi yang sama supaya kartu THD di demo ini tampil
// konsisten dengan versi asli, bukan sekadar angka sembarang.
function estimateThdCurrent(powerFactor: number): number {
    if (!powerFactor || powerFactor <= 0 || powerFactor > 1) return 0;
    return Math.min(100, Math.sqrt(Math.max(0, (1 / powerFactor) ** 2 - 1)) * 100);
}
function estimateThdVoltage(vr: number, vs: number, vt: number): number {
    const avg = (vr + vs + vt) / 3;
    if (!avg) return 0;
    const maxDeviation = Math.max(Math.abs(vr - avg), Math.abs(vs - avg), Math.abs(vt - avg));
    return Math.min(100, (maxDeviation / avg) * 100);
}

export function GuestDemo() {
    const [data, setData] = useState<DemoState>(BASE);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => ({
                voltageR: jitter(prev.voltageR, BASE.voltageR, 1.2, 228, 244),
                voltageS: jitter(prev.voltageS, BASE.voltageS, 1.2, 228, 244),
                voltageT: jitter(prev.voltageT, BASE.voltageT, 1.2, 228, 244),
                currentR: jitter(prev.currentR, BASE.currentR, 2.5, 15, 60),
                currentS: jitter(prev.currentS, BASE.currentS, 2.5, 15, 60),
                currentT: jitter(prev.currentT, BASE.currentT, 2.5, 15, 60),
                power: jitter(prev.power, BASE.power, 1.6, 10, 45),
                powerFactor: jitter(prev.powerFactor, BASE.powerFactor, 0.015, 0.92, 1),
                frequency: jitter(prev.frequency, BASE.frequency, 0.06, 49.7, 50.3),
                temperature: jitter(prev.temperature, BASE.temperature, 0.4, 24, 36),
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const { voltageR, voltageS, voltageT, currentR, currentS, currentT, power, powerFactor, frequency, temperature } = data;
    const thdVoltage = estimateThdVoltage(voltageR, voltageS, voltageT);
    const thdCurrent = estimateThdCurrent(powerFactor);
    const reactivePower = power * Math.tan(Math.acos(powerFactor || 0.95));

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
            {/* Banner mode tamu */}
            <div className="bg-primary text-white px-4 py-2 flex flex-wrap items-center justify-center gap-2 text-sm text-center">
                <span className="material-symbols-outlined text-[18px]">visibility</span>
                <span className="font-medium">Mode Tamu — Data di halaman ini simulasi untuk keperluan demo/promosi, bukan data gedung sungguhan.</span>
                <Link to="/login" className="underline font-semibold whitespace-nowrap hover:text-blue-100 transition-colors">
                    Login untuk Akses Penuh →
                </Link>
            </div>

            {/* Header */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111318] px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="size-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-[24px]">apartment</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-tight tracking-tight">Gedung Demo (Contoh)</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Zona Demo • Kampus Contoh • LVMDP Monitoring</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Live (Simulasi)</span>
                    </div>
                    <ThemeToggle />
                    <Link
                        to="/login"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Login
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                {/* Building Info Header */}
                <div className="mb-6">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">tag</span>
                            <span className="text-sm font-mono">DEMO-01</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                            <span className="text-sm font-mono text-primary">energy/buildings/demo/demo-01</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-lg">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">electrical_services</span>
                            <span className="text-sm capitalize">Primary Grid</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                        Contoh tampilan monitoring LVMDP dengan data simulasi. Login untuk melihat data real-time dari gedung sungguhan.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-yellow-500 text-[20px]">electric_bolt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Active Power</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums">{power.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">kW</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-purple-500 text-[20px]">dynamic_form</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Reactive Power</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums">{reactivePower.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">kVAR</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-orange-500 text-[20px]">thermostat</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Temperature</span>
                        </div>
                        <p className="text-3xl font-bold tabular-nums">{temperature.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-1">°C</p>
                    </div>
                    <div className="bg-white dark:bg-[#1e232e] rounded-xl p-4 border border-slate-200 dark:border-[#282e39]">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-green-500 text-[20px]">signal_cellular_alt</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Connection</span>
                        </div>
                        <p className="text-3xl font-bold">Online</p>
                        <p className="text-xs text-green-500 mt-1">Simulasi aktif</p>
                    </div>
                </div>

                {/* Dashboard Grid - Panel Gauges */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                    <VoltageGauge phaseR={voltageR} phaseS={voltageS} phaseT={voltageT} />
                    <LineVoltageGauge phaseR={voltageR} phaseS={voltageS} phaseT={voltageT} />
                    <PowerFactorGauge value={powerFactor} />
                    <PhaseLoadBalance phaseR={currentR} phaseS={currentS} phaseT={currentT} />
                    <SignalQuality frequency={frequency} thdVoltage={thdVoltage} thdCurrent={thdCurrent} />
                </div>

                {/* Parameter History Chart + Event Log */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 mb-8">
                    <ParameterChart
                        voltage_r={voltageR}
                        voltage_s={voltageS}
                        voltage_t={voltageT}
                        current_r={currentR}
                        current_s={currentS}
                        current_t={currentT}
                        power={power}
                        power_factor={powerFactor}
                        frequency={frequency}
                        temperature={temperature}
                        // Sengaja tanpa buildingId -- lihat catatan di atas file.
                    />
                    <EventLog />
                </div>

                {/* Quick Actions (demo: semua mengarahkan ke login) */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {([
                        { icon: 'download', label: 'Export CSV' },
                        { icon: 'history', label: 'View History' },
                        { icon: 'schedule', label: 'Schedule Maintenance' },
                        { icon: 'settings', label: 'Configure Sensor' },
                    ] as const).map(({ icon, label }) => (
                        <Link
                            key={label}
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-lg hover:border-primary dark:hover:border-primary transition-colors text-sm font-medium"
                            title="Login untuk menggunakan fitur ini"
                        >
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            {label}
                        </Link>
                    ))}
                </div>

                {/* CTA penutup */}
                <div className="rounded-2xl p-8 md:p-10 bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/20 text-center">
                    <span className="material-symbols-outlined text-4xl text-primary mb-3 block">bolt</span>
                    <h3 className="text-2xl font-bold mb-2">Ini baru contoh — data sungguhan lebih lengkap lagi</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-xl mx-auto">
                        Login untuk melihat data real-time dari gedung sungguhan, riwayat historis, ekspor CSV, notifikasi Telegram, dan manajemen multi-gedung.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
                    >
                        <span className="material-symbols-outlined text-[18px]">login</span>
                        Login Sekarang
                    </Link>
                </div>
            </main>
        </div>
    );
}
