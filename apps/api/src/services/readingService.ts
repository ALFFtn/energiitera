import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { panelReadings, gridMetrics, alerts, type NewPanelReading, type NewGridMetric } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class ReadingService {
    async submitReading(data: NewPanelReading) {
        const result = await db.insert(panelReadings).values(data).$returningId();
        const [reading] = await db.select().from(panelReadings).where(eq(panelReadings.id, result[0].id));
        return reading;
    }

    async submitBulkReadings(readings: NewPanelReading[]) {
        await db.insert(panelReadings).values(readings);
        return readings;
    }

    // Grid-wide metrics
    async getLatestGridMetrics(campusId: string) {
        const metric = await db.query.gridMetrics.findFirst({
            where: eq(gridMetrics.campusId, campusId),
            orderBy: [desc(gridMetrics.timestamp)],
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

    async submitGridMetric(data: NewGridMetric) {
        const result = await db.insert(gridMetrics).values(data).$returningId();
        const [metric] = await db.select().from(gridMetrics).where(eq(gridMetrics.id, result[0].id));
        return metric;
    }

    // Get 24h power distribution data
    async getPowerDistribution(campusId: string) {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const metrics = await db.query.gridMetrics.findMany({
            where: eq(gridMetrics.campusId, campusId),
            orderBy: [desc(gridMetrics.timestamp)],
            limit: 40, // 40 data points for the bar chart
        });

        if (metrics.length === 0) {
            // Generate mock data if no real data exists
            return Array.from({ length: 40 }, (_, i) => ({
                hour: i,
                powerKw: Math.floor(Math.random() * 60) + 20,
            }));
        }

        return metrics.map((m: typeof metrics[number], i: number) => ({
            hour: i,
            powerKw: Number(m.totalLoadMw) * 1000 || 0,
        }));
    }

    // Ticker data for live feed
    async getLiveFeedData(campusId: string) {
        const metrics = await this.getLatestGridMetrics(campusId);
        const activeAlerts = await db.query.alerts.findMany({
            where: eq(alerts.status, 'active'),
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

export const readingService = new ReadingService();
