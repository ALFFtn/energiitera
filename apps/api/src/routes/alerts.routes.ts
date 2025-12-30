import { Router } from 'express';
import { alertService } from '../services/alertService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all alerts with filters
router.get('/', authenticate, async (req, res, next) => {
    try {
        const { status, severity, limit } = req.query;
        const alerts = await alertService.getAlerts({
            status: status as string | undefined,
            severity: severity as string | undefined,
            limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json({ success: true, data: alerts });
    } catch (error) {
        next(error);
    }
});

// Get active alerts
router.get('/active', authenticate, async (_req, res, next) => {
    try {
        const alerts = await alertService.getActiveAlerts();
        res.json({ success: true, data: alerts });
    } catch (error) {
        next(error);
    }
});

// Get alert counts by severity
router.get('/counts', authenticate, async (_req, res, next) => {
    try {
        const counts = await alertService.getAlertCounts();
        res.json({ success: true, data: counts });
    } catch (error) {
        next(error);
    }
});

// Get single alert
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const alert = await alertService.getAlertById(req.params.id);
        res.json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
});

// Acknowledge alert
router.post('/:id/acknowledge', authenticate, async (req, res, next) => {
    try {
        const alert = await alertService.acknowledgeAlert(req.params.id, req.user!.userId);
        res.json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
});

// Resolve alert
router.post('/:id/resolve', authenticate, async (req, res, next) => {
    try {
        const alert = await alertService.resolveAlert(req.params.id);
        res.json({ success: true, data: alert });
    } catch (error) {
        next(error);
    }
});

export default router;
