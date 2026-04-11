"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingsRelations = exports.zonesRelations = exports.campusesRelations = exports.buildings = exports.zones = exports.campuses = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.campuses = (0, mysql_core_1.mysqlTable)('campuses', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    location: (0, mysql_core_1.varchar)('location', { length: 255 }),
    timezone: (0, mysql_core_1.varchar)('timezone', { length: 50 }).notNull().default('UTC'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.zones = (0, mysql_core_1.mysqlTable)('zones', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    campusId: (0, mysql_core_1.varchar)('campus_id', { length: 36 }).notNull().references(() => exports.campuses.id, { onDelete: 'cascade' }),
    code: (0, mysql_core_1.varchar)('code', { length: 10 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('normal'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
exports.buildings = (0, mysql_core_1.mysqlTable)('buildings', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    zoneId: (0, mysql_core_1.varchar)('zone_id', { length: 36 }).notNull().references(() => exports.zones.id, { onDelete: 'cascade' }),
    code: (0, mysql_core_1.varchar)('code', { length: 20 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    description: (0, mysql_core_1.text)('description'),
    status: (0, mysql_core_1.varchar)('status', { length: 20 }).notNull().default('operational'),
    gridConnection: (0, mysql_core_1.varchar)('grid_connection', { length: 50 }).notNull().default('primary'),
    lastSyncAt: (0, mysql_core_1.timestamp)('last_sync_at'),
    mapCoordinates: (0, mysql_core_1.json)('map_coordinates'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
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