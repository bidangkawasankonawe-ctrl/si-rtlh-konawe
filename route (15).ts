import { NextResponse } from "next/server";
import { getSessionUser, logAudit } from "@/lib/auth";
import { importCsvText } from "@/lib/sync";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });

  let body: { csv?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const csv = String(body.csv ?? "");
  if (!csv.trim()) return NextResponse.json({ error: "Konten CSV kosong" }, { status: 400 });

  try {
    const r = await importCsvText(csv, user.username);
    await logAudit(user.username, "SYNC_CSV", "sync", null, `Impor CSV: +${r.added}, ~${r.updated}, total ${r.total}`);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Impor CSV gagal" },
      { status: 400 },
    );
  }
}
