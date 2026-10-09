# Portfolio backend

Backend Go ini menyediakan REST API untuk MySQL. [Web CRM lokal](../crm/README.md) dipakai untuk mengelola profil, keahlian, proyek, dan pendidikan yang ditampilkan di website utama.

## 1. Siapkan database

Jalankan MySQL, lalu dari folder `golang` jalankan perintah berikut di PowerShell:

```powershell
Get-Content -Raw .\database\schema.sql | mysql -u root
```

Jika akun MySQL memakai password, gunakan `mysql -u root -p`. Ganti nama user bila akunmu bukan `root`.

## 2. Siapkan konfigurasi koneksi

Salin `.env.example` ke `.env` sebagai catatan konfigurasi lokal. File `.env` tidak dibaca otomatis oleh Go; ekspor nilainya ke environment sebelum menjalankan backend. Jangan commit file `.env` atau password ke repository.

Contoh pengaturan sementara di PowerShell:

```powershell
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = "3306"
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "password-mysql-kamu"
$env:MYSQL_DATABASE = "portfolio"
```

Password boleh dikosongkan jika akun MySQL lokal memang tidak memakai password.

`PORT` menentukan port HTTP API (default `8080`). API hanya mendengarkan di `127.0.0.1` karena CRM belum memakai login dan ditujukan untuk penggunaan lokal. `CORS_ALLOWED_ORIGINS` adalah daftar origin frontend yang dipisahkan koma; default-nya mengizinkan website utama (`5173`) dan CRM (`5174`).

Saat dijalankan dari dalam folder `golang`, API menyimpan unggahan gambar proyek ke `vue-app/public/assets/images/projects` dan foto profil ke `vue-app/public/assets/images/profiles`. Unggahan menerima JPEG, PNG, dan GIF hingga 8 MB; endpoint mengembalikan URL relatif dan dimensi pixel.

## 3. Unduh driver dan jalankan pemeriksaan

```powershell
go mod tidy
go test ./...
```

## 4. Jalankan API dan CRM

Pastikan tabel sudah dibuat dan MySQL sedang berjalan. Di PowerShell, atur environment seperti pada langkah 2, lalu jalankan:

```powershell
go run .\cmd\api
```

API akan tersedia di `http://127.0.0.1:8080`. Kredensial database hanya digunakan oleh backend.

Di jendela PowerShell kedua, jalankan CRM lokal:

```powershell
cd ..\crm
py -m http.server 5174 --bind 127.0.0.1
```

Buka `http://127.0.0.1:5174`. Pastikan Vite website utama juga berjalan jika ingin melihat perubahan pada website. CRM menulis langsung ke database; muat ulang halaman utama untuk mengambil data terbaru.

Endpoint baca yang tersedia:

| Method | Path | Isi |
|---|---|---|
| `GET` | `/api/health` | Status API dan koneksi database |
| `GET`, `PUT` | `/api/profile` | Baca atau simpan profil dengan `id = 1` |
| `GET`, `POST` | `/api/skills` | Daftar atau tambah keahlian |
| `PUT`, `DELETE` | `/api/skills/{id}` | Ubah atau hapus keahlian |
| `GET`, `POST` | `/api/projects` | Daftar atau tambah proyek beserta teknologinya |
| `PUT`, `DELETE` | `/api/projects/{id}` | Ubah atau hapus proyek |
| `GET`, `POST` | `/api/education` | Daftar atau tambah pendidikan |
| `PUT`, `DELETE` | `/api/education/{id}` | Ubah atau hapus pendidikan |

Contoh mengisi profil awal melalui klien MySQL:

```sql
USE portfolio;

INSERT INTO profile (id, name, headline, summary, email, location)
VALUES (
  1,
  'Daris Fadlli',
  'Mahasiswa / Backend Learner',
  'Sedang belajar backend dengan Golang, REST API, dan database.',
  'darisfadlli@student.upi.edu',
  'Majalengka, Indonesia'
);
```

## Tabel yang dibuat

- `profile`: nama, headline, ringkasan, email, lokasi, dan foto.
- `skills`: nama keahlian, kategori, status belajar, dan urutan tampilan.
- `projects`: informasi proyek dan tautan.
- `project_technologies`: teknologi untuk setiap proyek.
- `education`: pendidikan dan proses belajar.
