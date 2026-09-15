"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash, CheckCircle2, Star } from "lucide-react";

interface SiteAd {
  id: string;
  title: string | null;
  imageDataUrl: string;
  linkUrl: string | null;
  active: boolean;
  createdAt: string;
}

export default function AdminAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ads");
    if (res.status === 401) {
      setUnauthorized(true);
      return;
    }
    const data = await res.json();
    setAds(data.ads || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (unauthorized) {
    router.push("/admin/login");
    return null;
  }

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUrl) {
      setError("Please choose an image.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, linkUrl, imageDataUrl }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not upload ad.");
      return;
    }
    setTitle("");
    setLinkUrl("");
    setImageDataUrl("");
    load();
  };

  const handleActivate = async (id: string) => {
    await fetch(`/api/admin/ads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await fetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-white">
        Homepage <span className="bt-gradient-text">Ad</span>
      </h1>
      <p className="mb-6 text-sm text-gray-400">
        Upload one or more ad images, then select which one is live above the "The Movement
        Starts Here" tagline on your homepage.
      </p>

      <form onSubmit={handleUpload} className="mb-8 space-y-3 rounded-2xl bt-card p-6">
        <input
          placeholder="Ad title (internal label, optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl bg-black/40 px-4 py-2.5 text-white outline-none"
        />
        <input
          placeholder="Click-through link (optional, e.g. https://...)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          className="w-full rounded-xl bg-black/40 px-4 py-2.5 text-white outline-none"
        />
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-black/40 px-4 py-3 text-gray-300 hover:text-[#f2c14e]">
          <Upload className="h-4 w-4" />
          {imageDataUrl ? "Change image" : "Upload ad image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        {imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageDataUrl} alt="Preview" className="h-32 w-full rounded-xl object-cover" />
        )}
        {error && <p className="text-sm text-[#ef4444]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bt-gold-btn py-2.5 text-sm font-bold disabled:opacity-60"
        >
          {loading ? "Uploading…" : "Add Ad"}
        </button>
      </form>

      <div className="space-y-4">
        {ads.length === 0 ? (
          <p className="text-sm text-gray-500">No ads uploaded yet.</p>
        ) : (
          ads.map((ad) => (
            <div key={ad.id} className="flex items-center gap-4 rounded-2xl bt-card p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.imageDataUrl} alt={ad.title || "Ad"} className="h-16 w-28 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-semibold text-white">{ad.title || "Untitled ad"}</p>
                {ad.linkUrl && <p className="text-xs text-gray-500">{ad.linkUrl}</p>}
                {ad.active && (
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-[#f2c14e]">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live on homepage
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!ad.active && (
                  <button
                    onClick={() => handleActivate(ad.id)}
                    className="flex items-center gap-1 rounded-full border border-[#f2c14e]/40 px-3 py-2 text-xs font-bold text-[#f2c14e]"
                  >
                    <Star className="h-3.5 w-3.5" /> Make Live
                  </button>
                )}
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="rounded-full border border-[#ef4444]/40 p-2 text-[#ef4444]"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
