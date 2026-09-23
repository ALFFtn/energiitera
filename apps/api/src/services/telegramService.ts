import { env } from '../config/env';

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Kirim pesan ke chat/grup Telegram yang dikonfigurasi lewat
 * TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID. Kalau salah satu belum diisi,
 * fitur ini otomatis nonaktif (tidak melempar error) supaya deployment
 * tanpa Telegram tetap berjalan normal.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatId } = env;

    if (!token || !chatId) {
        console.log('ℹ️  Telegram belum dikonfigurasi (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID kosong), notifikasi dilewati.');
        return;
    }

    try {
        const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text,
                parse_mode: 'HTML',
                disable_web_page_preview: true,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            console.error(`❌ Gagal kirim notifikasi Telegram (HTTP ${res.status}):`, body);
        }
    } catch (error) {
        console.error('❌ Error mengirim notifikasi Telegram:', error);
    }
}

/** Escape karakter khusus HTML supaya nama gedung/pesan bebas tidak merusak format Telegram. */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
