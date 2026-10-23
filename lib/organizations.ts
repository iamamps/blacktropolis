// Default crests and the site icon are hosted in the public storage bucket (brand/).
export const BRAND_ASSET_BASE =
  "https://vhxkqlrtjhweftkwrdcv.supabase.co/storage/v1/object/public/divine-nine-events/brand";
export const SITE_LOGO = `${BRAND_ASSET_BASE}/logo.png`;

export type OrgGroup = "fraternity" | "sorority";

export interface Organization {
  slug: string;
  number: number;
  name: string;
  short: string;
  group: OrgGroup;
  founded: number;
  foundedAt: string;
  colors: string;
  /** brand accent used for glows/borders */
  accent: string;
  /** default logo (crest) served from /public */
  logo: string;
}

export const ORGANIZATIONS: Organization[] = [
  {
    slug: "alpha-phi-alpha",
    number: 1,
    name: "Alpha Phi Alpha Fraternity, Inc.",
    short: "Alpha Phi Alpha",
    group: "fraternity",
    founded: 1906,
    foundedAt: "Cornell University",
    colors: "Black & Old Gold",
    accent: "#c9a227",
    logo: `${BRAND_ASSET_BASE}/orgs/alpha-phi-alpha.png`,
  },
  {
    slug: "kappa-alpha-psi",
    number: 2,
    name: "Kappa Alpha Psi Fraternity, Inc.",
    short: "Kappa Alpha Psi",
    group: "fraternity",
    founded: 1911,
    foundedAt: "Indiana University Bloomington",
    colors: "Crimson & Cream",
    accent: "#dc143c",
    logo: `${BRAND_ASSET_BASE}/orgs/kappa-alpha-psi.png`,
  },
  {
    slug: "omega-psi-phi",
    number: 3,
    name: "Omega Psi Phi Fraternity, Inc.",
    short: "Omega Psi Phi",
    group: "fraternity",
    founded: 1911,
    foundedAt: "Howard University",
    colors: "Royal Purple & Old Gold",
    accent: "#7b3fbf",
    logo: `${BRAND_ASSET_BASE}/orgs/omega-psi-phi.png`,
  },
  {
    slug: "phi-beta-sigma",
    number: 4,
    name: "Phi Beta Sigma Fraternity, Inc.",
    short: "Phi Beta Sigma",
    group: "fraternity",
    founded: 1914,
    foundedAt: "Howard University",
    colors: "Royal Blue & Pure White",
    accent: "#2f6fe4",
    logo: `${BRAND_ASSET_BASE}/orgs/phi-beta-sigma.png`,
  },
  {
    slug: "iota-phi-theta",
    number: 5,
    name: "Iota Phi Theta Fraternity, Inc.",
    short: "Iota Phi Theta",
    group: "fraternity",
    founded: 1963,
    foundedAt: "Morgan State University",
    colors: "Charcoal Brown & Gilded Gold",
    accent: "#a47c3a",
    logo: `${BRAND_ASSET_BASE}/orgs/iota-phi-theta.png`,
  },
  {
    slug: "alpha-kappa-alpha",
    number: 6,
    name: "Alpha Kappa Alpha Sorority, Inc.",
    short: "Alpha Kappa Alpha",
    group: "sorority",
    founded: 1908,
    foundedAt: "Howard University",
    colors: "Salmon Pink & Apple Green",
    accent: "#ff6f91",
    logo: `${BRAND_ASSET_BASE}/orgs/alpha-kappa-alpha.png`,
  },
  {
    slug: "delta-sigma-theta",
    number: 7,
    name: "Delta Sigma Theta Sorority, Inc.",
    short: "Delta Sigma Theta",
    group: "sorority",
    founded: 1913,
    foundedAt: "Howard University",
    colors: "Crimson & Cream",
    accent: "#e0245e",
    logo: `${BRAND_ASSET_BASE}/orgs/delta-sigma-theta.png`,
  },
  {
    slug: "zeta-phi-beta",
    number: 8,
    name: "Zeta Phi Beta Sorority, Inc.",
    short: "Zeta Phi Beta",
    group: "sorority",
    founded: 1920,
    foundedAt: "Howard University",
    colors: "Royal Blue & White",
    accent: "#3b82f6",
    logo: `${BRAND_ASSET_BASE}/orgs/zeta-phi-beta.png`,
  },
  {
    slug: "sigma-gamma-rho",
    number: 9,
    name: "Sigma Gamma Rho Sorority, Inc.",
    short: "Sigma Gamma Rho",
    group: "sorority",
    founded: 1922,
    foundedAt: "Butler University",
    colors: "Royal Blue & Gold",
    accent: "#1d4ed8",
    logo: `${BRAND_ASSET_BASE}/orgs/sigma-gamma-rho.png`,
  },
];

export const ORG_SLUGS = ORGANIZATIONS.map((o) => o.slug);

export function getOrgBySlug(slug: string): Organization | undefined {
  return ORGANIZATIONS.find((o) => o.slug === slug);
}

/** Keep only valid, de-duplicated organization slugs. */
export function sanitizeOrgSlugs(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const out: string[] = [];
  for (const v of input) {
    if (typeof v === "string" && ORG_SLUGS.includes(v) && !out.includes(v)) out.push(v);
  }
  return out;
}
