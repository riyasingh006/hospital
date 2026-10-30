"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Crosshair,
  FilterX,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { HospitalCard, type HospitalResultItem } from "@/components/hospital/hospital-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOSPITAL_TYPES, SERVICE_CATALOG, SPECIALTIES, DEFAULT_CENTER } from "@/lib/constants";

interface Filters {
  q: string;
  specialty: string;
  type: string;
  service: string;
  emergency: boolean;
  icu: boolean;
  beds: boolean;
  diagnostics: boolean;
  maxDistance: number;
}

const DEFAULTS: Filters = {
  q: "",
  specialty: "",
  type: "",
  service: "",
  emergency: false,
  icu: false,
  beds: false,
  diagnostics: false,
  maxDistance: 50,
};

export function HospitalsClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Filters>({
    ...DEFAULTS,
    q: searchParams.get("q") ?? "",
    specialty: searchParams.get("specialty") ?? "",
    icu: searchParams.get("icu") === "1",
    emergency: searchParams.get("emergency") === "1",
    service: searchParams.get("service") ?? "",
  });
  const [results, setResults] = React.useState<HospitalResultItem[]>([]);
  const [totalMatched, setTotalMatched] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [savedIds, setSavedIds] = React.useState<string[]>([]);
  const [compare, setCompare] = React.useState<string[]>([]);
  const [geoNote, setGeoNote] = React.useState<string | null>(null);
  const [coords, setCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

  const loadSaved = React.useCallback(async () => {
    try {
      const res = await fetch("/api/user/saved", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok)
        setSavedIds(json.data.saved.map((s: { hospitalId: string }) => s.hospitalId));
    } catch {
      /* guest */
    }
  }, []);

  const runSearch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams();
      if (filters.q) p.set("q", filters.q);
      if (filters.specialty) p.set("specialty", filters.specialty);
      if (filters.type) p.set("type", filters.type);
      if (filters.service) p.set("service", filters.service);
      if (filters.emergency) p.set("emergency", "1");
      if (filters.icu) p.set("icu", "1");
      if (filters.beds) p.set("beds", "1");
      if (filters.diagnostics) p.set("diagnostics", "1");
      if (coords) {
        p.set("lat", String(coords.lat));
        p.set("lng", String(coords.lng));
      }
      p.set("limit", "30");
      const res = await fetch(`/api/hospitals/search?${p}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error ?? "Search failed");
      setResults(json.data.results);
      setTotalMatched(json.data.totalMatched);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [filters, coords]);

  React.useEffect(() => {
    void runSearch();
  }, [runSearch]);

  React.useEffect(() => {
    void loadSaved();
  }, [loadSaved]);

  // Debounced text search
  React.useEffect(() => {
    const id = window.setTimeout(() => void runSearch(), 350);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoNote("Geolocation is not supported on this browser — showing Delhi NCR results.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoNote("Ranking by distance from your current location.");
      },
      () =>
        setGeoNote(
          "Location permission denied — using central New Delhi as reference point."
        )
    );
  };

  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const filterPanel = (
    <div className="space-y-5">
      <div>
        <Label htmlFor="f-specialty" className="data-label mb-1.5 block">
          Medical specialty
        </Label>
        <Select
          value={filters.specialty}
          onValueChange={(v) => setFilters((f) => ({ ...f, specialty: v === "ALL" ? "" : v }))}
        >
          <SelectTrigger id="f-specialty">
            <SelectValue placeholder="All specialties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="f-type" className="data-label mb-1.5 block">
          Hospital type
        </Label>
        <Select
          value={filters.type}
          onValueChange={(v) => setFilters((f) => ({ ...f, type: v === "ALL" ? "" : v }))}
        >
          <SelectTrigger id="f-type">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Any type</SelectItem>
            {HOSPITAL_TYPES.map((t) => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Availability requirements
        </legend>
        {(
          [
            ["emergency", "Emergency availability"],
            ["icu", "ICU available"],
            ["beds", "General beds available"],
            ["diagnostics", "Diagnostics on site"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between gap-3 text-sm text-slate-700">
            {label}
            <Switch
              checked={filters[key]}
              onCheckedChange={(v) => setFilters((f) => ({ ...f, [key]: v }))}
              aria-label={label}
            />
          </label>
        ))}
      </fieldset>

      <div>
        <Label htmlFor="f-service" className="data-label mb-1.5 block">
          Specific service
        </Label>
        <Select
          value={filters.service}
          onValueChange={(v) => setFilters((f) => ({ ...f, service: v === "ANY" ? "" : v }))}
        >
          <SelectTrigger id="f-service">
            <SelectValue placeholder="Any service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ANY">Any service</SelectItem>
            {SERVICE_CATALOG.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label htmlFor="f-distance">Maximum distance</Label>
          <span className="text-sm font-semibold text-primary-800">
            {filters.maxDistance >= 50 ? "50+ km" : `${filters.maxDistance} km`}
          </span>
        </div>
        <Slider
          id="f-distance"
          min={2}
          max={50}
          step={2}
          value={[filters.maxDistance]}
          onValueChange={([v]) => setFilters((f) => ({ ...f, maxDistance: v }))}
          aria-label="Maximum distance in kilometres"
        />
      </div>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          setFilters(DEFAULTS);
          setCoords(null);
          setGeoNote(null);
        }}
      >
        <FilterX className="h-4 w-4" aria-hidden /> Reset all filters
      </Button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Find Hospital"
        subtitle="Ranked by medical suitability, specialist and bed availability, emergency capability and travel time."
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Find Hospital" }]}
      />

      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        {/* ---------- Filters (desktop) ---------- */}
        <aside className="hidden lg:block" aria-label="Search filters">
          <div className="sticky top-32 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary-900">
              <SlidersHorizontal className="h-4 w-4 text-care-600" aria-hidden /> Filters
            </h2>
            {filterPanel}
          </div>
        </aside>

        {/* ---------- Results ---------- */}
        <section aria-label="Hospital results">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-card">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <Input
                value={filters.q}
                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                placeholder="Describe your requirement or search hospitals…"
                className="pl-9"
                aria-label="Search hospitals"
              />
            </div>
            <Button variant="outlineSaffron" size="md" onClick={useMyLocation}>
              <Crosshair className="h-4 w-4" aria-hidden /> Use My Location
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filters
            </Button>
          </div>

          {geoNote && (
            <p role="status" className="mt-2 rounded-lg bg-status-info-bg px-3 py-2 text-xs font-medium text-status-info-fg">
              {geoNote} (Default reference: {DEFAULT_CENTER.lat.toFixed(2)}°N, {DEFAULT_CENTER.lng.toFixed(2)}°E)
            </p>
          )}

          {mobileFiltersOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-5 shadow-card lg:hidden">
              {filterPanel}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-slate-600" role="status">
              {loading ? (
                "Searching…"
              ) : (
                <>
                  <strong className="font-semibold text-primary-900">{results.length}</strong>{" "}
                  of {totalMatched} suitable facilities
                  {compare.length > 0 && (
                    <>
                      {" · "}
                      <Link href={`/compare?ids=${compare.join(",")}`} className="font-semibold text-care-600 hover:underline">
                        Compare {compare.length} selected →
                      </Link>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          <div className="mt-3 space-y-4 pb-12">
            {error && (
              <EmptyState
                title="Search failed"
                description={error}
                action={<Button onClick={() => void runSearch()}>Retry search</Button>}
              />
            )}
            {!error && loading &&
              [0, 1, 2].map((i) => <CardSkeleton key={i} />)}
            {!loading && !error && results.length === 0 && (
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No matching hospitals found"
                description="Try widening your distance range or removing some availability filters."
                action={
                  <Button variant="secondary" onClick={() => setFilters(DEFAULTS)}>
                    Clear filters
                  </Button>
                }
              />
            )}
            {!loading &&
              !error &&
              results.map((item) => (
                <HospitalCard
                  key={item.hospital.id}
                  item={item}
                  saved={savedIds.includes(item.hospital.id)}
                  onToggleSave={(id, next) =>
                    setSavedIds((prev) =>
                      next ? [...prev, id] : prev.filter((x) => x !== id)
                    )
                  }
                  onCompare={toggleCompare}
                  compareChecked={compare.includes(item.hospital.id)}
                />
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
