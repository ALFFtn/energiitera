"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertService = exports.AlertService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class AlertService {
    async getAlerts(options = {}) {
        const { status, severity, limit = 50 } = options;
        const conditions = [];
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_1.alerts.status, status));
        }
        if (severity) {
            conditions.push((0, drizzle_orm_1.eq)(index_js_1.alerts.severity, severity));
        }
        const alertsList = await database_js_1.db.query.alerts.findMany({
            where: conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined,
            orderBy: [(0, drizzle_orm_1.desc)(index_js_1.alerts.triggeredAt)],
            limit,
            with: {
                panel: true,
                building: true,
                acknowledgedByUser: true,
            },
        });
        return alertsList;
    }
    async getActiveAlerts() {
        return this.getAlerts({ status: 'active' });
    }
    async getAlertCounts() {
        const results = await database_js_1.db
            .select({
            severity: index_js_1.alerts.severity,
            count: (0, drizzle_orm_1.count)(),
        })
            .from(index_js_1.alerts)
            .where((0, drizzle_orm_1.eq)(index_js_1.alerts.status, 'active'))
            .groupBy(index_js_1.alerts.severity);
        return results.reduce((acc, { severity, count }) => {
            acc[severity] = count;
            return acc;
        }, {});
    }
    async getAlertById(id) {
        const alert = await database_js_1.db.query.alerts.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.alerts.id, id),
            with: {
                panel: true,
                building: true,
                acknowledgedByUser: true,
            },
        });
        if (!alert) {
            throw new errorHandler_js_1.AppError('Alert not found', 404);
        }
        return alert;
    }
    async createAlert(data) {
        const result = await database_js_1.db.insert(index_js_1.alerts).values(data).$returningId();
        const [alert] = await database_js_1.db.select().from(index_js_1.alerts).where((0, drizzle_orm_1.eq)(index_js_1.alerts.id, result[0].id));
        return alert;
    }
    async acknowledgeAlert(id, userId) {
        await database_js_1.db
            .update(index_js_1.alerts)
            .set({
            status: 'acknowledged',
            acknowledgedBy: userId,
            acknowledgedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_1.alerts.id, id));
        const [updated] = await database_js_1.db.select().from(index_js_1.alerts).where((0, drizzle_orm_1.eq)(index_js_1.alerts.id, id));
        if (!updated) {
            throw new errorHandler_js_1.AppError('Alert not found', 404);
        }
        return updated;
    }
    async resolveAlert(id) {
        await database_js_1.db
            .update(index_js_1.alerts)
            .set({
            status: 'resolved',
            resolvedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_1.alerts.id, id));
        const [updated] = await database_js_1.db.select().from(index_js_1.alerts).where((0, drizzle_orm_1.eq)(index_js_1.alerts.id, id));
        if (!updated) {
            throw new errorHandler_js_1.AppError('Alert not found', 404);
        }
        return updated;
    }
}
exports.AlertService = AlertService;
exports.alertService = new AlertService();
//# sourceMappingURL=alertService.js.map