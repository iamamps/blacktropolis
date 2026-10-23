"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { OrgLogo } from "@/components/org-logo";
import { ORGANIZATIONS, Organization } from "@/lib/organizations";
import { resizeImagePng, uploadBlob } from "@/lib/upload-client";

export default function AdminOrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>(ORGANIZATIONS);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/organizations");
    const data = await res.json();
    if (data.organizations) setOrgs(data.organizations);
  }, []);

  useEffect(() => {
    // gate: bounce to login if not admin
    fetch("/api/admin/events").then((r) => r.status === 401 && router.push("/admin/login"));
    load();
  }, [load, router]);

  const upload = async (slug: string, file: File) => {
    setBusy(slug);
    setError("");
    try {
      const png = await resizeImagePng(file, 600);
      const url = await uploadBlob(png, { purpose: "org-logo" });
      const res = await fetch(`/api/admin/organizations/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoUrl: url }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Could not save logo.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    }
    setBusy(null);
  };

  const reset = async (slug: string) => {
    setBusy(slug);
    await fetch(`/api/admin/organizations/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl: null }),
    });
    await load();
    setBusy(null);
  };

  return (
    <div>
      <AdminNav current="/admin/organizations" />
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <h1 className="mb-1 text-3xl font-black text-white">
          Organization <span className="bt-gradient-text">Logos</span>
        </h1>
        <p className="mb-6 text-sm text-gray-400">
          The crests below appear on the homepage, event cards and filters. Upload an official high-resolution
          version (PNG with a transparent background works best) to replace any of them.
        </p>
        {error && <p className="mb-4 text-sm text-[#ef4444]">{error}</p>}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {orgs.map((o) => (
            <div key={o.slug} className="flex flex-col items-center gap-3 rounded-2xl bt-card p-5 text-center">
              <OrgLogo org={o} size={96} />
              <p className="text-sm font-bold text-white">{o.short}</p>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[#f2c14e]/30 px-3 py-1.5 text-xs text-gray-200 hover:text-[#f2c14e]">
                {busy === o.slug ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload new logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  disabled={busy !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) upload(o.slug, f);
                    e.target.value = "";
                  }}
                />
              </label>
              {!o.logo.includes("/brand/orgs/") && (
                <button onClick={() => reset(o.slug)} className="text-xs text-gray-500 hover:text-[#f2c14e]">
                  Reset to default crest
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
