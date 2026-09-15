"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Map as MapIcon, LayoutGrid, Loader2 } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EventMapWrapper } from "@/components/event-map-wrapper";
import { CATEGORIES } from "@/lib/categories";
import { EventItem } from "@/types";

function EventsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<(EventItem & { distance?: number | null })[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    const res = await fetch(`/api/events?${params.toString()}`);
    const data = await res.json();
    setEvents(data.events || []);
    setCenter(data.center || null);
    setLoading(false);
  }, [location, category, search]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.replace(`/events?location=${encodeURIComponent(location)}`);
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-white">
        Discover Events <span className="bt-gradient-text">Near You</span>
      </h1>

      <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-full bt-card px-4 py-2.5">
          <MapPin className="h-4 w-4 text-[#f2c14e]" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or zip code"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full bt-card px-4 py-2.5">
          <Search className="h-4 w-4 text-[#ef4444]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none sm:w-40"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full bt-card px-4 py-2.5 text-white outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
          Search
        </button>
      </form>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">{events.length} events found</p>
        <div className="flex overflow-hidden rounded-full border border-[#f2c14e]/30">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1 px-4 py-1.5 text-sm ${
              view === "grid" ? "bg-[#f2c14e] text-black" : "text-gray-300"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            onClick={() => setView("map")}
            className={`flex items-center gap-1 px-4 py-1.5 text-sm ${
              view === "map" ? "bg-[#f2c14e] text-black" : "text-gray-300"
            }`}
          >
            <MapIcon className="h-3.5 w-3.5" /> Map
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#f2c14e]" />
        </div>
      ) : view === "grid" ? (
        events.length === 0 ? (
          <div className="rounded-2xl bt-card p-10 text-center text-gray-400">
            No events found for this search. Try a different city or category.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )
      ) : (
        <div className="h-[500px]">
          <EventMapWrapper events={events} center={center} />
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense>
      <EventsPageInner />
    </Suspense>
  );
}
