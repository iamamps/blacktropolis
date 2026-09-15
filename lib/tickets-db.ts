import { Pool } from "pg";
import { TicketType, Ticket } from "@/types";

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

function rowToTicketType(row: Record<string, unknown>): TicketType {
  return {
    id: row.id as string,
    eventId: row.event_id as string,
    businessId: row.business_id as string,
    name: row.name as string,
    priceCents: Number(row.price_cents),
    quantityAvailable: row.quantity_available != null ? Number(row.quantity_available) : null,
    quantitySold: Number(row.quantity_sold),
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function rowToTicket(row: Record<string, unknown>): Ticket {
  return {
    id: row.id as string,
    code: row.code as string,
    eventId: row.event_id as string,
    ticketTypeId: row.ticket_type_id as string,
    businessId: row.business_id as string,
    buyerName: (row.buyer_name as string) || null,
    buyerEmail: (row.buyer_email as string) || null,
    quantity: Number(row.quantity),
    amountPaidCents: Number(row.amount_paid_cents),
    status: row.status as Ticket["status"],
    stripeSessionId: (row.stripe_session_id as string) || null,
    purchasedAt: new Date(row.purchased_at as string).toISOString(),
    checkedInAt: row.checked_in_at ? new Date(row.checked_in_at as string).toISOString() : null,
  };
}

export async function getTicketTypesForEvent(eventId: string): Promise<TicketType[]> {
  const { rows } = await getPool().query(
    "select * from ticket_types where event_id = $1 order by created_at asc",
    [eventId]
  );
  return rows.map(rowToTicketType);
}

export async function getTicketTypeById(id: string): Promise<TicketType | undefined> {
  const { rows } = await getPool().query("select * from ticket_types where id = $1", [id]);
  return rows[0] ? rowToTicketType(rows[0]) : undefined;
}

export async function addTicketType(t: TicketType): Promise<TicketType> {
  await getPool().query(
    `insert into ticket_types (id, event_id, business_id, name, price_cents, quantity_available, quantity_sold, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [t.id, t.eventId, t.businessId, t.name, t.priceCents, t.quantityAvailable, t.quantitySold, t.createdAt]
  );
  return t;
}

export async function updateTicketType(id: string, patch: Partial<TicketType>): Promise<TicketType | null> {
  const existing = await getTicketTypeById(id);
  if (!existing) return null;
  const merged = { ...existing, ...patch };
  await getPool().query(
    `update ticket_types set name=$2, price_cents=$3, quantity_available=$4, quantity_sold=$5 where id=$1`,
    [id, merged.name, merged.priceCents, merged.quantityAvailable, merged.quantitySold]
  );
  return merged;
}

export async function deleteTicketType(id: string): Promise<boolean> {
  const result = await getPool().query("delete from ticket_types where id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function incrementTicketTypeSold(id: string, by: number): Promise<void> {
  await getPool().query("update ticket_types set quantity_sold = quantity_sold + $2 where id = $1", [id, by]);
}

export async function getTicketsForEvent(eventId: string): Promise<Ticket[]> {
  const { rows } = await getPool().query(
    "select * from tickets where event_id = $1 order by purchased_at desc",
    [eventId]
  );
  return rows.map(rowToTicket);
}

export async function getTicketByCode(code: string): Promise<Ticket | undefined> {
  const { rows } = await getPool().query("select * from tickets where code = $1", [code]);
  return rows[0] ? rowToTicket(rows[0]) : undefined;
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const { rows } = await getPool().query("select * from tickets where id = $1", [id]);
  return rows[0] ? rowToTicket(rows[0]) : undefined;
}

export async function addTicket(t: Ticket): Promise<Ticket> {
  await getPool().query(
    `insert into tickets (id, code, event_id, ticket_type_id, business_id, buyer_name, buyer_email, quantity, amount_paid_cents, status, stripe_session_id, purchased_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      t.id,
      t.code,
      t.eventId,
      t.ticketTypeId,
      t.businessId,
      t.buyerName,
      t.buyerEmail,
      t.quantity,
      t.amountPaidCents,
      t.status,
      t.stripeSessionId,
      t.purchasedAt,
    ]
  );
  return t;
}

export async function checkInTicket(code: string): Promise<{ ok: boolean; ticket?: Ticket; error?: string }> {
  const ticket = await getTicketByCode(code);
  if (!ticket) return { ok: false, error: "Ticket not found." };
  if (ticket.status === "checked_in") {
    return { ok: false, ticket, error: "Ticket already checked in." };
  }
  if (ticket.status === "void") {
    return { ok: false, ticket, error: "Ticket has been voided." };
  }
  const now = new Date().toISOString();
  await getPool().query("update tickets set status = 'checked_in', checked_in_at = $2 where code = $1", [
    code,
    now,
  ]);
  return { ok: true, ticket: { ...ticket, status: "checked_in", checkedInAt: now } };
}

export async function getTicketsByStripeSession(sessionId: string): Promise<Ticket[]> {
  const { rows } = await getPool().query("select * from tickets where stripe_session_id = $1", [sessionId]);
  return rows.map(rowToTicket);
}
