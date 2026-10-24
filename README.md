# SI-RTLH Kabupaten Konawe

Sistem Informasi **Rumah Tidak Layak Huni (RTLH)** Pemerintah Kabupaten Konawe —
pendataan BNBA, statistik, peta sebaran, dan pengelolaan status penanganan
(*Usulan Baru → Tahap Verifikasi → Masuk SK → Selesai*).

Dibangun dengan:

- **Next.js 16** (App Router, Server + Client Components)
- **PostgreSQL** + **Drizzle ORM**
- **Tailwind CSS v4** + Recharts
- Autentikasi sesi berbasis cookie (bcrypt + HMAC)

## Fitur

| Halaman | Deskripsi |
|---|---|
| Beranda `/` | Total RTLH, kartu 4 status, rangkuman program, statistik per kecamatan & sumber dana. |
| Data BNBA `/data-bnba` | Daftar penerima dengan pencarian + filter Kecamatan, Desa, Status, Sumber Dana; pagination; ekspor CSV. |
| Detail BNBA `/data-bnba/[id]` | Profil KK, alamat, kondisi rumah, sosial-ekonomi, dokumentasi, koordinat, progres 4 tahap, riwayat status. |
| Statistik `/statistik` | Grafik per kecamatan, donut status, horizontal bar sumber dana, rekap tabel. |
| Peta Sebaran `/peta` | Embed Google My Maps (`mid=1c1tsS_c8CqEDDOnEBv00NP9hdHom-XY`) + daftar titik lokasi. |
| Login `/login` | Masuk admin/super admin. |
| Admin `/admin` | 8 tab: Ringkasan, Status BNBA, Sumber Dana, Rangkuman Beranda, Sinkronisasi, (SA) Kelola Status, (SA) Pengguna, (SA) Audit Log. |

## Akun default (data seed)

| Peran | Username | Password |
|---|---|---|
| Super Admin | `superadmin` | `super123` |
| Admin | `admin` | `admin123` |

Ubah segera setelah deploy pertama (menu **Admin → Pengguna**).

## Alur data (pengaman Google Form)

```
Google Form  →  Google Spreadsheet  →  Website (sinkronisasi)  →  Database Status
```

- Data pendataan ditarik *one-way* dari Google Spreadsheet (tidak pernah ditulis balik).
- Status penanganan dan sumber dana dikelola penuh di database website.
- Kolom pendataan (nama, alamat, NIK, dll) akan *update otomatis* bila ada respon baru.
- Riwayat perubahan tersimpan di `bnba_status_history` dan `audit_log`.

Ada 2 cara impor di **Admin → Sinkronisasi**:

1. **Otomatis via Google Spreadsheet** — set `GOOGLE_SHEET_ID` (dan opsional `GOOGLE_SHEET_NAME`), lalu klik tombol sinkronisasi. Pastikan spreadsheet dibagikan *Anyone with the link → Viewer*.
2. **Manual** — tempel isi CSV atau unggah file `.csv`.

Parser menerima delimiter koma atau titik-koma, mendukung header dengan ejaan variatif
(NIK / NIK KK / NIK Kepala Keluarga, dst.).

## Menjalankan di lokal

```bash
# 1. Install dependensi
npm install

# 2. Siapkan env
cp .env.example .env
# edit .env (isi DATABASE_URL dan SECRET)

# 3. Buat tabel di PostgreSQL
npx drizzle-kit push

# 4. Jalankan dev server
npm run dev
```

Buka http://localhost:3000. Data awal (48 BNBA contoh, 2 akun, 4 status, 5 sumber dana)
otomatis di-seed saat request pertama bila database kosong.

## Skrip

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Jalankan development server. |
| `npm run build` | Build produksi. |
| `npm start` | Jalankan server produksi. |
| `npm run lint` | Jalankan ESLint. |
| `npm run typecheck` | Jalankan `tsc --noEmit`. |
| `npx drizzle-kit push` | Sinkronkan skema ke PostgreSQL (tanpa file migrasi). |
| `npx drizzle-kit generate` | Buat file migrasi dari perubahan skema. |

## Deploy

Proyek ini bisa di-deploy ke platform yang mendukung Node.js + PostgreSQL. Beberapa opsi umum:

- **Vercel** (paling mudah untuk Next.js) + **Neon / Supabase / Railway** untuk Postgres.
- **Railway / Render / Fly.io** untuk fullstack sekaligus app + Postgres.
- VPS sendiri (Ubuntu + Node 20 + PM2 + Nginx).

Setelah deploy, set environment variable yang ada di `.env.example` (terutama `DATABASE_URL` dan `SESSION_SECRET`).

## Struktur folder

```
src/
├── app/                 # Next.js App Router (halaman + API)
│   ├── api/             # Route handlers (auth, bnba, stats, sync, dll.)
│   ├── data-bnba/
│   ├── statistik/
│   ├── peta/
│   ├── login/
│   └── admin/
├── components/          # Komponen UI (Nav, ikon, grafik, panel admin)
├── db/                  # Koneksi Drizzle dan skema
└── lib/                 # auth, seed, sync, csv parser, util
```
