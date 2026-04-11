import { type NewBuilding } from '../db/schema/index.js';
export declare class BuildingService {
    getAllCampuses(): Promise<{
        zones: {
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
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        location: string | null;
        timezone: string;
    }[]>;
    getCampusById(id: string): Promise<{
        zones: {
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
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
        }[];
        id: string;
        name: string;
        createdAt: Date;
        location: string | null;
        timezone: string;
    }>;
    getZonesByCampus(campusId: string): Promise<{
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
        code: string;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        campusId: string;
    }[]>;
    getZoneById(id: string): Promise<{
        campus: {
            id: string;
            name: string;
            createdAt: Date;
            location: string | null;
            timezone: string;
        };
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
        code: string;
        status: string;
        id: string;
        name: string;
        createdAt: Date;
        campusId: string;
    }>;
    getAllBuildings(): Promise<{
        zone: {
            campus: {
                id: string;
                name: string;
                createdAt: Date;
                location: string | null;
                timezone: string;
            } | null;
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
        } | null;
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
        zone: {
            campus: {
                id: string;
                name: string;
                createdAt: Date;
                location: string | null;
                timezone: string;
            };
            code: string;
            status: string;
            id: string;
            name: string;
            createdAt: Date;
            campusId: string;
        } | null;
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
    updateBuilding(id: string, data: Partial<NewBuilding>): Promise<{
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
        id: string;
        code: string;
        name: string;
        status: string;
        mapCoordinates: unknown;
    }[]>;
}
export declare const buildingService: BuildingService;
//# sourceMappingURL=buildingService.d.ts.map