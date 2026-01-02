// API Configuration
// Uses environment variables from .env, with fallback to window.location for network access
const getApiUrl = () => {
    // Check if environment variable is set
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // Fallback: use current hostname (useful for network access)
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
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
    },
};
