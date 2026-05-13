"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
const env_js_1 = require("../config/env.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class AuthService {
    async register(data) {
        // Check if user exists
        const existingUser = await database_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.users.email, data.email),
        });
        if (existingUser) {
            throw new errorHandler_js_1.AppError('Email already registered', 400);
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        // Create user
        const result = await database_js_1.db
            .insert(index_js_1.users)
            .values({
            email: data.email,
            passwordHash,
            name: data.name,
            role: data.role || 'operator',
        })
            .$returningId();
        const [user] = await database_js_1.db.select().from(index_js_1.users).where((0, drizzle_orm_1.eq)(index_js_1.users.id, result[0].id));
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
    }
    async login(email, password) {
        // Find user
        const user = await database_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.users.email, email),
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401);
        }
        // Verify password
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new errorHandler_js_1.AppError('Invalid credentials', 401);
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
        await database_js_1.db.insert(index_js_1.sessions).values({
            userId: user.id,
            refreshToken: await bcryptjs_1.default.hash(refreshToken, 10),
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
    async logout(userId, refreshToken) {
        // Find and delete the session
        const userSessions = await database_js_1.db.query.sessions.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.sessions.userId, userId),
        });
        for (const session of userSessions) {
            const isMatch = await bcryptjs_1.default.compare(refreshToken, session.refreshToken);
            if (isMatch) {
                await database_js_1.db.delete(index_js_1.sessions).where((0, drizzle_orm_1.eq)(index_js_1.sessions.id, session.id));
                return true;
            }
        }
        return false;
    }
    async refresh(refreshToken) {
        // Verify refresh token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(refreshToken, env_js_1.env.JWT_SECRET);
        }
        catch {
            throw new errorHandler_js_1.AppError('Invalid refresh token', 401);
        }
        // Find session
        const userSessions = await database_js_1.db.query.sessions.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.sessions.userId, decoded.userId),
        });
        let validSession = null;
        for (const session of userSessions) {
            const isMatch = await bcryptjs_1.default.compare(refreshToken, session.refreshToken);
            if (isMatch && session.expiresAt > new Date()) {
                validSession = session;
                break;
            }
        }
        if (!validSession) {
            throw new errorHandler_js_1.AppError('Invalid or expired refresh token', 401);
        }
        // Get user
        const user = await database_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.users.id, decoded.userId),
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found', 404);
        }
        // Generate new access token
        const accessToken = this.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return { accessToken };
    }
    async getProfile(userId) {
        const user = await database_js_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.users.id, userId),
        });
        if (!user) {
            throw new errorHandler_js_1.AppError('User not found', 404);
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
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_js_1.env.JWT_SECRET, {
            expiresIn: this.parseExpiry(env_js_1.env.JWT_EXPIRES_IN),
        });
    }
    generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, env_js_1.env.JWT_SECRET, {
            expiresIn: this.parseExpiry(env_js_1.env.JWT_REFRESH_EXPIRES_IN),
        });
    }
    // Convert env strings like '15m', '7d' to seconds for jwt.sign
    parseExpiry(duration) {
        const units = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
        const match = duration.match(/^(\d+)([smhdw])$/);
        return match ? parseInt(match[1]) * (units[match[2]] ?? 1) : 900;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map