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
        // Sengaja tidak ada field `role` di sini: endpoint ini publik (tanpa
        // `authenticate`), jadi kalau klien boleh kirim role sendiri, siapa
        // pun bisa daftar sebagai 'admin' langsung lewat request mentah.
        // Semua akun baru selalu dibuat sebagai 'viewer' -- lihat authService.register().
    }),
});

const refreshSchema = z.object({
    body: z.object({
        refreshToken: z.string(),
    }),
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    }),
});

// Routes
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        // Pakai field satu-satu, BUKAN `req.body` mentah: `validate()` cuma
        // memvalidasi, tidak mengganti req.body dengan hasil parse Zod yang
        // sudah di-strip (lihat middleware/validate.ts) -- jadi kalau di sini
        // diteruskan req.body apa adanya, klien tetap bisa menyelipkan field
        // `role: "admin"` sendiri walau sudah dihapus dari registerSchema.
        const { email, password, name } = req.body;
        const user = await authService.register({ email, password, name });
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

// Ganti password sendiri -- siapa pun yang login boleh, tidak perlu admin.
// Tidak pakai req.body mentah (sama alasannya dgn /register di atas):
// destructure field yang dipakai saja.
router.put('/change-password', authenticate, validate(changePasswordSchema), async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        await authService.changePassword(req.user!.userId, currentPassword, newPassword);
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
