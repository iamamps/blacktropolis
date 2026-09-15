"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { EventItem } from "@/types";

// @ts-expect-error - leaflet internal
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface EventMapProps {
  events: EventItem[];
  center?: { lat: number; lng: number } | null;
}

export function EventMap({ events, center }: EventMapProps) {
  const pinned = events.filter((e) => e.lat != null && e.lng != null);
  const mapCenter: [number, number] = center
    ? [center.lat, center.lng]
    : pinned.length
    ? [pinned[0].lat as number, pinned[0].lng as number]
    : [39.8283, -98.5795];

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-[#f2c14e]/30">
      <MapContainer
        center={mapCenter}
        zoom={center ? 11 : 4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <Recenter center={mapCenter} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pinned.map((e) => (
          <Marker key={e.id} position={[e.lat as number, e.lng as number]}>
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{e.title}</p>
                <p>{e.venueName}</p>
                <Link href={`/events/${e.id}`} className="text-blue-600 underline">
                  View event
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
