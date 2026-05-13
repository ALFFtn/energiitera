// API Configuration
// Uses environment variables from .env, with fallback to window.location for network access
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl;

    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:3001`;
    }

    // Production behind nginx: use same origin so /api/ and /socket.io/ are proxied.
    return '';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export const api = {
    baseUrl: API_URL,
    endpoints: {
        auth: {
            login: `${API_URL}/api/auth/login`,
            register: `${API_URL}/api/auth/register`,
            refresh: `${API_URL}/api/auth/refresh`,
        },
        buildings: `${API_URL}/api/buildings`,
        campuses: `${API_URL}/api/campuses`,
        zones: `${API_URL}/api/zones`,
        grid: {
            ticker: `${API_URL}/api/grid/ticker`,
            powerDistribution: `${API_URL}/api/grid/power-distribution`,
        },
        analytics: {
            kpis: `${API_URL}/api/analytics/kpis`,
            departmentBreakdown: `${API_URL}/api/analytics/department-breakdown`,
            hourlyTrend: `${API_URL}/api/analytics/hourly-trend`,
        },
        alerts: {
            list: `${API_URL}/api/alerts`,
            active: `${API_URL}/api/alerts/active`,
            counts: `${API_URL}/api/alerts/counts`,
        },
        weather: {
            current: `${API_URL}/api/weather/current`,
        },
    },
};

// Helper to get auth headers
export function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}
