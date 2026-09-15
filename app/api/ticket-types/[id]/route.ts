import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTicketTypeById, updateTicketType, deleteTicketType } from "@/lib/tickets-db";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const ticketType = await getTicketTypeById(params.id);
  if (!ticketType) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!session || session.id !== ticketType.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const body = await request.json();
  const patch: Record<string, unknown> = {};
  if (body.name != null) patch.name = body.name;
  if (body.price != null) patch.priceCents = Math.round(body.price * 100);
  if ("quantityAvailable" in body) patch.quantityAvailable = body.quantityAvailable;
  const updated = await updateTicketType(params.id, patch);
  return NextResponse.json({ ticketType: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  const ticketType = await getTicketTypeById(params.id);
  if (!ticketType) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (!session || session.id !== ticketType.businessId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  if (ticketType.quantitySold > 0) {
    return NextResponse.json(
      { error: "Can't delete a ticket type that already has sales." },
      { status: 400 }
    );
  }
  await deleteTicketType(params.id);
  return NextResponse.json({ ok: true });
}
