import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/organizations", label: "Organization logos" },
  { href: "/admin/ads", label: "Homepage ad" },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav className="mx-auto mb-6 flex max-w-5xl flex-wrap gap-2 px-4 pt-6">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
            current === l.href ? "bg-[#f2c14e] text-black" : "border border-[#f2c14e]/30 text-gray-300 hover:text-[#f2c14e]"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
