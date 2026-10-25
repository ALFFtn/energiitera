import { db } from '../config/database';
import { alerts, buildings } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { alertService } from '../services/alertService';
import { sendTelegramMessage, escapeHtml } from '../services/telegramService';
import { getAllLatestReadings } from '../services/sensorReadingService';
import { formatShortDateTimeWIB } from '../utils/datetime';

// Samakan dengan OFFLINE_AFTER_MS di apps/grid-monitor/src/pages/BuildingDetail.tsx
// (badge Live/Offline) supaya notifikasi Telegram & status di dashboard konsisten.
// Kalau salah satu diubah, ubah juga yang satunya.
const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 menit
const CHECK_INTERVAL_MS = 60 * 1000; // cek tiap 1 menit
const FIRST_CHECK_DELAY_MS = 30 * 1000; // beri jeda saat startup sebelum cek pertama

const ALERT_TITLE_BUILDING_OFFLINE = 'Gedung offline';
const ALERT_TITLE_MQTT_DOWN = 'Worker MQTT terputus';

/**
 * Memantau konektivitas dan mengirim notifikasi Telegram + mencatat alert
 * di database saat:
 * 1. Worker kehilangan/memulihkan koneksi ke broker MQTT (mqttService 'disconnected'/'connect').
 * 2. Sebuah gedung berhenti mengirim data lebih dari STALE_THRESHOLD_MS (dicek berkala),
 *    kasus di mana broker tetap hidup tapi publisher/ESP32 gedung itu yang mati.
 *
 * Status "sedang offline" disimpan sebagai alert aktif di tabel `alerts`, bukan
 * di memori proses — supaya tidak terjadi notifikasi ganda/hilang saat API di-restart
 * di tengah gangguan.
 */
export class ConnectivityMonitor {
    private checkTimer: NodeJS.Timeout | null = null;
    private firstCheckTimer: NodeJS.Timeout | null = null;

    start(): void {
        this.firstCheckTimer = setTimeout(() => {
            this.checkBuildings().catch((err) => console.error('❌ ConnectivityMonitor error:', err));
        }, FIRST_CHECK_DELAY_MS);

        this.checkTimer = setInterval(() => {
            this.checkBuildings().catch((err) => console.error('❌ ConnectivityMonitor error:', err));
        }, CHECK_INTERVAL_MS);
    }

    stop(): void {
        if (this.checkTimer) clearInterval(this.checkTimer);
        if (this.firstCheckTimer) clearTimeout(this.firstCheckTimer);
    }

    /** Panggil saat mqttService memancarkan event 'disconnected'. */
    async onMqttDisconnected(): Promise<void> {
        const already = await this.hasActiveAlert(null, ALERT_TITLE_MQTT_DOWN);
        if (already) return;

        await alertService.createAlert({
            buildingId: null,
            panelId: null,
            severity: 'critical',
            title: ALERT_TITLE_MQTT_DOWN,
            message: 'Worker API kehilangan koneksi ke MQTT broker. Data sensor berhenti masuk sampai koneksi pulih.',
        });

        await sendTelegramMessage(
            `🔴 <b>MQTT Worker Terputus</b>\n` +
            `Worker API kehilangan koneksi ke broker MQTT. Data sensor berhenti masuk.\n` +
            `Waktu: ${this.formatTime(new Date())}`
        );
    }

    /** Panggil saat mqttService memancarkan event 'connect' (koneksi awal maupun reconnect). */
    async onMqttConnected(): Promise<void> {
        const alertId = await this.getActiveAlertId(null, ALERT_TITLE_MQTT_DOWN);
        if (!alertId) return; // bukan pemulihan dari gangguan yang tercatat (mis. start pertama kali)

        await alertService.resolveAlert(alertId);
        await sendTelegramMessage(
            `🟢 <b>MQTT Worker Pulih</b>\n` +
            `Koneksi ke broker MQTT sudah kembali normal.\n` +
            `Waktu: ${this.formatTime(new Date())}`
        );
    }

    private async checkBuildings(): Promise<void> {
        const latestReadings = await getAllLatestReadings();
        if (latestReadings.length === 0) return;

        const buildingRows = await db.select({ id: buildings.id, name: buildings.name }).from(buildings);
        const nameById = new Map(buildingRows.map((b) => [b.id, b.name]));

        for (const { buildingId, buildingCode, reading } of latestReadings) {
            const ageMs = Date.now() - new Date(reading.timestamp).getTime();
            const isStale = ageMs > STALE_THRESHOLD_MS;
            const buildingName = nameById.get(buildingId) || buildingCode;
            const alreadyFlagged = await this.hasActiveAlert(buildingId, ALERT_TITLE_BUILDING_OFFLINE);

            if (isStale && !alreadyFlagged) {
                await alertService.createAlert({
                    buildingId,
                    panelId: null,
                    severity: 'critical',
                    title: ALERT_TITLE_BUILDING_OFFLINE,
                    message: `${buildingName} berhenti mengirim data sejak ${this.formatTime(new Date(reading.timestamp))}.`,
                });

                await sendTelegramMessage(
                    `🔴 <b>${escapeHtml(buildingName)} Offline</b>\n` +
                    `Tidak ada data masuk lebih dari ${STALE_THRESHOLD_MS / 60000} menit.\n` +
                    `Data terakhir: ${this.formatTime(new Date(reading.timestamp))}`
                );
            } else if (!isStale && alreadyFlagged) {
                const alertId = await this.getActiveAlertId(buildingId, ALERT_TITLE_BUILDING_OFFLINE);
                if (alertId) await alertService.resolveAlert(alertId);

                await sendTelegramMessage(
                    `🟢 <b>${escapeHtml(buildingName)} Online Kembali</b>\n` +
                    `Data sensor sudah masuk lagi.\n` +
                    `Waktu: ${this.formatTime(new Date())}`
                );
            }
        }
    }

    private async hasActiveAlert(buildingId: string | null, title: string): Promise<boolean> {
        return (await this.getActiveAlertId(buildingId, title)) !== null;
    }

    private async getActiveAlertId(buildingId: string | null, title: string): Promise<string | null> {
        const condition = buildingId
            ? and(eq(alerts.buildingId, buildingId), eq(alerts.title, title), eq(alerts.status, 'active'))
            : and(isNull(alerts.buildingId), eq(alerts.title, title), eq(alerts.status, 'active'));

        const rows = await db.select({ id: alerts.id }).from(alerts).where(condition).limit(1);
        return rows[0]?.id ?? null;
    }

    private formatTime(date: Date): string {
        // Sudah termasuk suffix " WIB" — lihat formatShortDateTimeWIB di utils/datetime.ts
        return formatShortDateTimeWIB(date);
    }
}

export const connectivityMonitor = new ConnectivityMonitor();
