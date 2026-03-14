"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authService_js_1 = require("../services/authService.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
// Validation schemas
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
const registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        role: zod_1.z.enum(['admin', 'engineer', 'operator']).optional(),
    }),
});
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string(),
    }),
});
// Routes
router.post('/register', (0, validate_js_1.validate)(registerSchema), async (req, res, next) => {
    try {
        const user = await authService_js_1.authService.register(req.body);
        res.status(201).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
});
router.post('/login', (0, validate_js_1.validate)(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService_js_1.authService.login(email, password);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.post('/logout', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        await authService_js_1.authService.logout(req.user.userId, refreshToken);
        res.json({ success: true, message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/refresh', (0, validate_js_1.validate)(refreshSchema), async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService_js_1.authService.refresh(refreshToken);
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const profile = await authService_js_1.authService.getProfile(req.user.userId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map