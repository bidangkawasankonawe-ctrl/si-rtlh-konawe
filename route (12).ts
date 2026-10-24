import { NextResponse } from "next/server";
import { db } from "@/db";
import { statuses } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";
import { fetchStatuses } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ rows: await fetchStatuses() });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat mengelola status" }, { status: 403 });
  }
  let body: { name?: string; color?: string; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const name = String(body.name ?? "").trim();
  const color = /^#[0-9a-fA-F]{6}$/.test(body.color ?? "") ? body.color! : "#b45309";
  const sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 99;
  if (!name) return NextResponse.json({ error: "Nama status wajib diisi" }, { status: 400 });

  try {
    const rows = await db.insert(statuses).values({ name, color, sortOrder }).returning({ id: statuses.id });
    await logAudit(user.username, "STATUS_ADD", "status", String(rows[0].id), `Menambah status: ${name}`);
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch {
    return NextResponse.json({ error: "Nama status sudah ada" }, { status: 409 });
  }
}
