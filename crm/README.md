# Portfolio CRM

CRM lokal tanpa login untuk mengubah data yang ditampilkan website portfolio. Data disimpan langsung ke MySQL melalui backend Go.

## Menjalankan

1. Jalankan MySQL dan backend Go sesuai petunjuk di [`..\golang\README.md`](../golang/README.md).
2. Dari folder ini, jalankan server web statis:

   ```powershell
   py -m http.server 5174 --bind 127.0.0.1
   ```

3. Buka <http://127.0.0.1:5174>.
4. Jalankan website utama secara terpisah di port `5173`; muat ulang halaman website untuk melihat perubahan terbaru.

Backend hanya mendengarkan di `127.0.0.1`. Jangan memublikasikan CRM atau mengekspos backend ke jaringan karena CRM belum dilindungi login.

## Profil

Halaman Profil menampilkan data yang sudah tersimpan. Pilih **Edit profil** untuk membuka formulir; foto profil dapat diunggah sebagai JPEG, PNG, atau GIF (maksimal 8 MB), dengan dimensi pixel ditampilkan otomatis. File disimpan di `vue-app/public/assets/images/profiles`.

## Gambar proyek

Di editor proyek, pilih gambar JPEG, PNG, atau GIF (maksimal 8 MB). CRM menampilkan dimensi gambar dalam pixel, lalu mengunggahnya melalui API Go dan menyimpan file di `vue-app/public/assets/images/projects`. URL gambar diisi otomatis; tidak perlu menempelkan URL gambar sendiri.
