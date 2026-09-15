"use client";

import dynamic from "next/dynamic";
import { EventItem } from "@/types";

const EventMap = dynamic(() => import("@/components/event-map").then((m) => m.EventMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-[#f2c14e]/30 bg-black/40 text-sm text-gray-500">
      Loading map…
    </div>
  ),
});

export function EventMapWrapper(props: {
  events: EventItem[];
  center?: { lat: number; lng: number } | null;
}) {
  return <EventMap {...props} />;
}
