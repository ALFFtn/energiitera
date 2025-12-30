

export function PowerDistChart() {
    const bars = Array.from({ length: 40 }).map((_, i) => {
        let height = Math.floor(Math.random() * 60) + 20;
        let color = 'bg-primary/40';
        if (i > 35) { height = Math.floor(Math.random() * 40) + 50; color = 'bg-primary'; } // recent spike
        return { height: `${height}%`, color };
    });

    return (
        <div className="h-48 bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">24H Power Distribution</h3>
                <div className="flex gap-2">
                    <button className="px-2 py-0.5 text-[10px] font-bold bg-primary text-white rounded">KW</button>
                    <button className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded hover:bg-slate-200 dark:hover:bg-slate-600">AMPS</button>
                </div>
            </div>
            <div className="flex-1 w-full flex items-end justify-between gap-1 pt-2">
                {/* Simulated Bar Chart */}
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
