import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEventById } from "@/lib/db";
import { getTicketsForEvent } from "@/lib/tickets-db";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const event = await getEventById(params.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const tickets = await getTicketsForEvent(params.id);
  return NextResponse.json({ tickets });
}
