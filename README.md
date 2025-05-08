# Daily Stories PWA App

Aplikasi web progresif (PWA) untuk berbagi cerita sehari-hari dengan fitur kemampuan offline dan push notification.

## Fitur

- Single Page Application (SPA)
- Dapat diinstall ke perangkat (PWA)
- Bekerja dalam mode offline
- Mendukung push notification
- Menggunakan IndexedDB untuk penyimpanan lokal
- Responsive design

## Panduan Penggunaan

1. **Menampilkan Stories**

   - Kunjungi halaman utama untuk melihat semua stories yang tersedia
   - Gunakan tombol "View Detail" untuk melihat detail story

2. **Menambahkan Story Baru**

   - Klik tombol "Add New Story" pada halaman utama
   - Isi form dengan deskripsi dan upload foto
   - Tambahkan lokasi jika diperlukan
   - Klik "Submit" untuk menambahkan story baru

3. **Menyimpan Story**

   - Klik tombol "Save" pada story yang ingin disimpan
   - Story akan tersimpan dalam IndexedDB dan dapat diakses offline

4. **Melihat Saved Stories**

   - Klik "Saved Stories" pada menu navigasi
   - Lihat semua stories yang telah disimpan secara lokal

5. **Menghapus Saved Story**

   - Buka halaman "Saved Stories"
   - Klik tombol "Delete" pada story yang ingin dihapus
   - Konfirmasi penghapusan

6. **Mengaktifkan Push Notification**
   - Klik tombol "Enable Notifications" di footer
   - Izinkan notifikasi pada prompt browser

## Teknologi yang Digunakan

- HTML5, CSS3, dan JavaScript
- IndexedDB untuk penyimpanan lokal
- Service Worker untuk fungsionalitas offline
- Web Push API untuk notifikasi
- Application Shell Architecture untuk PWA
- Vite sebagai build tool

## Deployment

Aplikasi ini dapat di-deploy menggunakan beberapa platform:

### Deploy ke Netlify

1. Buat akun di [Netlify](https://www.netlify.com/)
2. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Login ke Netlify:
   ```bash
   netlify login
   ```
4. Build aplikasi:
   ```bash
   npm run build
   ```
5. Deploy ke Netlify:
   ```bash
   netlify deploy --dir=dist --prod
   ```

### Deploy ke GitHub Pages

1. Buat repository GitHub
2. Push kode ke repository
3. Atur GitHub Pages untuk menggunakan folder `dist`
4. Pastikan file `.nojekyll` ada pada folder `dist`

### Deploy ke Firebase Hosting

1. Buat akun dan project di [Firebase](https://firebase.google.com/)
2. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
3. Login ke Firebase:
   ```bash
   firebase login
   ```
4. Inisialisasi Firebase di folder project:
   ```bash
   firebase init hosting
   ```
5. Build aplikasi:
   ```bash
   npm run build
   ```
6. Deploy ke Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Pengembangan Lokal

1. Clone repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Jalankan development server:
   ```bash
   npm run dev
   ```
4. Akses aplikasi di browser pada `http://localhost:3000`

## Lisensi

MIT License
