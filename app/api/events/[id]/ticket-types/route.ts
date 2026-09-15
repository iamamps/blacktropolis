import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEventById } from "@/lib/db";
import { generateId } from "@/lib/auth";
import { getTicketTypesForEvent, addTicketType } from "@/lib/tickets-db";
import { TicketType } from "@/types";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const ticketTypes = await getTicketTypesForEvent(params.id);
  return NextResponse.json({ ticketTypes });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const event = await getEventById(params.id);
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (!session || session.id !== event.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json();
  const { name, price, quantityAvailable } = body as {
    name: string;
    price: number;
    quantityAvailable?: number | null;
  };

  if (!name || price == null || price < 0) {
    return NextResponse.json({ error: "Ticket name and price are required." }, { status: 400 });
  }

  const ticketType: TicketType = {
    id: generateId("tt"),
    eventId: event.id,
    businessId: event.businessId,
    name,
    priceCents: Math.round(price * 100),
    quantityAvailable: quantityAvailable ?? null,
    quantitySold: 0,
    createdAt: new Date().toISOString(),
  };

  await addTicketType(ticketType);
  return NextResponse.json({ ticketType });
}
