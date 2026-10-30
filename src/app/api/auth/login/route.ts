import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  setSessionCookie,
  verifyPassword,
  writeAudit,
  type Role,
} from "@/lib/auth";
import { fail, ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const POST = withApi(
  async (req) => {
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      await writeAudit({
        actorEmail: email,
        action: "AUTH_LOGIN_FAILED",
        ip: await getClientIp(),
      });
      return fail(401, "Invalid email or password.");
    }

    if (user.status !== "ACTIVE") {
      return fail(403, "This account has been suspended. Contact support.");
    }

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      hospitalId: user.hospitalId ?? undefined,
    });

    await writeAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: user.id,
      ip: await getClientIp(),
    });

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hospitalId: user.hospitalId,
      },
    });
  },
  { limit: 10, windowMs: 60_000, keyPrefix: "login" }
);
