
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAllBuildingsSensor } from '../../hooks/useSocket';
import { API_URL, getAuthHeaders } from '../../config/api';

// Electricity rate: PLN Indonesia ~Rp 1,444.70/kWh ≈ $0.089/kWh
const ELECTRICITY_RATE_PER_KWH = 0.089;
// Carbon emission factor: Indonesia grid ~0.000776 ton CO₂/kWh (PLN 2023)
const CARBON_FACTOR_TON_PER_KWH = 0.000776;
// Daily budget cap for progress bar (USD)
const DAILY_BUDGET_USD = 700;

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherDescription: string;
    weatherIcon: string;
    city: string;
}

export function KPISidebar() {
    const { totalPower, avgPowerFactor, buildingCount } = useAllBuildingsSensor();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const prevPower = useRef(0);

    const fetchWeather = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/weather/current`, {
                headers: getAuthHeaders(),
            });
            const json = await res.json();
            if (json.success) {
                setWeather(json.data);
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchWeather();
        const weatherInterval = setInterval(fetchWeather, 10 * 60 * 1000);
        return () => clearInterval(weatherInterval);
    }, [fetchWeather]);

    // Derive KPI values from live sensor data
    const hasSensorData = totalPower > 0;
    // totalPower is in kW (real-time from all buildings)
    const consumptionKW = totalPower;
    // Cost per hour = power(kW) × rate($/kWh) × 1 hour
    const costPerHour = consumptionKW * ELECTRICITY_RATE_PER_KWH;
    // Carbon per hour = power(kW) × factor(ton/kWh) × 1 hour
    const carbonPerHour = consumptionKW * CARBON_FACTOR_TON_PER_KWH;
    // Budget progress (cost so far in current hour vs daily budget / 24)
    const hourlyBudget = DAILY_BUDGET_USD / 24;
    const budgetPercent = hourlyBudget > 0 ? Math.min(Math.round((costPerHour / hourlyBudget) * 100), 100) : 0;

    // Change vs previous reading
    const powerChange = prevPower.current > 0
        ? ((totalPower - prevPower.current) / prevPower.current * 100)
        : 0;
    useEffect(() => {
        if (totalPower > 0) prevPower.current = totalPower;
    }, [totalPower]);

    const changeIcon = powerChange > 0.1 ? 'trending_up' : powerChange < -0.1 ? 'trending_down' : 'trending_flat';
    const changeColor = powerChange > 0.1 ? 'text-warning' : powerChange < -0.1 ? 'text-success' : 'text-slate-500';
    const changeText = Math.abs(powerChange) > 0.1 ? `${powerChange > 0 ? '+' : ''}${powerChange.toFixed(1)}%` : '0.0%';

    // Format display
    const consumptionDisplay = hasSensorData
        ? (consumptionKW > 1000 ? (consumptionKW / 1000).toFixed(2) : consumptionKW.toFixed(1))
        : '--';
    const consumptionUnit = consumptionKW > 1000 ? 'MW' : 'kW';
    const carbonDisplay = hasSensorData ? carbonPerHour.toFixed(3) : '--';
    const costDisplay = hasSensorData ? `$${costPerHour.toFixed(2)}` : '--';

    // Mobile card data
    const cards = [
        {
            title: 'Live Power',
            value: consumptionDisplay,
            unit: consumptionUnit,
            icon: 'bolt',
            iconColor: 'text-primary',
            change: changeText,
            changeColor,
        },
        {
            title: 'Carbon / Hr',
            value: carbonDisplay,
            unit: 'ton CO₂',
            icon: 'eco',
            iconColor: 'text-green-500',
            change: changeText,
            changeColor,
        },
        {
            title: 'Cost / Hr',
            value: costDisplay,
            unit: '',
            icon: 'attach_money',
            iconColor: 'text-slate-400',
            progress: budgetPercent,
        },
    ];

    return (
        <>
            {/* Mobile: Horizontal cards */}
            <div className="lg:hidden flex gap-3">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white dark:bg-surface-dark rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 min-w-[140px] shrink-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide truncate">{card.title}</h3>
                            <span className={`material-symbols-outlined ${card.iconColor} text-[16px]`}>{card.icon}</span>
                        </div>
                        <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                            {card.value}
                            {card.unit && <span className="text-xs font-sans font-normal text-slate-500 ml-1">{card.unit}</span>}
                        </p>
                        {card.change && (
                            <p className={`text-[10px] ${card.changeColor} mt-1 flex items-center gap-0.5`}>
                                <span className="material-symbols-outlined text-[12px]">{changeIcon}</span>
                                {card.change}
                            </p>
                        )}
                        {card.progress !== undefined && (
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1 mt-2">
                                <div className="bg-primary h-1 rounded-full" style={{ width: `${card.progress}%` }}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Desktop: Vertical sidebar */}
            <aside className="hidden lg:flex w-full flex-col gap-4 shrink-0 overflow-y-auto pr-1">
                {/* Live Power */}
                <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Live Power</h3>
                        <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                    </div>
                    <div className="mt-1">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {consumptionDisplay} <span className="text-sm font-sans font-normal text-slate-500">{consumptionUnit}</span>
                        </p>
                        {hasSensorData && (
                            <div className="flex items-center gap-2 mt-1">
                                <p className={`text-xs ${changeColor} flex items-center gap-1`}>
                                    <span className="material-symbols-outlined text-[14px]">{changeIcon}</span>
                                    {changeText}
                                </p>
                                <span className="text-[10px] text-slate-500">{buildingCount} buildings</span>
                            </div>
                        )}
                    </div>
                </div>
                {/* Carbon Footprint */}
                <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Carbon / Hr</h3>
                        <span className="material-symbols-outlined text-green-500 text-[20px]">eco</span>
                    </div>
                    <div className="mt-1">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {carbonDisplay} <span className="text-sm font-sans font-normal text-slate-500">ton CO₂</span>
                        </p>
                        {hasSensorData && (
                            <p className="text-xs text-slate-500 mt-1">
                                PF {avgPowerFactor.toFixed(2)} avg
                            </p>
                        )}
                    </div>
                </div>
                {/* Cost Per Hour */}
                <div className="bg-white dark:bg-surface-dark rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Cost / Hr</h3>
                        <span className="material-symbols-outlined text-slate-400 text-[20px]">attach_money</span>
                    </div>
                    <div className="mt-1">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                            {costDisplay}
                        </p>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-3">
                            <div className={`h-1.5 rounded-full ${budgetPercent > 80 ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${budgetPercent}%` }}></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">
                            {budgetPercent}% of hourly budget
                        </p>
                    </div>
                </div>
                {/* Weather Widget — live from Open-Meteo */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 shadow-sm border border-slate-700 flex flex-col gap-2 mt-auto">
                    <div className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[28px] ${
                            weather?.weatherIcon === 'sunny' ? 'text-yellow-400' :
                            weather?.weatherIcon === 'rainy' || weather?.weatherIcon === 'grain' ? 'text-blue-400' :
                            weather?.weatherIcon === 'thunderstorm' ? 'text-purple-400' :
                            'text-slate-300'
                        }`}>{weather?.weatherIcon || 'cloud'}</span>
                        <div>
                            <p className="text-white font-bold text-lg">{weather ? `${weather.temperature}°C` : '--'}</p>
                            <p className="text-xs text-slate-400 uppercase font-semibold">{weather?.city || '--'}</p>
                        </div>
                    </div>
                    {weather && (
                        <p className="text-[10px] text-slate-500 -mt-1">{weather.weatherDescription}</p>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-700">
                        <div>
                            <p className="text-[10px] text-slate-500">HUMIDITY</p>
                            <p className="text-xs text-slate-300 font-mono">{weather ? `${weather.humidity}%` : '--'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500">WIND</p>
                            <p className="text-xs text-slate-300 font-mono">{weather ? `${weather.windSpeed} km/h` : '--'}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
