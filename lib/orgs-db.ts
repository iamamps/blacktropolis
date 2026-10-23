import { getPool } from "@/lib/pool";
import { ORGANIZATIONS, Organization } from "@/lib/organizations";

/** The nine organizations with any admin-uploaded logo overrides applied. */
export async function getOrganizations(): Promise<Organization[]> {
  try {
    const { rows } = await getPool().query(
      "select slug, logo_url from org_overrides where logo_url is not null"
    );
    const overrides = new Map<string, string>(rows.map((r) => [r.slug as string, r.logo_url as string]));
    return ORGANIZATIONS.map((o) => ({ ...o, logo: overrides.get(o.slug) || o.logo }));
  } catch {
    return ORGANIZATIONS;
  }
}

export async function getOrganization(slug: string): Promise<Organization | undefined> {
  return (await getOrganizations()).find((o) => o.slug === slug);
}

export async function setOrgLogo(slug: string, logoUrl: string | null): Promise<void> {
  await getPool().query(
    `insert into org_overrides (slug, logo_url, updated_at) values ($1, $2, now())
     on conflict (slug) do update set logo_url = excluded.logo_url, updated_at = now()`,
    [slug, logoUrl]
  );
}
