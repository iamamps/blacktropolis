import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEventById } from "@/lib/db";
import { getTicketsForEvent } from "@/lib/tickets-db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const tickets = await getTicketsForEvent(id);
  return NextResponse.json({ tickets });
}
