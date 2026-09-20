# HANDOFF — dashboard-energy (server `listrik`)

Catatan serah-terima untuk AI/engineer berikutnya. Terakhir diperbarui: 2026-09-20.
**Jangan taruh password/token di file ini.** Kredensial ada di `.env` (gitignored) di root repo.

## 1. Gambaran sistem

Monorepo npm workspaces:
- `apps/grid-monitor` — frontend React 19 + Vite 7 + Tailwind
- `apps/api` — backend Express 4 + Drizzle ORM + MySQL, Socket.IO, MQTT worker (paket `mqtt`)

Berjalan via **Docker Compose** di server ini (Ubuntu 24.04, path `~/dashboard-energy`):

| Container | Fungsi |
|---|---|
| `dashboard-mysql` | MySQL 8.0, DB `dashboard_energy` (volume `mysql_data`), tidak diekspos ke host |
| `dashboard-api` | API + MQTT worker, port 3001 (internal) |
| `dashboard-nginx` | Serve build Vite + reverse proxy `/api`, `/socket.io`, `/health`; port 80 |

Database **lokal saja** (container). Tidak ada DB eksternal. Referensi lama ke `REDACTED-HOST-1` sudah dihapus dari file, tapi masih ada di riwayat git.

Akses: `http://10.10.2.129` (IP privat server), vhost `listrik.itera.ac.id` sudah di nginx.
Login demo hasil seed: `admin@gridmonitor.iot` / `password` (ganti untuk produksi).

## 2. Cara mengoperasikan (gotcha penting)

- Shell agen **belum punya grup `docker` aktif** → awali perintah docker dengan `sg docker -c "..."`, mis. `sg docker -c "docker compose ps"`.
- **Tidak ada sudo tanpa password.** Perintah `sudo` harus dijalankan manusia.
- `node_modules/.bin/*` tidak punya bit executable → jalankan `node node_modules/typescript/bin/tsc ...`, bukan `npx tsc`.
- `.env` root berisi `SERVER_IP` (dipakai jadi `CORS_ORIGIN=http://$SERVER_IP`), password MySQL, `JWT_SECRET`, dan `MQTT_*`. Setelah ubah `.env`: `docker compose up -d api` (recreate).
- Rebuild frontend setelah ubah kode: `docker compose build nginx && docker compose up -d nginx`. API: `build api` + `up -d api`.
- `deploy/deploy.sh` selalu `build --no-cache` + `git pull`; untuk perubahan kecil lebih cepat build service tertentu saja.
- Jangan jalankan `docker compose run migrate` tanpa `--force` di `drizzle-kit push`: prompt interaktif akan menggantung. Sudah dijalankan sekali (skema + seed selesai); tidak perlu diulang kecuali reset DB (seed **menghapus** data lama).
- Query MySQL: `ROOTPW=$(grep MYSQL_ROOT_PASSWORD .env | cut -d= -f2); sg docker -c "docker compose exec -T mysql mysql -uroot -p'$ROOTPW' dashboard_energy -e '...'"`.

## 3. Perubahan yang sudah dibuat (commit lokal, belum di-push)

| Commit | Isi |
|---|---|
| `ee8be58` | `@types/express` di-pin `^4.17.21` (sebelumnya v5, tidak cocok dgn express 4 → 21 error tsc saat build); health check `deploy.sh` pakai `127.0.0.1` (bukan `localhost`, resolve ke `::1` di Alpine); service `migrate` diberi `JWT_SECRET`; env `MQTT_*` diteruskan ke service `api`; `.env`/`node_modules` di-untrack dari git |
| `d39f63d` | Redaksi kredensial DB bocor di `DEPLOYMENT_VERCEL.md` |
| `1247004` | Hapus sisa referensi DB eksternal di `apps/api/.env.example` & `apps/api/README.md` |
| `7b9874e` | Tombol copy topic MQTT (`ConfigureSensorModal.tsx`): fallback `execCommand('copy')` karena `navigator.clipboard` butuh HTTPS |
| `6c56478` | nginx `server_name listrik.itera.ac.id _` |
| `9664f60` | Fix endpoint histori `getSensorReadingsBucketed` (`sensorReadingService.ts`): bungkus kolom timestamp dgn `MIN()` agar lolos `only_full_group_by`. Sebelumnya selalu 500 → chart "Parameter History" kosong |
| `dd2a502` | `BuildingDetail.tsx`: status Connection/badge Live = socket terhubung **dan** data terakhir ≤ 30 menit; selain itu Offline + "Last data Xd ago" |

**Push ke GitHub belum dilakukan.** Server tidak punya kredensial GitHub; user memilih push manual dari terminalnya (`git push origin main`, pakai PAT). Peringatan: ada GitHub Actions yang **auto-deploy saat push ke `main`** — jadi push memicu deploy.
Git identity di repo ini di-set lokal: `alfin122130108-cyber`.

## 4. Masalah terbuka / TODO

1. **MQTT worker mati — broker menolak login.** Broker `10.10.3.20:1883` reachable (ping/port OK) tetapi mengembalikan `Connection refused: Not authorized` dengan user/password di `.env`. Kemungkinan kredensial di broker berubah. Butuh kredensial baru dari user → update `MQTT_USERNAME/MQTT_PASSWORD` di `.env` → `docker compose up -d api`. Topic yang di-subscribe: `energy/buildings/#` (`MQTT_TOPIC_PREFIX`); pastikan cocok dengan topic firmware ESP32 (format `energy/buildings/<zona>/<kode-gedung>/<sensor-id>/<param>`).
2. **Worker menyerah setelah 10× gagal connect** ("Max reconnect attempts reached") dan tidak retry lagi → setiap reboot server/broker mati sebentar, data berhenti sampai API di-restart manual. Usulan: retry tanpa batas (lihat `apps/api/src/worker/`). Belum dikerjakan — user belum menjawab.
3. **Data terakhir di DB: 2026-08-10.** DB `building_sensor_readings` (60k baris, mulai 2026-07-23) hanya punya satu gedung: Labtek 3 (`ENG-03`, id `6f368c83-8334-45ab-bd1c-17c0d78d1105`). Karena itu **export CSV** dengan preset Today/24h/7d/30d menghasilkan file kosong (header saja) — bukan bug; pilih rentang manual. Export dibatasi **50.000 baris** (`exportReadingsAsCSV`).
4. **DNS `listrik.itera.ac.id` → `103.211.143.88`**, sedangkan IP publik server (NAT) `103.211.143.226`. Domain belum sampai ke server ini; perlu admin jaringan kampus. Setelah beres: pasang HTTPS (Let's Encrypt) — sekaligus membuat Clipboard API bekerja native.
5. Broker `emqx.el.itera.ac.id` (= `103.211.143.114`, port 1883/8084) tidak reachable dari server ini (kemungkinan dibatasi ke jaringan kampus). Broker yang dipakai sekarang adalah `10.10.3.20`.
6. Indikator status sejenis di halaman lain (`CampusMap.tsx`, `BuildingSummary.tsx`, `BuildingGrid.tsx`, `LiveTicker.tsx`) masih berbasis `isConnected` (socket saja), belum cek umur data. Tanyakan user apakah mau disamakan.
7. Kebersihan repo/keamanan yang belum tuntas:
   - Kredensial DB lama (`REDACTED-HOST-1`, user `iot`) masih ada di **riwayat git**; membersihkannya butuh rewrite history + force-push (destruktif, butuh persetujuan eksplisit). Password aslinya harus dirotasi oleh pemilik server itu.
   - `tsc -b` di `apps/grid-monitor` melaporkan 1 error lama: import `CommandCenter` tak terpakai di `src/App.tsx`.
   - `npm audit` di image API menunjukkan beberapa vulnerability (belum ditangani).
   - Folder `testpublish/` = skrip publisher MQTT uji (bukan bagian aplikasi).

## 5. Jaringan (ringkas)

- NIC server `10.10.2.129/24`, gateway `10.10.2.1`; keluar internet lewat NAT sebagai `103.211.143.226`.
- Broker lokal `10.10.3.20` dijangkau via gateway itu.
- Firewall/security-group pihak kampus di luar kendali server ini.
