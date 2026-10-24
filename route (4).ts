import { NextResponse } from "next/server";
import { getBnbaById } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  const row = await getBnbaById(n);
  if (!row) return NextResponse.json({ error: "Data BNBA tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ row });
}
