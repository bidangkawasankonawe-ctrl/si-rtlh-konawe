import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rangkuman } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";
import { fetchRangkuman } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ row: await fetchRangkuman() });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  let body: { title?: string; body?: string; tahun?: string; anggaran?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const title = String(body.title ?? "").trim();
  const bodyText = String(body.body ?? "").trim();
  if (!title || !bodyText) {
    return NextResponse.json({ error: "Judul dan isi rangkuman wajib diisi" }, { status: 400 });
  }

  const existing = await db.select().from(rangkuman).orderBy(desc(rangkuman.id)).limit(1);
  if (existing[0]) {
    await db
      .update(rangkuman)
      .set({ title, body: bodyText, tahun: body.tahun?.trim() || null, anggaran: body.anggaran?.trim() || null, updatedAt: new Date() })
      .where(eq(rangkuman.id, existing[0].id));
  } else {
    await db.insert(rangkuman).values({ title, body: bodyText, tahun: body.tahun?.trim() || null, anggaran: body.anggaran?.trim() || null });
  }
  await logAudit(user.username, "RANGKUMAN_UPDATE", "rangkuman", null, `Memperbarui rangkuman beranda: ${title}`);
  return NextResponse.json({ ok: true });
}
