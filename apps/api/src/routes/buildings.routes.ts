import { Router } from 'express';
import { buildingService } from '../services/buildingService.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Campuses
router.get('/campuses', authenticate, async (_req, res, next) => {
    try {
        const campuses = await buildingService.getAllCampuses();
        res.json({ success: true, data: campuses });
    } catch (error) {
        next(error);
    }
});

router.get('/campuses/:id', authenticate, async (req, res, next) => {
    try {
        const campus = await buildingService.getCampusById(req.params.id);
        res.json({ success: true, data: campus });
    } catch (error) {
        next(error);
    }
});

router.get('/campuses/:id/zones', authenticate, async (req, res, next) => {
    try {
        const zones = await buildingService.getZonesByCampus(req.params.id);
        res.json({ success: true, data: zones });
    } catch (error) {
        next(error);
    }
});

// Zones
router.get('/zones/:id', authenticate, async (req, res, next) => {
    try {
        const zone = await buildingService.getZoneById(req.params.id);
        res.json({ success: true, data: zone });
    } catch (error) {
        next(error);
    }
});

router.get('/zones/:id/buildings', authenticate, async (req, res, next) => {
    try {
        const buildings = await buildingService.getBuildingsByZone(req.params.id);
        res.json({ success: true, data: buildings });
    } catch (error) {
        next(error);
    }
});

// Buildings
router.get('/buildings', authenticate, async (_req, res, next) => {
    try {
        const buildings = await buildingService.getAllBuildings();
        res.json({ success: true, data: buildings });
    } catch (error) {
        next(error);
    }
});

// Static sub-routes MUST come before /:id to avoid Express matching them as an id param
router.get('/buildings/map-data', authenticate, async (req, res, next) => {
    try {
        const zoneId = req.query.zoneId as string | undefined;
        const buildings = await buildingService.getBuildingsMapData(zoneId);
        res.json({ success: true, data: buildings });
    } catch (error) {
        next(error);
    }
});

router.get('/buildings/:id', authenticate, async (req, res, next) => {
    try {
        const building = await buildingService.getBuildingById(req.params.id);
        res.json({ success: true, data: building });
    } catch (error) {
        next(error);
    }
});

router.put('/buildings/:id', authenticate, async (req, res, next) => {
    try {
        const building = await buildingService.updateBuilding(req.params.id, req.body);
        res.json({ success: true, data: building });
    } catch (error) {
        next(error);
    }
});

router.post('/buildings', authenticate, async (req, res, next) => {
    try {
        const { zoneId, name, code, description, gridConnection, mapCoordinates } = req.body;

        if (!zoneId || !name || !code) {
            return res.status(400).json({
                success: false,
                error: 'zoneId, name, and code are required',
            });
        }

        const building = await buildingService.createBuilding({
            zoneId, name, code, description, gridConnection, mapCoordinates,
        });

        res.status(201).json({ success: true, data: building });
    } catch (error) {
        next(error);
    }
});

router.delete('/buildings/:id', authenticate, async (req, res, next) => {
    try {
        const building = await buildingService.deleteBuilding(req.params.id);
        res.json({ success: true, data: building, message: 'Building deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Building sensor readings
router.get('/buildings/:id/readings', authenticate, async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit as string) || 1000;
        const from = req.query.from as string | undefined;
        const to   = req.query.to   as string | undefined;
        const bucket = parseInt(req.query.bucket as string) || 0;

        let readings;
        if (from && to && bucket > 0) {
            const { getSensorReadingsBucketed } = await import('../services/sensorReadingService.js');
            readings = await getSensorReadingsBucketed(
                req.params.id,
                new Date(from),
                new Date(to),
                bucket,
            );
        } else if (from || to) {
            const { getSensorReadingsInRange } = await import('../services/sensorReadingService.js');
            const startDate = from ? new Date(from) : new Date(0);
            const endDate   = to   ? new Date(to)   : new Date();
            readings = await getSensorReadingsInRange(req.params.id, startDate, endDate, limit);
        } else {
            const { getSensorReadings } = await import('../services/sensorReadingService.js');
            readings = await getSensorReadings(req.params.id, { limit });
        }

        res.json({ success: true, data: readings, count: readings.length });
    } catch (error) {
        next(error);
    }
});

// Get latest sensor reading for a specific building
router.get('/buildings/:id/readings/latest', authenticate, async (req, res, next) => {
    try {
        const { getLatestSensorReading } = await import('../services/sensorReadingService.js');
        const reading = await getLatestSensorReading(req.params.id);
        res.json({ success: true, data: reading });
    } catch (error) {
        next(error);
    }
});

// Get latest sensor readings for ALL buildings (for dashboard)
router.get('/buildings-latest-readings', authenticate, async (req, res, next) => {
    try {
        const { getAllLatestReadings } = await import('../services/sensorReadingService.js');
        const readings = await getAllLatestReadings();
        res.json({ success: true, data: readings });
    } catch (error) {
        next(error);
    }
});

// Export readings as CSV
router.get('/buildings/:id/readings/export', authenticate, async (req, res, next) => {
    try {
        const { exportReadingsAsCSV } = await import('../services/sensorReadingService.js');
        const building = await buildingService.getBuildingById(req.params.id);

        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const csvData = await exportReadingsAsCSV(req.params.id, startDate, endDate);

        // Convert to CSV string
        const csvContent = csvData.map(row => row.join(',')).join('\n');

        // Send as file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sensor-readings-${building?.code || req.params.id}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    } catch (error) {
        next(error);
    }
});

export default router;
