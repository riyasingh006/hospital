"use client";

import * as React from "react";
import { Car, ExternalLink, Loader2, LocateFixed, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { estimateEtaMinutes, formatDistance, haversineKm } from "@/lib/utils";
import {
  getCurrentPosition,
  loadPatientLocation,
  savePatientLocation,
  type GeoErrorKind,
} from "@/lib/patient/location";

const GEO_HINTS: Record<GeoErrorKind, string> = {
  denied:
    "Location access was not allowed. Enter an address to get directions.",
  unavailable: "Your location could not be determined. Enter an address instead.",
  timeout: "Locating you took too long. Enter an address instead.",
  unsupported: "Geolocation is not supported by this browser. Enter an address.",
  unknown: "Could not determine your location. Enter an address instead.",
};

export function DirectionsDialog({
  open,
  onOpenChange,
  destination,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  destination: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    city?: string;
  } | null;
}) {
  const [origin, setOrigin] = React.useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);
  const [address, setAddress] = React.useState("");
  const [busy, setBusy] = React.useState<"geo" | "geocode" | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      const saved = loadPatientLocation();
      if (saved) setOrigin({ lat: saved.lat, lng: saved.lng, label: saved.label });
      else setOrigin(null);
      setAddress("");
    }
  }, [open]);

  async function deviceLocation() {
    setBusy("geo");
    try {
      const pos = await getCurrentPosition();
      const label = "My current location";
      setOrigin({ ...pos, label });
      savePatientLocation({
        lat: pos.lat,
        lng: pos.lng,
        label,
        source: "device",
        savedAt: new Date().toISOString(),
      });
    } catch (e) {
      const kind = (e as { kind?: GeoErrorKind })?.kind ?? "unknown";
      toast({ title: "Location unavailable", description: GEO_HINTS[kind], variant: "warning" });
    } finally {
      setBusy(null);
    }
  }

  async function geocodeAddress() {
    if (!destination) return;
    const q = address.trim();
    if (q.length < 3) return;
    setBusy("geocode");
    try {
      const res = await fetch(
        `/api/patient/geocode?q=${encodeURIComponent(q)}`
      );
      const json = await res.json();
      const first = json?.data?.results?.[0];
      if (!first) {
        toast({
          title: "Address not found",
          description:
            "We could not find that location. Try a city or PIN code, or use your current location.",
          variant: "warning",
        });
        return;
      }
      const label = String(first.label).split(",")[0] + ", India";
      setOrigin({ lat: first.lat, lng: first.lng, label });
      savePatientLocation({
        lat: first.lat,
        lng: first.lng,
        label,
        source: "address",
        savedAt: new Date().toISOString(),
      });
    } catch {
      toast({
        title: "Address lookup failed",
        description: "Hospital search is temporarily unavailable. Please try again.",
        variant: "error",
      });
    } finally {
      setBusy(null);
    }
  }

  if (!destination) return null;

  const distKm = origin
    ? haversineKm(origin, { lat: destination.lat, lng: destination.lng })
    : null;

  const gmapsUrl = origin
    ? `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.name + (destination.city ? " " + destination.city : ""))}&travelmode=driving`;

  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${origin ? `${origin.lat}%2C${origin.lng}` : ""}%3B${destination.lat}%2C${destination.lng}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Get Directions</DialogTitle>
          <DialogDescription>
            To {destination.name}
            {destination.city ? `, ${destination.city}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="data-label">Starting point</p>
            {origin ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary-900">
                <MapPin className="h-4 w-4 text-care-600" aria-hidden />
                {origin.label}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                No starting point selected yet.
              </p>
            )}
            <div className="mt-2.5 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => void deviceLocation()}
                disabled={busy !== null}
              >
                {busy === "geo" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <LocateFixed className="h-3.5 w-3.5" aria-hidden />
                )}
                Use My Current Location
              </Button>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter city, area, address or PIN code"
                aria-label="Starting point address"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void geocodeAddress();
                }}
              />
              <Button
                variant="subtle"
                size="sm"
                onClick={() => void geocodeAddress()}
                disabled={busy !== null || address.trim().length < 3}
              >
                {busy === "geocode" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  "Set"
                )}
              </Button>
            </div>
          </div>

          {distKm !== null && (
            <p className="flex items-center gap-2 rounded-lg bg-status-info-bg px-3 py-2 text-sm text-status-info-fg">
              <Car className="h-4 w-4 shrink-0" aria-hidden />
              Straight-line distance {formatDistance(distKm)} · approx.{" "}
              {estimateEtaMinutes(distKm)} min drive
            </p>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <a href={gmapsUrl} target="_blank" rel="noreferrer">
              <Button variant="primary" size="lg" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" aria-hidden /> Start Navigation
              </Button>
            </a>
            <a href={osmUrl} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="lg" className="w-full gap-2">
                <ExternalLink className="h-4 w-4" aria-hidden /> Open route map
              </Button>
            </a>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Route opens in an external map service. Estimated travel time is
            approximate — always follow live traffic guidance.
          </p>
        </div>

        <Label className="sr-only">Directions</Label>
      </DialogContent>
    </Dialog>
  );
}
