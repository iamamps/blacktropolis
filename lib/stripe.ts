import Stripe from "stripe";

declare global {
  // eslint-disable-next-line no-var
  var _btStripe: Stripe | undefined;
}

export function getStripe(): Stripe {
  if (!global._btStripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }
    global._btStripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  }
  return global._btStripe;
}

export const BUSINESS_MEMBERSHIP_PRICE_ID = process.env.STRIPE_BUSINESS_PRICE_ID || "";
export const TEST_PRICE_ID = process.env.STRIPE_TEST_PRICE_ID || "";
