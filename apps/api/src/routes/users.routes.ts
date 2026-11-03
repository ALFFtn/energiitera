import { Router } from 'express';
import { z } from 'zod';
import { eq, count } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../db/schema/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authService } from '../services/authService.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// Seluruh route di file ini admin-only — viewer tidak boleh melihat daftar
// user ataupun mengubahnya sama sekali.
router.use(authenticate, authorize('admin'));

async function adminCount(): Promise<number> {
    const [row] = await db.select({ value: count() }).from(users).where(eq(users.role, 'admin'));
    return row?.value ?? 0;
}

// GET /api/users — daftar semua user (tanpa passwordHash)
router.get('/users', async (_req, res, next) => {
    try {
        const rows = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .orderBy(users.createdAt);

        res.json({ success: true, data: rows });
    } catch (error) {
        next(error);
    }
});

const createUserSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(2, 'Name must be at least 2 characters'),
        role: z.enum(['admin', 'viewer']),
    }),
});

// POST /api/users — admin membuat akun baru dengan role pilihan admin
// (satu-satunya jalur bikin akun baru sekarang, karena endpoint publik
// /auth/register tidak ada UI pendaftarannya dan selalu jadi 'viewer').
router.post('/users', validate(createUserSchema), async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        const user = await authService.register({ email, password, name, role });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

const updateRoleSchema = z.object({
    body: z.object({
        role: z.enum(['admin', 'viewer']),
    }),
});

// PUT /api/users/:id/role
router.put('/users/:id/role', validate(updateRoleSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const target = await db.query.users.findFirst({ where: eq(users.id, id) });
        if (!target) {
            throw new AppError('User not found', 404);
        }

        // Jangan sampai admin terakhir diturunkan jadi viewer — sistem bisa
        // terkunci total (tidak ada lagi yang bisa kelola user/gedung).
        if (target.role === 'admin' && role !== 'admin' && (await adminCount()) <= 1) {
            throw new AppError('Tidak bisa menurunkan admin terakhir', 400);
        }

        await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));

        const updated = await db.query.users.findFirst({ where: eq(users.id, id) });
        res.json({
            success: true,
            data: { id: updated!.id, email: updated!.email, name: updated!.name, role: updated!.role },
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/users/:id
router.delete('/users/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user!.userId === id) {
            throw new AppError('Tidak bisa menghapus akun sendiri', 400);
        }

        const target = await db.query.users.findFirst({ where: eq(users.id, id) });
        if (!target) {
            throw new AppError('User not found', 404);
        }

        if (target.role === 'admin' && (await adminCount()) <= 1) {
            throw new AppError('Tidak bisa menghapus admin terakhir', 400);
        }

        await db.delete(users).where(eq(users.id, id));
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
