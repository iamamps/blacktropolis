"use client";

import { useEffect, useState } from "react";

interface SiteAd {
  id: string;
  title: string | null;
  imageDataUrl: string;
  linkUrl: string | null;
}

export function HomepageAd() {
  const [ad, setAd] = useState<SiteAd | null>(null);

  useEffect(() => {
    fetch("/api/ads/active")
      .then((r) => r.json())
      .then((data) => setAd(data.ad));
  }, []);

  if (!ad) return null;

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ad.imageDataUrl}
      alt={ad.title || "Advertisement"}
      className="mx-auto max-h-40 w-auto rounded-xl object-contain shadow-lg shadow-black/40"
    />
  );

  return (
    <div className="mb-4">
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
    </div>
  );
}
