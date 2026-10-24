import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bnba, statuses } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat mengelola status" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const n = Number(id);
  let body: { name?: string; color?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nama status wajib diisi" }, { status: 400 });
  const color = /^#[0-9a-fA-F]{6}$/.test(body.color ?? "") ? body.color! : "#b45309";
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 99;

  try {
    const rows = await db
      .update(statuses)
      .set({ name, color, sortOrder })
      .where(eq(statuses.id, n))
      .returning({ id: statuses.id });
    if (!rows[0]) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    await logAudit(user.username, "STATUS_UPDATE", "status", String(n), `Mengubah status menjadi: ${name}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nama status sudah ada" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat mengelola status" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const n = Number(id);
  const [rec] = await db.select().from(statuses).where(eq(statuses.id, n)).limit(1);
  if (!rec) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });

  const [used] = await db.select({ id: bnba.id }).from(bnba).where(eq(bnba.statusId, n)).limit(1);
  if (used) {
    return NextResponse.json(
      { error: "Status masih dipakai oleh data BNBA. Pindahkan datanya terlebih dahulu." },
      { status: 409 },
    );
  }
  await db.delete(statuses).where(eq(statuses.id, n));
  await logAudit(user.username, "STATUS_DELETE", "status", String(n), `Menghapus status: ${rec.name}`);
  return NextResponse.json({ ok: true });
}
