import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, requireRole, writeAudit } from "@/lib/auth";
import { fail, ok, parseBody, withApi } from "@/lib/api-helpers";

export const GET = withApi(async () => {
  await requireRole("SUPER_ADMIN");
  const hospitals = await prisma.hospital.findMany({
    include: {
      beds: true,
      _count: { select: { doctors: true, services: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return ok({ hospitals });
});

/** Approve / reject a pending hospital registration. */
export const POST = withApi(
  async (req) => {
    const session = await requireRole("SUPER_ADMIN");
    const schema = z.object({
      hospitalId: z.string().min(1),
      decision: z.enum(["VERIFIED", "REJECTED"]),
      reason: z.string().trim().max(300).optional(),
    });
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;

    const hospital = await prisma.hospital.findUnique({
      where: { id: parsed.data.hospitalId },
    });
    if (!hospital) return fail(404, "Hospital not found.");
    if (hospital.status !== "PENDING_VERIFICATION")
      return fail(409, "This hospital has already been reviewed.");

    const updated = await prisma.hospital.update({
      where: { id: hospital.id },
      data: {
        status: parsed.data.decision,
        verifiedAt: new Date(),
        verifiedBy: session.email,
        rejectionReason:
          parsed.data.decision === "REJECTED"
            ? (parsed.data.reason ?? "Documentation incomplete.")
            : null,
      },
    });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: `HOSPITAL_${parsed.data.decision}`,
      entityType: "Hospital",
      entityId: hospital.id,
      meta: { name: hospital.name, reason: parsed.data.reason ?? null },
      ip: await getClientIp(),
    });

    // Notify hospital admins of the facility.
    const admins = await prisma.user.findMany({
      where: { hospitalId: hospital.id },
    });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title:
            parsed.data.decision === "VERIFIED"
              ? "Hospital verified ✓"
              : "Verification rejected",
          body:
            parsed.data.decision === "VERIFIED"
              ? `${hospital.name} is now listed as a Verified Healthcare Provider.`
              : `${hospital.name} was rejected: ${updated.rejectionReason}`,
          type: parsed.data.decision === "VERIFIED" ? "SUCCESS" : "WARNING",
          link: "/hospital-portal",
        },
      });
    }

    return ok({ hospital: updated });
  },
  { limit: 20, windowMs: 60_000, keyPrefix: "verify" }
);
