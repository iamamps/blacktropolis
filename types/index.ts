export type Role = "resident" | "business";
export type Tier = "free" | "paid";

export interface Member {
  id: string;
  role: Role;
  name: string;
  businessName?: string;
  email: string;
  passwordHash: string;
  city: string;
  state: string;
  zip: string;
  category?: string;
  membershipTier: Tier;
  membershipStatus: "active" | "pending";
  membershipId: string;
  memberSince: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  resetToken?: string | null;
  resetTokenExpires?: string | null;
}

export type MediaType = "image" | "video_url" | "video_upload";
export type MediaAspect = "original" | "16:9" | "4:5" | "1:1" | "9:16";
export type MediaFit = "cover" | "contain";
export type MediaSize = "sm" | "md" | "lg" | "full";

export interface EventMediaSettings {
  mediaType: MediaType;
  mediaUrl: string | null;
  posterUrl: string | null;
  mediaAspect: MediaAspect;
  mediaFit: MediaFit;
  mediaZoom: number;
  mediaX: number;
  mediaY: number;
  mediaSize: MediaSize;
}

export interface EventItem extends EventMediaSettings {
  id: string;
  organizations: string[];
  school: string;
  isHbcu: boolean;
  chapter: string;
  isHidden: boolean;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  flyerDataUrl: string | null;
  ticketLink: string;
  price: string;
  createdAt: string;
}

export interface TicketType {
  id: string;
  eventId: string;
  businessId: string;
  name: string;
  priceCents: number;
  quantityAvailable: number | null;
  quantitySold: number;
  createdAt: string;
}

export type TicketStatus = "valid" | "checked_in" | "void";

export interface Ticket {
  id: string;
  code: string;
  eventId: string;
  ticketTypeId: string;
  businessId: string;
  buyerName: string | null;
  buyerEmail: string | null;
  quantity: number;
  amountPaidCents: number;
  status: TicketStatus;
  stripeSessionId: string | null;
  purchasedAt: string;
  checkedInAt: string | null;
}

export interface SessionPayload {
  id: string;
  role: Role;
}
