import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getEvents } from "@/lib/db";

// Every event, including hidden ones (admin only).
export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const events = await getEvents({ includeHidden: true });
  return NextResponse.json({ events });
}
