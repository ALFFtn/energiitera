"use strict";
// Weather service using Open-Meteo API (free, no API key required)
// Docs: https://open-meteo.com/en/docs
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWeather = getCurrentWeather;
const env_1 = require("../config/env");
// In-memory cache to avoid excessive API calls
let cachedWeather = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
// WMO Weather interpretation codes → description & Material icon
function interpretWeatherCode(code) {
    if (code === 0)
        return { description: 'Clear sky', icon: 'sunny' };
    if (code <= 3)
        return { description: 'Partly cloudy', icon: 'partly_cloudy_day' };
    if (code <= 48)
        return { description: 'Foggy', icon: 'foggy' };
    if (code <= 57)
        return { description: 'Drizzle', icon: 'grain' };
    if (code <= 67)
        return { description: 'Rain', icon: 'rainy' };
    if (code <= 77)
        return { description: 'Snow', icon: 'weather_snowy' };
    if (code <= 82)
        return { description: 'Rain showers', icon: 'rainy' };
    if (code <= 99)
        return { description: 'Thunderstorm', icon: 'thunderstorm' };
    return { description: 'Unknown', icon: 'cloud' };
}
async function getCurrentWeather() {
    const now = Date.now();
    // Return cached data if fresh
    if (cachedWeather && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        return cachedWeather;
    }
    const lat = env_1.env.WEATHER_LAT ?? -6.2088;
    const lon = env_1.env.WEATHER_LON ?? 106.8456;
    const city = env_1.env.WEATHER_CITY ?? 'Jakarta';
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code');
    url.searchParams.set('timezone', 'auto');
    const res = await fetch(url.toString());
    if (!res.ok) {
        throw new Error(`Open-Meteo API returned ${res.status}`);
    }
    const data = (await res.json());
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
//# sourceMappingURL=weatherService.js.map