import { NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const event = await getEventById(params.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({ event });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const event = await getEventById(params.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const updated = await updateEvent(params.id, body);
  return NextResponse.json({ event: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const event = await getEventById(params.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await deleteEvent(params.id);
  return NextResponse.json({ ok: true });
}
