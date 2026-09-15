import Link from "next/link";
import { Sparkles, Building, ShieldCheck, CreditCard } from "lucide-react";
import { SearchHero } from "@/components/search-hero";
import { EventCard } from "@/components/event-card";
import { HomepageAd } from "@/components/homepage-ad";
import { getEvents } from "@/lib/db";

export default async function HomePage() {
  const allEvents = await getEvents();
  const events = [...allEvents]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://galaxy-prod.tlcdn.com/gen/user_3AtwgxFvtLkpV5zEQvEMiQZZu89/34f81319-3bfe-4da7-b075-823ceadf87eb.png"
            alt="Blacktropolis vibrant city nightlife"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-[#050403]" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-20 pt-24 text-center sm:pt-32">
          <HomepageAd />
          <span className="flex items-center gap-2 rounded-full border border-[#f2c14e]/40 bg-black/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#f2c14e]">
            <Sparkles className="h-3.5 w-3.5" /> The Movement Starts Here
          </span>
          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Find the hottest <span className="bt-gradient-text">parties &amp; events</span> in
            your city
          </h1>
          <p className="max-w-xl text-gray-300">
            Blacktropolis connects you to nightlife, culture, and community — search by city or
            zip code and see what's happening near you tonight.
          </p>
          <SearchHero />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
          <Link href="/events" className="text-sm font-semibold text-[#f2c14e] hover:underline">
            View all →
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="rounded-2xl bt-card p-10 text-center text-gray-400">
            No events posted yet — be the first business to join and post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-[#f2c14e]/15 bg-gradient-to-r from-[#0c0906] to-[#050403] py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
          <Feature
            icon={<Building className="h-6 w-6 text-[#f2c14e]" />}
            title="Own a Business?"
            desc="Join the Blacktropolis Network as a paid member to post your events, parties, and promotions to thousands of local residents."
          />
          <Feature
            icon={<CreditCard className="h-6 w-6 text-[#ef4444]" />}
            title="Digital Member ID"
            desc="Every member — resident or business — gets a digital Blacktropolis ID card to show their status in the network."
          />
          <Feature
            icon={<ShieldCheck className="h-6 w-6 text-[#cbd5e1]" />}
            title="Verified Network"
            desc="Businesses are vetted through our paid membership program, keeping the event feed authentic and active."
          />
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/business/join"
            className="rounded-full bt-gold-btn px-8 py-3 font-bold shadow-lg shadow-[#f2c14e]/30"
          >
            Join the Business Network
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
