import { useState, useEffect } from 'react';

interface Zone {
    id: string;
    code: string;
    name: string;
}

interface AddBuildingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (building: BuildingResult) => void;
}

interface BuildingResult {
    id: string;
    name: string;
    code: string;
}

export function AddBuildingModal({ isOpen, onClose, onSuccess }: AddBuildingModalProps) {
    const [formData, setFormData] = useState({
        zoneId: '',
        name: '',
        code: '',
        description: '',
        gridConnection: 'primary',
    });
    const [zones, setZones] = useState<Zone[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingZones, setIsLoadingZones] = useState(false);
    const [error, setError] = useState('');

    // Fetch zones from API when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchZones();
        }
    }, [isOpen]);

    const fetchZones = async () => {
        setIsLoadingZones(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:3001/api/campuses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success && data.data.length > 0) {
                // Flatten zones from all campuses
                const allZones: Zone[] = [];
                for (const campus of data.data) {
                    if (campus.zones) {
                        for (const zone of campus.zones) {
                            allZones.push({
                                id: zone.id,
                                code: zone.code,
                                name: `${zone.name} (${campus.name})`,
                            });
                        }
                    }
                }
                setZones(allZones);
            }
        } catch (err) {
            console.error('Failed to fetch zones:', err);
            setError('Failed to load zones');
        } finally {
            setIsLoadingZones(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch('http://localhost:3001/api/buildings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create building');
            }

            onSuccess(data.data);
            onClose();

            // Reset form
            setFormData({
                zoneId: '',
                name: '',
                code: '',
                description: '',
                gridConnection: 'primary',
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1e232e] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden border border-slate-200 dark:border-[#282e39]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#282e39]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">add_home</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Building</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Register a new building with LVMDP sensor</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Zone Select */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Zone <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.zoneId}
                            onChange={(e) => setFormData({ ...formData, zoneId: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                            disabled={isLoadingZones}
                        >
                            <option value="">
                                {isLoadingZones ? 'Loading zones...' : 'Select a zone...'}
                            </option>
                            {zones.map(zone => (
                                <option key={zone.id} value={zone.id}>
                                    {zone.name} ({zone.code})
                                </option>
                            ))}
                        </select>
                        {zones.length === 0 && !isLoadingZones && (
                            <p className="mt-1 text-xs text-orange-500">No zones found. Please seed the database first.</p>
                        )}
                    </div>

                    {/* Building Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Building Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Engineering Quad"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Building Code */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Building Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., ENG-01"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                            required
                        />
                        <p className="mt-1 text-xs text-slate-500">Unique identifier for the building</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the building..."
                            rows={2}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Grid Connection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Grid Connection
                        </label>
                        <select
                            value={formData.gridConnection}
                            onChange={(e) => setFormData({ ...formData, gridConnection: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="primary">Primary</option>
                            <option value="secondary">Secondary</option>
                            <option value="backup">Backup</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39] font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.zoneId || !formData.name || !formData.code}
                            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Create Building
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
