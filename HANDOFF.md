# HANDOFF — dashboard-energy (server `listrik`)

Catatan serah-terima untuk AI/engineer berikutnya. Terakhir diperbarui: 2026-11-03.
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

Database **lokal saja** (container). Tidak ada DB eksternal. Referensi lama ke DB eksternal yang bocor sudah dihapus dari file **dan dari riwayat git** (lihat §4 TODO #7, selesai).

Repo sudah **live di GitHub**: `github.com/ALFFtn/energiitera` (public). Semua commit di bawah sudah ter-push — tidak ada lagi commit lokal yang tertinggal (cek `git status` / `git log origin/main..HEAD` untuk pastikan).

Akses: `http://10.10.2.129` (IP privat server), vhost `listrik.itera.ac.id` sudah di nginx (status DNS publiknya masih belum pas — lihat §4 TODO #4).

**6 gedung aktif mengirim data** per 2026-11-03 (bukan cuma Labtek 3 lagi):

| Code | Nama | Zona | Baris data |
|---|---|---|---|
| ENG-001 | Labtek 1 | A | ~107k |
| ENG-01 | GKU 1 | B | ~108k |
| ENG-02 | Labtek 2 | A | ~100k |
| ENG-03 | Labtek 3 | A | ~412k (paling lama, sejak Juli) |
| ENG-05.1 | Labtek 5.1 | A | ~49k |
| ENG-05.2 | Labtek 5.2 | A | ~14k, **data terakhir macet** (cek lagi, mungkin publisher mati) |

Total `building_sensor_readings`: ~789k baris.

**Login:**
- Admin (bisa tambah/edit/hapus gedung + kelola user): `admin@gridmonitor.iot` / `password`
- Viewer (lihat-saja): `operator@gridmonitor.iot` atau `engineer@gridmonitor.iot` / `password`
- Ganti password untuk produksi — lewat UI sekarang bisa (menu profil → Profile Settings).
- Demo publik tanpa login: `/demo` (data simulasi, lihat §3).

## 2. Cara mengoperasikan (gotcha penting)

- Shell agen **belum punya grup `docker` aktif** → awali perintah docker dengan `sg docker -c "..."`, mis. `sg docker -c "docker compose ps"`.
- **Tidak ada sudo tanpa password.** Perintah `sudo` harus dijalankan manusia.
- `node_modules/.bin/*` tidak punya bit executable → jalankan `node node_modules/typescript/bin/tsc ...` (ada di root, hoisted — bukan di `apps/api/node_modules`), bukan `npx tsc`.
- `.env` root berisi `SERVER_IP`, password MySQL, `JWT_SECRET`, `MQTT_*`, `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` (opsional). Setelah ubah `.env`: `docker compose up -d api` (recreate).
- Rebuild frontend setelah ubah kode: `docker compose build nginx && docker compose up -d nginx`. API: `build api` + `up -d api`.
- `deploy/deploy.sh` selalu `build --no-cache` + `git pull`; untuk perubahan kecil lebih cepat build service tertentu saja.
- **Migrasi skema (nambah kolom dll): JANGAN pakai `docker compose --profile tools run migrate`** — `CMD`-nya sekalian jalankan `seed.ts` yang **DELETE + CASCADE** `buildings` → menghapus semua `building_sensor_readings` (789k+ baris data real). Caranya yang aman:
  1. `cd apps/api && node ../../node_modules/drizzle-kit/bin.cjs generate` → bikin file migrasi SQL, **baca dulu isinya**.
  2. Kalau cuma `ALTER TABLE ADD COLUMN` (additive, aman): terapkan manual lewat `mysql` langsung (lihat baris query di bawah), bukan lewat drizzle-kit push/migrate.
  3. Cek row count sebelum & sesudah sebagai sanity check.
  - `drizzle-kit push --force` langsung dari CLI biasanya **diblokir auto-mode classifier** ("Blind Apply") — generate+baca+terapkan manual seperti di atas lebih aman & lebih mudah disetujui.
- Query MySQL: `ROOTPW=$(grep MYSQL_ROOT_PASSWORD .env | cut -d= -f2); sg docker -c "docker compose exec -T mysql mysql -uroot -p'$ROOTPW' dashboard_energy -e '...'"`.
- **Docker Hub sering 429 (Too Many Requests)** dari IP NAT server ini saat `docker compose build` menarik base image. Sejak 2026-09-29, semua `FROM node:20-alpine`/`FROM nginx:alpine` di `deploy/Dockerfile.*` sudah dialihkan ke `mirror.gcr.io/library/...` (mirror baca-saja Google, image identik, tanpa limit ini).
- **Pesan commit via `git commit -m "..."` yang mengandung backtick (`` ` ``) kena shell command substitution** dan sebagian teks hilang diam-diam (push tetap jalan, cuma pesannya cacat kosmetik). Kalau pesan commit panjang/ada backtick, tulis ke file dulu (`cat > pesan.txt <<'EOF' ... EOF`) lalu `git commit -F pesan.txt`.
- Push ke `main` **memicu GitHub Actions auto-deploy** (`.github/workflows/deploy-frontend.yml`). PAT GitHub tersimpan di `~/.git-credentials` (credential.helper store) di server ini — push bisa langsung dari sini, tidak perlu lagi manual dari terminal user.

## 3. Riwayat perubahan (semua sudah di-push ke GitHub)

Ringkas per sesi kerja. Untuk detail lengkap tiap commit, `git log --stat <hash>` — pesan commitnya sengaja ditulis panjang/menjelaskan root cause.

**Sesi awal (s.d. 2026-09-29):**
| Commit | Isi |
|---|---|
| `ee8be58` | Fix build Docker Compose di VPS baru (`@types/express` dipin, health check pakai `127.0.0.1`, dll) |
| `d39f63d`, `1247004` | Redaksi kredensial DB yang bocor di dokumentasi |
| `7b9874e` | Fallback copy-topic MQTT utk non-HTTPS |
| `6c56478` | vhost nginx `listrik.itera.ac.id` |
| `9664f60` | Fix endpoint histori (`only_full_group_by`) — chart Parameter History sempat selalu kosong |
| `dd2a502` | Status Connection di Building Detail cek umur data, bukan cuma socket |
| `0d45baf` | **Worker MQTT retry tanpa batas** — fix bug lama yang bikin worker mati total & tidak pulih sendiri setelah 10x gagal reconnect |
| `69cad9d`, `0d2bd92` | **Notifikasi Telegram** saat gedung/worker MQTT offline-online (konektivitas saja, bukan anomali sensor). Bisa kirim ke banyak chat ID sekaligus (chat pribadi + grup) |
| `bd43af2` | Hapus label persen di kartu 3-Phase Load Balance |
| `cf089aa` | Base image Docker dialihkan ke `mirror.gcr.io` (fix 429 Docker Hub) |
| `97bb1fe` | Sinkronkan ambang Live/Offline 30 menit (chart vs notifikasi Telegram sempat beda) |

**Sesi 2026-10-22 — pembersihan repo & push pertama ke GitHub:**
| Commit | Isi |
|---|---|
| `2d96a0f` dkk | **Riwayat git dibersihkan total** via `git-filter-repo` sebelum push pertama (repo ternyata public & belum pernah di-push). Dua kredensial DB plaintext lama dihapus dari seluruh riwayat (52 commit, SHA semua ganti), termasuk **temuan baru**: kredensial hosting cPanel yang belum pernah tercatat sebelumnya (detail di backup bundle lokal, bukan di sini — kalau bundle-nya sudah tidak ada/kadaluarsa, minta user cek ulang apakah akun itu masih aktif & perlu dirotasi). `node_modules/` (13.662 file) ikut dibuang dari riwayat, `.git` 43MB → 2.7MB. |

**Sesi 2026-10-25 — perbaikan chart & export:**
| Commit | Isi |
|---|---|
| `a8341bf` | Kartu gedung tampilkan `--` (bukan `0.0`) selagi data live belum masuk — sebelumnya kelihatan seperti pembacaan nol asli |
| `1673cd4` | Tick waktu sumbu X grafik Parameter History — sebelumnya cuma 2 label di ujung |
| `1ee6591` | Label sumbu Y pakai algoritma "nice numbers" (Paul Heckbert) — sebelumnya pecahan ganjil |
| `edf5859` | **Fix distorsi SVG chart** — viewBox sekarang ikut ukuran kontainer asli via ResizeObserver (akar masalah "penyet": `preserveAspectRatio="none"` + viewBox fix 600×300 padahal kontainer jauh lebih lebar) |
| `bb60584` | Voltage L-L (R-S/S-T/T-R) di grafik Parameter History, dihitung dari formula sama dengan `LineVoltageGauge.tsx` (√3 × rata-rata 2 fase L-N) |
| `d12dc0c` | Kartu THD Voltage/Current diaktifkan — meter tidak ukur THD asli, dipakai rumus estimasi (THD arus dari Power Factor, THD tegangan dari ketidakseimbangan fase). Ditandai "· estimasi" di UI |
| `e8dfca8`, `498f3d5` | **Semua tampilan waktu dikunci ke WIB** (`config/datetime.ts` frontend, `utils/datetime.ts` backend) — sebelumnya ikut timezone browser/server (server jalan di UTC). Termasuk filter preset tanggal di modal Export CSV yang tadinya double-bug (UTC + salah kira input `datetime-local` itu timezone-aware) |
| `a22a419` | CSV export diagregasi per 5 menit (bukan baris mentah ~10 detik) — permintaan klien, sekalian bikin "export semua data" beneran ambil seluruh rentang bukan cuma 10rb baris terakhir |

**Sesi 2026-10-28 s.d. 2026-11-03 — fitur baru & bersih-bersih UI:**
| Commit | Isi |
|---|---|
| `831b897`, `bad4176` | **Halaman demo publik `/demo`** (mode tamu, tanpa login, data simulasi lokal di browser — tidak sentuh API/DB asli) + tombol "Masuk sebagai Tamu" di halaman Login |
| `198779c` | **Energy Import/Export** — kolom baru `energy_import`/`energy_export` di DB (migrasi additive, lihat §2), menggantikan kartu Temperature di Quick Stats (Temperature masih ada di dropdown chart) |
| `e9ad964`, `d8fbd98`, `2b75c86` | **Hapus UI dummy/mati**: kartu Event Log (hardcode, tanpa fetch), sidebar kanan "24h Trend/Recent Activity/Zone Map" di Monitoring (hardcode juga), tombol "View History"/"Schedule Maintenance" (tidak ada `onClick`) |
| `2e8d967` | **Role admin/viewer** — middleware `authorize()` sudah ada dari awal tapi tidak pernah dipakai, sekarang diterapkan ke route tambah/edit/hapus gedung. **Sekalian nemu & tutup celah privilege escalation**: endpoint publik `/auth/register` menerima field `role` dari body klien (siapa pun bisa daftar langsung jadi admin) |
| `0177146` | **Halaman User Management** (`/users`, admin-only, navbar) — CRUD user + ubah role, dengan proteksi backend (tidak bisa hapus diri sendiri / hapus-turunkan admin terakhir) |
| `937d60f` | **Halaman Profile Settings** (`/profile`) — ganti password sendiri, endpoint baru `PUT /api/auth/change-password` (sebelumnya tidak ada sama sekali). Sesi lama diputus otomatis setelah ganti password |

## 4. Masalah terbuka / TODO

1. ~~MQTT worker mati — broker menolak login.~~ **Selesai 2026-09-20.**
2. ~~Worker menyerah setelah 10× gagal connect.~~ **Selesai 2026-09-23** (`0d45baf`).
3. ~~Notifikasi Telegram saat gedung/worker offline.~~ **Selesai & live.** Cakupan masih **konektivitas saja**; anomali sensor (voltage sag/swell, overload, dst.) belum terhubung ke Telegram — jalur alert utk `building_sensor_readings` masih belum ada sama sekali (beda dari jalur "panel" lama yang sudah generate alert tapi utk skema data lain yang sudah tidak dipakai).
4. **DNS `listrik.itera.ac.id` masih belum pas dari luar.** Dicek 2026-11-03: domain resolve ke `103.211.143.114`, BUKAN IP publik NAT server ini (`103.211.143.226`) — jadi externally masih salah arah (sebelumnya pernah ke `.88`, sekarang `.114`, tetap bukan `.226`). **Tapi user berhasil akses lewat domain itu di browsernya** — kemungkinan campus punya DNS internal/split-horizon yang resolve beda dari DNS publik. Perlu konfirmasi ke admin jaringan kampus kalau mau akses dari luar jaringan kampus juga benar. Setelah beres: pasang HTTPS (Let's Encrypt).
5. Broker `emqx.el.itera.ac.id` (= `103.211.143.114` — **catatan: ini PERSIS IP yang sekarang jadi hasil DNS `listrik.itera.ac.id` juga**, kemungkinan dua domain itu memang di-resolve ke gateway/load balancer kampus yang sama) tidak reachable dari server ini. Broker yang dipakai sekarang `10.10.3.20`.
6. **ENG-05.2 (Labtek 5.2) berhenti kirim data** — data terakhir tercatat jauh lebih lama dari 5 gedung lain (dicek 2026-11-03). Perlu dicek publisher/ESP32-nya, atau tanya user apakah memang sengaja dimatikan.
7. ~~Kredensial DB lama di riwayat git.~~ **Selesai 2026-10-22**, lihat §3.
8. Indikator status (`isConnected` vs umur data) belum konsisten di semua komponen — beberapa komponen command-center (`CampusMap.tsx`, `BuildingSummary.tsx`, `KPISidebar.tsx`, `AlertFeed.tsx`, `LiveTicker.tsx`, `PowerDistChart.tsx`) sama sekali **tidak dipakai di halaman mana pun** (orphaned, sudah dicek — tidak ada import-nya di `pages/`). `MonitoringRightSidebar.tsx` & `EventLog.tsx` juga masuk kategori ini sekarang (sengaja tidak dihapus filenya, cuma tidak dipanggil lagi — `EventLog.tsx` masih dipakai di `GuestDemo.tsx` & `PanelDetail.tsx`). `CommandCenter.tsx` + `DashboardDescription.tsx` (halaman landing/about yang belum di-routing) juga orphaned — ini penyebab 1 error `tsc` yang tersisa (lihat #10).
9. **Energy Import/Export cuma terisi mulai 2026-11-03** (saat kolom DB ditambahkan) — data sebelum itu NULL, tidak bisa di-backfill krn memang belum pernah direkam.
10. `tsc -b` di `apps/grid-monitor` melaporkan 1 error: import `CommandCenter` tak terpakai di `src/App.tsx` — tidak mengganggu build (Vite tidak full-typecheck), tapi belum dibersihkan. Opsinya: hapus importnya, atau akhirnya routing halaman itu (lihat #8).
11. `npm audit` di image API menunjukkan beberapa vulnerability (belum ditangani).
12. Folder `testpublish/` = skrip publisher MQTT uji (bukan bagian aplikasi).
13. **cPanel kredensial lama (temuan §3 sesi 2026-10-22) belum dikonfirmasi statusnya** — tanyakan user apakah akun hosting itu masih aktif, kalau ya wajib dirotasi passwordnya di sisi hosting (di luar kendali server ini).
14. Endpoint publik `POST /auth/register` ada tapi **tidak ada UI pendaftaran mandiri** di frontend — satu-satunya cara bikin akun baru sekarang adalah lewat User Management (admin). Kalau suatu saat mau buka pendaftaran mandiri, ingat itu selalu jadi role `viewer` (sudah dikunci, lihat §3 `2e8d967`) — jangan buka lagi celah `role` dari body request.

## 5. Jaringan (ringkas)

- NIC server `10.10.2.129/24`, gateway `10.10.2.1`; keluar internet lewat NAT sebagai `103.211.143.226`.
- Broker lokal `10.10.3.20` dijangkau via gateway itu.
- Firewall/security-group pihak kampus di luar kendali server ini.
