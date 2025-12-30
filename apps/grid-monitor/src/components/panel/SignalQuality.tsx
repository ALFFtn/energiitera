

export function SignalQuality() {
    return (
        <div className="flex flex-col gap-6">
            {/* Frequency */}
            <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col justify-between bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Frequency</p>
                        <p className="text-2xl font-black text-white mt-1">60.01 <span className="text-sm font-medium text-slate-500">Hz</span></p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                </div>
                {/* Sparkline SVG placeholder */}
                <div className="h-12 w-full mt-2 relative overflow-hidden">
                    <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M0,20 Q10,18 20,20 T40,20 T60,22 T80,19 T100,20 T120,20 T140,21 T160,20 T180,20 L180,40 L0,40 Z" fill="rgba(16, 185, 129, 0.1)"></path>
                        <path d="M0,20 Q10,18 20,20 T40,20 T60,22 T80,19 T100,20 T120,20 T140,21 T160,20 T180,20" fill="none" stroke="#10b981" strokeWidth="2"></path>
                    </svg>
                </div>
            </div>
            {/* THD */}
            <div className="glass-panel rounded-2xl p-5 flex-1 flex flex-col justify-between bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">THD (Harmonics)</p>
                        <p className="text-2xl font-black text-white mt-1">2.4 <span className="text-sm font-medium text-slate-500">%</span></p>
                    </div>
                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                </div>
                {/* Micro Bar Chart for Harmonics */}
                <div className="flex items-end gap-1 h-12 mt-2">
                    <div className="w-1/6 bg-slate-700 h-[30%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[60%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary h-[80%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[40%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[20%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-slate-700 h-[10%] rounded-t-sm"></div>
                </div>
            </div>
        </div>
    );
}
