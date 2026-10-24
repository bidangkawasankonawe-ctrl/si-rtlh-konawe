import { NextResponse } from "next/server";
import { COOKIE_NAME, getSessionUser, logAudit } from "@/lib/auth";

async function doLogout(req: Request) {
  const user = await getSessionUser();
  if (user) await logAudit(user.username, "LOGOUT", "auth", String(user.id), "Keluar dari sistem");
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}

export async function GET(req: Request) {
  return doLogout(req);
}

export async function POST(req: Request) {
  return doLogout(req);
}
