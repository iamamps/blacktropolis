"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Map as MapIcon, LayoutGrid, Loader2, GraduationCap } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { EventMapWrapper } from "@/components/event-map-wrapper";
import { OrgLogo } from "@/components/org-logo";
import { CATEGORIES } from "@/lib/categories";
import { HBCUS } from "@/lib/hbcus";
import { ORGANIZATIONS, Organization } from "@/lib/organizations";
import { EventItem } from "@/types";

function EventsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [org, setOrg] = useState(searchParams.get("org") || "");
  const [school, setSchool] = useState(searchParams.get("school") || "");
  const [hbcu, setHbcu] = useState(searchParams.get("hbcu") === "1");
  const [orgs, setOrgs] = useState<Organization[]>(ORGANIZATIONS);
  const [events, setEvents] = useState<(EventItem & { distance?: number | null })[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (over?: { org?: string; hbcu?: boolean }) => {
      setLoading(true);
      const o = over?.org !== undefined ? over.org : org;
      const h = over?.hbcu !== undefined ? over.hbcu : hbcu;
      const params = new URLSearchParams();
      if (location) params.set("location", location);
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      if (o) params.set("org", o);
      if (school) params.set("school", school);
      if (h) params.set("hbcu", "1");
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.events || []);
      setCenter(data.center || null);
      setLoading(false);
    },
    [location, category, search, org, school, hbcu]
  );

  useEffect(() => {
    load();
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((d) => d.organizations && setOrgs(d.organizations))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const pickOrg = (slug: string) => {
    const next = org === slug ? "" : slug;
    setOrg(next);
    load({ org: next });
  };

  const activeOrg = orgs.find((o) => o.slug === org);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black text-white">
        Divine Nine <span className="bt-gradient-text">Events</span>
      </h1>
      <p className="mb-6 text-sm text-gray-400">
        {activeOrg ? `Showing ${activeOrg.name} events.` : "Filter by organization, school, HBCU, or find events near you."}
      </p>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <button
          type="button"
          onClick={() => pickOrg("")}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            !org ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
          }`}
        >
          All nine
        </button>
        {orgs.map((o) => (
          <button
            key={o.slug}
            type="button"
            onClick={() => pickOrg(o.slug)}
            className={`flex shrink-0 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-semibold ${
              org === o.slug ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
            }`}
          >
            <OrgLogo org={o} size={28} ring={false} /> {o.short}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2 rounded-full bt-card px-4 py-2.5">
          <MapPin className="h-4 w-4 text-[#f2c14e]" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or zip code"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2 rounded-full bt-card px-4 py-2.5">
          <GraduationCap className="h-4 w-4 text-[#f2c14e]" />
          <input
            list="school-list"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="School / campus"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
          />
          <datalist id="school-list">
            {HBCUS.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
        </div>
        <div className="flex items-center gap-2 rounded-full bt-card px-4 py-2.5">
          <Search className="h-4 w-4 text-[#ef4444]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events"
            className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
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
        <label className="flex items-center gap-2 px-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={hbcu}
            onChange={(e) => {
              setHbcu(e.target.checked);
              load({ hbcu: e.target.checked });
            }}
            className="h-4 w-4 accent-[#f2c14e]"
          />
          HBCU events only
        </label>
        <button type="submit" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold sm:col-span-2 lg:col-span-3">
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
            No events found for this search. Try another organization, school or city.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} orgs={orgs} />
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
