import { useState, useEffect } from 'react';

interface ConfigureSensorModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingId: string;
    buildingCode: string;
    buildingName: string;
    zoneCode: string;
}

interface SensorParameter {
    key: string;
    name: string;
    unit: string;
    enabled: boolean;
    mqttTopic: string;
}

const DEFAULT_PARAMETERS: Omit<SensorParameter, 'mqttTopic'>[] = [
    { key: 'voltage_r', name: 'Voltage Phase R', unit: 'V', enabled: true },
    { key: 'voltage_s', name: 'Voltage Phase S', unit: 'V', enabled: true },
    { key: 'voltage_t', name: 'Voltage Phase T', unit: 'V', enabled: true },
    { key: 'current_r', name: 'Current Phase R', unit: 'A', enabled: true },
    { key: 'current_s', name: 'Current Phase S', unit: 'A', enabled: true },
    { key: 'current_t', name: 'Current Phase T', unit: 'A', enabled: true },
    { key: 'power', name: 'Active Power', unit: 'kW', enabled: true },
    { key: 'power_factor', name: 'Power Factor', unit: '', enabled: true },
    { key: 'frequency', name: 'Frequency', unit: 'Hz', enabled: true },
    { key: 'temperature', name: 'Temperature', unit: '°C', enabled: true },
    { key: 'energy', name: 'Energy Consumption', unit: 'kWh', enabled: false },
    { key: 'thd_v', name: 'THD Voltage', unit: '%', enabled: false },
    { key: 'thd_i', name: 'THD Current', unit: '%', enabled: false },
];

export function ConfigureSensorModal({
    isOpen,
    onClose,
    buildingId,
    buildingCode,
    buildingName,
    zoneCode
}: ConfigureSensorModalProps) {
    const [sensorId, setSensorId] = useState('LVMDP-01');
    const [parameters, setParameters] = useState<SensorParameter[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    // Generate MQTT topics when modal opens or sensor ID changes
    useEffect(() => {
        if (isOpen) {
            const baseTopic = `energy/buildings/${zoneCode.toLowerCase()}/${buildingCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${sensorId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

            const params = DEFAULT_PARAMETERS.map(p => ({
                ...p,
                mqttTopic: `${baseTopic}/${p.key}`,
            }));
            setParameters(params);
        }
    }, [isOpen, sensorId, buildingCode, zoneCode]);

    const handleToggleParameter = (key: string) => {
        setParameters(prev => prev.map(p =>
            p.key === key ? { ...p, enabled: !p.enabled } : p
        ));
    };

    const handleCopyTopic = (topic: string, key: string) => {
        navigator.clipboard.writeText(topic);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleCopyAllTopics = () => {
        const enabledTopics = parameters
            .filter(p => p.enabled)
            .map(p => `${p.name}: ${p.mqttTopic}`)
            .join('\n');
        navigator.clipboard.writeText(enabledTopics);
        setCopied('all');
        setTimeout(() => setCopied(null), 2000);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // TODO: Save sensor configuration to backend
            // For now, just close the modal
            alert('Sensor configuration saved!\n\nNote: MQTT topics have been generated. Configure your LVMDP device to publish to these topics.');
            onClose();
        } catch (err) {
            console.error('Failed to save sensor config:', err);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const baseTopic = `energy/buildings/${zoneCode.toLowerCase()}/${buildingCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}/${sensorId.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const enabledCount = parameters.filter(p => p.enabled).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1e232e] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden border border-slate-200 dark:border-[#282e39] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#282e39]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <span className="material-symbols-outlined text-primary">settings</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Configure LVMDP Sensor</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{buildingName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Sensor ID */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Sensor ID
                        </label>
                        <input
                            type="text"
                            value={sensorId}
                            onChange={(e) => setSensorId(e.target.value.toUpperCase())}
                            placeholder="e.g., LVMDP-01"
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-[#282e39] border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                        />
                        <p className="mt-1 text-xs text-slate-500">Unique identifier for this LVMDP sensor</p>
                    </div>

                    {/* Base Topic Preview */}
                    <div className="p-4 bg-slate-50 dark:bg-[#282e39] rounded-lg border border-slate-200 dark:border-[#3b4354]">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Base MQTT Topic</span>
                            </div>
                            <button
                                onClick={handleCopyAllTopics}
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">
                                    {copied === 'all' ? 'check' : 'content_copy'}
                                </span>
                                {copied === 'all' ? 'Copied!' : 'Copy All'}
                            </button>
                        </div>
                        <code className="text-sm text-primary font-mono break-all">{baseTopic}</code>
                    </div>

                    {/* Parameters */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Sensor Parameters ({enabledCount} enabled)
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {parameters.map((param) => (
                                <div
                                    key={param.key}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${param.enabled
                                            ? 'bg-white dark:bg-[#1e232e] border-slate-200 dark:border-[#3b4354]'
                                            : 'bg-slate-50 dark:bg-[#161a21] border-slate-100 dark:border-[#282e39] opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleToggleParameter(param.key)}
                                            className={`w-10 h-6 rounded-full transition-colors relative ${param.enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${param.enabled ? 'left-5' : 'left-1'
                                                    }`}
                                            />
                                        </button>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{param.name}</p>
                                            {param.unit && <p className="text-xs text-slate-400">{param.unit}</p>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-[#282e39] px-2 py-1 rounded max-w-[300px] truncate">
                                            {param.mqttTopic}
                                        </code>
                                        <button
                                            onClick={() => handleCopyTopic(param.mqttTopic, param.key)}
                                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors"
                                            title="Copy topic"
                                        >
                                            <span className="material-symbols-outlined text-[16px] text-slate-400">
                                                {copied === param.key ? 'check' : 'content_copy'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MQTT Configuration Help */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-blue-500 text-[20px] mt-0.5">info</span>
                            <div className="text-sm">
                                <p className="font-medium text-blue-700 dark:text-blue-400 mb-1">MQTT Configuration</p>
                                <p className="text-blue-600 dark:text-blue-300 text-xs">
                                    Configure your LVMDP device to publish sensor data to these topics.
                                    The system will subscribe to <code className="bg-blue-100 dark:bg-blue-500/20 px-1 rounded">{baseTopic}/#</code> to receive all parameters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-[#282e39]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-[#3b4354] rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#282e39] font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !sensorId}
                        className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-600 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">save</span>
                                Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
