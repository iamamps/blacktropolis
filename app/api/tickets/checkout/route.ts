import { NextResponse } from "next/server";
import { getEventById } from "@/lib/db";
import { getTicketTypeById } from "@/lib/tickets-db";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, ticketTypeId, quantity, buyerName, buyerEmail } = body as {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
    buyerName: string;
    buyerEmail: string;
  };

  if (!eventId || !ticketTypeId || !quantity || quantity < 1 || !buyerEmail) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const event = await getEventById(eventId);
  const ticketType = await getTicketTypeById(ticketTypeId);
  if (!event || !ticketType || ticketType.eventId !== eventId) {
    return NextResponse.json({ error: "Ticket type not found." }, { status: 404 });
  }

  if (
    ticketType.quantityAvailable != null &&
    ticketType.quantitySold + quantity > ticketType.quantityAvailable
  ) {
    return NextResponse.json({ error: "Not enough tickets available." }, { status: 409 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: ticketType.priceCents,
            product_data: {
              name: `${event.title} — ${ticketType.name}`,
              description: `${event.date} · ${event.venueName || event.city}`,
            },
          },
          quantity,
        },
      ],
      success_url: `${origin}/events/${eventId}/tickets/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/events/${eventId}`,
      metadata: {
        blacktropolis_event_id: eventId,
        blacktropolis_ticket_type_id: ticketTypeId,
        blacktropolis_quantity: String(quantity),
        blacktropolis_buyer_name: buyerName || "",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
