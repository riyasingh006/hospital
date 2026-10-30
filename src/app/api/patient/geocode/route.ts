import { z } from "zod";
import { ok, withApi } from "@/lib/api-helpers";
import {
  GoogleApiError,
  geocodeAddress,
  googleKeyConfigured,
  resolvePlaceLocation,
} from "@/lib/google-places";

const schema = z.object({
  q: z.string().trim().min(3).max(120),
});

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Address → coordinates for the patient portal location picker.
 *
 * Resolution order:
 *   1. Google Geocoding API (worldwide) when a server key is configured.
 *   2. Google Places API (New) Text Search — used when the Geocoding API is not
 *      enabled on the key, so a Places-only key still resolves locations.
 *   3. OpenStreetMap Nominatim — free fallback that needs no API key.
 * Only real coordinates are ever returned; no key is ever exposed to the client.
 */
async function nominatim(q: string): Promise<{ lat: number; lng: number; label: string }[]> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(q)}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            // Nominatim usage policy requires an identifying User-Agent.
            "User-Agent": "JeevanSahay-PatientPortal/1.0",
          },
        }
      );
      if (res.ok) {
        const rows = (await res.json()) as NominatimResult[];
        const mapped = rows
          .map((r) => ({
            lat: Number(r.lat),
            lng: Number(r.lon),
            label: r.display_name,
          }))
          .filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng));
        if (mapped.length > 0) return mapped;
        return [];
      }
      // Rate limited or server error — brief pause, then one retry.
      await new Promise((r) => setTimeout(r, 1200));
    } catch {
      if (attempt === 1) return [];
      await new Promise((r) => setTimeout(r, 1200));
    } finally {
      clearTimeout(timer);
    }
  }
  return [];
}

export const GET = withApi(
  async (req) => {
    const url = new URL(req.url);
    const parsed = schema.safeParse(Object.fromEntries(url.searchParams));
    if (parsed.error) return ok({ results: [] });
    const q = parsed.data.q;

    if (googleKeyConfigured()) {
      try {
        const results = await geocodeAddress(q);
        if (results.length) return ok({ results });
      } catch (err) {
        if (!(err instanceof GoogleApiError)) throw err;
        // Geocoding API unavailable/denied — try the Places text fallback.
      }
      try {
        const results = await resolvePlaceLocation(q);
        if (results.length) return ok({ results });
      } catch (err) {
        if (!(err instanceof GoogleApiError)) throw err;
        // Places fallback also unavailable — fall through to Nominatim.
      }
    }

    return ok({ results: await nominatim(q) });
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "geocode" }
);
