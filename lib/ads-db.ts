import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _btPool: Pool | undefined;
}

function getPool(): Pool {
  if (!global._btPool) {
    global._btPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return global._btPool;
}

export interface SiteAd {
  id: string;
  title: string | null;
  imageDataUrl: string;
  linkUrl: string | null;
  active: boolean;
  createdAt: string;
}

function rowToAd(row: Record<string, unknown>): SiteAd {
  return {
    id: row.id as string,
    title: (row.title as string) || null,
    imageDataUrl: row.image_data_url as string,
    linkUrl: (row.link_url as string) || null,
    active: Boolean(row.active),
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function getAllAds(): Promise<SiteAd[]> {
  const { rows } = await getPool().query("select * from site_ads order by created_at desc");
  return rows.map(rowToAd);
}

export async function getActiveAd(): Promise<SiteAd | undefined> {
  const { rows } = await getPool().query(
    "select * from site_ads where active = true order by created_at desc limit 1"
  );
  return rows[0] ? rowToAd(rows[0]) : undefined;
}

export async function addAd(ad: SiteAd): Promise<SiteAd> {
  await getPool().query(
    `insert into site_ads (id, title, image_data_url, link_url, active, created_at) values ($1,$2,$3,$4,$5,$6)`,
    [ad.id, ad.title, ad.imageDataUrl, ad.linkUrl, ad.active, ad.createdAt]
  );
  return ad;
}

export async function setActiveAd(id: string): Promise<void> {
  const pool = getPool();
  await pool.query("update site_ads set active = false");
  await pool.query("update site_ads set active = true where id = $1", [id]);
}

export async function deleteAd(id: string): Promise<boolean> {
  const result = await getPool().query("delete from site_ads where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
