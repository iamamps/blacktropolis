import { Pool } from "pg";
import { Member, EventItem } from "@/types";

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

export async function getEvents(): Promise<EventItem[]> {
  const { rows } = await getPool().query("select * from events order by date asc");
  return rows.map(rowToEvent);
}

export async function getEventById(id: string): Promise<EventItem | undefined> {
  const { rows } = await getPool().query("select * from events where id = $1 limit 1", [id]);
  return rows[0] ? rowToEvent(rows[0]) : undefined;
}

export async function addEvent(event: EventItem): Promise<EventItem> {
  await getPool().query(
    `insert into events
      (id, business_id, business_name, title, description, category, date, time, venue_name, address, city, state, zip, lat, lng, flyer_data_url, ticket_link, price, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
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
    ]
  );
  return event;
}

export async function updateEvent(id: string, patch: Partial<EventItem>): Promise<EventItem | null> {
  const existing = await getEventById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  await getPool().query(
    `update events set title=$2, description=$3, category=$4, date=$5, time=$6, venue_name=$7, address=$8, city=$9, state=$10, zip=$11, lat=$12, lng=$13, flyer_data_url=$14, ticket_link=$15, price=$16
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
