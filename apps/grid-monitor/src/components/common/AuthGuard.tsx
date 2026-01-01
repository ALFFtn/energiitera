import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface AuthGuardProps {
    children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const location = useLocation();
    const token = localStorage.getItem('accessToken');

    if (!token) {
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
