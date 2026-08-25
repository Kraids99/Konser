# ConcertTix

Aplikasi web sederhana untuk pemesanan tiket konser dengan frontend HTML/CSS/JavaScript dan backend PHP native + MySQL. Proyek ini mencakup alur autentikasi, dashboard customer, pembelian tiket, riwayat transaksi, profil pengguna, serta panel admin untuk mengelola event dan tiket.

## Fitur

- Registrasi, login, logout, dan opsi `remember me`.
- Dashboard customer untuk melihat daftar event konser.
- Pencarian event berdasarkan nama.
- Pengurutan event terdekat memakai geolokasi browser.
- Pemilihan tiket per event dan checkout ke halaman transaksi.
- Penyimpanan transaksi pembelian tiket.
- Riwayat tiket/transaksi milik user yang sedang login.
- Edit profil, ubah password, upload foto profil, dan hapus akun.
- Panel admin untuk CRUD event.
- Panel admin untuk CRUD tiket.

## Tools

- PHP native.
- HTML, CSS, dan JavaScript (`frontend/`).
- MySQL (`konserdb.sql`).

## Struktur proyek

- `api/` : backend PHP, konfigurasi database, controller, model, dan storage foto profil.
- `api/controllers/` : endpoint untuk auth, user, event, ticket, transaction, dan location.
- `api/models/` : query database untuk entitas utama aplikasi.
- `api/config/` : loader `.env` dan koneksi database.
- `frontend/` : halaman customer, admin, asset gambar, CSS, dan JavaScript.
- `frontend/admin/` : halaman admin untuk manajemen event dan tiket.
- `frontend/js/customer/` : logika dashboard customer, pemilihan tiket, dan transaksi.
- `konserdb.sql` : schema database beserta dummy data user, lokasi, event, tiket, dan token.
- `.env.example` : template konfigurasi environment lokal.

## Setup

1. Siapkan web server lokal yang bisa menjalankan PHP, lalu letakkan proyek ini pada path yang sesuai dengan `BASE_URL` Anda.
2. Import database dari `konserdb.sql`.
3. Salin `.env.example` menjadi `.env`.
4. Sesuaikan konfigurasi database dan base URL di `.env`.
5. Pastikan path API di [`frontend/js/index.js`](/d:/Project/ConcertTix/frontend/js/index.js) sesuai dengan lokasi project, default-nya memakai `/konser/api/index.php`.
6. Jalankan aplikasi dari halaman frontend, misalnya `frontend/login.html` atau `frontend/index.html` melalui server lokal.

Catatan:

- File SQL membuat database bernama `konser_db`, sedangkan `.env.example` memakai `DB_NAME="konserdb"`. Nama database di SQL dan `.env` harus disamakan sebelum aplikasi dijalankan.
- `.env.example` memakai `BASE_URL="http://localhost/konser"`, jadi folder project dan path API frontend perlu konsisten dengan URL tersebut.

## Akun demo

- Admin: `admin@gmail.com` / `admin123`
- User: `alex@gmail.com` / `alex123`
- User: `vergie@gmail.com` / `vergie123`
- User: `fajar@gmail.com` / `fajar123`
- User: `rafael@gmail.com` / `rafael123`
