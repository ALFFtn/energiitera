import { Router } from 'express';
import { z } from 'zod';
import { readingService } from '../services/readingService.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schemas
const readingSchema = z.object({
    body: z.object({
        panelId: z.string().uuid(),
        voltageLn: z.number().optional(),
        currentTotal: z.number().optional(),
        currentPhaseA: z.number().optional(),
        currentPhaseB: z.number().optional(),
        currentPhaseC: z.number().optional(),
        powerFactor: z.number().min(0).max(1).optional(),
        frequency: z.number().optional(),
        powerKw: z.number().optional(),
        energyKwh: z.number().optional(),
    }),
});

// Submit reading (for sensors/simulators)
router.post('/readings', authenticate, validate(readingSchema), async (req, res, next) => {
    try {
        const reading = await readingService.submitReading(req.body);
        res.status(201).json({ success: true, data: reading });
    } catch (error) {
        next(error);
    }
});

// Submit bulk readings
router.post('/readings/bulk', authenticate, async (req, res, next) => {
    try {
        const readings = await readingService.submitBulkReadings(req.body.readings);
        res.status(201).json({ success: true, data: readings });
    } catch (error) {
        next(error);
    }
});

// Get live grid metrics
router.get('/grid/live', authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId as string;
        const metrics = await readingService.getLatestGridMetrics(campusId);
        res.json({ success: true, data: metrics });
    } catch (error) {
        next(error);
    }
});

// Get live feed data for ticker
router.get('/grid/ticker', authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId as string;
        const data = await readingService.getLiveFeedData(campusId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get 24h power distribution
router.get('/grid/power-distribution', authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId as string;
        const data = await readingService.getPowerDistribution(campusId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
