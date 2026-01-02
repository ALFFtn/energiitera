import { useState, useEffect, useRef } from 'react';

interface DataPoint {
    time: Date;
    value: number;
}

interface ParameterChartProps {
    // Available parameters to select from
    voltage_r?: number;
    voltage_s?: number;
    voltage_t?: number;
    current_r?: number;
    current_s?: number;
    current_t?: number;
    power?: number;
    power_factor?: number;
    frequency?: number;
    temperature?: number;
}

const PARAMETER_CONFIG: Record<string, { label: string; unit: string; color: string; min: number; max: number }> = {
    voltage_r: { label: 'Voltage Phase R', unit: 'V', color: '#22d3ee', min: 200, max: 260 },
    voltage_s: { label: 'Voltage Phase S', unit: 'V', color: '#facc15', min: 200, max: 260 },
    voltage_t: { label: 'Voltage Phase T', unit: 'V', color: '#3b82f6', min: 200, max: 260 },
    current_r: { label: 'Current Phase R', unit: 'A', color: '#22d3ee', min: 0, max: 300 },
    current_s: { label: 'Current Phase S', unit: 'A', color: '#facc15', min: 0, max: 300 },
    current_t: { label: 'Current Phase T', unit: 'A', color: '#3b82f6', min: 0, max: 300 },
    power: { label: 'Active Power', unit: 'kW', color: '#f59e0b', min: 0, max: 200 },
    power_factor: { label: 'Power Factor', unit: '', color: '#a855f7', min: 0.7, max: 1.0 },
    frequency: { label: 'Frequency', unit: 'Hz', color: '#10b981', min: 49.5, max: 50.5 },
    temperature: { label: 'Temperature', unit: '°C', color: '#ef4444', min: 20, max: 60 },
};

const MAX_DATA_POINTS = 60; // Keep last 60 data points (2 minutes at 2s interval)

export function ParameterChart(props: ParameterChartProps) {
    const [selectedParam, setSelectedParam] = useState<string>('voltage_r');
    const [history, setHistory] = useState<Record<string, DataPoint[]>>({});
    const prevValuesRef = useRef<Record<string, number>>({});

    // Track value changes and add to history
    useEffect(() => {
        const now = new Date();
        const updates: Record<string, DataPoint[]> = {};

        Object.entries(props).forEach(([param, value]) => {
            if (value !== undefined && value !== prevValuesRef.current[param]) {
                const currentHistory = history[param] || [];
                const newHistory = [...currentHistory, { time: now, value }].slice(-MAX_DATA_POINTS);
                updates[param] = newHistory;
                prevValuesRef.current[param] = value;
            }
        });

        if (Object.keys(updates).length > 0) {
            setHistory(prev => ({ ...prev, ...updates }));
        }
    }, [props, history]);

    const config = PARAMETER_CONFIG[selectedParam];
    const data = history[selectedParam] || [];
    const currentValue = props[selectedParam as keyof ParameterChartProps] ?? 0;

    // Generate SVG path from data
    const generatePath = (): { linePath: string; fillPath: string; points: { x: number; y: number }[]; minVal: number; maxVal: number } | null => {
        if (data.length < 2) return null;

        const width = 600;
        const height = 280;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const minVal = config?.min ?? Math.min(...data.map(d => d.value)) * 0.95;
        const maxVal = config?.max ?? Math.max(...data.map(d => d.value)) * 1.05;
        const valueRange = maxVal - minVal || 1;

        const points = data.map((d, i) => {
            const x = padding + (i / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((d.value - minVal) / valueRange) * chartHeight;
            return { x, y: Math.max(padding, Math.min(height - padding, y)) };
        });

        // Create smooth path using cardinal spline
        let pathD = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
            const cp2x = points[i - 1].x + (2 * (points[i].x - points[i - 1].x)) / 3;
            pathD += ` C${cp1x},${points[i - 1].y} ${cp2x},${points[i].y} ${points[i].x},${points[i].y}`;
        }

        // Create fill path
        const fillD = `${pathD} L${points[points.length - 1].x},${height - padding} L${padding},${height - padding} Z`;

        return { linePath: pathD, fillPath: fillD, points, minVal, maxVal };
    };

    const pathData = generatePath();

    // Format time for axis
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <div className="glass-panel rounded-2xl p-6 bg-card-dark/75 backdrop-blur-md border border-white/10 shadow-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-white text-lg font-bold">Parameter History</h3>
                    <p className="text-slate-400 text-sm">Real-time data visualization</p>
                </div>

                {/* Parameter Selector */}
                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedParam}
                        onChange={(e) => setSelectedParam(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <optgroup label="Voltage">
                            <option value="voltage_r">Voltage Phase R</option>
                            <option value="voltage_s">Voltage Phase S</option>
                            <option value="voltage_t">Voltage Phase T</option>
                        </optgroup>
                        <optgroup label="Current">
                            <option value="current_r">Current Phase R</option>
                            <option value="current_s">Current Phase S</option>
                            <option value="current_t">Current Phase T</option>
                        </optgroup>
                        <optgroup label="Power">
                            <option value="power">Active Power</option>
                            <option value="power_factor">Power Factor</option>
                        </optgroup>
                        <optgroup label="Other">
                            <option value="frequency">Frequency</option>
                            <option value="temperature">Temperature</option>
                        </optgroup>
                    </select>
                </div>
            </div>

            {/* Current Value Display */}
            <div className="flex items-center gap-4 mb-4">
                <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: config?.color }}
                />
                <span className="text-2xl font-black text-white tabular-nums">
                    {typeof currentValue === 'number' ? currentValue.toFixed(2) : '0.00'}
                </span>
                <span className="text-slate-400">{config?.unit}</span>
                <span className="text-slate-500 text-sm ml-auto">
                    {data.length} data points
                </span>
            </div>

            {/* Chart */}
            <div className="relative h-[320px] w-full bg-slate-900/50 rounded-xl overflow-hidden border border-white/5">
                {data.length < 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-3xl mb-2 block">show_chart</span>
                            <p>Waiting for data...</p>
                            <p className="text-xs mt-1">Chart will appear after receiving 2+ data points</p>
                        </div>
                    </div>
                ) : (
                    <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={`gradient-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={config?.color} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={config?.color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <g className="text-slate-700">
                            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                                <line
                                    key={ratio}
                                    x1="40"
                                    y1={40 + ratio * 200}
                                    x2="560"
                                    y2={40 + ratio * 200}
                                    stroke="currentColor"
                                    strokeOpacity="0.3"
                                    strokeDasharray="4"
                                />
                            ))}
                        </g>

                        {/* Y-axis labels */}
                        {pathData && (
                            <>
                                <text x="35" y="45" textAnchor="end" fill="#94a3b8" fontSize="10">
                                    {pathData.maxVal?.toFixed(1)}
                                </text>
                                <text x="35" y="240" textAnchor="end" fill="#94a3b8" fontSize="10">
                                    {pathData.minVal?.toFixed(1)}
                                </text>
                            </>
                        )}

                        {/* Fill area */}
                        {pathData?.fillPath && (
                            <path
                                d={pathData.fillPath}
                                fill={`url(#gradient-${selectedParam})`}
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Line */}
                        {pathData?.linePath && (
                            <path
                                d={pathData.linePath}
                                fill="none"
                                stroke={config?.color}
                                strokeWidth="2"
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Current point */}
                        {pathData?.points && pathData.points.length > 0 && (
                            <circle
                                cx={pathData.points[pathData.points.length - 1].x}
                                cy={pathData.points[pathData.points.length - 1].y}
                                r="5"
                                fill={config?.color}
                                className="animate-pulse"
                            />
                        )}
                    </svg>
                )}

                {/* Time labels */}
                {data.length >= 2 && (
                    <div className="absolute bottom-2 left-10 right-10 flex justify-between text-[10px] text-slate-500">
                        <span>{formatTime(data[0].time)}</span>
                        <span>{formatTime(data[data.length - 1].time)}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            {data.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Min</p>
                        <p className="text-lg font-bold text-white tabular-nums">
                            {Math.min(...data.map(d => d.value)).toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Avg</p>
                        <p className="text-lg font-bold text-white tabular-nums">
                            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-2 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Max</p>
                        <p className="text-lg font-bold text-white tabular-nums">
                            {Math.max(...data.map(d => d.value)).toFixed(2)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
