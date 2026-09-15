import { NextResponse } from "next/server";
import crypto from "crypto";
import { getMemberByEmail, updateMember } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  const member = await getMemberByEmail(email);
  if (!member) {
    return NextResponse.json({ ok: true });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await updateMember(member.id, { resetToken: token, resetTokenExpires: expires });

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const resetUrl = `${origin}/reset-password?token=${token}`;

  try {
    await sendPasswordResetEmail(member.email, member.name, resetUrl);
  } catch (err) {
    console.error("Password reset email failed:", err);
    return NextResponse.json({ error: "Could not send reset email. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
