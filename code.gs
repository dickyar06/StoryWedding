/**
 * BACKEND GALERI FOTO UNDANGAN — Google Apps Script
 * Tempel seluruh isi file ini di script.google.com, lalu Deploy sebagai Web App.
 * Panduan lengkap ada di README.md
 */

// ====== WAJIB DIISI ======
const FOLDER_ID  = '14H6TEMxkUiR5-btIAOb4fpwFuuGY15Q0';   // ID folder tujuan foto (bagian akhir URL folder)
const ACCESS_KEY = 'story-day';              // Kunci rahasia, harus SAMA dengan yang ada di QR
// =========================

const MAX_LIST = 300;       // jumlah foto terbaru yang ditampilkan
const CACHE_SECONDS = 15;   // cache daftar foto agar tidak berat saat banyak tamu

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Daftar foto: GET ?action=list&k=KUNCI
function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.k !== ACCESS_KEY) return json_({ ok: false, error: 'Kunci salah. Scan ulang QR code.' });

    const cache = CacheService.getScriptCache();
    const cached = cache.get('list');
    if (cached) return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JSON);

    const files = DriveApp.getFolderById(FOLDER_ID).getFiles();
    const arr = [];
    while (files.hasNext()) {
      const f = files.next();
      arr.push({ id: f.getId(), t: f.getDateCreated().getTime() });
    }
    arr.sort((a, b) => b.t - a.t);
    const out = JSON.stringify({ ok: true, total: arr.length, photos: arr.slice(0, MAX_LIST) });
    cache.put('list', out, CACHE_SECONDS);
    return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Upload foto: POST body = JSON { k, name, data(base64 jpeg) }
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.k !== ACCESS_KEY) return json_({ ok: false, error: 'Kunci salah.' });
    if (!body.data || body.data.length < 100) return json_({ ok: false, error: 'Data foto kosong.' });

    lock.waitLock(20000);
    const bytes = Utilities.base64Decode(body.data);
    const name = String(body.name || ('foto_' + Date.now() + '.jpg')).replace(/[^\w.\-]/g, '_');
    const blob = Utilities.newBlob(bytes, 'image/jpeg', name);
    const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (_) {}
    CacheService.getScriptCache().remove('list');
    return json_({ ok: true, id: file.getId() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// Jalankan SEKALI secara manual untuk memberi izin akses Drive
function authorize() {
  DriveApp.getFolderById(FOLDER_ID).getName();
}