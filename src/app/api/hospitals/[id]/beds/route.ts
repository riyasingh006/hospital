import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, requireRole, writeAudit } from "@/lib/auth";
import { fail, idFromUrl, ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  beds: z
    .array(
      z.object({
        category: z.enum([
          "GENERAL",
          "ICU",
          "EMERGENCY",
          "VENTILATOR",
          "PEDIATRIC",
          "MATERNITY",
          "ISOLATION",
        ]),
        total: z.coerce.number().int().min(0).max(2000),
        available: z.coerce.number().int().min(0).max(2000),
      })
    )
    .min(1)
    .max(10),
});

async function assertHospitalAccess(
  sessionHospitalId: string | undefined,
  role: string,
  hospitalId: string
) {
  if (role === "SUPER_ADMIN") return true;
  return role === "HOSPITAL_ADMIN" && sessionHospitalId === hospitalId;
}

export const PATCH = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");
    if (
      !(await assertHospitalAccess(session.hospitalId, session.role, hospitalId))
    )
      return fail(403, "You can only manage your own facility.");

    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;

    for (const bed of parsed.data.beds) {
      if (bed.available > bed.total)
        return fail(
          422,
          `${bed.category}: available beds cannot exceed total beds.`
        );
    }

    await prisma.$transaction(
      parsed.data.beds.map((bed) =>
        prisma.bedInventory.upsert({
          where: {
            hospitalId_category: { hospitalId, category: bed.category },
          },
          create: { ...bed, hospitalId },
          update: { total: bed.total, available: bed.available },
        })
      )
    );

    const updatedHospital = await prisma.hospital.update({
      where: { id: hospitalId },
      data: { lastAvailabilityUpdate: new Date() },
    });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "BED_AVAILABILITY_UPDATE",
      entityType: "Hospital",
      entityId: hospitalId,
      meta: parsed.data,
      ip: await getClientIp(),
    });

    // Notify saved-hospital users about the refresh (throttled per update).
    try {
      const watchers = await prisma.savedHospital.findMany({
        where: { hospitalId },
        select: { userId: true },
        take: 50,
      });
      for (const w of watchers) {
        await prisma.notification.create({
          data: {
            userId: w.userId,
            title: "Bed availability updated",
            body: "A hospital you follow has published fresh availability information.",
            type: "INFO",
            link: `/hospitals/${hospitalId}`,
          },
        });
      }
    } catch (e) {
      console.error("[beds] notification fan-out failed", e);
    }

    return ok({
      lastAvailabilityUpdate: updatedHospital.lastAvailabilityUpdate,
    });
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "beds" }
);
