import { useEffect, useMemo, useState } from "react";

export type DistanceResult = {
  distanceKm?: number;
  distanceLabel?: string;
  loading: boolean;
  error?: string;
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

async function getUserCoords(): Promise<{ lat: number; lon: number } | null> {
  // Try browser geolocation first
  if (typeof navigator !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 7000,
          maximumAge: 300000,
        })
      );
      return { lat: position.coords.latitude, lon: position.coords.longitude };
    } catch {}
  }

  // Fallback to IP-based lookup (best effort)
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("ipapi failed");
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lon: data.longitude };
    }
  } catch {}

  return null;
}

async function geocode(query: string): Promise<{ lat: number; lon: number } | null> {
  if (!query) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1`;
  try {
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) throw new Error("geocode failed");
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.warn("Geocode failed for", query, err);
  }
  return null;
}

export function useDistance(destinationQuery?: string): DistanceResult {
  const [loading, setLoading] = useState(false);
  const [distanceKm, setDistanceKm] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!destinationQuery) return;
      setLoading(true);
      setError(undefined);
      try {
        const user = await getUserCoords();
        const dest = await geocode(destinationQuery);
        if (!user || !dest) {
          if (!cancelled) setError("Could not resolve location");
          return;
        }
        const d = haversineKm(user.lat, user.lon, dest.lat, dest.lon);
        if (!cancelled) setDistanceKm(d);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Distance lookup failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [destinationQuery]);

  const distanceLabel = useMemo(() => {
    if (distanceKm === undefined) return undefined;
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
    if (distanceKm < 50) return `${distanceKm.toFixed(1)} km`;
    return `${Math.round(distanceKm)} km`;
  }, [distanceKm]);

  return { distanceKm, distanceLabel, loading, error };
}
