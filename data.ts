import { and, asc, eq, ilike, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { bnba, bnbaHistory, rangkuman, sumberDana, statuses, syncLog } from "@/db/schema";
import { ensureSeed } from "./seed";

export type BnbaRow = {
  id: number;
  nik: string;
  nama: string;
  jenisKelamin: string;
  umur: number | null;
  pekerjaan: string | null;
  pendidikan: string | null;
  jumlahTanggungan: number | null;
  penghasilan: string | null;
  kondisiKhusus: string | null;
  alamat: string | null;
  rtRw: string | null;
  desaKelurahan: string;
  kecamatan: string;
  lat: number | null;
  lng: number | null;
  kondisiRumah: string | null;
  luasRumah: number | null;
  bahanDinding: string | null;
  bahanAtap: string | null;
  bahanLantai: string | null;
  photoUrl: string | null;
  catatan: string | null;
  statusId: number;
  statusName: string;
  statusColor: string;
  sumberDanaId: number | null;
  sumberDanaName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listBnba(): Promise<BnbaRow[]> {
  await ensureSeed();
  return db
    .select({
      id: bnba.id,
      nik: bnba.nik,
      nama: bnba.nama,
      jenisKelamin: bnba.jenisKelamin,
      umur: bnba.umur,
      pekerjaan: bnba.pekerjaan,
      pendidikan: bnba.pendidikan,
      jumlahTanggungan: bnba.jumlahTanggungan,
      penghasilan: bnba.penghasilan,
      kondisiKhusus: bnba.kondisiKhusus,
      alamat: bnba.alamat,
      rtRw: bnba.rtRw,
      desaKelurahan: bnba.desaKelurahan,
      kecamatan: bnba.kecamatan,
      lat: bnba.lat,
      lng: bnba.lng,
      kondisiRumah: bnba.kondisiRumah,
      luasRumah: bnba.luasRumah,
      bahanDinding: bnba.bahanDinding,
      bahanAtap: bnba.bahanAtap,
      bahanLantai: bnba.bahanLantai,
      photoUrl: bnba.photoUrl,
      catatan: bnba.catatan,
      statusId: bnba.statusId,
      statusName: statuses.name,
      statusColor: statuses.color,
      sumberDanaId: bnba.sumberDanaId,
      sumberDanaName: sumberDana.name,
      createdAt: bnba.createdAt,
      updatedAt: bnba.updatedAt,
    })
    .from(bnba)
    .innerJoin(statuses, eq(bnba.statusId, statuses.id))
    .leftJoin(sumberDana, eq(bnba.sumberDanaId, sumberDana.id))
    .orderBy(asc(bnba.nama));
}

export async function getBnbaById(id: number) {
  await ensureSeed();
  const rows = await db
    .select({
      id: bnba.id,
      nik: bnba.nik,
      nama: bnba.nama,
      jenisKelamin: bnba.jenisKelamin,
      umur: bnba.umur,
      pekerjaan: bnba.pekerjaan,
      pendidikan: bnba.pendidikan,
      jumlahTanggungan: bnba.jumlahTanggungan,
      penghasilan: bnba.penghasilan,
      kondisiKhusus: bnba.kondisiKhusus,
      alamat: bnba.alamat,
      rtRw: bnba.rtRw,
      desaKelurahan: bnba.desaKelurahan,
      kecamatan: bnba.kecamatan,
      lat: bnba.lat,
      lng: bnba.lng,
      kondisiRumah: bnba.kondisiRumah,
      luasRumah: bnba.luasRumah,
      bahanDinding: bnba.bahanDinding,
      bahanAtap: bnba.bahanAtap,
      bahanLantai: bnba.bahanLantai,
      photoUrl: bnba.photoUrl,
      catatan: bnba.catatan,
      statusId: bnba.statusId,
      statusName: statuses.name,
      statusColor: statuses.color,
      statusOrder: statuses.sortOrder,
      sumberDanaId: bnba.sumberDanaId,
      sumberDanaName: sumberDana.name,
      createdAt: bnba.createdAt,
      updatedAt: bnba.updatedAt,
    })
    .from(bnba)
    .innerJoin(statuses, eq(bnba.statusId, statuses.id))
    .leftJoin(sumberDana, eq(bnba.sumberDanaId, sumberDana.id))
    .where(eq(bnba.id, id))
    .limit(1);
  if (!rows[0]) return null;
  const history = await db
    .select({
      statusId: bnbaHistory.statusId,
      statusName: statuses.name,
      statusColor: statuses.color,
      note: bnbaHistory.note,
      changedBy: bnbaHistory.changedBy,
      createdAt: bnbaHistory.createdAt,
    })
    .from(bnbaHistory)
    .innerJoin(statuses, eq(bnbaHistory.statusId, statuses.id))
    .where(eq(bnbaHistory.bnbaId, id))
    .orderBy(asc(bnbaHistory.createdAt));
  return { ...rows[0], history };
}

export async function fetchStatuses() {
  await ensureSeed();
  return db.select().from(statuses).orderBy(asc(statuses.sortOrder));
}

export async function fetchSumberDana() {
  await ensureSeed();
  return db.select().from(sumberDana).orderBy(asc(sumberDana.name));
}

export async function fetchRangkuman() {
  await ensureSeed();
  const rows = await db.select().from(rangkuman).limit(1);
  return rows[0] ?? null;
}

export async function fetchLastSync() {
  const latest = await db.select().from(syncLog).orderBy(syncLog.id).limit(1);
  return latest[0] ?? null;
}

export type Stats = {
  total: number;
  perStatus: { name: string; color: string; count: number; order: number }[];
  perKecamatan: { name: string; count: number }[];
  perSumberDana: { name: string; count: number }[];
  rekap: {
    kecamatan: string;
    total: number;
    byStatus: Record<string, number>;
    selesai: number;
  }[];
  statusNames: string[];
};

export function computeStats(rows: BnbaRow[], statusesList: { id: number; name: string; sortOrder: number; color: string }[]): Stats {
  const statusNames = statusesList.map((s) => s.name);
  const selesaiName = statusesList[statusesList.length - 1]?.name ?? "Selesai";
  const perStatusMap: Record<string, number> = {};
  const kecMap: Record<string, number> = {};
  const sdMap: Record<string, number> = {};
  const rekapMap: Record<string, { total: number; byStatus: Record<string, number> }> = {};

  for (const r of rows) {
    perStatusMap[r.statusName] = (perStatusMap[r.statusName] ?? 0) + 1;
    kecMap[r.kecamatan] = (cecSafe(kecMap, r.kecamatan));
    sdMap[r.sumberDanaName ?? "Belum ditentukan"] = (sdMap[r.sumberDanaName ?? "Belum ditentukan"] ?? 0) + 1;
    if (!rekapMap[r.kecamatan]) rekapMap[r.kecamatan] = { total: 0, byStatus: {} };
    rekapMap[r.kecamatan].total++;
    rekapMap[r.kecamatan].byStatus[r.statusName] = (rekapMap[r.kecamatan].byStatus[r.statusName] ?? 0) + 1;
  }

  return {
    total: rows.length,
    perStatus: statusesList
      .map((s) => ({ name: s.name, color: s.color, count: perStatusMap[s.name] ?? 0, order: s.sortOrder }))
      .sort((a, b) => a.order - b.order),
    perKecamatan: Object.entries(kecMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    perSumberDana: Object.entries(sdMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    rekap: Object.entries(rekapMap)
      .map(([kecamatan, v]) => ({
        kecamatan,
        total: v.total,
        byStatus: v.byStatus,
        selesai: v.byStatus[selesaiName] ?? 0,
      }))
      .sort((a, b) => b.total - a.total || a.kecamatan.localeCompare(b.kecamatan)),
    statusNames,
  };
}

function cecSafe(m: Record<string, number>, k: string) {
  m[k] = (m[k] ?? 0) + 1;
  return m[k];
}

/** Pencarian bebas pada deretan field. */
export function bnbaMatches(row: BnbaRow, q: string): boolean {
  const t = q.toLowerCase();
  return [row.nama, row.nik, row.kecamatan, row.desaKelurahan, row.alamat, row.pekerjaan]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(t));
}

export { fmtDate } from "./format";

/** Query raw untuk filter server-side (dipakai API /api/bnba). */
export async function queryBnbaFiltered(params: {
  q?: string;
  kecamatan?: string;
  desa?: string;
  statusId?: number;
  sumberDanaId?: string | number;
}) {
  await ensureSeed();
  const conds = [];
  if (params.kecamatan) conds.push(eq(bnba.kecamatan, params.kecamatan));
  if (params.desa) conds.push(eq(bnba.desaKelurahan, params.desa));
  if (params.statusId) conds.push(eq(bnba.statusId, params.statusId));
  if (params.sumberDanaId === "none" || params.sumberDanaId === "null") conds.push(isNull(bnba.sumberDanaId));
  else if (params.sumberDanaId) conds.push(eq(bnba.sumberDanaId, Number(params.sumberDanaId)));
  if (params.q) {
    const like = `%${params.q.toLowerCase()}%`;
    conds.push(
      or(
        ilike(bnba.nama, like),
        ilike(bnba.nik, like),
        ilike(bnba.kecamatan, like),
        ilike(bnba.desaKelurahan, like),
      ),
    );
  }
  return db
    .select({
      id: bnba.id,
      nik: bnba.nik,
      nama: bnba.nama,
      jenisKelamin: bnba.jenisKelamin,
      umur: bnba.umur,
      pekerjaan: bnba.pekerjaan,
      pendidikan: bnba.pendidikan,
      jumlahTanggungan: bnba.jumlahTanggungan,
      penghasilan: bnba.penghasilan,
      kondisiKhusus: bnba.kondisiKhusus,
      alamat: bnba.alamat,
      rtRw: bnba.rtRw,
      desaKelurahan: bnba.desaKelurahan,
      kecamatan: bnba.kecamatan,
      lat: bnba.lat,
      lng: bnba.lng,
      kondisiRumah: bnba.kondisiRumah,
      luasRumah: bnba.luasRumah,
      bahanDinding: bnba.bahanDinding,
      bahanAtap: bnba.bahanAtap,
      bahanLantai: bnba.bahanLantai,
      photoUrl: bnba.photoUrl,
      catatan: bnba.catatan,
      statusId: bnba.statusId,
      statusName: statuses.name,
      statusColor: statuses.color,
      sumberDanaId: bnba.sumberDanaId,
      sumberDanaName: sumberDana.name,
      createdAt: bnba.createdAt,
      updatedAt: bnba.updatedAt,
    })
    .from(bnba)
    .innerJoin(statuses, eq(bnba.statusId, statuses.id))
    .leftJoin(sumberDana, eq(bnba.sumberDanaId, sumberDana.id))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(bnba.nama));
}
