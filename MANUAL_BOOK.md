# Manual Book — dashboard-energy (Electrical Building Monitoring System)

**v1.0.0 • Thinqly Labs Inc.**

---

## 📋 Instruksi untuk Eksekutor (Claude di Chrome)

Dokumen ini **sudah lengkap teksnya**, tinggal diisi gambar. Setiap tempat yang butuh screenshot ditandai blok `<!-- SCREENSHOT: ... -->` berisi instruksi persis (URL, siapa yang harus login, aksi apa sebelum memotret). Jalankan satu per satu dari atas ke bawah:

1. Buka URL yang disebut di instruksi.
2. Kalau perlu login, pakai kredensial yang disebutkan (admin atau viewer — lihat §0.1 di bawah).
3. Lakukan aksi yang diminta (klik tombol, pilih dropdown, dst) sebelum memotret.
4. Simpan screenshot sebagai file PNG dengan nama persis seperti disebut, ke dalam folder `manual-images/` di root repo ini (buat foldernya kalau belum ada).
5. Baris `![...](...)` tepat di bawah setiap blok instruksi **sudah menunjuk ke path yang benar** — begitu file PNG-nya ada di `manual-images/` dengan nama yang sesuai, gambarnya otomatis muncul saat markdown ini dirender. Tidak perlu edit teks lain.
6. Kalau ukuran layar browser memungkinkan, pakai lebar viewport ~1440px supaya tata letak cocok dengan deskripsi di manual ini (layout desktop, bukan mobile).
7. Setelah semua gambar terisi, hapus seluruh bagian "📋 Instruksi untuk Eksekutor" ini (termasuk §0.1) dari file final — itu catatan kerja utk eksekusi, bukan bagian manual untuk pengguna akhir. (Catatan: dokumen ini sengaja **tidak pernah menulis kredensial asli** di mana pun, termasuk di §0.1 — cuma rujukan ke `HANDOFF.md` — supaya aman di repo publik baik sebelum maupun sesudah bagian ini dihapus.)

### 0.1 Kredensial untuk screenshot

Kredensial **tidak dituliskan di sini** (dokumen ini publik di GitHub) — lihat `HANDOFF.md` bagian "Login" di root repo yang sama untuk akun admin & akun viewer yang dipakai. Kalau sudah berubah, tanyakan ke administrator sistem.

- Dipakai di sebagian besar screenshot: akun dengan role **admin**.
- Khusus screenshot §13 (ilustrasi beda hak akses): akun dengan role **viewer**.
- URL dasar: pakai `http://10.10.2.129` (IP privat server) kalau `listrik.itera.ac.id` belum bisa diakses dari posisi Anda.
- **Jangan** ubah/hapus data sungguhan saat mengambil screenshot (khususnya di §5 Add Building, §10 Add User — batalkan/`Cancel` modal-nya setelah discreenshot, jangan benar-benar submit, kecuali memang diminta).

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Login & Mode Tamu](#2-login--mode-tamu)
3. [Halaman Monitoring (Daftar Gedung)](#3-halaman-monitoring-daftar-gedung)
4. [Menambah Gedung Baru (Admin)](#4-menambah-gedung-baru-admin)
5. [Halaman Detail Gedung](#5-halaman-detail-gedung)
6. [Grafik Parameter History](#6-grafik-parameter-history)
7. [Export Data ke CSV](#7-export-data-ke-csv)
8. [Configure Sensor (Topic MQTT)](#8-configure-sensor-topic-mqtt)
9. [Manajemen User (Admin)](#9-manajemen-user-admin)
10. [Profile Settings — Ganti Password](#10-profile-settings--ganti-password)
11. [Notifikasi Telegram](#11-notifikasi-telegram)
12. [Perbedaan Hak Akses Admin vs Viewer](#12-perbedaan-hak-akses-admin-vs-viewer)
13. [Pertanyaan Umum (FAQ)](#13-pertanyaan-umum-faq)

---

## 1. Pendahuluan

**Electrical Building Monitoring System** adalah dashboard untuk memantau konsumsi listrik gedung secara real-time. Data diambil dari energy meter (LVMDP — Low Voltage Main Distribution Panel) yang terhubung ke Raspberry Pi/ESP32 sebagai publisher MQTT, lalu ditampilkan dalam bentuk grafik, gauge, dan laporan.

**Siapa yang memakai sistem ini:**
- **Admin** — bisa melihat semua data, menambah/mengedit/menghapus gedung, dan mengelola akun pengguna lain.
- **Viewer** — bisa melihat semua data monitoring, tapi tidak bisa mengubah data gedung atau pengguna.
- **Tamu (tanpa akun)** — bisa melihat contoh tampilan sistem lewat halaman demo publik, untuk keperluan promosi/presentasi.

---

## 2. Login & Mode Tamu

Buka alamat dashboard di browser, Anda akan diarahkan ke halaman Login.

<!-- SCREENSHOT: 01-login.png
URL: http://10.10.2.129/login
Login: TIDAK PERLU (screenshot halaman sebelum login)
Aksi: tidak ada, screenshot halaman apa adanya (full page, viewport desktop)
-->
![Halaman Login](./manual-images/01-login.png)

Masukkan **Email** dan **Password** Anda, lalu klik **Sign In**. Kalau lupa password, hubungi admin sistem untuk direset lewat halaman Manajemen User (lihat §9) — fitur "Forgot Password" mandiri belum tersedia.

### Mencoba tanpa akun (Mode Tamu)

Kalau Anda belum punya akun dan hanya ingin melihat contoh tampilan sistem, klik tombol **"Masuk sebagai Tamu (Demo)"** di bawah tombol Sign In. Halaman ini menampilkan data **simulasi** (bukan data gedung sungguhan) yang bergerak otomatis layaknya data real-time, cocok untuk ditunjukkan ke orang lain tanpa perlu akun.

<!-- SCREENSHOT: 02-demo.png
URL: http://10.10.2.129/demo
Login: TIDAK PERLU (halaman publik)
Aksi: tidak ada, screenshot bagian atas halaman (quick stats + gauge-gauge, tidak perlu scroll sampai bawah)
-->
![Halaman Mode Tamu / Demo](./manual-images/02-demo.png)

---

## 3. Halaman Monitoring (Daftar Gedung)

Setelah login, Anda masuk ke halaman **Monitoring** — daftar semua gedung yang terpantau, dikelompokkan per zona kampus.

<!-- SCREENSHOT: 03-monitoring.png
URL: http://10.10.2.129/monitoring
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: tidak ada, screenshot halaman apa adanya setelah daftar gedung selesai dimuat (tunggu beberapa detik sampai angka Load/PF muncul, bukan "--")
-->
![Halaman Monitoring — daftar gedung](./manual-images/03-monitoring.png)

Setiap kartu gedung menampilkan:
- **Load** (kW) dan **PF** (power factor) saat ini — kalau masih menampilkan `--`, berarti data live belum sempat masuk, tunggu sebentar.
- **Titik status** di pojok kanan atas kartu: hijau (Operational), oranye (Warning), merah (Critical), abu-abu (Offline).
- **Badge status** di bawah: Operational / Offline — dianggap Offline kalau tidak ada data masuk lebih dari 30 menit.

Klik kartu gedung mana saja untuk membuka halaman detailnya (lihat §5).

---

## 4. Menambah Gedung Baru (Admin)

**Hanya admin** yang bisa menambah gedung. Klik tombol **"Add Building"** di pojok kanan atas halaman Monitoring (tombol ini tidak muncul sama sekali untuk akun viewer).

<!-- SCREENSHOT: 04-add-building-modal.png
URL: http://10.10.2.129/monitoring
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: klik tombol "Add Building" di pojok kanan atas, screenshot modal yang terbuka (JANGAN klik "Create Building" sungguhan -- setelah discreenshot klik "Cancel" atau tombol X untuk menutup tanpa menyimpan)
-->
![Modal tambah gedung baru](./manual-images/04-add-building-modal.png)

Isi formulirnya:
- **Zone** — pilih zona kampus tempat gedung berada.
- **Building Name** — nama gedung, mis. "Gedung Kuliah Umum 2".
- **Building Code** — kode unik gedung, mis. `GKU-02` (otomatis jadi huruf besar).
- **Description** — deskripsi singkat (opsional).
- **Grid Connection** — jenis koneksi listrik: Primary / Secondary / Backup.

Setelah terisi, klik **"Create Building"**. Gedung baru akan muncul di daftar. Setelah itu, konfigurasi sensor/topic MQTT-nya lewat halaman detail gedung (§8) supaya perangkat ESP32/Raspberry Pi tahu ke mana harus mengirim data.

---

## 5. Halaman Detail Gedung

Klik salah satu kartu gedung untuk melihat data lengkapnya secara real-time.

<!-- SCREENSHOT: 05-building-detail.png
URL: (klik salah satu kartu gedung dari /monitoring, mis. "Labtek 3")
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: tidak ada, screenshot bagian atas halaman (quick stats 5 kartu + gauge-gauge di bawahnya), tidak perlu scroll sampai grafik
-->
![Halaman Detail Gedung — bagian atas](./manual-images/05-building-detail.png)

Bagian atas halaman menampilkan:
- **Quick Stats** (5 kartu): Active Power (kW), Reactive Power (kVAR), Energy Import (kWh, kumulatif), Energy Export (kWh, kumulatif), dan status Connection (Online/Offline).
- **Gauge Tegangan (L-N)** — tegangan line-to-neutral per fasa R/S/T.
- **Gauge Tegangan (L-L)** — tegangan line-to-line (R-S, S-T, T-R), dihitung otomatis dari tegangan L-N.
- **Gauge Power Factor**.
- **3-Phase Load Balance** — distribusi arus antar fasa.
- **Kartu THD (Harmonics)** — estimasi distorsi harmonik tegangan & arus (lihat catatan di bawah).

> **Catatan tentang THD:** sensor yang dipakai (Schneider IEM 3255) tidak mengukur THD secara langsung, jadi angka yang ditampilkan adalah **estimasi** dari parameter listrik lain (ditandai label "· estimasi" di kartunya), bukan pengukuran harmonik sungguhan.

---

## 6. Grafik Parameter History

Masih di halaman Detail Gedung, scroll ke bawah untuk melihat grafik riwayat parameter.

<!-- SCREENSHOT: 06-parameter-history.png
URL: (masih di halaman detail gedung yang sama dengan screenshot 05)
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: scroll ke bagian "Parameter History", klik rentang waktu "1 Hari" (kalau belum terpilih), pastikan dropdown parameter menunjukkan "Voltage Phase R", lalu screenshot kartu grafik tersebut (dari judul "Parameter History" sampai baris MIN/AVG/MAX di bawah grafik)
-->
![Grafik Parameter History](./manual-images/06-parameter-history.png)

Cara memakai grafik ini:
1. Pilih **rentang waktu** di kanan atas: 1 Jam, 1 Hari, 3 Hari, 1 Minggu, atau 1 Bulan.
2. Pilih **parameter** yang mau dilihat lewat dropdown di sebelahnya — tersedia tegangan L-N & L-L per fasa, arus per fasa, daya aktif, power factor, **Energy Import/Export**, frekuensi, dan suhu.
3. Arahkan kursor (hover) ke grafik untuk melihat nilai persis pada waktu tertentu.
4. Di bawah grafik ada ringkasan **MIN / AVG / MAX** untuk rentang waktu yang dipilih.

---

## 7. Export Data ke CSV

Di bagian bawah halaman Detail Gedung, klik tombol **"Export CSV"** untuk mengunduh data historis dalam format spreadsheet.

<!-- SCREENSHOT: 07-export-csv-modal.png
URL: (masih di halaman detail gedung yang sama)
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: klik tombol "Export CSV" di bagian bawah halaman, lalu klik preset "7 Hari", screenshot modal yang terbuka (JANGAN klik "Download CSV" -- setelah discreenshot klik "Batal" untuk menutup)
-->
![Modal Export CSV](./manual-images/07-export-csv-modal.png)

Cara memakai:
1. Pilih salah satu **Rentang Cepat**: Hari Ini, 24 Jam, 7 Hari, atau 30 Hari — otomatis mengisi tanggal mulai & akhir.
2. Atau isi **Tanggal Mulai** dan **Tanggal Akhir** secara manual.
3. Kosongkan kedua tanggal kalau ingin mengekspor **semua data** yang tersedia.
4. Klik **"Download CSV"**.

Data di dalam CSV **diagregasi per 5 menit** (rata-rata), bukan data mentah per detik, supaya file tetap ringkas untuk rentang panjang. Semua kolom tanggal/waktu di dalam file memakai zona waktu **WIB (Bandar Lampung)**.

---

## 8. Configure Sensor (Topic MQTT)

Tombol **"Configure Sensor"** di halaman Detail Gedung menampilkan daftar *topic* MQTT yang harus dipakai oleh perangkat ESP32/Raspberry Pi di gedung tersebut untuk mengirim data.

<!-- SCREENSHOT: 08-configure-sensor-modal.png
URL: (masih di halaman detail gedung yang sama)
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: klik tombol "Configure Sensor", screenshot modal yang terbuka menampilkan daftar parameter & topic MQTT-nya
-->
![Modal Configure Sensor](./manual-images/08-configure-sensor-modal.png)

Setiap parameter (tegangan, arus, daya, dst) punya *topic* MQTT sendiri, formatnya:
```
energy/buildings/<zona>/<kode-gedung>/<id-sensor>/<parameter>
```
Klik ikon salin di sebelah masing-masing topic untuk menyalinnya, atau **"Copy All"** untuk menyalin semuanya sekaligus — tempelkan ke konfigurasi firmware ESP32/Raspberry Pi.

> **Catatan:** tombol "Simpan" di modal ini saat ini hanya menampilkan konfirmasi, belum benar-benar menyimpan pengaturan ke server — fungsinya murni sebagai referensi topic MQTT yang harus dipakai perangkat.

---

## 9. Manajemen User (Admin)

**Hanya admin** yang bisa membuka halaman ini. Klik menu **"User Management"** di navbar atas (menu ini tidak muncul untuk akun viewer).

<!-- SCREENSHOT: 09-user-management.png
URL: http://10.10.2.129/users
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: tidak ada, screenshot halaman apa adanya (tabel daftar user)
-->
![Halaman User Management](./manual-images/09-user-management.png)

Di halaman ini Anda bisa:
- **Melihat semua akun** beserta role-nya (Admin / Viewer).
- **Mengubah role** langsung lewat dropdown di kolom Role pada tiap baris.
- **Menghapus user** lewat ikon tempat sampah di kolom Aksi.
- **Menambah user baru** lewat tombol **"Add User"**.

<!-- SCREENSHOT: 10-add-user-modal.png
URL: http://10.10.2.129/users
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: klik tombol "Add User" di pojok kanan atas, screenshot modal yang terbuka (JANGAN klik "Buat User" sungguhan -- setelah discreenshot klik "Batal" untuk menutup)
-->
![Modal tambah user baru](./manual-images/10-add-user-modal.png)

Isi **Nama**, **Email**, **Password** (minimal 6 karakter), dan pilih **Role** (Viewer atau Admin), lalu klik **"Buat User"**.

> **Catatan keamanan:** sistem tidak mengizinkan admin menghapus akunnya sendiri, atau menurunkan/menghapus **admin terakhir** yang tersisa — supaya sistem tidak pernah terkunci total tanpa ada admin yang bisa mengelola.

---

## 10. Profile Settings — Ganti Password

Klik foto profil di pojok kanan atas, lalu pilih **"Profile Settings"**.

<!-- SCREENSHOT: 11-profile-settings.png
URL: http://10.10.2.129/profile
Login: sebagai Admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: tidak ada, screenshot halaman apa adanya (JANGAN benar-benar submit form ganti password)
-->
![Halaman Profile Settings](./manual-images/11-profile-settings.png)

Isi **Password Saat Ini**, **Password Baru**, dan **Konfirmasi Password Baru**, lalu klik **"Ganti Password"**. Centang **"Tampilkan password"** kalau ingin melihat karakter yang diketik.

Setelah berhasil, Anda akan otomatis logout dan diarahkan ke halaman Login untuk masuk ulang dengan password baru (demi keamanan, semua sesi login lama otomatis diputus).

---

## 11. Notifikasi Telegram

Sistem ini bisa mengirim notifikasi otomatis ke Telegram saat:
- Sebuah gedung **berhenti mengirim data** lebih dari 30 menit (lalu kirim notifikasi lagi saat data masuk kembali).
- Koneksi **worker MQTT ke server terputus** (lalu kirim notifikasi lagi saat tersambung kembali).

Fitur ini dikonfigurasi oleh admin sistem lewat file `.env` di server (`TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`), bukan lewat halaman web — tidak ada pengaturan untuk ini di UI. Hubungi administrator server kalau ingin menambah/mengubah tujuan notifikasi.

> Cakupan saat ini baru sebatas **konektivitas** (gedung/worker offline-online). Notifikasi untuk anomali nilai sensor (tegangan tidak normal, arus berlebih, dst.) belum tersedia.

---

## 12. Perbedaan Hak Akses Admin vs Viewer

| Fitur | Admin | Viewer |
|---|:---:|:---:|
| Melihat data monitoring semua gedung | ✅ | ✅ |
| Melihat grafik & export CSV | ✅ | ✅ |
| Menambah gedung baru | ✅ | ❌ |
| Menghapus gedung | ✅ | ❌ |
| Membuka menu User Management | ✅ | ❌ |
| Menambah/mengubah role/menghapus akun | ✅ | ❌ |
| Ganti password sendiri | ✅ | ✅ |

<!-- SCREENSHOT: 12-monitoring-viewer.png
URL: http://10.10.2.129/monitoring
Login: sebagai Viewer, BUKAN admin (kredensial lihat §0.1 -- bagian itu akan dihapus sebelum manual final dibagikan)
Aksi: tidak ada, screenshot halaman apa adanya -- tujuannya menunjukkan tombol "Add Building" TIDAK ADA dibanding screenshot 03 (punya admin)
-->
![Halaman Monitoring dilihat sebagai akun Viewer](./manual-images/12-monitoring-viewer.png)

Perhatikan perbedaannya dengan screenshot di §3: tombol **"Add Building"** dan menu tiga titik untuk menghapus gedung tidak muncul sama sekali untuk akun viewer.

---

## 13. Pertanyaan Umum (FAQ)

**Kenapa status gedung "Offline" padahal perangkat sensornya menyala?**
Status dihitung dari umur data terakhir yang masuk — dianggap Offline kalau tidak ada data baru selama lebih dari 30 menit, meskipun koneksi socket browser masih tersambung. Cek koneksi MQTT perangkat ke broker.

**Kenapa hasil Export CSV kosong / cuma header?**
Kemungkinan rentang tanggal yang dipilih tidak punya data (misal gedung baru ditambahkan dan belum pernah mengirim data pada rentang itu). Coba pilih rentang manual yang lebih sesuai, atau kosongkan tanggal untuk mengekspor semua data yang ada.

**Kenapa kartu "Energy Import"/"Energy Export" menampilkan 0 untuk data lama?**
Kedua kolom ini baru mulai direkam sejak server diperbarui (November 2026) — data sebelum itu memang tidak pernah tersimpan dan tidak bisa ditarik mundur.

**Bagaimana cara menambah gedung baru yang perangkatnya belum terpasang?**
Tambahkan gedungnya dulu lewat §4, lalu buka Configure Sensor (§8) untuk mendapatkan daftar topic MQTT yang harus dipakai saat memasang firmware di ESP32/Raspberry Pi gedung tersebut.

**Siapa yang harus dihubungi kalau lupa password dan tidak ada admin lain?**
Hubungi pemegang akses server (bukan lewat aplikasi) untuk reset manual lewat database — fitur "lupa password" mandiri lewat email belum tersedia di versi ini.
