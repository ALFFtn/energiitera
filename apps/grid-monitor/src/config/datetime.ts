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

// WIB is a fixed UTC+7 offset year-round (Indonesia has no DST), so the
// conversion below is exact. These two are for <input type="datetime-local">
// fields: that input always reads/writes "YYYY-MM-DDTHH:mm" with NO timezone
// info and the browser treats it as *its own* local time — which breaks the
// "always show Bandar Lampung time" rule for anyone not physically on WIB.
// Use these so the field always displays/accepts WIB wall-clock numbers,
// independent of the viewer's device timezone.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Real Date instant → "YYYY-MM-DDTHH:mm" showing its WIB wall-clock time. */
export function toWIBDateTimeLocalValue(date: Date): string {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: APP_TIMEZONE,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: false,
    });
    const parts = fmt.formatToParts(date).reduce<Record<string, string>>((acc, p) => {
        acc[p.type] = p.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** "YYYY-MM-DDTHH:mm" read as WIB wall-clock → the real UTC Date instant. */
export function parseWIBDateTimeLocal(value: string): Date {
    if (!value) return new Date(NaN);
    // Parse the numbers as UTC first (sidesteps the browser's own timezone
    // entirely), then shift back by the WIB offset to get the true instant.
    const asIfUTC = new Date(`${value}:00Z`);
    return new Date(asIfUTC.getTime() - WIB_OFFSET_MS);
}
