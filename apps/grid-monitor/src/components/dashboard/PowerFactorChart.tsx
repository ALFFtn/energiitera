

export function PowerFactorChart() {
    return (
        <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-border-dark shadow-sm flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-border-dark">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Power Factor History</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Efficiency rating (Target: 1.0)</p>
            </div>
            <div className="flex-1 p-6 relative">
                <div className="relative w-full h-[200px]">
                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                        <defs>
                            <linearGradient id="pfGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"></stop>
                                <stop offset="100%" stopColor="#10b981" stopOpacity="0"></stop>
                            </linearGradient>
                        </defs>
                        <path d="M0,150 C50,140 100,50 150,60 C200,70 250,40 300,50 C350,60 380,80 400,90 L400,200 L0,200 Z" fill="url(#pfGradient)"></path>
                        <path d="M0,150 C50,140 100,50 150,60 C200,70 250,40 300,50 C350,60 380,80 400,90" fill="none" stroke="#10b981" strokeWidth="2"></path>
                    </svg>
                    <div className="absolute top-2 right-2 text-emerald-500 font-bold text-2xl">0.96</div>
                    <div className="absolute bottom-2 left-2 text-xs text-slate-400">Min: 0.85</div>
                    <div className="absolute bottom-2 right-2 text-xs text-slate-400">Max: 0.99</div>
                </div>
            </div>
        </div>
    );
}
