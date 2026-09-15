import { Zap, MapPin } from "lucide-react";
import { Member } from "@/types";

export function MembershipCard({ member }: { member: Member }) {
  const initials = (member.businessName || member.name)
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f2c14e]/40 bg-gradient-to-br from-[#160f06] via-[#0c0906] to-[#050403] p-6 shadow-2xl bt-glow">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#f2c14e]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#b8860b]/25 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <span className="text-sm font-black tracking-widest bt-gradient-text">BLACKTROPOLIS</span>
        <span
          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
            member.membershipTier === "paid"
              ? "bg-[#f2c14e] text-black"
              : "bg-white/10 text-gray-300"
          }`}
        >
          {member.membershipTier === "paid" ? "Premium Member" : "Free Member"}
        </span>
      </div>

      <div className="relative mt-6 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#f2c14e] to-[#b8860b] text-lg font-black text-black">
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold text-white">
            {member.businessName || member.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin className="h-3 w-3" /> {member.city}
            {member.state ? `, ${member.state}` : ""}
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Member ID</p>
          <p className="font-mono text-base font-bold text-[#f2c14e]">{member.membershipId}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-gray-500">Since</p>
          <p className="text-sm text-gray-300">
            {new Date(member.memberSince).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <Zap className="h-6 w-6 text-[#f2c14e]" />
      </div>
    </div>
  );
}
