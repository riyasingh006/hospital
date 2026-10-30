"use client";

import * as React from "react";
import "leaflet/dist/leaflet.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  score?: number;
  emergency?: boolean;
  /** AI-recommendation highlight: "primary" = #1 match ring, "secondary" = 2–4. */
  highlight?: "primary" | "secondary";
}

export interface HospitalMapProps {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export default function HospitalMap({
  center,
  markers,
  userLocation,
  className,
  onMarkerClick,
}: HospitalMapProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<unknown>(null);
  const layerRef = React.useRef<unknown>(null);
  const clickRef = React.useRef(onMarkerClick);
  clickRef.current = onMarkerClick;

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [center.lat, center.lng],
        zoom: 11,
        scrollWheelZoom: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      const map = mapRef.current as { remove?: () => void } | null;
      if (map?.remove) map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync view + markers whenever inputs change.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const map = mapRef.current as
        | {
            setView: (c: [number, number], z: number) => void;
            invalidateSize: () => void;
          }
        | null;
      if (!map) return;

      const L = await import("leaflet");
      if (cancelled) return;

      map.setView([center.lat, center.lng], 11);

      const layer = layerRef.current as
        | { clearLayers: () => void; addTo: (m: unknown) => void; addLayer: (l: unknown) => void }
        | null;
      if (!layer) {
        const group = L.layerGroup().addTo(
          mapRef.current as unknown as never
        );
        layerRef.current = group as unknown;
      }
      const group = layerRef.current as unknown as {
        clearLayers: () => void;
      };
      group.clearLayers();

      for (const m of markers) {
        const ring =
          m.highlight === "primary"
            ? "box-shadow:0 0 0 3px #fff,0 0 0 6px rgba(245,124,0,.85),0 1px 4px rgba(14,35,66,.4);"
            : m.highlight === "secondary"
              ? "box-shadow:0 0 0 2px #fff,0 0 0 4px rgba(11,94,215,.45),0 1px 4px rgba(14,35,66,.4);"
              : "box-shadow:0 1px 4px rgba(14,35,66,.4);";
        const icon = L.divIcon({
          className: "",
          html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:${m.emergency ? "#B42318" : "#062B67"};color:#fff;font-size:10px;font-weight:700;border:2px solid #fff;${ring}">${m.score ?? ""}</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
        const marker = L.marker([m.lat, m.lng], { icon, title: m.label });
        marker.on("click", () => clickRef.current?.(m.id));
        marker.addTo(layerRef.current as never);
      }

      if (userLocation) {
        const acc = L.circle([userLocation.lat, userLocation.lng], {
          radius: 350,
          color: "#0B5ED7",
          weight: 1,
          fillColor: "#43A5DA",
          fillOpacity: 0.18,
        });
        const dot = L.divIcon({
          className: "",
          html: `<div style="width:12px;height:12px;border-radius:9999px;background:#0B5ED7;border:2px solid #fff;box-shadow:0 0 0 3px rgba(11,94,215,.25);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        const me = L.marker([userLocation.lat, userLocation.lng], {
          icon: dot,
          title: "Your location",
        });
        acc.addTo(mapRef.current as never);
        me.addTo(layerRef.current as never);
      }

      setTimeout(() => map.invalidateSize(), 60);
    })();
    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng, markers, userLocation]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-full w-full"}
      role="application"
      aria-label="Hospital locations map"
    />
  );
}
