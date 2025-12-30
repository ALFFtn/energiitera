import { Router } from 'express';
import { analyticsService } from '../services/analyticsService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get consumption data
router.get('/consumption', authenticate, async (req, res, next) => {
    try {
        const { from, to, buildingId, departmentId } = req.query;
        const data = await analyticsService.getConsumption({
            from: from ? new Date(from as string) : undefined,
            to: to ? new Date(to as string) : undefined,
            buildingId: buildingId as string | undefined,
            departmentId: departmentId as string | undefined,
        });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get KPI summary
router.get('/kpis', authenticate, async (req, res, next) => {
    try {
        const { campusId, from, to } = req.query;
        const data = await analyticsService.getKPIs(
            campusId as string,
            from && to
                ? { from: new Date(from as string), to: new Date(to as string) }
                : undefined
        );
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get department breakdown
router.get('/department-breakdown', authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId as string;
        const data = await analyticsService.getDepartmentBreakdown(campusId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get hourly trend
router.get('/hourly-trend', authenticate, async (req, res, next) => {
    try {
        const { campusId, date } = req.query;
        const data = await analyticsService.getHourlyTrend(
            campusId as string,
            date ? new Date(date as string) : undefined
        );
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

// Get power factor trend
router.get('/power-factor-trend', authenticate, async (req, res, next) => {
    try {
        const { buildingId, days } = req.query;
        const data = await analyticsService.getPowerFactorTrend(
            buildingId as string | undefined,
            days ? parseInt(days as string) : undefined
        );
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
