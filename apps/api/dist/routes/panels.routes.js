"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const panelService_js_1 = require("../services/panelService.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
// Validation schemas
const thresholdSchema = zod_1.z.object({
    body: zod_1.z.object({
        metric: zod_1.z.string(),
        minWarning: zod_1.z.number().optional(),
        maxWarning: zod_1.z.number().optional(),
        minCritical: zod_1.z.number().optional(),
        maxCritical: zod_1.z.number().optional(),
    }),
});
// Get panels by building
router.get('/buildings/:buildingId/panels', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const panels = await panelService_js_1.panelService.getPanelsByBuilding(req.params.buildingId);
        res.json({ success: true, data: panels });
    }
    catch (error) {
        next(error);
    }
});
// Get all panels with readings (for monitoring view)
router.get('/panels', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const buildingId = req.query.buildingId;
        const panels = await panelService_js_1.panelService.getAllPanelsWithReadings(buildingId);
        res.json({ success: true, data: panels });
    }
    catch (error) {
        next(error);
    }
});
// Get single panel with details
router.get('/panels/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const panel = await panelService_js_1.panelService.getPanelById(req.params.id);
        res.json({ success: true, data: panel });
    }
    catch (error) {
        next(error);
    }
});
// Update panel
router.put('/panels/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const panel = await panelService_js_1.panelService.updatePanel(req.params.id, req.body);
        res.json({ success: true, data: panel });
    }
    catch (error) {
        next(error);
    }
});
// Toggle maintenance mode
router.post('/panels/:id/maintenance', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { enabled } = req.body;
        const panel = await panelService_js_1.panelService.toggleMaintenanceMode(req.params.id, enabled);
        res.json({ success: true, data: panel });
    }
    catch (error) {
        next(error);
    }
});
// Get panel readings
router.get('/panels/:id/readings', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { from, to, limit } = req.query;
        const readings = await panelService_js_1.panelService.getReadings(req.params.id, {
            from: from ? new Date(from) : undefined,
            to: to ? new Date(to) : undefined,
            limit: limit ? parseInt(limit) : undefined,
        });
        res.json({ success: true, data: readings });
    }
    catch (error) {
        next(error);
    }
});
// Get panel events
router.get('/panels/:id/events', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
        const events = await panelService_js_1.panelService.getEvents(req.params.id, limit);
        res.json({ success: true, data: events });
    }
    catch (error) {
        next(error);
    }
});
// Get panel thresholds
router.get('/panels/:id/thresholds', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const thresholds = await panelService_js_1.panelService.getThresholds(req.params.id);
        res.json({ success: true, data: thresholds });
    }
    catch (error) {
        next(error);
    }
});
// Set panel threshold
router.post('/panels/:id/thresholds', auth_js_1.authenticate, (0, validate_js_1.validate)(thresholdSchema), async (req, res, next) => {
    try {
        const threshold = await panelService_js_1.panelService.setThreshold(req.params.id, req.body);
        res.json({ success: true, data: threshold });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=panels.routes.js.map