import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getEvents } from "@/lib/db";
import { getOrganizations } from "@/lib/orgs-db";
import { OrgLogo } from "@/components/org-logo";
import { EventCard } from "@/components/event-card";
import { NineStripe } from "@/components/nine-stripe";

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const orgs = await getOrganizations();
  const org = orgs.find((o) => o.slug === slug);
  if (!org) notFound();
  const events = (await getEvents({ org: slug })).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const others = orgs.filter((o) => o.slug !== slug);

  return (
    <div>
      <NineStripe />
      <section className="relative overflow-hidden border-b border-[#f2c14e]/15">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse at top, ${org.accent}, transparent 65%)` }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <Link href="/#divine-nine" className="mb-2 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#f2c14e]">
            <ArrowLeft className="h-4 w-4" /> All nine organizations
          </Link>
          <OrgLogo org={org} size={140} />
          <h1 className="text-3xl font-black text-white sm:text-5xl">{org.name}</h1>
          <p className="text-gray-300">
            Founded {org.founded} at {org.foundedAt} · {org.colors}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-white">
            {org.short} events <span className="text-base font-normal text-gray-500">({events.length})</span>
          </h2>
          <Link href={`/events?org=${org.slug}`} className="text-sm font-semibold text-[#f2c14e] hover:underline">
            Search &amp; filter →
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="rounded-2xl bt-card p-10 text-center text-gray-400">
            No {org.short} events are posted yet. Hosting one? <Link href="/business/join" className="text-[#f2c14e] underline">Join as an organizer</Link> and post it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} orgs={orgs} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">The Divine Nine</p>
        <div className="flex flex-wrap justify-center gap-4">
          {others.map((o) => (
            <Link key={o.slug} href={`/organizations/${o.slug}`} title={o.name} className="transition hover:scale-110">
              <OrgLogo org={o} size={56} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
