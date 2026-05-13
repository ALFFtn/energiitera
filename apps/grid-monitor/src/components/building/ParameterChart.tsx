import { useState, useEffect, useRef } from 'react';
import { API_URL } from '../../config/api';

interface DataPoint {
    time: Date;
    value: number;
}

interface ParameterChartProps {
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
    buildingId?: string;
}

const PARAMETER_CONFIG: Record<string, { label: string; unit: string; color: string }> = {
    voltage_r:    { label: 'Voltage Phase R', unit: 'V',  color: '#22d3ee' },
    voltage_s:    { label: 'Voltage Phase S', unit: 'V',  color: '#facc15' },
    voltage_t:    { label: 'Voltage Phase T', unit: 'V',  color: '#3b82f6' },
    current_r:    { label: 'Current Phase R', unit: 'A',  color: '#22d3ee' },
    current_s:    { label: 'Current Phase S', unit: 'A',  color: '#facc15' },
    current_t:    { label: 'Current Phase T', unit: 'A',  color: '#3b82f6' },
    power:        { label: 'Active Power',    unit: 'kW', color: '#f59e0b' },
    power_factor: { label: 'Power Factor',    unit: '',   color: '#a855f7' },
    frequency:    { label: 'Frequency',       unit: 'Hz', color: '#10b981' },
    temperature:  { label: 'Temperature',     unit: '°C', color: '#ef4444' },
};

const MAX_LIVE_POINTS = 60;

const TIME_RANGES = [
    { key: '1h',  label: '1 Jam',    hours: 1,   bucketSec: 30   },
    { key: '1d',  label: '1 Hari',   hours: 24,  bucketSec: 300  },
    { key: '3d',  label: '3 Hari',   hours: 72,  bucketSec: 900  },
    { key: '1w',  label: '1 Minggu', hours: 168, bucketSec: 1800 },
    { key: '1mo', label: '1 Bulan',  hours: 720, bucketSec: 7200 },
] as const;
type TimeRangeKey = typeof TIME_RANGES[number]['key'];

const PARAM_TO_DB_COLUMN: Record<string, string> = {
    voltage_r:    'voltageR',
    voltage_s:    'voltageS',
    voltage_t:    'voltageT',
    current_r:    'currentR',
    current_s:    'currentS',
    current_t:    'currentT',
    power:        'power',
    power_factor: 'powerFactor',
    frequency:    'frequency',
    temperature:  'temperature',
};

// SVG layout constants
const SVG_W = 600;
const SVG_H = 300;
const PAD_L = 48;  // left (Y labels)
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;  // bottom (time labels)
const CHART_W = SVG_W - PAD_L - PAD_R;
const CHART_H = SVG_H - PAD_T - PAD_B;

export function ParameterChart(props: ParameterChartProps) {
    const [selectedParam, setSelectedParam] = useState<string>('voltage_r');
    const [timeRange, setTimeRange] = useState<TimeRangeKey>('1d');
    const [history, setHistory] = useState<Record<string, DataPoint[]>>({});
    const prevValuesRef = useRef<Record<string, number>>({});
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Fetch historical data whenever buildingId or timeRange changes
    useEffect(() => {
        if (!props.buildingId) return;

        const range = TIME_RANGES.find(r => r.key === timeRange)!;
        const now = new Date();
        const from = new Date(now.getTime() - range.hours * 3_600_000);
        const token = localStorage.getItem('accessToken');

        fetch(
            `${API_URL}/api/buildings/${props.buildingId}/readings` +
            `?from=${from.toISOString()}&to=${now.toISOString()}&bucket=${range.bucketSec}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(r => r.json())
            .then(json => {
                if (!json.success || !Array.isArray(json.data)) return;
                // bucketed data comes ASC; non-bucketed comes DESC so reverse
                const readings = json.data[0]?.voltageR !== undefined
                    ? json.data            // bucketed → already ASC
                    : [...json.data].reverse();
                const allHistory: Record<string, DataPoint[]> = {};
                for (const r of readings) {
                    const ts = new Date(r.timestamp);
                    for (const [paramKey, dbCol] of Object.entries(PARAM_TO_DB_COLUMN)) {
                        const raw = r[dbCol];
                        if (raw != null) {
                            const value = typeof raw === 'string' ? parseFloat(raw) : Number(raw);
                            if (!isNaN(value) && value !== 0) {
                                if (!allHistory[paramKey]) allHistory[paramKey] = [];
                                allHistory[paramKey].push({ time: ts, value });
                            }
                        }
                    }
                }
                setHistory(allHistory);
                setHoverIdx(null);
            })
            .catch(err => console.warn('Could not fetch parameter history:', err));
    }, [props.buildingId, timeRange]);

    // Append live sensor updates (only in short ranges where realtime makes sense)
    useEffect(() => {
        if (timeRange !== '1h' && timeRange !== '1d') return;
        const now = new Date();
        const updates: Record<string, DataPoint[]> = {};

        Object.entries(props).forEach(([param, value]) => {
            if (param === 'buildingId') return;
            if (value !== undefined && typeof value === 'number' && value !== 0 && value !== prevValuesRef.current[param]) {
                const currentHistory = history[param] || [];
                updates[param] = [...currentHistory, { time: now, value }].slice(-MAX_LIVE_POINTS);
                prevValuesRef.current[param] = value;
            }
        });

        if (Object.keys(updates).length > 0) {
            setHistory(prev => ({ ...prev, ...updates }));
        }
    }, [props, history, timeRange]);

    const config = PARAMETER_CONFIG[selectedParam];
    const data = history[selectedParam] || [];
    const currentValue = props[selectedParam as keyof ParameterChartProps] ?? 0;

    // Compute dynamic Y range — fits the actual data with padding so the line breathes
    const computeRange = () => {
        if (data.length < 1) return { minVal: 0, maxVal: 100 };
        const vals = data.map(d => d.value);
        const lo = Math.min(...vals);
        const hi = Math.max(...vals);
        const spread = hi - lo;
        // Give at least 5% of the value or 1 unit of breathing room
        const pad = Math.max(spread * 0.25, Math.abs(lo) * 0.005, 1);
        return { minVal: lo - pad, maxVal: hi + pad };
    };

    const { minVal, maxVal } = computeRange();
    const valueRange = maxVal - minVal || 1;

    // Map a value to SVG Y coordinate
    const toY = (v: number) =>
        PAD_T + CHART_H - ((v - minVal) / valueRange) * CHART_H;

    // Map index to SVG X coordinate
    const toX = (i: number) =>
        PAD_L + (data.length > 1 ? (i / (data.length - 1)) * CHART_W : 0);

    // Build SVG paths
    const generatePath = () => {
        if (data.length < 2) return null;

        const points = data.map((d, i) => ({
            x: toX(i),
            y: Math.max(PAD_T, Math.min(PAD_T + CHART_H, toY(d.value))),
        }));

        let pathD = `M${points[0].x},${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const cp1x = points[i - 1].x + (points[i].x - points[i - 1].x) / 3;
            const cp2x = points[i - 1].x + (2 * (points[i].x - points[i - 1].x)) / 3;
            pathD += ` C${cp1x},${points[i - 1].y} ${cp2x},${points[i].y} ${points[i].x},${points[i].y}`;
        }

        const bottom = PAD_T + CHART_H;
        const fillD = `${pathD} L${points[points.length - 1].x},${bottom} L${PAD_L},${bottom} Z`;

        return { linePath: pathD, fillPath: fillD, points };
    };

    const pathData = generatePath();

    // Y-axis labels (5 ticks)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
        y: PAD_T + ratio * CHART_H,
        label: (maxVal - ratio * valueRange).toFixed(
            valueRange < 5 ? 2 : valueRange < 20 ? 1 : 0
        ),
    }));

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!pathData?.points || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = ((e.clientX - rect.left) / rect.width) * SVG_W;
        let closest = 0;
        let minDist = Infinity;
        for (let i = 0; i < pathData.points.length; i++) {
            const d = Math.abs(pathData.points[i].x - svgX);
            if (d < minDist) { minDist = d; closest = i; }
        }
        setHoverIdx(closest);
    };

    const formatTime = (date: Date): string => {
        const range = TIME_RANGES.find(r => r.key === timeRange)!;
        if (range.hours <= 24) {
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        if (range.hours <= 72) {
            return date.toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' });
    };

    return (
        <div className="rounded-2xl p-6 bg-white dark:bg-card-dark/75 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
                <div>
                    <h3 className="text-slate-900 dark:text-white text-lg font-bold">Parameter History</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Visualisasi data sensor</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Time range selector */}
                    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 text-xs font-semibold">
                        {TIME_RANGES.map(r => (
                            <button
                                key={r.key}
                                onClick={() => setTimeRange(r.key)}
                                className={`px-3 py-2 transition-colors ${
                                    timeRange === r.key
                                        ? 'bg-primary text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    {/* Parameter select */}
                    <select
                        value={selectedParam}
                        onChange={(e) => { setSelectedParam(e.target.value); setHoverIdx(null); }}
                        className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
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

            {/* Current value */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-3 h-3 rounded-full animate-pulse flex-shrink-0" style={{ backgroundColor: config?.color }} />
                <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {typeof currentValue === 'number' ? currentValue.toFixed(2) : '0.00'}
                </span>
                <span className="text-slate-400 dark:text-slate-500 text-lg">{config?.unit}</span>
                <span className="text-slate-400 dark:text-slate-500 text-sm ml-auto">{data.length} data points</span>
            </div>

            {/* Chart */}
            <div className="relative w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5 overflow-hidden transition-colors" style={{ height: '280px' }}>
                {data.length < 2 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl mb-2 block">show_chart</span>
                            <p className="text-sm font-medium">Waiting for data...</p>
                            <p className="text-xs mt-1 text-slate-400">Chart will appear after 2+ data points</p>
                        </div>
                    </div>
                ) : (
                    <svg
                        ref={svgRef}
                        className="w-full h-full cursor-crosshair"
                        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                        preserveAspectRatio="none"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setHoverIdx(null)}
                    >
                        <defs>
                            <linearGradient id={`grad-${selectedParam}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={config?.color} stopOpacity="0.35" />
                                <stop offset="85%" stopColor={config?.color} stopOpacity="0.05" />
                                <stop offset="100%" stopColor={config?.color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Horizontal grid lines + Y labels */}
                        {yTicks.map(({ y, label }) => (
                            <g key={y}>
                                <line
                                    x1={PAD_L} y1={y} x2={SVG_W - PAD_R} y2={y}
                                    stroke="currentColor"
                                    strokeOpacity="0.25"
                                    strokeDasharray="4,4"
                                    className="text-slate-300 dark:text-slate-600"
                                />
                                <text
                                    x={PAD_L - 6}
                                    y={y + 3.5}
                                    textAnchor="end"
                                    fontSize="9"
                                    className="fill-slate-400 dark:fill-slate-500"
                                    fill="currentColor"
                                >
                                    {label}
                                </text>
                            </g>
                        ))}

                        {/* Fill */}
                        {pathData?.fillPath && (
                            <path d={pathData.fillPath} fill={`url(#grad-${selectedParam})`} />
                        )}

                        {/* Line */}
                        {pathData?.linePath && (
                            <path
                                d={pathData.linePath}
                                fill="none"
                                stroke={config?.color}
                                strokeWidth="2"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                            />
                        )}

                        {/* Live dot */}
                        {pathData?.points && pathData.points.length > 0 && (
                            <>
                                <circle
                                    cx={pathData.points[pathData.points.length - 1].x}
                                    cy={pathData.points[pathData.points.length - 1].y}
                                    r="7"
                                    fill={config?.color}
                                    fillOpacity="0.2"
                                    className="animate-pulse"
                                />
                                <circle
                                    cx={pathData.points[pathData.points.length - 1].x}
                                    cy={pathData.points[pathData.points.length - 1].y}
                                    r="4"
                                    fill={config?.color}
                                    stroke="white"
                                    strokeWidth="1.5"
                                />
                            </>
                        )}

                        {/* Hover crosshair */}
                        {hoverIdx !== null && pathData?.points?.[hoverIdx] && (
                            <>
                                <line
                                    x1={pathData.points[hoverIdx].x} y1={PAD_T}
                                    x2={pathData.points[hoverIdx].x} y2={PAD_T + CHART_H}
                                    stroke={config?.color}
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                    strokeOpacity="0.7"
                                />
                                <circle
                                    cx={pathData.points[hoverIdx].x}
                                    cy={pathData.points[hoverIdx].y}
                                    r="5"
                                    fill="white"
                                    stroke={config?.color}
                                    strokeWidth="2"
                                />
                            </>
                        )}

                        {/* Time axis labels (inside SVG so they scale with chart) */}
                        {data.length >= 2 && (
                            <>
                                <text
                                    x={PAD_L}
                                    y={SVG_H - 6}
                                    fontSize="9"
                                    className="fill-slate-400 dark:fill-slate-500"
                                    fill="currentColor"
                                >
                                    {formatTime(data[0].time)}
                                </text>
                                <text
                                    x={SVG_W - PAD_R}
                                    y={SVG_H - 6}
                                    fontSize="9"
                                    textAnchor="end"
                                    className="fill-slate-400 dark:fill-slate-500"
                                    fill="currentColor"
                                >
                                    {formatTime(data[data.length - 1].time)}
                                </text>
                            </>
                        )}
                    </svg>
                )}

                {/* Hover tooltip */}
                {hoverIdx !== null && pathData?.points?.[hoverIdx] && data[hoverIdx] && (
                    <div
                        className="absolute pointer-events-none bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 whitespace-nowrap z-10"
                        style={{
                            left: `${(pathData.points[hoverIdx].x / SVG_W) * 100}%`,
                            top: `${(pathData.points[hoverIdx].y / SVG_H) * 100}%`,
                            transform: `translate(-50%, ${pathData.points[hoverIdx].y / SVG_H < 0.25 ? '12px' : '-110%'})`,
                        }}
                    >
                        <div className="font-bold tabular-nums" style={{ color: config?.color }}>
                            {data[hoverIdx].value.toFixed(2)} <span className="text-white">{config?.unit}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">{formatTime(data[hoverIdx].time)}</div>
                    </div>
                )}
            </div>

            {/* Min / Avg / Max stats */}
            {data.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                    {[
                        { label: 'MIN', value: Math.min(...data.map(d => d.value)) },
                        { label: 'AVG', value: data.reduce((s, d) => s + d.value, 0) / data.length },
                        { label: 'MAX', value: Math.max(...data.map(d => d.value)) },
                    ].map(({ label, value }) => (
                        <div key={label} className="text-center py-3 px-2 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{value.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
