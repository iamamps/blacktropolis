"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Ticket } from "@/types";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const params = useParams();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [qrByCode, setQrByCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setError("Missing checkout session.");
      setLoading(false);
      return;
    }
    fetch(`/api/tickets/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Could not confirm your tickets.");
          return;
        }
        setTickets(data.tickets || []);
        const qrEntries = await Promise.all(
          (data.tickets || []).map(async (t: Ticket) => {
            const r = await fetch(`/api/tickets/qrcode?code=${encodeURIComponent(t.code)}`);
            const qd = await r.json();
            return [t.code, qd.dataUrl] as const;
          })
        );
        setQrByCode(Object.fromEntries(qrEntries));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f2c14e]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-4 text-[#ef4444]">{error}</p>
        <Link href={`/events/${params.id}`} className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
          Back to Event
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto mb-3 h-12 w-12 text-[#f2c14e]" />
        <h1 className="text-3xl font-black text-white">You're In!</h1>
        <p className="mt-2 text-gray-400">
          Your ticket has been confirmed. Show the QR code below at the door.
        </p>
      </div>

      <div className="space-y-6">
        {tickets.map((t) => (
          <div key={t.id} className="rounded-2xl bt-card p-6 text-center">
            <p className="mb-4 text-sm text-gray-400">
              {t.quantity} ticket{t.quantity > 1 ? "s" : ""} · {t.buyerName}
            </p>
            {qrByCode[t.code] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrByCode[t.code]}
                alt={`Ticket QR ${t.code}`}
                className="mx-auto h-56 w-56 rounded-xl bg-white p-3"
              />
            )}
            <p className="mt-4 font-mono text-lg font-bold text-[#f2c14e]">{t.code}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href={`/events/${params.id}`} className="text-sm text-gray-400 hover:text-[#f2c14e]">
          Back to event
        </Link>
      </div>
    </div>
  );
}

export default function TicketConfirmPage() {
  return (
    <Suspense>
      <ConfirmInner />
    </Suspense>
  );
}
