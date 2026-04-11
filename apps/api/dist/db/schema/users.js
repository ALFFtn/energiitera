"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionsRelations = exports.usersRelations = exports.sessions = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    email: (0, mysql_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    role: (0, mysql_core_1.varchar)('role', { length: 20 }).notNull().default('operator'),
    avatarUrl: (0, mysql_core_1.text)('avatar_url'),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
exports.sessions = (0, mysql_core_1.mysqlTable)('sessions', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey().$defaultFn(() => crypto_1.default.randomUUID()),
    userId: (0, mysql_core_1.varchar)('user_id', { length: 36 }).notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    refreshToken: (0, mysql_core_1.varchar)('refresh_token', { length: 500 }).notNull(),
    expiresAt: (0, mysql_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at').notNull().defaultNow(),
});
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    sessions: many(exports.sessions),
}));
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.sessions.userId],
        references: [exports.users.id],
    }),
}));
//# sourceMappingURL=users.js.map