import { Router } from 'express';
import { z } from 'zod';
import { panelService } from '../services/panelService.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Validation schemas
const thresholdSchema = z.object({
    body: z.object({
        metric: z.string(),
        minWarning: z.number().optional(),
        maxWarning: z.number().optional(),
        minCritical: z.number().optional(),
        maxCritical: z.number().optional(),
    }),
});

// Get panels by building
router.get('/buildings/:buildingId/panels', authenticate, async (req, res, next) => {
    try {
        const panels = await panelService.getPanelsByBuilding(req.params.buildingId);
        res.json({ success: true, data: panels });
    } catch (error) {
        next(error);
    }
});

// Get all panels with readings (for monitoring view)
router.get('/panels', authenticate, async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId as string | undefined;
        const panels = await panelService.getAllPanelsWithReadings(buildingId);
        res.json({ success: true, data: panels });
    } catch (error) {
        next(error);
    }
});

// Get single panel with details
router.get('/panels/:id', authenticate, async (req, res, next) => {
    try {
        const panel = await panelService.getPanelById(req.params.id);
        res.json({ success: true, data: panel });
    } catch (error) {
        next(error);
    }
});

// Update panel
router.put('/panels/:id', authenticate, async (req, res, next) => {
    try {
        const panel = await panelService.updatePanel(req.params.id, req.body);
        res.json({ success: true, data: panel });
    } catch (error) {
        next(error);
    }
});

// Toggle maintenance mode
router.post('/panels/:id/maintenance', authenticate, async (req, res, next) => {
    try {
        const { enabled } = req.body;
        const panel = await panelService.toggleMaintenanceMode(req.params.id, enabled);
        res.json({ success: true, data: panel });
    } catch (error) {
        next(error);
    }
});

// Get panel readings
router.get('/panels/:id/readings', authenticate, async (req, res, next) => {
    try {
        const { from, to, limit } = req.query;
        const readings = await panelService.getReadings(req.params.id, {
            from: from ? new Date(from as string) : undefined,
            to: to ? new Date(to as string) : undefined,
            limit: limit ? parseInt(limit as string) : undefined,
        });
        res.json({ success: true, data: readings });
    } catch (error) {
        next(error);
    }
});

// Get panel events
router.get('/panels/:id/events', authenticate, async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
        const events = await panelService.getEvents(req.params.id, limit);
        res.json({ success: true, data: events });
    } catch (error) {
        next(error);
    }
});

// Get panel thresholds
router.get('/panels/:id/thresholds', authenticate, async (req, res, next) => {
    try {
        const thresholds = await panelService.getThresholds(req.params.id);
        res.json({ success: true, data: thresholds });
    } catch (error) {
        next(error);
    }
});

// Set panel threshold
router.post('/panels/:id/thresholds', authenticate, validate(thresholdSchema), async (req, res, next) => {
    try {
        const threshold = await panelService.setThreshold(req.params.id, req.body);
        res.json({ success: true, data: threshold });
    } catch (error) {
        next(error);
    }
});

export default router;
