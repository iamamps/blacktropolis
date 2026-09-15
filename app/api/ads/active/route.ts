import { NextResponse } from "next/server";
import { getActiveAd } from "@/lib/ads-db";

export async function GET() {
  const ad = await getActiveAd();
  return NextResponse.json({ ad: ad || null });
}
