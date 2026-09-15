"use client";

import { useEffect, useState } from "react";
import { Ticket as TicketIcon, Minus, Plus } from "lucide-react";
import { TicketType } from "@/types";

export function TicketPurchase({ eventId }: { eventId: string }) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${eventId}/ticket-types`)
      .then((r) => r.json())
      .then((data) => {
        setTicketTypes(data.ticketTypes || []);
        if (data.ticketTypes?.[0]) setSelectedId(data.ticketTypes[0].id);
      });
  }, [eventId]);

  if (ticketTypes.length === 0) return null;

  const selected = ticketTypes.find((t) => t.id === selectedId);
  const soldOut =
    selected?.quantityAvailable != null && selected.quantitySold >= selected.quantityAvailable;

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/tickets/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        ticketTypeId: selected.id,
        quantity,
        buyerName: name,
        buyerEmail: email,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not start checkout.");
      return;
    }
    window.location.href = data.url;
  };

  return (
    <div className="rounded-2xl bt-card p-6">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
        <TicketIcon className="h-5 w-5 text-[#f2c14e]" /> Get Tickets
      </h2>
      <form onSubmit={handleBuy} className="space-y-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-xl bt-card px-4 py-3 text-white outline-none"
        >
          {ticketTypes.map((t) => (
            <option key={t.id} value={t.id} disabled={t.quantityAvailable != null && t.quantitySold >= t.quantityAvailable}>
              {t.name} — ${(t.priceCents / 100).toFixed(2)}
              {t.quantityAvailable != null && t.quantitySold >= t.quantityAvailable ? " (Sold out)" : ""}
            </option>
          ))}
        </select>

        <div className="flex items-center justify-between rounded-xl bt-card px-4 py-3">
          <span className="text-sm text-gray-300">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="rounded-full border border-[#f2c14e]/40 p-1.5 text-[#f2c14e]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-white">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="rounded-full border border-[#f2c14e]/40 p-1.5 text-[#f2c14e]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <input
          required
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500"
        />
        <input
          required
          type="email"
          placeholder="Email (tickets sent here)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bt-card px-4 py-3 text-white outline-none placeholder-gray-500"
        />

        {error && <p className="text-sm text-[#ef4444]">{error}</p>}

        <button
          type="submit"
          disabled={loading || soldOut}
          className="w-full rounded-full bt-gold-btn py-3 font-bold disabled:opacity-60"
        >
          {soldOut
            ? "Sold Out"
            : loading
            ? "Redirecting to checkout…"
            : selected
            ? `Buy ${quantity} × ${selected.name} — $${((selected.priceCents * quantity) / 100).toFixed(2)}`
            : "Buy Tickets"}
        </button>
      </form>
    </div>
  );
}
