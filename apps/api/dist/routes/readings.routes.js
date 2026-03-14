"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const readingService_js_1 = require("../services/readingService.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const router = (0, express_1.Router)();
// Validation schemas
const readingSchema = zod_1.z.object({
    body: zod_1.z.object({
        panelId: zod_1.z.string().uuid(),
        voltageLn: zod_1.z.number().optional(),
        currentTotal: zod_1.z.number().optional(),
        currentPhaseA: zod_1.z.number().optional(),
        currentPhaseB: zod_1.z.number().optional(),
        currentPhaseC: zod_1.z.number().optional(),
        powerFactor: zod_1.z.number().min(0).max(1).optional(),
        frequency: zod_1.z.number().optional(),
        powerKw: zod_1.z.number().optional(),
        energyKwh: zod_1.z.number().optional(),
    }),
});
// Submit reading (for sensors/simulators)
router.post('/readings', auth_js_1.authenticate, (0, validate_js_1.validate)(readingSchema), async (req, res, next) => {
    try {
        const reading = await readingService_js_1.readingService.submitReading(req.body);
        res.status(201).json({ success: true, data: reading });
    }
    catch (error) {
        next(error);
    }
});
// Submit bulk readings
router.post('/readings/bulk', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const readings = await readingService_js_1.readingService.submitBulkReadings(req.body.readings);
        res.status(201).json({ success: true, data: readings });
    }
    catch (error) {
        next(error);
    }
});
// Get live grid metrics
router.get('/grid/live', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId;
        const metrics = await readingService_js_1.readingService.getLatestGridMetrics(campusId);
        res.json({ success: true, data: metrics });
    }
    catch (error) {
        next(error);
    }
});
// Get live feed data for ticker
router.get('/grid/ticker', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId;
        const data = await readingService_js_1.readingService.getLiveFeedData(campusId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
// Get 24h power distribution
router.get('/grid/power-distribution', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const campusId = req.query.campusId;
        const data = await readingService_js_1.readingService.getPowerDistribution(campusId);
        res.json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=readings.routes.js.map