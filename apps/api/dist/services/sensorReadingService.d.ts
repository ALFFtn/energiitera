import { buildingSensorReadings } from '../db/schema';
interface SensorData {
    voltage_r?: number;
    voltage_s?: number;
    voltage_t?: number;
    current_r?: number;
    current_s?: number;
    current_t?: number;
    power?: number;
    power_factor?: number;
    frequency?: number;
    temperature?: number;
    energy?: number;
    thd_v?: number;
    thd_i?: number;
}
export declare function saveSensorReading(buildingCode: string, sensorId: string, data: SensorData): Promise<void>;
export declare function flushSensorReadings(): Promise<number>;
export declare function getSensorReadings(buildingId: string, options?: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}): Promise<typeof buildingSensorReadings.$inferSelect[]>;
export declare function getSensorReadingsInRange(buildingId: string, startDate: Date, endDate: Date, limit?: number): Promise<typeof buildingSensorReadings.$inferSelect[]>;
export declare function getLatestSensorReading(buildingId: string): Promise<typeof buildingSensorReadings.$inferSelect | null>;
export declare function getAllLatestReadings(): Promise<Array<{
    buildingId: string;
    buildingCode: string;
    reading: typeof buildingSensorReadings.$inferSelect;
}>>;
export declare function exportReadingsAsCSV(buildingId: string): Promise<string[][]>;
export {};
//# sourceMappingURL=sensorReadingService.d.ts.map