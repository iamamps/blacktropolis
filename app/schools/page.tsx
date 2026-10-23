import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { HBCUS } from "@/lib/hbcus";
import { getSchoolsWithEvents } from "@/lib/db";

export const metadata = {
  title: "Schools & HBCUs — The Divine Nine Events",
  description: "Browse Divine Nine events by college, university and HBCU.",
};

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AR: "Arkansas", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia",
  KY: "Kentucky", LA: "Louisiana", MD: "Maryland", MS: "Mississippi", MO: "Missouri", NC: "North Carolina",
  OH: "Ohio", OK: "Oklahoma", PA: "Pennsylvania", SC: "South Carolina", TN: "Tennessee", TX: "Texas",
  VA: "Virginia", VI: "U.S. Virgin Islands", WV: "West Virginia",
};

export default async function SchoolsPage() {
  const withEvents = await getSchoolsWithEvents();
  const counts = new Map(withEvents.map((s) => [s.school.toLowerCase(), s.n]));
  const hbcuNames = new Set(HBCUS.map((s) => s.name.toLowerCase()));
  const otherCampuses = withEvents.filter((s) => !hbcuNames.has(s.school.toLowerCase()));

  const byState = new Map<string, typeof HBCUS>();
  for (const s of HBCUS) byState.set(s.state, [...(byState.get(s.state) || []), s]);
  const states = [...byState.keys()].sort((a, b) => (STATE_NAMES[a] || a).localeCompare(STATE_NAMES[b] || b));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-2 flex items-center gap-3 text-3xl font-black text-white sm:text-4xl">
        <GraduationCap className="h-8 w-8 text-[#f2c14e]" />
        Schools <span className="bt-gradient-text">&amp; HBCUs</span>
      </h1>
      <p className="mb-8 max-w-2xl text-gray-400">
        Every campus with a Divine Nine presence can host events here. Pick a school to see what’s happening, or{" "}
        <Link href="/events?hbcu=1" className="text-[#f2c14e] underline">see all HBCU events</Link>.
      </p>

      {otherCampuses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f2c14e]">Other campuses with events</h2>
          <div className="flex flex-wrap gap-2">
            {otherCampuses.map((s) => (
              <SchoolChip key={s.school} name={s.school} n={s.n} />
            ))}
          </div>
        </section>
      )}

      <div className="space-y-8">
        {states.map((st) => (
          <section key={st}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#f2c14e]">{STATE_NAMES[st] || st}</h2>
            <div className="flex flex-wrap gap-2">
              {byState.get(st)!.map((s) => (
                <SchoolChip key={s.name} name={s.name} n={counts.get(s.name.toLowerCase()) || 0} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SchoolChip({ name, n }: { name: string; n: number }) {
  return (
    <Link
      href={`/events?school=${encodeURIComponent(name)}`}
      className={`rounded-full bt-card px-4 py-2 text-sm hover:text-[#f2c14e] ${n > 0 ? "text-white" : "text-gray-400"}`}
    >
      {name}
      {n > 0 && <span className="ml-2 rounded-full bg-[#f2c14e]/20 px-2 py-0.5 text-xs text-[#f2c14e]">{n}</span>}
    </Link>
  );
}
