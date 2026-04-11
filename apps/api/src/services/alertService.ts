import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { alerts, type NewAlert } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class AlertService {
    async getAlerts(options: { status?: string; severity?: string; limit?: number } = {}) {
        const { status, severity, limit = 50 } = options;

        const conditions = [];
        if (status) {
            conditions.push(eq(alerts.status, status));
        }
        if (severity) {
            conditions.push(eq(alerts.severity, severity));
        }

        const alertsList = await db.select().from(alerts).where(
            conditions.length > 0 ? and(...conditions) : undefined
        ).orderBy(desc(alerts.triggeredAt)).limit(limit);

        return alertsList;
    }

    async getActiveAlerts() {
        return this.getAlerts({ status: 'active' });
    }

    async getAlertCounts() {
        const results = await db
            .select({
                severity: alerts.severity,
                count: count(),
            })
            .from(alerts)
            .where(eq(alerts.status, 'active'))
            .groupBy(alerts.severity);

        return results.reduce(
            (acc, { severity, count }) => {
                acc[severity] = count;
                return acc;
            },
            {} as Record<string, number>
        );
    }

    async getAlertById(id: string) {
        const alert = await db.select().from(alerts).where(eq(alerts.id, id));

        if (!alert[0]) {
            throw new AppError('Alert not found', 404);
        }

        return alert[0];
    }

    async createAlert(data: NewAlert) {
        const result = await db.insert(alerts).values(data).$returningId();
        const [alert] = await db.select().from(alerts).where(eq(alerts.id, result[0].id));
        return alert;
    }

    async acknowledgeAlert(id: string, userId: string) {
        await db
            .update(alerts)
            .set({
                status: 'acknowledged',
                acknowledgedBy: userId,
                acknowledgedAt: new Date(),
            })
            .where(eq(alerts.id, id));

        const [updated] = await db.select().from(alerts).where(eq(alerts.id, id));

        if (!updated) {
            throw new AppError('Alert not found', 404);
        }

        return updated;
    }

    async resolveAlert(id: string) {
        await db
            .update(alerts)
            .set({
                status: 'resolved',
                resolvedAt: new Date(),
            })
            .where(eq(alerts.id, id));

        const [updated] = await db.select().from(alerts).where(eq(alerts.id, id));

        if (!updated) {
            throw new AppError('Alert not found', 404);
        }

        return updated;
    }
}

export const alertService = new AlertService();
