// Semua timestamp di dashboard ditampilkan dalam waktu lokasi gedung —
// Bandar Lampung / WIB (Asia/Jakarta, UTC+7) — terlepas dari timezone
// perangkat/browser orang yang membuka dashboard. Ini penting karena
// dashboard ini memantau lokasi tetap (gedung-gedung ITERA), bukan
// waktu pribadi si penonton; tanpa timeZone eksplisit, Intl API
// (toLocaleTimeString dkk) default ke timezone perangkat si penonton,
// yang bisa beda-beda dan bikin jam di dashboard tidak konsisten
// dengan jam dinding Bandar Lampung.
export const APP_TIMEZONE = 'Asia/Jakarta';

export function formatTimeWIB(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
    return date.toLocaleTimeString('id-ID', { timeZone: APP_TIMEZONE, ...opts });
}

export function formatDateWIB(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
    return date.toLocaleDateString('id-ID', { timeZone: APP_TIMEZONE, ...opts });
}

export function formatDateTimeWIB(date: Date, opts: Intl.DateTimeFormatOptions = {}): string {
    return date.toLocaleString('id-ID', { timeZone: APP_TIMEZONE, ...opts });
}
