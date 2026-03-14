import { Router } from 'express';
import { getCurrentWeather } from '../services/weatherService';

const router = Router();

// GET /api/weather/current — real-time weather from Open-Meteo
router.get('/current', async (_req, res) => {
    try {
        const weather = await getCurrentWeather();
        res.json({ success: true, data: weather });
    } catch (error) {
        console.error('Weather fetch error:', error);
        res.status(502).json({
            success: false,
            error: 'Failed to fetch weather data',
        });
    }
});

export default router;
