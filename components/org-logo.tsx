import type { Organization } from "@/lib/organizations";

interface OrgLogoProps {
  org: Pick<Organization, "name" | "short" | "logo" | "accent">;
  /** pixel size of the round badge */
  size?: number;
  ring?: boolean;
  className?: string;
}

/** Crest on a light round badge so every logo (light, dark, or on a white background) stays visible. */
export function OrgLogo({ org, size = 64, ring = true, className = "" }: OrgLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2px ${org.accent}, 0 4px 14px rgba(0,0,0,0.45)` : undefined,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={org.logo}
        alt={`${org.short} crest`}
        loading="lazy"
        className="object-contain"
        style={{ width: size * 0.78, height: size * 0.78 }}
      />
    </span>
  );
}
