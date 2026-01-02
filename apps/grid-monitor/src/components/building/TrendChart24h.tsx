import { useState, useEffect, useRef } from 'react';

interface TrendChart24hProps {
    currentValue: number;
    label?: string;
    unit?: string;
    color?: string;
}

interface DataPoint {
    time: Date;
    value: number;
}

const MAX_DATA_POINTS = 144; // 24 hours at 10-minute intervals

export function TrendChart24h({
    currentValue,
    label = 'Power Consumption',
    unit = 'kW',
    color = '#0d59f2'
}: TrendChart24hProps) {
    const [history, setHistory] = useState<DataPoint[]>([]);
    const lastValueRef = useRef(currentValue);
    const lastUpdateRef = useRef(Date.now());

    // Add new data point when value changes significantly or every 10 seconds
    useEffect(() => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateRef.current;
        const valueChanged = Math.abs(currentValue - lastValueRef.current) > 0.5;

        if (valueChanged || timeSinceLastUpdate > 10000) {
            lastValueRef.current = currentValue;
            lastUpdateRef.current = now;

            setHistory(prev => {
                const newHistory = [...prev, { time: new Date(), value: currentValue }];
                return newHistory.slice(-MAX_DATA_POINTS);
            });
        }
    }, [currentValue]);

    // Generate chart path
    const generateChartPath = () => {
        if (history.length < 2) return null;

        const width = 300;
        const height = 100;
        const padding = 5;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const values = history.map(d => d.value);
        const minVal = Math.min(...values) * 0.95;
        const maxVal = Math.max(...values) * 1.05;
        const valueRange = maxVal - minVal || 1;

        const points = history.map((d, i) => {
            const x = padding + (i / (history.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((d.value - minVal) / valueRange) * chartHeight;
            return { x, y: Math.max(padding, Math.min(height - padding, y)) };
        });

        // Create smooth path
        let pathD = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
            const cp2x = points[i - 1].x + (2 * (points[i].x - points[i - 1].x)) / 3;
            pathD += ` C${cp1x},${points[i - 1].y} ${cp2x},${points[i].y} ${points[i].x},${points[i].y}`;
        }

        // Area fill path
        const areaPath = `${pathD} L${points[points.length - 1].x},${height - padding} L${padding},${height - padding} Z`;

        return { linePath: pathD, areaPath, lastPoint: points[points.length - 1], minVal, maxVal };
    };

    const pathData = generateChartPath();

    // Calculate stats
    const stats = history.length > 0 ? {
        current: currentValue,
        min: Math.min(...history.map(d => d.value)),
        max: Math.max(...history.map(d => d.value)),
        avg: history.reduce((sum, d) => sum + d.value, 0) / history.length,
    } : null;

    // Format time labels
    const getTimeLabels = () => {
        if (history.length < 2) return [];
        const first = history[0].time;
        return [
            first.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            'Now'
        ];
    };

    const timeLabels = getTimeLabels();

    return (
        <div className="bg-white dark:bg-[#1e232e] border border-slate-200 dark:border-[#282e39] rounded-xl p-5 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{label}</h3>
                    <p className="text-xs text-slate-500">Real-time trend</p>
                </div>
                {stats && (
                    <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                            {stats.current.toFixed(1)} <span className="text-sm font-normal text-slate-500">{unit}</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Chart */}
            <div className="relative w-full h-40">
                {history.length < 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-2xl block mb-1">show_chart</span>
                            <p>Collecting data...</p>
                            <p className="text-xs">{history.length} point(s)</p>
                        </div>
                    </div>
                ) : (
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 100">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(y => (
                            <line
                                key={y}
                                className="text-slate-100 dark:text-slate-800"
                                stroke="currentColor"
                                strokeWidth="1"
                                x1="0" x2="300" y1={y} y2={y}
                            />
                        ))}

                        {/* Gradient definition */}
                        <defs>
                            <linearGradient id="trendGradient24h" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area Fill */}
                        {pathData?.areaPath && (
                            <path
                                d={pathData.areaPath}
                                fill="url(#trendGradient24h)"
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Line stroke */}
                        {pathData?.linePath && (
                            <path
                                d={pathData.linePath}
                                fill="none"
                                stroke={color}
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                className="transition-all duration-300"
                            />
                        )}

                        {/* Active Point */}
                        {pathData?.lastPoint && (
                            <circle
                                cx={pathData.lastPoint.x}
                                cy={pathData.lastPoint.y}
                                fill={color}
                                r="4"
                                stroke="white"
                                strokeWidth="2"
                                className="animate-pulse"
                            />
                        )}
                    </svg>
                )}
            </div>

            {/* Time Labels */}
            {timeLabels.length > 0 && (
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>{timeLabels[0]}</span>
                    <span>{timeLabels[1]}</span>
                </div>
            )}

            {/* Stats */}
            {stats && history.length > 1 && (
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase">Min</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{stats.min.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase">Avg</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{stats.avg.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-500 uppercase">Max</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{stats.max.toFixed(1)}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
