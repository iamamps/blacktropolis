"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { EventMedia } from "@/components/event-media";
import { MediaEditor } from "@/components/media-editor";
import { OrgPicker } from "@/components/org-picker";
import { OrgLogo } from "@/components/org-logo";
import { SchoolFields } from "@/components/school-fields";
import { ORGANIZATIONS } from "@/lib/organizations";
import { EventItem, EventMediaSettings } from "@/types";

type AdminEvent = EventItem;
type Filter = "all" | "untagged" | "hidden";

const inputClass = "w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500";

export default function AdminEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setEvents(data.events || []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleHidden = async (e: AdminEvent) => {
    await fetch(`/api/admin/events/${e.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isHidden: !e.isHidden }),
    });
    load();
  };

  const shown = events.filter((e) =>
    filter === "untagged" ? e.organizations.length === 0 : filter === "hidden" ? e.isHidden : true
  );
  const untagged = events.filter((e) => e.organizations.length === 0).length;

  return (
    <div>
      <AdminNav current="/admin/events" />
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <h1 className="mb-1 text-3xl font-black text-white">
          Manage <span className="bt-gradient-text">Events</span>
        </h1>
        <p className="mb-5 text-sm text-gray-400">
          Tag events with their Divine Nine organizations and school, resize or re-crop photos, set video size and
          framing, or hide an event from the public site. Nothing here deletes an event.
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {([
            ["all", `All (${events.length})`],
            ["untagged", `Needs organization tag (${untagged})`],
            ["hidden", `Hidden (${events.filter((e) => e.isHidden).length})`],
          ] as [Filter, string][]).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                filter === f ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-[#f2c14e]" />
          </div>
        ) : shown.length === 0 ? (
          <div className="rounded-2xl bt-card p-10 text-center text-gray-400">Nothing in this view.</div>
        ) : (
          <div className="space-y-4">
            {shown.map((e) => (
              <div key={e.id} className={`rounded-2xl bt-card p-4 ${e.isHidden ? "opacity-60" : ""}`}>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                    <EventMedia media={e} title={e.title} mode="card" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/events/${e.id}`} className="truncate text-lg font-bold text-white hover:text-[#f2c14e]">
                        {e.title}
                      </Link>
                      {e.isHidden && <span className="rounded-full bg-[#ef4444]/20 px-2 py-0.5 text-xs text-[#ef4444]">Hidden</span>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {e.date} · {e.city}, {e.state} · {e.businessName}
                      {e.school && ` · ${e.school}`}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {e.organizations.length === 0 ? (
                        <span className="rounded-full bg-[#f2c14e]/15 px-2.5 py-0.5 text-xs text-[#f2c14e]">No organization tagged yet</span>
                      ) : (
                        e.organizations.map((slug) => {
                          const o = ORGANIZATIONS.find((x) => x.slug === slug);
                          return o ? <OrgLogo key={slug} org={o} size={28} /> : null;
                        })
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => setEditingId(editingId === e.id ? null : e.id)}
                        className="flex items-center gap-1.5 rounded-full bt-gold-btn px-4 py-1.5 text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5" /> {editingId === e.id ? "Close" : "Edit tags & media"}
                      </button>
                      <button
                        onClick={() => toggleHidden(e)}
                        className="flex items-center gap-1.5 rounded-full border border-[#f2c14e]/30 px-4 py-1.5 text-sm text-gray-300"
                      >
                        {e.isHidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        {e.isHidden ? "Show on site" : "Hide from site"}
                      </button>
                    </div>
                  </div>
                </div>
                {editingId === e.id && (
                  <EditPanel
                    eventId={e.id}
                    onSaved={() => {
                      setEditingId(null);
                      load();
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditPanel({ eventId, onSaved }: { eventId: string; onSaved: () => void }) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [d9, setD9] = useState({ school: "", chapter: "", isHbcu: false });
  const [media, setMedia] = useState<EventMediaSettings | null>(null);
  const [legacy, setLegacy] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then((r) => r.json())
      .then((d) => {
        const ev: EventItem = d.event;
        setEvent(ev);
        setOrgs(ev.organizations);
        setD9({ school: ev.school, chapter: ev.chapter, isHbcu: ev.isHbcu });
        setLegacy(ev.flyerDataUrl);
        setMedia({
          mediaType: ev.mediaType,
          mediaUrl: ev.mediaUrl,
          posterUrl: ev.posterUrl,
          mediaAspect: ev.mediaAspect,
          mediaFit: ev.mediaFit,
          mediaZoom: ev.mediaZoom,
          mediaX: ev.mediaX,
          mediaY: ev.mediaY,
          mediaSize: ev.mediaSize,
        });
      });
  }, [eventId]);

  const save = async () => {
    if (!media) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/admin/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizations: orgs, ...d9, ...media }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setError(data.error || "Could not save.");
    onSaved();
  };

  if (!event || !media) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#f2c14e]" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-5 border-t border-[#f2c14e]/15 pt-5">
      <OrgPicker value={orgs} onChange={setOrgs} />
      <SchoolFields
        school={d9.school}
        chapter={d9.chapter}
        isHbcu={d9.isHbcu}
        inputClass={inputClass}
        onChange={(p) => setD9((d) => ({ ...d, ...p }))}
      />
      <div>
        <p className="mb-2 text-sm font-semibold text-white">Photo / video</p>
        <MediaEditor value={media} onChange={setMedia} legacyImage={legacy} onClearLegacy={() => setLegacy(null)} />
      </div>
      {error && <p className="text-sm text-[#ef4444]">{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="rounded-full bt-gold-btn px-8 py-2.5 font-bold disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}
