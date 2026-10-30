import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getClientIp,
  hashPassword,
  setSessionCookie,
  writeAudit,
  AuthError,
} from "@/lib/auth";
import { fail, ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72)
    .regex(/[a-zA-Z]/, "Include at least one letter")
    .regex(/[0-9]/, "Include at least one number"),
  phone: z.string().trim().min(6).max(16).optional(),
});

export const POST = withApi(
  async (req) => {
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const { name, email, password, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return fail(409, "An account with this email already exists.");

    const user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password), phone },
    });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to जीवन Sahay",
        body: "Complete your health profile so hospitals can assist you faster during an emergency.",
        type: "INFO",
        link: "/profile",
      },
    });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: "PATIENT",
    });

    await writeAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: "AUTH_REGISTER",
      entityType: "User",
      entityId: user.id,
      ip: await getClientIp(),
    });

    return ok({
      user: { id: user.id, name: user.name, email: user.email, role: "PATIENT" },
    });
  },
  { limit: 5, windowMs: 60_000, keyPrefix: "register" }
);
