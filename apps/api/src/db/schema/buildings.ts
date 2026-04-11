import { mysqlTable, varchar, text, timestamp, json } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import crypto from 'crypto';

export const campuses = mysqlTable('campuses', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull(),
    location: varchar('location', { length: 255 }),
    timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const zones = mysqlTable('zones', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    campusId: varchar('campus_id', { length: 36 }).notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 10 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('normal'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const buildings = mysqlTable('buildings', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    zoneId: varchar('zone_id', { length: 36 }).notNull().references(() => zones.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('operational'),
    gridConnection: varchar('grid_connection', { length: 50 }).notNull().default('primary'),
    lastSyncAt: timestamp('last_sync_at'),
    mapCoordinates: json('map_coordinates'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const campusesRelations = relations(campuses, ({ many }) => ({
    zones: many(zones),
}));

export const zonesRelations = relations(zones, ({ one, many }) => ({
    campus: one(campuses, {
        fields: [zones.campusId],
        references: [campuses.id],
    }),
    buildings: many(buildings),
}));

export const buildingsRelations = relations(buildings, ({ one }) => ({
    zone: one(zones, {
        fields: [buildings.zoneId],
        references: [zones.id],
    }),
}));

// Types
export type Campus = typeof campuses.$inferSelect;
export type NewCampus = typeof campuses.$inferInsert;
export type Zone = typeof zones.$inferSelect;
export type NewZone = typeof zones.$inferInsert;
export type Building = typeof buildings.$inferSelect;
export type NewBuilding = typeof buildings.$inferInsert;
