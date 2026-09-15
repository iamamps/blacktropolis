import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMemberById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ member: null });
  const member = await getMemberById(session.id);
  if (!member) return NextResponse.json({ member: null });
  return NextResponse.json({ member: { ...member, passwordHash: undefined } });
}
