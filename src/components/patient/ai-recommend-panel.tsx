"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Loader2,
  LocateFixed,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import {
  getCurrentPosition,
  loadPatientLocation,
  savePatientLocation,
  type GeoErrorKind,
} from "@/lib/patient/location";
import { AiRecommendationCard, type AiMatch } from "@/components/patient/ai-recommend-card";
import { HospitalMapDynamic } from "@/components/patient/map-loader";
import { DirectionsDialog } from "@/components/patient/directions-dialog";
import { AppointmentDialog, type BookingDoctor } from "@/components/patient/appointment-dialog";

const GEO_HINTS: Record<GeoErrorKind, string> = {
  denied: "We couldn't determine your location. Enter an address to continue.",
  unavailable: "We couldn't determine your location. Enter an address to continue.",
  timeout: "Locating you took too long. Enter an address to continue.",
  unsupported: "Geolocation is not supported by this browser. Enter an address to continue.",
  unknown: "We couldn't determine your location. Enter an address to continue.",
};

const LOADING_STEPS = [
  "Understanding your healthcare need...",
  "Finding nearby hospitals...",
  "Comparing available options...",
  "Selecting the best matches...",
];

interface Interpretation {
  specialtyLabel: string | null;
  serviceLabel: string | null;
  urgency: "EMERGENCY" | "URGENT" | "ROUTINE";
  prefersGovernment: boolean;
  source: "ai" | "rules";
  summary: string;
  totalCandidates: number;
}

interface RecommendResponse {
  matches: (AiMatch & { why: string[] })[];
  interpretation: Interpretation;
}

export function AiFindBestHospitals() {
  const router = useRouter();
  const { toast } = useToast();

  const [need, setNeed] = React.useState("");
  const [addressQuery, setAddressQuery] = React.useState("");
  const [location, setLocation] = React.useState<{ lat: number; lng: number; label: string } | null>(null);
  const [geoBusy, setGeoBusy] = React.useState(false);

  const [running, setRunning] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [result, setResult] = React.useState<RecommendResponse | null>(null);
  const [lastRunKey, setLastRunKey] = React.useState("");
  const [errorKind, setErrorKind] = React.useState<"empty" | "no-location" | "none" | "hospitals" | "ai" | "api">("none");

  const [compare, setCompare] = React.useState<string[]>([]);
  const [directionsFor, setDirectionsFor] = React.useState<AiMatch | null>(null);
  const [bookFor, setBookFor] = React.useState<AiMatch | null>(null);

  // Restore last used location once — no repeated geolocation prompts.
  React.useEffect(() => {
    const savedLoc = loadPatientLocation();
    if (savedLoc)
      setLocation({ lat: savedLoc.lat, lng: savedLoc.lng, label: savedLoc.label });
  }, []);

  // Sequential loading status while the recommendation request runs.
  React.useEffect(() => {
    if (!running) return;
    setStepIndex(0);
    const t = window.setInterval(
      () => setStepIndex((i) => Math.min(i + 1, LOADING_STEPS.length - 1)),
      900
    );
    return () => window.clearInterval(t);
  }, [running]);

  async function locateMe() {
    setGeoBusy(true);
    try {
      const pos = await getCurrentPosition();
      const label = "My current location";
      setLocation({ ...pos, label });
      setErrorKind("none");
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
      setGeoBusy(false);
    }
  }

  async function submitAddress(e?: React.FormEvent) {
    e?.preventDefault();
    const q = addressQuery.trim();
    if (q.length < 3) return;
    setGeoBusy(true);
    try {
      const res = await fetch(`/api/patient/geocode?q=${encodeURIComponent(q)}`);
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
      const label = `${String(first.label).split(",")[0].trim()} (from address)`;
      setLocation({ lat: first.lat, lng: first.lng, label });
      setErrorKind("none");
      savePatientLocation({
        lat: first.lat,
        lng: first.lng,
        label: String(first.label),
        source: "address",
        savedAt: new Date().toISOString(),
      });
    } catch {
      toast({ title: "Address lookup failed", description: "Please try again in a moment.", variant: "error" });
    } finally {
      setGeoBusy(false);
    }
  }

  async function runRecommendation() {
    if (running) return;
    if (need.trim().length < 10) {
      setErrorKind("empty");
      return;
    }
    if (!location) {
      setErrorKind("no-location");
      return;
    }
    setErrorKind("none");
    setRunning(true);
    setResult(null);
    setCompare([]);

    // Avoid duplicate API calls for the exact same need + location.
    const runKey = `${need.trim()}|${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;
    if (runKey === lastRunKey && result) {
      setRunning(false);
      return;
    }

    try {
      const res = await fetch("/api/patient/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ need: need.trim(), lat: location.lat, lng: location.lng }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "recommend failed");
      const data = json.data as RecommendResponse;
      if (!data.matches || data.matches.length === 0) {
        setErrorKind("hospitals");
      } else {
        setResult(data);
        setLastRunKey(runKey);
      }
    } catch {
      setErrorKind("ai");
    } finally {
      setRunning(false);
    }
  }

  const mapCenter = React.useMemo(() => {
    if (location) return { lat: location.lat, lng: location.lng };
    if (result?.matches[0]) {
      const h = result.matches[0].hospital;
      return { lat: h.lat, lng: h.lng };
    }
    return { lat: 28.6139, lng: 77.209 };
  }, [location, result]);

  const mapMarkers = React.useMemo(
    () =>
      (result?.matches ?? []).map((m, i) => ({
        id: m.hospital.id,
        lat: m.hospital.lat,
        lng: m.hospital.lng,
        label: `${String(i + 1).padStart(2, "0")} · ${m.hospital.name}`,
        emergency: m.hospital.services.some(
          (s) => s.key === "EMERGENCY" && s.status !== "UNAVAILABLE"
        ),
        highlight: i === 0 ? ("primary" as const) : ("secondary" as const),
      })),
    [result]
  );

  const bookDoctor: BookingDoctor | null = React.useMemo(() => {
    if (!bookFor) return null;
    const h = bookFor.hospital;
    return {
      id: `generic-${h.id}`,
      name: h.doctors[0] ? "Consultant" : "General Physician",
      specialtyLabel:
        result?.interpretation.specialtyLabel ?? "General consultation",
      hospitalId: h.id,
      hospitalName: h.name,
      hospitalPhone: h.phone,
      hospitalCity: h.city,
      timings: null,
    };
  }, [bookFor, result]);

  return (
    <div className="space-y-6">
      {/* ---------- AI panel ---------- */}
      <Card className="overflow-hidden border-primary-100 shadow-raised">
        <div className="h-1 w-full bg-gradient-to-r from-[#062B67] via-[#0B5ED7] to-[#F57C00]" aria-hidden />
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary" size="md" className="uppercase tracking-wide">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> AI-Powered Hospital Discovery
            </Badge>
            {result && (
              <Badge variant={result.interpretation.source === "ai" ? "green" : "neutral"} size="sm">
                {result.interpretation.source === "ai"
                  ? "AI interpretation"
                  : "Rule-based interpretation"}
              </Badge>
            )}
          </div>
          <h2 className="mt-3 text-xl font-bold text-[#062B67]">
            Not sure which hospital to choose?
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
            Tell Jeevan Sahay about your healthcare need and we&apos;ll help you
            find suitable hospitals near you.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_minmax(280px,360px)]">
            {/* Healthcare need */}
            <div className="space-y-1.5">
              <Label htmlFor="ai-need" className="data-label">
                Describe your healthcare need
              </Label>
              <textarea
                id="ai-need"
                value={need}
                onChange={(e) => {
                  setNeed(e.target.value);
                  if (errorKind === "empty") setErrorKind("none");
                }}
                rows={4}
                maxLength={600}
                placeholder="Tell us about your problem, symptoms or healthcare requirement..."
                aria-describedby="ai-need-example"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-care-500 focus:outline-none focus:ring-2 focus:ring-care-200"
              />
              <p id="ai-need-example" className="text-xs italic text-slate-400">
                Example: I need a hospital for heart-related care near me
              </p>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <fieldset className="space-y-2 rounded-lg border border-slate-200 bg-paper/60 p-3.5">
                <legend className="data-label px-1">Location</legend>

                <Button
                  type="button"
                  variant="outlineSaffron"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={() => void locateMe()}
                  disabled={geoBusy}
                >
                  {geoBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <LocateFixed className="h-4 w-4" aria-hidden />
                  )}
                  Use My Current Location
                </Button>

                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-400">
                  <span className="h-px flex-1 bg-slate-200" aria-hidden /> or{" "}
                  <span className="h-px flex-1 bg-slate-200" aria-hidden />
                </div>

                <form onSubmit={(e) => void submitAddress(e)} className="space-y-1.5">
                  <Input
                    value={addressQuery}
                    onChange={(e) => setAddressQuery(e.target.value)}
                    placeholder="Enter city, area, address or PIN code"
                    aria-label="Enter address"
                  />
                  <p className="text-[11px] leading-snug text-slate-400">
                    e.g. Sector 17, Chandigarh · Gurugram · 122001
                  </p>
                  <button type="submit" className="sr-only">
                    Look up address
                  </button>
                </form>

                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-care-500" aria-hidden />
                  Using:{" "}
                  <span className="font-medium text-primary-800">
                    {location?.label ?? "No location selected yet"}
                  </span>
                </p>
              </fieldset>

              <Button
                variant="emergency"
                size="lg"
                className="w-full justify-center gap-2 py-4 text-base"
                onClick={() => void runRecommendation()}
                disabled={running}
              >
                {running ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                    Finding best matches…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" aria-hidden />
                    Find My Best Hospitals
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Inline errors */}
          {errorKind === "empty" && (
            <p role="alert" className="mt-3 rounded-lg border border-status-unavailable-border bg-status-unavailable-bg px-3.5 py-2 text-sm font-medium text-red-800">
              Please describe your healthcare need first.
            </p>
          )}
          {errorKind === "no-location" && (
            <p role="alert" className="mt-3 rounded-lg border border-status-unavailable-border bg-status-unavailable-bg px-3.5 py-2 text-sm font-medium text-red-800">
              We couldn&apos;t determine your location. Enter an address to continue.
            </p>
          )}
          {errorKind === "hospitals" && (
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="No suitable hospitals were found for this location and healthcare need."
              description="Try widening your search area or describing the need differently."
            />
          )}
          {errorKind === "ai" && (
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="We couldn't generate recommendations right now."
              description="You can still use regular hospital search."
              action={
                <Button variant="secondary" onClick={() => router.refresh()}>
                  Back to regular search
                </Button>
              }
            />
          )}

          <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
            Jeevan Sahay provides healthcare navigation only — it does not
            diagnose conditions or replace medical advice from a doctor. In an
            emergency call 112.
          </p>
        </CardContent>
      </Card>

      {/* ---------- Sequential loading ---------- */}
      {running && (
        <Card aria-busy="true" aria-live="polite">
          <CardContent className="space-y-2.5 p-6">
            {LOADING_STEPS.map((step, i) => (
              <p
                key={step}
                className={`flex items-center gap-2.5 text-sm ${
                  i <= stepIndex ? "text-slate-700" : "text-slate-300"
                } ${i === stepIndex ? "font-semibold animate-fade-in" : ""}`}
              >
                {i < stepIndex ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-india-500 text-white" aria-hidden>✓</span>
                ) : i === stepIndex ? (
                  <Loader2 className="h-5 w-5 animate-spin text-care-600" aria-hidden />
                ) : (
                  <span className="inline-block h-5 w-5 rounded-full border-2 border-slate-200" aria-hidden />
                )}
                {step}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ---------- Results ---------- */}
      {result && result.matches.length > 0 && (
        <section aria-label="AI recommended hospitals" className="animate-fade-in">
          <div className="rounded-xl bg-gradient-to-r from-[#031C45] to-[#062B67] px-5 py-4 text-white">
            <h3 className="text-lg font-bold">Your Top Matches</h3>
            <p className="mt-0.5 text-sm leading-relaxed text-white/80">
              {result.interpretation.summary}
            </p>
            <p className="mt-1 text-xs text-white/60">
              Recommended Based on Available Information · {result.interpretation.totalCandidates} verified facilities compared
              {result.interpretation.specialtyLabel ? ` · ${result.interpretation.specialtyLabel}` : ""}
              {result.interpretation.serviceLabel ? ` · ${result.interpretation.serviceLabel}` : ""}
            </p>
          </div>

          {result.interpretation.urgency === "EMERGENCY" && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              Your description may require urgent medical evaluation. If
              symptoms are severe, call{" "}
              <a href="tel:112" className="font-bold underline">112</a> now — do
              not wait for online results.
            </div>
          )}

          <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {result.matches.map((m, i) => (
                <AiRecommendationCard
                  key={m.hospital.id}
                  match={{ ...m, why: m.why ?? [] }}
                  index={i}
                  onCompare={(id) =>
                    setCompare((prev) => {
                      if (prev.includes(id)) return prev.filter((x) => x !== id);
                      if (prev.length >= 3) {
                        toast({
                          title: "You can compare up to 3 hospitals",
                          description: "The comparison view supports three at a time.",
                          variant: "info",
                        });
                        return prev;
                      }
                      return [...prev, id];
                    })
                  }
                  compareChecked={compare.includes(m.hospital.id)}
                  onDirections={setDirectionsFor}
                  onBook={setBookFor}
                />
              ))}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <Button
                  variant="primary"
                  size="lg"
                  className="gap-2"
                  onClick={() => router.push(`/dashboard/compare?ids=${compare.join(",")}`)}
                  disabled={compare.length < 2}
                >
                  Compare Top Hospitals{compare.length >= 2 ? ` (${compare.length})` : ""}
                </Button>
                <p className="text-xs text-slate-400">
                  Select 2–4 matches above to open the existing comparison view.
                </p>
              </div>
            </div>

            {/* Map — same component as manual search */}
            <div className="hidden xl:block">
              <Card className="sticky top-24 overflow-hidden">
                <div className="map-shell h-[520px]">
                  <HospitalMapDynamic
                    center={mapCenter}
                    markers={mapMarkers}
                    userLocation={location}
                  />
                </div>
                <CardContent className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-saffron-400" /> #1 best match
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-care-400" /> matches 2–4
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#B42318]" /> emergency-capable
                  </span>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <DirectionsDialog
        open={directionsFor !== null}
        onOpenChange={(v) => !v && setDirectionsFor(null)}
        destination={
          directionsFor
            ? {
                id: directionsFor.hospital.id,
                name: directionsFor.hospital.name,
                lat: directionsFor.hospital.lat,
                lng: directionsFor.hospital.lng,
                city: directionsFor.hospital.city,
              }
            : null
        }
      />

      <AppointmentDialog
        open={bookFor !== null}
        onOpenChange={(v) => !v && setBookFor(null)}
        doctor={bookDoctor}
      />
    </div>
  );
}
