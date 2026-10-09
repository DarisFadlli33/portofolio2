# Portfolio

Proyek ini berisi tiga bagian:

- `vue-app`: website portfolio dengan Vue dan Vite.
- `golang`: REST API Go yang membaca dan menyimpan data di MySQL.
- `crm`: halaman CRM lokal untuk mengelola profil, keahlian, proyek, dan pendidikan.

## Prasyarat

Pasang dan siapkan:

- [Node.js dan npm](https://nodejs.org/) untuk website Vue.
- [Go 1.24 atau lebih baru](https://go.dev/dl/) untuk API.
- MySQL Server dan MySQL CLI (`mysql`) untuk database.
- Python 3 untuk menyajikan halaman CRM statis.

## Persiapan awal

### 1. Buat tabel MySQL

Pastikan MySQL sedang berjalan. Dari PowerShell di root proyek, jalankan:

```powershell
cd .\golang
Get-Content -Raw .\database\schema.sql | mysql -u root -p
```

Masukkan password MySQL ketika diminta. Jika akun MySQL lokal tidak memakai password, gunakan `mysql -u root` tanpa `-p`. Schema akan membuat database `portfolio` beserta tabel yang dibutuhkan.

### 2. Jalankan API Go

Buka terminal PowerShell baru di root proyek, lalu:

```powershell
cd .\golang
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = ""
$env:MYSQL_DATABASE = "portfolio"
go run .\cmd\api
```

Ganti `password-mysql-kamu` dengan password MySQL; untuk akun tanpa password, jalankan `$env:MYSQL_PASSWORD = ""`. API berjalan di <http://127.0.0.1:8080>. Periksa koneksi melalui <http://127.0.0.1:8080/api/health>.

Variabel environment berlaku hanya di terminal yang sedang digunakan. File `golang\.env.example` adalah contoh konfigurasi; backend tidak memuat file `.env` secara otomatis.

### 3. Jalankan website Vue

Buka terminal PowerShell baru di root proyek:

```powershell
cd .\vue-app
npm install
npm run dev
```

Buka URL yang ditampilkan Vite, biasanya <http://localhost:5173>. Frontend menggunakan API di `http://localhost:8080` secara default.

### 4. Jalankan CRM

Buka terminal PowerShell baru di root proyek:

```powershell
cd .\crm
py -m http.server 5174 --bind 127.0.0.1
```

Buka <http://127.0.0.1:5174>. CRM memerlukan API Go yang sedang berjalan. Setelah data diubah lewat CRM, muat ulang website Vue untuk melihat data terbaru.

## Urutan menjalankan setiap kali mulai

1. Nyalakan MySQL Server.
2. Jalankan API Go di terminal pertama.
3. Jalankan website Vue di terminal kedua.
4. Jalankan CRM di terminal ketiga bila ingin mengelola data.

Biarkan masing-masing terminal tetap berjalan. Hentikan server dengan `Ctrl+C`.

## Catatan

- Database baru berisi tabel kosong. Tambahkan data melalui CRM; untuk menampilkan data profil, buat profil dengan `id = 1`.
- Gambar proyek dapat diunggah langsung dari CRM. File disimpan di `vue-app/public/assets/images/projects`, dan ukuran gambarnya ditampilkan dalam pixel sebelum disimpan.
- Halaman Profil CRM menampilkan data tersimpan terlebih dahulu; pilih **Edit profil** untuk mengubah data atau mengunggah foto ke `vue-app/public/assets/images/profiles`.
- Backend dan CRM ditujukan untuk penggunaan lokal. Jangan mengeksposnya ke jaringan atau internet karena CRM belum memiliki autentikasi.
- Petunjuk lebih rinci tersedia di [`vue-app/README.md`](./vue-app/README.md), [`golang/README.md`](./golang/README.md), dan [`crm/README.md`](./crm/README.md).
