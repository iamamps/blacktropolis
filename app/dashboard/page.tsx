"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Trash, Edit, Loader2, Zap, CheckCircle, Ticket as TicketIcon } from "lucide-react";
import { MembershipCard } from "@/components/membership-card";
import { Member, EventItem } from "@/types";

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [upgrading, setUpgrading] = useState<"live" | "test" | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const loadMember = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setMember(data.member);
  }, []);

  const loadEvents = useCallback(async (businessId: string) => {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents((data.events || []).filter((e: EventItem) => e.businessId === businessId));
  }, []);

  useEffect(() => {
    loadMember();
  }, [loadMember]);

  useEffect(() => {
    if (member?.role === "business") loadEvents(member.id);
  }, [member, loadEvents]);

  useEffect(() => {
    const checkoutSessionId = searchParams.get("checkout_session_id");
    if (!checkoutSessionId || verifying) return;
    setVerifying(true);
    fetch(`/api/membership/verify?session_id=${encodeURIComponent(checkoutSessionId)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setVerifyError(data.error || "Could not verify payment.");
          return;
        }
        setMember(data.member);
        router.replace("/dashboard");
      })
      .finally(() => setVerifying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleUpgrade = async (priceType: "live" | "test") => {
    setUpgrading(priceType);
    const res = await fetch("/api/membership/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceType }),
    });
    const data = await res.json();
    setUpgrading(null);
    if (res.ok && data.url) {
      window.location.href = data.url;
    } else {
      setVerifyError(data.error || "Could not start checkout.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (member?.role === "business") loadEvents(member.id);
  };

  if (member === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#f2c14e]" />
      </div>
    );
  }

  if (member === null) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="mb-4 text-gray-300">You need to sign in to view your dashboard.</p>
        <Link href="/login" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black text-white">
        My <span className="bt-gradient-text">Dashboard</span>
      </h1>

      {verifying && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bt-card px-4 py-3 text-sm text-[#f2c14e]">
          <Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment…
        </div>
      )}
      {verifyError && (
        <div className="mb-4 rounded-xl bg-[#ef4444]/10 px-4 py-3 text-sm text-[#ef4444]">
          {verifyError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <MembershipCard member={member} />
          {member.role === "business" && member.membershipTier !== "paid" && (
            <div className="mt-4 space-y-3 rounded-2xl bt-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#f2c14e]">
                <Zap className="h-4 w-4" /> Activate Paid Membership
              </p>
              <p className="text-xs text-gray-400">
                Subscribe to the Blacktropolis Business Network to unlock event posting. You'll
                be redirected to a secure Stripe checkout.
              </p>
              <button
                onClick={() => handleUpgrade("live")}
                disabled={upgrading !== null}
                className="w-full rounded-full bt-gold-btn py-2.5 text-sm font-bold disabled:opacity-60"
              >
                {upgrading === "live" ? "Redirecting to checkout…" : "Subscribe with Stripe — $100/mo"}
              </button>

              <div className="rounded-xl border border-dashed border-[#f2c14e]/30 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Testing mode
                </p>
                <button
                  onClick={() => handleUpgrade("test")}
                  disabled={upgrading !== null}
                  className="w-full rounded-full border border-[#f2c14e]/50 py-2 text-xs font-bold text-[#f2c14e] hover:bg-[#f2c14e]/10 disabled:opacity-60"
                >
                  {upgrading === "test" ? "Redirecting…" : "Test Checkout — $1 one-time"}
                </button>
                <p className="mt-2 text-[10px] text-gray-500">
                  Runs the full real checkout flow for $1 so you can verify everything works
                  before going live with real memberships.
                </p>
              </div>
            </div>
          )}
          {member.role === "business" && member.membershipTier === "paid" && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bt-card p-4 text-sm text-[#f2c14e]">
              <CheckCircle className="h-4 w-4" /> Active Blacktropolis Business Membership
            </div>
          )}
          {searchParams.get("upgrade") === "cancelled" && (
            <p className="mt-3 text-xs text-gray-500">Checkout was cancelled — no charge was made.</p>
          )}
        </div>

        <div className="lg:col-span-2">
          {member.role === "resident" ? (
            <div className="rounded-2xl bt-card p-8 text-center text-gray-400">
              <p className="mb-4">
                You're all set! Head over to Events to find parties near you.
              </p>
              <Link href="/events" className="rounded-full bt-gold-btn px-6 py-2.5 font-bold">
                Browse Events
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">My Events</h2>
                {member.membershipTier === "paid" && (
                  <Link
                    href="/dashboard/new-event"
                    className="flex items-center gap-1 rounded-full bt-gold-btn px-4 py-2 text-sm font-bold"
                  >
                    <Plus className="h-4 w-4" /> New Event
                  </Link>
                )}
              </div>
              {events.length === 0 ? (
                <div className="rounded-2xl bt-card p-8 text-center text-gray-400">
                  {member.membershipTier === "paid"
                    ? "No events posted yet — create your first one!"
                    : "Activate your paid membership to post your first event."}
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl bt-card p-4"
                    >
                      <div>
                        <p className="font-semibold text-white">{event.title}</p>
                        <p className="text-xs text-gray-400">
                          {event.date} · {event.city}, {event.state}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard/events/${event.id}/tickets`}
                          className="flex items-center gap-1 rounded-full border border-[#f2c14e]/40 px-3 py-2 text-xs font-bold text-[#f2c14e]"
                        >
                          <TicketIcon className="h-3.5 w-3.5" /> Tickets
                        </Link>
                        <Link
                          href={`/dashboard/edit-event/${event.id}`}
                          className="rounded-full border border-[#f2c14e]/40 p-2 text-[#f2c14e]"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="rounded-full border border-[#ef4444]/40 p-2 text-[#ef4444]"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
