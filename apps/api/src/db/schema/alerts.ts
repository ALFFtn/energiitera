import { mysqlTable, varchar, text, timestamp, index } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { panels } from './panels';
import { buildings } from './buildings';
import { users } from './users';
import crypto from 'crypto';

export const alerts = mysqlTable('alerts', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    panelId: varchar('panel_id', { length: 36 }).references(() => panels.id, { onDelete: 'set null' }),
    buildingId: varchar('building_id', { length: 36 }).references(() => buildings.id, { onDelete: 'set null' }),
    severity: varchar('severity', { length: 20 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message'),
    status: varchar('status', { length: 20 }).notNull().default('active'),
    triggeredAt: timestamp('triggered_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
    acknowledgedBy: varchar('acknowledged_by', { length: 36 }).references(() => users.id),
    acknowledgedAt: timestamp('acknowledged_at'),
}, (table) => [
    index('alerts_status_idx').on(table.status),
    index('alerts_severity_idx').on(table.severity),
]);

// Relations
export const alertsRelations = relations(alerts, ({ one }) => ({
    panel: one(panels, {
        fields: [alerts.panelId],
        references: [panels.id],
    }),
    building: one(buildings, {
        fields: [alerts.buildingId],
        references: [buildings.id],
    }),
    acknowledgedByUser: one(users, {
        fields: [alerts.acknowledgedBy],
        references: [users.id],
    }),
}));

// Types
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
