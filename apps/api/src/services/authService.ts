import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users, sessions, type NewUser } from '../db/schema/index.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errorHandler.js';
import type { JwtPayload } from '../middleware/auth.js';

export class AuthService {
    async register(data: { email: string; password: string; name: string; role?: string }) {
        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, data.email),
        });

        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.password, 12);

        // Create user
        const result = await db
            .insert(users)
            .values({
                email: data.email,
                passwordHash,
                name: data.name,
                role: data.role || 'operator',
            })
            .$returningId();

        const [user] = await db.select().from(users).where(eq(users.id, result[0].id));

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }

    async login(email: string, password: string) {
        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate tokens
        const accessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        const refreshToken = this.generateRefreshToken(user.id);

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

        await db.insert(sessions).values({
            userId: user.id,
            refreshToken: await bcrypt.hash(refreshToken, 10),
            expiresAt,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            accessToken,
            refreshToken,
        };
    }

    async logout(userId: string, refreshToken: string) {
        // Find and delete the session
        const userSessions = await db.query.sessions.findMany({
            where: eq(sessions.userId, userId),
        });

        for (const session of userSessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
            if (isMatch) {
                await db.delete(sessions).where(eq(sessions.id, session.id));
                return true;
            }
        }

        return false;
    }

    async refresh(refreshToken: string) {
        // Verify refresh token
        let decoded: { userId: string };
        try {
            decoded = jwt.verify(refreshToken, env.JWT_SECRET) as { userId: string };
        } catch {
            throw new AppError('Invalid refresh token', 401);
        }

        // Find session
        const userSessions = await db.query.sessions.findMany({
            where: eq(sessions.userId, decoded.userId),
        });

        let validSession = null;
        for (const session of userSessions) {
            const isMatch = await bcrypt.compare(refreshToken, session.refreshToken);
            if (isMatch && session.expiresAt > new Date()) {
                validSession = session;
                break;
            }
        }

        if (!validSession) {
            throw new AppError('Invalid or expired refresh token', 401);
        }

        // Get user
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.userId),
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Generate new access token
        const accessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return { accessToken };
    }

    async getProfile(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
        };
    }

    private generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: '15m', // 15 minutes
        });
    }

    private generateRefreshToken(userId: string): string {
        return jwt.sign({ userId }, env.JWT_SECRET, {
            expiresIn: '7d', // 7 days
        });
    }
}

export const authService = new AuthService();
