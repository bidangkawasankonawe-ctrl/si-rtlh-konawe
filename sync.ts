import { asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { bnba, bnbaHistory, sumberDana, statuses, syncLog } from "@/db/schema";
import { eq } from "drizzle-orm";
import { parseCsv } from "./csv";
import { ensureSeed } from "./seed";

type Row = Record<string, string>;

/** Pemetaan header CSV (sudah dinormalasi) -> field internal. */
const ALIAS: Record<string, string[]> = {
  nik: ["nik", "nikkk", "nikkepala", "nikkk"],
  nama: ["nama", "namapenerima", "namapemohon", "namakepalakeluarga", "namakepala"],
  jk: ["jk", "jeniskelamin", "gender"],
  umur: ["umur", "usia"],
  pekerjaan: ["pekerjaan"],
  pendidikan: ["pendidikan"],
  tanggungan: ["jumlahtanggungan", "jmltanggungan", "tanggungan", "jumlahjiwa"],
  penghasilan: ["penghasilan", "pendapatan", "pengasilan"],
  khusus: ["kondisikhusus", "catatankhusus", "statuskeluarga", "kondisikeluarga"],
  alamat: ["alamat", "alamatrumah"],
  rtrw: ["rtrw"],
  desa: ["desa", "kelurahan", "desakelurahan"],
  kecamatan: ["kecamatan", "kec"],
  lat: ["lat", "latitude", "koordinaty"],
  lng: ["lng", "long", "lon", "longitude", "koordinatx"],
  kondisi: ["kondisirumah", "kondisi", "kondisifisik"],
  luas: ["luasrumah", "luas"],
  dinding: ["bahandinding"],
  atap: ["bahanatap"],
  lantai: ["bahanlantai"],
  sumberdana: ["sumberdana", "sumber", "sumberpendanaan"],
  foto: ["foto", "fotourl", "dokumentasi", "fotodokumentasi"],
  catatan: ["catatan", "keterangan"],
};

function pick(row: Row, key: string): string {
  for (const a of ALIAS[key] ?? []) {
    const v = row[a];
    if (v && v.trim()) return v.trim();
  }
  return "";
}

function toInt(v: string): number | null {
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toFloat(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/**
 * Impor daftar record BNBA (dari spreadsheet/CSV).
 * - Record baru: status awal = status pertama (Usulan Baru), sumber dana sesuai form.
 * - Record yang sudah ada: hanya memperbarui data pendataan;
 *   status penanganan & sumber dana milik admin TIDAK ditimpa (pengaman form).
 */
export async function importBnbaRecords(rows: Row[], source: string) {
  await ensureSeed();
  const stRows = await db.select().from(statuses).orderBy(asc(statuses.sortOrder)).limit(1);
  const firstStatus = stRows[0];
  const sdList = await db.select().from(sumberDana);
  const now = new Date();
  let added = 0;
  let updated = 0;
  const skipped: string[] = [];

  for (const r of rows) {
    const nama = pick(r, "nama");
    const kec = pick(r, "kecamatan");
    const desa = pick(r, "desa") || "Tidak diisi";
    if (!nama || !kec) {
      skipped.push(`${nama || "(tanpa nama)"} - ${kec || "kecamatan kosong"}`);
      continue;
    }
    const nikVal = pick(r, "nik") || "TANPA-NIK-" + slug(nama);
    const extKey = pick(r, "nik") || slug(nama + kec + desa);
    const sdName = pick(r, "sumberdana");
    const sdMatch = sdList.find((s) => s.name.toLowerCase() === sdName.toLowerCase());

    const data = {
      nik: nikVal,
      nama,
      jenisKelamin: pick(r, "jk") || "Laki-laki",
      umur: toInt(pick(r, "umur")),
      pekerjaan: pick(r, "pekerjaan") || null,
      pendidikan: pick(r, "pendidikan") || null,
      jumlahTanggungan: toInt(pick(r, "tanggungan")),
      penghasilan: pick(r, "penghasilan") || null,
      kondisiKhusus: pick(r, "khusus") || null,
      alamat: pick(r, "alamat") || null,
      rtRw: pick(r, "rtrw") || null,
      desaKelurahan: desa,
      kecamatan: kec,
      lat: toFloat(pick(r, "lat")),
      lng: toFloat(pick(r, "lng")),
      kondisiRumah: pick(r, "kondisi") || null,
      luasRumah: toInt(pick(r, "luas")),
      bahanDinding: pick(r, "dinding") || null,
      bahanAtap: pick(r, "atap") || null,
      bahanLantai: pick(r, "lantai") || null,
      photoUrl: pick(r, "foto") || null,
      catatan: pick(r, "catatan") || null,
      updatedAt: now,
    };

    const existing = await db
      .select({ id: bnba.id })
      .from(bnba)
      .where(eq(bnba.extKey, extKey))
      .limit(1);

    if (existing.length > 0) {
      await db.update(bnba).set(data).where(eq(bnba.id, existing[0].id));
      updated++;
    } else {
      const inserted = await db
        .insert(bnba)
        .values({
          ...data,
          extKey,
          statusId: firstStatus.id,
          sumberDanaId: sdMatch?.id ?? null,
          createdAt: now,
        })
        .returning({ id: bnba.id });
      await db.insert(bnbaHistory).values({
        bnbaId: inserted[0].id,
        statusId: firstStatus.id,
        note: "Data baru masuk dari " + source + ".",
        changedBy: "Sistem (Sync)",
        createdAt: now,
      });
      added++;
    }
  }

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(bnba);
  return { added, updated, total: count, skipped };
}

/** Sinkronisasi dari Google Spreadsheet (CSV terbit). Butuh env GOOGLE_SHEET_ID. */
export async function runSheetSync(username: string) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error(
      "Google Spreadsheet belum dikonfigurasi. Atur environment GOOGLE_SHEET_ID (opsional GOOGLE_SHEET_NAME untuk nama sheet) lalu jalankan sinkronisasi kembali.",
    );
  }
  const sheetName = process.env.GOOGLE_SHEET_NAME || "";
  const url =
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv` +
    (sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : "");
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Gagal mengambil CSV dari Google Spreadsheet (HTTP ${res.status}). Pastikan sheet dibagikan "Anyone with the link".`);
  }
  const text = await res.text();
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new Error("CSV dari spreadsheet kosong atau header tidak dikenali. Kolom minimal: NAMA, KECAMATAN, DESA.");
  }
  const r = await importBnbaRecords(rows, "Google Spreadsheet");
  await db.insert(syncLog).values({
    source: "Google Spreadsheet",
    message: `Sinkronisasi berhasil: ${r.added} data baru, ${r.updated} diperbarui${r.skipped.length ? `, ${r.skipped.length} dilewati` : ""}.`,
    rowsAdded: r.added,
    rowsUpdated: r.updated,
    rowsTotal: r.total,
  });
  void username;
  return r;
}

/** Impor dari teks CSV yang diunggah/ditempel admin. */
export async function importCsvText(text: string, username: string) {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    throw new Error("CSV tidak berisi data. Kolom minimal: NAMA, KECAMATAN, DESA.");
  }
  const r = await importBnbaRecords(rows, "Upload CSV");
  await db.insert(syncLog).values({
    source: "Upload CSV",
    message: `Impor oleh ${username}: ${r.added} data baru, ${r.updated} diperbarui${r.skipped.length ? `, ${r.skipped.length} dilewati` : ""}.`,
    rowsAdded: r.added,
    rowsUpdated: r.updated,
    rowsTotal: r.total,
  });
  return r;
}
