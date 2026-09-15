export interface GeoResult {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export async function geocodeZip(zip: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${encodeURIComponent(zip)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      city: place["place name"],
      state: place["state abbreviation"],
    };
  } catch {
    return null;
  }
}

export async function geocodeCity(query: string): Promise<GeoResult | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(
        query
      )}`,
      { headers: { "User-Agent": "Blacktropolis-App/1.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const place = data?.[0];
    if (!place) return null;
    const parts = (place.display_name as string).split(",").map((p) => p.trim());
    return {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      city: parts[0] || query,
      state: parts[parts.length - 3] || "",
    };
  } catch {
    return null;
  }
}

export async function geocodeLocation(query: string): Promise<GeoResult | null> {
  const isZip = /^\d{5}$/.test(query.trim());
  if (isZip) {
    const result = await geocodeZip(query.trim());
    if (result) return result;
  }
  return geocodeCity(query.trim());
}

export function distanceMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
