import { NextResponse } from "next/server";
import { COOKIE_NAME, createSessionToken, logAudit, sessionCookieOptions, verifyLogin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    if (!username || !password) {
      return NextResponse.json({ error: "Nama pengguna dan kata sandi wajib diisi." }, { status: 400 });
    }
    const user = await verifyLogin(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Nama pengguna atau kata sandi salah, atau akun dinonaktifkan." },
        { status: 401 },
      );
    }
    const res = NextResponse.json({
      ok: true,
      username: user.username,
      role: user.role,
      fullName: user.fullName,
    });
    res.cookies.set(COOKIE_NAME, createSessionToken(user.id), sessionCookieOptions);
    await logAudit(user.username, "LOGIN", "auth", String(user.id), user.fullName + " masuk ke sistem");
    return res;
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }
}
