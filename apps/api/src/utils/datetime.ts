// Dashboard ini memantau lokasi tetap (gedung-gedung ITERA di Bandar
// Lampung), bukan waktu pribadi si pembaca laporan/pesan — jadi semua
// timestamp yang ditampilkan ke manusia (CSV export, notifikasi Telegram,
// dll) selalu diformat ke WIB (Asia/Jakarta, UTC+7), terlepas dari
// timezone server itu sendiri (server ini jalan di UTC).
export const APP_TIMEZONE = 'Asia/Jakarta';

/** Format "YYYY-MM-DD HH:mm:ss WIB" — dipakai untuk CSV export dkk. */
export function formatDateTimeWIB(date: Date): string {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    });
    const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
        acc[p.type] = p.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} WIB`;
}

/** Format singkat "DD/MM/YYYY, HH:mm WIB" — dipakai untuk pesan/notifikasi. */
export function formatShortDateTimeWIB(date: Date): string {
    return date.toLocaleString('id-ID', {
        timeZone: APP_TIMEZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WIB';
}
