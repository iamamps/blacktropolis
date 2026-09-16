import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { setActiveAd, deleteAd } from "@/lib/ads-db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (body.active) {
    await setActiveAd(id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  await deleteAd(id);
  return NextResponse.json({ ok: true });
}
