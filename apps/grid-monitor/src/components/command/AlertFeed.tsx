

export function AlertFeed() {
    return (
        <aside className="w-80 flex flex-col bg-surface-darker rounded-lg border border-slate-800 overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase text-white tracking-wide flex items-center gap-2">
                    <span className="material-symbols-outlined text-danger text-[18px]">warning</span>
                    Alert Log
                </h3>
                <span className="text-[10px] font-bold bg-danger text-white px-1.5 py-0.5 rounded">3 NEW</span>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                {/* Alert Item: Critical */}
                <div className="bg-[#1f2937] border-l-4 border-danger p-3 rounded shadow-sm hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">10:42 AM</span>
                        <span className="text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded border border-danger/20">CRITICAL</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5 group-hover:text-danger transition-colors">HVAC Unit 4 Failure</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Science Labs (Zone D) - Temperature rising rapidly. Check compressor.</p>
                    <div className="mt-2 flex gap-2">
                        <button className="flex-1 bg-danger/10 hover:bg-danger text-danger hover:text-white text-[10px] font-bold py-1 rounded transition-colors">ACKNOWLEDGE</button>
                    </div>
                </div>
                {/* Alert Item: Warning */}
                <div className="bg-[#1f2937] border-l-4 border-warning p-3 rounded shadow-sm hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">10:30 AM</span>
                        <span className="text-[10px] font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded border border-warning/20">WARNING</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5 group-hover:text-warning transition-colors">Voltage Spike Detected</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Dorms (West) - Transient voltage surge detected on Main Bus B.</p>
                </div>
                {/* Alert Item: Info */}
                <div className="bg-[#1f2937] border-l-4 border-primary p-3 rounded shadow-sm hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">10:15 AM</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">INFO</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5">Scheduled Maintenance</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Admin Hall - Generator test completed successfully.</p>
                </div>
                {/* Alert Item: Resolved */}
                <div className="bg-[#1f2937] border-l-4 border-success p-3 rounded shadow-sm opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">09:55 AM</span>
                        <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20">RESOLVED</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-300 mb-0.5">Network Latency</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Backbone Switch 02 - Latency returned to normal levels.</p>
                </div>
                {/* Alert Item: Info */}
                <div className="bg-[#1f2937] border-l-4 border-slate-500 p-3 rounded shadow-sm hover:bg-slate-800 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-mono text-slate-400">08:00 AM</span>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-700/30 px-1.5 py-0.5 rounded border border-slate-600/20">LOG</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mb-0.5">Shift Change</h4>
                    <p className="text-[11px] text-slate-400 leading-tight">Operator ID: #8821 logged in.</p>
                </div>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                <button className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors uppercase">
                    View System Logs
                </button>
            </div>
        </aside>
    );
}
