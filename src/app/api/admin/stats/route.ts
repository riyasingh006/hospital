import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ok, withApi } from "@/lib/api-helpers";

export const GET = withApi(async () => {
  await requireRole("SUPER_ADMIN");

  const [users, verifiedHospitals, pendingHospitals, beds, specialists, emergencySearches, openReports] =
    await Promise.all([
      prisma.user.count(),
      prisma.hospital.count({ where: { status: "VERIFIED" } }),
      prisma.hospital.findMany({
        where: { status: { in: ["PENDING_VERIFICATION", "REJECTED"] } },
        select: { id: true, name: true, city: true, type: true, status: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bedInventory.aggregate({
        _sum: { total: true, available: true },
      }),
      prisma.doctor.count({ where: { availability: "AVAILABLE" } }),
      prisma.searchRecord.count({
        where: { mode: "EMERGENCY", createdAt: { gte: new Date(Date.now() - 7 * 864e5) } },
      }),
      prisma.report.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    ]);

  const recentAudit = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
    include: { actor: { select: { name: true } } },
  });

  return ok({
    stats: {
      registeredUsers: users,
      verifiedHospitals,
      pendingHospitals: pendingHospitals.filter((h) => h.status === "PENDING_VERIFICATION").length,
      totalBeds: beds._sum.total ?? 0,
      availableBeds: beds._sum.available ?? 0,
      activeSpecialists: specialists,
      emergencySearches,
      openReports,
    },
    queue: pendingHospitals,
    auditTrail: recentAudit,
  });
});
