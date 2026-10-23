import { Member, EventItem, MediaAspect, MediaFit, MediaSize, MediaType } from "@/types";
import { getPool } from "@/lib/pool";

function rowToMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    role: row.role as Member["role"],
    name: row.name as string,
    businessName: (row.business_name as string) || undefined,
    email: row.email as string,
    passwordHash: row.password_hash as string,
    city: (row.city as string) || "",
    state: (row.state as string) || "",
    zip: (row.zip as string) || "",
    category: (row.category as string) || undefined,
    membershipTier: row.membership_tier as Member["membershipTier"],
    membershipStatus: row.membership_status as Member["membershipStatus"],
    membershipId: row.membership_id as string,
    memberSince: new Date(row.member_since as string).toISOString(),
    stripeCustomerId: (row.stripe_customer_id as string) || undefined,
    stripeSubscriptionId: (row.stripe_subscription_id as string) || undefined,
    resetToken: (row.reset_token as string) || null,
    resetTokenExpires: row.reset_token_expires
      ? new Date(row.reset_token_expires as string).toISOString()
      : null,
  };
}

function rowToEvent(row: Record<string, unknown>): EventItem {
  return {
    id: row.id as string,
    businessId: row.business_id as string,
    businessName: (row.business_name as string) || "",
    title: row.title as string,
    description: (row.description as string) || "",
    category: (row.category as string) || "General",
    date: (row.date as string) || "",
    time: (row.time as string) || "",
    venueName: (row.venue_name as string) || "",
    address: (row.address as string) || "",
    city: (row.city as string) || "",
    state: (row.state as string) || "",
    zip: (row.zip as string) || "",
    lat: row.lat != null ? Number(row.lat) : null,
    lng: row.lng != null ? Number(row.lng) : null,
    flyerDataUrl: (row.flyer_data_url as string) || null,
    ticketLink: (row.ticket_link as string) || "",
    price: (row.price as string) || "",
    createdAt: new Date(row.created_at as string).toISOString(),
    organizations: (row.organizations as string[]) || [],
    school: (row.school as string) || "",
    isHbcu: Boolean(row.is_hbcu),
    chapter: (row.chapter as string) || "",
    isHidden: Boolean(row.is_hidden),
    mediaType: ((row.media_type as string) || "image") as MediaType,
    mediaUrl: (row.media_url as string) || null,
    posterUrl: (row.poster_url as string) || null,
    mediaAspect: ((row.media_aspect as string) || "original") as MediaAspect,
    mediaFit: ((row.media_fit as string) || "cover") as MediaFit,
    mediaZoom: row.media_zoom != null ? Number(row.media_zoom) : 1,
    mediaX: row.media_x != null ? Number(row.media_x) : 50,
    mediaY: row.media_y != null ? Number(row.media_y) : 50,
    mediaSize: ((row.media_size as string) || "full") as MediaSize,
  };
}

export async function getMembers(): Promise<Member[]> {
  const { rows } = await getPool().query("select * from members order by member_since desc");
  return rows.map(rowToMember);
}

export async function getMemberByEmail(email: string): Promise<Member | undefined> {
  const { rows } = await getPool().query(
    "select * from members where lower(email) = lower($1) limit 1",
    [email]
  );
  return rows[0] ? rowToMember(rows[0]) : undefined;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const { rows } = await getPool().query("select * from members where id = $1 limit 1", [id]);
  return rows[0] ? rowToMember(rows[0]) : undefined;
}

export async function getMemberByResetToken(token: string): Promise<Member | undefined> {
  const { rows } = await getPool().query(
    "select * from members where reset_token = $1 limit 1",
    [token]
  );
  return rows[0] ? rowToMember(rows[0]) : undefined;
}

export async function addMember(member: Member): Promise<Member> {
  await getPool().query(
    `insert into members
      (id, role, name, business_name, email, password_hash, city, state, zip, category, membership_tier, membership_status, membership_id, member_since)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      member.id,
      member.role,
      member.name,
      member.businessName || null,
      member.email,
      member.passwordHash,
      member.city,
      member.state,
      member.zip,
      member.category || null,
      member.membershipTier,
      member.membershipStatus,
      member.membershipId,
      member.memberSince,
    ]
  );
  return member;
}

export async function updateMember(id: string, patch: Partial<Member>): Promise<Member | null> {
  const existing = await getMemberById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  await getPool().query(
    `update members set role=$2, name=$3, business_name=$4, email=$5, password_hash=$6, city=$7, state=$8, zip=$9, category=$10, membership_tier=$11, membership_status=$12, membership_id=$13, stripe_customer_id=$14, stripe_subscription_id=$15, reset_token=$16, reset_token_expires=$17
     where id=$1`,
    [
      id,
      merged.role,
      merged.name,
      merged.businessName || null,
      merged.email,
      merged.passwordHash,
      merged.city,
      merged.state,
      merged.zip,
      merged.category || null,
      merged.membershipTier,
      merged.membershipStatus,
      merged.membershipId,
      merged.stripeCustomerId || null,
      merged.stripeSubscriptionId || null,
      merged.resetToken || null,
      merged.resetTokenExpires || null,
    ]
  );
  return merged;
}

const LIST_COLUMNS = `id, business_id, business_name, title, description, category, date, time, venue_name, address, city, state, zip, lat, lng,
  (case when flyer_data_url is not null and flyer_data_url <> '' then '/api/events/' || id || '/flyer' else null end) as flyer_data_url,
  ticket_link, price, created_at, organizations, school, is_hbcu, chapter, media_type, media_url, poster_url, media_aspect, media_fit, media_zoom, media_x, media_y, media_size, is_hidden`;

export interface EventFilters {
  org?: string | null;
  school?: string | null;
  hbcuOnly?: boolean;
  includeHidden?: boolean;
}

/** Public event list. Hidden events are excluded unless includeHidden is set (admin). */
export async function getEvents(filters: EventFilters = {}): Promise<EventItem[]> {
  const where: string[] = [];
  const params: unknown[] = [];
  if (!filters.includeHidden) where.push("is_hidden = false");
  if (filters.org) {
    params.push(filters.org);
    where.push(`$${params.length} = any(organizations)`);
  }
  if (filters.school) {
    params.push(filters.school);
    where.push(`lower(school) = lower($${params.length})`);
  }
  if (filters.hbcuOnly) where.push("is_hbcu = true");
  // The legacy inline flyer (base64) is replaced by a lightweight image URL so lists stay small.
  const sql = `select ${LIST_COLUMNS} from events ${where.length ? "where " + where.join(" and ") : ""} order by date asc`;
  const { rows } = await getPool().query(sql, params);
  return rows.map(rowToEvent);
}

/** Events per organization (public, non-hidden) for the homepage badges. */
export async function getOrgEventCounts(): Promise<Record<string, number>> {
  const { rows } = await getPool().query(
    `select o as slug, count(*)::int as n from events, unnest(organizations) as o where is_hidden = false group by o`
  );
  const out: Record<string, number> = {};
  for (const r of rows) out[r.slug as string] = Number(r.n);
  return out;
}

/** Schools that have at least one public event. */
export async function getSchoolsWithEvents(): Promise<{ school: string; n: number; isHbcu: boolean }[]> {
  const { rows } = await getPool().query(
    `select min(school) as school, count(*)::int as n, bool_or(is_hbcu) as is_hbcu
       from events where is_hidden = false and school <> ''
       group by lower(school) order by n desc, min(school) asc`
  );
  return rows.map((r) => ({ school: r.school as string, n: Number(r.n), isHbcu: Boolean(r.is_hbcu) }));
}

export async function getEventById(id: string): Promise<EventItem | undefined> {
  const { rows } = await getPool().query("select * from events where id = $1 limit 1", [id]);
  return rows[0] ? rowToEvent(rows[0]) : undefined;
}

export async function addEvent(event: EventItem): Promise<EventItem> {
  await getPool().query(
    `insert into events
      (id, business_id, business_name, title, description, category, date, time, venue_name, address, city, state, zip, lat, lng, flyer_data_url, ticket_link, price, created_at,
       organizations, school, is_hbcu, chapter, media_type, media_url, poster_url, media_aspect, media_fit, media_zoom, media_x, media_y, media_size, is_hidden)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
             $20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33)`,
    [
      event.id,
      event.businessId,
      event.businessName,
      event.title,
      event.description,
      event.category,
      event.date,
      event.time,
      event.venueName,
      event.address,
      event.city,
      event.state,
      event.zip,
      event.lat,
      event.lng,
      event.flyerDataUrl,
      event.ticketLink,
      event.price,
      event.createdAt,
      event.organizations,
      event.school,
      event.isHbcu,
      event.chapter,
      event.mediaType,
      event.mediaUrl,
      event.posterUrl,
      event.mediaAspect,
      event.mediaFit,
      event.mediaZoom,
      event.mediaX,
      event.mediaY,
      event.mediaSize,
      event.isHidden,
    ]
  );
  return event;
}

export async function updateEvent(id: string, patch: Partial<EventItem>): Promise<EventItem | null> {
  const existing = await getEventById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  await getPool().query(
    `update events set title=$2, description=$3, category=$4, date=$5, time=$6, venue_name=$7, address=$8, city=$9, state=$10, zip=$11, lat=$12, lng=$13, flyer_data_url=$14, ticket_link=$15, price=$16,
       organizations=$17, school=$18, is_hbcu=$19, chapter=$20, media_type=$21, media_url=$22, poster_url=$23, media_aspect=$24, media_fit=$25, media_zoom=$26, media_x=$27, media_y=$28, media_size=$29, is_hidden=$30
     where id=$1`,
    [
      id,
      merged.title,
      merged.description,
      merged.category,
      merged.date,
      merged.time,
      merged.venueName,
      merged.address,
      merged.city,
      merged.state,
      merged.zip,
      merged.lat,
      merged.lng,
      merged.flyerDataUrl,
      merged.ticketLink,
      merged.price,
      merged.organizations,
      merged.school,
      merged.isHbcu,
      merged.chapter,
      merged.mediaType,
      merged.mediaUrl,
      merged.posterUrl,
      merged.mediaAspect,
      merged.mediaFit,
      merged.mediaZoom,
      merged.mediaX,
      merged.mediaY,
      merged.mediaSize,
      merged.isHidden,
    ]
  );
  return merged;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const result = await getPool().query("delete from events where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function getStats() {
  const { rows } = await getPool().query(`
    select
      (select count(*) from members) as total_members,
      (select count(*) from members where role = 'resident') as residents,
      (select count(*) from members where role = 'business') as businesses,
      (select count(*) from members where role = 'business' and membership_tier = 'paid') as paid_businesses,
      (select count(*) from events) as total_events
  `);
  const r = rows[0];
  return {
    totalMembers: Number(r.total_members),
    residents: Number(r.residents),
    businesses: Number(r.businesses),
    paidBusinesses: Number(r.paid_businesses),
    totalEvents: Number(r.total_events),
  };
}

/** Raw legacy flyer data-URL for the image route. */
export async function getLegacyFlyer(id: string): Promise<string | null> {
  const { rows } = await getPool().query("select flyer_data_url from events where id = $1", [id]);
  return (rows[0]?.flyer_data_url as string) || null;
}
