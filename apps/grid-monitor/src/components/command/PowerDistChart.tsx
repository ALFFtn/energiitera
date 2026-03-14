
import { useState, useEffect, useCallback } from 'react';
import { API_URL, getAuthHeaders } from '../../config/api';

interface DistData {
    hour: number;
    powerKw: number;
}

export function PowerDistChart() {
    const [distData, setDistData] = useState<DistData[]>([]);
    const [unit, setUnit] = useState<'KW' | 'AMPS'>('KW');

    const fetchDistribution = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/grid/power-distribution?campusId=default`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (json.success) {
                setDistData(json.data);
            }
        } catch {
            // Keep showing last data
        }
    }, []);

    useEffect(() => {
        fetchDistribution();
        const interval = setInterval(fetchDistribution, 30000);
        return () => clearInterval(interval);
    }, [fetchDistribution]);

    const maxVal = Math.max(...distData.map(d => d.powerKw), 1);

    const bars = distData.length > 0
        ? distData.map((d, i) => {
            const pct = Math.max((d.powerKw / maxVal) * 100, 5);
            const isRecent = i >= distData.length - 5;
            return { height: `${pct}%`, color: isRecent ? 'bg-primary' : 'bg-primary/40' };
        })
        : Array.from({ length: 40 }, (_, i) => ({
            height: `${Math.floor(Math.random() * 60) + 20}%`,
            color: i > 35 ? 'bg-primary' : 'bg-primary/40',
        }));

    return (
        <div className="h-48 bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">24H Power Distribution</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setUnit('KW')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${unit === 'KW' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                    >
                        KW
                    </button>
                    <button
                        onClick={() => setUnit('AMPS')}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${unit === 'AMPS' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                    >
                        AMPS
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full flex items-end justify-between gap-1 pt-2">
                <div className="w-full h-full flex items-end gap-[1%]">
                    {bars.map((bar, index) => (
                        <div key={index} className={`${bar.color} hover:bg-primary transition-colors w-full rounded-t-sm`} style={{ height: bar.height }}></div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1 uppercase">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>Now</span>
            </div>
        </div>
    );
}
