import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateMember } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  if (!sessionId) return NextResponse.json({ error: "Missing session_id." }, { status: 400 });

  try {
    const stripe = getStripe();
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.metadata?.blacktropolis_member_id !== session.id) {
      return NextResponse.json({ error: "Session does not match member." }, { status: 403 });
    }

    if (checkoutSession.payment_status !== "paid" && checkoutSession.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed yet." }, { status: 402 });
    }

    const updated = await updateMember(session.id, {
      membershipTier: "paid",
      membershipStatus: "active",
      stripeSubscriptionId:
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id,
    });

    return NextResponse.json({ member: updated ? { ...updated, passwordHash: undefined } : null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
