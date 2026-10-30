"use client";

import { DEFAULT_CENTER } from "@/lib/constants";

export interface PatientLocation {
  lat: number;
  lng: number;
  label: string;
  source: "device" | "address";
  savedAt: string;
}

const KEY = "js_patient_location";

export function loadPatientLocation(): PatientLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PatientLocation;
    if (
      typeof parsed?.lat === "number" &&
      typeof parsed?.lng === "number"
    )
      return parsed;
    return null;
  } catch {
    return null;
  }
}

export function savePatientLocation(loc: PatientLocation) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(loc));
  } catch {
    // storage unavailable — non-fatal
  }
}

export function clearPatientLocation() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // storage unavailable — non-fatal
  }
}

export type GeoErrorKind =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported"
  | "unknown";

export function getCurrentPosition(): Promise<{
  lat: number;
  lng: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject({ kind: "unsupported" as GeoErrorKind });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        const kind: GeoErrorKind =
          err.code === err.PERMISSION_DENIED
            ? "denied"
            : err.code === err.POSITION_UNAVAILABLE
              ? "unavailable"
              : err.code === err.TIMEOUT
                ? "timeout"
                : "unknown";
        reject({ kind });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 120000 }
    );
  });
}

/** Reference point used for distance when the patient has not set a location. */
export function referenceLocation(): { lat: number; lng: number } {
  return loadPatientLocation() ?? DEFAULT_CENTER;
}
