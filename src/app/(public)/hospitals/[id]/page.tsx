import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Phone,
  PhoneCall,
  Siren,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/layout/page-header";
import { HospitalDetailTabs } from "@/components/hospital/hospital-detail-tabs";
import { NavigateButton } from "@/components/hospital/navigate-button";
import { loadHospitalById } from "@/lib/hospital-service";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CENTER,
  FRESHNESS_MS,
} from "@/lib/constants";
import { estimateEtaMinutes, haversineKm, formatDistance } from "@/lib/utils";

export default async function HospitalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = await loadHospitalById(id);
  if (!hospital || hospital.status !== "VERIFIED") notFound();

  const doctors = await prisma.doctor.findMany({
    where: { hospitalId: id },
    orderBy: [{ availability: "asc" }, { experienceYears: "desc" }],
  });

  const reviews = await prisma.review.findMany({
    where: { hospitalId: id, status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const distanceKm = haversineKm(DEFAULT_CENTER, { lat: hospital.lat, lng: hospital.lng });
  const etaMinutes = estimateEtaMinutes(distanceKm);
  const stale =
    Date.now() - new Date(hospital.lastAvailabilityUpdate).getTime() > FRESHNESS_MS;

  return (
    <>
      <div className="border-b border-slate-200 bg-white">
        <div className="container py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Find Hospital", href: "/hospitals" },
              { label: hospital.name },
            ]}
          />

          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="institutional-heading text-2xl md:text-[1.75rem]">
                  {hospital.name}
                </h1>
                <Badge variant="green" size="md">
                  ✓ Verified Healthcare Provider
                </Badge>
                <Badge variant="primary" size="md">
                  <Building2 className="h-3 w-3" aria-hidden /> {hospital.type}
                </Badge>
              </div>

              <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <dd>
                    {hospital.addressLine}, {hospital.city} — {hospital.pincode}
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <dd>{hospital.phone}</dd>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-red-700">
                  <Siren className="h-4 w-4 shrink-0" aria-hidden />
                  <dt className="sr-only">Emergency number</dt>
                  <dd>
                    <a
                      href={`tel:${(hospital.emergencyPhone ?? "").replace(/\s/g, "")}`}
                      className="hover:underline underline-offset-2"
                    >
                      {hospital.emergencyPhone}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <Car className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  <dd>
                    {formatDistance(distanceKm)} · ~{etaMinutes} min ETA
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col items-end gap-2">
              <NavigateButton hospitalId={hospital.id} />
              <a href={`tel:${hospital.phone.replace(/\s/g, "")}`}>
                <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-primary-800 shadow-sm hover:bg-primary-50">
                  <PhoneCall className="h-4 w-4" aria-hidden /> Call Hospital
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 pb-14">
        {stale && (
          <p role="alert" className="mb-5 rounded-lg border border-status-unavailable-border bg-status-unavailable-bg px-4 py-2.5 text-sm font-medium text-red-800">
            ⚠️ Availability information may be outdated — last update{" "}
            {new Date(hospital.lastAvailabilityUpdate).toLocaleString("en-IN")}. Please confirm by phone.
          </p>
        )}
        <HospitalDetailTabs
          hospital={{
            ...hospital,
            lastAvailabilityUpdate: hospital.lastAvailabilityUpdate.toISOString(),
          }}
          distanceKm={Math.round(distanceKm * 10) / 10}
          etaMinutes={etaMinutes}
          stale={stale}
          doctors={doctors.map((d) => ({
            id: d.id,
            name: d.name,
            specialty: d.specialty,
            department: d.department,
            qualification: d.qualification,
            experienceYears: d.experienceYears,
            availability: d.availability,
            timings: d.timings,
            languages: d.languages,
          }))}
          reviews={reviews.map((r) => ({
            id: r.id,
            name: r.name,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt.toISOString(),
          }))}
        />

        <p className="mt-8 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
          Information on this page is provided by the facility and updated by its
          administrators. For medical advice, please consult a qualified
          professional. Found incorrect information?{" "}
          <Link href="/feedback" className="font-semibold text-care-600 hover:underline underline-offset-2">
            Report an issue →
          </Link>
        </p>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await loadHospitalById(id);
  if (!h) return { title: "Hospital not found" };
  return { title: `${h.name} — ${h.city}` };
}

export const dynamic = "force-dynamic";
