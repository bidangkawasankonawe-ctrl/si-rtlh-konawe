import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bnba, sumberDana } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  const { id } = await ctx.params;
  const n = Number(id);
  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });

  try {
    const rows = await db
      .update(sumberDana)
      .set({ name, description: body.description?.trim() || null })
      .where(eq(sumberDana.id, n))
      .returning({ id: sumberDana.id, name: sumberDana.name });
    if (!rows[0]) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    await logAudit(user.username, "SUMBER_DANA_UPDATE", "sumber_dana", String(n), `Mengubah sumber dana menjadi: ${name}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nama sumber dana sudah ada" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  const { id } = await ctx.params;
  const n = Number(id);
  const [rec] = await db.select().from(sumberDana).where(eq(sumberDana.id, n)).limit(1);
  if (!rec) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  const [used] = await db.select({ id: bnba.id }).from(bnba).where(eq(bnba.sumberDanaId, n)).limit(1);
  if (used) {
    // Nonaktifkan saja agar data riwayat tetap aman
    await db.update(sumberDana).set({ active: false }).where(eq(sumberDana.id, n));
    await logAudit(user.username, "SUMBER_DANA_DEACTIVATE", "sumber_dana", String(n), `Mematikan sumber dana: ${rec.name} (masih dipakai data)`);
    return NextResponse.json({ ok: true, deactivated: true, message: "Sumber dana masih dipakai data, sehingga dinonaktifkan (bukan dihapus)." });
  }

  await db.delete(sumberDana).where(eq(sumberDana.id, n));
  await logAudit(user.username, "SUMBER_DANA_DELETE", "sumber_dana", String(n), `Menghapus sumber dana: ${rec.name}`);
  return NextResponse.json({ ok: true });
}
