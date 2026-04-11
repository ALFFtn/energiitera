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
        const panelList = await db.select().from(panels).where(eq(panels.id, id));

        if (!panelList[0]) {
            throw new AppError('Panel not found', 404);
        }

        const panel = panelList[0];

        // Get latest reading
        const latestReadingList = await db.select().from(panelReadings).where(eq(panelReadings.panelId, id)).orderBy(desc(panelReadings.timestamp)).limit(1);

        return {
            ...panel,
            latestReading: latestReadingList[0] || null,
        };
    }

    async updatePanel(id: string, data: Partial<NewPanel>) {
        await db
            .update(panels)
            .set(data)
            .where(eq(panels.id, id));

        const [updated] = await db.select().from(panels).where(eq(panels.id, id));

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
        const result = await db.insert(panelEvents).values(data).$returningId();
        const [event] = await db.select().from(panelEvents).where(eq(panelEvents.id, result[0].id));
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
            await db
                .update(alertThresholds)
                .set(data)
                .where(eq(alertThresholds.id, existing.id));
            const [updated] = await db.select().from(alertThresholds).where(eq(alertThresholds.id, existing.id));
            return updated;
        }

        const result = await db
            .insert(alertThresholds)
            .values({ ...data, panelId })
            .$returningId();
        const [created] = await db.select().from(alertThresholds).where(eq(alertThresholds.id, result[0].id));
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
