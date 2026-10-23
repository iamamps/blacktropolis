import Link from "next/link";
import type { Organization } from "@/lib/organizations";
import { OrgLogo } from "@/components/org-logo";

interface OrgGridProps {
  orgs: Organization[];
  counts: Record<string, number>;
}

function OrgTile({ org, count }: { org: Organization; count: number }) {
  return (
    <Link
      href={`/organizations/${org.slug}`}
      className="group relative flex w-[calc(50%-0.5rem)] flex-col items-center gap-3 rounded-2xl bt-card p-5 text-center transition hover:-translate-y-1 hover:bt-glow sm:w-[calc(33.333%-0.75rem)] lg:w-[calc(20%-0.8rem)]"
    >
      <span className="absolute left-3 top-3 text-xs font-black text-white/30">{String(org.number).padStart(2, "0")}</span>
      <span className="transition duration-300 group-hover:scale-105">
        <OrgLogo org={org} size={104} />
      </span>
      <div>
        <h3 className="text-sm font-bold leading-tight text-white sm:text-base">{org.short}</h3>
        <p className="mt-0.5 text-[11px] uppercase tracking-wider text-gray-500">
          {org.group === "fraternity" ? "Fraternity" : "Sorority"} · {org.founded}
        </p>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-semibold"
        style={{ backgroundColor: `${org.accent}22`, color: "#f5f3ef", border: `1px solid ${org.accent}66` }}
      >
        {count === 0 ? "Be the first to post" : `${count} upcoming ${count === 1 ? "event" : "events"}`}
      </span>
    </Link>
  );
}

export function OrgGrid({ orgs, counts }: OrgGridProps) {
  const frats = orgs.filter((o) => o.group === "fraternity");
  const sors = orgs.filter((o) => o.group === "sorority");
  return (
    <div className="space-y-10">
      <div>
        <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f2c14e]">
          Fraternities <span className="rounded-full bg-[#f2c14e]/15 px-2 py-0.5 text-xs">{frats.length}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#f2c14e]/40 to-transparent" />
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {frats.map((o) => (
            <OrgTile key={o.slug} org={o} count={counts[o.slug] || 0} />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.25em] text-[#f2c14e]">
          Sororities <span className="rounded-full bg-[#f2c14e]/15 px-2 py-0.5 text-xs">{sors.length}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-[#f2c14e]/40 to-transparent" />
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {sors.map((o) => (
            <OrgTile key={o.slug} org={o} count={counts[o.slug] || 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
