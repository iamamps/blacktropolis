import Link from "next/link";
import { Calendar, MapPin, Tag, GraduationCap } from "lucide-react";
import { EventItem } from "@/types";
import { ORGANIZATIONS } from "@/lib/organizations";
import type { Organization } from "@/lib/organizations";
import { EventMedia } from "@/components/event-media";
import { OrgLogo } from "@/components/org-logo";

interface EventCardProps {
  event: EventItem & { distance?: number | null };
  /** organizations with any admin logo overrides applied (falls back to built-in crests) */
  orgs?: Organization[];
}

export function EventCard({ event, orgs = ORGANIZATIONS }: EventCardProps) {
  const dateLabel = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const eventOrgs = (event.organizations || [])
    .map((slug) => orgs.find((o) => o.slug === slug))
    .filter((o): o is Organization => !!o);
  const shown = eventOrgs.slice(0, 4);
  const extra = eventOrgs.length - shown.length;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl bt-card transition hover:bt-glow hover:-translate-y-1"
    >
      <div className="relative">
        <div className="transition duration-300 group-hover:brightness-110">
          <EventMedia media={event} title={event.title} mode="card" />
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-[#f2c14e]">
          {event.category}
        </div>
        {typeof event.distance === "number" && (
          <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
            {event.distance.toFixed(1)} mi
          </div>
        )}
        {shown.length > 0 && (
          <div className="absolute bottom-2 left-3 flex items-center">
            {shown.map((o, i) => (
              <span key={o.slug} className={i > 0 ? "-ml-2" : ""}>
                <OrgLogo org={o} size={30} />
              </span>
            ))}
            {extra > 0 && (
              <span className="-ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-black/80 text-[11px] font-bold text-[#f2c14e] ring-2 ring-[#f2c14e]">
                +{extra}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-white">{event.title}</h3>
        <p className="line-clamp-1 text-sm text-gray-400">{event.businessName}</p>
        {event.school && (
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <GraduationCap className="h-3.5 w-3.5 text-[#f2c14e]" />
            <span className="line-clamp-1">{event.school}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-300">
          <Calendar className="h-3.5 w-3.5 text-[#f2c14e]" />
          {dateLabel} {event.time && `· ${event.time}`}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-300">
          <MapPin className="h-3.5 w-3.5 text-[#ef4444]" />
          {event.city}
          {event.state ? `, ${event.state}` : ""}
        </div>
        {event.price && (
          <div className="flex items-center gap-1 text-xs font-semibold text-[#f2c14e]">
            <Tag className="h-3.5 w-3.5" /> {event.price}
          </div>
        )}
      </div>
    </Link>
  );
}
