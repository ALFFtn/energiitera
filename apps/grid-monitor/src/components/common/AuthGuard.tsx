import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            // Basic JWT validation - check if token is expired
            try {
                const parts = token.split('.');
                if (parts.length !== 3) {
                    throw new Error('Invalid token format');
                }

                const payload = JSON.parse(atob(parts[1]));
                const exp = payload.exp;

                if (exp && Date.now() >= exp * 1000) {
                    // Token expired, clear and redirect
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } catch {
                // Invalid token
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            }

            setIsChecking(false);
        };

        checkAuth();
    }, []);

    // Show loading while checking auth
    if (isChecking) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
                    <p className="text-slate-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login page with return URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

// Hook to check if user is authenticated
export function useAuth() {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    const user = userStr ? JSON.parse(userStr) : null;
    const isAuthenticated = !!token;

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return { isAuthenticated, user, token, logout };
}
