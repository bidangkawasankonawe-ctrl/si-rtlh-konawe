import { NextResponse } from "next/server";
import { listBnba } from "@/lib/data";

export const dynamic = "force-dynamic";

function esc(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",;\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

export async function GET() {
  const rows = await listBnba();
  const header = [
    "NIK", "NAMA", "JENIS KELAMIN", "UMUR", "PEKERJAAN", "PENDIDIKAN",
    "JML TANGGUNGAN", "PENGHASILAN", "KONDISI KHUSUS", "ALAMAT", "RT/RW",
    "DESA/KELURAHAN", "KECAMATAN", "LAT", "LNG", "KONDISI RUMAH", "LUAS (M2)",
    "BAHAN DINDING", "BAHAN ATAP", "BAHAN LANTAI", "STATUS", "SUMBER DANA",
  ];
  const lines = rows.map((r) =>
    [
      r.nik, r.nama, r.jenisKelamin, r.umur, r.pekerjaan, r.pendidikan,
      r.jumlahTanggungan, r.penghasilan, r.kondisiKhusus, r.alamat, r.rtRw,
      r.desaKelurahan, r.kecamatan, r.lat, r.lng, r.kondisiRumah, r.luasRumah,
      r.bahanDinding, r.bahanAtap, r.bahanLantai, r.statusName, r.sumberDanaName ?? "Belum ditentukan",
    ]
      .map(esc)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="data-bnba-konawe.csv"',
    },
  });
}
