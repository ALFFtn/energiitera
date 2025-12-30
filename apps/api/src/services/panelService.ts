import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { db } from '../config/database.js';
import { panels, panelReadings, panelEvents, alertThresholds, type NewPanel, type NewPanelEvent, type NewAlertThreshold } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class PanelService {
    async getPanelsByBuilding(buildingId: string) {
        return db.query.panels.findMany({
            where: eq(panels.buildingId, buildingId),
        });
    }

    async getPanelById(id: string) {
        const panel = await db.query.panels.findFirst({
            where: eq(panels.id, id),
            with: {
                building: {
                    with: {
                        zone: true,
                    },
                },
                thresholds: true,
            },
        });

        if (!panel) {
            throw new AppError('Panel not found', 404);
        }

        // Get latest reading
        const latestReading = await db.query.panelReadings.findFirst({
            where: eq(panelReadings.panelId, id),
            orderBy: [desc(panelReadings.timestamp)],
        });

        return {
            ...panel,
            latestReading,
        };
    }

    async updatePanel(id: string, data: Partial<NewPanel>) {
        const [updated] = await db
            .update(panels)
            .set(data)
            .where(eq(panels.id, id))
            .returning();

        if (!updated) {
            throw new AppError('Panel not found', 404);
        }

        return updated;
    }

    async toggleMaintenanceMode(id: string, enabled: boolean) {
        return this.updatePanel(id, { maintenanceMode: enabled });
    }

    // Readings
    async getReadings(panelId: string, options: { from?: Date; to?: Date; limit?: number } = {}) {
        const { from, to, limit = 100 } = options;

        const conditions = [eq(panelReadings.panelId, panelId)];

        if (from) {
            conditions.push(gte(panelReadings.timestamp, from));
        }
        if (to) {
            conditions.push(lte(panelReadings.timestamp, to));
        }

        const readings = await db.query.panelReadings.findMany({
            where: and(...conditions),
            orderBy: [desc(panelReadings.timestamp)],
            limit,
        });

        return readings;
    }

    async getLatestReadings(panelId: string) {
        return db.query.panelReadings.findFirst({
            where: eq(panelReadings.panelId, panelId),
            orderBy: [desc(panelReadings.timestamp)],
        });
    }

    // Events
    async getEvents(panelId: string, limit = 50) {
        return db.query.panelEvents.findMany({
            where: eq(panelEvents.panelId, panelId),
            orderBy: [desc(panelEvents.createdAt)],
            limit,
        });
    }

    async createEvent(data: NewPanelEvent) {
        const [event] = await db.insert(panelEvents).values(data).returning();
        return event;
    }

    // Thresholds
    async getThresholds(panelId: string) {
        return db.query.alertThresholds.findMany({
            where: eq(alertThresholds.panelId, panelId),
        });
    }

    async setThreshold(panelId: string, data: Omit<NewAlertThreshold, 'panelId'>) {
        // Upsert threshold
        const existing = await db.query.alertThresholds.findFirst({
            where: and(
                eq(alertThresholds.panelId, panelId),
                eq(alertThresholds.metric, data.metric)
            ),
        });

        if (existing) {
            const [updated] = await db
                .update(alertThresholds)
                .set(data)
                .where(eq(alertThresholds.id, existing.id))
                .returning();
            return updated;
        }

        const [created] = await db
            .insert(alertThresholds)
            .values({ ...data, panelId })
            .returning();
        return created;
    }

    // Get all panels with their latest readings (for monitoring view)
    async getAllPanelsWithReadings(buildingId?: string) {
        const panelsList = buildingId
            ? await db.query.panels.findMany({
                where: eq(panels.buildingId, buildingId),
            })
            : await db.query.panels.findMany();

        const result = await Promise.all(
            panelsList.map(async (panel) => {
                const latestReading = await this.getLatestReadings(panel.id);
                return {
                    ...panel,
                    latestReading,
                };
            })
        );

        return result;
    }
}

export const panelService = new PanelService();
