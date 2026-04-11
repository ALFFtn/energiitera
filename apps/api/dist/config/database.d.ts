import mysql from 'mysql2/promise';
import * as schema from '../db/schema/index.js';
export declare const db: import("drizzle-orm/mysql2").MySql2Database<typeof schema> & {
    $client: mysql.Pool;
};
export type Database = typeof db;
//# sourceMappingURL=database.d.ts.map