import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { rankHospitals } from "@/lib/scoring";
import { loadVerifiedHospitals } from "@/lib/hospital-service";
import { ok, withApi } from "@/lib/api-helpers";

/** Aggregated patient dashboard payload. */
export const GET = withApi(async () => {
  const session = await requireSession();

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { location: true },
  });

  const [hospitalsRaw, recentSearches, saved, unreadNotifications] =
    await Promise.all([
      loadVerifiedHospitals(),
      prisma.searchRecord.findMany({
        where: { userId: session.sub },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.savedHospital.findMany({
        where: { userId: session.sub },
        include: {
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              type: true,
              phone: true,
              lat: true,
              lng: true,
              lastAvailabilityUpdate: true,
              beds: { where: { category: { in: ["GENERAL", "ICU"] } } },
            },
          },
        },
        take: 4,
      }),
      prisma.notification.count({
        where: { userId: session.sub, read: false },
      }),
    ]);

  const rankedNearby = rankHospitals(hospitalsRaw, {
    requiresEmergency: false,
    location: undefined, // no geolocation permission assumed — rank by capability
  }).slice(0, 4);

  const emergencyFacilities = hospitalsRaw.filter(
    (h) =>
      h.services.some(
        (s) => s.key === "EMERGENCY" && s.status !== "UNAVAILABLE"
      )
  ).length;

  return ok({
    greetingName:
      session.name?.trim().split(" ")[0] ||
      session.email?.split("@")[0]?.trim() ||
      "there",
    location: user?.location ?? null,
    cards: {
      nearbyHospitals: hospitalsRaw.length,
      emergencyFacilities,
    },
    nearby: rankedNearby.map((r) => ({
      id: r.hospital.id,
      name: r.hospital.name,
      city: r.hospital.city,
      type: r.hospital.type,
      score: r.score,
      lat: r.hospital.lat,
      lng: r.hospital.lng,
      icuAvailable:
        r.hospital.beds.find((b) => b.category === "ICU")?.available ?? 0,
      generalAvailable:
        r.hospital.beds.find((b) => b.category === "GENERAL")?.available ?? 0,
      emergencyActive: r.hospital.services.some(
        (s) => s.key === "EMERGENCY" && s.status !== "UNAVAILABLE"
      ),
    })),
    recentSearches,
    saved,
    unreadNotifications,
  });
});
