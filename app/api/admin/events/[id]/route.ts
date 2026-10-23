import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getEventById, updateEvent } from "@/lib/db";
import { parseDivineNineFields } from "@/lib/event-input";
import { EventItem } from "@/types";

// The admin can tag an event, resize/reframe its photo or video, and hide/show it. Nothing is deleted.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const body = await request.json();
  const d9 = parseDivineNineFields(body, event);
  if (!d9.ok) return NextResponse.json({ error: d9.error }, { status: 400 });
  const patch: Partial<EventItem> = { ...d9.fields };
  if (typeof body.isHidden === "boolean") patch.isHidden = body.isHidden;

  const updated = await updateEvent(id, patch);
  return NextResponse.json({ event: updated ? { ...updated, flyerDataUrl: updated.flyerDataUrl ? `/api/events/${id}/flyer` : null } : null });
}

// Full event for the editor; the legacy inline flyer is exposed as an image URL.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  return NextResponse.json({
    event: { ...event, flyerDataUrl: event.flyerDataUrl ? `/api/events/${id}/flyer` : null },
  });
}
