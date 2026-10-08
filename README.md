# StoryWedding
# Galeri Foto Acara (QR + Google Drive)

Tamu scan QR → masuk galeri → tekan **+** → ambil/pilih foto → pilih frame → terkirim ke Google Drive → muncul di galeri.

File:
- `index.html` — website (galeri, upload, 10 pilihan frame)
- `Code.gs` — backend Google Apps Script (menyimpan & membaca foto di Drive)
- `qr.html` — pembuat poster QR code untuk dicetak

## Langkah 1 — Siapkan folder Drive
1. Buka Google Drive → buat folder baru, misal **Foto Undangan**.
2. Buka folder itu. Salin **ID folder** dari URL: `drive.google.com/drive/folders/`**`INI_ID_NYA`**

## Langkah 2 — Pasang backend (Apps Script)
1. Buka https://script.google.com → **Proyek baru**.
2. Hapus isi default, tempel seluruh isi `Code.gs`.
3. Isi `FOLDER_ID` (dari langkah 1) dan `ACCESS_KEY` (kata kunci bebas, jangan pakai spasi).
4. Pilih fungsi `authorize` → klik **Jalankan** → beri izin akses Drive (sekali saja).
5. Klik **Deploy → Deployment baru → jenis: Aplikasi web**:
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
6. Salin **URL aplikasi web** (berakhiran `/exec`).

> Jika Anda mengubah `Code.gs` nanti, buat deployment **versi baru** agar perubahan aktif.

## Langkah 3 — Atur website
Buka `index.html`, ubah bagian `CONFIG` di atas script:
```js
EVENT_NAME: 'Rina & Dika',
EVENT_DATE: '12 Desember 2026',
API_URL: 'https://script.google.com/macros/s/XXXX/exec',
```
Tanpa mengisi `API_URL`, website berjalan di **mode demo** (foto tidak tersimpan) — berguna untuk mencoba frame.

## Langkah 4 — Online-kan website (gratis)
Pilih salah satu:
- **Netlify Drop**: buka https://app.netlify.com/drop, seret folder berisi `index.html` & `qr.html`.
- **GitHub Pages**: upload ke repository, aktifkan Pages.
- **Vercel / Cloudflare Pages**: sama, upload folder.

Anda akan mendapat link, misalnya `https://galeri-rina-dika.netlify.app`.

## Langkah 5 — Buat QR
1. Buka `qr.html` di browser.
2. Isi link website, **kunci rahasia (sama persis dengan `ACCESS_KEY`)**, nama acara, tanggal → **Buat QR**.
3. **Cetak / Simpan PDF** dan taruh di meja tamu.

QR berisi link `...?k=KUNCI`. Orang tanpa QR tidak bisa membuka galeri dan server menolak permintaan tanpa kunci yang benar.

## Mengubah / menambah frame
Semua frame digambar di `index.html` pada array `FRAMES` (fungsi `draw`). Salin satu blok frame, ubah warna/emoji/posisi, beri `id`, `name`, `e` (ikon chip) baru.

## Catatan
- Foto disimpan sebagai JPEG 1080×1350 (rasio 4:5) — ringan tapi tajam.
- Galeri menyegarkan diri tiap 30 detik (`POLL_MS`).
- Kuota Apps Script akun gratis cukup untuk acara ratusan tamu; daftar foto di-cache 15 detik.
- Jika thumbnail tidak muncul, pastikan folder/foto bisa dibuka "siapa saja yang memiliki link" (script sudah mengaturnya otomatis, kecuali akun kantor/sekolah yang membatasi berbagi).
- Untuk mengunduh semua foto: buka folder Drive → pilih semua → Download.