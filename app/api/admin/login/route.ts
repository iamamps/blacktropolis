import { NextResponse } from "next/server";
import { verifyAdminPasscode, adminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { passcode } = await request.json();
  if (!verifyAdminPasscode(passcode)) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
