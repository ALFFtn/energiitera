"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsService_js_1 = require("../services/analyticsService.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Get consumption data
router.get('/consumption', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { from, to, buildingId, departmentId } = req.query;
        const data = await analyticsService_js_1.analyticsService.getConsumption({
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            buildingId: buildingId,
            departmentId: departmentId,
        });
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
// Get KPI summary
router.get('/kpis', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { campusId, from, to } = req.query;
        const data = await analyticsService_js_1.analyticsService.getKPIs(campusId, from && to
            ? { from: new Date(from), to: new Date(to) }
            : undefined);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
// Get department breakdown
router.get('/department-breakdown', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId;
        const data = await analyticsService_js_1.analyticsService.getDepartmentBreakdown(campusId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
// Get hourly trend
router.get('/hourly-trend', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { campusId, date } = req.query;
        const data = await analyticsService_js_1.analyticsService.getHourlyTrend(campusId, date ? new Date(date) : undefined);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
// Get power factor trend
router.get('/power-factor-trend', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { buildingId, days } = req.query;
        const data = await analyticsService_js_1.analyticsService.getPowerFactorTrend(buildingId, days ? parseInt(days) : undefined);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map