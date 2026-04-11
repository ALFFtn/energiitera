"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.panelService = exports.PanelService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class PanelService {
    async getPanelsByBuilding(buildingId) {
        return database_js_1.db.query.panels.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.panels.buildingId, buildingId),
        });
    }
    async getPanelById(id) {
        const panelList = await database_js_1.db.select().from(index_js_1.panels).where((0, drizzle_orm_1.eq)(index_js_1.panels.id, id));
        if (!panelList[0]) {
            throw new errorHandler_js_1.AppError('Panel not found', 404);
        }
        const panel = panelList[0];
        // Get latest reading
        const latestReadingList = await database_js_1.db.select().from(index_js_1.panelReadings).where((0, drizzle_orm_1.eq)(index_js_1.panelReadings.panelId, id)).orderBy((0, drizzle_orm_1.desc)(index_js_1.panelReadings.timestamp)).limit(1);
        return {
            ...panel,
            latestReading: latestReadingList[0] || null,
        };
    }
    async updatePanel(id, data) {
        await database_js_1.db
            .update(index_js_1.panels)
            .set(data)
            .where((0, drizzle_orm_1.eq)(index_js_1.panels.id, id));
        const [updated] = await database_js_1.db.select().from(index_js_1.panels).where((0, drizzle_orm_1.eq)(index_js_1.panels.id, id));
        if (!updated) {
            throw new errorHandler_js_1.AppError('Panel not found', 404);
        }
        return updated;
    }
    async toggleMaintenanceMode(id, enabled) {
        return this.updatePanel(id, { maintenanceMode: enabled });
    }
    // Readings
    async getReadings(panelId, options = {}) {
        const { from, to, limit = 100 } = options;
        const conditions = [(0, drizzle_orm_1.eq)(index_js_1.panelReadings.panelId, panelId)];
        if (from) {
            conditions.push((0, drizzle_orm_1.gte)(index_js_1.panelReadings.timestamp, from));
        }
        if (to) {
            conditions.push((0, drizzle_orm_1.lte)(index_js_1.panelReadings.timestamp, to));
        }
        const readings = await database_js_1.db.query.panelReadings.findMany({
            where: (0, drizzle_orm_1.and)(...conditions),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.panelReadings.timestamp)],
            limit,
        });
        return readings;
    }
    async getLatestReadings(panelId) {
        return database_js_1.db.query.panelReadings.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.panelReadings.panelId, panelId),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.panelReadings.timestamp)],
        });
    }
    // Events
    async getEvents(panelId, limit = 50) {
        return database_js_1.db.query.panelEvents.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.panelEvents.panelId, panelId),
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.panelEvents.createdAt)],
            limit,
        });
    }
    async createEvent(data) {
        const result = await database_js_1.db.insert(index_js_1.panelEvents).values(data).$returningId();
        const [event] = await database_js_1.db.select().from(index_js_1.panelEvents).where((0, drizzle_orm_1.eq)(index_js_1.panelEvents.id, result[0].id));
        return event;
    }
    // Thresholds
    async getThresholds(panelId) {
        return database_js_1.db.query.alertThresholds.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.alertThresholds.panelId, panelId),
        });
    }
    async setThreshold(panelId, data) {
        // Upsert threshold
        const existing = await database_js_1.db.query.alertThresholds.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(index_js_1.alertThresholds.panelId, panelId), (0, drizzle_orm_1.eq)(index_js_1.alertThresholds.metric, data.metric)),
        });
        if (existing) {
            await database_js_1.db
                .update(index_js_1.alertThresholds)
                .set(data)
                .where((0, drizzle_orm_1.eq)(index_js_1.alertThresholds.id, existing.id));
            const [updated] = await database_js_1.db.select().from(index_js_1.alertThresholds).where((0, drizzle_orm_1.eq)(index_js_1.alertThresholds.id, existing.id));
            return updated;
        }
        const result = await database_js_1.db
            .insert(index_js_1.alertThresholds)
            .values({ ...data, panelId })
            .$returningId();
        const [created] = await database_js_1.db.select().from(index_js_1.alertThresholds).where((0, drizzle_orm_1.eq)(index_js_1.alertThresholds.id, result[0].id));
        return created;
    }
    // Get all panels with their latest readings (for monitoring view)
    async getAllPanelsWithReadings(buildingId) {
        const panelsList = buildingId
            ? await database_js_1.db.query.panels.findMany({
                where: (0, drizzle_orm_1.eq)(index_js_1.panels.buildingId, buildingId),
            })
            : await database_js_1.db.query.panels.findMany();
        const result = await Promise.all(panelsList.map(async (panel) => {
            const latestReading = await this.getLatestReadings(panel.id);
            return {
                ...panel,
                latestReading,
            };
        }));
        return result;
    }
}
exports.PanelService = PanelService;
exports.panelService = new PanelService();
//# sourceMappingURL=panelService.js.map