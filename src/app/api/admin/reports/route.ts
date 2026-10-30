import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { fail, ok, parseBody, withApi } from "@/lib/api-helpers";

export const GET = withApi(async () => {
  await requireRole("SUPER_ADMIN");
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return ok({ reports });
});

export const PATCH = withApi(
  async (req) => {
    await requireRole("SUPER_ADMIN");
    const schema = z.object({
      reportId: z.string().min(1),
      status: z.enum(["OPEN", "IN_REVIEW", "RESOLVED", "DISMISSED"]),
      resolutionNote: z.string().trim().max(400).optional(),
    });
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const { reportId, status, resolutionNote } = parsed.data;

    const existing = await prisma.report.findUnique({ where: { id: reportId } });
    if (!existing) return fail(404, "Report not found.");

    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        resolutionNote,
        resolvedAt:
          status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
      },
    });
    return ok({ report });
  },
  { limit: 40, windowMs: 60_000, keyPrefix: "admin-reports" }
);
