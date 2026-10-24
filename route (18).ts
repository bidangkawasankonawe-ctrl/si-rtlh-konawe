import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getSessionUser, hashPassword, logAudit } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Wajib login" }, { status: 401 });
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.createdAt));
  return NextResponse.json({ rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "superadmin") {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat menambah pengguna" }, { status: 403 });
  }
  let body: { username?: string; password?: string; fullName?: string; role?: "admin" | "superadmin" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const fullName = String(body.fullName ?? "").trim();
  const role = body.role === "superadmin" ? "superadmin" : "admin";
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return NextResponse.json({ error: "Username minimal 3 karakter (huruf kecil, angka, . _ -)" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Kata sandi minimal 6 karakter" }, { status: 400 });
  }
  if (!fullName) return NextResponse.json({ error: "Nama lengkap wajib diisi" }, { status: 400 });

  try {
    const rows = await db
      .insert(users)
      .values({ username, passwordHash: hashPassword(password), fullName, role })
      .returning({ id: users.id, username: users.username });
    await logAudit(user.username, "USER_ADD", "user", String(rows[0].id), `Menambah pengguna ${rows[0].username} (${role})`);
    return NextResponse.json({ ok: true, id: rows[0].id });
  } catch {
    return NextResponse.json({ error: "Username sudah dipakai" }, { status: 409 });
  }
}
