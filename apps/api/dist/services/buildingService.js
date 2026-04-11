"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildingService = exports.BuildingService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const database_js_1 = require("../config/database.js");
const index_js_1 = require("../db/schema/index.js");
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class BuildingService {
    // Campuses
    async getAllCampuses() {
        const allCampuses = await database_js_1.db.select().from(index_js_1.campuses);
        const allZones = await database_js_1.db.select().from(index_js_1.zones);
        const allBuildings = await database_js_1.db.select().from(index_js_1.buildings);
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
    async getCampusById(id) {
        const campus = await database_js_1.db.select().from(index_js_1.campuses).where((0, drizzle_orm_1.eq)(index_js_1.campuses.id, id));
        if (!campus[0]) {
            throw new errorHandler_js_1.AppError('Campus not found', 404);
        }
        const allZones = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.campusId, id));
        const allBuildings = await database_js_1.db.select().from(index_js_1.buildings);
        return {
            ...campus[0],
            zones: allZones.map((zone) => ({
                ...zone,
                buildings: allBuildings.filter((building) => building.zoneId === zone.id),
            })),
        };
    }
    // Zones
    async getZonesByCampus(campusId) {
        const zoneList = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.campusId, campusId));
        const allBuildings = await database_js_1.db.select().from(index_js_1.buildings);
        return zoneList.map((zone) => ({
            ...zone,
            buildings: allBuildings.filter((building) => building.zoneId === zone.id),
        }));
    }
    async getZoneById(id) {
        const zone = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, id));
        if (!zone[0]) {
            throw new errorHandler_js_1.AppError('Zone not found', 404);
        }
        const [campus] = await database_js_1.db.select().from(index_js_1.campuses).where((0, drizzle_orm_1.eq)(index_js_1.campuses.id, zone[0].campusId));
        const zoneBuildings = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.zoneId, id));
        return {
            ...zone[0],
            campus,
            buildings: zoneBuildings,
        };
    }
    // Buildings
    async getAllBuildings() {
        const allBuildings = await database_js_1.db.select().from(index_js_1.buildings);
        const allZones = await database_js_1.db.select().from(index_js_1.zones);
        const allCampuses = await database_js_1.db.select().from(index_js_1.campuses);
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
    async getBuildingsByZone(zoneId) {
        return database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.zoneId, zoneId));
    }
    async getBuildingById(id) {
        const building = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id));
        if (!building[0]) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        const [zone] = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, building[0].zoneId));
        const [campus] = zone ? await database_js_1.db.select().from(index_js_1.campuses).where((0, drizzle_orm_1.eq)(index_js_1.campuses.id, zone.campusId)) : [];
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
    async updateBuilding(id, data) {
        await database_js_1.db
            .update(index_js_1.buildings)
            .set({
            ...data,
            lastSyncAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id));
        const [updated] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id));
        if (!updated) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        return updated;
    }
    // Create new building with auto-generated MQTT topic
    async createBuilding(data) {
        // Verify zone exists
        const zoneList = await database_js_1.db.select().from(index_js_1.zones).where((0, drizzle_orm_1.eq)(index_js_1.zones.id, data.zoneId));
        if (!zoneList[0]) {
            throw new errorHandler_js_1.AppError('Zone not found', 404);
        }
        const zone = zoneList[0];
        // Get campus if zone exists
        const [campus] = await database_js_1.db.select().from(index_js_1.campuses).where((0, drizzle_orm_1.eq)(index_js_1.campuses.id, zone.campusId));
        // Create building
        const result = await database_js_1.db.insert(index_js_1.buildings).values({
            zoneId: data.zoneId,
            name: data.name,
            code: data.code,
            description: data.description,
            gridConnection: data.gridConnection || 'primary',
            mapCoordinates: data.mapCoordinates,
        }).$returningId();
        const [newBuilding] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, result[0].id));
        return {
            ...newBuilding,
            zone: {
                ...zone,
                campus,
            },
        };
    }
    // Delete building
    async deleteBuilding(id) {
        const [existing] = await database_js_1.db.select().from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id));
        if (!existing) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        await database_js_1.db.delete(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id));
        return existing;
    }
    // Get buildings with their status for map display
    async getBuildingsMapData(zoneId) {
        const allBuildings = zoneId
            ? await database_js_1.db.select({
                id: index_js_1.buildings.id,
                code: index_js_1.buildings.code,
                name: index_js_1.buildings.name,
                status: index_js_1.buildings.status,
                mapCoordinates: index_js_1.buildings.mapCoordinates,
            }).from(index_js_1.buildings).where((0, drizzle_orm_1.eq)(index_js_1.buildings.zoneId, zoneId))
            : await database_js_1.db.select({
                id: index_js_1.buildings.id,
                code: index_js_1.buildings.code,
                name: index_js_1.buildings.name,
                status: index_js_1.buildings.status,
                mapCoordinates: index_js_1.buildings.mapCoordinates,
            }).from(index_js_1.buildings);
        return allBuildings;
    }
}
exports.BuildingService = BuildingService;
exports.buildingService = new BuildingService();
//# sourceMappingURL=buildingService.js.map