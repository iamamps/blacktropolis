import { NextResponse } from "next/server";
import { getMemberByEmail, addMember } from "@/lib/db";
import {
  hashPassword,
  generateId,
  generateMembershipId,
  encodeSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { Member, Role } from "@/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { role, name, businessName, email, password, city, state, zip, category } = body as {
    role: Role;
    name: string;
    businessName?: string;
    email: string;
    password: string;
    city: string;
    state: string;
    zip: string;
    category?: string;
  };

  if (!role || !name || !email || !password || !city || !zip) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }
  if (role === "business" && !businessName) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }
  if (await getMemberByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const member: Member = {
    id: generateId(role === "business" ? "biz" : "res"),
    role,
    name,
    businessName: role === "business" ? businessName : undefined,
    email,
    passwordHash: hashPassword(password),
    city,
    state: state || "",
    zip,
    category: category || undefined,
    membershipTier: "free",
    membershipStatus: "active",
    membershipId: generateMembershipId(),
    memberSince: new Date().toISOString(),
  };

  await addMember(member);

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
