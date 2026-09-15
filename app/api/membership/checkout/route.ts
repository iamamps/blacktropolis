import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getMemberById } from "@/lib/db";
import { getStripe, BUSINESS_MEMBERSHIP_PRICE_ID, TEST_PRICE_ID } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (session.role !== "business") {
    return NextResponse.json({ error: "Only business accounts can subscribe." }, { status: 403 });
  }

  const member = await getMemberById(session.id);
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const priceType = body?.priceType === "test" ? "test" : "live";

  const priceId = priceType === "test" ? TEST_PRICE_ID : BUSINESS_MEMBERSHIP_PRICE_ID;
  if (!priceId) {
    return NextResponse.json({ error: "Membership pricing is not configured." }, { status: 500 });
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: priceType === "test" ? "payment" : "subscription",
      customer_email: member.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?checkout_session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard?upgrade=cancelled`,
      metadata: { blacktropolis_member_id: member.id, price_type: priceType },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
