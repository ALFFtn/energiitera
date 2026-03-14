"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertsRelations = exports.alerts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const panels_1 = require("./panels");
const buildings_1 = require("./buildings");
const users_1 = require("./users");
exports.alerts = (0, pg_core_1.pgTable)('alerts', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    panelId: (0, pg_core_1.uuid)('panel_id').references(() => panels_1.panels.id, { onDelete: 'set null' }),
    buildingId: (0, pg_core_1.uuid)('building_id').references(() => buildings_1.buildings.id, { onDelete: 'set null' }),
    severity: (0, pg_core_1.varchar)('severity', { length: 20 }).notNull(),
    title: (0, pg_core_1.varchar)('title', { length: 200 }).notNull(),
    message: (0, pg_core_1.text)('message'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('active'),
    triggeredAt: (0, pg_core_1.timestamp)('triggered_at').notNull().defaultNow(),
    resolvedAt: (0, pg_core_1.timestamp)('resolved_at'),
    acknowledgedBy: (0, pg_core_1.uuid)('acknowledged_by').references(() => users_1.users.id),
    acknowledgedAt: (0, pg_core_1.timestamp)('acknowledged_at'),
}, (table) => [
    (0, pg_core_1.index)('alerts_status_idx').on(table.status),
    (0, pg_core_1.index)('alerts_severity_idx').on(table.severity),
]);
// Relations
exports.alertsRelations = (0, drizzle_orm_1.relations)(exports.alerts, ({ one }) => ({
    panel: one(panels_1.panels, {
        fields: [exports.alerts.panelId],
        references: [panels_1.panels.id],
    }),
    building: one(buildings_1.buildings, {
        fields: [exports.alerts.buildingId],
        references: [buildings_1.buildings.id],
    }),
    acknowledgedByUser: one(users_1.users, {
        fields: [exports.alerts.acknowledgedBy],
        references: [users_1.users.id],
    }),
}));
//# sourceMappingURL=alerts.js.map