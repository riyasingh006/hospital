"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Award,
  CalendarPlus,
  MapPin,
  Navigation,
  Phone,
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BED_CATEGORIES, SERVICE_CATALOG } from "@/lib/constants";
import { estimateEtaMinutes, formatDistance, haversineKm } from "@/lib/utils";
import { loadPatientLocation } from "@/lib/patient/location";
import { SaveHospitalButton, useSavedHospitals } from "@/components/patient/save-hospital-button";
import { DirectionsDialog } from "@/components/patient/directions-dialog";
import { AppointmentDialog } from "@/components/patient/appointment-dialog";

interface Detail {
  hospital: {
    id: string;
    name: string;
    type: string;
    city: string;
    addressLine: string;
    pincode: string;
    phone: string;
    emergencyPhone: string | null;
    lat: number;
    lng: number;
    accreditation: string | null;
    lastAvailabilityUpdate: string;
    beds: { category: string; total: number; available: number }[];
    services: { key: string; status: string }[];
  };
  doctors: {
    id: string;
    name: string;
    specialty: string;
    availability: string;
    experienceYears: number;
  }[];
}

function bed(d: Detail, cat: string) {
  return d.hospital.beds.find((b) => b.category === cat);
}
function svc(d: Detail, key: string) {
  return d.hospital.services.find((s) => s.key === key)?.status ?? "UNKNOWN";
}
function typeLabel(t: string) {
  return t === "GOVERNMENT" || t === "PSU"
    ? "Government"
    : t === "TRUST"
      ? "Trust / NGO"
      : "Private";
}

/** Transparent client-side scoring mirroring the platform's factor weights. */
function computeMatch(d: Detail, origin: { lat: number; lng: number }) {
  const distanceKm = haversineKm(origin, {
    lat: d.hospital.lat,
    lng: d.hospital.lng,
  });
  const general = bed(d, "GENERAL");
  const icu = bed(d, "ICU");
  const bedScore =
    ((general?.available ?? 0) / Math.max(1, (general?.total ?? 1) * 0.25)) * 0.5 +
    ((icu?.available ?? 0) / Math.max(1, (icu?.total ?? 1) * 0.2)) * 0.5;
  const emergency =
    (svc(d, "EMERGENCY") === "AVAILABLE" ? 1 : svc(d, "EMERGENCY") === "LIMITED" ? 0.5 : 0) * 0.6 +
    ((bed(d, "EMERGENCY")?.available ?? 0) > 0 ? 0.4 : 0);
  const docsAvail =
    d.doctors.length === 0
      ? 0
      : d.doctors.filter((x) => x.availability !== "UNAVAILABLE").length /
        d.doctors.length;
  const servicesBreadth =
    d.hospital.services.length === 0
      ? 0
      : d.hospital.services.filter((s) => s.status !== "UNAVAILABLE").length /
        SERVICE_CATALOG.length;
  const distanceScore = Math.exp(-distanceKm / 9);

  const score =
    Math.min(bedScore, 1) * 0.2 +
    emergency * 0.15 +
    docsAvail * 0.25 +
    servicesBreadth * 0.15 +
    distanceScore * 0.25;

  const why: string[] = [];
  if (distanceKm <= 6) why.push(`${distanceKm.toFixed(1)} km away — short travel time`);
  else if (distanceScore >= 0.4) why.push(`${distanceKm.toFixed(1)} km away — reasonable travel time`);
  if (icu && icu.available > 0) why.push(`ICU available (${icu.available} beds free)`);
  if (docsAvail >= 0.5)
    why.push(
      `${d.doctors.filter((x) => x.availability !== "UNAVAILABLE").length} doctors currently available`
    );
  if (emergency >= 0.6) why.push("Emergency facility active");
  if (servicesBreadth >= 0.5)
    why.push(
      `${d.hospital.services.filter((s) => s.status !== "UNAVAILABLE").length} of ${SERVICE_CATALOG.length} tracked services available`
    );
  return { score: Math.round(score * 100), distanceKm, etaMinutes: estimateEtaMinutes(distanceKm), why };
}

function CompareClient() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const [details, setDetails] = React.useState<Detail[] | null>(null);
  const [failed, setFailed] = React.useState(false);
  const [origin, setOrigin] = React.useState<{ lat: number; lng: number } | null>(null);
  const [directionsFor, setDirectionsFor] = React.useState<Detail | null>(null);
  const [bookingFor, setBookingFor] = React.useState<Detail | null>(null);
  const { savedIds } = useSavedHospitals();

  React.useEffect(() => {
    const loc = loadPatientLocation();
    setOrigin(loc ? { lat: loc.lat, lng: loc.lng } : null);
  }, []);

  React.useEffect(() => {
    if (ids.length === 0) {
      setDetails([]);
      return;
    }
    let alive = true;
    Promise.all(
      ids.map((hid) =>
        fetch(`/api/hospitals/${hid}`, { cache: "no-store" })
          .then((r) => r.json())
          .catch(() => ({ ok: false }))
      )
    )
      .then((jsons) => {
        if (!alive) return;
        const okData = jsons
          .filter((j) => j.ok)
          .map((j) => j.data as Detail);
        setDetails(okData);
        if (okData.length === 0) setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ids.length === 0 || failed || (details && details.length === 0)) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title="Nothing to compare yet"
          description="Select up to three hospitals from Find Hospitals to compare them side by side."
          action={
            <Link href="/dashboard/hospitals">
              <Button variant="primary">Find Hospitals</Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-96 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const scored = details.map((d) => ({
    detail: d,
    match: computeMatch(d, origin ?? { lat: 28.6139, lng: 77.209 }),
  }));
  const best = scored.reduce((a, b) => (b.match.score > a.match.score ? b : a));

  const row = (
    label: string,
    render: (d: Detail) => React.ReactNode,
    highlight?: (d: Detail) => boolean
  ) => (
    <>
      <div className="data-label border-b border-slate-100 px-3 py-2.5">{label}</div>
      {scored.map(({ detail: d, match }, idx) => (
        <div
          key={label + idx}
          className={`border-b border-slate-100 px-3 py-2.5 text-sm ${
            highlight?.(d) ? "font-semibold text-primary-900" : "text-slate-700"
          }`}
        >
          {render(d)}
          {highlight?.(d) && scored.length > 1 && (
            <Badge variant="green" size="sm" className="ml-1.5 align-middle">
              best
            </Badge>
          )}
          {/* keep TS happy for unused match in closure */}
          <span className="hidden">{match.score}</span>
        </div>
      ))}
    </>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="institutional-heading text-2xl">Compare Hospitals</h1>
          <p className="mt-1 text-sm text-slate-600">
            Side-by-side view based on available information.
            {!origin && " Set your location in Find Hospitals for accurate distances."}
          </p>
        </div>
        <Link href="/dashboard/hospitals">
          <Button variant="secondary">Add or change selection</Button>
        </Link>
      </header>

      {/* ---------- Best match ---------- */}
      <Card className="mt-4 border-l-4 border-l-india-500">
        <CardContent className="flex flex-wrap items-start gap-4 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-india-50 text-india-600">
            <Award className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="data-label">Best Match Based on Your Selected Preferences</p>
            <h2 className="mt-0.5 text-lg font-bold text-primary-950">{best.detail.hospital.name}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Why this hospital?</p>
            <ul className="mt-1.5 grid gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
              {best.match.why.map((w) => (
                <li key={w} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-india-500" aria-hidden />
                  {w}
                </li>
              ))}
              {best.match.why.length === 0 && (
                <li>Recommended Option Based on Available Information.</li>
              )}
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              This is a navigation recommendation, not a medical assessment.
              Scores use bed availability, doctor availability, services,
              emergency capability and distance.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Comparison grid ---------- */}
      <div
        className="mt-6 grid gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200"
        style={{ gridTemplateColumns: `minmax(120px,180px) repeat(${scored.length}, minmax(220px,1fr))` }}
        role="table"
        aria-label="Hospital comparison"
      >
        {/* Header row */}
        <div className="bg-white px-3 py-3" role="columnheader">
          <span className="data-label">Feature</span>
        </div>
        {scored.map(({ detail: d, match }) => (
          <div key={d.hospital.id} className={`bg-white p-3 ${d.hospital.id === best.detail.hospital.id ? "ring-1 ring-inset ring-india-400" : ""}`} role="columnheader">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold leading-snug text-primary-950">
                <Link href={`/dashboard/hospitals/${d.hospital.id}`} className="hover:underline">
                  {d.hospital.name}
                </Link>
              </h3>
              <Badge variant="green" size="sm">{match.score}% match</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {typeLabel(d.hospital.type)}
              {d.hospital.accreditation ? ` · ${d.hospital.accreditation}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <SaveHospitalButton hospitalId={d.hospital.id} saved={savedIds.has(d.hospital.id)} />
            </div>
          </div>
        ))}

        {row(
          "Distance",
          (d) => {
            const m = computeMatch(d, origin ?? { lat: 28.6139, lng: 77.209 });
            return origin ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {formatDistance(m.distanceKm)}
              </span>
            ) : (
              "Set location"
            );
          },
          (d) =>
            Boolean(
              origin &&
                formatDistance(computeMatch(d, origin).distanceKm) ===
                  formatDistance(Math.min(...scored.map((s) => s.match.distanceKm)))
            )
        )}
        {row("Travel time", (d) => {
          const m = computeMatch(d, origin ?? { lat: 28.6139, lng: 77.209 });
          return `~${m.etaMinutes} min drive`;
        })}
        {row("Hospital type", (d) => typeLabel(d.hospital.type))}
        {row("Rating", () => <span className="text-slate-500">Not yet available</span>)}
        {row(
          "General beds",
          (d) => {
            const b = bed(d, "GENERAL");
            return b ? (
              <span className="tabular-nums">{b.available} of {b.total} free</span>
            ) : (
              <StatusBadge status="UNAVAILABLE" label="Unavailable" />
            );
          },
          (d) => {
            const vals = scored.map((s) => bed(s.detail, "GENERAL")?.available ?? -1);
            return (bed(d, "GENERAL")?.available ?? -1) === Math.max(...vals) && Math.max(...vals) > 0;
          }
        )}
        {row(
          "ICU",
          (d) => {
            const b = bed(d, "ICU");
            return b ? (
              <span className="tabular-nums">{b.available} of {b.total} free</span>
            ) : (
              <StatusBadge status="UNAVAILABLE" label="Unavailable" />
            );
          },
          (d) => {
            const vals = scored.map((s) => bed(s.detail, "ICU")?.available ?? -1);
            return (bed(d, "ICU")?.available ?? -1) === Math.max(...vals) && Math.max(...vals) > 0;
          }
        )}
        {row(
          "Emergency",
          (d) => (
            <StatusBadge
              status={svc(d, "EMERGENCY") === "UNKNOWN" ? "LIMITED" : svc(d, "EMERGENCY")}
              label={(bed(d, "EMERGENCY")?.available ?? 0) > 0 ? "Active" : "Limited"}
            />
          ),
          (d) =>
            svc(d, "EMERGENCY") === "AVAILABLE" &&
            (bed(d, "EMERGENCY")?.available ?? 0) > 0
        )}
        {row(
          "Doctors",
          (d) => (
            <span className="tabular-nums">
              {d.doctors.filter((x) => x.availability !== "UNAVAILABLE").length} of{" "}
              {d.doctors.length} available
            </span>
          ),
          (d) => {
            const vals = scored.map(
              (s) => s.detail.doctors.filter((x) => x.availability !== "UNAVAILABLE").length
            );
            return (
              d.doctors.filter((x) => x.availability !== "UNAVAILABLE").length ===
                Math.max(...vals) && Math.max(...vals) > 0
            );
          }
        )}
        {row(
          "Specialities",
          (d) => (
            <span className="line-clamp-2 text-xs">
              {Array.from(new Set(d.doctors.map((x) => x.specialty))).join(", ") ||
                "Information unavailable"}
            </span>
          )
        )}
        {row(
          "Appointment availability",
          () => <span className="text-xs text-slate-500">Currently unavailable — request via booking flow</span>
        )}

        {/* Services matrix */}
        {SERVICE_CATALOG.map((s) => (
          <React.Fragment key={s.key}>
            <div className="data-label border-b border-slate-100 px-3 py-2.5">{s.label}</div>
            {scored.map(({ detail: d }) => {
              const st = svc(d, s.key);
              return (
                <div key={d.hospital.id + s.key} className="border-b border-slate-100 px-3 py-2.5">
                  {st === "UNKNOWN" ? (
                    <span className="text-xs text-slate-400">Information unavailable</span>
                  ) : (
                    <StatusBadge status={st} />
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}

        {row("Contact", (d) => (
          <a href={`tel:${d.hospital.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 font-medium text-care-700 hover:underline">
            <Phone className="h-3.5 w-3.5" aria-hidden /> {d.hospital.phone}
          </a>
        ))}

        {/* Actions */}
        <div className="bg-white px-3 py-3"><span className="data-label">Actions</span></div>
        {scored.map(({ detail: d }) => (
          <div key={"actions-" + d.hospital.id} className="flex flex-wrap gap-1.5 bg-white px-3 py-3">
            <Button variant="subtle" size="sm" onClick={() => setDirectionsFor(d)}>
              <Navigation className="h-3.5 w-3.5" aria-hidden /> Directions
            </Button>
            <Button variant="primary" size="sm" onClick={() => setBookingFor(d)}>
              <CalendarPlus className="h-4 w-4 hidden sm:inline" aria-hidden /> Book
            </Button>
          </div>
        ))}
      </div>

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
        open={bookingFor !== null}
        onOpenChange={(v) => !v && setBookingFor(null)}
        doctor={
          bookingFor
            ? {
                id: bookingFor.doctors[0]?.id ?? `generic-${bookingFor.hospital.id}`,
                name: bookingFor.doctors[0]?.name ?? "General Physician",
                specialtyLabel: "General consultation",
                hospitalId: bookingFor.hospital.id,
                hospitalName: bookingFor.hospital.name,
                hospitalPhone: bookingFor.hospital.phone,
                hospitalCity: bookingFor.hospital.city,
                timings: null,
              }
            : null
        }
      />

      <p className="mt-6 text-[11px] leading-relaxed text-slate-400">
        Bed availability reflects the Jeevan Sahay sample dataset maintained
        manually by facilities ({BED_CATEGORIES.length} categories tracked).
        Verify critical capacity by phone before travelling.
      </p>
    </div>
  );
}

function ComparePage() {
  return (
    <React.Suspense fallback={<div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">{[0, 1, 2].map((i) => (<div key={i} className="h-96 w-full rounded-xl bg-slate-100" />))}</div>}>
      <CompareClient />
    </React.Suspense>
  );
}

export default ComparePage;
