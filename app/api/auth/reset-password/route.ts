import { NextResponse } from "next/server";
import { getMemberByResetToken, updateMember } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const member = await getMemberByResetToken(token);
  if (!member) {
    return NextResponse.json({ error: "This reset link is invalid." }, { status: 400 });
  }
  if (!member.resetTokenExpires || new Date(member.resetTokenExpires) < new Date()) {
    return NextResponse.json({ error: "This reset link has expired. Request a new one." }, { status: 400 });
  }

  await updateMember(member.id, {
    passwordHash: hashPassword(password),
    resetToken: null,
    resetTokenExpires: null,
  });

  return NextResponse.json({ ok: true });
}
