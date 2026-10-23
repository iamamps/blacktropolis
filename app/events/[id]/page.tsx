import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Ticket, ArrowLeft, GraduationCap } from "lucide-react";
import { getEventById } from "@/lib/db";
import { getOrganizations } from "@/lib/orgs-db";
import { isAdminAuthed } from "@/lib/admin-auth";
import { getSession } from "@/lib/auth";
import { EventMapWrapper } from "@/components/event-map-wrapper";
import { TicketPurchase } from "@/components/ticket-purchase";
import { EventMedia } from "@/components/event-media";
import { OrgLogo } from "@/components/org-logo";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  if (event.isHidden) {
    const session = await getSession();
    if (!(await isAdminAuthed()) && session?.id !== event.businessId) notFound();
  }
  const allOrgs = await getOrganizations();
  const eventOrgs = event.organizations
    .map((slug) => allOrgs.find((o) => o.slug === slug))
    .filter((o): o is NonNullable<typeof o> => !!o);

  const dateLabel = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    event.address ? `${event.address}, ${event.city}, ${event.state} ${event.zip}` : `${event.city}, ${event.state} ${event.zip}`
  )}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/events" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#f2c14e]">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <div className="overflow-hidden rounded-2xl bt-card">
        <div className="bg-black/50 p-3 sm:p-4">
          <EventMedia
            media={{ ...event, flyerDataUrl: event.flyerDataUrl ? `/api/events/${event.id}/flyer` : null }}
            title={event.title}
            mode="detail"
          />
        </div>

        <div className="space-y-6 p-6">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-[#f2c14e]/15 px-3 py-1 text-xs font-semibold text-[#f2c14e]">
                {event.category}
              </span>
              {event.isHbcu && (
                <span className="inline-block rounded-full bg-[#7b3fbf]/25 px-3 py-1 text-xs font-semibold text-purple-200">
                  HBCU
                </span>
              )}
              {event.isHidden && (
                <span className="inline-block rounded-full bg-[#ef4444]/20 px-3 py-1 text-xs font-semibold text-[#ef4444]">
                  Hidden from public
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black text-white">{event.title}</h1>
            <p className="mt-1 text-gray-400">Hosted by {event.businessName}</p>
          </div>

          {eventOrgs.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {eventOrgs.map((o) => (
                <Link
                  key={o.slug}
                  href={`/organizations/${o.slug}`}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-gray-100 hover:border-[#f2c14e]"
                >
                  <OrgLogo org={o} size={32} ring={false} /> {o.short}
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={<Calendar className="h-5 w-5 text-[#f2c14e]" />} label="Date" value={dateLabel} />
            <InfoRow icon={<Clock className="h-5 w-5 text-[#ef4444]" />} label="Time" value={event.time || "TBA"} />
            <InfoRow
              icon={<MapPin className="h-5 w-5 text-[#cbd5e1]" />}
              label="Location"
              value={`${event.venueName ? event.venueName + " — " : ""}${event.address ? event.address + ", " : ""}${event.city}, ${event.state} ${event.zip}`}
            />
            {event.price && (
              <InfoRow icon={<Ticket className="h-5 w-5 text-[#f2c14e]" />} label="Price" value={event.price} />
            )}
            {(event.school || event.chapter) && (
              <InfoRow
                icon={<GraduationCap className="h-5 w-5 text-[#f2c14e]" />}
                label="Campus / Chapter"
                value={[event.school, event.chapter].filter(Boolean).join(" · ")}
              />
            )}
          </div>

          {event.description && (
            <div>
              <h2 className="mb-2 text-lg font-bold text-white">About this event</h2>
              <p className="whitespace-pre-line text-gray-300">{event.description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bt-gold-btn px-6 py-2.5 font-bold"
            >
              Get Directions
            </a>
            {event.ticketLink && (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#f2c14e]/40 px-6 py-2.5 font-bold text-white hover:bg-[#f2c14e]/10"
              >
                External Ticket Link
              </a>
            )}
          </div>

          <TicketPurchase eventId={event.id} />

          {event.lat != null && event.lng != null && (
            <div className="h-72">
              <EventMapWrapper events={[event]} center={{ lat: event.lat, lng: event.lng }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-sm text-gray-200">{value}</p>
      </div>
    </div>
  );
}
