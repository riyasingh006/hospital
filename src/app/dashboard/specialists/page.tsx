"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ClipboardPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SPECIALTIES } from "@/lib/constants";

interface DoctorLite {
  specialty: string;
  availability: string;
  hospital: { id: string; name: string };
}

export default function SpecialistsPage() {
  const [doctors, setDoctors] = React.useState<DoctorLite[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetch("/api/doctors", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json.ok) setDoctors(json.data.doctors ?? []);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const bySpecialty = React.useMemo(() => {
    const map = new Map<string, { total: number; available: number; hospitals: Set<string> }>();
    for (const d of doctors ?? []) {
      const entry = map.get(d.specialty) ?? { total: 0, available: 0, hospitals: new Set() };
      entry.total += 1;
      if (d.availability !== "UNAVAILABLE") entry.available += 1;
      entry.hospitals.add(d.hospital.name);
      map.set(d.specialty, entry);
    }
    return map;
  }, [doctors]);

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="institutional-heading text-2xl">Specialists</h1>
        <p className="mt-1 text-sm text-slate-600">
          Browse specialities available across the verified network.
        </p>
      </header>

      {failed && (
        <div className="mt-6">
          <EmptyState
            title="Could not load specialists"
            description="Please try again in a moment."
          />
        </div>
      )}

      {!failed && doctors === null && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {!failed && doctors !== null && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIALTIES.map((s) => {
            const info = bySpecialty.get(s.key);
            return (
              <Card key={s.key} className="transition-shadow hover:shadow-raised">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-800">
                      <ClipboardPlus className="h-5 w-5" aria-hidden />
                    </span>
                    {info ? (
                      <Badge variant={info.available > 0 ? "green" : "neutral"} size="sm">
                        {info.available > 0
                          ? `${info.available} available`
                          : "No availability"}
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">Information unavailable</Badge>
                    )}
                  </div>
                  <h2 className="mt-3 text-base font-semibold text-primary-950">{s.label}</h2>
                  <p className="text-xs text-slate-500">{s.hi}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    {info
                      ? `${info.total} doctor${info.total === 1 ? "" : "s"} · ${info.hospitals.size} hospital${info.hospitals.size === 1 ? "" : "s"}`
                      : "No listed consultants yet."}
                  </p>
                  <Link
                    href={`/dashboard/doctors?specialty=${s.key}`}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-care-700 hover:underline"
                  >
                    View specialists <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
