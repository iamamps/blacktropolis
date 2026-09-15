import { NextResponse } from "next/server";
import crypto from "crypto";
import QRCode from "qrcode";
import { getStripe } from "@/lib/stripe";
import { getEventById } from "@/lib/db";
import {
  getTicketTypeById,
  incrementTicketTypeSold,
  addTicket,
  getTicketsByStripeSession,
} from "@/lib/tickets-db";
import { sendTicketEmail } from "@/lib/email";
import { Ticket } from "@/types";

function generateTicketCode(): string {
  return `BT-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id." }, { status: 400 });

  const existing = await getTicketsByStripeSession(sessionId);
  if (existing.length > 0) {
    return NextResponse.json({ tickets: existing });
  }

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed yet." }, { status: 402 });
    }

    const eventId = checkoutSession.metadata?.blacktropolis_event_id;
    const ticketTypeId = checkoutSession.metadata?.blacktropolis_ticket_type_id;
    const quantity = Number(checkoutSession.metadata?.blacktropolis_quantity || "1");
    const buyerName = checkoutSession.metadata?.blacktropolis_buyer_name || "";

    if (!eventId || !ticketTypeId) {
      return NextResponse.json({ error: "Invalid ticket session." }, { status: 400 });
    }

    const ticketType = await getTicketTypeById(ticketTypeId);
    const event = await getEventById(eventId);
    if (!ticketType || !event) {
      return NextResponse.json({ error: "Ticket type or event not found." }, { status: 404 });
    }

    const ticket: Ticket = {
      id: crypto.randomBytes(6).toString("hex"),
      code: generateTicketCode(),
      eventId,
      ticketTypeId,
      businessId: ticketType.businessId,
      buyerName: buyerName || null,
      buyerEmail: checkoutSession.customer_details?.email || checkoutSession.customer_email || null,
      quantity,
      amountPaidCents: checkoutSession.amount_total ?? ticketType.priceCents * quantity,
      status: "valid",
      stripeSessionId: sessionId,
      purchasedAt: new Date().toISOString(),
      checkedInAt: null,
    };

    await addTicket(ticket);
    await incrementTicketTypeSold(ticketTypeId, quantity);

    try {
      const qrDataUrl = await QRCode.toDataURL(ticket.code, {
        margin: 1,
        width: 320,
        color: { dark: "#050403", light: "#ffffffff" },
      });
      await sendTicketEmail(ticket, event, qrDataUrl);
    } catch (mailErr) {
      console.error("Ticket email failed:", mailErr);
    }

    return NextResponse.json({ tickets: [ticket] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify ticket purchase.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
