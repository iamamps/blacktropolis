"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Calendar, User, LogOut } from "lucide-react";
import { Member } from "@/types";

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [member, setMember] = useState<Member | null>(null);

  const loadMember = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    setMember(data.member);
  }, []);

  useEffect(() => {
    loadMember();
  }, [loadMember, pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setMember(null);
    window.location.href = "/";
  };

  const links = [
    { href: "/events", label: "Find Events" },
    { href: "/business/join", label: "For Businesses" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#f2c14e]/20 bg-[#050403]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Blacktropolis" className="h-9 w-9 rounded-full" />
          <span className="text-xl font-extrabold tracking-tight bt-gradient-text">
            BLACKTROPOLIS
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-300 transition hover:text-[#f2c14e]"
            >
              {l.label}
            </Link>
          ))}
          {member ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-[#f2c14e]"
              >
                <User className="h-4 w-4" /> {member.name.split(" ")[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-[#ef4444]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bt-gold-btn px-4 py-1.5 text-sm shadow-lg shadow-[#f2c14e]/20"
            >
              Sign In
            </Link>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#f2c14e]/20 bg-[#0a0906] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-gray-200"
              >
                <Calendar className="h-4 w-4 text-[#f2c14e]" /> {l.label}
              </Link>
            ))}
            {member ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="text-gray-200">
                  My Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-[#ef4444]">
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bt-gold-btn px-4 py-2 text-center text-sm"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
