import { prisma } from "@/lib/prisma";
import { ok, withApi } from "@/lib/api-helpers";

/** Public platform counters for the landing page. */
export const GET = withApi(async () => {
  const [verifiedHospitals, beds, doctors, users] = await Promise.all([
    prisma.hospital.count({ where: { status: "VERIFIED" } }),
    prisma.bedInventory.aggregate({
      where: { hospital: { status: "VERIFIED" } },
      _sum: { available: true, total: true },
    }),
    prisma.doctor.count(),
    prisma.user.count(),
  ]);

  return ok({
    verifiedHospitals,
    availableBeds: beds._sum.available ?? 0,
    totalBeds: beds._sum.total ?? 0,
    doctors,
    registeredUsers: users,
  });
});
