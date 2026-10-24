import { NextResponse } from "next/server";
import { queryBnbaFiltered } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const p = url.searchParams;
  const rows = await queryBnbaFiltered({
    q: p.get("q") ?? undefined,
    kecamatan: p.get("kecamatan") ?? undefined,
    desa: p.get("desa") ?? undefined,
    statusId: p.get("status") ? Number(p.get("status")) : undefined,
    sumberDanaId: p.get("sumber") || undefined,
  });
  return NextResponse.json({ rows });
}
