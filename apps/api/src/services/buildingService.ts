import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { campuses, zones, buildings, type NewBuilding } from '../db/schema/index.js';
import { AppError } from '../middleware/errorHandler.js';

export class BuildingService {
    // Campuses
    async getAllCampuses() {
        const allCampuses = await db.select().from(campuses);
        const allZones = await db.select().from(zones);
        const allBuildings = await db.select().from(buildings);

        return allCampuses.map((campus) => ({
            ...campus,
            zones: allZones
                .filter((zone) => zone.campusId === campus.id)
                .map((zone) => ({
                    ...zone,
                    buildings: allBuildings.filter((building) => building.zoneId === zone.id),
                })),
        }));
    }

    async getCampusById(id: string) {
        const campus = await db.select().from(campuses).where(eq(campuses.id, id));

        if (!campus[0]) {
            throw new AppError('Campus not found', 404);
        }

        const allZones = await db.select().from(zones).where(eq(zones.campusId, id));
        const allBuildings = await db.select().from(buildings);

        return {
            ...campus[0],
            zones: allZones.map((zone) => ({
                ...zone,
                buildings: allBuildings.filter((building) => building.zoneId === zone.id),
            })),
        };
    }

    // Zones
    async getZonesByCampus(campusId: string) {
        const zoneList = await db.select().from(zones).where(eq(zones.campusId, campusId));
        const allBuildings = await db.select().from(buildings);

        return zoneList.map((zone) => ({
            ...zone,
            buildings: allBuildings.filter((building) => building.zoneId === zone.id),
        }));
    }

    async getZoneById(id: string) {
        const zone = await db.select().from(zones).where(eq(zones.id, id));

        if (!zone[0]) {
            throw new AppError('Zone not found', 404);
        }

        const [campus] = await db.select().from(campuses).where(eq(campuses.id, zone[0].campusId));
        const zoneBuildings = await db.select().from(buildings).where(eq(buildings.zoneId, id));

        return {
            ...zone[0],
            campus,
            buildings: zoneBuildings,
        };
    }

    // Buildings
    async getAllBuildings() {
        const allBuildings = await db.select().from(buildings);
        const allZones = await db.select().from(zones);
        const allCampuses = await db.select().from(campuses);

        return allBuildings.map((building) => {
            const zone = allZones.find((item) => item.id === building.zoneId) || null;
            const campus = zone ? allCampuses.find((item) => item.id === zone.campusId) || null : null;

            return {
                ...building,
                zone: zone
                    ? {
                        ...zone,
                        campus,
                    }
                    : null,
            };
        });
    }

    async getBuildingsByZone(zoneId: string) {
        return db.select().from(buildings).where(eq(buildings.zoneId, zoneId));
    }

    async getBuildingById(id: string) {
        const building = await db.select().from(buildings).where(eq(buildings.id, id));

        if (!building[0]) {
            throw new AppError('Building not found', 404);
        }

        const [zone] = await db.select().from(zones).where(eq(zones.id, building[0].zoneId));
        const [campus] = zone ? await db.select().from(campuses).where(eq(campuses.id, zone.campusId)) : [];

        return {
            ...building[0],
            zone: zone
                ? {
                    ...zone,
                    campus,
                }
                : null,
        };
    }

    async updateBuilding(id: string, data: Partial<NewBuilding>) {
        await db
            .update(buildings)
            .set({
                ...data,
                lastSyncAt: new Date(),
            })
            .where(eq(buildings.id, id));

        const [updated] = await db.select().from(buildings).where(eq(buildings.id, id));

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
        // Verify zone exists
        const zoneList = await db.select().from(zones).where(eq(zones.id, data.zoneId));
        
        if (!zoneList[0]) {
            throw new AppError('Zone not found', 404);
        }

        const zone = zoneList[0];
        
        // Get campus if zone exists
        const [campus] = await db.select().from(campuses).where(eq(campuses.id, zone.campusId));

        // Create building
        const result = await db.insert(buildings).values({
            zoneId: data.zoneId,
            name: data.name,
            code: data.code,
            description: data.description,
            gridConnection: data.gridConnection || 'primary',
            mapCoordinates: data.mapCoordinates,
        }).$returningId();

        const [newBuilding] = await db.select().from(buildings).where(eq(buildings.id, result[0].id));

        return {
            ...newBuilding,
            zone: {
                ...zone,
                campus,
            },
        };
    }

    // Delete building
    async deleteBuilding(id: string) {
        const [existing] = await db.select().from(buildings).where(eq(buildings.id, id));

        if (!existing) {
            throw new AppError('Building not found', 404);
        }

        await db.delete(buildings).where(eq(buildings.id, id));

        return existing;
    }

    // Get buildings with their status for map display
    async getBuildingsMapData(zoneId?: string) {
        const allBuildings = zoneId
            ? await db.select({
                id: buildings.id,
                code: buildings.code,
                name: buildings.name,
                status: buildings.status,
                mapCoordinates: buildings.mapCoordinates,
            }).from(buildings).where(eq(buildings.zoneId, zoneId))
            : await db.select({
                id: buildings.id,
                code: buildings.code,
                name: buildings.name,
                status: buildings.status,
                mapCoordinates: buildings.mapCoordinates,
            }).from(buildings);

        return allBuildings;
    }
}

export const buildingService = new BuildingService();
