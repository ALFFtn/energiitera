"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const alertService_js_1 = require("../services/alertService.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Get all alerts with filters
router.get('/', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { status, severity, limit } = req.query;
        const alerts = await alertService_js_1.alertService.getAlerts({
            status: status,
            severity: severity,
            limit: limit ? parseInt(limit) : undefined,
        });
        res.json({ success: true, data: alerts });
    }
    catch (error) {
        next(error);
    }
});
// Get active alerts
router.get('/active', auth_js_1.authenticate, async (_req, res, next) => {
    try {
        const alerts = await alertService_js_1.alertService.getActiveAlerts();
        res.json({ success: true, data: alerts });
    }
    catch (error) {
        next(error);
    }
});
// Get alert counts by severity
router.get('/counts', auth_js_1.authenticate, async (_req, res, next) => {
    try {
        const counts = await alertService_js_1.alertService.getAlertCounts();
        res.json({ success: true, data: counts });
    }
    catch (error) {
        next(error);
    }
});
// Get single alert
router.get('/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const alert = await alertService_js_1.alertService.getAlertById(req.params.id);
        res.json({ success: true, data: alert });
    }
    catch (error) {
        next(error);
    }
});
// Acknowledge alert
router.post('/:id/acknowledge', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const alert = await alertService_js_1.alertService.acknowledgeAlert(req.params.id, req.user.userId);
        res.json({ success: true, data: alert });
    }
    catch (error) {
        next(error);
    }
});
// Resolve alert
router.post('/:id/resolve', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const alert = await alertService_js_1.alertService.resolveAlert(req.params.id);
        res.json({ success: true, data: alert });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=alerts.routes.js.map