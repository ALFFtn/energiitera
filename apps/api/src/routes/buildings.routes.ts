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

// Create new building with auto-generated MQTT topic
router.post('/buildings', authenticate, async (req, res, next) => {
    try {
        const { zoneId, name, code, description, gridConnection, mapCoordinates } = req.body;

        console.log('📝 Creating building:', { zoneId, name, code });

        if (!zoneId || !name || !code) {
            return res.status(400).json({
                success: false,
                error: 'zoneId, name, and code are required',
            });
        }

        const building = await buildingService.createBuilding({
            zoneId,
            name,
            code,
            description,
            gridConnection,
            mapCoordinates,
        });

        console.log('✅ Building created:', building.id);
        res.status(201).json({ success: true, data: building });
    } catch (error) {
        console.error('❌ Error creating building:', error);
        next(error);
    }
});

// Delete building
router.delete('/buildings/:id', authenticate, async (req, res, next) => {
    try {
        const building = await buildingService.deleteBuilding(req.params.id);
        res.json({ success: true, data: building, message: 'Building deleted successfully' });
    } catch (error) {
        next(error);
    }
});

router.get('/buildings/map-data', authenticate, async (req, res, next) => {
    try {
        const zoneId = req.query.zoneId as string | undefined;
        const buildings = await buildingService.getBuildingsMapData(zoneId);
        res.json({ success: true, data: buildings });
    } catch (error) {
        next(error);
    }
});

export default router;
