import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bnba, bnbaHistory, sumberDana, statuses } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login sebagai admin" }, { status: 401 });

  const { id } = await ctx.params;
  const n = Number(id);
  if (!Number.isInteger(n)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  let body: { statusId?: number; note?: string; sumberDanaId?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const statusId = Number(body.statusId);
  if (!Number.isInteger(statusId)) {
    return NextResponse.json({ error: "statusId wajib diisi" }, { status: 400 });
  }
  const [target] = await db.select().from(statuses).where(eq(statuses.id, statusId)).limit(1);
  if (!target) return NextResponse.json({ error: "Status tidak ditemukan" }, { status: 400 });

  let danaId: number | null | undefined;
  if (body.sumberDanaId !== undefined) {
    if (body.sumberDanaId === null) {
      danaId = null;
    } else {
      const [sd] = await db
        .select()
        .from(sumberDana)
        .where(eq(sumberDana.id, Number(body.sumberDanaId)))
        .limit(1);
      if (!sd) return NextResponse.json({ error: "Sumber dana tidak ditemukan" }, { status: 400 });
      danaId = sd.id;
    }
  }

  const [rec] = await db.select().from(bnba).where(eq(bnba.id, n)).limit(1);
  if (!rec) return NextResponse.json({ error: "Data BNBA tidak ditemukan" }, { status: 404 });

  const now = new Date();
  const changed: string[] = [];
  if (rec.statusId !== target.id) {
    changed.push(`status → ${target.name}`);
    await db.insert(bnbaHistory).values({
      bnbaId: n,
      statusId: target.id,
      note: body.note?.trim() || null,
      changedBy: user.username,
      createdAt: now,
    });
  }
  if (danaId !== undefined && rec.sumberDanaId !== danaId) {
    const danaName = danaId ? (await db.select().from(sumberDana).where(eq(sumberDana.id, danaId)).limit(1))[0]?.name : null;
    changed.push(`sumber dana → ${danaName ?? "Belum ditentukan"}`);
  }
  if (changed.length === 0) {
    return NextResponse.json({ ok: true, message: "Tidak ada perubahan (status & sumber dana sama)." });
  }

  const set: { statusId?: number; sumberDanaId?: number | null; updatedAt: Date } = { updatedAt: now };
  if (rec.statusId !== target.id) set.statusId = target.id;
  if (danaId !== undefined) set.sumberDanaId = danaId;
  await db.update(bnba).set(set).where(eq(bnba.id, n));

  await logAudit(
    user.username,
    "BNBA_UPDATE",
    "bnba",
    String(n),
    `${rec.nama}: ${changed.join("; ")}${body.note?.trim() ? ` — ${body.note.trim()}` : ""}`,
  );

  return NextResponse.json({ ok: true, changed: changed.join("; ") });
}
