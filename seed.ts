import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bnba,
  bnbaHistory,
  auditLog,
  rangkuman,
  sumberDana,
  statuses,
  users,
} from "@/db/schema";

/* ---------- Data dasar Kabupaten Konawe ---------- */

const KEC_DESA: Record<string, string[]> = {
  Abuki: ["Bondearo", "Andupapa", "Latambaa"],
  Andoolo: ["Wumabasa", "Tondokori", "Lalolara"],
  Angka: ["Lameroro", "Angkata", "Bonere"],
  "Anggo-Otu": ["Anggo", "Ototuma", "Koinanga"],
  Asoli: ["Asoli", "Rumbia", "Latoma"],
  Besulutu: ["Siahuma", "Lalosia", "Mokoano"],
  "Bone-Bone": ["Sorawolato", "Wolasiwo", "Tondokilo"],
  Bua: ["Bua", "Bonete", "Kololima"],
  Colomadu: ["Konamara", "Wambulu", "Rantebua"],
  Concari: ["Concari", "Lalolona", "Wambunga"],
  Kontu: ["Kontu", "Wawotula", "Latowa"],
  Konaweha: ["Morombo", "Wawomulu", "Latowaa"],
  Landono: ["Wolomulaua", "Poiri", "Latambaga"],
  Olola: ["Rangeta", "Kainakao", "Lalolala"],
  Pomalua: ["Pondidahera", "Buke", "Mowilati"],
  Tulambello: ["Tulambello", "Wolio", "Lalodato"],
};
const KECAMATAN = Object.keys(KEC_DESA);

const NAMA = [
  "La Ode Nurdin", "Rurua", "La Ode Kari", "Sitti Maryam", "La Ode Gani",
  "Muis", "Nurhayati", "Hasanuddin", "La Ode Muhammad Yusuf", "Rahim",
  "Munawwir", "La Ode Samsudin", "Nurani", "La Ode Burhan", "Sitti Aminah",
  "La Ode Fathuddin", "Rukiah", "La Ode Hasan", "Sari", "La Ode Ali",
  "Ratnawati", "La Ode Idrus", "Sitti Nurbaya", "Maksum", "La Ode Ridwan",
  "Yusnita", "La Ode Sulaiman", "Sitti Rahmawati", "La Ode Dahlan", "Suhartini",
  "La Ode Arsyad", "Mariani", "La Ode Tahir", "Sitti Husniah", "La Ode Mansyur",
  "Nur Aini", "La Ode Zainal", "Sitti Fatimah", "La Ode Bakri", "Rosmawati",
  "La Ode Ismail", "Sitti Halimah", "La Ode Ridwan", "Sri Mulyani",
  "La Ode Nasir", "Sitti Rahma", "La Ode Kamal", "Sitti Nurhasanah",
];

const KONDISI_RUMAH = [
  "Dinding papan lapuk, atap seng bocor, lantai tanah. Rumah tidak layak huni sesuai kriteria fisika BPS.",
  "Atap asbes retak dan bocor di beberapa titik, dinding anyaman bambu mulai rusak.",
  "Dinding triplek bekas, lantai tanah, penerangan belum memadai, atap seng berkarat.",
  "Rumah miring, pondasi tergerus aliran air, atap bocor saat musim hujan.",
  "Luas bangunan kurang dari 60 m², keluarga tinggal 6 jiwa dalam 1 ruang. Dinding papan usang.",
  "Atap alang-alang hampir habis, dinding papan lapuk, struktur tiang mulai keropos.",
];

const PENDIDIKAN = ["SD", "SMP", "SMA", "Tidak sekolah"];
const PEKERJAAN = ["Petani", "Buruh harian lepas", "Nelayan", "Pedagang kecil", "Peternak"];
const PENGHASILAN = [
  "Di bawah Rp 500.000 / bulan",
  "Rp 500.000 – Rp 800.000 / bulan",
  "Tidak tetap (musiman)",
  "Rp 800.000 – Rp 1.000.000 / bulan",
];
const DINDING = ["Papan lapuk", "Anyaman bambu", "Triplek bekas", "Papan + semen eksisting"];
const ATAP = ["Seng berkarat / bocor", "Asbes tua retak", "Alang-alang"];
const LANTAI = ["Tanah", "Semen sederhana", "Tanah + semen sebagian"];
const KHUSUS = [
  null, null, null, "Lansia (65+ tahun)", null, null,
  "Kepala keluarga tunggal", null, null, "Anggota keluarga penyandang disabilitas",
  null, null, "Lansia (65+ tahun)", null, null, null,
  "Janda, keluarga miskin", null, null, null,
];

const PHOTOS = [
  "https://images.pexels.com/photos/11114969/pexels-photo-11114969.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/1787034/pexels-photo-1787034.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/37092654/pexels-photo-37092654.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/15388165/pexels-photo-15388165.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/36789102/pexels-photo-36789102.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/17187904/pexels-photo-17187904.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/31621591/pexels-photo-31621591.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/35170703/pexels-photo-35170703.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/17596993/pexels-photo-17596993.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  "https://images.pexels.com/photos/33432817/pexels-photo-33432817.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
];

const STATUS_SEED = [
  { name: "Usulan Baru", color: "#b45309", sortOrder: 1 },
  { name: "Tahap Verifikasi", color: "#0e7490", sortOrder: 2 },
  { name: "Masuk SK", color: "#4f46e5", sortOrder: 3 },
  { name: "Selesai", color: "#15803d", sortOrder: 4 },
];

const SUMBER_SEED = [
  { name: "APBD Kabupaten Konawe", description: "Anggaran daerah Kabupaten Konawe" },
  { name: "APBD Provinsi Sultra", description: "Anggaran daerah Provinsi Sulawesi Tenggara" },
  { name: "APBN - Kementerian PUPR", description: "Program rumah layak huni pusat" },
  { name: "Dana Desa", description: "Alokasi dana desa per desa/kelurahan" },
  { name: "CSR / Donasi", description: "Bantuan pihak ketiga dan donasi" },
];

const RANGKUMAN_SEED = {
  title: "Program Bantuan Rumah Tidak Layak Huni (RTLH) Kabupaten Konawe",
  tahun: "2025",
  anggaran: "Rp 4.500.000.000 (150 unit @ Rp 30.000.000)",
  body: "Program RTLH Kabupaten Konawe merupakan upaya Pemerintah Kabupaten Konawe bersama Dinas PUPR dan Dinas Sosial untuk meningkatkan kelayakan hunian rumah tangga kurang mampu. Bantuan diberikan berupa material bangunan dan upah tukang. Pendataan penerima dilakukan melalui Google Form yang disinkronkan otomatis ke SI-RTLH, kemudian diverifikasi lapangan, ditetapkan dalam SK Bupati, hingga pelaksanaan rehab. Target tahun 2025 adalah 150 unit rumah di seluruh kecamatan se-Kabupaten Konawe.",
};

export const CREDENTIALS_HINT = [
  { role: "Super Admin", username: "superadmin", password: "super123" },
  { role: "Admin", username: "admin", password: "admin123" },
];

function nik(i: number): string {
  return "7403" + String(10000000 + i * 7919).slice(0, 8) + String(101 + i).padStart(2, "0");
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

let seedPromise: Promise<void> | null = null;

/** Jalankan seed sekali saja saat database masih kosong. */
export function ensureSeed(): Promise<void> {
  if (!seedPromise) seedPromise = doSeed();
  return seedPromise;
}

async function doSeed() {
  try {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(bnba);
    if (count > 0) return;

    // 1. Status
    const stRows = await db.insert(statuses).values(STATUS_SEED).returning({ id: statuses.id, name: statuses.name });
    const stId: Record<string, number> = {};
    for (const r of stRows) stId[r.name] = r.id;

    // 2. Sumber dana
    const sdRows = await db.insert(sumberDana)
      .values(SUMBER_SEED.map((s) => ({ name: s.name, description: s.description })))
      .returning({ id: sumberDana.id });
    const sdIds = sdRows.map((r) => r.id);

    // 3. Rangkuman
    await db.insert(rangkuman).values(RANGKUMAN_SEED);

    // 4. Users
    const now = Date.now();
    const day = 86400000;
    const mkBnba = (i: number) => {
      const kec = KECAMATAN[Math.floor(i / 3) % KECAMATAN.length];
      const desa = KEC_DESA[kec][i % 3];
      const mod = i % 8;
      const statusName =
        mod <= 2 ? "Usulan Baru" : mod <= 4 ? "Tahap Verifikasi" : mod <= 6 ? "Masuk SK" : "Selesai";
      const gender = i % 4 === 1 || i % 4 === 2 ? "Perempuan" : "Laki-laki";
      const nama = NAMA[i % NAMA.length] + (i >= NAMA.length ? " " + (Math.floor(i / NAMA.length) + 1) : "");
      const nikVal = nik(i);
      return {
        extKey: nikVal,
        nik: nikVal,
        nama,
        jenisKelamin: gender,
        umur: 34 + ((i * 7) % 41),
        pekerjaan: PEKERJAAN[i % PEKERJAAN.length],
        pendidikan: PENDIDIKAN[i % PENDIDIKAN.length],
        jumlahTanggungan: 2 + (i % 6),
        penghasilan: PENGHASILAN[i % PENGHASILAN.length],
        kondisiKhusus: KHUSUS[i % KHUSUS.length],
        alamat: "Jl. Poros " + desa + " No. " + (12 + i),
        rtRw: "RT " + (1 + (i % 3)) + " / RW " + (1 + (i % 2)),
        desaKelurahan: desa,
        kecamatan: kec,
        lat: -3.84 - (i % 16) * 0.018 - (i % 5) * 0.002,
        lng: 122.28 + (i % 19) * 0.026 + (i % 7) * 0.003,
        kondisiRumah: KONDISI_RUMAH[i % KONDISI_RUMAH.length],
        luasRumah: 45 + (i % 8) * 5,
        bahanDinding: DINDING[i % DINDING.length],
        bahanAtap: ATAP[i % ATAP.length],
        bahanLantai: LANTAI[i % LANTAI.length],
        photoUrl: i < PHOTOS.length ? PHOTOS[i] : null,
        catatan: null,
        statusId: stId[statusName],
        sumberDanaId: statusName === "Usulan Baru" ? null : sdIds[i % sdIds.length],
        updatedAt: new Date(now - (i % 30) * day),
      };
    };

    const bnbaRows = await db
      .insert(bnba)
      .values(Array.from({ length: 48 }, (_, i) => mkBnba(i)))
      .returning({ id: bnba.id, extKey: bnba.extKey });
    const idByExt: Record<string, number> = {};
    for (const r of bnbaRows) idByExt[r.extKey] = r.id;

    // 5. Riwayat status
    const history: {
      bnbaId: number; statusId: number; note: string | null; changedBy: string | null; createdAt: Date;
    }[] = [];
    for (let i = 0; i < bnbaRows.length; i++) {
      const rec = mkBnba(i);
      const id = idByExt[rec.extKey];
      const t0 = new Date(now - (45 + (i % 20)) * day);
      history.push({ bnbaId: id, statusId: stId["Usulan Baru"], note: "Data masuk dari Google Form (sinkronisasi awal).", changedBy: "Sistem (Sync Form)", createdAt: t0 });
      const mod = i % 8;
      if (mod >= 3) {
        history.push({ bnbaId: id, statusId: stId["Tahap Verifikasi"], note: "Verifikasi lapangan oleh tim Dinas PUPR.", changedBy: "admin", createdAt: new Date(now - (18 + (i % 8)) * day) });
      }
      if (mod >= 5) {
        history.push({ bnbaId: id, statusId: stId["Masuk SK"], note: "Tetapkan dalam SK Bupati Konawe.", changedBy: "superadmin", createdAt: new Date(now - (6 + (i % 5)) * day) });
      }
      if (mod === 7) {
        history.push({ bnbaId: id, statusId: stId["Selesai"], note: "Rehabilasi selesai, serah terima dengan penerima.", changedBy: "admin", createdAt: new Date(now - (1 + (i % 3)) * day) });
      }
    }
    await db.insert(bnbaHistory).values(history);

    // 6. Users
    const hash = (p: string) => bcrypt.hashSync(p, 8);
    await db.insert(users).values([
      { username: "superadmin", passwordHash: hash("super123"), fullName: "Super Admin SI-RTLH", role: "superadmin", active: true },
      { username: "admin", passwordHash: hash("admin123"), fullName: "Admin Dinas PUPR Konawe", role: "admin", active: true },
    ]);

    // 7. Audit seed
    await db.insert(auditLog).values({
      username: "system",
      action: "SEED",
      entity: "database",
      entityId: null,
      details: "Data awal dimuat (48 data BNBA contoh, status, sumber dana, pengguna).",
      createdAt: new Date(now),
    });

    void slug;
  } catch (e) {
    seedPromise = null;
    throw e;
  }
}
