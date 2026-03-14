Panduan Deploy Grid Monitor ke cPanel

Ringkasan cepat
1. Build aplikasi di lokal
2. Upload isi folder dist ke public_html atau folder domain kamu
3. Pasang aturan rewrite agar route React tidak 404
4. Pastikan API URL mengarah ke server backend produksi

Persiapan
1. Pastikan backend API sudah online dan bisa diakses dari internet.
2. Tentukan target deploy:
   - Root domain: public_html
   - Subdomain: biasanya public_html/subdomain
   - Subfolder: public_html/nama-aplikasi

Build frontend
1. Masuk ke folder aplikasi frontend.
   - Folder: apps/grid-monitor
2. Jalankan build produksi.
   - npm run build
3. Hasil build ada di folder dist.

Upload ke cPanel
1. Login ke cPanel lalu buka File Manager.
2. Masuk ke folder target domain kamu.
3. Upload semua isi folder dist ke folder target.
   - Bukan folder dist-nya, tapi isi di dalamnya.
4. Jika pakai zip, upload lalu Extract.

Aturan rewrite React Router
Aplikasi ini memakai BrowserRouter, jadi route seperti /monitoring dan /analytics butuh rewrite.

Pilihan A, pakai file .htaccess
1. Buat file .htaccess di folder deploy (satu level dengan index.html).
2. Isi dengan konfigurasi berikut:

RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

Catatan untuk subfolder
- Jika deploy di subfolder, ubah RewriteBase / menjadi RewriteBase /nama-aplikasi/
- Ubah juga rule terakhir menjadi /nama-aplikasi/index.html

Konfigurasi API produksi
File konfigurasi API ada di src/config/api.ts.

Opsi yang direkomendasikan
1. Buat file .env.production di apps/grid-monitor
2. Isi contoh:
   - VITE_API_URL=https://api.domainkamu.com
   - VITE_SOCKET_URL=https://api.domainkamu.com
3. Build ulang setelah mengubah env.

Jika env tidak diisi
- Frontend akan fallback ke http://hostname:3001
- Ini biasanya gagal di hosting cPanel karena port 3001 sering tidak dibuka publik

Checklist selesai deploy
1. Buka halaman login.
2. Coba login.
3. Cek halaman Command Center, Monitoring, Analytics.
4. Refresh saat berada di route non-root, pastikan tidak 404.
5. Cek request API di browser DevTools, pastikan ke domain backend produksi.

Troubleshooting cepat
1. Blank page setelah upload:
   - Pastikan index.html ada di folder target yang benar.
2. Route 404 saat refresh:
   - Cek file .htaccess dan aturan rewrite.
3. Data tidak muncul:
   - Cek VITE_API_URL dan CORS backend.
4. WebSocket tidak connect:
   - Pastikan VITE_SOCKET_URL benar dan backend support socket di domain produksi.

Catatan project saat ini
- Artefak build siap upload sudah tersedia di file grid-monitor-dist.zip di folder apps/grid-monitor.
