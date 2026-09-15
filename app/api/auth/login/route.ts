import { NextResponse } from "next/server";
import { getMemberByEmail } from "@/lib/db";
import { verifyPassword, encodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const member = await getMemberByEmail(email);
  if (!member || !verifyPassword(password, member.passwordHash)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const token = encodeSession({ id: member.id, role: member.role });
  const res = NextResponse.json({ member: { ...member, passwordHash: undefined } });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
