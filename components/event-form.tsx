"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { EventItem } from "@/types";

interface EventFormProps {
  eventId?: string;
  initial?: Partial<EventItem>;
}

export function EventForm({ eventId, initial }: EventFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || CATEGORIES[0],
    date: initial?.date || "",
    time: initial?.time || "",
    venueName: initial?.venueName || "",
    address: initial?.address || "",
    city: initial?.city || "",
    state: initial?.state || "",
    zip: initial?.zip || "",
    ticketLink: initial?.ticketLink || "",
    price: initial?.price || "",
  });
  const [flyerDataUrl, setFlyerDataUrl] = useState<string | null>(
    initial?.flyerDataUrl || null
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setFlyerDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = { ...form, flyerDataUrl };
    const res = await fetch(eventId ? `/api/events/${eventId}` : "/api/events", {
      method: eventId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  };

  const inputClass =
    "w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        placeholder="Event Title"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
        className={inputClass}
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
        rows={4}
        className={inputClass}
      />
      <select
        value={form.category}
        onChange={(e) => update("category", e.target.value)}
        className={inputClass}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          required
          type="date"
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
          className={inputClass}
        />
        <input
          type="time"
          value={form.time}
          onChange={(e) => update("time", e.target.value)}
          className={inputClass}
        />
      </div>

      <input
        placeholder="Venue Name"
        value={form.venueName}
        onChange={(e) => update("venueName", e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="Street Address"
        value={form.address}
        onChange={(e) => update("address", e.target.value)}
        className={inputClass}
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          required
          placeholder="City"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="State"
          value={form.state}
          onChange={(e) => update("state", e.target.value)}
          className={inputClass}
        />
        <input
          required
          placeholder="Zip Code"
          value={form.zip}
          onChange={(e) => update("zip", e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          placeholder="Price (e.g. $20 or Free)"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Ticket Link (optional)"
          value={form.ticketLink}
          onChange={(e) => update("ticketLink", e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 flex cursor-pointer items-center gap-2 rounded-xl bt-card px-4 py-3 text-gray-300 hover:text-[#f2c14e]">
          <Upload className="h-4 w-4" />
          {flyerDataUrl ? "Change flyer image" : "Upload event flyer"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
        {flyerDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flyerDataUrl} alt="Flyer preview" className="h-48 w-full rounded-xl object-cover" />
        )}
      </div>

      {error && <p className="text-sm text-[#ef4444]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
      >
        {loading ? "Saving…" : eventId ? "Save Changes" : "Post Event"}
      </button>
    </form>
  );
}
