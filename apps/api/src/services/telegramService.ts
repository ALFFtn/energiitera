import { env } from '../config/env';

const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Kirim pesan ke satu atau beberapa chat/grup Telegram yang dikonfigurasi lewat
 * TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID. TELEGRAM_CHAT_ID boleh berisi beberapa
 * ID dipisah koma (mis. chat pribadi + grup sekaligus): "6296098275,-1001234567890".
 * Kalau token belum diisi atau tidak ada chat ID valid, fitur ini otomatis
 * nonaktif (tidak melempar error) supaya deployment tanpa Telegram tetap jalan.
 */
export async function sendTelegramMessage(text: string): Promise<void> {
    const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chatIdRaw } = env;

    const chatIds = (chatIdRaw || '')
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

    if (!token || chatIds.length === 0) {
        console.log('ℹ️  Telegram belum dikonfigurasi (TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID kosong), notifikasi dilewati.');
        return;
    }

    await Promise.all(chatIds.map((chatId) => sendToChat(token, chatId, text)));
}

async function sendToChat(token: string, chatId: string, text: string): Promise<void> {
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
            console.error(`❌ Gagal kirim notifikasi Telegram ke ${chatId} (HTTP ${res.status}):`, body);
        }
    } catch (error) {
        console.error(`❌ Error mengirim notifikasi Telegram ke ${chatId}:`, error);
    }
}

/** Escape karakter khusus HTML supaya nama gedung/pesan bebas tidak merusak format Telegram. */
export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
