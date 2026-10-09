# Portfolio Vue

Frontend Vue untuk portofolio. Data profil, keahlian, proyek, dan pendidikan dimuat dari REST API Go. Sorotan dan dokumentasi masih menggunakan data frontend.

## Menjalankan

1. Jalankan MySQL dan siapkan database sesuai `golang/database/schema.sql`.
2. Atur environment MySQL dan jalankan API dari folder `golang`:

   ```powershell
   go run .\cmd\api
   ```

3. Dari folder `vue-app`, instal dependensi bila belum ada dan jalankan Vite:

   ```powershell
   npm install
   npm run dev
   ```

Frontend meminta:

- `GET http://localhost:8080/api/profile`
- `GET http://localhost:8080/api/skills`
- `GET http://localhost:8080/api/projects`
- `GET http://localhost:8080/api/education`

URL API default adalah `http://localhost:8080`. Untuk menggantinya, buat `vue-app/.env.local`:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

Jika API tidak tersedia atau ada data yang belum diisi, halaman menampilkan status kegagalan dan mempertahankan konten contoh untuk bagian yang gagal. Setelah data tersedia, halaman menggunakan data API. Untuk pengiriman formulir kontak dan pengelolaan admin belum ada endpoint.
