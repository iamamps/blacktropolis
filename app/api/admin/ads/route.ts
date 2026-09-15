import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getAllAds, addAd } from "@/lib/ads-db";
import { generateId } from "@/lib/auth";

export async function GET() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const ads = await getAllAds();
  return NextResponse.json({ ads });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const body = await request.json();
  const { title, imageDataUrl, linkUrl } = body;
  if (!imageDataUrl) return NextResponse.json({ error: "Image is required." }, { status: 400 });

  const ad = {
    id: generateId("ad"),
    title: title || null,
    imageDataUrl,
    linkUrl: linkUrl || null,
    active: false,
    createdAt: new Date().toISOString(),
  };
  await addAd(ad);
  return NextResponse.json({ ad });
}
