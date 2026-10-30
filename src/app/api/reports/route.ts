import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  category: z.enum(["DATA_ISSUE", "FACILITY", "STAFF", "BILLING", "OTHER"]),
  subject: z.string().trim().min(4).max(120),
  message: z.string().trim().min(10).max(2000),
  reporterName: z.string().trim().max(80).optional(),
  contactEmail: z.string().trim().email("Enter a valid email").optional(),
  relatedHospital: z.string().trim().max(120).optional(),
});

export const POST = withApi(
  async (req) => {
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const report = await prisma.report.create({ data: parsed.data });
    return ok({ reportId: report.id });
  },
  { limit: 5, windowMs: 60 * 10_000, keyPrefix: "report-submit" }
);
