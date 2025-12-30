import { Router } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schemas
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        role: z.enum(['admin', 'engineer', 'operator']).optional(),
    }),
});

const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string(),
    }),
});

// Routes
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', authenticate, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService.logout(req.user!.userId, refreshToken);
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refresh(refreshToken);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

router.get('/me', authenticate, async (req, res, next) => {
    try {
        const profile = await authService.getProfile(req.user!.userId);
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
});

export default router;
