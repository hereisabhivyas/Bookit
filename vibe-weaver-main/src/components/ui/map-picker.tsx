import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

// Fix default marker icon paths (Vite)
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type MapPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCoords?: { lat: number; lng: number };
  onConfirm: (data: { lat: number; lng: number; address?: string; city?: string; mapLink: string }) => void;
};

function ClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({ position, onDragEnd, icon }: { position: { lat: number; lng: number }, onDragEnd: (lat: number, lng: number) => void, icon: any }) {
  const markerRef = useMapEvents({
    dragend() {
      const marker = markerRef.target as any;
      if (marker) {
        const pos = marker.getLatLng();
        onDragEnd(pos.lat, pos.lng);
      }
    },
  });

  const RLMarker = Marker as unknown as any;

  return (
    <RLMarker
      position={[position.lat, position.lng]}
      draggable={true}
      icon={icon}
      eventHandlers={{
        dragend: (e: any) => {
          const pos = e.target.getLatLng();
          onDragEnd(pos.lat, pos.lng);
        },
      }}
    />
  );
}

export function MapPickerDialog({ open, onOpenChange, initialCoords, onConfirm }: MapPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(initialCoords || null);
  const [address, setAddress] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    if (open && !initialCoords) {
      // Auto-detect user's current location when dialog opens
      setDetectingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setDetectingLocation(false);
          },
          (err) => {
            console.warn('Geolocation failed:', err.message);
            setDetectingLocation(false);
            // Fallback: keep default India center
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
        );
      } else {
        setDetectingLocation(false);
      }
    } else if (open && initialCoords) {
      setPosition(initialCoords);
    }
  }, [open, initialCoords]);

  useEffect(() => {
    const fetchAddress = async () => {
      if (!position) return;
      setLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        if (res.ok) {
          const data = await res.json();
          setAddress(data.display_name);
          setCity(data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || data.address?.state);
        } else {
          setAddress(undefined);
          setCity(undefined);
        }
      } catch {
        setAddress(undefined);
        setCity(undefined);
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [position]);

  const center: LatLngExpression = position ? [position.lat, position.lng] : [20.5937, 78.9629]; // Default: India center
  // Work around React-Leaflet TS prop typing in some environments
  const RLMapContainer = MapContainer as unknown as any;
  const RLTileLayer = TileLayer as unknown as any;
  const RLDraggableMarker = DraggableMarker as unknown as any;

  const handleConfirm = () => {
    if (!position) return;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
    onConfirm({ lat: position.lat, lng: position.lng, address, city, mapLink });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Location on Map</DialogTitle>
          <DialogDescription>
            {detectingLocation ? 'Detecting your current location...' : 'Drag the pin to adjust your location, or click anywhere on the map to move it. Address and city will be fetched automatically.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="h-[400px] w-full rounded-md overflow-hidden border">
            <RLMapContainer center={center} zoom={position ? 13 : 4} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
              <RLTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <ClickHandler onSelect={(lat, lng) => setPosition({ lat, lng })} />
              {position && <RLDraggableMarker position={position} onDragEnd={(lat, lng) => setPosition({ lat, lng })} icon={markerIcon} />}            
            </RLMapContainer>
          </div>
          <div className="text-sm text-muted-foreground">
            {position ? (
              <div className="space-y-1">
                <div><span className="font-medium">Coordinates:</span> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</div>
                <div><span className="font-medium">City:</span> {city || (loading ? 'Fetching…' : '—')}</div>
                <div><span className="font-medium">Address:</span> {address || (loading ? 'Fetching…' : '—')}</div>
              </div>
            ) : (
              <span>Click on the map to select a location.</span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!position} onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
