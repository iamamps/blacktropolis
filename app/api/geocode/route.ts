import { NextResponse } from "next/server";
import { geocodeLocation } from "@/lib/geocode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json({ error: "Missing query." }, { status: 400 });
  const result = await geocodeLocation(q);
  if (!result) return NextResponse.json({ error: "Location not found." }, { status: 404 });
  return NextResponse.json(result);
}
