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
        return database_js_1.db.query.campuses.findMany({
            with: {
                zones: {
                    with: {
                        buildings: true,
                    },
                },
            },
        });
    }
    async getCampusById(id) {
        const campus = await database_js_1.db.query.campuses.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.campuses.id, id),
            with: {
                zones: {
                    with: {
                        buildings: true,
                    },
                },
            },
        });
        if (!campus) {
            throw new errorHandler_js_1.AppError('Campus not found', 404);
        }
        return campus;
    }
    // Zones
    async getZonesByCampus(campusId) {
        return database_js_1.db.query.zones.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.zones.campusId, campusId),
            with: {
                buildings: true,
            },
        });
    }
    async getZoneById(id) {
        const zone = await database_js_1.db.query.zones.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.zones.id, id),
            with: {
                campus: true,
                buildings: true,
            },
        });
        if (!zone) {
            throw new errorHandler_js_1.AppError('Zone not found', 404);
        }
        return zone;
    }
    // Buildings
    async getAllBuildings() {
        return database_js_1.db.query.buildings.findMany({
            with: {
                zone: {
                    with: {
                        campus: true,
                    },
                },
            },
        });
    }
    async getBuildingsByZone(zoneId) {
        return database_js_1.db.query.buildings.findMany({
            where: (0, drizzle_orm_1.eq)(index_js_1.buildings.zoneId, zoneId),
        });
    }
    async getBuildingById(id) {
        const building = await database_js_1.db.query.buildings.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.buildings.id, id),
            with: {
                zone: {
                    with: {
                        campus: true,
                    },
                },
            },
        });
        if (!building) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        return building;
    }
    async updateBuilding(id, data) {
        const [updated] = await database_js_1.db
            .update(index_js_1.buildings)
            .set({
            ...data,
            lastSyncAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id))
            .returning();
        if (!updated) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        return updated;
    }
    // Create new building with auto-generated MQTT topic
    async createBuilding(data) {
        // Verify zone exists and get zone code
        const zone = await database_js_1.db.query.zones.findFirst({
            where: (0, drizzle_orm_1.eq)(index_js_1.zones.id, data.zoneId),
            with: {
                campus: true,
            },
        });
        if (!zone) {
            throw new errorHandler_js_1.AppError('Zone not found', 404);
        }
        // Create building
        const [newBuilding] = await database_js_1.db.insert(index_js_1.buildings).values({
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
    async deleteBuilding(id) {
        const [deleted] = await database_js_1.db
            .delete(index_js_1.buildings)
            .where((0, drizzle_orm_1.eq)(index_js_1.buildings.id, id))
            .returning();
        if (!deleted) {
            throw new errorHandler_js_1.AppError('Building not found', 404);
        }
        return deleted;
    }
    // Get buildings with their status for map display
    async getBuildingsMapData(zoneId) {
        const query = zoneId
            ? database_js_1.db.query.buildings.findMany({
                where: (0, drizzle_orm_1.eq)(index_js_1.buildings.zoneId, zoneId),
                columns: {
                    id: true,
                    code: true,
                    name: true,
                    status: true,
                    mapCoordinates: true,
                },
            })
            : database_js_1.db.query.buildings.findMany({
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
exports.BuildingService = BuildingService;
exports.buildingService = new BuildingService();
//# sourceMappingURL=buildingService.js.map