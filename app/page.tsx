import Link from "next/link";
import { Sparkles, Building, GraduationCap, CreditCard } from "lucide-react";
import { SearchHero } from "@/components/search-hero";
import { EventCard } from "@/components/event-card";
import { HomepageAd } from "@/components/homepage-ad";
import { OrgGrid } from "@/components/org-grid";
import { NineStripe } from "@/components/nine-stripe";
import { getEvents, getOrgEventCounts, getSchoolsWithEvents } from "@/lib/db";
import { getOrganizations } from "@/lib/orgs-db";
import { HBCUS } from "@/lib/hbcus";

export default async function HomePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [allEvents, orgs, counts, schools] = await Promise.all([
    getEvents(),
    getOrganizations(),
    getOrgEventCounts(),
    getSchoolsWithEvents(),
  ]);
  const upcoming = allEvents.filter((e) => !e.date || e.date >= today);
  const events = [...(upcoming.length ? upcoming : allEvents)]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  const schoolChips = schools.length
    ? schools.slice(0, 14).map((s) => ({ name: s.school, n: s.n }))
    : HBCUS.slice(0, 14).map((s) => ({ name: s.name, n: 0 }));

  return (
    <div>
      <NineStripe />
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,193,78,0.22),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(123,63,191,0.18),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(224,36,94,0.16),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-20 pt-16 text-center sm:pt-24">
          <HomepageAd />
          <span className="flex items-center gap-2 rounded-full border border-[#f2c14e]/40 bg-black/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#f2c14e]">
            <Sparkles className="h-3.5 w-3.5" /> The Movement Starts Here
          </span>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.05] text-white sm:text-7xl">
            <span className="bt-gradient-text">THE DIVINE NINE</span>
            <span className="mt-2 block text-3xl font-extrabold tracking-[0.35em] text-white sm:text-4xl">EVENTS</span>
          </h1>
          <p className="max-w-2xl text-lg text-gray-300">
            The national home for Divine Nine events — every campus, every HBCU, every chapter, every city.
            Find your next step show, homecoming, mixer, service day or convention.
          </p>
          <SearchHero />
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Link href="/events?hbcu=1" className="rounded-full border border-[#f2c14e]/40 px-4 py-1.5 text-gray-200 hover:bg-[#f2c14e]/10">
              HBCU events
            </Link>
            <Link href="/schools" className="rounded-full border border-[#f2c14e]/40 px-4 py-1.5 text-gray-200 hover:bg-[#f2c14e]/10">
              Browse by school
            </Link>
            <Link href="/events" className="rounded-full border border-[#f2c14e]/40 px-4 py-1.5 text-gray-200 hover:bg-[#f2c14e]/10">
              All events
            </Link>
          </div>
        </div>
      </section>

      <section id="divine-nine" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            Nine Organizations. <span className="bt-gradient-text">One Home.</span>
          </h2>
          <p className="mt-2 text-gray-400">
            The National Pan-Hellenic Council — pick an organization to see its events across the country.
          </p>
        </div>
        <OrgGrid orgs={orgs} counts={counts} />
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          <Link href="/events" className="text-sm font-semibold text-[#f2c14e] hover:underline">
            View all →
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="rounded-2xl bt-card p-10 text-center text-gray-400">
            No events posted yet — be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} orgs={orgs} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
              <GraduationCap className="h-6 w-6 text-[#f2c14e]" /> Every campus. Every HBCU.
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {HBCUS.length}+ HBCUs listed — and any college or university can host.
            </p>
          </div>
          <Link href="/schools" className="text-sm font-semibold text-[#f2c14e] hover:underline">
            All schools →
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {schoolChips.map((s) => (
            <Link
              key={s.name}
              href={`/events?school=${encodeURIComponent(s.name)}`}
              className="rounded-full bt-card px-4 py-2 text-sm text-gray-200 hover:text-[#f2c14e]"
            >
              {s.name}
              {s.n > 0 && <span className="ml-2 text-xs text-[#f2c14e]">{s.n}</span>}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[#f2c14e]/15 bg-gradient-to-r from-[#0c0906] to-[#050403] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <Feature
            icon={<Building className="h-6 w-6 text-[#f2c14e]" />}
            title="Hosting an Event?"
            desc="Chapters, alumni groups, campuses and promoters: join as an organizer to post your step shows, homecoming weekends, mixers and service events for the whole Divine Nine community."
          />
          <Feature
            icon={<CreditCard className="h-6 w-6 text-[#ef4444]" />}
            title="Sell Tickets & Check In"
            desc="Sell tickets right on your event page and check guests in at the door with their personal QR code."
          />
          <Feature
            icon={<GraduationCap className="h-6 w-6 text-[#cbd5e1]" />}
            title="Photos & Trailers"
            desc="Make your event pop with a flyer, a YouTube or Vimeo link, or an uploaded trailer."
          />
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/business/join"
            className="rounded-full bt-gold-btn px-8 py-3 font-bold shadow-lg shadow-[#f2c14e]/30"
          >
            Become an Organizer
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl bt-card p-6">
      <div className="mb-3">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
}
