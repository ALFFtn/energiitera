import { useState } from 'react';
import { MonitoringHeader } from '../components/monitoring/MonitoringHeader';
import { MonitoringSidebar } from '../components/monitoring/MonitoringSidebar';
import { BuildingGrid } from '../components/monitoring/BuildingGrid';
import { MonitoringRightSidebar } from '../components/monitoring/MonitoringRightSidebar';
import { AddBuildingModal } from '../components/monitoring/AddBuildingModal';

export function Monitoring() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    const handleBuildingCreated = (building: { id: string; name: string }) => {
        console.log('Building created:', building);
        // Show success notification
        alert(`Building "${building.name}" created successfully!`);
        // Refresh building grid
        setRefreshKey(prev => prev + 1);
    };

    const handleZoneSelect = (zoneCode: string | null) => {
        setSelectedZone(zoneCode);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            <MonitoringHeader />
            <div className="flex flex-1 overflow-hidden">
                <MonitoringSidebar
                    selectedZone={selectedZone}
                    onZoneSelect={handleZoneSelect}
                />
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {/* Breadcrumbs */}
                        <nav className="flex items-center text-sm text-slate-500 dark:text-[#9ca6ba]">
                            <a className="hover:text-primary transition-colors" href="/">Dashboard</a>
                            <span className="material-symbols-outlined text-base mx-2">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-medium">Buildings</span>
                            {selectedZone && (
                                <>
                                    <span className="material-symbols-outlined text-base mx-2">chevron_right</span>
                                    <span className="text-slate-900 dark:text-white font-medium">Zone {selectedZone}</span>
                                </>
                            )}
                        </nav>

                        {/* Page Header */}
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                                    {selectedZone ? `Zone ${selectedZone}` : 'Campus Buildings'}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-sm">
                                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium border border-green-500/20 text-xs">
                                        <span className="size-1.5 rounded-full bg-green-500"></span>
                                        <span className="hidden sm:inline">All Systems</span> Operational
                                    </span>
                                    <span className="text-slate-500 dark:text-[#9ca6ba] text-xs">Live</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3">
                                {/* Mobile: Icon only buttons */}
                                <button className="flex items-center justify-center h-9 md:h-10 px-3 md:px-4 rounded-lg border border-slate-200 dark:border-[#282e39] bg-white dark:bg-[#1e232e] text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-[#282e39] font-medium text-sm transition-colors">
                                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">download</span>
                                    <span className="hidden sm:inline ml-2">Export</span>
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center justify-center h-9 md:h-10 px-3 md:px-4 rounded-lg bg-primary text-white hover:bg-blue-600 font-medium text-sm transition-colors shadow-lg shadow-primary/25"
                                >
                                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">add</span>
                                    <span className="hidden sm:inline ml-2">Add Building</span>
                                </button>
                            </div>
                        </div>

                        {/* Main Grid Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <BuildingGrid key={refreshKey} selectedZone={selectedZone} />
                            <MonitoringRightSidebar />
                        </div>

                        <footer className="mt-12 mb-6 text-center text-xs text-slate-400 dark:text-slate-600">
                            <p>© 2024 PowerGrid OS. All systems nominal.</p>
                        </footer>
                    </div>
                </main>
            </div>

            {/* Add Building Modal */}
            <AddBuildingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleBuildingCreated}
            />
        </div>
    );
}
