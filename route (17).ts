import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, hashPassword, logAudit } from "@/lib/auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me || me.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const n = Number(id);
  let body: { fullName?: string; role?: "admin" | "superadmin"; active?: boolean; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const [target] = await db.select().from(users).where(eq(users.id, n)).limit(1);
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });

  const set: { fullName?: string; role?: "admin" | "superadmin"; active?: boolean; passwordHash?: string } = {};
  if (body.fullName !== undefined) set.fullName = String(body.fullName).trim() || target.fullName;
  if (body.role !== undefined) set.role = body.role === "superadmin" ? "superadmin" : "admin";
  if (body.active !== undefined) set.active = !!body.active;
  if (body.password) {
    if (String(body.password).length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });
    }
    set.passwordHash = hashPassword(String(body.password));
  }
  // Cegah superadmin terakhir menghapus hak dirinya sendiri
  if (me.id === n && (set.role !== undefined || set.active === false)) {
    return NextResponse.json({ error: "Anda tidak dapat mengubah peran/nonaktifkan akun Anda sendiri" }, { status: 400 });
  }

  await db.update(users).set(set).where(eq(users.id, n));
  await logAudit(
    me.username,
    "USER_UPDATE",
    "user",
    String(n),
    `Memperbarui pengguna ${target.username}: ${Object.keys(set).join(", ") || "tanpa perubahan"}`,
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getSessionUser();
  if (!me || me.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const n = Number(id);
  if (me.id === n) {
    return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 400 });
  }
  const [target] = await db.select().from(users).where(eq(users.id, n)).limit(1);
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
  await db.delete(users).where(eq(users.id, n));
  await logAudit(me.username, "USER_DELETE", "user", String(n), `Menghapus pengguna ${target.username}`);
  return NextResponse.json({ ok: true });
}
