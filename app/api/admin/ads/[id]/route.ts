import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { setActiveAd, deleteAd } from "@/lib/ads-db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json();
  if (body.active) {
    await setActiveAd(params.id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  await deleteAd(params.id);
  return NextResponse.json({ ok: true });
}
