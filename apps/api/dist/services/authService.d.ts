export declare class AuthService {
    register(data: {
        email: string;
        password: string;
        name: string;
        role?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            avatarUrl: string | null;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string, refreshToken: string): Promise<boolean>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        avatarUrl: string | null;
        createdAt: Date;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
}
export declare const authService: AuthService;
//# sourceMappingURL=authService.d.ts.map