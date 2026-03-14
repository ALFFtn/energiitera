// Weather service using Open-Meteo API (free, no API key required)
// Docs: https://open-meteo.com/en/docs

import { env } from '../config/env';

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    weatherDescription: string;
    weatherIcon: string;
    city: string;
    timestamp: string;
}

interface OpenMeteoResponse {
    current: {
        temperature_2m: number;
        relative_humidity_2m: number;
        wind_speed_10m: number;
        weather_code: number;
    };
}

// In-memory cache to avoid excessive API calls
let cachedWeather: WeatherData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// WMO Weather interpretation codes → description & Material icon
function interpretWeatherCode(code: number): { description: string; icon: string } {
    if (code === 0) return { description: 'Clear sky', icon: 'sunny' };
    if (code <= 3) return { description: 'Partly cloudy', icon: 'partly_cloudy_day' };
    if (code <= 48) return { description: 'Foggy', icon: 'foggy' };
    if (code <= 57) return { description: 'Drizzle', icon: 'grain' };
    if (code <= 67) return { description: 'Rain', icon: 'rainy' };
    if (code <= 77) return { description: 'Snow', icon: 'weather_snowy' };
    if (code <= 82) return { description: 'Rain showers', icon: 'rainy' };
    if (code <= 99) return { description: 'Thunderstorm', icon: 'thunderstorm' };
    return { description: 'Unknown', icon: 'cloud' };
}

export async function getCurrentWeather(): Promise<WeatherData> {
    const now = Date.now();

    // Return cached data if fresh
    if (cachedWeather && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        return cachedWeather;
    }

    const lat = (env as Record<string, unknown>).WEATHER_LAT as number ?? -6.2088;
    const lon = (env as Record<string, unknown>).WEATHER_LON as number ?? 106.8456;
    const city = ((env as Record<string, unknown>).WEATHER_CITY as string) ?? 'Jakarta';

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Open-Meteo API returned ${res.status}`);
    }

    const data = (await res.json()) as OpenMeteoResponse;
    const current = data.current;
    const { description, icon } = interpretWeatherCode(current.weather_code);

    cachedWeather = {
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        weatherDescription: description,
        weatherIcon: icon,
        city,
        timestamp: new Date().toISOString(),
    };
    cacheTimestamp = now;

    return cachedWeather;
}
