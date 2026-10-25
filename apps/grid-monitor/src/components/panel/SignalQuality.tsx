import { useState, useEffect, useRef } from 'react';

interface SignalQualityProps {
    frequency?: number;
    thdVoltage?: number;
    thdCurrent?: number;
}

export function SignalQuality({ frequency = 50, thdVoltage = 0, thdCurrent = 0 }: SignalQualityProps) {
    const [frequencyHistory, setFrequencyHistory] = useState<number[]>([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
    const lastFreqRef = useRef(frequency);

    useEffect(() => {
        if (frequency !== lastFreqRef.current) {
            lastFreqRef.current = frequency;
            setFrequencyHistory(prev => [...prev.slice(1), frequency]);
        }
    }, [frequency]);

    const generateSparklinePath = () => {
        const width = 180;
        const height = 40;
        const minFreq = 49.8;
        const maxFreq = 50.2;

        const points = frequencyHistory.map((freq, i) => {
            const x = (i / (frequencyHistory.length - 1)) * width;
            const normalized = (freq - minFreq) / (maxFreq - minFreq);
            const y = height - (normalized * height);
            return { x, y: Math.max(0, Math.min(height, y)) };
        });

        let pathD = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 2;
            const cp1y = points[i - 1].y;
            const cp2x = cp1x;
            const cp2y = points[i].y;
            pathD += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i].x},${points[i].y}`;
        }

        return {
            linePath: pathD,
            fillPath: `${pathD} L${width},${height} L0,${height} Z`,
        };
    };

    const { linePath, fillPath } = generateSparklinePath();

    const freqStatus = frequency >= 49.9 && frequency <= 50.1 ? 'normal' : frequency >= 49.5 && frequency <= 50.5 ? 'warning' : 'critical';
    const freqStatusColor = freqStatus === 'normal' ? 'text-emerald-500' : freqStatus === 'warning' ? 'text-amber-500' : 'text-red-500';

    const thdTotal = (thdVoltage + thdCurrent) / 2;
    const thdStatus = thdTotal < 5 ? 'normal' : thdTotal < 8 ? 'warning' : 'critical';
    const thdStatusColor = thdStatus === 'normal' ? 'text-emerald-500' : thdStatus === 'warning' ? 'text-amber-500' : 'text-red-500';

    const thdBars = [
        thdVoltage * 10,
        thdCurrent * 8,
        thdVoltage * 6,
        thdCurrent * 4,
        thdVoltage * 3,
        thdCurrent * 2,
    ].map(h => Math.min(100, Math.max(10, h)));

    return (
        <div className="flex flex-col gap-6">
            {/* Frequency */}
            <div className="rounded-2xl p-5 flex-1 flex flex-col justify-between bg-white dark:bg-card-dark/75 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">Frequency</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
                            {frequency.toFixed(2)} <span className="text-sm font-medium text-slate-400 dark:text-slate-500">Hz</span>
                        </p>
                    </div>
                    <span className={`material-symbols-outlined ${freqStatusColor}`}>
                        {freqStatus === 'normal' ? 'check_circle' : freqStatus === 'warning' ? 'warning' : 'error'}
                    </span>
                </div>
                <div className="h-12 w-full mt-2 relative overflow-hidden">
                    <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 180 40" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="freqGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
                                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                            </linearGradient>
                        </defs>
                        <path d={fillPath} fill="url(#freqGradient)" className="transition-all duration-300 ease-out" />
                        <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2" className="transition-all duration-300 ease-out" />
                        <circle cx="180" cy={40 - ((frequency - 49.8) / 0.4) * 40} r="3" fill="#10b981" className="animate-pulse" />
                    </svg>
                </div>
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
                    <span>49.8 Hz</span>
                    <span>50.2 Hz</span>
                </div>
            </div>

            {/* THD */}
            <div className="rounded-2xl p-5 flex-1 flex flex-col justify-between bg-white dark:bg-card-dark/75 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p
                            className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest"
                            title="Meter tidak mengukur THD langsung — nilai diestimasi dari Power Factor (arus) dan ketidakseimbangan tegangan antar fasa (tegangan)."
                        >
                            THD (Harmonics) <span className="font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">· estimasi</span>
                        </p>
                        <div className="flex gap-4 mt-1">
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                                V: {thdVoltage.toFixed(1)}<span className="text-xs font-medium text-slate-400 dark:text-slate-500">%</span>
                            </p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                                I: {thdCurrent.toFixed(1)}<span className="text-xs font-medium text-slate-400 dark:text-slate-500">%</span>
                            </p>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined ${thdStatusColor}`}>
                        {thdStatus === 'normal' ? 'check_circle' : thdStatus === 'warning' ? 'warning' : 'error'}
                    </span>
                </div>
                <div className="flex items-end gap-1 h-12 mt-2">
                    {thdBars.map((height, i) => (
                        <div
                            key={i}
                            className={`w-1/6 rounded-t-sm transition-all duration-300 ${i === 2 ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                            style={{ height: `${height}%` }}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-mono mt-1">
                    <span>H1</span><span>H3</span><span>H5</span><span>H7</span><span>H9</span><span>H11</span>
                </div>
            </div>
        </div>
    );
}
