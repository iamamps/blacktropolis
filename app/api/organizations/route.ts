import { NextResponse } from "next/server";
import { getOrganizations } from "@/lib/orgs-db";

export async function GET() {
  return NextResponse.json({ organizations: await getOrganizations() });
}
