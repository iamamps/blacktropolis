"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash, Ticket as TicketIcon, ScanLine, ArrowLeft, CheckCircle2 } from "lucide-react";
import { TicketType, Ticket } from "@/types";

export default function ManageTicketsPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [form, setForm] = useState({ name: "", price: "", quantityAvailable: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [ttRes, tRes] = await Promise.all([
      fetch(`/api/events/${eventId}/ticket-types`),
      fetch(`/api/events/${eventId}/tickets`),
    ]);
    const ttData = await ttRes.json();
    setTicketTypes(ttData.ticketTypes || []);
    if (tRes.ok) {
      const tData = await tRes.json();
      setTickets(tData.tickets || []);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/events/${eventId}/ticket-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        quantityAvailable: form.quantityAvailable ? parseInt(form.quantityAvailable, 10) : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not create ticket type.");
      return;
    }
    setForm({ name: "", price: "", quantityAvailable: "" });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ticket type?")) return;
    await fetch(`/api/ticket-types/${id}`, { method: "DELETE" });
    load();
  };

  const checkedIn = tickets.filter((t) => t.status === "checked_in").length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#f2c14e]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">
          Manage <span className="bt-gradient-text">Tickets</span>
        </h1>
        <Link
          href={`/dashboard/events/${eventId}/checkin`}
          className="flex items-center gap-2 rounded-full bt-gold-btn px-5 py-2.5 text-sm font-bold"
        >
          <ScanLine className="h-4 w-4" /> Check-In Scanner
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Ticket Types" value={ticketTypes.length} />
        <StatCard label="Tickets Sold" value={tickets.reduce((s, t) => s + t.quantity, 0)} />
        <StatCard label="Checked In" value={checkedIn} icon={<CheckCircle2 className="h-4 w-4 text-[#f2c14e]" />} />
      </div>

      <div className="mb-8 rounded-2xl bt-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <TicketIcon className="h-5 w-5 text-[#f2c14e]" /> Ticket Types
        </h2>
        <form onSubmit={handleCreate} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <input
            required
            placeholder="Name (e.g. General Admission)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="rounded-xl bg-black/40 px-4 py-2.5 text-white outline-none sm:col-span-2"
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="Price ($)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className="rounded-xl bg-black/40 px-4 py-2.5 text-white outline-none"
          />
          <input
            type="number"
            min="1"
            placeholder="Qty (optional)"
            value={form.quantityAvailable}
            onChange={(e) => setForm((f) => ({ ...f, quantityAvailable: e.target.value }))}
            className="rounded-xl bg-black/40 px-4 py-2.5 text-white outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1 rounded-full bt-gold-btn px-4 py-2.5 text-sm font-bold sm:col-span-4"
          >
            <Plus className="h-4 w-4" /> Add Ticket Type
          </button>
        </form>
        {error && <p className="mb-3 text-sm text-[#ef4444]">{error}</p>}

        {ticketTypes.length === 0 ? (
          <p className="text-sm text-gray-500">No ticket types yet — add one above.</p>
        ) : (
          <div className="space-y-2">
            {ticketTypes.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl bg-black/30 p-3">
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">
                    ${(t.priceCents / 100).toFixed(2)} · {t.quantitySold} sold
                    {t.quantityAvailable != null ? ` / ${t.quantityAvailable}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-full border border-[#ef4444]/40 p-2 text-[#ef4444]"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bt-card p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Ticket Sales</h2>
        {tickets.length === 0 ? (
          <p className="text-sm text-gray-500">No tickets sold yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Buyer</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">Paid</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-t border-white/5">
                    <td className="py-2 font-mono text-[#f2c14e]">{t.code}</td>
                    <td className="py-2 text-gray-300">{t.buyerName || t.buyerEmail}</td>
                    <td className="py-2 text-gray-300">{t.quantity}</td>
                    <td className="py-2 text-gray-300">${(t.amountPaidCents / 100).toFixed(2)}</td>
                    <td className="py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          t.status === "checked_in"
                            ? "bg-[#f2c14e]/20 text-[#f2c14e]"
                            : t.status === "void"
                            ? "bg-[#ef4444]/20 text-[#ef4444]"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bt-card p-4 text-center">
      <div className="mb-1 flex items-center justify-center gap-1 text-2xl font-black text-white">
        {icon} {value}
      </div>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}
