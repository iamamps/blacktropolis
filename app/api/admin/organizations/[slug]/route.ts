import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getOrgBySlug } from "@/lib/organizations";
import { setOrgLogo } from "@/lib/orgs-db";
import { storagePrefix } from "@/lib/event-input";

// Replace an organization's logo (uploaded through the site) or reset it to the built-in crest.
export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { slug } = await params;
  if (!getOrgBySlug(slug)) return NextResponse.json({ error: "Unknown organization." }, { status: 404 });
  const { logoUrl } = await request.json();
  if (logoUrl === null) {
    await setOrgLogo(slug, null);
    return NextResponse.json({ ok: true });
  }
  const prefix = storagePrefix();
  if (typeof logoUrl !== "string" || !prefix || !logoUrl.startsWith(prefix)) {
    return NextResponse.json({ error: "Logo must be uploaded through the site." }, { status: 400 });
  }
  await setOrgLogo(slug, logoUrl);
  return NextResponse.json({ ok: true });
}
