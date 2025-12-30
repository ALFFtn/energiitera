
import { PanelHeader } from '../components/panel/PanelHeader';
import { VoltageGauge } from '../components/panel/VoltageGauge';
import { CurrentGauge } from '../components/panel/CurrentGauge';
import { PowerFactorGauge } from '../components/panel/PowerFactorGauge';
import { PhaseLoadBalance } from '../components/panel/PhaseLoadBalance';
import { SignalQuality } from '../components/panel/SignalQuality';
import { PanelControls } from '../components/panel/PanelControls';
import { EventLog } from '../components/panel/EventLog';
import { ProfileMenu } from '../components/common/ProfileMenu';

export function PanelDetail() {
    return (
        <div className="bg-background-dark text-white font-display min-h-screen flex flex-col overflow-x-hidden selection:bg-primary selection:text-white">
            {/* Top Navigation - extracted from HTML header, or reuse generic one if available. 
          For now using the HTML's header logic but maybe inside MainLayout if exists.
          The provided HTML had a header. I'll include a simple version here or assume global layout.
          The user context suggests standardizing. I'll stick to a simple page wrapper similar to others.
      */}
            <header className="flex items-center justify-between border-b border-white/10 bg-[#111318] px-6 py-3 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
                        <span className="material-symbols-outlined text-[24px]">electric_bolt</span>
                    </div>
                    <div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-tight">PowerMonitor OS</h2>
                        <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Engineer Console v2.4</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-300">System Nominal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">notifications</span></button>
                        <button className="text-slate-400 hover:text-white transition-colors"><span className="material-symbols-outlined">settings</span></button>
                        <ProfileMenu />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                <PanelHeader />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Row 1 */}
                    <VoltageGauge />
                    <CurrentGauge />
                    <PowerFactorGauge />

                    {/* Row 2 */}
                    <PhaseLoadBalance />
                    <SignalQuality />

                    {/* Row 3 */}
                    <PanelControls />
                    <EventLog />
                </div>
            </main>
        </div>
    );
}
