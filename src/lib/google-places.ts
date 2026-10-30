/**
 * Server-only Google Maps Platform integration.
 *
 * Uses Google Places API (New) for nearby / text hospital discovery and the
 * Google Geocoding API for resolving free-text locations and PIN codes.
 *
 * The API key is read exclusively from the server environment variable
 * `GOOGLE_MAPS_API_KEY`. It is never returned to the client and is not exposed
 * through any `NEXT_PUBLIC_*` variable.
 */

/** Prefix used to namespace Google Place IDs in the app's hospital URLs. */
export const GOOGLE_ID_PREFIX = "gplaces_";

const PLACES_BASE = "https://places.googleapis.com/v1";
const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode/json";
const REQUEST_TIMEOUT_MS = 9000;

/** Fields requested from Places API (New) search endpoints. */
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.addressComponents",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.businessStatus",
  "places.regularOpeningHours",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.types",
].join(",");

/** Fields requested from the Place Details endpoint. */
export const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "shortFormattedAddress",
  "addressComponents",
  "location",
  "rating",
  "userRatingCount",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "businessStatus",
  "regularOpeningHours",
  "primaryType",
  "primaryTypeDisplayName",
  "types",
].join(",");

export class GoogleApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "GoogleApiError";
    this.status = status;
  }
}

export function googleKey(): string {
  return (process.env.GOOGLE_MAPS_API_KEY ?? "").trim();
}

export function googleKeyConfigured(): boolean {
  return googleKey().length > 0;
}

interface GoogleErrorBody {
  error?: { code?: number; message?: string; status?: string };
}

async function googleFetch(
  url: string,
  init: RequestInit & { headers?: Record<string, string> }
): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: controller.signal });
  } catch (err) {
    clearTimeout(timer);
    if ((err as { name?: string })?.name === "AbortError") {
      throw new GoogleApiError(504, "Google API request timed out.");
    }
    throw new GoogleApiError(502, "Could not reach Google services.");
  }
  clearTimeout(timer);

  if (!res.ok) {
    let body: GoogleErrorBody | null = null;
    try {
      body = (await res.json()) as GoogleErrorBody;
    } catch {
      body = null;
    }
    const status = body?.error?.status ?? "";
    const code = body?.error?.code ?? res.status;
    if (res.status === 403) {
      throw new GoogleApiError(
        502,
        "Google Places API access was denied. Verify the server API key and that the Places API (New) and Geocoding API are enabled."
      );
    }
    if (res.status === 429) {
      throw new GoogleApiError(
        429,
        "Google Maps API quota exceeded. Please try again later."
      );
    }
    if (res.status === 400 || status === "INVALID_ARGUMENT") {
      throw new GoogleApiError(400, "The search request was rejected by Google.");
    }
    throw new GoogleApiError(
      code >= 400 && code < 600 ? code : 502,
      "Google Maps API request failed."
    );
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/* Result shape                                                        */
/* ------------------------------------------------------------------ */

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  shortAddress?: string;
  lat: number;
  lng: number;
  rating?: number;
  userRatingCount?: number;
  phone?: string;
  website?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  openNow?: boolean;
  primaryType?: string;
  primaryTypeDisplayName?: string;
  types?: string[];
  locality?: string;
  state?: string;
  postalCode?: string;
}

interface RawPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: {
    longText?: string;
    shortText?: string;
    types?: string[];
  }[];
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  businessStatus?: string;
  regularOpeningHours?: { openNow?: boolean };
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
}

function componentValue(
  comps: RawPlace["addressComponents"],
  type: string
): string | undefined {
  const c = comps?.find((x) => x.types?.includes(type));
  return c?.longText ?? c?.shortText ?? undefined;
}

function mapPlace(raw: RawPlace): PlaceResult | null {
  const lat = raw.location?.latitude;
  const lng = raw.location?.longitude;
  if (!raw.id || typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    placeId: raw.id,
    name: raw.displayName?.text ?? "Hospital",
    address: raw.formattedAddress ?? raw.shortFormattedAddress ?? "",
    shortAddress: raw.shortFormattedAddress,
    lat,
    lng,
    rating: raw.rating,
    userRatingCount: raw.userRatingCount,
    phone: raw.nationalPhoneNumber ?? raw.internationalPhoneNumber,
    website: raw.websiteUri,
    googleMapsUri: raw.googleMapsUri,
    businessStatus: raw.businessStatus,
    openNow: raw.regularOpeningHours?.openNow,
    primaryType: raw.primaryType,
    primaryTypeDisplayName: raw.primaryTypeDisplayName?.text ?? raw.primaryType,
    types: raw.types,
    locality:
      componentValue(raw.addressComponents, "locality") ??
      componentValue(raw.addressComponents, "postal_town") ??
      componentValue(raw.addressComponents, "administrative_area_level_2"),
    state: componentValue(raw.addressComponents, "administrative_area_level_1"),
    postalCode: componentValue(raw.addressComponents, "postal_code"),
  };
}

/* ------------------------------------------------------------------ */
/* Places API (New)                                                    */
/* ------------------------------------------------------------------ */

interface SearchResponse {
  places?: RawPlace[];
}

export async function searchNearbyHospitals(params: {
  lat: number;
  lng: number;
  radiusMeters: number;
  limit: number;
}): Promise<PlaceResult[]> {
  const body = {
    includedTypes: ["hospital"],
    maxResultCount: Math.min(Math.max(params.limit, 1), 20),
    locationRestriction: {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: Math.min(Math.max(params.radiusMeters, 1), 50000),
      },
    },
  };
  const json = (await googleFetch(`${PLACES_BASE}/places:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleKey(),
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })) as SearchResponse;
  return (json.places ?? [])
    .map(mapPlace)
    .filter((p): p is PlaceResult => p !== null);
}

export async function searchTextHospitals(params: {
  query: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  limit: number;
  /** Place types to restrict to (default: hospital only). */
  types?: string[];
}): Promise<PlaceResult[]> {
  const types = params.types && params.types.length > 0 ? params.types : ["hospital"];
  const body: Record<string, unknown> = {
    textQuery: params.query,
    includedTypes: types.length === 1 ? undefined : types,
    includedType: types.length === 1 ? types[0] : undefined,
    maxResultCount: Math.min(Math.max(params.limit, 1), 20),
    languageCode: "en",
    // No regionCode here: with a region hint Google falls back to fuzzy
    // matches for unrecognised queries and returns hospitals the text query
    // never matched, which would defeat a genuine "no results" state.
  };
  if (body.includedType === undefined) delete body.includedType;
  if (body.includedTypes === undefined) delete body.includedTypes;
  if (
    typeof params.lat === "number" &&
    typeof params.lng === "number"
  ) {
    body.locationBias = {
      circle: {
        center: { latitude: params.lat, longitude: params.lng },
        radius: Math.min(Math.max(params.radiusMeters ?? 25000, 1), 50000),
      },
    };
  }
  const json = (await googleFetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleKey(),
      "X-Goog-FieldMask": SEARCH_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })) as SearchResponse;
  return (json.places ?? [])
    .map(mapPlace)
    .filter((p): p is PlaceResult => p !== null);
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const url = `${PLACES_BASE}/places/${encodeURIComponent(
    placeId
  )}?languageCode=en`;
  const json = (await googleFetch(url, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": googleKey(),
      "X-Goog-FieldMask": DETAILS_FIELD_MASK,
    },
  })) as RawPlace;
  return mapPlace(json);
}

/* ------------------------------------------------------------------ */
/* Geocoding API                                                       */
/* ------------------------------------------------------------------ */

export interface GeocodeResult {
  lat: number;
  lng: number;
  label: string;
}

interface GeocodeResponse {
  status: string;
  error_message?: string;
  results?: {
    formatted_address?: string;
    geometry?: { location?: { lat?: number; lng?: number } };
  }[];
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  // No country/region restriction: locations must resolve worldwide
  // (e.g. London, New York, Singapore, Dubai, Toronto), not just India.
  const url = `${GEOCODE_BASE}?address=${encodeURIComponent(
    query
  )}&language=en&key=${encodeURIComponent(googleKey())}`;
  const json = (await googleFetch(url, { method: "GET" })) as GeocodeResponse;

  if (json.status === "ZERO_RESULTS") return [];
  if (json.status === "OVER_QUERY_LIMIT") {
    throw new GoogleApiError(429, "Geocoding quota exceeded. Please try again later.");
  }
  if (json.status === "REQUEST_DENIED") {
    throw new GoogleApiError(
      502,
      "Google Geocoding API access was denied. Verify the server API key."
    );
  }
  if (json.status !== "OK") {
    throw new GoogleApiError(502, "Could not resolve that location.");
  }

  return (json.results ?? [])
    .map((r) => {
      const lat = r.geometry?.location?.lat;
      const lng = r.geometry?.location?.lng;
      if (typeof lat !== "number" || typeof lng !== "number") return null;
      return {
        lat,
        lng,
        label: r.formatted_address ?? query,
      };
    })
    .filter((r): r is GeocodeResult => r !== null);
}

/* ------------------------------------------------------------------ */
/* Location resolution fallback (Places Text Search)                   */
/* ------------------------------------------------------------------ */

/** Minimal field set for resolving a free-text location to coordinates. */
const LOCATION_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.location",
  "places.types",
].join(",");

/**
 * Resolve a free-text location (city, area or PIN code) to real coordinates
 * using the Places API (New) Text Search. Used as a fallback when the
 * dedicated Geocoding API is not enabled on the server key, so manual
 * location entry keeps working with a Places-only key.
 */
export async function resolvePlaceLocation(
  query: string
): Promise<GeocodeResult[]> {
  const body = {
    textQuery: query,
    maxResultCount: 5,
    languageCode: "en",
  };
  const json = (await googleFetch(`${PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googleKey(),
      "X-Goog-FieldMask": LOCATION_FIELD_MASK,
    },
    body: JSON.stringify(body),
  })) as SearchResponse;
  return (json.places ?? [])
    .map((raw): GeocodeResult | null => {
      const lat = raw.location?.latitude;
      const lng = raw.location?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") return null;
      return {
        lat,
        lng,
        label: raw.formattedAddress ?? raw.displayName?.text ?? query,
      };
    })
    .filter((r): r is GeocodeResult => r !== null);
}
