"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsService = exports.AnalyticsService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
class AnalyticsService {
    // Get consumption data for a date range
    async getConsumption(options) {
        const { from, to, buildingId, departmentId } = options;
        const conditions = [];
        if (from) {
            conditions.push((0, drizzle_orm_1.gte)(index_js_1.consumptionRecords.timestamp, from));
        }
        if (to) {
            conditions.push((0, drizzle_orm_1.lte)(index_js_1.consumptionRecords.timestamp, to));
        }
        if (departmentId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_1.consumptionRecords.departmentId, departmentId));
        }
        if (buildingId) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_1.consumptionRecords.buildingId, buildingId));
        }
        const records = await database_js_1.db.query.consumptionRecords.findMany({
            where: conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined,
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.consumptionRecords.timestamp)],
            with: {
                department: true,
            },
        });
        return records;
    }
    // Get KPI summary
    async getKPIs(campusId, dateRange) {
        // Get total consumption
        const consumptionData = dateRange
            ? await database_js_1.db
                .select({
                total: (0, drizzle_orm_1.sum)(index_js_1.consumptionRecords.consumptionKwh),
                cost: (0, drizzle_orm_1.sum)(index_js_1.consumptionRecords.costUsd),
            })
                .from(index_js_1.consumptionRecords)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(index_js_1.consumptionRecords.timestamp, dateRange.from), (0, drizzle_orm_1.lte)(index_js_1.consumptionRecords.timestamp, dateRange.to)))
            : await database_js_1.db
                .select({
                total: (0, drizzle_orm_1.sum)(index_js_1.consumptionRecords.consumptionKwh),
                cost: (0, drizzle_orm_1.sum)(index_js_1.consumptionRecords.costUsd),
            })
                .from(index_js_1.consumptionRecords);
        // Get latest grid metrics for carbon footprint
        const latestMetrics = await database_js_1.db.query.gridMetrics.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.gridMetrics.campusId, campusId),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.gridMetrics.timestamp)],
        });
        return {
            totalConsumption: {
                value: Number(consumptionData[0]?.total) || 124592,
                unit: 'kWh',
                change: 12.5,
                changeType: 'negative', // increased consumption is bad
            },
            peakDemand: {
                value: 450,
                unit: 'kW',
                recordedAt: 'Oct 12, 14:00',
            },
            estimatedBill: {
                value: Number(consumptionData[0]?.cost) || 15400,
                unit: 'USD',
                change: 2.1,
                changeType: 'positive', // saving is good
            },
            carbonFootprint: {
                value: Number(latestMetrics?.carbonFootprintTons) || 8.4,
                unit: 'tons',
                change: 2.1,
                changeType: 'positive',
            },
        };
    }
    // Get department breakdown
    async getDepartmentBreakdown(campusId) {
        const depts = await database_js_1.db.query.departments.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.departments.campusId, campusId),
        });
        // Calculate consumption per department
        const breakdown = await Promise.all(depts.map(async (dept) => {
            const consumption = await database_js_1.db
                .select({
                total: (0, drizzle_orm_1.sum)(index_js_1.consumptionRecords.consumptionKwh),
            })
                .from(index_js_1.consumptionRecords)
                .where((0, drizzle_orm_1.eq)(index_js_1.consumptionRecords.departmentId, dept.id));
            return {
                name: dept.name,
                color: dept.color,
                consumption: Number(consumption[0]?.total) || 0,
            };
        }));
        // Calculate percentages
        const total = breakdown.reduce((sum, d) => sum + d.consumption, 0) || 1;
        return breakdown.map((d) => ({
            ...d,
            percentage: Math.round((d.consumption / total) * 100),
        }));
    }
    // Get hourly consumption trend
    async getHourlyTrend(campusId, date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        const records = await database_js_1.db.query.consumptionRecords.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.gte)(index_js_1.consumptionRecords.timestamp, startOfDay), (0, drizzle_orm_1.lte)(index_js_1.consumptionRecords.timestamp, endOfDay)),
            orderBy: [index_js_1.consumptionRecords.timestamp],
        });
        // Generate mock data if no real data
        if (records.length === 0) {
            return Array.from({ length: 24 }, (_, hour) => ({
                hour,
                current: Math.floor(Math.random() * 300) + 200,
                previous: Math.floor(Math.random() * 300) + 200,
            }));
        }
        // Group by hour
        const hourlyData = records.reduce((acc, record) => {
            const hour = new Date(record.timestamp).getHours();
            if (!acc[hour]) {
                acc[hour] = { current: 0, previous: 0 };
            }
            acc[hour].current += Number(record.consumptionKwh);
            return acc;
        }, {});
        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            current: hourlyData[hour]?.current || 0,
            previous: hourlyData[hour]?.previous || 0,
        }));
    }
    // Get power factor trend
    async getPowerFactorTrend(buildingId, daysBack = 30) {
        // This would aggregate power factor readings over time
        // For now, return mock data
        return Array.from({ length: daysBack }, (_, day) => ({
            date: new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 0.95 + Math.random() * 0.05,
        }));
    }
}
exports.AnalyticsService = AnalyticsService;
exports.analyticsService = new AnalyticsService();
//# sourceMappingURL=analyticsService.js.map