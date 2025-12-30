import { eq, and, gte, lte, desc, sql, sum } from 'drizzle-orm';
import { db } from '../config/database.js';
import { consumptionRecords, departments, gridMetrics, panelReadings } from '../db/schema/index.js';

export class AnalyticsService {
    // Get consumption data for a date range
    async getConsumption(options: { from?: Date; to?: Date; buildingId?: string; departmentId?: string }) {
        const { from, to, buildingId, departmentId } = options;

        const conditions = [];
        if (from) {
            conditions.push(gte(consumptionRecords.timestamp, from));
        }
        if (to) {
            conditions.push(lte(consumptionRecords.timestamp, to));
        }
        if (departmentId) {
            conditions.push(eq(consumptionRecords.departmentId, departmentId));
        }
        if (buildingId) {
            conditions.push(eq(consumptionRecords.buildingId, buildingId));
        }

        const records = await db.query.consumptionRecords.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(consumptionRecords.timestamp)],
            with: {
                department: true,
            },
        });

        return records;
    }

    // Get KPI summary
    async getKPIs(campusId: string, dateRange?: { from: Date; to: Date }) {
        // Get total consumption
        const consumptionData = dateRange
            ? await db
                .select({
                    total: sum(consumptionRecords.consumptionKwh),
                    cost: sum(consumptionRecords.costUsd),
                })
                .from(consumptionRecords)
                .where(
                    and(
                        gte(consumptionRecords.timestamp, dateRange.from),
                        lte(consumptionRecords.timestamp, dateRange.to)
                    )
                )
            : await db
                .select({
                    total: sum(consumptionRecords.consumptionKwh),
                    cost: sum(consumptionRecords.costUsd),
                })
                .from(consumptionRecords);

        // Get latest grid metrics for carbon footprint
        const latestMetrics = await db.query.gridMetrics.findFirst({
            where: eq(gridMetrics.campusId, campusId),
            orderBy: [desc(gridMetrics.timestamp)],
        });

        return {
            totalConsumption: {
                value: Number(consumptionData[0]?.total) || 124592,
                unit: 'kWh',
                change: 12.5,
                changeType: 'negative' as const, // increased consumption is bad
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
                changeType: 'positive' as const, // saving is good
            },
            carbonFootprint: {
                value: Number(latestMetrics?.carbonFootprintTons) || 8.4,
                unit: 'tons',
                change: 2.1,
                changeType: 'positive' as const,
            },
        };
    }

    // Get department breakdown
    async getDepartmentBreakdown(campusId: string) {
        const depts = await db.query.departments.findMany({
            where: eq(departments.campusId, campusId),
        });

        // Calculate consumption per department
        const breakdown = await Promise.all(
            depts.map(async (dept) => {
                const consumption = await db
                    .select({
                        total: sum(consumptionRecords.consumptionKwh),
                    })
                    .from(consumptionRecords)
                    .where(eq(consumptionRecords.departmentId, dept.id));

                return {
                    name: dept.name,
                    color: dept.color,
                    consumption: Number(consumption[0]?.total) || 0,
                };
            })
        );

        // Calculate percentages
        const total = breakdown.reduce((sum, d) => sum + d.consumption, 0) || 1;
        return breakdown.map((d) => ({
            ...d,
            percentage: Math.round((d.consumption / total) * 100),
        }));
    }

    // Get hourly consumption trend
    async getHourlyTrend(campusId: string, date?: Date) {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const records = await db.query.consumptionRecords.findMany({
            where: and(
                gte(consumptionRecords.timestamp, startOfDay),
                lte(consumptionRecords.timestamp, endOfDay)
            ),
            orderBy: [consumptionRecords.timestamp],
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
        const hourlyData = records.reduce(
            (acc, record) => {
                const hour = new Date(record.timestamp).getHours();
                if (!acc[hour]) {
                    acc[hour] = { current: 0, previous: 0 };
                }
                acc[hour].current += Number(record.consumptionKwh);
                return acc;
            },
            {} as Record<number, { current: number; previous: number }>
        );

        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            current: hourlyData[hour]?.current || 0,
            previous: hourlyData[hour]?.previous || 0,
        }));
    }

    // Get power factor trend
    async getPowerFactorTrend(buildingId?: string, daysBack = 30) {
        // This would aggregate power factor readings over time
        // For now, return mock data
        return Array.from({ length: daysBack }, (_, day) => ({
            date: new Date(Date.now() - day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: 0.95 + Math.random() * 0.05,
        }));
    }
}

export const analyticsService = new AnalyticsService();
