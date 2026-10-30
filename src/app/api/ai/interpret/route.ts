import { z } from "zod";
import { interpretQuery } from "@/lib/nlp";
import { ok, parseBody, withApi } from "@/lib/api-helpers";

const schema = z.object({
  query: z.string().trim().min(2).max(300),
});

export const POST = withApi(
  async (req) => {
    const parsed = await parseBody(req, schema);
    if (parsed.error) return parsed.error;
    const need = interpretQuery(parsed.data.query);
    return ok(need);
  },
  { limit: 30, windowMs: 60_000, keyPrefix: "interpret" }
);
