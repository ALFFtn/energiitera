import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    PORT: z.string().transform(Number).default('3001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string().default('https://energiitera.com'),
    // Weather config (Open-Meteo, defaults to Bandar Lampung)
    WEATHER_CITY: z.string().default('Bandar Lampung'),
    WEATHER_LAT: z.string().transform(Number).default('-5.3971'),
    WEATHER_LON: z.string().transform(Number).default('105.2668'),
    // Notifikasi Telegram (opsional). Kosongkan untuk menonaktifkan fitur ini.
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
}

export const env = parsed.data;
