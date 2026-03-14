"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherService_1 = require("../services/weatherService");
const router = (0, express_1.Router)();
// GET /api/weather/current — real-time weather from Open-Meteo
router.get('/current', async (_req, res) => {
    try {
        const weather = await (0, weatherService_1.getCurrentWeather)();
        res.json({ success: true, data: weather });
    }
    catch (error) {
        console.error('Weather fetch error:', error);
        res.status(502).json({
            success: false,
            error: 'Failed to fetch weather data',
        });
    }
});
exports.default = router;
//# sourceMappingURL=weather.routes.js.map