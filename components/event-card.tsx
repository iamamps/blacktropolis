import Link from "next/link";
import { Calendar, MapPin, Tag } from "lucide-react";
import { EventItem } from "@/types";

interface EventCardProps {
  event: EventItem & { distance?: number | null };
}

export function EventCard({ event }: EventCardProps) {
  const dateLabel = event.date
    ? new Date(event.date + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block overflow-hidden rounded-2xl bt-card transition hover:bt-glow hover:-translate-y-1"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#cbd5e1]/20 to-[#f2c14e]/20">
        {event.flyerDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.flyerDataUrl}
            alt={event.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-4xl font-black text-white/20">BT</span>
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-[#f2c14e]">
          {event.category}
        </div>
        {typeof event.distance === "number" && (
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
            {event.distance.toFixed(1)} mi
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-white">{event.title}</h3>
        <p className="line-clamp-1 text-sm text-gray-400">{event.businessName}</p>
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
