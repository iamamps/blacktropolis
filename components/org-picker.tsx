"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { ORGANIZATIONS, Organization } from "@/lib/organizations";
import { OrgLogo } from "@/components/org-logo";

interface OrgPickerProps {
  value: string[];
  onChange: (v: string[]) => void;
}

export function OrgPicker({ value, onChange }: OrgPickerProps) {
  const [orgs, setOrgs] = useState<Organization[]>(ORGANIZATIONS);

  useEffect(() => {
    fetch("/api/organizations")
      .then((r) => r.json())
      .then((d) => d.organizations && setOrgs(d.organizations))
      .catch(() => {});
  }, []);

  const toggle = (slug: string) =>
    onChange(value.includes(slug) ? value.filter((s) => s !== slug) : [...value, slug]);
  const allSelected = value.length === orgs.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          Which Divine Nine organizations is this event for? <span className="text-[#ef4444]">*</span>
        </p>
        <button
          type="button"
          onClick={() => onChange(allSelected ? [] : orgs.map((o) => o.slug))}
          className="text-xs font-semibold text-[#f2c14e] hover:underline"
        >
          {allSelected ? "Clear all" : "All nine"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {orgs.map((o) => {
          const on = value.includes(o.slug);
          return (
            <button
              key={o.slug}
              type="button"
              onClick={() => toggle(o.slug)}
              aria-pressed={on}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                on ? "border-[#f2c14e] bg-[#f2c14e]/10" : "border-white/10 bg-black/30 opacity-70 hover:opacity-100"
              }`}
            >
              {on && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f2c14e] text-black">
                  <Check className="h-3 w-3" />
                </span>
              )}
              <OrgLogo org={o} size={44} ring={false} />
              <span className="text-[11px] font-semibold leading-tight text-gray-200">{o.short}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
