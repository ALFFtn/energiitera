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

        const alertsList = await db.query.alerts.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: [desc(alerts.triggeredAt)],
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
        const alert = await db.query.alerts.findFirst({
            where: eq(alerts.id, id),
            with: {
                panel: true,
                building: true,
                acknowledgedByUser: true,
            },
        });

        if (!alert) {
            throw new AppError('Alert not found', 404);
        }

        return alert;
    }

    async createAlert(data: NewAlert) {
        const [alert] = await db.insert(alerts).values(data).returning();
        return alert;
    }

    async acknowledgeAlert(id: string, userId: string) {
        const [updated] = await db
            .update(alerts)
            .set({
                status: 'acknowledged',
                acknowledgedBy: userId,
                acknowledgedAt: new Date(),
            })
            .where(eq(alerts.id, id))
            .returning();

        if (!updated) {
            throw new AppError('Alert not found', 404);
        }

        return updated;
    }

    async resolveAlert(id: string) {
        const [updated] = await db
            .update(alerts)
            .set({
                status: 'resolved',
                resolvedAt: new Date(),
            })
            .where(eq(alerts.id, id))
            .returning();

        if (!updated) {
            throw new AppError('Alert not found', 404);
        }

        return updated;
    }
}

export const alertService = new AlertService();
