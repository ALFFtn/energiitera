"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingsRelations = exports.zonesRelations = exports.campusesRelations = exports.buildings = exports.zones = exports.campuses = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.campuses = (0, pg_core_1.pgTable)('campuses', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    location: (0, pg_core_1.varchar)('location', { length: 255 }),
    timezone: (0, pg_core_1.varchar)('timezone', { length: 50 }).notNull().default('UTC'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.zones = (0, pg_core_1.pgTable)('zones', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    campusId: (0, pg_core_1.uuid)('campus_id').notNull().references(() => exports.campuses.id, { onDelete: 'cascade' }),
    code: (0, pg_core_1.varchar)('code', { length: 10 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('normal'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.buildings = (0, pg_core_1.pgTable)('buildings', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    zoneId: (0, pg_core_1.uuid)('zone_id').notNull().references(() => exports.zones.id, { onDelete: 'cascade' }),
    code: (0, pg_core_1.varchar)('code', { length: 20 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).notNull().default('operational'),
    gridConnection: (0, pg_core_1.varchar)('grid_connection', { length: 50 }).notNull().default('primary'),
    lastSyncAt: (0, pg_core_1.timestamp)('last_sync_at'),
    mapCoordinates: (0, pg_core_1.jsonb)('map_coordinates'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
});
// Relations
exports.campusesRelations = (0, drizzle_orm_1.relations)(exports.campuses, ({ many }) => ({
    zones: many(exports.zones),
}));
exports.zonesRelations = (0, drizzle_orm_1.relations)(exports.zones, ({ one, many }) => ({
    campus: one(exports.campuses, {
        fields: [exports.zones.campusId],
        references: [exports.campuses.id],
    }),
    buildings: many(exports.buildings),
}));
exports.buildingsRelations = (0, drizzle_orm_1.relations)(exports.buildings, ({ one }) => ({
    zone: one(exports.zones, {
        fields: [exports.buildings.zoneId],
        references: [exports.zones.id],
    }),
}));
//# sourceMappingURL=buildings.js.map