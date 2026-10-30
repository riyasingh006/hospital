import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, requireRole, writeAudit } from "@/lib/auth";
import { fail, idFromUrl, ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  services: z
    .array(
      z.object({
        key: z.string().trim().min(2).max(40),
        status: z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE"]),
      })
    )
    .min(1)
    .max(15),
});

export const PATCH = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");

    if (
      !(
        session.role === "SUPER_ADMIN" ||
        (session.role === "HOSPITAL_ADMIN" && session.hospitalId === hospitalId)
      )
    )
      return fail(403, "You can only manage your own facility.");

    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;

    await prisma.$transaction(
      parsed.data.services.map((s) =>
        prisma.service.upsert({
          where: { hospitalId_key: { hospitalId, key: s.key } },
          create: { hospitalId, key: s.key, status: s.status },
          update: { status: s.status },
        })
      )
    );

    await prisma.hospital.update({
      where: { id: hospitalId },
      data: { lastAvailabilityUpdate: new Date() },
    });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "SERVICES_UPDATE",
      entityType: "Hospital",
      entityId: hospitalId,
      meta: parsed.data,
      ip: await getClientIp(),
    });

    return ok({ updated: true });
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "services" }
);
