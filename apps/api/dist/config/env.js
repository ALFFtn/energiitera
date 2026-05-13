"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(10),
    JWT_EXPIRES_IN: zod_1.z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: zod_1.z.string().default('https://energiitera.com'),
    // Weather config (Open-Meteo, defaults to Bandar Lampung)
    WEATHER_CITY: zod_1.z.string().default('Bandar Lampung'),
    WEATHER_LAT: zod_1.z.string().transform(Number).default('-5.3971'),
    WEATHER_LON: zod_1.z.string().transform(Number).default('105.2668'),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map