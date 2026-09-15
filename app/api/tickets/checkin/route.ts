import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getTicketByCode, checkInTicket } from "@/lib/tickets-db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "business") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "Missing ticket code." }, { status: 400 });

  const normalizedCode = String(code).trim().toUpperCase();
  const ticket = await getTicketByCode(normalizedCode);
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  if (ticket.businessId !== session.id) {
    return NextResponse.json({ error: "This ticket isn't for one of your events." }, { status: 403 });
  }

  const result = await checkInTicket(normalizedCode);
  if (!result.ok) {
    return NextResponse.json({ error: result.error, ticket: result.ticket }, { status: 409 });
  }
  return NextResponse.json({ ticket: result.ticket });
}
