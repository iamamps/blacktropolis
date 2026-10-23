import { NextResponse } from "next/server";
import { getEvents, addEvent, getMemberById } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { generateId } from "@/lib/auth";
import { distanceMiles, geocodeLocation } from "@/lib/geocode";
import { EventItem } from "@/types";
import { ORG_SLUGS } from "@/lib/organizations";
import { parseDivineNineFields } from "@/lib/event-input";
import { DEFAULT_MEDIA } from "@/lib/media";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const orgParam = searchParams.get("org");
  const school = searchParams.get("school");
  const hbcuOnly = searchParams.get("hbcu") === "1";
  const org = orgParam && ORG_SLUGS.includes(orgParam) ? orgParam : null;

  let events = await getEvents({ org, school, hbcuOnly });

  if (category && category !== "all") {
    events = events.filter((e) => e.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.businessName.toLowerCase().includes(q) ||
        e.school.toLowerCase().includes(q) ||
        e.chapter.toLowerCase().includes(q)
    );
  }

  if (location) {
    const geo = await geocodeLocation(location);
    if (geo) {
      const withDistance = events
        .map((e) => ({
          ...e,
          distance:
            e.lat != null && e.lng != null
              ? distanceMiles(geo.lat, geo.lng, e.lat, e.lng)
              : null,
        }))
        .filter((e) => e.distance == null || e.distance <= 75)
        .sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));
      return NextResponse.json({ events: withDistance, center: geo });
    }
  }

  events = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  return NextResponse.json({ events, center: null });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "business") {
    return NextResponse.json({ error: "Only organizer accounts can post events." }, { status: 403 });
  }
  const member = await getMemberById(session.id);
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });
  if (member.membershipTier !== "paid") {
    return NextResponse.json(
      { error: "An active paid membership is required to post events." },
      { status: 402 }
    );
  }

  const body = await request.json();
  const {
    title,
    description,
    category,
    date,
    time,
    venueName,
    address,
    city,
    state,
    zip,
    flyerDataUrl,
    ticketLink,
    price,
  } = body;

  if (!title || !date || !city || !zip) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const d9 = parseDivineNineFields(body);
  if (!d9.ok) return NextResponse.json({ error: d9.error }, { status: 400 });
  if (!d9.fields.organizations || d9.fields.organizations.length === 0) {
    return NextResponse.json(
      { error: "Select at least one Divine Nine organization this event is for." },
      { status: 400 }
    );
  }

  const geo = await geocodeLocation(`${zip}`);
  const fallbackGeo = geo || (await geocodeLocation(`${city}, ${state}`));

  const event: EventItem = {
    id: generateId("evt"),
    businessId: member.id,
    businessName: member.businessName || member.name,
    title,
    description: description || "",
    category: category || "General",
    date,
    time: time || "",
    venueName: venueName || "",
    address: address || "",
    city,
    state: state || "",
    zip,
    lat: fallbackGeo?.lat ?? null,
    lng: fallbackGeo?.lng ?? null,
    flyerDataUrl: flyerDataUrl || null,
    ticketLink: ticketLink || "",
    price: price || "",
    createdAt: new Date().toISOString(),
    organizations: [],
    school: "",
    isHbcu: false,
    chapter: "",
    isHidden: false,
    ...DEFAULT_MEDIA,
    ...d9.fields,
  };

  await addEvent(event);
  return NextResponse.json({ event });
}
