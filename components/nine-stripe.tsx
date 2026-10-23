import { ORGANIZATIONS } from "@/lib/organizations";

/** Thin bar made of the nine organizations' colors. */
export function NineStripe({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-1.5 w-full overflow-hidden ${className}`} aria-hidden="true">
      {ORGANIZATIONS.map((o) => (
        <span key={o.slug} className="h-full flex-1" style={{ backgroundColor: o.accent }} />
      ))}
    </div>
  );
}
