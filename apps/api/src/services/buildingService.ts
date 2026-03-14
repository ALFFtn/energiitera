import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { campuses, zones, buildings, type NewBuilding } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class BuildingService {
    // Campuses
    async getAllCampuses() {
        return db.query.campuses.findMany({
            with: {
                zones: {
                    with: {
                        buildings: true,
                    },
                },
            },
        });
    }

    async getCampusById(id: string) {
        const campus = await db.query.campuses.findFirst({
            where: eq(campuses.id, id),
            with: {
                zones: {
                    with: {
                        buildings: true,
                    },
                },
            },
        });

        if (!campus) {
            throw new AppError('Campus not found', 404);
        }

        return campus;
    }

    // Zones
    async getZonesByCampus(campusId: string) {
        return db.query.zones.findMany({
            where: eq(zones.campusId, campusId),
            with: {
                buildings: true,
            },
        });
    }

    async getZoneById(id: string) {
        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, id),
            with: {
                campus: true,
                buildings: true,
            },
        });

        if (!zone) {
            throw new AppError('Zone not found', 404);
        }

        return zone;
    }

    // Buildings
    async getAllBuildings() {
        return db.query.buildings.findMany({
            with: {
                zone: {
                    with: {
                        campus: true,
                    },
                },
            },
        });
    }

    async getBuildingsByZone(zoneId: string) {
        return db.query.buildings.findMany({
            where: eq(buildings.zoneId, zoneId),
        });
    }

    async getBuildingById(id: string) {
        const building = await db.query.buildings.findFirst({
            where: eq(buildings.id, id),
            with: {
                zone: {
                    with: {
                        campus: true,
                    },
                },
            },
        });

        if (!building) {
            throw new AppError('Building not found', 404);
        }

        return building;
    }

    async updateBuilding(id: string, data: Partial<NewBuilding>) {
        const [updated] = await db
            .update(buildings)
            .set({
                ...data,
                lastSyncAt: new Date(),
            })
            .where(eq(buildings.id, id))
            .returning();

        if (!updated) {
            throw new AppError('Building not found', 404);
        }

        return updated;
    }

    // Create new building with auto-generated MQTT topic
    async createBuilding(data: {
        zoneId: string;
        name: string;
        code: string;
        description?: string;
        gridConnection?: string;
        mapCoordinates?: object;
    }) {
        // Verify zone exists and get zone code
        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, data.zoneId),
            with: {
                campus: true,
            },
        });

        if (!zone) {
            throw new AppError('Zone not found', 404);
        }

        // Create building
        const [newBuilding] = await db.insert(buildings).values({
            zoneId: data.zoneId,
            name: data.name,
            code: data.code,
            description: data.description,
            gridConnection: data.gridConnection || 'primary',
            mapCoordinates: data.mapCoordinates,
        }).returning();

        return {
            ...newBuilding,
            zone,
        };
    }

    // Delete building
    async deleteBuilding(id: string) {
        const [deleted] = await db
            .delete(buildings)
            .where(eq(buildings.id, id))
            .returning();

        if (!deleted) {
            throw new AppError('Building not found', 404);
        }

        return deleted;
    }

    // Get buildings with their status for map display
    async getBuildingsMapData(zoneId?: string) {
        const query = zoneId
            ? db.query.buildings.findMany({
                where: eq(buildings.zoneId, zoneId),
                columns: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    mapCoordinates: true,
                },
            })
            : db.query.buildings.findMany({
                columns: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    mapCoordinates: true,
                },
            });

        return query;
    }
}

export const buildingService = new BuildingService();
