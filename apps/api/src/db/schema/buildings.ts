import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const campuses = pgTable('campuses', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    location: varchar('location', { length: 255 }),
    timezone: varchar('timezone', { length: 50 }).notNull().default('UTC'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const zones = pgTable('zones', {
    id: uuid('id').primaryKey().defaultRandom(),
    campusId: uuid('campus_id').notNull().references(() => campuses.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 10 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    status: varchar('status', { length: 20 }).notNull().default('normal'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const buildings = pgTable('buildings', {
    id: uuid('id').primaryKey().defaultRandom(),
    zoneId: uuid('zone_id').notNull().references(() => zones.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 20 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 20 }).notNull().default('operational'),
    gridConnection: varchar('grid_connection', { length: 50 }).notNull().default('primary'),
    lastSyncAt: timestamp('last_sync_at'),
    mapCoordinates: jsonb('map_coordinates'),
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
