import { useEffect, useState, useCallback } from "react";

export type CityLocation = {
  city?: string;
  locality?: string;
  region?: string;
  countryCode?: string;
};

export function useCityLocation() {
  const [cityInfo, setCityInfo] = useState<CityLocation>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lon: number) => {
    // BigDataCloud free reverse geocode: no API key required
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Reverse geocode failed");
    const data = await res.json();
    const city = data.city || data.locality || data.localityInfo?.administrative?.[0]?.name;
    const region = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name;
    const countryCode = data.countryCode;
    return { city, locality: data.locality, region, countryCode } as CityLocation;
  };

  const ipFallback = async () => {
    // IP-based geolocation fallback (best-effort)
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("IP geolocation failed");
    const data = await res.json();
    return {
      city: data.city,
      region: data.region,
      countryCode: data.country_code,
    } as CityLocation;
  };

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (typeof navigator !== "undefined" && "geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000,
          })
        );
        const { latitude, longitude } = position.coords;
        const info = await reverseGeocode(latitude, longitude);
        setCityInfo(info);
      } else {
        const info = await ipFallback();
        setCityInfo(info);
      }
    } catch (e: any) {
      try {
        const info = await ipFallback();
        setCityInfo(info);
      } catch (ipErr: any) {
        setError(e?.message || "Unable to detect location");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Attempt detection on mount; browser may prompt for permission
    detect();
  }, [detect]);

  return {
    cityInfo,
    loading,
    error,
    refresh: detect,
  };
}
