import { type NewBuilding } from '../db/schema/index.js';
export declare class BuildingService {
    getAllCampuses(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        location: string | null;
        timezone: string;
        zones: {
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
            buildings: {
                code: string;
                status: string;
                description: string | null;
                id: string;
                name: string;
                createdAt: Date;
                zoneId: string;
                gridConnection: string;
                lastSyncAt: Date | null;
                mapCoordinates: unknown;
            }[];
        }[];
    }[]>;
    getCampusById(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        location: string | null;
        timezone: string;
        zones: {
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
            buildings: {
                code: string;
                status: string;
                description: string | null;
                id: string;
                name: string;
                createdAt: Date;
                zoneId: string;
                gridConnection: string;
                lastSyncAt: Date | null;
                mapCoordinates: unknown;
            }[];
        }[];
    }>;
    getZonesByCampus(campusId: string): Promise<{
        code: string;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        campusId: string;
        buildings: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            zoneId: string;
            gridConnection: string;
            lastSyncAt: Date | null;
            mapCoordinates: unknown;
        }[];
    }[]>;
    getZoneById(id: string): Promise<{
        code: string;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        campusId: string;
        buildings: {
            code: string;
            status: string;
            description: string | null;
            id: string;
            name: string;
            createdAt: Date;
            zoneId: string;
            gridConnection: string;
            lastSyncAt: Date | null;
            mapCoordinates: unknown;
        }[];
        campus: {
            id: string;
            name: string;
            createdAt: Date;
            location: string | null;
            timezone: string;
        };
    }>;
    getAllBuildings(): Promise<{
        code: string;
        status: string;
        description: string | null;
        id: string;
        name: string;
        createdAt: Date;
        zoneId: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
        zone: {
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
            campus: {
                id: string;
                name: string;
                createdAt: Date;
                location: string | null;
                timezone: string;
            };
        };
    }[]>;
    getBuildingsByZone(zoneId: string): Promise<{
        code: string;
        status: string;
        description: string | null;
        id: string;
        name: string;
        createdAt: Date;
        zoneId: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
    }[]>;
    getBuildingById(id: string): Promise<{
        code: string;
        status: string;
        description: string | null;
        id: string;
        name: string;
        createdAt: Date;
        zoneId: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
        zone: {
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
            campus: {
                id: string;
                name: string;
                createdAt: Date;
                location: string | null;
                timezone: string;
            };
        };
    }>;
    updateBuilding(id: string, data: Partial<NewBuilding>): Promise<{
        id: string;
        zoneId: string;
        code: string;
        name: string;
        description: string | null;
        status: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
        createdAt: Date;
    }>;
    createBuilding(data: {
        zoneId: string;
        name: string;
        code: string;
        description?: string;
        gridConnection?: string;
        mapCoordinates?: object;
    }): Promise<{
        zone: {
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
            campus: {
                id: string;
                name: string;
                createdAt: Date;
                location: string | null;
                timezone: string;
            };
        };
        code: string;
        status: string;
        description: string | null;
        id: string;
        name: string;
        createdAt: Date;
        zoneId: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
    }>;
    deleteBuilding(id: string): Promise<{
        code: string;
        status: string;
        description: string | null;
        id: string;
        name: string;
        createdAt: Date;
        zoneId: string;
        gridConnection: string;
        lastSyncAt: Date | null;
        mapCoordinates: unknown;
    }>;
    getBuildingsMapData(zoneId?: string): Promise<{
        code: string;
        status: string;
        id: string;
        name: string;
        mapCoordinates: unknown;
    }[]>;
}
export declare const buildingService: BuildingService;
//# sourceMappingURL=buildingService.d.ts.map