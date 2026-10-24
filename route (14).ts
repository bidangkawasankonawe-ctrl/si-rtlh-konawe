import { NextResponse } from "next/server";
import { db } from "@/db";
import { sumberDana } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";
import { fetchSumberDana } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ rows: await fetchSumberDana() });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  let body: { name?: string; description?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Nama sumber dana wajib diisi" }, { status: 400 });

  try {
    const rows = await db
      .insert(sumberDana)
      .values({ name, description: body.description?.trim() || null })
      .returning({ id: sumberDana.id, name: sumberDana.name });
    await logAudit(user.username, "SUMBER_DANA_ADD", "sumber_dana", String(rows[0].id), `Menambah sumber dana: ${name}`);
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch {
    return NextResponse.json({ error: "Nama sumber dana sudah ada" }, { status: 409 });
  }
}
