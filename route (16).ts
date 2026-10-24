import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { syncLog } from "@/db/schema";
import { getSessionUser, logAudit } from "@/lib/auth";
import { runSheetSync } from "@/lib/sync";

export const dynamic = "force-dynamic";

/** Riwayat sinkronisasi (20 terakhir). */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });
  const rows = await db
    .select()
    .from(syncLog)
    .orderBy(desc(syncLog.createdAt), desc(syncLog.id))
    .limit(20);
  return NextResponse.json({ rows });
}

/** Jalankan sinkronisasi dari Google Spreadsheet. */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  try {
    const r = await runSheetSync(user.username);
    await logAudit(user.username, "SYNC_SHEET", "sync", null, `Sinkronisasi spreadsheet: +${r.added}, ~${r.updated}, total ${r.total}`);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sinkronisasi gagal" },
      { status: 400 },
    );
  }
}
