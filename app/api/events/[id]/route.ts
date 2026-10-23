import { NextResponse } from "next/server";
import { getEventById, updateEvent, deleteEvent } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isAdminAuthed } from "@/lib/admin-auth";
import { parseDivineNineFields } from "@/lib/event-input";
import { EventItem } from "@/types";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.isHidden) {
    const session = await getSession();
    if (!(await isAdminAuthed()) && session?.id !== event.businessId) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }
  }
  return NextResponse.json({ event });
}

// Fields an event owner may change. (businessId, id, createdAt and hidden state are never taken from the client.)
const EDITABLE: (keyof EventItem)[] = [
  "title",
  "description",
  "category",
  "date",
  "time",
  "venueName",
  "address",
  "city",
  "state",
  "zip",
  "lat",
  "lng",
  "flyerDataUrl",
  "ticketLink",
  "price",
];

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  for (const key of EDITABLE) if (key in body) patch[key] = body[key];

  const d9 = parseDivineNineFields(body, event);
  if (!d9.ok) return NextResponse.json({ error: d9.error }, { status: 400 });
  if (d9.fields.organizations && d9.fields.organizations.length === 0) {
    return NextResponse.json(
      { error: "Select at least one Divine Nine organization this event is for." },
      { status: 400 }
    );
  }
  Object.assign(patch, d9.fields);

  const updated = await updateEvent(id, patch as Partial<EventItem>);
  return NextResponse.json({ event: updated });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  await deleteEvent(id);
  return NextResponse.json({ ok: true });
}
