import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, requireRole, writeAudit } from "@/lib/auth";
import { fail, idFromUrl, ok, parseBody, withApi } from "@/lib/api-helpers";

const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
  specialty: z.string().trim().min(2).max(40),
  department: z.string().trim().max(60).optional(),
  qualification: z.string().trim().max(120).optional(),
  experienceYears: z.coerce.number().int().min(0).max(70),
  availability: z.enum(["AVAILABLE", "LIMITED", "UNAVAILABLE"]).default("AVAILABLE"),
  timings: z.string().trim().max(80).optional(),
  languages: z.string().trim().max(120).optional(),
});

const patchSchema = z.object({
  id: z.string().min(1),
  availability: z
    .enum(["AVAILABLE", "LIMITED", "UNAVAILABLE"])
    .optional(),
  name: z.string().trim().min(2).max(100).optional(),
  specialty: z.string().trim().min(2).max(40).optional(),
  experienceYears: z.coerce.number().int().min(0).max(70).optional(),
  timings: z.string().trim().max(80).optional(),
});

async function assertHospitalAccess(
  session: { role: string; hospitalId?: string },
  hospitalId: string
) {
  return (
    session.role === "SUPER_ADMIN" ||
    (session.role === "HOSPITAL_ADMIN" && session.hospitalId === hospitalId)
  );
}

export const POST = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");
    if (!(await assertHospitalAccess(session, hospitalId)))
      return fail(403, "You can only manage your own facility.");

    const parsed = await parseBody(req, createSchema);
    if (parsed.error) return parsed.error;

    const doctor = await prisma.doctor.create({
      data: { ...parsed.data, hospitalId },
    });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "DOCTOR_CREATE",
      entityType: "Doctor",
      entityId: doctor.id,
      ip: await getClientIp(),
    });

    return ok({ doctor });
  },
  { limit: 40, windowMs: 60_000, keyPrefix: "doc-create" }
);

export const PATCH = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");
    if (!(await assertHospitalAccess(session, hospitalId)))
      return fail(403, "You can only manage your own facility.");

    const parsed = await parseBody(req, patchSchema);
    if (parsed.error) return parsed.error;
    const { id, ...changes } = parsed.data;

    const existing = await prisma.doctor.findFirst({
      where: { id, hospitalId },
    });
    if (!existing) return fail(404, "Doctor not found in your facility.");

    const doctor = await prisma.doctor.update({ where: { id }, data: changes });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "DOCTOR_UPDATE",
      entityType: "Doctor",
      entityId: id,
      meta: changes,
      ip: await getClientIp(),
    });

    return ok({ doctor });
  },
  { limit: 60, windowMs: 60_000, keyPrefix: "doc-update" }
);

export const DELETE = withApi(
  async (req) => {
    const session = await requireRole("HOSPITAL_ADMIN", "SUPER_ADMIN");
    const hospitalId = idFromUrl(req);
    if (!hospitalId) return fail(400, "Hospital id is required.");
    if (!(await assertHospitalAccess(session, hospitalId)))
      return fail(403, "You can only manage your own facility.");

    const url = new URL(req.url);
    const doctorId = url.searchParams.get("doctorId") ?? "";
    if (!doctorId) return fail(400, "doctorId query parameter is required.");

    const existing = await prisma.doctor.findFirst({
      where: { id: doctorId, hospitalId },
    });
    if (!existing) return fail(404, "Doctor not found in your facility.");

    await prisma.doctor.delete({ where: { id: doctorId } });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "DOCTOR_DELETE",
      entityType: "Doctor",
      entityId: doctorId,
      meta: { name: existing.name },
      ip: await getClientIp(),
    });

    return ok({ deleted: true });
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "doc-delete" }
);
