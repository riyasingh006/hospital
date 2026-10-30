import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIp, requireRole, writeAudit } from "@/lib/auth";
import { fail, ok, parseBody, withApi } from "@/lib/api-helpers";

export const GET = withApi(async () => {
  await requireRole("SUPER_ADMIN");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      hospitalId: true,
      hospital: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return ok({ users });
});

export const PATCH = withApi(
  async (req) => {
    const session = await requireRole("SUPER_ADMIN");
    const schema = z.object({
      userId: z.string().min(1),
      status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
      role: z.enum(["PATIENT", "HOSPITAL_ADMIN", "SUPER_ADMIN"]).optional(),
    });
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const { userId, ...changes } = parsed.data;

    if (userId === session.sub && changes.status === "SUSPENDED")
      return fail(422, "You cannot suspend your own account.");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return fail(404, "User not found.");

    const updated = await prisma.user.update({ where: { id: userId }, data: changes });

    await writeAudit({
      actorUserId: session.sub,
      actorEmail: session.email,
      action: "USER_UPDATE",
      entityType: "User",
      entityId: userId,
      meta: changes,
      ip: await getClientIp(),
    });

    return ok({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "admin-users" }
);
