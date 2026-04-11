"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readingService = exports.ReadingService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
class ReadingService {
    async submitReading(data) {
        const result = await database_js_1.db.insert(index_js_1.panelReadings).values(data).$returningId();
        const [reading] = await database_js_1.db.select().from(index_js_1.panelReadings).where((0, drizzle_orm_1.eq)(index_js_1.panelReadings.id, result[0].id));
        return reading;
    }
    async submitBulkReadings(readings) {
        await database_js_1.db.insert(index_js_1.panelReadings).values(readings);
        return readings;
    }
    // Grid-wide metrics
    async getLatestGridMetrics(campusId) {
        const metric = await database_js_1.db.query.gridMetrics.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.gridMetrics.campusId, campusId),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.gridMetrics.timestamp)],
        });
        if (!metric) {
            // Return default values if no metrics exist
            return {
                totalLoadMw: '45.2',
                frequencyHz: '60.01',
                powerFactor: '0.98',
                activeAlarms: 3,
                carbonFootprintTons: '8.4',
                estimatedCostPerHour: '452.00',
            };
        }
        return metric;
    }
    async submitGridMetric(data) {
        const result = await database_js_1.db.insert(index_js_1.gridMetrics).values(data).$returningId();
        const [metric] = await database_js_1.db.select().from(index_js_1.gridMetrics).where((0, drizzle_orm_1.eq)(index_js_1.gridMetrics.id, result[0].id));
        return metric;
    }
    // Get 24h power distribution data
    async getPowerDistribution(campusId) {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const metrics = await database_js_1.db.query.gridMetrics.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.gridMetrics.campusId, campusId),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.gridMetrics.timestamp)],
            limit: 40, // 40 data points for the bar chart
        });
        if (metrics.length === 0) {
            // Generate mock data if no real data exists
            return Array.from({ length: 40 }, (_, i) => ({
                hour: i,
                powerKw: Math.floor(Math.random() * 60) + 20,
            }));
        }
        return metrics.map((m, i) => ({
            hour: i,
            powerKw: Number(m.totalLoadMw) * 1000 || 0,
        }));
    }
    // Ticker data for live feed
    async getLiveFeedData(campusId) {
        const metrics = await this.getLatestGridMetrics(campusId);
        const activeAlerts = await database_js_1.db.query.alerts.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.alerts.status, 'active'),
        });
        return {
            gridLoad: {
                value: Number(metrics.totalLoadMw) || 45.2,
                unit: 'MW',
                change: 2.1,
            },
            frequency: {
                value: Number(metrics.frequencyHz) || 60.01,
                unit: 'Hz',
                change: 0,
            },
            powerFactor: {
                value: Number(metrics.powerFactor) || 0.98,
                change: -0.5,
            },
            activeAlarms: metrics.activeAlarms || activeAlerts.length,
        };
    }
}
exports.ReadingService = ReadingService;
exports.readingService = new ReadingService();
//# sourceMappingURL=readingService.js.map