import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, idFromUrl, ok, withApi } from "@/lib/api-helpers";

export const GET = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    // Dynamic segment parsed from the URL (wrapper handlers stay single-arg).
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");

    if (
      !(
        session.role === "SUPER_ADMIN" ||
        (session.role === "HOSPITAL_ADMIN" && session.hospitalId === hospitalId)
      )
    )
      return fail(403, "You can only view analytics for your own facility.");

    const since = new Date();
    since.setDate(since.getDate() - 13);
    since.setHours(0, 0, 0, 0);

    const [series, beds, services, doctors] = await Promise.all([
      prisma.dailyStat.findMany({
        where: { hospitalId, date: { gte: since } },
        orderBy: { date: "asc" },
      }),
      prisma.bedInventory.findMany({ where: { hospitalId } }),
      prisma.service.findMany({ where: { hospitalId } }),
      prisma.doctor.groupBy({
        by: ["availability"],
        where: { hospitalId },
        _count: true,
      }),
    ]);

    const totalBeds = beds.reduce((s, b) => s + b.total, 0);
    const availableBeds = beds.reduce((s, b) => s + b.available, 0);

    return ok({
      series: series.map((d) => ({
        date: d.date,
        admissions: d.admissions,
        discharges: d.discharges,
        emergencyCases: d.emergencyCases,
        occupancyGeneral: d.occupancyGeneral,
        occupancyIcu: d.occupancyIcu,
      })),
      summary: {
        currentOccupancy:
          totalBeds > 0
            ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100)
            : 0,
        totalBeds,
        availableBeds,
        icu: beds.find((b) => b.category === "ICU") ?? null,
        emergencyStatus:
          services.find((s) => s.key === "EMERGENCY")?.status ?? "UNKNOWN",
        activeSpecialists: doctors.find((d) => d.availability === "AVAILABLE")?._count ?? 0,
      },
    });
  },
  { limit: 60, windowMs: 60_000, keyPrefix: "analytics" }
);
