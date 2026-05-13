"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const buildingService_js_1 = require("../services/buildingService.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Campuses
router.get('/campuses', auth_js_1.authenticate, async (_req, res, next) => {
    try {
        const campuses = await buildingService_js_1.buildingService.getAllCampuses();
        res.json({ success: true, data: campuses });
    }
    catch (error) {
        next(error);
    }
});
router.get('/campuses/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const campus = await buildingService_js_1.buildingService.getCampusById(req.params.id);
        res.json({ success: true, data: campus });
    }
    catch (error) {
        next(error);
    }
});
router.get('/campuses/:id/zones', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const zones = await buildingService_js_1.buildingService.getZonesByCampus(req.params.id);
        res.json({ success: true, data: zones });
    }
    catch (error) {
        next(error);
    }
});
// Zones
router.get('/zones/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const zone = await buildingService_js_1.buildingService.getZoneById(req.params.id);
        res.json({ success: true, data: zone });
    }
    catch (error) {
        next(error);
    }
});
router.get('/zones/:id/buildings', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const buildings = await buildingService_js_1.buildingService.getBuildingsByZone(req.params.id);
        res.json({ success: true, data: buildings });
    }
    catch (error) {
        next(error);
    }
});
// Buildings
router.get('/buildings', auth_js_1.authenticate, async (_req, res, next) => {
    try {
        const buildings = await buildingService_js_1.buildingService.getAllBuildings();
        res.json({ success: true, data: buildings });
    }
    catch (error) {
        next(error);
    }
});
// Static sub-routes MUST come before /:id to avoid Express matching them as an id param
router.get('/buildings/map-data', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const zoneId = req.query.zoneId;
        const buildings = await buildingService_js_1.buildingService.getBuildingsMapData(zoneId);
        res.json({ success: true, data: buildings });
    }
    catch (error) {
        next(error);
    }
});
router.get('/buildings/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const building = await buildingService_js_1.buildingService.getBuildingById(req.params.id);
        res.json({ success: true, data: building });
    }
    catch (error) {
        next(error);
    }
});
router.put('/buildings/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const building = await buildingService_js_1.buildingService.updateBuilding(req.params.id, req.body);
        res.json({ success: true, data: building });
    }
    catch (error) {
        next(error);
    }
});
router.post('/buildings', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { zoneId, name, code, description, gridConnection, mapCoordinates } = req.body;
        if (!zoneId || !name || !code) {
            return res.status(400).json({
                success: false,
                error: 'zoneId, name, and code are required',
            });
        }
        const building = await buildingService_js_1.buildingService.createBuilding({
            zoneId, name, code, description, gridConnection, mapCoordinates,
        });
        res.status(201).json({ success: true, data: building });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/buildings/:id', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const building = await buildingService_js_1.buildingService.deleteBuilding(req.params.id);
        res.json({ success: true, data: building, message: 'Building deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// Building sensor readings
router.get('/buildings/:id/readings', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;
        const from = req.query.from;
        const to = req.query.to;
        const bucket = parseInt(req.query.bucket) || 0;
        let readings;
        if (from && to && bucket > 0) {
            const { getSensorReadingsBucketed } = await import('../services/sensorReadingService.js');
            readings = await getSensorReadingsBucketed(req.params.id, new Date(from), new Date(to), bucket);
        }
        else if (from || to) {
            const { getSensorReadingsInRange } = await import('../services/sensorReadingService.js');
            const startDate = from ? new Date(from) : new Date(0);
            const endDate = to ? new Date(to) : new Date();
            readings = await getSensorReadingsInRange(req.params.id, startDate, endDate, limit);
        }
        else {
            const { getSensorReadings } = await import('../services/sensorReadingService.js');
            readings = await getSensorReadings(req.params.id, { limit });
        }
        res.json({ success: true, data: readings, count: readings.length });
    }
    catch (error) {
        next(error);
    }
});
// Get latest sensor reading for a specific building
router.get('/buildings/:id/readings/latest', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { getLatestSensorReading } = await import('../services/sensorReadingService.js');
        const reading = await getLatestSensorReading(req.params.id);
        res.json({ success: true, data: reading });
    }
    catch (error) {
        next(error);
    }
});
// Get latest sensor readings for ALL buildings (for dashboard)
router.get('/buildings-latest-readings', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { getAllLatestReadings } = await import('../services/sensorReadingService.js');
        const readings = await getAllLatestReadings();
        res.json({ success: true, data: readings });
    }
    catch (error) {
        next(error);
    }
});
// Export readings as CSV
router.get('/buildings/:id/readings/export', auth_js_1.authenticate, async (req, res, next) => {
    try {
        const { exportReadingsAsCSV } = await import('../services/sensorReadingService.js');
        const building = await buildingService_js_1.buildingService.getBuildingById(req.params.id);
        const csvData = await exportReadingsAsCSV(req.params.id);
        // Convert to CSV string
        const csvContent = csvData.map(row => row.join(',')).join('\n');
        // Send as file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sensor-readings-${building?.code || req.params.id}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=buildings.routes.js.map