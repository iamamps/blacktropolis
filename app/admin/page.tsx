"use client";

import { useEffect, useState } from "react";
import { Users, Building, CreditCard, Calendar } from "lucide-react";

interface Stats {
  totalMembers: number;
  residents: number;
  businesses: number;
  paidBusinesses: number;
  totalEvents: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = stats
    ? [
        { label: "Total Members", value: stats.totalMembers, icon: Users, color: "#f2c14e" },
        { label: "Residents", value: stats.residents, icon: Users, color: "#cbd5e1" },
        { label: "Businesses", value: stats.businesses, icon: Building, color: "#ef4444" },
        {
          label: "Paid Business Members",
          value: stats.paidBusinesses,
          icon: CreditCard,
          color: "#f2c14e",
        },
        { label: "Events Posted", value: stats.totalEvents, icon: Calendar, color: "#ef4444" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-black text-white">
        Data <span className="bt-gradient-text">Overview</span>
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        Live counts of every signup captured through the app.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bt-card p-6">
            <c.icon className="mb-3 h-6 w-6" style={{ color: c.color }} />
            <p className="text-3xl font-black text-white">{c.value}</p>
            <p className="text-sm text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
